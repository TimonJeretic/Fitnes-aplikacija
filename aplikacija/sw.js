// Service worker = skript, ki teče ločeno od strani in prestreza zahteve za datoteke.
// Njegova naloga tukaj: shrani datoteke aplikacije, da dela tudi brez interneta.

// Ime predpomnilnika. Ko spremeniš kodo, POVEČAJ številko (v2, v3, ...),
// sicer bo brskalnik trmasto serviral staro različico. To je najpogostejša past.
const CACHE = 'aplikacija-v1';

// POZOR: aplikacija je razdeljena na module. Vsak modul je svoja datoteka in
// mora biti naštet spodaj. Če dodaš nov zaslon (js/screens/nekaj.js) in ga tukaj
// pozabiš, se stran z internetom odpre normalno, brez interneta pa se sesuje —
// napako opaziš šele v telovadnici brez signala.
const FILES = [
  './',
  './index.html',
  './manifest.json',

  './css/base.css',
  './css/screen.css',
  './css/tabbar.css',

  './js/app.js',
  './js/router.js',
  './js/ui.js',
  './js/screens/register.js',
  './js/screens/training.js',
  './js/screens/weight.js',
  './js/screens/stats.js',
  './js/screens/account.js',

  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png'
];

// 1. Namestitev: prenesi in shrani vse datoteke aplikacije.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(FILES))
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
