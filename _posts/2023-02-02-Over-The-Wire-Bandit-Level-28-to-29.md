---
date: 2023-02-02 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Bandit Level 28 → 29 tutorial!!"
permalink: /posts/Over-The-Wire-Bandit-Level-28-to-29/
tags: [overthewire, bandit, walkthrough, ctf, linux, beginner]
description: "A step by step tutorial for OverTheWire Bandit Level 28 → 29!!"
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
    <a href="{{ '/posts/overTheWire-Bandit-Level-27-to-28/' | relative_url }}">← Previous: Level 27 → 28</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/bandit/bandit29.html" target="_blank" rel="noopener">Official (Level 29) ↗</a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Bandit-Level-29-to-30/' | relative_url }}">Next: Level 29 → 30 →</a>
  </div>
</nav>

## Login

Log in as **bandit28** using the password you obtained from Level 27 → 28.

```bash
ssh bandit28@bandit.labs.overthewire.org -p 2220
# password: Yz9IpL0sBcCeuG7m9uQFt8ZNpS4HZRcN
```

> Why? Each Bandit level is a separate UNIX user. To solve 28 → 29, you must be the `bandit28` user.

## Task

![Task placeholder]({{ '/assets/images/bandit/level-28-to-29/task.jpg' | relative_url }})

There is a **git repository** at:

```
ssh://bandit28-git@localhost:2220/home/bandit28-git/repo
```

The password for **bandit28-git** is the same as for **bandit28**.
Clone the repo and find the password for **bandit29**.

## A little bit of Theory

* Git keeps full **history**; removing a secret in a later commit doesn’t erase it from older commits.
* `git log` shows commit history; `git show <commit>` displays the changes/content for that commit.
* Look for a commit message like **“fix info leak”**—that’s a classic hint the password was present before.

**Further reading:**

* <a href="https://git-scm.com/docs/git-log" target="_blank" rel="noopener">`git log` manual</a> · <a href="https://git-scm.com/docs/git-show" target="_blank" rel="noopener">`git show` manual</a>

## Solution

1. **Clone the repository to a writable temp folder**

   ```bash
   WORKDIR=$(mktemp -d)
   cd "$WORKDIR"
   git clone ssh://bandit28-git@localhost:2220/home/bandit28-git/repo "repo-$RANDOM"
   cd repo-*
   ```

   *Why?* `/tmp` is writable for us, and the remote user `bandit28-git` authenticates with your **bandit28** password.

   ![git clone placeholder]({{ '/assets/images/bandit/level-28-to-29/git-clone.jpg' | relative_url }})

2. **Open the README to see what’s currently shown**

   ```bash
   ls -la
   cat README.md
   ```

   *Why?* The README usually **mentions** credentials but hides the password (often as `xxxxxxxxxx`). That’s your hint to check history.

   ![readme placeholder]({{ '/assets/images/bandit/level-28-to-29/readme.jpg' | relative_url }})

3. **List commit history and spot the suspicious one**

   ```bash
   git log --oneline --decorate
   ```

   *Why?* You’ll typically see something like:
   `fix info leak`, `add missing data`, `initial commit`. The “fix info leak” commit suggests a secret was removed.

   ![git log placeholder]({{ '/assets/images/bandit/level-28-to-29/git-log.jpg' | relative_url }})

4. **Show the diff of the leaking commit**

   ```bash
   # replace <hash> with the commit ID of "fix info leak"
   git show <hash>
   ```

   *Why?* The diff reveals that the README used to contain the **actual password** before it was redacted to `xxxxxxxxxx`.

   ![git show placeholder]({{ '/assets/images/bandit/level-28-to-29/git-show.jpg' | relative_url }})

---

## Password

> This is the password revealed by the leaking commit on my run:

```
4pT1t5DENaYuqnqvadYs1oE4QLCdjmJ7
```

---

**Troubleshooting**

* **Permission denied (publickey)** → You’ll be prompted for **bandit28**’s password when cloning as `bandit28-git@localhost` on port **2220**.
* **“not a git repository”** → `cd` into the cloned directory (e.g., `cd repo-*`) before running `git log` / `git show`.
* **Commit not found** → Use `git log --oneline` to copy the exact hash of the “fix info leak” commit.
* **Nothing in README** → That’s expected in the latest commit; the secret lives in the **older** revision’s diff.

---

**Congrats 🎉** You performed **git history forensics** to recover a removed secret and unlocked **bandit29**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})
