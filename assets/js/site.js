// assets/js/site.js
(() => {
  const bySel = (sels, root = document) =>
    sels.map(s => root.querySelector(s)).find(Boolean);

  const isArticlePage = () =>
    !!document.querySelector('meta[property="og:type"][content="article"]');

  // ---- READ TIME (posts only) ----
  const pickTitle = () =>
    bySel([".post-title","article header h1","article h1","main h1",".page-content h1","h1"]);

  const closestArticleScope = (titleEl) => {
    // ưu tiên: thẻ <article> bao quanh tiêu đề
    let a = titleEl ? titleEl.closest("article") : null;
    if (a) return a;
    // fallback: vùng lớn nhưng gần title
    const candidates = [titleEl?.parentElement, titleEl?.parentElement?.parentElement, document.querySelector("main"), document];
    return candidates.find(Boolean) || document;
  };

  const pickContentInScope = (scope) => {
    // chọn phần thân bài trong phạm vi scope (không lấy toàn trang)
    const first = bySel([
      '[itemprop="articleBody"]',
      ".post-content",".entry-content",".post-body",
      ".markdown-body",".content","section.article-content","section.content"
    ], scope);
    return first || scope;
  };

  const stripNonArticleParts = (root) => {
    // clone để thao tác
    const clone = root.cloneNode(true);
    // loại header/nav/footer/aside/related/comment/welcome/sidebar
    const kill = clone.querySelectorAll([
      "header, nav, footer, aside, .sidebar, .site-header, .site-footer, .related-posts, .recent-articles, .comments, #welcome-modal, #welcome-overlay, #spotify-player-wrapper, #schedule-bar"
    ].join(","));
    kill.forEach(el => el.remove());
    // bỏ code blocks khỏi thống kê (tùy thích)
    // clone.querySelectorAll("pre, code").forEach(el => el.remove());
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
    // chỉ tìm tag trong phạm vi bài
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
    if (!isArticlePage()) return; // chỉ chạy trên post
    try {
      const title = pickTitle();
      const scope = closestArticleScope(title);
      if (!title || !scope) return;

      const contentEl = pickContentInScope(scope);
      const text = stripNonArticleParts(contentEl).trim();
      const words = (text.match(/\S+/g) || []).length;
      const wpm = 200;
      const minutes = Math.max(1, Math.ceil(words / wpm));

      // xuất log debug nhanh
      window.__READTIME_LAST__ = { words, minutes, usedScope: contentEl?.className || contentEl?.tagName };

      // tránh nhân đôi
      if (scope.querySelector(".reading-time")) return;

      const pill = document.createElement("span");
      pill.className = "reading-time";
      pill.textContent = `${minutes} min read`;

      placeReadTime(pill, scope, title);
    } catch (_) {}
  };

  // ---- COPY CODE BUTTON (mọi trang) ----
  const initCopyBtn = () => {
    try {
      const blocks = document.querySelectorAll("pre > code");
      blocks.forEach(code => {
        const pre = code.parentElement;
        if (!pre || pre.querySelector(".copy-btn")) return;
        const btn = document.createElement("button");
        btn.className = "copy-btn";
        btn.type = "button";
        btn.textContent = "Copy";
        btn.addEventListener("click", async () => {
          const text = code.innerText;
          try {
            await navigator.clipboard.writeText(text);
            btn.textContent = "Copied";
            btn.classList.add("done");
            setTimeout(() => { btn.textContent = "Copy"; btn.classList.remove("done"); }, 1500);
          } catch {
            const ta = document.createElement("textarea");
            ta.value = text; document.body.appendChild(ta);
            ta.select(); document.execCommand("copy"); document.body.removeChild(ta);
            btn.textContent = "Copied";
            setTimeout(() => { btn.textContent = "Copy"; }, 1500);
          }
        });
        pre.appendChild(btn);
      });
    } catch (_) {}
  };

  // ---- LAZY IMG (mọi trang) ----
  const initLazyImg = () => {
    try {
      const imgs = document.querySelectorAll("img");
      imgs.forEach(img => {
        if (!img.hasAttribute("loading")) img.setAttribute("loading","lazy");
        if (!img.hasAttribute("decoding")) img.setAttribute("decoding","async");
        if (!img.hasAttribute("width") && img.dataset.w) img.setAttribute("width", img.dataset.w);
        if (!img.hasAttribute("height") && img.dataset.h) img.setAttribute("height", img.dataset.h);
      });
    } catch (_) {}
  };

  const init = () => {
    initReadTime();
    initCopyBtn();
    initLazyImg();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
