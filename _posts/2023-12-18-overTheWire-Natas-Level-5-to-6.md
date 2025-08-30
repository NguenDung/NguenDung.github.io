---
layout: post-with-comments
title: "OverTheWire Natas Level 5 → 6 tutorial!!"
permalink: /posts/overTheWire-Natas-Level-5-to-6/
tags: [overthewire, natas, walkthrough, ctf, web, beginner]
description: "A step by step tutorial for OverTheWire Natas Level 5 → 6!!"
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
    <a href="{{ '/posts/overTheWire-Natas-Level-4-to-5/' | relative_url }}">← Previous: Level 4 → 5</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/natas/natas6.html" target="_blank" rel="noopener">
      Official (Level 6) ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Natas-Level-6-to-7/' | relative_url }}">
      Next: Level 6 → 7 →
    </a>
  </div>
</nav>

## Login

URL: [http://natas6.natas.labs.overthewire.org](http://natas6.natas.labs.overthewire.org)

Credentials: **natas6:0RoJwHdSKWFTYR5WuiAewauSuNaBXned**

![homepage]({{ '/assets/images/natas/level-5-to-6/file.jpg' | relative_url }})

## Task

The page asks for a **secret**. If the secret is correct, it will reveal the password for **natas7**.

## A little bit of Theory

* The page links to **“View sourcecode”**, which shows the PHP behind the challenge.
* PHP can **include** other files with `include` / `require`. If the included file is web-accessible, you might read it directly.
* Comparing `$_POST['secret']` to a variable (like `$secret`) often means the real value sits in an included file.

**Further reading:**

* <a href="https://www.php.net/manual/en/function.include.php" target="_blank" rel="noopener">PHP: include</a>
* <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/POST" target="_blank" rel="noopener">HTTP POST method</a>

## Solution

1. **Open the provided source**

   Click **“View sourcecode”** on the page.

   ```php
   <?php
   include "includes/secret.inc";

   if (array_key_exists("submit", $_POST)) {
     if ($secret == $_POST['secret']) {
       print "Access granted. The password for natas7 is <censored>";
     } else {
       print "Wrong secret";
     }
   }
   ?>
   ```

   ![view-source]({{ '/assets/images/natas/level-5-to-6/source.jpg' | relative_url }})

   *Why?* It includes `includes/secret.inc`, which likely defines `$secret`.

2. **Read the included file directly**

   Visit:

   ```
   http://natas6.natas.labs.overthewire.org/includes/secret.inc
   ```

   You’ll see something like:

   ```php
   <?php
   $secret = "FOEIUWHGFEEUHFUOIVUOIU";
   ?>
   ```

   ![secret.inc]({{ '/assets/images/natas/level-5-to-6/secret.jpg' | relative_url }})

3. **Submit the secret**

   Paste the secret into the form and press **Submit**.

   ![success]({{ '/assets/images/natas/level-5-to-6/success.jpg' | relative_url }})

   The page prints the password for **natas7**.

## Password

```
bmg8SvU1LizuWjx3y7xkNERkHxGre0GS
```

**Troubleshooting**

* Getting **“Wrong secret”**? → Copy the secret **exactly** from `secret.inc` (no spaces/newlines).
* Can’t open `secret.inc`? → Make sure the path is correct: `/includes/secret.inc` (case-sensitive).
* Still stuck? → Re-check the Basic Auth credentials for **natas6**.

---

**Great work 🎉** You traced an included file, grabbed the secret, and used it to unlock **natas7**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})
