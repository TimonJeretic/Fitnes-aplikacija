// Zaslon: teža in meritve. Oblika modula je razložena v training.js.
//
// Na vrhu je en sam izbirnik: kar je izbrano tam, se vpisuje spodaj IN riše na
// grafu. Namenoma ni dveh iskalnih polj — gledaš graf tiste meritve, ki si jo
// pravkar vpisal.
//
// Privzeta izbira je telesna teža (kg). Vse ostalo so meritve telesa (cm), ki
// nastanejo iz imen, kot jih Timon vpiše — vnaprej pripravljenega seznama ni.
// Podatkov zaslon ne bere sam, ampak jih vpraša js/store.js.

import { TEXT } from '../besedilo.js';
import * as store from '../store.js';
import { aggregate, lineChart } from '../chart.js';
import { ICON_WEIGHT, ICON_TRASH } from '../icons.js';
import { el, button, icon, withLabel, parseNumber, formatNumber, formatDay } from '../dom.js';

const T = TEXT.weight;

// --- Stanje zaslona --------------------------------------------------------
// Kot pri treningu: živi na ravni modula, ker zaslon obstaja enkrat, in se ob
// vsakem vstopu postavi na začetek v render().

let root = null;          // koren zaslona
let selectedId = null;    // null = telesna teža, sicer id meritve
let picking = false;      // ali je izbirnik razprt
let query = '';           // kar je vpisano v iskalno polje izbirnika
let step = 'month';       // obdobje povprečenja: 'week' | 'month' | 'year'
let value = '';           // kar je vpisano v polje za vrednost
let day = '';             // izbran datum, ISO dan
let valueInput = null;    // rabimo ga za opozorilo ob praznem vnosu

// --- Kaj je trenutno izbrano ----------------------------------------------

function selected() {
  if (selectedId === null) return null;

  const measurement = store.getMeasurement(selectedId);
  if (measurement) return measurement;

  selectedId = null;   // meritve ni več; ne pusti zaslona v praznem stanju
  return null;
}

function selectedName() {
  const measurement = selected();
  return measurement ? measurement.name : T.bodyweight;
}

function unit() {
  return selectedId === null ? T.unitWeight : T.unitMeasurement;
}

// Vnosi izbrane serije, najstarejši prvi — v obliki, ki jo razume graf.
function points() {
  if (selectedId === null) {
    return store.getBodyweightEntries().map((entry) => ({
      id: entry.id,
      date: entry.date,
      value: entry.weightKg
    }));
  }

  return store.getMeasurementEntries(selectedId).map((entry) => ({
    id: entry.id,
    date: entry.date,
    value: entry.valueCm
  }));
}

function removeEntry(id) {
  if (selectedId === null) store.removeBodyweight(id);
  else store.removeMeasurementEntry(id);
}

// --- Izris -----------------------------------------------------------------

// Poln ponovni izris. Kliče se samo ob spremembah zgradbe (izbira meritve,
// shranjen ali zbrisan vnos, menjava obdobja). Med tipkanjem se NE kliče, sicer
// bi polje izgubilo kurzor — vpisano živi v `value` in `day`.
function paint() {
  root.replaceChildren(
    brandRow(),
    pickerSection(),
    entrySection(),
    el('div', 'rule'),
    chartSection()
  );
}

// Ikona in naslov, enako kot na zaslonu TRENING — po vrhu zaslona takoj veš,
// kje si, tudi ko aplikacijo odpreš sredi serije.
function brandRow() {
  const row = el('div', 'brand');
  row.append(icon('brand__logo', ICON_WEIGHT));
  row.append(el('h1', 'brand__title', T.heading));
  return row;
}

// --- Izbirnik meritve ------------------------------------------------------

function pickerSection() {
  return picking ? openPicker() : closedPicker();
}

function closedPicker() {
  const bar = button('picked', '', () => {
    picking = true;
    query = '';
    paint();
    // Po izrisu: tipkovnica naj se odpre takoj, brez drugega dotika.
    const field = root.querySelector('.field__input');
    if (field) field.focus();
  });

  bar.append(el('span', 'picked__label', T.picked));
  bar.append(el('span', 'picked__name', selectedName()));
  bar.append(el('span', 'picked__caret', '▾'));
  return bar;
}

function openPicker() {
  const wrap = el('div', 'picker');
  const list = el('div', 'suggest');

  const field = searchField(T.measurementName, () => fillSuggestions(list), () => pickByName(query));

  // Klik mimo zapre iskanje, da vrstica z izbiro spet zasede svoje mesto.
  wrap.append(field, list, button('picker__cancel', T.close, () => {
    picking = false;
    query = '';
    paint();
  }));

  fillSuggestions(list);
  return wrap;
}

// Prva vrstica je telesna teža, potem meritve iz registra, zadnja je vedno
// "+ Nova meritev". Prazno iskanje vrne vse — seznam je uporaben že ob dotiku.
function fillSuggestions(list) {
  const rows = [];

  if (matches(T.bodyweight, query)) {
    rows.push(suggestion(T.bodyweight, store.getBodyweightEntries().length, () => pick(null)));
  }

  for (const measurement of store.searchMeasurements(query)) {
    rows.push(suggestion(
      measurement.name,
      store.getMeasurementEntries(measurement.id).length,
      () => pick(measurement.id)
    ));
  }

  rows.push(button('suggest__item suggest__item--new', T.newMeasurement, () => pickByName(query)));
  list.replaceChildren(...rows);
}

// Telesna teža ni v registru meritev, zato se filtrira tukaj — po istem pravilu
// kot ostala imena: brez ozira na velike črke in šumnike.
function matches(name, query) {
  const needle = store.normalizeName(query);
  return !needle || store.normalizeName(name).includes(needle);
}

// Isto polje kot pri vajah: tipkaš, spodaj se ožijo predlogi, Enter vzame
// vpisano. Med tipkanjem se osveži samo seznam, da kurzor obstane.
function searchField(placeholder, onType, onEnter) {
  const wrap = el('div', 'field');

  const input = el('input', 'field__input');
  input.type = 'text';
  input.placeholder = placeholder;
  input.setAttribute('aria-label', placeholder);
  input.value = query;
  input.autocomplete = 'off';
  input.autocapitalize = 'words';

  input.addEventListener('input', () => {
    query = input.value;
    onType();
  });
  input.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    onEnter();
  });

  wrap.append(input);
  return wrap;
}

function suggestion(name, count, onClick) {
  const row = button('suggest__item', '', onClick);
  row.append(el('span', 'suggest__name', name));
  row.append(el('span', 'suggest__count', String(count)));
  return row;
}

function pick(id) {
  selectedId = id;
  picking = false;
  query = '';
  paint();
}

// Ime, ki se ujema z obstoječo meritvijo, izbere njo — tudi če si ga vpisal do
// konca namesto da bi ga izbral s seznama. Zato "roka" nikoli ne naredi druge
// meritve poleg "Roka".
function pickByName(name) {
  if (!String(name).trim()) return;

  if (store.normalizeName(name) === store.normalizeName(T.bodyweight)) return pick(null);

  const existing = store.findMeasurementByName(name);
  if (existing) return pick(existing.id);

  pick(store.createMeasurement(name).id);
}

// --- Vnos ------------------------------------------------------------------

function entrySection() {
  const wrap = el('div', 'entry');
  const row = el('div', 'entry__row');

  valueInput = el('input', 'entry__value');
  valueInput.type = 'text';          // text + inputMode: številska tipkovnica, brez puščic
  valueInput.inputMode = 'decimal';
  valueInput.value = value;
  valueInput.setAttribute('aria-label', T.value);
  valueInput.addEventListener('input', () => {
    value = valueInput.value;
    valueInput.classList.remove('is-error');
  });

  const dateInput = el('input', 'entry__date');
  dateInput.type = 'date';           // sistemski koledar; daje in jemlje 'YYYY-MM-DD'
  dateInput.value = day;
  dateInput.setAttribute('aria-label', T.date);
  dateInput.addEventListener('input', () => { day = dateInput.value; });

  row.append(valueInput, el('span', 'entry__unit', unit()), dateInput);

  // Shrani stoji sam: to je edino dejanje zgornje polovice zaslona. Pot do
  // starih meritev je spodaj pod grafom, kjer jo tudi iščeš.
  const actions = el('div', 'entry__actions');
  actions.append(button('btn btn--primary entry__save', T.save, save));

  wrap.append(row, actions);
  return wrap;
}

function save() {
  const number = parseNumber(value);
  if (number === null) {
    // Brez vrednosti ni kaj shraniti. Ne javljamo z oknom — rdeč rob in kurzor
    // v polju povesta isto, brez dotika za potrditev.
    valueInput.classList.add('is-error');
    valueInput.focus();
    return;
  }

  if (selectedId === null) store.addBodyweight(number, day);
  else store.addMeasurementEntry(selectedId, number, day);

  // Datum ostane, kot je: če vpisuješ za nazaj, gre naslednji vnos na isti dan.
  value = '';
  paint();
}

// --- Stare meritve ---------------------------------------------------------

// Zgodovina ni na zaslonu, ampak za gumbom: zaslon je s tem vnos in graf,
// popravljanje pa je redko opravilo, ki lahko zasede celo okno.
function openHistory() {
  const overlay = el('div', 'modal');
  const box = el('div', 'modal__box');

  box.append(el('h2', 'modal__title', selectedName()));

  const list = el('div', 'history');
  fillHistory(list);
  box.append(list);

  const close = () => {
    overlay.remove();
    paint();   // graf mora upoštevati, kar si medtem zbrisal
  };

  const actions = el('div', 'modal__actions');
  actions.append(button('btn btn--primary', T.close, close));
  box.append(actions);

  // Klik na temno ozadje zapre okno; klik znotraj okna ne.
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) close();
  });

  overlay.append(box);
  root.append(overlay);
}

// Najnovejši zgoraj: popravljaš skoraj vedno zadnji vnos.
function fillHistory(list) {
  const entries = points().reverse();

  if (!entries.length) {
    list.replaceChildren(el('p', 'modal__hint', T.historyEmpty));
    return;
  }

  const rows = entries.map((entry) => {
    const row = el('div', 'history__row');
    row.append(el('span', 'history__date', formatDay(entry.date)));
    row.append(el('span', 'history__value', formatNumber(entry.value) + ' ' + unit()));

    // Brez potrditve: v seznamu vidiš točno, kaj brišeš, ponoven vpis pa je en dotik.
    const remove = button('history__remove', '', () => {
      removeEntry(entry.id);
      fillHistory(list);
    });
    remove.append(icon('history__icon', ICON_TRASH));
    row.append(withLabel(remove, T.removeEntry));

    return row;
  });

  list.replaceChildren(...rows);
}

// --- Graf ------------------------------------------------------------------

// Graf, pod njim izbira obdobja in pot do starih meritev. Gumbi so pod grafom
// in ne nad njim: gledaš krivuljo, palec pa je itak spodaj.
function chartSection() {
  const wrap = el('div', 'graph');
  wrap.append(el('h2', 'section__title', T.statistics));

  const box = el('div', 'graph__box');
  box.append(lineChart(aggregate(points(), step), {
    unit: unit(),
    step,
    empty: T.noData
  }));
  wrap.append(box);

  const steps = el('div', 'steps');
  steps.append(stepButton('week', T.week));
  steps.append(stepButton('month', T.month));
  steps.append(stepButton('year', T.year));
  wrap.append(steps);

  wrap.append(button('btn btn--ghost', T.history, openHistory));
  return wrap;
}

function stepButton(name, label) {
  const node = button('steps__button', label, () => {
    step = name;
    paint();
  });
  if (step === name) node.classList.add('is-active');
  return node;
}

// --- Modul zaslona ---------------------------------------------------------

export default {
  id: 'weight',
  route: 'teza',                  // v naslovu ni šumnikov, zato "teza"
  icon: ICON_WEIGHT,
  title: TEXT.screens.weight,
  accent: '#9d0f0b',

  // Router vsakič pokliče to funkcijo na novo, zato se stanje zaslona tukaj
  // postavi na začetek. Zaslon nima ničesar, kar bi bilo vredno zapomniti med
  // obiski: vsak obisk se začne pri telesni teži in današnjem datumu.
  render() {
    selectedId = null;
    picking = false;
    query = '';
    step = 'month';
    value = '';
    day = store.todayIso();       // datum je prednastavljen, a ga lahko popraviš
    valueInput = null;

    root = el('div', 'weight');
    paint();
    return root;
  }
};
