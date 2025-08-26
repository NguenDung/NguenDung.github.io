---
date: 2023-08-17 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Narnia Level 0 tutorial!!"
permalink: /posts/Over-The-Wire-Narnia-Level-0/
tags: [overthewire, narnia, pwn, overflow, binary-exploitation, linux, beginner]
description: "A step by step tutorial for OverTheWire Narnia Level 0!!"
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

<nav class="bandit-nav" aria-label="Narnia level navigation">
  <div class="nav-left">
    <span class="disabled">← Previous</span>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/narnia/narnia0.html" target="_blank" rel="noopener">Official (Level 0) ↗</a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Narnia-Level-0-to-1/' | relative_url }}">Next: Level 0 → 1 →</a>
  </div>
</nav>

## Login

Log in as **narnia0**.

```bash
ssh narnia0@narnia.labs.overthewire.org -p 2226
# password: narnia0
````

> Why? Each Narnia level is a separate UNIX user. To solve Level 0 you must be the `narnia0` user.

## Task

Log into the game using SSH.
Your goal for this first level is simply to connect to the remote machine successfully.

## A little bit of Theory


* **SSH (Secure Shell Protocol)** lets you connect securely to a remote machine over an encrypted channel.
* The typical syntax is:

  ```bash
  ssh <username>@<server> -p <port>
  ```

  Here, `narnia0` is the username, `narnia.labs.overthewire.org` is the host, and `-p 2226` uses the custom port 2226 instead of the default 22.
* On Windows you can use **WSL** or **PuTTY**; on Linux/macOS just use the built-in Terminal.
* After a successful login, you land in the user’s **home directory** (shown by `~` in the prompt).

**Further reading:**

* <a href="https://en.wikipedia.org/wiki/Secure_Shell" target="_blank" rel="noopener">What is SSH? (Wikipedia) </a>
* <a href="https://www.wikihow.com/Use-SSH" target="_blank" rel="noopener">How to use SSH (wikiHow) </a>

---

## Solution

1. Open terminal and run:

```bash
ssh narnia0@narnia.labs.overthewire.org -p 2226
```

2. Enter the given password:

```
narnia0
```

3. Boom 🎉 you’re inside as **narnia0**.

![inspect placeholder]({{ '/assets/images/narnia/level-0/inspect.jpg' | relative_url }})

At this point nothing else to solve — just confirm you can connect.
The real fun starts at **Level 0 → 1**.

---

## Password for Next Level

```
(You don’t need to find it here — OTW provides it: narnia0)
```

---

**That’s it for Level 0! 🎉** It’s purely a login test, but from here we’ll start digging into actual binaries.

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})


