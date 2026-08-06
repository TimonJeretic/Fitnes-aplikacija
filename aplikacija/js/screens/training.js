// Zaslon: trening.
//
// Vsak zaslon izvozi objekt z isto obliko. To je edina pogodba v aplikaciji:
// dokler jo modul spoštuje, ga router zna prikazati, tab vrstica pa mu sama
// naredi gumb. Nov zaslon = kopija te datoteke + ena vrstica v
// js/startup/screen_register.js.
//
// Zaslon ima dve stanji, odvisno od tega, ali je v shrambi trening v teku:
//   1. ni treninga  — seznam preteklih treningov in polje za novo ime
//   2. trening teče — kartice vaj s serijami, spodaj Zavrži in Shrani
// Podatkov ne bere sam, ampak jih vpraša js/store.js.

import { TEXT } from '../besedilo.js';
import * as store from '../store.js';
import { settingsButton } from '../settings.js';
import { ICON_TRAINING, ICON_TRASH } from '../icons.js';
import { openSheet } from '../sheet.js';
import {
  el, button, icon, withLabel,
  parseNumber, limitNumber, formatNumber, formatTime, formatDate, dayOfIso, isoOnDay
} from '../dom.js';

const T = TEXT.training;

// --- Stanje zaslona --------------------------------------------------------
// Živi na ravni modula, ker zaslon obstaja samo enkrat. Vse tri spremenljivke
// se ob vsakem vstopu na zaslon postavijo na začetek v render().

let root = null;      // koren zaslona; vanj se izriše vse
let draft = null;     // trening v teku (isti objekt, kot je v shrambi)
let query = '';       // kar je vpisano v polje za ime novega treninga
let nameInput = null; // polje z imenom treninga; rabimo ga za opozorilo ob shrani
let cardioDay = '';   // datum, za katerega se vpisuje cardio
let cardio = '';      // kar je vpisano v polje za porabljene kalorije

// --- Ikone -----------------------------------------------------------------
// Vrisane v kodo in ne naložene kot datoteke: ena zahteva manj in barvo
// prevzamejo iz besedila (fill="currentColor"). Ikone, ki jih uporablja več
// zaslonov (utež, koš), živijo v js/icons.js.

const ICON_PENCIL =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
  'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  '<path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M14.5 5.5l4 4"/></svg>';

// Koledarček ob datumu treninga. Edini namig, da se datum da zamenjati.
const ICON_CALENDAR =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
  'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/>' +
  '<path d="M8 3v4"/><path d="M16 3v4"/></svg>';

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

// Zaslon brez treninga sta dva razdelka: zgoraj treningi, ki jih že poznaš
// (devet dotikov od desetih se konča tukaj), spodaj polje za povsem nov trening.
// Iskalnega polja nad seznamom ni: imen treninga je peščica in seznam je krajši
// od tipkanja.
function idleView() {
  // Glava ni v svojem ovoju: lepi se na vrh zaslona (`position: sticky`), to pa
  // deluje samo znotraj starša — v kratkem ovoju bi odlepila takoj, ko bi ta
  // odrsal. Zato je otrok korena, ki je visok kot cel zaslon.
  return [
    brandRow(T.newWorkout),
    pastSection(),
    el('div', 'rule'),
    createSection(),
    el('div', 'rule'),
    cardioSection()
  ];
}

function pastSection() {
  const section = el('section', 'training__section');
  section.append(el('h2', 'section__title', T.pastWorkouts));

  const templates = store.searchTemplates('');
  if (!templates.length) {
    section.append(el('p', 'templates__empty', T.noTemplates));
    return section;
  }

  const list = el('div', 'templates');
  templates.forEach((template) => list.append(templateRow(template)));
  section.append(list);
  return section;
}

// Vrstica ima dve tarči: ime odpre trening, koš predlogo zbriše.
function templateRow(template) {
  const row = el('div', 'listrow');

  const open = button('listrow__open', '', () => startWorkout(template));
  open.append(el('span', 'listrow__name', template.name));
  open.append(el('span', 'listrow__count', String(template.exerciseIds.length)));
  row.append(open);

  const remove = button('listrow__remove', '', () => {
    if (!confirm(T.removeTemplateConfirm)) return;
    store.removeTemplate(template.id);
    paint();
  });
  remove.append(icon('listrow__icon', ICON_TRASH));
  withLabel(remove, T.removeTemplate);
  row.append(remove);

  return row;
}

function createSection() {
  const section = el('section', 'training__section');
  section.append(el('h2', 'section__title', T.createWorkout));

  // Isto polje kot drugod, samo brez predlogov pod njim: seznam je že zgoraj.
  const field = searchField(T.workoutName, () => {}, () => startFromQuery());
  section.append(field);

  section.append(button('btn btn--primary', T.confirm, () => startFromQuery()));
  return section;
}

// Cardio ni trening s serijami, zato ne odpre kartic — je ena številka na dan.
// Stoji tukaj in ne na zaslonu PREHRANA, ker se vpiše po vadbi; porabo pa
// upošteva maintenance na zaslonu PREHRANA.
function cardioSection() {
  const section = el('section', 'training__section');
  section.append(el('h2', 'section__title', T.cardio));

  const row = el('div', 'entry__row');

  const value = el('input', 'entry__value');
  value.type = 'text';           // text + inputMode: številska tipkovnica, brez puščic
  value.inputMode = 'numeric';
  value.value = cardio;
  value.placeholder = T.cardioValue;
  value.setAttribute('aria-label', T.cardioValue);
  value.addEventListener('input', () => {
    value.value = String(value.value).replace(/[^0-9]/g, '').slice(0, 5);
    cardio = value.value;
  });

  const date = el('input', 'entry__date');
  date.type = 'date';            // sistemski koledar; daje in jemlje 'YYYY-MM-DD'
  date.value = cardioDay;
  date.setAttribute('aria-label', T.date);
  date.addEventListener('input', () => {
    cardioDay = date.value;
    // Drug dan ima lahko svoj vnos; polje mora pokazati tistega, ne prejšnjega.
    cardio = existingCardio(cardioDay);
    value.value = cardio;
  });

  row.append(value, el('span', 'entry__unit', T.cardioUnit), date);

  const actions = el('div', 'entry__actions');
  actions.append(button('btn btn--primary entry__save', T.cardioSave, () => saveCardio(value)));

  section.append(row, actions, el('p', 'templates__empty', T.cardioHint));
  return section;
}

// Kar je za ta dan že vpisano, kot besedilo za v polje. Prednapolnjeno polje
// pove, da ponoven vpis prejšnjega prepiše in ne prišteje.
function existingCardio(day) {
  const saved = store.getCardio(day);
  return saved === null ? '' : String(saved);
}

function saveCardio(field) {
  const kcal = parseNumber(cardio);

  // Prazno polje pri vpisanem dnevu pomeni "cardia ta dan ni bilo" — vnos se
  // pobriše. Brez tega pomotoma vpisanega cardia ne bi bilo mogoče odstraniti.
  if (kcal === null) {
    store.removeCardio(cardioDay);
  } else {
    store.setCardio(kcal, cardioDay);
  }

  field.blur();   // tipkovnica naj se umakne; vnos je končan
  paint();
}

function startFromQuery() {
  // Ime, ki se ujema z obstoječo predlogo, odpre to predlogo — tudi če si ga
  // vpisal do konca namesto da bi ga izbral s seznama.
  const existing = store.findTemplateByName(query);
  if (existing) return startWorkout(existing);

  // Brez imena ni treninga. Namesto tihega nič se polje pobarva in dobi kurzor —
  // sicer izgleda, kot da gumb ne dela.
  if (!query.trim()) {
    markEmptyField();
    return;
  }

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
  persist();
  closeKeyboard();   // polje z imenom izgine z zaslona; tipkovnica naj gre z njim
  paint();
}

function repeatTemplate(template) {
  draft.exercises = template.exerciseIds
    // Vaja je lahko medtem izginila iz registra; predloga naj se zato ne sesuje.
    .filter((id) => store.getExercise(id))
    .map((id) => ({ exerciseId: id, sets: [] }));

  persist();
  paint();
}

// Vaja se odpre **brez ene same vrstice**: vsaka serija nastane z gumbom + pod
// njo in nobene ni tam zato, ker jo je nekdo uganil.
//
// Prej se je odprlo toliko praznih vrstic, kolikor si jih naredil zadnjič.
// Odkar ima serija vrsto, bi bilo to ugibanje dvakrat — koliko serij in kakšnih —
// vrstica, ki je nisi naredil, pa se mora pobrisati, in to je dražje od dotika
// na +. Stolpec "zadnjič" pri tem ne izgubi ničesar: ravna se po mestu vrstice,
// zato se prva dodana serija spet primerja s prvo od zadnjič.

// --- Stanje 2: trening teče ------------------------------------------------

function activeView() {
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

  const body = el('div', 'training__body');
  draft.exercises.forEach((entry) => body.append(exerciseCard(entry)));
  body.append(addExerciseButton());

  const actions = el('div', 'training__actions');
  actions.append(button('btn btn--ghost', T.discard, discard));
  actions.append(button('btn btn--primary', T.save, save));

  return [brandRow(nameInput), metaRow(), body, actions];
}

// Datum levo, desno pa ponudba, da se prejšnji trening prepiše sem. Ponudba
// velja samo, dokler ni nobene vaje: ko prvo dodaš, si se odločil za svoje
// zaporedje in gumb izgine, da ga ne bi po nesreči zbrisal.
function metaRow() {
  const row = el('div', 'training__meta');
  row.append(dateField());

  const template = draft.templateId ? store.getTemplate(draft.templateId) : null;
  if (template && template.exerciseIds.length && draft.exercises.length === 0) {
    row.append(button('repeat', T.repeatLast, () => repeatTemplate(template)));
  }

  return row;
}

// Datum treninga in koledarček zraven njega. Privzet je dan, ko je trening
// nastal; koledarček ga zamenja, ker se trening pogosto vpiše šele zvečer ali
// naslednji dan. Ta datum je tisti, s katerim gre trening v zgodovino in na graf
// (glej workoutDate() v store.js).
//
// Polje `<input type="date">` leži **nevidno** čez ikono: dotik gre naravnost
// vanj in sistemski koledar se odpre sam. Gumb, ki bi koledar odpiral iz kode,
// bi delal samo tam, kjer obstaja showPicker() — polje dela povsod.
function dateField() {
  const wrap = el('div', 'training__date');
  const label = el('span', 'training__date-text', T.date + ' ' + formatDate(draft.startedAt));

  const picker = el('label', 'training__calendar');
  withLabel(picker, T.pickDate);
  picker.append(icon('training__calendar-icon', ICON_CALENDAR));

  const input = el('input', 'training__date-input');
  input.type = 'date';
  input.value = dayOfIso(draft.startedAt);
  input.setAttribute('aria-label', T.pickDate);

  input.addEventListener('input', () => {
    // Prazno polje pomeni "Počisti" v sistemskem koledarju. Trening brez datuma
    // ne obstaja, zato ostane prejšnji — isoOnDay() ga vrne nedotaknjenega.
    draft.startedAt = isoOnDay(draft.startedAt, input.value);
    input.value = dayOfIso(draft.startedAt);
    label.textContent = T.date + ' ' + formatDate(draft.startedAt);
    persist();
  });

  // Chrome na računalniku odpre koledar samo ob dotiku ikone v polju, ta pa je
  // tukaj nevidna. Kjer showPicker() ne obstaja (starejši iOS), polje odpre
  // sistemski koledar že samo od sebe in tega klica ne rabi.
  input.addEventListener('click', () => {
    if (typeof input.showPicker !== 'function') return;
    try {
      input.showPicker();
    } catch (error) {
      // Brskalnik klica ni dovolil; polje ostane navadno polje za datum.
    }
  });

  picker.append(input);
  wrap.append(label, picker);
  return wrap;
}

function addExerciseButton() {
  return button('addbar', '+', openExercisePicker);
}

// Okno čez zaslon: iskalno polje na vrhu, pod njim **cel** register vaj po
// abecedi. Tipkanje seznam oži, zadnja vrstica pa naredi vajo, ki je register
// še ne pozna. Vaja, ki je v treningu že zdaj, se ne ponudi drugič.
//
// Filtriranja po imenu treninga tukaj ni več: pri prvem "Legs" je pokazal
// prazen seznam, pri treningu, ki meša sheme, pa je skril ravno tisto vajo, ki
// si jo iskal. Register je skupen, iskanje pa je hitrejše od vsakega filtra.
function openExercisePicker() {
  const added = new Set(draft.exercises.map((entry) => entry.exerciseId));
  const find = (text) => store.searchExercises(text)
    .filter((exercise) => !added.has(exercise.id))
    .map((exercise) => ({ id: exercise.id, name: exercise.name }));

  openSheet({
    title: T.pickExercise,
    items: [],   // seznam napolni search.find(); tukaj ga ni treba dvakrat
    emptyLabel: store.searchExercises('').length ? T.allAdded : T.noExercisesYet,
    search: {
      placeholder: T.searchExercise,
      find,
      newLabel: T.addNewExercise,
      // Vaja, ki je register še ne pozna, se ob dodajanju vanj zapiše. Register
      // tako nastane sam od sebe iz treningov in ga ni treba urejati posebej.
      onNew: (name) => addExercise(store.createExercise(name))
    },
    onPick: (id) => {
      const exercise = store.getExercise(id);
      if (exercise) addExercise(exercise);
    },
    closeLabel: T.close
  });
}

// Prazno polje ob dotiku gumba: rdeč rob in kurzor povesta isto kot okno s
// sporočilom, brez dotika za potrditev.
function markEmptyField() {
  const field = root.querySelector('.field__input');
  if (!field) return;
  field.classList.add('is-error');
  field.focus();
}

function addExercise(exercise) {
  // Ime, ki ga v seznamu ni bilo, ker je vaja v treningu že dodana: store vrne
  // obstoječo vajo in tu se ustavi, sicer bi bila v treningu dvakrat.
  if (draft.exercises.some((entry) => entry.exerciseId === exercise.id)) return;

  draft.exercises.push({ exerciseId: exercise.id, sets: [] });
  persist();

  // Tipkovnico spravimo dol, preden polje pod njo izgine z zaslona. Brez tega
  // iOS ostane v stanju, ko je tipkovnica odprta za element, ki ga ni več —
  // in dotik v novo polje za kilažo takrat ne prijeme.
  closeKeyboard();
  paint();
}

// Odvzame kurzor temu, kar ga ima. Kliče se pred vsakim izrisom, ki odstrani
// polje z zaslona.
function closeKeyboard() {
  const active = document.activeElement;
  if (active && typeof active.blur === 'function') active.blur();
}

// --- Kartica vaje ----------------------------------------------------------

function exerciseCard(entry) {
  const exercise = store.getExercise(entry.exerciseId);
  const card = el('section', 'exercise');

  const head = el('div', 'exercise__head');

  // Ročaj so **samo** pike na desnem robu ploščice, ne cela ploščica: prst, ki
  // se nasloni na ime, mora še vedno drsati po treningu.
  const name = el('div', 'exercise__name');
  name.append(el('span', 'exercise__label', exercise ? exercise.name : T.exerciseName));

  const grip = icon('exercise__grip', ICON_GRIP);
  withLabel(grip, T.moveExercise);
  enableDrag(grip, card);
  name.append(grip);
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

  // Katera vrstica nosi katero številko. Superset, dropset in myoreps številke
  // nimajo, zato je tudi ne porabijo — šteje store, da arhiv pokaže isto.
  const numbers = store.setNumbers(entry.sets);

  const sets = el('div', 'exercise__sets');
  entry.sets.forEach((set, index) => {
    sets.append(setRow(set, numbers[index], entry.sets[index - 1] || null, last, index));
  });
  card.append(sets);

  const controls = el('div', 'exercise__controls');
  controls.append(withLabel(button('mini', '+', () => openSetKindPicker(entry)), T.addSet));

  // Koš stoji ob plusu in odstrani **zadnjo** serijo. Prej je bil v vsaki
  // vrstici posebej, a je tam jemal prostor številkam — najpogostejši razlog
  // zanj pa je ponesreči pritisnjen plus, torej vedno zadnja serija.
  const removeLast = button('mini mini--icon mini--muted', '', () => removeLastSet(entry));
  removeLast.append(icon('mini__icon', ICON_TRASH));
  withLabel(removeLast, T.removeLastSet);
  removeLast.disabled = entry.sets.length === 0;
  controls.append(removeLast);

  // Odstranitev vaje je čisto desno spodaj, najdlje od plusa nad njo.
  controls.append(withLabel(button('mini mini--remove', '×', () => removeExercise(entry)), T.removeExercise));

  card.append(controls);
  return card;
}

// Vprašamo samo, kadar je kaj izgubiti. Prazno vajo, ki si jo pravkar dodal
// po pomoti, odstraniš z enim dotikom.
function removeExercise(entry) {
  if (entry.sets.some(isFilled) && !confirm(T.removeExerciseConfirm)) return;

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

// Pas ob robu drsečega okna, v katerem se stran začne sama pomikati, in
// največja hitrost tega pomika. Pas je širok kot palec: pri dolgem treningu
// vaje ni mogoče odnesti na drug konec, če se mora prst ustaviti pri robu.
const SCROLL_EDGE = 90;    // px
const SCROLL_SPEED = 16;   // px na sličico, pri samem robu

function startDrag(event, card) {
  const cards = Array.from(root.querySelectorAll('.exercise'));
  const from = cards.indexOf(card);
  if (from < 0 || cards.length < 2) return;

  event.preventDefault();

  // Pozicije izmerimo enkrat, na začetku. Med vlečenjem se kartice premikajo
  // samo z zamikom (transform), zato ostanejo te meritve veljavne — dokler jih
  // gledamo v istem okviru, v katerem so bile izmerjene. Zato se pri drsenju
  // vsemu prišteje `scrolled`.
  const rects = cards.map((node) => node.getBoundingClientRect());
  const gap = Math.max(0, rects[1].top - rects[0].bottom);
  const step = rects[from].height + gap;

  const scroller = root.closest('.screen') || root.parentElement;
  const startScroll = scroller ? scroller.scrollTop : 0;
  const startY = event.clientY;

  let pointerY = event.clientY;   // zadnja znana lega prsta
  let to = from;
  let frame = 0;

  card.classList.add('is-dragging');
  root.classList.add('is-reordering');

  // Ena sama pot za izris: kliče jo prst, ki se premakne, in drsenje, ki se
  // zgodi, ko prst miruje ob robu.
  const update = () => {
    const scrolled = scroller ? scroller.scrollTop - startScroll : 0;
    const shift = pointerY - startY + scrolled;
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

  // Bližje kot je prst robu, hitreje drsi. Pri robu samem je hitrost polna,
  // na notranji meji pasu pa nič — brez skoka, ko vanj zapelješ.
  const tick = () => {
    frame = requestAnimationFrame(tick);
    if (!scroller) return;

    const box = scroller.getBoundingClientRect();
    let delta = 0;
    if (pointerY > box.bottom - SCROLL_EDGE) {
      delta = SCROLL_SPEED * ratio(pointerY - (box.bottom - SCROLL_EDGE));
    } else if (pointerY < box.top + SCROLL_EDGE) {
      delta = -SCROLL_SPEED * ratio(box.top + SCROLL_EDGE - pointerY);
    }
    if (!delta) return;

    // Ko je seznam že do konca odrsan, se scrollTop ne premakne in ni česa risati.
    const before = scroller.scrollTop;
    scroller.scrollTop = before + delta;
    if (scroller.scrollTop !== before) update();
  };

  const move = (moveEvent) => {
    pointerY = moveEvent.clientY;
    update();
  };

  const end = () => {
    cancelAnimationFrame(frame);
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
  frame = requestAnimationFrame(tick);
}

// Koliko globoko v pasu ob robu je prst: 0 na notranji meji, 1 pri robu in naprej.
function ratio(depth) {
  return Math.min(1, depth / SCROLL_EDGE);
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

// Kakšen set dodaš. Vrsta se izbere zdaj in se kasneje ne menja: napačno izbrana
// vrstica ima pot nazaj skozi koš ob plusu, prehajanje med vrstami sredi vpisa pa
// bi pomenilo vprašanje, kam gredo že vpisane številke.
function openSetKindPicker(entry) {
  openSheet({
    title: T.pickSetKind,
    items: store.SET_KINDS.map((kind) => ({ id: kind, name: TEXT.setKinds[kind] || kind })),
    onPick: (kind) => {
      entry.sets.push(store.newSet(kind));
      persist();
      paint();
    },
    closeLabel: T.close
  });
}

// Vrstica ene serije. Kaj je v njej, določa `kind`:
//
//   empty                       samo napis čez celo vrstico
//   time                        MM:SS namesto teže in ponovitev
//   band                        elastika namesto teže
//   ostalo                      teža × ponovitve
//
// `number` je zaporedna številka ali `null` (takrat se vrstica imenuje po svoji
// vrsti), `before` je serija nad njo — iz nje se ve, ali gre vmes znamenje.
function setRow(set, number, before, last, index) {
  const kind = store.setKind(set);

  const row = el('div', 'set-row');
  row.append(setLabel(kind, number, before));

  // Prazen set nima česa vpisati in nima česa primerjati: napis zasede celo
  // vrstico. Da je serija bila, je vse, kar pove — in vse, kar naj pove.
  if (kind === 'empty') return row;

  const inputs = el('div', 'pair');

  // Zadnjič se prepiše samo iz serije **iste vrste**: teža dropseta v vrstici,
  // ki je danes navaden set, bi bila napačna številka na pravem mestu.
  const previous = last && last[index] && store.setKind(last[index]) === kind ? last[index] : null;
  const reference = el('div', 'pair pair--ref');

  if (kind === 'time') {
    const time = timeFields(set);
    inputs.append(...time);
    reference.append(referenceTimeBox(previous ? previous.seconds : null, set));
  } else {
    const reps = numberField(set.reps, 'numeric', (value) => {
      set.reps = value;
      persist();
    });

    if (kind === 'band') {
      // Pri elastiki se v prvo škatlico ne vpisuje teža, ampak izbere elastika.
      // Napisa "kg" zato ni: kilogramov tu ni nikjer.
      inputs.append(bandBox(set), el('span', 'pair__times', '×'), reps);
      reference.append(referenceBandBox(previous ? previous.band : null, set));
    } else {
      const weight = numberField(set.weightKg, 'decimal', (value) => {
        set.weightKg = value;
        persist();
      });

      // "kg" stoji ob polju za težo: brez tega ni jasno, kaj se vpisuje v katero
      // polje, ker sta obe škatlici enaki.
      inputs.append(weight, el('span', 'pair__unit', T.unit), el('span', 'pair__times', '×'), reps);
      reference.append(referenceBox(previous ? previous.weightKg : null, weight));
    }

    reference.append(el('span', 'pair__times', '×'), referenceBox(previous ? previous.reps : null, reps));
  }

  row.append(inputs);

  // Desni stolpec: zadnjič. Črta ga loči od današnjih številk in ga hkrati
  // porine ob desni rob kartice — pri novi vaji ni ne enega ne drugega.
  if (last) row.append(el('div', 'set-row__divider'), reference);

  return row;
}

// Napis levo. Oštevilčene vrste povedo, katera po vrsti so, ostale povedo, kaj
// so. Znamenje do serije nad njo visi v razmiku nad napisom.
function setLabel(kind, number, before) {
  const label = el('div', 'set-row__label');
  label.append(el('span', 'set-row__name',
    number === null ? (TEXT.setKinds[kind] || kind) : T.set + ' ' + number));

  const mark = linkMark(kind, before);
  if (mark) label.append(mark);
  return label;
}

// Znamenje med to in prejšnjo vrstico: plus pove, da sta superseta en sklop,
// puščica navzdol, da je dropset nadaljevanje serije nad njim. Svoje vrstice
// nima — visi v razmiku, ki je zaradi njega za malenkost večji.
function linkMark(kind, before) {
  if (!before) return null;

  if (kind === 'superset' && store.setKind(before) === 'superset') {
    return withLabel(el('span', 'set-row__link', '+'), T.supersetLink);
  }
  if (kind === 'dropset') {
    return withLabel(el('span', 'set-row__link', '↓'), T.dropsetLink);
  }
  return null;
}

// Koš ob plusu odstrani zadnjo serijo. Vprašamo samo, kadar je kaj izgubiti —
// prazna vrstica, ki je nastala ob pomotoma pritisnjenem plusu, izgine z enim
// dotikom.
//
// Odstrani lahko tudi **zadnjo** serijo: vaja brez serij je od zdaj običajno
// stanje, saj se prav taka odpre. Prej je zadnja ostala, ker je bila vaja brez
// vrstic videti kot okvara.
function removeLastSet(entry) {
  if (!entry.sets.length) return;

  if (isFilled(entry.sets[entry.sets.length - 1]) && !confirm(T.removeLastSetConfirm)) return;

  entry.sets.pop();
  persist();
  paint();
}

// Ali je v seriji kaj, kar bi se z brisanjem izgubilo. Vsaka vrsta ima svoja
// polja; prazen set jih nima in se zato zbriše brez vprašanja.
function isFilled(set) {
  const kind = store.setKind(set);
  if (kind === 'empty') return false;
  if (kind === 'time') return set.seconds !== null && set.seconds !== undefined;
  if (kind === 'band' && set.band) return true;
  return set.weightKg !== null || set.reps !== null;
}

function numberField(value, mode, onChange) {
  const input = el('input', 'numbox');
  input.type = 'text';        // text + inputMode: številska tipkovnica, brez puščic
  input.inputMode = mode;
  input.value = formatNumber(value);
  fitText(input);

  // Vnos se popravi sproti in ne šele ob shranjevanju: v polju vedno piše
  // natanko to, kar bo šlo v podatke. Odvečna tipka se enostavno ne pozna.
  input.addEventListener('input', () => {
    const limited = limitNumber(input.value, mode === 'decimal');
    if (limited !== input.value) input.value = limited;
    fitText(input);
    onChange(parseNumber(limited));
  });

  return input;
}

// "102,5" je pet znakov in pri polni pisavi zadene ob rob ozke škatlice. Namesto
// da bi se konec skril, se pisava pomanjša.
function fitText(input) {
  input.classList.toggle('is-long', input.value.length > 4);
}

// --- Čas namesto teže in ponovitev -----------------------------------------
//
// Plank, mrtvi obesek, izometrija: pri takem setu ni ne teže ne ponovitev, ampak
// koliko časa si zdržal. V podatkih so sekunde, na zaslonu dve škatlici.

function timeFields(set) {
  // Vpisano živi tukaj in ne v podatkih: dokler tipkaš minute, sekund še ni in
  // seštevek bi se med tipkanjem podvojil, če bi ga vsakič bral nazaj iz `seconds`.
  let minutes = set.seconds === null || set.seconds === undefined
    ? null
    : Math.floor(set.seconds / 60);
  let seconds = set.seconds === null || set.seconds === undefined
    ? null
    : set.seconds % 60;

  // Obe polji prazni pomenita "časa nisem vpisal" in ne "nič sekund".
  const apply = () => {
    set.seconds = minutes === null && seconds === null
      ? null
      : (minutes || 0) * 60 + (seconds || 0);
    persist();
  };

  const mm = numberField(minutes, 'numeric', (value) => { minutes = value; apply(); });
  const ss = numberField(seconds, 'numeric', (value) => { seconds = value; apply(); });
  withLabel(mm, T.minutes);
  withLabel(ss, T.secondsField);

  // Dvopičje in ne "×": to ni zmnožek dveh številk, ampak en sam podatek.
  return [mm, el('span', 'pair__times', ':'), ss];
}

// Ista škatlica v stolpcu "zadnjič": dotik prepiše čas v današnjo serijo.
function referenceTimeBox(seconds, set) {
  const box = el('button', 'numbox numbox--ref', formatTime(seconds));
  box.type = 'button';
  if (box.textContent.length > 4) box.classList.add('is-long');

  if (seconds === null || seconds === undefined) {
    box.disabled = true;
    return box;
  }

  withLabel(box, formatTime(seconds));
  box.addEventListener('click', () => {
    set.seconds = seconds;
    persist();
    paint();
  });
  return box;
}

// --- Elastika --------------------------------------------------------------
//
// Pri setu vrste "Elastika" se ne vpisuje teža, ampak elastika: z njo se dela
// zgib, njena barva in debelina pa povesta, koliko pomaga. Zapiše se v
// `set.band`, kilogrami ostanejo prazni — in prav zato taka serija ne gre na
// graf moči (glej store.js).

// Risba elastike: podolgovata zanka, kakor elastika leži, ko je ne vlečeš.
// Barvo prevzame od besedila (`.band--*` v training.css), debelina poteze pa je
// edina razlika med rdečima — barva je ista, pomoč pa ne.
function bandIcon(band) {
  return '<svg viewBox="0 0 44 26" fill="none" stroke="currentColor" '
    + 'stroke-width="' + (band === 'red-thick' ? 6 : 3.5) + '" aria-hidden="true">'
    + '<ellipse cx="22" cy="13" rx="14.5" ry="4" transform="rotate(-18 22 13)"/></svg>';
}

function bandBox(set) {
  const box = button('numbox numbox--band', '', () => openBandPicker(set));
  paintBand(box, set.band);
  withLabel(box, T.band);
  return box;
}

// Ista škatlica v stolpcu "zadnjič": dotik prepiše elastiko v današnjo serijo,
// tako kot dotik številke prepiše težo.
function referenceBandBox(band, set) {
  const box = el('button', 'numbox numbox--ref numbox--band', '');
  box.type = 'button';
  paintBand(box, band);

  if (!band) {
    box.disabled = true;
    return box;
  }

  withLabel(box, TEXT.bands[band] || band);
  box.addEventListener('click', () => {
    set.band = band;
    persist();
    paint();
  });
  return box;
}

// Elastika je razred in risba, ne slog: barve in debeline so v CSS, koda pozna
// samo imena. "BW" je edina, ki je nima — brez elastike ni česa narisati.
function paintBand(box, band) {
  box.classList.remove(...store.BANDS.map((name) => 'band--' + name));
  box.replaceChildren();
  if (!band) return;

  box.classList.add('band--' + band);
  if (band === 'bw') box.textContent = 'BW';
  else box.append(icon('numbox__band', bandIcon(band)));
}

function openBandPicker(set) {
  const items = store.BANDS.map((band) => ({
    id: band,
    name: TEXT.bands[band] || band,
    swatch: 'band--' + band,
    // Ista risba kot v škatlici: v seznamu izbiraš to, kar boš potem videl.
    swatchIcon: band === 'bw' ? null : bandIcon(band),
    active: set.band === band
  }));

  // Zadnja vrstica pobriše izbiro: ponesreči izbrana elastika mora imeti pot nazaj.
  items.push({ id: '', name: T.bandNone, active: !set.band });

  openSheet({
    title: T.band,
    items,
    onPick: (band) => {
      set.band = band || null;
      persist();
      paint();
    },
    closeLabel: T.close
  });
}

// Klik na številko iz zadnjič jo prepiše v polje levo. En dotik namesto dveh
// tipkanj — največji prihranek pri delu z eno roko.
function referenceBox(value, target) {
  const box = el('button', 'numbox numbox--ref', formatNumber(value));
  box.type = 'button';
  // Ista logika kot pri vnosnem polju: dolga številka se stisne, škatlica ostane.
  if (box.textContent.length > 4) box.classList.add('is-long');

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

  // Ime je polje in ne napis: tipkarska napaka se sicer zapiše v register in
  // ostane tam za vedno. Popravek velja povsod, ker vajo vse ostalo naslavlja
  // z `id` in ne z imenom.
  box.append(renameField(exercise));

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

// Ime vaje v oknu pod svinčnikom. Shrani se sproti, kot zapisek — dokler je ime
// veljavno. Prazno ime ali ime, ki ga ima že druga vaja, se ne zapiše: polje
// dobi rdeč rob in pod njim piše, zakaj.
function renameField(exercise) {
  const wrap = el('div', 'modal__name');

  const input = el('input', 'modal__name-input');
  input.type = 'text';
  input.value = exercise.name;
  input.setAttribute('aria-label', T.exerciseName);
  input.autocomplete = 'off';
  input.autocapitalize = 'words';

  const problem = el('p', 'modal__name-problem', T.nameTaken);
  problem.hidden = true;

  input.addEventListener('input', () => {
    const saved = store.renameExercise(exercise.id, input.value);
    input.classList.toggle('is-error', !saved);
    // Prazno polje je vmesno stanje med tipkanjem in ne napaka; opozorilo je
    // samo za ime, ki je zasedeno.
    problem.hidden = saved || !input.value.trim();
  });

  wrap.append(input, problem);
  return wrap;
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

  // Varnostne kopije tukaj ni. Sama od sebe ne nastane nikjer — naredi se z
  // gumbom *Izvozi zdaj* pod zobnikom (glej js/backup.js).
  store.saveWorkout(draft);

  draft = null;
  query = '';
  paint();
}

// --- Skupni deli obeh stanj ------------------------------------------------

// Vrstica z ikono in naslovom oziroma poljem za ime. Skrajno desno zobnik, na
// vseh treh zaslonih isti in na istem mestu.
function brandRow(titleOrInput) {
  const row = el('div', 'brand');
  row.append(icon('brand__logo', ICON_TRAINING));
  row.append(typeof titleOrInput === 'string'
    ? el('h1', 'brand__title', titleOrInput)
    : titleOrInput);
  row.append(settingsButton());
  return row;
}

// Polje za ime novega treninga: tipkaš, Enter vzame vpisano. Vpisano živi v
// `query`, da ga izris ne pobriše sredi tipkanja.
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
    input.classList.remove('is-error');
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

// --- Modul zaslona ---------------------------------------------------------

export default {
  id: 'training',                 // interni ključ (angleško, brez šumnikov)
  route: 'trening',               // kar piše v naslovu: #/trening
  icon: ICON_TRAINING,            // ikona na kvadratku spodaj
  title: TEXT.screens.training,   // napis; nizi zivijo v js/besedilo.js
  accent: '#9d0f0b',              // barva tega zaslona

  // Router vsakič pokliče to funkcijo na novo, zato se stanje zaslona tukaj
  // postavi na začetek. Edini trajni spomin je shramba: če je v njej trening
  // v teku, se odpre točno tam, kjer si ga pustil.
  render() {
    draft = store.getDraft();
    query = '';
    nameInput = null;
    cardioDay = store.todayIso();
    cardio = existingCardio(cardioDay);

    root = el('div', 'training');
    paint();
    return root;
  }
};
