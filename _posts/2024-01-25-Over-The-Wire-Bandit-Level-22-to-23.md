---
layout: post-with-comments
title: "OverTheWire Bandit Level 22 → 23 tutorial!!"
permalink: /posts/overTheWire-Bandit-Level-22-to-23/
tags: [overthewire, bandit, walkthrough, ctf, linux, beginner]
description: "A step by step tutorial for OverTheWire Bandit Level 22 → 23!!"
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
    <a href="{{ '/posts/overTheWire-Bandit-Level-21-to-22/' | relative_url }}">← Previous: Level 21 → 22</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/bandit/bandit23.html" target="_blank" rel="noopener">Official (Level 23) ↗</a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Bandit-Level-23-to-24/' | relative_url }}">Next: Level 23 → 24 →</a>
  </div>
</nav>

## Login

Log in as **bandit22** using the password you obtained from Level 21 → 22.

```bash
ssh bandit22@bandit.labs.overthewire.org -p 2220
# password: tRae0UfB9v0UzbCdn9cY0gQnds9GF58Q
````

> Why? Each Bandit level is a separate UNIX user. To solve 22 → 23, you must be the `bandit22` user.

## Task

![Task placeholder]({{ '/assets/images/bandit/level-22-to-23/task.jpg' | relative_url }})

A **cron job** runs as user **`bandit23`**. Inspect what it does and use it to obtain the **password for `bandit23`**.

## A little bit of Theory

* Cron job definitions live in **`/etc/cron.d/`** on Bandit levels. Each entry calls a script/binary.
* The script for this level computes a **hash-based filename** using `md5sum` and writes the next user’s password there.
* Do **not** guess the path; read the script and follow the exact output filename in `/tmp`.

**Further reading:**

* <a href="https://man7.org/linux/man-pages/man5/crontab.5.html" target="_blank" rel="noopener">`crontab(5)` format</a>
* <a href="https://man7.org/linux/man-pages/man8/cron.8.html" target="_blank" rel="noopener">`cron(8)` format</a>

## Solution

1. **List cron definitions**

   ```bash
   ls -l /etc/cron.d
   ```

   *Why?* Locate the job for this level (e.g., `cronjob_bandit23`).

   ![cron dir placeholder]({{ '/assets/images/bandit/level-22-to-23/cron-dir.jpg' | relative_url }})

2. **Read the cron entry**

   ```bash
   cat /etc/cron.d/cronjob_bandit23
   ```

   *Why?* See **which script** runs and **as which user** (`bandit23`), plus the schedule (every minute).

   ![cron file placeholder]({{ '/assets/images/bandit/level-22-to-23/cron-file.jpg' | relative_url }})

3. **Open the referenced script and understand it**

   ```bash
   cat /usr/bin/cronjob_bandit23.sh
   ```

   On Bandit it looks like:

   ```bash
   #!/bin/bash
   myname=$(whoami)
   mytarget=$(echo I am user $myname | md5sum | cut -d ' ' -f 1)
   echo "Copying passwordfile /etc/bandit_pass/$myname to /tmp/$mytarget"
   cat /etc/bandit_pass/$myname > /tmp/$mytarget
   ```

   *Why?* Since it runs as `bandit23`, it writes `/etc/bandit_pass/bandit23` to **`/tmp/<md5("I am user bandit23")>`**.

   ![script placeholder]({{ '/assets/images/bandit/level-22-to-23/script.jpg' | relative_url }})

4. **Compute the exact target and read it**

   ```bash
   T=$(echo I am user bandit23 | md5sum | cut -d' ' -f1)
   echo "Target: /tmp/$T"
   cat "/tmp/$T"
   ```

   *Why?* This reveals the **bandit23** password.

   ![read tmp placeholder]({{ '/assets/images/bandit/level-22-to-23/read-tmp.jpg' | relative_url }})

5. **Copy the password** (no trailing spaces/newlines).

6. **Log into the next level (bandit23)**

   ```bash
   exit
   ssh bandit23@bandit.labs.overthewire.org -p 2220
   # paste the password you just retrieved
   ```

## Password

> This is the password from my run; if yours differs, use the one your terminal printed.

```
0Zf11ioIjMVN551jX3CmStKLYqjk54Ga
```

**Troubleshooting**

* **File not found yet** → Cron runs every minute; wait ≤60s and try again.
* **Different path** → Your `/usr/bin/cronjob_bandit23.sh` is the source of truth. It always prints/uses the MD5 target name.
* **Permission denied** → Rare here; the file is plain text created by the script. If it disappears, wait for the next minute cycle.

---

## Copy-paste quick run (one shot)

```bash
cat /etc/cron.d/cronjob_bandit23
cat /usr/bin/cronjob_bandit23.sh
T=$(echo I am user bandit23 | md5sum | cut -d' ' -f1)
cat "/tmp/$T"
```

---

**Congrats 🎉** You followed another cron job and harvested the next password — welcome to **bandit23**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

