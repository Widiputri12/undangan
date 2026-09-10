const hero = document.querySelector('.hero');
const openButton = document.querySelector('#openInvitation');
const musicToggle = document.querySelector('#musicToggle');
const backgroundMusic = document.querySelector('#backgroundMusic');
const storySection = document.querySelector('#story');
const leftDoor = document.querySelector('.gate-door-left');
const rightDoor = document.querySelector('.gate-door-right');
let musicOn = false;
let invitationOpened = false;

window.scrollTo(0, 0);
const preventLockedScroll = (event) => {
  if (!invitationOpened) event.preventDefault();
};
window.addEventListener('wheel', preventLockedScroll, { passive: false });
window.addEventListener('touchmove', preventLockedScroll, { passive: false });
window.addEventListener('keydown', (event) => {
  if (!invitationOpened && ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) {
    event.preventDefault();
  }
});

async function startAmbientMusic() {
  try {
    await backgroundMusic.play();
  } catch {
    musicToggle.classList.add('is-muted');
    return;
  }
  musicOn = true;
  musicToggle.classList.remove('is-muted');
  musicToggle.setAttribute('aria-label', 'Matikan musik');
  musicToggle.title = 'Musik on';
}

function stopAmbientMusic() {
  musicOn = false;
  backgroundMusic.pause();
  musicToggle.classList.add('is-muted');
  musicToggle.setAttribute('aria-label', 'Nyalakan musik');
  musicToggle.title = 'Musik off';
}

openButton.addEventListener('click', () => {
  let scrollStarted = false;
  const beginScroll = () => {
    if (scrollStarted) return;
    scrollStarted = true;
    hero.classList.remove('door-opening');
    hero.classList.add('door-fixed');
    leftDoor.classList.add('is-open');
    rightDoor.classList.add('is-open');
    leftDoor.style.animation = 'none';
    rightDoor.style.animation = 'none';
    leftDoor.style.transform = 'rotateY(-105deg)';
    rightDoor.style.transform = 'rotateY(105deg)';
    invitationOpened = true;
    document.body.classList.remove('is-locked');
    window.requestAnimationFrame(() => storySection.scrollIntoView({ behavior: 'smooth' }));
  };

  hero.classList.add('opened', 'door-opening');
  window.setTimeout(beginScroll, 2050);
  openButton.innerHTML = '<span>Selamat datang</span><i aria-hidden="true">✓</i>';
  openButton.disabled = true;
  startAmbientMusic();
});

musicToggle.addEventListener('click', () => {
  if (musicOn) stopAmbientMusic();
  else startAmbientMusic();
});

const targetDate = new Date('2026-10-05T00:00:00+07:00').getTime();
function updateCountdown() {
  const distance = targetDate - Date.now();
  const values = distance > 0 ? {
    days: Math.floor(distance / 86400000),
    hours: Math.floor(distance / 3600000) % 24,
    minutes: Math.floor(distance / 60000) % 60,
    seconds: Math.floor(distance / 1000) % 60,
  } : { days: 0, hours: 0, minutes: 0, seconds: 0 };
  Object.entries(values).forEach(([key, value]) => {
    document.querySelector(`#${key}`).textContent = String(value).padStart(2, '0');
  });
}
updateCountdown();
window.setInterval(updateCountdown, 1000);

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.14 });
document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

const wishForm = document.querySelector('#wishForm');
const wishFeed = document.querySelector('#wishFeed');
const wishStatus = document.querySelector('#wishStatus');
const wishSubmit = wishForm.querySelector('button[type="submit"]');

function renderWish(wish, shouldScroll = false) {
  const item = document.createElement('article');
  item.className = 'wish-item';
  item.innerHTML = `<span class="wish-mark">“</span><p></p><strong></strong>`;
  item.querySelector('p').textContent = wish.message;
  item.querySelector('strong').textContent = wish.name;
  wishFeed.prepend(item);
  if (shouldScroll) wishFeed.scrollTo({ left: 0, behavior: 'smooth' });
}

async function loadWishes() {
  try {
    const response = await fetch('api.php');
    if (!response.ok) throw new Error('Gagal memuat ucapan');
    const wishes = await response.json();
    wishes.reverse().forEach((wish) => renderWish(wish));
  } catch {
    wishStatus.textContent = 'Ucapan belum dapat dimuat. Pastikan MySQL Laragon aktif.';
  }
}

wishForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const name = document.querySelector('#wishName').value.trim();
  const message = document.querySelector('#wishMessage').value.trim();
  if (!name || !message) return;
  wishSubmit.disabled = true;
  wishStatus.textContent = 'Menyimpan ucapan...';
  try {
    const response = await fetch('api.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, message }),
    });
    const wish = await response.json();
    if (!response.ok) throw new Error(wish.error || 'Gagal menyimpan ucapan');
    renderWish(wish, true);
    wishForm.reset();
    wishStatus.textContent = 'Ucapan berhasil disimpan.';
  } catch {
    wishStatus.textContent = 'Ucapan belum tersimpan. Pastikan MySQL Laragon aktif.';
  } finally {
    wishSubmit.disabled = false;
  }
});

loadWishes();

document.querySelector('#copyAccount').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText('320701006394505');
    document.querySelector('#copyLabel').textContent = 'Berhasil Disalin';
  } catch {
    document.querySelector('#copyLabel').textContent = '320701006394505';
  }
  window.setTimeout(() => { document.querySelector('#copyLabel').textContent = 'Salin No. Rekening'; }, 2200);
});

const params = new URLSearchParams(window.location.search);
const guest = params.get('to');
if (guest) document.querySelector('#guestName').textContent = guest.replace(/[<>]/g, '');
