---
date: 2023-10-02 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire FormulaOne Level 4 → 5 tutorial!!"
permalink: /posts/overTheWire-FormulaOne-Level-4-to-5/
tags: [overthewire, formulaone, walkthrough, ctf, binary, exploitation, gcc]
description: "A step by step tutorial for OverTheWire FormulaOne Level 4 → 5!!"
---

<!-- Scoped styles -->
<style>
  .formulaone-nav{display:flex;align-items:center;gap:.75rem;margin:.5rem 1.25rem;border-top:1px solid var(--border-color,#3a3a3a);padding-top:.75rem}
  .formulaone-nav .nav-left,.formulaone-nav .nav-center,.formulaone-nav .nav-right{flex:1}
  .formulaone-nav .nav-left{text-align:left}
  .formulaone-nav .nav-center{text-align:center}
  .formulaone-nav .nav-right{text-align:right}
  .formulaone-nav a{display:inline-block;padding:.45rem .8rem;border:1px solid var(--border-color,#3a3a3a);border-radius:.6rem;text-decoration:none;line-height:1}
  .formulaone-nav a:hover{transform:translateY(-1px)}
  .formulaone-nav .disabled{opacity:.55}
  :root[data-theme='light'] .formulaone-nav a{border-color:rgba(0,0,0,.15)}
</style>

<nav class="formulaone-nav" aria-label="FormulaOne level navigation">
  <div class="nav-left">
    <a href="{{ '/posts/overTheWire-FormulaOne-Level-3-to-4/' | relative_url }}">
      ← Previous: Level 3 → 4
    </a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/formulaone/formulaone5.html" target="_blank" rel="noopener">
      Official (Level 5) ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-FormulaOne-Level-5-to-6/' | relative_url }}">
      Next: Level 5 → 6 →
    </a>
  </div>
</nav>

## Login

Connect to the FormulaOne game as **formulaone4**:

```bash
ssh formulaone4@formulaone.labs.overthewire.org -p 2232
# password: (from previous level)
````

---

## Task

Find an exploit in the **formulaone5** binary that gives us the password for user **formulaone5**.

---

## Analyzing the Code

Here’s the vulnerable program (`nemo1.c`), left behind on the server:

```c
#include <stdio.h>
#include <stdlib.h>
#include <signal.h>
#include <string.h>

#define NBUFSIZ 1024

char *buf,*brrr;
void (*mfptrr)();
char buf2[NBUFSIZ];

void func1(char *arg)
{
    char envar[NBUFSIZ+1];
    strncpy(envar,arg,NBUFSIZ);
    envar[NBUFSIZ] = 0;
    printf("[*] Environment variable: %s\n",envar);
    return;
}

void int_handler()
{
    if(strlen(buf) >= NBUFSIZ -1) {
        exit(1);
    }
    memcpy(buf2,buf,strlen(buf)-1);
    printf("[+] Local buffer: %s.\n",buf2);
    mfptrr(0);
}

void cont_handler()
{
    printf("[+] :D\n");
    mfptrr(0);
}

void check_main(char **av)
{
    int a,b,c;
    char *home;
    long key;

    if(home = getenv("HOME")) {
        if(home[1]) {
            a = rand();
            b = (int)home[0];
            c = (int)home[1];
            key = a + b + c;
        }
    }

    if(key == 0xdeadbeef) {
        signal(SIGINT, int_handler);
        signal(SIGCONT, cont_handler);

        if(getenv("TIMER")) sleep(1);
        
        buf = malloc(NBUFSIZ + 1);
        strncpy(buf,av[1],NBUFSIZ);
        buf[NBUFSIZ] = 0;
    }

    return;
}

int main(int ac, char **av, char **env)
{
    char **tmp = env,*loc_brrr;
    mfptrr = exit;

    srand(0xcafebabe);

    if((long)&buf2 > (long)&mfptrr) {
        printf("[!] Sorry, it's unlikely you can exploit this with your version of gcc.\n");
        exit(1);
    }

    if(getenv("BUFFER")) buf = strdup(getenv("BUFFER"));
    if(getenv("TERM")) brrr = strdup(getenv("TERM"));

    while(*(++tmp)) func1(*tmp);
    check_main(av);

    return 1;
}
```

---

## Theory

This program sets up **signal handlers** (`SIGINT`, `SIGCONT`) and allows interaction with buffers of fixed size (`buf2`, `envar`). There is clearly a chance for **buffer overflow / pointer overwrite**.

However, the crucial piece is this runtime check:

```c
if((long)&buf2 > (long)&mfptrr) {
    printf("[!] Sorry, it's unlikely you can exploit this with your version of gcc.\n");
    exit(1);
}
```

This ensures the relative stack layout must match a specific pattern (pointer `mfptrr` below `buf2`). On modern GCC / glibc builds, this layout is different, so the exploit path doesn’t work anymore.

That means the challenge is tied to a **specific compiler and memory layout** from when the wargame was first released.

---

## Solution

1. The intended exploit path is to trigger a buffer overflow and overwrite the function pointer `mfptrr` so that it points to malicious code.
2. Unfortunately, the stack check aborts execution on modern systems:

   ```
   [!] Sorry, it's unlikely you can exploit this with your version of gcc.
   ```
3. This effectively blocks us unless we recompile with an older GCC that arranged variables differently.

So while we can inspect and understand the vulnerable code, we can’t practically exploit it on the current OTW servers.

---

## Conclusion

This is the last *playable* level of FormulaOne. The intended exploit (overwriting the function pointer after manipulating buffers + signals) only works on certain legacy GCC versions.

Because of that, the OverTheWire admins left the challenge code up as a curiosity, but it cannot be solved under the current server configuration.

It’s a slightly anti-climactic ending, but that’s the nature of older wargames — sometimes compilers and protections evolve, breaking old challenges.

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})
