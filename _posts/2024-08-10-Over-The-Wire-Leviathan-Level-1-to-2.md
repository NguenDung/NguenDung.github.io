---
layout: post-with-comments
title: "OverTheWire Leviathan Level 1 → 2 tutorial!!"
permalink: /posts/overTheWire-Leviathan-Level-1-to-2/
tags: [overthewire, leviathan, walkthrough, ctf, linux, beginner, suid, ltrace, strings]
description: "A step by step tutorial for OverTheWire Leviathan Level 1 → 2!!"
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
    <a href="{{ '/posts/overTheWire-Leviathan-Level-0-to-1/' | relative_url }}">← Previous: Level 0 → 1</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/leviathan/leviathan2.html" target="_blank" rel="noopener">Official (Level 2) ↗</a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Leviathan-Level-2-to-3/' | relative_url }}">Next: Level 2 → 3 →</a>
  </div>
</nav>

---

## Login

Log in as **leviathan1** using the password from Level 0 → 1.

```bash
ssh leviathan1@leviathan.labs.overthewire.org -p 2223
# password: 3QJ3TgzHDq
````

> Why? Each Leviathan level is a different UNIX user. To solve 1 → 2, you must be `leviathan1`.

---

## Task

OTW says there is a **SUID binary** in the home directory of `leviathan1`.
Your goal: use it to obtain the password for **leviathan2**.

---

## A little bit of Theory

* **SUID**: when an executable has the setuid bit, it runs with the **owner’s** privileges (here, `leviathan2`).
* **`strings`**: prints printable strings inside binaries—sometimes reveals clues.
* **`ltrace`**: traces **library calls** (like `strcmp`) and shows the arguments the program uses—often enough to leak the expected password.

**Further reading:**

* <a href="https://en.wikipedia.org/wiki/Setuid" target="_blank" rel="noopener">setuid (Wikipedia)</a>
* <a href="https://man7.org/linux/man-pages/man1/ltrace.1.html" target="_blank" rel="noopener">ltrace — Linux man page</a>

---

## Solution

1. **Explore the directory**

   ```bash
   ls -la
   ```
   *Why?* `r-s` on the owner means SUID; executing `check` will run as **leviathan2**.

   Look for a SUID binary:

   ```
   -r-sr-x--- 1 leviathan2 leviathan1 15084 Aug 15 13:17 check
   ```

   ![inspect]({{ '/assets/images/leviathan/level-1-to-2/inspect.jpg' | relative_url }})


---

2. **Run the binary once**

   ```bash
   ./check
   password: test
   Wrong password, Good Bye ...
   ```
    *Why?* Confirms it asks for a password and exits on failure.

   ![run]({{ '/assets/images/leviathan/level-1-to-2/run.jpg' | relative_url }})


---

3. **Try `strings` for quick wins**

   ```bash
   strings check
   ```
      *Why?* Not all binaries keep secrets as plaintext—so we escalate to tracing.

   You’ll see things like `password:`, `Wrong password, Good Bye ...`, `strcmp`, etc., but **no plaintext secret**.

   ![strings]({{ '/assets/images/leviathan/level-1-to-2/strings.jpg' | relative_url }})


---

4. **Trace with `ltrace` to catch `strcmp`**

   ```bash
   ltrace ./check
   ```

   Type any guess (e.g., `1341232`) and watch the trace:

   ```
   printf("password: ")                              = 10
   getchar(... )                                     = '1'
   getchar(... )                                     = '3'
   getchar(... )                                     = '4'
   strcmp("134", "sex")                              = -1
   puts("Wrong password, Good Bye ...")              = 29
   +++ exited (status 0) +++
   ```
   *Why?* `ltrace` reveals the exact argument passed to `strcmp`, which is the expected password.

   → The program compares our input to **"sex"**.

   ![ltrace]({{ '/assets/images/leviathan/level-1-to-2/ltrace.jpg' | relative_url }})


---

5. **Use the discovered password**

   ```bash
   ./check
   password: sex
   $ whoami
   leviathan2
   ```
   *Why?* The SUID binary spawned a subshell running as **leviathan2**.

   ![shell]({{ '/assets/images/leviathan/level-1-to-2/shell.jpg' | relative_url }})

---

6. **Read the actual level password**

   All level passwords live in `/etc/leviathan_pass/`.

   ```bash
   cat /etc/leviathan_pass/leviathan2
   ```
   *Why?* On Leviathan, the definitive credential is in this path; the SUID shell gives you permission to read it.

   Output:

   ```
   NsN1HwFoyN
   ```

   ![decrypt]({{ '/assets/images/leviathan/level-1-to-2/decrypt.jpg' | relative_url }})

---

## Password

```
NsN1HwFoyN
```

---

## Troubleshooting

* **`ltrace` shows nothing?** Make sure you’re tracing `./check` directly, not via a shell wrapper.
* **Only gibberish from `strings`?** That’s normal; `ltrace` is the key here.
* **Didn’t get a subshell?** You must type the exact string `sex` when `./check` prompts.

---

## Copy-paste quick run

```bash
ssh leviathan1@leviathan.labs.overthewire.org -p 2223
# password: 3QJ3TgzHDq

ls -la                 # spot SUID ./check
ltrace ./check         # reveals strcmp(..., "sex")
./check
password: sex          # get subshell as leviathan2
whoami                 # → leviathan2
cat /etc/leviathan_pass/leviathan2
# → NsN1HwFoyN
```

---

**Congrats 🎉** You used **`ltrace`** to leak a hard-coded comparison and escalated via a **SUID** binary. On to **leviathan2**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative\_url }})


