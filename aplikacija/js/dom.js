// Document Object Model (dom)
// Splošne funkcije ki jih rabi vsak ekran, da ni koda podvojena
// Skripta nima nobenih podatkov o vsebini aplikacije

// --- DOM -------------------------------------------------------------------

export function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function button(className, text, onClick) {
  const node = el('button', className, text);
  node.type = 'button';               // brez tega bi gumb v obrazcu pošiljal stran
  node.addEventListener('click', onClick);
  return node;
}

// Ikone so vrisane v kodo in ne naložene kot datoteke: ena zahteva manj in
// barvo prevzamejo iz besedila (fill="currentColor"). Niz je vedno nespremenljiv
// in zapisan v kodi — nikoli vnos uporabnika, zato je innerHTML tukaj varen.
export function icon(className, svg) {
  const node = el('span', className);
  node.innerHTML = svg;
  return node;
}

// Gumb je pogosto majhen in brez besedila, zato mu ime povemo posebej:
// aria-label za bralnike zaslona, title za namig z miško.
export function withLabel(node, label) {
  node.setAttribute('aria-label', label);
  node.title = label;
  return node;
}

// --- Številke --------------------------------------------------------------
// V polje se piše besedilo, v podatke gre število. Prazno polje je `null`:
// pri teži to pomeni vajo z lastno težo, pri ponovitvah neizpolnjeno serijo.

export function parseNumber(text) {
  const clean = String(text).replace(',', '.').trim();
  if (clean === '') return null;
  const number = Number(clean);
  return Number.isFinite(number) ? number : null;
}

// Kar se sme znajti v številskem polju: največ tri števke in največ ena
// decimalka — torej "123" ali "123,4". Nihče ne dvigne 1000 kg in nihče ne naredi
// 1000 ponovitev, daljša številka pa v škatlici ni več berljiva.
//
// Ločilo na zaslonu je vejica, ker se tako piše po slovensko. Pika se sproti
// prepiše vanjo: numerična tipkovnica na računalniku ponuja piko in vnos zaradi
// tega ne sme pasti skozi. V izračune gre oboje isto — glej parseNumber().
export function limitNumber(text, decimals) {
  const clean = String(text).replace(/\./g, ',').replace(/[^0-9,]/g, '');

  // Ponovitev ni pol: pri celih številih ločilo enostavno izpade.
  if (!decimals) return clean.replace(/,/g, '').slice(0, 3);

  const cut = clean.indexOf(',');
  if (cut < 0) return clean.slice(0, 3);

  // Ostale vejice so tipkarska napaka in ne novo ločilo, zato se pobrišejo.
  const whole = clean.slice(0, cut).slice(0, 3);
  const fraction = clean.slice(cut + 1).replace(/,/g, '');

  return whole + ',' + fraction.slice(0, 1);
}

export function formatNumber(value) {
  if (value === null || value === undefined) return '';
  return String(value).replace('.', ',');   // slovensko decimalno ločilo
}

// Čas serije (plank, mrtvi obesek) v zapisu MM:SS. Sekunde imajo vedno dve
// števki, minute ne: "1:05" in "12:05" se bereta enako hitro, "01:05" pa je
// samo daljši zapis iste stvari. V podatkih so sekunde, tukaj je videz.
export function formatTime(seconds) {
  if (seconds === null || seconds === undefined) return '';

  const whole = Math.max(0, Math.round(Number(seconds) || 0));
  return Math.floor(whole / 60) + ':' + String(whole % 60).padStart(2, '0');
}

// Za izračunane vrednosti (ocena 1RM), kjer bi cel double pokazal 118,90000000001.
export function formatRounded(value, decimals) {
  if (value === null || value === undefined) return '';
  const factor = Math.pow(10, decimals === undefined ? 1 : decimals);
  return formatNumber(Math.round(value * factor) / factor);
}

// --- Datumi ----------------------------------------------------------------

// Poln časovni žig (trening: new Date().toISOString()) v slovenski zapis.
export function formatDate(iso) {
  const date = iso ? new Date(iso) : new Date();
  return date.toLocaleDateString('sl-SI');
}

// Dan je niz 'YYYY-MM-DD' (teža, meritve, točke na grafu). Razstavimo ga sami;
// new Date(niz) bi ga razumel kot UTC polnoč in bi datum znal pokazati za dan nazaj.
export function formatDay(day) {
  const parts = String(day).split('-');
  return Number(parts[2]) + '. ' + Number(parts[1]) + '. ' + parts[0];
}

// Oblika, ki jo daje in jemlje <input type="date">.
const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// Poln časovni žig v dan 'YYYY-MM-DD', za v koledarček. Dan beremo iz lokalnega
// časa in ne z .toISOString(): ta vzame UTC in bi trening, začet ob pol enih
// zvečer poleti, ponudil z jutrišnjim datumom.
export function dayOfIso(iso) {
  const date = iso ? new Date(iso) : new Date();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return date.getFullYear() + '-' + month + '-' + day;
}

// Isti časovni žig, prestavljen na izbrani dan. Ura ostane ista — trening je bil
// ob tisti uri, koledarček menja samo datum. Nerazumljiv dan pusti žig pri miru:
// sistemski koledar zna vrniti prazno polje in to ne sme pomeniti novega datuma.
export function isoOnDay(iso, day) {
  if (!DAY_PATTERN.test(String(day))) return iso;

  const from = new Date(iso);
  const base = Number.isNaN(from.getTime()) ? new Date() : from;
  const parts = String(day).split('-');

  return new Date(
    Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]),
    base.getHours(), base.getMinutes(), base.getSeconds(), base.getMilliseconds()
  ).toISOString();
}
