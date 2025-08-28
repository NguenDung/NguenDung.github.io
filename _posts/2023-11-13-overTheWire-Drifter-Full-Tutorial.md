---
date: 2025-08-28 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Drifter — Complete Walkthrough Index"
permalink: /posts/overTheWire-Drifter-Full-Levels-Tutorial/
tags: [overthewire, drifter, walkthrough, ctf, linux, beginner]
description: "A full index of my OverTheWire Drifter walkthroughs — from Level 0 to Level 15 — including links, descriptions, and tips."
excerpt_separator: <!--more-->
---

# OverTheWire Drifter — Complete Walkthrough Index

Halloo **SuiiKawaii** dessu!! Glad to see you again. This page is the **master index** for my Drifter walkthroughs — actually i don’t have much to say because the title and desciption already help you figure out what is this post about so yeah today we gonna do some OverTheWire Drifter 🗣️🔥🔥🔥🔥!!

![Suipad]({{ '/assets/images/drifter/suipad.gif' | relative_url }})

## Introduction

If you’re getting into **cybersecurity** or **ethical hacking**, [**OverTheWire**](https://overthewire.org/wargames/) <a href="https://overthewire.org/wargames/" target="_blank" rel="noopener">(open in new tab)</a> is one of the best beginner-friendly playgrounds.

![OTW]({{ '/assets/images/drifter/otw.jpg' | relative_url }})

**Drifter** focuses on low-level exploitation and reversing: remote syscalls, classic memory bugs, format strings, ASLR bypass, and protocol shenanigans. It’s perfect to sharpen binary-thinking and build comfort with RE tools.

**Why play Drifter?**
- **Hands-on** with binaries, sockets, and syscalls.
- Blend of **RE + exploitation** (heap/stack/format strings).
- Trains careful **reading of specs & source**.
- Totally **free** — just a terminal + internet.

By the end you’ll be comfortable with:
- Disassembling/inspecting ELF binaries.
- Reasoning about memory layouts and mitigations.
- Building tiny clients to speak custom services.

---

## About This Series

Each level has its **own post** with:

1. **Login Info** — how to connect for that level  
2. **Task** — the original OTW prompt  
3. **Theory** — short notes on the commands/concepts  
4. **Solution** — step-by-step, reproducible walkthrough

My goal isn’t to dump passwords but to show *why* each step works so you can solve similar problems on your own.

---

## How to Play Drifter (and actually learn)

1. **Read** the challenge carefully.  
2. **Try first**, then peek at hints if stuck.  
3. Use `man`/`--help` aggressively.  
4. Keep a **logbook** of commands, ideas, dead ends.  
5. **Fail fast**, retry until you can solve it without notes.  

Pro tip: get comfy with a disassembler and a debugger; small RE loops beat guesswork.

---
## Levels Index (0 → 15)

Each link opens in a new tab. The one-liner tells you the main idea for that level.

- 🐣 **Level 0 — Encrypted Remote Syscalls**  
  <a href="{{ '/posts/overTheWire-Drifter-Level-0/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — RC4-keyed syscall proxy; read `drifter0.password`.

- 📦 **Level 0 → 1 — C++ Heap Corruption**  
  <a href="{{ '/posts/overTheWire-Drifter-Level-0-to-1/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — File parsing bug; vptr/heap shenanigans.

- 🧵 **Level 1 → 2 — Stack Overflow (no execve)**  
  <a href="{{ '/posts/overTheWire-Drifter-Level-1-to-2/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Overflow with a debugging side-effect; plan around it.

- 🧱 **Level 2 → 3 — Remote Heap Corruption**  
  <a href="{{ '/posts/overTheWire-Drifter-Level-2-to-3/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Old `malloc` behavior makes life easier.

- 🧭 **Level 3 → 4 — Small RE Challenge**  
  <a href="{{ '/posts/overTheWire-Drifter-Level-3-to-4/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Mind the resource limits.

- 🧮 **Level 4 → 5 — Logic/Math Mini-Games**  
  <a href="{{ '/posts/overTheWire-Drifter-Level-4-to-5/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Game 3 is solvable; RE helps.

- 🧰 **Level 5 → 6 — Format-String Daemon**  
  <a href="{{ '/posts/overTheWire-Drifter-Level-5-to-6/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Classic `%n`-style fun on a remote service.

- 🗺️ **Level 6 → 7 — Start Your Disassemblers**  
  <a href="{{ '/posts/overTheWire-Drifter-Level-6-to-7/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — IDA/Ghidra time.

- 🔎 **Level 7 → 8 — Phrack Search Daemon**  
  <a href="{{ '/posts/overTheWire-Drifter-Level-7-to-8/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Bug hunt without source; custom shellcode likely.

- 🧗 **Level 8 → 9 — Priv-Esc & Secret Format**  
  <a href="{{ '/posts/overTheWire-Drifter-Level-8-to-9/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Decode a custom format; exploit oversights.

- 🛡️ **Level 9 → 10 — NX Stack Practice**  
  <a href="{{ '/posts/overTheWire-Drifter-Level-9-to-10/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Reverser mode: non-exec stack hurdles.

- 🎲 **Level 10 → 11 — Beat Randomisation**  
  <a href="{{ '/posts/overTheWire-Drifter-Level-10-to-11/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — ASLR on base + stack; find a way.

- 🛰️ **Level 11 → 12 — RPC-Style RE**  
  <a href="{{ '/posts/overTheWire-Drifter-Level-11-to-12/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Reverse a remote procedure protocol.

- 🧠 **Level 12 → 13 — Rethink the Impossible**  
  <a href="{{ '/posts/overTheWire-Drifter-Level-12-to-13/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Challenge assumptions; get creative.

- 🧩 **Level 13 → 14 — 3rd-Party Library Bug**  
  <a href="{{ '/posts/overTheWire-Drifter-Level-13-to-14/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Main vuln lives in a bundled library.

- 🏁 **Level 14 → 15 — Final: “Explosive Decompression”**  
  <a href="{{ '/posts/overTheWire-Drifter-Level-14-to-15/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Wrap-up challenge 💥

---

## Conclusion

There are tons of guides out there from other Blog to Youtube videos, but i made this series is **my** take with my own style of workflow, notes, and explanations. Even if you just skim, I hope it will helps you learn faster.

Finishing Drifter feels like leveling up your **RE + pwn** toolkit 🧠:
- Syscalls and memory bugs stop being scary.
- You can build tiny tools to speak weird services.
- You *can* learn anything by slicing it into tiny, winnable steps.

**Next adventures:**  
- [Krypton](https://overthewire.org/wargames/krypton/) (crypto)  
- [Narnia](https://overthewire.org/wargames/narnia/) (binary exploitation)  
- Labs: [TryHackMe](https://tryhackme.com/) / [Hack The Box](https://www.hackthebox.com/)

Keep playing, keep breaking (legally!), keep notes — **you got this** 💪

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})
