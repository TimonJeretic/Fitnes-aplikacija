// Črtni graf, sestavljen na roko iz SVG.
//
// Zakaj brez knjižnice: aplikacija nima build koraka in ne sme klicati CDN-jev,
// sicer neha delovati brez interneta (Claude_kontekst/odlocitve.md). Graf, ki ga
// rabiva, je ena črta s časovno osjo — to je manj kode kot vendorana knjižnica.
//
// Datoteka ne ve nič o teži, meritvah, moči ali kalorijah. Dobi točke oblike
// { date: 'YYYY-MM-DD', value: number } in enoto, vrne element za na zaslon.
// Zato jo uporabljajo vsi trije grafi: teža in meritve (TEŽA), moč (STATISTIKA)
// ter teža skupaj s kalorijami (PREHRANA).

const NS = 'http://www.w3.org/2000/svg';

// Risalna plošča. Number-i so v enotah viewBox-a, ne v pikslih: SVG se raztegne
// na širino zaslona, razmerja pa ostanejo ista na telefonu in na računalniku.
const WIDTH = 360;
const HEIGHT = 220;
const LEFT = 44;        // prostor za številke na osi Y
const RIGHT = 14;
const RIGHT_AXIS = 42;  // ko je desna os: prostor za štirimestne kalorije
const TOP = 18;
const BOTTOM = 28;      // prostor za datume na osi X

const PLOT_LEFT = LEFT;
const PLOT_TOP = TOP;
const PLOT_BOTTOM = HEIGHT - BOTTOM;

const GRID_LINES = 5;     // vodoravne črte skupaj z zgornjo in spodnjo
const MAX_X_LABELS = 6;   // več se jih na telefonu prekriva
const MAX_VALUE_LABELS = 8;

// Razmerje med osema, kadar sta na grafu dve seriji: ena enota leve osi je
// toliko enot desne. Pri teži in kalorijah to pomeni "1 kg = 40 kcal" in določa
// samo to, kako blizu skupaj tečeta črti — na podatke ne vpliva.
// Večja številka: krivulja kalorij se stisne k črti teže. Manjša: razmakne se.
export const AXIS_RATIO = 40;

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

  // 'day': obdobje je en sam dan, torej vsak vnos svoja točka. Tedna ni —
  // teden je pri tehtanju in pri treningu preveč in premalo hkrati (glej
  // Claude_kontekst/odlocitve.md).
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

// Kalorije so cela števila: "2340" in ne "2340,3". Serija to pove z `decimals`.
function formatValue(value, decimals) {
  return decimals === 0 ? String(Math.round(value)) : formatNumber(value);
}

// --- Povprečenje po obdobju ------------------------------------------------

// Vsi vnosi znotraj dneva/meseca/leta se zlijejo v eno točko na začetku obdobja.
// Tri tehtanja v istem mesecu tako ne naredijo treh vrhov na letnem grafu.
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

// Os s predpisanim razponom, ki ostane sredinjena na svojih podatkih. Rabi se pri
// dveh serijah: razpon je skupen (in s tem razmerje osi zaklenjeno), sredina pa
// vsaki svoja, da črti ležita druga ob drugi in ne obe stisnjeni k istemu robu.
function centered(scale, span) {
  const middle = (scale.min + scale.max) / 2;
  return { min: middle - span / 2, max: middle + span / 2 };
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

function emptyBox(message) {
  const empty = document.createElement('div');
  empty.className = 'chart__empty';
  empty.textContent = message;
  return empty;
}

// points: [{ date: 'YYYY-MM-DD', value: number }] — že povprečene po obdobju.
// options: {
//   unit: 'kg' | 'cm' | 'kcal',
//   step: 'day' | 'month' | 'year',
//   empty: 'Ni podatkov',
//   decimals: 1,                       // neobvezno; 0 = cela števila
//   second: { points, unit, decimals }  // neobvezno: druga serija na desni osi
// }
//
// Z eno serijo je graf tak, kot je bil od nekdaj: ena os levo, poln razpon.
// Z dvema dobi še desno os, razmerje med osema pa je zaklenjeno na AXIS_RATIO —
// brez tega bi se vsaka os raztegnila po svoje in bližina črt ne bi pomenila nič.
export function lineChart(points, options) {
  const series = [];

  // `alt` je barva serije, ne njeno mesto: kadar je na grafu sama druga serija,
  // riše se levo, a mora ostati v svoji barvi — sicer kljukica in črta ne ustrezata.
  if (points && points.length) {
    series.push({ points, unit: options.unit, decimals: options.decimals, alt: !!options.alt });
  }

  const second = options.second;
  if (second && second.points && second.points.length) {
    series.push({ points: second.points, unit: second.unit, decimals: second.decimals, alt: true });
  }

  if (!series.length) return emptyBox(options.empty);

  const dual = series.length === 2;
  const plotRight = WIDTH - (dual ? RIGHT_AXIS : RIGHT);

  const root = svg('svg', {
    class: 'chart',
    viewBox: '0 0 ' + WIDTH + ' ' + HEIGHT,
    role: 'img'
  });

  // --- Osi Y -----------------------------------------------------------------
  const scales = series.map((item) => scaleY(item.points.map((point) => point.value)));

  if (dual) {
    // Skupen razpon, izražen v enotah leve osi. Vzame se večji od obeh, da se
    // nobena serija ne odreže; desna os ga dobi pomnoženega z razmerjem.
    const ratio = options.ratio || AXIS_RATIO;
    const spanLeft = scales[0].max - scales[0].min;
    const spanRight = (scales[1].max - scales[1].min) / ratio;
    const span = Math.max(spanLeft, spanRight);

    scales[0] = centered(scales[0], span);
    scales[1] = centered(scales[1], span * ratio);
  }

  const toY = (value, index) => {
    const scale = scales[index];
    const share = (value - scale.min) / (scale.max - scale.min);
    return PLOT_BOTTOM - share * (PLOT_BOTTOM - PLOT_TOP);
  };

  // --- Os X ------------------------------------------------------------------
  // Razpon je unija obeh serij: tehtanje in obrok se ne zgodita nujno isti dan.
  const days = Array.from(new Set(
    series.flatMap((item) => item.points.map((point) => point.date))
  )).sort();

  const times = days.map((day) => toDate(day).getTime());
  const firstTime = times[0];
  const lastTime = times[times.length - 1];

  const toX = (time) => {
    // Ena sama točka nima razpona; postavi se na sredino, da ne visi ob robu.
    if (lastTime === firstTime) return (PLOT_LEFT + plotRight) / 2;
    const share = (time - firstTime) / (lastTime - firstTime);
    return PLOT_LEFT + share * (plotRight - PLOT_LEFT);
  };

  // --- Mreža in številke -----------------------------------------------------
  // Črte so skupne obema osema: ista vodoravnica nosi levo in desno številko.
  for (let i = 0; i < GRID_LINES; i++) {
    const share = i / (GRID_LINES - 1);
    const lineY = PLOT_BOTTOM - share * (PLOT_BOTTOM - PLOT_TOP);

    root.append(svg('line', {
      class: 'chart__grid',
      x1: PLOT_LEFT, y1: lineY, x2: plotRight, y2: lineY
    }));

    const left = scales[0].min + (scales[0].max - scales[0].min) * share;
    root.append(text(PLOT_LEFT - 6, lineY + 3.5, 'chart__label',
      formatValue(left, series[0].decimals), 'end'));

    if (dual) {
      const right = scales[1].min + (scales[1].max - scales[1].min) * share;
      root.append(text(plotRight + 6, lineY + 3.5, 'chart__label chart__label--alt',
        formatValue(right, series[1].decimals), 'start'));
    }
  }

  // Enota stoji nad osjo Y, da je ne rabi vsaka številka posebej.
  root.append(text(PLOT_LEFT - 6, PLOT_TOP - 6, 'chart__unit', series[0].unit, 'end'));
  if (dual) {
    root.append(text(plotRight + 6, PLOT_TOP - 6, 'chart__unit chart__unit--alt',
      series[1].unit, 'start'));
  }

  // Datumi na osi X.
  for (const index of labelledIndexes(days.length)) {
    root.append(text(toX(times[index]), PLOT_BOTTOM + 16, 'chart__label',
      formatLabel(days[index], options.step)));
  }

  // --- Črte in pike ----------------------------------------------------------
  // Vrednosti nad pikami samo pri eni seriji: pri dveh se prekrivajo med sabo in
  // s tujo črto, os pa jih pove tako in tako.
  const showValues = !dual && series[0].points.length <= MAX_VALUE_LABELS;

  series.forEach((item, index) => {
    const suffix = item.alt ? ' chart__line--alt' : '';
    const dotSuffix = item.alt ? ' chart__dot--alt' : '';
    const pointTimes = item.points.map((point) => toDate(point.date).getTime());

    // Črta. Pri enem samem vnosu je ni — ostane pika.
    if (item.points.length > 1) {
      const path = item.points
        .map((point, i) => toX(pointTimes[i]).toFixed(1) + ',' + toY(point.value, index).toFixed(1))
        .join(' ');
      root.append(svg('polyline', { class: 'chart__line' + suffix, points: path }));
    }

    item.points.forEach((point, i) => {
      const x = toX(pointTimes[i]);
      const dotY = toY(point.value, index);
      root.append(svg('circle', { class: 'chart__dot' + dotSuffix, cx: x, cy: dotY, r: 3.5 }));
      if (showValues) {
        root.append(text(x, Math.max(dotY - 9, PLOT_TOP + 8), 'chart__value',
          formatValue(point.value, item.decimals)));
      }
    });
  });

  return root;
}
