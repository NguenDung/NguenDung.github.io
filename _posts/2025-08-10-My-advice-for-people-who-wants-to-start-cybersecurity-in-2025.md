---
layout: post
title: "My Advice for Self-Learning Cybersecurity (Red Team Track): A Practical Roadmap"
permalink: /posts/how-i-self-learned-cybersec/
tags: [guide, roadmap, red-team, ctf, web, crypto, forensics, osint]
description: "A realistic, beginner-friendly path: sniff-test with YouTube, learn on interactive platforms, start CTFs, find communities, read the right books, consider certs, and—above all—be patient and persistent."
excerpt_separator: <!--more-->
---

# My Advice for Self-Learning Cybersecurity (Red Team Track): A Practical Roadmap

Halloo!! It’s an honor to see you again on the blog. As the title suggests, here’s how I learned cybersecurity from scratch. Of course, beyond what I learned at school, with IT in general—and security in particular—if we want to get good, we have to **self-study** and spend time exploring.

![Suihi]({{ '/assets/images/advice/suihi.gif' | relative_url }})

Before we begin: this is **my personal experience**. It may fit some people and not others, so don’t treat it as absolute truth—use it as a reference. Everyone’s starting point and journey are different, but I hope you’ll find something useful here. If you’re wondering where to start in cybersecurity, here’s what worked for me. It’s simple on purpose: **try the vibe first**, then **practice in the browser**, then **play CTFs**, **meet people**, **read a few great books**, and **optionally** get certified. Most progress came from **consistency**, not talent.

---

## What “cybersecurity” actually means (and where you can go)

**Cybersecurity (CyberSec)** protects information and systems from unauthorized access, use, disclosure, disruption, modification, or destruction—so we preserve **Confidentiality, Integrity, Availability** (the CIA triad).

Common paths:
- **Red Team (offense):** simulate real attacks and demonstrate impact.  
- **Blue Team (defense):** detect, respond, contain, recover.  
- **Purple Team:** the collaboration loop—reds share TTPs; blues tune detections; both improve.

![Path]({{ '/assets/images/advice/path.jpg' | relative_url }})

> There are many sub-paths, but most roles map back to these three big lanes.

Personally, I’m on the **Red** path—yet I learn fastest when I collaborate with defenders. The path you choose doesn’t matter as long as you **enjoy it** and **get good at it**. If that’s true, you’re good to go!!

- **Cyber Jutsu — InfoSec Roadmap (VN)**  
  [cbjs-exploit101-notebook.notion.site/Roadmap-h-c-ATTT-bc5ce41bac2c4d24a2e93c4a08fdb052](https://cbjs-exploit101-notebook.notion.site/Roadmap-h-c-ATTT-bc5ce41bac2c4d24a2e93c4a08fdb052){:target="_blank" rel="noopener"}

---

## Step 0 — Sniff-test with YouTube (do you actually like this?)

Spend a weekend with a few creators. If their mindset clicks, you’ll enjoy the grind that follows.

- **LiveOverflow** — clear fundamentals, CTF culture, real hacker thinking.  
  Channel: [youtube.com/LiveOverflow](https://www.youtube.com/LiveOverflow){:target="_blank" rel="noopener"}
- **John Hammond** — approachable walkthroughs, incident analysis, timely topics.  
  Channel: [@_JohnHammond](https://www.youtube.com/@_JohnHammond){:target="_blank" rel="noopener"}
- **IppSec** — legendary **Hack The Box** walkthroughs; methodology over magic.  
  Channel: [IppSec](https://www.youtube.com/channel/UCa6eh7gCkpPo5XXUDfygQQA){:target="_blank" rel="noopener"}
- **STÖK** — bug bounty mindset, reporting, and “how hackers think”.  
  Channel: [@stokfredrik](https://www.youtube.com/@stokfredrik){:target="_blank" rel="noopener"}

There are **a lot** more good channels (NetworkChuck, David Bombal, Mad Hat, Bog, The Cyber Mentor, CyberFlow…). Just be careful not to get stuck in the **tutorial loop**. If you binge 12-hour tutorials and never try things yourself, you won’t level up—you can’t even do basic steps without opening a video. Spend time **doing**: break something, then fix it. That’s learning!

- **Why EVERY “Beginner Hacking Guide” is a TRAP!**  
  [youtube.com/watch?v=4-CHU6cWfWA](https://www.youtube.com/watch?v=4-CHU6cWfWA){:target="_blank" rel="noopener"}

- **Why I Don’t Watch Hacking Tutorials Anymore.**  
  [youtube.com/watch?v=uAsxBEQLmjI](https://www.youtube.com/watch?v=uAsxBEQLmjI){:target="_blank" rel="noopener"}

**How to watch:** pick one video, pause often, replicate the steps in a lab, and write down **exactly** what you did and **why**. Practice asking: *“Why did they do that? What does it achieve? Is there another way?”* That mindset matters in a field that changes daily.

---

## Step 1 — Learn on interactive platforms (browser-based labs)

I recommend starting with **web security**: it’s everywhere and gives quick wins to build confidence.

- **PortSwigger Web Security Academy (free)** — the best first-principles path with hands-on labs:  
  [portswigger.net/web-security](https://portswigger.net/web-security){:target="_blank" rel="noopener"}

![Ps]({{ '/assets/images/advice/ps.jpg' | relative_url }})

- **TryHackMe** — guided rooms and gamified tracks for daily reps:  
  [tryhackme.com](https://tryhackme.com/){:target="_blank" rel="noopener"}

![Thm]({{ '/assets/images/advice/thm.jpg' | relative_url }})

- **Hack The Box / HTB Academy** — realistic boxes and structured skill paths once you have basics:  
  [hackthebox.com](https://www.hackthebox.com/){:target="_blank" rel="noopener"} and [academy.hackthebox.com](https://academy.hackthebox.com/){:target="_blank" rel="noopener"}

![Htb]({{ '/assets/images/advice/htb.jpg' | relative_url }})

**Notebook rule** (one per topic: Web/Crypto/Forensics/OSINT):  
*Goal → Steps/requests → Payloads/commands → Screenshots → What I’d try first next time.*

---

## Step 2 — Start playing CTFs (this is where growth compounds)

**Capture the Flag (CTF)** is a competition format where challenges hide a **flag** (e.g., `flag{...}`) you must find by exploiting a vulnerability or analyzing evidence. It’s how many hackers learn breadth—fast.

![Ctf]({{ '/assets/images/advice/ctf.jpg' | relative_url }})

Types you’ll see:
- **Jeopardy-style:** independent challenges (web, crypto, pwn, forensics, OSINT…).  
- **Attack-Defense:** teams attack others’ services while defending their own.

Where to play & track progress:
- **CTFtime** (events & ratings): [ctftime.org](https://ctftime.org/){:target="_blank" rel="noopener"}  
- **OverTheWire** (wargames): [overthewire.org/wargames](https://overthewire.org/wargames/){:target="_blank" rel="noopener"}  
- **picoCTF** (beginner-friendly): [picoctf.org](https://picoctf.org/){:target="_blank" rel="noopener"}

Create or join a team. Treat events as *structured practice*, not pass/fail.

**My focus & starter toolbelt (copyable):**
- **Web:** Burp Suite, ffuf / feroxbuster, nmap / httpx, nuclei, sqlmap.  
- **Crypto:** Python + SageMath, pycryptodome, RsaCtfTool.  
- **Forensics:** binwalk, strings/exiftool, Wireshark, Volatility.  
- **OSINT:** theHarvester, SpiderFoot, Wayback Machine, Shodan.

**Example day-1 web flow:** intercept login with Burp → enumerate endpoints with feroxbuster → fuzz params with ffuf → check auth/session flags → look for IDOR/SSRF clues → write down exact requests and diffs.

- **BEGINNER CTF — picoCTF 2021 #001 “Obedient Cat”**  
  [youtube.com/watch?v=P07NH5F-t3s&t=718s](https://www.youtube.com/watch?v=P07NH5F-t3s&t=718s){:target="_blank" rel="noopener"}

- **CTFs explained in 5 Minutes**  
  [youtube.com/watch?v=nCMGIR8V-NE](https://www.youtube.com/watch?v=nCMGIR8V-NE){:target="_blank" rel="noopener"}

---

## Step 3 — Join communities, make friends, form a team

Security is easier with people. Join:
- Discords for PortSwigger / THM / HTB, Facebook groups (you can find them almost everywhere).  
- University clubs and local groups.  
- Forums where write-ups are shared.

Run **weekly mini-CTFs** together and rotate roles (driver/navigator; web/crypto/forensics leads). Your network will teach you faster than any single course.

---

## Step 4 — Read a few high-signal books (don’t overdo it)

![Book]({{ '/assets/images/advice/book.gif' | relative_url }})

Names only (look them up wherever you like):
- *Real-World Bug Hunting* — Peter Yaworski.  
- *Serious Cryptography (2nd ed.)* — Jean-Philippe Aumasson.  
- *Practical Binary Analysis* — Dennis Andriesse.  
- *The Art of Memory Forensics* — Ligh, Case, Levy, Walters.  
- *The Web Application Hacker’s Handbook* — Stuttard & Pinto.

**How to read:** skim one chapter → immediately recreate one technique in a lab → add it to your checklist with commands (not gonna lie: it can feel long and boring at first, but you’ll get used to it).

---

## Step 5 — Certifications (optional but useful for jobs & networking)

Certs won’t replace skill, but they can **expand your network** and **signal your level**. They often include hands-on labs with real-ish scenarios (within class scope).

![Cert]({{ '/assets/images/advice/cert.jpg' | relative_url }})

If you’re in Viet Nam—specifically Hà Nội—and want structured study with peers, try:
- **IPMAC** — long-running IT & security training (that’s where I did CCNA, CEH, Security+ and Pentest+):  
  [ipmac.vn](https://ipmac.vn/){:target="_blank" rel="noopener"}
- **CyberJutsu Academy** — hands-on offensive courses & community:  
  [cyberjutsu.io](https://cyberjutsu.io/){:target="_blank" rel="noopener"}
- **Cookie Hân Hoan / Cookie Arena** — Vietnamese security community & CTF-style learning:  
  [cookiearena.org](https://cookiearena.org/){:target="_blank" rel="noopener"} and [YouTube: Cookie Hân Hoan](https://www.youtube.com/c/CookieHanHoan){:target="_blank" rel="noopener"}

Pick certs that match your practice (e.g., web/offensive if you’re doing PortSwigger + HTB). Time it **after** you’ve built daily habits so your notes become your study guide.

**A red-team-leaning progression (opinionated)**  
- **CCNA → Security+** (solid foundations)  
- **PenTest+** *(CEH is okay, but PenTest+ often feels more worth it)*  
- Keep grinding labs/CTFs → **OSCP** → **OSEP**  
- Then specialize as your job demands: **OSWP / OSWA / OSWE**, or defensive tracks, or **CCNP Security**, etc.

---

## Step 6 — Learn your tools deeply and make Linux your home

If you’re on the red path or any other path, Linux is home base. Mastering it (plus a few core tools) will save you hours every week and make your CTF/write-ups reproducible.

![Linux]({{ '/assets/images/advice/linux.gif' | relative_url }})

**Pick an environment you will actually use daily**
- Any stable Linux distro works (Ubuntu/Fedora/Arch). Kali/Parrot are fine for labs, but a stable daily driver + a curated toolset is perfectly OK.  
- On Windows, **WSL2** + Ubuntu is a great compromise. Keep one “lab” VM or Docker compose for messier experiments.

**Core Linux you should know by heart**
- Files/permissions/processes/services: `ls`, `cd`, `cat/less`, `chmod/chown/umask`, `ps`, `top/htop`, `systemctl`, `journalctl`.  
- Find/pipe/filter like a surgeon: `grep -R`, `awk`, `sed`, `find … -exec …`, `xargs`, `cut`, `sort -u`, `uniq -c`, `tee`.  
- Networking quicks: `ip addr/route`, `ss -tulpn`, `tcpdump`, `curl`, `wget`.  
- Archives & handy utils: `tar`, `zip/unzip`, `jq` (JSON), `python3 -m http.server`.

- **Why Every Beginner Struggles with Linux (At First!)**  
  [youtube.com/watch?v=uulkiWNjpj0](https://www.youtube.com/watch?v=uulkiWNjpj0){:target="_blank" rel="noopener"}
- **Every LINUX DISTRO Explained in 4 minutes**  
  [youtube.com/watch?v=VKNMI6cYOFk](https://www.youtube.com/watch?v=VKNMI6cYOFk){:target="_blank" rel="noopener"}

**Security tools to grow into**

![tool]({{ '/assets/images/advice/tool.jpg' | relative_url }})

- Recon/busting: **httpx**, **nmap**, **ffuf**, **feroxbuster**.  
- Web manual testing: **Burp Suite** (Proxy, Repeater, Intruder, Comparer, Decoder).  
- Crypto & scripting: **Python**, **SageMath**, **pycryptodome**.  
- Forensics: **binwalk**, **strings/exiftool**, **Wireshark**, **Volatility**.  
- OSINT: **theHarvester**, **SpiderFoot**, **Wayback Machine**, **Shodan**.
- **Every HACKING TOOL Explained in 5 minutes.**
[youtube.com/watch?v=5une30fIDww](https://www.youtube.com/watch?v=5une30fIDww){:target="_blank" rel="noopener"}

**Mini-labs you can do tonight**
- *Packets in the wild:* in one terminal run  
  `tcpdump -i lo -A 'tcp port 80'`, then in another  
  `python3 -m http.server 8000` and `curl http://127.0.0.1:8000` — watch requests fly.  
- *Logs that matter:* break a toy service, then use `systemctl status` + `journalctl -u <service>` to trace root cause.  
- *Docker lab:* spin up a vulnerable app (e.g., Juice Shop) and practice Burp + ffuf end-to-end. Document **exact** requests and payloads.  
- *One-liner a day:* keep a tiny `snippets.md`. If a command saved you 5 minutes, paste it there with a one-line note.

> Depth beats breadth: it’s better to know **five tools deeply** than 50 tools you can’t wield under pressure.

---

## Step 7 — Don’t overspend on “hacking gadgets” (skill beats gear)

Gadgets look cool, but they’re **not** what makes you a hacker. Hardware toys (USB keystroke injectors, pentest gadgets, SDR toys, fancy Wi-Fi rigs…) shine in **very specific** pro scenarios—usually in the hands of seasoned red teamers with legal scope and a clear plan.

![hkg]({{ '/assets/images/advice/hkg.jpg' | relative_url }})

**Why beginners don’t need them (yet)**
- 90% of your learning wins come from **software skills**: Linux, browsers, Burp, ffuf, nmap/httpx, scripting, note-taking.  
- Gadgets are **expensive** and easy to misuse outside legal environments.  
- Without fundamentals, you won’t know *when* or *why* to use them—and they’ll gather dust.

**A smarter budget stack**
1) A reliable laptop (and a cool-running charger).  
2) An external SSD for labs/snapshots.  
3) A small VPS or local server for self-hosted labs.  
4) Paid labs/courses *you will finish* (THM/HTB tracks, exam prep).  
5) A “cert fund” (only after you’ve built daily practice).

**Decision checklist before buying a gadget**
- Will I use this **weekly** for the next 3 months?  
- Is there a **software** or **simulated** alternative while I learn?  
- Do I have a **legal** environment/scope to try it?  
- Is this required for a **specific project/exam** I’m actually doing now?

- **From Free to Premium Cyber Security Tools (gadgets overview)**  
  [youtube.com/watch?v=xg6aZ2i36wc&t=725s](https://www.youtube.com/watch?v=xg6aZ2i36wc&t=725s){:target="_blank" rel="noopener"}

If you’re rich and just want a toy—go wild 😄. Otherwise, invest in **habits, labs, and notes**. Tools don’t make hackers; **practice** does.  
*(Confession: I do own a Rubber Ducky, a Wi-Fi Pineapple, and a Flipper Zero with add-ons. They’re handy in the right context—but still not for beginners.)*

---

## My simple weekly loop (feel free to copy)

- **Daily (45–90 min):** 2× Web labs, 1× Crypto, 1× Forensics, 1× OSINT.  
- **Saturday (1–3h):** a small CTF or a retired HTB/THM box aligned with what you studied.  
- **Sunday (≤600 words):** a mini write-up: goal → steps → payloads/commands → screenshots → “what I’d try first next time”.

It’s boring—in the **best** way. The reps compound.

---

## Jargon you’ll see (in plain language)

- **CTF:** timed hacking puzzles where you extract a hidden flag (e.g., `flag{…}`).  
- **Red / Blue / Purple:** offense, defense, and the collaboration loop that makes both better.  
- **Burp Suite:** the de-facto web proxy/fuzzer for manual testing; pairs perfectly with PortSwigger labs.  
- **OWASP Top 10:** widely referenced web risks; use it to structure your study.

---

## Bonus — First 30 Days Plan (copy/paste and go)

**Week 1 (Web basics):** PortSwigger: Authentication, Access control labs → take notes on cookies/sessions/IDOR.  
**Week 2 (Discovery & requests):** ffuf/feroxbuster + Burp Repeater → build a 10-line checklist.  
**Week 3 (Crypto & Forensics intro):** 2 picoCTF crypto, 2 forensics; write down the exact commands.  
**Week 4 (OSINT & mini-CTF):** 2 OSINT pivots + join a weekend CTF (2–3 hours). Publish one write-up.

**Rule:** after every lab, write one sentence: *“Next time I’ll try ___ first.”*

---

## Bonus — Two mini cases (quick taste of practice)

**Case A — IDOR (Web)**  
1) Visit `/user?id=123` as user A; copy the request.  
2) Change `id=124` in Burp Repeater.  
3) If response contains user B’s data (status 200, similar length), you’ve got an IDOR.  
4) Note: add auth state, steps, and a responsible fix (server-side checks).

**Case B — RSA (Crypto)**  
Given an RSA public key with small `e` and a suspicious `n`:  
1) Try factoring `n` (e.g., RsaCtfTool with factordb).  
2) If factors found, compute `d` and decrypt the ciphertext; log the math + code.  
3) Note mitigations: proper key sizes, safe padding modes, and key hygiene.

---

## Legal & ethics (quick reminder)

Only test on labs, CTFs, or systems where you have **explicit permission**. Keep logs, credit sources, and share responsibly. Good reputation is compound interest ✨

---

## Why this path works

I’ve had nights glued to the screen—stuck, hungry, frustrated—then the fix landed and it was pure dopamine. Keep a calm loop: **enumerate → test → note → reflect**. Start with YouTube to see if you like the vibe, then move to interactive labs, then CTFs, then community, then books/certs if you want. Be patient; celebrate small wins. They add up.

<h3>Bonus video</h3>
<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;margin:1rem 0;border-radius:12px;">
  <iframe
    src="https://www.youtube-nocookie.com/embed/iCbOV8p6tD4"
    title="How to Learn Hacking (2025) — a Practical Guide"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen
    loading="lazy"
    style="position:absolute;top:0;left:0;width:100%;height:100%;">
  </iframe>
</div>
<p><a href="https://www.youtube.com/watch?v=iCbOV8p6tD4" target="_blank" rel="noopener">Open on YouTube</a></p>

— **Suiikawaii** (Red Team learner, USTH)

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})
