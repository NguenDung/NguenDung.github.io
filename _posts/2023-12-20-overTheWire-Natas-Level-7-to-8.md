---
layout: post-with-comments
title: "OverTheWire Natas Level 7 → 8 tutorial!!"
permalink: /posts/overTheWire-Natas-Level-7-to-8/
tags: [overthewire, natas, walkthrough, ctf, web, beginner]
description: "A step by step tutorial for OverTheWire Natas Level 7 → 8!!"
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
    <a href="{{ '/posts/overTheWire-Natas-Level-6-to-7/' | relative_url }}">← Previous: Level 6 → 7</a>
  </div>
  <div class="nav-center">
    <a href="https://overthewire.org/wargames/natas/natas8.html" target="_blank" rel="noopener">
      Official (Level 8) ↗
    </a>
  </div>
  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Natas-Level-8-to-9/' | relative_url }}">
      Next: Level 8 → 9 →
    </a>
  </div>
</nav>

## Login

URL: [http://natas8.natas.labs.overthewire.org](http://natas8.natas.labs.overthewire.org)
Credentials: **natas8\:xcoXLmzMkoIP9D7hlgPlh9XD7OgLAe5Q**

```bash
# Using curl (optional):
curl -u natas8:xcoXLmzMkoIP9D7hlgPlh9XD7OgLAe5Q http://natas8.natas.labs.overthewire.org/
```

![homepage]({{ '/assets/images/natas/level-7-to-8/file.jpg' | relative_url }})

## Task

The page asks for a **secret**. Clicking *View sourcecode* reveals how the server checks it.

## A little bit of Theory

The PHP shows an encoded constant and a function used to transform your input:

```php
<?php
$encodedSecret = "3d3d516343746d4d6d6c315669563362";

function encodeSecret($secret) {
  return bin2hex(strrev(base64_encode($secret)));
}
```

So the server compares `encodeSecret($_POST['secret'])` with the hex string above.
To find the correct input, we **invert** the operations in reverse order:

1. hex → bytes
2. reverse bytes → original base64 text
3. base64 decode → the real secret

**Further reading:**

* <a href="https://www.php.net/manual/en/function.base64-encode.php" target="_blank" rel="noopener">PHP: `base64_encode`</a>
* <a href="https://www.php.net/manual/en/function.bin2hex.php" target="_blank" rel="noopener">PHP: `bin2hex`</a>

## Solution

1. **Open source and copy the encoded string**

   ![source]({{ '/assets/images/natas/level-7-to-8/code.jpg' | relative_url }})

   ```
   3d3d516343746d4d6d6c315669563362
   ```

2. **Reverse the transform (quick script)**

   Python:

   ```python
   import base64
   s = bytes.fromhex("3d3d516343746d4d6d6c315669563362")
   s = s[::-1]
   secret = base64.b64decode(s)
   print(secret.decode())
   # -> oubWYf2kBq
   ```

   Or JS Console:

   ```js
   const h="3d3d516343746d4d6d6c315669563362";
   const bytes=h.match(/../g).map(x=>parseInt(x,16));
   const b64=String.fromCharCode(...bytes.reverse());
   console.log(atob(b64)); // "oubWYf2kBq"
   ```

3. **Submit the secret** `oubWYf2kBq` and read the result.

   ![success]({{ '/assets/images/natas/level-7-to-8/success.jpg' | relative_url }})

## Password

```
ZE1ck82lmdGIoErlhQgWND6j2Wzz6b6t
```

**Troubleshooting**

* “Wrong secret”? → Order must be **hex → reverse → base64 decode**.
* Garbled output? → Treat the hex as raw bytes before reversing.
* Still stuck? → Copy/paste the Python snippet exactly.

---

**Nice! 🎉** You reversed a custom encoder and pulled the secret for **natas9**. Onward!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})
