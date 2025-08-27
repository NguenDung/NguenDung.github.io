---
date: 2023-10-03 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire FormulaOne Level 5 → 6 tutorial!!"
permalink: /posts/overTheWire-FormulaOne-Level-5-to-6/
tags: [overthewire, formulaone, walkthrough, ctf, binary, exploitation, finale]
description: "The final chapter in the FormulaOne series — Level 5 → 6. Spoiler: this challenge is unplayable on modern systems, marking the end of the FormulaOne wargame."
---

<!-- Scoped styles -->
<style>
  .formulaone-nav{display:flex;align-items:center;gap:.75rem;margin:.5rem 1.25rem;border-top:1px solid var(--border-color,#3a3a3a);padding-top:.75rem}
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
    <a href="{{ '/posts/overTheWire-FormulaOne-Level-4-to-5/' | relative_url }}">
      ← Previous: Level 4 → 5
    </a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/formulaone/formulaone6.html" target="_blank" rel="noopener">
      Official (Level 6) ↗
    </a>
  </div>

  <div class="nav-right">
    <span class="disabled">No more Formula one level —</span>
  </div>
</nav>

## Login

```bash
ssh formulaone5@formulaone.labs.overthewire.org -p 2232
# password: (would normally be from Level 4 → 5)
````

---

## Task

Progress from **formulaone5** to **formulaone6**.
In theory, we’d exploit the binary left behind (`nemo1.c`) to gain access.

---

## Reality Check

This is where the **FormulaOne wargame effectively ends**.

The provided `nemo1.c` contains a runtime guard:

```c
if((long)&buf2 > (long)&mfptrr) {
    printf("[!] Sorry, it's unlikely you can exploit this with your version of gcc.\n");
    exit(1);
}
```

This stack layout check ensures that on modern GCC/glibc, the exploit path is closed. The vulnerable arrangement only existed on **very old GCC versions** (circa 2005).

As a result:

* On current OverTheWire servers, the exploit is **not reachable**.
* The “Level 6” login user does not exist → FormulaOne officially stops here.

---

## Theory

The intended exploit (if compiled under older GCC) would involve:

1. Leveraging `func1` + environment variables to overflow into stack variables.
2. Overwriting the function pointer `mfptrr`.
3. Redirecting execution flow to attacker-controlled code.

This kind of vulnerability is classic in early buffer overflow challenges, but modern compilers + protections broke the setup.

---

## Solution

👉 There is no playable solution on today’s FormulaOne servers.

The official stance is: *FormulaOne ends at Level 5*.

So the “solution” for 5 → 6 is simply to acknowledge that we’ve reached the natural end of the wargame.

---

## Conclusion

That’s it — FormulaOne complete 🎉

* Levels 0 → 4 gave us fun exploitation challenges (sockets, race conditions, shared memory, stack smashing).
* Levels 5 → 6 serve more as a historical artifact, showing how compiler behavior used to be exploitable.

Although a bit anti-climactic, it’s a reminder: **exploits are fragile and evolve with toolchains**.

---

## Next Adventures

If you enjoyed FormulaOne, consider moving on to:

* [Maze](https://overthewire.org/wargames/maze/) (advanced binary exploitation)
* [Utumno](https://overthewire.org/wargames/utumno/) (heap tricks & shellcode)
* [Narnia](https://overthewire.org/wargames/narnia/) (classic overflows)

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

