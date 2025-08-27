---
date: 2023-08-29 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Behemoth Level 0 → 1 tutorial!!"
permalink: /posts/overTheWire-Behemoth-Level-0-to-1/
tags: [overthewire, behemoth, exploitation, reverse-engineering, ltrace, priv-esc, walkthrough, ctf, linux, beginner]
description: "A step by step tutorial for OverTheWire Behemoth Level 0 → 1!!"
---

<!-- Scoped styles -->
<style>
  .behemoth-nav{display:flex;align-items:center;gap:.75rem;margin:.5rem 0 1.25rem;border-top:1px solid var(--border-color,#3a3a3a);padding-top:.75rem}
  .behemoth-nav .nav-left,.behemoth-nav .nav-center,.behemoth-nav .nav-right{flex:1}
  .behemoth-nav .nav-left{text-align:left}
  .behemoth-nav .nav-center{text-align:center}
  .behemoth-nav .nav-right{text-align:right}
  .behemoth-nav a{display:inline-block;padding:.45rem .8rem;border:1px solid var(--border-color,#3a3a3a);border-radius:.6rem;text-decoration:none;line-height:1}
  .behemoth-nav a:hover{transform:translateY(-1px)}
  .behemoth-nav .disabled{opacity:.55}
  :root[data-theme='light'] .behemoth-nav a{border-color:rgba(0,0,0,.15)}
</style>

<nav class="behemoth-nav" aria-label="Behemoth level navigation">
  <div class="nav-left">
    <a href="{{ '/posts/overTheWire-Behemoth-Level-0/' | relative_url }}">← Previous: Level 0</a>
  </div>
  <div class="nav-center">
    <a href="https://overthewire.org/wargames/behemoth/behemoth1.html" target="_blank" rel="noopener">
      Official (Level 1) ↗
    </a>
  </div>
  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Behemoth-Level-1-to-2/' | relative_url }}">Next: Level 1 → 2 →</a>
  </div>
</nav>

## Login

```bash
ssh behemoth0@behemoth.labs.overthewire.org -p 2221
# password: behemoth0
````

> Why? Each Behemoth level is a separate UNIX user. To solve 0 → 1, you must log in as `behemoth0`.

---

## Task

There is a binary called **`/behemoth/behemoth0`**.
It asks for a password and if correct, escalates you to **behemoth1** (via setuid).

Our mission: **discover the correct password**.

---

## A little bit of Theory

* **`ltrace`** shows dynamic library calls invoked by the binary (e.g. `strcmp`, `scanf`, `puts`).
  Perfect for spotting hidden string comparisons.
* **Hardcoded checks** often use `strcmp(user_input, "secret")`. With `ltrace` you can directly see the string.
* If `ltrace` is not installed, `strings` can also reveal embedded plaintext passwords.

**Further reading:**

* <a href="https://man7.org/linux/man-pages/man1/ltrace.1.html" target="_blank" rel="noopener">`ltrace` manual</a>
* <a href="https://man7.org/linux/man-pages/man3/strcmp.3.html" target="_blank" rel="noopener">`strcmp` manual</a>

---

## Solution

1. **Run the binary normally**

   ```bash
   cd /behemoth
   ./behemoth0
   Password: test
   Access denied..
   ```

   → It clearly expects a special password.

2. **Trace with `ltrace`**

   ```bash
   ltrace ./behemoth0
   ```

   Simplified output:

   ```
   printf("Password: ")
   __isoc99_scanf(...)
   strcmp("test", "eatmyshorts") = -1
   puts("Access denied..")
   ```

   👉 The password check is comparing against **`eatmyshorts`**.

3. **Use the discovered password**

   ```bash
   ./behemoth0
   Password: eatmyshorts
   Access granted..
   whoami
   # behemoth1
   ```

   ✅ We are now running as `behemoth1`.

4. **Grab the password for next level**

   ```bash
   cat /etc/behemoth_pass/behemoth1
   ```

   Output:

   ```
   aesebootiv
   ```

---

## Password

```
aesebootiv
```

---

## Troubleshooting

* **`ltrace: command not found`** → fallback: `strings /behemoth/behemoth0 | grep -i short`.
* **No strcmp output** → enter dummy input to trigger comparison.
* **Still “Access denied”** → check for typos (must be exact match).
* **Permission denied reading file** → confirm `whoami` = `behemoth1`.

---

## Copy-paste quick run

```bash
cd /behemoth && ltrace ./behemoth0
# → reveals password "eatmyshorts"

echo eatmyshorts | ./behemoth0
whoami
cat /etc/behemoth_pass/behemoth1
```

---

**Congrats 🎉** You successfully leaked the hardcoded password using `ltrace`, escalated to **behemoth1**, and grabbed the next password!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

