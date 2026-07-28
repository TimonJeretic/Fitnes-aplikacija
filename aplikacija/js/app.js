// Zagon aplikacije: zgradi spodnjo vrstico gumbov, prižge router
// in registrira service worker.

import { SCREENS } from './screens/register.js';
import { start, navigate } from './router.js';

const container = document.getElementById('screen');
const tabbar = document.getElementById('tabbar');

// --- Spodnja vrstica gumbov ------------------------------------------------
// Gumbi se naredijo iz registra zaslonov, ne iz HTML-a. Zato dodajanje zaslona
// ne zahteva urejanja index.html — pet zaslonov pomeni pet gumbov, samodejno.
const tabs = new Map();

for (const screen of SCREENS) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'tabbar__button';
  button.textContent = screen.tab;          // na gumbu je samo črka

  // Na gumbu piše samo črka, zato polno ime povemo posebej:
  // aria-label za bralnike zaslona, title za namig na računalniku.
  button.setAttribute('aria-label', screen.title);
  button.title = screen.title;

  button.addEventListener('click', () => navigate(screen.route));

  tabs.set(screen.id, button);
  tabbar.append(button);
}

// --- Router ----------------------------------------------------------------
start({ container, tabs });

// --- Service worker --------------------------------------------------------
// Registracija uspe samo na HTTPS ali localhost. Če datoteko odpreš
// neposredno (file://), se tiho preskoči — takrat pa tudi ES moduli ne delajo,
// zato aplikacijo vedno poganjaj prek strežnika.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
