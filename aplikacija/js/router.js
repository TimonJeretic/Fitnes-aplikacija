// Router = del, ki iz naslova ugotovi, kateri zaslon prikazati.
//
// Uporabljava naslov z lojtro (#/trening) in ne prave poti (/trening), ker za
// prave poti rabiš strežnik, ki vsako pot vrne na index.html. GitHub Pages tega
// ne zna, midva pa nimava strežnika. Z lojtro dobiva zastonj dvoje:
//   - sistemski gumb "nazaj" deluje,
//   - če aplikacijo osvežiš, ostaneš na istem zaslonu.

import { SCREENS } from './screens/register.js';

// Prvi zaslon v registru je privzeti.
const DEFAULT_SCREEN = SCREENS[0];

// Elementa napolni app.js ob zagonu, da router ne ve nič o zgradbi HTML-a.
let container = null;
let tabs = new Map();   // id zaslona -> gumb
let current = null;     // trenutno prikazani zaslon

// Iz "#/teza" naredi "teza". Nepoznan ali prazen naslov vrne privzeti zaslon.
function screenFromHash() {
  const route = location.hash.replace(/^#\/?/, '');
  return SCREENS.find((screen) => screen.route === route) || DEFAULT_SCREEN;
}

// Prikaže zaslon: zamenja vsebino, barvo in oznako aktivnega gumba.
function show(screen) {
  // Popravek naslova ob zagonu sproži hashchange, ta pa bi zaslon narisal
  // še enkrat. Ta vrstica poskrbi, da se to zgodi samo ob pravi menjavi.
  if (screen === current) return;
  current = screen;

  // Barva zaslona pride iz modula zaslona, ne iz CSS-a — zato je nov zaslon
  // ena sama datoteka. CSS potem povsod uporablja samo var(--accent).
  document.body.style.setProperty('--accent', screen.accent);
  document.body.dataset.screen = screen.id;

  container.replaceChildren(screen.render());
  container.scrollTop = 0;

  tabs.forEach((button, id) => {
    const active = id === screen.id;
    button.classList.toggle('is-active', active);
    // Bralnikom zaslona pove, kateri gumb je trenutno odprt.
    if (active) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
}

// Klic iz gumba. Samo spremeni naslov — za prikaz poskrbi poslušalec spodaj,
// tako da je pot do zaslona ena sama, ne glede na to, ali si kliknil gumb
// ali vpisal naslov na roko.
export function navigate(route) {
  const target = '#/' + route;
  if (location.hash === target) return;
  location.hash = target;
}

// Zažene router. `elements.container` je <main>, `elements.tabs` je Map gumbov.
export function start(elements) {
  container = elements.container;
  tabs = elements.tabs;

  window.addEventListener('hashchange', () => show(screenFromHash()));

  // Če je naslov prazen ali nesmiseln, ga popravi na privzetega, da je
  // stanje aplikacije vedno vidno v naslovu.
  const screen = screenFromHash();
  if (location.hash !== '#/' + screen.route) {
    location.replace('#/' + screen.route);   // replace: ne zapiše v zgodovino
  }
  show(screen);
}
