---
date: 2023-08-02 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Krypton Level 1 → 2 tutorial!!"
permalink: /posts/overTheWire-Krypton-Level-1-to-2/
tags: [overthewire, krypton, crypto, caesar, rot13, walkthrough, ctf, linux, beginner]
description: "A step by step tutorial for OverTheWire Krypton Level 1 → 2!!"
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
    <a href="{{ '/posts/overTheWire-Krypton-Level-0-to-1/' | relative_url }}">← Previous: Level 0 → 1</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/krypton/krypton1.html" target="_blank" rel="noopener">Official (Level 1) ↗</a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Krypton-Level-2-to-3/' | relative_url }}">Next: Level 2 → 3 →</a>
  </div>
</nav>

## Login

Log in as **krypton1** using the password from Level 0 → 1.

```bash
ssh krypton1@krypton.labs.overthewire.org -p 2231
# password: KRYPTONISGREAT
````

> Why? Each Krypton level is a separate UNIX user. To solve 1 → 2, you must be the `krypton1` user.

## Task

![Task placeholder]({{ '/assets/images/krypton/level-1-to-2/task.jpg' | relative_url }})

The password for level 2 is in the file `krypton2`.
It is encrypted using a simple rotation cipher (**ROT13**) and grouped into blocks of 5 letters to obfuscate word boundaries.

## A little bit of Theory

* **ROT13** is a Caesar cipher with shift = 13.
* It is symmetric: `ROT13(ROT13(text)) = text`.
* Common in forums to obfuscate spoilers or answers.

**Further reading:**

* <a href="https://en.wikipedia.org/wiki/ROT13" target="_blank" rel="noopener">ROT13</a>
* <a href="https://en.wikipedia.org/wiki/Caesar_cipher" target="_blank" rel="noopener">Caesar Cipher</a>

## Solution

1. **Navigate into the directory**

   ```bash
   cd /krypton/krypton1
   ls
   cat README
   ```

   *Why?* Reading `README` confirms the encryption method (ROT13) and shows where the file containing the password (`krypton2`) is located.

   ![inspect placeholder]({{ '/assets/images/krypton/level-1-to-2/inspect.jpg' | relative_url }})

   → Instructions confirm the cipher is **ROT13**.

2. **Check the file `krypton2`**

   ```bash
   cat krypton2
   ```

   *Why?* Inspecting the file reveals the actual ciphertext, grouped into blocks of 5 characters for obfuscation.

   Example content:

   ```
   YRIRY GJB CNFFJBEQ EBGGRA
   ```

   ![cipher placeholder]({{ '/assets/images/krypton/level-1-to-2/cipher.jpg' | relative_url }})

3. **Decrypt using `tr`**

   ```bash
   cat krypton2 | tr 'A-Za-z' 'N-ZA-Mn-za-m'
   ```

   *Why?* The `tr` command maps letters 13 positions forward/backward, effectively performing ROT13 decryption.

   → Result:

   ```
   LEVEL TWO PASSWORD ROTTEN
   ```

   ![decrypt placeholder]({{ '/assets/images/krypton/level-1-to-2/decrypt.jpg' | relative_url }})

4. **Log into the next level**

   ```bash
   ssh krypton2@krypton.labs.overthewire.org -p 2231
   # password: ROTTEN
   ```

## Password

```
ROTTEN
```

**Troubleshooting**

* Wrong result? → Make sure you used the correct `tr` command (upper & lower case included).
* Extra spaces/newlines → Carefully copy only the password.
* Still confused? → Try an online tool like <a href="https://cryptii.com/" target="_blank" rel="noopener">Cryptii ROT13</a>.

---

## Copy-paste quick run

```bash
ssh krypton1@krypton.labs.overthewire.org -p 2231
# password: KRYPTONISGREAT

cd /krypton/krypton1
cat krypton2 | tr 'A-Za-z' 'N-ZA-Mn-za-m'
# → LEVEL TWO PASSWORD ROTTEN

ssh krypton2@krypton.labs.overthewire.org -p 2231
# password: ROTTEN
```

---

**Congrats 🎉** You solved Krypton **Level 1 → 2** using ROT13 — welcome to **krypton2**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

