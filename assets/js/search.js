// assets/js/search.js
(() => {
  document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('article-search');
    if (!input) return;

    const BASE = (window.__ASSET_BASE__ || '').replace(/\/$/, '');
    const SEARCH_URL = `${BASE}/search.json`;

    // container danh sách bài (đang hiển thị trong trang)
    const list = document.querySelector('#articles-list');
    if (!list) return;

    // các khối phụ để ẩn khi search (tuỳ theme, bắt thêm selector phổ biến)
    const pagers   = document.querySelector('.pagination, .pager, .paginator');
    const tagCloud = document.querySelector('.all-tags, .tags, .tags-cloud');

    // lưu lại HTML gốc để khôi phục khi xoá query
    const originalHTML = list.innerHTML;

    // cache dữ liệu
    let data = null;
    async function ensureData() {
      if (data) return data;
      const res = await fetch(SEARCH_URL, { cache: 'force-cache' });
      data = await res.json();
      // tiền xử lý: tạo field không dấu + lowercase cho title & tags
      data.forEach(p => {
        p._title = norm(p.title);
        p._tags  = (p.tags || []).map(norm);
      });
      return data;
    }

    // chuẩn hoá chuỗi: lowercase + bỏ dấu
    function norm(s) {
      return (s || '')
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '');
    }

    // debounce
    const debounce = (fn, wait = 180) => {
      let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
    };

    // vẽ 1 item kết quả
    function renderItem(p) {
      const tags = (p.tags || [])
        .map(t => `<span class="post-tag">${escapeHtml(t)}</span>`)
        .join(' ');
      return `
<li class="article-item">
  <h3 class="post-title">
    <a class="post-link" href="${p.url}">${escapeHtml(p.title)}</a>
  </h3>
  <div class="post__meta"><time>${p.date || ''}</time></div>
  ${tags ? `<div class="post-tags">${tags}</div>` : ''}
  ${p.excerpt ? `<p class="post-excerpt">${escapeHtml(p.excerpt)}</p>` : ''}
</li>`;
    }

    function escapeHtml(s) {
      return (s || '').replace(/[&<>"]/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'
      }[c]));
    }

    async function onInput() {
      const raw = input.value.trim();
      if (!raw) {
        // khôi phục
        list.innerHTML = originalHTML;
        if (pagers)   pagers.style.display = '';
        if (tagCloud) tagCloud.style.display = '';
        return;
      }

      const q = norm(raw);
      const posts = await ensureData();
      const matches = posts.filter(p =>
        p._title.includes(q) || p._tags.some(t => t.includes(q))
      );

      list.innerHTML = matches.length
        ? matches.map(renderItem).join('')
        : `<li class="article-item">No results for
             "<strong>${escapeHtml(raw)}</strong>"</li>`;

      if (pagers)   pagers.style.display = 'none';
      if (tagCloud) tagCloud.style.display = 'none';
    }

    // Enter = mở kết quả đầu tiên (nếu có)
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const first = list.querySelector('.post-link');
        if (first) first.click();
      }
    });

    input.addEventListener('input', debounce(onInput));
  });
})();
