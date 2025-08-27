---
date: 2023-01-11 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Bandit Level 3 → 4 tutorial!!"
permalink: /posts/overTheWire-Bandit-Level-3-to-4/
tags: [overthewire, bandit, walkthrough, ctf, linux, beginner]
description: "A step by step tutorial for OverTheWire Bandit Level 3 → 4!!"
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
    <a href="{{ '/posts/overTheWire-Bandit-Level-2-to-3/' | relative_url }}">← Previous: Level 2 → 3</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/bandit/bandit4.html" target="_blank" rel="noopener">
      Official (Level 4) ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Bandit-Level-4-to-5/' | relative_url }}">Next: Level 4 → 5 →</a>
  </div>
</nav>

## Login

Log in as **bandit3** using the password you just obtained from Level 2 → 3.

```bash
ssh bandit3@bandit.labs.overthewire.org -p 2220
# password: MNk8KNH3Usiio41PRUEoDFPqfxLPlSmx
````

> Why? Each Bandit level is a separate UNIX user. To solve 3 → 4, you must be the `bandit3` user.

## Task

![Task]({{ '/assets/images/bandit/level-3-to-4/task.jpg' | relative_url }})

The password for the next level is stored in a **hidden file** named **`...Hiding-From-You`** inside the directory **`inhere`** in `bandit3`’s home.

## A little bit of Theory

* Files are **hidden** if their name **starts with a dot `.`**. `...Hiding-From-You` starts with a dot (actually three dots), so it’s hidden too.
* Use `ls -a` / `ls -la` to list **all** files, including hidden ones.
* The filename has **no spaces**; the hyphens are regular characters. You can still **quote** it to avoid typos:

  ```bash
  cat "...Hiding-From-You"
  ```

  or prefix with a path:

  ```bash
  cat ./...Hiding-From-You
  ```
* Relative vs absolute paths: `./...Hiding-From-You` (current dir) vs `/home/bandit3/inhere/...Hiding-From-You`.

**Further reading:**

* <a href="https://www.google.com/search?q=linux+hidden+files" target="_blank" rel="noopener">Search: linux hidden files</a>
* <a href="https://man7.org/linux/man-pages/man1/ls.1.html" target="_blank" rel="noopener">`ls` manual (man7.org)</a>

## Solution

1. **Go to the `inhere` directory**

   ```bash
   cd inhere
   ```

   *Why?* The challenge states the hidden file is inside `inhere`.

2. **List everything (including hidden files)**

   ```bash
   ls -la
   ```

   *Why?* Hidden files appear only with `-a/-la`. You should see `...Hiding-From-You`.

3. **Read the hidden file**

   ```bash
   cat "...Hiding-From-You"
   # or
   cat ./...Hiding-From-You
   ```

   *Why?* Prints the password to the screen; quoting/path prefix prevents mistakes.

![cat]({{ '/assets/images/bandit/level-3-to-4/succes.jpg' | relative_url }})

4. **Copy the password** (no extra spaces/newlines).

5. **Log into the next level (bandit4)**

   ```bash
   exit
   ssh bandit4@bandit.labs.overthewire.org -p 2220
   # paste the password you just found when prompted
   ```

## Password

> This is the password shown in my run; if yours differs, copy the one from your own terminal output.

```
2WmrDFRmJIq3IPxneAaMGhap0pFhF3NJ
```

**Troubleshooting**

* `No such file or directory` → Ensure you’re in `inhere` and the filename is exactly `...Hiding-From-You` (three leading dots).
* Nothing appears with `ls` → Use `ls -a`/`ls -la`.
* `Permission denied` → Confirm you’re logged in as `bandit3`.

---

**Congrats 🎉** You found the hidden file and can now play as **bandit4**.

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})
