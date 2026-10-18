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
  header.style.background = scrollY > 20 ? 'rgba(21,10,5,.92)' : '';
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