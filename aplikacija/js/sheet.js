// Spustni seznam (dropdown), ki se odpre čez cel zaslon: izbira meritve na zaslonu
// TEŽA in izbira vaje na zaslonu STATISTIKA.
//
// Zakaj čez cel zaslon in ne seznam pod gumbom: seznam pod gumbom bi na telefonu
// odrinil vsebino pod sabo in bi se ga dalo prehitro zgrešiti s palcem. Tukaj je
// ozadje zabrisano, zato je jasno, da nič drugega ta trenutek ne dela.
//
// Modul ne ve, kaj so meritve in kaj vaje — dobi seznam in dve povratni funkciji.
// Zato je isti spustni seznam na obeh zaslonih in se popravlja na enem mestu.

import { el, button } from './dom.js';

// config = {
//   title,               napis na vrhu
//   items,               [{ id, name, count, active, swatch }]
//   onPick(id),          klic ob izbiri
//   closeLabel,          napis gumba za zapiranje
//   emptyLabel,          napis, kadar je seznam prazen
//   create               neobvezno: { title, placeholder, choices, confirmLabel, onCreate(name, choice) }
// }
// `choices` je [{ value, label }] — npr. enota meritve. Prva je privzeta.
export function openSheet(config) {
  const overlay = el('div', 'sheet-overlay');
  const sheet = el('div', 'sheet');

  const close = () => overlay.remove();

  sheet.append(el('h2', 'sheet__title', config.title));

  const list = el('div', 'sheet__list');
  if (config.items.length) {
    config.items.forEach((item) => list.append(itemRow(item, close, config.onPick)));
  } else if (config.emptyLabel) {
    list.append(el('p', 'sheet__empty', config.emptyLabel));
  }
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

function itemRow(item, close, onPick) {
  const row = button('sheet__item', '', () => {
    close();
    onPick(item.id);
  });

  // Barvni kvadratek pred imenom (elastike pri zgibih). `swatch` je ime razreda,
  // ker so barve v CSS — seznam sam ne ve, katere barve obstajajo.
  if (item.swatch) row.append(el('span', 'sheet__swatch ' + item.swatch));

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
