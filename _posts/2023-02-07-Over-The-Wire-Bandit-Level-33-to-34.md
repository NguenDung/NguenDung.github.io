---
date: 2023-02-07 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Bandit Level 33 → 34 tutorial!!"
permalink: /posts/overTheWire-Bandit-Level-33-to-34/
tags: [overthewire, bandit, walkthrough, ctf, linux, beginner]
description: "A step by step tutorial for OverTheWire Bandit Level 33 → 34!!"
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
    <a href="{{ '/posts/overTheWire-Bandit-Level-32-to-33/' | relative_url }}">← Previous: Level 32 → 33</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/bandit/bandit34.html" target="_blank" rel="noopener">Official (Level 34) ↗</a>
  </div>

  <div class="nav-right">
    <span class="disabled">No more Bandit levels →</span>
  </div>
</nav>

## Login

Log in as **bandit33** using the password you obtained from Level 32 → 33.

```bash
ssh bandit33@bandit.labs.overthewire.org -p 2220
# password: tQdtbs5D5i2vJwkO8mEyYEyTL8izoeJ0
```

> Why? Each Bandit level is a separate UNIX user. To “solve” 33 → 34 you just need to log in as `bandit33`.

## Task

![Task placeholder]({{ '/assets/images/bandit/level-33-to-34/task.jpg' | relative_url }})

There is actually **no Level 34**. This is the **final level** of Bandit. Read the message left for you in the home directory.

## A little bit of Theory

* Some CTF tracks end with a **final note** instead of another puzzle.
* On Bandit, the last user’s home folder contains a **README** telling you you’ve reached the end and pointing to other wargames.

**Further reading:**

* <a href="https://overthewire.org/wargames/natas/" target="_blank" rel="noopener">Natas (web security) </a>
* <a href="https://overthewire.org/wargames/krypton/" target="_blank" rel="noopener">Krypton (cryptography) </a>
* <a href="https://overthewire.org/wargames/narnia/" target="_blank" rel="noopener">Narnia (binary exploitation) </a>
* <a href="https://overthewire.org/wargames/leviathan/" target="_blank" rel="noopener">Leviathan (basic Linux privesc) </a>

## Solution

1. **List the home directory**

   ```bash
   ls -la
   ```

   *Why?* To see what files are present (there should be a `README`).

2. **Read the final note**

   ```bash
   cat README
   ```

   *Why?* This prints the **congratulations/farewell** message and links you to other wargames.

## Password

There is **no password** for a next level; **Bandit ends here**. 🎉

---

**Troubleshooting**

* **`Permission denied` on login** → Double-check you’re using the **bandit33** password from Level 32 → 33.
* **No README?** → Make sure you are in **`/home/bandit33`** (`pwd`) after logging in.

---

**Congrats 🎉** You finished **all Bandit levels**! If you enjoyed this series, keep the momentum going with the games above.

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})
