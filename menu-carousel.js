/* Dish Orbit Carousel for Caffè di Kash (vanilla JS port, needs GSAP).
   It reads the dishes from the menu list below it (.mi items that have a photo),
   so you only edit prices/descriptions in menu.html.

   NEW: autoplay + draggable.
   - Moves to the next dish automatically every AUTOPLAY_MS.
   - Drag / swipe with mouse, finger or pen to move to the next / previous dish.
   - Pauses on hover, keyboard focus, while dragging, when the tab is hidden or
     the carousel is off-screen, and has a pause / play button.
   - Autoplay is disabled for visitors who prefer reduced motion. */
(() => {
  const mount = document.getElementById('dish-carousel');
  if (!mount || !window.gsap) return;

  /* ---------- settings you can change ---------- */
  const AUTOPLAY_MS = 5000;   // time each dish stays on screen
  const SWAP_SECONDS = 1.2;   // how long the change animation takes
  const DRAG_DISTANCE = 40;   // px you must drag to change dish

  /* ---------- data (from the menu list) ---------- */
  const ACCENTS = ['#e8a27c', '#f6c9a8', '#9fcbe8', '#bcd98e', '#f5d26a', '#f2a6c6'];
  const CAT = { coffee: 'Coffee', cold: 'Cold drink', bakery: 'Bakery' };
  const dishes = [...document.querySelectorAll('.mi[data-c]')]
    .filter((el) => el.querySelector('img.mi-img'))
    .map((el, i) => {
      const img = el.querySelector('img.mi-img');
      const name = el.querySelector('h3').childNodes[0].textContent.trim().replace(/^the\s+/i, '');
      const words = name.split(' ');
      const multi = words.length > 1;
      return {
        title: multi ? words.slice(0, -1).join(' ') : CAT[el.dataset.c] || 'Menu',
        subtitle: multi ? words[words.length - 1] : name,
        eyebrow: el.querySelector('.tag') ? 'House pick' : 'On the menu',
        category: CAT[el.dataset.c] || 'Menu',
        image: img.getAttribute('src'),
        alt: img.getAttribute('alt') || name,
        price: el.querySelector('.pr').textContent.trim(),
        description: el.querySelector('p').textContent.trim(),
        accent: ACCENTS[i % ACCENTS.length],
      };
    });
  const n = dishes.length;
  if (!n) return;

  /* ---------- helpers ---------- */
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const wrap = (i) => ((Math.round(i) % n) + n) % n;
  const dirTo = (from, to) => ((((to - from) % n) + n) % n <= n / 2 ? 1 : -1);
  const fitSize = (chars, max, width, em) => Math.min(max, width / (Math.max(1, chars) * em));
  const stripStart = (i, visible) => (n <= visible ? 0 : Math.max(0, Math.min(i - 1, n - visible)));
  const arcPath = (a0, a1, cx, cy, r, w, steps = 48) => {
    const outer = [], inner = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps, a = ((a0 + (a1 - a0) * t) * Math.PI) / 180;
      const h = (w / 2) * Math.pow(Math.sin(Math.PI * t), 0.45), c = Math.cos(a), s = Math.sin(a);
      outer.push((cx + c * (r + h)).toFixed(1) + ' ' + (cy + s * (r + h)).toFixed(1));
      inner.push((cx + c * (r - h)).toFixed(1) + ' ' + (cy + s * (r - h)).toFixed(1));
    }
    return 'M' + outer.join('L') + 'L' + inner.reverse().join('L') + 'Z';
  };
  const ARC_REST = [[50, 98], [46, 124], [60, 126], [40, 100]];
  const ARC_SWEEP = [38, 146];
  const ORBIT = { x: 299, y: -450, r: 650 };
  const SWING = 50, ITEM = 118, VISIBLE = 4;
  const HIDE_1 = 'inset(0% 0% 0% 100%)', HIDE_2 = 'inset(0% 100% 0% 0%)', SHOW = 'inset(0% 0% 0% 0%)';

  /* ---------- styles ---------- */
  const css = `
.dsh-root{--color-background:var(--bg);--color-foreground:var(--fg);--color-muted-foreground:var(--fg2);--color-primary:var(--g4);
position:relative;overflow:hidden;width:100%;height:min(calc(100svh - 90px),780px);min-height:520px;color:var(--fg);font-family:var(--disp);container-type:inline-size;-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;cursor:grab;touch-action:pan-y}
.dsh-root.grabbing{cursor:grabbing}
.dsh-root *{box-sizing:border-box}
.dsh-root:focus-visible{outline:2px solid var(--g4);outline-offset:-4px}
.dsh-canvas{position:absolute;left:50%;top:50%;width:960px;height:520px;transform:translate(-50%,-50%) scale(var(--dsh-s,1));transform-origin:50% 50%}
.dsh-arc{position:absolute;left:0;top:0;width:960px;height:520px;overflow:visible;pointer-events:none}
.dsh-btn{appearance:none;border:0;background:none;color:inherit;font:inherit;padding:0;margin:0;cursor:pointer}
.dsh-btn:focus-visible{outline:2px solid var(--g4);outline-offset:3px;border-radius:10px}
.dsh-ico{width:13px;height:13px;fill:currentColor}
.dsh-pager{position:absolute;left:76px;top:172px;display:flex;flex-direction:column;align-items:center;gap:7px}
.dsh-dot{width:14px;height:10px;display:grid;place-items:center;transition:height .45s cubic-bezier(.3,.7,.2,1)}
.dsh-dot i{display:block;width:3px;height:3px;border-radius:3px;background:var(--fg);opacity:.45;transition:height .45s cubic-bezier(.3,.7,.2,1),opacity .3s}
.dsh-dot[aria-current]{height:26px}.dsh-dot[aria-current] i{height:22px;opacity:.9}
.dsh-plates{position:absolute;left:130px;top:82px;width:245px;height:245px;touch-action:pan-y}
.dsh-orbit{position:absolute;inset:0;transform-origin:69% -217%;visibility:hidden;will-change:transform}
.dsh-orbit>img{display:block;width:245px;height:245px;max-width:none;object-fit:cover;border-radius:50%;border:6px solid rgba(255,255,255,.12);user-select:none;-webkit-user-drag:none;box-shadow:0 16px 30px rgba(0,0,0,.45),0 3px 6px rgba(0,0,0,.3)}
.dsh-head{position:absolute;left:388px;top:96px;width:330px;height:150px}
.dsh-hd{position:absolute;inset:0;visibility:hidden}
.dsh-eye{font:500 11px var(--mono);letter-spacing:.14em;text-transform:uppercase;color:var(--fg2);margin:0 0 4px 2px}
.dsh-t1,.dsh-t2{display:block;white-space:nowrap;line-height:1;margin:0}
.dsh-t1{font:italic 400 56px/1 var(--serif);letter-spacing:-.01em;margin-top:6px}
.dsh-t2{font-weight:800;text-transform:uppercase;letter-spacing:-.035em;margin-top:6px}
.dsh-acts{position:absolute;left:396px;top:280px;display:flex;align-items:center;gap:30px;font:500 11px var(--mono);letter-spacing:.12em;text-transform:uppercase}
.dsh-acts a{display:flex;align-items:center;gap:9px;padding:4px 0;color:inherit;text-decoration:none}
.dsh-acts a:hover{color:var(--g4)}
.dsh-play{display:grid;place-items:center;width:30px;height:30px;border-radius:50%;border:1px solid var(--rule)!important;transition:color .2s,border-color .2s}
.dsh-play:hover{color:var(--g4);border-color:var(--g4)!important}
.dsh-card{position:absolute;left:722px;top:137px;width:223px;padding:22px 22px 24px;border-radius:20px;background:linear-gradient(160deg,rgba(255,255,255,.1),rgba(255,255,255,.03));-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);border:1px solid var(--rule);box-shadow:0 18px 40px -24px rgba(0,0,0,.6)}
.dsh-bodies{display:grid}.dsh-body{grid-area:1/1;visibility:hidden}
.dsh-rate{margin:0 0 16px}
.dsh-num{display:inline-block;padding:10px 18px;border-radius:999px;font:700 22px/1 var(--disp);letter-spacing:-.02em;color:#1a0d07;box-shadow:0 8px 20px -8px rgba(0,0,0,.6)}
.dsh-chef{font:800 17px var(--disp);letter-spacing:-.01em;text-transform:uppercase;margin:0}
.dsh-kit{font:500 9.5px/1.5 var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--g4);margin:5px 0 14px;padding-bottom:14px;border-bottom:1px solid var(--rule)}
.dsh-desc{font:400 13.5px/1.5 var(--disp);margin:0;color:var(--fg2)}
.dsh-strip{position:absolute;left:130px;top:362px;width:550px;height:122px;display:flex;align-items:center}
.dsh-arrow{width:36px;height:36px;display:grid;place-items:center;flex:none}
.dsh-arrow svg{width:12px;height:16px;fill:currentColor}
.dsh-win{position:relative;width:${ITEM * VISIBLE}px;height:122px;overflow:hidden;flex:none;margin:0 2px;-webkit-mask-image:linear-gradient(90deg,#000 88%,transparent);mask-image:linear-gradient(90deg,#000 88%,transparent)}
.dsh-track{position:absolute;left:0;top:0;display:flex;transition:transform 1.2s cubic-bezier(.65,0,.35,1)}
.dsh-th{width:${ITEM}px;height:122px;display:flex;justify-content:center;padding-top:3px}
.dsh-th .dsh-btn{width:80px;height:116px;border-radius:14px;display:flex;flex-direction:column;align-items:center;gap:7px;padding-top:9px;transition:background .45s}
.dsh-th .dsh-btn[aria-current]{background:rgba(255,255,255,.08);box-shadow:0 10px 24px -16px rgba(0,0,0,.6)}
.dsh-th img{width:56px;height:56px;max-width:none;object-fit:cover;border-radius:50%;transition:transform .45s}
.dsh-th .dsh-btn[aria-current] img{transform:scale(1.08)}
.dsh-th span{font:500 9px/1.25 var(--mono);letter-spacing:.06em;text-transform:uppercase;text-align:center;color:var(--fg2);max-width:78px}
.dsh-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
@media(max-width:639px){.dsh-root{height:auto;min-height:0}}
@container (max-width:639px){
.dsh-canvas{position:relative;left:auto;top:auto;width:100%;height:auto;transform:none;display:flex;flex-direction:column;align-items:center;padding:14px 16px 24px}
.dsh-arc{width:200%;height:auto;left:-60%;top:-30px}
.dsh-pager{left:14px;top:150px}
.dsh-plates{position:relative;left:auto;top:auto;width:min(52vw,32svh);height:min(52vw,32svh)}
.dsh-orbit>img{width:100%;height:100%}
.dsh-head{position:relative;left:auto;top:auto;width:100%;height:132px;margin-top:10px}
.dsh-hd{text-align:center;transform:scale(.78);transform-origin:50% 0}
.dsh-acts{position:relative;left:auto;top:auto;margin-top:4px}
.dsh-card{position:relative;left:auto;top:auto;width:100%;max-width:420px;margin-top:12px}
.dsh-strip{display:none}}
@media(prefers-reduced-motion:reduce){.dsh-track,.dsh-dot,.dsh-dot i,.dsh-th .dsh-btn,.dsh-th img{transition:none}}`;

  /* ---------- markup ---------- */
  const arrowL = '<svg viewBox="0 0 12 16" aria-hidden="true"><path d="M11 0v16L0 8z"/></svg>';
  const arrowR = '<svg viewBox="0 0 12 16" aria-hidden="true"><path d="M1 0v16l11-8z"/></svg>';
  const icoList = '<svg class="dsh-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5 3 15h18zM3 18h18v2.5H3z"/></svg>';
  const icoPin = '<svg class="dsh-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.500a2.500 2.500 0 0 1 0 5z"/></svg>';
  const icoPause = '<svg class="dsh-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>';
  const icoPlay = '<svg class="dsh-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4v16l13-8z"/></svg>';

  mount.innerHTML = `<style>${css}</style>
<div class="dsh-root" role="region" aria-roledescription="carousel" aria-label="Menu highlights" tabindex="0">
 <div class="dsh-canvas">
  <svg class="dsh-arc" viewBox="0 0 960 520" aria-hidden="true"><path style="opacity:.34"/></svg>
  <div class="dsh-pager" role="tablist" aria-label="Choose a dish">${dishes.map((d, i) =>
    `<button type="button" role="tab" class="dsh-btn dsh-dot" aria-label="${esc(d.title + ' ' + d.subtitle)}"><i></i></button>`).join('')}</div>
  <div class="dsh-plates">${dishes.map((d) =>
    `<div class="dsh-orbit"><img src="${esc(d.image)}" alt="${esc(d.alt)}" width="245" height="245" draggable="false"></div>`).join('')}</div>
  <div class="dsh-head" aria-live="polite">${dishes.map((d) => `<div class="dsh-hd">
    <p class="dsh-eye">${esc(d.eyebrow)}</p>
    <div style="margin:0"><span class="dsh-t1" style="font-size:${fitSize(d.title.length, 60, 330, 0.42)}px">${esc(d.title)}</span>
    <span class="dsh-t2" style="font-size:${fitSize(d.subtitle.length, 62, 320, 0.66)}px">${esc(d.subtitle)}</span></div></div>`).join('')}</div>
  <div class="dsh-acts"><a href="#menu-list">${icoList}Full menu</a><a href="visit.html">${icoPin}Find us</a><button type="button" class="dsh-btn dsh-play" aria-label="Pause automatic slideshow" title="Pause">${icoPause}</button></div>
  <div class="dsh-card"><div class="dsh-bodies">${dishes.map((d) => `<div class="dsh-body">
    <div class="dsh-rate"><span class="dsh-num" style="background:${d.accent}">${esc(d.price)}</span></div>
    <p class="dsh-chef">${esc(d.category)}</p><p class="dsh-kit">Caffè di Kash · Made to order</p>
    <p class="dsh-desc">${esc(d.description)}</p></div>`).join('')}</div></div>
  <div class="dsh-strip">
   <button type="button" class="dsh-btn dsh-arrow" aria-label="Previous dish">${arrowL}</button>
   <div class="dsh-win"><div class="dsh-track">${dishes.map((d) =>
     `<div class="dsh-th"><button type="button" class="dsh-btn"><img src="${esc(d.image)}" alt="" width="56" height="56" draggable="false"><span>${esc(d.title === d.category || d.title === 'Menu' ? d.subtitle : d.title + ' ' + d.subtitle)}</span></button></div>`).join('')}</div></div>
   <button type="button" class="dsh-btn dsh-arrow" aria-label="Next dish">${arrowR}</button>
  </div>
 </div>
 <p class="dsh-sr" aria-live="polite"></p>
</div>`;

  /* ---------- elements ---------- */
  const $$ = (s) => [...mount.querySelectorAll(s)];
  const root = mount.querySelector('.dsh-root');
  const arcEl = mount.querySelector('.dsh-arc path');
  const orbits = $$('.dsh-orbit'), heads = $$('.dsh-hd'), bodies = $$('.dsh-body');
  const dots = $$('.dsh-dot'), thumbs = $$('.dsh-th .dsh-btn'), track = mount.querySelector('.dsh-track');
  const live = mount.querySelector('.dsh-sr');
  const playBtn = mount.querySelector('.dsh-play');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  /* fit the 960x520 design to the box */
  const fit = () => root.style.setProperty('--dsh-s', Math.min(root.clientWidth / 960, root.clientHeight / 520, 1.6));
  fit();
  new ResizeObserver(fit).observe(root);

  /* ---------- state + animation ---------- */
  let index = 0, shown = -1, dir = 1, tl = null;
  const arc = { a0: 0, a1: 0 };
  const drawArc = () => arcEl.setAttribute('d', arcPath(arc.a0, arc.a1, ORBIT.x, ORBIT.y, ORBIT.r, 118));
  const parts = (i) => ({
    orbit: orbits[i], head: heads[i], body: bodies[i],
    eye: heads[i].querySelector('.dsh-eye'), t1: heads[i].querySelector('.dsh-t1'), t2: heads[i].querySelector('.dsh-t2'),
  });

  const render = () => {
    const from = shown, to = index, b = parts(to), rest = ARC_REST[to % ARC_REST.length], tint = dishes[to].accent;
    dots.forEach((d, i) => { d.setAttribute('aria-selected', i === to); i === to ? d.setAttribute('aria-current', 'true') : d.removeAttribute('aria-current'); });
    thumbs.forEach((t, i) => (i === to ? t.setAttribute('aria-current', 'true') : t.removeAttribute('aria-current')));
    track.style.transform = `translateX(${-stripStart(to, VISIBLE) * ITEM}px)`;
    live.textContent = `Dish ${to + 1} of ${n}: ${dishes[to].title} ${dishes[to].subtitle}`;
    if (tl) tl.progress(1).kill();

    if (from === -1 || from === to || reduced.matches) {
      for (let i = 0; i < n; i++) if (i !== to) { const p = parts(i); gsap.set([p.orbit, p.head, p.body], { autoAlpha: 0 }); }
      gsap.set([b.orbit, b.head, b.body, b.eye], { autoAlpha: 1, rotation: 0, y: 0 });
      gsap.set([b.t1, b.t2], { clipPath: SHOW });
      arc.a0 = rest[0]; arc.a1 = rest[1]; drawArc(); gsap.set(arcEl, { fill: tint });
      shown = to; return;
    }
    const a = parts(from), d = dir;
    tl = gsap.timeline({ onComplete: () => (tl = null) });
    tl.to(a.orbit, { rotation: SWING * d, duration: 0.62, ease: 'power2.in' }, 0)
      .set(a.orbit, { autoAlpha: 0, rotation: 0 }, 0.62)
      .fromTo(b.orbit, { autoAlpha: 1, rotation: -SWING * d }, { rotation: 0, duration: 0.95, ease: 'power3.out' }, 0.3);
    tl.to(a.t1, { clipPath: HIDE_1, duration: 0.42, ease: 'power2.in' }, 0)
      .to(a.t2, { clipPath: HIDE_2, duration: 0.42, ease: 'power2.in' }, 0.06)
      .to(a.eye, { autoAlpha: 0, duration: 0.25 }, 0)
      .set(a.head, { autoAlpha: 0 }, 0.5)
      .set(b.head, { autoAlpha: 1 }, 0.5)
      .fromTo(b.eye, { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 0.55)
      .fromTo(b.t1, { clipPath: HIDE_1 }, { clipPath: SHOW, duration: 0.7, ease: 'power3.out' }, 0.55)
      .fromTo(b.t2, { clipPath: HIDE_2 }, { clipPath: SHOW, duration: 0.7, ease: 'power3.out' }, 0.62);
    tl.to(a.body, { autoAlpha: 0, y: -6, duration: 0.3, ease: 'power1.in' }, 0.05)
      .set(b.body, { autoAlpha: 1, y: 0 }, 0.4)
      .fromTo(b.body.children, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.06, ease: 'power2.out' }, 0.4);
    tl.to(arc, { a0: ARC_SWEEP[0], a1: ARC_SWEEP[1], duration: 0.6, ease: 'power2.inOut', onUpdate: drawArc }, 0)
      .to(arc, { a0: rest[0], a1: rest[1], duration: 0.85, ease: 'power3.out', onUpdate: drawArc }, 0.6)
      .to(arcEl, { fill: tint, duration: 1.1, ease: 'power1.inOut' }, 0.1);
    tl.duration(SWAP_SECONDS); // total time of one change
    shown = to;
  };

  /* ---------- autoplay ---------- */
  let timer = null;
  const hold = { user: false, hover: false, focus: false, drag: false, away: false };
  const canAuto = () =>
    n > 1 && !reduced.matches && !document.hidden &&
    !hold.user && !hold.hover && !hold.focus && !hold.drag && !hold.away;
  const schedule = () => {
    clearTimeout(timer);
    timer = canAuto() ? setTimeout(() => step(1), AUTOPLAY_MS) : null;
  };

  const go = (to, d) => {
    const next = wrap(to);
    if (next === index) return;
    dir = d || dirTo(index, next);
    index = next;
    render();
    schedule(); // restart the countdown after every change (auto or manual)
  };
  const step = (d) => go(index + d, d);

  /* pause / play button */
  const syncPlay = () => {
    playBtn.innerHTML = hold.user ? icoPlay : icoPause;
    playBtn.setAttribute('aria-label', hold.user ? 'Play automatic slideshow' : 'Pause automatic slideshow');
    playBtn.title = hold.user ? 'Play' : 'Pause';
    playBtn.hidden = reduced.matches || n < 2;
  };
  playBtn.onclick = () => { hold.user = !hold.user; syncPlay(); schedule(); };
  reduced.addEventListener?.('change', () => { syncPlay(); schedule(); });
  syncPlay();

  /* pause while the pointer is over it (mouse only) or keyboard focus is inside */
  root.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { hold.hover = true; schedule(); } });
  root.addEventListener('pointerleave', () => { hold.hover = false; schedule(); });
  root.addEventListener('focusin', (e) => { if (e.target.matches(':focus-visible')) { hold.focus = true; schedule(); } });
  root.addEventListener('focusout', () => { hold.focus = false; schedule(); });

  /* pause when the tab is hidden or the carousel is scrolled out of view */
  document.addEventListener('visibilitychange', schedule);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { hold.away = !entry.isIntersecting; schedule(); }, { threshold: 0.25 }).observe(root);
  }

  /* ---------- controls ---------- */
  dots.forEach((el, i) => (el.onclick = () => go(i)));
  thumbs.forEach((el, i) => (el.onclick = () => go(i)));
  mount.querySelector('[aria-label="Previous dish"]').onclick = () => step(-1);
  mount.querySelector('[aria-label="Next dish"]').onclick = () => step(1);
  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
  });

  /* drag / swipe anywhere on the carousel (mouse, finger or pen) */
  let drag = null;
  const endDrag = () => {
    drag = null;
    hold.drag = false;
    root.classList.remove('grabbing');
    schedule();
  };
  root.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || e.target.closest('button, a')) return;
    drag = { x: e.clientX, y: e.clientY, id: e.pointerId, moved: false };
    hold.drag = true;
    clearTimeout(timer);
  });
  root.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.moved && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
      drag.moved = true;
      root.classList.add('grabbing');
      try { root.setPointerCapture(e.pointerId); } catch (_) {}
    }
  });
  root.addEventListener('pointerup', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    const swiped = Math.abs(dx) > DRAG_DISTANCE && Math.abs(dx) > Math.abs(dy) * 1.4;
    endDrag();
    if (swiped) step(dx < 0 ? 1 : -1); // drag left = next dish, drag right = previous
  });
  root.addEventListener('pointercancel', endDrag);
  root.addEventListener('lostpointercapture', () => { if (drag) endDrag(); });

  render();
  schedule();
})();