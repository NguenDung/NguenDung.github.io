---
layout: post-with-comments
title: "OverTheWire Bandit Level 9 → 10 tutorial!!"
permalink: /posts/overTheWire-Bandit-Level-9-to-10/
tags: [overthewire, bandit, walkthrough, ctf, linux, beginner]
description: "A step by step tutorial for OverTheWire Bandit Level 9 → 10!!"
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
    <a href="{{ '/posts/overTheWire-Bandit-Level-8-to-9/' | relative_url }}">← Previous: Level 8 → 9</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/bandit/bandit10.html" target="_blank" rel="noopener">
      Official (Level 10) ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Bandit-Level-10-to-11/' | relative_url }}">Next: Level 10 → 11 →</a>
  </div>
</nav>

## Login

Log in as **bandit9** using the password you just obtained from Level 8 → 9.

```bash
ssh bandit9@bandit.labs.overthewire.org -p 2220
# password: 4CKMh1JI91bUIZZPXDqGanal4xvAg0JM
````

> Why? Each Bandit level is a separate UNIX user. To solve 9 → 10, you must be the `bandit9` user.

## Task

![Task]({{ '/assets/images/bandit/level-9-to-10/task.jpg' | relative_url }})

The password for the next level is stored in **`data.txt`** and appears as a **human-readable string preceded by several `=` characters**.

## A little bit of Theory

* **`strings`** extracts printable (ASCII) sequences from a (possibly) binary file.

  * Minimum length: `-n 4` (often default).
  * Show offsets (optional): `-t x` (hex) or `-t d` (decimal).
* **`grep`** filters lines by pattern.

  * Regex for three-or-more equals signs: `-E '={3,}'`
* Pipe `strings` → `grep` to cut noise fast.

**Further reading:**

* <a href="https://man7.org/linux/man-pages/man1/strings.1.html" target="_blank" rel="noopener">`strings` manual</a>
* <a href="https://man7.org/linux/man-pages/man1/grep.1.html" target="_blank" rel="noopener">`grep` manual</a>
* <a href="https://ryanstutorials.net/linuxtutorial/piping.php" target="_blank" rel="noopener">Piping and Redirection</a>

## Solution

1. **Confirm the file is present**

   ```bash
   ls -l
   ```

   *Why?* Sanity check that `data.txt` exists and you’re in the right place.

![ls data.txt]({{ '/assets/images/bandit/level-9-to-10/file.jpg' | relative_url }})

2. **Extract printable strings and look for `===`**

   ```bash
   strings data.txt | grep -E '={3,}'
   # or, slightly stricter to capture the token after the equals:
   strings data.txt | grep -E '={3,}[A-Za-z0-9+/=]{8,}'
   ```

   *Why?* `strings` surfaces human-readable chunks; `grep` narrows to the few lines preceded by equals signs.

![strings + grep]({{ '/assets/images/bandit/level-9-to-10/succes.jpg' | relative_url }})

3. **(Optional) Show offsets**

   ```bash
   strings -t x data.txt | grep -E '={3,}'
   ```

   *Why?* Offsets help you verify where the readable text sits inside the file (not required to solve).

4. **Copy the password** (no extra spaces/newlines).

5. **Log into the next level (bandit10)**

   ```bash
   exit
   ssh bandit10@bandit.labs.overthewire.org -p 2220
   # paste the password you just found when prompted
   ```

## Password

> This is the password shown in my run; if yours differs, copy the one from your own terminal output.

```
FGUW5ilLVJrxX9kMYMmlN4MgbpfMiqey
```

**Troubleshooting**

* Too much output from `strings`? → Add the filter: `grep -E '={3,}'`.
* Still nothing? → Try the looser `grep '==='` (regex flavors differ slightly).
* Odd characters? → Force C locale: `LC_ALL=C strings data.txt | grep '==='`.

---

**Congrats 🎉** You carved the hidden text out of a binary and can now play as **bandit10**.

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

