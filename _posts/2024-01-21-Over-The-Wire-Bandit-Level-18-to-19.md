---
layout: post-with-comments
title: "OverTheWire Bandit Level 18 → 19 tutorial!!"
permalink: /posts/overTheWire-Bandit-Level-18-to-19/
tags: [overthewire, bandit, walkthrough, ctf, linux, beginner]
description: "A step by step tutorial for OverTheWire Bandit Level 18 → 19!!"
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
    <a href="{{ '/posts/overTheWire-Bandit-Level-17-to-18/' | relative_url }}">← Previous: Level 17 → 18</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/bandit/bandit19.html" target="_blank" rel="noopener">
      Official (Level 19) ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Bandit-Level-19-to-20/' | relative_url }}">Next: Level 19 → 20 →</a>
  </div>
</nav>

## Login

Log in as **bandit18** using the password you obtained from Level 17 → 18.

```bash
ssh bandit18@bandit.labs.overthewire.org -p 2220
# password: x2gLTTjFwMOhQ8oWNbMN362QKxfRqGlO
````

> Why? Each Bandit level is a separate UNIX user. To solve 18 → 19, you must be the `bandit18` user.

## Task

![Task placeholder]({{ '/assets/images/bandit/level-18-to-19/task.jpg' | relative_url }})

The password for the next level is stored in a file called **`readme`** in the home directory.
**Problem:** Someone modified **`.bashrc`** to **log you out immediately** on SSH login.

## A little bit of Theory

* **Interactive shells** read `~/.bashrc` and can be scripted to `exit` right away (you’ll see `Byebye!`).
* You can **bypass interactive login** by asking SSH to **run a command directly** (non-interactive), e.g. `cat readme`.
* Alternatives: **`scp`**/`sftp` to pull the file without opening an interactive shell.

**Further reading:**

* <a href="https://man7.org/linux/man-pages/man1/ssh.1.html" target="_blank" rel="noopener">`ssh` manual</a>
* <a href="https://man7.org/linux/man-pages/man1/scp.1.html" target="_blank" rel="noopener">`scp` manual</a>
* <a href="https://man7.org/linux/man-pages/man1/sftp.1.html" target="_blank" rel="noopener">`sftp` manual</a>

## Solution

1. **Observe the trap (optional)**

   ```bash
   ssh bandit18@bandit.labs.overthewire.org -p 2220
   ```

   *Why?* You’ll be kicked out immediately due to `.bashrc`. That’s the point of the level.

   ![Byebye placeholder]({{ '/assets/images/bandit/level-18-to-19/bye.jpg' | relative_url }})

2. **(Option A) Run a remote command with SSH (recommended)**

   ```bash
   ssh -p 2220 bandit18@bandit.labs.overthewire.org 'cat readme'
   ```

   *Why?* This executes `cat readme` **without** launching an interactive shell, so `.bashrc` doesn’t log you out.
   If you prefer absolute paths:

   ```bash
   ssh -p 2220 bandit18@bandit.labs.overthewire.org 'cat /home/bandit18/readme'
   ```

   ![ssh-cat placeholder]({{ '/assets/images/bandit/level-18-to-19/a.jpg' | relative_url }})

3. **(Option B) Copy the file out with `scp`**

   *To stdout:*

   ```bash
   scp -P 2220 bandit18@bandit.labs.overthewire.org:readme -
   ```

   *To a local file:*

   ```bash
   scp -P 2220 bandit18@bandit.labs.overthewire.org:readme ./bandit19.pass
   cat ./bandit19.pass
   ```

   ![scp placeholder]({{ '/assets/images/bandit/level-18-to-19/b.jpg' | relative_url }})

4. **(Option C) Use `sftp`**

   ```bash
   sftp -P 2220 bandit18@bandit.labs.overthewire.org
   sftp> get readme -
   sftp> bye
   ```

   ![sftp placeholder]({{ '/assets/images/bandit/level-18-to-19/c.jpg' | relative_url }})

5. **Copy the password** printed from the file (no trailing spaces/newlines).

6. **Log into the next level (bandit19)**

   ```bash
   ssh bandit19@bandit.labs.overthewire.org -p 2220
   # paste the password you just extracted
   ```


## Password

> This is the password from my run; if yours differs, use the one your terminal printed.

```
cGWpMaKXVwDUNgPAVJbWYuGHVn9zl3j8
```

**Troubleshooting**

* **Still seeing `Byebye!`?** → Ensure you used the **remote command** form (quotes matter):
  `ssh -p 2220 bandit18@bandit.labs.overthewire.org 'cat readme'`
* **Permission denied (publickey)?** → You accidentally tried logging with a key instead of a password. Use the password from 17 → 18.
* **Weird characters/newlines** → Re-run and copy only the line printed by `cat readme`.
* **Command not found** → Use absolute path: `'/bin/cat /home/bandit18/readme'`.

---

## Copy-paste quick run (one shot)

```bash
# Print the password without opening an interactive shell
ssh -p 2220 bandit18@bandit.labs.overthewire.org 'cat /home/bandit18/readme'

# Then log into the next level:
# ssh bandit19@bandit.labs.overthewire.org -p 2220
# (paste the printed line as the password)
```

---

**Congrats 🎉** You bypassed the interactive shell trap and extracted the next password — welcome to **bandit19**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

