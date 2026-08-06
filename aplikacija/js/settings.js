// Zobnik desno zgoraj in okno, ki se pod njim odpre.
//
// Vsebina okna je danes ena sama stvar — varnostna kopija podatkov. Zakaj okno in ne
// četrti zaslon: spodnja vrstica je za palec v telovadnici in mora ostati pri treh
// velikih tarčah, kopija pa ni opravilo, ki bi ga delal med serijami.
//
// Modul ne ve, kako se piše v datoteko (to je js/backup.js) in ne, kako so podatki
// videti (to je js/store.js). Tukaj sta samo okno in vprašanja uporabniku.

import { TEXT } from './besedilo.js';
import * as store from './store.js';
import * as backup from './backup.js';
import { ICON_GEAR, ICON_CLOSE } from './icons.js';
import { el, button, icon, withLabel } from './dom.js';

const T = TEXT.settings;

// --- Zobnik ----------------------------------------------------------------

// Kliče ga brandRow() vsakega zaslona. Gumb je povsod isti, zato stoji tukaj in ni
// trikrat prepisan.
export function settingsButton() {
  const node = button('brand__settings', '', openSettings);
  node.append(icon('brand__settings-icon', ICON_GEAR));
  return withLabel(node, T.open);
}

// --- Okno ------------------------------------------------------------------

export function openSettings() {
  const overlay = el('div', 'settings');
  const box = el('div', 'settings__box');

  const close = () => overlay.remove();

  const head = el('div', 'settings__head');
  head.append(el('h2', 'settings__title', T.title));

  const closeButton = button('settings__close', '', close);
  closeButton.append(icon('settings__close-icon', ICON_CLOSE));
  head.append(withLabel(closeButton, T.close));

  // Po vsakem dejanju se vsebina nariše na novo: stanje kopije se je spremenilo.
  const body = el('div', 'settings__body');
  const paint = () => body.replaceChildren(...content(paint));
  paint();

  box.append(head, body);
  overlay.append(box);

  // Dotik mimo okna ga zapre; dotik v oknu ne.
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) close();
  });

  // Na <body> in ne v zaslon: okno prekrije tudi spodnjo vrstico z gumbi, da se med
  // uvozom ne da po nesreči zamenjati zaslona.
  document.body.append(overlay);
  return overlay;
}

function content(refresh) {
  const nodes = [];

  nodes.push(button('btn btn--primary', T.importAction, () => runImport()));
  nodes.push(button('btn btn--ghost', T.exportAction, () => runExport(refresh)));

  // Mape ni mogoče izbrati povsod (iPhone). Gumb, ki ne bi mogel nič narediti, je
  // slabši od gumba, ki ga ni — kaj se namesto tega zgodi, pove stanje spodaj.
  let folderButton = null;
  if (backup.canPickFolder()) {
    folderButton = button('btn btn--ghost', T.folderAction, () => runFolder(refresh));
    nodes.push(folderButton);
  }

  const status = el('div', 'settings__status');
  nodes.push(status);

  // Ročaj mape živi v IndexedDB, torej pride z zamikom. Okno se zato pokaže takoj,
  // vrstice o kopiji pa se dopišejo, ko so znane.
  backup.status().then((info) => {
    if (folderButton && info.folder) folderButton.textContent = T.folderChange;
    status.replaceChildren(...statusLines(info).map((line) => el('p', 'settings__line', line)));
  });

  return nodes;
}

function statusLines(info) {
  const modes = {
    directory: T.modeDirectory,
    unset: T.modeUnset,
    share: T.modeShare,
    download: T.modeDownload
  };

  // Prva vrstica pove, da se kopija ne dela sama; druga, kam gre, ko jo narediš.
  const lines = [T.modeManual, modes[info.mode]];
  if (info.folder) lines.push(T.folderLabel + info.folder);
  lines.push(info.at ? T.lastLabel + moment(info.at) : T.never);
  if (info.error) lines.push(T.problemLabel + info.error);
  return lines;
}

// Datum in ura. dom.formatDate() da samo datum, tukaj pa je ura tisto, kar pove, ali
// je kopija od današnjega treninga ali od prejšnjega tedna.
function moment(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleDateString('sl-SI') + ' '
    + date.toLocaleTimeString('sl-SI', { hour: '2-digit', minute: '2-digit' });
}

// --- Dejanja ---------------------------------------------------------------

async function runImport() {
  const text = await backup.pickBackupText();
  if (text === null) return;                  // preklic v izbirniku datotek

  let backupData;
  try {
    backupData = store.readBackup(text);
  } catch (error) {
    alert(T.importBad);
    return;
  }

  // Uvoz povozi vse, zato mora biti pred njim vidno, kaj gre za kaj.
  const question = T.importIntro + '\n\n'
    + T.importIncoming + counts(backupData.counts) + '\n'
    + T.importCurrent + counts(store.summary()) + '\n\n'
    + T.importAsk;

  if (!confirm(question)) return;

  store.applyBackup(backupData.data);
  alert(T.importDone);

  // Zasloni svoje stanje držijo v modulih, zato jih menjava podatkov pod nogami ne
  // doseže. Ponovno nalaganje je pri tako redkem dejanju cenejše od poti, po kateri
  // bi vsak zaslon znal zavreči svoje stanje.
  location.reload();
}

// Vnosi so vse, kar ni trening: tehtanja, meritve telesa, obroki in cardio.
// Ena sama številka namesto štirih — pri potrditvi uvoza šteje red velikosti.
function counts(value) {
  return value.workouts + T.workoutsUnit
    + (value.bodyweightEntries + value.measurementEntries + value.meals + value.cardioEntries)
    + T.entriesUnit;
}

async function runExport(refresh) {
  try {
    const result = await backup.exportNow();
    if (result === 'error') alert(T.exportFailed);
    else if (result !== 'cancelled') alert(T.exportDone);
  } catch (error) {
    alert(T.exportFailed);
  }
  refresh();
}

async function runFolder(refresh) {
  try {
    await backup.pickFolder();
    alert(T.folderDone);
  } catch (error) {
    // Preklic sistemskega okna ni napaka in ne rabi sporočila.
    if (!error || error.name !== 'AbortError') alert(T.folderFailed);
  }
  refresh();
}
