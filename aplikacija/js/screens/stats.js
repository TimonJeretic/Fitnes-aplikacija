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
import { settingsButton } from '../settings.js';
import { aggregate, lineChart } from '../chart.js';
import { navigate } from '../startup/navigate.js';
import { ICON_STATS, ICON_TRASH } from '../icons.js';
import { openSheet } from '../sheet.js';
import { el, button, icon, formatNumber, formatRounded, formatDay } from '../dom.js';

const T = TEXT.stats;

// Kar piše v naslovu za poševnico. Vsak podpogled ima svojo, da sistemski gumb
// "nazaj" pelje na graf in ne iz aplikacije.
const ARCHIVE = 'arhiv';
const EXERCISES = 'vaje';

// --- Stanje zaslona --------------------------------------------------------
// Kot pri ostalih zaslonih: živi na ravni modula in se ob vsakem vstopu postavi
// na začetek v render().

let root = null;
let view = 'graph';         // 'graph' | 'archive' | 'exercises'
let workoutQuery = '';      // iskalnik v arhivu
let openWorkoutId = null;   // razprta vrstica arhiva
let openExerciseId = null;  // razprta vrstica arhiva vaj
let selectedId = null;      // vaja, ki je na grafu
let step = 'month';         // obdobje združevanja: 'week' | 'month' | 'year'

// --- Izris -----------------------------------------------------------------

// Poln ponovni izris. Kot pri ostalih zaslonih se kliče samo ob spremembah
// zgradbe. Med tipkanjem se NE kliče, sicer bi iskalno polje izgubilo kurzor —
// takrat se osveži samo seznam pod njim.
function paint() {
  root.replaceChildren(brandRow(), ...currentView());
}

function currentView() {
  if (view === 'archive') return archiveView();
  if (view === 'exercises') return exerciseArchiveView();
  return statsView();
}

// Ikona in naslov na vrhu, enako kot na ostalih dveh zaslonih. V podpogledu piše
// njegovo ime: naslov je edino, kar pogleda loči na prvi pogled.
function brandRow() {
  const titles = { archive: T.archive, exercises: T.exerciseArchive };

  const row = el('div', 'brand');
  row.append(icon('brand__logo', ICON_STATS));
  row.append(el('h1', 'brand__title', titles[view] || T.heading));
  row.append(settingsButton());
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

function hint(text) {
  return el('p', 'stats__hint', text);
}

// --- Pogled 1: graf moči ---------------------------------------------------

function statsView() {
  return [
    archiveLink(T.archive, ARCHIVE),
    archiveLink(T.exerciseArchive, EXERCISES),
    el('h2', 'section__title', T.strengthSection),
    pickerSection(),
    chartSection()
  ];
}

// Pot v enega od obeh arhivov. Oba gumba sta enaka, ker sta enakovredna:
// eden vodi v zgodovino treningov, drugi v register vaj.
function archiveLink(label, sub) {
  const link = button('archive-link', '', () => navigate('statistika/' + sub));
  link.append(el('span', 'archive-link__text', label));
  link.append(el('span', 'archive-link__caret', '›'));
  return link;
}

function selected() {
  if (selectedId === null) return null;

  const exercise = store.getExercise(selectedId);
  if (exercise) return exercise;

  selectedId = null;   // vaje ni več; ne pusti zaslona v praznem stanju
  return null;
}

// Ena široka tarča čez ves zaslon: pove, katera vaja je na grafu, in je hkrati
// gumb za menjavo. Enak vzorec kot izbirnik meritve na zaslonu TEŽA — dotik
// odpre spustni seznam čez zaslon (js/sheet.js).
//
// Napisa "Vaja:" pred imenom tukaj ni: dokler vaja ni izbrana, v polju piše
// "Ime vaje" v sivi barvi — tako izgleda kot polje, ki čaka na vpis, in ne kot
// gumb z uganko, kaj se za njim skriva.
function pickerSection() {
  const exercise = selected();

  const bar = button('picked', '', openPicker);

  const name = el('span', 'picked__name', exercise ? exercise.name : T.exerciseName);
  if (!exercise) name.classList.add('is-empty');

  bar.append(name);
  bar.append(el('span', 'picked__caret', '▾'));
  return bar;
}

// Ponudijo se samo vaje, ki so vsaj enkrat v zgodovini: vaja brez treningov nima
// česa pokazati na grafu. Zato tukaj ni okvirja za novo vajo — vaje nastanejo med
// treningom. Številka desno je, koliko treningov jo vsebuje.
function openPicker() {
  const items = store.searchTrainedExercises('').map((exercise) => ({
    id: exercise.id,
    name: exercise.name,
    count: exercise.workoutCount,
    active: exercise.id === selectedId
  }));

  openSheet({
    title: T.choose,
    items,
    emptyLabel: T.noTrainedExercises,
    onPick: (id) => {
      selectedId = id;
      paint();
    },
    closeLabel: T.close
  });
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

  // Napisa nad grafom ni: kaj je na njem, pove naslov razdelka nad izbirnikom.
  const box = el('div', 'graph__box');
  box.append(lineChart(points, { unit: T.unit, step, empty: T.noData }));
  wrap.append(box);

  // Izbira obdobja je pod grafom, kot na zaslonu TEŽA: gledaš krivuljo, palec
  // pa je itak spodaj.
  const steps = el('div', 'steps');
  steps.append(stepButton('week', T.week));
  steps.append(stepButton('month', T.month));
  steps.append(stepButton('year', T.year));
  wrap.append(steps);

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

// Treh številk pod grafom (zadnje, rekord, sprememba) tukaj ni: rekord pove
// arhiv vaj, ostalo pa se prebere s krivulje. Zaslon je s tem krajši za en
// razdelek in bližje temu, kar rabiš med treningom.

// Pod grafom seznam: katerega dne je padla najboljša serija obdobja in katera
// je bila. Ocena 1RM je izpeljanka; serija, ki jo je dala, je tisto, kar si res
// naredil in kar hočeš naslednjič prekositi.
function topSets(points, exercise) {
  const wrap = el('div', 'tops');
  wrap.append(el('h2', 'section__title', T.topSets));

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

  // Zgib z elastiko: kilogramov ni, pove se barva. Take serije na grafu ni,
  // v arhivu pa mora pisati, kaj si res naredila.
  if (set.band) return (TEXT.bands[set.band] || set.band) + ' × ' + reps;

  if (usesBodyweight) {
    const added = set.weightKg ? ' +' + formatNumber(set.weightKg) + ' ' + T.unit : '';
    return T.ownBodyweight + added + ' × ' + reps;
  }

  const weight = set.weightKg === null || set.weightKg === undefined
    ? T.empty
    : formatNumber(set.weightKg) + ' ' + T.unit;
  return weight + ' × ' + reps;
}

// --- Pogled 3: arhiv vaj ---------------------------------------------------
//
// Register vaj, kot je: kaj vse pozna aplikacija, kakšen je rekord pri vsaki in
// možnost, da se vaja zbriše. Vaje nastajajo same od sebe med treningom, zato se
// v registru sčasoma nabere tudi kaj, česar ne rabiš.

function exerciseArchiveView() {
  const back = button('back', T.back, () => navigate('statistika'));

  const exercises = store.searchExercises('');
  if (!exercises.length) return [back, hint(T.noExercises)];

  const list = el('div', 'archive');
  fillExerciseArchive(list);
  return [back, list];
}

function fillExerciseArchive(list) {
  const rows = [];

  for (const exercise of store.searchExercises('')) {
    const open = exercise.id === openExerciseId;

    const row = el('div', 'listrow');

    // Dotik po imenu razpre rekord pod vrstico. Ponoven dotik jo zapre.
    const openButton = button('listrow__open', '', () => {
      openExerciseId = open ? null : exercise.id;
      fillExerciseArchive(list);
    });
    openButton.setAttribute('aria-expanded', String(open));
    if (open) openButton.classList.add('is-open');
    openButton.append(el('span', 'listrow__name', exercise.name));
    row.append(openButton);

    const remove = button('listrow__remove', '', () => {
      if (!confirm(T.removeExerciseConfirm)) return;
      store.removeExercise(exercise.id);
      // Zbrisana vaja je lahko bila tista, ki je na grafu ali razprta.
      if (selectedId === exercise.id) selectedId = null;
      openExerciseId = null;
      paint();
    });
    remove.append(icon('listrow__icon', ICON_TRASH));
    remove.setAttribute('aria-label', T.removeExercise);
    remove.title = T.removeExercise;
    row.append(remove);

    rows.push(row);
    if (open) rows.push(recordDetail(exercise));
  }

  list.replaceChildren(...rows);
}

// Rekord vaje: najtežja serija, kar si jih naredila. Rdeč, ker je to edina
// številka v arhivu, ki je dosežek in ne zapis.
function recordDetail(exercise) {
  const box = el('div', 'archive__detail');

  const record = store.personalRecord(exercise.id);
  if (!record) {
    box.append(el('p', 'past__note', T.noRecord));
    return box;
  }

  const line = el('div', 'record');
  line.append(el('span', 'record__label', T.pr));
  line.append(el('span', 'record__value', setText(record, exercise.usesBodyweight)));
  box.append(line);

  box.append(el('p', 'past__note', formatDay(record.day) + ' · ' + record.workoutName));
  return box;
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
    if (sub === ARCHIVE) view = 'archive';
    else if (sub === EXERCISES) view = 'exercises';
    else view = 'graph';

    workoutQuery = '';
    openWorkoutId = null;
    openExerciseId = null;
    selectedId = null;
    step = 'month';

    root = el('div', 'stats');
    paint();
    return root;
  }
};
