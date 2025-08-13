Quá ok nè! Mình in nguyên file **Markdown** ra đây để bạn copy–paste vào `_posts/2025-08-14-linux-for-cybersecurity-master-guide.md` (hoặc tên bạn thích).

````markdown
---
layout: post
title: "Linux for Cybersecurity — From Zero to Daily Driver (Deep Guide)"
permalink: /posts/linux-for-cybersecurity-guide/
tags: [linux, cybersecurity, guide, shell, bash, beginner, ricing]
description: "What Linux is, why it’s the best base for cybersecurity, how to pick your first distro, the skills to learn (CLI → Bash scripting), and how to rice your system with taste."
---

# Linux for Cybersecurity — From Zero to Daily Driver (Deep Guide)

This is the guide I wish I had when I started: **clear mental models**, **practical steps**, and **projects that stick**. We’ll cover what Linux *really* is, why it’s the best environment for cybersecurity, how to pick your first distro, how to grow from CLI basics into Bash scripting, and finally how to **rice** (customize) your environment so it feels fast, beautiful, and *yours*.

> If you’re totally new, warm up with my Bandit series:
> <a href="{{ '/posts/overthewire/bandit-overview/' | relative_url }}" target="_blank" rel="noopener">OverTheWire Bandit — Complete Walkthrough Index</a>.

---

## 1) What Linux actually is (no fluff)

- **Kernel vs. Distribution.** *Linux* is the **kernel** (the core that manages hardware). A **distribution** (Ubuntu, Fedora, Arch, etc.) bundles the kernel with userland (GNU tools), a package manager, defaults, and sometimes a desktop environment.
- **GNU/Linux userspace.** Everyday commands (`ls`, `grep`, `find`, `awk`, `sed`) come from GNU coreutils and friends. Your shell is typically **bash** or **zsh**.
- **Unix philosophy.** Do one thing well, compose with pipes. This is why Linux feels like LEGO: lots of tiny tools you can chain into powerful workflows.
- **Servers rule.** Most of the world’s servers run Linux. If you learn it well, you can move confidently between laptops, VPS, containers, and cloud.

Keep this mental model as your compass; everything else will click around it.

---

## 2) Why Linux for cybersecurity

- **First-class tooling.** Offense and defense tools are written for Linux first (or only): `nmap`, `tcpdump`, `wireshark`, `hydra`, `aircrack-ng`, `iptables/nftables`, `suricata`, `zeek`, etc.
- **Transparency.** Open source means you can **inspect**, **audit**, and **modify**. That’s invaluable for learning and for trust.
- **Automation power.** Shell + Bash + cron + systemd timers → you can automate recon, monitoring, log parsing, backups, lab resets.
- **Networking is native.** The OS *expects* you to be comfortable with sockets, routing, interfaces, services, and logs.
- **Containers & clouds.** Docker, Podman, Kubernetes… all feel natural on Linux. You’ll meet them everywhere in modern security workflows.
- **Career leverage.** From SOC to Red Team to DevSecOps, Linux fluency is a **force multiplier**.

---

## 3) Pick your **first distro** (decision guide)

> TL;DR: **Ubuntu LTS** or **Fedora Workstation** for your *daily driver*. Use **Kali/Parrot** as **tools**, not as your first everyday OS.

- **If you want maximum stability & tutorials everywhere:** **Ubuntu LTS** (or Linux Mint if you like a Windows-like UI).
- **If you want latest desktop & kernels but still polished:** **Fedora Workstation**.
- **If your laptop is weak (≤4GB RAM):** Ubuntu flavors (Xubuntu/Lubuntu) or Debian XFCE.
- **If you’re on Windows and can’t dual-boot yet:** **WSL2** with Ubuntu. Great for CLI learning (no GUI), then move to a VM later.
- **Kali/Parrot:** awesome **toolsets** for pentesting, but they are **not** ideal as first daily drivers. Better: keep a stable OS, then run Kali **inside a VM** when needed, or install specific security tools via your package manager/containers.

### Minimum VM spec (good enough):
- 2 vCPU, 4–8 GB RAM, 30+ GB disk, bridged networking (or NAT) in VirtualBox/VMware.

---

## 4) Your first 10 days on Linux (habits first)

**Day 1–2 — Navigation & files**
- `pwd`, `cd -`, `ls -la`, `tree`, `cat`, `less`, `head`, `tail -f`
- Create `~/lab` and live there.

**Day 3–4 — Pipes & search**
- `grep -R`, `rg` (ripgrep), `find`, `cut`, `sort`, `uniq -c`, `wc -l`
- Practice: “Count unique IPs in this log” with a one-liner.

**Day 5 — Permissions**
- `chmod`, `chown`, `umask`, and the `rwx` model. Understand it deeply.

**Day 6 — Processes & jobs**
- `ps aux`, `top`/`htop`, `kill`, job control: `&`, `Ctrl+Z`, `bg`, `fg`, `disown`.

**Day 7 — Packages**
- Learn your PM well (Ubuntu: `apt`, Fedora: `dnf`).

**Day 8 — Services & logs (systemd)**
- `systemctl status/start/enable`, `journalctl -u SERVICE -xe`.

**Day 9 — Networking**
- `ip a`, `ss -tulpn`, `curl -I`, `scp`, `rsync -avh`.

**Day 10 — Editor**
- Pick **nano** (fastest start) or **vim** (worth it). Stick to one for 30 days.

---

## 5) The 80/20 command toolkit (copy this into your notes)

**Files & disk**  
`ls -la`, `tree`, `du -sh *`, `df -h`, `lsblk`, `mkdir -p`, `cp -r`, `mv`, `rm -i`

**Search & text**  
`grep -R`, `rg`, `find`, `sort`, `uniq -c`, `cut -d -f`, `awk`, `sed`, `tr`, `xargs`

**Archives**  
`tar -czf / -xzf`, `zip`/`unzip`

**Permissions**  
`chmod 644/755`, `chown user:group file`, `umask 022`

**Processes & jobs**  
`ps aux`, `top`/`htop`, `kill -9 PID`, `nohup`, `tmux`

**Networking**  
`ip a`, `ping`, `ss -tulpn`, `curl`, `wget`, `scp`, `rsync`

**Services & logs**  
`systemctl`, `journalctl -u name -xe`

---

## 6) From CLI to **Bash scripting**

You don’t memorize Bash; you **write tiny scripts** that remove pain. Start with this header:

```bash
#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'
````

* `-e` stop on error, `-u` undefined variable is error, `-o pipefail` fail if any pipe stage fails.
* Prefer **functions**, **long options**, and **`getopts`** for flags.

### Script #1 — Daily backup (minimal but robust)

```bash
#!/usr/bin/env bash
set -euo pipefail
dest="${1:-$HOME/backups}"
mkdir -p "$dest"
ts=$(date +%F_%H%M%S)
tar -czf "$dest/lab_${ts}.tgz" "$HOME/lab"
echo "Backup complete → $dest/lab_${ts}.tgz"
```

**Cron it (8am daily):**

```bash
crontab -e
# add:
0 8 * * * /home/you/bin/backup_lab.sh >>/home/you/backup.log 2>&1
```

### Script #2 — Quick alive-host scan (safe & useful)

```bash
#!/usr/bin/env bash
set -euo pipefail
subnet="${1:-192.168.1}"
printf "Scanning %s.0/24...\n" "$subnet"
for i in $(seq 1 254); do
  ip="${subnet}.${i}"
  (ping -c1 -W1 "$ip" >/dev/null 2>&1 && echo "UP  $ip") &
done
wait
```

### Script #3 — Port sweep with `nc` (for your own lab)

```bash
#!/usr/bin/env bash
set -euo pipefail
host="${1:-127.0.0.1}"
for p in 22 80 443 3128 3306 6379 8000 8080; do
  (echo >/dev/tcp/$host/$p) >/dev/null 2>&1 && echo "OPEN $p" || true
done
```

> Practice tip: convert your favorite one-liners into scripts, give them friendly names, and put them under `~/bin` (on PATH).

---

## 7) Learning roadmap (30 days → 90 days)

**Days 1–30 (Foundation)**

* Files, processes, permissions, packages, services/logs, networking basics.
* Project: **home lab** in a VM; host a simple web site with `nginx`, enable logs, rotate them.

**Days 31–60 (Scripting & services)**

* Bash variables, arrays, functions, `getopts`, exit codes, traps.
* Project: write a **log watcher** that alerts on certain patterns.
* Learn `tmux` (panes, sessions) and an editor deeper (vim movements + search/replace).

**Days 61–90 (Security workflows)**

* Traffic captures with `tcpdump`/Wireshark; parse with `tshark` + pipes.
* Build a small SOC toy: `journalctl` + grep pipelines; `fail2ban`-style logic in Bash.
* Containers: package a toolchain in Docker; learn Dockerfiles & volumes.

---

## 8) Build your **practice lab** (safe targets only)

* **OTW Bandit** → Krypton/Narnia (puzzles with purpose).
* **Deliberately vulnerable apps** in **containers/VMs** (for learning, not on production networks):

  * OWASP Juice Shop, DVWA, Metasploitable (VM), WebGoat.
* **Network playground:** one Linux router VM + two host VMs to practice `iptables/nftables`, routing, and logging.

> Golden rule: practice **ethically** and **legally**. Only target systems you own or have explicit permission to test.

---

## 9) Ricing: make it *yours* (looks + speed)

Ricing is not just aesthetics; it’s **discoverability**, **speed**, and **joy**. Keep it tasteful and minimal at first.

### Terminal & shell

* **Fonts:** install a Nerd Font (e.g., FiraCode Nerd Font).
* **Prompt:** try **starship** (fast, cross-shell).

Install starship + minimal config:

```bash
# Ubuntu/Fedora (example):
curl -fsSL https://starship.rs/install.sh | bash -s -- -y
echo 'eval "$(starship init bash)"' >> ~/.bashrc
mkdir -p ~/.config
cat > ~/.config/starship.toml <<'EOF'
add_newline = true
format = "$all"
scan_timeout = 10
[username] show_always = true
[hostname] ssh_only = false
[directory] truncation_length = 3
[cmd_duration] min_time = 200
[character] success_symbol = "[➜] " error_symbol = "[✗] "
EOF
```

### Shell QoL (drop into `~/.bashrc` or `~/.zshrc`)

```bash
# Safer defaults
alias rm='rm -i'; alias cp='cp -i'; alias mv='mv -i'
# Quality-of-life
alias ll='ls -alF'; alias ..='cd ..'; alias ...='cd ../..'
alias duh='du -sh *'; alias ports='ss -tulpn | less'
# History search on Up/Down
bind '"\e[A": history-search-backward'
bind '"\e[B": history-search-forward'
```

### Tmux (session management)

`~/.tmux.conf` starter:

```tmux
set -g mouse on
set -g history-limit 100000
setw -g mode-keys vi
bind r source-file ~/.tmux.conf \; display "Reloaded!"
bind | split-window -h
bind - split-window -v
bind h select-pane -L
bind j select-pane -D
bind k select-pane -U
bind l select-pane -R
```

### Editor theme

If you’re on **vim/neovim**, pick **one** theme (Tokyonight/Dracula/One) and stick for a month. Learn motions (`w`, `b`, `0`, `$`), search (`/`), replace (`:%s/old/new/g`), buffers, and splits.

### Desktop environment (optional, later)

* Start with your distro default (GNOME/KDE).
* When comfortable, try window managers (i3, sway, awesome).
* Keep a **dotfiles** repo for your configs (`~/.config/*`, `~/.bashrc`, `~/.tmux.conf`, editor settings).

> Guiding principle: **few, consistent, well-understood tools** > flashy screenshots. Rice to reduce friction, not to impress Reddit.

---

## 10) Common pitfalls (and fixes)

* **“Permission denied.”** Check `ls -l`, owner/group; use `sudo` *only* when needed. Scripts must be `chmod +x`.
* **Command not found.** `which cmd`, check `$PATH`, install via package manager.
* **Port already in use.** `sudo ss -tulpn | grep :PORT`, stop or change service.
* **Cron works weird.** Use absolute paths; redirect stdout/stderr; minimal environment.
* **Breaking your system.** Avoid random `curl | sh` scripts; prefer packages. Snapshot VMs before experiments.

---

## 11) Stretch projects (pick one and ship it)

* **Backup suite**: daily `tar` with retention policy + integrity check + off-box copy with `rsync`.
* **Threat-hunt toy**: parse auth logs, detect brute force, auto-ban via `iptables`/`nftables`.
* **Recon helper**: wrapper around `nmap` + `httpx` + `aquatone` (or alternatives) with structured output.
* **Homelab observability**: ship logs to a containerized stack (Grafana/Prometheus/Loki) and create a security dashboard.

---

## 12) A learning philosophy to keep

* **Touch it daily.** 20 minutes > 2 hours once a week.
* **Write it down.** Notes make knowledge durable.
* **Automate the boring stuff.** If you do it twice, script it.
* **Be ethical.** Practice on your lab; permission is mandatory.
* **Have fun ricing.** Personality fuels consistency.

---

## Appendix A — CLI mini-cheatsheet

```bash
# disk & space
df -h; du -sh *; lsblk

# search through logs
grep -R "pattern" /var/log
journalctl -u ssh -S "1 hour ago" -f

# network quickies
ip a; ip route; ss -tulpn; curl -I https://example.com

# compress & transfer
tar -czf site.tgz site/
scp site.tgz user@host:/tmp/
rsync -avh ~/lab user@host:~/lab-backup/

# jobs & processes
sleep 300 &; jobs; fg; bg; disown
ps aux | grep name; pkill -9 name
```

---

## Appendix B — Safe starter scripts

**`~/bin/safedel.sh`** (moves to trash directory instead of deleting)

```bash
#!/usr/bin/env bash
set -euo pipefail
trash="$HOME/.local/share/Trash/files"
mkdir -p "$trash"
for f in "$@"; do
  mv -v -- "$f" "$trash/"
done
echo "Moved to trash → $trash"
```

**`~/bin/logwatch.sh`** (tail & alert on pattern)

```bash
#!/usr/bin/env bash
set -euo pipefail
log="${1:-/var/log/auth.log}"
pattern="${2:-Failed password}"
tail -Fn0 "$log" | \
while read -r line; do
  if [[ "$line" == *"$pattern"* ]]; then
    printf '[%(%F %T)T] ALERT: %s\n' -1 "$line"
  fi
done
```

---

## Final words

Linux isn’t a course; it’s a **daily craft**. Start simple, build reps, automate tiny pains, and rice just enough to love your setup. The cybersecurity part grows naturally when your hands are fluent on the terminal. You’ve got this. 🐧💪

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})