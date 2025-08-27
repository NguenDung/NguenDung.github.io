---
date: 2023-09-20 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Maze Level 2 → 3 tutorial!!"
permalink: /posts/overTheWire-Maze-Level-2-to-3/
tags: [overthewire, maze, pwn, binary-exploitation, linux, beginner]
description: "A step by step tutorial for OverTheWire Maze Level 2 → 3!!"
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
    <a href="{{ '/posts/overTheWire-Maze-Level-1-to-2/' | relative_url }}">← Previous: Level 1 → 2</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/maze/maze3.html" target="_blank" rel="noopener">
      Official Level 3 ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Maze-Level-3-to-4/' | relative_url }}">Next: Level 3 → 4 →</a>
  </div>
</nav>

## Login

Use the **maze2** account from the previous level.

```bash
ssh maze2@maze.labs.overthewire.org -p <PORT>
# password: beinguthok
````

> Binary for this challenge: `/maze/maze3`

---

## Task

Reverse and exploit `maze3` to escalate from **maze2** to **maze3** (read `/etc/maze_pass/maze3`).

---

## A little bit of Theory

This binary is a cute sample of **self-modifying code**:

* There are three routines: `fine`, `l1`, and `d1`.
* `fine` sets up registers, points **ESI/EDI** at the bytes of `d1`, sets **ECX = 0x2C (44)**, and loads **EDX = 0x12345678** (our XOR key).
* `l1` is a tiny loop: `lods` (load a dword from `[esi]`), `xor eax, edx`, `stos` (store into `[edi]`), `loop`.
  → This **XOR-decodes 44 bytes** of `d1` in place.
* After decoding, `d1` becomes a *different* function that:

  1. pops `eax` (pointer to `argv[1]`),
  2. checks `*(uint32_t*)argv[1] == 0x1337c0de`,
  3. if true, executes **`/bin//sh`**; else `exit(0)`.

So the whole “puzzle” is supplying **little-endian** bytes that equal `0x1337c0de`.

---

## Walkthrough (with GDB peeks)

Below are the actual disassemblies observed:

**fine**

```
0x08048096 <+0>:  pop    eax
0x08048097 <+1>:  mov    eax,0x7d
0x0804809c <+6>:  mov    ebx,0x8048060
0x080480a1 <+11>: and    ebx,0xfffff000
0x080480a7 <+17>: mov    ecx,0x97
0x080480ac <+22>: mov    edx,0x7
0x080480b1 <+27>: int    0x80
0x080480b3 <+29>: lea    esi,[0x80480cb]
0x080480b9 <+35>: mov    edi,esi
0x080480bb <+37>: mov    ecx,0x2c
0x080480c0 <+42>: mov    edx,0x12345678
```

**l1**

```
0x080480c5 <+0>:  lods   eax,DWORD PTR ds:[esi]
0x080480c6 <+1>:  xor    eax,edx
0x080480c8 <+3>:  stos   DWORD PTR es:[edi],eax
0x080480c9 <+4>:  loop   0x80480c5 <l1>
```

**d1 (after decode)**

```
0x080480cb <+0>:  pop    eax
0x080480cc <+1>:  cmp    DWORD PTR [eax],0x1337c0de
0x080480d2 <+7>:  jne    0x80480ed <d1+34>
0x080480d4 <+9>:  xor    eax,eax
0x080480d6 <+11>: push   eax
0x080480d7 <+12>: push   0x68732f2f
0x080480dc <+17>: push   0x6e69622f
0x080480e1 <+22>: mov    ebx,esp
0x080480e3 <+24>: push   eax
0x080480e4 <+25>: push   ebx
0x080480e5 <+26>: mov    ecx,esp
0x080480e7 <+28>: xor    edx,edx
0x080480e9 <+30>: mov    al,0xb
0x080480eb <+32>: int    0x80
0x080480ed <+34>: mov    eax,0x1
0x080480f2 <+39>: xor    ebx,ebx
0x080480f4 <+41>: inc    ebx
0x080480f5 <+42>: int    0x80
```

Key observation: The comparison is against `0x1337c0de`. On **little-endian** x86, you must pass bytes **`\xde\xc0\x37\x13`**.

---

## Solution

1. **Run the binary with the magic 4-byte token** (little-endian):

   ```bash
   /maze/maze3 $(python -c 'print("\xde\xc0\x37\x13")')
   ```

   This satisfies the `cmp [argv[1]], 0x1337c0de` check in decoded `d1`.

2. **Enjoy the shell**, then dump the next password:

   ```bash
   id
   cat /etc/maze_pass/maze3
   ```

   In the playthrough used for this write-up, the password printed was:

   ```
   deekaihiek
   ```

---

## Why this works (tl;dr)

* `fine` + `l1` **XOR-decode** 44 bytes of `d1` using key `0x12345678`.
* Decoded `d1` checks `argv[1]` for **0x1337c0de** and, on success, **execve("/bin//sh")**.
* Feeding **`\xde\xc0\x37\x13`** (little-endian 0x1337c0de) flips the branch and spawns a shell.

---

## Troubleshooting quick tips

* If it exits immediately, confirm your argument is **exactly 4 bytes** and **little-endian**:

  ```bash
  python - <<'PY'
  import sys
  sys.stdout.write("\xde\xc0\x37\x13")
  PY
  ```
* If ASLR trips you up while debugging, run under `gdb` with `set disable-aslr on` just to inspect the decode flow. (Not required to solve.)
* Make sure your terminal doesn’t mangle nulls; we’re passing raw bytes, not a string.

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨
