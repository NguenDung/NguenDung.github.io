---
layout: post-with-comments
title: "OverTheWire Bandit Level 26 → 27 tutorial!!"
permalink: /posts/overTheWire-Bandit-Level-26-to-27/
tags: [overthewire, bandit, walkthrough, ctf, linux, beginner]
description: "A step by step tutorial for OverTheWire Bandit Level 26 → 27!!"
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
    <a href="{{ '/posts/overTheWire-Bandit-Level-25-to-26/' | relative_url }}">← Previous: Level 25 → 26</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/bandit/bandit27.html" target="_blank" rel="noopener">Official (Level 27) ↗</a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Bandit-Level-27-to-28/' | relative_url }}">Next: Level 27 → 28 →</a>
  </div>
</nav>

## Login

Log in as **bandit26** (use the key from Level 25 → 26, or the password if you have it).

```bash
ssh -i bandit26.sshkey -p 2220 bandit26@localhost
# or
ssh bandit26@bandit.labs.overthewire.org -p 2220
# password: 5czgV9L3Xx8JPOyRbXh6lQbmIOWvPT6Z
````

> Why? Each Bandit level is a separate UNIX user. To solve 26 → 27, you must be the `bandit26` user first.

## Task

![Task placeholder]({{ '/assets/images/bandit/level-26-to-27/task.jpg' | relative_url }})

“Good job getting a shell! Now hurry and grab the password for **bandit27**.”
You’ll find a helper binary in bandit26’s home that can **run commands as bandit27**.

## A little bit of Theory

* In Level 25 → 26, we escaped the restricted shell (`/usr/bin/showtext`) via **`more → v → vim → :set shell=/bin/bash → :shell`** to get a real shell.
* In this level, the file **`bandit27-do`** in bandit26’s home is a **setuid-style helper** that runs **any command as `bandit27`**.
* So we can simply use it to read `/etc/bandit_pass/bandit27`.

**Further reading:**

* <a href="https://man7.org/linux/man-pages/man1/more.1.html" target="_blank" rel="noopener">`more(1)` manual</a>
* <a href="https://vimhelp.org/" target="_blank" rel="noopener">Vim help</a>

## Solution

1. **Ensure you really have an interactive shell as bandit26**

   If you get kicked out right away (because of `showtext`), **shrink your terminal** so `more` shows `--More--`, press **`v`** to open Vim, then:

   ```
   :set shell=/bin/bash
   :shell
   ```

   *Why?* This is the same escape from Level 25 → 26 to obtain a usable shell.

   !\[escape placeholder]\({{ '/assets/images/bandit/level-26-to-27/escape.jpg' | relative\_url }})

2. **List the home directory and discover the helper**

   ```bash
   ls -la
   ```

   You should see **`bandit27-do`** and `text.txt`.

   *Why?* The filename hints it runs commands **as bandit27**.

   !\[ls placeholder]\({{ '/assets/images/bandit/level-26-to-27/ls.jpg' | relative\_url }})

3. **Check what the helper does**

   ```bash
   ./bandit27-do
   # or: strings ./bandit27-do
   ```

   You’ll see usage like:

   ```
   Run a command as another user.
     Example: ./bandit27-do id
   ```

   *Why?* Confirms it runs arbitrary commands with bandit27’s privileges.

   !\[helper usage placeholder]\({{ '/assets/images/bandit/level-26-to-27/helper.jpg' | relative\_url }})

4. **Verify effective user**

   ```bash
   ./bandit27-do id
   ```

   *Why?* Sanity-check that commands run as **bandit27**.

   !\[id placeholder]\({{ '/assets/images/bandit/level-26-to-27/id.jpg' | relative\_url }})

5. **Read the password for bandit27 using the helper**

   ```bash
   ./bandit27-do cat /etc/bandit_pass/bandit27
   ```

   *Why?* This prints the next level’s password with bandit27’s permissions.

   !\[password read placeholder]\({{ '/assets/images/bandit/level-26-to-27/read.jpg' | relative\_url }})

## Password

> Paste here the exact line printed by the helper (from **your** run).

```
<contents of /etc/bandit_pass/bandit27>
```

**Troubleshooting**

* **Still stuck in `showtext`?** → Make the terminal short, press **`v`** to open Vim, then `:set shell=/bin/bash` and `:shell`.
* **`Permission denied` executing `./bandit27-do`** → Ensure you’re in **`/home/bandit26`** and the file is executable. If needed, run it with the absolute path:
  `/home/bandit26/bandit27-do cat /etc/bandit_pass/bandit27`
* **Got the wrong password?** → Double-check you ran the helper on `/etc/bandit_pass/bandit27` (not `bandit26`).

---

**Congrats 🎉** You leveraged the `bandit27-do` helper to execute as **bandit27** and retrieve the next credentials!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

