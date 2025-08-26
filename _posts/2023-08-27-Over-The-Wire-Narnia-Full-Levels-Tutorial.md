---
date: 2023-08-27 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Narnia — Complete Walkthrough Index"
permalink: /posts/Over-The-Wire-Narnia-Full-Levels-Tutorial/
tags: [overthewire, narnia, pwn, overflow, binary-exploitation, linux, beginner]
description: "A full index of my OverTheWire Narnia walkthroughs — from Level 0 to Level 9 — including links, short descriptions, and practical tips."
excerpt_separator: <!--more-->
---

# OverTheWire Narnia — Complete Walkthrough Index

Halloo **SuiiKawaii** dessu!! Welcome back. This page is the **master index** for my Narnia walkthroughs — today we’re diving into classic **binary exploitation** on Linux: overflows, format strings, env tricks, and SUID shells 🗣️🔥🔥🔥!!

![Sui]({{ '/assets/images/narnia/sui.gif' | relative_url }})

## Introduction

If you’re aiming at **pwn** / **binary exploitation**, [**OverTheWire**](https://overthewire.org/wargames/) <a href="https://overthewire.org/wargames/" target="_blank" rel="noopener">(open in new tab)</a> has a timeless mini‑course called **Narnia**.

![OTW]({{ '/assets/images/narnia/otw.jpg' | relative_url }})

**Narnia** introduces core exploitation ideas in small, digestible levels:
- Stack overflows & endianness
- Shellcode via **environment variables**
- Format string bugs (read/write memory)
- SUID privilege escalation patterns

By the end, you’ll be comfortable reading C sources, spotting bug patterns, and turning them into shells.

---

## About This Series

Each level has its **own post** with:

1. **Login / Setup** — how to connect and where binaries live  
2. **Task** — the original OTW prompt  
3. **Source Review** — highlight the exact lines that matter  
4. **Exploit** — step‑by‑step with copy‑paste commands

My goal isn’t to dump passwords; it’s to teach you to think like a debugger: reproduce → inspect → exploit → verify.

---

## How to Play Narnia (and actually learn)

1. **Read** the C source carefully; mark dangerous calls (`gets`, `strcpy`, `scanf`, `printf` with user input).  
2. **Rebuild mentally**: where does data go? how big are buffers? what’s next on the stack?  
3. Use tooling: `strings`, `objdump -d`, `file`, `ltrace`, `strace`, `gdb` (pwndbg/peda), `readelf -a`.  
4. Remember **endianness** and **alignment**.  
5. Keep a **lab notebook**: offsets, payloads, crash notes, and successful runs.

Pro tip: keep stdin open after spawning shells (e.g., `...; cat`) so your SUID shell stays interactive.

---

## Levels Index (0 → 9)

Each link opens in a new tab. The one‑liner tells you the main idea.

- 🐣 **Level 0 — Setup & Tour**  
  <a href="{{ '/posts/overTheWire-Narnia-Level-0/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — SSH in, find `/narnia/` binaries & sources.

- 💥 **Level 0 → 1 — Tiny Stack Overflow**  
  <a href="{{ '/posts/overTheWire-Narnia-Level-0-to-1/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Overflow a small buffer and flip a sentinel value to win a shell.

- 🥚 **Level 1 → 2 — Env Var + Shellcode**  
  <a href="{{ '/posts/overTheWire-Narnia-Level-1-to-2/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Put shellcode in `EGG` and jump to it from a SUID binary.

- 🧱 **Level 2 → 3 — Safer‑looking, Still Overflow**  
  <a href="{{ '/posts/overTheWire-Narnia-Level-2-to-3/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Classic overflow with “harmless” functions; control execution reliably.

- 🧾 **Level 3 → 4 — Format String (Intro)**  
  <a href="{{ '/posts/overTheWire-Narnia-Level-3-to-4/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Leak addresses / memory with `%x` / `%s`.

- 🪄 **Level 4 → 5 — Format String (Write Primitive)**  
  <a href="{{ '/posts/overTheWire-Narnia-Level-4-to-5/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Use `%n` to write and redirect control flow.

- 🧗 **Level 5 → 6 — ret2libc Basics**  
  <a href="{{ '/posts/overTheWire-Narnia-Level-5-to-6/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Call `system("/bin/sh")` with libc gadgets.

- 🧰 **Level 6 → 7 — Off‑by‑One & Stack Layout**  
  <a href="{{ '/posts/overTheWire-Narnia-Level-6-to-7/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — A single byte can shift control; mind saved registers.

- 🗝️ **Level 7 → 8 — PATH / Command Injection Quirk**  
  <a href="{{ '/posts/overTheWire-Narnia-Level-7-to-8/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Abuse insecure `system()` / PATH resolution for SUID escalation.

- 🛡️ **Level 8 → 9 — ASLR Dance & Final Shell**  
  <a href="{{ '/posts/overTheWire-Narnia-Level-8-to-9/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Combine leaks + calculated addresses to pop the last shell.

---

## Conclusion

There are tons of Narnia guides online, but this series is **my** workflow: minimal theory, maximum reproducibility, and just enough tooling to build intuition.

Finishing Narnia levels gives you a real pwn foundation:
- You can read C sources and **predict bugs**.  
- You know how to **prove** a bug with small, surgical payloads.  
- SUID + shellcode + format strings stop being scary — they’re just **puzzles**.

**Next adventures:**  
- [Leviathan](https://overthewire.org/wargames/leviathan/) (Linux privilege tricks)  
- [Krypton](https://overthewire.org/wargames/krypton/) (crypto)  
- Platforms: [pwn.college](https://pwn.college/) / [TryHackMe](https://tryhackme.com/) / [Hack The Box](https://www.hackthebox.com/)

Keep tinkering, keep notes, and keep it legal. You got this 💪

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

