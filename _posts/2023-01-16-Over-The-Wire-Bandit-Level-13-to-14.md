---
date: 2023-01-16 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Bandit Level 13 → 14 tutorial!!"
permalink: /posts/Over-The-Wire-Bandit-Level-13-to-14/
tags: [overthewire, bandit, walkthrough, ctf, linux, beginner]
description: "A step by step tutorial for OverTheWire Bandit Level 13 → 14!!"
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
    <a href="{{ '/posts/overTheWire-Bandit-Level-12-to-13/' | relative_url }}">← Previous: Level 12 → 13</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/bandit/bandit14.html" target="_blank" rel="noopener">
      Official (Level 14) ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Bandit-Level-14-to-15/' | relative_url }}">Next: Level 14 → 15 →</a>
  </div>
</nav>

## Login

Log in as **bandit13** using the password you just obtained from Level 12 → 13.

```bash
ssh bandit13@bandit.labs.overthewire.org -p 2220
# password: FO5dwFsc0cbaIiH0h8J2eUks2vdTDwAn
```

> Why? Each Bandit level is a different UNIX user. To solve 13 → 14 you must be logged in as `bandit13`.

## Task

![Task]({{ '/assets/images/bandit/level-13-to-14/task.jpg' | relative_url }})

The password for the next level is stored in **`/etc/bandit_pass/bandit14`** and **can only be read by user `bandit14`**.
You’re given a private SSH key in your home directory to log into **`bandit14@localhost`**.

## A little bit of Theory

* **SSH key login (`-i`)** – `ssh -i <private_key> user@host` tells SSH to use that private key to authenticate.
* **`localhost`** – hostname that always points to the machine you’re already on (the Bandit box). You’re SSH-ing from `bandit13` into `bandit14` on the **same** host.
* **First-time connect prompt** – SSH will ask to trust the server fingerprint; answering `yes` stores it in `~/.ssh/known_hosts`.
* **Permissions** – private keys are usually restricted (e.g., `chmod 600 key`). If SSH complains about “unprotected private key file”, tighten the permissions.

**Further reading:**

* <a href="https://help.ubuntu.com/community/SSH/OpenSSH/Keys" target="_blank" rel="noopener">SSH/OpenSSH/Keys</a>
* <a href="https://manpages.debian.org/openssh-client/ssh.1.en.html" target="_blank" rel="noopener">`ssh` manual (Debian manpages)</a>
* <a href="https://www.ssh.com/academy/ssh/key" target="_blank" rel="noopener">SSH keys explained (ssh.com)</a>
* <a href="https://manpages.debian.org/openssh-client/ssh_config.5.en.html" target="_blank" rel="noopener">`ssh_config` options (Debian manpages)</a>

## Solution

1. **Verify the private key is present**

   ```bash
   ls -l ~
   ```

   *Why?* Confirms the provided key (usually `sshkey.private`) exists and is readable.

![key file]({{ '/assets/images/bandit/level-13-to-14/file.jpg' | relative_url }})

2. **(If needed) Restrict the key’s permissions**

   ```bash
   chmod 600 sshkey.private
   ```

   *Why?* Some SSH versions refuse to use keys that are group/world-readable.

3. **SSH into `bandit14` on the same host using the key**

   ```bash
   ssh -i ./sshkey.private bandit14@localhost -p 2220
   ```

   When asked about authenticity/fingerprint, type `yes`.

   *Why?* You must become `bandit14` to read the protected password file.

![ssh connection]({{ '/assets/images/bandit/level-13-to-14/ssh.jpg' | relative_url }})

4. **Read the password file as `bandit14`**

   ```bash
   cat /etc/bandit_pass/bandit14
   ```

   *Why?* Only `bandit14` has permission to read it.

![cat password]({{ '/assets/images/bandit/level-13-to-14/succes.jpg' | relative_url }})

5. **Copy the password** (no trailing spaces/newlines).

6. **Log into the next level (bandit14)**

   ```bash
   exit
   ssh bandit14@bandit.labs.overthewire.org -p 2220
   # paste the password you just found when prompted
   ```


## Password

> This is the password I got in my run; if yours is different, copy the one shown in your terminal.

```
MU4VWeTyJk8ROof1qqmcBPaLh7lDCPvS
```

## Troubleshooting

* **`Permission denied (publickey)`** → Make sure you used `-i ./sshkey.private`, the path is correct, and the key has strict perms (`chmod 600 sshkey.private`). Also keep `-p 2220`.
* **Host key prompt appears every time** → That’s fine in Bandit’s ephemeral environment; just answer `yes`.
* **`cat: /etc/bandit_pass/bandit14: Permission denied`** → You’re not `bandit14`. Re-run the SSH command to switch users first.
* **`ssh: connect to host localhost port 2220: Connection refused`** → Double-check the port (must be 2220) and that you’re on the Bandit host already.

---

**Congrats 🎉** You used a private key to hop to the next user and grabbed the Level 14 password. See you in **Level 14 → 15**!

---
## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})