---
layout: post-with-comments
title: "OverTheWire Bandit Level 12 → 13 tutorial!!"
permalink: /posts/overTheWire-Bandit-Level-12-to-13/
tags: [overthewire, bandit, walkthrough, ctf, linux, beginner]
description: "A step by step tutorial for OverTheWire Bandit Level 12 → 13!!"
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
    <a href="{{ '/posts/overTheWire-Bandit-Level-11-to-12/' | relative_url }}">← Previous: Level 11 → 12</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/bandit/bandit13.html" target="_blank" rel="noopener">
      Official (Level 13) ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Bandit-Level-13-to-14/' | relative_url }}">Next: Level 13 → 14 →</a>
  </div>
</nav>

## Login

Log in as **bandit12** using the password you just obtained from Level 11 → 12.

```bash
ssh bandit12@bandit.labs.overthewire.org -p 2220
# password: 7x16WNeHIi5YkIhWsfFIqoognUTyj9Q4
````

> Why? Each Bandit level is a different UNIX user. To solve 12 → 13 you must be logged in as `bandit12`.

## Task

![Task]({{ '/assets/images/bandit/level-12-to-13/task.jpg' | relative_url }})

The password for the next level is in **`data.txt`**, which is a **hexdump of a file** that has been **compressed multiple times**. Recreate the original binary and keep unpacking until you reach readable text.

## A little bit of Theory

* **Hexdump ↔ binary**
  `xxd -r` converts a hexdump back to raw bytes.
* **Use `file` to choose the right tool**
  `file` will tell you if the data is `gzip`, `bzip2`, a `tar` archive, or already plain text.
* **Common unpackers**
  `gunzip` (gzip), `bunzip2` (bzip2), `tar xf` (tar archives).
* **Work in `/tmp`**
  You’ll rename and create lots of files; `/tmp` is writable and disposable.

**Further reading:**

* <a href="https://en.wikipedia.org/wiki/Hex_dump" target="_blank" rel="noopener">Hex dump (Wikipedia)</a>
* <a href="https://manpages.debian.org/xxd/xxd.1.en.html" target="_blank" rel="noopener">`xxd` manual (Debian manpages)</a>
* <a href="https://manpages.debian.org/file/file.1.en.html" target="_blank" rel="noopener">`file` manual (Debian manpages)</a>
* <a href="https://manpages.debian.org/gzip/gzip.1.en.html" target="_blank" rel="noopener">`gzip` / `gunzip` (Debian manpages)</a>
* <a href="https://manpages.debian.org/bzip2/bzip2.1.en.html" target="_blank" rel="noopener">`bzip2` / `bunzip2` (Debian manpages)</a>
* <a href="https://manpages.debian.org/tar/tar.1.en.html" target="_blank" rel="noopener">`tar` (Debian manpages)</a>

## Solution

### Way A — Step-by-step (transparent)

1. **Create a temp workspace & copy the data**

   ```bash
   WORKDIR=$(mktemp -d)
   cp ~/data.txt "$WORKDIR"/
   cd "$WORKDIR"
   ls -l
   ```

   *Why?* We’ll create/rename intermediate files. Working in `/tmp` avoids cluttering your home and guarantees write permissions.

![copy to tmp]({{ '/assets/images/bandit/level-12-to-13/copy.jpg' | relative_url }})

2. **Rebuild the first binary from the hexdump**

   ```bash
   xxd -r data.txt data
   file data
   ```

   *Why?* `xxd -r` turns the hex back into raw bytes. Then `file` tells you what format the bytes are in (gzip/bzip2/tar/text), so you know the next command to run.

![xxd reverse]({{ '/assets/images/bandit/level-12-to-13/xxd.jpg' | relative_url }})

3. **Peel layers, guided by `file`**

   Run `file data`, apply the correct tool, rename the output back to `data`, and repeat:

   ```bash
   # If it's gzip-compressed:
   mv data data.gz && gunzip -f data.gz

   # If it's bzip2-compressed:
   mv data data.bz2 && bzip2 -df data.bz2

   # If it's a tar archive (containing one file):
   mkdir t && tar xf data -C t && rm -f data && set -- t/* && mv "$1" data && rmdir t

   # Check again:
   file data
   ```

   *Why?* The file has multiple compression layers. `file` is the compass: it prevents guesswork and errors like “not in gzip format”.

4. **Read the plaintext**

   ```bash
   cat data
   ```

   *Why?* When `file` says `ASCII text` (or similar), you’ve reached the final content—the next level’s password.

5. **Copy the password** (no extra spaces/newlines).

6. **Log into the next level (bandit13)**

   ```bash
   exit
   ssh bandit13@bandit.labs.overthewire.org -p 2220
   # paste the password you just found when prompted
   ```

---

### Way B — Quick one-liner loop (“instant noodles”)

> Paste this; it auto-detects and unwraps each layer until text appears:

```bash
WORKDIR=$(mktemp -d) && cp ~/data.txt "$WORKDIR"/ && cd "$WORKDIR"
xxd -r data.txt data
while :; do
  t=$(file -b data)
  case "$t" in
    *gzip*)  mv data data.gz;  gunzip -f data.gz ;;
    *bzip2*) mv data data.bz2; bzip2 -df data.bz2 ;;
    *tar*)   mv data data.tar; tar xf data.tar; rm -f data.tar; set -- *; mv "$1" data ;;
    *ASCII*|*text*) echo "==> Password:"; cat data; break ;;
    *) echo "Unknown type: $t"; break ;;
  esac
done
```

*Why?* A tiny loop keeps the workflow consistent (the working file is always named `data`) and avoids manual mistakes across many layers.

![final password]({{ '/assets/images/bandit/level-12-to-13/succes.jpg' | relative_url }})

## Password

> This is the password I got in my run; if yours is different, copy the one shown in your terminal.

```
FO5dwFsc0cbaIiH0h8J2eUks2vdTDwAn
```

## Troubleshooting

* **`gzip: not in gzip format` / `bzip2: data integrity error`**
  You used the wrong tool for this layer. Always `file data` first to identify the format.
* **`tar: This does not look like a tar archive`**
  Same story—wrong tool or wrong step. Re-check with `file`.
* **Multiple files after `tar xf`**
  Use `ls -lt` to spot the newest file, then `mv <that-file> data` and continue the loop.
* **Lost track of filenames**
  Keep renaming the current working file back to `data` after each step. It makes the loop (and your brain) much happier.

---

**Congrats 🎉** You reconstructed a binary from a hexdump and peeled off multiple compression layers—on to **bandit13**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})
