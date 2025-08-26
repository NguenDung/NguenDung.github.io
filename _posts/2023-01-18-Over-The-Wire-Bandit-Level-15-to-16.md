---
date: 2023-01-18 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Bandit Level 15 → 16 tutorial!!"
permalink: /posts/Over-The-Wire-Bandit-Level-15-to-16/
tags: [overthewire, bandit, walkthrough, ctf, linux, beginner]
description: "A step by step tutorial for OverTheWire Bandit Level 15 → 16!!"
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
    <a href="{{ '/posts/overTheWire-Bandit-Level-14-to-15/' | relative_url }}">← Previous: Level 14 → 15</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/bandit/bandit16.html" target="_blank" rel="noopener">
      Official (Level 16) ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Bandit-Level-16-to-17/' | relative_url }}">Next: Level 16 → 17 →</a>
  </div>
</nav>

## Login

Log in as **bandit15** using the password you just obtained from Level 14 → 15.

```bash
ssh bandit15@bandit.labs.overthewire.org -p 2220
# password: 8xCjnmgoKbGLhHFAZlGE5Tmu4M2tKJQo
````

> Why? Each Bandit level is a different UNIX user. To solve 15 → 16 you must be logged in as `bandit15`.

## Task

![Task]({{ '/assets/images/bandit/level-15-to-16/task.jpg' | relative_url }})

Send the **current level password** over a **TLS/SSL connection** to **`localhost` port `30001`**. The service will reply with the password for **bandit16**.

## A little bit of Theory

* **Plain TCP vs TLS.** Level 14 used plain TCP (`nc`). This level is the same idea but wrapped in **TLS** (encrypted socket + certificate exchange).
* **`openssl s_client`.** A tiny TLS client. It connects, prints the handshake/cert info, then lets you type/send data to the service.
* **Newline matters.** These services usually read a **line**; end your input with `\n`. Use `printf '%s\n' ...`.

**Further reading:**

* <a href="https://www.openssl.org/docs/man3.0/man1/openssl-s_client.html" target="_blank" rel="noopener">OpenSSL: `openssl s_client` (official manual)</a>
* <a href="https://www.feistyduck.com/library/openssl-cookbook/online/testing-with-openssl/index.html" target="_blank" rel="noopener">OpenSSL Cookbook — Testing with OpenSSL</a>
* <a href="https://en.wikipedia.org/wiki/Transport_Layer_Security" target="_blank" rel="noopener">Transport Layer Security (TLS)</a>
* <a href="https://man.openbsd.org/nc" target="_blank" rel="noopener">`nc` (netcat) manual — OpenBSD</a> · <a href="https://manpages.debian.org/nc.openbsd/nc.1.en.html" target="_blank" rel="noopener">Debian mirror</a>
* <a href="https://en.wikipedia.org/wiki/Localhost" target="_blank" rel="noopener">Localhost (Wikipedia)</a>

## Solution

### Way A — Interactive with `openssl s_client`

1. **Open a TLS connection to the local service**

   ```bash
   openssl s_client -connect localhost:30001
   ```

   *Why?* This performs the TLS handshake and drops you into an interactive session bound to **localhost:30001**.
   A *self-signed certificate* warning is expected on the Bandit test service.

    ![Connect with s_client]({{ '/assets/images/bandit/level-15-to-16/connect.jpg' | relative_url }})

2. **Type/paste the current password, then press Enter**

   ```
   8xCjnmgoKbGLhHFAZlGE5Tmu4M2tKJQo
   ```

   *Why?* The service verifies your input and, if correct, prints **bandit16**’s password.

    ![Service response]({{ '/assets/images/bandit/level-15-to-16/succes.jpg' | relative_url }})

3. **Copy the returned password** (avoid extra whitespace).
4. **Log into the next level (bandit16)**

   ```bash
   exit
   ssh bandit16@bandit.labs.overthewire.org -p 2220
   # paste the password you just found when prompted
   ```

> Too chatty? Add `-quiet` to hide the certificate dump:

```bash
openssl s_client -connect localhost:30001 -quiet
```
![quiet]({{ '/assets/images/bandit/level-15-to-16/quiet.jpg' | relative_url }})

This makes the output shorter and easier to read.

### Way B — Clean one-liner (recommended)

```bash
printf '%s\n' '8xCjnmgoKbGLhHFAZlGE5Tmu4M2tKJQo' \
  | openssl s_client -connect localhost:30001 -quiet
```

*Why?* `printf` guarantees the trailing newline; `-quiet` suppresses handshake noise so you only see the result.

![One-liner]({{ '/assets/images/bandit/level-15-to-16/oneline.jpg' | relative_url }})

### Way C — Using `ncat` (TLS-capable netcat)

```bash
printf '%s\n' '8xCjnmgoKbGLhHFAZlGE5Tmu4M2tKJQo' | ncat --ssl localhost 30001
```

*Why?* `ncat` (from Nmap) supports TLS via `--ssl`, giving you a netcat-style alternative.

![ncat example]({{ '/assets/images/bandit/level-15-to-16/netcat.jpg' | relative_url }})

## Password

> This is the password I got in my run; if yours differs, copy the one shown in your terminal.

```
kSkvUpMQ7lBYyCM4GBPvCvT1BfWRy0Dx
```

## Troubleshooting

* **Self-signed certificate warnings?** Normal on Bandit. They don’t block the exchange. Use `-quiet` if the output is too noisy.
* **No output / “hangs”.** You probably didn’t send a newline. Prefer the one-liner with `printf '%s\n' ... | openssl s_client -quiet`.
* **`connect: Connection refused`.** Make sure you’re on the Bandit host as `bandit15`, and the port is **30001**.
* **Echoed input but no “Correct!”.** Double-check you pasted the correct **bandit15** password and sent the newline.

---

**Congrats 🎉** You spoke TLS with `openssl s_client` and grabbed the Level 16 password. See you in **Level 16 → 17**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

