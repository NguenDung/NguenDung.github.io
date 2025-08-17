/* Inject skip-link + back-to-top; keep layout changes minimal */
(function () {
  function ensureContentAnchor() {
    // Try to find main content; fallback to common containers
    var target = document.getElementById('content')
              || document.querySelector('main, [role="main"]')
              || document.querySelector('.page-content .wrapper')
              || document.body;
    if (!target.id) target.id = 'content';
    return target.id;
  }

  function injectSkipLink(anchorId) {
    var a = document.createElement('a');
    a.className = 'skip-link';
    a.href = '#' + anchorId;
    a.textContent = 'Skip to content';
    document.body.insertBefore(a, document.body.firstChild);
  }

  function injectBackToTop() {
    var btn = document.createElement('button');
    btn.id = 'backToTop';
    btn.setAttribute('aria-label', 'Back to top');
    btn.textContent = '↑';
    document.body.appendChild(btn);

    function toggle() { btn.style.display = (window.scrollY > 600) ? 'block' : 'none'; }
    window.addEventListener('scroll', toggle, { passive: true });
    toggle();

    btn.addEventListener('click', function () {
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (_) {
        window.scrollTo(0, 0);
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var id = ensureContentAnchor();
    injectSkipLink(id);
    injectBackToTop();
  });
})();
