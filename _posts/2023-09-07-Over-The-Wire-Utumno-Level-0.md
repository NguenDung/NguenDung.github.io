---
date: 2023-09-07 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Utumno Level 0 tutorial!!"
permalink: /posts/Over-The-Wire-Utumno-Level-0/
tags: [overthewire, utumno, walkthrough, ctf, binary, exploitation]
description: "A step by step tutorial for OverTheWire Utumno Level 0!!"
---

<!-- Scoped styles: only affect this post -->
<style>
  .utumno-nav{display:flex;align-items:center;gap:.75rem;margin:.5rem 0 1.25rem;border-top:1px solid var(--border-color,#3a3a3a);padding-top:.75rem}
  .utumno-nav .nav-left,.utumno-nav .nav-center,.utumno-nav .nav-right{flex:1}
  .utumno-nav .nav-left{text-align:left}
  .utumno-nav .nav-center{text-align:center}
  .utumno-nav .nav-right{text-align:right}
  .utumno-nav a{display:inline-block;padding:.45rem .8rem;border:1px solid var(--border-color,#3a3a3a);border-radius:.6rem;text-decoration:none;line-height:1}
  .utumno-nav a:hover{transform:translateY(-1px)}
  .utumno-nav .disabled{opacity:.55}
  :root[data-theme='light'] .utumno-nav a{border-color:rgba(0,0,0,.15)}
</style>

<nav class="utumno-nav" aria-label="Utumno level navigation">
  <div class="nav-left">
    <span class="disabled">Previous: —</span>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/utumno/utumno0.html" target="_blank" rel="noopener">
      Official Level 0 ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Utumno-Level-0-to-1/' | relative_url }}">
      Next: Level 0 → 1 →
    </a>
  </div>
</nav>

## Login

- This is the Utumno server login info (from the official page).  
- You get the **host**, **port**, **username**, and **password**.  

```bash
ssh utumno0@utumno.labs.overthewire.org -p 2227
# password: utumno0
````

## Task

Log into the Utumno game using SSH.
Your goal for this first level is simply to connect successfully to the remote machine.

## A little bit of Theory

* **SSH (Secure Shell Protocol)** lets you connect securely to a remote Linux machine.

* The syntax is:

  ```bash
  ssh <username>@<server> -p <port>
  ```

  Here:

  * `utumno0` is the username.
  * `utumno.labs.overthewire.org` is the host.
  * `-p 2227` specifies the custom port (default SSH is 22).

* On Windows: use **WSL**, **PowerShell**, or **PuTTY**.

* On Linux/macOS: just open the built-in Terminal.

* Once connected, you’ll land in the user’s **home directory**.

**Further reading:**

* <a href="https://en.wikipedia.org/wiki/Secure_Shell" target="_blank" rel="noopener">What is SSH? (Wikipedia)</a>
* <a href="https://www.wikihow.com/Use-SSH" target="_blank" rel="noopener">How to use SSH (wikiHow)</a>

## Solution

1. **Open a terminal.**

2. **Run the SSH command:**

   ```bash
   ssh utumno0@utumno.labs.overthewire.org -p 2227
   ```

   *Why?* This starts a secure session as user **utumno0** on port **2227**.

3. **Accept the host key** (first-time prompt):

   ```
   The authenticity of host ... can't be established.
   Are you sure you want to continue connecting (yes/no/[fingerprint])?
   ```

   Type `yes`.
   *Why?* SSH stores the server’s fingerprint in `~/.ssh/known_hosts` for future verification.

4. **Enter the password (hidden input):**

   ```
   utumno0
   ```

   *Why?* SSH doesn’t echo characters for security.

   ![Ssh]({{ '/assets/images/utumno/level-0/ssh.jpg' | relative_url }})


5. **Verify you’re logged in as utumno0** — the shell prompt should look like:

   ```bash
   utumno0@utumno:~$
   ```

   Optionally confirm:

   ```bash
   whoami   # should print: utumno0
   pwd      # should print: /home/utumno0 (or similar)
   ```

6. **Disconnect when done:**

   ```bash
   exit
   ```

   *Why?* Cleanly closes the session.

**Troubleshooting quick tips**

* `ssh: connect to host ... port 2227: Connection timed out` → Check your internet/firewall; don’t forget `-p 2227`.
* `Permission denied` → Double-check username (`utumno0`) and password (`utumno0`).
* `Host key verification failed` → Remove old entry in `~/.ssh/known_hosts` then retry.

---

**Congrats 🎉** You’re now logged in as **utumno0** and ready for the next level.

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

