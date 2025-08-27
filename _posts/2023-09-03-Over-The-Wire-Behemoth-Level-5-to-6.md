---
date: 2023-09-03 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Behemoth Level 5 → 6 tutorial!!"
permalink: /posts/overTheWire-Behemoth-Level-5-to-6/
tags: [overthewire, behemoth, exploitation, udp, sockets, walkthrough, ctf, linux, beginner]
description: "A full step-by-step detailed write-up for OverTheWire Behemoth Level 5 → 6!!"
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
    <a href="{{ '/posts/overTheWire-Behemoth-Level-4-to-5/' | relative_url }}">← Previous: Level 4 → 5</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/behemoth/behemoth6.html" target="_blank" rel="noopener">
      Official (Level 6) ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Behemoth-Level-6-to-7/' | relative_url }}">Next: Level 6 → 7 →</a>
  </div>
</nav>

## Login

Log in as **behemoth5** using the password you obtained from Level 4 → 5.

```bash
ssh behemoth5@behemoth.labs.overthewire.org -p 2221
# password: aizeeshing
````

---

## Task

The binary **`/behemoth/behemoth5`** looks like it’s trying to open the next password file, but fails.
Instead, it sets up a UDP socket and **sends the password over the network**.
Your job: capture that UDP message to read the password for **behemoth6**.

---

## A little bit of Theory

* `socket(AF_INET, SOCK_DGRAM, 0)` → creates an IPv4 UDP socket.
* UDP is connectionless: the program just **sends data** to a port.
* We can use `strace`, `ltrace` or `gdb` to confirm:

  * it tries `fopen("/etc/behemoth_pass/behemoth6")` (fails because not owned).
  * then it creates a UDP socket and calls `sendto()`.
* By running our own UDP listener on the same port, we can intercept the packet.

---

## Solution

### 1. Run the binary normally

```bash
cd /behemoth
./behemoth5
```

It exits instantly with no output. Suspicious.

---

### 2. Trace library/system calls

```bash
ltrace ./behemoth5
```

Key output:

```
fopen("/etc/behemoth_pass/behemoth6", "r") = 0
socket(2, 2, 0)                           = 3
atoi("1337")                              = 1337
sendto(3, "mayiroeche\n", 11, 0, ..., 16) = 11
```

👉 This shows exactly what happens:

1. `fopen` fails (returns 0).
2. `socket(2,2,0)` → IPv4, UDP.
3. Port parsed with `atoi("1337")`.
4. `sendto()` actually transmits the string `"mayiroeche\n"`.

---

### 3. Confirm with `gdb` (optional)

```bash
gdb -q ./behemoth5
(gdb) disas main
```

Inside you’ll see calls to `socket`, `atoi("1337")`, and `sendto`.
This confirms the UDP behavior and port number.

---

### 4. Capture the UDP traffic

Open two shells (or tmux panes):

* **Shell A**: set up UDP listener on port 1337.

```bash
nc -ulp 1337
```

* **Shell B**: run the binary.

```bash
/behemoth/behemoth5
```

Back in Shell A, you should see:

```
mayiroeche
```

That’s the password for the next level 🎉

---

## Password

```
mayiroeche
```

---

## Troubleshooting

* **Nothing received** → make sure you start `nc -ulp 1337` **before** running the binary.
* **Different netcat** → try `ncat -ul 1337` (Nmap’s netcat) or `socat - UDP-RECV:1337`.
* **Still no output** → confirm the port by running `strings ./behemoth5 | grep 1337`.
* **Firewall issues** → not likely in OTW labs, but locally make sure UDP/1337 isn’t blocked.

---

## Copy-paste quick run

```bash
ssh behemoth5@behemoth.labs.overthewire.org -p 2221
# password: aizeeshing

# Terminal 1
nc -ulp 1337

# Terminal 2
/behemoth/behemoth5
# → Terminal 1 prints: mayiroeche
```

---

**Congrats 🎉** You captured a UDP packet sent by the binary and extracted the password for **behemoth6**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})