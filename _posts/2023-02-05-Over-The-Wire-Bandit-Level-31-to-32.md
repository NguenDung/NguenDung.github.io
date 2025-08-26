---
date: 2023-02-05 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Bandit Level 31 → 32 tutorial!!"
permalink: /posts/Over-The-Wire-Bandit-Level-31-to-32/
tags: [overthewire, bandit, walkthrough, ctf, linux, beginner]
description: "A step by step tutorial for OverTheWire Bandit Level 31 → 32!!"
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
    <a href="{{ '/posts/overTheWire-Bandit-Level-30-to-31/' | relative_url }}">← Previous: Level 30 → 31</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/bandit/bandit32.html" target="_blank" rel="noopener">Official (Level 32) ↗</a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Bandit-Level-32-to-33/' | relative_url }}">Next: Level 32 → 33 →</a>
  </div>
</nav>

## Login

Log in as **bandit31** using the password you obtained from Level 30 → 31.

```bash
ssh bandit31@bandit.labs.overthewire.org -p 2220
# password: fb5S2xb7bRyFmAvQYQGEqsbhVyJqhnDy
```

> Why? Each Bandit level is a separate UNIX user. To solve 31 → 32, you must be the `bandit31` user.

## Task

![Task placeholder]({{ '/assets/images/bandit/level-31-to-32/task.jpg' | relative_url }})

There’s a **git repository** at
`ssh://bandit31-git@localhost:2220/home/bandit31-git/repo`
The password for `bandit31-git` is the **same** as for `bandit31`.

Clone the repo, follow the instructions inside, and obtain the password for **bandit32**.

## A little bit of Theory

* Repos can include **server-side hooks** that validate pushes and even print messages (like the next password) on successful validation.
* A `.gitignore` can **exclude** files from commits; you can still stage them with `git add -f`.
* Exact **content and filename** matter when a hook checks your push.

**Further reading:**

* <a href="https://git-scm.com/docs/gitignore" target="_blank" rel="noopener">`.gitignore` manual</a> 
* <a href="https://git-scm.com/docs/git-add" target="_blank" rel="noopener">`git add` manual</a> 
* <a href="https://git-scm.com/docs/git-push" target="_blank" rel="noopener">`git push` manual</a>

## Solution

1. **Clone to a writable temp dir and open the repo**

   ```bash
   WORKDIR=$(mktemp -d)
   cd "$WORKDIR"
   git clone ssh://bandit31-git@localhost:2220/home/bandit31-git/repo "repo-$RANDOM"
   cd repo-*
   ls -la
   cat README.md
   ```

   *Why?* `/tmp` is writable, and the `README.md` contains the exact instructions: **create `key.txt` with content `May I come in?` on branch `master`.**

   ![clone placeholder]({{ '/assets/images/bandit/level-31-to-32/clone.jpg' | relative_url }})

2. **Create the required file with the exact content**

   ```bash
   printf 'May I come in?\n' > key.txt
   ```

   *Why?* `printf` avoids stray quotes; the hook often checks the **exact** string.

3. **Stage the file (force add if it’s ignored)**

   ```bash
   git add key.txt 2>/dev/null || git add -f key.txt
   git commit -m "Add key.txt as requested"
   ```

   *Why?* The repo may ignore `key.txt` via `.gitignore`. `-f` overrides that.

    ![git add]({{ '/assets/images/bandit/level-31-to-32/gitadd.jpg' | relative_url }})

4. **Push to `master` and read the hook output**

   ```bash
   git push origin master
   ```

   *Why?* The server’s **pre-receive hook** validates the filename/content and prints the **bandit32** password. Sometimes the push is rejected after validation (you’ll still see the password in the output); that’s fine.

   ![push placeholder]({{ '/assets/images/bandit/level-31-to-32/push.jpg' | relative_url }})

---

## Password

> Copy the password the server prints during the `git push`. (Replace the placeholder below with yours.)

```
3O9RfhqyAlVBEZpVb6LYStshZoqoSx5K
```

---

**Troubleshooting**

* **“key.txt is ignored”** → Use `git add -f key.txt`.
* **Hook says “Wrong!”** → Ensure the file is named **exactly** `key.txt`, content is **exactly** `May I come in?` (same capitalization and `?`), and you pushed to **`master`**.
* **Push rejected after printing the password** → Normal. You already saw the password in the remote output.
* **Auth prompt** → Use your **bandit31** password when asked for `bandit31-git@localhost`’s password.

---

**Congrats 🎉** You used a server-side Git hook to validate a push and reveal the next secret. On to **bandit32**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})
