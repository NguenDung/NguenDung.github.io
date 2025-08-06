// assets/js/click-sound.js
(() => {
  if (window.__clickSoundInstalled) return;
  window.__clickSoundInstalled = true;

  // ─── 1) Base path & URLs ──────────────────────────────────────────────────────
  const BASE = (window.__ASSET_BASE__ || '').replace(/\/$/, '');
  const URLS = {
    click: `${BASE}/assets/audio/click.mp3`,
    rare:  `${BASE}/assets/audio/click-rare.mp3`,
    warn:  `${BASE}/assets/audio/warn.mp3`,
    softImg: `${BASE}/assets/images/warn-soft.jpg`,
    hardImg: `${BASE}/assets/images/warn.jpg`
  };

  // ─── 2) Config thresholds ────────────────────────────────────────────────────
  const RARE_RATE       = 50;      // 1/50 chance rare
  const WINDOW_MS       = 8000;    // 8s window
  const SOFT_THRESHOLD  = 30;      // ≥30 clicks → soft
  const HARD_THRESHOLD  = 50;      // ≥50 clicks → hard trực tiếp
  const SOFT_ARM_MS     = 7000;    // 7s sau soft để arm hard
  const HARD_AFTER_SOFT = 18;      // +18 clicks trong 7s → hard
  const SOFT_AUTOHIDE   = 3200;    // auto-hide soft modal sau 3.2s
  const REDIRECT_URL    = 'https://www.youtube.com/watch?v=TscaT-2aIKc&autoplay=1';

  // ─── 3) Web Audio setup ─────────────────────────────────────────────────────
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const buffers = {};
  let rareCounter = 0;

  async function loadSound(name, url) {
    try {
      const res = await fetch(url);
      const ab  = await res.arrayBuffer();
      buffers[name] = await ctx.decodeAudioData(ab);
    } catch (e) { console.warn('Failed to load', name, e); }
  }
  Promise.all(Object.entries(URLS)
    .filter(([k]) => k==='click' || k==='rare' || k==='warn')
    .map(([k,u]) => loadSound(k,u))
  );

  function unlockAudio() {
    if (ctx.state === 'suspended') ctx.resume();
    window.removeEventListener('pointerdown', unlockAudio);
    window.removeEventListener('touchstart',   unlockAudio);
  }
  window.addEventListener('pointerdown', unlockAudio, { once:true, passive:true });
  window.addEventListener('touchstart',   unlockAudio, { once:true, passive:true });

  function playBuf(name, volume=0.3) {
    const buf = buffers[name];
    if (!buf) return;
    const src = ctx.createBufferSource();
    const gain = ctx.createGain();
    gain.gain.value = volume;
    src.buffer = buf;
    src.connect(gain).connect(ctx.destination);
    src.start();
  }

  // ─── 4) Spotify suspend/resume ────────────────────────────────────────────────
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

  // ─── 5) Modal & blocker ──────────────────────────────────────────────────────
  const modal = document.createElement('div');
  modal.id = 'warning-modal';
  Object.assign(modal.style, {
    position: 'fixed', inset: '0',
    display: 'none', alignItems:'center', justifyContent:'center',
    background:'rgba(0,0,0,0.7)', zIndex:99999,
    backdropFilter:'blur(2px)'
  });
  const img = document.createElement('img');
  Object.assign(img.style, { maxWidth:'none', maxHeight:'none', display:'block' });
  modal.appendChild(img);
  document.body.appendChild(modal);

  function modalOn()   { return modal.style.display === 'flex'; }
  function showModal(type) {
    blockAll();
    modal.className = type;
    img.src = type==='soft' ? URLS.softImg : URLS.hardImg;
    modal.style.display = 'flex';

    if (type==='soft') {
      setTimeout(() => {
        if (!hardFired) hideModal();
      }, SOFT_AUTOHIDE);
    }
  }
  function hideModal() {
    modal.style.display = 'none';
    unblockAll();
    if (hardFired) {
      resumeSpotify();
    }
  }

  function blocker(e) {
    if (modalOn()) e.preventDefault(), e.stopPropagation();
  }
  function blockAll() {
    window.addEventListener('pointerdown', blocker, true);
    window.addEventListener('wheel',       blocker, { capture:true, passive:false });
    window.addEventListener('keydown',     blocker, true);
    document.body.style.overflow = 'hidden';
  }
  function unblockAll() {
    window.removeEventListener('pointerdown', blocker, true);
    window.removeEventListener('wheel',       blocker, true);
    window.removeEventListener('keydown',     blocker, true);
    document.body.style.overflow = '';
  }

  // ─── 6) State for spam logic ─────────────────────────────────────────────────
  let clicks = [], softShown = false, hardFired = false;
  let softBase = 0, softUntil = 0;

  // ─── 7) Core click handler ──────────────────────────────────────────────────
  window.addEventListener('pointerdown', e => {
    const now = Date.now();

    // 7.1 play click/rare nếu chưa có modal
    if (!modalOn()) {
      rareCounter++;
      if (rareCounter % RARE_RATE === 0) playBuf('rare', 0.4);
      else                                playBuf('click',0.3);
    }

    // 7.2 record & prune
    clicks.push(now);
    clicks = clicks.filter(t => now - t <= WINDOW_MS);

    // 7.3 hard trực tiếp
    if (!hardFired && clicks.length >= HARD_THRESHOLD) {
      hardFired = true;
      suspendSpotify();
      playBuf('warn', 0.8);
      showModal('hard');
      const dur = (buffers.warn?.duration||7)*1000 + 200;
      setTimeout(() => {
        document.documentElement.requestFullscreen?.();
        location.href = REDIRECT_URL;
      }, dur);
      return;
    }

    // 7.4 hard sau soft
    if (!hardFired && softUntil >= now
      && clicks.length - softBase >= HARD_AFTER_SOFT) {
      hardFired = true;
      suspendSpotify();
      playBuf('warn', 0.8);
      showModal('hard');
      const dur = (buffers.warn?.duration||7)*1000 + 200;
      setTimeout(() => {
        document.documentElement.requestFullscreen?.();
        location.href = REDIRECT_URL;
      }, dur);
      return;
    }

    // 7.5 soft
    if (!softShown && clicks.length >= SOFT_THRESHOLD) {
      softShown = true;
      softBase  = clicks.length;
      softUntil = now + SOFT_ARM_MS;
      showModal('soft');
      return;
    }

    // 7.6 reset nếu click đếm lại từ đầu
    if (clicks.length === 1) {
      softShown = false;
      softUntil = 0;
    }
  }, { capture:true, passive:true });

  // ─── 8) SPA reset (Swup) ─────────────────────────────────────────────────────
  window.addEventListener('swup:contentReplaced', () => {
    hideModal();
    resumeSpotify();
    clicks = []; softShown = false; hardFired = false;
    softUntil = 0;
  });

})();
