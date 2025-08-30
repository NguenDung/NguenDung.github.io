---
layout: post-with-comments
title: "OverTheWire Natas Level 3 → 4 tutorial!!"
permalink: /posts/overTheWire-Natas-Level-3-to-4/
tags: [overthewire, natas, walkthrough, ctf, web, beginner]
description: "A step by step tutorial for OverTheWire Natas Level 3 → 4!!"
---

<!-- Scoped styles -->
<style>
  .bandit-nav{display:flex;align-items:center;gap:.75rem;margin:.5rem 0 1.25rem;border-top:1px solid var(--border-color,#3a3a3a);padding-top:.75rem}
  .bandit-nav .nav-left,.bandit-nav .nav-center,.bandit-nav .nav-right{flex:1}
  .bandit-nav .nav-left{text-align:left}
  .bandit-nav .nav-center{text-align:center}
  .bandit-nav .nav-right{text-align:right}
  .bandit-nav a{display:inline-block;padding:.45rem .8rem;border:1px solid var(--border-color,#3a3a3a);border-radius:.6rem;text-decoration:none;line-height:1}
  .bandit-nav a:hover{transform:translateY(-1px)}
  .bandit-nav .disabled{opacity:.55}
  :root[data-theme='light'] .bandit-nav a{border-color:rgba(0,0,0,.15)}
</style>

<nav class="bandit-nav" aria-label="Natas level navigation">
  <div class="nav-left">
    <a href="{{ '/posts/overTheWire-Natas-Level-2-to-3/' | relative_url }}">← Previous: Level 2 → 3</a>
  </div>

  <div class="nav-center">
    <a href="https://overthewire.org/wargames/natas/natas4.html" target="_blank" rel="noopener">
      Official (Level 4) ↗
    </a>
  </div>

  <div class="nav-right">
    <a href="{{ '/posts/overTheWire-Natas-Level-4-to-5/' | relative_url }}">
      Next: Level 4 → 5 →
    </a>
  </div>
</nav>

## Login

URL: <http://natas4.natas.labs.overthewire.org>  
Credentials: **natas4:QryZXc2e0zahULdHrtHxzyYkj59kUxLQ**

![homepage]({{ '/assets/images/natas/level-3-to-4/file.jpg' | relative_url }})

---

## Task

After logging in, the page shows:

```

Access disallowed. You are visiting from "" while authorized users should come only from "[http://natas5.natas.labs.overthewire.org/](http://natas5.natas.labs.overthewire.org/)"

```

This means the server checks the **HTTP Referer** header.

---

## A little bit of Theory

* **Referer header** is sent by browsers to indicate the previous page.  
* It can be modified easily — so using it for access control is insecure.  
* With **Burp Suite**, we can intercept and change this header before sending it to the server.

**Further reading:**

* <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referer" target="_blank" rel="noopener">MDN: Referer</a>  
* <a href="https://portswigger.net/burp" target="_blank" rel="noopener">Burp Suite</a>

---

## Solution

1. **Setup Burp Proxy**  
   - In Burp: *Proxy → Options → Proxy Listeners*, ensure listener at `127.0.0.1:8080`.  
   - Configure your browser to use the proxy.  

   ![proxy-setup]({{ '/assets/images/natas/level-3-to-4/proxy.jpg' | relative_url }})

2. **Intercept the request**  
   - Visit <http://natas4.natas.labs.overthewire.org>.  
   - Burp intercepts the HTTP request.  

   ![intercept]({{ '/assets/images/natas/level-3-to-4/intercept.jpg' | relative_url }})

3. **Modify the Referer header**  
   Change:
    ```
    Referer: [http://natas4.natas.labs.overthewire.org/](http://natas4.natas.labs.overthewire.org/)
    ```

    to:

    ```
    Referer: [http://natas5.natas.labs.overthewire.org/](http://natas5.natas.labs.overthewire.org/)
    ```

    ![edit-header]({{ '/assets/images/natas/level-3-to-4/edit.jpg' | relative_url }})

4. **Forward the request**  
    Once forwarded, the server grants access and reveals the password.


    ```
    Access granted. The password for natas5 is 0n35PkggAPm2zbEpOU802c0x0Msn1ToK
    ```

    ![success]({{ '/assets/images/natas/level-3-to-4/success.jpg' | relative_url }})
    ![final]({{ '/assets/images/natas/level-3-to-4/final.jpg' | relative_url }})


---
## Password


```
0n35PkggAPm2zbEpOU802c0x0Msn1ToK
```

---

**Troubleshooting**

* No traffic in Burp? → Check your browser proxy settings.  
* Still blocked? → Make sure the Referer is **exactly** `http://natas5.natas.labs.overthewire.org/`.  
* Forgot to forward? → The server won’t reply until you press **Forward** in Burp.

---

**Nice 🎉** You’ve just spoofed an HTTP header and bypassed weak Referer-based controls with Burp Suite!

---

## Thanks for reading!

Until next time — **Otsumachi!!** 💖☄️✨

![Cinema]({{ '/assets/images/advice/cinema.gif' | relative_url }})
