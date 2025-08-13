---
layout: post
title: "OverTheWire Bandit — Complete Walkthrough Index"
permalink: /posts/overthewire/bandit-overview/
tags: [overthewire, bandit, walkthrough, ctf, linux, beginner]
description: "A full index of my OverTheWire Bandit walkthroughs — from Level 0 to Level 34 — including links, descriptions, and tips for beginners."
---

# OverTheWire Bandit — Complete Walkthrough Index
Halloo SuiiKawaii dessu!! I'm glad that we met again in this post and actually i don't have much to say because the title and desciption already help you figure out what is this post about so yeah today we gonna do some OverTheWire Bandit RRAHHHHHH 🗣️🔥🔥🔥🔥!!

![Suipad]({{ '/assets/images/bandit/suipad.gif' | relative_url }})

## Introduction

If you’re just starting out in **cybersecurity** or **ethical hacking**, one of the best beginner-friendly playgrounds you can jump into is [**OverTheWire**](https://overthewire.org/wargames/) <a href="https://overthewire.org/wargames/" target="_blank" rel="noopener">(open in new tab)</a>.

![OTW]({{ '/assets/images/bandit/otw.jpg' | relative_url }})

OverTheWire’s **Bandit** game is like a fun bootcamp for Linux + basic hacking skills. It’s beginner-friendly, but it sneaks in *real* skills you’ll use in CTFs, pentesting, or even day-to-day sysadmin work. The first few levels are like “How do I even ge![alt text](image.png)t in?”, and before you know it, you’re decoding, grepping, piping, and feeling like a command-line wizard 🧙.

**Why start with Bandit?**
- It’s **hands-on** from the first second — no theory walls.
- Builds real Linux muscle memory.
- Teaches you to read, research, and experiment (the hacker mindset).
- Totally **free** — just an internet connection and a terminal.

By the end, you’ll be more comfortable with:
- Navigating the command line like a pro.
- Hunting for files, reading permissions, decoding weird formats.
- Combining commands in clever one-liners.
- Feeling smug every time you use `grep` in the real world 😏.

---

## About This Series

This post is your **master index** for my OverTheWire Bandit walkthrough collection.  
Each level gets its own post with:

1. **Login Information** — how to connect to the server for that level.  
2. **Task** — the challenge prompt from OTW.  
3. **Theory** — short explanation of commands/concepts involved.  
4. **Solution** — step-by-step walkthrough.

My aim isn’t to just dump passwords, but to explain why each step works, so next time you can figure it out *yourself*.  

---

## How to Play Bandit (and actually learn)

Here’s the game plan:
1. **Read** the challenge carefully.  
2. **Try** on your own before peeking.  
3. Use `man` and `--help` like your life depends on it.  
4. Keep a **notebook** — commands, ideas, dead ends, wins.  
5. **Fail fast** and retry until you can solve it without hints.  

Pro tip: The magic of Bandit is in *piping* (`|`). You’ll chain commands and feel like you’re casting spells.

---

## Levels Index

Below is the full clickable index. Each link opens in a new tab. Icons = little mood for each challenge 🎯

- 🐣 **Level 0 — SSH Login**  
  <a href="https://nguendung.github.io/posts/OverTheWire-Bandit-Level-0/" target="_blank" rel="noopener">Read post →</a> — Connect to the Bandit server via SSH for the first time.

- 📄 **Level 1 — Reading a File**  
  <a href="LINK_HERE" target="_blank" rel="noopener">Read post →</a> — Use `cat` to read the password file.

- 🌀 **Level 2 — Weird Filenames**  
  <a href="https://nguendung.github.io/posts/OverTheWire-Bandit-Level-2/" target="_blank" rel="noopener">Read post →</a> — Handle filenames with spaces or special characters.

- 💬 **Level 3 — Spaces in Filenames**  
  <a href="https://nguendung.github.io/posts/OverTheWire-Bandit-Level-3/" target="_blank" rel="noopener">Read post →</a> — Quote or escape filenames to read them.

- 👀 **Level 4 — Hidden Files**  
  <a href="https://nguendung.github.io/posts/OverTheWire-Bandit-Level-4/" target="_blank" rel="noopener">Read post →</a> — Discover files starting with `.` using `ls -a`.

- 🧾 **Level 5 — File Types**  
  <a href="https://nguendung.github.io/posts/OverTheWire-Bandit-Level-5/" target="_blank" rel="noopener">Read post →</a> — Use `file` command to identify correct file.

- 📏 **Level 6 — Size & Permissions**  
  <a href="https://nguendung.github.io/posts/OverTheWire-Bandit-Level-6/" target="_blank" rel="noopener">Read post →</a> — Find files by size, owner, and type.

- 🧍 **Level 7 — Owner/Group Search**  
  <a href="https://nguendung.github.io/posts/OverTheWire-Bandit-Level-7/" target="_blank" rel="noopener">Read post →</a> — Search for files by ownership.

- 🔍 **Level 8 — Grep & Pipe**  
  <a href="https://nguendung.github.io/posts/OverTheWire-Bandit-Level-8/" target="_blank" rel="noopener">Read post →</a> — Filter content with `grep` and pipes.

- 🔄 **Level 9 — Unique Lines**  
  <a href="https://nguendung.github.io/posts/OverTheWire-Bandit-Level-9/" target="_blank" rel="noopener">Read post →</a> — Use `sort` + `uniq` to find unique strings.

- 💻 **Level 10 — Strings in Binary**  
  <a href="LINK_HERE" target="_blank" rel="noopener">Read post →</a> — Extract readable text with `strings`.

- 🧩 **Level 11 — Base64**  
  <a href="LINK_HERE" target="_blank" rel="noopener">Read post →</a> — Decode with `base64 -d`.

- 🔡 **Level 12 — Rot13**  
  <a href="LINK_HERE" target="_blank" rel="noopener">Read post →</a> — Decode text with `tr`.

- 🪄 **Level 13 — Hexdump Magic**  
  <a href="LINK_HERE" target="_blank" rel="noopener">Read post →</a> — Identify file types from hex.

- 🔑 **Level 14 — SSH Keys**  
  <a href="LINK_HERE" target="_blank" rel="noopener">Read post →</a> — Connect using a private key.

- 📡 **Level 15 — Netcat Basics**  
  <a href="LINK_HERE" target="_blank" rel="noopener">Read post →</a> — Grab data from a network service.

- 📂 **Level 16 — Port Scanning**  
  <a href="LINK_HERE" target="_blank" rel="noopener">Read post →</a> — Scan and connect to the correct port.

- 🕵️ **Level 17 — Diff Files**  
  <a href="LINK_HERE" target="_blank" rel="noopener">Read post →</a> — Compare files with `diff`.

- 🔐 **Level 18 — Hidden in Plain Sight**  
  <a href="LINK_HERE" target="_blank" rel="noopener">Read post →</a> — Spot password hidden in text.

- 📜 **Level 19 — Permissions Trick**  
  <a href="LINK_HERE" target="_blank" rel="noopener">Read post →</a> — Exploit file permissions to read files.

- 🛠️ **Level 20 — Netcat & Scripts**  
  <a href="LINK_HERE" target="_blank" rel="noopener">Read post →</a> — Use netcat to interact with scripts.

- 🔄 **Level 21 — Cron Jobs**  
  <a href="LINK_HERE" target="_blank" rel="noopener">Read post →</a> — Exploit scheduled tasks.

- 🗂️ **Level 22 — Cron & Scripts**  
  <a href="LINK_HERE" target="_blank" rel="noopener">Read post →</a> — Read scripts run by cron.

- 🧵 **Level 23 — More Cron Fun**  
  <a href="LINK_HERE" target="_blank" rel="noopener">Read post →</a> — Chain cron scripts for password.

- ⚙️ **Level 24 — TCP & Scripts**  
  <a href="LINK_HERE" target="_blank" rel="noopener">Read post →</a> — Connect to custom TCP service.

- 📨 **Level 25 — SSH & Port Forwarding**  
  <a href="LINK_HERE" target="_blank" rel="noopener">Read post →</a> — Forward ports with SSH.

- 📦 **Level 26 — Special Shells**  
  <a href="LINK_HERE" target="_blank" rel="noopener">Read post →</a> — Escape restricted shells.

- 🧪 **Level 27 — Git Basics**  
  <a href="LINK_HERE" target="_blank" rel="noopener">Read post →</a> — Clone a repo and read files.

- 🕳️ **Level 28 — Git History**  
  <a href="LINK_HERE" target="_blank" rel="noopener">Read post →</a> — Find secrets in commit history.

- 🗝️ **Level 29 — Git Tags**  
  <a href="LINK_HERE" target="_blank" rel="noopener">Read post →</a> — Look at tags for hidden info.

- 📖 **Level 30 — Git Branches**  
  <a href="LINK_HERE" target="_blank" rel="noopener">Read post →</a> — Check other branches for clues.

- 🌀 **Level 31 — Git Remotes**  
  <a href="LINK_HERE" target="_blank" rel="noopener">Read post →</a> — Inspect remote repos.

- 📚 **Level 32 — Bash Loops**  
  <a href="LINK_HERE" target="_blank" rel="noopener">Read post →</a> — Automate with loops.

- 🧠 **Level 33 — Knowledge Check**  
  <a href="LINK_HERE" target="_blank" rel="noopener">Read post →</a> — Combine skills from previous levels.

- 🏁 **Level 34 — The End!**  
  <a href="LINK_HERE" target="_blank" rel="noopener">Read post →</a> — Final challenge, graduation time!

---

## Conclusion

Finishing Bandit is like leveling up from “Linux noob” to “terminal ninja” 🥷.  
You’ll walk away knowing:
- The Linux command line is your friend (not scary).
- You can chain tools like LEGO bricks to solve problems.
- You *can* learn complex things if you break them into small steps.

**Next adventures after Bandit:**
- [Krypton](https://overthewire.org/wargames/krypton/) (crypto puzzles)  
- [Narnia](https://overthewire.org/wargames/narnia/) (binary exploitation)  
- [TryHackMe](https://tryhackme.com/) or [Hack The Box](https://www.hackthebox.com/) for more realistic labs.

Most important: Keep playing. Keep breaking things (in legal environments). Keep notes.  
And remember — **you got this** 💪

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

