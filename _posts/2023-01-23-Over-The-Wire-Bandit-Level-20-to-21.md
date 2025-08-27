---
date: 2023-01-23 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Bandit Level 20 → 21 tutorial!!"
permalink: /posts/overTheWire-Bandit-Level-20-to-21/
tags: [overthewire, bandit, walkthrough, ctf, linux, beginner]
description: "A step by step tutorial for OverTheWire Bandit Level 20 → 21!!"
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
    <a href="{{ '/posts/overTheWire-Bandit-Level-19-to-20/' | relative_url }}">← Previous: Level 19 → 20</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/bandit/bandit21.html" target="_blank" rel="noopener">Official (Level 21) ↗</a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Bandit-Level-21-to-22/' | relative_url }}">Next: Level 21 → 22 →</a>
  </div>
</nav>

## Login

Log in as **bandit20** using the password you obtained from Level 19 → 20.

```bash
ssh bandit20@bandit.labs.overthewire.org -p 2220
# password: 0qXahG8ZjOVMN9Ghs7iOWsCfZyXOUbYO
````

> Why? Each Bandit level is a separate UNIX user. To solve 20 → 21, you must be the `bandit20` user.

## Task

![Task placeholder]({{ '/assets/images/bandit/level-20-to-21/task.jpg' | relative_url }})

There is a **setuid helper** called **`suconnect`** in your home.
`suconnect` will **connect to a TCP port on localhost** and expects you to send the **current password** (for `bandit20`).
If the password is correct, it returns the **password for bandit21** over the same connection.

## A little bit of Theory

* **setuid** binaries run with the **effective UID of the file owner**. Here, `suconnect` is owned by `bandit21`, so the connection it makes and the check it performs happen as `bandit21`.
* Plan:

  1. Start a **Netcat listener** on `localhost:<PORT>`.
  2. Run `./suconnect <PORT>` so it dials your listener.
  3. Type the **bandit20 password** into the listener → it replies with the **bandit21 password**.
* Netcat flavors:

  * OpenBSD: `nc -l 12345`
  * Traditional: `nc -l -p 12345`

**Further reading:**

* <a href="https://man7.org/linux/man-pages/man7/setuid.7.html" target="_blank" rel="noopener">setuid overview</a>
* <a href="https://linux.die.net/man/1/nc" target="_blank" rel="noopener">`nc` manual</a>

## Solution

1. **Inspect the helper**

   ```bash
   ls -l
   file suconnect
   strings suconnect | head
   ```

   *Why?* Confirms setuid (`-rwsr-x---`) and usage `suconnect <port>`.

   ![inspect placeholder]({{ '/assets/images/bandit/level-20-to-21/inspect.jpg' | relative_url }})

2. **Start a listener on a random high port (Terminal A)**

   ```bash
   PORT=$(shuf -i 20000-65000 -n 1); echo "Using port: $PORT"
   nc -l $PORT       # or: nc -l -p $PORT
   ```

   *Why?* Avoid port collisions on the shared host.

3. **Run the connector (Terminal B)**

   ```bash
   ./suconnect $PORT
   ```

   *Why?* `suconnect` (running as `bandit21`) connects to your listener and waits for a line.

   ![suconnect placeholder]({{ '/assets/images/bandit/level-20-to-21/suconnect.jpg' | relative_url }})

4. **Send the current password (Terminal A)**

   Paste the **bandit20** password and press **Enter**:

   ```
   0qXahG8ZjOVMN9Ghs7iOWsCfZyXOUbYO
   ```

   You should receive the **bandit21** password back.

   ![receive placeholder]({{ '/assets/images/bandit/level-20-to-21/receive.jpg' | relative_url }})

5. **Copy the printed password** (no trailing spaces/newlines).

6. **Log into the next level (bandit21)**

   ```bash
   exit
   ssh bandit21@bandit.labs.overthewire.org -p 2220
   # paste the password you just obtained
   ```

## Password

> This is the password from my run; if yours differs, use the one that your terminal printed.

```
EeoULMCra2q0dSkYj561DX7s1CpBuOBt
```

**Troubleshooting**

* **`nc: Address already in use`** → Pick another port, e.g. `PORT=$(shuf -i 30000-65000 -n 1)`.
* **No response after typing** → Press **Enter** to send a newline.
* **`Connection refused`** → Start the listener first, then run `./suconnect`.
* **Only one terminal?** → Use `tmux` (`tmux; Ctrl+B "`) or a second SSH session.
* **Garbage/extra spaces** → Type the password carefully; only the exact line plus newline.

---

## Copy-paste quick run (two terminals)

```bash
# Terminal A (listener)
PORT=$(shuf -i 20000-65000 -n 1); echo "Using port: $PORT"
nc -l $PORT          # or: nc -l -p $PORT

# Terminal B (connector)
./suconnect $PORT

# Back to Terminal A: paste bandit20 password, press Enter → it prints bandit21 password.
```

---

**Congrats 🎉** You used a setuid connector and a local listener to exfiltrate the next password — welcome to **bandit21**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

