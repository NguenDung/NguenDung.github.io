---
date: 2023-02-01 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Bandit Level 27 → 28 tutorial!!"
permalink: /posts/overTheWire-Bandit-Level-27-to-28/
tags: [overthewire, bandit, walkthrough, ctf, linux, beginner]
description: "A step by step tutorial for OverTheWire Bandit Level 27 → 28!!"
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
    <a href="{{ '/posts/overTheWire-Bandit-Level-26-to-27/' | relative_url }}">← Previous: Level 26 → 27</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/bandit/bandit28.html" target="_blank" rel="noopener">Official (Level 28) ↗</a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Bandit-Level-28-to-29/' | relative_url }}">Next: Level 28 → 29 →</a>
  </div>
</nav>

## Login

Log in as **bandit27** using the password you obtained from Level 26 → 27.

```bash
ssh bandit27@bandit.labs.overthewire.org -p 2220
# password: upsNCc7vzaRDx6oZC6GiR6ERwe1MowGB
````

> Why? Each Bandit level is a separate UNIX user. To solve 27 → 28, you must be the `bandit27` user.

## Task

![Task placeholder]({{ '/assets/images/bandit/level-27-to-28/task.jpg' | relative_url }})

The home directory contains a **git repository** (served over SSH).
Your task: clone it, explore the history, and recover the password for **bandit28**.

## A little bit of Theory

* Git history lives in `.git/`; earlier commits can still expose removed secrets.
* `git log` shows commits; `git show <hash>` displays the changes (or file contents at that commit).
* If HEAD looks clean, the password is probably hidden in an **older** commit.

**Further reading:**

* <a href="https://git-scm.com/docs/git-log" target="_blank" rel="noopener">`git log` manual</a>
* <a href="https://git-scm.com/docs/git-show" target="_blank" rel="noopener">`git show` manual</a>

## Solution

1. **Clone the repository to a writable temp folder**

   ```bash
   WORKDIR=$(mktemp -d)
   cd "$WORKDIR"
   git clone ssh://bandit27-git@localhost:2220/home/bandit27-git/repo "repo-$RANDOM"
   cd repo-*
   ```

   *Why?* `/tmp` is writable by you; cloning here avoids permission issues. When prompted for a password for `bandit27-git`, enter the **bandit27 password**.

   ![git clone placeholder]({{ '/assets/images/bandit/level-27-to-28/git-clone.jpg' | relative_url }})

2. **List the history**

   ```bash
   git log --oneline --decorate --graph
   ```

   *Why?* A quick, readable view to spot the commit(s) that likely introduced/removed a secret.

   ![git log placeholder]({{ '/assets/images/bandit/level-27-to-28/git-log.jpg' | relative_url }})

3. **Show the commit content**

   ```bash
   git show <commit-id>
   ```

   *Why?* Inspect the README change; the password is typically added in the initial commit or an early one.

   ![git show placeholder]({{ '/assets/images/bandit/level-27-to-28/git-show.jpg' | relative_url }})


4. **Extract the password**

   Copy the password string you find in the relevant commit.

---

## Password

> The password revealed in the commit on my run:

```
Yz9IpL0sBcCeuG7m9uQFt8ZNpS4HZRcN
```

---

**Troubleshooting**

* **Permission denied (publickey)** → The remote is `bandit27-git@localhost` on port **2220**; it prompts for your **bandit27** password.
* **“not a git repository”** → Make sure you `cd repo` before using `git log` / `git show`.
* **No secret in HEAD** → Use `git log` to step back through commits and `git show <hash>` each one until you see it.

---

**Congrats 🎉** You used **git history forensics** to recover a removed secret. On to **bandit28**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})


