// Service worker = skript, ki teče ločeno od strani in prestreza zahteve za datoteke.
// Njegova naloga tukaj: shrani datoteke aplikacije, da dela tudi brez interneta.

// Ime predpomnilnika. Ob spremembah incrementaj verzijo
const CACHE = 'aplikacija-v2';

// POZOR: aplikacija je razdeljena na module. 
// Vsak modul je svoja datoteka in mora biti naštet spodaj. 
// Če novo dodane datoteke tukaj ni, ne bo delala brez interneta.
const FILES = [
  './',
  './index.html',
  './manifest.json',

  './css/base.css',
  './css/screen.css',
  './css/tabbar.css',
  './css/training.css',
  './css/weight.css',
  './css/stats.css',

  './js/startup/app.js',
  './js/startup/router.js',
  './js/startup/navigate.js',
  './js/startup/screen_register.js',

  './js/besedilo.js',
  './js/store.js',
  './js/dom.js',
  './js/chart.js',

  './js/screens/training.js',
  './js/screens/weight.js',
  './js/screens/stats.js',

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
