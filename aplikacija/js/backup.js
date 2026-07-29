// Varnostna kopija podatkov v datoteko na napravi.
//
// Kaj je sploh mogoče, se med sistemi močno razlikuje, zato so načini trije. Kateri
// velja, se ne ugiba iz imena brskalnika — ta se lažejo in seznami naprav se starajo —
// ampak iz tega, ali funkcija sploh obstaja:
//
//   directory  mapo izbereš enkrat, aplikacija vanjo tiho piše (namizje, morda Android)
//   share      sistemsko okno za deljenje ob vsakem shranjevanju (iPhone)
//   download   navaden prenos v mapo Prenosi, zasilni izhod
//
// V izbrani mapi nastaneta dve datoteki. `fitnes-kopija.json` se ob vsakem
// shranjevanju prepiše in je vedno zadnje stanje; `fitnes-YYYY-MM-DD.json` nastane
// enkrat na dan. Tako je mogoče stopiti korak nazaj, mapa pa se ne zalije s stotinami
// datotek. Zakaj tako, piše v Claude_kontekst/odlocitve.md.
//
// Prvo pravilo te datoteke: **kopija ne sme nikoli podreti shranjevanja.** Trening je
// shranjen, še preden se tukaj karkoli zgodi, in vsaka napaka konča v stanju kopije
// (store.getBackupState) namesto v izjemi, ki bi prišla do zaslona.

import * as store from './store.js';

const CURRENT_FILE = 'fitnes-kopija.json';

// Ročaj mape je objekt in ne niz, zato ga localStorage ne zna shraniti — IndexedDB
// pa ga zna. To je edini razlog za to bazo; nič drugega v aplikaciji je ne rabi.
const DB_NAME = 'fitnes-backup';
const DB_STORE = 'handles';
const HANDLE_KEY = 'directory';

// --- Kaj zna ta naprava ----------------------------------------------------

export function canPickFolder() {
  return typeof window.showDirectoryPicker === 'function';
}

function canShareFiles() {
  return typeof navigator.share === 'function'
    && typeof navigator.canShare === 'function';
}

// --- Ročaj mape v IndexedDB ------------------------------------------------

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(DB_STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function withStore(mode, run) {
  return openDb().then((db) => new Promise((resolve, reject) => {
    const request = run(db.transaction(DB_STORE, mode).objectStore(DB_STORE));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  }));
}

// Zasebni način brskanja IndexedDB zavrne. Takrat ročaja ni in način pade na
// deljenje ali prenos — kar je še vedno bolje kot zaslon z napako.
function readHandle() {
  return withStore('readonly', (place) => place.get(HANDLE_KEY)).catch(() => null);
}

function writeHandle(handle) {
  return withStore('readwrite', (place) => place.put(handle, HANDLE_KEY)).catch(() => null);
}

// Dovoljenje za pisanje se lahko izgubi (nova seja, uporabnik ga je odvzel).
// requestPermission() rabi dotik, zato se ta pot vedno požene iz gumba.
async function ensurePermission(handle) {
  if (!handle.queryPermission) return true;

  const options = { mode: 'readwrite' };
  if ((await handle.queryPermission(options)) === 'granted') return true;
  return (await handle.requestPermission(options)) === 'granted';
}

// --- Pisanje ---------------------------------------------------------------

async function writeFile(folder, name, text) {
  const file = await folder.getFileHandle(name, { create: true });
  const stream = await file.createWritable();
  await stream.write(text);
  await stream.close();
}

async function writeToFolder(folder) {
  const text = store.exportJson();
  await writeFile(folder, CURRENT_FILE, text);

  // Dnevna kopija nastane samo, če je danes še ni. Če ta zapis pade, se `day` ne
  // premakne in poskus se ponovi ob naslednjem shranjevanju.
  const day = store.todayIso();
  if (store.getBackupState().day !== day) {
    await writeFile(folder, 'fitnes-' + day + '.json', text);
  }

  store.setBackupState({ at: new Date().toISOString(), day, folder: folder.name, error: null });
}

// Okno za deljenje (iPhone). Pot do njega ne sme imeti nobenega `await` pred klicem:
// brskalnik deljenje dovoli samo neposredno iz dotika, čakanje pa to dovoljenje
// porabi in klic zavrne.
function shareFile() {
  const text = store.exportJson();
  const name = 'fitnes-' + store.todayIso() + '.json';
  const file = new File([text], name, { type: 'application/json' });

  if (!navigator.canShare({ files: [file] })) return download(text, name);

  return navigator.share({ files: [file], title: name }).then(
    () => {
      remember();
      return 'share';
    },
    (error) => {
      // Preklic ni napaka: uporabnik si je premislil in kopije preprosto ni.
      if (error && error.name === 'AbortError') return 'cancelled';
      store.setBackupState({ error: String((error && error.message) || error) });
      return 'error';
    }
  );
}

function download(text, name) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));

  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();

  // Naslov se sme sprostiti šele, ko je prenos stekel.
  setTimeout(() => URL.revokeObjectURL(url), 10000);

  remember();
  return 'download';
}

function remember() {
  store.setBackupState({ at: new Date().toISOString(), day: store.todayIso(), error: null });
}

// --- Kar uporablja zaslon --------------------------------------------------

// Izbira mape. Prva kopija nastane takoj, da je očitno, da je gumb nekaj naredil.
export async function pickFolder() {
  const folder = await window.showDirectoryPicker({
    id: 'fitnes-backup',
    mode: 'readwrite',
    startIn: 'documents'
  });

  if (!(await ensurePermission(folder))) throw new Error('Dovoljenja za pisanje ni.');

  await writeHandle(folder);
  await writeToFolder(folder);
  return folder.name;
}

// Samodejna kopija ob shranjenem treningu ali vnosu teže. Nikoli ne vrže napake.
export function afterSave() {
  // iPhone: mape ni mogoče izbrati, zato gre kopija skozi okno za deljenje.
  // Ta odločitev je sinhrona prav zato, da pred deljenjem ni čakanja.
  if (!canPickFolder()) {
    if (!canShareFiles()) return Promise.resolve('none');
    try {
      return Promise.resolve(shareFile());
    } catch (error) {
      return Promise.resolve('error');
    }
  }

  return readHandle().then((folder) => {
    if (!folder) return 'unset';   // mapa še ni izbrana; nastavitve to povejo
    return writeToFolder(folder).then(() => 'directory');
  }).catch((error) => {
    store.setBackupState({ error: String((error && error.message) || error) });
    return 'error';
  });
}

// Ročna kopija iz nastavitev. Za razliko od afterSave() tukaj molk ni v redu:
// uporabnik je gumb pritisnil in mora izvedeti, kaj se je zgodilo.
export async function exportNow() {
  if (canPickFolder()) {
    const folder = await readHandle();
    if (folder) {
      if (!(await ensurePermission(folder))) throw new Error('Dovoljenja za pisanje ni.');
      await writeToFolder(folder);
      return 'directory';
    }
  }

  if (canShareFiles()) return shareFile();
  return download(store.exportJson(), 'fitnes-' + store.todayIso() + '.json');
}

// Sistemski izbirnik datotek. Na telefonu se odpre aplikacija Datoteke oziroma
// izbirnik dokumentov, kjer sta med mesti tudi iCloud Drive in Google Drive.
export function pickBackupText() {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';

    input.addEventListener('change', () => {
      const file = input.files && input.files[0];
      resolve(file ? file.text() : null);
    });
    // Preklic okna: brez tega bi obljuba visela do konca seje.
    input.addEventListener('cancel', () => resolve(null));

    input.click();
  });
}

// Kaj naj o kopiji piše v nastavitvah.
export async function status() {
  const state = store.getBackupState();
  const folder = canPickFolder() ? await readHandle() : null;

  let mode = 'download';
  if (folder) mode = 'directory';
  else if (canPickFolder()) mode = 'unset';
  else if (canShareFiles()) mode = 'share';

  return {
    mode,
    folder: folder ? folder.name : null,
    at: state.at || null,
    error: state.error || null
  };
}
