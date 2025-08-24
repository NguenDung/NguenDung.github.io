---
layout: post-with-comments
title: "OverTheWire Leviathan Level 0 → 1 tutorial!!"
permalink: /posts/overTheWire-Leviathan-Level-0-to-1/
tags: [overthewire, leviathan, walkthrough, ctf, linux, beginner, suid, recon]
description: "A step by step tutorial for OverTheWire Leviathan Level 0 → 1!!"
---

<!-- Scoped styles: only affect this post -->

<style>
  .leviathan-nav{display:flex;align-items:center;gap:.75rem;margin:.5rem 0 1.25rem;border-top:1px solid var(--border-color,#3a3a3a);padding-top:.75rem}
  .leviathan-nav .nav-left,.leviathan-nav .nav-center,.leviathan-nav .nav-right{flex:1}
  .leviathan-nav .nav-left{text-align:left}
  .leviathan-nav .nav-center{text-align:center}
  .leviathan-nav .nav-right{text-align:right}
  .leviathan-nav a{display:inline-block;padding:.45rem .8rem;border:1px solid var(--border-color,#3a3a3a);border-radius:.6rem;text-decoration:none;line-height:1}
  .leviathan-nav a:hover{transform:translateY(-1px)}
  .leviathan-nav .disabled{opacity:.55}
  :root[data-theme='light'] .leviathan-nav a{border-color:rgba(0,0,0,.15)}
</style>

<nav class="leviathan-nav" aria-label="Leviathan level navigation">
  <div class="nav-left">
    <a href="{{ '/posts/overTheWire-Leviathan-Level-0/' | relative_url }}">← Previous: Level 0</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/leviathan/leviathan1.html" target="_blank" rel="noopener">Official (Level 1) ↗</a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Leviathan-Level-1-to-2/' | relative_url }}">Next: Level 1 → 2 →</a>
  </div>
</nav>

---

## Login

```bash
ssh leviathan0@leviathan.labs.overthewire.org -p 2223
# password: leviathan0
```

> Each level is a separate UNIX account. The goal is always to find the password for the **next level user**.

---

## Task

OTW description:

> “Your first job is to find the password for leviathan1 somewhere on the system.”

So this is a **recon challenge**: explore files, look for backups, and dig into hidden directories.

---

## A little bit of Theory

* **Backups** are often overlooked: if misconfigured, they may leak sensitive info.
* Recon basics:

  * `ls -la` → list files, including hidden ones.
  * `head file` → peek at large files without scrolling.
  * `grep pattern file` → search for useful keywords in big files.

**Further reading:**

* <a href="https://man7.org/linux/man-pages/man1/ls.1.html" target="_blank" rel="noopener">Linux man page — ls</a>
* <a href="https://www.gnu.org/software/coreutils/manual/html_node/head-invocation.html" target="_blank" rel="noopener">GNU coreutils — head</a>
* <a href="https://www.geeksforgeeks.org/techtips/grep-command-in-linux-with-examples/" target="_blank" rel="noopener">Grep basics</a>

---

## Solution

1. **List your home directory**

   ```bash
   ls -la
   ```

   *Why?* The `.backup` folder is owned by `leviathan1` but group-readable by `leviathan0`. That’s our entry point.

   Output (excerpt):

   ```
   drwxr-x---  2 leviathan1 leviathan0 4096 Aug 15 13:17 .backup
   ...
   ```

   ![ls output]({{ '/assets/images/leviathan/level-0-to-1/ls.jpg' | relative_url }})

   → Found a hidden folder: `.backup`.

---

2. **Inspect `.backup`**

   ```bash
   cd .backup
   ls -la
   ```

   *Why?* We find a big `bookmarks.html`. Manually reading \~130k lines isn’t smart.

   Output:

   ```
   -rw-r----- 1 leviathan1 leviathan0 133259 Aug 15 13:17 bookmarks.html
   ```

   ![backup folder]({{ '/assets/images/leviathan/level-0-to-1/backup.jpg' | relative_url }})

---

3. **Peek inside**

   Shows Netscape bookmark format. So this is just a long list of saved URLs.

   ```bash
   head bookmarks.html
   ```

   *Why?* Understanding file type helps decide search strategy.

   ![head output]({{ '/assets/images/leviathan/level-0-to-1/head.jpg' | relative_url }})

---

4. **Search for “leviathan”**

   ```bash
   grep leviathan bookmarks.html
   ```

   *Why?* Searching for “leviathan” in bookmarks is logical — the file likely references the wargame and may leak a password.

   Output:

   ```
   <DT><A HREF="http://leviathan.labs.overthewire.org/passwordus.html | This will be fixed later, the password for leviathan1 is 3QJ3TgzHDq" ...
   ```

   ![grep output]({{ '/assets/images/leviathan/level-0-to-1/grep.jpg' | relative_url }})

   Boom 💥 Found the line with the password for **leviathan1**!

---

## Password

```
3QJ3TgzHDq
```

---

## Troubleshooting

* **Didn’t find `.backup`?** → Ensure you ran `ls -la` (plain `ls` won’t show hidden dirs).
* **File too big to read manually?** → Use `head`, `tail`, `grep`.
* **`grep` returns nothing?** → Try broader keywords like `pass`, `password`, or `leviathan`.

---

## Copy-paste quick run

```bash
ssh leviathan0@leviathan.labs.overthewire.org -p 2223
# password: leviathan0

ls -la
cd .backup
grep leviathan bookmarks.html
# → password: 3QJ3TgzHDq

ssh leviathan1@leviathan.labs.overthewire.org -p 2223
# password: 3QJ3TgzHDq
```

---

🎉 Congrats — you completed Leviathan **Level 0 → 1**.
Lesson: **hidden backups = easy loot** if permissions are misconfigured.

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

