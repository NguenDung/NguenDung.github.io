/* subscribe.js — single source of truth for the modal */
(() => {
  const modal = document.getElementById('subscribe-modal');
  if (!modal) return;

  const dialog    = modal.querySelector('.subscribe-dialog');
  const openBtn   = document.getElementById('subBell');           // nút chuông
  const backdrop  = modal.querySelector('.subscribe-backdrop');
  const form      = modal.querySelector('#subForm');
  const emailInp  = modal.querySelector('#sub-email');
  const weeklyChk = modal.querySelector('#sub-weekly');
  const submitBtn = form?.querySelector('.subscribe-btn');

  const getFocusables = () =>
    [...modal.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')]
      .filter(el => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'));

  let lastActive = null;
  let isOpen = false;

  // ---------- Toast (mini) ----------
  const toast = (() => {
    let el;
    const ensure = () => {
      if (el) return el;
      el = document.createElement('div');
      el.id = 'sub-toast';
      el.setAttribute('role', 'status');
      el.style.cssText = `
        position:fixed; left:50%; bottom:22px; transform:translateX(-50%);
        max-width:92vw; padding:12px 16px; border-radius:10px;
        background:#0f172a; color:#e5e7eb; border:1px solid #1f2937;
        box-shadow:0 6px 26px rgba(0,0,0,.35); z-index:99999; font:500 14px/1.35 system-ui,Segoe UI,Arial;
        opacity:0; pointer-events:none; transition:opacity .15s ease;
      `;
      document.body.appendChild(el);
      return el;
    };
    let t = 0;
    return (msg, type='ok') => {
      const node = ensure();
      node.textContent = msg;
      node.style.background = type === 'err' ? '#7f1d1d' : '#0f172a';
      node.style.borderColor = type === 'err' ? '#b91c1c' : '#1f2937';
      node.style.opacity = '1';
      clearTimeout(t);
      t = setTimeout(() => (node.style.opacity = '0'), 2200);
    };
  })();

  // ---------- Helpers ----------
  const firstFocusEl = () => emailInp || modal.querySelector('input, button, .subscribe-close');

  function resetForm() {
    if (emailInp) {
      emailInp.value = '';
      emailInp.setCustomValidity('');
    }
    if (weeklyChk) {
      const saved = localStorage.getItem('sub.weekly');
      weeklyChk.checked = saved == null ? true : saved === 'true';
    }
  }

  function open() {
    if (isOpen) return;
    isOpen = true;
    lastActive = document.activeElement;

    resetForm();

    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');

    if (openBtn) {
      openBtn.classList.add('is-active');
      openBtn.setAttribute('aria-expanded', 'true');
      openBtn.blur();
    }

    (firstFocusEl() || dialog).focus();
    document.addEventListener('keydown', onKeydown, true);
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;

    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    document.removeEventListener('keydown', onKeydown, true);

    if (openBtn) {
      openBtn.classList.remove('is-active');
      openBtn.setAttribute('aria-expanded', 'false');
      openBtn.blur();
    }
    if (lastActive && typeof lastActive.focus === 'function') lastActive.focus();

    // Xóa email sau khi đóng để lần sau mở lại trống tinh
    if (emailInp) emailInp.value = '';
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
  if (openBtn) openBtn.addEventListener('click', (e) => { e.preventDefault(); isOpen ? close() : open(); });
  if (backdrop) backdrop.addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) { e.preventDefault(); close(); } });

  if (weeklyChk) {
    weeklyChk.addEventListener('change', () => {
      localStorage.setItem('sub.weekly', String(weeklyChk.checked));
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      // validate email trước khi submit
      const val = (emailInp?.value || '').trim();
      if (!val || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        e.preventDefault();
        toast('Please enter a valid email', 'err');
        emailInp?.focus();
        return;
      }

      // chọn endpoint theo weekly
      const endpoint = weeklyChk?.checked
        ? form.dataset.actionWeekly
        : form.dataset.actionInstant;

      if (endpoint) form.setAttribute('action', endpoint);

      // UI feedback + đóng
      submitBtn && (submitBtn.disabled = true, submitBtn.textContent = 'Sending…');
      setTimeout(() => {
        close();
        submitBtn && (submitBtn.disabled = false, submitBtn.textContent = 'Subscribe');
        toast('Check the new tab to confirm 💌');
      }, 250);
      // KHÔNG preventDefault để form post sang follow.it (mở tab mới)
    });
  }
})();
