---
date: 2023-09-29 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire FormulaOne Level 2 → Level 3 Tutorial!!"
permalink: /posts/overTheWire-FormulaOne-Level-2-to-3/
tags: [overthewire, formulaone, walkthrough, ctf, binary, exploitation]
description: "A step by step tutorial for OverTheWire FormulaOne Level 2 → Level 3!!"
---

<!-- Scoped styles: only affect this post -->
<style>
  .formulaone-nav{display:flex;align-items:center;gap:.75rem;margin:.5rem 0 1.25rem;border-top:1px solid var(--border-color,#3a3a3a);padding-top:.75rem}
  .formulaone-nav .nav-left,.formulaone-nav .nav-center,.formulaone-nav .nav-right{flex:1}
  .formulaone-nav .nav-left{text-align:left}
  .formulaone-nav .nav-center{text-align:center}
  .formulaone-nav .nav-right{text-align:right}
  .formulaone-nav a{display:inline-block;padding:.45rem .8rem;border:1px solid var(--border-color,#3a3a3a);border-radius:.6rem;text-decoration:none;line-height:1}
  .formulaone-nav a:hover{transform:translateY(-1px)}
  .formulaone-nav .disabled{opacity:.55}
  :root[data-theme='light'] .formulaone-nav a{border-color:rgba(0,0,0,.15)}
</style>

<nav class="formulaone-nav" aria-label="FormulaOne level navigation">
  <div class="nav-left">
    <a href="{{ '/posts/overTheWire-FormulaOne-Level-1-to-2/' | relative_url }}">
      ← Previous: Level 1 → 2
    </a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/formulaone/formulaone3.html" target="_blank" rel="noopener">
      Official (Level 3) ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-FormulaOne-Level-3-to-4/' | relative_url }}">
      Next: Level 3 → 4 →
    </a>
  </div>
</nav>

## Login

We now have the credentials for **formulaone2**.

```bash
ssh formulaone2@formulaone.labs.overthewire.org -p 2232
# password: OvQAKUM3BrvbH4pKjBJBCOUpTGSDjNum
````

---

## Task

The goal is to exploit the binary `formulaone3` in order to retrieve the password for **formulaone3**.

---

## A little bit of Theory

Looking inside `/formulaone/`:

We see both the compiled `formulaone3` and its source `formulaone3.c`. The binary has **setuid** permissions, so it runs as **formulaone3**.

The source reveals a program that uses **System V Shared Memory (shm)**, with two buffers:

* `msg.ptr[1024]` in shared memory
* `buf[256]` on the stack in `doecho()`

The code calls `memcpy(buf, echo->ptr, echo->sz)` but only checks:

```c
if (echo->sz < sizeof(buf))
```

This introduces a **race condition** → if we change `echo->sz` quickly *after* the check but *before* the `memcpy`, we can force a buffer overflow.

**Key exploit concept:**

* Normal copy if `sz < 256`.
* If we flip `sz` to >256 right after, memcpy will overflow the 256-byte stack buffer.
* With setuid enabled, this overflow lets us hijack execution and read `/etc/formulaone_pass/formulaone3`.

---

## Solution

### Step 1 — Proof of Concept

We write a helper program that alternates `sz`:

```c
shared_memory->sz = 255;   // passes the check
usleep(500);
shared_memory->sz = 510;   // triggers overflow
```

Running this alongside `/formulaone/formulaone3` results in segmentation faults:

→ Confirmed: buffer overflow is possible.

---

### Step 2 — Crafting the Exploit

Security check via `checksec`:

```
RELRO         Partial RELRO
STACK CANARY  No canary
NX            Enabled
PIE           No
```

NX means we can’t execute code directly on the stack, so we’ll inject shellcode into shared memory (executable) and redirect execution there.

We generate shellcode with pwntools:

```bash
pwn shellcraft cat /etc/formulaone_pass/formulaone3 -f d
```

---

### Step 3 — Final Exploit

We craft payload with:

1. **NOP sled** (for stable landing).
2. **Shellcode** (`cat /etc/formulaone_pass/formulaone3`).
3. **Return address overwrite** pointing into shared memory.

Exploit loop runs until the race condition hits

---

### Step 4 — Success 🎉

We get the password for **formulaone3**:

```
Liqb5fEvP7IjKWZpoFOdYfQT494msxyv
```


---

## Troubleshooting Quick Tips

* **Segfault only** → Adjust `usleep()` timings.
* **No output** → Check if shellcode is copied correctly.
* **Wrong password** → Ensure return address points inside shared memory.

---

## Conclusion

This level combines **race conditions** with a **classic buffer overflow** — a powerful combo in real-world exploitation. We also see why NX and stack canaries exist today: to stop exactly this style of attack.

By chaining timing tricks and memory corruption, we gained access to the next user. 

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

