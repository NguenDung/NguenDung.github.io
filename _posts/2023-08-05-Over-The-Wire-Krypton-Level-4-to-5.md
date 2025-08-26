---
date: 2023-08-05 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Krypton Level 4 → 5 tutorial!!"
permalink: /posts/Over-The-Wire-Krypton-Level-4-to-5/
tags: [overthewire, krypton, crypto, vigenere, keylength, frequency, walkthrough, ctf, linux, beginner]
description: "A step by step tutorial for OverTheWire Krypton Level 4 → 5!!"
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
    <a href="{{ '/posts/overTheWire-Krypton-Level-3-to-4/' | relative_url }}">← Previous: Level 3 → 4</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/krypton/krypton4.html" target="_blank" rel="noopener">Official (Level 4) ↗</a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Krypton-Level-5-to-6/' | relative_url }}">Next: Level 5 → 6 →</a>
  </div>
</nav>

## Login

Log in as **krypton4** using the password from Level 3 → 4.

```bash
ssh krypton4@krypton.labs.overthewire.org -p 2231
# password: BRUTE
````

> Why? Each level is a separate UNIX user. To solve 4 → 5, you must be `krypton4`.

## Task

![Task placeholder]({{ '/assets/images/krypton/level-4-to-5/task.jpg' | relative_url }})

This level uses a **Vigenère cipher**. You have two longer English ciphertexts and you **know the key length is 6**.
The password for level 5 is stored in `krypton5`, encrypted with the **same 6-letter key**.

## A little bit of Theory

* **Vigenère** = repeating-key Caesar: each position is shifted by the corresponding letter of the key.
* Knowing the **key length** lets you segment the text into 6 columns; each column behaves like a **Caesar** shift and can be cracked with frequency analysis (Kasiski / Friedman ideas).
* Once the key is known, decryption is straightforward.

**Further reading:**

* <a href="https://en.wikipedia.org/wiki/Vigen%C3%A8re_cipher" target="_blank" rel="noopener">Vigenère cipher</a>
* <a href="https://www.dcode.fr/vigenere-cipher" target="_blank" rel="noopener">dCode Vigenère solver</a>

## Solution

1. **Inspect the level directory**

   ```bash
   cd /krypton/krypton4
   ls -la
   ```

   You’ll see:

   ```
   -rw-r----- 1 krypton4 krypton4 1740 found1
   -rw-r----- 1 krypton4 krypton4 2943 found2
   -rw-r----- 1 krypton4 krypton4  287 HINT
   -rw-r----- 1 krypton4 krypton4   10 krypton5
   -rw-r----- 1 krypton4 krypton4 1385 README
   ```

   ![inspect placeholder]({{ '/assets/images/krypton/level-4-to-5/inspect.jpg' | relative_url }})

2. **Read the README**

   ```bash
   cat README
   ```

   Output (truncated):

   ```
   This level is a Vigenère Cipher. You have intercepted two longer, english
   language messages. You also have a key piece of information. You know the key length!
   For this exercise, the key length is 6. The password to level five is in the usual place...
   ```

   *Why?* The README explicitly states the key length = 6. That’s the crucial clue.

   ![readme]({{ '/assets/images/krypton/level-4-to-5/readme.jpg' | relative_url }})

3. **Preview one of the ciphertexts**

   ```bash
   cat found1 | head
   ```

   ```
   YYTCS JZIB AGY...
   ```

   These are long ciphertexts used to deduce the key.

   ![cat]({{ '/assets/images/krypton/level-4-to-5/cat.jpg' | relative_url }})

4. **Recover the key (length = 6) from a long ciphertext**

   Use an online Vigenère breaker (for convenience):

   * Open **dCode – Vigenère cipher**.
   * Paste the content of **`found1`** (or `found2`) into **VIGENERE CIPHERTEXT**.
   * Choose **“KNOWING THE KEY-LENGTH/SIZE”** and set it to **6**.
   * Click **Decrypt** and note the proposed key.

   Example result:

   ```
   Key: FREKEY
   ```

   *Why?* Longer texts give robust frequency statistics per column → the solver can infer the 6 Caesar shifts (i.e., the key).

   ![config]({{ '/assets/images/krypton/level-4-to-5/config.jpg' | relative_url }})
   ![key placeholder]({{ '/assets/images/krypton/level-4-to-5/key.jpg' | relative_url }})

5. **Decrypt `krypton5` with the recovered key**

   ```bash
   cat krypton5
   # HCIKV RJ0X
   ```

   * Still on dCode, paste the content of **`krypton5`**.
   * Choose **“KNOWING THE KEY/PASSWORD”** and enter the recovered key: `FREKEY`.
   * Decrypt → Result:

   ```
   CLEARTEXT
   ```

   *Why?* `krypton5` is encrypted with the same key. Once the key is known, the short ciphertext decrypts immediately.
   
   ![kryp5]({{ '/assets/images/krypton/level-4-to-5/kryp5.jpg' | relative_url }})
   ![setin]({{ '/assets/images/krypton/level-4-to-5/setin.jpg' | relative_url }})
   ![decrypt placeholder]({{ '/assets/images/krypton/level-4-to-5/decrypt.jpg' | relative_url }})

6. **Log into the next level**

   ```bash
   ssh krypton5@krypton.labs.overthewire.org -p 2231
   # password: CLEARTEXT
   ```

## Password

```
CLEARTEXT
```

**Troubleshooting**

* **Key looks wrong / gibberish output** → Try the other long ciphertext (`found2`) or ensure you set **key length = 6** when cracking.
* **Multiple keys suggested** → Prefer the one that makes clean English for both `found1` and `found2`.
* **Manual route (no web)** → Segment the ciphertext into 6 columns and run frequency analysis per column to derive 6 Caesar shifts, then assemble the key.

---

## Copy-paste quick run

```bash
ssh krypton4@krypton.labs.overthewire.org -p 2231
# password: BRUTE

cd /krypton/krypton4
cat README
cat found1 | head
# → copy text into dCode, set key length = 6 → get FREKEY
# Decrypt krypton5 with FREKEY → CLEARTEXT

ssh krypton5@krypton.labs.overthewire.org -p 2231
# password: CLEARTEXT
```

---

**Congrats 🎉** You used the known key length to break a Vigenère cipher and recover the next password — welcome to **krypton5**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

