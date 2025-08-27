---
date: 2023-01-20 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Bandit Level 17 → 18 tutorial!!"
permalink: /posts/overTheWire-Bandit-Level-17-to-18/
tags: [overthewire, bandit, walkthrough, ctf, linux, beginner]
description: "A step by step tutorial for OverTheWire Bandit Level 17 → 18!!"
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

<nav class="bandit-nav" aria-label="Bandit level navigation">
  <div class="nav-left">
    <a href="{{ '/posts/overTheWire-Bandit-Level-16-to-17/' | relative_url }}">← Previous: Level 16 → 17</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/bandit/bandit18.html" target="_blank" rel="noopener">Official (Level 18) ↗</a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Bandit-Level-18-to-19/' | relative_url }}">Next: Level 18 → 19 →</a>
  </div>
</nav>

## Login

Log in as **bandit17** using the private key you obtained from Level 16 → 17.

```bash
ssh -i ./bandit17.key bandit17@bandit.labs.overthewire.org -p 2220
# auth: use the RSA private key from the previous level
````

> Why? Each Bandit level is a separate UNIX user. To solve 17 → 18, you must be the `bandit17` user.

## Task

![Task placeholder]({{ '/assets/images/bandit/level-17-to-18/task.jpg' | relative_url }})

There are **two files** in your home directory: **`passwords.old`** and **`passwords.new`**.
The password for the next level is the **only line that exists in `passwords.new` but not in `passwords.old`**.

## A little bit of Theory

* `diff` shows line-by-line differences between two files. With unified format (`-u`), new lines are prefixed with `+`.
* `grep -Fxv -f A B` prints lines in **B** that **do not appear** in **A**:

  * `-F` fixed strings, `-x` whole line match, `-v` invert match, `-f A` read patterns from file A.
* `comm` compares **sorted** files: `comm -13 <(sort A) <(sort B)` = lines **unique to B**.

**Further reading:**

* <a href="https://man7.org/linux/man-pages/man1/diff.1.html" target="_blank" rel="noopener">`diff` manual</a>
* <a href="https://man7.org/linux/man-pages/man1/grep.1.html" target="_blank" rel="noopener">`grep` manual</a>
* <a href="https://man7.org/linux/man-pages/man1/comm.1.html" target="_blank" rel="noopener">`comm` manual</a>

## Solution

1. **List files to confirm they exist**

   ```bash
   ls -l
   ```

   *Why?* Sanity check: both `passwords.old` and `passwords.new` should be here.

   ![List files placeholder]({{ '/assets/images/bandit/level-17-to-18/ls.jpg' | relative_url }})

2. **(Option A) Use `grep` to print the new unique line**

   ```bash
   grep -Fxv -f passwords.old passwords.new
   ```

   *Why?* Prints exactly the line that appears **only** in `passwords.new` — that line **is the password**.

   ![grep placeholder]({{ '/assets/images/bandit/level-17-to-18/a.jpg' | relative_url }})

3. **(Option B) Use `diff -u` and filter the `+` line**

   ```bash
   diff -u passwords.old passwords.new | grep '^+' | grep -v '+++ ' | cut -c2-
   ```

   *Why?* Unified diff shows additions with `+`. We drop the header (`+++`) and the leading `+`.

   ![diff placeholder]({{ '/assets/images/bandit/level-17-to-18/b.jpg' | relative_url }})

4. **(Option C) Use `comm` (requires sorted input)**

   ```bash
   comm -13 <(sort passwords.old) <(sort passwords.new)
   ```

   *Why?* Column 3 (`-13`) = lines unique to the second file.

   ![comm placeholder]({{ '/assets/images/bandit/level-17-to-18/c.jpg' | relative_url }})

5. **Copy the password** (no trailing spaces/newlines).

6. **Log into the next level (bandit18)**

   ```bash
   exit   # go back to your local shell
   ssh bandit18@bandit.labs.overthewire.org -p 2220
   # paste the password you just found when prompted
   ```

## Password

> This is the password from my run; if yours differs, use the one your terminal printed.

```
x2gLTTjFwMOhQ8oWNbMN362QKxfRqGlO
```

**Troubleshooting**

* **Nothing prints?** → Make sure you didn’t swap file order. It must be **`-f passwords.old passwords.new`**.
* **Multiple lines printed?** → Your files might contain duplicates or trailing spaces. Normalize first:

  ```bash
  sed -e 's/[[:space:]]\+$//' passwords.old > old.norm
  sed -e 's/[[:space:]]\+$//' passwords.new > new.norm
  grep -Fxv -f old.norm new.norm
  ```
* **`comm` returns unexpected output** → Remember both inputs must be **sorted**.
* **Clipboard issues** → Use the mouse to select and copy only the password line; avoid extra spaces.
* **Note from Bandit site**: If you already solved this level and see `Byebye!` when trying to log into bandit18 later, that’s tied to the next level’s twist (bandit19). Keep going.

---

## Copy-paste quick run (one shot)

```bash
# Print the password (the line present in passwords.new but not in passwords.old)
grep -Fxv -f passwords.old passwords.new

# Then, from your local shell:
# ssh bandit18@bandit.labs.overthewire.org -p 2220
# (paste the line as the password when prompted)
```

---

**Congrats 🎉** You diffed the files and extracted the next password — welcome to **bandit18**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})


