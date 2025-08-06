// /assets/js/cursor-trail.js
(() => {
  if (window.__cursorTrailLoaded) return;
  window.__cursorTrailLoaded = true;

  // Tắt trên màn nhỏ & reduce motion
  const isMobile = window.innerWidth < 640;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isMobile || reduced) return;

  const CFG = {
    // Màu Suisei: xanh trời & vàng gold (RGB chuỗi)
    trailColors: ['120,200,255', '255,220,100'],
    cometColors: ['255,235,120', '120,200,255'],

    // Ngôi sao (trail khi move)
    trailSpawn: 2,             // số sao mỗi bước mousemove
    trailSize: [6, 11],        // bán kính ngoài (px)
    trailLife: [400, 900],     // ms
    trailSpin: [-2, 2],        // rad/giây
    trailAlpha: 0.85,

    // Sao chổi (khi click)
    cometBurst: 14,            // số sao chổi
    cometSize: [8, 13],        // bán kính ngoài (px)
    cometLife: [650, 1200],    // ms
    cometSpin: [-2.2, 2.2],    // rad/giây
    cometSpeed: [0.45, 1.25],  // px/ms
    tailLen: 18,               // số điểm trong đuôi
    tailWidth: 11,              // bề rộng đuôi ở đầu (px)
    tailAlpha: 0.30,           // độ đậm đuôi

    // Hình sao
    starPoints: 5,
    starInset: 0.5,            // bán kính trong = r * inset
    glow: 10,                  // shadowBlur

    // Chung
    composite: 'lighter',
    maxParticles: 260,
    zIndex: 950                // dưới lịch(1100) & spotify(1000)
  };

  /* ---------- Canvas overlay ---------- */
  const cvs = document.createElement('canvas');
  Object.assign(cvs.style, {
    position: 'fixed', inset: '0', width: '100%', height: '100%',
    pointerEvents: 'none', zIndex: String(CFG.zIndex)
  });
  document.body.appendChild(cvs);
  const ctx = cvs.getContext('2d');
  let dpr = 1;
  function resize() {
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const W = Math.floor(innerWidth * dpr);
    const H = Math.floor(innerHeight * dpr);
    if (cvs.width !== W || cvs.height !== H) { cvs.width = W; cvs.height = H; }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  }
  addEventListener('resize', resize, { passive: true });
  resize();

  /* ---------- Helpers ---------- */
  const now = () => performance.now();
  const rng = (a, b) => a + Math.random() * (b - a);
  const pick = arr => arr[(Math.random() * arr.length) | 0];
  const clamp01 = v => Math.max(0, Math.min(1, v));

  function starPath(cx, cy, r, points = CFG.starPoints, inset = CFG.starInset, rot = 0) {
    const inner = r * inset;
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const rad = (i % 2 ? inner : r);
      const ang = rot + (i * Math.PI) / points;
      const x = cx + Math.cos(ang) * rad;
      const y = cy + Math.sin(ang) * rad;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.closePath();
  }

  /* ---------- State ---------- */
  const parts = []; // {type:'trail'|'comet', x,y,vx,vy,size,born,life,color,rot,spin,history:[]}

  function spawnTrailStar(x, y) {
    parts.push({
      type: 'trail',
      x, y,
      vx: (Math.random() - 0.5) * 0.6,   // lướt nhẹ
      vy: (Math.random() - 0.5) * 0.6,
      size: rng(CFG.trailSize[0], CFG.trailSize[1]),
      born: now(),
      life: rng(CFG.trailLife[0], CFG.trailLife[1]),
      color: pick(CFG.trailColors),
      rot: Math.random() * Math.PI * 2,
      spin: rng(CFG.trailSpin[0], CFG.trailSpin[1])
    });
    if (parts.length > CFG.maxParticles) parts.shift();
  }

  function spawnComet(x, y) {
    const ang = Math.random() * Math.PI * 2;
    const spd = rng(CFG.cometSpeed[0], CFG.cometSpeed[1]);
    parts.push({
      type: 'comet',
      x, y,
      vx: Math.cos(ang) * spd,
      vy: Math.sin(ang) * spd,
      size: rng(CFG.cometSize[0], CFG.cometSize[1]),
      born: now(),
      life: rng(CFG.cometLife[0], CFG.cometLife[1]),
      color: pick(CFG.cometColors),
      rot: Math.random() * Math.PI * 2,
      spin: rng(CFG.cometSpin[0], CFG.cometSpin[1]),
      history: [] // tail positions
    });
    if (parts.length > CFG.maxParticles) parts.shift();
  }

  /* ---------- Input ---------- */
  let lastMove = 0;
  document.addEventListener('pointermove', (e) => {
    const t = now();
    // throttle ~60fps
    if (t - lastMove < 16) return;
    lastMove = t;
    for (let i = 0; i < CFG.trailSpawn; i++) spawnTrailStar(e.clientX, e.clientY);
  }, { passive: true });

  document.addEventListener('pointerdown', (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    for (let i = 0; i < CFG.cometBurst; i++) spawnComet(e.clientX, e.clientY);
  }, true);

  /* ---------- Draw ---------- */
  let last = now();
  function frame() {
    const t = now();
    const dt = Math.min(50, t - last); // ms
    last = t;

    ctx.clearRect(0, 0, innerWidth, innerHeight);
    ctx.globalCompositeOperation = CFG.composite;

    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      const age = t - p.born;
      const k = 1 - age / p.life; // 1 -> 0
      if (k <= 0) { parts.splice(i, 1); continue; }

      // update pos
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += (p.spin || 0) * (dt / 1000);

      if (p.type === 'comet') {
        // update tail history
        p.history.unshift({ x: p.x, y: p.y });
        if (p.history.length > CFG.tailLen) p.history.pop();

        // tail as tapered circles
        for (let j = 0; j < p.history.length; j++) {
          const h = p.history[j];
          const f = 1 - j / p.history.length;              // 1 -> 0
          const alpha = CFG.tailAlpha * f * k;
          const w = CFG.tailWidth * f * k;
          ctx.beginPath();
          ctx.fillStyle = `rgba(${p.color}, ${alpha})`;
          ctx.arc(h.x, h.y, w * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // draw star head
      const size = p.size * clamp01(k);
      ctx.save();
      ctx.shadowBlur = CFG.glow;
      ctx.shadowColor = `rgba(${p.color}, ${p.type === 'trail' ? CFG.trailAlpha * k : 0.9 * k})`;
      ctx.fillStyle  = `rgba(${p.color}, ${p.type === 'trail' ? CFG.trailAlpha * k : 0.9 * k})`;
      starPath(p.x, p.y, size, CFG.starPoints, CFG.starInset, p.rot);
      ctx.fill();
      ctx.restore();
    }

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
