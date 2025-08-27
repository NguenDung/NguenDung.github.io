---
date: 2023-09-26 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Maze Level 8 → 9 tutorial!!"
permalink: /posts/overTheWire-Maze-Level-8-to-9/
tags: [overthewire, maze, pwn, binary-exploitation, linux, beginner]
description: "A step by step tutorial for OverTheWire Maze Level 8 → 9!!"
---

<!-- Scoped styles: only affect this post -->

<style>
  .maze-nav{display:flex;align-items:center;gap:.75rem;margin:.5rem 0 1.25rem;border-top:1px solid var(--border-color,#3a3a3a);padding-top:.75rem}
  .maze-nav .nav-left,.maze-nav .nav-center,.maze-nav .nav-right{flex:1}
  .maze-nav .nav-left{text-align:left}
  .maze-nav .nav-center{text-align:center}
  .maze-nav .nav-right{text-align:right}
  .maze-nav a{display:inline-block;padding:.45rem .8rem;border:1px solid var(--border-color,#3a3a3a);border-radius:.6rem;text-decoration:none;line-height:1}
  .maze-nav a:hover{transform:translateY(-1px)}
  .maze-nav .disabled{opacity:.55}
  :root[data-theme='light'] .maze-nav a{border-color:rgba(0,0,0,.15)}
</style>

<nav class="maze-nav" aria-label="Maze level navigation">
  <div class="nav-left">
    <a href="{{ '/posts/overTheWire-Maze-Level-7-to-8/' | relative_url }}">← Previous: Level 7 → 8</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/maze/maze9.html" target="_blank" rel="noopener">
      Official (Level 9) ↗
    </a>
  </div>

  <div class="nav-right">
    <span class="disabled">No more Maze level —</span>
  </div>
</nav>

## Login

You finish this level using the **maze8** account (from the previous post). There’s no new binary to exploit.

```bash
ssh maze8@maze.labs.overthewire.org -p <PORT>
# password: jopieyahng
```

> On the server you won’t find a `/maze/maze9` binary. Level 9 is just the epilogue page.

---

## Task

There isn’t an exploitable program for Level 9. The official page simply congratulates you for completing Maze.

---

## A little bit of Theory

Nothing to reverse here — Level 9 serves as a **wrap-up checkpoint**. If you made it through Level 8 (format-string → GOT overwrite → shellcode), you’ve already covered the core ideas the series wanted to teach:

* Classic overflows (stack, struct/offsets)
* Env-backed shellcode & NOP sleds
* Race conditions and ELF header games
* Shared-memory / self-modifying code quirks
* Format-string primitives (`%x`, `%n`, `%hn`) and GOT hijack

That’s basically the “swimming in memory” the epilogue hints at.

---

## Solution

1. **Confirm completion**
   Visit the official Level 9 page (link in the nav above). You’ll see the “Well done!” message — there’s no additional credential to fetch and no binary to run.

2. **Clean up (optional)**
   Remove any temp files or symlinks you created during prior levels under `/tmp`, and unset your helper environment vars:

   ```bash
   unset SC
   ```

3. **Archive your notes & payloads**
   Keep your one-liners, PoCs, and payload generators; they’re great references for future pwnables.

---

## Troubleshooting quick tips

* If you’re expecting a `/maze/maze9` binary: there isn’t one. Level 8 was the last technical challenge.
* If you kept background listeners or symlink spammers running from older levels, kill them to avoid noise while exploring other games.

---

## Conclusion

That’s a wrap for **Maze** 🎉

You just practiced a compact tour of foundational pwn techniques: controlled reads/writes, shellcode staging, GOT/PLT hijacking, ELF trickery, and more. These skills transfer directly to a ton of CTFs and beginner/intermediate exploit labs.

**Next adventures:**

* [Narnia](https://overthewire.org/wargames/narnia/) — more binary exploitation
* [Utumno](https://overthewire.org/wargames/utumno/) — trickier race conditions & memory games
* Labs: [TryHackMe](https://tryhackme.com/) / [Hack The Box](https://www.hackthebox.com/)

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})
