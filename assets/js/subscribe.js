(() => {
  const modal    = document.getElementById('subscribe-modal');
  if (!modal) return;

  const dialog    = modal.querySelector('.subscribe-dialog');
  const openBtn   = document.getElementById('subBell');
  const backdrop  = modal.querySelector('.subscribe-backdrop');
  const form      = modal.querySelector('.subscribe-form');
  const emailInp  = modal.querySelector('#sub-email');
  const weeklyChk = modal.querySelector('#sub-weekly');

  const getFocusables = () =>
    [...modal.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')]
      .filter(el => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'));

  let lastActive = null;
  let isOpen = false;

  const firstFocusEl = () =>
    modal.querySelector('#sub-email') ||
    modal.querySelector('input, button, .subscribe-close') || dialog;

  // ---------- Tiny toast ----------
  const toast = (() => {
    let el;
    const ensure = () => {
      if (el) return el;
      el = document.createElement('div');
      el.setAttribute('role', 'status');
      el.ariaLive = 'polite';
      Object.assign(el.style, {
        position:'fixed', inset:'auto 1rem 1rem auto', zIndex:10000,
        padding:'10px 14px', borderRadius:'10px', fontWeight:'600',
        border:'1px solid #22c55e', background:'#16a34a', color:'#fff',
        boxShadow:'0 10px 30px rgba(0,0,0,.25)', transform:'translateY(10px)',
        opacity:'0', transition:'opacity .18s, transform .18s'
      });
      document.body.appendChild(el);
      return el;
    };
    return {
      show(msg='Done!') {
        const t = ensure();
        t.textContent = msg;
        requestAnimationFrame(() => {
          t.style.opacity = '1'; t.style.transform = 'translateY(0)';
          setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateY(10px)'; }, 1700);
        });
      }
    };
  })();

  function open() {
    if (isOpen) return;
    isOpen = true;
    lastActive = document.activeElement;

    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');

    if (openBtn) {
      openBtn.classList.add('is-active');
      openBtn.setAttribute('aria-expanded', 'true');
      openBtn.blur();
    }

    // restore weekly choice
    if (weeklyChk) {
      const saved = localStorage.getItem('subWeekly');
      if (saved !== null) weeklyChk.checked = saved === '1';
    }

    (firstFocusEl() || dialog).focus();
    document.addEventListener('keydown', onKeydown, true);
  }

  // thêm flag để KHÔNG xóa email khi đóng do submit
  function close(opts = {}) {
    const { preserveEmail = false } = opts;
    if (!isOpen) return;
    isOpen = false;

    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    document.removeEventListener('keydown', onKeydown, true);

    if (!preserveEmail && emailInp) emailInp.value = '';

    if (openBtn) {
      openBtn.classList.remove('is-active');
      openBtn.setAttribute('aria-expanded', 'false');
      openBtn.blur();
    }
    if (lastActive && typeof lastActive.focus === 'function') lastActive.focus();
  }

  function onKeydown(e) {
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key === 'Tab') {
      const f = getFocusables(); if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  // ---------- Wire events ----------
  if (openBtn)  openBtn.addEventListener('click', (e) => { e.preventDefault(); isOpen ? close() : open(); });
  if (backdrop) backdrop.addEventListener('click', close);
  modal.addEventListener('click', (e) => {
    const closer = e.target.closest('[data-close]');
    if (closer) { e.preventDefault(); close(); }
  });

  if (weeklyChk) {
    weeklyChk.addEventListener('change', () => {
      localStorage.setItem('subWeekly', weeklyChk.checked ? '1' : '0');
    });
  }

  if (form) {
    form.addEventListener('submit', () => {

      const actionInstant = form.dataset.actionInstant || form.getAttribute('action');
      const actionWeekly  = form.dataset.actionWeekly  || form.getAttribute('action');
      form.setAttribute('action', (weeklyChk && weeklyChk.checked) ? actionWeekly : actionInstant);

      toast.show('Opening follow.it…');

      setTimeout(() => close({ preserveEmail: true }), 200);
    });
  }
})();
