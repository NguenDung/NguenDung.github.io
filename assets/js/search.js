// assets/js/search.js
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('article-search');
  if (!input) return;

  const items = Array.from(document.querySelectorAll('#articles-list .article-item'));

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    items.forEach(li => {
      const title = li.dataset.title;
      const tags  = li.dataset.tags;
      if (!q || title.includes(q) || tags.includes(q)) {
        li.classList.remove('hidden');
      } else {
        li.classList.add('hidden');
      }
    });
  });
});
