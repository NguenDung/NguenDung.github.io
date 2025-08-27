---
date: 2023-02-03 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Bandit Level 29 → 30 tutorial!!"
permalink: /posts/overTheWire-Bandit-Level-29-to-30/
tags: [overthewire, bandit, walkthrough, ctf, linux, beginner]
description: "A step by step tutorial for OverTheWire Bandit Level 29 → 30!!"
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
    <a href="{{ '/posts/overTheWire-Bandit-Level-28-to-29/' | relative_url }}">← Previous: Level 28 → 29</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/bandit/bandit30.html" target="_blank" rel="noopener">Official (Level 30) ↗</a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Bandit-Level-30-to-31/' | relative_url }}">Next: Level 30 → 31 →</a>
  </div>
</nav>

## Login

Log in as **bandit29** using the password you obtained from Level 28 → 29.

```bash
ssh bandit29@bandit.labs.overthewire.org -p 2220
# password: 4pT1t5DENaYuqnqvadYs1oE4QLCdjmJ7
```

> Why? Each Bandit level is a separate UNIX user. To solve 29 → 30, you must be the `bandit29` user.

## Task

![Task placeholder]({{ '/assets/images/bandit/level-29-to-30/task.jpg' | relative_url }})

There is a **git repository** at
`ssh://bandit29-git@localhost:2220/home/bandit29-git/repo`
The password for `bandit29-git` is the **same** as for `bandit29`.
Clone the repo and find the password for **bandit30**.

## A little bit of Theory

* Git projects can use **branches**. Production code typically lives on **`master`**, while work-in-progress lives on branches like **`dev`**.
* Use `git branch -a` to list local and **remote** branches.
* Switch with `git checkout <branch>` (or `git switch <branch>`).
* Secrets are often left in non-master branches (e.g., `dev`).

**Further reading:**

* <a href="https://git-scm.com/docs/git-branch" target="_blank" rel="noopener">`git branch` manual</a> 
* <a href="https://git-scm.com/docs/git-checkout" target="_blank" rel="noopener">`git checkout` manual</a>  
* <a href="https://git-scm.com/docs/git-switch" target="_blank" rel="noopener">`git switch` manual</a>

## Solution

1. **Clone the repository into a writable temp dir**

   ```bash
   WORKDIR=$(mktemp -d)
   cd "$WORKDIR"
   git clone ssh://bandit29-git@localhost:2220/home/bandit29-git/repo "repo-$RANDOM"
   cd repo-*
   ```

   Why? `/tmp` is writable. When prompted for `bandit29-git@localhost`’s password, use your **bandit29** password.

   ![git clone placeholder]({{ '/assets/images/bandit/level-29-to-30/git-clone.jpg' | relative_url }})

2. **List what’s in the repo (on master)**

   ```bash
   ls -la
   cat README.md
   ```

   Why? A quick peek shows the hint: the master README usually says something like **“no passwords in production!”**, nudging us toward another branch.

   ![repo contents placeholder]({{ '/assets/images/bandit/level-29-to-30/ls.jpg' | relative_url }})

3. **Check what branches exist**

   ```bash
   git branch -a
   ```

   Why? We expect additional remote branches (e.g., `origin/dev`, maybe `origin/sploits-dev`) that may contain the secret.

   ![branches placeholder]({{ '/assets/images/bandit/level-29-to-30/branches.jpg' | relative_url }})

4. **Switch to the `dev` branch**

   ```bash
   git checkout dev     # or: git switch dev
   ```

   Why? The README on `master` said “no passwords in production,” hinting the **dev** branch holds it.

   ![checkout placeholder]({{ '/assets/images/bandit/level-29-to-30/checkout.jpg' | relative_url }})

5. **Read the README on `dev`**

   ```bash
   cat README.md
   ```

   Why? The credentials for the next level are stored right in the development branch’s README.

   ![readme placeholder]({{ '/assets/images/bandit/level-29-to-30/readme.jpg' | relative_url }})

## Password

> This is the password I got for **bandit30** (from the `dev` branch README):

```
qp30ex3VLz5MDG1n91YowTv4Q8l7CDZL
```

---

**Troubleshooting**

* **“Permission denied (publickey)”** → Make sure you used `ssh://bandit29-git@localhost:2220/...` and typed the **bandit29** password at the prompt.
* **No dev branch?** → Run `git fetch --all` then `git branch -a` again.
* **Detached HEAD or mistakes** → `git switch -` jumps back to the previous branch; `git status` shows where you are.

---

**Congrats 🎉** You explored **git branches** and dug the secret out of the **dev** branch. On to **bandit30**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})
