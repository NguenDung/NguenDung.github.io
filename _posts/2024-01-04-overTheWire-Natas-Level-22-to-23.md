---
layout: post-with-comments
title: "OverTheWire Natas Level 22 → 23 tutorial!!"
permalink: /posts/overTheWire-Natas-Level-22-to-23/
tags: [overthewire, natas, walkthrough, ctf, web, beginner, php, type-juggling]
description: "A step by step tutorial for OverTheWire Natas Level 22 → 23!!"
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
    <a href="{{ '/posts/overTheWire-Natas-Level-21-to-22/' | relative_url }}">← Previous: Level 21 → 22</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/natas/natas23.html" target="_blank" rel="noopener">
      Official (Level 23) ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Natas-Level-23-to-24/' | relative_url }}">
      Next: Level 23 → 24 →
    </a>
  </div>
</nav>

## Login

URL: [http://natas23.natas.labs.overthewire.org](http://natas23.natas.labs.overthewire.org)

Credentials: **natas23:dIUQcI3uSus1JEOSSWRAEXBG8KbR8tRs**

```bash
# Using curl (optional):
curl -u natas23:dIUQcI3uSus1JEOSSWRAEXBG8KbR8tRs 
  -d 'passwd=123iloveyou' 
  http://natas23.natas.labs.overthewire.org/
```

![homepage]({{ '/assets/images/natas/level-22-to-23/homepage.jpg' | relative_url }})

---

## Task

Source:

```php
if (array_key_exists("passwd", $_REQUEST)) {
  if (strstr($_REQUEST["passwd"], "iloveyou") && ($_REQUEST["passwd"] > 10)) {
    echo "<br>The credentials for the next level are:<br>";
    echo "<pre>Username: natas24 Password: <censored></pre>";
  } else {
    echo "<br>Wrong!<br>";
  }
}
```

We need **two conditions**:

1. `passwd` **contains** `iloveyou` (`strstr()` just checks substring).
2. `passwd > 10` — here’s the catch: in PHP, when you compare a **string to a number**, PHP converts the string to a number.

* If the string **starts with digits**, those digits become the number.
* If it **doesn’t** start with digits, it becomes `0`.

So a value like **`123iloveyou`** converts to the number `123`, and `123 > 10` is true.

---

## Solution

Just post a password that starts with a number and contains `iloveyou`, e.g.:

```
123iloveyou
```

### With Python (optional)

```python
import requests

auth = ("natas23", "dIUQcI3uSus1JEOSSWRAEXBG8KbR8tRs")
data = {"passwd": "123iloveyou"}
r = requests.post("http://natas23.natas.labs.overthewire.org/", auth=auth, data=data)
print(r.text)
```


![result]({{ '/assets/images/natas/level-22-to-23/result.jpg' | relative_url }})

---

## Password

```
MeuqmfJ8DDKuTr5pcvzFKSwlxedZYEWd
```

---

## Why it works

This is classic **PHP type juggling**:

* `strstr()` doesn’t require equality, only **substring**.
* `$_REQUEST["passwd"] > 10` coerces the string to a number, so **prefixing digits** satisfies the numeric comparison.

---

## Troubleshooting

* Still “Wrong!”? → Ensure your value **starts with digits** and **contains** `iloveyou`.
* Spaces before digits? → Leading spaces turn into `0` in numeric context. Avoid them.
* URL-encoding? → If you send via GET, make sure it’s properly encoded; POST is simpler.

---

**Nice job 🎉** You just beat a sneaky **substring + type-juggling** combo. On to **natas24**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})
