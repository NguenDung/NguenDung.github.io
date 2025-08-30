---
layout: post-with-comments
title: "OverTheWire Natas Level 0 → 1 tutorial!!"
permalink: /posts/overTheWire-Natas-Level-0-to-1/
tags: [overthewire, natas, walkthrough, ctf, web, beginner]
description: "A step by step tutorial for OverTheWire Natas Level 0 → 1!!"
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
    <a href="{{ '/posts/overTheWire-Natas-Level-0/' | relative_url }}">← Previous: Level 0</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/natas/natas1.html" target="_blank" rel="noopener">
      Official (Level 1) ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Natas-Level-1-to-2/' | relative_url }}">
      Next: Level 1 → 2 →
    </a>
  </div>
</nav>

## Login

URL: <http://natas1.natas.labs.overthewire.org>  
Credentials: **natas1:0nzCigAq7t2iALyvU9xcHlYN4MlkIwlq**

![homepage]({{ '/assets/images/natas/level-0-to-1/file.jpg' | relative_url }})

> 💡 Tip: you can also use `curl -u natas1:<password> <URL>` if you prefer the terminal, but the intended solution is straight from the browser.

## Task

In this level, **right-click is disabled** in the browser.  
Your goal is still to view the HTML source — the password for **natas2** is hidden in a comment.

## A little bit of Theory

* Websites can use **JavaScript** to intercept and block right-click, but it only affects the UI, not the actual page source.
* Use keyboard shortcuts to open source directly:
  * Windows/Linux: **Ctrl+U**
  * macOS: **Option+Command+U**
* As always, HTML comments (`<!-- ... -->`) are a common hiding spot.

**Further reading:**

* <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication#basic_authentication_scheme" target="_blank" rel="noopener">MDN: Basic Authentication</a>  
* <a href="https://developer.mozilla.org/en-US/docs/Learn/Common_questions/View_source" target="_blank" rel="noopener">MDN: View Source vs. DevTools</a>  
* <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Event/preventDefault" target="_blank" rel="noopener">How right-click is disabled with JS</a>  

## Solution

1. **Log in with the given credentials.**
2. **Ignore the right-click restriction** and open the page source via shortcut.
3. **Locate the HTML comment** inside the source:

   ```html
   <!--The password for natas2 is TguMNxKo1DSa1tujBLuZJnDUlCcUAPlI -->
````

!\[view-source]\({{ '/assets/images/natas/level-0-to-1/succes.jpg' | relative\_url }})

4. **Copy the password** exactly.
5. **Proceed to Level 2** at [http://natas2.natas.labs.overthewire.org](http://natas2.natas.labs.overthewire.org) using:

   * Username: `natas2`
   * Password: `TguMNxKo1DSa1tujBLuZJnDUlCcUAPlI`

## Password

```
TguMNxKo1DSa1tujBLuZJnDUlCcUAPlI
```

**Troubleshooting**

* Can’t open source? → Use the keyboard shortcut instead of right-click.
* Still blocked? → Try another browser.
* Prefer terminal? → Use `curl -u natas1:<password> <URL>` to fetch raw HTML.

---

**Congrats 🎉** You just bypassed a simple JavaScript trick and revealed the hidden password for **natas2**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

