---
layout: post
title: "Master Linux Package Managers: apt, pacman, and dnf"
permalink: /posts/master-package-managers/
tags: [linux, apt, pacman, dnf, package-manager, troubleshooting, beginner, guide]
description: "Hands-on guide to apt (Debian/Ubuntu), pacman (Arch), and dnf (Fedora/RHEL): daily operations, config, troubleshooting, safe cleanups."
excerpt_separator: <!--more-->
---

<!-- Scoped styles for THIS post only -->
<style>
/* Responsive video embeds (16:9) — kept for consistency across posts */
.embed-16x9 { position: relative; width: 100%; aspect-ratio: 16 / 9; }
.embed-16x9 iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }

/* Tables + scroll */
.table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
.md-table table { width: 100%; border-collapse: collapse; font-size: 0.95rem; }
.md-table th, .md-table td { padding: .6rem .8rem; border: 1px solid #e5e7eb; }
.md-table thead th { background: #f8fafc; text-align: left; }

/* Dark mode soften */
@media (prefers-color-scheme: dark) {
  .md-table th, .md-table td { border-color: rgba(255,255,255,.12); }
  .md-table thead th { background: rgba(255,255,255,.06); }
}

/* Callouts */
.callout { padding:.8rem 1rem; border-left:4px solid #6b7280; background:rgba(107,114,128,.08); margin:1rem 0; }
.callout.warn { border-color:#d97706; background:rgba(217,119,6,.08); }
.callout.ok { border-color:#059669; background:rgba(5,150,105,.08); }
</style>

This is your practical field guide to the three most common package managers on Linux desktops and servers:

- **apt** for Debian/Ubuntu
- **pacman** for Arch-based systems
- **dnf** for Fedora/RHEL-like systems

We will keep things hands-on: daily commands, where the configuration lives, how to clean up safely, and how to fix common breakages. If you’re aiming at security or blue-team work, pair this with the path here: <a href="/posts/mastering-linux-for-cybersecurity/" target="_blank" rel="noopener noreferrer">Mastering Linux for Cybersecurity</a>.

## Table of Contents
- [Why Package Managers Matter](#why-package-managers-matter)
- [Quick Comparison](#quick-comparison)
- [apt (Debian/Ubuntu)](#apt-debianubuntu)
- [pacman (Arch)](#pacman-arch)
- [dnf (Fedora/RHEL)](#dnf-fedorarhel)
- [Hands-on Example: Install Nmap Across apt, pacman, and dnf](#hands-on-example-install-nmap-across-apt-pacman-and-dnf)
- [Safe Cleanups](#safe-cleanups)
- [Common Errors & Fixes](#common-errors--fixes)
- [Package Manager Health Check](#package-manager-health-check)
- [Bonus: Cross-Distro Helper](#bonus-cross-distro-helper)
- [Mini Cheatsheet](#mini-cheatsheet)
- [Further Reading](#further-reading)

<!--more-->

---

## Why Package Managers Matter

Package managers (PMs) keep your system consistent: they resolve dependencies, verify signatures, upgrade safely, and maintain history. Learn one deeply, then map the muscle memory to others.

<div class="callout warn">
Run commands that modify the system with <code>sudo</code>. Avoid mixing different PM ecosystems (e.g., using <code>pip</code> with <code>sudo</code> to overwrite distro Python packages).
</div>

<!-- Main video embed -->
<div class="embed-16x9" markdown="0">
  <iframe src="https://www.youtube.com/embed/1lLZ-59xH3Y"
          title="Linux Packaging Formats explained: Flatpak vs Snaps vs DEB & RPM vs AppImage vs AUR"
          allowfullscreen loading="lazy"></iframe>
</div>

---

## Quick Comparison

<div class="table-scroll md-table" markdown="1">

| Feature | **apt** (Debian/Ubuntu) | **pacman** (Arch) | **dnf** (Fedora/RHEL) |
|---|---|---|---|
| Daily install | `sudo apt install pkg` | `sudo pacman -S pkg` | `sudo dnf install pkg` |
| Upgrade all | `sudo apt update && sudo apt upgrade` | `sudo pacman -Syu` | `sudo dnf upgrade --refresh` |
| Search | `apt search term` | `pacman -Ss term` | `dnf search term` |
| Info | `apt show pkg` | `pacman -Si pkg` / `-Qi` | `dnf info pkg` |
| Remove | `sudo apt remove pkg` / `purge` | `sudo pacman -R pkg` / `-Rns` | `sudo dnf remove pkg` |
| List installed | `apt list --installed` | `pacman -Q` / `-Qs` | `dnf list installed` |
| Config file | `/etc/apt/apt.conf*` | `/etc/pacman.conf` | `/etc/dnf/dnf.conf` |
| Repos | `/etc/apt/sources.list{,.d}` | `/etc/pacman.d/mirrorlist` | `/etc/yum.repos.d/*.repo` |
| GPG keys | `/etc/apt/trusted.gpg.d/`, `/usr/share/keyrings/` | `pacman-key` DB at `/etc/pacman.d/gnupg` | RPM keys in `/etc/pki/rpm-gpg/` |
| Cache dir | `/var/cache/apt/archives` | `/var/cache/pacman/pkg` | `/var/cache/dnf` |
| Logs/history | `/var/log/apt/` (`history.log`, `term.log`) | `/var/log/pacman.log` | `/var/log/dnf.log`, `dnf history` |

</div>

Refrences video:
<!-- Supporting video after comparison -->
<div class="embed-16x9" markdown="0">
  <iframe src="https://www.youtube.com/embed/lkii2cGuKao"
          title="Linux Package Management | Debian, Fedora, and Arch Linux"
          allowfullscreen loading="lazy"></iframe>
</div>

---

## apt (Debian/Ubuntu)

### Daily operations

```bash
# search & info
apt search <term>
apt show <pkg>            # detailed info
apt policy <pkg>          # show available versions / pinning

# install / remove
sudo apt install <pkg>
sudo apt remove <pkg>     # keep config files
sudo apt purge <pkg>      # remove with config

# update / upgrade
sudo apt update
sudo apt upgrade          # safe upgrade
sudo apt full-upgrade     # may remove/replace packages (formerly dist-upgrade)

# list things
apt list --installed
apt list --upgradable
````

### Sources & configuration

* **Repos**: `/etc/apt/sources.list` and `/etc/apt/sources.list.d/*.list`
* **Main config**: `/etc/apt/apt.conf` (and `.d/` includes)
* **Pinning**: `/etc/apt/preferences.d/*.pref`

Add a PPA or repository:

```bash
# Ubuntu PPA helper (adds repo + key):
sudo add-apt-repository ppa:<owner>/<ppa>
sudo apt update

# Generic (signed-by best practice)
echo "deb [signed-by=/usr/share/keyrings/vendor.gpg] https://repo.example.org stable main" \
 | sudo tee /etc/apt/sources.list.d/vendor.list

curl -fsSL https://repo.example.org/key.gpg | sudo gpg --dearmor -o /usr/share/keyrings/vendor.gpg
sudo apt update
```

> Note: `apt-key` is deprecated; prefer `signed-by=` with a dedicated keyring.

### GPG, cache, and logs

* **Keys**: `/etc/apt/trusted.gpg.d/`, `/usr/share/keyrings/`
* **Cache**: `/var/cache/apt/archives`
* **Logs**: `/var/log/apt/history.log`, `/var/log/apt/term.log`

### Fixes you will actually use

```bash
# finish interrupted dpkg configuration
sudo dpkg --configure -a

# fix broken deps
sudo apt --fix-broken install

# release lock (only if no apt/dpkg is running!)
sudo lsof /var/lib/dpkg/lock-frontend /var/lib/apt/lists/lock /var/cache/apt/archives/lock
# if stale: sudo rm -f <lockfile> && sudo dpkg --configure -a
```

---

## pacman (Arch)

### Daily operations

```bash
# refresh DB + upgrade everything (Arch discourages partial upgrades)
sudo pacman -Syu

# search & info
pacman -Ss <term>
pacman -Si <pkg>      # repo info
pacman -Qi <pkg>      # local install info
pacman -Qs <term>     # search installed

# install / remove
sudo pacman -S <pkg>
sudo pacman -R <pkg>          # remove keeping deps if still required
sudo pacman -Rns <pkg>        # remove with deps not needed + configs

# query files / ownership
pacman -Ql <pkg>              # list files in package
pacman -Qo /path/to/file      # which package owns this file?

# local file install
sudo pacman -U ./pkgfile.pkg.tar.zst
```

### Configuration, mirrors, keys

* **Config**: `/etc/pacman.conf` (enable repos, color, ParallelDownloads, etc.)
* **Mirrors**: `/etc/pacman.d/mirrorlist` (order matters). Tools like `reflector` can auto-rank mirrors.
* **Keys**: pacman uses its own keyring:

```bash
# refresh / (re)initialize keyring
sudo pacman -Sy archlinux-keyring
sudo pacman-key --init
sudo pacman-key --populate archlinux
```

### Cache, logs, hooks

* **Cache**: `/var/cache/pacman/pkg`
* **Logs**: `/var/log/pacman.log`
* **Hooks**: `/usr/share/libalpm/hooks/` (pkg-provided) and `/etc/pacman.d/hooks/` (local)

> AUR helpers (e.g., `yay`, `paru`) are community tools; learn pure pacman first and read PKGBUILDs before installing.

---

## dnf (Fedora/RHEL)

### Daily operations

```bash
# refresh metadata + upgrade all
sudo dnf upgrade --refresh

# search & info
dnf search <term>
dnf info <pkg>
dnf list installed
dnf check-update

# install / remove
sudo dnf install <pkg>
sudo dnf remove <pkg>

# history
dnf history
sudo dnf history undo <ID>   # rollback a transaction (when possible)
```

### Repos, modules, configuration

* **Repos**: `/etc/yum.repos.d/*.repo`
* **Config**: `/etc/dnf/dnf.conf` (e.g., `fastestmirror=1`, `max_parallel_downloads=10`, `installonly_limit=3`)
* **Modularity** (Fedora/RHEL streams):

```bash
dnf module list
sudo dnf module enable nodejs:20
sudo dnf module install nodejs:20/common
```

### Keys, cache, logs

* **Keys**: typically stored under `/etc/pki/rpm-gpg/`; import with `sudo rpm --import /path/to/RPM-GPG-KEY`
* **Cache**: `/var/cache/dnf`
* **Logs & history**: `/var/log/dnf.log` and `dnf history` for transactions

### Useful checks

```bash
# verify dependency sanity and duplicates
sudo dnf check
sudo dnf repoquery --duplicated
sudo dnf distro-sync    # align to repo versions
```

---

## Hands-on Example: Install Nmap Across apt, pacman, and dnf

The same task on three ecosystems. We’ll install **Nmap**, verify it works, confirm what got logged, and then cleanly roll back.

### Debian/Ubuntu (apt)

```bash
# install
sudo apt update
sudo apt install -y nmap

# verify
nmap --version
dpkg -L nmap | head     # files installed by the package

# see what happened (logs)
grep -i nmap /var/log/apt/history.log || true
grep -i nmap /var/log/apt/term.log || true

# remove (keep config) / purge (remove config)
sudo apt remove -y nmap
# sudo apt purge -y nmap
```

### Arch (pacman)

```bash
# install (Arch discourages partial upgrades, so do -Syu)
sudo pacman -Syu --needed nmap

# verify
nmap --version
pacman -Ql nmap | head   # files in package

# logs & history
grep -i nmap /var/log/pacman.log || true

# remove (with configs and unneeded deps)
sudo pacman -Rns nmap
```

### Fedora/RHEL (dnf)

```bash
# install
sudo dnf install -y nmap

# verify
nmap --version
rpm -ql nmap | head       # files in RPM

# history / logs
dnf history | head
sudo grep -i nmap /var/log/dnf.log || true

# remove
sudo dnf remove -y nmap
```

> Tip: if you’re comparing behavior, also check cache directories:
> – apt → `/var/cache/apt/archives`
> – pacman → `/var/cache/pacman/pkg`
> – dnf → `/var/cache/dnf`

---

## Safe Cleanups

<div class="table-scroll md-table" markdown="1">

| Manager    | Clean cache                                                | Remove orphans                                           | Notes                                                                                  |
| ---------- | ---------------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| **apt**    | `sudo apt clean` (all) / `sudo apt autoclean` (old)        | `sudo apt autoremove`                                    | `clean` can free multiple GB on long-lived systems. Review the list before confirming. |
| **pacman** | `sudo pacman -Sc` (safe) / `sudo pacman -Scc` (aggressive) | `pacman -Qtdq` lists; `sudo pacman -Rns $(pacman -Qtdq)` | `-Scc` deletes all cached packages including current ones; only for space emergencies. |
| **dnf**    | `sudo dnf clean packages` / `sudo dnf clean all`           | `sudo dnf autoremove`                                    | Consider setting `installonly_limit=2` in `/etc/dnf/dnf.conf` to cap old kernels.      |

</div>

<div class="callout warn">
Before removing “orphans”, scan the list. Some tools are intentionally optional and still useful.
</div>

---

## Common Errors & Fixes

### apt

* **`NO_PUBKEY` or signature errors**
  Use per-repo keyring and `signed-by=` (avoid deprecated `apt-key`):

  ```bash
  curl -fsSL https://repo.example.org/key.gpg | sudo gpg --dearmor -o /usr/share/keyrings/vendor.gpg
  # ensure your .list uses: [signed-by=/usr/share/keyrings/vendor.gpg]
  sudo apt update
  ```

* **Interrupted dpkg / broken deps**

  ```bash
  sudo dpkg --configure -a
  sudo apt --fix-broken install
  ```

* **Lock files present** (no apt running)
  Check and remove stale locks cautiously:

  ```bash
  sudo lsof /var/lib/dpkg/lock-frontend /var/lib/apt/lists/lock /var/cache/apt/archives/lock
  sudo rm -f /var/lib/dpkg/lock-frontend /var/lib/apt/lists/lock /var/cache/apt/archives/lock
  sudo dpkg --configure -a
  ```

### pacman

* **`database is locked`**

  ```bash
  sudo rm -f /var/lib/pacman/db.lck
  ```

* **Keyring / PGP signature failures**

  ```bash
  sudo pacman -Sy archlinux-keyring
  sudo pacman-key --init
  sudo pacman-key --populate archlinux
  # ensure system clock is sane
  timedatectl status
  ```

* **Failed to synchronize databases / bad mirrors**
  Update mirrorlist (example with reflector):

  ```bash
  sudo pacman -S reflector
  sudo reflector -c <YourCountry> -a 12 -p https --sort rate --save /etc/pacman.d/mirrorlist
  sudo pacman -Syyu
  ```

* **Partial upgrades**
  Avoid `-Sy` followed by `-S <pkg>` later. Always use `-Syu` together.

### dnf

* **GPG check failed**
  Import or validate the repo key and ensure `gpgcheck=1` to keep safety:

  ```bash
  sudo rpm --import /etc/pki/rpm-gpg/RPM-GPG-KEY-fedora-40-x86_64
  sudo dnf clean metadata && sudo dnf makecache
  ```

* **Metadata/cache issues**

  ```bash
  sudo dnf clean metadata
  sudo dnf makecache
  ```

* **RPM database problems**

  ```bash
  sudo rpm --rebuilddb
  sudo dnf distro-sync
  ```

* **DNF is locked**
  If no transaction is running, remove the stale PID:

  ```bash
  sudo rm -f /var/run/dnf.pid /var/run/yum.pid
  ```

---

## Package Manager Health Check

This read-only script inspects common pitfalls: stale locks, keyrings, repo files, cache size, and basic network/DNS reachability. It doesn’t install or remove anything.

Save as `pm-health.sh`, make it executable (`chmod +x pm-health.sh`), then run: `./pm-health.sh`.

```bash
#!/usr/bin/env bash
set -Eeuo pipefail

bold() { printf "\033[1m%s\033[0m\n" "$*"; }
ok()   { printf "[OK] %s\n" "$*"; }
warn() { printf "[WARN] %s\n" "$*" >&2; }
err()  { printf "[ERR] %s\n" "$*" >&2; }

pm=""; os=""
command -v apt    >/dev/null 2>&1 && pm="apt"
command -v pacman >/dev/null 2>&1 && pm="pacman"
command -v dnf    >/dev/null 2>&1 && pm="dnf"
os="$(uname -s)"

bold "Package Manager Health Check"
echo "Detected PM: ${pm:-none} | OS: $os"
echo "------------------------------------------"

# 1) Network & DNS
bold "1) Network & DNS"
if getent hosts example.com >/dev/null 2>&1; then
  ok "DNS resolution works (example.com)"
else
  warn "DNS resolution failed (example.com)"
fi
if curl -I -s --max-time 5 https://github.com >/dev/null 2>&1; then
  ok "HTTPS reachability OK (github.com)"
else
  warn "HTTPS check failed (github.com)"
fi
echo

# 2) Locks
bold "2) Locks"
case "$pm" in
  apt)
    for f in /var/lib/dpkg/lock-frontend /var/lib/apt/lists/lock /var/cache/apt/archives/lock; do
      if [ -e "$f" ]; then
        if fuser "$f" >/dev/null 2>&1; then warn "Lock in use: $f"; else warn "Stale lock found: $f"; fi
      fi
    done
    ;;
  pacman)
    f=/var/lib/pacman/db.lck
    [ -e "$f" ] && warn "Lock present: $f" || ok "No pacman lock"
    ;;
  dnf)
    for f in /var/run/dnf.pid /var/run/yum.pid; do
      [ -e "$f" ] && warn "Lock present: $f" || true
    done
    [ ! -e /var/run/dnf.pid ] && [ ! -e /var/run/yum.pid ] && ok "No dnf/yum lock"
    ;;
  *)
    warn "Unknown PM; skipping lock checks"
    ;;
esac
echo

# 3) Repos & Keys
bold "3) Repos & Keys"
case "$pm" in
  apt)
    repos=$(ls -1 /etc/apt/sources.list /etc/apt/sources.list.d 2>/dev/null | wc -l || echo 0)
    keys=$(ls -1 /etc/apt/trusted.gpg.d 2>/dev/null | wc -l || echo 0)
    k2=$(ls -1 /usr/share/keyrings 2>/dev/null | wc -l || echo 0)
    ok "Repo files: $repos | Keyrings: trusted.gpg.d=$keys, /usr/share/keyrings=$k2"
    ;;
  pacman)
    [ -s /etc/pacman.conf ] && ok "pacman.conf present"
    [ -s /etc/pacman.d/mirrorlist ] && ok "mirrorlist present"
    if sudo -n pacman-key --list-keys >/dev/null 2>&1; then
      ok "keyring readable"
    else
      warn "keyring may need init: pacman-key --init && --populate archlinux"
    fi
    ;;
  dnf)
    repos=$(ls -1 /etc/yum.repos.d/*.repo 2>/dev/null | wc -l || echo 0)
    ok "Repo files: $repos"
    if rpm -qa gpg-pubkey >/dev/null 2>&1; then
      ok "RPM GPG keys installed ($(rpm -qa gpg-pubkey | wc -l))"
    else
      warn "No RPM GPG keys detected"
    fi
    ;;
esac
echo

# 4) Cache Size
bold "4) Cache Size"
case "$pm" in
  apt)    dir=/var/cache/apt/archives ;;
  pacman) dir=/var/cache/pacman/pkg ;;
  dnf)    dir=/var/cache/dnf ;;
  *)      dir="" ;;
esac
if [ -n "${dir}" ] && [ -d "${dir}" ]; then
  sz=$(du -sh "${dir}" 2>/dev/null | awk '{print $1}')
  ok "Cache ${dir}: ${sz}"
else
  warn "Cache directory not found"
fi
echo

# 5) Sanity Checks (non-invasive)
bold "5) Sanity Checks"
case "$pm" in
  apt)
    if sudo -n true 2>/dev/null; then
      if sudo apt-get -s upgrade >/dev/null 2>&1; then ok "apt dependency graph OK (dry-run)"; else warn "apt dry-run upgrade reported issues"; fi
    else
      warn "Run with sudo for full apt checks"
    fi
    ;;
  pacman)
    if pacman -Sl >/dev/null 2>&1; then ok "pacman sync DB readable"; else warn "pacman sync DB issue (try: sudo pacman -Syy)"; fi
    ;;
  dnf)
    if sudo -n dnf check >/dev/null 2>&1; then ok "dnf check OK"; else warn "dnf check reported issues"; fi
    ;;
esac

echo
bold "Done."
```

---

## Bonus: Cross-Distro Helper

Drop this in your shell profile (e.g., `~/.bashrc`) to normalize basic operations across apt/pacman/dnf:

```bash
pm() {
  local action="$1"; shift || true
  if command -v apt >/dev/null 2>&1; then
    case "$action" in
      install) sudo apt update && sudo apt install -y "$@";;
      remove)  sudo apt remove -y "$@";;
      purge)   sudo apt purge -y "$@";;
      search)  apt search "$@";;
      upgrade) sudo apt update && sudo apt upgrade -y;;
      clean)   sudo apt autoremove -y && sudo apt clean;;
      *) echo "apt wrapper: install|remove|purge|search|upgrade|clean";;
    esac
  elif command -v pacman >/dev/null 2>&1; then
    case "$action" in
      install) sudo pacman -Syu --needed "$@";;
      remove)  sudo pacman -Rns "$@";;
      search)  pacman -Ss "$@";;
      upgrade) sudo pacman -Syu;;
      clean)   sudo pacman -Sc;;
      *) echo "pacman wrapper: install|remove|search|upgrade|clean";;
    esac
  elif command -v dnf >/dev/null 2>&1; then
    case "$action" in
      install) sudo dnf install -y "$@";;
      remove)  sudo dnf remove -y "$@";;
      search)  dnf search "$@";;
      upgrade) sudo dnf upgrade --refresh -y;;
      clean)   sudo dnf autoremove -y && sudo dnf clean packages;;
      *) echo "dnf wrapper: install|remove|search|upgrade|clean";;
    esac
  else
    echo "No supported package manager found."
    return 1
  fi
}
```

Usage:

```bash
pm install nmap
pm search wireshark
pm clean
```

---

## Mini Cheatsheet

```bash
# apt
sudo apt update && sudo apt upgrade
sudo apt install <pkg> && sudo apt remove <pkg> && sudo apt purge <pkg>
apt search <term> && apt show <pkg>
sudo apt autoremove && sudo apt clean

# pacman
sudo pacman -Syu
sudo pacman -S <pkg> && sudo pacman -Rns <pkg>
pacman -Ss <term> && pacman -Si <pkg> && pacman -Qi <pkg>
sudo pacman -Sc

# dnf
sudo dnf upgrade --refresh
sudo dnf install <pkg> && sudo dnf remove <pkg>
dnf search <term> && dnf info <pkg> && dnf list installed
sudo dnf autoremove && sudo dnf clean packages
```

---

## Further Reading

**Videos**

* <a href="https://www.youtube.com/watch?v=1lLZ-59xH3Y" target="_blank" rel="noopener noreferrer">Linux Packaging Formats explained: Flatpak vs Snaps vs DEB & RPM vs AppImage vs AUR</a>
* <a href="https://www.youtube.com/watch?v=vX3krP6JmOY" target="_blank" rel="noopener noreferrer">apt, dpkg, git, Python PiP (Linux Package Management) // Linux for Hackers // EP 5</a>
* <a href="https://www.youtube.com/watch?v=lkii2cGuKao" target="_blank" rel="noopener noreferrer">Linux Package Management | Debian, Fedora, and Arch Linux</a>
* <a href="https://www.youtube.com/watch?v=QsYEvnV-P34" target="_blank" rel="noopener noreferrer">The Best Package Manager</a>

**Official docs & references**

* Flatpak docs: <a href="https://docs.flatpak.org/" target="_blank" rel="noopener noreferrer">docs.flatpak.org</a> | <a href="https://docs.flatpak.org/en/latest/introduction.html" target="_blank" rel="noopener noreferrer">Introduction</a> | <a href="https://docs.flatpak.org/en/latest/getting-started.html" target="_blank" rel="noopener noreferrer">Getting started</a>
* Snapcraft docs: <a href="https://snapcraft.io/docs" target="_blank" rel="noopener noreferrer">snapcraft.io/docs</a> | <a href="https://snapcraft.io/docs/get-started" target="_blank" rel="noopener noreferrer">Get started</a>
* AppImage docs: <a href="https://docs.appimage.org/" target="_blank" rel="noopener noreferrer">docs.appimage.org</a> | <a href="https://docs.appimage.org/introduction/quickstart.html" target="_blank" rel="noopener noreferrer">Quickstart</a>
* Arch User Repository (AUR): <a href="https://wiki.archlinux.org/title/Arch_User_Repository" target="_blank" rel="noopener noreferrer">ArchWiki: AUR</a> | <a href="https://aur.archlinux.org/" target="_blank" rel="noopener noreferrer">aur.archlinux.org</a>
* dpkg manual: <a href="https://manpages.debian.org/buster/dpkg/dpkg.1.en.html" target="_blank" rel="noopener noreferrer">Debian manpages</a> | <a href="https://man7.org/linux/man-pages/man1/dpkg.1.html" target="_blank" rel="noopener noreferrer">man7.org</a>
* RPM packaging: <a href="https://rpm-packaging-guide.github.io/" target="_blank" rel="noopener noreferrer">rpm-packaging-guide.github.io</a> | <a href="https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/7/html-single/rpm_packaging_guide/index" target="_blank" rel="noopener noreferrer">RHEL: RPM Packaging Guide</a>
* DNF docs: <a href="https://docs.fedoraproject.org/en-US/quick-docs/dnf/" target="_blank" rel="noopener noreferrer">Fedora Quick Docs: DNF</a> | <a href="https://dnf.readthedocs.io/en/latest/command_ref.html" target="_blank" rel="noopener noreferrer">DNF command reference</a>
* Python Packaging User Guide: <a href="https://packaging.python.org/" target="_blank" rel="noopener noreferrer">packaging.python.org</a> | <a href="https://packaging.python.org/guides/installing-using-pip-and-virtual-environments/" target="_blank" rel="noopener noreferrer">pip + venv</a>

Pair this with the core Linux path here: <a href="/posts/mastering-linux-for-cybersecurity/" target="_blank" rel="noopener noreferrer">Mastering Linux for Cybersecurity</a>.

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})
