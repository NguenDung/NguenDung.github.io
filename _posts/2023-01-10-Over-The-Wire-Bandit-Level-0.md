---
date: 2023-01-10 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Bandit Level 0 tutorial!!"
permalink: /posts/Over-The-Wire-Bandit-Level-0/
tags: [overthewire, bandit, walkthrough, ctf, linux, beginner]
description: "A step by step tutorial for OverTheWire Bandit Level 0!!"
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
    <span class="disabled">Previous: —</span>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/bandit/bandit0.html" target="_blank" rel="noopener">
      Official Level 0 ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Bandit-Level-0-to-1/' | relative_url }}">
      Next: Level 0 → 1 →
    </a>
  </div>
</nav>

## Login

![Ssh]({{ '/assets/images/bandit/level-0/ssh.jpg' | relative_url }})

- This is the Bandit server login info (top-left on the official page): it shows the **Host** and **Port** you need.

```bash
ssh bandit0@bandit.labs.overthewire.org -p 2220
# password: bandit0
````

## Task

Log into the game using SSH.

![Task]({{ '/assets/images/bandit/level-0/task.jpg' | relative_url }})

Your goal for this first level is simply to connect to the remote machine successfully.

## A little bit of Theory

* **SSH (Secure Shell Protocol)** lets you connect securely to a remote machine over an encrypted channel.
* The typical syntax is:

  ```bash
  ssh <username>@<server> -p <port>
  ```

  Here, `bandit0` is the username, `bandit.labs.overthewire.org` is the host, and `-p 2220` uses the custom port 2220 instead of the default 22.
* On Windows you can use **WSL** or **PuTTY**; on Linux/macOS just use the built-in Terminal.
* After a successful login, you land in the user’s **home directory** (shown by `~` in the prompt).

**Further reading:**

* <a href="https://en.wikipedia.org/wiki/Secure_Shell" target="_blank" rel="noopener">What is SSH? (Wikipedia) </a>
* <a href="https://www.wikihow.com/Use-SSH" target="_blank" rel="noopener">How to use SSH (wikiHow) </a>

## Solution 

1. **Open a terminal**
   Use Terminal (macOS/Linux) or WSL/PowerShell/PuTTY on Windows.

2. **Run the SSH command:**

   ```bash
   ssh bandit0@bandit.labs.overthewire.org -p 2220
   ```

   *Why?* `ssh` starts a secure session as user **bandit0** to the host on port **2220** (Bandit’s custom port).

3. **First-time prompt: accept the host key**
   You may see:

   ```
   The authenticity of host ... can't be established.
   Are you sure you want to continue connecting (yes/no/[fingerprint])?
   ```

   Type `yes`.
   *Why?* SSH stores the server’s fingerprint in `~/.ssh/known_hosts` so future connections can detect tampering (prevents man-in-the-middle).

4. **Enter the password (hidden input):**

   ```
   bandit0
   ```

   *Why?* SSH does not echo characters for security; just type and press **Enter**.

5. **Verify you’re in as bandit0** You should see a prompt like:

   ```
   bandit0@bandit:~$
   ```

   Optionally confirm:

   ```bash
   whoami   # should print: bandit0
   pwd      # should print: /home/bandit0 (or similar)
   ```

6. **Disconnect when done:**

   ```bash
   exit
   ```

   *Why?* Cleanly closes the SSH session.

**Troubleshooting quick tips**

* `ssh: connect to host ... port 2220: Connection timed out` → Check your internet/firewall; make sure `-p 2220` is present.
* `Permission denied` → Re-check the username (`bandit0`) and password (`bandit0`).
* `Host key verification failed` → If you changed DNS/IP recently, remove the old entry in `~/.ssh/known_hosts` and reconnect.

---

**Congrats 🎉** You’re now logged in as **bandit0** and ready for the next level.

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

