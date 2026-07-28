// Service worker = skript, ki teče ločeno od strani in prestreza zahteve za datoteke.
// Njegova naloga tukaj: shrani datoteke aplikacije, da dela tudi brez interneta.

// Ime predpomnilnika. Ko spremeniš kodo, POVEČAJ številko (v2, v3, ...),
// sicer bo brskalnik trmasto serviral staro različico.
const CACHE = 'prototip-v2';

const FILES = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
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
