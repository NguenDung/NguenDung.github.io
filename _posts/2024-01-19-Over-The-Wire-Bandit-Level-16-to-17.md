---
layout: post-with-comments
title: "OverTheWire Bandit Level 16 → 17 tutorial!!"
permalink: /posts/overTheWire-Bandit-Level-16-to-17/
tags: [overthewire, bandit, walkthrough, ctf, linux, beginner]
description: "A step by step tutorial for OverTheWire Bandit Level 16 → 17!!"
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
    <a href="{{ '/posts/overTheWire-Bandit-Level-15-to-16/' | relative_url }}">← Previous: Level 15 → 16</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/bandit/bandit17.html" target="_blank" rel="noopener">Official (Level 17) ↗</a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Bandit-Level-17-to-18/' | relative_url }}">Next: Level 17 → 18 →</a>
  </div>
</nav>

## Login

Log in as **bandit16** using the password you just obtained from Level 15 → 16.

```bash
ssh bandit16@bandit.labs.overthewire.org -p 2220
# password: kSkvUpMQ7lBYyCM4GBPvCvT1BfWRy0Dx
````

> Why? Each Bandit level is a separate UNIX user. To solve 16 → 17, you must be the `bandit16` user.

## Task

![Task]({{ '/assets/images/bandit/level-16-to-17/task.jpg' | relative_url }})

The credentials for the next level can be retrieved by submitting the **current password** to **one port in the range `31000–32000`** on **localhost**.

## A little bit of Theory

* Use `nmap -sV` to **scan the range** and detect **services**; look for entries that talk **SSL/TLS** (they appear as `ssl/*`).
* Use **`openssl s_client`** to open a minimal **TLS** session and send a single line (your current password).
* The server returns **an RSA private key** for `bandit17` — not a plaintext password. Save it, **restrict permissions**, then `ssh -i`.
* You **cannot write** in `/home/bandit16`; create files in **`/tmp`** instead. Also, `bandit16` cannot create `~/.ssh/known_hosts`, so we pass SSH options to skip it.

**Further reading:**

* <a href="https://nmap.org/book/man-version-detection.html" target="_blank" rel="noopener">Nmap: Service/Version detection (`-sV`)</a>
* <a href="https://docs.openssl.org/master/man1/openssl/" target="_blank" rel="noopener">OpenSSL manual</a>
* <a href="https://en.wikipedia.org/wiki/Port_scanner" target="_blank" rel="noopener">Port scanner on Wikipedia</a>
* <a href="https://en.wikipedia.org/wiki/Localhost" target="_blank" rel="noopener">Localhost</a> · <a href="https://en.wikipedia.org/wiki/Port_(computer_networking)" target="_blank" rel="noopener">TCP Port</a>

## Solution

1. **Scan the target range with version detection**

   ```bash
   nmap -p31000-32000 -sV localhost
   ```

   *Why?* We need open ports and which ones speak **TLS**.

   Typical output:

   ```
   PORT      STATE SERVICE    VERSION
   31046/tcp open  echo
   31518/tcp open  ssl/echo
   31691/tcp open  echo
   31790/tcp open  ssl/unknown
   31960/tcp open  echo
   ```

   → Candidates are **31518** and **31790** (both SSL/TLS).

   ![nmap output]({{ '/assets/images/bandit/level-16-to-17/nmap.jpg' | relative_url }})

2. **Connect to the likely TLS port and keep it quiet**

   Try **31790** first:

   ```bash
   openssl s_client -connect localhost:31790 -quiet
   ```

   *Why?* `-quiet` hides certificate noise; a self-signed warning is expected.

3. **Send the current password**

   Paste the password for `bandit16` and press **Enter**:

   ```
   kSkvUpMQ7lBYyCM4GBPvCvT1BfWRy0Dx
   ```

   If the port is correct, the service prints an **RSA private key** block. If it answers *Wrong!* try the other TLS port (**31518**).

   ![service returns key]({{ '/assets/images/bandit/level-16-to-17/openssl.jpg' | relative_url }})

4. **Create a writable workspace and save the key (exactly)**

   ```bash
   WORKDIR=$(mktemp -d /tmp/b16.XXXXXX)
   cd "$WORKDIR"
   cat > bandit17.key
   # paste the whole block:
   # -----BEGIN RSA PRIVATE KEY-----
   # ...
   # -----END RSA PRIVATE KEY-----
   # then press Ctrl+D
   ```

   *Why?* `~` is not writable for `bandit16`; `/tmp` is.

    ![]({{ '/assets/images/bandit/level-16-to-17/cat.jpg' | relative_url }})

5. **Fix permissions (required by SSH)**

   ```bash
   chmod 600 bandit17.key
   ```

6. **Log in to bandit17 with the key**

   ```bash
   ssh -o IdentitiesOnly=yes \
       -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no \
       -i ./bandit17.key bandit17@bandit.labs.overthewire.org -p 2220
   ```

   *Why?* We force SSH to use **only** this key and skip writing `~/.ssh/known_hosts` (not writable here).

    ![connect]({{ '/assets/images/bandit/level-16-to-17/connect.jpg' | relative_url }})
    ![succes]({{ '/assets/images/bandit/level-16-to-17/succes.jpg' | relative_url }})

## Password

> This level returns an **RSA private key** (not a plaintext string). Save the entire block and use it with `ssh -i`.

```
-----BEGIN RSA PRIVATE KEY-----
(…many lines…)
-----END RSA PRIVATE KEY-----
```

## Troubleshooting

* **“Permission denied (publickey)”** → The key was mangled or permissions are too open. Re-grab the key and `chmod 600 bandit17.key`. Ensure you used `-o IdentitiesOnly=yes -i ./bandit17.key`.
* **Can’t save the key in home** → Use `/tmp` (home is not writable for `bandit16`).
* **Only “Wrong!” appears** → You pasted the wrong password or used the wrong TLS port. Try the other one (31518 vs 31790).
* **Session stuck after printing the key** → Press **Ctrl+D** to send EOF and return to your shell.
* **Still failing?** → Inspect with verbose SSH:

  ```bash
  ssh -vvv -o IdentitiesOnly=yes \
      -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no \
      -i ./bandit17.key bandit17@bandit.labs.overthewire.org -p 2220
  ```

---

## Copy-paste quick run (one shot)

```bash
# Create a writable temp dir and go there
WORKDIR=$(mktemp -d /tmp/b16.XXXXXX) && cd "$WORKDIR"

# Try both TLS ports, extract the key block automatically
PW='kSkvUpMQ7lBYyCM4GBPvCvT1BfWRy0Dx'
for p in 31790 31518; do
  echo "$PW" | openssl s_client -connect localhost:$p -quiet 2>/dev/null \
  | awk '/BEGIN RSA PRIVATE KEY/,/END RSA PRIVATE KEY/' > bandit17.key
  if [ -s bandit17.key ]; then
    echo "[+] Got key from port $p"
    break
  fi
done

chmod 600 bandit17.key

# Login with the key (skip known_hosts writes)
ssh -o IdentitiesOnly=yes \
    -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no \
    -i ./bandit17.key bandit17@bandit.labs.overthewire.org -p 2220
```

---

**Congrats 🎉** You scanned, spoke TLS, and authenticated with a private key — welcome to **bandit17**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

