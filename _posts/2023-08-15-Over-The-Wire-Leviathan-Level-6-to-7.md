---
date: 2023-08-15 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Leviathan Level 6 → 7 tutorial!!"
permalink: /posts/Over-The-Wire-Leviathan-Level-6-to-7/
tags: [overthewire, leviathan, walkthrough, ctf, linux, beginner, suid, gdb, reversing, assembly]
description: "A step by step tutorial for OverTheWire Leviathan Level 6 → 7!!"
---

<!-- Scoped styles: only affect this post -->

<style>
  .leviathan-nav{display:flex;align-items:center;gap:.75rem;margin:.5rem 0 1.25rem;border-top:1px solid var(--border-color,#3a3a3a);padding-top:.75rem}
  .leviathan-nav .nav-left,.leviathan-nav .nav-center,.leviathan-nav .nav-right{flex:1}
  .leviathan-nav .nav-left{text-align:left}
  .leviathan-nav .nav-center{text-align:center}
  .leviathan-nav .nav-right{text-align:right}
  .leviathan-nav a{display:inline-block;padding:.45rem .8rem;border:1px solid var(--border-color,#3a3a3a);border-radius:.6rem;text-decoration:none;line-height:1}
  .leviathan-nav a:hover{transform:translateY(-1px)}
  .leviathan-nav .disabled{opacity:.55}
  :root[data-theme='light'] .leviathan-nav a{border-color:rgba(0,0,0,.15)}
</style>

<nav class="leviathan-nav" aria-label="Leviathan level navigation">
  <div class="nav-left">
    <a href="{{ '/posts/overTheWire-Leviathan-Level-5-to-6/' | relative_url }}">← Previous: Level 5 → 6</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/leviathan/leviathan7.html" target="_blank" rel="noopener">Official (Level 7) ↗</a>
  </div>

  <div class="nav-right">
    <span class="disabled">No more Leviathan level</span>
  </div>
</nav>

---

## Login

Log in as **leviathan6** using the password from Level 5 → 6.

```bash
ssh leviathan6@leviathan.labs.overthewire.org -p 2223
# password: szo7HDB88w
```

> Why? Each Leviathan level is a different UNIX user. To solve 6 → 7, you must be `leviathan6`.

---

## Task

There is a **SUID** binary in the home directory that expects a **4-digit code**. Find the correct code and read the password for **leviathan7**.

---

## A little bit of Theory

* **SUID**: the program runs with the owner’s privileges (here: `leviathan7`) once it accepts the correct code.
* **Disassembly**: looking at the program’s instructions lets you see *what* it compares your input against.
* **GDB basics** you’ll use:

  * `gdb --args ./prog arg1` — start with arguments
  * `disassemble main` — view assembly of `main`
  * `break *0xADDR` — set a breakpoint at an address
  * `run`, then `info registers` — run to BP, view registers
  * `x 0xADDR` / `x/wx 0xADDR` — examine memory at address
  * `print/d 0xHEX` — print a hex value in decimal

**Further reading:**

* <a href="https://sourceware.org/gdb/current/onlinedocs/gdb/" target="_blank" rel="noopener">GDB manual</a>
* <a href="https://en.wikipedia.org/wiki/Setuid" target="_blank" rel="noopener">setuid overview</a>
* <a href="https://en.wikipedia.org/wiki/X86_assembly_language" target="_blank" rel="noopener">x86 assembly (AT\&T syntax)</a>

---

## Solution

1. **List the directory**

   ```bash
   ls -la
   ```

   *Why?* Confirm there’s a SUID binary and who owns it.

   Example:

   ```
   -r-sr-x--- 1 leviathan7 leviathan6 7452 Aug 26  2019 leviathan6
   ```

   ![inspect]({{ '/assets/images/leviathan/level-6-to-7/inspect.jpg' | relative_url }})

2. **Try the binary with a dummy code**

   ```bash
   ./leviathan6
   # usage: ./leviathan6 <4 digit code>

   ./leviathan6 0000
   # Wrong
   ```

   *Why?* Establish baseline behavior and argument format.

   ![run]({{ '/assets/images/leviathan/level-6-to-7/run.jpg' | relative_url }})

3. **Launch GDB with arguments**

   ```bash
   gdb --args ./leviathan6 0000
   ```

   *Why?* We’ll run under the debugger so we can pause at the comparison.

   ![gdb-start]({{ '/assets/images/leviathan/level-6-to-7/gdb-start.jpg' | relative_url }})

4. **Disassemble `main` to find the compare**

   In GDB:

   ```
   (gdb) disassemble main
   ```

   Look for the sequence that parses your arg (often `atoi@plt`) and then a **`cmp`** against a constant on the stack (e.g., `cmp %eax,-0xc(%ebp)`), followed by a conditional jump.

   *Why?* The constant it compares to is the **correct code**.

   ![disassemble]({{ '/assets/images/leviathan/level-6-to-7/disassemble1.jpg' | relative_url }})
   ![disassemble2]({{ '/assets/images/leviathan/level-6-to-7/disassemble2.jpg' | relative_url }})

5. **Break at the `cmp` and run**

   ```
   (gdb) break *0x0804922a       # address of the cmp (from your disassembly)
   (gdb) run
   ```

   *Why?* Stop exactly before the decision is made.

   ![breakpoint]({{ '/assets/images/leviathan/level-6-to-7/breakpoint.jpg' | relative_url }})

6. **Inspect registers and the compared value**

   ```
   (gdb) info registers
   # note EAX (your input after atoi)

   (gdb) print $ebp-0xc
   $1 = (void *) 0xffffd4cc

   (gdb) x/wx 0xffffd4cc
   0xffffd4cc:  0x00001bd3

   (gdb) print/d 0x00001bd3
   $2 = 7123
   ```

   *Why?* The constant stored at `-0xc(%ebp)` is `0x1bd3` = **7123** in decimal — that’s the unlock code.

   ![inspect-values]({{ '/assets/images/leviathan/level-6-to-7/inspect-values.jpg' | relative_url }})

7. **Use the code to get a SUID subshell**

   ```bash
   ./leviathan6 7123
   $ whoami
   leviathan7
   ```

   *Why?* Success — you’re now running with `leviathan7`’s privileges.

   ![success]({{ '/assets/images/leviathan/level-6-to-7/success.jpg' | relative_url }})

8. **Read the next password**

   ```bash
   cat /etc/leviathan_pass/leviathan7
   ```

   Output:

   ```
   qEs5Io5yM8
   ```

   ![decrypt]({{ '/assets/images/leviathan/level-6-to-7/decrypt.jpg' | relative_url }})

---

## Password

```
qEs5Io5yM8
```

---

## Troubleshooting

* **Your addresses differ** — That’s normal; use the addresses from *your* `disassemble main` output when setting the breakpoint.
* **`disassemble main` is paged** — Press `c` (continue without paging) or `q` then re-run `disassemble main`.
* **ASLR confusion** — The binary is SUID; you’re inspecting code addresses within the process. Always break at the exact address shown in your current session.
* **`gdb` not found?** — It should be present on OTW boxes. If not, try `gdb -q` or `gdbserver` alternatives, but typically `gdb` works.

---

## Copy-paste quick run

```bash
ssh leviathan6@leviathan.labs.overthewire.org -p 2223
# password: UgaoFee4li

cd ~
./leviathan6 0000      # → Wrong

gdb --args ./leviathan6 0000
(gdb) disassemble main
# find the cmp %eax,-0xc(%ebp) (addresses vary)
(gdb) break *0x0804922a
(gdb) run
(gdb) info registers
(gdb) print $ebp-0xc
(gdb) x/wx 0xADDRESS   # value like 0x00001bd3
(gdb) print/d 0x00001bd3
# → 7123
(gdb) quit

./leviathan6 7123
whoami                         # → leviathan7
cat /etc/leviathan_pass/leviathan7
# → qEs5Io5yM8
```

---

**Congrats 🎉** You reversed a SUID binary with **GDB**, extracted the hidden compare value, and finished **Leviathan**. GG!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})
