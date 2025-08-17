// assets/js/site.js
(() => {
  // Flag để CSS biết có Spotify và đẩy nút back-to-top vào trong
  if (document.getElementById('spotify-player-wrapper')) {
    document.body.classList.add('has-spotify');
  }

  /* ------------- tiny helpers ------------- */
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const bySel = (sels, root = document) => sels.map(s => root.querySelector(s)).find(Boolean);
  const onReady = (fn) => {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn, { once: true });
    else fn();
  };

  const isArticlePage = () =>
    !!$('meta[property="og:type"][content="article"]') ||
    !!bySel(["article.post", ".post", ".post-content"]);

  /* ------------- READ TIME ------------- */
  const pickTitle = () =>
    bySel([".post-title","article header h1","article h1","main h1",".page-content h1","h1"]);

  const closestArticleScope = (titleEl) => {
    let a = titleEl ? titleEl.closest("article") : null;
    if (a) return a;
    const candidates = [titleEl?.parentElement, titleEl?.parentElement?.parentElement, $("main"), document.body];
    return candidates.find(Boolean) || document;
  };

  const pickContentInScope = (scope) =>
    bySel([
      '[itemprop="articleBody"]',
      ".post-content",".entry-content",".post-body",
      ".markdown-body",".content","section.article-content","section.content"
    ], scope) || scope;

  const stripNonArticleParts = (root) => {
    const clone = root.cloneNode(true);
    $$(".site-header,header,nav,footer,.site-footer,aside,.sidebar,.related-posts,.recent-articles,.comments,#welcome-modal,#welcome-overlay,#spotify-player-wrapper,#schedule-bar", clone)
      .forEach(el => el.remove());
    $$("pre, code", clone).forEach(el => el.remove());
    $$("script,style,noscript,template", clone).forEach(el => el.remove());
    return clone.textContent || "";
  };

  const ensureMetaBar = (titleEl) => {
    const bar = titleEl?.parentElement?.querySelector(".post-meta")
             || titleEl?.parentElement?.querySelector(".post-meta-inline");
    if (bar) return bar;
    const wrap = document.createElement("div");
    wrap.className = "post-meta-inline";
    titleEl.insertAdjacentElement("afterend", wrap);
    return wrap;
  };

  const placeReadTime = (pill, scope, titleEl) => {
    const firstTag = bySel([".tag", ".post-tag", ".label"], scope);
    if (firstTag) {
      pill.classList.add("tag");
      ["post-tag","label"].forEach(c => { if (firstTag.classList.contains(c)) pill.classList.add(c); });
      firstTag.insertAdjacentElement("beforebegin", pill);
    } else {
      ensureMetaBar(titleEl).appendChild(pill);
    }
  };

  const initReadTime = () => {
    if (!isArticlePage()) return;
    try {
      const title = pickTitle();
      const scope = closestArticleScope(title);
      if (!title || !scope) return;
      if (scope.querySelector(".reading-time")) return;

      const contentEl = pickContentInScope(scope);
      const text = stripNonArticleParts(contentEl).trim();
      const words = (text.match(/\S+/g) || []).length;
      const minutes = Math.max(1, Math.ceil(words / 200));

      const pill = document.createElement("span");
      pill.className = "reading-time";
      pill.textContent = `${minutes} min read`;
      pill.setAttribute("aria-label", `Estimated reading time ${minutes} minutes`);
      placeReadTime(pill, scope, title);

      window.__READTIME_LAST__ = { words, minutes, usedScope: contentEl?.className || contentEl?.tagName };
    } catch (_) {}
  };

  /* ------------- COPY CODE BUTTON ------------- */
  const initCopyBtn = (root = document) => {
    try {
      $$("pre > code", root).forEach(code => {
        const pre = code.parentElement;
        if (!pre || pre.querySelector(".copy-btn")) return;

        const btn = document.createElement("button");
        btn.className = "copy-btn";
        btn.type = "button";
        btn.textContent = "Copy";
        btn.setAttribute("aria-live", "polite");
        btn.setAttribute("aria-label", "Copy code to clipboard");

        btn.addEventListener("click", async () => {
          const text = code.innerText;
          const done = (ok) => {
            btn.textContent = ok ? "Copied" : "Copy";
            btn.classList.toggle("done", ok);
            setTimeout(() => { btn.textContent = "Copy"; btn.classList.remove("done"); }, 1500);
          };
          try {
            await navigator.clipboard.writeText(text);
            done(true);
          } catch {
            try {
              const ta = document.createElement("textarea");
              ta.value = text; document.body.appendChild(ta);
              ta.select(); document.execCommand("copy"); document.body.removeChild(ta);
              done(true);
            } catch { done(false); }
          }
        });

        pre.appendChild(btn);
      });
    } catch (_) {}
  };

  /* ------------- LAZY IMG ------------- */
  const initLazyImg = (root = document) => {
    try {
      const isAboveTheFold = (img) =>
        img.closest(".site-header, header, nav, .hero, .page-header");

      const apply = () => {
        $$("img", root).forEach(img => {
          if (!img.hasAttribute("width")  && img.dataset.w) img.setAttribute("width",  img.dataset.w);
          if (!img.hasAttribute("height") && img.dataset.h) img.setAttribute("height", img.dataset.h);

          if (!img.style.aspectRatio) {
            const w = parseInt(img.getAttribute("width") || img.dataset.w || 0, 10);
            const h = parseInt(img.getAttribute("height")|| img.dataset.h || 0, 10);
            if (w > 0 && h > 0) img.style.aspectRatio = `${w} / ${h}`;
          }

          if (!img.hasAttribute("decoding")) img.setAttribute("decoding","async");
          if (!img.hasAttribute("loading")) {
            img.setAttribute("loading", isAboveTheFold(img) ? "eager" : "lazy");
          }
          if (img.getAttribute("loading") === "lazy" && !img.hasAttribute("fetchpriority")) {
            img.setAttribute("fetchpriority", "low");
          }
        });
      };

      if (window.requestIdleCallback) requestIdleCallback(apply, { timeout: 1500 });
      else setTimeout(apply, 200);
    } catch (_) {}
  };

  /* ------------- enhance + observer ------------- */
  const enhance = (root = document) => {
    initCopyBtn(root);
    initLazyImg(root);
    
    if (isArticlePage() && !document.querySelector(".reading-time")) initReadTime();
  };

  let scheduled = false;
  const scheduleEnhance = (root = document) => {
    if (scheduled) return;
    scheduled = true;
    const run = () => { scheduled = false; enhance(root); };
    if (window.requestIdleCallback) requestIdleCallback(run, { timeout: 1200 });
    else setTimeout(run, 120);
  };

  onReady(() => {
    enhance(document);

    try {
      const mo = new MutationObserver((list) => {
        for (const m of list) {
          if (m.addedNodes && m.addedNodes.length) { scheduleEnhance(document); break; }
        }
      });
      mo.observe(document.body, { childList: true, subtree: true });
    } catch {}

    // bfcache / back-forward
    window.addEventListener("pageshow", () => scheduleEnhance(document));

    window.SiteEnhance = enhance;
  });
})();
/* ===== Auto-sync Giscus theme with page theme ===== */
(function () {
  function currentTheme() {
    const t = document.documentElement.getAttribute('data-theme');
    if (t) return t === 'dark' ? 'dark' : 'light';
    return window.matchMedia &&
           window.matchMedia('(prefers-color-scheme: dark)').matches
           ? 'dark' : 'light';
  }

  function setGiscusTheme(theme) {
    const frames = document.querySelectorAll('iframe.giscus-frame, iframe[src*="giscus.app"]');
    frames.forEach(f => {
      try {
        f.contentWindow.postMessage(
          { giscus: { setConfig: { theme } } },
          'https://giscus.app'
        );
      } catch (_) {}
    });
  }

  function sync() { setGiscusTheme(currentTheme()); }

  // Lúc trang sẵn sàng
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', sync, { once: true });
  } else {
    sync();
  }

  // Khi bạn toggle (html[data-theme] đổi)
  new MutationObserver(sync).observe(document.documentElement, {
    attributes: true, attributeFilter: ['data-theme']
  });

  // Khi hệ thống đổi dark/light
  try {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    (mq.addEventListener ? mq.addEventListener : mq.addListener).call(mq, 'change', sync);
  } catch (_) {}

  // Khi iframe giscus được thêm trễ
  new MutationObserver(sync).observe(document.body, { childList: true, subtree: true });
})();
// --- Back-to-top tránh đè Spotify ---
(function(){
  const root = document.documentElement;
  const player = document.getElementById('spotify-player-wrapper');

  function togglePlayerAwareUI(){
    const wide = window.innerWidth >= 1024;         // màn hình rộng (desktop)
    const visible = !!(player && player.offsetParent !== null);
    if (wide && visible){
      root.classList.add('with-player');
    } else {
      root.classList.remove('with-player');
    }
  }

  window.addEventListener('resize', togglePlayerAwareUI, { passive:true });
  window.addEventListener('orientationchange', togglePlayerAwareUI, { passive:true });
  document.addEventListener('DOMContentLoaded', togglePlayerAwareUI);
  togglePlayerAwareUI();
})();
// --- Keep back-to-top on <body> so it beats all stacking contexts ---
(function(){
  const SEL = '#back-to-top, .back-to-top, .to-top, button[aria-label*="back" i]';
  function lift(){
    const el = document.querySelector(SEL);
    if (!el) return;
    if (el.parentElement !== document.body) document.body.appendChild(el);
    // harden style in case theme injects inline CSS
    Object.assign(el.style, {
      position:'fixed', right:'1rem', bottom:'1rem', zIndex:'2147483647', willChange:'transform'
    });
  }
  const once = () => { lift(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', once, { once:true });
  else once();
  window.addEventListener('pageshow', lift);
  new MutationObserver(lift).observe(document.documentElement, { childList:true, subtree:true });
})();
