---
date: 2023-01-11 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Bandit Level 2 → 3 tutorial!!"
permalink: /posts/overTheWire-Bandit-Level-2-to-3/
tags: [overthewire, bandit, walkthrough, ctf, linux, beginner]
description: "A step by step tutorial for OverTheWire Bandit Level 2 → 3!!"
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
    <a href="{{ '/posts/overTheWire-Bandit-Level-1-to-2/' | relative_url }}">← Previous: Level 1 → 2</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/bandit/bandit3.html" target="_blank" rel="noopener">
      Official (Level 3) ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Bandit-Level-3-to-4/' | relative_url }}">Next: Level 3 → 4 →</a>
  </div>
</nav>

## Login

Log in as **bandit2** using the password you just obtained from Level 1 → 2.

```bash
ssh bandit2@bandit.labs.overthewire.org -p 2220
# password: 263JGJPfgU6LtdEvgfWU1XP5yac29mFx
````

> Why? Each Bandit level is a separate UNIX user. To solve 2 → 3, you must be the `bandit2` user.

## Task

![Task]({{ '/assets/images/bandit/level-2-to-3/task.jpg' | relative_url }})

The password for the next level is stored in a file named **--spaces in this filename--** located in the **home directory** of `bandit2`.

## A little bit of Theory

* Filenames with **spaces** must be **quoted** or **escaped** so the shell treats them as a single argument.
* Filenames beginning with **`-`** can be interpreted as **options**. Safe ways to reference them:

  * Prefix with a path:

    ```bash
    cat "./--spaces in this filename--"
    ```
  * Use the option terminator:

    ```bash
    cat -- "--spaces in this filename--"
    ```
  * Escape spaces (and still add `./` so the leading dashes aren’t parsed as options):

    ```bash
    cat ./--spaces\ in\ this\ filename--
    ```
* **Tab completion** helps avoid typos: type `cat ./--spa<Tab>` and let the shell complete the filename.
* `ls -la` shows file details to confirm you’re in the right place.

**Further reading:**

* <a href="https://www.google.com/search?q=spaces+in+filename" target="_blank" rel="noopener">Searching about “spaces in filename” </a>

## Solution 

1. **Confirm your location**

   ```bash
   pwd
   ```

   *Why?* Should print `/home/bandit2`; that’s where the target file lives.

2. **List files to see the target**

   ```bash
   ls -la
   ```

   *Why?* Verifies the file **--spaces in this filename--** exists and shows its permissions.

3. **Read the file safely**

   ```bash
   cat "./--spaces in this filename--"
   # or
   cat -- "--spaces in this filename--"
   # or
   cat ./--spaces\ in\ this\ filename--
   ```

   *Why?* Quoting/escaping and/or prefixing with a path prevents the leading dashes from being treated as options.

![cat]({{ '/assets/images/bandit/level-2-to-3/succes.jpg' | relative_url }}) 

4. **Copy the password** (no extra spaces/newlines).

5. **Log into the next level (bandit3)**

   ```bash
   exit
   ssh bandit3@bandit.labs.overthewire.org -p 2220
   # paste the password you just found when prompted
   ```

## Password

> This is the password shown in my run; if yours differs, copy the one from your own terminal output.

```
MNk8KNH3Usiio41PRUEoDFPqfxLPlSmx
```

**Troubleshooting**

* `No such file or directory` → Include the leading/trailing `--` and quote/escape spaces; try **Tab** completion.
* `cat: invalid option` → Use `cat -- "--filename"` or add `./` before the name.
* `Permission denied` → Ensure you are logged in as `bandit2`.

---

**Congrats 🎉** You handled filenames with spaces and can now play as **bandit3**.

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

