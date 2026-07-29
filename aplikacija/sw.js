// Service worker = skript, ki teče ločeno od strani in prestreza zahteve za datoteke.
// Njegova naloga tukaj: shrani datoteke aplikacije, da dela tudi brez interneta.

// Ime predpomnilnika. Ob spremembah incrementaj verzijo
const CACHE = 'aplikacija-v6';

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
  './media/fitnes_aplikacija_start_PC.mp4'
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
  event.respondWith(
    caches.match(event.request).then((hit) => hit || fetch(event.request))
  );
});
