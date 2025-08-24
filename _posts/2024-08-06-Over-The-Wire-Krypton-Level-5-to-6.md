---
layout: post-with-comments
title: "OverTheWire Krypton Level 5 → 6 tutorial!!"
permalink: /posts/overTheWire-Krypton-Level-5-to-6/
tags: [overthewire, krypton, crypto, vigenere, frequency, kasiski, walkthrough, ctf, linux, beginner]
description: "A step by step tutorial for OverTheWire Krypton Level 5 → 6!!"
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
    <a href="{{ '/posts/overTheWire-Krypton-Level-4-to-5/' | relative_url }}">← Previous: Level 4 → 5</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/krypton/krypton5.html" target="_blank" rel="noopener">Official (Level 5) ↗</a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Krypton-Level-6-to-7/' | relative_url }}">Next: Level 6 → 7 →</a>
  </div>
</nav>

## Login

Log in as **krypton5** using the password from Level 4 → 5.

```bash
ssh krypton5@krypton.labs.overthewire.org -p 2231
# password: CLEARTEXT
````

> Why? Each level is a different user. To solve 5 → 6, you must be `krypton5`.

## Task

![Task placeholder]({{ '/assets/images/krypton/level-5-to-6/task.jpg' | relative_url }})

This level is another **Vigenère cipher**, but this time the **key length is unknown**.
The password for the next level is in `krypton6`.

## A little bit of Theory

* In a Vigenère cipher:

  * If key length is unknown, you can use **Kasiski** or **Friedman** test to guess it.
  * Online solvers can do both automatically: detect key length **and** recover the key.
* Once the key is found, decryption is direct.

**Further reading:**

* <a href="https://en.wikipedia.org/wiki/Kasiski_examination" target="_blank" rel="noopener">Kasiski examination</a>
* <a href="https://www.dcode.fr/vigenere-cipher" target="_blank" rel="noopener">dCode Vigenère solver</a>

## Solution

1. **Explore the directory**

   ```bash
   cd /krypton/krypton5
   ls -la
   cat README
   ```

   Output (excerpt):

   ```
   Frequency analysis can break a known key length as well.
   Lets try one last polyalphabetic cipher, but this time the key length is unknown.
   ```

   ![inspect]({{ '/assets/images/krypton/level-5-to-6/inspect.jpg' | relative_url }})

2. **Get a long ciphertext and run automatic decryption**

   * Copy the content of `found1` (or `found2`) into **dCode – Vigenère solver**.
   * Select **Automatic Decryption** (no need to provide key length).
   * The solver proposes a key.

   Example result:

   ```
   Key: KEYLENGTH
   ```

   ![cat]({{ '/assets/images/krypton/level-5-to-6/cat.jpg' | relative_url }})
   ![key placeholder]({{ '/assets/images/krypton/level-5-to-6/key.jpg' | relative_url }})

3. **Decrypt the target file `krypton6`**

   * Content of `krypton6` is a short ciphertext: `BELOS Z`.
   * Back on dCode, enter `BELOS Z` as ciphertext.
   * Choose **KNOWING THE KEY/PASSWORD** and set it to `KEYLENGTH`.
   * Decrypt → result:

   ```
   RANDOM
   ```
   ![kryp6]({{ '/assets/images/krypton/level-5-to-6/kryp6.jpg' | relative_url }})
   ![decrypt]({{ '/assets/images/krypton/level-5-to-6/decrypt.jpg' | relative_url }})

4. **Log into the next level**

   ```bash
   ssh krypton6@krypton.labs.overthewire.org -p 2231
   # password: RANDOM
   ```

## Password

```
RANDOM
```

**Troubleshooting**

* **Wrong output** → Ensure you used **Automatic Decryption** on a long ciphertext (`found1`, `found2`, `found3`).
* **Multiple candidate keys** → Pick the one producing the most readable English.
* **Offline route** → Use `kasiski` or `freq analysis` manually to estimate key length, then crack each Caesar column.

---

## Copy-paste quick run

```bash
ssh krypton5@krypton.labs.overthewire.org -p 2231
# password: CLEARTEXT

cd /krypton/krypton5
# Paste found1 into dCode -> auto decrypt -> key KEYLENGTH
# Decrypt krypton6 with key KEYLENGTH -> RANDOM

ssh krypton6@krypton.labs.overthewire.org -p 2231
# password: RANDOM
```

---

**Congrats 🎉** You just broke a Vigenère cipher **without knowing the key length**, and advanced to **krypton6**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})


