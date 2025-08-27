---
date: 2023-01-11 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Bandit Level 7 → 8 tutorial!!"
permalink: /posts/overTheWire-Bandit-Level-7-to-8/
tags: [overthewire, bandit, walkthrough, ctf, linux, beginner]
description: "A step by step tutorial for OverTheWire Bandit Level 7 → 8!!"
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
    <a href="{{ '/posts/overTheWire-Bandit-Level-6-to-7/' | relative_url }}">← Previous: Level 6 → 7</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/bandit/bandit8.html" target="_blank" rel="noopener">
      Official (Level 8) ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Bandit-Level-8-to-9/' | relative_url }}">Next: Level 8 → 9 →</a>
  </div>
</nav>

## Login

Log in as **bandit7** using the password you just obtained from Level 6 → 7.

```bash
ssh bandit7@bandit.labs.overthewire.org -p 2220
# password: morbNTDkSW6jIlUc0ymOdMaLnOlFVAaj
````

> Why? Each Bandit level is a separate UNIX user. To solve 7 → 8, you must be the `bandit7` user.

## Task

![Task]({{ '/assets/images/bandit/level-7-to-8/task.jpg' | relative_url }})

The password for the next level is stored in the file **`data.txt`** and is on the **same line** as the word **`millionth`**.

## A little bit of Theory

* **`grep`** searches for lines that match a pattern.

  * Basic: `grep PATTERN FILE`
  * With line numbers: `grep -n PATTERN FILE`
  * Match a whole word: `grep -w PATTERN FILE`
* The output line typically looks like:
  `millionth <password>` → copy the second field.
  You can also extract it with **`awk`** or **`cut`**.

**Further reading:**

* <a href="https://man7.org/linux/man-pages/man1/grep.1.html" target="_blank" rel="noopener">`grep` command manual</a>
* <a href="https://www.google.com/search?q=grep+basics" target="_blank" rel="noopener">Search: grep basics</a>

## Solution 

1. **Verify the file is present**

   ```bash
   ls -l
   ```

   *Why?* Sanity check; the challenge states `data.txt` is here.

![ls data.txt]({{ '/assets/images/bandit/level-7-to-8/file.jpg' | relative_url }})

2. **Search for the keyword**

   ```bash
   grep -nw 'millionth' data.txt
   ```

   *Why?* `-n` shows the line number; `-w` forces a whole-word match.


3. **(Optional) Extract only the password**

   ```bash
   awk '/\bmillionth\b/ {print $2}' data.txt
   # or:
   grep -w 'millionth' data.txt | cut -d' ' -f2
   ```

   *Why?* Prints just the second field (the password) — copy-friendly.

![extract password]({{ '/assets/images/bandit/level-7-to-8/succes.jpg' | relative_url }})

4. **Copy the password** (no extra spaces/newlines).

5. **Log into the next level (bandit8)**

   ```bash
   exit
   ssh bandit8@bandit.labs.overthewire.org -p 2220
   # paste the password you just found when prompted
   ```

## Password

> This is the password shown in my run; if yours differs, copy the one from your own terminal output.

```
dfwvzFQi4mU0wfNbFOe9RoWskMLg7eEc
```

**Troubleshooting**

* `grep: data.txt: No such file or directory` → Check `pwd`; you should be in `/home/bandit7`.
* Multiple matches? → Use `-w` to match the whole word.
* Output formatting odd? → Use `awk`/`cut` as shown to isolate the second field.

---

**Congrats 🎉** You plucked the right line out of a huge file and can now play as **bandit8**.

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

