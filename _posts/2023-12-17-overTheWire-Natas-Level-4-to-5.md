---
layout: post-with-comments
title: "OverTheWire Natas Level 4 → 5 tutorial!!"
permalink: /posts/overTheWire-Natas-Level-4-to-5/
tags: [overthewire, natas, walkthrough, ctf, web, beginner]
description: "A step by step tutorial for OverTheWire Natas Level 4 → 5!!"
---

<!-- Scoped styles -->
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
</style>

<nav class="bandit-nav" aria-label="Natas level navigation">
  <div class="nav-left">
    <a href="{{ '/posts/overTheWire-Natas-Level-3-to-4/' | relative_url }}">← Previous: Level 3 → 4</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/natas/natas5.html" target="_blank" rel="noopener">
      Official (Level 5) ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Natas-Level-5-to-6/' | relative_url }}">
      Next: Level 5 → 6 →
    </a>
  </div>
</nav>

## Login

URL: <http://natas5.natas.labs.overthewire.org>  
Credentials: **natas5:0n35PkggAPm2zbEpOU802c0x0Msn1ToK**

![homepage]({{ '/assets/images/natas/level-4-to-5/file.jpg' | relative_url }})

---

## Task

The site shows:  

```

Access disallowed. You are not logged in

```

Let’s inspect what’s happening with **cookies**.

---

## A little bit of Theory

* **HTTP Cookies** are key-value pairs stored by the browser.  
* Servers use them for session state or access control.  
* Here, the server sets a cookie:  

```

Set-Cookie: loggedin=0

```

If we flip it to `1`, we might bypass the check.

**Further reading:**

* <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies" target="_blank" rel="noopener">MDN: HTTP Cookies</a>  
* <a href="https://developer.chrome.com/docs/devtools/storage/cookies" target="_blank" rel="noopener">Inspect & edit cookies with DevTools</a>

---

## Solution

1. **Check response headers in DevTools (Network tab)**  

   ![network-headers]({{ '/assets/images/natas/level-4-to-5/network.jpg' | relative_url }})  

   Notice `Set-Cookie: loggedin=0`.

2. **Open DevTools → Application → Cookies**  

   ![cookies-before]({{ '/assets/images/natas/level-4-to-5/cookies-before.jpg' | relative_url }})  

   You’ll should see `loggedin=0` but i change it to `1`.

3. **Edit the cookie value**  

   Change it to:  

```

loggedin=1

```

4. **Refresh the page**  

The site now grants access and shows the password for **natas6**.  

![success]({{ '/assets/images/natas/level-4-to-5/success.jpg' | relative_url }})

---

## Password

```

0RoJwHdSKWFTYR5WuiAewauSuNaBXned

```

---

**Troubleshooting**

* Still “not logged in”? → Double-check you set `loggedin=1` under the right domain.  
* Cookie keeps resetting? → Disable auto-refresh extensions or reapply manually.  
* Can’t find cookies? → In Chrome: DevTools → Application → Storage → Cookies.

---

**Great job 🎉** You just bypassed authentication by flipping a cookie bit!  

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})
