---
layout: post-with-comments
title: "OverTheWire Bandit Level 1 → 2 tutorial!!"
permalink: /posts/overTheWire-Bandit-Level-1-to-2/
tags: [overthewire, bandit, walkthrough, ctf, linux, beginner]
description: "A step by step tutorial for OverTheWire Bandit Level 1 → 2!!"
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
    <a href="{{ '/posts/overTheWire-Bandit-Level-0-to-1/' | relative_url }}">← Previous: Level 0 → 1</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/bandit/bandit2.html" target="_blank" rel="noopener">
      Official (Level 2) ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Bandit-Level-2-to-3/' | relative_url }}">Next: Level 2 → 3 →</a>
  </div>
</nav>

## Login

Log in as **bandit1** using the password you found in the previous level.

```bash
ssh bandit1@bandit.labs.overthewire.org -p 2220
# password: ZjLjTmM6FvvyRnrb2rfNWOZOTa6ip5If
````

> Why? Each Bandit level is a different UNIX user. To solve 1 → 2, you must be logged in as `bandit1`.

## Task

![Task]({{ '/assets/images/bandit/level-1-to-2/task.jpg' | relative_url }})

The password for the next level is stored in a file named **-** (a single hyphen) located in the **home directory** of `bandit1`.

## A little bit of Theory

* In many UNIX tools, a lone **`-`** means **“use standard input”** (stdin) instead of a file path.
  Example: `cat -` waits for you to type, then echoes what you type.
* To read a **file literally named `-`**, you must prevent the command from treating it as stdin or an option. Common ways:

  * **Prefix with a path**: `cat ./-` or `cat /home/bandit1/-`
  * **Use option terminator**: `cat -- -` (everything after `--` is a filename, not an option)
* Quick reminders:

  * `ls -la` lists all files, including hidden ones, and shows ownership/permissions.
  * Absolute path **`/home/bandit1/-`** always works regardless of your current directory.

**Further reading:**

* <a href="https://www.google.com/search?q=dashed+filename" target="_blank" rel="noopener">Why a dash `-` is tricky as a filename </a>
* <a href="https://linux.die.net/abs-guide/special-chars.html" target="_blank" rel="noopener">Bash special characters (ABS Guide) </a>

## Solution 
1. **Verify where you are**

   ```bash
   pwd
   ```

   *Why?* Confirms you start in `/home/bandit1` (the home directory).

2. **List files to see the target**

   ```bash
   ls -la
   ```

   *Why?* Ensures the file named `-` really exists and shows its permissions.

3. **Read the file named `-` safely**

   ```bash
   cat ./-
   ```

   *Why?* Using `./-` treats `-` as a literal filename in the current directory, avoiding the stdin special meaning.

   *Alternatives (both valid):*

   ```bash
   cat -- -
   cat /home/bandit1/-
   ```

   ![cat]({{ '/assets/images/bandit/level-1-to-2/succes.jpg' | relative_url }})

4. **Copy the password** (avoid trailing spaces/newlines).

5. **Log into the next level (bandit2)**

   ```bash
   exit
   ssh bandit2@bandit.labs.overthewire.org -p 2220
   # paste the password you just found when prompted
   ```

### Password

> This is the password shown in my run; if yours differs, copy the one from your own terminal output.

```
263JGJPfgU6LtdEvgfWU1XP5yac29mFx
```

**Troubleshooting**

* `cat: invalid option -- '-'` → Use `cat ./-` or `cat -- -` instead of `cat -`.
* `No such file or directory` → Confirm you’re in `/home/bandit1` or use the absolute path `/home/bandit1/-`.
* `Permission denied` → Double-check you’re logged in as `bandit1`.

---

**Congrats 🎉** You’ve extracted the password from the tricky `-` file and can now play as **bandit2**.

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})


