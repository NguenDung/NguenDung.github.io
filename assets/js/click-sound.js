(() => {
  if (window.__clickSoundInstalled) return;
  window.__clickSoundInstalled = true;

  const BASE = (window.__ASSET_BASE__ || '').replace(/\/$/, '');
  const URLS = {
    click: `${BASE}/assets/audio/click.mp3`,
    rare:  `${BASE}/assets/audio/click-rare.mp3`,
    warn:  `${BASE}/assets/audio/warn.mp3`,
    softImg: `${BASE}/assets/images/warn/warn-soft.jpg`,
    hardImg: `${BASE}/assets/images/warn/warn.jpg`
  };

  // Tuning
  const RARE_RATE       = 50;
  const WINDOW_MS       = 8000;
  const SOFT_THRESHOLD  = 30;
  const HARD_THRESHOLD  = 50;
  const SOFT_ARM_MS     = 7000;
  const HARD_AFTER_SOFT = 18;
  const SOFT_AUTOHIDE   = 3200;

  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const buffers = {};
  let rareCounter = 0;

  async function loadSound(name, url) {
    try {
      const res = await fetch(url);
      const ab  = await res.arrayBuffer();
      buffers[name] = await ctx.decodeAudioData(ab);
    } catch (e) {
      console.warn('Failed to load', name, e);
    }
  }
  Promise.all(['click', 'rare', 'warn'].map(k => loadSound(k, URLS[k])));

  function unlockAudio() {
    if (ctx.state === 'suspended') ctx.resume();
    window.removeEventListener('pointerdown', unlockAudio);
  }
  window.addEventListener('pointerdown', unlockAudio, { once: true, passive: true });

  function playBuf(name, vol = 0.3) {
    const buf = buffers[name];
    if (!buf) return;
    const src = ctx.createBufferSource();
    const gain = ctx.createGain();
    gain.gain.value = vol;
    src.buffer = buf;
    src.connect(gain).connect(ctx.destination);
    src.start();
  }

  function suspendSpotify() {
    const sp = document.querySelector('iframe[src*="spotify"]');
    if (!sp) return;
    sp.dataset.prevSrc = sp.src;
    sp.src = '';
  }
  function resumeSpotify() {
    const sp = document.querySelector('iframe[data-prev-src]');
    if (!sp) return;
    sp.src = sp.dataset.prevSrc;
    delete sp.dataset.prevSrc;
  }

  // ---- Modal
  const modal = document.createElement('div');
  modal.id = 'warning-modal';
  Object.assign(modal.style, {
    position: 'fixed', inset: '0',
    display: 'none', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(0,0,0,0.7)', zIndex: 99999,
    backdropFilter: 'blur(2px)'
  });
  const img = document.createElement('img');
  Object.assign(img.style, { display: 'block', maxWidth: 'none', maxHeight: 'none' });
  modal.appendChild(img);
  document.body.appendChild(modal);

  const wheelOpts = { capture: true, passive: false };
  let softTimer = null;

  function modalOn() { return modal.style.display === 'flex'; }

  function showModal(type) {
    clearTimeout(softTimer);                 // chống timer bị treo
    blockAll();
    modal.className = type;
    img.src = type === 'soft' ? URLS.softImg : URLS.hardImg;
    modal.style.setProperty('display', 'flex', 'important');  // chống CSS override

    if (type === 'soft') {
      softTimer = setTimeout(() => { if (!hardFired) hideModal(); }, SOFT_AUTOHIDE);
    }
  }
  function hideModal() {
    clearTimeout(softTimer);
    modal.style.setProperty('display', 'none', 'important');  // chống CSS override
    unblockAll();
    if (hardFired) resumeSpotify();
  }

  function blockAll() {
    window.addEventListener('pointerdown', blocker, true);
    window.addEventListener('wheel', blocker, wheelOpts);
    window.addEventListener('keydown', blocker, true);
    document.body.classList.add('warn-lock');
    document.body.style.overflow = 'hidden';
  }
  function unblockAll() {
    window.removeEventListener('pointerdown', blocker, true);
    window.removeEventListener('wheel', blocker, wheelOpts);
    window.removeEventListener('keydown', blocker, true);
    document.body.classList.remove('warn-lock');
    document.body.style.overflow = '';
  }
  function blocker(e) {
    if (modalOn()) { e.preventDefault(); e.stopPropagation(); }
  }

  // ---- State
  let clicks = [], softShown = false, hardFired = false;
  let softBase = 0, softUntil = 0;

  // chỉ nghe pointerdown để khỏi double-play
  window.addEventListener('pointerdown', onUserTap, { capture: true, passive: false });

  function onUserTap(e) {
    if (ctx.state === 'suspended') ctx.resume();

    // click vào link điều hướng thì reset spam state
    const anchor = e.target.closest('a');
    if (anchor && anchor.href && anchor.target !== '_blank') {
      clicks = [];
      softShown = false;
      softUntil = 0;
      return;
    }

    if (modalOn()) return;

    rareCounter++;
    if (rareCounter % RARE_RATE === 0) playBuf('rare', 0.4);
    else playBuf('click', 0.3);

    const tnow = Date.now();
    clicks.push(tnow);
    clicks = clicks.filter(t => tnow - t <= WINDOW_MS);

    if (!hardFired && clicks.length >= HARD_THRESHOLD) {
      hardFired = true;
      triggerHard();
      return;
    }
    if (!hardFired && softUntil >= tnow && clicks.length - softBase >= HARD_AFTER_SOFT) {
      hardFired = true;
      triggerHard();
      return;
    }
    if (!softShown && clicks.length >= SOFT_THRESHOLD) {
      softShown = true;
      softBase = clicks.length;
      softUntil = tnow + SOFT_ARM_MS;
      showModal('soft');
      return;
    }
    if (clicks.length === 1) {
      softShown = false;
      softUntil = 0;
    }
  }

  function triggerHard() {
    suspendSpotify();
    hardFired = true;
    showModal('hard');
    playBuf('warn', 0.8);

    const warnDur = (buffers.warn?.duration || 7) * 1000 + 200;
    setTimeout(() => {
      const videoId = 'TscaT-2aIKc';
      const iframe = document.createElement('iframe');
      Object.assign(iframe.style, {
        position: 'fixed', top: 0, left: 0,
        width: '100%', height: '100%', border: 'none',
        zIndex: 1000000
      });
      iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
      iframe.allow = 'autoplay; fullscreen';
      iframe.setAttribute('allowfullscreen', '');
      document.body.appendChild(iframe);
      document.documentElement.requestFullscreen?.();
    }, warnDur);
  }
})();
