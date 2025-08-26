---
date: 2023-08-01 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Krypton Level 0 → 1 tutorial!!"
permalink: /posts/Over-The-Wire-Krypton-Level-0-to-1/
tags: [overthewire, krypton, crypto, base64, walkthrough, ctf, linux, beginner]
description: "A step by step tutorial for OverTheWire Krypton Level 0 → 1!!"
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

<nav class="bandit-nav" aria-label="Krypton level navigation">
  <div class="nav-left">
    <a class="disabled">← Previous</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/krypton/krypton0.html" target="_blank" rel="noopener">Official Level 0 ↗</a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Krypton-Level-1-to-2/' | relative_url }}">Next: Level 1 → 2 →</a>
  </div>
</nav>

## Task

![Task placeholder]({{ '/assets/images/krypton/level-0-to-1/task.jpg' | relative_url }})

The challenge text gives you a **Base64-encoded string**:

```
S1JZUFRPTklTR1JFQVQ=
```

Your job is to decode this to get the password for **krypton1**.

## A little bit of Theory

* **Base64** is not encryption, just an encoding scheme to represent binary data as ASCII.
* Its alphabet is `A–Z, a–z, 0–9, +, /` with `=` padding.
* On Linux/macOS, you can decode Base64 directly from the shell.

**Further reading:**

* <a href="https://en.wikipedia.org/wiki/Base64" target="_blank" rel="noopener">Base64 on Wikipedia</a>

## Solution

2. **Decode with base64**

   ```bash
   echo S1JZUFRPTklTR1JFQVQ= | base64 -d
   ```

   Output:

   ```
   KRYPTONISGREAT
   ```

   ![decode placeholder]({{ '/assets/images/krypton/level-0-to-1/decode.jpg' | relative_url }})

3. **Log into the next level**

   ```bash
   ssh krypton1@krypton.labs.overthewire.org -p 2231
   # password: KRYPTONISGREAT
   ```

## Password

```
KRYPTONISGREAT
```

**Troubleshooting**

* **`invalid option`** → On macOS, use `base64 -D` instead of `-d`.
* **Output looks wrong** → Ensure you copied the string without extra spaces/newlines.
* **`Permission denied`** → Paste the decoded string exactly as password.

---

**Congrats 🎉** You solved **Krypton Level 0 → 1** by decoding a Base64 string — welcome to **krypton1**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

