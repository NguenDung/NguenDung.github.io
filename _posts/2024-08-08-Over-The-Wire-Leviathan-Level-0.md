---
layout: post-with-comments
title: "OverTheWire Leviathan Level 0 tutorial!!"
permalink: /posts/overTheWire-Leviathan-Level-0/
tags: [overthewire, leviathan, walkthrough, ctf, linux, beginner, suid]
description: "A step by step tutorial for OverTheWire Leviathan Level 0!!"
---

<!-- Scoped styles: only affect this post -->
<style>
  .leviathan-nav{display:flex;align-items:center;gap:.75rem;margin:.5rem 0 1.25rem;border-top:1px solid var(--border-color,#3a3a3a);padding-top:.75rem}
  .leviathan-nav .nav-left,.leviathan-nav .nav-center,.leviathan-nav .nav-right{flex:1}
  .leviathan-nav .nav-left{text-align:left}
  .leviathan-nav .nav-center{text-align:center}
  .leviathan-nav .nav-right{text-align:right}
  .leviathan-nav a{display:inline-block;padding:.45rem .8rem;border:1px solid var(--border-color,#3a3a3a);border-radius:.6rem;text-decoration:none;line-height:1}
  .leviathan-nav a:hover{transform:translateY(-1px)}
  .leviathan-nav .disabled{opacity:.55}
  :root[data-theme='light'] .leviathan-nav a{border-color:rgba(0,0,0,.15)}
</style>

<nav class="leviathan-nav" aria-label="Leviathan level navigation">
  <div class="nav-left">
    <span class="disabled">← No previous level</span>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/leviathan/leviathan0.html" target="_blank" rel="noopener">Official (Level 0) ↗</a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Leviathan-Level-0-to-1/' | relative_url }}">Next: Level 0 → 1 →</a>
  </div>
</nav>

---

## Login

```bash
ssh leviathan0@leviathan.labs.overthewire.org -p 2223
# password: leviathan0
````

> Each level has its own **username/password**. Passwords are always the solution from the previous level, but for **Level 0**, OTW gives it directly (`leviathan0`).

---

## Task

The OTW prompt doesn’t give much here — it’s basically just the entry point.
Our job: log in successfully and start exploring.

---

## Theory

* The **Leviathan** wargame is about **binaries and SUID** programs.
* Level 0 is just a **warm-up login** (similar to Bandit Level 0).
* Once inside, we’ll begin recon: listing files, searching for SUID binaries, checking configs.

---

## Solution

1. Open terminal and run:

```bash
ssh leviathan0@leviathan.labs.overthewire.org -p 2223
```

2. Enter the given password:

```
leviathan0
```

3. Boom 🎉 you’re inside as **leviathan0**.

![inspect placeholder]({{ '/assets/images/leviathan/level-0/inspect.jpg' | relative_url }})

At this point nothing else to solve — just confirm you can connect.
The real fun starts at **Level 0 → 1**.

---

## Password for Next Level

```
(You don’t need to find it here — OTW provides it: leviathan0)
```

---

**That’s it for Level 0! 🎉** It’s purely a login test, but from here we’ll start digging into actual binaries.

---

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})
