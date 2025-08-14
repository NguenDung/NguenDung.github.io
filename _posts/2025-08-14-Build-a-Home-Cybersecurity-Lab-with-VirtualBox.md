---
layout: post
title: "Build a Home Cybersecurity Lab with VirtualBox/VMware"
permalink: /posts/home-cyber-lab/
tags: [virtualization, lab, kali, parrot, blackarch, backbox, virtualbox, vmware, networking, beginner]
description: "A step-by-step guide to building a safe, isolated cybersecurity lab at home using VirtualBox or VMware — with Kali/Parrot, vulnerable targets, hosted labs, network modes, snapshots, and best practices."
---

<!-- Scoped styles for THIS post only -->
<style>
/* Responsive video embeds */
iframe[src*="youtube.com"],
iframe[src*="youtu.be"],
iframe[src*="vimeo.com"]{
  display:block;
  width:100% !important;
  max-width:100%;
  height:auto;
  aspect-ratio:16/9;
  border:0;
}

/* Topology block: larger and more readable monospace */
pre.topology {
  font-size: 1.05rem;
  line-height: 1.55;
  padding: .9rem 1rem;
  border: 1px solid rgba(255,255,255,.15);
  border-radius: 6px;
  overflow:auto;
}

/* Nicer table spacing without touching entire theme */
.md-table table {
  width:100%;
  border-collapse: separate;
  border-spacing: 0;
}
.md-table th, .md-table td {
  padding: .65rem .85rem;
  vertical-align: top;
}
.md-table thead th {
  border-bottom: 1px solid rgba(255,255,255,.15);
}
.md-table tbody tr + tr td {
  border-top: 1px dashed rgba(255,255,255,.12);
}

/* Helper */
.back-to-top { display:inline-block; margin-top:0.75rem; font-size:0.95rem }
kbd { background:#eee; border:1px solid #ccc; border-bottom:2px solid #bbb; padding:0 .35em; border-radius:3px; }
.table-scroll { overflow-x:auto; }
</style>

# Build a Home Cybersecurity Lab with VirtualBox/VMware

Halloo, it’s me SuiiKawaii again — this time we’re building your **home cybersecurity lab**. A virtual lab lets you learn hacking **legally and safely**: you practice on machines you own, isolated from your real network and data. In this guide, you’ll set up an **attacker VM** (Kali or Parrot), add a few **intentionally vulnerable targets**, wire them with the right **virtual network modes**, and learn a clean **snapshot workflow** so you can break things and roll back in seconds.

![Suiw]({{ '/assets/images/homelab/Suiw.gif' | relative_url }})

> **Internal reads:** If you’re new to Linux, skim my post **[Mastering Linux for Cybersecurity](/posts/mastering-linux-for-cybersecurity/)** first. And when you’re ready to practice fundamentals, jump into **[OverTheWire Bandit Index](/posts/overthewire/bandit-overview/)**.

---

## Table of Contents
- [1) Why build a home lab](#1-why-build-a-home-lab)
- [2) Legal & ethical rules](#2-legal--ethical-rules)
- [3) What we’ll build (topologies)](#3-what-well-build-topologies)
- [4) Requirements & downloads](#4-requirements--downloads)
- [5) VirtualBox vs VMware (quick compare)](#5-virtualbox-vs-vmware-quick-compare)
- [6) Network modes explained](#6-network-modes-explained)
- [7) Create your attacker VM (Kali/Parrot)](#7-create-your-attacker-vm-kaliparrot)
  - [7.1) Attacker OS choices & comparison](#71-attacker-os-choices--comparison)
  - [7.1.1) OS selection flow (decision tree)](#711-os-selection-flow-decision-tree)
  - [7.2) Quick install & first snapshot](#72-quick-install--first-snapshot)
- [8) Add safe target VMs](#8-add-safe-target-vms)
  - [8.1) Hosted practice labs (no VM required)](#81-hosted-practice-labs-no-vm-required)
- [9) Wire the network (isolation-first)](#9-wire-the-network-isolation-first)
- [10) Snapshots & workflow](#10-snapshots--workflow)
- [11) Quality-of-life settings](#11-quality-of-life-settings)
- [12) Security hygiene in your lab](#12-security-hygiene-in-your-lab)
- [13) Practice ideas (first week)](#13-practice-ideas-first-week)
- [14) Troubleshooting](#14-troubleshooting)
- [FAQ](#faq)
- [Appendix A — Quick sizing matrix](#appendix-a--quick-sizing-matrix)
- [Appendix B — Clean reset workflow](#appendix-b--clean-reset-workflow)
- [Appendix C — Safe scan baseline (lab only)](#appendix-c--safe-scan-baseline-lab-only)
- [Appendix D — Mini glossary](#appendix-d--mini-glossary)
- [Resource Library (Articles & Videos)](#resource-library-articles--videos)

---

## 1) Why build a home lab

- **Safety:** Break things without risking your real OS or data.  
- **Reproducibility:** Roll back with snapshots; document what works.  
- **Focus:** Curated targets teach specific skills (web vulns, services, creds).  
- **Portability:** Your entire lab fits on a laptop + external SSD.

<!-- Main embed (one video, start from 0) -->
<iframe src="https://www.youtube.com/embed/fffSbCbafts"
        title="Do you need a Cybersecurity home lab?"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;"
        allowfullscreen loading="lazy"></iframe>

**Further references:**  
- <a href="https://www.youtube.com/watch?v=izmCJlJEvQw" target="_blank" rel="noopener noreferrer">Build Your Own Cybersecurity Lab at Home (For FREE)</a>

<p class="back-to-top"><a href="#table-of-contents">↑ Back to top</a></p>

---

## 2) Legal & ethical rules

- Only attack **systems you own** or have **explicit written permission** to test.  
- Keep your lab **isolated** (Host-only networks for targets).  
- If you demo or publish writeups, **scrub sensitive material** (keys, tokens, real data).

<p class="back-to-top"><a href="#table-of-contents">↑ Back to top</a></p>

---

## 3) What we’ll build (topologies)

Start simple, then scale:

<pre class="topology"><code>(Attacker)
Kali / Parrot / BlackArch / BackBox  ──┐
                                       ├── Host-Only Network  ← isolated playground
Target #1                             ──┤
Target #2                             ──┘

Attacker                              ── NAT ── Internet (for updates/tools)
</code></pre>

- **Phase 1:** One attacker VM + one target on a **Host-only** network.  
- **Phase 2:** Add more targets (e.g., a web vuln box + a Linux service box).  
- **Phase 3 (optional):** A tiny “enterprise”: 1 DNS, 1 web, 1 DB target.

> Rule of thumb: **Host-only** for lateral play; give the **attacker** a **second NIC (NAT)** for updates. Targets normally **don’t** need Internet.

<p class="back-to-top"><a href="#table-of-contents">↑ Back to top</a></p>

---

## 4) Requirements & downloads

- **Hypervisor:**  
  - <a href="https://www.virtualbox.org/" target="_blank" rel="noopener noreferrer">VirtualBox</a> (free) or  
  - <a href="https://www.vmware.com/products/desktop-hypervisor/workstation-and-fusion" target="_blank" rel="noopener noreferrer">VMware Workstation/Fusion</a> (Player is free for personal use).

- **Attacker OS:**  
  - <a href="https://www.kali.org/" target="_blank" rel="noopener noreferrer">Kali Linux</a>  
  - <a href="https://www.parrotsec.org/" target="_blank" rel="noopener noreferrer">Parrot Security OS</a>  
  - <a href="https://www.blackarch.org/" target="_blank" rel="noopener noreferrer">BlackArch</a> (advanced)  
  - <a href="https://www.backbox.org/" target="_blank" rel="noopener noreferrer">BackBox</a> (Ubuntu-based, curated tools)

- **Target images (choose 1–2 to start):**  
  - <a href="https://information.rapid7.com/metasploitable-download.html" target="_blank" rel="noopener noreferrer">Metasploitable2 (Rapid7)</a> — vulnerable services, perfect for enumeration  
  - <a href="https://owasp.org/www-project-juice-shop/" target="_blank" rel="noopener noreferrer">OWASP Juice Shop</a> — modern web app with intentional vulns  
  - <a href="https://dvwa.co.uk/" target="_blank" rel="noopener noreferrer">Damn Vulnerable Web Application (DVWA)</a> — classic web vuln exercises  
  - <a href="https://www.vulnhub.com/" target="_blank" rel="noopener noreferrer">VulnHub</a> — huge library of downloadable vulnerable VMs

**Host machine suggested minimum:** 4 cores, 16 GB RAM, SSD, and virtualization enabled in BIOS/UEFI (Intel VT-x / AMD-V).

<!-- Hardware video embed -->
<iframe src="https://www.youtube.com/embed/jsMp65-piIc"
        title="Best hacking laptop and OS?"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;"
        allowfullscreen loading="lazy"></iframe>

**Further references:**  
- <a href="https://virtualcyberlabs.com/how-to-build-a-home-cybersecurity-lab/" target="_blank" rel="noopener noreferrer">How to Build a Home Cybersecurity Lab (Virtual Cyber Labs)</a>  
- <a href="https://medium.com/@jibingeorge.mg/cybersecurity-research-lab-setup-5beb54d8dd59" target="_blank" rel="noopener noreferrer">Cybersecurity Research Lab Setup (Medium)</a>  
- <a href="https://www.offsec.com/blog/cybersecurity-homelab/" target="_blank" rel="noopener noreferrer">OffSec: Cybersecurity Homelab (Blog)</a>  
- <a href="https://www.youtube.com/watch?v=kku0fVfksrk&list=PLG6KGSNK4PuBWmX9NykU0wnWamjxdKhDJ" target="_blank" rel="noopener noreferrer">Build A Basic Home Lab (Playlist)</a>  
- <a href="https://www.youtube.com/watch?v=8hvn5poOo0E&list=PLyyVTBXnmyxK-dnk5RcgxSr1ix8uphnEa" target="_blank" rel="noopener noreferrer">Home Lab — VirtualBox (Playlist)</a>

<p class="back-to-top"><a href="#table-of-contents">↑ Back to top</a></p>

---

## 5) VirtualBox vs VMware (quick compare)

<div class="md-table table-scroll">

| Feature | VirtualBox | VMware Workstation/Fusion |
|---|---|---|
| Cost | Free | Player (free personal), Pro (paid) |
| Ease | Beginner-friendly | Polished UI, strong device support |
| Snapshots | Yes | Yes (Player lacks snapshot tree mgmt) |
| Shared folders | Yes | Yes |
| 3D/Graphics | Basic | Often better integration |
| Cross-platform | Win/macOS/Linux | Win/Linux (Workstation), macOS (Fusion) |

</div>

**Pick one** and stick with it; the concepts here apply to both.

**Further references:**  
- <a href="https://www.virtualbox.org/manual/ch06.html" target="_blank" rel="noopener noreferrer">VirtualBox User Manual — Networking</a>

<p class="back-to-top"><a href="#table-of-contents">↑ Back to top</a></p>

---

## 6) Network modes explained

- **NAT (Attacker only):** VM gets Internet through the host; outside cannot reach the VM directly. Perfect for **updates**.  
- **NAT Network (VirtualBox):** Like NAT but VMs can see each other on the same NAT segment.  
- **Host-only:** VMs talk to each other and to the host, **no Internet** by default. Ideal for targets.  
- **Bridged:** VM appears as a device on your **physical LAN**. Avoid for targets (leak risk); use only if you know what you’re doing.

**Recommended baseline:**
- Attacker VM: **Adapter 1 = Host-only**, **Adapter 2 = NAT**  
- Each target VM: **Adapter 1 = Host-only** (same network as the attacker’s Host-only)

**Further references:**  
- <a href="https://www.wireshark.org/" target="_blank" rel="noopener noreferrer">Wireshark</a> (network inspection within your lab)

<p class="back-to-top"><a href="#table-of-contents">↑ Back to top</a></p>

---

## 7) Create your attacker VM (Kali/Parrot)

This is your “offensive workstation.” Before we install anything, here’s how to choose the OS wisely.

### 7.1) Attacker OS choices & comparison

**Short take:** If you’re new, choose **Kali** or **Parrot**. They’re friendly, well-documented, and come with a curated toolset that “just works”.

<div class="md-table table-scroll">
<table class="os-compare">
  <thead>
    <tr>
      <th>Distro</th>
      <th>Base &amp; Package Manager</th>
      <th>Preinstalled Tools</th>
      <th>Update Style</th>
      <th>Community / Docs</th>
      <th>Footprint</th>
      <th>Best For</th>
      <th>Notes</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Kali Linux</strong></td>
      <td>Debian; <code>apt</code></td>
      <td>Extensive (pentest, forensics)</td>
      <td>Rolling</td>
      <td>Huge community, lots of tutorials</td>
      <td>Medium</td>
      <td><strong>Beginners → Pro</strong></td>
      <td>“Industry standard” for pentest labs; great device support.</td>
    </tr>
    <tr>
      <td><strong>Parrot Security OS</strong></td>
      <td>Debian; <code>apt</code></td>
      <td>Extensive (pentest + privacy)</td>
      <td>Rolling</td>
      <td>Strong community</td>
      <td>Light/Medium</td>
      <td><strong>Beginners → Pro</strong></td>
      <td>Privacy-leaning feel; often lighter than Kali.</td>
    </tr>
    <tr>
      <td><strong>BlackArch</strong></td>
      <td>Arch; <code>pacman</code> + AUR</td>
      <td>Massive (thousands)</td>
      <td>Rolling (bleeding)</td>
      <td>Niche but passionate</td>
      <td>Light</td>
      <td><strong>Advanced</strong></td>
      <td>DIY maintenance; excellent if you like Arch workflows.</td>
    </tr>
    <tr>
      <td><strong>BackBox</strong></td>
      <td>Ubuntu LTS; <code>apt</code></td>
      <td>Curated (leaner)</td>
      <td>Regular LTS</td>
      <td>Moderate</td>
      <td>Light</td>
      <td><strong>Beginner/Intermediate</strong></td>
      <td>Stable Ubuntu base; add only what you need.</td>
    </tr>
  </tbody>
</table>
</div>

**Decision criteria (pick what matters to you):**
- **Experience level:** New? Kali/Parrot. Comfortable with Arch? BlackArch. Want Ubuntu LTS stability? BackBox.  
- **Philosophy:** **Everything preinstalled** (Kali/Parrot) vs **curated/lean** (BackBox) vs **huge repo/DIY** (BlackArch).  
- **Community & docs:** Kali/Parrot have the most tutorials and troubleshooting guides.  
- **Update cadence:** Rolling is convenient but can break occasionally — snapshot first.  
- **Hardware & drivers:** Kali/Parrot are generally smooth in VMs and on laptops.

<!-- OS comparison — main embed (start at 0) -->
<iframe src="https://www.youtube.com/embed/l75r9tmdZic"
        title="Kali Linux vs BlackArch vs Parrot OS - Which is Best for [Ethical] Hacking?"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;"
        allowfullscreen loading="lazy"></iframe>

**Further references:**
- <a href="https://www.youtube.com/watch?v=olS6JsRwPaE" target="_blank" rel="noopener noreferrer">Best OS For Pentesting & Security Research?</a>  
- <a href="https://www.youtube.com/watch?v=lAnQzVqx9s4" target="_blank" rel="noopener noreferrer">Best Hacking Operating System!</a>

#### 7.1.1) OS selection flow (decision tree)

**Quick checklist (text version)**

1) **Brand-new to Linux?**  
   - **Yes →** Pick **Kali** (largest preinstalled toolset, huge community) **or** **Parrot** (lighter feel, privacy-leaning).  
   - **No →** Go to 2.  
2) **Already comfortable with Arch (pacman/AUR, rolling, DIY)?**  
   - **Yes →** **BlackArch**.  
   - **No →** Go to 3.  
3) **Prefer Ubuntu LTS stability with a lean, curated toolkit?**  
   - **Yes →** **BackBox**.  
   - **No →** Go to 4.  
4) **Tighter hardware (≤ 8 GB RAM / older CPU) and want a smoother VM?**  
   - Prefer **Parrot** or **BackBox**; **Kali** is still fine (medium footprint).  
5) **Need the broadest out-of-the-box suite and tutorials everywhere?** → **Kali**.  
6) **Want a privacy-friendly flavor that still ships offensive tools and feels snappy?** → **Parrot**.  
7) **Still unsure?** Start with **Kali/Parrot** for **3–6 months**. Snapshot often. Then try **BlackArch**/**BackBox**.

**TL;DR mapping:**  
**Beginner, want everything ready → Kali** • **Beginner, lighter/privacy → Parrot** • **Advanced+Arch → BlackArch** • **Ubuntu LTS lean → BackBox**

```mermaid
flowchart TD
    A[Start] --> B{New to Linux?}
    B -- Yes --> C{Prefer biggest preinstalled\ntoolset & community?}
    C -- Yes --> K[Kali Linux]
    C -- No / prefer lighter & privacy --> P[Parrot Security]
    B -- No --> D{Comfortable with Arch (pacman/AUR)?}
    D -- Yes --> BA[BlackArch]
    D -- No --> E{Prefer Ubuntu LTS with\nlean curated tools?}
    E -- Yes --> BB[BackBox]
    E -- No --> F{Need largest OOTB suite\n& docs everywhere?}
    F -- Yes --> K
    F -- Prefer lighter/privacy --> P
    G[Low RAM / older CPU] --> P
    G --> BB
````

### 7.2) Quick install & first snapshot

Allocate **2–4 vCPUs**, **4–8 GB RAM**, **40+ GB disk**. Enable **EFI** if your ISO needs it.

* **Kali post-install quick steps:**

  ```bash
  sudo apt update && sudo apt -y upgrade
  sudo apt install -y git curl neovim
  ```
* Optional: install VMware/VirtualBox guest tools (clipboard, drag & drop, display).

<!-- Install Kali — embed -->

<iframe src="https://www.youtube.com/embed/sAMnXte56yY"
        title="How To Install Kali Linux 2024 in VirtualBox | Kali Linux 2024.1"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;"
        allowfullscreen loading="lazy"></iframe>

**Tip:** Name this VM `attacker-kali-base` (or `parrot-base`) and take a **snapshot** right after updates: `clean-base`.

<p class="back-to-top"><a href="#table-of-contents">↑ Back to top</a></p>

---

## 8) Add safe target VMs

Pick one to start:

* **Metasploitable2:** vulnerable services (FTP/Telnet/DB). Great for service enumeration.
* **OWASP Juice Shop:** intentionally vulnerable modern web app (XSS, auth flows).
* **DVWA:** classic web vuln exercises (SQLi/XSS/CSRF/File upload).

**Resource hint:** 1–2 GB RAM per target is often enough.

> Keep targets on **Host-only**; they don’t need Internet. If a target needs updates during setup, temporarily add a NAT adapter, update, then **remove** it.

**Optional:** prefer containers for some web apps:

* <a href="https://docs.docker.com/get-started/" target="_blank" rel="noopener noreferrer">Docker — Get Started</a> (run Juice Shop/DVWA as containers in an **isolated** user-defined bridge network)

### 8.1) Hosted practice labs (no VM required)

If you don’t want to build targets right away, these platforms provide **ready-made environments** with **guided scenarios**:

* <a href="https://tryhackme.com/" target="_blank" rel="noopener noreferrer">TryHackMe</a> — room-based labs with beginner paths; connect via **OpenVPN/WireGuard** from your attacker VM.
* <a href="https://www.hackthebox.com/" target="_blank" rel="noopener noreferrer">Hack The Box</a> — many boxes by difficulty; “Starting Point” is great for beginners; also uses VPN.
* <a href="https://portswigger.net/web-security" target="_blank" rel="noopener noreferrer">PortSwigger Web Security Academy</a> — hundreds of web labs hosted safely and legally.
* <a href="https://overthewire.org/wargames/" target="_blank" rel="noopener noreferrer">OverTheWire</a> — SSH-based wargames to sharpen your CLI.
* <a href="https://picoctf.org/" target="_blank" rel="noopener noreferrer">picoCTF</a> — beginner-friendly CTFs across web/forensics/crypto.

**VPN note:** When connecting THM/HTB VPN inside your attacker VM, keep your **local targets** on Host-only. Don’t enable Bridged unless you fully understand the scope and risks.

<p class="back-to-top"><a href="#table-of-contents">↑ Back to top</a></p>

---

## 9) Wire the network (isolation-first)

**VirtualBox example (recommended):**

* Create a **Host-only** network (e.g., `vboxnet0`) with DHCP range `192.168.56.0/24`.
* Attacker:

  * **Adapter 1:** Host-only (`vboxnet0`)
  * **Adapter 2:** NAT
* Targets:

  * **Adapter 1:** Host-only (`vboxnet0`)

Now the attacker sees targets at `192.168.56.x`, and can still `apt update` over NAT — while targets remain isolated.

**Quick checks from attacker:**

```bash
ip a             # verify Host-only IP, e.g., 192.168.56.101
ip r             # default route should point at the NAT adapter
ping -c1 192.168.56.102   # a target
```

If DHCP is off in Host-only, set **static IPs** on each VM within the same subnet.

<p class="back-to-top"><a href="#table-of-contents">↑ Back to top</a></p>

---

## 10) Snapshots & workflow

* **Baseline:** After a clean install + updates, take `clean-base`.
* **Per lab:** Before you start a challenge, take `pre-lab-<date>`.
* **After success:** If you want to keep the state, snapshot `post-lab-<topic>`.
* **Reset often:** Don’t be shy about reverting; that’s the point.

**Naming tip:** `YYMMDD-context`, e.g., `250814-pre-lab-enum-ftp`.

<p class="back-to-top"><a href="#table-of-contents">↑ Back to top</a></p>

---

## 11) Quality-of-life settings

* **Shared folders** for notes/tooling (`~/lab` on host ↔ `/mnt/lab` on VM).
* **Clipboard/Drag-and-drop** (bidirectional) for quick copy/paste (disable during captures if needed).
* **Time sync** (helps with logs/certs).
* **Auto-resize display** via Guest Additions / VMware Tools.

**Optional:** tiny helper to print your VM’s IPs:

```bash
#!/usr/bin/env bash
ip -4 -o a | awk '{print $2,$4}'
```

<p class="back-to-top"><a href="#table-of-contents">↑ Back to top</a></p>

---

## 12) Security hygiene in your lab

* **No Bridged** for targets unless required.
* **Separate user** on attacker VM; **no browser logins** to personal accounts inside Kali.
* **Rotate snapshots** (delete stale states to save disk).
* **Label disks** and keep **backups** off-machine (external SSD).
* **Document**: keep a lab journal (`~/lab/notes/`).

<p class="back-to-top"><a href="#table-of-contents">↑ Back to top</a></p>

---

## 13) Practice ideas (first week)

1. **Service discovery:** `ip a`, `ip r`, `ping`, `nc`, `nmap -sV -O 192.168.56.0/24` (legal: within your lab).
2. **Web recon:** `curl -I`, directory discovery (against Juice Shop/DVWA **in your lab**).
3. **Logs & creds:** review `/var/log/auth.log` on a target you control; change the SSH banner.
4. **Write notes:** one insight/day.
5. **Bonus:** Parallel your CLI learning with **[OverTheWire Bandit](/posts/overthewire/bandit-overview/)**.

<p class="back-to-top"><a href="#table-of-contents">↑ Back to top</a></p>

---

## 14) Troubleshooting

* **No virtualization options:** Enable Intel VT-x / AMD-V in BIOS/UEFI. On Windows, ensure Hyper-V isn’t hijacking VT-x (you may need to disable it).
* **No network in VM:** Check adapter type (e.g., Intel PRO/1000), cable connected, DHCP on Host-only or set static IP.
* **Screen too small:** Install Guest Additions / VMware Tools, then toggle auto-resize.
* **DNS fails but ping works:** Verify `/etc/resolv.conf`; try `resolvectl status` (or `systemd-resolve --status`).
* **Snapshots take huge space:** Power off VMs; consolidate/delete older snapshots you don’t need.

---

## FAQ

**Should targets ever use Bridged?**
Generally **no**. Bridged exposes targets to your real LAN. Stick to Host-only unless you have a specific, controlled reason.

**Can I store targets as templates?**
Yes. Keep a powered-off “template” VM (clean state) and **clone** before labs. It saves disk compared to dozens of snapshots.

**VirtualBox or VMware — which is faster?**
It depends on host hardware/OS and guest additions. For learning, both are fine — pick one and focus on your workflow.

**What about Docker containers as targets?**
Great idea for web apps like Juice Shop. Just ensure containers are attached to **isolated** networks (e.g., user-defined bridge) and not exposed to your LAN.

<p class="back-to-top"><a href="#table-of-contents">↑ Back to top</a></p>

---

## Appendix A — Quick sizing matrix

<div class="md-table table-scroll">

| VM role                          | vCPU |    RAM |     Disk | Notes                        |
| -------------------------------- | ---: | -----: | -------: | ---------------------------- |
| Attacker (Kali/Parrot)           |  2–4 | 4–8 GB | 40–80 GB | Add 2 NICs (Host-only + NAT) |
| Web target (DVWA/Juice)          |  1–2 | 1–2 GB | 10–20 GB | Host-only only               |
| Service target (Metasploitable2) |  1–2 | 1–2 GB | 10–20 GB | Host-only only               |

</div>

Tune up/down depending on your host. SSD strongly recommended.

<p class="back-to-top"><a href="#table-of-contents">↑ Back to top</a></p>

---

## Appendix B — Clean reset workflow

1. **Before lab:** snapshot `pre-lab-<date>`.
2. **During lab:** take small checkpoints if needed.
3. **After lab:**

   * Export notes/logs to the host.
   * Either **revert** to `pre-lab-<date>` or **power off** and **restore** the clean template.
4. **Housekeeping:** delete stale snapshots monthly to free space.

<p class="back-to-top"><a href="#table-of-contents">↑ Back to top</a></p>

---

## Appendix C — Safe scan baseline (lab only)

**Only run these inside your isolated lab.**

```bash
# Discover live hosts on Host-only network
ip -4 -o a | awk '/vboxnet|host-only|enp/ {print $4}'      # confirm your subnet
nmap -sn 192.168.56.0/24

# Service/version detection against a target
nmap -sV -O 192.168.56.102

# Quick web check
curl -I http://192.168.56.102/
```

<p class="back-to-top"><a href="#table-of-contents">↑ Back to top</a></p>

---

## Appendix D — Mini glossary

**Host-only:** virtual network connecting VMs + host only, no Internet.
**NAT:** VMs reach the Internet through the host; inbound blocked by default.
**Snapshot:** point-in-time save of VM disk/memory to restore later.
**Clone:** a copy of a VM (linked or full).
**Guest tools:** integration package (clipboard, graphics, filesystem sync).

<p class="back-to-top"><a href="#table-of-contents">↑ Back to top</a></p>

---

## Resource Library (Articles & Videos)

**Articles/guides:**

* <a href="https://virtualcyberlabs.com/how-to-build-a-home-cybersecurity-lab/" target="_blank" rel="noopener noreferrer">How to Build a Home Cybersecurity Lab — Virtual Cyber Labs</a>
* <a href="https://medium.com/@jibingeorge.mg/cybersecurity-research-lab-setup-5beb54d8dd59" target="_blank" rel="noopener noreferrer">Cybersecurity Research Lab Setup — Medium</a>
* <a href="https://www.offsec.com/blog/cybersecurity-homelab/" target="_blank" rel="noopener noreferrer">OffSec: Cybersecurity Homelab</a>
* <a href="https://www.vulnhub.com/" target="_blank" rel="noopener noreferrer">VulnHub — Vulnerable VMs</a>
* <a href="https://www.virtualbox.org/manual/ch06.html" target="_blank" rel="noopener noreferrer">VirtualBox Manual: Networking</a>
* <a href="https://nmap.org/book/" target="_blank" rel="noopener noreferrer">Nmap Reference Guide (book)</a>

**Videos/playlists:**

* <a href="https://www.youtube.com/watch?v=fffSbCbafts" target="_blank" rel="noopener noreferrer">Do you need a Cybersecurity home lab?</a>
* <a href="https://www.youtube.com/watch?v=jsMp65-piIc" target="_blank" rel="noopener noreferrer">Best hacking laptop and OS?</a>
* <a href="https://www.youtube.com/watch?v=l75r9tmdZic" target="_blank" rel="noopener noreferrer">Kali Linux vs BlackArch vs Parrot OS — Which is Best?</a>
* <a href="https://www.youtube.com/watch?v=olS6JsRwPaE" target="_blank" rel="noopener noreferrer">Best OS For Pentesting & Security Research?</a>
* <a href="https://www.youtube.com/watch?v=lAnQzVqx9s4" target="_blank" rel="noopener noreferrer">Best Hacking Operating System!</a>
* <a href="https://www.youtube.com/watch?v=kku0fVfksrk&list=PLG6KGSNK4PuBWmX9NykU0wnWamjxdKhDJ" target="_blank" rel="noopener noreferrer">Build A Basic Home Lab (Playlist)</a>
* <a href="https://www.youtube.com/watch?v=8hvn5poOo0E&list=PLyyVTBXnmyxK-dnk5RcgxSr1ix8uphnEa" target="_blank" rel="noopener noreferrer">Home Lab — VirtualBox (Playlist)</a>

---

## Final notes

You now have a safe playground to learn. Keep the **attacker** on Host-only + NAT, keep **targets** Host-only only, snapshot early/often, and journal what you try. Pair this with your Linux study from **[Mastering Linux for Cybersecurity](/posts/mastering-linux-for-cybersecurity/)** and steady hands-on work via **[OverTheWire Bandit](/posts/overthewire/bandit-overview/)** — you’ll level up fast.

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})
