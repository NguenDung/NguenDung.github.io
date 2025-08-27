---
date: 2023-08-03 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Krypton Level 2 → 3 tutorial!!"
permalink: /posts/overTheWire-Krypton-Level-2-to-3/
tags: [overthewire, krypton, crypto, caesar, setuid, walkthrough, ctf, linux, beginner]
description: "A step by step tutorial for OverTheWire Krypton Level 2 → 3!!"
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
    <a href="{{ '/posts/overTheWire-Krypton-Level-1-to-2/' | relative_url }}">← Previous: Level 1 → 2</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/krypton/krypton2.html" target="_blank" rel="noopener">Official (Level 2) ↗</a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Krypton-Level-3-to-4/' | relative_url }}">Next: Level 3 → 4 →</a>
  </div>
</nav>

## Login

Log in as **krypton2** using the password from Level 1 → 2.

```bash
ssh krypton2@krypton.labs.overthewire.org -p 2231
# password: ROTTEN
````

> Why? Each level is a different UNIX user. To solve 2 → 3, you must be `krypton2`.

## Task

![Task placeholder]({{ '/assets/images/krypton/level-2-to-3/task.jpg' | relative_url }})

This level uses a classic **Caesar cipher**. The setuid helper `encrypt` (owned by `krypton3`) looks for a **keyfile** in your **current working directory**. Create a workspace in `/tmp`, link the keyfile there, and make sure **krypton3** can access your directory.

## A little bit of Theory

* A **Caesar** (shift) cipher rotates letters by a fixed key `k` (A→B when `k=1`, etc.).
* If you discover one **plaintext–ciphertext** pair, you can compute `k`.
* To *decrypt* when the *encryption* key is `k`, use `26 - k` (mod 26).

**Further reading:**

* <a href="https://en.wikipedia.org/wiki/Caesar_cipher" target="_blank" rel="noopener">Caesar cipher</a>

## Solution

1. **Explore the level directory**

   ```bash
   cd /krypton/krypton2
   ls -la
   ```

   *Why?* Verify the presence of the setuid **`encrypt`** binary, the **keyfile**, and the sample ciphertext file.

   You should see something like:

   ```
   -rwsr-x--- 1 krypton3 krypton2 9032 encrypt
   -rw-r----- 1 krypton3 krypton3   27 keyfile.dat
   -rw-r----- 1 krypton2 krypton2   13 krypton3
   ```

   ![inspect placeholder]({{ '/assets/images/krypton/level-2-to-3/inspect.jpg' | relative_url }})

2. **Prepare a writable, world-accessible working directory under `/tmp`**

   ```bash
   TMPDIR=$(mktemp -d)
   cd "$TMPDIR"
   ln -s /krypton/krypton2/keyfile.dat
   chmod 777 .
   ```

   *Why?* `encrypt` runs as **krypton3** and must be able to **cd** into your working dir and read the keyfile via the **symlink**.

3. **Derive the shift key using a known plaintext**

   ```bash
   echo "AAAAA" > encrypt.txt
   /krypton/krypton2/encrypt encrypt.txt
   ls -la
   cat ciphertext
   # → MMMMM
   ```

   *Why?* Encrypting `'AAAAA'` lets you measure the shift directly: **A → M** means the encryption key is **12** (A=1 → M=13 ⇒ +12).

   ![encrypt placeholder]({{ '/assets/images/krypton/level-2-to-3/encrypt.jpg' | relative_url }})

4. **Compute the decryption key and decode the target file**

   * Decryption key = `26 - 12 = 14`.
   * A shift of 14 corresponds to `tr 'A-Za-z' 'O-ZA-No-za-n'`.

   ```bash
   cd /krypton/krypton2
   cat krypton3 | tr 'A-Za-z' 'O-ZA-No-za-n'
   ```

   *Why?* The `tr` mapping rotates letters by **14** positions (the inverse of the encryption key), yielding the plaintext password.

   ![decrypt placeholder]({{ '/assets/images/krypton/level-2-to-3/decrypt.jpg' | relative_url }})

5. **Log into the next level**

   ```bash
   ssh krypton3@krypton.labs.overthewire.org -p 2231
   # password: CAESARISEASY
   ```

## Password

```
CAESARISEASY
```

**Troubleshooting**

* **`Permission denied` / `No such file`** → Ensure you ran `chmod 777 .` in `/tmp/...` and created the **symlink** `keyfile.dat` in the *same* working directory where you run `encrypt`.
* **Empty / wrong `ciphertext`** → Re-run `encrypt` from the directory containing both `encrypt.txt` and the symlinked `keyfile.dat`.
* **Wrong plaintext** → Double‑check the `tr` mapping uses **O-ZA-N** (shift 14), not ROT13.
* **Directory cleaned** → `/tmp` may be wiped; just re‑create with `mktemp -d`.

---

## Copy-paste quick run

```bash
ssh krypton2@krypton.labs.overthewire.org -p 2231
# password: ROTTEN

cd /krypton/krypton2
TMPDIR=$(mktemp -d); cd "$TMPDIR"
ln -s /krypton/krypton2/keyfile.dat
chmod 777 .
echo AAAAA > encrypt.txt
/krypton/krypton2/encrypt encrypt.txt
cat ciphertext   # expect MMMMM  → encryption key = 12
cd /krypton/krypton2
cat krypton3 | tr 'A-Za-z' 'O-ZA-No-za-n'   # decrypt with shift 14
# copy the output (password)

ssh krypton3@krypton.labs.overthewire.org -p 2231
# paste password
```

---

**Congrats 🎉** You reversed a setuid Caesar workflow and recovered the password — welcome to **krypton3**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

