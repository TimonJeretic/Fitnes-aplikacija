// Zaslon: trening.
//
// Vsak zaslon izvozi objekt z isto obliko. To je edina pogodba v aplikaciji:
// dokler jo modul spoštuje, ga router zna prikazati, tab vrstica pa mu sama
// naredi gumb. Nov zaslon = kopija te datoteke + ena vrstica v register.js.
//
// Zaslon ima dve stanji, odvisno od tega, ali je v shrambi trening v teku:
//   1. ni treninga  — polje za ime treninga s šepetalnikom in velik plus
//   2. trening teče — kartice vaj s serijami, spodaj Zavrži in Shrani
// Podatkov ne bere sam, ampak jih vpraša js/store.js.

import { TEXT } from '../ui.js';
import * as store from '../store.js';

const T = TEXT.training;

// --- Stanje zaslona --------------------------------------------------------
// Živi na ravni modula, ker zaslon obstaja samo enkrat. Vse tri spremenljivke
// se ob vsakem vstopu na zaslon postavijo na začetek v render().

let root = null;      // koren zaslona; vanj se izriše vse
let draft = null;     // trening v teku (isti objekt, kot je v shrambi)
let query = '';       // kar je vpisano v iskalno polje
let picking = false;  // ali je odprto iskalno polje za novo vajo
let nameInput = null; // polje z imenom treninga; rabimo ga za opozorilo ob shrani

// --- Drobni pomočniki za DOM ----------------------------------------------

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function button(className, text, onClick) {
  const node = el('button', className, text);
  node.type = 'button';               // brez tega bi gumb v obrazcu pošiljal stran
  node.addEventListener('click', onClick);
  return node;
}

// Ikone so vrisane v kodo in ne naložene kot datoteke: ena zahteva manj in
// barvo prevzamejo iz besedila (fill="currentColor").
const ICON_DUMBBELL =
  '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
  '<rect x="0.5" y="9" width="3" height="6" rx="1"/>' +
  '<rect x="4" y="6.5" width="3" height="11" rx="1"/>' +
  '<rect x="7.5" y="10.5" width="9" height="3"/>' +
  '<rect x="17" y="6.5" width="3" height="11" rx="1"/>' +
  '<rect x="20.5" y="9" width="3" height="6" rx="1"/></svg>';

const ICON_PENCIL =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
  'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  '<path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M14.5 5.5l4 4"/></svg>';

function icon(className, svg) {
  const node = el('span', className);
  node.innerHTML = svg;               // nespremenljiv niz iz te datoteke, ne vnos uporabnika
  return node;
}

// --- Številke --------------------------------------------------------------
// V polje se piše besedilo, v podatke gre število. Prazno polje je `null`:
// pri teži to pomeni vajo z lastno težo, pri ponovitvah neizpolnjeno serijo.

function parseNumber(text) {
  const clean = String(text).replace(',', '.').trim();
  if (clean === '') return null;
  const number = Number(clean);
  return Number.isFinite(number) ? number : null;
}

function formatNumber(value) {
  if (value === null || value === undefined) return '';
  return String(value).replace('.', ',');   // slovensko decimalno ločilo
}

function formatDate(iso) {
  const date = iso ? new Date(iso) : new Date();
  return date.toLocaleDateString('sl-SI');
}

// --- Shranjevanje in izris -------------------------------------------------

// Vsaka sprememba gre takoj v shrambo. Telefon se v telovadnici zaklene in
// sistem aplikacijo ubije — ob vrnitvi mora biti trening cel.
function persist() {
  store.saveDraft(draft);
}

// Ponovno izriše cel zaslon. Kliče se samo ob spremembah zgradbe (dodana vaja,
// dodana serija, shrani, zavrži). Med tipkanjem se NE kliče, sicer bi polje
// izgubilo kurzor sredi vpisovanja teže.
function paint() {
  root.replaceChildren(...(draft ? activeView() : idleView()));
}

// --- Stanje 1: ni treninga -------------------------------------------------

function idleView() {
  const header = el('header', 'training__header');
  header.append(brandRow(T.newWorkout));

  const list = el('div', 'suggest');

  const field = searchField(T.workoutName, () => fillWorkoutSuggestions(list), () => startFromQuery());
  header.append(field, list);

  fillWorkoutSuggestions(list);

  // Velik plus na sredini: največja tarča na zaslonu, ki jo zadeneš z eno roko.
  // Ne naredi novega treninga sam od sebe — postavi kurzor v polje za ime,
  // ker se vsak trening začne z imenom.
  const empty = el('div', 'training__empty');
  empty.append(button('bigplus', '+', () => field.querySelector('input').focus()));

  return [header, empty];
}

function fillWorkoutSuggestions(list) {
  const rows = store.searchTemplates(query).map((template) =>
    suggestion(template.name, template.exerciseIds.length, () => startWorkout(template))
  );

  // Zadnja vrstica je vedno tukaj: če se ne ujema nič, je edina.
  rows.push(button('suggest__item suggest__item--new', T.startNew, () => startFromQuery()));

  list.replaceChildren(...rows);
}

function startFromQuery() {
  // Ime, ki se ujema z obstoječo predlogo, odpre to predlogo — tudi če si ga
  // vpisal do konca namesto da bi ga izbral s seznama.
  const existing = store.findTemplateByName(query);
  if (existing) return startWorkout(existing);

  if (!query.trim()) return;   // brez imena ni treninga
  startWorkout(null);
}

function startWorkout(template) {
  draft = {
    name: template ? template.name : query.trim(),
    templateId: template ? template.id : null,
    startedAt: new Date().toISOString(),
    exercises: (template ? template.exerciseIds : [])
      // Vaja je lahko medtem izginila iz registra; predloga naj se zato ne sesuje.
      .filter((id) => store.getExercise(id))
      .map((id) => ({ exerciseId: id, sets: blankSets(id) }))
  };

  query = '';
  picking = false;
  persist();
  paint();
}

// Koliko praznih vrstic odpremo pri vaji: toliko serij, kolikor si jih naredil
// zadnjič. Če vaje še ni bilo, ena — ostale dodaš z gumbom.
function blankSets(exerciseId) {
  const last = store.lastSetsFor(exerciseId);
  const count = last ? last.length : 1;
  return Array.from({ length: count }, () => ({ weightKg: null, reps: null }));
}

// --- Stanje 2: trening teče ------------------------------------------------

function activeView() {
  const header = el('header', 'training__header');

  nameInput = el('input', 'training__name');
  nameInput.type = 'text';
  nameInput.value = draft.name;
  nameInput.placeholder = T.workoutName;
  nameInput.setAttribute('aria-label', T.workoutName);
  nameInput.autocomplete = 'off';
  nameInput.addEventListener('input', () => {
    draft.name = nameInput.value;
    nameInput.classList.remove('is-error');
    persist();
  });

  header.append(brandRow(nameInput));
  header.append(el('div', 'training__date', T.date + ' ' + formatDate(draft.startedAt)));

  const body = el('div', 'training__body');
  draft.exercises.forEach((entry) => body.append(exerciseCard(entry)));
  body.append(picking ? exercisePicker() : addExerciseButton());

  const actions = el('div', 'training__actions');
  actions.append(button('btn btn--ghost', T.discard, discard));
  actions.append(button('btn btn--primary', T.save, save));

  return [header, body, actions];
}

function addExerciseButton() {
  return button('addbar', '+', () => {
    picking = true;
    query = '';
    paint();
    // Po izrisu: tipkovnica naj se odpre takoj, brez drugega dotika.
    const field = root.querySelector('.field__input');
    if (field) field.focus();
  });
}

function exercisePicker() {
  const wrap = el('div', 'picker');
  const list = el('div', 'suggest');

  const field = searchField(
    T.exerciseName,
    () => fillExerciseSuggestions(list),
    () => addExerciseByName(query)
  );

  // Klik mimo zapre iskanje, da plus spet zasede svoje mesto.
  wrap.append(field, list, button('picker__cancel', T.close, () => {
    picking = false;
    query = '';
    paint();
  }));

  fillExerciseSuggestions(list);
  return wrap;
}

function fillExerciseSuggestions(list) {
  const rows = store.searchExercises(query).map((exercise) =>
    suggestion(exercise.name, null, () => addExercise(exercise))
  );
  rows.push(button('suggest__item suggest__item--new', T.newExercise, () => addExerciseByName(query)));
  list.replaceChildren(...rows);
}

// Vaja, ki je register še ne pozna, se ob dodajanju vanj zapiše. Tako seznam
// vaj nastane sam od sebe iz treningov in ga ni treba nikoli urejati posebej.
function addExerciseByName(name) {
  if (!String(name).trim()) return;
  addExercise(store.createExercise(name));
}

function addExercise(exercise) {
  draft.exercises.push({ exerciseId: exercise.id, sets: blankSets(exercise.id) });
  picking = false;
  query = '';
  persist();
  paint();
}

// --- Kartica vaje ----------------------------------------------------------

function exerciseCard(entry) {
  const exercise = store.getExercise(entry.exerciseId);
  const card = el('section', 'exercise');

  const head = el('div', 'exercise__head');
  head.append(el('div', 'exercise__name', exercise ? exercise.name : T.exerciseName));

  const pencil = button('exercise__note', '', () => openNote(entry));
  pencil.append(icon('exercise__note-icon', ICON_PENCIL));
  pencil.setAttribute('aria-label', T.note);
  if (exercise && exercise.note) pencil.classList.add('is-filled');
  head.append(pencil);
  card.append(head);

  // Kaj si delal zadnjič pri tej vaji. `null` pomeni, da je vaja nova —
  // takrat desni stolpec ostane prazen.
  const last = store.lastSetsFor(entry.exerciseId);

  const sets = el('div', 'exercise__sets');
  entry.sets.forEach((set, index) => sets.append(setRow(entry, set, index, last)));
  card.append(sets);

  const controls = el('div', 'exercise__controls');
  controls.append(withLabel(button('mini', '+', () => {
    entry.sets.push({ weightKg: null, reps: null });
    persist();
    paint();
  }), T.addSet));

  // Odstranjevanje se ponudi šele, ko je kaj odstraniti. Prazne serije se ob
  // shranjevanju itak zavržejo, zato je ta gumb za popravek, ne za red.
  if (entry.sets.length > 1) {
    controls.append(withLabel(button('mini mini--muted', '−', () => {
      entry.sets.pop();
      persist();
      paint();
    }), T.removeSet));
  }

  card.append(controls);
  return card;
}

function setRow(entry, set, index, last) {
  const row = el('div', 'set-row');
  row.append(el('div', 'set-row__label', T.set + ' ' + (index + 1)));

  const weight = numberField(set.weightKg, 'decimal', (value) => {
    set.weightKg = value;
    persist();
  });
  const reps = numberField(set.reps, 'numeric', (value) => {
    set.reps = value;
    persist();
  });

  const inputs = el('div', 'pair');
  inputs.append(weight, el('span', 'pair__times', '×'), reps);
  row.append(inputs);

  row.append(el('div', 'set-row__divider'));

  // Desni stolpec: zadnjič. Prazen, če vaje še ni bilo — takrat ni česa prepisati.
  const reference = el('div', 'pair pair--ref');
  if (last) {
    const previous = last[index] || null;
    reference.append(
      referenceBox(previous ? previous.weightKg : null, weight),
      el('span', 'pair__times', '×'),
      referenceBox(previous ? previous.reps : null, reps)
    );
  }
  row.append(reference);

  return row;
}

function numberField(value, mode, onChange) {
  const input = el('input', 'numbox');
  input.type = 'text';        // text + inputMode: številska tipkovnica, brez puščic
  input.inputMode = mode;
  input.value = formatNumber(value);
  input.addEventListener('input', () => onChange(parseNumber(input.value)));
  return input;
}

// Klik na številko iz zadnjič jo prepiše v polje levo. En dotik namesto dveh
// tipkanj — največji prihranek pri delu z eno roko.
function referenceBox(value, target) {
  const box = el('button', 'numbox numbox--ref', formatNumber(value));
  box.type = 'button';

  if (value === null || value === undefined) {
    box.disabled = true;      // prazna škatlica ni tarča za palec
    return box;
  }

  box.setAttribute('aria-label', formatNumber(value));
  box.addEventListener('click', () => {
    target.value = formatNumber(value);
    // Ista pot kot pri ročnem tipkanju: en sam kraj, kjer se vrednost shrani.
    target.dispatchEvent(new Event('input'));
  });
  return box;
}

// --- Zapisek pod svinčnikom ------------------------------------------------

function openNote(entry) {
  const exercise = store.getExercise(entry.exerciseId);
  if (!exercise) return;

  const overlay = el('div', 'modal');
  const box = el('div', 'modal__box');

  box.append(el('h2', 'modal__title', exercise.name));

  const area = el('textarea', 'modal__text');
  area.value = exercise.note || '';
  area.placeholder = T.notePlaceholder;
  area.rows = 5;
  // Zapisek je last vaje, ne treninga, zato se shrani sproti in ga "Zavrži"
  // ne razveljavi. Enkrat vpisana nastavitev stola velja tudi čez pol leta.
  area.addEventListener('input', () => store.setExerciseNote(exercise.id, area.value));
  box.append(area);

  box.append(el('p', 'modal__hint', T.noteHint));

  const close = () => overlay.remove();

  const actions = el('div', 'modal__actions');
  actions.append(button('btn btn--danger', T.removeExercise, () => {
    if (!confirm(T.removeExerciseConfirm)) return;
    draft.exercises = draft.exercises.filter((item) => item !== entry);
    persist();
    close();
    paint();
  }));
  actions.append(button('btn btn--primary', T.close, () => {
    close();
    paint();   // svinčnik dobi oznako, če je zapisek zdaj poln
  }));
  box.append(actions);

  // Klik na temno ozadje zapre okno; klik znotraj okna ne.
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      close();
      paint();
    }
  });

  overlay.append(box);
  root.append(overlay);
  area.focus();
}

// --- Zavrži in shrani ------------------------------------------------------

function discard() {
  if (!confirm(T.discardConfirm)) return;
  store.clearDraft();
  draft = null;
  query = '';
  picking = false;
  paint();
}

function save() {
  if (!draft.name.trim()) {
    // Brez imena ni predloge za naslednjič, zato je ime pogoj za shranjevanje.
    nameInput.classList.add('is-error');
    nameInput.focus();
    alert(T.nameMissing);
    return;
  }

  store.saveWorkout(draft);
  draft = null;
  query = '';
  picking = false;
  paint();
}

// --- Skupni deli obeh stanj ------------------------------------------------

// Vrstica z ikono in naslovom oziroma poljem za ime.
function brandRow(titleOrInput) {
  const row = el('div', 'training__brand');
  row.append(icon('training__logo', ICON_DUMBBELL));
  row.append(typeof titleOrInput === 'string'
    ? el('h1', 'training__heading', titleOrInput)
    : titleOrInput);
  return row;
}

// Iskalno polje za trening in za vajo je isto: tipkaš, spodaj se ožijo predlogi,
// Enter vzame vpisano. Med tipkanjem se osveži samo seznam, da kurzor obstane.
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
  if (count !== null && count !== undefined) {
    row.append(el('span', 'suggest__count', String(count)));
  }
  return row;
}

// Gumb je majhen in brez besedila, zato mu ime povemo posebej: aria-label za
// bralnike zaslona, title za namig z miško.
function withLabel(node, label) {
  node.setAttribute('aria-label', label);
  node.title = label;
  return node;
}

// --- Modul zaslona ---------------------------------------------------------

export default {
  id: 'training',                 // interni ključ (angleško, brez šumnikov)
  route: 'trening',               // kar piše v naslovu: #/trening
  tab: 'T',                       // črka na kvadratku spodaj
  title: TEXT.screens.training,   // napis; besedilo živi v ui.js
  accent: '#8f2323',              // barva tega zaslona

  // Router vsakič pokliče to funkcijo na novo, zato se stanje zaslona tukaj
  // postavi na začetek. Edini trajni spomin je shramba: če je v njej trening
  // v teku, se odpre točno tam, kjer si ga pustil.
  render() {
    draft = store.getDraft();
    query = '';
    picking = false;
    nameInput = null;

    root = el('div', 'training');
    paint();
    return root;
  }
};
