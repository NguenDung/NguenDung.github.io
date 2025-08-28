---
layout: post-with-comments
title: "Protections & Bypass 101: NX/ASLR, Canaries, RELRO/PIE, and Practical Exploit Strategies (Behemoth + Utumno + Maze)"
permalink: /posts/otw-protections-and-bypass-101/
redirect_from:
  - /posts/otw-protections-bypass/
  - /posts/protection-mitigations-otw/
tags: [overthewire, behemoth, utumno, maze, mitigations, nx, aslr, canary, pie, relro, rop, ret2libc, srop, checksec]
description: "A hands-on guide to mitigations and bypasses: NX/DEP, ASLR/PIE, stack canaries, RELRO, with exploit patterns (ret2libc, ROP, ret2dlresolve, SROP), decision trees, mini-labs, and OverTheWire tie-ins."
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
a[data-ext="1"]{ } /* silent new-tab for absolute links */
.table-scroll{overflow-x:auto}

/* Printable checklist (Appendix D) */
@media print {
  body * { visibility: hidden; }
  #pb-checklist, #pb-checklist * { visibility: visible; }
  #pb-checklist { position: absolute; left: 0; top: 0; width: 100%; }
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

# Protections & Bypass 101

Modern Linux binaries ship with layers of **mitigations**. Winning reliably means turning that stack into a **decision tree** and picking the **shortest stable chain** (leak → ret2libc/ROP/ret2dlresolve). This guide keeps it **procedural**: fast **survey**, **choose** a route, then **prove** with tiny PoCs. You’ll end with mini-labs and a non-spoiler tie-in to **OverTheWire Behemoth, Utumno, and Maze**.

![Sui]({{ '/assets/images/protections/sui.gif' | relative_url }})

If you’re following my CTF series, keep these handy: **[Binary Exploitation Deep Dive]({{ '/posts/otw-binary-exploitation-playbook-narnia-behemoth/' | relative_url }})** and **[RE Playbook]({{ '/posts/otw-reverse-engineering-playbook-utumno-maze/' | relative_url }})**.

<!--more-->

---

## Table of Contents
- [1) Decision tree & mindset](#sec-mindset)
- [2) Quick survey & mitigation matrix](#sec-survey)
- [3) NX/DEP: shellcode vs ret2libc/ROP](#sec-nx)
- [4) ASLR + PIE: from leaks to reliability](#sec-aslr)
- [5) Stack canaries: detect, leak, or avoid](#sec-canary)
- [6) RELRO (Partial vs Full): targets & pivots](#sec-relro)
- [7) Picking chains: ret2libc, ROP, ret2dlresolve, SROP](#sec-choose)
- [8) Info-leak cookbook (fmt/PLT/GOT/UB reads)](#sec-leaks)
- [9) 32-bit vs 64-bit quirks](#sec-arch)
- [10) Behemoth + Utumno + Maze tie-ins](#sec-otw)
- [Appendix A — One-liners](#appendix-a)
- [Appendix B — Mini-labs](#appendix-b)
- [Appendix C — ROP tooling cheat-sheet](#appendix-c)
- [Appendix D — Printable field checklist](#appendix-d)
- [Resource Library (Videos & Reading)](#resources)

---

<a id="sec-mindset"></a>
## 1) Decision tree & mindset

```

Mitigation survey →
NX?
off  → shellcode ok  → still consider short ROP for reliability
on   → ret2libc / ROP / ret2dlresolve
ASLR/PIE?
no   → fixed text base → leak libc only
yes  → need pointer leak (stack/libc/PLT/GOT) → compute bases
Canary?
no   → contiguous stack overwrite
yes  → leak or avoid contiguous overwrite (off-by-one, fptr/data)
RELRO?
partial → GOT writes viable
full    → favor fptr/vtable/.fini\_array/ret2dlresolve/ROP-only
Pick shortest stable chain → align stack → assert success criteria

````

**Principles**
- **Identify first, exploit second.** A 10-second survey beats 2h guessing.
- **Shortest stable chain** > clever long chains.
- **Two primitives rule**: secure **read** (leak) and **write** (precise overwrite).

**Further references**  
- [CWE-119: Memory Bounds Errors](https://cwe.mitre.org/data/definitions/119.html)  
- [ROP Emporium (learn ROP with puzzles)](https://ropemporium.com/)

---

<a id="sec-survey"></a>
## 2) Quick survey & mitigation matrix

```bash
file ./target && checksec --file=./target
readelf -hlsdW ./target | sed -n '1,120p'     # PIE, sections, RELRO
objdump -R ./target | head                    # GOT entries (Partial vs Full context)
````

**Mitigation matrix (what it implies)**

| Mitigation     | You should think                                         |
| -------------- | -------------------------------------------------------- |
| NX on          | no stack shellcode ⇒ ret2libc/ROP/ret2dlresolve          |
| PIE on         | leak any code ptr (or libc) to compute bases             |
| Canary present | leak canary or avoid contiguous overwrite                |
| Full RELRO     | GOT RO ⇒ favor fptr/vtable/data targets or ret2dlresolve |

**Further references**

* [checksec (official)](https://github.com/slimm609/checksec.sh)
* [Hardening ELF with RELRO (Red Hat)](https://www.redhat.com/en/blog/hardening-elf-binaries-using-relocation-read-only-relro)

---

<a id="sec-nx"></a>

## 3) NX/DEP: shellcode vs ret2libc/ROP

* **NX off**: shellcode still works; but ROP may be **cleaner** (no badchars/encoders).
* **NX on**: execute existing code:

  * **ret2libc**: `system("/bin/sh")` or `execve`.
  * **ROP**: set registers, call functions, or emit `syscall`.

**Demo video (conceptual DEP→ROP)**
*Bypass DEP using ROP Chain & Execute Shellcode (mona.py)*

<iframe src="https://www.youtube.com/embed/AsR8PFKK5Mw" title="Bypass DEP with ROP (mona.py)"></iframe>

> Although the demo targets Windows, the **NX→ROP** idea maps directly to Linux CTFs: you turn data execution into **code reuse**.

**Further references**

* [“ret2libc explained” (short guide)](https://crypto.stanford.edu/~blynn/rop/)
* [ROPgadget](https://github.com/JonathanSalwan/ROPgadget) • [one\_gadget](https://github.com/david942j/one_gadget)
* [ROP Emporium — start at *ret2win*](https://ropemporium.com/challenge/ret2win.html)

---

<a id="sec-aslr"></a>

## 4) ASLR + PIE: from leaks to reliability

* **Non-PIE**: code base fixed; leak **libc** and go ret2libc.
* **PIE**: binary + libs move; leak any code pointer (PLT/GOT/return site) to recover bases.
* **Leak sources**: `%p` sprays, `puts(ptr)`, wrong-sized reads/writes, sloppy logging.
* **Fork-servers** can allow fast brute force if entropy is tiny and crashes fast.

**Further references**

* [LiveOverflow Binary Exploitation (playlist)](https://www.youtube.com/playlist?list=PLhixgUqwRTjxglIswKp9mpkfPNfHkzyeN)
* [ELF gABI (linker/relocation background)](https://refspecs.linuxfoundation.org/elf/elf.pdf)

---

<a id="sec-canary"></a>

## 5) Stack canaries: detect, leak, or avoid

* **Detect**: presence of `__stack_chk_fail` or prologue save/epilogue compare.
* **Leak**: format strings (right offset), info-leaky prints, or indirect pointer reads.
* **Avoid**: use **non-contiguous** overwrites (off-by-one NUL on saved `rbp`), **function pointers**, **vtables**, or heap/data pointers.

**Further references**

* [glibc hardening notes (stack protector)](https://sourceware.org/glibc/wiki/Proposals/Hardening)

---

<a id="sec-relro"></a>

## 6) RELRO (Partial vs Full): targets & pivots

* **Partial RELRO** ⇒ **GOT writable** before lock-down → classic **GOT overwrite** (e.g., `puts@got → system`).
* **Full RELRO** ⇒ GOT RO; pivot to:

  * **.fini\_array/.init\_array** (if writable in the target, not always).
  * **Function pointers / vtables / callback tables** in `.data`/heap.
  * **ret2dlresolve**: forge relocation and let the dynamic loader resolve `system`.

**Further references**

* [Hardening ELF Binaries using RELRO](https://www.redhat.com/en/blog/hardening-elf-binaries-using-relocation-read-only-relro)
* [Hardening Executables (flags overview)](https://shibumi.dev/posts/hardening-executables/)

---

<a id="sec-choose"></a>

## 7) Picking chains: ret2libc, ROP, ret2dlresolve, SROP

* **ret2libc**: leak libc → compute base → call `system("/bin/sh")`. Minimal gadgets.
* **ROP**: when you must **load registers** or craft syscalls; keep chains short, mind **16-byte alignment** on x86-64.
* **ret2dlresolve**: no libc leak/GOT writes? Push fake relocation/strings → have the loader resolve `system`.
* **SROP**: craft a fake signal frame to set registers in one go (needs a `syscall; ret` gadget).

**Further references**

* [ret2dlresolve primer (pwntools)](https://github.com/niklasb/ctf-tools/blob/master/rop/ret2dlresolve.md)
* [SROP (paper)](https://www.cs.vu.nl/~herbertb/papers/srop_sp14.pdf)
* [ret2csu (universal gadget) write-up](https://adamgold.github.io/posts/ropemporium-ret2csu/)

---

<a id="sec-leaks"></a>

## 8) Info-leak cookbook (fmt/PLT/GOT/UB reads)

* **PLT→GOT leak**: `puts(puts@got)` → compute libc base.
* **Format strings**: find parameter **offset** (`%7$lx`…), then `%s`/`%hn` tricks for reads/writes.
* **Uninitialized reads**: printing stack/structs without zeroing leaks pointers/canaries.
* **Type confusion**: `%s` on an integer treated as a pointer ⇒ read arbitrary memory.

**Demo video (fmt leak in practice)**
*PicoCTF ‘flag-leak’ — Format String Vulnerabilities*

<iframe src="https://www.youtube.com/embed/DhVRI33s-D0" title="Format String PicoCTF flag-leak"></iframe>

**Further references**

* [CWE-200: Information Exposure](https://cwe.mitre.org/data/definitions/200.html)
* [RPISEC — Modern Binary Exploitation (course)](https://github.com/RPISEC/MBE)
* [pwn.college — Program Security module](https://pwn.college/program-security/program-security/)

---

<a id="sec-arch"></a>

## 9) 32-bit vs 64-bit quirks

* **i386**: args on **stack**; ret2libc often two pushes + `ret`.
* **x86-64**: args in **registers**; need gadgets for `rdi`, `rsi`, `rdx`, etc.
* **Alignment**: keep **16-byte** stack alignment before `call` on x86-64.

**Further references**

* [System V AMD64 psABI](https://gitlab.com/x86-psABIs/x86-64-ABI)

---

<a id="sec-otw"></a>

## 10) Behemoth + Utumno + Maze tie-ins (non-spoiler)

* **Behemoth**: overflow instinct + SUID/env edges; expect NX + Partial RELRO → **libc leak + ret2libc**.
* **Utumno**: RE first, exploit second; the **info-leak** choice usually decides chain length.
* **Maze**: add environment/path assumptions; with Full RELRO/canaries, favor **fptr/vtable** or **ret2dlresolve**.

**Further references**

* [OverTheWire — Behemoth](https://overthewire.org/wargames/behemoth/) • [OverTheWire — Utumno](https://overthewire.org/wargames/utumno/) • [OverTheWire — Maze](https://overthewire.org/wargames/maze/)

---

<a id="appendix-a"></a>

## Appendix A — One-liners

**Mitigation survey**

```bash
checksec --file ./target
readelf -hlsdW ./target | sed -n '1,120p'
objdump -R ./target | sed -n '1,40p'
```

**Find likely leaks & sinks**

```bash
strings -a ./target | egrep -i 'puts|printf|system|execve|/bin/sh' | head
objdump -d -M intel ./target | egrep 'call.*puts|call.*printf' | sed -n '1,20p'
```

**Quick ret2libc scaffold (pwntools)**

```python
from pwn import *
elf = context.binary = ELF('./target', checksec=False)
rop = ROP(elf)
# Example: leak puts then return to main
rop.call('puts', [elf.got['puts']]); rop.call(elf.symbols['main'])
```

---

<a id="appendix-b"></a>

## Appendix B — Mini-labs

> **Safety**: run in your own VM. These are didactic binaries.

### Lab B1 — NX on, Partial RELRO, no PIE → ret2libc

```c
// b1.c
#include <stdio.h>
#include <unistd.h>
void vuln(){ char buf[128]; puts("name?"); read(0, buf, 512); }
int main(){ setvbuf(stdout,NULL,_IONBF,0); vuln(); }
```

```bash
gcc -fno-stack-protector -no-pie -o b1 b1.c
# 1) ROP: puts(puts@got) → leak; 2) return to main; 3) system("/bin/sh")
```

### Lab B2 — PIE + canary present → leak then chain

```c
// b2.c
#include <stdio.h>
#include <unistd.h>
int main(){ char buf[64]; puts("say:"); read(0,buf,256); printf(buf); }
```

```bash
gcc -fstack-protector-strong -O0 -pie -o b2 b2.c
# Format string to leak: PIE ptr + canary + libc; then aligned ROP → system
```

### Lab B3 — Full RELRO → ret2dlresolve

```c
// b3.c
#include <stdio.h>
#include <string.h>
int main(){ char b[64]; puts("x?"); gets(b); }
```

```bash
gcc -Wl,-z,relro,-z,now -no-pie -fno-stack-protector -o b3 b3.c
# Build fake .rel.plt/.dynstr/.symtab on stack; trigger resolver to call system
```

### Lab B4 — ret2csu (universal gadget) for register setup

```bash
# Use the __libc_csu_init gadgets to populate rdi/rsi/rdx when gadgets are scarce
# Pair with ROPgadget/pwndbg to locate and script the sequence.
```

---

<a id="appendix-c"></a>

## Appendix C — ROP tooling cheat-sheet

* **Find gadgets**: [ROPgadget](https://github.com/JonathanSalwan/ROPgadget), `ROP(ELF)` in pwntools.
* **Libc versions**: `ldd ./target`; remote → leak addr then match by offsets (avoid guessing).
* **one\_gadget caveat**: each gadget has **constraints** (stack/env/registers) — check before using.
* **ret2dlresolve helpers**: pwntools `Ret2dlresolvePayload` (version-dependent).

**Further references**

* [pwntools docs](https://docs.pwntools.com/en/stable/)
* [ROP Emporium (challenge set)](https://ropemporium.com/)
* [ROP Emporium solutions (community)](https://github.com/abatchy17/ROP-Emporium)

---

<a id="appendix-d"></a>

## Appendix D — Printable field checklist

<section id="pb-checklist" class="print-card">
  <h3>Protections & Bypass — Field Checklist</h3>
  <div class="md-table table-scroll">
    <table>
      <thead>
        <tr>
          <th>Phase</th>
          <th>What to check</th>
          <th>Why it matters</th>
          <th>Tools</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Survey</td>
          <td>NX/PIE/RELRO/canary</td>
          <td>Chooses ret2libc vs ROP vs ret2dlresolve</td>
          <td>checksec, readelf, objdump</td>
        </tr>
        <tr>
          <td>Leak</td>
          <td>Pointer leaks (GOT/stack/format)</td>
          <td>Defeat ASLR/PIE; extract canary</td>
          <td>puts@plt, format strings</td>
        </tr>
        <tr>
          <td>Chain</td>
          <td>Argument setup & 16-byte alignment</td>
          <td>Reliable call to system/execve</td>
          <td>ROPgadget, pwntools ROP</td>
        </tr>
        <tr>
          <td>Targets</td>
          <td>GOT/.fini_array/fptrs (RELRO aware)</td>
          <td>Writable & stable overwrite</td>
          <td>objdump -R, readelf -S</td>
        </tr>
        <tr>
          <td>Stability</td>
          <td>Fork/timeout/TTY/env</td>
          <td>Robust shells & solvers</td>
          <td>pwntools, script assertions</td>
        </tr>
      </tbody>
    </table>
  </div>
  <p class="note">Tip: if Full RELRO blocks GOT, think ret2dlresolve, fptr/vtables, or pure ROP into libc.</p>
</section>

---

<a id="resources"></a>

## Resource Library (Videos & Reading)

### Videos (curated)

* *Bypass DEP using ROP Chain & Execute Shellcode (mona.py)* — conceptual DEP→ROP demo (Windows, idea maps to Linux): [YouTube](https://www.youtube.com/watch?v=AsR8PFKK5Mw)
* *Format String printf Vulnerabilities (PicoCTF ‘flag-leak’)* — hands-on info-leak: [YouTube](https://www.youtube.com/watch?v=DhVRI33s-D0)
* *Binary Exploitation playlist (LiveOverflow)* — ASLR/NX/ROP series: [YouTube](https://www.youtube.com/playlist?list=PLhixgUqwRTjxglIswKp9mpkfPNfHkzyeN)
* *DEF CON — The Rise and Fall of Binary Exploitation (Stephen Sims)* — high-level context: [YouTube](https://www.youtube.com/watch?v=cHsRxkfxvq8)
* *Hack your grades* — fun/viral context piece: [YouTube](https://www.youtube.com/watch?v=Clu3-5TFdw0)
* *HAVOC C2 — Demon Bypasses Windows 11 Defender* — blue-team adjacent, AV-evasion perspective: [YouTube](https://www.youtube.com/watch?v=ErPKP4Ms28s)

### Reading / Exercises / Tools

* **ROP Emporium** — progressive ROP labs: [Site](https://ropemporium.com/) • [ret2win intro](https://ropemporium.com/challenge/ret2win.html) • [Community solutions](https://github.com/abatchy17/ROP-Emporium)
* **RPISEC — Modern Binary Exploitation** — full course notes/labs: [GitHub](https://github.com/RPISEC/MBE)
* **pwn.college — Program Security** — structured curriculum: [Module](https://pwn.college/program-security/program-security/)
* **RELRO overview** — [Red Hat blog](https://www.redhat.com/en/blog/hardening-elf-binaries-using-relocation-read-only-relro) • Hardening flags: [Shibumi](https://shibumi.dev/posts/hardening-executables/)
* **Tools** — [checksec](https://github.com/slimm609/checksec.sh) • [ROPgadget](https://github.com/JonathanSalwan/ROPgadget) • [one\_gadget](https://github.com/david942j/one_gadget)
* **Techniques** — [ret2dlresolve primer](https://github.com/niklasb/ctf-tools/blob/master/rop/ret2dlresolve.md) • [ret2csu write-up](https://adamgold.github.io/posts/ropemporium-ret2csu/)

---

## Final note

Treat mitigations as **waypoints**, not walls: survey quickly, secure a **leak**, pick the **shortest chain**, and mind **alignment & stability**. Pair the labs with **Behemoth/Utumno/Maze** boxes to turn patterns into muscle memory.

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})


