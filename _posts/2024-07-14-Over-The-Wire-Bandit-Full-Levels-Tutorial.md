---
layout: post
title: "OverTheWire Bandit — Complete Walkthrough Index"
permalink: /posts/overthewire/bandit-overview/
tags: [overthewire, bandit, walkthrough, ctf, linux, beginner]
description: "A full index of my OverTheWire Bandit walkthroughs — from Level 0 to Level 34 — including links, descriptions, and tips for beginners."
---

# OverTheWire Bandit — Complete Walkthrough Index

## Introduction

If you’re just starting out in **cybersecurity** or **ethical hacking**, one of the best beginner-friendly resources you can try is [**OverTheWire**](https://overthewire.org/wargames/) <a href="https://overthewire.org/wargames/" target="_blank" rel="noopener">(open in new tab)</a>.  

OverTheWire offers “**wargames**” — interactive, command-line based challenges where you connect to a remote server and solve puzzles that teach you core security and Linux skills.  

Among all the wargames, **Bandit** is the recommended starting point for complete beginners.

**Why start with Bandit?**
- It **teaches you Linux fundamentals** in a hands-on way.
- Covers commands and concepts you’ll use every day in pentesting, CTFs, and sysadmin work.
- Starts from the very basics (logging in via SSH) and gradually increases difficulty.
- 100% **free** — all you need is a terminal and internet access.
- Encourages **problem-solving and research skills** instead of spoon-feeding answers.

By completing Bandit, you’ll gain:
- Confidence in navigating Linux from the command line.
- Familiarity with file permissions, searching, encoding/decoding, and basic scripting.
- A strong foundation for moving on to harder games like **Narnia**, **Krypton**, or external platforms like **TryHackMe** and **Hack The Box**.

---

## About This Series

This post is a **master index** for my full **OverTheWire Bandit** walkthrough collection.  
Each **level** has its own dedicated post, where I break it down into:

1. **Login Information** — how to connect to the server for this level.  
2. **Task** — the exact challenge description.  
3. **Theory** — explanations of key commands and concepts relevant to the solution.  
4. **Solution** — a step-by-step guide to solving the level, with command examples and reasoning.

My goal is **not** to just give you the flag, but to explain *why* each step works, so you understand the underlying concepts and can apply them elsewhere.

---

## How to Approach Bandit

Here’s my recommended workflow for each level:
1. **Read the task carefully** — note the keywords (e.g., “hidden file”, “base64”).
2. **Try to solve it on your own first** — use `man` pages and `--help`.
3. **Document your commands** — keep a notebook with what you tried and why.
4. **Only read the solution after trying** — you’ll learn more from mistakes.
5. **Re-run the commands** until you can solve it without looking.

**Tip:** Many Bandit levels require chaining commands with pipes (`|`). This is a good time to start thinking about building efficient one-liners.

---

## Levels Index

Below is the clickable index for all Bandit levels. Each link will open in a new tab and contains the login info, task description, theory, and solution.

- **Level 0 — SSH Login**  
  <a href="/posts/overthewire/bandit/level-0" target="_blank" rel="noopener">Read post →</a> — Learn how to connect to the Bandit game server via SSH.

- **Level 1 — Reading a File**  
  <a href="/posts/overthewire/bandit/level-1" target="_blank" rel="noopener">Read post →</a> — Use `cat` to read files and retrieve the password.

- **Level 2 — Unusually Named Files**  
  <a href="/posts/overthewire/bandit/level-2" target="_blank" rel="noopener">Read post →</a> — Handle filenames with spaces or special characters.

- **Level 3 — Spaces in Filenames**  
  <a href="/posts/overthewire/bandit/level-3" target="_blank" rel="noopener">Read post →</a> — Quoting and escaping filenames.

- **Level 4 — Hidden Files**  
  <a href="/posts/overthewire/bandit/level-4" target="_blank" rel="noopener">Read post →</a> — Use `ls -a` to discover hidden files.

- **Level 5 — File Types, Human-readable Files**  
  <a href="/posts/overthewire/bandit/level-5" target="_blank" rel="noopener">Read post →</a> — Learn `file` command to identify file content.

- **Level 6 — Filtering by Size & Permissions**  
  <a href="/posts/overthewire/bandit/level-6" target="_blank" rel="noopener">Read post →</a> — Find files based on size and type.

- **Level 7 — Grep for Specific Owner/Group**  
  <a href="/posts/overthewire/bandit/level-7" target="_blank" rel="noopener">Read post →</a> — Search files by ownership.

- **Level 8 — Grep & Piping**  
  <a href="/posts/overthewire/bandit/level-8" target="_blank" rel="noopener">Read post →</a> — Use `grep` with pipelines to filter data.

- **Level 9 — Uniq & Sorting**  
  <a href="/posts/overthewire/bandit/level-9" target="_blank" rel="noopener">Read post →</a> — Find unique lines in a file.

- **Level 10 — The `strings` Command**  
  <a href="/posts/overthewire/bandit/level-10" target="_blank" rel="noopener">Read post →</a> — Extract human-readable text from binaries.

- **Level 11 — Base64 Encoding/Decoding**  
  <a href="/posts/overthewire/bandit/level-11" target="_blank" rel="noopener">Read post →</a> — Decode base64 strings.

- **Level 12 — Rot13 Cipher**  
  <a href="/posts/overthewire/bandit/level-12" target="_blank" rel="noopener">Read post →</a> — Decode using the `tr` command.

- **Level 13 — Hexdumps & File Signatures**  
  <a href="/posts/overthewire/bandit/level-13" target="_blank" rel="noopener">Read post →</a> — Identify file types via magic numbers.

- **Level 14 — SSH Keys & File Transfer**  
  <a href="/posts/overthewire/bandit/level-14" target="_blank" rel="noopener">Read post →</a> — Authenticate via SSH key and transfer files.

- **Level 15 — Netcat Basics**  
  <a href="/posts/overthewire/bandit/level-15" target="_blank" rel="noopener">Read post →</a> — Connect to a service and read its output.

*(…and so on, up to Level 34, following the same structure)*

---

## Conclusion

Completing Bandit is like completing your **Linux hacker bootcamp**. By the time you reach Level 34, you’ll have:
- Comfort with the Linux command line.
- The ability to chain tools together to solve problems.
- The mindset to read, explore, and experiment — the core hacker skills.
- Inshort now you should be able to using linux and control it!! yess linux iss an OS that give user the ability to do anything you have all the power to do it even delete your own OS it wont even stop you :DD try ricing to customize your UI it peak! as long as you know what you doing then linux is for you ngl when you get used to it using linux is pretty addicted and you dont even want to comeback to window but im still stick to window because i play games 

**Next Steps after Bandit:**
- [Krypton](https://overthewire.org/wargames/krypton/) <a href="https://overthewire.org/wargames/krypton/" target="_blank" rel="noopener">(Crypto-focused)</a>  
- [Narnia](https://overthewire.org/wargames/narnia/) <a href="https://overthewire.org/wargames/narnia/" target="_blank" rel="noopener">(Binary exploitation)</a>  
- External platforms like [TryHackMe](https://tryhackme.com/) <a href="https://tryhackme.com/" target="_blank" rel="noopener">or</a> [Hack The Box](https://www.hackthebox.com/) <a href="https://www.hackthebox.com/" target="_blank" rel="noopener">(realistic boxes)</a>.

Remember: **Don’t rush!!** It’s better to deeply understand 5 commands than to know 50 shallowly.  
Take notes, try variations, and keep experimenting.

---

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})
