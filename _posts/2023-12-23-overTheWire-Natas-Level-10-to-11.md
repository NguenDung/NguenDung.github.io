---
layout: post-with-comments
title: "OverTheWire Natas Level 10 → 11 tutorial!!"
permalink: /posts/overTheWire-Natas-Level-10-to-11/
tags: [overthewire, natas, walkthrough, ctf, web, beginner]
description: "A step by step tutorial for OverTheWire Natas Level 10 → 11!!"
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
    <a href="{{ '/posts/overTheWire-Natas-Level-9-to-10/' | relative_url }}">← Previous: Level 9 → 10</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/natas/natas11.html" target="_blank" rel="noopener">
      Official (Level 11) ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Natas-Level-11-to-12/' | relative_url }}">
      Next: Level 11 → 12 →
    </a>
  </div>
</nav>

## Login

URL: [http://natas11.natas.labs.overthewire.org](http://natas11.natas.labs.overthewire.org)
Credentials: **natas11:UJdqkK1pTu6VLt9UHWAgRZz6sVUZ3lEk**

```bash
# Using curl (optional):
curl -u natas11:UJdqkK1pTu6VLt9UHWAgRZz6sVUZ3lEk http://natas11.natas.labs.overthewire.org/
```

![homepage]({{ '/assets/images/natas/level-10-to-11/homepage.jpg' | relative_url }})

---

## Task

The page says: **“Cookies are protected with XOR encryption.”**
We’ll recover the XOR key using a known-plaintext trick, then forge a cookie that sets `showpassword` to `yes`.

---

## A little bit of Theory

`index-source.html` shows the flow:

```php
$defaultdata = array("showpassword"=>"no", "bgcolor"=>"#ffffff");

function xor_encrypt($in) {
  $key = '<censored>';
  $out = '';
  for ($i=0; $i<strlen($in); $i++) {
    $out .= $in[$i] ^ $key[$i % strlen($key)];
  }
  return $out;            // then base64-encoded into the cookie
}
```

The cookie pipeline is:

```
json_encode(data) → XOR with key → base64 → Cookie “data=…”
```

Because we know the plaintext structure:

```
{"showpassword":"no","bgcolor":"#ffffff"}
```

and we can read the ciphertext from our cookie, we can apply the XOR identity:

```
Plaintext ⊕ Key = Ciphertext  ⇒  Ciphertext ⊕ Plaintext = Key
```

---

## Solution (Python)

### 1) Capture the encrypted cookie

Use DevTools (Application → Cookies) or Burp to grab `data=...`.

![burp]({{ '/assets/images/natas/level-10-to-11/cookie-before.jpg' | relative_url }})

### 2) Recover the XOR key

> **Note:** PHP’s `json_encode` has **no spaces** around `:` or `,`. We’ll match that exactly.

```python
# derive_key.py
import base64, json

# Paste your cookie value here (URL-decoded, the base64 blob *after* data=)
cipher_b64 = "HmYkBwozJw4WNyAAFyB1VUcqOE1JZjUIBis7ABdmbU1GIjEJAyIxTRg="
cipher = base64.b64decode(cipher_b64)

# Match PHP's json: no spaces
plain = json.dumps({"showpassword":"no","bgcolor":"#ffffff"}, separators=(',', ':')).encode()

# Repeat-plaintext XOR (same length as cipher) to recover repeating key stream
key_stream = bytes(c ^ p for c, p in zip(cipher, (plain * ((len(cipher)//len(plain))+1))[:len(cipher)]))

# The actual secret key is the smallest repeating period of key_stream.
# Quick & practical: try to guess a short period by eye OR print both forms.
print("Key (hex):", key_stream.hex())
print("Key (ASCII best-guess):", key_stream.decode('latin-1', errors='ignore'))
```

You’ll see a repeating pattern (yours looked like it repeated every few bytes).
Any 1 full period of that pattern is a valid XOR key.

### 3) Forge a new cookie (`showpassword":"yes"`)

```python
# forge_cookie.py
import base64, json, itertools

# Put the repeating key you inferred here (one period). Example:
key_period = b"eDWo"   # ← replace with the period you recovered

def xorb(data, key):
    return bytes(d ^ k for d, k in zip(data, itertools.cycle(key)))

pt_yes = json.dumps({"showpassword":"yes","bgcolor":"#ffffff"},
                    separators=(',', ':')).encode()

new_cookie_b64 = base64.b64encode(xorb(pt_yes, key_period)).decode()
print(new_cookie_b64)
```

Set the forged cookie in DevTools (Application → Cookies → `data`), or via console:

```js
document.cookie = 'data=' + '<PASTE_BASE64_FROM_SCRIPT>';
```

![cookie-after]({{ '/assets/images/natas/level-10-to-11/cookie-after.jpg' | relative_url }})

Refresh the page—if `showpassword` is **yes**, the site reveals the next credential.

![success]({{ '/assets/images/natas/level-10-to-11/success.jpg' | relative_url }})

---

## Password

```
yZdkjAYZRd3R7tq7T5kXMjMJlOIkzDeB
```

---

## Troubleshooting

* **Gibberish key output?** Make sure the plaintext JSON exactly matches PHP’s format (use `separators=(',', ':')`) and that your cookie value is **URL-decoded** before base64 decoding.
* **Key looks longer than expected?** That’s fine; identify the **shortest repeating period** (what repeats over and over) and use that as your `key_period`.
* **No password after setting cookie?**

  * Confirm the cookie name is `data`.
  * Ensure it’s just the **base64 string** (no `data=` prefix inside the value).
  * Clear old cookies and set again, then refresh.

---

**Nice! 🎉** You performed a classic known-plaintext attack on a repeating-key XOR cookie and forged your way to **natas12**.

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})
