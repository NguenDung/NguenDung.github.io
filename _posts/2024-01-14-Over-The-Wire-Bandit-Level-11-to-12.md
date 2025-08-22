---
layout: post-with-comments
title: "OverTheWire Bandit Level 11 → 12 tutorial!!"
permalink: /posts/overTheWire-Bandit-Level-11-to-12/
tags: [overthewire, bandit, walkthrough, ctf, linux, beginner]
description: "A step by step tutorial for OverTheWire Bandit Level 11 → 12!!"
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
    <a href="{{ '/posts/overTheWire-Bandit-Level-10-to-11/' | relative_url }}">← Previous: Level 10 → 11</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/bandit/bandit12.html" target="_blank" rel="noopener">Official (Level 12) ↗</a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Bandit-Level-12-to-13/' | relative_url }}">Next: Level 12 → 13 →</a>
  </div>
</nav>

## Login

Log in as **bandit11** using the password you just obtained from Level 10 → 11.

```bash
ssh bandit11@bandit.labs.overthewire.org -p 2220
# password: dtR173fZKb0RRsDFSGsg2RWnpNVj3qRr
```

> Why? Each Bandit level is a separate UNIX user. To solve 11 → 12, you must be the `bandit11` user.

## Task

![Task]({{ '/assets/images/bandit/level-11-to-12/task.jpg' | relative_url }})

The password for the next level is stored in **`data.txt`**, where all letters (a–z, A–Z) have been rotated by **13** positions (**ROT13**).

## A little bit of Theory

* **ROT13** is a simple substitution cipher that rotates letters by 13 places. Applying ROT13 **twice** returns the original text.
* Decode ROT13 with **`tr`**:

  ```bash
  tr 'A-Za-z' 'N-ZA-Mn-za-m'
  ```

  The first character set is mapped to the second one, performing the rotation.
* Combine with pipes to transform file contents:

  ```bash
  cat data.txt | tr 'A-Za-z' 'N-ZA-Mn-za-m'
  ```

**Further reading:**

* <a href="https://en.wikipedia.org/wiki/ROT13" target="_blank" rel="noopener">ROT13 (Wikipedia)</a>
* <a href="https://man7.org/linux/man-pages/man1/tr.1.html" target="_blank" rel="noopener">`tr` manual</a>

## Solution 

1. **Check the file is present**

   ```bash
   ls -l
   ```

   *Why?* Confirms `data.txt` exists and you’re in the right directory.

![ls data.txt]({{ '/assets/images/bandit/level-11-to-12/file.jpg' | relative_url }})

2. **Decode with `tr`**

   ```bash
   cat data.txt | tr 'A-Za-z' 'N-ZA-Mn-za-m'
   ```

   *Why?* Maps each letter to the one 13 places away, revealing the plaintext containing the password.

![rot13 decode]({{ '/assets/images/bandit/level-11-to-12/succes.jpg' | relative_url }})

3. **Copy the password** (no trailing spaces/newlines).

4. **Log into the next level (bandit12)**

   ```bash
   exit
   ssh bandit12@bandit.labs.overthewire.org -p 2220
   # paste the password you just found when prompted
   ```

## Password

> This is the password shown in my run; if yours differs, copy the one from your own terminal output.

```
7x16WNeHIi5YkIhWsfFIqoognUTyj9Q4
```

**Troubleshooting**

* Garbled output? → Ensure you used **single quotes** and didn’t swap the two character sets.

* Some `tr` versions prefer two calls:

  ```bash
  cat data.txt | tr 'A-Z' 'N-ZA-M' | tr 'a-z' 'n-za-m'
  ```

* Nothing prints? → Verify `data.txt` isn’t empty and you’re in `/home/bandit11`.

---

**Congrats 🎉** You decoded the ROT13 text and can now play as **bandit12**.

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})
