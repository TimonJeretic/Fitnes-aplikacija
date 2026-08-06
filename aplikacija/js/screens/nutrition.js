// Zaslon: prehrana.
//
// Zgrajen po istem kalupu kot TEŽA: vnos na vrhu, graf spodaj, vmes številke, ki
// jih izračuna store. Zaslon sam ne računa ničesar — maintenance in povprečja
// pridejo gotova iz js/store.js, ker so podatki tam.
//
// Štirje razdelki od zgoraj navzdol:
//   1. kaj si danes zaužil (kalorije in proteini)
//   2. vnos obroka in koš za cel današnji dan
//   3. maintenance in povprečen vnos zadnjega tedna
//   4. graf teže in kalorij hkrati, vsaka na svoji osi

import { TEXT } from '../besedilo.js';
import * as store from '../store.js';
import { settingsButton } from '../settings.js';
import { aggregate, lineChart } from '../chart.js';
import { ICON_NUTRITION, ICON_TRASH } from '../icons.js';
import { el, button, icon, withLabel, parseNumber, formatRounded } from '../dom.js';

const T = TEXT.nutrition;

let root = null;         // koren zaslona
let kcal = '';           // kar je vpisano v polju za kalorije
let protein = '';        // kar je vpisano v polju za proteine
let kcalInput = null;    // rabimo ga za opozorilo ob praznem vnosu
let showWeight = true;   // kljukica: teža na grafu
let showCalories = true; // kljukica: kalorije na grafu
let step = 'day';        // obdobje povprečenja: 'day' | 'month' | 'year'

// Kalorije so lahko štirimestne, zato limitNumber() iz dom.js (tri števke, ena
// decimalka) tukaj ne gre. Obrok pa nima desetink — 512,4 kcal nihče ne ve.
function onlyDigits(text, max) {
  return String(text).replace(/[^0-9]/g, '').slice(0, max);
}

// --- Izris -----------------------------------------------------------------

// Poln ponovni izris. Med tipkanjem se NE kliče, sicer bi polje izgubilo kurzor —
// vpisano živi v `kcal` in `protein`.
function paint() {
  root.replaceChildren(
    brandRow(),
    todaySection(),
    entrySection(),
    summarySection(),
    el('div', 'rule'),
    chartSection()
  );
}

function brandRow() {
  const row = el('div', 'brand');
  row.append(icon('brand__logo', ICON_NUTRITION));
  row.append(el('h1', 'brand__title', T.heading));
  row.append(settingsButton());
  return row;
}

// --- 1. Danes zaužito ------------------------------------------------------

function todaySection() {
  const today = store.dayNutrition(store.todayIso());

  const row = el('div', 'today');
  row.append(el('span', 'today__label', T.today));
  row.append(tile(formatRounded(today.kcal, 0), T.kcalUnit));

  // Črtica in ne ničla: noben obrok danes nima vpisanih proteinov ni isto kot
  // "pojedel si nič proteinov".
  const proteinText = today.proteinG === null ? T.empty : formatRounded(today.proteinG, 0);
  row.append(tile(proteinText, T.proteinUnit));

  return row;
}

function tile(value, unit) {
  const box = el('div', 'today__tile');
  box.append(el('span', 'today__value', value));
  box.append(el('span', 'today__unit', unit));
  return box;
}

// --- 2. Vnos obroka --------------------------------------------------------

function entrySection() {
  const wrap = el('div', 'meal');
  const row = el('div', 'meal__row');

  kcalInput = numberField(T.kcal, kcal, 5, (value) => { kcal = value; });
  row.append(kcalInput);
  row.append(numberField(T.protein, protein, 3, (value) => { protein = value; }));

  row.append(button('btn btn--primary meal__add', T.add, addMeal));

  // Koš stoji ob vnosu, ker se zmota opazi takoj po njem. Briše cel dan, zato
  // gre — za razliko od koša pri posameznem vnosu na zaslonu TEŽA — čez potrditev.
  const clear = button('meal__clear', '', clearToday);
  clear.append(icon('meal__icon', ICON_TRASH));
  row.append(withLabel(clear, T.clearToday));

  wrap.append(row);
  return wrap;
}

function numberField(label, value, maxDigits, onInput) {
  const field = el('input', 'meal__value');
  field.type = 'text';          // text + inputMode: številska tipkovnica, brez puščic
  field.inputMode = 'numeric';
  field.value = value;
  field.placeholder = label;
  field.setAttribute('aria-label', label);

  field.addEventListener('input', () => {
    field.value = onlyDigits(field.value, maxDigits);
    field.classList.remove('is-error');
    onInput(field.value);
  });

  return field;
}

function addMeal() {
  const energy = parseNumber(kcal);
  if (energy === null) {
    // Brez kalorij ni obroka. Rdeč rob in kurzor povesta isto kot okno, brez dotika.
    kcalInput.classList.add('is-error');
    kcalInput.focus();
    return;
  }

  store.addMeal(energy, parseNumber(protein), store.todayIso());

  kcal = '';
  protein = '';
  paint();
}

function clearToday() {
  if (!store.dayNutrition(store.todayIso()).count) return;
  if (!confirm(T.clearTodayConfirm)) return;

  store.removeMealsOn(store.todayIso());
  paint();
}

// --- 3. Maintenance in povprečje -------------------------------------------

function summarySection() {
  const summary = store.nutritionSummary();

  const row = el('div', 'summary');
  row.append(summaryCard(
    T.maintenance,
    summary.maintenance === null ? null : formatRounded(summary.maintenance, 0),
    summary.reason ? T[summary.reason] : ''
  ));
  row.append(summaryCard(
    T.average,
    summary.avgIntake === null ? null : formatRounded(summary.avgIntake, 0),
    summary.avgIntake === null ? T.noMeals : ''
  ));
  return row;
}

// Kadar številke ni, na njenem mestu piše, kaj je treba narediti, da se pojavi.
// Prazno polje bi izgledalo kot napaka aplikacije.
function summaryCard(label, value, reason) {
  const card = el('div', 'summary__card');
  card.append(el('span', 'summary__label', label));

  if (value === null) {
    card.append(el('span', 'summary__reason', reason));
    return card;
  }

  const line = el('div', 'summary__line');
  line.append(el('span', 'summary__value', value));
  line.append(el('span', 'summary__unit', T.kcalUnit));
  card.append(line);
  return card;
}

// --- 4. Graf ---------------------------------------------------------------

function weightPoints() {
  return store.getBodyweightEntries().map((entry) => ({
    date: entry.date,
    value: entry.weightKg
  }));
}

function chartSection() {
  const wrap = el('div', 'graph');
  wrap.append(el('h2', 'section__title', T.chart));

  const toggles = el('div', 'series');
  toggles.append(seriesToggle(T.showWeight, showWeight, 'series__box--weight', (on) => {
    showWeight = on;
  }));
  toggles.append(seriesToggle(T.showCalories, showCalories, 'series__box--calories', (on) => {
    showCalories = on;
  }));
  wrap.append(toggles);

  const box = el('div', 'graph__box');
  box.append(chart());
  wrap.append(box);

  const steps = el('div', 'steps');
  steps.append(stepButton('day', T.day));
  steps.append(stepButton('month', T.month));
  steps.append(stepButton('year', T.year));
  wrap.append(steps);

  return wrap;
}

// Teža gre na levo os, kalorije na desno. Razmerje med osema je zaklenjeno v
// js/chart.js (AXIS_RATIO), zato bližina obeh črt nekaj pomeni.
function chart() {
  if (!showWeight && !showCalories) {
    const message = el('div', 'chart__empty', T.nothingPicked);
    return message;
  }

  const weight = showWeight ? aggregate(weightPoints(), step) : [];
  const calories = showCalories ? aggregate(store.nutritionSeries(), step) : [];

  // Same kalorije: gredo na levo os (druge ni), a v svoji barvi — to pove `alt`.
  if (!weight.length && calories.length) {
    return lineChart(calories, {
      unit: T.kcalUnit,
      decimals: 0,
      alt: true,
      step,
      empty: T.noData
    });
  }

  return lineChart(weight, {
    unit: T.weightUnit,
    decimals: 1,
    step,
    empty: T.noData,
    second: calories.length ? { points: calories, unit: T.kcalUnit, decimals: 0 } : null
  });
}

function stepButton(name, label) {
  const node = button('steps__button', label, () => {
    step = name;
    paint();
  });
  if (step === name) node.classList.add('is-active');
  return node;
}

// Stikalo je navadna potrditvena škatlica v <label>: dotik kjerkoli po vrstici
// jo preklopi. Pikica ob napisu je iste barve kot črta na grafu — brez nje ne bi
// vedel, katera črta je katera.
function seriesToggle(label, checked, boxClass, onChange) {
  const wrap = el('label', 'series__item');

  const box = el('input', 'series__box ' + boxClass);
  box.type = 'checkbox';
  box.checked = checked;
  box.addEventListener('change', () => {
    onChange(box.checked);
    paint();
  });

  wrap.append(box, el('span', 'series__name', label));
  return wrap;
}

export default {
  id: 'nutrition',
  route: 'prehrana',
  icon: ICON_NUTRITION,
  title: TEXT.screens.nutrition,
  accent: '#9d0f0b',

  // Router vsakič pokliče to funkcijo na novo. Vpisano se ne pomni: obrok se
  // vpiše in shrani v istem obisku, kljukici in obdobje pa se vrneta na privzeto.
  render() {
    kcal = '';
    protein = '';
    kcalInput = null;
    showWeight = true;
    showCalories = true;
    step = 'day';

    root = el('div', 'nutrition');
    paint();
    return root;
  }
};
