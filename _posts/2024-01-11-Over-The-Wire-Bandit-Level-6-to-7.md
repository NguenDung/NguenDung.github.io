---
layout: post-with-comments
title: "OverTheWire Bandit Level 6 → 7 tutorial!!"
permalink: /posts/overTheWire-Bandit-Level-6-to-7/
tags: [overthewire, bandit, walkthrough, ctf, linux, beginner]
description: "A step by step tutorial for OverTheWire Bandit Level 6 → 7!!"
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
    <a href="{{ '/posts/overTheWire-Bandit-Level-5-to-6/' | relative_url }}">← Previous: Level 5 → 6</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/bandit/bandit7.html" target="_blank" rel="noopener">
      Official (Level 7) ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Bandit-Level-7-to-8/' | relative_url }}">Next: Level 7 → 8 →</a>
  </div>
</nav>

## Login

Log in as **bandit6** using the password you just obtained from Level 5 → 6.

```bash
ssh bandit6@bandit.labs.overthewire.org -p 2220
# password: HWasnPhtq9AVKe0dmk45nxy20cvUa6EG
````

> Why? Each Bandit level is a separate UNIX user. To solve 6 → 7, you must be the `bandit6` user.

## Task

![Task]({{ '/assets/images/bandit/level-6-to-7/task.jpg' | relative_url }})

The password for the next level is stored **somewhere on the server** and the file has **all** of these properties:

* **owned by user** `bandit7`
* **owned by group** `bandit6`
* **33 bytes** in size

## A little bit of Theory

* Use **`find`** to search from the filesystem root `/` with multiple predicates:

  * Owner: `-user bandit7`
  * Group: `-group bandit6`
  * Size: `-size 33c` (the `c` means **bytes**)
  * Regular file (defensive): `-type f`
* Searching from `/` will hit many restricted dirs and print errors. Suppress those **stderr** messages with:

  ```bash
  2>/dev/null
  ```
* Full example:

  ```bash
  find / -type f -user bandit7 -group bandit6 -size 33c 2>/dev/null
  ```
* After you get the path, **`cat <path>`** to reveal the password.

**Further reading:**

* <a href="https://man7.org/linux/man-pages/man1/find.1.html" target="_blank" rel="noopener">`find` command manual</a>
* <a href="https://www.google.com/search?q=2%3E%2Fdev%2Fnull+meaning" target="_blank" rel="noopener">What does `2>/dev/null` mean?</a>

## Solution 

1. **Run `find` from the root with all constraints**

   ```bash
   find / -type f -user bandit7 -group bandit6 -size 33c 2>/dev/null
   ```

   *Why?* Walks the whole filesystem, returning only regular files that match the exact owner, group, and size.

   ![find result]({{ '/assets/images/bandit/level-6-to-7/file.jpg' | relative_url }})

   *Example output (from my run):*

   ```
   /var/lib/dpkg/info/bandit7.password
   ```

2. **Print the password**

   ```bash
   cat /var/lib/dpkg/info/bandit7.password
   # use the actual path you found in Step 1
   ```

   *Why?* The matching file contains the next level’s password.

   ![cat target]({{ '/assets/images/bandit/level-6-to-7/succes.jpg' | relative_url }})

3. **Copy the password** (no extra spaces/newlines).

4. **Log into the next level (bandit7)**

   ```bash
   exit
   ssh bandit7@bandit.labs.overthewire.org -p 2220
   # paste the password you just found when prompted
   ```

### Password

> This is the password shown in my run; if yours differs, copy the one from your own terminal output.

```
morbNTDkSW6jIlUc0ymOdMaLnOlFVAaj
```

**Troubleshooting**

* Tons of “Permission denied”? → Keep `2>/dev/null` to silence stderr; the valid result will still print.
* No result? → Double-check predicates (`-user bandit7 -group bandit6 -size 33c -type f`) and ensure the `c` suffix is present.
* Multiple hits? → Very unlikely; if it happens, `ls -l <path>` to confirm owner/group/size = 33 bytes.

---

**Congrats 🎉** You hunted across the filesystem and can now play as **bandit7**.

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})
