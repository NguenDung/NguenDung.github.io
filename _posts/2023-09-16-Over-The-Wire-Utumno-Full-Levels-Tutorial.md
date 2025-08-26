---
date: 2023-09-16 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Utumno — Complete Walkthrough Index"
permalink: /posts/Over-The-Wire-Utumno-Full-Levels-Tutorial/
tags: [overthewire, utumno, walkthrough, ctf, binary, exploitation]
description: "A full index of my OverTheWire Utumno walkthroughs — from Level 0 to Level 8 — including links, descriptions, and tips for binary exploitation learners."
excerpt_separator: <!--more-->
---

# OverTheWire Utumno — Complete Walkthrough Index

Halloo **SuiiKawaii** dessu!! Glad to see you again. This page is the **master index** for my Utumno walkthroughs — actually i don’t have much to say because the title and desciption already help you figure out what is this post about so yeah today we gonna do some OverTheWire Utumno 🗣️🔥🔥🔥🔥!!

![Sui]({{ '/assets/images/utumno/sui.gif' | relative_url }})

## Introduction

If you’re diving into **binary exploitation** or **low-level security challenges**, [**OverTheWire**](https://overthewire.org/wargames/) <a href="https://overthewire.org/wargames/" target="_blank" rel="noopener">(open in new tab)</a> is a fantastic playground.

![OTW]({{ '/assets/images/utumno/otw.jpg' | relative_url }})

**Utumno** focuses on **stack-based exploitation**. Compared to Bandit (Linux basics), Narnia (intro exploitation), or Behemoth (weird logic bugs), Utumno steps it up with harder stack smashing, function pointer overwrites, and memory tricks. It’s tough but super rewarding.

**Why play Utumno?**
- Learn **real exploit techniques** in a safe lab.
- Practice debugging with `gdb`/`strace`.
- See how tiny mistakes in C code = total pwnage.
- Builds a solid foundation for advanced wargames like **Protostar** or **ROP Emporium**.

By the end you’ll be comfortable with:
- Buffer overflows and memory corruption.
- Using `gdb` to analyze stack/heap state.
- Writing working exploits step by step.
- Thinking like a binary reverse engineer.

---

## About This Series

Each level has its **own post** with:

1. **Login Info** — how to connect for that level  
2. **Task** — the original OTW prompt  
3. **Theory** — notes on the bug type & C concepts  
4. **Solution** — step-by-step exploit until you get the next password  

My goal isn’t to just dump payloads but to show *why* they work — so you can develop real binary exploitation skills.

---

## How to Play Utumno (and actually learn)

1. **Read** the source code carefully.  
2. **Experiment** with different inputs.  
3. Use `gdb`, `objdump`, `ltrace`, `strace` to understand the binary.  
4. Keep a **notes file** with offsets, registers, shellcode.  
5. **Fail often**, retry until the exploit works reliably.  

Pro tip: never trust C functions like `gets`, `strcpy`, or unchecked buffers 😉

---

## Levels Index (0 → 8)

Each link opens in a new tab. The one-liner tells you the main exploit idea for that level.

- 🐣 **Level 0 — First Steps**  
  <a href="{{ '/posts/overTheWire-Utumno-Level-0/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Warm-up challenge, simple buffer overflow.

- 💻 **Level 0 → 1 — Smashing the Stack**  
  <a href="{{ '/posts/overTheWire-Utumno-Level-0-to-1/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Classic stack buffer overflow.

- 🔥 **Level 1 → 2 — Overwriting Variables**  
  <a href="{{ '/posts/overTheWire-Utumno-Level-1-to-2/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Modify control flow via buffer overwrite.

- 🎯 **Level 2 → 3 — Function Pointers**  
  <a href="{{ '/posts/overTheWire-Utumno-Level-2-to-3/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Exploit vulnerable function pointer usage.

- 🧵 **Level 3 → 4 — Off-by-One Fun**  
  <a href="{{ '/posts/overTheWire-Utumno-Level-3-to-4/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Tiny off-by-one leads to control.

- 🪓 **Level 4 → 5 — Format String Attack**  
  <a href="{{ '/posts/overTheWire-Utumno-Level-4-to-5/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Abuse `printf` with `%n`.

- 📦 **Level 5 → 6 — Return to Shellcode**  
  <a href="{{ '/posts/overTheWire-Utumno-Level-5-to-6/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Inject and execute shellcode.

- 🧩 **Level 6 → 7 — Return-to-libc**  
  <a href="{{ '/posts/overTheWire-Utumno-Level-6-to-7/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Bypass non-exec stack with libc.

- 🏁 **Level 7 → 8 — Final Boss**  
  <a href="{{ '/posts/overTheWire-Utumno-Level-7-to-8/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Complex exploitation chain, end of Utumno 🎓

---

## Conclusion

There are plenty of writeups out there, but this series is **my own take** — with my notes, thought process, and experiments. Hopefully it makes binary exploitation feel a bit less intimidating and a lot more fun.

Finishing Utumno feels like going from “overflow newbie” to “exploit padawan” ⚔️:
- You’ll see how small bugs lead to total compromise.  
- Debuggers will become your best friends.  
- You’ll be ready to tackle even harder games.  

**Next adventures:**  
- [Narnia](https://overthewire.org/wargames/narnia/) (intro exploitation)  
- [Behemoth](https://overthewire.org/wargames/behemoth/) (logic bugs & exploitation)  
- Advanced labs: [ROP Emporium](https://ropemporium.com/) / [pwnable.kr](https://pwnable.kr/)

Keep pwning, keep debugging, keep notes — **you got this** 💪

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

