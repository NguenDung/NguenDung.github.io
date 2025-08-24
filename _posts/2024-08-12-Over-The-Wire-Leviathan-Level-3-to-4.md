---
layout: post-with-comments
title: "OverTheWire Leviathan Level 3 → 4 tutorial!!"
permalink: /posts/overTheWire-Leviathan-Level-3-to-4/
tags: [overthewire, leviathan, walkthrough, ctf, linux, beginner, suid, ltrace, strcmp]
description: "A step by step tutorial for OverTheWire Leviathan Level 3 → 4!!"
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
    <a href="{{ '/posts/overTheWire-Leviathan-Level-2-to-3/' | relative_url }}">← Previous: Level 2 → 3</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/leviathan/leviathan4.html" target="_blank" rel="noopener">Official (Level 4) ↗</a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Leviathan-Level-4-to-5/' | relative_url }}">Next: Level 4 → 5 →</a>
  </div>
</nav>

---

## Login

Log in as **leviathan3** using the password from Level 2 → 3.

```bash
ssh leviathan3@leviathan.labs.overthewire.org -p 2223
# password: f0n8h2iWLP
```

> Why? Each Leviathan level is a different UNIX user. To solve 3 → 4, you must be `leviathan3`.

---

## Task

There’s a **SUID** binary named `level3` in the home directory. Find the password for **leviathan4**.

---

## A little bit of Theory

* **SUID binaries** run with the **owner’s** privileges (here: `leviathan4`).
* **`ltrace`** shows **library calls** and their arguments (e.g., `strcmp`), which often leaks the expected password.
* Many “password checkers” simply do `strcmp(user_input, "secret")`.

**Further reading:**

* <a href="https://man7.org/linux/man-pages/man1/ltrace.1.html" target="_blank" rel="noopener">`ltrace` — Linux man page</a>
* <a href="https://en.wikipedia.org/wiki/Setuid" target="_blank" rel="noopener">`setuid` — Wikipedia</a>
* <a href="https://man7.org/linux/man-pages/man3/strcmp.3.html" target="_blank" rel="noopener">`strcmp(3)` manual</a>

---

## Solution

1. **List files and spot SUID binary**

   ```bash
   ls -la
   ```

   *Why?* We confirm `level3` is owned by `leviathan4` and has the SUID bit.

   ![inspect]({{ '/assets/images/leviathan/level-3-to-4/inspect.jpg' | relative_url }})

2. **Run it once to see behavior**

   ```bash
   ./level3
   # Enter anything, e.g. Ahdiemoo1j
   ```

   *Why?* Baseline: it prompts for a password and prints “WRONG”.

   ![run]({{ '/assets/images/leviathan/level-3-to-4/run.jpg' | relative_url }})

3. **Trace with `ltrace` to leak the real string**

   ```bash
   ltrace ./level3
   # when prompted, type: test
   ```

   *Why?* The trace shows `strcmp("test\n", "snlprintf\n")` → expected password is **snlprintf**.

   ![ltrace]({{ '/assets/images/leviathan/level-3-to-4/ltrace.jpg' | relative_url }})

4. **Use the discovered password to get a subshell**

   ```bash
   ./level3
   Enter the password> snlprintf
   $ whoami
   leviathan4
   ```

   *Why?* SUID program spawns a shell running as **leviathan4**.

   ![shell]({{ '/assets/images/leviathan/level-3-to-4/shell.jpg' | relative_url }})

5. **Read the real password from `/etc/leviathan_pass`**

   ```bash
   cat /etc/leviathan_pass/leviathan4
   ```

   *Why?* All level credentials live here.

   ![decrypt]({{ '/assets/images/leviathan/level-3-to-4/decrypt.jpg' | relative_url }})

---

## Password

```
WG1egElCvO
```

---

## Troubleshooting

* **`ltrace` shows no `strcmp`?** Make sure you’re tracing `./level3` (not through a shell wrapper).
* **Typed `snlprintf` but still “WRONG”?** Remember `fgets` includes the newline automatically when you press **Enter** — you just type `snlprintf` then hit Enter.
* **No subshell prompt (`$`) after success?** Try `whoami` anyway; some shells don’t change the prompt string.

---

## Copy-paste quick run

```bash
ssh leviathan3@leviathan.labs.overthewire.org -p 2223
# password: f0n8h2iWLP

ls -la                    # see SUID ./level3
ltrace ./level3           # strcmp(..., "snlprintf\n")

./level3                  # enter: snlprintf
whoami                    # → leviathan4
cat /etc/leviathan_pass/leviathan4
# → WG1egElCvO
```

---

**Congrats 🎉** You used **`ltrace`** to catch a lazy `strcmp` password check and escalated via **SUID**. On to **leviathan4**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})
