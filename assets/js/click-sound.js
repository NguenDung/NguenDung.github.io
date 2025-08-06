// assets/js/click-sound.js
(() => {
  if (window.__clickSoundInstalled) return;
  window.__clickSoundInstalled = true;

  // ─── 1) Base path & URLs ──────────────────────────────────────────────────────
  const BASE = (window.__ASSET_BASE__ || '').replace(/\/$/, '');
  const URLS = {
    click: `${BASE}/assets/audio/click.mp3`,  // normal click
    rare:  `${BASE}/assets/audio/click-rare.mp3`, // rare click
    warn:  `${BASE}/assets/audio/warn.mp3`,   // warning sound
    softImg: `${BASE}/assets/images/warn-soft.jpg`,
    hardImg: `${BASE}/assets/images/warn.jpg`
  };

  // ─── 2) Config thresholds ────────────────────────────────────────────────────
  const RARE_RATE       = 50;
  const WINDOW_MS       = 8000;
  const SOFT_THRESHOLD  = 30;
  const HARD_THRESHOLD  = 50;
  const SOFT_ARM_MS     = 7000;
  const HARD_AFTER_SOFT = 18;
  const SOFT_AUTOHIDE   = 3200;

  // ─── 3) Web Audio setup ─────────────────────────────────────────────────────
  const ctx = new (window.AudioContext||window.webkitAudioContext)();
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
  Promise.all(['click','rare','warn'].map(k => loadSound(k, URLS[k])));

  function unlockAudio() {
    if (ctx.state === 'suspended') ctx.resume();
    window.removeEventListener('pointerdown', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
  }
  window.addEventListener('pointerdown', unlockAudio, { once:true, passive:true });
  window.addEventListener('touchstart',  unlockAudio, { once:true, passive:true });

  function playBuf(name, vol=0.3) {
    const buf = buffers[name];
    if (!buf) return;
    const src = ctx.createBufferSource();
    const gain = ctx.createGain();
    gain.gain.value = vol;
    src.buffer = buf;
    src.connect(gain).connect(ctx.destination);
    src.start();
  }

  // ─── 4) Spotify control ──────────────────────────────────────────────────────
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

  // ─── 5) Warning modal & block ─────────────────────────────────────────────────
  const modal = document.createElement('div');
  modal.id = 'warning-modal';
  Object.assign(modal.style, {
    position:'fixed', inset:'0',
    display:'none', alignItems:'center', justifyContent:'center',
    background:'rgba(0,0,0,0.7)', zIndex:99999,
    backdropFilter:'blur(2px)'
  });
  const img = document.createElement('img');
  Object.assign(img.style, { display:'block', maxWidth:'none', maxHeight:'none' });
  modal.appendChild(img);
  document.body.appendChild(modal);

  function modalOn() { return modal.style.display === 'flex'; }
  function showModal(type) {
    blockAll();
    modal.className = type;
    img.src = type==='soft'? URLS.softImg : URLS.hardImg;
    modal.style.display = 'flex';
    if (type==='soft') {
      setTimeout(()=>{ if(!hardFired) hideModal(); }, SOFT_AUTOHIDE);
    }
  }
  function hideModal() {
    modal.style.display = 'none';
    unblockAll();
    if (hardFired) resumeSpotify();
  }
  function blockAll() {
    window.addEventListener('pointerdown', blocker, true);
    window.addEventListener('wheel',       blocker, {capture:true, passive:false});
    window.addEventListener('keydown',     blocker, true);
    document.body.style.overflow='hidden';
  }
  function unblockAll() {
    window.removeEventListener('pointerdown', blocker, true);
    window.removeEventListener('wheel',       blocker, true);
    window.removeEventListener('keydown',     blocker, true);
    document.body.style.overflow='';
  }
  function blocker(e) {
    if (modalOn()) e.preventDefault(), e.stopPropagation();
  }

  // ─── 6) Spam state ───────────────────────────────────────────────────────────
  let clicks=[], softShown=false, hardFired=false;
  let softBase=0, softUntil=0;

  // ─── 7) Unified tap handler ─────────────────────────────────────────────────
  ['pointerdown','touchstart','click'].forEach(evt =>
    window.addEventListener(evt, onUserTap, {capture:true, passive:false})
  );
  function onUserTap(e) {
    if (ctx.state==='suspended') ctx.resume();
    if (modalOn()) return;
    rareCounter++;
    if (rareCounter%RARE_RATE===0) playBuf('rare',0.4);
    else                            playBuf('click',0.3);
    const now = Date.now();
    clicks.push(now);
    clicks = clicks.filter(t=>now-t<=WINDOW_MS);
    if(!hardFired&&clicks.length>=HARD_THRESHOLD){ hardFired=true; triggerHard(); return; }
    if(!hardFired&&softUntil>=now&&clicks.length-softBase>=HARD_AFTER_SOFT){ hardFired=true; triggerHard(); return; }
    if(!softShown&&clicks.length>=SOFT_THRESHOLD){ softShown=true; softBase=clicks.length; softUntil=now+SOFT_ARM_MS; showModal('soft'); return; }
    if(clicks.length===1){ softShown=false; softUntil=0; }
  }

  function triggerHard() {
    suspendSpotify();
    hardFired = true;

    // show hard modal immediately
    showModal('hard');

    // play warning sound then embed YouTube in-page full-screen
    const warnDur = (buffers.warn?.duration || 7) * 1000 + 200;
    // play warn immediately
    playBuf('warn', 0.8);
    setTimeout(() => {
      // embed YouTube iframe in-page
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

      // request full-screen on document
      document.documentElement.requestFullscreen?.();
    }, warnDur);
  }
})();
