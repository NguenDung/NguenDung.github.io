---
layout: post-with-comments
title: "OverTheWire Bandit Level 0 → 1 tutorial!!"
permalink: /posts/overTheWire-Bandit-Level-0-to-1/
tags: [overthewire, bandit, walkthrough, ctf, linux, beginner]
description: "A step by step tutorial for OverTheWire Bandit Level 0 → 1!!"
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
    <a href="{{ '/posts/overTheWire-Bandit-Level-0/' | relative_url }}">← Previous: Level 0</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/bandit/bandit1.html" target="_blank" rel="noopener">
      Official (Level 1) ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Bandit-Level-1-to-2/' | relative_url }}">Next: Level 1 → 2 →</a>
  </div>
</nav>

## Login

If you’re not already logged in from **Level 0**, connect as **bandit0**:

```bash
ssh bandit0@bandit.labs.overthewire.org -p 2220
# password: bandit0
````

> Why? We must start as `bandit0` to retrieve the password for `bandit1`.

## Task

![Task]({{ '/assets/images/bandit/level-0-to-1/task.jpg' | relative_url }})

The password for the next level is stored in a file named **readme** located in the **home directory** of `bandit0`.
Use that password to SSH into **bandit1**.

## A little bit of Theory

* **Home directory**: when you log in, you land in your home (shown as `~`).
* **Listing files**: `ls -la` shows all files, including hidden ones and details (owner, perms, size).
* **Reading a file**: `cat <file>` prints the file to standard output.
* **Absolute vs relative paths**: `readme` and `./readme` both refer to the file in the current directory.

## Solution 

1. **Confirm you are in the home directory**

   ```bash
   pwd
   ```

   *Why?* It should print something like `/home/bandit0`. That’s where the `readme` file lives.

2. **List all files to spot `readme`**

   ```bash
   ls -la
   ```

   *Why?* Ensures the file exists and lets you see permissions/owner.

3. **Print the password from `readme`**

   ```bash
   cat readme
   ```

   *Why?* `cat` outputs the file content directly; the output is the password for **bandit1**.

   ![readme output]({{ '/assets/images/bandit/level-0-to-1/pass.jpg' | relative_url }})

4. **Copy the password** (careful: no extra spaces or newline when pasting).

5. **Exit and log into the next level (bandit1)**

   ```bash
   exit
   ssh bandit1@bandit.labs.overthewire.org -p 2220
   # paste the password you just found when prompted
   ```

   *Why?* Each Bandit level is a distinct user; you use the found password to access the next account.

### Password

> This is the password shown in my run; if it doesn’t match yours, copy the one from your own terminal output.

```
ZjLjTmM6FvvyRnrb2rfNWOZOTa6ip5If
```

**Troubleshooting**

* `Permission denied` → Re-check that you typed/pasted the password exactly (no trailing spaces).
* `No such file or directory` for `readme` → Make sure you’re in the right directory (`pwd`), then run `ls -la` again.
* Connection issues → Ensure `-p 2220` is present and your network/firewall allows outbound SSH.

---

**Congrats 🎉** You’ve retrieved the password from `readme` and can now play as **bandit1**.

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})
