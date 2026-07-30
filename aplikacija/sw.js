// Service worker = skript, ki teče ločeno od strani in prestreza zahteve za datoteke.
// Njegova naloga tukaj: shrani datoteke aplikacije, da dela tudi brez interneta.

// Ime predpomnilnika. Ob spremembah incrementaj verzijo
const CACHE = 'aplikacija-v9';

// POZOR: aplikacija je razdeljena na module. 
// Vsak modul je svoja datoteka in mora biti naštet spodaj. 
// Če novo dodane datoteke tukaj ni, ne bo delala brez interneta.
const FILES = [
  './',
  './index.html',
  './manifest.json',

  './css/base.css',
  './css/splash.css',
  './css/screen.css',
  './css/tabbar.css',
  './css/training.css',
  './css/weight.css',
  './css/stats.css',
  './css/settings.css',

  './js/startup/app.js',
  './js/startup/router.js',
  './js/startup/navigate.js',
  './js/startup/screen_register.js',
  './js/startup/splash.js',

  './js/besedilo.js',
  './js/store.js',
  './js/dom.js',
  './js/chart.js',
  './js/icons.js',
  './js/sheet.js',
  './js/backup.js',
  './js/settings.js',

  './js/screens/training.js',
  './js/screens/weight.js',
  './js/screens/stats.js',

  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png'
];

// Datoteke, ki so lepe, a ne nujne: uvodna animacija. Ločene so od seznama zgoraj
// zato, ker `cache.addAll()` pade v celoti, če ena sama datoteka manjka — in
// aplikacija bi brez interneta nehala delati samo zato, ker posnetka še ni.
const OPTIONAL = [
  './media/fitnes_aplikacija_start_mobile.mp4',
  './media/fitnes_aplikacija_start_PC.mp4',
  './media/intro-poster.jpg'
];

// 1. Namestitev: prenesi in shrani vse datoteke aplikacije.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll(FILES).then(() =>
        // Vsaka posebej in brez jeze, če je ni: manjkajoča animacija ne sme
        // podreti namestitve.
        Promise.all(OPTIONAL.map((file) => cache.add(file).catch(() => {})))
      )
    )
  );
  self.skipWaiting();
});

// 2. Aktivacija: pobriši predpomnilnike starih različic.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

// 3. Vsaka zahteva: najprej poglej v predpomnilnik, šele nato na internet.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Posnetka ne zahteva brskalnik v celoti, ampak po kosih (glava `Range`).
  // Safari na iPhonu vztraja, da mu na tako zahtevo odgovorimo z delnim
  // odgovorom (206). Če mu vrnemo cel posnetek (200), predvajanje odpove —
  // in prav to se je dogajalo: zastor je za trenutek pogledal ven in izginil.
  if (event.request.headers.has('range')) {
    event.respondWith(partial(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((hit) => hit || fetch(event.request))
  );
});

// Iz shranjenega posnetka izreži zahtevani kos in ga vrni kot 206.
async function partial(request) {
  const hit = await caches.match(request);
  const asked = /^bytes=(\d+)-(\d*)$/.exec(request.headers.get('range') || '');

  // Brez shranjene datoteke ali pri nenavadni obliki zahteve pusti brskalnik,
  // da si pomaga sam prek interneta.
  if (!hit || !asked) return fetch(request);

  const whole = await hit.arrayBuffer();
  const from = Number(asked[1]);
  const to = asked[2] ? Math.min(Number(asked[2]), whole.byteLength - 1) : whole.byteLength - 1;

  if (from >= whole.byteLength) return fetch(request);

  const piece = whole.slice(from, to + 1);
  return new Response(piece, {
    status: 206,
    statusText: 'Partial Content',
    headers: {
      'Content-Type': hit.headers.get('Content-Type') || 'application/octet-stream',
      'Content-Length': String(piece.byteLength),
      'Content-Range': `bytes ${from}-${to}/${whole.byteLength}`
    }
  });
}
