(() => {
  const modal = document.getElementById('subscribe-modal');
  if (!modal) return;

  const dialog   = modal.querySelector('.subscribe-dialog');
  const openBtn  = document.getElementById('subBell');
  const backdrop = modal.querySelector('.subscribe-backdrop');

  const getFocusables = () =>
    [...modal.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')]
      .filter(el => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'));

  let lastActive = null;
  let isOpen = false;

  const firstFocusEl = () =>
    modal.querySelector('#sub-email') ||
    modal.querySelector('input, button, .subscribe-close');

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

  if (openBtn) {
    openBtn.addEventListener('click', (e) => {
      e.preventDefault();
      isOpen ? close() : open();
    });
  }

  if (backdrop) backdrop.addEventListener('click', close);

  modal.addEventListener('click', (e) => {
    const closer = e.target.closest('[data-close]');
    if (closer) { e.preventDefault(); close(); }
  });

  const form = modal.querySelector('.subscribe-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      close();
    });
  }
})();
