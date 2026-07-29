// Shramba: edina pot do podatkov. Nihče drug ne kliče localStorage neposredno.
//
// Zakaj tako: če bo podatkov kdaj preveč za localStorage, se zamenja samo ta
// datoteka, zasloni pa ostanejo nedotaknjeni. Zato so tukaj tudi poizvedbe
// (kaj sem delal zadnjič, katera imena se ujemajo z vpisanim) — zaslon vpraša,
// ne brska sam.
//
// Oblika podatkov je opisana v Claude_kontekst/podatkovni-model.md.

const KEY = 'fitnes';
const SCHEMA_VERSION = 3;

function emptyData() {
  return {
    schemaVersion: SCHEMA_VERSION,
    exercises: [],           // register vaj: vsaka vaja obstaja natanko enkrat
    templates: [],           // predloga = ime treninga + zaporedje vaj
    workouts: [],            // zgodovina: vsak shranjen trening ostane tukaj
    bodyweightEntries: [],   // telesna teža
    measurements: [],        // register meritev telesa: roka, prsi, pas …
    measurementEntries: [],  // izmerjene vrednosti, vsaka veže se na eno meritev
    draft: null              // trening v teku
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
    // Verzija 3: vaja ve, ali se izvaja z lastno težo. Stare vaje tega polja
    // nimajo in dobijo false — brez tega bi bilo `undefined`, kar bi graf moči
    // tiho obravnaval drugače kot izrecno izbrani "ne".
    exercises: Array.isArray(raw.exercises) ? raw.exercises.map(cleanExercise) : base.exercises,
    templates: Array.isArray(raw.templates) ? raw.templates : base.templates,
    workouts: Array.isArray(raw.workouts) ? raw.workouts : base.workouts,
    bodyweightEntries: Array.isArray(raw.bodyweightEntries)
      ? raw.bodyweightEntries
      : base.bodyweightEntries,
    // Verzija 2: register meritev telesa in njihovi vnosi. Stari zapis ju nima,
    // zato ju dobi prazna — zgodovina treningov pri tem ostane nedotaknjena.
    measurements: Array.isArray(raw.measurements) ? raw.measurements : base.measurements,
    measurementEntries: Array.isArray(raw.measurementEntries)
      ? raw.measurementEntries
      : base.measurementEntries,
    draft: raw.draft && typeof raw.draft === 'object' ? raw.draft : null
  };
}

// Vaja iz shrambe, dopolnjena do oblike, na katero se koda lahko zanese.
function cleanExercise(exercise) {
  if (!exercise || typeof exercise !== 'object') return exercise;
  if (typeof exercise.usesBodyweight === 'boolean') return exercise;
  return Object.assign({}, exercise, { usesBodyweight: false });
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
    // Privzeto ne: vaj z utežmi je veliko več, lastna teža pa je izbira, ki jo
    // narediš enkrat na vajo v oknu pod svinčnikom.
    usesBodyweight: false,
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

// Ali se vaja izvaja z lastno težo (zgibi, sklece, dipsi). Vpliva samo na graf
// moči: tam se telesna teža prišteje, ker `weightKg` pri takih vajah pomeni
// **dodano** težo (pas z utežjo), ne skupne.
//
// Zakaj izrecno polje in ne ugibanje iz podatkov: prazen `weightKg` pomeni
// "lastna teža ALI nisem vpisal". Brez tega polja bi enkrat pozabljena teža pri
// benchu za vedno spremenila bench v vajo z lastno težo.
export function setExerciseBodyweight(id, value) {
  const exercise = getExercise(id);
  if (!exercise) return;
  exercise.usesBodyweight = !!value;
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

// Predloga s seznama na zaslonu TRENING. Zgodovina se pri tem NE dotakne:
// shranjeni treningi hranijo svoje vaje sami, `templateId` pa je samo namig,
// iz česa je trening nastal. Zato brisanje predloge ne more požreti podatkov —
// samo pospravi seznam, ko se ime treninga ne uporablja več.
export function removeTemplate(id) {
  const all = read();
  all.templates = all.templates.filter((template) => template.id !== id);
  write();
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

// Trening hrani poln časovni žig, teža in graf pa delata z dnevi ('YYYY-MM-DD').
// Dan beremo iz lokalnega časa in ne z .toISOString().slice(0, 10): ta vzame UTC
// in bi trening, shranjen ob pol enih zvečer poleti, uvrstil na naslednji dan.
function localDay(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return todayIso();

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return date.getFullYear() + '-' + month + '-' + day;
}

// Najnovejši prvi — v arhivu iščeš skoraj vedno zadnje treninge.
export function listWorkouts() {
  return workoutsNewestFirst().map((workout) => ({
    id: workout.id,
    name: workout.name,
    date: workout.date,
    day: localDay(workout.date),
    exerciseCount: (workout.exercises || []).length
  }));
}

// Iskalni niz treninga: ime in datum v vseh oblikah, v katerih bi ga kdo tipkal.
// Zato "push", "2026", "julij" ne, ampak "7", "29.7" in "29. 7. 2026" vse najdejo
// isti trening — brez posebne logike za razčlenjevanje datumov v iskanju.
function workoutHaystack(workout) {
  const day = localDay(workout.date);
  const parts = day.split('-');
  const slovenian = Number(parts[2]) + '. ' + Number(parts[1]) + '. ' + parts[0];

  return normalizeName(
    workout.name + ' ' + day + ' ' + slovenian + ' ' + slovenian.replace(/ /g, '')
  );
}

export function searchWorkouts(query) {
  const needle = normalizeName(query);
  const all = listWorkouts();
  if (!needle) return all;

  const byId = new Map(read().workouts.map((workout) => [workout.id, workout]));
  return all.filter((workout) => workoutHaystack(byId.get(workout.id)).includes(needle));
}

// Trening z razrešenimi imeni vaj. Shranjen trening hrani samo `exerciseId`,
// zaslon pa ne sme sam brskati po registru vaj — zato razrešitev pripada sem.
// `name: null` pomeni, da vaje v registru ni več; napis za to je stvar zaslona.
export function getWorkoutView(id) {
  const workout = read().workouts.find((item) => item.id === id);
  if (!workout) return null;

  const day = localDay(workout.date);

  return {
    id: workout.id,
    name: workout.name,
    date: workout.date,
    day,
    exercises: (workout.exercises || []).map((entry) => {
      const exercise = getExercise(entry.exerciseId);
      const sets = entry.sets || [];
      return {
        exerciseId: entry.exerciseId,
        name: exercise ? exercise.name : null,
        note: exercise ? exercise.note : '',
        usesBodyweight: exercise ? !!exercise.usesBodyweight : false,
        sets,
        best: bestSet(sets, exercise, day)
      };
    })
  };
}

// --- Moč -------------------------------------------------------------------
//
// Ocena največje teže za eno ponovitev (1RM) iz opravljene serije. Formula je
// Timonova:
//
//     1RM = W * (1 + (sqrt(reps) - 1) / 5)
//
// Pri eni ponovitvi vrne točno W. Ker raste s korenom in ne premo, obteži
// razliko med 2 in 4 ponovitvami močneje kot med 18 in 20 — kar je res, saj je
// dvig s treh na pet ponovitev veliko težji od dviga z osemnajstih na dvajset.
// Prav zato tudi ne rabi zgornje meje ponovitev, ki jo premočrtne formule
// (Epley) potrebujejo, da pri dvajsetih ponovitvah ne pobegnejo v nesmisel.
//
// Ocena se NE shranjuje. Izračun je poceni, shranjena vrednost pa bi pomenila,
// da bi popravek formule zahteval predelavo cele zgodovine.
export function estimate1RM(weightKg, reps) {
  if (!Number.isFinite(weightKg) || !Number.isFinite(reps) || reps < 1) return null;
  return weightKg * (1 + (Math.sqrt(reps) - 1) / 5);
}

// Telesna teža na določen dan: zadnje tehtanje na ta dan ali pred njim. Če si se
// začel tehtati šele kasneje, vzame prvo znano — boljša groba ocena kot prazen
// graf. Brez enega samega tehtanja vrne null in vaje z lastno težo ostanejo brez
// grafa, dokler na zaslonu TEŽA ne vpišeš prve številke.
export function bodyweightAt(day) {
  const entries = getBodyweightEntries();   // najstarejši prvi
  if (!entries.length) return null;

  let found = null;
  for (const entry of entries) {
    if (String(entry.date) <= String(day)) found = entry;
    else break;
  }
  return (found || entries[0]).weightKg;
}

// Teža, s katero je bila serija res narejena. Pri vaji z lastno težo je
// `weightKg` **dodana** teža (pas pri dipsih), zato se prišteje telesna;
// prazno polje takrat pomeni čisto lastno težo in ne manjkajočega podatka.
function effectiveWeight(set, exercise, day) {
  if (exercise && exercise.usesBodyweight) {
    const body = bodyweightAt(day);
    if (body === null) return null;
    return body + (set.weightKg || 0);
  }
  return set.weightKg;
}

// Najboljša serija vaje v enem treningu: tista z najvišjo oceno 1RM. Namenoma
// najboljša in ne povprečje — ogrevalne serije ne smejo vleči krivulje navzdol.
function bestSet(sets, exercise, day) {
  let best = null;

  for (const set of sets) {
    const weight = effectiveWeight(set, exercise, day);
    if (weight === null || weight === undefined) continue;

    const value = estimate1RM(weight, set.reps);
    if (value === null) continue;

    if (!best || value > best.e1rm) {
      best = { weightKg: set.weightKg, reps: set.reps, totalKg: weight, e1rm: value };
    }
  }

  return best;
}

// Vaje, ki so vsaj enkrat v zgodovini. Vaja, ki je bila samo dodana v predlogo,
// nima česa pokazati na grafu, zato se v izbirniku sploh ne ponudi.
export function searchTrainedExercises(query) {
  const counts = new Map();
  for (const workout of read().workouts) {
    for (const entry of workout.exercises || []) {
      counts.set(entry.exerciseId, (counts.get(entry.exerciseId) || 0) + 1);
    }
  }

  const trained = read().exercises.filter((exercise) => counts.has(exercise.id));
  return search(trained, query).map((exercise) =>
    Object.assign({}, exercise, { workoutCount: counts.get(exercise.id) })
  );
}

// Najboljša ocena 1RM te vaje po treningih, najstarejši prvi — točke za graf.
// Prehod čez vse treninge je sprejeta cena gnezdenega zapisa
// (Claude_kontekst/odlocitve.md); pri nekaj sto treningih je to nič.
//
// Vrne { points, needsBodyweight }. `needsBodyweight` pove, da vaja je z lastno
// težo, serije obstajajo, manjka pa tehtanje — takrat zaslon ne pokaže praznega
// grafa, ampak razlog.
export function strengthSeries(exerciseId) {
  const exercise = getExercise(exerciseId);
  const points = [];
  let missingBodyweight = false;

  for (const workout of read().workouts) {
    const entry = (workout.exercises || []).find((item) => item.exerciseId === exerciseId);
    if (!entry) continue;

    const day = localDay(workout.date);
    const best = bestSet(entry.sets || [], exercise, day);

    if (!best) {
      if (exercise && exercise.usesBodyweight && bodyweightAt(day) === null) {
        missingBodyweight = true;
      }
      continue;
    }

    points.push({
      date: day,
      value: best.e1rm,
      weightKg: best.weightKg,
      reps: best.reps,
      totalKg: best.totalKg,
      workoutName: workout.name
    });
  }

  points.sort((a, b) => a.date.localeCompare(b.date));
  return { points, needsBodyweight: missingBodyweight && points.length === 0 };
}

// --- Telesna teža in meritve -----------------------------------------------
//
// Datum je tukaj ISO **dan** ('2026-07-29'), ne poln časovni žig kot pri treningu.
// Razloga sta dva: <input type="date"> daje in jemlje točno to obliko, tehtanje pa
// je dejstvo dneva — poln žig bi ob pretvorbi v UTC vnos znal premakniti na sosednji
// dan. Nizi te oblike se sortirajo leksikografsko enako kot po času.
//
// Na en dan gre en vnos. Ponoven vpis istega dne obstoječega prepiše: popravek
// tipkarske napake je s tem ponoven vpis, graf pa nima dveh točk na isti dan.

// Današnji dan v lokalnem času. new Date().toISOString() vzame UTC in bi v
// Sloveniji tik po polnoči ponudil včerajšnji datum, zato niz sestavimo sami.
export function todayIso() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return now.getFullYear() + '-' + month + '-' + day;
}

// Iz česarkoli naredi veljaven dan. Prazno ali skvarjeno polje pomeni danes —
// vnos brez datuma je manj uporaben kot vnos z napačnim.
function cleanDay(value) {
  const text = String(value || '').slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : todayIso();
}

function oldestFirst(entries) {
  return entries.slice().sort((a, b) => String(a.date).localeCompare(String(b.date)));
}

// Graf riše od leve proti desni, zato je najstarejši vnos prvi.
export function getBodyweightEntries() {
  return oldestFirst(read().bodyweightEntries);
}

export function addBodyweight(weightKg, date) {
  const value = Number(weightKg);
  if (!Number.isFinite(value)) return null;

  const day = cleanDay(date);
  const entries = read().bodyweightEntries;

  const existing = entries.find((entry) => entry.date === day);
  if (existing) {
    existing.weightKg = value;
    write();
    return existing;
  }

  const entry = { id: newId(), date: day, weightKg: value };
  entries.push(entry);
  write();
  return entry;
}

export function removeBodyweight(id) {
  const all = read();
  all.bodyweightEntries = all.bodyweightEntries.filter((entry) => entry.id !== id);
  write();
}

// Register meritev nastane enako kot register vaj: iz imen, ki jih Timon vpiše.
// Vnaprej pripravljenega seznama delov telesa ni. Meritev je vedno v centimetrih.
export function searchMeasurements(query) {
  return search(read().measurements, query);
}

export function getMeasurement(id) {
  return read().measurements.find((measurement) => measurement.id === id) || null;
}

export function findMeasurementByName(name) {
  const needle = normalizeName(name);
  if (!needle) return null;
  return read().measurements.find(
    (measurement) => normalizeName(measurement.name) === needle
  ) || null;
}

// "Roka", "roka" in "ROKA" so ista meritev — primerjava gre skozi normalizeName().
export function createMeasurement(name) {
  const existing = findMeasurementByName(name);
  if (existing) return existing;

  const measurement = {
    id: newId(),
    name: String(name).trim(),
    createdAt: new Date().toISOString()
  };
  read().measurements.push(measurement);
  write();
  return measurement;
}

export function getMeasurementEntries(measurementId) {
  return oldestFirst(
    read().measurementEntries.filter((entry) => entry.measurementId === measurementId)
  );
}

export function addMeasurementEntry(measurementId, valueCm, date) {
  const value = Number(valueCm);
  if (!measurementId || !Number.isFinite(value)) return null;

  const day = cleanDay(date);
  const entries = read().measurementEntries;

  const existing = entries.find(
    (entry) => entry.measurementId === measurementId && entry.date === day
  );
  if (existing) {
    existing.valueCm = value;
    write();
    return existing;
  }

  const entry = { id: newId(), measurementId, date: day, valueCm: value };
  entries.push(entry);
  write();
  return entry;
}

export function removeMeasurementEntry(id) {
  const all = read();
  all.measurementEntries = all.measurementEntries.filter((entry) => entry.id !== id);
  write();
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
