const CAFE = {
  timeZone: undefined,
  hours: {
    0: [9, 17],
    1: [7, 19],
    2: [7, 19],
    3: [7, 19],
    4: [7, 19],
    5: [7, 19],
    6: [8, 20],
  },
};

const $ = (selector, root = document) => [...root.querySelectorAll(selector)];

const burger = $('.burger')[0];
const links = $('.links')[0];

const setNav = (isOpen) => {
  links.classList.toggle('open', isOpen);
  burger.setAttribute('aria-expanded', isOpen);
};

burger.onclick = () => setNav(!links.classList.contains('open'));

links.onclick = (e) => e.target.closest('a') && setNav(false);

addEventListener('keydown', (e) => e.key === 'Escape' && setNav(false));

const page = location.pathname.split('/').pop() || 'index.html';

$('a:not(.btn)', links).forEach((a) => {
  if (a.getAttribute('href') === page) {
    a.setAttribute('aria-current', 'page');
  }
});

const header = $('.hd')[0];

const onScroll = () => {
  header.firstElementChild.style.background = scrollY > 20 ? 'rgba(13,6,4,.92)' : '';
};

addEventListener('scroll', onScroll, { passive: true });

const formatHour = (h) => (h % 12 || 12) + (h < 12 ? ' am' : ' pm');

const parts = new Intl.DateTimeFormat('en-GB', {
  timeZone: CAFE.timeZone,
  weekday: 'short',
  hour: 'numeric',
  minute: 'numeric',
  hourCycle: 'h23',
}).formatToParts(new Date());

const getPart = (type) => parts.find((p) => p.type === type).value;

const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(getPart('weekday'));
const now = +getPart('hour') + getPart('minute') / 60;

const [openHour, closeHour] = CAFE.hours[day];
const tomorrow = CAFE.hours[(day + 1) % 7];
const isOpen = now >= openHour && now < closeHour;

let message;
if (isOpen) {
  message = `Open now, until ${formatHour(closeHour)}`;
} else if (now < openHour) {
  message = `Closed now, opens at ${formatHour(openHour)}`;
} else {
  message = `Closed now, opens tomorrow at ${formatHour(tomorrow[0])}`;
}

$('[data-open]').forEach((el) => {
  el.textContent = message;
  el.previousElementSibling.classList.toggle('off', !isOpen);
});

$('.hours [data-days]').forEach((row) => {
  row.classList.toggle('today', row.dataset.days.split(',').includes(String(day)));
});

const filterButtons = $('.filters button');

filterButtons.forEach((button) => {
  button.onclick = () => {
    filterButtons.forEach((b) => b.setAttribute('aria-pressed', b === button));

    $('.mi').forEach((item) => {
      item.hidden = button.dataset.f !== 'all' && item.dataset.c !== button.dataset.f;
    });
  };
});

$('#year')[0].textContent = new Date().getFullYear();

$('.btn').forEach((btn) => {

  btn.addEventListener('pointermove', (e) => {
    const rect = btn.getBoundingClientRect();
    btn.style.setProperty('--x', e.clientX - rect.left + 'px');
    btn.style.setProperty('--y', e.clientY - rect.top + 'px');
  });

  btn.addEventListener('pointerdown', (e) => {
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) / 4;
    const ripple = document.createElement('span');

    ripple.className = 'rip';
    ripple.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${e.clientX - rect.left - size / 2}px;
      top: ${e.clientY - rect.top - size / 2}px;
    `;

    btn.appendChild(ripple);
    ripple.onanimationend = () => ripple.remove();
  });
});
/* mascot on every "Find us" button: xs (header), sm (hero), full (CTA) */
(()=>{const btns=$('a.btn').filter(a=>/^find us$/i.test(a.textContent.trim()));if(!btns.length)return;
document.body.insertAdjacentHTML('afterbegin','<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><linearGradient id="eg" x1="0" x2="35" y1="17" y2="17" gradientUnits="userSpaceOnUse"><stop offset=".3" stop-color="#8d2e19"/><stop offset="1" stop-color="#3a0f06"/></linearGradient><linearGradient id="fg" x1="118" x2="118" y1="0" y2="168" gradientUnits="userSpaceOnUse"><stop stop-color="#F6C9A8"/><stop offset=".35" stop-color="#E4805A"/><stop offset=".7" stop-color="#C4472B"/><stop offset="1" stop-color="#6e1f10"/></linearGradient></defs></svg>');
const M=i=>`<svg class="arc" viewBox="0 0 360 110" aria-hidden="true"><path id="arc${i}" d="M20,100 Q180,-30 340,100" fill="none"/><text text-anchor="middle"><textPath href="#arc${i}" startOffset="50%">Come say hi!</textPath></text></svg><div class="chloe" aria-hidden="true"><div class="eyeWhite"><svg width="118" height="57" fill="none"><ellipse cx="99" cy="28" fill="#fff" rx="19" ry="28"/><ellipse cx="19" cy="28" fill="#fff" rx="19" ry="28"/></svg></div><div class="eyeL"><svg width="44" height="44" fill="none"><circle cx="20" cy="20" r="20" fill="url(#eg)"/><circle cx="22" cy="11" r="6" fill="#FCF5F3"/><circle cx="25" cy="20" r="3" fill="#FCF5F3"/></svg></div><div class="eyeR"><svg width="44" height="44" fill="none"><circle cx="20" cy="20" r="20" fill="url(#eg)"/><circle cx="23" cy="11" r="6" fill="#FCF5F3"/><circle cx="26" cy="20" r="3" fill="#FCF5F3"/></svg></div><div class="mask"><svg width="232" height="172" fill="none" viewBox="0 0 232 172"><path fill="url(#fg)" d="M115.972 0c18.723 0 36.111 5.717 50.512 15.501 8.836-12.564 25.962-16.522 39.52-8.694 14.349 8.284 19.264 26.631 10.98 40.98A29.875 29.875 0 0 1 201.197 61c3.096 9.1 4.775 18.853 4.775 29 0 49.706-40.294 78-90 78-49.705 0-90-28.294-90-78 0-11.353 2.103-22.215 5.939-32.218a29.86 29.86 0 0 1-12.888-11.994c-8.284-14.349-3.368-32.696 10.98-40.98 13.405-7.74 30.3-3.958 39.219 8.272C82.847 4.78 98.852 0 115.972 0ZM75.023 82.807c-10.493 0-19 12.536-19 28s8.507 28 19 28c10.494 0 19-12.536 19-28s-8.506-28-19-28Zm80 0c-10.493 0-19 12.536-19 28s8.507 28 19 28c10.494 0 19-12.536 19-28s-8.506-28-19-28Z"/><path fill="#FBE3D0" d="M115.023 43.807c40.87 0 74 29.001 74 64.776 0 35.775-33.131 55.224-74 55.224s-74-19.449-74-55.224c0-35.775 33.131-64.776 74-64.776Zm-40 39c-10.493 0-19 12.536-19 28s8.507 28 19 28c10.494 0 19-12.536 19-28s-8.506-28-19-28Zm80 0c-10.493 0-19 12.536-19 28s8.507 28 19 28c10.494 0 19-12.536 19-28s-8.506-28-19-28Z"/><ellipse cx="155" cy="110.8" stroke="#8d2e19" stroke-width="2" rx="19" ry="28"/><ellipse cx="75" cy="110.8" stroke="#8d2e19" stroke-width="2" rx="19" ry="28"/><path fill="#8d2e19" d="M118 121.5c1.6 0 3 .17 4 .7.5.26.84.6 1.1 1 .25.44.4 1 .4 1.8 0 .66-.3 1.33-.8 2-.5.66-1.2 1.26-1.9 1.8a4.7 4.7 0 0 1-5.6 0c-.7-.54-1.4-1.14-1.9-1.8-.5-.67-.8-1.34-.8-2 0-.8.15-1.36.4-1.8.25-.4.62-.74 1.1-1 .97-.52 2.36-.7 4-.7Z"/><path class="mouth" stroke="#8d2e19" stroke-linecap="round" stroke-width="2" d="M130.3 141c-3.3 2.56-7.8 4-12.5 4-4.7 0-9.2-1.44-12.5-4"/><ellipse class="mo" cx="118" cy="146" rx="6" ry="10" fill="#8d2e19"/><path fill="#FBE3D0" stroke="#e0b399" stroke-width="2" d="M17.1 139h25l5 5a54 54 0 0 0 7 5.9l5.8 4.1H31.5v2.2c0 6.8-3 13-9.2 14.2-1.9.4-3.8.6-5.2.6C8.2 171 1 163.800 1 155c0-8.700 7-15.800 15.700-16l.4 0ZM214.900 139h-25l-5 5a54 54 0 0 1-7 5.900l-5.800 4.100h28.300v2.200c0 6.800 3 13 9.200 14.200 1.900.4 3.800.6 5.300.6 8.900 0 16.100-7.200 16.100-16 0-8.700-7-15.800-15.700-16l-.4 0Z"/></svg></div></div>`;
const all=btns.map((a,i)=>{const cw=document.createElement('div');cw.className='cw '+(a.closest('.links')?'xs':a.closest('.hero')?'sm':'');a.replaceWith(cw);cw.append(a);cw.insertAdjacentHTML('afterbegin',M(i));return cw});
const look=(x,y)=>all.forEach(cw=>{const r=$('.chloe',cw)[0].getBoundingClientRect();if(!r.width)return;const k=r.width/232,cx=r.left+r.width/2,cy=r.top+117*k;
[[$('.eyeL',cw)[0],-40,.95],[$('.eyeR',cw)[0],40,1.05]].forEach(([e,b,m])=>{const dx=x-(cx+b*k),dy=y-cy,p=Math.min(1,Math.hypot(dx,dy)/400),a=Math.atan2(dy,dx);
e.style.transform=`translateX(-50%) translateX(${b}px) translate(${Math.cos(a)*16*p*m}px,${Math.sin(a)*20*p}px)`})});
addEventListener('pointermove',e=>look(e.clientX,e.clientY),{passive:true});
all.forEach(cw=>{const btn=$('.btn',cw)[0];btn.addEventListener('click',e=>{if(e.metaKey||e.ctrlKey||e.shiftKey||e.button)return;e.preventDefault();
cw.classList.add('cheer');const r=btn.getBoundingClientRect(),still=matchMedia('(prefers-reduced-motion:reduce)').matches;
if(window.confetti&&!still){const o={x:(r.left+r.width/2)/innerWidth,y:(r.top+r.height/2)/innerHeight};
confetti({particleCount:90,spread:70,startVelocity:40,origin:o,colors:['#c4472b','#e8a27c','#f4ece1']});confetti({particleCount:50,spread:100,startVelocity:25,decay:.9,origin:o})}
setTimeout(()=>{location.href=btn.href},still?0:1000)})})})();

/* ============ FEEDBACK FORM (only runs on feedback.html) ============
   HOW THE FEEDBACK REACHES YOU (pick one, set it below):
   1) endpoint - a form service URL, e.g. Formspree: https://formspree.io/f/xxxxxxx
      (free account at formspree.io, they email you every submission)
   2) email    - opens the visitor's email app with the message ready to send to you
   3) leave both empty - feedback is only saved inside the visitor's own browser
      (good for testing, but YOU will not receive it) */
(() => {
  const FEEDBACK = {
    endpoint: '',            // e.g. 'https://formspree.io/f/xxxxxxx'
    email: '',               // e.g. 'hello@yourcafe.com'
  };

  const form = document.getElementById('fb-form');
  if (!form) return;

  const done = document.getElementById('fb-done');
  const statusEl = document.getElementById('fb-status');
  const submitBtn = document.getElementById('fb-submit');
  const msg = document.getElementById('fb-message');
  const counter = document.getElementById('fb-count');
  const rateTxt = document.getElementById('rate-txt');
  const again = document.getElementById('fb-again');
  const LABELS = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very good', 5: 'Excellent' };

  const fieldOf = (el) => el.closest('.fld');
  const setBad = (el, bad) => fieldOf(el).classList.toggle('bad', bad);

  /* live rating text + character counter */
  form.querySelectorAll('input[name="rating"]').forEach((r) =>
    r.addEventListener('change', () => {
      rateTxt.textContent = LABELS[r.value] || '';
      setBad(r, false);
    })
  );
  const updateCount = () => { counter.textContent = msg.value.length + ' / ' + msg.maxLength; };
  msg.addEventListener('input', () => { updateCount(); setBad(msg, false); });
  updateCount();

  /* keep a local backup copy (also the fallback when no endpoint is set) */
  const saveLocal = (data) => {
    try {
      const key = 'cdk_feedback';
      const list = JSON.parse(localStorage.getItem(key) || '[]');
      list.push(data);
      localStorage.setItem(key, JSON.stringify(list.slice(-50)));
    } catch (_) {}
  };

  const deliver = async (data) => {
    saveLocal(data);
    if (FEEDBACK.endpoint) {
      const res = await fetch(FEEDBACK.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Request failed');
      return;
    }
    if (FEEDBACK.email) {
      const body =
        `Rating: ${data.rating}/5\nAbout: ${data.topic}\nName: ${data.name || '-'}\nEmail: ${data.email || '-'}\n\n${data.message}`;
      location.href = `mailto:${FEEDBACK.email}?subject=${encodeURIComponent('Feedback for Caffè di Kash')}&body=${encodeURIComponent(body)}`;
    }
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusEl.textContent = '';

    /* honeypot: bots fill this hidden field, people never see it */
    if (form.elements.company.value) return;

    const rating = form.querySelector('input[name="rating"]:checked');
    const text = msg.value.trim();
    const email = form.elements.email.value.trim();

    let ok = true;
    if (!rating) { setBad(form.querySelector('.stars'), true); ok = false; }
    if (text.length < 5) { setBad(msg, true); ok = false; }
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      setBad(form.elements.email, true);
      ok = false;
    } else {
      setBad(form.elements.email, false);
    }
    if (!ok) {
      statusEl.textContent = 'Please fix the highlighted fields.';
      return;
    }

    const data = {
      name: form.elements.name.value.trim(),
      email,
      rating: Number(rating.value),
      topic: form.elements.topic.value,
      message: text,
      sent: new Date().toISOString(),
    };

    submitBtn.disabled = true;
    const label = submitBtn.textContent;
    submitBtn.textContent = 'Sending…';
    try {
      await deliver(data);
      form.hidden = true;
      done.hidden = false;
      done.focus();
    } catch (_) {
      statusEl.textContent = 'Sorry, something went wrong. Please try again in a moment.';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = label;
    }
  });

  again.addEventListener('click', () => {
    form.reset();
    rateTxt.textContent = '';
    updateCount();
    form.querySelectorAll('.bad').forEach((f) => f.classList.remove('bad'));
    done.hidden = true;
    form.hidden = false;
    form.elements.name.focus();
  });
})();

/* ============ ROTATING DOTTED GLOBE (only runs on visit.html) ============
   No libraries and no map download: the land dots and coastlines are
   precomputed in globe-data.js, so the globe appears instantly. */
(() => {
  const wrap = document.getElementById('globe');
  const data = window.GLOBE_DATA;
  if (!wrap || !data) return;

  /* ----- café location: Raya, DHA, Lahore, Pakistan (pin is approximate) ----- */
  const CAFE_PIN = { lat: 31.45, lng: 74.43, name: 'Caffè di Kash', place: 'Raya, DHA Lahore' };

  const SPIN = 0.18;           // auto-rotation speed (degrees per frame)
  const DOT = 1.15;            // dot size
  const COLORS = { ocean1: '#2a130a', ocean2: '#0d0604', edge: 'rgba(232,162,124,.55)', grid: 'rgba(244,236,225,.1)', land: 'rgba(232,162,124,.55)', dot: 'rgba(232,162,124,.9)', pin: '#c4472b' };
  const RAD = Math.PI / 180;

  const canvas = wrap.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const msg = wrap.querySelector('.globe-msg');
  const locate = wrap.querySelector('.globe-locate');
  const still = matchMedia('(prefers-reduced-motion: reduce)');

  /* ----- unpack the precomputed data (delta-encoded, tenths of a degree) ----- */
  const unpack = (arr) => {
    const out = []; let x = 0, y = 0;
    for (let i = 0; i < arr.length; i += 2) { x += arr[i]; y += arr[i + 1]; out.push([x / 10, y / 10]); }
    return out;
  };
  const dotPts = unpack(data.d);
  const nDots = dotPts.length;
  const dLng = new Float32Array(nDots), dSin = new Float32Array(nDots), dCos = new Float32Array(nDots);
  dotPts.forEach(([lng, lat], i) => { dLng[i] = lng * RAD; dSin[i] = Math.sin(lat * RAD); dCos[i] = Math.cos(lat * RAD); });
  const lines = data.l.map((l) => unpack(l).map(([lng, lat]) => [lng * RAD, Math.sin(lat * RAD), Math.cos(lat * RAD)]));

  /* ----- orthographic projection (view centre = [-rot0, -rot1]) ----- */
  let w = 0, h = 0, R = 0, baseR = 0, zoom = 1;
  const rot = [-CAFE_PIN.lng + 25, -CAFE_PIN.lat + 8]; // start looking just west of the café, then spin onto it
  let cosT = 1, sinT = 0;
  const out = [0, 0, 0];
  const proj = (lngRad, sinLat, cosLat) => {
    const l = lngRad + rot[0] * RAD;
    const x = cosLat * Math.cos(l), y = cosLat * Math.sin(l);
    const xr = x * cosT + sinLat * sinT;
    const zr = sinLat * cosT - x * sinT;
    out[0] = w / 2 + R * y; out[1] = h / 2 - R * zr; out[2] = xr; // out[2] > 0 = facing us
    return xr > 0;
  };

  /* ----- drawing ----- */
  const draw = (t) => {
    if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const k = R / baseR;
    cosT = Math.cos(-rot[1] * RAD); sinT = Math.sin(-rot[1] * RAD);

    const g = ctx.createRadialGradient(w / 2 - R * 0.3, h / 2 - R * 0.3, R * 0.1, w / 2, h / 2, R);
    g.addColorStop(0, COLORS.ocean1); g.addColorStop(1, COLORS.ocean2);
    ctx.beginPath(); ctx.arc(w / 2, h / 2, R, 0, Math.PI * 2);
    ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = COLORS.edge; ctx.lineWidth = 1.5 * k; ctx.stroke();

    /* coastlines */
    ctx.beginPath();
    for (const line of lines) {
      let pen = false;
      for (const p of line) {
        if (proj(p[0], p[1], p[2])) { pen ? ctx.lineTo(out[0], out[1]) : ctx.moveTo(out[0], out[1]); pen = true; }
        else pen = false;
      }
    }
    ctx.strokeStyle = COLORS.land; ctx.lineWidth = 0.9 * k; ctx.stroke();

    /* land dots (one path = fast) */
    const dr = DOT * k;
    ctx.beginPath();
    for (let i = 0; i < nDots; i++) {
      if (proj(dLng[i], dSin[i], dCos[i])) { ctx.moveTo(out[0] + dr, out[1]); ctx.arc(out[0], out[1], dr, 0, Math.PI * 2); }
    }
    ctx.fillStyle = COLORS.dot; ctx.fill();

    drawPin(t, k);
  };

  /* ----- the café pin: pulsing ring + dot + label ----- */
  const drawPin = (t, k) => {
    if (!proj(CAFE_PIN.lng * RAD, Math.sin(CAFE_PIN.lat * RAD), Math.cos(CAFE_PIN.lat * RAD))) return;
    const x = out[0], y = out[1], fade = Math.min(1, out[2] * 3);
    ctx.save();
    ctx.globalAlpha = fade;
    if (!still.matches) {
      const ph = ((t || 0) / 1600) % 1;
      ctx.beginPath(); ctx.arc(x, y, (5 + ph * 16) * k, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(196,71,43,${0.7 * (1 - ph)})`; ctx.lineWidth = 2 * k; ctx.stroke();
    }
    ctx.beginPath(); ctx.arc(x, y, 8 * k, 0, Math.PI * 2); ctx.fillStyle = 'rgba(196,71,43,.28)'; ctx.fill();
    ctx.beginPath(); ctx.arc(x, y, 4.6 * k, 0, Math.PI * 2); ctx.fillStyle = COLORS.pin; ctx.fill();
    ctx.lineWidth = 1.5 * k; ctx.strokeStyle = '#f4ece1'; ctx.stroke();

    /* label (flips to the left side near the right edge) */
    const fs = Math.max(10, 11 * k);
    ctx.font = `600 ${fs}px "JetBrains Mono", monospace`;
    const l1 = CAFE_PIN.name.toUpperCase(), l2 = CAFE_PIN.place.toUpperCase();
    const tw = Math.max(ctx.measureText(l1).width, ctx.measureText(l2).width), pad = 9 * k, bh = fs * 2.7;
    const left = x + R * 0.0 + (x > w / 2 + R * 0.35 ? -(tw + pad * 2 + 14 * k) : 14 * k);
    const top = y - bh / 2 - 22 * k;
    ctx.beginPath();
    ctx.roundRect(left, top, tw + pad * 2, bh, 10 * k);
    ctx.fillStyle = 'rgba(13,6,4,.88)'; ctx.fill();
    ctx.strokeStyle = 'rgba(232,162,124,.5)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = '#f4ece1'; ctx.textBaseline = 'middle';
    ctx.fillText(l1, left + pad, top + bh * 0.33);
    ctx.fillStyle = '#e8a27c'; ctx.font = `500 ${fs * 0.88}px "JetBrains Mono", monospace`;
    ctx.fillText(l2, left + pad, top + bh * 0.7);
    ctx.restore();
  };

  const resize = () => {
    const rect = wrap.getBoundingClientRect();
    w = rect.width; h = rect.height;
    if (!w) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    baseR = Math.min(w, h) / 2.25;
    R = baseR * zoom;
    draw(performance.now());
  };
  new ResizeObserver(resize).observe(wrap);
  msg.hidden = true; // data is already here, nothing to wait for

  /* ----- animation loop (pauses when dragging, off-screen, hidden tab, reduced motion) ----- */
  let dragging = false, onScreen = true, start = null, holdUntil = 0, tween = null;
  new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; }).observe(wrap);
  const loop = (t) => {
    requestAnimationFrame(loop);
    if (!onScreen || document.hidden) return;
    if (tween) {
      const p = Math.min(1, (t - tween.t0) / tween.dur), e = 1 - Math.pow(1 - p, 3);
      rot[0] = tween.a0 + (tween.a1 - tween.a0) * e;
      rot[1] = tween.b0 + (tween.b1 - tween.b0) * e;
      if (p >= 1) tween = null;
    } else if (!dragging && !still.matches && t > holdUntil) {
      rot[0] -= SPIN; // earth turns eastward
    } else if (still.matches && !dragging && !tween) {
      return; // static view: redrawn only on interaction/resize
    }
    draw(t);
  };
  requestAnimationFrame(loop);

  /* ----- "Show café" button: glide to the pin and stay there a while ----- */
  const goToCafe = () => {
    const t0 = performance.now();
    let a1 = -CAFE_PIN.lng;
    while (a1 - rot[0] > 180) a1 -= 360;
    while (a1 - rot[0] < -180) a1 += 360;
    tween = { t0, dur: 1100, a0: rot[0], a1, b0: rot[1], b1: -CAFE_PIN.lat + 8 };
    holdUntil = t0 + 1100 + 6000;
    if (zoom !== 1) { zoom = 1; R = baseR; }
  };
  locate && locate.addEventListener('click', (e) => { e.stopPropagation(); goToCafe(); });
  locate && locate.addEventListener('pointerdown', (e) => e.stopPropagation());
  setTimeout(() => { if (!dragging) goToCafe(); }, 400); // open on the café

  /* ----- drag to rotate (mouse, finger, pen) ----- */
  wrap.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    dragging = true; tween = null;
    start = { x: e.clientX, y: e.clientY, rot: [...rot] };
    wrap.setPointerCapture(e.pointerId);
    wrap.classList.add('grabbing');
  });
  wrap.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    rot[0] = start.rot[0] + (e.clientX - start.x) * 0.4;
    rot[1] = Math.max(-90, Math.min(90, start.rot[1] - (e.clientY - start.y) * 0.4));
    draw(performance.now());
  });
  const stop = () => { dragging = false; holdUntil = performance.now() + 2500; wrap.classList.remove('grabbing'); };
  wrap.addEventListener('pointerup', stop);
  wrap.addEventListener('pointercancel', stop);

  /* zoom with Ctrl + scroll or trackpad pinch (normal scrolling still moves the page) */
  wrap.addEventListener('wheel', (e) => {
    if (!e.ctrlKey) return;
    e.preventDefault();
    zoom = Math.max(0.6, Math.min(2.5, zoom * (e.deltaY > 0 ? 0.92 : 1.08)));
    R = baseR * zoom;
    draw(performance.now());
  }, { passive: false });

  /* keyboard: arrow keys rotate, Home / C jumps to the café */
  wrap.addEventListener('keydown', (e) => {
    if (e.key === 'Home' || e.key.toLowerCase() === 'c') { e.preventDefault(); goToCafe(); return; }
    const step = { ArrowLeft: [-10, 0], ArrowRight: [10, 0], ArrowUp: [0, 8], ArrowDown: [0, -8] }[e.key];
    if (!step) return;
    e.preventDefault();
    tween = null;
    rot[0] += step[0];
    rot[1] = Math.max(-90, Math.min(90, rot[1] + step[1]));
    holdUntil = performance.now() + 2500;
    draw(performance.now());
  });
})();

/* ============ CONTACT FORM (only runs on contact.html) ============
   HOW THE MESSAGE REACHES YOU (pick one, set it below):
   1) endpoint - a form service URL, e.g. Formspree: https://formspree.io/f/xxxxxxx
      (free account at formspree.io, they email you every message)
   2) email    - opens the visitor's email app with the message ready to send to you
   3) leave both empty - the message is only saved inside the visitor's own browser
      (the success message still shows, but YOU will not receive it) */
(() => {
  const CONTACT = {
    endpoint: '',            // e.g. 'https://formspree.io/f/xxxxxxx'
    email: '',               // e.g. 'hello@yourcafe.com'
  };

  const form = document.getElementById('ct-form');
  if (!form) return;

  const done = document.getElementById('ct-done');
  const doneText = document.getElementById('ct-done-text');
  const statusEl = document.getElementById('ct-status');
  const submitBtn = document.getElementById('ct-submit');
  const msg = document.getElementById('ct-message');
  const counter = document.getElementById('ct-count');
  const again = document.getElementById('ct-again');

  const setBad = (el, bad) => el.closest('.fld').classList.toggle('bad', bad);
  const updateCount = () => { counter.textContent = msg.value.length + ' / ' + msg.maxLength; };
  msg.addEventListener('input', () => { updateCount(); setBad(msg, false); });
  form.elements.name.addEventListener('input', (e) => setBad(e.target, false));
  form.elements.email.addEventListener('input', (e) => setBad(e.target, false));
  form.elements.phone.addEventListener('input', (e) => setBad(e.target, false));
  updateCount();

  const saveLocal = (data) => {
    try {
      const key = 'cdk_contact';
      const list = JSON.parse(localStorage.getItem(key) || '[]');
      list.push(data);
      localStorage.setItem(key, JSON.stringify(list.slice(-50)));
    } catch (_) {}
  };

  const deliver = async (data) => {
    saveLocal(data);
    if (CONTACT.endpoint) {
      const res = await fetch(CONTACT.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Request failed');
      return;
    }
    if (CONTACT.email) {
      const body = `Name: ${data.name}\nPhone: ${data.phone || '-'}\nEmail: ${data.email}\nAbout: ${data.topic}\n\n${data.message}`;
      location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent('Message for Caffè di Kash: ' + data.topic)}&body=${encodeURIComponent(body)}`;
    }
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusEl.textContent = '';
    if (form.elements.website.value) return; // honeypot

    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();
    const phone = form.elements.phone.value.trim();
    const text = msg.value.trim();

    const badName = name.length < 2;
    const badEmail = !/^\S+@\S+\.\S+$/.test(email);
    const badPhone = phone !== '' && !/^[+()\d\s-]{7,20}$/.test(phone);
    const badMsg = text.length < 5;
    setBad(form.elements.name, badName);
    setBad(form.elements.email, badEmail);
    setBad(form.elements.phone, badPhone);
    setBad(msg, badMsg);
    if (badName || badEmail || badPhone || badMsg) {
      statusEl.textContent = 'Please fix the highlighted fields.';
      return;
    }

    const data = { name, email, phone, topic: form.elements.topic.value, message: text, sent: new Date().toISOString() };

    submitBtn.disabled = true;
    const label = submitBtn.textContent;
    submitBtn.textContent = 'Sending…';
    try {
      await deliver(data);
      doneText.textContent = `Thank you, ${name.split(' ')[0]}! Your message has been sent successfully. We will get back to you soon.`;
      form.hidden = true;
      done.hidden = false;
      done.focus();
    } catch (_) {
      statusEl.textContent = 'Sorry, something went wrong. Please try again, or call 0313 4004948.';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = label;
    }
  });

  again.addEventListener('click', () => {
    form.reset();
    updateCount();
    form.querySelectorAll('.bad').forEach((f) => f.classList.remove('bad'));
    done.hidden = true;
    form.hidden = false;
    form.elements.name.focus();
  });
})();

/* ============ TESTIMONIALS (only runs on feedback.html) ============
   Add REAL guest quotes here (with their permission). Each one becomes a card.
   Example of one entry:
     { quote: 'Exact words your guest wrote or said.', name: 'First name L.', detail: 'Regular guest', rating: 5 },
   While this list is empty, the page shows a friendly "be the first" card. */
(() => {
  const grid = document.getElementById('tm-grid');
  if (!grid) return;

  const TESTIMONIALS = [
    // { quote: '', name: '', detail: '', rating: 5 },
  ];

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const items = TESTIMONIALS.filter((t) => t && t.quote && t.name);

  if (!items.length) {
    grid.innerHTML = `<article class="glass tm-card tm-empty">
      <p>Guest reviews will appear here. Visited us? Be the first to share your experience in the form above.</p>
      <a class="btn gold" href="#fb-form" onclick="document.getElementById('fb-form')&&document.getElementById('fb-form').scrollIntoView({behavior:'smooth',block:'center'});return false;">Leave feedback</a>
    </article>`;
    return;
  }

  grid.innerHTML = items.map((t) => {
    const r = Math.max(1, Math.min(5, Number(t.rating) || 5));
    return `<article class="glass tm-card">
      <div class="tm-stars" role="img" aria-label="${r} out of 5 stars">${'★'.repeat(r)}<span style="opacity:.25">${'★'.repeat(5 - r)}</span></div>
      <blockquote class="tm-quote">“${esc(t.quote)}”</blockquote>
      <p class="tm-by">${esc(t.name)}${t.detail ? `<small>${esc(t.detail)}</small>` : ''}</p>
    </article>`;
  }).join('');
})();