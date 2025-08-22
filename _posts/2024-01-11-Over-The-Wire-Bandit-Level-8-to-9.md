---
layout: post-with-comments
title: "OverTheWire Bandit Level 8 → 9 tutorial!!"
permalink: /posts/overTheWire-Bandit-Level-8-to-9/
tags: [overthewire, bandit, walkthrough, ctf, linux, beginner]
description: "A step by step tutorial for OverTheWire Bandit Level 8 → 9!!"
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
    <a href="{{ '/posts/overTheWire-Bandit-Level-7-to-8/' | relative_url }}">← Previous: Level 7 → 8</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/bandit/bandit9.html" target="_blank" rel="noopener">
      Official (Level 9) ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Bandit-Level-9-to-10/' | relative_url }}">Next: Level 9 → 10 →</a>
  </div>
</nav>

## Login

Log in as **bandit8** using the password you just obtained from Level 7 → 8.

```bash
ssh bandit8@bandit.labs.overthewire.org -p 2220
# password: dfwvzFQi4mU0wfNbFOe9RoWskMLg7eEc
````

> Why? Each Bandit level is a separate UNIX user. To solve 8 → 9, you must be the `bandit8` user.

## Task

![Task]({{ '/assets/images/bandit/level-8-to-9/task.jpg' | relative_url }})

The password for the next level is stored in **`data.txt`** and is the **only line** that occurs **exactly once**.

## A little bit of Theory

* **`sort`** groups identical lines together (lexicographical order).
* **`uniq`** examines **adjacent** equal lines, so it works properly **after** `sort`.

  * `uniq -u` prints only lines that appear **once**.
  * `uniq -c` prints counts; can be combined with another `sort` to view frequencies.
* For speed and predictable ordering, you can use `LC_ALL=C sort`.

**Further reading:**

* <a href="https://man7.org/linux/man-pages/man1/sort.1.html" target="_blank" rel="noopener">`sort` manual</a>
* <a href="https://man7.org/linux/man-pages/man1/uniq.1.html" target="_blank" rel="noopener">`uniq` manual</a>
* <a href="https://ryanstutorials.net/linuxtutorial/piping.php" target="_blank" rel="noopener">Piping and Redirection </a>

## Solution 

1. **Confirm the file exists**

   ```bash
   ls -l
   ```

   *Why?* Sanity check before running heavy commands.

![ls data.txt]({{ '/assets/images/bandit/level-8-to-9/file.jpg' | relative_url }})

2. **Find the line that appears exactly once**

   ```bash
   sort data.txt | uniq -u
   # or (locale-agnostic & often faster)
   LC_ALL=C sort data.txt | uniq -u
   ```

   *Why?* `sort` groups duplicates; `uniq -u` keeps strictly-unique lines.

![sort]({{ '/assets/images/bandit/level-8-to-9/succes.jpg' | relative_url }})

3. **(Optional) Inspect counts to be sure**

   ```bash
   LC_ALL=C sort data.txt | uniq -c | sort -n
   # then pick the one with count 1 (print only the line):
   LC_ALL=C sort data.txt | uniq -c | awk '$1==1{$1=""; sub(/^ /,""); print}'
   ```

   *Why?* Good when you want to verify there’s exactly one unique line.

4. **Copy the password** (no extra spaces/newlines).

5. **Log into the next level (bandit9)**

   ```bash
   exit
   ssh bandit9@bandit.labs.overthewire.org -p 2220
   # paste the password you just found when prompted
   ```

## Password

> This is the password shown in my run; if yours differs, copy the one from your own terminal output.

```
4CKMh1JI91bUIZZPXDqGanal4xvAg0JM
```

**Troubleshooting**

* Using `sort -u`? → That removes duplicates but still **keeps one copy** of repeated lines; you want lines that occur **only once** → use `uniq -u`.
* Slow `sort`? → Use `LC_ALL=C sort` to avoid locale collation overhead.
* Garbled output? → Check for weird control characters with `cat -A data.txt | head`.

---

**Congrats 🎉** You sifted through a massive file and found the unique line — on to **bandit9**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

