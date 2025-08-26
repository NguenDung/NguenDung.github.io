---
date: 2023-01-13 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Bandit Level 10 → 11 tutorial!!"
permalink: /posts/Over-The-Wire-Bandit-Level-10-to-11/
tags: [overthewire, bandit, walkthrough, ctf, linux, beginner]
description: "A step by step tutorial for OverTheWire Bandit Level 10 → 11!!"
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
    <a href="{{ '/posts/overTheWire-Bandit-Level-9-to-10/' | relative_url }}">← Previous: Level 9 → 10</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/bandit/bandit11.html" target="_blank" rel="noopener">
      Official (Level 11) ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Bandit-Level-11-to-12/' | relative_url }}">Next: Level 11 → 12 →</a>
  </div>
</nav>

## Login

Log in as **bandit10** using the password you just obtained from Level 9 → 10.

```bash
ssh bandit10@bandit.labs.overthewire.org -p 2220
# password: FGUW5ilLVJrxX9kMYMmlN4MgbpfMiqey
````

> Why? Each Bandit level is a separate UNIX user. To solve 10 → 11, you must be the `bandit10` user.

## Task

![Task]({{ '/assets/images/bandit/level-10-to-11/task.jpg' | relative_url }})

The password for the next level is stored in **`data.txt`**, which contains **Base64-encoded** data.

## A little bit of Theory

* **Base64** is an encoding scheme (not encryption) that maps binary to 64 printable characters.
* On Linux, use the `base64` utility:

  * **Decode**: `base64 -d FILE`
  * **Encode**: `base64 FILE`
* Base64 output often ends with **`=` padding** to reach a multiple of 4 characters.

**Further reading:**

* <a href="https://en.wikipedia.org/wiki/Base64" target="_blank" rel="noopener">Base64 — Wikipedia</a>
* <a href="https://www.gnu.org/software/coreutils/manual/html_node/base64-invocation.html" target="_blank" rel="noopener">GNU coreutils: `base64`</a>

## Solution

1. **Confirm the file is present**

   ```bash
   ls -l
   ```

   *Why?* Sanity check that `data.txt` exists and you’re in the right place.

![ls data.txt]({{ '/assets/images/bandit/level-10-to-11/file.jpg' | relative_url }})

2. **(Optional) Peek at the data — looks Base64**

   ```bash
   head -c 80 data.txt
   ```

   *Why?* You’ll typically see A–Z, a–z, 0–9, `+`, `/`, and maybe `=` padding.

![sample]({{ '/assets/images/bandit/level-10-to-11/head.jpg' | relative_url }})

3. **Decode the file with `base64 -d`**

   ```bash
   base64 -d data.txt
   ```

   *Why?* Decodes the Base64 text back to the original message containing the password.

![decode]({{ '/assets/images/bandit/level-10-to-11/succes.jpg' | relative_url }})

4. **Copy the password** (no extra spaces/newlines).

5. **Log into the next level (bandit11)**

   ```bash
   exit
   ssh bandit11@bandit.labs.overthewire.org -p 2220
   # paste the password you just found when prompted
   ```

## Password

> This is the password shown in my run; if yours differs, copy the one from your own terminal output.

```
dtR173fZKb0RRsDFSGsg2RWnpNVj3qRr
```

**Troubleshooting**

* `base64: invalid input` → File may have wrapped lines oddly; try `base64 --ignore-garbage -d data.txt`.
* Empty/garbled output? → Ensure you didn’t include shell prompt text when copying; re-run `base64 -d data.txt`.
* Still unsure it’s Base64? → `file data.txt` may show `ASCII text`; Base64 isn’t a “format”, just text—decoding is the test.

---

**Congrats 🎉** You decoded the Base64 message and can now play as **bandit11**.

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

