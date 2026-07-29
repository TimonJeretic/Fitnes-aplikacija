// Router ugotovi kateri zaslon prikazati. Naslov je z lojtro (/#/trening)
// ker nimamo strežnika in je tako bolj preprosto. 

import { SCREENS } from './screen_register.js';
export { navigate } from './navigate.js';

// Prvi zaslon v registru je privzeti.
function defaultScreen() {
  return SCREENS[0];
}

// Elementa napolni app.js ob zagonu, da router ne ve nič o zgradbi HTML-a.
let container = null;
let tabs = new Map();   // id zaslona -> gumb
let current = null;     // trenutno prikazani zaslon
let currentSub = '';    // podpot znotraj zaslona, npr. "arhiv"

// Iz "#/statistika/arhiv" naredi { screen: stats, sub: 'arhiv' }.
//
// Prvi kos naslova je zaslon, ostalo dobi zaslon sam v render(). Zakaj tako:
// arhiv treningov je še vedno STATISTIKA (isti gumb spodaj, ista barva), a mora
// imeti svoj naslov, sicer bi sistemski gumb "nazaj" iz arhiva vrgel ven iz
// aplikacije namesto na graf. Zaslon, ki podpoti ne pozna, argument ignorira.
function fromHash() {
  const path = location.hash.replace(/^#\/?/, '');
  const cut = path.indexOf('/');
  const route = cut < 0 ? path : path.slice(0, cut);

  const screen = SCREENS.find((item) => item.route === route);
  if (!screen) return { screen: defaultScreen(), sub: '', known: false };

  return { screen, sub: cut < 0 ? '' : path.slice(cut + 1), known: true };
}

// Prikaže zaslon: zamenja vsebino, barvo in oznako aktivnega gumba.
function show(screen, sub) {
  // Popravek naslova ob zagonu sproži hashchange, ta pa bi zaslon narisal
  // še enkrat. Ta vrstica poskrbi, da se to zgodi samo ob pravi menjavi —
  // pri čemer je menjava podpoti prav tako prava menjava.
  if (screen === current && sub === currentSub) return;
  current = screen;
  currentSub = sub;

  // Barva zaslona pride iz modula zaslona, ne iz CSS-a — zato je nov zaslon
  // ena sama datoteka. CSS potem povsod uporablja samo var(--accent).
  document.body.style.setProperty('--accent', screen.accent);
  document.body.dataset.screen = screen.id;

  container.replaceChildren(screen.render(sub));
  container.scrollTop = 0;

  tabs.forEach((button, id) => {
    const active = id === screen.id;
    button.classList.toggle('is-active', active);
    // Bralnikom zaslona pove, kateri gumb je trenutno odprt.
    if (active) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
}

// Zažene router. `elements.container` je <main>, `elements.tabs` je Map gumbov.
export function start(elements) {
  container = elements.container;
  tabs = elements.tabs;

  window.addEventListener('hashchange', () => {
    const target = fromHash();
    show(target.screen, target.sub);
  });

  // Če je naslov prazen ali nesmiseln, ga popravi na privzetega, da je
  // stanje aplikacije vedno vidno v naslovu. Kadar je zaslon prepoznan, se
  // naslova ne dotikamo — sicer bi popravek pobrisal podpot "/arhiv".
  const target = fromHash();
  if (!target.known) {
    location.replace('#/' + target.screen.route);   // replace: ne zapiše v zgodovino
  }
  show(target.screen, target.sub);
}
