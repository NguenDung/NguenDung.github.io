// assets/js/search.js
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('article-search');
  const list  = document.getElementById('articles-list');
  if (!input || !list) return;

  const BASE = (window.__ASSET_BASE__ || '').replace(/\/$/, '');
  let index = null;                            // dữ liệu /search.json
  const pager = document.querySelector('.pagination');
  const originalHTML = list.innerHTML;         // để khôi phục khi xóa query

  // escape đơn giản để nhét text vào HTML
  const esc = s => String(s || '').replace(/[&<>"']/g, m => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[m]));

  // tạo 1 item giống layout cũ: tiêu đề (link), ngày, tag, excerpt
  function renderItem(p) {
    const li = document.createElement('li');
    li.className = 'article-item';
    li.innerHTML = `
      <h3 class="post-title">
        <a class="post-link" href="${p.url}">${esc(p.title)}</a>
      </h3>
      <div class="post-meta">${esc(p.date)}</div>
      <div class="post-tags" style="margin:.35rem 0 .2rem">
        ${ (p.tags||[]).map(t => `<span class="tag">${esc(t)}</span>`).join(' ') }
      </div>
      ${ p.excerpt ? `<p class="post-excerpt">${esc(p.excerpt)}</p>` : '' }
    `;
    return li;
  }

  function renderResults(arr) {
    list.innerHTML = '';
    arr.forEach(p => list.appendChild(renderItem(p)));
  }

  // lọc cục bộ (fallback) – dùng data-title / data-tags có sẵn trên trang hiện tại
  const localItems = Array.from(list.querySelectorAll('.article-item'));
  function localFilter(q) {
    const needle = q.trim().toLowerCase();
    localItems.forEach(li => {
      const title = (li.dataset.title || '').toLowerCase();
      const tags  = (li.dataset.tags  || '').toLowerCase();
      const ok = !needle || title.includes(needle) || tags.includes(needle);
      li.classList.toggle('hidden', !ok);
    });
  }

  // tìm toàn site bằng index
  function globalFilter(q) {
    const s = q.trim().toLowerCase();
    if (!s) { list.innerHTML = originalHTML; if (pager) pager.style.display = ''; return; }
    if (pager) pager.style.display = 'none';

    // hỗ trợ nhiều từ – mỗi token phải match title hoặc tag
    const tokens = s.split(/\s+/).filter(Boolean);
    const results = index.filter(p => {
      const title = p.title.toLowerCase();
      const tags  = (p.tags || []).join(' ').toLowerCase();
      return tokens.every(tok => title.includes(tok) || tags.includes(tok));
    });
    renderResults(results);
  }

  // debounce nhẹ
  let t = null;
  input.addEventListener('input', () => {
    clearTimeout(t);
    t = setTimeout(() => {
      if (index) globalFilter(input.value);
      else       localFilter(input.value); // trước khi index sẵn sàng
    }, 120);
  });

  // Enter → mở bài đầu tiên (nếu có)
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const first = list.querySelector('.article-item a');
      if (first) window.location.href = first.href;
    }
  });

  // fetch index toàn site
  fetch(`${BASE}/search.json`)
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(data => { index = data; })
    .catch(() => { /* dùng localFilter nếu fail */ });
});
