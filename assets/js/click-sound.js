// /assets/js/click-sound.js  (1 file âm thanh)
(() => {
  const SOUND_URL   = '/assets/audio/click.mp3';
  const VOLUME      = 0.18;      // âm nhỏ để không lấn Spotify
  const PITCH_RANGE = 0.08;      // +/- 8% cao độ cho tự nhiên (có thể 0 để tắt)
  const MIN_GAP_MS  = 80;        // tối thiểu giữa 2 lần phát

  let ctx, master, buffer = null, unlocked = false, lastPlay = 0;

  async function initContext() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = VOLUME;
    master.connect(ctx.destination);

    try {
      const res = await fetch(SOUND_URL);
      const arr = await res.arrayBuffer();
      buffer = await ctx.decodeAudioData(arr);
    } catch (e) {
      console.warn('[click-sound] Không tải được âm thanh:', e);
      buffer = null; // fallback sẽ là beep ngắn
    }
  }

  function playClick() {
    const nowMs = performance.now();
    if (nowMs - lastPlay < MIN_GAP_MS) return;
    lastPlay = nowMs;

    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    if (buffer) {
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const cents = (Math.random() * 2 - 1) * PITCH_RANGE * 1200;
      if ('detune' in src) src.detune.value = cents;
      else src.playbackRate.value = 1 + cents / 1200;
      src.connect(master);
      src.start();
    } else {
      // Fallback beep ~80ms nếu không có file
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = 880 + Math.random() * 80;
      const env = ctx.createGain();
      env.gain.setValueAtTime(0.0001, ctx.currentTime);
      env.gain.exponentialRampToValueAtTime(VOLUME, ctx.currentTime + 0.005);
      env.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.06);
      osc.connect(env).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    }
  }

  function unlockOnce() {
    if (unlocked) return;
    unlocked = true;
    initContext();
    window.removeEventListener('pointerdown', unlockOnce);
  }

  // Lần tương tác đầu để unlock audio (autoplay policy)
  window.addEventListener('pointerdown', unlockOnce, { once: true, passive: true });

  // Phát tiếng cho mọi cú bấm (toàn trang)
  window.addEventListener('pointerdown', () => { if (ctx) playClick(); }, { passive: true });

  // Resume khi quay lại tab
  document.addEventListener('visibilitychange', () => {
    if (ctx && ctx.state === 'suspended' && !document.hidden) ctx.resume();
  });
})();
