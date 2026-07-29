// Črtni graf, sestavljen na roko iz SVG.
//
// Zakaj brez knjižnice: aplikacija nima build koraka in ne sme klicati CDN-jev,
// sicer neha delovati brez interneta (Claude_kontekst/odlocitve.md). Graf, ki ga
// rabiva, je ena črta s časovno osjo — to je manj kode kot vendorana knjižnica.
//
// Datoteka ne ve nič o teži, meritvah ali moči. Dobi točke oblike
// { date: 'YYYY-MM-DD', value: number } in enoto, vrne element za na zaslon.
// Zato jo uporabljata oba grafa: teža in meritve (TEŽA) ter moč (STATISTIKA).

const NS = 'http://www.w3.org/2000/svg';

// Risalna plošča. Number-i so v enotah viewBox-a, ne v pikslih: SVG se raztegne
// na širino zaslona, razmerja pa ostanejo ista na telefonu in na računalniku.
const WIDTH = 360;
const HEIGHT = 220;
const LEFT = 44;      // prostor za številke na osi Y
const RIGHT = 14;
const TOP = 18;
const BOTTOM = 28;    // prostor za datume na osi X

const PLOT_LEFT = LEFT;
const PLOT_RIGHT = WIDTH - RIGHT;
const PLOT_TOP = TOP;
const PLOT_BOTTOM = HEIGHT - BOTTOM;

const GRID_LINES = 5;     // vodoravne črte skupaj z zgornjo in spodnjo
const MAX_X_LABELS = 6;   // več se jih na telefonu prekriva
const MAX_VALUE_LABELS = 8;

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun',
                'jul', 'avg', 'sep', 'okt', 'nov', 'dec'];

// --- Datumi ----------------------------------------------------------------
// Dan je niz 'YYYY-MM-DD'. Razstavimo ga na števila in sestavimo lokalni Date;
// new Date('2026-07-29') bi ga razumel kot UTC polnoč in bi datum znal zamakniti.

function toDate(day) {
  const parts = String(day).split('-');
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
}

function toDay(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return date.getFullYear() + '-' + month + '-' + day;
}

// Začetek obdobja, v katerega dan pade. To je ključ, po katerem se vnosi združijo.
function periodStart(day, step) {
  const date = toDate(day);

  if (step === 'year') return toDay(new Date(date.getFullYear(), 0, 1));
  if (step === 'month') return toDay(new Date(date.getFullYear(), date.getMonth(), 1));

  // Teden se začne s ponedeljkom. getDay() ima nedeljo na 0, zato zamik za 6.
  const weekday = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - weekday);
  return toDay(date);
}

function formatLabel(day, step) {
  const date = toDate(day);
  if (step === 'year') return String(date.getFullYear());
  if (step === 'month') return MONTHS[date.getMonth()] + ' ' + String(date.getFullYear()).slice(2);
  return date.getDate() + '. ' + (date.getMonth() + 1) + '.';
}

// --- Številke --------------------------------------------------------------

// Na osi ne rabimo natančnosti pod desetinko, decimalno ločilo pa je vejica.
function formatNumber(value) {
  const rounded = Math.round(value * 10) / 10;
  return String(rounded).replace('.', ',');
}

// --- Povprečenje po obdobju ------------------------------------------------

// Vsi vnosi znotraj tedna/meseca/leta se zlijejo v eno točko na začetku obdobja.
// Tri tehtanja v istem tednu tako ne naredijo treh vrhov na letnem grafu.
//
// `mode` pove, kaj obdobje predstavlja:
//   'avg' (privzeto) — povprečje. Teža niha čez dan; povprečje je pravo stanje.
//   'max'            — najboljša točka obdobja, s celim izvirnim vnosom vred.
//                      Moč se meri po najboljšem nastopu, ne po povprečnem, in
//                      ohranjena vnosa `weightKg`/`reps` sta tisto, kar hočeš
//                      videti izpisano pod grafom.
export function aggregate(points, step, mode) {
  const buckets = new Map();

  for (const point of points) {
    const key = periodStart(point.date, step);
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.sum += point.value;
      bucket.count += 1;
      if (point.value > bucket.best.value) bucket.best = point;
    } else {
      buckets.set(key, { sum: point.value, count: 1, best: point });
    }
  }

  return Array.from(buckets, ([date, bucket]) => (
    mode === 'max'
      // `date` postane začetek obdobja (tam stoji točka), pravi dan pa se ohrani
      // kot `day` — brez njega ne bi vedel, katerega dne je rekord padel.
      ? Object.assign({}, bucket.best, { day: bucket.best.date, date, count: bucket.count })
      : { date, value: bucket.sum / bucket.count, count: bucket.count }
  )).sort((a, b) => a.date.localeCompare(b.date));
}

// --- Os Y ------------------------------------------------------------------

// Graf namenoma NE začne pri nič: razlika med 82 in 85 kg bi bila pri ničli
// nevidna črta. Odrežemo toliko, da podatki napolnijo višino, a nikoli več kot
// polovico najnižje vrednosti — sicer graf pretirava in majhno nihanje izgleda
// kot preobrat. Os je zato vedno označena s številkami.
function scaleY(values) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min;

  if (span === 0) {
    const pad = Math.max(Math.abs(min) * 0.02, 0.5);
    return { min: Math.max(0, min - pad), max: max + pad };
  }

  const floor = Math.max(0, min * 0.5);
  return {
    min: Math.max(min - span * 0.1, floor),
    max: max + span * 0.1
  };
}

// --- Sestavljanje SVG ------------------------------------------------------

function svg(tag, attrs) {
  const node = document.createElementNS(NS, tag);
  for (const name in attrs) node.setAttribute(name, attrs[name]);
  return node;
}

function text(x, y, className, content, anchor) {
  const node = svg('text', { x, y, class: className, 'text-anchor': anchor || 'middle' });
  node.textContent = content;
  return node;
}

// Katere točke dobijo napis na osi X. Šteje se od zadnje nazaj, da je najnovejši
// datum vedno napisan — to je tisti, ki ga gledaš.
function labelledIndexes(count) {
  const every = Math.ceil(count / MAX_X_LABELS);
  const indexes = [];
  for (let i = count - 1; i >= 0; i -= every) indexes.push(i);
  return indexes;
}

// points: [{ date: 'YYYY-MM-DD', value: number }] — že povprečene po obdobju.
// options: { unit: 'kg' | 'cm', step: 'week' | 'month' | 'year', empty: 'Ni podatkov' }
export function lineChart(points, options) {
  if (!points.length) {
    const empty = document.createElement('div');
    empty.className = 'chart__empty';
    empty.textContent = options.empty;
    return empty;
  }

  const root = svg('svg', {
    class: 'chart',
    viewBox: '0 0 ' + WIDTH + ' ' + HEIGHT,
    role: 'img'
  });

  const values = points.map((point) => point.value);
  const y = scaleY(values);
  const times = points.map((point) => toDate(point.date).getTime());
  const firstTime = times[0];
  const lastTime = times[times.length - 1];

  const toX = (time) => {
    // Ena sama točka nima razpona; postavi se na sredino, da ne visi ob robu.
    if (lastTime === firstTime) return (PLOT_LEFT + PLOT_RIGHT) / 2;
    const share = (time - firstTime) / (lastTime - firstTime);
    return PLOT_LEFT + share * (PLOT_RIGHT - PLOT_LEFT);
  };

  const toY = (value) => {
    const share = (value - y.min) / (y.max - y.min);
    return PLOT_BOTTOM - share * (PLOT_BOTTOM - PLOT_TOP);
  };

  // Mreža in številke na osi Y.
  for (let i = 0; i < GRID_LINES; i++) {
    const value = y.min + (y.max - y.min) * (i / (GRID_LINES - 1));
    const lineY = toY(value);

    root.append(svg('line', {
      class: 'chart__grid',
      x1: PLOT_LEFT, y1: lineY, x2: PLOT_RIGHT, y2: lineY
    }));
    root.append(text(PLOT_LEFT - 6, lineY + 3.5, 'chart__label', formatNumber(value), 'end'));
  }

  // Enota stoji nad osjo Y, da je ne rabi vsaka številka posebej.
  root.append(text(PLOT_LEFT - 6, PLOT_TOP - 6, 'chart__unit', options.unit, 'end'));

  // Datumi na osi X.
  const labelled = labelledIndexes(points.length);
  for (const index of labelled) {
    const x = toX(times[index]);
    root.append(text(x, PLOT_BOTTOM + 16, 'chart__label', formatLabel(points[index].date, options.step)));
  }

  // Črta. Pri enem samem vnosu je ni — ostane pika.
  if (points.length > 1) {
    const path = points
      .map((point, index) => toX(times[index]).toFixed(1) + ',' + toY(point.value).toFixed(1))
      .join(' ');
    root.append(svg('polyline', { class: 'chart__line', points: path }));
  }

  // Pike in vrednosti. Napise izpišemo samo, dokler jih je malo; pri gostem grafu
  // se prekrivajo in je bolje brati z osi.
  const showValues = points.length <= MAX_VALUE_LABELS;
  points.forEach((point, index) => {
    const x = toX(times[index]);
    const dotY = toY(point.value);
    root.append(svg('circle', { class: 'chart__dot', cx: x, cy: dotY, r: 3.5 }));
    if (showValues) {
      root.append(text(x, Math.max(dotY - 9, PLOT_TOP + 8), 'chart__value', formatNumber(point.value)));
    }
  });

  return root;
}
