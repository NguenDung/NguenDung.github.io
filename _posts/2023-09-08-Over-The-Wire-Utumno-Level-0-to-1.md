---
date: 2023-09-08 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Utumno Level 0 → 1 tutorial!!"
permalink: /posts/Over-The-Wire-Utumno-Level-0-to-1/
tags: [overthewire, utumno, pwn, ld_preload, binary-exploitation, linux, beginner]
description: "A step by step tutorial for OverTheWire Utumno Level 0 → 1!!"
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

<nav class="bandit-nav" aria-label="Utumno level navigation">
  <div class="nav-left">
    <a href="{{ '/posts/overTheWire-Utumno-Level-0/' | relative_url }}">← Previous: Level 0</a>
  </div>
  <div class="nav-center">
    <a href="https://overthewire.org/wargames/utumno/utumno1.html" target="_blank" rel="noopener">Official (Level 1) ↗</a>
  </div>
  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Utumno-Level-1-to-2/' | relative_url }}">Next: Level 1 → 2 →</a>
  </div>
</nav>

## Login

Use the starting credentials for **Utumno** to play `utumno0`. SSH runs on **port 2227** and the initial user/password is **utumno0 / utumno0** (official info). :contentReference[oaicite:0]{index=0}

```bash
ssh utumno0@utumno.labs.overthewire.org -p 2227
# password: utumno0
````

The game data lives in `/utumno/`, so jump there first. ([overthewire.org][1])

```bash
cd /utumno
```

---

## Task

Binary: **`/utumno/utumno0`**

* Executing it prints only a short message like `Read me! :P`.
* The file is **executable but not readable**, so you can’t inspect it with `gdb`, `objdump`, or `strings`.
* Goal: extract the password for **`utumno1`**.

We will **hook libc output** using `LD_PRELOAD` to intercept `puts()`/`printf()` and then peek at interesting pointers/strings inside the process. This technique is a common public solution for this level. ([BreakInSecurity][2])

---

## Source Code

There is **no source** provided for `utumno0` (and it is not readable). We’ll write a tiny **preload shim** to override `puts()` so we can inspect memory at runtime:

```c
// preload.c — override puts() to inspect the program at runtime
#include <stdio.h>

// build: gcc -m32 -fPIC -shared -o preload.so preload.c
int puts(const char *s){
    // Step 1: prove the hook runs
    // printf("hooked puts: %s\n", s);

    // Step 2: print words from the stack to harvest candidate addresses
    // printf("%08x.%08x.%08x.%08x.%08x.%08x.%08x.%08x.%08x.%08x\n");

    // Step 3: once you find promising addresses (e.g., 0x08048xxx),
    // print them as C-strings (adjust to what you discover):
    // printf("%s\n", (char*)0x08048402);
    // printf("%s\n", (char*)0x080484a5);
    // printf("%s\n", (char*)0x08048490);

    return 0; // keep original output suppressed; we only need the dump
}
```

> Why this works: `LD_PRELOAD` forces the dynamic linker to load our shared object first and prefer our `puts()` over libc’s, letting us instrument the program without read permissions. ([BreakInSecurity][2])

---

## Exploitation Steps

### 1) Confirm behavior & permissions

```bash
./utumno0
# Read me! :P

file ./utumno0
# executable, regular file, no read permission
```

(These observations are widely noted in public write-ups.) ([BreakInSecurity][2])

---

### 2) Build the hook

```bash
mkdir -p /tmp/u0 && cd /tmp/u0
nano preload.c         # paste the code above
gcc -m32 -fPIC -shared -o preload.so preload.c
```

---

### 3) Spray the stack to harvest addresses

```bash
# temporarily enable the "%08x..." line in puts(), then:
LD_PRELOAD=./preload.so /utumno/utumno0
# you'll see several 32-bit values; look for ones like 0x08048xxx
```

Those are likely `.text/.rodata` addresses. We’ll try to interpret a few of them as **strings**. ([BreakInSecurity][2])

---

### 4) Print candidate strings

Replace the `%08x` spray with `printf("%s\n", (char*)ADDR)` calls for the addresses you found (three examples often seen in public runs are `0x08048402`, `0x080484a5`, `0x08048490`). Then run:

```bash
LD_PRELOAD=./preload.so /utumno/utumno0
```

Typical output contains the original message and a **line with the password**, e.g.:

```
Read me! :P
password: aathaeyiew
```

This approach (and the example password string) appears in reputable public solutions. ([BreakInSecurity][2])

---

### 5) Profit

Use the discovered password to log in as the next user:

```bash
ssh utumno1@utumno.labs.overthewire.org -p 2227
# password: aathaeyiew
```

Note: passwords for each level are stored at `/etc/utumno_pass/utumnoX` on the box. ([BreakInSecurity][2])

---

## Password

From my run / common public solutions:

```
aathaeyiew
```

(If your dump shows a different value, use yours—addresses can vary.) ([BreakInSecurity][2])

---

## Quick One-liner

```bash
cd /tmp && mkdir u0 && cd u0 && cat > preload.c <<'EOF'
#include <stdio.h>
int puts(const char *s){
  printf("%s\n",(char*)0x08048402);
  printf("%s\n",(char*)0x080484a5);
  printf("%s\n",(char*)0x08048490);
  return 0;
}
EOF
gcc -m32 -fPIC -shared -o preload.so preload.c && LD_PRELOAD=./preload.so /utumno/utumno0
```

> Adjust the three addresses to whatever you harvested from your `%08x` stack spray. The technique is documented in public write-ups. ([BreakInSecurity][2])

---

## Troubleshooting

* **`LD_PRELOAD` seems ignored** → Ensure you launch exactly like `LD_PRELOAD=./preload.so /utumno/utumno0` (absolute or relative path to the target). ([BreakInSecurity][2])
* **No readable tool output** → That’s the point: the binary isn’t readable. Use the hook to dump pointers/strings at runtime. ([BreakInSecurity][2])
* **Different addresses** → Normal. First spray `%08x` to collect candidates, then print them as `%s`.
* **Where’s the game data?** → It’s under `/utumno/`. SSH is at `utumno.labs.overthewire.org:2227`, initial creds `utumno0/utumno0`. ([overthewire.org][1])

---

**Congrats 🎉** You just used **`LD_PRELOAD` function hooking** to extract a secret from a non-readable binary. On to **Level 1 → 2**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})
