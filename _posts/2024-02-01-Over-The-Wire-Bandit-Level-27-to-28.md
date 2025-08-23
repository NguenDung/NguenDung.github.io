---
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
# password: s0773xxkk0MXfdqOfPRVr9L3jJBUOgCZ
````

> Why? Each Bandit level is a separate UNIX user. To solve 27 → 28, you must be the `bandit27` user.

## Task

![Task placeholder]({{ '/assets/images/bandit/level-27-to-28/task.jpg' | relative_url }})

The home directory contains a **git repository**.
Your task: clone it, explore the commits, and find the password for **bandit28**.

## A little bit of Theory

* **Git repositories** often hide history in `.git/`.
* Using `git log`, you can see commit history.
* Using `git show <commit>`, you can inspect changes made in that commit.
* Sometimes secrets (like passwords) are removed from later commits but still exist in earlier history.

**Further reading:**

* <a href="https://git-scm.com/docs/git-log" target="_blank" rel="noopener">`git log` manual</a>
* <a href="https://git-scm.com/docs/git-show" target="_blank" rel="noopener">`git show` manual</a>

## Solution

1. **Clone the repository**

   ```bash
   mkdir /tmp/bandit27
   cd /tmp/bandit27
   git clone ssh://bandit27@localhost:2220/home/bandit27/repo
   cd repo
   ```

   !\[git clone placeholder]\({{ '/assets/images/bandit/level-27-to-28/git-clone.jpg' | relative\_url }})

   *Why?* Cloning into `/tmp` gives you a writable location to explore.

2. **Check the commit history**

   ```bash
   git log
   ```

   Look for suspicious commits mentioning “password” or similar.

   !\[git log placeholder]\({{ '/assets/images/bandit/level-27-to-28/git-log.jpg' | relative\_url }})

   *Why?* Passwords may have been committed and later removed.

3. **Inspect earlier commits**

   ```bash
   git show <commit-id>
   ```

   You should eventually find a commit where the password for bandit28 was added (then deleted later).

   !\[git show placeholder]\({{ '/assets/images/bandit/level-27-to-28/git-show\.jpg' | relative\_url }})

4. **Extract the password**

   Once you find the right commit, copy the password string.

---

## Password

> This is the password I got for **bandit28**:

```
<the password string from repo commit>
```

---

**Troubleshooting**

* **“Permission denied (publickey)”** → Remember: use the password from Level 26 → 27 to log in as bandit27.
* **“not a git repository”** → Always `cd` into the cloned repo directory before running git commands.
* **Nothing in log?** → Scroll through multiple commits; the password is usually hidden in an earlier one.

---

**Congrats 🎉** You’ve just learned how to dig into **git commit history** to retrieve secrets. On to **bandit28**! 🚀

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

