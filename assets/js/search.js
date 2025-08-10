// assets/js/search.js
(() => {
  const BASE = (window.__ASSET_BASE__ || "").replace(/\/$/, "");
  const INDEX_URL = `${BASE}/search.json`;

  document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("article-search");
    if (!input) return;

    // các khối hiện tại
    const list = document.querySelector("#articles-list");
    const listItems = list ? Array.from(list.querySelectorAll(".article-item")) : [];
    const pagers = Array.from(document.querySelectorAll(".pagination, .paginator, .pager"));
    const tagBlocks = Array.from(document.querySelectorAll("#all-tags, .all-tags, .tag-cloud"));

    // khối kết quả động
    const results = document.createElement("ul");
    results.id = "search-results";
    results.style.listStyle = "none";
    results.style.margin = "0";
    results.style.padding = "0";
    results.style.display = "none";
    results.className = "posts";

    // chèn results vào DOM: ưu tiên trước list, nếu không có list thì sau ô input
    if (list && list.parentNode) {
      list.parentNode.insertBefore(results, list);
    } else {
      input.parentNode.insertBefore(results, input.nextSibling);
    }

    const showOriginal = () => {
      results.style.display = "none";
      if (list) list.style.display = "";
      pagers.forEach(p => (p.style.display = ""));
      tagBlocks.forEach(t => (t.style.display = ""));
    };

    const showResults = () => {
      results.style.display = "";
      if (list) list.style.display = "none";
      pagers.forEach(p => (p.style.display = "none"));
      tagBlocks.forEach(t => (t.style.display = "none"));
    };

    const norm = s => (s || "").toString().toLowerCase();

    let indexCache = null;
    let indexPromise = null;

    const ensureIndex = async () => {
      if (indexCache) return indexCache;
      if (!indexPromise) {
        indexPromise = fetch(INDEX_URL)
          .then(r => (r.ok ? r.json() : []))
          .then(json => (indexCache = Array.isArray(json) ? json : []))
          .catch(() => (indexCache = []));
      }
      return indexPromise;
    };

    const renderResults = arr => {
      if (!arr.length) {
        results.innerHTML = `<li class="article-item"><p>Không tìm thấy kết quả.</p></li>`;
        return;
      }
      results.innerHTML = arr
        .map(p => {
          const tags =
            (p.tags || [])
              .map(t => `<span class="post-tag">${t}</span>`)
              .join(" ");
          return `
            <li class="article-item">
              <h2 class="post-title"><a class="post-link" href="${p.url}">${p.title}</a></h2>
              <div class="post__meta">${p.date}${tags ? " — " + tags : ""}</div>
              ${p.excerpt ? `<p>${p.excerpt}</p>` : ""}
            </li>
          `;
        })
        .join("");
    };

    // fallback: lọc local ngay trên trang hiện tại
    const filterLocal = q => {
      const n = norm(q);
      listItems.forEach(li => {
        const title = norm(li.dataset.title);
        const tags = norm(li.dataset.tags);
        if (!n || title.includes(n) || tags.includes(n)) {
          li.classList.remove("hidden");
        } else {
          li.classList.add("hidden");
        }
      });
    };

    let deb = null;
    input.addEventListener("input", () => {
      const q = input.value.trim();
      clearTimeout(deb);
      deb = setTimeout(async () => {
        if (!q) {
          showOriginal();
          filterLocal(""); // trả list về trạng thái ban đầu
          return;
        }

        // ưu tiên dùng index toàn site
        const data = await ensureIndex();
        if (data && data.length) {
          const nq = norm(q);
          const res = data.filter(p => {
            const inTitle = norm(p.title).includes(nq);
            const inTags = (p.tags || []).some(t => norm(t).includes(nq));
            const inExcerpt = norm(p.excerpt).includes(nq);
            return inTitle || inTags || inExcerpt;
          });
          renderResults(res);
          showResults();
        } else {
          // nếu không có index thì lọc local
          filterLocal(q);
          // giữ UI gốc (không showResults) để còn phân trang
        }
      }, 120);
    });
  });
})();
