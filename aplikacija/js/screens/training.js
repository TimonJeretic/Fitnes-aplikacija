// Zaslon: trening.
//
// Vsak zaslon izvozi objekt z isto obliko. To je edina pogodba v aplikaciji:
// dokler jo modul spoštuje, ga router zna prikazati, tab vrstica pa mu sama
// naredi gumb. Nov zaslon = kopija te datoteke + ena vrstica v
// js/startup/screen_register.js.
//
// Zaslon ima dve stanji, odvisno od tega, ali je v shrambi trening v teku:
//   1. ni treninga  — polje za ime treninga s šepetalnikom in velik plus
//   2. trening teče — kartice vaj s serijami, spodaj Zavrži in Shrani
// Podatkov ne bere sam, ampak jih vpraša js/store.js.

import { TEXT } from '../besedilo.js';
import * as store from '../store.js';
import { el, button, icon, withLabel, parseNumber, formatNumber, formatDate } from '../dom.js';

const T = TEXT.training;

// --- Stanje zaslona --------------------------------------------------------
// Živi na ravni modula, ker zaslon obstaja samo enkrat. Vse tri spremenljivke
// se ob vsakem vstopu na zaslon postavijo na začetek v render().

let root = null;      // koren zaslona; vanj se izriše vse
let draft = null;     // trening v teku (isti objekt, kot je v shrambi)
let query = '';       // kar je vpisano v iskalno polje
let picking = false;  // ali je odprto iskalno polje za novo vajo
let nameInput = null; // polje z imenom treninga; rabimo ga za opozorilo ob shrani

// --- Ikone -----------------------------------------------------------------
// Vrisane v kodo in ne naložene kot datoteke: ena zahteva manj in barvo
// prevzamejo iz besedila (fill="currentColor").

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

// Pike na ploscici z imenom vaje. Edini namig, da se vaja da prijeti in premakniti.
const ICON_GRIP =
  '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">' +
  '<circle cx="5" cy="3.5" r="1.4"/><circle cx="11" cy="3.5" r="1.4"/>' +
  '<circle cx="5" cy="8" r="1.4"/><circle cx="11" cy="8" r="1.4"/>' +
  '<circle cx="5" cy="12.5" r="1.4"/><circle cx="11" cy="12.5" r="1.4"/></svg>';

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

// Trening se vedno zacne prazen — tudi ko izbereš predlogo. Vaje iz nje se
// prepišejo sem šele na dotik gumba "Ponovi zadnji trening", ker isto ime
// pogosto pomeni drugačen dan (krajši trening, druga naprava zasedena).
function startWorkout(template) {
  draft = {
    name: template ? template.name : query.trim(),
    templateId: template ? template.id : null,
    startedAt: new Date().toISOString(),
    exercises: []
  };

  query = '';
  picking = false;
  persist();
  paint();
}

function repeatTemplate(template) {
  draft.exercises = template.exerciseIds
    // Vaja je lahko medtem izginila iz registra; predloga naj se zato ne sesuje.
    .filter((id) => store.getExercise(id))
    .map((id) => ({ exerciseId: id, sets: blankSets(id) }));

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
  header.append(metaRow());

  const body = el('div', 'training__body');
  draft.exercises.forEach((entry) => body.append(exerciseCard(entry)));
  body.append(picking ? exercisePicker() : addExerciseButton());

  const actions = el('div', 'training__actions');
  actions.append(button('btn btn--ghost', T.discard, discard));
  actions.append(button('btn btn--primary', T.save, save));

  return [header, body, actions];
}

// Datum levo, desno pa ponudba, da se prejšnji trening prepiše sem. Ponudba
// velja samo, dokler ni nobene vaje: ko prvo dodaš, si se odločil za svoje
// zaporedje in gumb izgine, da ga ne bi po nesreči zbrisal.
function metaRow() {
  const row = el('div', 'training__meta');
  row.append(el('div', 'training__date', T.date + ' ' + formatDate(draft.startedAt)));

  const template = draft.templateId ? store.getTemplate(draft.templateId) : null;
  if (template && template.exerciseIds.length && draft.exercises.length === 0) {
    row.append(button('repeat', T.repeatLast, () => repeatTemplate(template)));
  }

  return row;
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

  // Ploščica z imenom je hkrati ročaj: primeš jo in vlečeš vajo gor ali dol.
  const name = el('div', 'exercise__name');
  name.append(el('span', 'exercise__label', exercise ? exercise.name : T.exerciseName));
  name.append(icon('exercise__grip', ICON_GRIP));
  withLabel(name, T.moveExercise);
  enableDrag(name, card);
  head.append(name);

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

  // Odstranitev vaje je čisto desno spodaj, najdlje od plusa nad njo.
  controls.append(withLabel(button('mini mini--remove', '×', () => removeExercise(entry)), T.removeExercise));

  card.append(controls);
  return card;
}

// Vprašamo samo, kadar je kaj izgubiti. Prazno vajo, ki si jo pravkar dodal
// po pomoti, odstraniš z enim dotikom.
function removeExercise(entry) {
  const filled = entry.sets.some((set) => set.weightKg !== null || set.reps !== null);
  if (filled && !confirm(T.removeExerciseConfirm)) return;

  draft.exercises = draft.exercises.filter((item) => item !== entry);
  persist();
  paint();
}

// --- Premikanje vaj z vlecenjem -------------------------------------------
//
// Vgrajeni drag-and-drop (draggable="true") na telefonu ne dela, zato tečejo
// pointer dogodki: en sam zapis pokriva miško in prst. Med vlečenjem se
// podatki ne spreminjajo — premakne se samo slika, zaporedje pa se zapiše
// šele, ko prst spustiš.

function enableDrag(handle, card) {
  handle.addEventListener('pointerdown', (event) => {
    if (event.button > 0) return;    // desni klik ni prijem
    startDrag(event, card);
  });
}

function startDrag(event, card) {
  const cards = Array.from(root.querySelectorAll('.exercise'));
  const from = cards.indexOf(card);
  if (from < 0 || cards.length < 2) return;

  event.preventDefault();

  // Pozicije izmerimo enkrat, na začetku. Med vlečenjem se kartice premikajo
  // samo z zamikom (transform), zato ostanejo te meritve veljavne.
  const rects = cards.map((node) => node.getBoundingClientRect());
  const gap = Math.max(0, rects[1].top - rects[0].bottom);
  const step = rects[from].height + gap;
  const startY = event.clientY;
  let to = from;

  card.classList.add('is-dragging');
  root.classList.add('is-reordering');

  const move = (moveEvent) => {
    const shift = moveEvent.clientY - startY;
    card.style.transform = 'translateY(' + shift + 'px)';

    // Sosed se umakne, ko ga sredina vlečene kartice prehodi do polovice.
    const center = rects[from].top + rects[from].height / 2 + shift;
    let next = from;
    while (next > 0 && center < middle(rects[next - 1])) next--;
    while (next < rects.length - 1 && center > middle(rects[next + 1])) next++;

    if (next === to) return;
    to = next;
    shiftOthers(cards, from, to, step);
  };

  const end = () => {
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', end);
    window.removeEventListener('pointercancel', end);

    cards.forEach((node) => { node.style.transform = ''; });
    card.classList.remove('is-dragging');
    root.classList.remove('is-reordering');

    if (to === from) return;
    const [moved] = draft.exercises.splice(from, 1);
    draft.exercises.splice(to, 0, moved);
    persist();
    paint();
  };

  // Poslušamo na oknu in ne na ploščici: prst med vlečenjem uide z nje, pri
  // miški pa kazalec sploh ni več nad njo.
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', end);
  window.addEventListener('pointercancel', end);
}

function middle(rect) {
  return rect.top + rect.height / 2;
}

// Kartice med starim in novim mestom se umaknejo za višino vlečene kartice.
function shiftOthers(cards, from, to, step) {
  cards.forEach((node, index) => {
    if (index === from) return;

    let offset = 0;
    if (to > from && index > from && index <= to) offset = -step;
    if (to < from && index >= to && index < from) offset = step;

    node.style.transform = offset ? 'translateY(' + offset + 'px)' : '';
  });
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

  // Ali je vaja z lastno težo, je trajna lastnost vaje — enako kot zapisek —
  // zato stoji tukaj in ne pri vnosu serij. Med treningom te to ne sme ustaviti;
  // izbereš enkrat, ko vajo prvič vpišeš, in nikoli več.
  box.append(bodyweightToggle(exercise));

  const close = () => overlay.remove();

  const actions = el('div', 'modal__actions');
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

// Stikalo je navadna potrditvena škatlica v <label>: dotik kjerkoli po vrstici
// jo preklopi, brez lastne logike za tarčo.
function bodyweightToggle(exercise) {
  const wrap = el('label', 'modal__toggle');

  const box = el('input', 'modal__checkbox');
  box.type = 'checkbox';
  box.checked = !!exercise.usesBodyweight;
  // Shrani se sproti, kot zapisek: lastnost pripada vaji, ne temu treningu.
  box.addEventListener('change', () => {
    store.setExerciseBodyweight(exercise.id, box.checked);
  });

  const label = el('span', 'modal__toggle-text');
  label.append(el('span', 'modal__toggle-name', T.bodyweight));
  label.append(el('span', 'modal__toggle-hint', T.bodyweightHint));

  wrap.append(box, label);
  return wrap;
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

  // Odkar se predloga ne odpre sama, je prazen trening resnicna moznost —
  // shranjen bi predlogo prepisal v nic in v zgodovino dodal prazen dan.
  if (draft.exercises.length === 0) {
    alert(T.noExercises);
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

// --- Modul zaslona ---------------------------------------------------------

export default {
  id: 'training',                 // interni ključ (angleško, brez šumnikov)
  route: 'trening',               // kar piše v naslovu: #/trening
  tab: 'T',                       // črka na kvadratku spodaj
  title: TEXT.screens.training,   // napis; nizi zivijo v js/besedilo.js
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
