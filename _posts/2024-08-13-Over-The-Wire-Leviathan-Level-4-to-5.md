---
layout: post-with-comments
title: "OverTheWire Leviathan Level 4 → 5 tutorial!!"
permalink: /posts/overTheWire-Leviathan-Level-4-to-5/
tags: [overthewire, leviathan, walkthrough, ctf, linux, beginner, suid, reversing, binary-to-ascii]
description: "A step by step tutorial for OverTheWire Leviathan Level 4 → 5!!"
---

<!-- Scoped styles: only affect this post -->
<style>
  .leviathan-nav{display:flex;align-items:center;gap:.75rem;margin:.5rem 0 1.25rem;border-top:1px solid var(--border-color,#3a3a3a);padding-top:.75rem}
  .leviathan-nav .nav-left,.leviathan-nav .nav-center,.leviathan-nav .nav-right{flex:1}
  .leviathan-nav .nav-left{text-align:left}
  .leviathan-nav .nav-center{text-align:center}
  .leviathan-nav .nav-right{text-align:right}
  .leviathan-nav a{display:inline-block;padding:.45rem .8rem;border:1px solid var(--border-color,#3a3a3a);border-radius:.6rem;text-decoration:none;line-height:1}
  .leviathan-nav a:hover{transform:translateY(-1px)}
  .leviathan-nav .disabled{opacity:.55}
  :root[data-theme='light'] .leviathan-nav a{border-color:rgba(0,0,0,.15)}
</style>

<nav class="leviathan-nav" aria-label="Leviathan level navigation">
  <div class="nav-left">
    <a href="{{ '/posts/overTheWire-Leviathan-Level-3-to-4/' | relative_url }}">← Previous: Level 3 → 4</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/leviathan/leviathan5.html" target="_blank" rel="noopener">Official (Level 5) ↗</a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Leviathan-Level-5-to-6/' | relative_url }}">Next: Level 5 → 6 →</a>
  </div>
</nav>

---

## Login

Log in as **leviathan4** using the password from Level 3 → 4.

```bash
ssh leviathan4@leviathan.labs.overthewire.org -p 2223
# password: WG1egElCvO
````

> Why? Each Leviathan level is a different UNIX user. To solve 4 → 5, you must be `leviathan4`.

---

## Task

There’s something interesting in your home directory — find it and extract the password for **leviathan5**.

---

## A little bit of Theory

* Sometimes binaries don’t hide a *password* — they output **encoded data** you must transform.
* If you see a long string of `0`/`1`, think **binary → ASCII**.
  Common quick decoders:

  * `perl -0777 -pe 's/\s+//g; $_ = pack("B*", $_)'`
  * `xxd -r -b` (expects **groups of 8 bits**)

**Further reading:**

* <a href="https://perldoc.perl.org/perlrun" target="_blank" rel="noopener">Perl one-liners (`-pe`, `-0777`)</a>
* <a href="https://perldoc.perl.org/functions/pack" target="_blank" rel="noopener">Perl `pack` function</a>
* <a href="https://manpages.ubuntu.com/manpages/noble/en/man1/xxd.1.html" target="_blank" rel="noopener">xxd(1) — Ubuntu manpage</a>


---

## Solution

1. **Explore the directory**

   ```bash
   ls -la
   find . -maxdepth 2 -type f -o -type d
   ```

   *Why?* Quick recon often reveals hidden folders. You should see **`.trash/`** with an executable `bin` inside.

   ![inspect]({{ '/assets/images/leviathan/level-4-to-5/inspect.jpg' | relative_url }})

2. **Identify and run the binary**

   ```bash
   file .trash/bin
   ./.trash/bin
   ```

   *Why?* `file` confirms it’s an ELF; running it prints a long line of **0/1 bits**.

   ![run]({{ '/assets/images/leviathan/level-4-to-5/run.jpg' | relative_url }})

3. **Decode binary → ASCII (Method A: Perl, recommended)**

   ```bash
   ./.trash/bin | perl -0777 -pe 's/\s+//g; $_ = pack("B*", $_)'
   ```

   *Why?* `-0777` slurps the entire stream, `s/\s+//g` strips whitespace/newlines, and `pack("B*", ...)` converts the bitstring directly to bytes → clean ASCII.

4. **Alternative: Decode with `xxd` (Method B)**

   ```bash
   ./.trash/bin | tr -cd '01' | sed 's/.\{8\}/& /g' | xxd -r -b
   ```

   *Why?* `xxd -r -b` needs **octets** separated by spaces/newlines. `tr` filters to `0/1`, `sed` inserts a space every 8 bits. This avoids “cannot seek backwards” errors.

5. **Grab the password**

   The decoded output is plain text:

   ```
   leviathan5: 0dyxT7F4QD
   ```

   *Why?* The program emits the next username and password encoded as bits; once decoded, it’s readable ASCII.

   ![decrypt]({{ '/assets/images/leviathan/level-4-to-5/decrypt.jpg' | relative_url }})

---

## Password

```
0dyxT7F4QD
```

---

## Troubleshooting

* **No output?** Run `./.trash/bin` from the **leviathan4** home directory.
* **`xxd` complains?** Make sure bits are grouped into 8s (`sed 's/.\{8\}/& /g'`) or use the Perl one-liner.
* **Weird leading characters?** Use the Perl command that strips whitespace before `pack`.

---

## Copy-paste quick run

```bash
ssh leviathan4@leviathan.labs.overthewire.org -p 2223
# password: WG1egElCvO

cd ~
file .trash/bin

# Method A (Perl — recommended)
./.trash/bin | perl -0777 -pe 's/\s+//g; $_=pack("B*", $_)'
# → leviathan5: 0dyxT7F4QD

# Method B (xxd)
./.trash/bin | tr -cd '01' | sed 's/.\{8\}/& /g' | xxd -r -b
# → leviathan5: 0dyxT7F4QD

ssh leviathan5@leviathan.labs.overthewire.org -p 2223
# password: 0dyxT7F4QD
```

---

**Congrats 🎉** You recognized a **binary-to-ASCII** trick and extracted the next password. Onward to **leviathan5**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})


