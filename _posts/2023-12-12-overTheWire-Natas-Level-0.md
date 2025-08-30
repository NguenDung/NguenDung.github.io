---
layout: post-with-comments
title: "OverTheWire Natas Level 0 tutorial!!"
permalink: /posts/overTheWire-Natas-Level-0/
tags: [overthewire, natas, walkthrough, ctf, web, beginner]
description: "A step by step tutorial for OverTheWire Natas Level 0!!"
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
</style>

<nav class="bandit-nav" aria-label="Natas level navigation">
  <div class="nav-left">
    <span class="disabled">Previous: —</span>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/natas/natas0.html" target="_blank" rel="noopener">
      Official Level 0 ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Natas-Level-0-to-1/' | relative_url }}">
      Next: Level 0 → 1 →
    </a>
  </div>
</nav>

## Login

Natas uses HTTP **Basic Auth**.  
Open <http://natas0.natas.labs.overthewire.org> in your browser. When prompted, log in with:

- **Username:** `natas0`  
- **Password:** `natas0`

![homepage]({{ '/assets/images/natas/level-0/file.jpg' | relative_url }})

> 💡 Tip: You *could* also use `curl -u natas0:natas0 <URL>` from the terminal, but throughout this series we focus on solving directly in the **browser**.

## Task

The password for the next level (**natas1**) is hidden in the page’s **HTML source**.

## A little bit of Theory

* **Basic Auth**: the browser automatically sends `Authorization: Basic ...` with your credentials once logged in.
* **View Page Source** shows the raw HTML delivered by the server. This is different from the DOM inspector.
  - **Windows/Linux:** `Ctrl+U`
  - **macOS:** `⌥ Option + ⌘ Command + U`
* Sensitive info is often tucked away in HTML comments: `<!-- ... -->`.

**Further reading:**

* <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication#basic_authentication_scheme" target="_blank" rel="noopener">MDN: Basic Authentication</a>  
* <a href="https://developer.mozilla.org/en-US/docs/Learn/Common_questions/View_source" target="_blank" rel="noopener">MDN: View Source vs. DevTools</a>

## Solution

1. **Log in with `natas0 / natas0`.**
2. **Right-click → “View Page Source”** (or press the shortcut).
3. **Search for an HTML comment** that contains the password for `natas1`.

![view-source]({{ '/assets/images/natas/level-0/succes.jpg' | relative_url }})

4. **Copy the password** carefully — no extra spaces or newlines.
5. **Go to the next level**:  
   - URL: <http://natas1.natas.labs.overthewire.org>  
   - Username: `natas1`  
   - Password: *(the one you just found)*

## Password

```

0nzCigAq7t2iALyvU9xcHlYN4MlkIwlq

```

**Troubleshooting**

* Getting re-prompted for credentials? → Double-check username/password casing.  
* Can’t see the comment? → Ensure you are viewing **Page Source**, not Elements in DevTools.  
* Still unsure? → Try another browser or fetch HTML with `curl` as a fallback.

---

**Congrats 🎉** You cracked your very first Natas level by simply looking under the hood of the web page!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})


