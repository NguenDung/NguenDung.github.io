---
layout: post-with-comments
title: "OverTheWire Bandit Level 5 → 6 tutorial!!"
permalink: /posts/overTheWire-Bandit-Level-5-to-6/
tags: [overthewire, bandit, walkthrough, ctf, linux, beginner]
description: "A step by step tutorial for OverTheWire Bandit Level 5 → 6!!"
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
    <a href="{{ '/posts/overTheWire-Bandit-Level-4-to-5/' | relative_url }}">← Previous: Level 4 → 5</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/bandit/bandit6.html" target="_blank" rel="noopener">
      Official (Level 6) ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Bandit-Level-6-to-7/' | relative_url }}">Next: Level 6 → 7 →</a>
  </div>
</nav>

## Login

Log in as **bandit5** using the password you just obtained from Level 4 → 5.

```bash
ssh bandit5@bandit.labs.overthewire.org -p 2220
# password: 4oQYVPkxZOOEOO5pTW81FB8j8lxXGUQw
````

> Why? Each Bandit level is a separate UNIX user. To solve 5 → 6, you must be the `bandit5` user.

## Task

![Task]({{ '/assets/images/bandit/level-5-to-6/task.jpg' | relative_url }})

The password for the next level is stored **somewhere under** the directory **`inhere`** and the file has **all** of these properties:

* **human-readable**
* **1033 bytes** in size
* **not executable**

## A little bit of Theory

* Use **`find`** to search recursively by properties:

  * **Regular file**: `-type f`
  * **Size in bytes**: `-size 1033c` (the `c` means bytes)
  * **Readable**: `-readable`
  * **Not executable**: `! -executable`
* Chain the tests and print the match:

  ```bash
  find inhere -type f -size 1033c -readable ! -executable -print
  ```
* Sometimes `file` may say *“ASCII text, with very long lines (1000)”* — that’s still human-readable.
* Once you have the path, **`cat <path>`** to reveal the password.

**Further reading:**

* <a href="https://man7.org/linux/man-pages/man1/find.1.html" target="_blank" rel="noopener">`find` command manual</a>
* <a href="https://man7.org/linux/man-pages/man1/cat.1.html" target="_blank" rel="noopener">`cat` manual</a>

## Solution

1. **Inspect the `inhere` tree**

   ```bash
   cd inhere && ls -la
   ```

   *Why?* Quick overview of the directory layout before searching.

![Listing inhere]({{ '/assets/images/bandit/level-5-to-6/inhere.jpg' | relative_url }})

2. **Search for the file matching all constraints**

   ```bash
   find .. -path '*/inhere/*' -type f -size 1033c -readable ! -executable -print
   # or, when already inside inhere:
   find . -type f -size 1033c -readable ! -executable -print
   ```

   *Why?* Returns the single file that meets all three conditions.

   *Example result (from my run):*

   ```
   inhere/maybehere07/.file2
   ```

3. **(Optional) Verify the type**

   ```bash
   file inhere/maybehere07/.file2
   ```

   *Why?* Confirms it’s human-readable (e.g., `ASCII text, with very long lines (1000)`).

![find output]({{ '/assets/images/bandit/level-5-to-6/file.jpg' | relative_url }})

4. **Print the password**

   ```bash
   cat inhere/maybehere07/.file2
   ```

   *Why?* Outputs the content — the password for the next level.

![cat target]({{ '/assets/images/bandit/level-5-to-6/succes.jpg' | relative_url }})

5. **Copy the password** (no extra spaces/newlines).

6. **Log into the next level (bandit6)**

   ```bash
   exit
   ssh bandit6@bandit.labs.overthewire.org -p 2220
   # paste the password you just found when prompted
   ```

## Password

> This is the password shown in my run; if yours differs, copy the one from your own terminal output.

```
HWasnPhtq9AVKe0dmk45nxy20cvUa6EG
```

**Troubleshooting**

* No results from `find`? → Ensure the **`c`** after `1033` (bytes), and include `! -executable`.
* Unsure which one is text? → `file <path>` should say `ASCII text` (possibly with extra notes about long lines).
* Permission issues → Make sure you’re the right user (`bandit5`) and searching under `inhere`.

---

**Congrats 🎉** You found the uniquely matching file and can now play as **bandit6**.

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

