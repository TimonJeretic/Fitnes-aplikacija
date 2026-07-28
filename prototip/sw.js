// Service worker = skript, ki tece loceno od strani in prestreza zahteve za datoteke.
// Njegova naloga tukaj: shrani datoteke aplikacije, da dela tudi brez interneta.

// Ime predpomnilnika. Ko spremenis kodo, POVECAJ stevilko (v2, v3, ...),
// sicer bo brskalnik trmasto serviral staro razlicico.
const CACHE = 'prototip-v1';

const DATOTEKE = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// 1. Namestitev: prenesi in shrani vse datoteke aplikacije.
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(DATOTEKE))
  );
  self.skipWaiting();
});

// 2. Aktivacija: pobrisi predpomnilnike starih razlicic.
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((kljuci) =>
      Promise.all(kljuci.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 3. Vsaka zahteva: najprej poglej v predpomnilnik, sele nato na internet.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((zadetek) => zadetek || fetch(e.request))
  );
});
