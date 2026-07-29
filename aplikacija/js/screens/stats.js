// Zaslon: statistika. Oblika modula je razložena v training.js.
//
// Zaslon ima dva pogleda, ločena s podpotjo v naslovu:
//   #/statistika        graf moči po vaji
//   #/statistika/arhiv  seznam vseh shranjenih treningov
//
// Zakaj ima arhiv svoj naslov in ni le zastavica v tej datoteki: brez tega bi
// sistemski gumb "nazaj" na telefonu iz arhiva vrgel ven iz aplikacije namesto
// nazaj na graf.
//
// Podatkov zaslon ne bere sam, ampak jih vpraša js/store.js — tudi oceno moči.
// Formula za 1RM je zapisana natanko enkrat, tam.

import { TEXT } from '../besedilo.js';
import * as store from '../store.js';
import { aggregate, lineChart } from '../chart.js';
import { navigate } from '../startup/navigate.js';
import { ICON_STATS } from '../icons.js';
import { el, button, icon, formatNumber, formatRounded, formatDay } from '../dom.js';

const T = TEXT.stats;

const ARCHIVE = 'arhiv';   // kar piše v naslovu za poševnico

// --- Stanje zaslona --------------------------------------------------------
// Kot pri ostalih zaslonih: živi na ravni modula in se ob vsakem vstopu postavi
// na začetek v render().

let root = null;
let archive = false;        // kateri od obeh pogledov je odprt
let workoutQuery = '';      // iskalnik v arhivu
let openWorkoutId = null;   // razprta vrstica arhiva
let selectedId = null;      // vaja, ki je na grafu
let picking = false;        // ali je izbirnik vaje razprt
let query = '';             // kar je vpisano v izbirniku vaje
let step = 'month';         // obdobje združevanja: 'week' | 'month' | 'year'

// --- Izris -----------------------------------------------------------------

// Poln ponovni izris. Kot pri ostalih zaslonih se kliče samo ob spremembah
// zgradbe. Med tipkanjem se NE kliče, sicer bi iskalno polje izgubilo kurzor —
// takrat se osveži samo seznam pod njim.
function paint() {
  root.replaceChildren(brandRow(), ...(archive ? archiveView() : statsView()));
}

// Ikona in naslov na vrhu, enako kot na ostalih dveh zaslonih. V arhivu piše
// ime arhiva: pogleda sta dva in naslov je edino, kar ju loči na prvi pogled.
function brandRow() {
  const row = el('div', 'brand');
  row.append(icon('brand__logo', ICON_STATS));
  row.append(el('h1', 'brand__title', archive ? T.archive : T.heading));
  return row;
}

// Iskalno polje je isto kot pri treningu in teži: tipkaš, spodaj se ožijo
// zadetki. Vrednost dobi od klicatelja, ker ima vsak pogled svojo.
function searchField(placeholder, value, onType) {
  const wrap = el('div', 'field');

  const input = el('input', 'field__input');
  input.type = 'text';
  input.placeholder = placeholder;
  input.setAttribute('aria-label', placeholder);
  input.value = value;
  input.autocomplete = 'off';
  input.autocapitalize = 'words';

  input.addEventListener('input', () => onType(input.value));

  wrap.append(input);
  return wrap;
}

function suggestion(name, count, onClick) {
  const row = button('suggest__item', '', onClick);
  row.append(el('span', 'suggest__name', name));
  row.append(el('span', 'suggest__count', String(count)));
  return row;
}

function hint(text) {
  return el('p', 'stats__hint', text);
}

// --- Pogled 1: graf moči ---------------------------------------------------

function statsView() {
  const link = button('archive-link', '', () => navigate('statistika/' + ARCHIVE));
  link.append(el('span', 'archive-link__text', T.archive));
  link.append(el('span', 'archive-link__caret', '›'));

  return [link, picking ? openPicker() : closedPicker(), chartSection()];
}

function selected() {
  if (selectedId === null) return null;

  const exercise = store.getExercise(selectedId);
  if (exercise) return exercise;

  selectedId = null;   // vaje ni več; ne pusti zaslona v praznem stanju
  return null;
}

// Ena široka tarča čez ves zaslon: pove, katera vaja je na grafu, in je hkrati
// gumb za menjavo. Enak vzorec kot izbirnik meritve na zaslonu TEŽA.
function closedPicker() {
  const exercise = selected();

  const bar = button('picked', '', () => {
    picking = true;
    query = '';
    paint();
    // Po izrisu: tipkovnica naj se odpre takoj, brez drugega dotika.
    const field = root.querySelector('.field__input');
    if (field) field.focus();
  });

  bar.append(el('span', 'picked__label', T.picked));
  bar.append(el('span', 'picked__name', exercise ? exercise.name : T.choose));
  bar.append(el('span', 'picked__caret', '▾'));
  return bar;
}

function openPicker() {
  const wrap = el('div', 'picker');
  const list = el('div', 'suggest');

  wrap.append(
    searchField(T.exerciseName, query, (value) => {
      query = value;
      fillExercises(list);
    }),
    list,
    button('picker__cancel', T.close, () => {
      picking = false;
      query = '';
      paint();
    })
  );

  fillExercises(list);
  return wrap;
}

// Ponudijo se samo vaje, ki so vsaj enkrat v zgodovini: vaja brez treningov
// nima česa pokazati na grafu. Številka desno je, koliko treningov jo vsebuje.
function fillExercises(list) {
  const found = store.searchTrainedExercises(query);

  if (!found.length) {
    list.replaceChildren(hint(query ? T.noMatches : T.noTrainedExercises));
    return;
  }

  list.replaceChildren(...found.map((exercise) =>
    suggestion(exercise.name, exercise.workoutCount, () => {
      selectedId = exercise.id;
      picking = false;
      query = '';
      paint();
    })
  ));
}

function chartSection() {
  const exercise = selected();
  if (!exercise) return hint(T.pickExercise);

  const series = store.strengthSeries(exercise.id);

  if (series.needsBodyweight) return hint(T.needsBodyweight);
  if (!series.points.length) return hint(T.noData);

  // 'max' in ne povprečje: moč obdobja je najboljši nastop v njem, ogrevalne
  // serije in slab dan je ne smejo vleči navzdol.
  const points = aggregate(series.points, step, 'max');

  const wrap = el('div', 'graph');

  const box = el('div', 'graph__box');
  box.append(el('div', 'graph__title', T.strength));
  box.append(lineChart(points, { unit: T.unit, step, empty: T.noData }));
  wrap.append(box);

  // Izbira obdobja je pod grafom, kot na zaslonu TEŽA: gledaš krivuljo, palec
  // pa je itak spodaj.
  const steps = el('div', 'steps');
  steps.append(stepButton('week', T.week));
  steps.append(stepButton('month', T.month));
  steps.append(stepButton('year', T.year));
  wrap.append(steps);

  wrap.append(tiles(points, series.points));
  wrap.append(topSets(points, exercise));

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

// Tri številke pod grafom. Na majhnem zaslonu povedo več kot oblika krivulje:
// kje si zdaj, koliko je bilo največ in ali gre gor ali dol.
function tiles(points, raw) {
  const wrap = el('div', 'tiles');

  const latest = points[points.length - 1].value;
  // Rekord se bere iz nezdruženih točk: najboljša serija je bila en dan, ne
  // vrh meseca, in mora biti ista številka pri vseh treh obdobjih.
  const record = Math.max(...raw.map((point) => point.value));
  const change = points.length > 1 ? latest - points[0].value : null;

  wrap.append(tile(T.latest, formatRounded(latest) + ' ' + T.unit));
  wrap.append(tile(T.record, formatRounded(record) + ' ' + T.unit));

  const changeTile = tile(T.change, change === null ? T.empty : signed(change) + ' ' + T.unit);
  if (change !== null && Math.abs(change) >= 0.05) {
    changeTile.classList.add(change > 0 ? 'is-up' : 'is-down');
  }
  wrap.append(changeTile);

  return wrap;
}

function tile(label, value) {
  const node = el('div', 'tile');
  node.append(el('span', 'tile__label', label));
  node.append(el('span', 'tile__value', value));
  return node;
}

function signed(value) {
  const rounded = Math.round(value * 10) / 10;
  return (rounded > 0 ? '+' : '') + formatNumber(rounded);
}

// Pod grafom seznam: katerega dne je padla najboljša serija obdobja in katera
// je bila. Ocena 1RM je izpeljanka; serija, ki jo je dala, je tisto, kar si res
// naredil in kar hočeš naslednjič prekositi.
function topSets(points, exercise) {
  const wrap = el('div', 'tops');
  wrap.append(el('h2', 'tops__title', T.topSets));

  const list = el('div', 'tops__list');
  points.slice().reverse().forEach((point) => {
    const row = el('div', 'tops__row');
    row.append(el('span', 'tops__date', formatDay(point.day)));
    row.append(el('span', 'tops__set', setText(point, exercise.usesBodyweight)));
    row.append(el('span', 'tops__value', formatRounded(point.value) + ' ' + T.unit));
    list.append(row);
  });

  wrap.append(list);
  return wrap;
}

// Zapis serije. Pri vaji z lastno težo je vpisana teža **dodana** teža, zato se
// izpiše kot pribitek in ne kot cela teža — sicer bi "0 kg × 10" pri zgibih
// izgledalo kot napaka.
function setText(set, usesBodyweight) {
  const reps = set.reps === null || set.reps === undefined ? T.empty : String(set.reps);

  if (usesBodyweight) {
    const added = set.weightKg ? ' +' + formatNumber(set.weightKg) + ' ' + T.unit : '';
    return T.ownBodyweight + added + ' × ' + reps;
  }

  const weight = set.weightKg === null || set.weightKg === undefined
    ? T.empty
    : formatNumber(set.weightKg) + ' ' + T.unit;
  return weight + ' × ' + reps;
}

// --- Pogled 2: arhiv treningov ---------------------------------------------

function archiveView() {
  const back = button('back', T.back, () => navigate('statistika'));

  const list = el('div', 'archive');

  // Iskalno polje se drži vrha: seznam pod njim je lahko dolg, popravek iskanja
  // pa ne sme zahtevati drsenja nazaj na vrh.
  const search = el('div', 'archive__search');
  search.append(searchField(T.searchWorkouts, workoutQuery, (value) => {
    workoutQuery = value;
    openWorkoutId = null;    // stara razprta vrstica v novih zadetkih nima smisla
    fillArchive(list);
  }));

  fillArchive(list);
  return [back, search, list];
}

// Ena vrstica na trening: ime levo, datum desno. Dotik razpre cel trening pod
// njo in odrine spodnje vrstice — brez menjave zaslona, da ne izgubiš mesta
// v seznamu.
function fillArchive(list) {
  const workouts = store.searchWorkouts(workoutQuery);

  if (!workouts.length) {
    list.replaceChildren(hint(workoutQuery ? T.noMatches : T.noWorkouts));
    return;
  }

  const rows = [];
  for (const workout of workouts) {
    const open = workout.id === openWorkoutId;

    const row = button('archive__row', '', () => {
      // Ponoven dotik iste vrstice jo zapre.
      openWorkoutId = open ? null : workout.id;
      // Samo seznam, ne cel zaslon: v iskalnem polju lahko stoji kurzor.
      fillArchive(list);
    });
    row.setAttribute('aria-expanded', String(open));
    if (open) row.classList.add('is-open');

    row.append(el('span', 'archive__name', workout.name));
    row.append(el('span', 'archive__date', formatDay(workout.day)));
    rows.push(row);

    if (open) rows.push(workoutDetail(workout.id));
  }

  list.replaceChildren(...rows);
}

// Razprt trening. Samo za branje: popravljanje in brisanje zgodovine je svoje
// vprašanje in bi zahtevalo svoj premislek (Claude_kontekst/stanje.md).
function workoutDetail(id) {
  const wrap = el('div', 'archive__detail');

  const workout = store.getWorkoutView(id);
  if (!workout) return wrap;

  for (const entry of workout.exercises) {
    const card = el('section', 'past');
    card.append(el('h3', 'past__name', entry.name || T.removedExercise));

    if (entry.note) card.append(el('p', 'past__note', entry.note));

    const sets = el('div', 'past__sets');
    entry.sets.forEach((set, index) => {
      const row = el('div', 'past__set');
      row.append(el('span', 'past__label', T.set + ' ' + (index + 1)));
      row.append(el('span', 'past__value', setText(set, entry.usesBodyweight)));
      sets.append(row);
    });
    card.append(sets);

    // Ocena moči tudi tukaj, da sta arhiv in graf ista številka.
    if (entry.best) {
      card.append(el('div', 'past__best',
        T.strength + ': ' + formatRounded(entry.best.e1rm) + ' ' + T.unit));
    }

    wrap.append(card);
  }

  return wrap;
}

// --- Modul zaslona ---------------------------------------------------------

export default {
  id: 'stats',
  route: 'statistika',
  icon: ICON_STATS,
  title: TEXT.screens.stats,
  accent: '#9d0f0b',

  // Router pokliče to funkcijo ob vsakem vstopu in ji poda podpot iz naslova.
  // Stanje se zato postavi na začetek: vsak obisk se začne brez izbrane vaje in
  // z zaprtimi vrsticami arhiva.
  render(sub) {
    archive = sub === ARCHIVE;
    workoutQuery = '';
    openWorkoutId = null;
    selectedId = null;
    picking = false;
    query = '';
    step = 'month';

    root = el('div', 'stats');
    paint();
    return root;
  }
};
