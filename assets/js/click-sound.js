// assets/js/click-sound.js
(() => {
  if (window.__clickSoundInstalled) return;
  window.__clickSoundInstalled = true;

  const BASE = (window.__ASSET_BASE__ || '').replace(/\/$/, '');

  /* ===== Paths & config ===== */
  const PATHS = {
    click:   BASE + '/assets/audio/click.mp3',
    rare:    BASE + '/assets/audio/click-rare.mp3',
    warn:    BASE + '/assets/audio/warn.mp3',
    softImg: BASE + '/assets/images/warn-soft.jpg',
    hardImg: BASE + '/assets/images/warn.jpg',
  };

  // âm lượng click thấp hơn nhạc Spotify
  const VOLUME = { click: 0.12, rare: 0.16, warn: 0.9 };

  const RARE_BASE       = 50;          // ~1/50 click phát rare
  const SOFT_THRESHOLD  = 30;          // >=30 click / cửa sổ → soft
  const HARD_THRESHOLD  = 50;          // >=50 click / cửa sổ → hard
  const WINDOW_MS       = 8000;        // cửa sổ đếm 8s (ngưng >8s reset)
  const SOFT_LOCK_MS    = 2000;        // soft khóa thao tác tối thiểu 2s
  const SOFT_AUTOHIDE   = 3200;        // auto ẩn soft sau ~3.2s
  const HARD_AFTER_SOFT = 18;          // sau soft, thêm ≥18 click → hard
  const SOFT_ARM_MS     = 7000;        // “cửa sổ” leo thang sau soft (7s)
  const REDIRECT_URL    = 'https://www.youtube.com/watch?v=TscaT-2aIKc&autoplay=1';

  /* ===== Audio ===== */
  const sndClick = new Audio(PATHS.click); sndClick.volume = VOLUME.click;
  const sndRare  = new Audio(PATHS.rare);  sndRare.volume  = VOLUME.rare;
  const sndWarn  = new Audio(PATHS.warn);  sndWarn.volume  = VOLUME.warn;
  sndClick.preload = sndRare.preload = sndWarn.preload = 'auto';

  /* ===== Modal (dùng class .soft / .hard để style) ===== */
  const modal = document.createElement('div');
  modal.id = 'warning-modal';
  const modalImg = document.createElement('img');
  modal.appendChild(modalImg);
  document.body.appendChild(modal);

  const modalVisible = () => modal.style.display === 'flex';

  function showModal(src, kind){
    modal.classList.remove('soft','hard');
    if (kind) modal.classList.add(kind);
    modalImg.src = src;
    modal.style.display = 'flex';
  }
  function hideModal(){
    modal.style.display = 'none';
    modal.classList.remove('soft','hard');
  }

  /* ===== Spotify: tạm dừng / khôi phục ===== */
  const findSpotify = () => document.querySelector('#spotify-player-wrapper iframe');
  function suspendSpotify(){
    const ifr = findSpotify(); if (!ifr) return;
    if (!ifr.dataset.prevSrc) { ifr.dataset.prevSrc = ifr.src || ''; try { ifr.src = 'about:blank'; } catch{} }
  }
  function resumeSpotify(){
    const ifr = findSpotify(); if (!ifr) return;
    if (ifr.dataset.prevSrc) { const s = ifr.dataset.prevSrc; delete ifr.dataset.prevSrc; try { ifr.src = s; } catch{} }
  }

  /* ===== State ===== */
  let clicks = [];                 // timestamps trong 8s gần nhất
  let rareCounter = 0;
  let softShown = false;
  let softUnlockAt = 0;            // thời điểm có thể tắt soft
  let softArmedUntil = 0;          // cửa sổ leo thang sau soft
  let softBaseCount = 0;           // số click tại thời điểm bật soft
  let hardFired = false;
  let muteAll = false;             // hard: tắt mọi click sound

  /* ===== Helpers ===== */
  function playClick() {
    if (muteAll) return;           // hard → không còn phát click sound
    // không phát tiếng khi overlay đang mở (tránh “đá” âm)
    if (modalVisible()) return;

    rareCounter++;
    const rareHit = (rareCounter % RARE_BASE === 0) || (Math.random() < 1/(RARE_BASE*2));
    try {
      if (rareHit) { sndRare.currentTime = 0; sndRare.play().catch(()=>{}); }
      else         { sndClick.currentTime = 0; sndClick.play().catch(()=>{}); }
    } catch {}
  }

  function showSoft() {
    softShown = true;
    suspendSpotify();
    document.body.classList.add('warn-lock');

    showModal(PATHS.softImg, 'soft');
    softUnlockAt   = performance.now() + SOFT_LOCK_MS;

    // vũ khí hóa soft: nếu tiếp tục spam trong 7s kế → hard
    softBaseCount  = clicks.length;
    softArmedUntil = Date.now() + SOFT_ARM_MS;

    // auto-ẩn sau 3.2s nếu không bấm
    setTimeout(() => { if (!hardFired) closeSoft(); }, SOFT_AUTOHIDE);
  }

  function closeSoft() {
    hideModal();
    resumeSpotify();
    document.body.classList.remove('warn-lock');
  }

  function showHard() {
    hardFired = true;
    muteAll = true;                       // chặn mọi click sound
    try { sndClick.pause(); sndRare.pause(); } catch{}

    suspendSpotify();
    document.body.classList.add('warn-lock');
    showModal(PATHS.hardImg, 'hard');

    // chặn hoàn toàn thao tác
    const trap = e => { e.stopPropagation(); e.preventDefault(); };
    window.addEventListener('click', trap, true);
    window.addEventListener('pointerdown', trap, true);
    window.addEventListener('keydown', trap, true);

    let redirected = false;
    const go = () => {
      if (redirected) return;
      redirected = true;
      // thử vào fullscreen (có thể bị chặn tuỳ trình duyệt)
      try { document.documentElement.requestFullscreen?.(); } catch {}
      window.removeEventListener('click', trap, true);
      window.removeEventListener('pointerdown', trap, true);
      window.removeEventListener('keydown', trap, true);
      setTimeout(() => { window.location.href = REDIRECT_URL; }, 120);
    };

    try {
      sndWarn.currentTime = 0;
      sndWarn.play().then(() => {
        sndWarn.onended = go;
        setTimeout(go, Math.max(10000, (sndWarn.duration||7)*1000 + 400));
      }).catch(() => setTimeout(go, 1800));
    } catch { setTimeout(go, 1800); }
  }

  // click lên modal: chỉ đóng soft sau khi hết thời gian khóa
  modal.addEventListener('click', (e) => {
    if (modal.classList.contains('soft')) {
      e.preventDefault(); e.stopPropagation();
      if (performance.now() >= softUnlockAt) closeSoft();
    }
  }, true);

  /* ===== Click logic ===== */
  function handleClick() {
    // vẫn đếm để leo thang; nhưng playClick() chỉ khi không có overlay
    playClick();

    const now = Date.now();
    clicks.push(now);
    clicks = clicks.filter(t => now - t <= WINDOW_MS); // chỉ giữ 8s gần nhất

    if (!hardFired && clicks.length >= HARD_THRESHOLD) {
      showHard(); clicks.length = 0; return;
    }

    if (!hardFired && softArmedUntil && now <= softArmedUntil) {
      if (clicks.length - softBaseCount >= HARD_AFTER_SOFT) {
        showHard(); clicks.length = 0; return;
      }
    }

    if (!hardFired && !softShown && clicks.length >= SOFT_THRESHOLD) {
      showSoft(); return;
    }

    // nếu chuỗi vừa reset (user ngừng lâu) → cho phép soft lại
    if (clicks.length === 1) { softShown = false; softArmedUntil = 0; }
  }

  // bắt ở capture-phase để vẫn đếm khi modal đang che
  window.addEventListener('click', handleClick, { capture: true });

  // reset khi đổi trang nội bộ (Swup)
  window.addEventListener('swup:contentReplaced', () => {
    clicks.length = 0;
    softShown = false;
    softArmedUntil = 0;
    hardFired = false;
    muteAll = false;
  });
})();
