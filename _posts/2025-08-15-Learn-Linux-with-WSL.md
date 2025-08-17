---
layout: post-with-comments-with-comments
title: "Learn Linux with WSL: A Practical Starter for Windows Users"
permalink: /posts/wsl-linux-starter/
tags: [wsl, windows, linux, beginner, ubuntu, terminal, dev, guide]
description: "A step-by-step starter for learning Linux on Windows using WSL2: setup, daily workflow, interop with Windows, limitations, and when to use a VM instead."
excerpt_separator: <!--more-->
---

<!-- Scoped styles for THIS post only -->
<style>
/* Responsive video embeds (16:9) */
.embed-16x9 { position: relative; width: 100%; aspect-ratio: 16 / 9; }
.embed-16x9 iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }

/* Tables + scroll */
.table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
.md-table table { width: 100%; border-collapse: collapse; font-size: 0.95rem; }
.md-table th, .md-table td { padding: .6rem .8rem; border: 1px solid #e5e7eb; }
.md-table thead th { background: #f8fafc; text-align: left; } /* light default */

/* Callouts */
.callout { padding:.8rem 1rem; border-left:4px solid #6b7280; background:rgba(107,114,128,.08); margin:1rem 0; }
.callout.warn { border-color:#d97706; background:rgba(217,119,6,.08); }
.callout.ok { border-color:#059669; background:rgba(5,150,105,.08); }

/* Dark mode: soften header + borders */
@media (prefers-color-scheme: dark) {
  .md-table th, .md-table td { border-color: rgba(255,255,255,.12); }
  .md-table thead th { background: rgba(255,255,255,.06); }
}
</style>

_Halloo, it’s me **SuiiKawaii** again - nice to meet ya in another post of the Linux series with pure pain suffer and also joy!!. Today we’re going to make Linux feel at home on Windows by setting up WSL2, then build a practical day-to-day workflow with VS Code, Git, Docker, and a few security-minded tips. If you’re a Windows user learning Linux, this is the fastest safe path._

![Hi]({{ '/assets/images/wsl/hi.gif' | relative_url }})

Before we start you might want to watch this video from the GOAT **NetworkChuck**:

<!-- Main video embed -->
<div class="embed-16x9" markdown="0">
  <iframe src="https://www.youtube.com/embed/vxTW22y8zV8"
          title="Linux on Windows......Windows on Linux"
          allowfullscreen loading="lazy"></iframe>
</div>

## Table of Contents
- [1) What WSL Is (and WSL1 vs WSL2)](#1-what-wsl-is-and-wsl1-vs-wsl2)
- [2) Prerequisites](#2-prerequisites)
- [3) Install WSL2 (3 paths)](#3-install-wsl2-3-paths)
- [4) Daily Workflow (the right way)](#4-daily-workflow-the-right-way)
- [5) Windows ↔ Linux Interop](#5-windows--linux-interop)
- [6) Networking in WSL2](#6-networking-in-wsl2)
- [7) When NOT to Use WSL](#7-when-not-to-use-wsl)
- [8) Quick Commands Cheat Sheet](#8-quick-commands-cheat-sheet)
- [9) Troubleshooting & FAQ](#9-troubleshooting--faq)
- [10) Resources](#10-resources)
- [Appendix A: Optional .wslconfig & wsl.conf](#appendix-a-optional-wslconfig--wslconf)
- [Appendix C: Windows Terminal Profiles (ready-to-paste)](#appendix-c-windows-terminal-profiles-ready-to-paste)
- [Appendix D: Docker + GPU (CUDA/WSLg) on WSL](#appendix-d-docker--gpu-cudawslg-on-wsl)
- [Appendix E: VS Code Dev Containers (Node + Python example)](#appendix-e-vs-code-dev-containers-node--python-example)
- [Appendix F: Automated WSL Backups (PowerShell + Task Scheduler)](#appendix-f-automated-wsl-backups-powershell--task-scheduler)
- [Appendix G: Performance & QoL Tweaks](#appendix-g-performance--qol-tweaks)
- [Appendix H: Troubleshooting Deep Dive](#appendix-h-troubleshooting-deep-dive)
- [Appendix I: Kali on WSL — Quick Kit](#appendix-i-kali-on-wsl--quick-kit)
- [Appendix J: GPU Quick Start Box (NVIDIA/AMD/Intel)](#appendix-j-gpu-quick-start-box-nvidiaamdintel)

<!--more-->

---

## 1) What WSL Is (and WSL1 vs WSL2)

WSL lets you run a GNU/Linux environment directly on Windows without dual-boot.

<!-- Inline supporting video for this section -->
<div class="embed-16x9" markdown="0">
  <iframe src="https://www.youtube.com/embed/EAROgwvOV4s"
          title="What Is The Windows Subsystem for Linux (WSL) For?!"
          allowfullscreen loading="lazy"></iframe>
</div>

- **WSL1** translates Linux syscalls to Windows (compat layer).  
- **WSL2** runs a real Linux kernel in a lightweight VM → best compatibility and containers.

<div class="table-scroll md-table" markdown="1">

| Topic | WSL1 | WSL2 |
|---|---|---|
| Architecture | Translation layer (no Linux kernel) | Lightweight VM with a real Linux kernel |
| Compatibility | Good CLI coverage | Near-native (cgroups, iptables, namespaces) |
| Filesystem I/O | Fast on Windows FS; slower on Linux FS | Fastest on Linux FS (`~`); slower across `/mnt/c` |
| Docker/Containers | Workarounds only | First-class via Docker Desktop (WSL backend) |
| Networking | Shared host IP (simple) | NAT by default; modern builds map `localhost` reliably |
| Resource Usage | Lower baseline | Slightly higher (VM) but dynamic |
| Best Use | Simple scripting | Dev/security tooling, containers, most learning paths |

</div>

<div class="callout">
If you need monitor mode/USB passthrough/isolated labs, move to a full VM: <a href="/posts/home-cyber-lab/" target="_blank" rel="noopener noreferrer">Build a Home Cybersecurity Lab</a> and the broader track <a href="/posts/mastering-linux-for-cybersecurity/" target="_blank" rel="noopener noreferrer">Mastering Linux for Cybersecurity</a>.
</div>

---

## 2) Prerequisites

- **Windows 11** or **Windows 10 (21H2/19044+)** recommended.  
- **Virtualization** enabled in BIOS/UEFI (Intel VT-x / AMD-V).
- Quick checks:
```powershell
wsl --status
wsl --version
````

* On older Windows 10 you may need:

```powershell
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
```

---

## 3) Install WSL2 (3 paths)

### A) PowerShell (Admin) — the quickest

```powershell
wsl --install
wsl --list --online
wsl --install -d <DistroName>     # e.g. Debian
```

### B) Microsoft Store — GUI route

Install **Ubuntu**, **Debian**, **Kali**, etc.

### C) Upgrade existing WSL1 → WSL2

```powershell
wsl --set-default-version 2
wsl --list --verbose
wsl --set-version <ExistingDistroName> 2
```

### First boot inside Linux

```bash
sudo apt update && sudo apt -y upgrade
```

### (Optional) Enable systemd

Create `/etc/wsl.conf`:

```ini
[boot]
systemd=true
```

Apply:

```powershell
wsl --shutdown
wsl
```

---

## 4) Daily Workflow (the right way)

* Work on Linux FS:

```bash
mkdir -p ~/projects && cd ~/projects
```

`/mnt/c` is Windows drive (crossing boundaries is slower).

* VS Code Remote – WSL:

```bash
code .
```

Install extensions: Remote - WSL, Python, ESLint, Prettier, Docker, GitHub PRs.

* Git & SSH in WSL:

```bash
ssh-keygen -t ed25519 -C "you@example.com"
cat ~/.ssh/id_ed25519.pub
ssh -T git@github.com
```

* Python via pyenv + venv:

```bash
sudo apt -y install build-essential curl git libssl-dev zlib1g-dev \
  libbz2-dev libreadline-dev libsqlite3-dev libffi-dev
curl https://pyenv.run | bash
exec $SHELL
pyenv install 3.12.5 && pyenv global 3.12.5
python -m venv .venv && source .venv/bin/activate
```

* Node via nvm:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
exec $SHELL
nvm install --lts
```

---

## 5) Windows ↔ Linux Interop

* Drives under `/mnt/c`, `/mnt/d`, …
* Open Explorer from WSL:

```bash
explorer.exe .
```

* Call Windows from WSL:

```bash
notepad.exe README.md
powershell.exe -NoLogo -NoProfile -Command "Get-Date"
```

* Call WSL from Windows:

```powershell
wsl.exe ls -la ~
```

* Clipboard:

```bash
ls | clip.exe
```

* Locale:

```bash
sudo update-locale LANG=en_US.UTF-8
```

* (Optional) GUI apps on Windows 11 (WSLg):

```bash
sudo apt install -y gedit
gedit &
```

---

## 6) Networking in WSL2

* NAT behind the scenes; localhost mapping works.
* Check IP:

```bash
ip a
```

* Tiny web server:

```bash
cd ~/projects
python3 -m http.server 8000
```

Open `http://localhost:8000` in Windows.

### Docker Desktop with WSL backend

1. Enable **WSL 2 based engine**.
2. Enable per-distro integration.
3. Test:

```bash
docker version
docker run hello-world
```

---

## 7) When NOT to Use WSL

Use full VM when you need monitor mode/packet injection, USB passthrough, kernel modules, or isolated network labs. See <a href="/posts/home-cyber-lab/" target="_blank" rel="noopener noreferrer">Build a Home Cybersecurity Lab</a>.

---

## 8) Quick Commands Cheat Sheet

```powershell
wsl --list --online
wsl --list --verbose
wsl --install -d Ubuntu
wsl --set-default-version 2
wsl --set-version <Name> 2
wsl --shutdown
wsl --terminate <Name>
wsl --export <Name> C:\backups\wsl\<Name>.tar
wsl --import <New> C:\WSL\<New> C:\backups\wsl\<Name>.tar --version 2
wsl --set-default <Name>
wsl --update
```

```bash
pwd && ls -la
mkdir -p ~/projects && cd ~/projects
sudo apt update && sudo apt -y upgrade
python3 -m venv .venv && source .venv/bin/activate
python3 -m http.server 8000
```

---

## 9) Troubleshooting & FAQ

**WSL2 option missing**

```powershell
wsl --update
wsl --set-default-version 2
```

**DNS / network flaky**

```powershell
wsl --shutdown
```

Optional custom DNS:

```ini
# /etc/wsl.conf
[network]
generateResolvConf = false
```

```bash
sudo rm -f /etc/resolv.conf
echo "nameserver 1.1.1.1" | sudo tee /etc/resolv.conf
```

Then `wsl --shutdown`.

**Port not reachable**

* Bind to `0.0.0.0`/`127.0.0.1`, check Windows Firewall, check `ss -tulpn`.

**Large disk under %LOCALAPPDATA%**

1. `sudo apt clean`
2. `wsl --shutdown`
3. Compact VHDX (Hyper-V tools / Docker Desktop disk utilities).

**Reset / default distro**

```powershell
wsl --unregister <Name>   # destructive
wsl --set-default <Name>
```

---

## 10) Resources

* WSL official docs: <a href="https://learn.microsoft.com/windows/wsl/" target="_blank" rel="noopener noreferrer">learn.microsoft.com/windows/wsl/</a>
* Setup a WSL dev environment: <a href="https://learn.microsoft.com/windows/wsl/setup/environment" target="_blank" rel="noopener noreferrer">learn.microsoft.com/windows/wsl/setup/environment</a>
* Config (`wsl.conf` / `.wslconfig`): <a href="https://learn.microsoft.com/windows/wsl/wsl-config" target="_blank" rel="noopener noreferrer">learn.microsoft.com/windows/wsl/wsl-config</a>
* VS Code – Remote WSL: <a href="https://code.visualstudio.com/docs/remote/wsl" target="_blank" rel="noopener noreferrer">code.visualstudio.com/docs/remote/wsl</a>
* VS Code + WSL tutorial: <a href="https://learn.microsoft.com/windows/wsl/tutorials/wsl-vscode" target="_blank" rel="noopener noreferrer">learn.microsoft.com/windows/wsl/tutorials/wsl-vscode</a>
* Docker Desktop WSL2 backend: <a href="https://docs.docker.com/desktop/features/wsl/" target="_blank" rel="noopener noreferrer">docs.docker.com/desktop/features/wsl/</a>
* WSLg (Linux GUI apps): <a href="https://learn.microsoft.com/windows/wsl/tutorials/gui-apps" target="_blank" rel="noopener noreferrer">learn.microsoft.com/windows/wsl/tutorials/gui-apps</a>
* GitHub – microsoft/WSL: <a href="https://github.com/microsoft/WSL" target="_blank" rel="noopener noreferrer">github.com/microsoft/WSL</a>

**Further references (videos):**

* <a href="https://www.youtube.com/watch?v=LktFP0Dpl-c" target="_blank" rel="noopener noreferrer">I Coded with WSL2 for a Week</a>
* <a href="https://www.youtube.com/watch?v=_fntjriRe48&list=PLhfrWIlLOoKNMHhB39bh3XBpoLxV3f0V9" target="_blank" rel="noopener noreferrer">WSL 2: Getting started (playlist)</a>
* <a href="https://www.youtube.com/watch?v=9aY9b4zLpC0" target="_blank" rel="noopener noreferrer">Running Linux on Windows Experience</a>

---

## Appendix A: Optional .wslconfig & wsl.conf

**Global** (`%UserProfile%\.wslconfig`)

```ini
[wsl2]
memory=6GB
processors=4
localhostForwarding=true
# swap=8GB
# swapfile=C:\\WSL\\wsl-swap.vhdx
```

**Per-distro** (`/etc/wsl.conf`)

```ini
[boot]
systemd=true

[automount]
enabled=true
options="metadata,umask=22,fmask=11"
mountFsTab=true
```

Apply:

```powershell
wsl --shutdown
```

---

## Appendix C: Windows Terminal Profiles (ready-to-paste)

```json
{
  "profiles": {
    "list": [
      {
        "guid": "{2c4de342-38b7-51cf-b940-2309a097f518}",
        "name": "Ubuntu (WSL)",
        "source": "Windows.Terminal.Wsl",
        "commandline": "wsl.exe ~ -d Ubuntu",
        "startingDirectory": "//wsl$/Ubuntu/home/<your_user>",
        "fontFace": "Cascadia Code",
        "fontSize": 12,
        "useAcrylic": true,
        "acrylicOpacity": 0.85,
        "hidden": false
      }
    ]
  },
  "defaultProfile": "{2c4de342-38b7-51cf-b940-2309a097f518}"
}
```

---

## Appendix D: Docker + GPU (CUDA/WSLg) on WSL

<div class="callout ok">
NVIDIA path: install latest Windows driver (WSL support), enable Docker Desktop WSL engine + per-distro integration, then verify below.
</div>

```bash
nvidia-smi || echo "Driver not detected in WSL"
docker run --rm --gpus all nvidia/cuda:12.3.1-base-ubuntu22.04 nvidia-smi
```

AMD/Intel: check vendor docs (ROCm / oneAPI).
GUI with WSLg on Windows 11 works for many apps.

---

## Appendix E: VS Code Dev Containers (Node + Python example)

**.devcontainer/devcontainer.json**

```json
{
  "name": "wsl-sample",
  "image": "mcr.microsoft.com/devcontainers/base:ubuntu",
  "features": {
    "ghcr.io/devcontainers/features/node:1": { "version": "lts" },
    "ghcr.io/devcontainers/features/python:1": { "version": "3.12" }
  },
  "postCreateCommand": "python -m pip install --upgrade pip && node -v && python -V",
  "customizations": {
    "vscode": {
      "extensions": [
        "ms-vscode-remote.remote-containers",
        "ms-python.python",
        "ms-toolsai.jupyter",
        "esbenp.prettier-vscode"
      ]
    }
  }
}
```

Use VS Code → **Dev Containers: Reopen in Container**.

---

## Appendix F: Automated WSL Backups (PowerShell + Task Scheduler)

**backup-wsl.ps1**

```powershell
param([string]$BackupDir = "C:\backups\wsl")

$ts = Get-Date -Format "yyyy-MM-dd"
New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null

$distros = & wsl.exe --list --quiet
foreach ($d in $distros) {
  $safe = $d -replace '[^a-zA-Z0-9._-]', '_'
  $out = Join-Path $BackupDir "$($ts)-$($safe).tar"
  Write-Host "Exporting $d -> $out"
  & wsl.exe --terminate "$d" 2>$null
  & wsl.exe --export "$d" "$out"
}

Get-ChildItem $BackupDir -File -Filter *.tar |
  Where-Object { $_.CreationTime -lt (Get-Date).AddDays(-14) } |
  Remove-Item -Force
```

Task Scheduler → trigger daily, action:

```
powershell.exe -ExecutionPolicy Bypass -File "C:\scripts\backup-wsl.ps1"
```

Restore:

```powershell
wsl --import <NewName> C:\WSL\<NewName> C:\backups\wsl\<DATE>-<Distro>.tar --version 2
```

---

## Appendix G: Performance & QoL Tweaks

* Limit RAM/CPU/swap via `.wslconfig`.
* Keep repos on Linux FS.
* Mount metadata on `/mnt/c` if you need UNIX perms.
* Exclude only trusted paths from AV scans (selective).
* Fix time drift after sleep:

```powershell
wsl --shutdown
```

---

## Appendix H: Troubleshooting Deep Dive

**Name resolution after network change**

```ini
# /etc/wsl.conf
[network]
generateResolvConf = true
```

```powershell
wsl --shutdown
```

**Permission denied on `/mnt/c`** → mount with `metadata` (Appendix A).
**Port conflicts** → on Windows:

```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess
```

In WSL:

```bash
ss -tulpn | grep 8000
```

**Distro stuck at boot** → `wsl --shutdown`, kill hung `vmmem` (carefully), last resort `wsl --unregister <Name>` and restore from backup.

---

## Appendix I: Kali on WSL — Quick Kit

Install:

```powershell
wsl --install -d Kali-Linux
```

Then:

```bash
sudo apt update && sudo apt -y full-upgrade
```

Enable systemd:

```ini
[boot]
systemd=true
```

Apply:

```powershell
wsl --shutdown
```

Metapackages:

```bash
sudo apt install -y kali-linux-headless
# or
sudo apt install -y kali-linux-default
# or
sudo apt install -y kali-linux-large
```

Shell & fonts:

```bash
sudo apt install -y zsh zsh-autosuggestions zsh-syntax-highlighting
chsh -s "$(which zsh)"
```

Set dev font (Cascadia Code / Fira Code) in Windows Terminal.

Tools (pick what you need):

```bash
sudo apt install -y nmap nikto sqlmap gobuster metasploit-framework \
  john hashcat wordlists seclists wireshark tshark feroxbuster \
  wapiti ffuf burpsuite
```

Add capture perms:

```bash
sudo usermod -aG wireshark "$USER"
```

GUI options: WSLg (Win11) or KeX:

```bash
sudo apt install -y kali-win-kex
kex --win -s
```

Known limits under WSL: monitor mode/USB/raw devices → use a VM <a href="/posts/home-cyber-lab/" target="_blank" rel="noopener noreferrer">Build a Home Cybersecurity Lab</a>.

---

## Appendix J: GPU Quick Start Box (NVIDIA/AMD/Intel)

NVIDIA:

```bash
nvidia-smi || echo "Driver not detected in WSL"
docker run --rm --gpus all nvidia/cuda:12.3.1-base-ubuntu22.04 nvidia-smi
```

AMD/Intel: follow ROCm / oneAPI vendor notes.
WSLg handles many GUI/OpenGL apps on Windows 11.

---

*Continue your track:*

* <a href="/posts/mastering-linux-for-cybersecurity/" target="_blank" rel="noopener noreferrer">Mastering Linux for Cybersecurity</a>
* <a href="/posts/home-cyber-lab/" target="_blank" rel="noopener noreferrer">Build a Home Cybersecurity Lab</a>

---


## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})