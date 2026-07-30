// Spustni seznam (dropdown), ki se odpre čez cel zaslon: izbira meritve na zaslonu
// TEŽA in izbira vaje na zaslonu STATISTIKA.
//
// Zakaj čez cel zaslon in ne seznam pod gumbom: seznam pod gumbom bi na telefonu
// odrinil vsebino pod sabo in bi se ga dalo prehitro zgrešiti s palcem. Tukaj je
// ozadje zabrisano, zato je jasno, da nič drugega ta trenutek ne dela.
//
// Modul ne ve, kaj so meritve in kaj vaje — dobi seznam in dve povratni funkciji.
// Zato je isti spustni seznam na obeh zaslonih in se popravlja na enem mestu.

import { el, button, icon } from './dom.js';

// config = {
//   title,               napis na vrhu
//   items,               [{ id, name, count, active, swatch, swatchIcon }]
//   onPick(id),          klic ob izbiri
//   closeLabel,          napis gumba za zapiranje
//   emptyLabel,          napis, kadar je seznam prazen
//   search               neobvezno: { placeholder, find(query), newLabel, onNew(name) }
//   create               neobvezno: { title, placeholder, choices, confirmLabel, onCreate(name, choice) }
// }
// `choices` je [{ value, label }] — npr. enota meritve. Prva je privzeta.
//
// `search.find(query)` vrne seznam v isti obliki kot `items`. Iskanje je torej
// stvar klicatelja (do podatkov gre samo store.js), seznam zna samo tipkanje
// prenesti naprej in izrisati, kar dobi nazaj.
export function openSheet(config) {
  const overlay = el('div', 'sheet-overlay');
  const sheet = el('div', 'sheet');

  const close = () => overlay.remove();

  sheet.append(el('h2', 'sheet__title', config.title));

  const list = el('div', 'sheet__list');

  // Kaj je v seznamu, se med tipkanjem menja, zato je izris svoja funkcija.
  const fill = (query) => {
    const items = config.search ? config.search.find(query) : config.items;
    const rows = items.map((item) => itemRow(item, close, config.onPick));

    // Vpisano ime, ki ga v seznamu ni: zadnja vrstica ga naredi. Novi vpis in
    // iskanje sta s tem eno polje — v telovadnici en korak manj.
    const typed = String(query).trim();
    if (config.search && config.search.onNew && typed && !hasName(items, typed)) {
      rows.push(newRow(config.search.newLabel + typed, close, () => config.search.onNew(typed)));
    }

    if (rows.length) list.replaceChildren(...rows);
    else list.replaceChildren(el('p', 'sheet__empty', config.emptyLabel || ''));
  };

  // Polje se lepi na vrh seznama: pri dolgem registru popravek iskanja ne sme
  // zahtevati drsenja nazaj gor. Kurzorja vanj namenoma NE postavljamo —
  // tipkovnica bi pokrila seznam, izbira s seznama pa je pogostejša od tipkanja.
  if (config.search) sheet.append(searchRow(config.search.placeholder, fill));

  fill('');
  sheet.append(list);

  if (config.create) sheet.append(createBlock(config.create, close));

  sheet.append(button('picker__cancel', config.closeLabel, close));

  // Klik na zabrisano ozadje zapre seznam; klik znotraj njega ne.
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) close();
  });

  overlay.append(sheet);
  // Na <body> in ne v zaslon: seznam prekrije tudi spodnjo vrstico z gumbi, da se
  // med izbiranjem ne da po nesreči zamenjati zaslona.
  document.body.append(overlay);

  return overlay;
}

// Iskalno polje na vrhu seznama. Vrne se cela vrstica, da ima lepljivo polje
// svojo podlago in seznam pod njim ne prosevaja.
function searchRow(placeholder, onType) {
  const wrap = el('div', 'sheet__search');

  const input = el('input', 'field__input');
  input.type = 'text';
  input.placeholder = placeholder;
  input.setAttribute('aria-label', placeholder);
  input.autocomplete = 'off';
  input.autocapitalize = 'words';

  input.addEventListener('input', () => onType(input.value));
  // Enter ne sme oddati obrazca; seznam se osvezi ze ob tipkanju.
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') event.preventDefault();
  });

  wrap.append(input);
  return wrap;
}

// Ali je vpisano ime v seznamu že. Primerjava je groba (velike črke, robni
// presledki); šumnike prepusti klicatelju, ki edini ve, kako svoja imena
// primerja — dvojnika iz tega ne more nastati, ker `onNew` obstoječe vrne nazaj.
function hasName(items, typed) {
  const needle = typed.toLowerCase();
  return items.some((item) => String(item.name).trim().toLowerCase() === needle);
}

// Zadnja vrstica seznama: naredi vpisano ime. Prekinjena obroba jo loči od
// vrstic, ki že obstajajo.
function newRow(label, close, onNew) {
  return button('sheet__item sheet__item--new', label, () => {
    close();
    onNew();
  });
}

function itemRow(item, close, onPick) {
  const row = button('sheet__item', '', () => {
    close();
    onPick(item.id);
  });

  // Kvadratek pred imenom (elastike). `swatch` je ime razreda, ker so barve v
  // CSS — seznam sam ne ve, katere obstajajo. `swatchIcon` je risba v njem;
  // brez nje ostane kvadratek prazen in barvo pokaže sam.
  if (item.swatch) {
    row.append(item.swatchIcon
      ? icon('sheet__swatch ' + item.swatch, item.swatchIcon)
      : el('span', 'sheet__swatch ' + item.swatch));
  }

  row.append(el('span', 'sheet__name', item.name));
  if (item.count !== null && item.count !== undefined) {
    row.append(el('span', 'sheet__count', String(item.count)));
  }
  // Katera vrstica je izbrana, piše na gumbu, s katerega se seznam odpre —
  // v seznamu samem bi bila obroba druga "izbrano" poleg izbire enote.
  if (item.active) row.setAttribute('aria-current', 'true');

  return row;
}

// Spodnji del seznama: črta, krepek naslov, polje za ime, izbira enote in Potrdi.
// Ista postavitev kot "Ustvari nov trening" na zaslonu TRENING — kar se dela z
// istimi koraki, naj tudi izgleda enako.
function createBlock(create, close) {
  const wrap = el('div', 'sheet__create');
  wrap.append(el('div', 'rule'));
  wrap.append(el('h3', 'section__title', create.title));

  const input = el('input', 'field__input');
  input.type = 'text';
  input.placeholder = create.placeholder;
  input.setAttribute('aria-label', create.placeholder);
  input.autocomplete = 'off';
  input.autocapitalize = 'words';
  wrap.append(input);

  // Izbira enote. Prva možnost je privzeta, da se da meritev narediti brez dotika
  // te vrstice.
  let choice = create.choices && create.choices.length ? create.choices[0].value : null;

  if (create.choices && create.choices.length) {
    const row = el('div', 'choice');
    const buttons = create.choices.map((option) => {
      const node = button('choice__button', option.label, () => {
        choice = option.value;
        buttons.forEach((other) => other.classList.toggle('is-active', other === node));
      });
      if (option.value === choice) node.classList.add('is-active');
      row.append(node);
      return node;
    });
    wrap.append(row);
  }

  const confirm = () => {
    const name = input.value.trim();
    if (!name) {
      // Brez imena ni česa narediti; rdeč rob pove isto kot okno s sporočilom.
      input.classList.add('is-error');
      input.focus();
      return;
    }
    close();
    create.onCreate(name, choice);
  };

  input.addEventListener('input', () => input.classList.remove('is-error'));
  input.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    confirm();
  });

  wrap.append(button('btn btn--primary', create.confirmLabel, confirm));
  return wrap;
}
