---
layout: post-with-comments
title: "OverTheWire Natas Level 2 → 3 tutorial!!"
permalink: /posts/overTheWire-Natas-Level-2-to-3/
tags: [overthewire, natas, walkthrough, ctf, web, beginner]
description: "A step by step tutorial for OverTheWire Natas Level 2 → 3!!"
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
    <a href="{{ '/posts/overTheWire-Natas-Level-1-to-2/' | relative_url }}">← Previous: Level 1 → 2</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/natas/natas3.html" target="_blank" rel="noopener">
      Official (Level 3) ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Natas-Level-3-to-4/' | relative_url }}">
      Next: Level 3 → 4 →
    </a>
  </div>
</nav>

## Login

URL: <http://natas3.natas.labs.overthewire.org>  
Credentials: **natas3:3gqisGdR0pjm6tpkDKdIWO2hSvchLeYH**

![homepage]({{ '/assets/images/natas/level-2-to-3/file.jpg' | relative_url }})

## Task

The page looks blank, but maybe hidden paths exist. Let’s check `robots.txt` — a common file that reveals excluded directories for crawlers.

## A little bit of Theory

* **robots.txt** lives at the site root and lists paths search engines should not crawl.  
* Example:
```txt
User-agent: *
Disallow: /secret/
````

* This is only advisory for bots, but humans can still visit those paths.

**Further reading:**

* <a href="https://en.wikipedia.org/wiki/Robots_exclusion_standard" target="_blank" rel="noopener">Robots Exclusion Standard</a>
* <a href="https://developers.google.com/search/docs/crawling-indexing/robots/intro" target="_blank" rel="noopener">Google: About robots.txt</a>

## Solution

1. **Visit robots.txt**:
   [http://natas3.natas.labs.overthewire.org/robots.txt](http://natas3.natas.labs.overthewire.org/robots.txt)

   ![robots.txt]({{ '/assets/images/natas/level-2-to-3/robots.jpg' | relative_url }})

   It disallows `/s3cr3t/`.

2. **Browse the disallowed path**:
   [http://natas3.natas.labs.overthewire.org/s3cr3t/](http://natas3.natas.labs.overthewire.org/s3cr3t/)

   ![directory]({{ '/assets/images/natas/level-2-to-3/dir.jpg' | relative_url }})

   A `users.txt` file is listed.

3. **Open users.txt**:

   ![users.txt]({{ '/assets/images/natas/level-2-to-3/succes.jpg' | relative_url }})

   Inside is the password for **natas4**.

4. **Log into the next level**:

   * URL: [http://natas4.natas.labs.overthewire.org](http://natas4.natas.labs.overthewire.org)
   * Username: `natas4`
   * Password: *(the one you just found)*

## Password

```
QryZXc2e0zahULdHrtHxzyYkj59kUxLQ
```

**Troubleshooting**

* 404 on robots.txt? → Make sure you’re logged in as `natas3`.
* Directory empty? → Don’t forget the trailing `/s3cr3t/`.
* Wrong password? → Only copy the actual password value, not the `natas4:` prefix.

---

**Congrats 🎉** You discovered how robots.txt can reveal sensitive directories and retrieved the password for **natas4**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

