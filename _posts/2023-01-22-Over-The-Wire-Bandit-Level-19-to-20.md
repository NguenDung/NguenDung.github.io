---
date: 2023-01-22 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Bandit Level 19 → 20 tutorial!!"
permalink: /posts/overTheWire-Bandit-Level-19-to-20/
tags: [overthewire, bandit, walkthrough, ctf, linux, beginner]
description: "A step by step tutorial for OverTheWire Bandit Level 19 → 20!!"
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
    <a href="{{ '/posts/overTheWire-Bandit-Level-18-to-19/' | relative_url }}">← Previous: Level 18 → 19</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/bandit/bandit20.html" target="_blank" rel="noopener">Official (Level 20) ↗</a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Bandit-Level-20-to-21/' | relative_url }}">Next: Level 20 → 21 →</a>
  </div>
</nav>

## Login

Log in as **bandit19** using the password you obtained from Level 18 → 19.

```bash
ssh bandit19@bandit.labs.overthewire.org -p 2220
# password: cGWpMaKXVwDUNgPAVJbWYuGHVn9zl3j8
````

> Why? Each Bandit level is a separate UNIX user. To solve 19 → 20, you must be the `bandit19` user.

## Task

![Task placeholder]({{ '/assets/images/bandit/level-19-to-20/task.jpg' | relative_url }})

There is a **setuid helper binary** in your home directory: **`bandit20-do`**.
It runs a command **as user `bandit20`**.
The password for the next level is stored in **`/etc/bandit_pass/bandit20`**. Use the helper to read it.

## A little bit of Theory

* **setuid**: if an executable has the **s** bit on user perms (e.g., `-rwsr-x---`), it runs **with the file owner’s EUID**.
  Here, `bandit20-do` is owned by `bandit20`, so commands it executes run as `bandit20`.
* The helper likely takes a command line such as:

  ```bash
  ./bandit20-do <command> [args...]
  ```

  so we can have it run `/bin/cat /etc/bandit_pass/bandit20`.

**Further reading:**

* <a href="https://en.wikipedia.org/wiki/Setuid" target="_blank" rel="noopener">setuid (Wikipedia)</a>
* <a href="https://man7.org/linux/man-pages/man1/ls.1.html" target="_blank" rel="noopener">`ls` manual</a> · <a href="https://man7.org/linux/man-pages/man1/id.1.html" target="_blank" rel="noopener">`id` manual</a>

## Solution

1. **Inspect the helper binary**

   ```bash
   ls -l
   ```

   *Why?* You should see `bandit20-do` with the **s** bit set (`rws`).

   ![ls placeholder]({{ '/assets/images/bandit/level-19-to-20/ls.jpg' | relative_url }})

2. **Read the built-in usage (optional)**

   ```bash
   ./bandit20-do
   # or try a harmless command:
   ./bandit20-do id
   ```

   *Why?* Confirms it runs as `bandit20` (look for `uid=11020(bandit20)` in output).

   ![usage/id placeholder]({{ '/assets/images/bandit/level-19-to-20/id.jpg' | relative_url }})

3. **Use the helper to print the password file**

   ```bash
   ./bandit20-do /bin/cat /etc/bandit_pass/bandit20
   ```

   *Why?* We ask it to execute `cat` **as bandit20**, so it can read that file.

   ![cat placeholder]({{ '/assets/images/bandit/level-19-to-20/cat.jpg' | relative_url }})

4. **Copy the password** (no trailing spaces/newlines).

5. **Log into the next level (bandit20)**

   ```bash
   exit
   ssh bandit20@bandit.labs.overthewire.org -p 2220
   # paste the password you just printed
   ```

## Password

> This is the password from my run; if yours differs, use the one your terminal printed.

```
0qXahG8ZjOVMN9Ghs7iOWsCfZyXOUbYO
```

**Troubleshooting**

* **“Permission denied” when reading the file** → You forgot to use the helper or used plain `cat`. Must be:

  ```bash
  ./bandit20-do /bin/cat /etc/bandit_pass/bandit20
  ```
* **“No such file or directory”** → Double-check the exact path `/etc/bandit_pass/bandit20` and that you ran `./bandit20-do` from `~`.
* **Helper says “Run a command as another user” and exits** → You didn’t pass a command; try `./bandit20-do id` first.
* **Command not found** → Use **absolute path** `/bin/cat` to avoid PATH issues.

---

**Congrats 🎉** You used a setuid helper to execute a command as another user — welcome to **bandit20**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})


