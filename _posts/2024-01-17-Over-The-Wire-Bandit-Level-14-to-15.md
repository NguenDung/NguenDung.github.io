---
layout: post-with-comments
title: "OverTheWire Bandit Level 14 → 15 tutorial!!"
permalink: /posts/overTheWire-Bandit-Level-14-to-15/
tags: [overthewire, bandit, walkthrough, ctf, linux, beginner]
description: "A step by step tutorial for OverTheWire Bandit Level 14 → 15!!"
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
    <a href="{{ '/posts/overTheWire-Bandit-Level-13-to-14/' | relative_url }}">← Previous: Level 13 → 14</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/bandit/bandit15.html" target="_blank" rel="noopener">
      Official (Level 15) ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Bandit-Level-15-to-16/' | relative_url }}">Next: Level 15 → 16 →</a>
  </div>
</nav>

## Login

Log in as **bandit14** using the password you just obtained from Level 13 → 14.

```bash
ssh bandit14@bandit.labs.overthewire.org -p 2220
# password: MU4VWeTyJk8ROof1qqmcBPaLh7lDCPvS
```

> Why? Each Bandit level is a different UNIX user. To solve 14 → 15 you must be logged in as `bandit14`.

## Task

![Task]({{ '/assets/images/bandit/level-14-to-15/task.jpg' | relative_url }})

The password for the next level can be retrieved by **sending the current password** to **port `30000` on `localhost`**.

## A little bit of Theory

* **`localhost`** is the same machine you’re on (loopback). You’re talking to a local service, not the internet.
* **`nc` (netcat)** opens simple TCP (or UDP) connections and lets you send/receive bytes via your terminal or pipes.
* **Newline matters.** Most simple services expect your input to end with `\n`. `echo`/`printf` add it for you.

**Further reading:**

* <a href="https://linux.die.net/man/1/nc" target="_blank" rel="noopener">`nc` (netcat) manual</a>
* <a href="https://en.wikipedia.org/wiki/Localhost" target="_blank" rel="noopener">Localhost (Wikipedia)</a>
* <a href="https://en.wikipedia.org/wiki/IP_address" target="_blank" rel="noopener">IP address (Wikipedia)</a>
* <a href="https://en.wikipedia.org/wiki/Port_(computer_networking)" target="_blank" rel="noopener">Port (computer networking)</a>
* <a href="https://www.youtube.com/watch?v=x3c1ih2NJEg" target="_blank" rel="noopener">What is a port? (short explainer)</a>
* <a href="https://computer.howstuffworks.com/web-server5.htm" target="_blank" rel="noopener">How Web Servers Work: Ports</a>
* <a href="https://computer.howstuffworks.com/web-server8.htm" target="_blank" rel="noopener">How Web Servers Work: TCP/IP basics</a>

## Solution

### Way A — Interactive

1. **Connect to the service**

   ```bash
   nc localhost 30000
   ```

   *Why?* Opens a TCP connection to the local service listening on **30000**.

2. **Paste the current level’s password** and press **Enter**:

   ```
   MU4VWeTyJk8ROof1qqmcBPaLh7lDCPvS
   ```

   *Why?* The service validates your input and replies with the **next** password.

![pass]({{ '/assets/images/bandit/level-14-to-15/succes1.jpg' | relative_url }})

3. **Copy the returned password** (no extra spaces/newlines).
4. **Log into the next level (bandit15)**

   ```bash
   exit
   ssh bandit15@bandit.labs.overthewire.org -p 2220
   # paste the password you just found when prompted
   ```


### Way B — One-liner (copy-paste friendly)

```bash
printf '%s\n' 'MU4VWeTyJk8ROof1qqmcBPaLh7lDCPvS' | nc localhost 30000
```

*Why?* Pipes the password with a newline into the TCP connection—fast and repeatable.

![succes]({{ '/assets/images/bandit/level-14-to-15/succes2.jpg' | relative_url }})

## Password

> This is the password I got in my run; if yours is different, copy the one shown in your terminal.

```
8xCjnmgoKbGLhHFAZlGE5Tmu4M2tKJQo
```

## Troubleshooting

* **`Connection refused`** → You’re not on the Bandit box or the port is wrong. Ensure you’re SSH’d into `bandit14` and using **30000**.
* **No response / times out** → Make sure you sent a newline. Prefer `printf '%s\n' '...' | nc localhost 30000`.
* **Garbled/SSL-looking output** → This level uses **plain TCP**. (The SSL/TLS service shows up in the next level.)

---

**Congrats 🎉** You used netcat to talk to a local TCP service and grabbed the Level 15 password. See you in **Level 15 → 16**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})


