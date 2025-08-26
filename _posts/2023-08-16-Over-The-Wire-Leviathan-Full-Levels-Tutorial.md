---
date: 2023-08-16 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Leviathan — Complete Walkthrough Index"
permalink: /posts/Over-The-Wire-Leviathan-Full-Levels-Tutorial/
tags: [overthewire, leviathan, walkthrough, ctf, linux, beginner, reversing, suid]
description: "A full index of my OverTheWire Leviathan walkthroughs — from Level 0 to Level 7 — including links, descriptions, and practical tips."
excerpt_separator: <!--more-->
---

# OverTheWire Leviathan — Complete Walkthrough Index

Halloo **SuiiKawaii** dessu!! Glad to see you again 💖  
This page is the **master index** for my Leviathan walkthroughs — basically your fast-track guide for every level from **0 → 7**.  

![Sui placeholder]({{ '/assets/images/leviathan/sui.gif' | relative_url }})

If Bandit was a Linux bootcamp 🐧 and Krypton was cipherland 🔐, then **Leviathan** is your first step into the world of **binary exploitation lite**: poking weird executables, abusing **SUID bits**, and tricking sloppy programs until they spill their secrets.  

So buckle up — it’s pain, suffer, sanity-burning… but 100% worth it 🗡️🐉🔥.  

---

## Introduction

If you want to explore **binary challenges** without diving straight into hardcore pwn, Leviathan is perfect. Here you’ll practice:

- Spotting and abusing **SUID** binaries  
- Recon with `strings`, `ltrace`, `strace`, `file`, `ldd`  
- Password discovery, config leaks, symlink tricks  
- Temp file abuse & sloppy file handling  

![Leviathan cover placeholder]({{ '/assets/images/leviathan/cover.jpg' | relative_url }})

By the end, you’ll be way more comfortable poking at executables like a hacker scientist 🧪.

---

## About This Series

Each level has its **own post** with:

1. **Login Info** — how to connect for that level  
2. **Task** — the original OTW description or screenshot  
3. **Theory** — short notes on the concept (SUID, path hijack, etc.)  
4. **Solution** — step-by-step walkthrough with reasoning  

I don’t just drop passwords — I show *why* things work, so you can reuse the tricks in CTFs or real assessments.

---

## How to Play Leviathan (and actually learn)

1. **List everything**: `ls -la`, `find . -type f -o -type d`  
2. **Probe binaries**: `file`, `strings`, `ldd`, `ltrace`, `strace`  
3. **Check SUID/SGID**: `find / -perm -4000 -type f 2>/dev/null`  
4. **Try inputs**: environment variables, symlinks, relative paths, weird filenames  
5. **Take notes**: commands, outputs, dead ends  

> Golden rule: if a binary runs **setuid**, your **inputs** (filenames, env, PATH) might be your exploit surface.  

---

## Levels Index (0 → 7)

Each link opens in a new tab. The one-liner gives you the main trick.

- 🐣 **Level 0 — SSH Login**  
  <a href="{{ '/posts/overTheWire-Leviathan-Level-0/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — First login & warm-up recon.  

- 🔍 **Level 0 → 1 — Hidden Files & Backups**  
  <a href="{{ '/posts/overTheWire-Leviathan-Level-0-to-1/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Hunt creds in world-readable backups/configs.  

- 🧵 **Level 1 → 2 — `strings` Saves the Day**  
  <a href="{{ '/posts/overTheWire-Leviathan-Level-1-to-2/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Inspect SUID binary; find hardcoded checks.  

- 🔗 **Level 2 → 3 — Path & Symlink Shenanigans**  
  <a href="{{ '/posts/overTheWire-Leviathan-Level-2-to-3/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Trick the binary into reading **your** file.  

- 🧪 **Level 3 → 4 — `ltrace`/`strace` Recon**  
  <a href="{{ '/posts/overTheWire-Leviathan-Level-3-to-4/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Watch library calls & extract compared strings.  

- 🔑 **Level 4 → 5 — Weak Auth Logic**  
  <a href="{{ '/posts/overTheWire-Leviathan-Level-4-to-5/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Abuse a broken password check.  

- 📦 **Level 5 → 6 — Temp Files & Loot**  
  <a href="{{ '/posts/overTheWire-Leviathan-Level-5-to-6/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — World-readable temp files FTW.  

- 🧰 **Level 6 → 7 — SUID + Shell Escapes**  
  <a href="{{ '/posts/overTheWire-Leviathan-Level-6-to-7/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Escape restricted tools into a shell.  

---

## Conclusion

Leviathan teaches you to **treat binaries as puzzles**. Instead of panicking at an unknown executable, you’ll calmly check its type, peek inside with `strings`, trace its calls, and then break it open.  

Finishing Leviathan feels like leveling up from “shell user” to “binary tinkerer” 🔧:
- You can quickly triage **SUID binaries**.  
- You know how to spy on program logic with tracing tools.  
- You’ve seen how **tiny mistakes** in code = game over.  

**Next adventures:**  
- [Narnia](https://overthewire.org/wargames/narnia/) (intro pwn)  
- [Behemoth](https://overthewire.org/wargames/behemoth/) (harder binex)  

Keep tinkering, keep breaking (legally!), and most of all — keep notes. You got this 💪  

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨  

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})
