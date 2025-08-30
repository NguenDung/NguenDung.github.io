---
layout: post-with-comments
title: "OverTheWire Natas Level 1 → 2 tutorial!!"
permalink: /posts/overTheWire-Natas-Level-1-to-2/
tags: [overthewire, natas, walkthrough, ctf, web, beginner]
description: "A step by step tutorial for OverTheWire Natas Level 1 → 2!!"
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
    <a href="{{ '/posts/overTheWire-Natas-Level-0-to-1/' | relative_url }}">← Previous: Level 0 → 1</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/natas/natas2.html" target="_blank" rel="noopener">
      Official (Level 2) ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Natas-Level-2-to-3/' | relative_url }}">
      Next: Level 2 → 3 →
    </a>
  </div>
</nav>

## Login

URL: <http://natas2.natas.labs.overthewire.org>  
Credentials: **natas2:TguMNxKo1DSa1tujBLuZJnDUlCcUAPlI**

![homepage]({{ '/assets/images/natas/level-1-to-2/file.jpg' | relative_url }})

> 💡 Tip: you could also log in with `curl -u natas2:<password> <URL>`, but browser navigation is easier here.

## Task

The page looks almost empty, but the HTML source reveals an **image reference**:

```html
<img src="files/pixel.png">
````

If there’s an image under `/files/`, maybe there are more files there. Let’s check the directory.

## A little bit of Theory

* **Relative URLs** like `files/pixel.png` point to a subdirectory of the site. Removing the filename often exposes a folder path.
* Some servers allow **directory listing**, which lets you browse everything inside.
* Plain text files (like `users.txt`) can be opened directly in the browser.

**Further reading:**

* <a href="https://developer.mozilla.org/en-US/docs/Learn/Common_questions/What_is_a_URL" target="_blank" rel="noopener">MDN: What is a URL?</a>
* <a href="https://httpd.apache.org/docs/2.4/mod/mod_autoindex.html" target="_blank" rel="noopener">Apache autoindex (directory listing)</a>

## Solution

1. **Open the page source** (Ctrl+U / ⌥+⌘+U) and notice `files/pixel.png`.

2. **Remove the filename** and visit: [http://natas2.natas.labs.overthewire.org/files/](http://natas2.natas.labs.overthewire.org/files/)

   You’ll see a directory listing with `pixel.png` and `users.txt`

    ![index]({{ '/assets/images/natas/level-1-to-2/user.jpg' | relative_url }})


3. **Click `users.txt`** and read its contents:

   ![users.txt]({{ '/assets/images/natas/level-1-to-2/succes.jpg' | relative_url }})

   Inside, one of the lines reveals the password for **natas3**.

4. **Use that password** to log in to Level 3:

   * URL: [http://natas3.natas.labs.overthewire.org](http://natas3.natas.labs.overthewire.org)
   * Username: `natas3`
   * Password: *(the one you just found)*

## Password

```
3gqisGdR0pjm6tpkDKdIWO2hSvchLeYH
```

**Troubleshooting**

* Getting `403/404`? → Ensure the path ends with `/files/`.
* Can’t see the listing? → Some browsers render differently; try Chrome/Firefox.
* Password not obvious? → Look for the line beginning with `natas3:`.

---

**Nice! 🎉** You followed a hidden relative path, explored a directory, and grabbed the password for **natas3**.

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})
