---
date: 2023-08-04 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Krypton Level 3 → 4 tutorial!!"
permalink: /posts/overTheWire-Krypton-Level-3-to-4/
tags: [overthewire, krypton, crypto, substitution, frequency-analysis, walkthrough, ctf, linux, beginner]
description: "A step by step tutorial for OverTheWire Krypton Level 3 → 4!!"
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
    <a href="{{ '/posts/overTheWire-Krypton-Level-2-to-3/' | relative_url }}">← Previous: Level 2 → 3</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/krypton/krypton3.html" target="_blank" rel="noopener">Official (Level 3) ↗</a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Krypton-Level-4-to-5/' | relative_url }}">Next: Level 4 → 5 →</a>
  </div>
</nav>

## Login

Log in as **krypton3** using the password from Level 2 → 3.

```bash
ssh krypton3@krypton.labs.overthewire.org -p 2231
# password: CAESARISEASY
````

> Why? Each Krypton level is a separate UNIX user. To solve 3 → 4, you must be `krypton3`.

## Task

![Task placeholder]({{ '/assets/images/krypton/level-3-to-4/task.jpg' | relative_url }})

The password for level 4 is stored in the file `krypton4`.
You also have three ciphertext files (`found1`, `found2`, `found3`) encrypted with the **same substitution key**.
This allows you to perform **frequency analysis**.

## A little bit of Theory

* **Substitution cipher** replaces each plaintext letter with another letter consistently.
* When the **same key** is reused across large texts, patterns emerge.
* In English, the most frequent letter is usually **E**, followed by **T, A, O, I, N...**
* By comparing ciphertext frequency with expected English frequency, you can build a mapping.

**Further reading:**

* <a href="https://en.wikipedia.org/wiki/Frequency_analysis" target="_blank" rel="noopener">Frequency analysis</a>

## Solution

1. **Explore the directory**

   ```bash
   cd /krypton/krypton3
   ls -la
   ```

   *Why?* Confirm the presence of `found1`, `found2`, `found3`, `krypton4`, and hints.

   ![inspect placeholder]({{ '/assets/images/krypton/level-3-to-4/inspect.jpg' | relative_url }})

2. **Count character frequencies**

   Method A (simple + stable):

   ```bash
   cat found1 found2 found3 | tr -cd 'A-Z' | fold -w1 | sort | uniq -c | sort -nr
   ```

   Method B (loop style):

   ```bash
   for i in {A..Z}; do
     cnt=$(cat found1 found2 found3 | tr -cd "$i" | wc -c)
     printf "%5d %s\n" "$cnt" "$i"
   done | sort -nr
   ```

   *Why?* This reveals the **distribution of letters**. The most frequent ciphertext letter is a candidate for mapping to **E**.

   ![freq placeholder]({{ '/assets/images/krypton/level-3-to-4/freq.jpg' | relative_url }})

3. **Build a substitution mapping**

   Example output:

   ```
   456 S
   340 Q
   301 J
   257 U
   ...
   ```

   → Guess `S ≈ E`, `Q ≈ T`, `J ≈ A`, … and adjust based on context.
   Use English frequency order: **ETAOINSRHDLU...**

4. **Test mapping against `krypton4`**

   ```bash
   cat krypton4 | tr 'SQJUBNGCDZVWMYTXKELAFIORHP' 'EATSORNIHCLDUPYFWGMBKVXQJZ'
   ```

   Output:

   ```
   WELL DONE THE LEVEL FOUR PASSWORD IS BRUTE
   ```

   ![decrypt placeholder]({{ '/assets/images/krypton/level-3-to-4/decrypt.jpg' | relative_url }})

5. **Log into the next level**

   ```bash
   ssh krypton4@krypton.labs.overthewire.org -p 2231
   # password: BRUTE
   ```

## Password

```
BRUTE
```

**Troubleshooting**

* If the output is garbled → tweak the frequency mapping order.
* Make sure to include all 26 letters in the `tr` mapping.
* `/tmp` cleanup issues do not apply here — all files are in `/krypton/krypton3`.

---

## Copy-paste quick run

```bash
ssh krypton3@krypton.labs.overthewire.org -p 2231
# password: CAESARISEASY

cd /krypton/krypton3
cat found1 found2 found3 | tr -cd 'A-Z' | fold -w1 | sort | uniq -c | sort -nr
# build mapping from frequency
cat krypton4 | tr 'SQJUBNGCDZVWMYTXKELAFIORHP' 'EATSORNIHCLDUPYFWGMBKVXQJZ'
# → WELL DONE THE LEVEL FOUR PASSWORD IS BRUTE

ssh krypton4@krypton.labs.overthewire.org -p 2231
# password: BRUTE
```

---

**Congrats 🎉** You broke a monoalphabetic substitution with frequency analysis — welcome to **krypton4**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

