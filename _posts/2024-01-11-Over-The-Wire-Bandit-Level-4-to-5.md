---
layout: post-with-comments
title: "OverTheWire Bandit Level 4 → 5 tutorial!!"
permalink: /posts/overTheWire-Bandit-Level-4-to-5/
tags: [overthewire, bandit, walkthrough, ctf, linux, beginner]
description: "A step by step tutorial for OverTheWire Bandit Level 4 → 5!!"
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
    <a href="{{ '/posts/overTheWire-Bandit-Level-3-to-4/' | relative_url }}">← Previous: Level 3 → 4</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/bandit/bandit5.html" target="_blank" rel="noopener">
      Official (Level 5) ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Bandit-Level-5-to-6/' | relative_url }}">Next: Level 5 → 6 →</a>
  </div>
</nav>

## Login

Log in as **bandit4** using the password you just obtained from Level 3 → 4.

```bash
ssh bandit4@bandit.labs.overthewire.org -p 2220
# password: 2WmrDFRmJIq3IPxneAaMGhap0pFhF3NJ
````

> Why? Each Bandit level is a different UNIX user; to solve 4 → 5 you must be `bandit4`.

## Task

![Task]({{ '/assets/images/bandit/level-4-to-5/task.jpg' | relative_url }})

The password for the next level is stored in the **only human-readable file** inside the directory **`inhere`** in `bandit4`’s home.

## A little bit of Theory

* The directory currently contains files named **`-file00` … `-file09`** (note the **leading `-`**).
* Many commands treat a leading `-` as an **option**. Safest is to **prefix with `./`** or use `--`:

  ```bash
  file ./*          # OK: expands to ./-file00, ./-file01, ...
  cat ./-file07     # OK
  cat -- -file07    # also OK
  ```
* Use **`file`** to identify which entry is **ASCII text** (human-readable). To avoid false positives,
  filter **exactly** `: ASCII text` (not “Non-ISO extended-ASCII”):

  ```bash
  file ./* | grep ': ASCII text'
  ```
* Then **`cat`** that filename to print the password.

**Further reading (open in new tab):**

* <a href="https://man7.org/linux/man-pages/man1/file.1.html" target="_blank" rel="noopener">`file` command manual</a>
* <a href="https://man7.org/linux/man-pages/man1/grep.1.html" target="_blank" rel="noopener">`grep` manual</a>

## Solution (step-by-step, with reasons)

1. **Move into the directory with the files**

   ```bash
   cd inhere
   ```

   *Why?* The challenge says all candidate files are here.

2. **Identify the only human-readable file**

   ```bash
   file ./* | grep ': ASCII text'
   ```

   *Why?* `file` classifies each entry; the grep narrows to the single ASCII text file.

![file + grep output]({{ '/assets/images/bandit/level-4-to-5/acii.jpg' | relative_url }})

3. **Print the password**
   Suppose the previous command showed `./-file07: ASCII text`. Read it with:

   ```bash
   cat ./-file07
   # or: cat -- -file07
   ```

   *Why?* Prefixing with `./` (or using `--`) prevents the leading dash from being parsed as an option.

![cat target file]({{ '/assets/images/bandit/level-4-to-5/succes.jpg' | relative_url }}) 

4. **Copy the password** (no extra spaces/newlines).

5. **Log into the next level (bandit5)**

   ```bash
   exit
   ssh bandit5@bandit.labs.overthewire.org -p 2220
   # paste the password you just found when prompted
   ```

## Password

> This is the password shown in my run; if yours differs, copy the one from your own terminal output.

```
4oQYVPkxZOOEOO5pTW81FB8j8lxXGUQw
```

**Troubleshooting**

* `cat: invalid option` → Use `cat ./-filename` or `cat -- -filename`.
* `No such file or directory` → Ensure you `cd inhere` and copy the filename **exactly**.
* Terminal looks weird after `cat` → You probably viewed a binary; run `reset`, then use `file ./* | grep ': ASCII text'`.

---

**Congrats 🎉** You found the only human-readable file and can now play as **bandit5**.

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

