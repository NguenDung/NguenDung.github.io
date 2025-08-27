---
date: 2023-01-24 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Bandit Level 21 → 22 tutorial!!"
permalink: /posts/overTheWire-Bandit-Level-21-to-22/
tags: [overthewire, bandit, walkthrough, ctf, linux, beginner]
description: "A step by step tutorial for OverTheWire Bandit Level 21 → 22!!"
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
    <a href="{{ '/posts/overTheWire-Bandit-Level-20-to-21/' | relative_url }}">← Previous: Level 20 → 21</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/bandit/bandit22.html" target="_blank" rel="noopener">Official (Level 22) ↗</a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Bandit-Level-22-to-23/' | relative_url }}">Next: Level 22 → 23 →</a>
  </div>
</nav>

## Login

Log in as **bandit21** using the password you obtained from Level 20 → 21.

```bash
ssh bandit21@bandit.labs.overthewire.org -p 2220
# password: EeoULMCra2q0dSkYj561DX7s1CpBuOBt
````

> Why? Each Bandit level is a separate UNIX user. To solve 21 → 22, you must be the `bandit21` user.

## Task

![Task placeholder]({{ '/assets/images/bandit/level-21-to-22/task.jpg' | relative_url }})

A **cron job** is set up for the next user. Find what it does and use it to obtain the **password for `bandit22`**.

## A little bit of Theory

* **Cron** runs commands on a schedule. Per-level jobs in Bandit are defined in **`/etc/cron.d/`** and typically call a script.
* The script often copies the next user’s password from `/etc/bandit_pass/<user>` to **a file in `/tmp`** (world-readable).
* Don’t guess the filename in `/tmp`: **read the script** and use exactly the path it writes to.

**Further reading:**

* <a href="https://man7.org/linux/man-pages/man5/crontab.5.html" target="_blank" rel="noopener">`crontab(5)` format</a>
* <a href="https://man7.org/linux/man-pages/man8/cron.8.html" target="_blank" rel="noopener">`cron(8)` format </a>

## Solution

1. **List cron definitions**

   ```bash
   ls -l /etc/cron.d
   ```

   *Why?* Identify the job file for this level, e.g. **`cronjob_bandit22`**.

   ![cron dir placeholder]({{ '/assets/images/bandit/level-21-to-22/cron-dir.jpg' | relative_url }})

2. **Read the cron entry**

   ```bash
   cat /etc/cron.d/cronjob_bandit22
   ```

   Example (from my run):

   ```
   @reboot bandit22 /usr/bin/cronjob_bandit22.sh &> /dev/null
   * * * * * bandit22 /usr/bin/cronjob_bandit22.sh &> /dev/null
   ```

   *Why?* It runs **`/usr/bin/cronjob_bandit22.sh`** as **`bandit22`** every minute.

   ![cron file placeholder]({{ '/assets/images/bandit/level-21-to-22/cron-file.jpg' | relative_url }})

3. **Open the referenced script and extract the output path**

   ```bash
   cat /usr/bin/cronjob_bandit22.sh
   # Quick way to capture the exact /tmp path:
   P=$(grep -o '/tmp/[^ >]*' /usr/bin/cronjob_bandit22.sh | head -n1)
   echo "Output path: $P"
   ```

   In my run the script is:

   ```bash
   #!/bin/bash
   chmod 644 /tmp/t706lds9S0RqQh9aMcz6ShpAoZKF7fgv
   cat /etc/bandit_pass/bandit22 > /tmp/t706lds9S0RqQh9aMcz6ShpAoZKF7fgv
   ```

   *Why?* We now know exactly **which file** in `/tmp` to read.

   ![script placeholder]({{ '/assets/images/bandit/level-21-to-22/script.jpg' | relative_url }})

4. **Read the file produced by the cron job**

   ```bash
   cat "$P"
   # or, using the concrete path from my run:
   # cat /tmp/t706lds9S0RqQh9aMcz6ShpAoZKF7fgv
   ```

   *Why?* That file contains the **password for `bandit22`**. If it’s missing, wait up to a minute for cron to run again.

   ![read tmp placeholder]({{ '/assets/images/bandit/level-21-to-22/read-tmp.jpg' | relative_url }})

5. **Copy the password** (no trailing spaces/newlines).

6. **Log into the next level (bandit22)**

   ```bash
   exit
   ssh bandit22@bandit.labs.overthewire.org -p 2220
   # paste the password you just retrieved
   ```

## Password

> This is the password from my run; if yours differs, use the one your terminal printed.

```
tRae0UfB9v0UzbCdn9cY0gQnds9GF58Q
```

**Troubleshooting**

* **Got “Please use "cd \$(mktemp -d)"”** → You looked at an old placeholder file (`/tmp/bandit22`). Always read the **actual** path from the script.
* **File not found / empty** → Cron runs every minute. Wait up to 60 seconds and retry.
* **Different path** → Trust your `/usr/bin/cronjob_bandit22.sh`. Extract the path via:

  ```bash
  grep -o '/tmp/[^ >]*' /usr/bin/cronjob_bandit22.sh | head -n1
  ```
* **Permission denied** → The output is world-readable (`chmod 644`), but if perms differ on your run, just wait for the next cron run to re-apply.

---

## Copy-paste quick run (one shot)

```bash
# Find the script and its /tmp output path, then read the password
cat /etc/cron.d/cronjob_bandit22
P=$(grep -o '/tmp/[^ >]*' /usr/bin/cronjob_bandit22.sh | head -n1)
echo "Output path: $P"
cat "$P"

# Then log in:
# ssh bandit22@bandit.labs.overthewire.org -p 2220
# (paste the line above)
```

---

**Congrats 🎉** You traced a cron job and used it to retrieve the next password — welcome to **bandit22**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})


