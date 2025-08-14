---
layout: post
title: "Learn Linux with WSL: A Practical Starter for Windows Users"
permalink: /posts/wsl-linux-starter/
tags: [wsl, windows, linux, beginner, ubuntu, terminal, dev, guide]
description: "A step-by-step starter for learning Linux on Windows using WSL2: setup, daily workflow, interop with Windows, limitations, and when to use a VM instead."
---

<!-- Scoped styles for THIS post only -->
<style>
/* Responsive video embeds (16:9) */
.embed-16x9 { position: relative; width: 100%; aspect-ratio: 16 / 9; }
.embed-16x9 iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }

/* Optional 2-col video grid on wide screens */
.video-grid { display: grid; gap: 1rem; }
@media (min-width: 900px) { .video-grid { grid-template-columns: 1fr 1fr; } }

/* Nicer tables + horizontal scroll on small screens */
.table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
.md-table table { width: 100%; border-collapse: collapse; font-size: 0.95rem; }
.md-table th, .md-table td { padding: .6rem .8rem; border: 1px solid var(--table-border, #e5e7eb); }
.md-table thead th { background: var(--table-head, #f8fafc); text-align: left; }

/* Lightweight callouts */
.callout { padding:.8rem 1rem; border-left:4px solid #6b7280; background:rgba(107,114,128,.08); margin:1rem 0; }
.callout.warn { border-color:#d97706; background:rgba(217,119,6,.08); }
.callout.ok { border-color:#059669; background:rgba(5,150,105,.08); }
</style>

<!-- VIDEO: add later -->

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
- [Appendix B: Video Gallery](#appendix-b-video-gallery)
- [Appendix C: Windows Terminal Profiles (ready-to-paste)](#appendix-c-windows-terminal-profiles-ready-to-paste)
- [Appendix D: Docker + GPU (CUDA/WSLg) on WSL](#appendix-d-docker--gpu-cudawslg-on-wsl)
- [Appendix E: VS Code Dev Containers (Node + Python example)](#appendix-e-vs-code-dev-containers-node--python-example)
- [Appendix F: Automated WSL Backups (PowerShell + Task Scheduler)](#appendix-f-automated-wsl-backups-powershell--task-scheduler)
- [Appendix G: Performance & QoL Tweaks](#appendix-g-performance--qol-tweaks)
- [Appendix H: Troubleshooting Deep Dive](#appendix-h-troubleshooting-deep-dive)
- [Appendix I: Kali on WSL — Quick Kit](#appendix-i-kali-on-wsl--quick-kit)
- [Appendix J: GPU Quick Start Box (NVIDIA/AMD/Intel)](#appendix-j-gpu-quick-start-box-nvidiaamdintel)

---

## 1) What WSL Is (and WSL1 vs WSL2)

**WSL (Windows Subsystem for Linux)** lets you run a GNU/Linux environment directly on Windows without dual-boot.  
- **WSL1** translates Linux syscalls to Windows (compat layer).  
- **WSL2** runs a real Linux kernel in a lightweight VM → better compatibility and containers.

<div class="table-scroll md-table">

| Topic | WSL1 | WSL2 |
|---|---|---|
| Architecture | Translation layer (no Linux kernel) | Lightweight VM with a real Linux kernel |
| Compatibility | Good CLI coverage | Near-native (cgroups, iptables, namespaces) |
| Filesystem I/O | Fast on Windows FS, slower on Linux FS | Fastest on Linux FS (`~`); slower across `/mnt/c` |
| Docker/Containers | Workarounds only | First-class via Docker Desktop (WSL backend) |
| Networking | Shared host IP (simple) | NAT by default; modern builds map `localhost` reliably |
| Resource Usage | Lower baseline | Slightly higher (VM) but dynamic |
| Best Use | Simple scripting | Dev/security tooling, containers, most learning paths |

**Why not just a full VM?**  
VMs (VirtualBox/VMware/Hyper-V) excel at hardware passthrough, custom kernels, and lab isolation. WSL2 wins on startup time, Windows integration (VS Code, Explorer), and day-to-day productivity.

> Need monitor mode/USB passthrough/isolated labs? See: [Build a Home Cybersecurity Lab](/posts/home-cyber-lab/) and the broader track [Mastering Linux for Cybersecurity](/posts/mastering-linux-for-cybersecurity/).

---

## 2) Prerequisites

- **Windows 11** or **Windows 10 (21H2/19044+)** recommended.  
- **Virtualization on** in BIOS/UEFI (Intel VT-x / AMD-V). Quick checks:
  - Task Manager → **Performance** → CPU → “Virtualization: Enabled”.
  - PowerShell (Admin):
    ```powershell
    wsl --status
    wsl --version
    ```
- On older Windows 10 you may need Windows features:
  ```powershell
  dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
  dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
````

---

## 3) Install WSL2 (3 paths)

### A) PowerShell (Admin) — the quickest

```powershell
wsl --install
```

* Installs WSL with the default distro (**Ubuntu**).
* Pick a different distro:

  ```powershell
  wsl --list --online
  wsl --install -d <DistroName>
  # Example:
  wsl --install -d Debian
  ```

### B) Microsoft Store — GUI route

Open Microsoft Store → search **Ubuntu**, **Debian**, **Kali Linux**, etc → **Get** → **Launch**.

### C) Upgrade an existing WSL1 to WSL2

```powershell
wsl --set-default-version 2
wsl --list --verbose
wsl --set-version <ExistingDistroName> 2
```

### First boot inside Linux

Create your user/password, then update packages:

```bash
sudo apt update && sudo apt -y upgrade
```

### (Optional) Enable **systemd** on WSL2

Recent WSL builds support systemd. Create/edit `/etc/wsl.conf`:

```bash
sudo nano /etc/wsl.conf
```

```ini
[boot]
systemd=true
```

Apply:

```powershell
wsl --shutdown
wsl
```

If `systemctl` still fails, update the Store version of WSL (`wsl --update`) and try again.

---

## 4) Daily Workflow (the right way)

### Work inside the Linux filesystem

Use `~/projects` for code, venvs, and `node_modules` to avoid cross-filesystem penalties.

```bash
mkdir -p ~/projects && cd ~/projects
```

* `/` is Linux root;
* `/mnt/c` is your Windows C: drive (crossing boundaries is slower).

### VS Code Remote – WSL

Install VS Code + the **Remote - WSL** extension. From WSL:

```bash
code .
```

Suggested extensions: Remote - WSL, Python, Jupyter (if needed), ESLint, Prettier, Docker, GitHub Pull Requests & Issues.

### Git & SSH keys in WSL

```bash
ssh-keygen -t ed25519 -C "you@example.com"
cat ~/.ssh/id_ed25519.pub
ssh -T git@github.com
```

### Practical Python/Node toolchains

* **Python** via `pyenv` + `venv`:

  ```bash
  sudo apt update && sudo apt -y install build-essential curl git libssl-dev zlib1g-dev \
    libbz2-dev libreadline-dev libsqlite3-dev libffi-dev

  curl https://pyenv.run | bash
  exec $SHELL  # reload shell to load pyenv
  pyenv install 3.12.5 && pyenv global 3.12.5
  python -m venv .venv && source .venv/bin/activate
  ```

* **Node.js** via `nvm`:

  ```bash
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  exec $SHELL
  nvm install --lts
  ```

---

## 5) Windows ↔ Linux Interop

### Access files both ways

* From WSL, Windows drives live under `/mnt/c`, `/mnt/d`, …
* Open File Explorer from WSL:

  ```bash
  explorer.exe .
  ```

### Launch apps across the boundary

* From WSL to Windows:

  ```bash
  notepad.exe README.md
  powershell.exe -NoLogo -NoProfile -Command "Get-Date"
  ```
* From Windows to WSL:

  ```powershell
  wsl.exe ls -la ~
  ```

**Tip:** PATHs differ; prefer absolute paths when mixing contexts.

### Clipboard, fonts, locale

* Copy to Windows clipboard:

  ```bash
  ls | clip.exe
  ```
* Set UTF-8 locale in WSL:

  ```bash
  sudo update-locale LANG=en_US.UTF-8
  ```

### (Optional) Linux GUI apps on Windows 11

WSLg lets you run Linux GUI apps. Try:

```bash
sudo apt install -y gedit
gedit &
```

---

## 6) Networking in WSL2

WSL2 uses **NAT**; modern builds forward `localhost` correctly.

* Check IP:

  ```bash
  ip a
  ```
* Tiny web server:

  ```bash
  cd ~/projects
  python3 -m http.server 8000
  ```

  Open `http://localhost:8000` from Windows.

### Docker Desktop with WSL backend

1. Install Docker Desktop for Windows.
2. **Settings → General**: enable **Use the WSL 2 based engine**.
3. **Settings → Resources → WSL Integration**: enable for your distro(s).
4. Test from WSL:

   ```bash
   docker version
   docker run hello-world
   ```

---

## 7) When NOT to Use WSL

Prefer a **full VM** when you need:

* Wi-Fi **monitor mode/packet injection**, SDR, or other hardware passthrough.
* **USB** passthrough and custom udev rules.
* **Kernel modules**, custom kernels, or LKM development.
* **Isolated network labs** (multi-NIC routing, red/blue teams).

See: [Build a Home Cybersecurity Lab](/posts/home-cyber-lab/) and [Mastering Linux for Cybersecurity](/posts/mastering-linux-for-cybersecurity/).

---

## 8) Quick Commands Cheat Sheet

```powershell
# Windows / WSL management (PowerShell)
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
# Linux starter pack (inside WSL)
pwd && ls -la
mkdir -p ~/projects && cd ~/projects
sudo apt update && sudo apt -y upgrade
python3 -m venv .venv && source .venv/bin/activate
python3 -m http.server 8000
```

---

## 9) Troubleshooting & FAQ

**“WSL2” option not available**
Update Windows; install/upgrade the Store version of WSL:

```powershell
wsl --update
wsl --set-default-version 2
```

Ensure features are on (see Prerequisites).

**DNS / Network hiccups**
Quick reset:

```powershell
wsl --shutdown
```

Custom DNS (optional):

```bash
# Stop auto-generating resolv.conf
printf "[network]\ngenerateResolvConf = false\n" | sudo tee /etc/wsl.conf
sudo rm -f /etc/resolv.conf
echo "nameserver 1.1.1.1" | sudo tee /etc/resolv.conf
```

Then `wsl --shutdown` and relaunch.

**Port not reachable from Windows**
Bind your service to `0.0.0.0` or `127.0.0.1` as appropriate. Check Windows Firewall. Verify the port isn’t in use (`ss -tulpn` in WSL).

**Disk usage huge under `%LOCALAPPDATA%\Packages\...`**
Your distro uses an `ext4.vhdx` that grows. Reclaim space by:

1. Cleaning caches/logs inside WSL (e.g., `sudo apt clean`).
2. `wsl --shutdown`.
3. Compact the VHDX (Hyper-V tools) or use Docker Desktop’s disk utilities if applicable.

**Reset a distro / change defaults**

```powershell
wsl --unregister <Name>   # DANGER: deletes the distro
wsl --set-default <Name>
```

**Slow Git on Windows-mounted folders**
Keep repos on Linux FS (`~`). If you must use `/mnt/c`, consider mount metadata (see Appendix A).

---

## 10) Resources

* WSL official docs (Microsoft Learn): <a href="https://learn.microsoft.com/windows/wsl/" target="_blank" rel="noopener noreferrer">learn.microsoft.com/windows/wsl/</a>
* Set up a WSL dev environment: <a href="https://learn.microsoft.com/windows/wsl/setup/environment" target="_blank" rel="noopener noreferrer">learn.microsoft.com/windows/wsl/setup/environment</a>
* Advanced config (`wsl.conf` / `.wslconfig`): <a href="https://learn.microsoft.com/windows/wsl/wsl-config" target="_blank" rel="noopener noreferrer">learn.microsoft.com/windows/wsl/wsl-config</a>
* VS Code – Remote WSL: <a href="https://code.visualstudio.com/docs/remote/wsl" target="_blank" rel="noopener noreferrer">code.visualstudio.com/docs/remote/wsl</a>
* Get started: VS Code + WSL tutorial: <a href="https://learn.microsoft.com/windows/wsl/tutorials/wsl-vscode" target="_blank" rel="noopener noreferrer">learn.microsoft.com/windows/wsl/tutorials/wsl-vscode</a>
* Docker Desktop with WSL 2 backend: <a href="https://docs.docker.com/desktop/features/wsl/" target="_blank" rel="noopener noreferrer">docs.docker.com/desktop/features/wsl/</a>
* Run Linux GUI apps (WSLg): <a href="https://learn.microsoft.com/windows/wsl/tutorials/gui-apps" target="_blank" rel="noopener noreferrer">learn.microsoft.com/windows/wsl/tutorials/gui-apps</a>
* GitHub – microsoft/WSL: <a href="https://github.com/microsoft/WSL" target="_blank" rel="noopener noreferrer">github.com/microsoft/WSL</a>

---

## Appendix A: Optional .wslconfig & wsl.conf

**Global settings** (`%UserProfile%\.wslconfig`) — control memory/CPU, etc:

```ini
[wsl2]
memory=6GB           # limit RAM
processors=4         # CPU cores
localhostForwarding=true
# swap=8GB
# swapfile=C:\\WSL\\wsl-swap.vhdx
```

**Per-distro settings** (`/etc/wsl.conf`) — automount, metadata, systemd:

```ini
[boot]
systemd=true

[automount]
enabled=true
options="metadata,umask=22,fmask=11"
mountFsTab=true
```

* `metadata` lets Windows-mounted files respect Linux perms (helps `chmod`, Git).
* `umask/fmask` can make default file perms saner on `/mnt/c`.
* Apply with:

```powershell
wsl --shutdown
```

---

## Appendix B: Video Gallery

<div class="video-grid">
  <div class="embed-16x9">
    <iframe src="https://www.youtube.com/embed/vxTW22y8zV8" title="Linux on Windows......Windows on Linux" allowfullscreen loading="lazy"></iframe>
  </div>
  <div class="embed-16x9">
    <iframe src="https://www.youtube.com/embed/EAROgwvOV4s" title="What Is The Windows Subsystem for Linux (WSL) For?!" allowfullscreen loading="lazy"></iframe>
  </div>
  <div class="embed-16x9">
    <iframe src="https://www.youtube.com/embed/_fntjriRe48" title="WSL 2: Getting started" allowfullscreen loading="lazy"></iframe>
  </div>
  <div class="embed-16x9">
    <iframe src="https://www.youtube.com/embed/LktFP0Dpl-c" title="I Coded with WSL2 for a Week" allowfullscreen loading="lazy"></iframe>
  </div>
  <div class="embed-16x9">
    <iframe src="https://www.youtube.com/embed/9aY9b4zLpC0" title="Running Linux on Windows Experience" allowfullscreen loading="lazy"></iframe>
  </div>
</div>

**Direct links (open in new tab):**

* <a href="https://www.youtube.com/watch?v=vxTW22y8zV8" target="_blank" rel="noopener noreferrer">Linux on Windows......Windows on Linux</a>
* <a href="https://www.youtube.com/watch?v=EAROgwvOV4s" target="_blank" rel="noopener noreferrer">What Is The Windows Subsystem for Linux (WSL) For?!</a>
* <a href="https://www.youtube.com/watch?v=_fntjriRe48&list=PLhfrWIlLOoKNMHhB39bh3XBpoLxV3f0V9" target="_blank" rel="noopener noreferrer">WSL 2: Getting started (playlist)</a>
* <a href="https://www.youtube.com/watch?v=LktFP0Dpl-c" target="_blank" rel="noopener noreferrer">I Coded with WSL2 for a Week</a>
* <a href="https://www.youtube.com/watch?v=9aY9b4zLpC0" target="_blank" rel="noopener noreferrer">Running Linux on Windows Experience</a>

---

## Appendix C: Windows Terminal Profiles (ready-to-paste)

Open Windows Terminal → Settings → **Open JSON** and add a profile for Ubuntu (adjust distro name if needed):

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
  }
}
```

Set it as default by adding near the root of JSON:

```json
"defaultProfile": "{2c4de342-38b7-51cf-b940-2309a097f518}"
```

---

## Appendix D: Docker + GPU (CUDA/WSLg) on WSL

* **NVIDIA GPUs (typical path):**

  1. Install the latest **NVIDIA Windows driver** with WSL support.
  2. Enable Docker Desktop **WSL 2 based engine** and per-distro integration.
  3. Inside WSL, verify:

     ```bash
     nvidia-smi || echo "Driver not detected in WSL"
     docker run --rm --gpus all nvidia/cuda:12.3.1-base-ubuntu22.04 nvidia-smi
     ```
* **AMD/Intel GPUs:** consult vendor docs for WSL support (ROCm / oneAPI).
* **GUI apps with WSLg:** works out of the box on Windows 11 for many apps (see Resources).

> Drivers/toolkits evolve. Always cross-check vendor docs before pinning exact versions.

---

## Appendix E: VS Code Dev Containers (Node + Python example)

Run a consistent dev env (no host pollution) with **Dev Containers**:

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

From VS Code (WSL session) → Command Palette → **Dev Containers: Reopen in Container**.

---

## Appendix F: Automated WSL Backups (PowerShell + Task Scheduler)

**backup-wsl.ps1** — export all distros daily with date-stamped TARs:

```powershell
param(
  [string]$BackupDir = "C:\backups\wsl"
)

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

# Optional: delete backups older than 14 days
Get-ChildItem $BackupDir -File -Filter *.tar |
  Where-Object { $_.CreationTime -lt (Get-Date).AddDays(-14) } |
  Remove-Item -Force
```

* Create a **Task Scheduler** task:

  * Trigger: Daily 03:00
  * Action: `powershell.exe -ExecutionPolicy Bypass -File "C:\scripts\backup-wsl.ps1"`

Restore later with:

```powershell
wsl --import <NewName> C:\WSL\<NewName> C:\backups\wsl\<DATE>-<Distro>.tar --version 2
```

---

## Appendix G: Performance & QoL Tweaks

* **.wslconfig** caps memory/CPUs/swap (see Appendix A).
* **Keep repos on Linux FS** (`~`) for fast I/O.
* **Mount metadata** on `/mnt/c` if you need proper UNIX perms (Appendix A).
* **Disable unnecessary real-time AV scanning** on large `ext4.vhdx` **only if you trust your code**. Add targeted exclusions instead of global ones.
* **Time drift after sleep?** Use:

  ```powershell
  wsl --shutdown
  ```

  on resume if services misbehave.
* **Dotfiles**: keep a Git repo for shell configs (`.bashrc`, `.gitconfig`) and bootstrap new machines quickly.

---

## Appendix H: Troubleshooting Deep Dive

**1) Name resolution flips after network change**
If `resolv.conf` is overwritten, re-enable generation and test:

```ini
# /etc/wsl.conf
[network]
generateResolvConf = true
```

Then:

```powershell
wsl --shutdown
```

If corporate DNS is flaky, switch to a known resolver temporarily (see FAQ).

**2) “Permission denied” on `/mnt/c`**
Mount with metadata (Appendix A). For Git repos on `/mnt/c`, add:

```bash
git config core.filemode false
```

as a last resort.

**3) Port binding conflicts**
On Windows, find the process:

```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess
```

Or inside WSL:

```bash
ss -tulpn | grep 8000
```

**4) Distro stuck on boot**

* `wsl --shutdown`
* Kill stray `vmmem` only if truly hung (use Task Manager carefully).
* `wsl --unregister <Name>` (destructive) as last resort, then restore from backup.

---

## Appendix I: Kali on WSL — Quick Kit

A compact starter to get **Kali Linux** productive inside WSL. Great for CLI tooling, web app testing, and learning workflows. For Wi-Fi monitor mode/USB passthrough and low-level kernel modules, use a full VM.

### 1) Install Kali

* Microsoft Store: search **Kali Linux** → **Get** → **Launch**
* Or PowerShell (Admin):

  ```powershell
  wsl --install -d Kali-Linux
  ```

First boot:

```bash
sudo apt update && sudo apt -y full-upgrade
```

### 2) Enable systemd (recommended on recent WSL)

```bash
sudo nano /etc/wsl.conf
```

```ini
[boot]
systemd=true
```

Apply:

```powershell
wsl --shutdown
```

### 3) Choose metapackages

* Minimal headless:

  ```bash
  sudo apt install -y kali-linux-headless
  ```
* Typical desktop toolset:

  ```bash
  sudo apt install -y kali-linux-default
  ```
* Everything (large download):

  ```bash
  sudo apt install -y kali-linux-large
  ```

### 4) Shell & fonts

* Zsh (+ common helpers):

  ```bash
  sudo apt install -y zsh zsh-autosuggestions zsh-syntax-highlighting
  chsh -s "$(which zsh)"
  ```
* On Windows, install a dev font (e.g., **Cascadia Code** or **Fira Code**) and set it in **Windows Terminal** for the Kali profile.

### 5) VS Code Server (Remote - WSL)

From Kali terminal:

```bash
code .
```

VS Code will auto-install its server into the Kali distro. Suggested extensions: **Remote - WSL**, **Python**, **ESLint**, **Prettier**, **GitHub PRs**.

### 6) Common tools (pick what you need)

```bash
sudo apt install -y nmap nikto sqlmap gobuster metasploit-framework \
  john hashcat wordlists seclists wireshark tshark feroxbuster \
  wapiti ffuf burpsuite
```

* Add your user to the `wireshark` group if you need packet capture without sudo:

  ```bash
  sudo usermod -aG wireshark "$USER"
  ```

  Then restart the session.

### 7) Optional GUI paths

* **WSLg (Windows 11)**: many Linux GUI apps just work (e.g., `burpsuite`, `wireshark`).
* **KeX** (RDP-like desktop session for Kali on WSL):

  ```bash
  sudo apt install -y kali-win-kex
  kex --win -s
  ```

  Note: KeX is optional when WSLg is available.

### 8) Interop & defaults

* Set default user for the distro from Windows:

  ```powershell
  kali config --default-user <your_user>
  ```
* Open Explorer from Kali:

  ```bash
  explorer.exe .
  ```

**Good to know:** Wireless injection/monitor mode, USB gadget work, and raw device access are limited under WSL. Use a VM for those exercises → [Build a Home Cybersecurity Lab](/posts/home-cyber-lab/).

---

## Appendix J: GPU Quick Start Box (NVIDIA/AMD/Intel)

A no-nonsense checklist to validate GPU in WSL for compute and containers.

### A) NVIDIA (most common)

1. **Install latest NVIDIA Windows driver** (with WSL support).
2. In **Docker Desktop**: enable **WSL 2 based engine** + per-distro integration.
3. Inside your WSL distro:

   ```bash
   # Check driver visibility
   nvidia-smi || echo "Driver not detected in WSL"

   # (Optional) CUDA toolkit inside WSL for nvcc:
   # sudo apt install -y nvidia-cuda-toolkit

   # Sanity test with container:
   docker run --rm --gpus all nvidia/cuda:12.3.1-base-ubuntu22.04 nvidia-smi
   ```
4. Popular frameworks (examples):

   ```bash
   # PyTorch (CUDA-enabled build will be auto-picked in many cases)
   python -m pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121

   # Or TensorFlow (match to your CUDA stack per upstream guidance)
   python -m pip install tensorflow
   ```

### B) AMD / Intel

* Ensure you have **recent Windows drivers** (ROCm for AMD, oneAPI for Intel) and follow vendor-specific WSL notes.
* Validate via vendor sample containers or CLI tools when available.

### C) GUI + GPU

* With **WSLg** on Windows 11, many OpenGL/GUI apps run out of the box. For heavy workloads, prefer containerized toolkits and check vendor docs for exact versions.

> Always cross-check framework versions with the driver/toolkit matrix before pinning them in production projects.

---

*Continue your track:*

* [Mastering Linux for Cybersecurity](/posts/mastering-linux-for-cybersecurity/)
* [Build a Home Cybersecurity Lab](/posts/home-cyber-lab/)

```

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})