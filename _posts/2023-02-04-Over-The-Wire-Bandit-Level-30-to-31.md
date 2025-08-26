---
date: 2023-02-04 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Bandit Level 30 → 31 tutorial!!"
permalink: /posts/Over-The-Wire-Bandit-Level-30-to-31/
tags: [overthewire, bandit, walkthrough, ctf, linux, beginner]
description: "A step by step tutorial for OverTheWire Bandit Level 30 → 31!!"
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
    <a href="{{ '/posts/overTheWire-Bandit-Level-29-to-30/' | relative_url }}">← Previous: Level 29 → 30</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/bandit/bandit31.html" target="_blank" rel="noopener">Official (Level 31) ↗</a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Bandit-Level-31-to-32/' | relative_url }}">Next: Level 31 → 32 →</a>
  </div>
</nav>

## Login

Log in as **bandit30** using the password you obtained from Level 29 → 30.

```bash
ssh bandit30@bandit.labs.overthewire.org -p 2220
# password: qp30ex3VLz5MDG1n91YowTv4Q8l7CDZL
```

> Why? Each Bandit level is a separate UNIX user. To solve 30 → 31, you must be the `bandit30` user.

## Task

![Task placeholder]({{ '/assets/images/bandit/level-30-to-31/task.jpg' | relative_url }})

There is a **git repository** at
`ssh://bandit30-git@localhost:2220/home/bandit30-git/repo`
The password for `bandit30-git` is the **same** as for `bandit30`.
Clone the repo and find the password for **bandit31**.

## A little bit of Theory

* Git doesn’t only track commits/branches; it also has **tags** (often used for releases).
* **Annotated tags** store a message (and metadata). Bandit hides secrets **inside the tag message**.
* Commands you’ll need:

  * `git tag -l` — list tags
  * `git show <tag>` — display what a tag points to (and the message)
  * (alt) `git cat-file -p <tag>` — print raw tag object

**Further reading:**

* <a href="https://git-scm.com/docs/git-tag" target="_blank" rel="noopener">`git tag` manual</a> 
* <a href="https://git-scm.com/docs/git-cat-file" target="_blank" rel="noopener">`git cat-file` manual</a>

## Solution

1. **Clone the repository into a writable temp dir**

   ```bash
   WORKDIR=$(mktemp -d)
   cd "$WORKDIR"
   git clone ssh://bandit30-git@localhost:2220/home/bandit30-git/repo "repo-$RANDOM"
   cd repo-*
   ```

   *Why?* `/tmp` is writable. When prompted for `bandit30-git@localhost`’s password, use your **bandit30** password.

   ![git clone placeholder]({{ '/assets/images/bandit/level-30-to-31/git-clone.jpg' | relative_url }})

2. **Quick look at the repo**

   ```bash
   ls -la
   cat README.md
   ```

   *Why?* Often the working tree looks clean; the hint is that the secret isn’t in files but elsewhere (tags).

   ![ls placeholder]({{ '/assets/images/bandit/level-30-to-31/ls.jpg' | relative_url }})

3. **List tags**

   ```bash
   git tag -l
   ```

   You should see something like:

   ```
   secret
   ```

   *Why?* Tags are another place to stash data; here the tag name is a dead giveaway.


4. **Show the tag’s contents**

   ```bash
   git show secret
   # alt: git cat-file -p secret
   ```

   The annotated tag message prints the **password for bandit31**.

   *Why?* `git show` renders the tag message; Bandit places the password right there.

   ![git show placeholder]({{ '/assets/images/bandit/level-30-to-31/git-show.jpg' | relative_url }})

## Password

> This is the password revealed by the tag in my run (use the one your terminal prints):

```
fb5S2xb7bRyFmAvQYQGEqsbhVyJqhnDy
```

---

**Troubleshooting**

* **“unknown revision or path not in the working tree”** → Make sure you’re inside the cloned repo folder (`cd repo-*`) and that the tag exists (`git tag -l`).
* **Tag name differs** → List with `git tag -n` and show the one you see, or run `git show refs/tags/<name>`.
* **Auth issues cloning** → Use the exact URL and port: `ssh://bandit30-git@localhost:2220/...` and enter your **bandit30** password when prompted.

---

**Congrats 🎉** You used **git tags** to uncover a hidden secret. On to **bandit31**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})
