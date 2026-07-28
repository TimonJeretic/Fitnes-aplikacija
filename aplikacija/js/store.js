// Shramba: edina pot do podatkov. Nihče drug ne kliče localStorage neposredno.
//
// Zakaj tako: če bo podatkov kdaj preveč za localStorage, se zamenja samo ta
// datoteka, zasloni pa ostanejo nedotaknjeni. Zato so tukaj tudi poizvedbe
// (kaj sem delal zadnjič, katera imena se ujemajo z vpisanim) — zaslon vpraša,
// ne brska sam.
//
// Oblika podatkov je opisana v Claude_kontekst/podatkovni-model.md.

const KEY = 'fitnes';
const SCHEMA_VERSION = 1;

function emptyData() {
  return {
    schemaVersion: SCHEMA_VERSION,
    exercises: [],          // register vaj: vsaka vaja obstaja natanko enkrat
    templates: [],          // predloga = ime treninga + zaporedje vaj
    workouts: [],           // zgodovina: vsak shranjen trening ostane tukaj
    bodyweightEntries: [],  // telesna teža (zaslon TEŽA, še ni v uporabi)
    draft: null             // trening v teku
  };
}

// Naključen id. crypto.randomUUID() obstaja samo na HTTPS ali localhost;
// rezerva je za primer, ko aplikacija teče drugje in bi klic vrgel napako.
export function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

// --- Branje in pisanje -----------------------------------------------------

let data = null;   // podatki živijo v pomnilniku, localStorage je trajni odtis

// Iz shranjenega objekta naredi objekt, na katerega se koda lahko zanese.
// Ko se struktura kdaj spremeni, se tukaj doda pretvorba iz starejše verzije.
// Brez tega bi posodobitev aplikacije pobrisala zgodovino treningov.
function migrate(raw) {
  if (!raw || typeof raw !== 'object') return emptyData();

  const base = emptyData();
  return {
    schemaVersion: SCHEMA_VERSION,
    exercises: Array.isArray(raw.exercises) ? raw.exercises : base.exercises,
    templates: Array.isArray(raw.templates) ? raw.templates : base.templates,
    workouts: Array.isArray(raw.workouts) ? raw.workouts : base.workouts,
    bodyweightEntries: Array.isArray(raw.bodyweightEntries)
      ? raw.bodyweightEntries
      : base.bodyweightEntries,
    draft: raw.draft && typeof raw.draft === 'object' ? raw.draft : null
  };
}

function read() {
  if (data) return data;
  try {
    data = migrate(JSON.parse(localStorage.getItem(KEY)));
  } catch (error) {
    // Pokvarjen zapis ne sme pustiti aplikacije v mrtvem stanju.
    console.warn('Podatkov ni bilo mogoce prebrati, zacenjam prazno.', error);
    data = emptyData();
  }
  return data;
}

function write() {
  try {
    localStorage.setItem(KEY, JSON.stringify(read()));
  } catch (error) {
    // Poln ali izklopljen localStorage (npr. zasebni način v Safariju).
    console.warn('Shranjevanje ni uspelo.', error);
  }
}

// --- Imena -----------------------------------------------------------------

// Strešice, ki jih normalize('NFD') odlomi od črke. Zapisano s šiframi in ne
// z znaki, ker so ti znaki v urejevalniku nevidni in bi jih kdo nehote pobrisal.
const DIACRITICS = new RegExp('[\\u0300-\\u036f]', 'g');

// Ime za primerjanje: brez velikih črk, brez šumnikov, brez odvečnih presledkov.
// "Počepi " in "pocepi" sta ista vaja — v telovadnici nihče ne tipka natančno.
export function normalizeName(name) {
  return String(name || '')
    .normalize('NFD')          // razstavi "č" na "c" + strešico
    .replace(DIACRITICS, '')   // in strešico vrže stran
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

// Iskanje po imenu. Prazno iskanje vrne vse, da je seznam viden že ob dotiku
// polja — trening, ki ga delaš vsak teden, izbereš brez tipkanja.
function search(items, query) {
  const needle = normalizeName(query);
  if (!needle) return items.slice();

  return items
    .filter((item) => normalizeName(item.name).includes(needle))
    // Ujemanja na začetku imena so prva: "Pu" najprej ponudi Push in Pull.
    .sort((a, b) => normalizeName(a.name).indexOf(needle) - normalizeName(b.name).indexOf(needle));
}

// --- Vaje ------------------------------------------------------------------

export function searchExercises(query) {
  return search(read().exercises, query);
}

export function getExercise(id) {
  return read().exercises.find((exercise) => exercise.id === id) || null;
}

export function findExerciseByName(name) {
  const needle = normalizeName(name);
  if (!needle) return null;
  return read().exercises.find((exercise) => normalizeName(exercise.name) === needle) || null;
}

// Vrne obstoječo vajo ali jo ustvari. Register vaj nastane izključno tako:
// iz imen, ki jih Timon vpiše med treningom. Vnaprej pripravljene baze ni.
export function createExercise(name) {
  const existing = findExerciseByName(name);
  if (existing) return existing;

  const exercise = {
    id: newId(),
    name: String(name).trim(),
    note: '',
    createdAt: new Date().toISOString()
  };
  read().exercises.push(exercise);
  write();
  return exercise;
}

// Zapisek je vezan na vajo in ne na trening (nastavitev stola, elastika), zato
// se shrani takoj in velja tudi naslednjič. "Zavrži" ga ne razveljavi.
export function setExerciseNote(id, note) {
  const exercise = getExercise(id);
  if (!exercise) return;
  exercise.note = String(note);
  write();
}

// --- Predloge --------------------------------------------------------------

export function searchTemplates(query) {
  return search(read().templates, query);
}

export function getTemplate(id) {
  return read().templates.find((template) => template.id === id) || null;
}

export function findTemplateByName(name) {
  const needle = normalizeName(name);
  if (!needle) return null;
  return read().templates.find((template) => normalizeName(template.name) === needle) || null;
}

// Ustvari ali prepiše predlogo. Prepis je namerni del zanke: ko shraniš trening,
// v katerem si zamenjal vajo, je od zdaj naprej to tvoj Push.
export function upsertTemplate(name, exerciseIds) {
  const clean = String(name).trim();
  const existing = findTemplateByName(clean);
  const now = new Date().toISOString();

  if (existing) {
    existing.name = clean;                    // obdrži črkovanje iz zadnjega vnosa
    existing.exerciseIds = exerciseIds.slice();
    existing.updatedAt = now;
    write();
    return existing;
  }

  const template = { id: newId(), name: clean, exerciseIds: exerciseIds.slice(), updatedAt: now };
  read().templates.push(template);
  write();
  return template;
}

// --- Zgodovina -------------------------------------------------------------

function workoutsNewestFirst() {
  return read().workouts.slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

// Serije te vaje iz zadnjega treninga, v katerem se je pojavila — ne glede na
// ime treninga. Če si bench delal v Push in v Upper, šteje tisto, kar je bilo
// nazadnje: to je številka, ki jo hočeš prekositi.
export function lastSetsFor(exerciseId) {
  for (const workout of workoutsNewestFirst()) {
    const entry = (workout.exercises || []).find((item) => item.exerciseId === exerciseId);
    if (entry && entry.sets && entry.sets.length) return entry.sets;
  }
  return null;
}

// --- Trening v teku --------------------------------------------------------

export function getDraft() {
  return read().draft;
}

// Kliče se ob vsaki spremembi. Telefon se v telovadnici zaklene in sistem
// aplikacijo ubije — ob vrnitvi mora biti trening cel.
export function saveDraft(draft) {
  read().draft = draft;
  write();
}

export function clearDraft() {
  read().draft = null;
  write();
}

// Shrani trening v zgodovino in posodobi predlogo.
// Prazne serije se zavržejo, predloga pa dobi vse vaje — tudi tiste, ki jih
// danes nisi uspel narediti; naslednjič naj se spet ponudijo.
export function saveWorkout(draft) {
  const exercises = (draft.exercises || [])
    .map((entry) => ({
      exerciseId: entry.exerciseId,
      sets: (entry.sets || []).filter((set) => set.weightKg !== null || set.reps !== null)
    }))
    .filter((entry) => entry.sets.length > 0);

  const template = upsertTemplate(
    draft.name,
    (draft.exercises || []).map((entry) => entry.exerciseId)
  );

  const workout = {
    id: newId(),
    name: String(draft.name).trim(),
    templateId: template.id,
    date: new Date().toISOString(),
    exercises
  };

  read().workouts.push(workout);
  read().draft = null;
  write();
  return workout;
}
