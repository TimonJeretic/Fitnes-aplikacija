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
import * as backup from '../backup.js';
import { settingsButton } from '../settings.js';
import { ICON_TRAINING, ICON_TRASH } from '../icons.js';
import { el, button, icon, withLabel, parseNumber, limitNumber, formatNumber, formatDate } from '../dom.js';

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
// prevzamejo iz besedila (fill="currentColor"). Ikone, ki jih uporablja več
// zaslonov (utež, koš), živijo v js/icons.js.

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

// Zaslon brez treninga sta dva razdelka: zgoraj treningi, ki jih že poznaš
// (devet dotikov od desetih se konča tukaj), spodaj polje za povsem nov trening.
// Iskalnega polja nad seznamom ni: imen treninga je peščica in seznam je krajši
// od tipkanja.
function idleView() {
  const header = el('header', 'training__header');
  header.append(brandRow(T.newWorkout));

  return [header, pastSection(), el('div', 'rule'), createSection()];
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
  picking = false;
  persist();
  closeKeyboard();   // polje z imenom izgine z zaslona; tipkovnica naj gre z njim
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
    // Kurzorja tukaj namenoma NE postavljamo v polje za novo vajo. Odkar je nad
    // poljem seznam vaj, je izbira s seznama pogostejša od vpisovanja novega
    // imena; tipkovnica bi seznam pokrila, na iPhonu pa je ostala odprta tudi
    // potem, ko je bilo polje že odstranjeno z zaslona — in naslednji dotik v
    // polje za kilažo ni prijel.
  });
}

// Zgoraj register vaj po abecedi, spodaj okvir za novo vajo — ista postavitev
// kot "Pretekli treningi" in "Ustvari nov trening" na praznem zaslonu. Kar se
// dela z istimi koraki, naj tudi izgleda enako.
function exercisePicker() {
  const wrap = el('div', 'picker');

  const section = el('section', 'training__section');
  section.append(el('h2', 'section__title', T.pickExercise));

  // Ponudijo se vaje tega treninga — iz predloge in iz zgodovine treningov z
  // istim imenom. Pri "Pull" torej ni vaj, ki jih delaš pri "Push".
  // Ime treninga, ki ga še ni bilo, nima česa ponuditi; takrat se ponudi cel
  // register, sicer bi bil izbirnik ob prvem "Legs" prazen.
  const forName = store.exercisesForWorkoutName(draft.name);
  const source = forName.length ? forName : store.searchExercises('');

  // Vaja, ki je v treningu že zdaj, se ne ponudi drugič.
  const added = new Set(draft.exercises.map((entry) => entry.exerciseId));
  const known = source.filter((exercise) => !added.has(exercise.id));

  if (known.length) {
    const list = el('div', 'suggest');
    known.forEach((exercise) => list.append(suggestion(exercise.name, null, () => addExercise(exercise))));
    section.append(list);
  } else {
    section.append(el('p', 'templates__empty', source.length ? T.allAdded : T.noExercisesYet));
  }
  wrap.append(section);

  wrap.append(el('div', 'rule'));

  // Nova vaja. Gumb Potrdi je tukaj in ne pri vsaki vrstici seznama: ko vajo
  // potrdiš, se cel okvir zapre in se prikaže spet ob naslednjem plusu.
  const create = el('section', 'training__section');
  create.append(el('h2', 'section__title', T.newExercise));
  create.append(searchField(T.exerciseName, () => {}, () => addExerciseByName(query)));
  create.append(button('btn btn--primary', T.confirm, () => addExerciseByName(query)));
  wrap.append(create);

  // Klik mimo zapre okvir, da plus spet zasede svoje mesto.
  wrap.append(button('picker__cancel', T.close, () => {
    picking = false;
    query = '';
    closeKeyboard();
    paint();
  }));

  return wrap;
}

// Vaja, ki je register še ne pozna, se ob dodajanju vanj zapiše. Tako seznam
// vaj nastane sam od sebe iz treningov in ga ni treba nikoli urejati posebej.
function addExerciseByName(name) {
  if (!String(name).trim()) {
    markEmptyField();
    return;
  }
  addExercise(store.createExercise(name));
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
  draft.exercises.push({ exerciseId: exercise.id, sets: blankSets(exercise.id) });
  picking = false;
  query = '';
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

  // Gumba za odstranitev zadnje serije tukaj ni: koš na koncu vsake vrstice
  // odstrani točno tisto serijo, kar je isto dejanje in brez ugibanja, katera
  // bo šla.

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

  // "kg" stoji ob polju za težo: brez tega ni jasno, kaj se vpisuje v katero
  // polje, ker sta obe škatlici enaki.
  const inputs = el('div', 'pair');
  inputs.append(weight, el('span', 'pair__unit', T.unit), el('span', 'pair__times', '×'), reps);
  row.append(inputs);

  // Desni stolpec: zadnjič. Pri novi vaji ga ni — in z njim odpade tudi njegova
  // črta, sicer bi se ob črti pred košem videli dve črti druga ob drugi.
  if (last) {
    row.append(el('div', 'set-row__divider'));

    const previous = last[index] || null;
    const reference = el('div', 'pair pair--ref');
    reference.append(
      referenceBox(previous ? previous.weightKg : null, weight),
      el('span', 'pair__times', '×'),
      referenceBox(previous ? previous.reps : null, reps)
    );
    row.append(reference);
  }

  // Koš čisto desno, za svojo črto: odstrani natanko to serijo. Najpogostejši
  // razlog je pomotoma pritisnjen plus, zato mora biti dosegljiv v vrstici sami.
  row.append(el('div', 'set-row__divider set-row__divider--end'));

  const remove = button('set-row__remove', '', () => removeSet(entry, index, set));
  remove.append(icon('set-row__icon', ICON_TRASH));
  withLabel(remove, T.removeSet);
  // Vaja brez serij nima kaj pokazati: zadnja vrstica ostane, vaja pa se
  // odstrani z × spodaj desno na kartici.
  remove.disabled = entry.sets.length < 2;
  row.append(remove);

  return row;
}

// Vprašamo samo, kadar je kaj izgubiti — prazna vrstica, ki je nastala ob
// pomotoma pritisnjenem plusu, izgine z enim dotikom.
function removeSet(entry, index, set) {
  const filled = set.weightKg !== null || set.reps !== null;
  if (filled && !confirm(T.removeSetConfirm)) return;

  entry.sets.splice(index, 1);
  persist();
  paint();
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

  // Varnostna kopija takoj za shranjevanjem. Klic stoji tu in ne v store.js, ker se
  // osnutek shranjuje ob vsakem dotiku — kopija ob vsaki seriji bi bila nesmisel.
  // Napake ne vrže: trening je shranjen ne glede na to, kako se kopija konča,
  // kaj je šlo narobe pa piše v nastavitvah.
  backup.afterSave();

  draft = null;
  query = '';
  picking = false;
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
  icon: ICON_TRAINING,            // ikona na kvadratku spodaj
  title: TEXT.screens.training,   // napis; nizi zivijo v js/besedilo.js
  accent: '#9d0f0b',              // barva tega zaslona

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
