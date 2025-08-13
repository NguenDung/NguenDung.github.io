---
layout: post
title: "OverTheWire Bandit — Complete Walkthrough Index"
permalink: /posts/overthewire/bandit-overview/
tags: [overthewire, bandit, walkthrough, ctf, linux, beginner]
description: "A full index of my OverTheWire Bandit walkthroughs — from Level 0 to Level 34 — including links, descriptions, and tips for beginners."
---

# OverTheWire Bandit — Complete Walkthrough Index

Halloo SuiiKawaii dessu!! Glad to see you again. This page is the **master index** for my Bandit walkthroughs — actually i don’t have much to say because the title and desciption already help you figure out what is this post about so yeah today we gonna do some OverTheWire Bandit 🗣️🔥🔥🔥🔥!!

![Suipad]({{ '/assets/images/bandit/suipad.gif' | relative_url }})

## Introduction

If you’re getting into **cybersecurity** or **ethical hacking**, [**OverTheWire**](https://overthewire.org/wargames/) <a href="https://overthewire.org/wargames/" target="_blank" rel="noopener">(open in new tab)</a> is one of the best beginner-friendly playgrounds.

![OTW]({{ '/assets/images/bandit/otw.jpg' | relative_url }})

**Bandit** is basically a fun Linux bootcamp disguised as a wargame. It starts simple (“how do I even log in?”) and ramps up to decoding, grepping, piping, and small forensics. You’ll build real skills you’ll reuse in CTFs, pentesting, and sysadmin work.

**Why start with Bandit?**
- **Hands-on** from minute one — no walls of theory.
- Builds real **Linux muscle memory**.
- Trains the **hacker mindset**: read, research, experiment.
- Totally **free** — just a terminal + internet.

By the end you’ll be comfortable with:
- Navigating the shell quickly.
- Hunting files, reading permissions, decoding formats.
- Chaining commands into powerful one-liners.

---

## About This Series

Each level has its **own post** with:

1. **Login Info** — how to connect for that level  
2. **Task** — the original OTW prompt  
3. **Theory** — short notes on the commands/concepts  
4. **Solution** — step-by-step, reproducible walkthrough

My goal isn’t to dump passwords but to show *why* each step works so you can solve similar problems on your own.

---

## How to Play Bandit (and actually learn)

1. **Read** the challenge carefully.  
2. **Try first**, then peek at hints if stuck.  
3. Use `man`/`--help` aggressively.  
4. Keep a **logbook** of commands, ideas, dead ends.  
5. **Fail fast**, retry until you can solve it without notes.  

Pro tip: the real magic is in **pipes** (`|`) and **redirection** (`>`, `>>`, `2>`).

---

## Levels Index (0 → 34)

Each link opens in a new tab. The one-liner tells you the main idea for that level.

- 🐣 **Level 0 — SSH Login**  
  <a href="{{ '/posts/OverTheWire-Bandit-Level-0/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — First SSH into the Bandit server.

- 📄 **Level 1 — Reading a File**  
  <a href="{{ '/posts/OverTheWire-Bandit-Level-1/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Use `cat` to read the password.

- 🌀 **Level 2 — Weird Filenames**  
  <a href="{{ '/posts/OverTheWire-Bandit-Level-2/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Handle names with spaces/special chars.

- 💬 **Level 3 — Spaces in Filenames**  
  <a href="{{ '/posts/OverTheWire-Bandit-Level-3/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Quote/escape filenames.

- 👀 **Level 4 — Hidden Files**  
  <a href="{{ '/posts/OverTheWire-Bandit-Level-4/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Reveal dotfiles with `ls -a`.

- 🧾 **Level 5 — File Types**  
  <a href="{{ '/posts/OverTheWire-Bandit-Level-5/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Identify with `file`.

- 📏 **Level 6 — Size & Permissions**  
  <a href="{{ '/posts/OverTheWire-Bandit-Level-6/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — `find` by size/owner/type.

- 🧍 **Level 7 — Owner/Group Search**  
  <a href="{{ '/posts/OverTheWire-Bandit-Level-7/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Search by ownership.

- 🔍 **Level 8 — Grep & Pipe**  
  <a href="{{ '/posts/OverTheWire-Bandit-Level-8/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Filter with `grep`.

- 🔄 **Level 9 — Unique Lines**  
  <a href="{{ '/posts/OverTheWire-Bandit-Level-9/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — `sort` + `uniq`.

- 💻 **Level 10 — Strings in Binary**  
  <a href="{{ '/posts/OverTheWire-Bandit-Level-10/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Extract text with `strings`.

- 🧩 **Level 11 — Base64**  
  <a href="{{ '/posts/OverTheWire-Bandit-Level-11/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Decode with `base64 -d`.

- 🔡 **Level 12 — Rot13 / Substitution**  
  <a href="{{ '/posts/OverTheWire-Bandit-Level-12/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Transform with `tr`.

- 🪄 **Level 13 — Hexdump Magic**  
  <a href="{{ '/posts/OverTheWire-Bandit-Level-13/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Recognize file types by hex.

- 🔑 **Level 14 — SSH Keys**  
  <a href="{{ '/posts/OverTheWire-Bandit-Level-14/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Login using a private key.

- 📡 **Level 15 — Netcat Basics**  
  <a href="{{ '/posts/OverTheWire-Bandit-Level-15/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Read from a TCP service.

- 📂 **Level 16 — Port Scanning**  
  <a href="{{ '/posts/OverTheWire-Bandit-Level-16/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Find the right port.

- 🕵️ **Level 17 — Diff Files**  
  <a href="{{ '/posts/OverTheWire-Bandit-Level-17/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Compare with `diff`.

- 🔐 **Level 18 — Hidden in Plain Sight**  
  <a href="{{ '/posts/OverTheWire-Bandit-Level-18/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Spot secrets in text.

- 📜 **Level 19 — Permissions Trick**  
  <a href="{{ '/posts/OverTheWire-Bandit-Level-19/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Exploit file permissions.

- 🛠️ **Level 20 — Netcat & Scripts**  
  <a href="{{ '/posts/OverTheWire-Bandit-Level-20/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Interact with a server script.

- 🔄 **Level 21 — Cron Jobs**  
  <a href="{{ '/posts/OverTheWire-Bandit-Level-21/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Abuse scheduled tasks.

- 🗂️ **Level 22 — Cron & Scripts**  
  <a href="{{ '/posts/OverTheWire-Bandit-Level-22/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Read what cron runs.

- 🧵 **Level 23 — More Cron Fun**  
  <a href="{{ '/posts/OverTheWire-Bandit-Level-23/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Chain cron scripts.

- ⚙️ **Level 24 — TCP & Scripts**  
  <a href="{{ '/posts/OverTheWire-Bandit-Level-24/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Connect to a custom TCP service.

- 📨 **Level 25 — SSH & Port Forwarding**  
  <a href="{{ '/posts/OverTheWire-Bandit-Level-25/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Forward ports with SSH.

- 📦 **Level 26 — Special Shells**  
  <a href="{{ '/posts/OverTheWire-Bandit-Level-26/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Escape restricted shells.

- 🧪 **Level 27 — Git Basics**  
  <a href="{{ '/posts/OverTheWire-Bandit-Level-27/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Clone and inspect a repo.

- 🕳️ **Level 28 — Git History**  
  <a href="{{ '/posts/OverTheWire-Bandit-Level-28/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Dig secrets from commits.

- 🗝️ **Level 29 — Git Tags**  
  <a href="{{ '/posts/OverTheWire-Bandit-Level-29/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Check tags for clues.

- 📖 **Level 30 — Git Branches**  
  <a href="{{ '/posts/OverTheWire-Bandit-Level-30/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Inspect branches.

- 🌀 **Level 31 — Git Remotes**  
  <a href="{{ '/posts/OverTheWire-Bandit-Level-31/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Explore remotes.

- 📚 **Level 32 — Bash Loops**  
  <a href="{{ '/posts/OverTheWire-Bandit-Level-32/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Automate with loops.

- 🧠 **Level 33 — Knowledge Check**  
  <a href="{{ '/posts/OverTheWire-Bandit-Level-33/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Combine previous skills.

- 🏁 **Level 34 — The End!**  
  <a href="{{ '/posts/OverTheWire-Bandit-Level-34/' | relative_url }}" target="_blank" rel="noopener">Read post →</a> — Final challenge 🎓

---

## Conclusion

There are tons of Bandit guides out there from other Blog to Youtube videos, but i made this series is **my** take with my own style of workflow, notes, and explanations. Even if you just skim, I hope it will helps you learn faster.

Finishing Bandit feels like leveling up from “Linux noob” to “terminal ninja” 🥷:
- The command line becomes a friendly tool.
- You can chain small utilities like LEGO bricks.
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