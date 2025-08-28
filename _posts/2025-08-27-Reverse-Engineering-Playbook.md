---
layout: post-with-comments
title: "Reverse Engineering Playbook: Static & Dynamic Analysis, GDB/Ghidra Workflow, and Utumno + Maze Tie-ins"
permalink: /posts/otw-reverse-engineering-playbook-utumno-maze/
redirect_from:
  - /posts/reverse-engineering-playbook/
  - /posts/otw-re-utumno-maze/
tags: [overthewire, utumno, maze, reverse-engineering, ghidra, radare2, cutter, gdb, strace, ltrace, elf]
description: "A hands-on reverse engineering playbook: static & dynamic techniques, tooling (strings, objdump, ltrace/strace, Ghidra/radare2), anti-debug patterns, mini-labs, and OverTheWire Utumno & Maze tie-ins."
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
  #re-checklist, #re-checklist * { visibility: visible; }
  #re-checklist { position: absolute; left: 0; top: 0; width: 100%; }
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

# Reverse Engineering Playbook

**Reverse engineering (RE)** is the craft of recovering **intent** from compiled artifacts. This guide is **hands-on** and **workflow-first**: fast **triage**, **static** structure, **dynamic** behavior, then **tight loops** in GDB and a GUI decompiler (Ghidra/Cutter). We’ll also cover **anti-debug patterns**, mini **case studies**, and a **non-spoiler** mapping to **OverTheWire Utumno** and **Maze**.

![Sui]({{ '/assets/images/re/sui.gif' | relative_url }})

If you’re following my CTF series, the official hubs are: **[OverTheWire — Utumno](https://overthewire.org/wargames/utumno/)** and **[OverTheWire — Maze](https://overthewire.org/wargames/maze/)**.

<!--more-->

---

## Table of Contents
- [1) Mindset & quick wins](#sec-mindset)
- [2) Static analysis essentials (ELF anatomy)](#sec-static)
- [3) Dynamic analysis essentials (tracing & observing)](#sec-dynamic)
- [4) Toolbelt: CLI + GUI decompilers](#sec-tools)
- [5) Calling conventions & stack frames (quick mental model)](#sec-abi)
- [6) Reading disassembly like a map](#sec-disasm)
- [7) GDB cookbook (breakpoints that matter)](#sec-gdb)
- [8) Anti-debug & obfuscation patterns](#sec-anti)
- [9) Production workflow / checklist](#sec-workflow)
- [10) Mini case studies (5–8 lines each)](#sec-cases)
- [11) Utumno + Maze tie-ins (non-spoiler)](#sec-otw)
- [Appendix A — One-liners & snippets](#appendix-a)
- [Appendix B — Mini-labs (safe, local)](#appendix-b)
- [Appendix C — Cheat-sheets & hotkeys](#appendix-c)
- [Appendix D — Printable RE checklist](#appendix-d)
- [Resource Library (Videos & Reading)](#resources)

---

<a id="sec-mindset"></a>
## 1) Mindset & quick wins

- **Behavior > bytes.** Treat the binary as a **black box** first: inputs, outputs, files, network, errors, timing.
- **Triangulate.** Static (what could happen) ↔ Dynamic (what *does* happen). Iterate.
- **Name the unknowns.** Unknown state? Instrument it. Unknown format? Record a sample then diff.
- **Notes pay off.** Keep a RE logbook: entry points, strings of interest, function IDs, *what I believe vs what I saw*.

**Orientation video:**  
*Reverse Engineering for People Who HATE Assembly!*  
<iframe src="https://www.youtube.com/embed/jRmiLD9jd7s" title="Reverse Engineering for People Who HATE Assembly!"></iframe>

**Further references:**  
- [Reverse Engineering — Introduction & Motivation (playlist)](https://www.youtube.com/watch?v=ws7FZNEMVmI&list=PL-A03qCBcinTiuCUtfhWGy1HMpnr0rOdh)
- [Self-Learning Reverse Engineering (roadmap)](https://www.youtube.com/watch?v=gPsYkV7-yJk)

---

<a id="sec-static"></a>
## 2) Static analysis essentials (ELF anatomy)

- **Quick metadata**: `file`, `readelf -h/l/s/d`, `objdump -d -M intel`, `strings`.  
- **Symbols**: is it stripped? Check `.symtab` vs `.dynsym`. No symbols → rely on xrefs, patterns, and data-flow.  
- **PLT/GOT**: identify imported calls; PLT thunks are useful anchors in disassembly.  
- **Relocations/RELRO**: understand what is writable/read-only at runtime.  
- **Init/fini arrays**: hidden execution points; sometimes logic lives there.

**Demo video:**  
*Reverse Engineering 101 tutorial with Stephen Sims*  
<iframe src="https://www.youtube.com/embed/5FXrCHLAJZM" title="Reverse Engineering 101 with Stephen Sims"></iframe>

**Further references:**  
- [System V AMD64 psABI](https://gitlab.com/x86-psABIs/x86-64-ABI) • [ELF gABI](https://refspecs.linuxfoundation.org/elf/elf.pdf)  
- [checksec (mitigations)](https://github.com/slimm609/checksec.sh)

---

<a id="sec-dynamic"></a>
## 3) Dynamic analysis essentials (tracing & observing)

- **Syscalls**: `strace -f -o s.log ./prog` to see file/network/exec patterns.  
- **Libcalls**: `ltrace -f -o l.log ./prog` to see `printf`, `strcmp`, `fopen` flows.  
- **Environment**: run with `env -i` (clean env) to test assumptions; try weird `PWD`, `LANG`, `TZ`.  
- **Timing**: compare behavior at different speeds (e.g., `sleep 0.1` between inputs) to discover state machines.

**Hands-on video:**  
*everything is open source if you can reverse engineer (try it RIGHT NOW!)*  
<iframe src="https://www.youtube.com/embed/gh2RXE9BIN8" title="Everything is open source if you can reverse engineer"></iframe>

**Further references:**  
- [strace](https://strace.io/) • [ltrace manpage](https://linux.die.net/man/1/ltrace)

---

<a id="sec-tools"></a>
## 4) Toolbelt: CLI + GUI decompilers

- **CLI**: `strings`, `hexdump -C`, `readelf`, `objdump`, `nm`, `xxd`, `file`.  
- **Ghidra**: decompile, rename, structure, xrefs; great for data-flow & types.  
- **radare2/Cutter**: fast graph view, patching, scripting; Cutter gives a friendly GUI over r2.  
- **Diffing**: build tiny clones of suspicious functions in C, then diff behavior.

**Video (learning path):**  
*Self-Learning Reverse Engineering in 2022*  
<iframe src="https://www.youtube.com/embed/gPsYkV7-yJk" title="Self-Learning Reverse Engineering"></iframe>

**Further references:**  
- [Ghidra (official)](https://ghidra-sre.org/) • [radare2](https://github.com/radareorg/radare2) • [Cutter](https://cutter.re/)  
- [pwndbg](https://github.com/pwndbg/pwndbg) • [GEF for GDB](https://github.com/hugsy/gef)

---

<a id="sec-abi"></a>
## 5) Calling conventions & stack frames (quick mental model)

- **x86-64 SysV**: args in `rdi, rsi, rdx, rcx, r8, r9`; return in `rax`; **stack 16-byte aligned** at call.  
- **i386 cdecl**: args on stack (right→left); return in `eax`.  
- **Frames**: prologue sets up `rbp` frame; leaf functions may omit it.

**Further references:**  
- [x86-64 psABI](https://gitlab.com/x86-psABIs/x86-64-ABI) • [i386 psABI (historical)](https://refspecs.linuxfoundation.org/elf/abi386-4.pdf)

---

<a id="sec-disasm"></a>
## 6) Reading disassembly like a map

- **Entrypoints**: `main`, constructors (`.init_array`), or custom entry wrappers.  
- **String-xref first**: jump into callers of `strcmp`, `fopen`, `system`, `execve`, `printf`.  
- **Switches**: look for `jmp [table + index*8]` and table regions.  
- **Integer parsing**: `strtol`, `sscanf`, manual digit loops; check for base/overflow handling.  
- **Crypto/transform**: loops with XOR/add/rotate; identify constants and rolling state.

**Further references:**  
- [Ghidra User Guide (decompiler basics)](https://ghidra-sre.org/CheatSheet.html)  
- [radare2 Book](https://radare.gitbooks.io/radare2book/)

---

<a id="sec-gdb"></a>
## 7) GDB cookbook (breakpoints that matter)

- **Locate hot paths**: `b *main`, `b strcmp`, `b read`, `b write`, `b malloc`, `b free`.  
- **Follow children**: `set follow-fork-mode child` then `catch exec`.  
- **Tame PIE**: `vmmap` (pwndbg) to grab bases; or compute `&main` and mask lower page bits.  
- **Watch state**: `watch *0xADDR` to catch unexpected writes; `x/s`, `x/20gx`, `x/20i`.  
- **Scripting**: small `.gdbinit` to auto-break & pretty-print.

**Deep-dive video:**  
*PRACTICAL REVERSE ENGINEERING*  
<iframe src="https://www.youtube.com/embed/7jtJ34Rc7jk" title="PRACTICAL REVERSE ENGINEERING"></iframe>

**Further references:**  
- [pwndbg quickstart](https://github.com/pwndbg/pwndbg#readme) • [GEF docs](https://gef.readthedocs.io/en/master/)

---

<a id="sec-anti"></a>
## 8) Anti-debug & obfuscation patterns

- **ptrace anti-debug**: `ptrace(PTRACE_TRACEME)` or `getppid()` checks; bypass by patching or faking return.  
- **Timing**: `rdtsc`, `sleep`-gates; normalize by stepping over / patching.  
- **Self-checksums / section hashes**: identify hash loops; NOP them or re-compute.  
- **Packers**: watch for `mprotect`, `decompress`, then a jump into RWX region; attach **after** unpack.

**Focused video:**  
*Reverse Engineering Anti-Debugging Techniques (with Nathan Baggs!)*  
<iframe src="https://www.youtube.com/embed/0XwhmrIU3fY" title="Anti-Debugging Techniques"></iframe>

**Further references:**  
- [Linux ptrace manpage](https://man7.org/linux/man-pages/man2/ptrace.2.html)  
- [Cracking Software with Reverse Engineering (discussion)](https://www.youtube.com/watch?v=Wbm-a-7zc4g)

---

<a id="sec-workflow"></a>
## 9) Production workflow / checklist

1. **Black-box pass**: run, give junk input, collect `strace`/`ltrace`, note files & strings.  
2. **Static skim**: map imports, find string/xref hotspots, mark candidate functions.  
3. **Hypotheses**: write what each hot function *likely* does.  
4. **Instrument**: set breakpoints, record real arguments/returns; verify/adjust hypotheses.  
5. **Refactor view**: rename functions/vars in Ghidra/Cutter; document data structures.  
6. **Finalize**: produce a concise spec of the binary (inputs → processing → outputs/side-effects).  
7. **Defensive note**: if you discovered insecure usage (e.g., `system()`), propose safer patterns.

**Further references:**  
- [Software Reverse Engineering Methodology (overview)](https://www.cs.dartmouth.edu/~ser243/)

---

<a id="sec-cases"></a>
## 10) Mini case studies (5–8 lines each)

**Case 1 — Password checker (string & branches)**  
`ltrace` shows `strcmp(input, "SOMETHING")`. In Ghidra, a loop XORs bytes of the input with a rotating key, then compares to a constant table — so it’s not plaintext. Reimplement in Python to derive the expected transformed bytes, then invert the transform to recover the secret.

**Case 2 — File format probe (state machine)**  
`strace` indicates the program opens two files, reads fixed 16 bytes, rejects if magic mismatch. Disassembly reveals `memcmp(buf, "UTMN\0\1", 6)`. The next branch computes CRC32 over chunk records; accepting path writes an output. Build a valid minimal sample to pass both checks.

**Case 3 — Network puzzle (line protocol)**  
`ltrace` prints via `printf("%02x ", byte)` inside a loop; `recv` shows 64 bytes per frame. Rebuild the frame in a Python client; script the handshake (banner → nonce → response) and confirm via `strace` that the program transitions to the success branch.

**Case study video:**  
*Cities: Skylines II Malware — Full Reverse Engineering Analysis*  
<iframe src="https://www.youtube.com/embed/bvyklJ5Wie0" title="Cities Skylines II Malware RE Analysis"></iframe>

---

<a id="sec-otw"></a>
## 11) Utumno + Maze tie-ins (non-spoiler)

- **Utumno** exercises **static reading** and small **dynamic validations**; expect tight loops, string ops, and input transforms.  
- **Maze** mixes RE with **exploitation instincts** (watch for `system()`, environment assumptions, path joins).  
- Your best friends: **strings/xrefs**, **ltrace/strace**, and a **disciplined GDB loop** with function renaming in Ghidra/Cutter.

**Further references:**  
- [OverTheWire — Utumno](https://overthewire.org/wargames/utumno/) • [OverTheWire — Maze](https://overthewire.org/wargames/maze/)

---

<a id="appendix-a"></a>
## Appendix A — One-liners & snippets

**Quick ELF survey**
```bash
file ./bin && checksec --file ./bin
readelf -hlsd ./bin | sed -n '1,80p'
objdump -d -M intel ./bin | sed -n '1,120p'
strings -a -n 5 ./bin | sort -u | sed -n '1,80p'
````

**Trace everything**

```bash
strace -f -o s.log ./bin 2>&1 | head
ltrace -f -o l.log ./bin 2>&1 | head
```

**GDB PIE base & helpful breaks (pwndbg)**

```gdb
# gdb -q ./bin
vmmap
break *main
break strcmp
break read
set follow-fork-mode child
run
```

**Cutter/r2 quickstart (commands)**

```text
aa          # analyze all
afl         # list functions
pdf @ main  # print disasm of function
axt sym.imp.printf  # xrefs to printf
VV          # graph view (terminal)
```

---

<a id="appendix-b"></a>

## Appendix B — Mini-labs (safe, local)

> **Lab safety**: use your own VM; binaries here are benign teaching aids.

### Lab B1 — Strings & xrefs → behavior sketch

```c
// lab-strings.c
#include <stdio.h>
#include <string.h>
int main(){
  char s[64]; puts("code?"); fgets(s,sizeof(s),stdin);
  if(strncmp(s,"UTMN-",5)==0) puts("ok");
  else puts("nope");
}
```

*Task*: run `strings`, find `"UTMN-"` and confirm in Ghidra where it branches.

---

### Lab B2 — ltrace vs strace

```c
// lab-trace.c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
int main(){
  char name[64]; puts("name:");
  fgets(name,sizeof(name),stdin);
  if (strstr(name,"maze")) system("echo yay");
  else puts("hmm");
}
```

*Task*: show `ltrace` hitting `strstr` and `system`, and `strace` spawning `/bin/sh -c`.

---

### Lab B3 — Switch table + file format

```c
// lab-switch.c
#include <stdio.h>
int main(int argc, char **argv){
  if(argc<2){ puts("mode?"); return 1; }
  switch(argv[1][0]){
    case 'a': puts("alpha"); break;
    case 'b': puts("bravo"); break;
    default: puts("else");
  }
}
```

*Task*: find the jump table in disassembly; explain how indices map to cases.

---

### Lab B4 — Anti-debug taste

```c
// lab-anti.c
#include <sys/ptrace.h>
#include <stdio.h>
#include <stdlib.h>
int main(){
  if (ptrace(0,0,0,0)==-1){ puts("debugger?"); exit(1); }
  puts("hello");
}
```

*Task*: observe behavior under GDB; patch the check (NOP) in Cutter or force return value.

---

<a id="appendix-c"></a>

## Appendix C — Cheat-sheets & hotkeys

* **Ghidra**: R = rename, Y = retype, X = xrefs, P = function signature, D = data, G = go to.
* **Cutter**: `G` (goto), `X` (xrefs), right-click graph to rename & retype quickly.
* **pwndbg**: `vmmap`, `telescope $rsp`, `context`, `hexdump`, `nearpc`.

**Further references:**

* [Ghidra Cheat Sheet](https://ghidra-sre.org/CheatSheet.html) • [radare2 Book](https://radare.gitbooks.io/radare2book/)
* [pwndbg commands](https://github.com/pwndbg/pwndbg#readme)

---

<a id="appendix-d"></a>

## Appendix D — Printable RE checklist


<section id="re-checklist" class="print-card">
  <h3>Reverse Engineering — Field Checklist</h3>
  <div class="md-table table-scroll">
    <table>
      <thead>
        <tr>
          <th>Phase</th>
          <th>What to do</th>
          <th>Why</th>
          <th>Tools</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Triage</td>
          <td>Run with junk; capture strace/ltrace; collect strings</td>
          <td>Black-box behavior map</td>
          <td>strace, ltrace, strings</td>
        </tr>
        <tr>
          <td>Static</td>
          <td>Map imports, PLT/GOT, hot xrefs</td>
          <td>Anchor disassembly</td>
          <td>readelf, objdump, Ghidra/Cutter</td>
        </tr>
        <tr>
          <td>Dynamic</td>
          <td>Break at key APIs; record args/returns</td>
          <td>Confirm hypotheses</td>
          <td>GDB (+pwndbg/GEF)</td>
        </tr>
        <tr>
          <td>Refine</td>
          <td>Rename functions/vars; reconstruct structs</td>
          <td>Readable model</td>
          <td>Ghidra/Cutter typedefs</td>
        </tr>
        <tr>
          <td>Report</td>
          <td>Inputs → processing → outputs; risky patterns</td>
          <td>Teachable write-up</td>
          <td>Diagrams, diffs</td>
        </tr>
      </tbody>
    </table>
  </div>
  <p class="note">Tip: flip between dynamic truth and static structure every few minutes — small loops beat marathon sessions.</p>
</section>

---

<a id="resources"></a>

## Resource Library (Videos & Reading)

### Videos (curated)

* [Reverse Engineering for People Who HATE Assembly!](https://www.youtube.com/watch?v=jRmiLD9jd7s)
* [everything is open source if you can reverse engineer (try it RIGHT NOW!)](https://www.youtube.com/watch?v=gh2RXE9BIN8)
* [Self-Learning Reverse Engineering in 2022](https://www.youtube.com/watch?v=gPsYkV7-yJk)
* [Learn Reverse Engineering (for hacking games)](https://www.youtube.com/watch?v=0_Eif2qGK7I)
* [Cities: Skylines II Malware — Full RE Analysis](https://www.youtube.com/watch?v=bvyklJ5Wie0)
* [Reverse Engineering — Introduction & Motivation (playlist)](https://www.youtube.com/watch?v=ws7FZNEMVmI&list=PL-A03qCBcinTiuCUtfhWGy1HMpnr0rOdh)
* [Cracking Software with Reverse Engineering 😳](https://www.youtube.com/watch?v=Wbm-a-7zc4g)
* [Reverse Engineering 101 with Stephen Sims](https://www.youtube.com/watch?v=5FXrCHLAJZM)
* [Reverse Engineering Anti-Debugging Techniques (with Nathan Baggs!)](https://www.youtube.com/watch?v=0XwhmrIU3fY)
* [PRACTICAL REVERSE ENGINEERING](https://www.youtube.com/watch?v=7jtJ34Rc7jk)

### Reading / Tools

* [OverTheWire — Utumno](https://overthewire.org/wargames/utumno/) • [OverTheWire — Maze](https://overthewire.org/wargames/maze/)
* [System V AMD64 psABI](https://gitlab.com/x86-psABIs/x86-64-ABI) • [ELF gABI](https://refspecs.linuxfoundation.org/elf/elf.pdf)
* [Ghidra](https://ghidra-sre.org/) • [radare2](https://github.com/radareorg/radare2) • [Cutter](https://cutter.re/)
* [strace](https://strace.io/) • [ltrace manpage](https://linux.die.net/man/1/ltrace)
* [pwndbg](https://github.com/pwndbg/pwndbg) • [GEF](https://github.com/hugsy/gef)

---

## Final note

Use this as a **playbook**: black-box first, then lock onto hot spots with xrefs, confirm in GDB, and rename ruthlessly in your decompiler. Pair the **mini-labs** here with your **Utumno/Maze** runs to build speed and accuracy.

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

