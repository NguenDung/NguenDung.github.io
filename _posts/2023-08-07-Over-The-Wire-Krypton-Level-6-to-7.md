---
date: 2023-08-07 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Krypton Level 6 → 7 tutorial!!"
permalink: /posts/overTheWire-Krypton-Level-6-to-7/
tags: [overthewire, krypton, crypto, streamcipher, lfsr, walkthrough, ctf, linux, beginner]
description: "A step by step tutorial for OverTheWire Krypton Level 6 → 7!!"
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
    <a href="{{ '/posts/overTheWire-Krypton-Level-5-to-6/' | relative_url }}">← Previous: Level 5 → 6</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/krypton/krypton6.html" target="_blank" rel="noopener">Official (Level 6) ↗</a>
  </div>

  <div class="nav-right">
    <span class="disabled">No more Krypton level</span>
  </div>
</nav>

## Login

```bash
ssh krypton6@krypton.labs.overthewire.org -p 2231
# password: RANDOM
````

> Why? Each level uses a different UNIX account. The password is passed forward from Level 5 → 6.

## Task

![Task placeholder]({{ '/assets/images/krypton/level-6-to-7/task.jpg' | relative_url }})

This level introduces a **stream cipher**.
You are given an `encrypt6` binary that uses a hidden `keyfile.dat` plus a weak “random” generator.
Your target is `/krypton/krypton6/krypton7`, which is encrypted with the same mechanism.

Hints in the level suggest:

* The random generator is **periodic** (8‑bit LFSR).
* You can run chosen‑plaintext attacks (`encrypt6` lets you encrypt any file).
* With the pattern, you can replicate the keystream and decrypt the password.

---

## Solution

### 1. Setup workspace

```bash
cd /tmp
mkdir -p kr6 && cd kr6
ln -s /krypton/krypton6/keyfile.dat .
```

*Why?* Working in `/tmp` is clean and safe; the symlink lets `encrypt6` read the original keyfile.

![setup placeholder]({{ '/assets/images/krypton/level-6-to-7/setup.jpg' | relative_url }})

---

### 2. Create a file of `'A'`s and encrypt (to leak the keystream)

```bash
python3 - <<'PY'
open('a.txt','w').write('A'*50)
PY

/krypton/krypton6/encrypt6 a.txt outA.txt
cat outA.txt
```

You should see a repeating keystream block (\~30 chars):

```
EICTDGYIYZKTHNSIRFXYCPFUEOCKRNEICTDGYIYZKTHNSIRFXY...
```

*Why?* With plaintext all `'A'`, ciphertext directly equals the keystream for each position.

![A-experiment]({{ '/assets/images/krypton/level-6-to-7/a_experiment.jpg' | relative_url }})

---

### 3. (Optional) Confirm with `'B'`s

```bash
python3 - <<'PY'
open('b.txt','w').write('B'*50)
PY

/krypton/krypton6/encrypt6 b.txt outB.txt
cat outB.txt
```

The pattern is identical but shifted by **+1** (classic Caesar-on-top behavior).

![B-experiment]({{ '/assets/images/krypton/level-6-to-7/b_experiment.jpg' | relative_url }})

---

### 4. Decrypt the target file

Extract the keystream period and apply it to `krypton7`.

```bash
python3 - <<'PY'
import string

# 1) load keystream from 50 'A's
A = open('outA.txt').read().strip()

def find_period(s, lo=2, hi=60):
    for p in range(lo, min(hi, len(s)//2)+1):
        if s[:p] == s[p:2*p]:
            return p
    return None

period = find_period(A) or 30
keystream = A[:period]

# 2) decrypt krypton7
C = open('/krypton/krypton6/krypton7').read().strip()
plain = []
j = 0
for ch in C:
    if ch not in string.ascii_uppercase:
        plain.append(ch); continue
    shift = ord(keystream[j % period]) - ord('A')
    p = (ord(ch) - ord('A') - shift) % 26
    plain.append(chr(p + ord('A')))
    j += 1

print("PLAINTEXT:", ''.join(plain))
PY
```

Result:

```
PLAINTEXT: LFSRISNOTRANDOM
```

![decrypt placeholder]({{ '/assets/images/krypton/level-6-to-7/decrypt.jpg' | relative_url }})

---

## Password

```
LFSRISNOTRANDOM
```

---

## Troubleshooting

* **“Command 'import' not found”** → You pasted Python into bash. Run it via a **here‑doc**: `python3 - <<'PY' ... PY`.
* **No repeating pattern** in `outA.txt` → Ensure you encrypted **50× 'A'** from the same directory that has the `keyfile.dat` symlink.
* **Mixed case / spaces** → The mapping assumes **uppercase A–Z** only. Strip spaces/newlines when comparing.
* **Wrong plaintext** → Recreate `outA.txt` and rerun the decrypt step; verify `period` is around **30**.
* **“File exists” when linking** → Harmless. The symlink is already there; proceed.
* **Ciphertext longer than your keystream** → The keystream **repeats**; the code already indexes with modulo `period`.

---

**Congrats 🎉** You just broke the weak stream cipher using chosen‑plaintext analysis and keystream repetition. Krypton solved up to **Level 7 (final)**!

---

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

