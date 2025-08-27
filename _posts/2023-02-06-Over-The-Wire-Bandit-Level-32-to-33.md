---
date: 2023-02-06 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Bandit Level 32 → 33 tutorial!!"
permalink: /posts/overTheWire-Bandit-Level-32-to-33/
tags: [overthewire, bandit, walkthrough, ctf, linux, beginner]
description: "A step by step tutorial for OverTheWire Bandit Level 32 → 33!!"
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
    <a href="{{ '/posts/overTheWire-Bandit-Level-31-to-32/' | relative_url }}">← Previous: Level 31 → 32</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/bandit/bandit33.html" target="_blank" rel="noopener">Official (Level 33) ↗</a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Bandit-Level-33-to-34/' | relative_url }}">Next: Level 33 → 34 →</a>
  </div>
</nav>

## Login

Log in as **bandit32** using the password you obtained from Level 31 → 32.

```bash
ssh bandit32@bandit.labs.overthewire.org -p 2220
# password: 3O9RfhqyAlVBEZpVb6LYStshZoqoSx5K
```

> Why? Each Bandit level is a separate UNIX user. To solve 32 → 33, you must be the `bandit32` user.

## Task

![Task placeholder]({{ '/assets/images/bandit/level-32-to-33/task.jpg' | relative_url }})

When you log in, you’re dropped into an **UPPERCASE SHELL** that **uppercases** whatever you type (so `ls` becomes `LS`, which doesn’t exist).
Goal: **break out to a real shell** and read the password for **`bandit33`**.

## A little bit of Theory

* The custom “uppershell” takes your input and converts **letters → UPPERCASE** before executing it.
* In POSIX shells, **`$0`** expands to the **current shell’s path/name** (e.g., `/bin/sh`).
  Because `$` and digits aren’t letters, they **aren’t uppercased**, so `$0` expands correctly and launches a **normal shell**.
* Once in a normal shell, you can read `/etc/bandit_pass/bandit33`.

**Further reading:**

* <a href="https://pubs.opengroup.org/onlinepubs/9699919799/utilities/V3_chap02.html" target="_blank" rel="noopener">Shell command language (POSIX)</a>

## Solution

1. **Spawn a real shell using a variable expansion**

   ```bash
   $0
   ```

   *Why?* `$0` expands to the current shell’s executable (e.g., `/bin/sh`) **after** the uppercase filter, giving you a **normal shell** prompt.

2. **Verify who you are (optional)**

   ```bash
   whoami
   # bandit32
   ```

   *Why?* Sanity-check that you’re still the right user, now in a proper shell.

3. **Read the next password**

   ```bash
   cat /etc/bandit_pass/bandit33
   ```

   *Why?* Each password lives in `/etc/bandit_pass/<user>` and is readable by the matching previous level.

   ![password read placeholder]({{ '/assets/images/bandit/level-32-to-33/read.jpg' | relative_url }})

## Password

> Paste here the exact line your terminal printed:

```
tQdtbs5D5i2vJwkO8mEyYEyTL8izoeJ0
```

---

**Troubleshooting**

* **`$0: command not found`** → Try `echo "$0"` to see what it expands to. If empty, try `$SHELL` (if set): `"$SHELL"`. You can also try `${0}`.
* **Still uppercased?** → Make sure you typed **`$0`** exactly (dollar-zero, no spaces).
* **Permission issues** → You must be logged in as **bandit32** to read `bandit33`’s password.

---

**Congrats 🎉** You bypassed the **uppercasing shell** using variable expansion and grabbed the next credentials. On to **bandit33**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})
