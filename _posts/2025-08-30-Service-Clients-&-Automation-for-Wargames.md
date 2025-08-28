---
layout: post-with-comments
title: "Service Clients & Automation for Wargames: Protocol RE, Robust Solvers, and FormulaOne + Maze Tie-ins"
permalink: /posts/otw-service-clients-automation-formulaone-maze/
redirect_from:
- /posts/wargame-service-clients-automation/
- /posts/otw-formulaone-maze-clients/
tags: [overthewire, formulaone, maze, automation, pwntools, sockets, wireshark, tshark, pyshark, scapy, mitmproxy]
description: "Hands-on guide to building bulletproof CTF clients: recon with Wireshark/TShark, protocol reverse engineering, Python sockets/asyncio, pwntools solvers, mitmproxy traffic interception, and automation patterns — mapped to OverTheWire FormulaOne & Maze."
excerpt_separator: <!--more-->
---

<!-- Scoped styles & helpers JUST for this post -->

<style>
iframe[src*="youtube.com"], iframe[src*="youtu.be"], iframe[src*="vimeo.com"]{
  display:block; width:100% !important; max-width:100%; height:auto; aspect-ratio:16/9; border:0;
}
.md-table table{width:100%; border-collapse:separate; border-spacing:0;}
.md-table th,.md-table td{padding:.65rem .85rem; vertical-align:top;}
.md-table thead th{border-bottom:1px solid rgba(255,255,255,.15);}
.md-table tbody tr+tr td{border-top:1px dashed rgba(255,255,255,.12);}
kbd{background:#eee;border:1px solid #ccc;border-bottom:2px solid #bbb;padding:0 .35em;border-radius:3px;}
.note{background:rgba(255,255,0,.12); padding:.35rem .55rem; border-radius:6px}
.tip{background:rgba(0,255,170,.08); padding:.35rem .55rem; border-radius:6px}
.copy-btn{position:absolute; top:.45rem; right:.45rem; font-size:.8rem; padding:.25rem .5rem; border:1px solid rgba(255,255,255,.2); border-radius:6px; cursor:pointer; background:rgba(255,255,255,.04)}
pre{position:relative}
a[data-ext="1"]{ } /* auto-new-tab, no visible label */
.table-scroll{overflow-x:auto}
@media print { .no-print{display:none !important;} }
.print-card table { width:100%; border-collapse:separate; border-spacing:0; }
.print-card th,.print-card td{ padding:.55rem .7rem; vertical-align:top; }
.print-card thead th{ border-bottom:1px solid rgba(255,255,255,.18); }
.print-card tbody tr+tr td{ border-top:1px dashed rgba(255,255,255,.12); }
</style>

<script>
// Open external absolute URLs in a new tab (no visible "open in new tab" text)
// + Copy buttons for fenced code blocks
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a[href^="http"]').forEach(a=>{
    a.setAttribute('target','_blank');
    a.setAttribute('rel','noopener noreferrer');
    a.dataset.ext="1";
  });
  document.querySelectorAll('pre > code').forEach(code=>{
    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.textContent = 'Copy';
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(code.innerText);
        btn.textContent = 'Copied!';
        setTimeout(()=>btn.textContent='Copy', 1200);
      } catch(e){ btn.textContent = 'Oops'; setTimeout(()=>btn.textContent='Copy', 1200); }
    });
    code.parentElement.appendChild(btn);
  });
});
</script>

# Service Clients & Automation for Wargames

In FormulaOne/Maze (and many modern CTFs), you’re not just “solving a puzzle”—you’re **speaking a protocol**. This tutorial is a field guide to **recon** (pcap + filters), **protocol reverse engineering**, **client building** (Python sockets / asyncio / pwntools), **traffic interception** (mitmproxy), and **robust automation** (timeouts, retries, assertions, logging). The goal: **stable solvers** that survive flaky I/O, weird encodings, and grumpy services.

![Sui]({{ '/assets/images/automation/sui.gif' | relative_url }})

If you’re following my series, peek the official pages: **[OverTheWire — FormulaOne](https://overthewire.org/wargames/formulaone/)** and **[Maze](https://overthewire.org/wargames/maze/)**.

<!--more-->

---

## Table of Contents

* [1) Mindset & outcomes](#sec-mindset)
* [2) Network fundamentals (pcap + filters + anatomy)](#sec-fundamentals)
* [3) Toolbelt (CLI): nc/socat/openssl/curl/tshark](#sec-toolbelt)
* [4) Protocol RE workflow (from pcap to spec)](#sec-pre)
* [5) Clients in Python: sockets, selectors, asyncio](#sec-python)
* [6) pwntools automation patterns](#sec-pwntools)
* [7) Interception & replay: mitmproxy + addons](#sec-mitm)
* [8) Robustness: timeouts, retries, state machines, logging](#sec-robust)
* [9) Case patterns you’ll meet (and templates)](#sec-patterns)
* [10) FormulaOne + Maze tie-ins (non-spoiler)](#sec-otw)
* [Appendix A — One-liners & snippets](#appendix-a)
* [Appendix B — Mini-labs (safe, local)](#appendix-b)
* [Appendix C — TLS, certs & local MITM](#appendix-c)
* [Appendix D — Field checklist (printable)](#appendix-d)
* [Resource Library (Videos & Reading)](#resources)

---

<a id="sec-mindset"></a>

## 1) Mindset & outcomes

* **Talk like a client.** Identify request/response boundaries, encodings, framing, and error codes.
* **Determinize the flow.** Make prompts and end-conditions explicit (`recvuntil`, checksums, terminators).
* **Automate early.** Build a client **as you recon**; don’t wait for “full spec.”
* **Log everything.** Save pcaps, transcripts, and solver versions per attempt.

**Orientation video**
*Wireshark (fundamentals) — great when you’re new to captures*

<iframe src="https://www.youtube.com/embed/n6PvJcZ7hZ8" title="Wireshark Basics - Chris Greer"></iframe>

**Further references**

* Display-Filter Quickref (you’ll use this constantly)
* Tshark CLI (scriptable Wireshark)
* IANA Port Registry (sanity checks for port meanings)

---

<a id="sec-fundamentals"></a>

## 2) Network fundamentals (pcap + filters + anatomy)

**What to extract from a trace:**

* **Transport**: TCP or UDP? Retries? Fragmentation?
* **Framing**: line-based (`\n`/`\r\n`), length-prefixed, or delimiter-based?
* **Encoding**: ASCII, hex, base64, JSON, binary structs (endianness!).
* **State**: challenge → response → flag; or multi-round handshake.

**Core filters** (Wireshark/TShark display filters):

```text
tcp.stream eq 3
ip.addr == 10.0.2.15 && tcp.port == 31337
frame contains "Welcome"
tls.handshake.type == 1    # ClientHello
```

**Capture filters** (pcap/BPF syntax; use at capture time):

```text
tcp port 31337 or udp port 31337
host 10.0.2.15 and not port 22
```

**Video**
*Socket basics with Python — mental model for what you’re scripting*

<iframe src="https://www.youtube.com/embed/Lbfe3-v7yE0" title="Python Socket Programming - Corey Schafer"></iframe>

**Further references**

* Wireshark User’s Guide • Display Filter Reference
* Capture Filter syntax (pcap-filter)
* “Service Names & Port Numbers” (IANA)

---

<a id="sec-toolbelt"></a>

## 3) Toolbelt (CLI): nc/socat/openssl/curl/tshark

* **`nc` / `ncat`**: banner grab, quick sanity.
* **`socat`**: swiss-army relay, also for **UDP**, **PROXY**, and weird TTYs.
* **`openssl s_client`**: peek inside TLS endpoints.
* **`curl`**: HTTP(S) w/ headers, cookies, and binary upload/download.
* **`tshark`**: headless Wireshark—perfect for CI and scripted parsing.

```bash
# Handshake a TLS service
openssl s_client -connect host:443 -servername host </dev/null 2>/dev/null | head

# Scriptable capture
tshark -r traffic.pcapng -Y 'tcp.stream==2 && frame contains "flag"' -T fields -e frame.number -e data
```

**Tip:** For line-based puzzles, `rlwrap -cAr nc HOST PORT` gives history and colors; `stdbuf -oL` disables buffering in pipelines.

---

<a id="sec-pre"></a>

## 4) Protocol RE workflow (from pcap to spec)

1. **Segment flows** by `tcp.stream`/`udp.stream`.
2. **Annotate**: each request/response, delimiters, magic bytes, checksums.
3. **Hypothesize a grammar**: tokens, numbers (endian/size), records.
4. **Validate** with **tshark/pyshark** extraction → small script to replay.
5. **Freeze a mini spec** (README.md): message formats + state diagram.

**Video**
*PyShark + Wireshark dissectors = programmable parsing*

<iframe src="https://www.youtube.com/embed/qxBKHsMhWKU" title="Analyzing captures with PyShark"></iframe>

**Further references**

* PyShark (Python wrapper around TShark)
* Scapy (craft/replay packets)
* Wireshark Display Filter Reference

---

<a id="sec-python"></a>

## 5) Clients in Python: sockets, selectors, asyncio

**Blocking sockets** — simplest baseline, easiest to debug.

```python
#!/usr/bin/env python3
import socket, sys

def recvuntil(s, token: bytes, max_len=1<<20, timeout=5):
    s.settimeout(timeout)
    buf = b''
    while token not in buf:
        chunk = s.recv(4096)
        if not chunk: break
        buf += chunk
        if len(buf) > max_len: raise RuntimeError("too much data")
    return buf

host, port = sys.argv[1], int(sys.argv[2])
s = socket.create_connection((host, port), timeout=5)
banner = recvuntil(s, b'\n')
s.sendall(b'HELLO\n')
print(recvuntil(s, b'OK\n').decode('utf-8', 'replace'))
```

**`selectors`** — multiplex multiple sockets without threads.

```python
import selectors, socket
sel = selectors.DefaultSelector()
def connect(addr):
    s = socket.create_connection(addr); s.setblocking(False)
    sel.register(s, selectors.EVENT_READ|selectors.EVENT_WRITE, data={'buf':b''})
    return s
```

**`asyncio` streams** — concise, great for timeouts & backoff.

```python
import asyncio
async def client(host, port):
    reader, writer = await asyncio.open_connection(host, port)
    await reader.readline()              # banner
    writer.write(b'PING\n'); await writer.drain()
    line = await asyncio.wait_for(reader.readline(), timeout=3)
    print(line)
    writer.close(); await writer.wait_closed()
asyncio.run(client('127.0.0.1', 31337))
```

**Video**
*Hands-on sockets refresher (great for mental model)*

<iframe src="https://www.youtube.com/embed/-iRG9_zFRC4" title="PicoCTF intro & basic file exploit"></iframe>

**Further references**

* Python `socket`, `selectors`, `asyncio` Streams HOWTO
* RealPython sockets guide (modern patterns)

---

<a id="sec-pwntools"></a>

## 6) pwntools automation patterns

Why pwntools? **`recvuntil`/`sendlineafter`**, easy **remote/local toggle**, ELF helpers, `tube` abstractions, and logging.

**Template: local ↔ remote + asserts**

```python
#!/usr/bin/env python3
from pwn import *
context.log_level = 'info'
exe = './solver'     # your helper, optional
HOST, PORT = os.getenv('HOST','localhost'), int(os.getenv('PORT','31337'))

def start():
  return remote(HOST, PORT) if args.REMOTE else process([exe]) if os.path.exists(exe) else remote(HOST, PORT)

io = start()
io.recvuntil(b'> ')
io.sendline(b'1')
line = io.recvline(timeout=3)
assert b'OK' in line, f"unexpected: {line!r}"
# ... more rounds
io.interactive()
```

**Stability tricks**

* `context.timeout` global default; add per-recv guard rails.
* Wrap steps with **assertions**; fail fast & retry.
* Use **`with context.local(log_level='error')`** for noisy steps.

**Video**
*Overflow walkthrough (demonstrates the value of scripts & guards)*

<iframe src="https://www.youtube.com/embed/yH8kzOkA_vw" title="CSAW BigBoy (John Hammond)"></iframe>

**Further references**

* pwntools docs • ROPgadget (later)
* `one_gadget` (libc constraints; later)

---

<a id="sec-mitm"></a>

## 7) Interception & replay: mitmproxy + addons

When a service uses HTTP(S)/WebSockets, **mitmproxy** = live view, modification, and **scripting**.

**Quick start**

```bash
# Install and run
mitmproxy -p 8080
# Point your client at HTTP proxy http://127.0.0.1:8080 and install mitm CA (docs)
```

**Addon skeleton (Python)**

```python
# save as addons/log_all.py, run: mitmdump -s addons/log_all.py
from mitmproxy import http
def request(flow: http.HTTPFlow):  # or response(flow)
    if flow.request.host.endswith("challenge.local"):
        flow.request.headers["X-Auto"] = "1"
```

**Video**
*Capture, analyze, and debug HTTPS traffic with mitmproxy*

<iframe src="https://www.youtube.com/embed/7BXsaU42yok" title="mitmproxy HTTPS"></iframe>

**Further references**

* mitmproxy docs (proxy modes, certs, addons)
* “Wireshark & SSL/TLS” HOWTO (pair with mitm)

---

<a id="sec-robust"></a>

## 8) Robustness: timeouts, retries, state machines, logging

* **Timeouts**: per-read and overall; exponential backoff on reconnect.
* **State machine**: explicit states (`HELLO → CHALLENGE → ANSWER → DONE`).
* **Idempotency**: safe to re-run on partial progress.
* **Telemetry**: JSONL logs per run (`ts`, `state`, `rx`, `tx`, `duration`).
* **Artifacts**: save **pcaps** and **transcripts** on failure.

```python
import time, json, pathlib
LOG = pathlib.Path('runs')/f'{int(time.time())}.jsonl'
def log(ev, **kw):
    LOG.parent.mkdir(exist_ok=True)
    with LOG.open('a') as f: f.write(json.dumps({'t':time.time(),'ev':ev,**kw})+'\n')
```

---

<a id="sec-patterns"></a>

## 9) Case patterns you’ll meet (and templates)

**A) Line-based math quiz**

* `recvuntil(b': ')` → parse integers → compute → `sendline(str(ans).encode())`.
* Watch for **Unicode** (UTF-8) and **CRLF** (`\r\n`).

**B) Length-prefixed binary messages**

* Read 4 bytes (LE) → `struct.unpack('<I', hdr)[0]` → read exact body.
* Add **short-read loop** to gather full body.

**C) Base64 / hex dance**

* Detect via prompts or alphabet; prefer Python’s `base64` / `binascii`.

**D) Checksummed payloads (CRC32)**

* Compute with `binascii.crc32(data) & 0xffffffff`, respect endianness.

**E) TLS endpoints (custom app on 443)**

* Try `openssl s_client` for sanity; if custom framing, then Python **`ssl.create_default_context()`** + wrap the socket.

---

<a id="sec-otw"></a>

## 10) FormulaOne + Maze tie-ins (non-spoiler)

* **FormulaOne**: many tasks act like quirky network daemons—client discipline (read prompts, exact formatting, timeouts) wins.
* **Maze**: mixes RE + exploitation; your **pcap-first** habit + deterministic clients pay off when services are flaky or multi-stage.
* Build **one solver skeleton** and reuse it per service.

---

<a id="appendix-a"></a>

## Appendix A — One-liners & snippets

**Banner & timing**

```bash
nc -v host 31337
time ( printf 'HELLO\n' | nc host 31337 )
```

**socat relays**

```bash
# TCP→TCP relay (debug with -v)
socat -v TCP-LISTEN:9000,reuseaddr,fork TCP:host:31337
# UDP client
socat - UDP:host:31337
```

**openssl TLS peek**

```bash
openssl s_client -connect host:443 -servername host </dev/null | openssl x509 -noout -issuer -subject
```

**tshark extract**

```bash
tshark -r cap.pcapng -Y 'tcp.stream==1' -T fields -e frame.number -e data
```

**PyShark “first flag-looking line”**

```python
import pyshark
cap = pyshark.FileCapture('cap.pcapng', display_filter='tcp && frame contains "FLAG"')
print(cap[0].frame_info.number)
```

**Scapy craft/replay**

```python
from scapy.all import IP,TCP,Raw,send
pkt = IP(dst="host")/TCP(dport=31337,flags="PA")/Raw(load=b"HELLO\n")
send(pkt, verbose=0)
```

**pwntools toggles**

```python
io = remote(HOST, PORT) if args.REMOTE else process([exe])
io.sendlineafter(b'> ', b'1')
```

---

<a id="appendix-b"></a>

## Appendix B — Mini-labs (safe, local)

> Do these on your own VM; use a throwaway network namespace if possible.

**Lab B1 — Record → RE → Replay**

1. Start an echo-ish server (Python):

```python
# server.py
import socket, threading, base64
def h(conn):
    conn.sendall(b'Welcome\n')
    while True:
        d = conn.recv(4096)
        if not d: break
        if d.strip() == b'ENC':
            conn.sendall(base64.b64encode(b'secret-data')+b'\n')
        else:
            conn.sendall(b'OK\n')
    conn.close()
s = socket.socket(); s.bind(('0.0.0.0',31337)); s.listen()
print('listening 31337')
while True:
    c,_=s.accept()
    threading.Thread(target=h,args=(c,),daemon=True).start()
```

2. Capture with `tcpdump -i lo -w cap.pcapng tcp port 31337`.
3. RE with Wireshark/PyShark; write a client that sends `ENC` and parses base64.

**Lab B2 — Line-based → length-prefixed pivot**

Modify the server to send `len(4 bytes LE) || body`; adjust client to read exact bytes.

**Lab B3 — TLS wrap**

Wrap server with `stunnel` or run a simple Python `ssl` server; connect with `openssl s_client` then your Python TLS client.

---

<a id="appendix-c"></a>

## Appendix C — TLS, certs & local MITM

* **Local TLS for labs**: self-signed certs (OpenSSL).
* **Client pinning gotchas**: some apps pin certs; mitmproxy may need **upstream certs** or be impossible—fall back to **pcap** at the OS layer.
* **HTTP(S) services**: mitmproxy **intercept → modify → replay** flows; write small **addons** to automate boring clicks / header surgery.

**Mini how-to**

```bash
# Self-signed cert
openssl req -x509 -newkey rsa:2048 -nodes -keyout key.pem -out cert.pem -subj "/CN=localhost" -days 365
# mitmproxy as reverse proxy to local target
mitmproxy --mode reverse:http://127.0.0.1:8080 -p 9000
```

---

<a id="appendix-d"></a>

## Appendix D — Field checklist (printable)

<section id="defense-checklist" class="print-card">
  <h3>Service Clients & Automation — Field Checklist</h3>
  <div class="md-table table-scroll">
    <table>
      <thead>
        <tr>
          <th>Phase</th>
          <th>What to do</th>
          <th>Why</th>
          <th>Tools</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Capture</td>
          <td>pcap targeted filters; split by tcp/udp stream</td>
          <td>Minimize noise; isolate flows</td>
          <td>Wireshark/TShark</td>
        </tr>
        <tr>
          <td>RE</td>
          <td>Frame boundaries, encodings, endianness, checksums</td>
          <td>Defines your parsing</td>
          <td>Wireshark, PyShark, Scapy</td>
        </tr>
        <tr>
          <td>Prototype</td>
          <td>Blocking socket client that passes 1 round</td>
          <td>Early validation</td>
          <td>Python socket</td>
        </tr>
        <tr>
          <td>Automate</td>
          <td>Switch to pwntools; add recvuntil/asserts</td>
          <td>Deterministic loops</td>
          <td>pwntools</td>
        </tr>
        <tr>
          <td>Harden</td>
          <td>Timeouts, retries, reconnection, idempotency</td>
          <td>Survive flaky services</td>
          <td>asyncio/selectors, logging</td>
        </tr>
        <tr>
          <td>Artifacts</td>
          <td>Save pcap + transcript per run</td>
          <td>Debug regression</td>
          <td>tshark, JSONL logs</td>
        </tr>
      </tbody>
    </table>
  </div>
  <p class="note">Treat each service as a protocol. Your solver documents the spec.</p>
</section>

---

<a id="resources"></a>

## Resource Library (Videos & Reading)

### Videos (curated)

* *Wireshark fundamentals*: **Wireshark Tutorial for Beginners** — [Chris Greer](https://www.youtube.com/watch?v=n6PvJcZ7hZ8)
* *Sockets (Python)*: **Python Socket Programming** — [Corey Schafer](https://www.youtube.com/watch?v=Lbfe3-v7yE0)
* *PyShark analysis*: **Analyzing Captures in Python with PyShark** — [Dor Green / PyCon IL](https://www.youtube.com/watch?v=qxBKHsMhWKU)
* *MitM for HTTP(S)*: **Capture & Debug HTTPS with mitmproxy** — [Tutorial](https://www.youtube.com/watch?v=7BXsaU42yok)
* *PyShark quick intro*: **EASY PyShark Tutorial** — [ByteByteGo-like walk-through](https://www.youtube.com/watch?v=8G0XIQPJszs)
* *MITM deep dive playlist*: **Learn mitmproxy** — [QAInsights Playlist](https://www.youtube.com/playlist?list=PLJ9A48W0kpRJeDShJotYMQy-TM_T2DJRO)

### Reading / Tools

* **Wireshark User’s Guide** — [docs](https://www.wireshark.org/docs/wsug_html/)
* **Display Filter Reference** — [dfref](https://www.wireshark.org/docs/dfref/)
* **TShark** — [User’s Guide sections](https://www.wireshark.org/docs/wsug_html_chunked/)
* **pcap/BPF filter syntax** — [pcap-filter manpage](https://www.tcpdump.org/manpages/pcap-filter.7.html)
* **PyShark** — [PyPI](https://pypi.org/project/pyshark/) • [Intro guide](https://thepacketgeek.com/pyshark/intro-to-pyshark/)
* **Scapy** — [docs](https://scapy.readthedocs.io/)
* **mitmproxy** — [docs (modes, certs, addons)](https://docs.mitmproxy.org/stable/)
* **pwntools** — [docs](https://docs.pwntools.com/en/stable/)
* **Python sockets & multiplexing** — [`socket`](https://docs.python.org/3/library/socket.html) • [`selectors`](https://docs.python.org/3/library/selectors.html) • [`asyncio` streams](https://docs.python.org/3/library/asyncio-stream.html)
* **IANA port registry** — [Service Names & Ports](https://www.iana.org/assignments/service-names-port-numbers)

---

## Final note

Think **pcap → spec → tiny client → robust solver**. Once you can **speak** the service’s language deterministically, everything else (RE, exploitation, crypto mini-puzzles) becomes a lot less scary. Tie this playbook to **FormulaOne** and **Maze** and you’ll ship solvers that just… work.

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})

