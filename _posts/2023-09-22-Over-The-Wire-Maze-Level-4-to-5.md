---
date: 2023-09-22 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Maze Level 4 → 5 tutorial!!"
permalink: /posts/overTheWire-Maze-Level-4-to-5/
tags: [overthewire, maze, pwn, binary-exploitation, linux, beginner]
description: "Step by step writeup for OverTheWire Maze Level 4 → 5!!"
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
    <a href="{{ '/posts/overTheWire-Maze-Level-3-to-4/' | relative_url }}">← Previous: Level 3 → 4</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/maze/maze5.html" target="_blank" rel="noopener">
      Official (Level 5) ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Maze-Level-5-to-6/' | relative_url }}">Next: Level 5 → 6 →</a>
  </div>
</nav>

## Login

```bash
ssh maze4@maze.labs.overthewire.org -p <PORT>
# password: ishipaeroo
````

Binary: `/maze/maze5`

---

## Task

This binary asks for a **username** and a **key**, both exactly 8 characters long.
If inputs satisfy the internal check in `foo()`, we get a shell.

---

## Code Analysis

Main logic:

```c
int main(void) {
  char user[9];
  char pass[9];

  printf(" Username: ");
  scanf("%8s", user);

  printf("      Key: ");
  scanf("%8s", pass);

  if (strlen(user)==8 && strlen(pass)==8) {
    if (ptrace(PTRACE_TRACEME,0,0,0) == 0) {
      if (foo(user, pass)) {
        puts("Yeh, here's your shell");
        system("/bin/sh");
      } else {
        puts("Nah, wrong.");
      }
    } else {
      puts("nahnah..."); // anti-debug
    }
  } else {
    puts("Wrong length you!");
  }
}
```

So the check is hidden inside `foo(user, pass)`.

---

## The `foo()` function

Reverse engineering gives us:

```c
int foo(char* user, char* pass){
  char p[9] = {0x70, 0x72, 0x69, 0x6e, 0x74, 0x6c, 0x6f, 0x6c}; 
  // ASCII: "printlol"

  for(int i = 0; i < 8; i++){
    p[i] -= user[i] + 2*i - 0x41;
  }

  do {
    i--;
    if(i == 0) return 1; // success if all matched
  } while(pass[i] == p[i]);

  return 0; // fail
}
```

Key idea:
We must choose `user[i]` such that `p[i]` stays unchanged after subtraction.

That means:

```
user[i] + 2*i - 0x41 == 0
→ user[i] == 0x41 - 2*i
```

---

## Constructing Inputs

Let’s calculate `user`:

```
i=0 → 0x41 = 'A'
i=1 → 0x3F = '?'
i=2 → 0x3D = '='
i=3 → 0x3B = ';'
i=4 → 0x39 = '9'
i=5 → 0x37 = '7'
i=6 → 0x35 = '5'
i=7 → 0x33 = '3'
```

So `user = "A?=;9753"`

And `pass = "printlol"`

---

## Solution

Run the binary:

```bash
/maze/maze5
 Username: A?=;9753
      Key: printlol
```

Result:

```
Yeh, here's your shell
$ id
$ cat /etc/maze_pass/maze5
```

Flag obtained:

```
epheghuoli
```

---

## Why this works

* The key idea is **keeping `p[i]` unchanged** inside `foo()`.
* Choosing `user[i] = 0x41 - 2*i` cancels out the subtraction.
* So the comparison loop passes when we also supply `pass = "printlol"`.

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})
