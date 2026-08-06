# Arhitektura

## Tehnološka izbira

**PWA (Progressive Web App)** — spletna stran, ki se namesti na začetni zaslon in
teče brez naslovne vrstice brskalnika. Zakaj ravno to, piše v [odlocitve.md](odlocitve.md).

- **Brez build koraka.** Navaden HTML, CSS in JavaScript (ES moduli). Node.js na
  Timonovem računalniku ni nameščen in ga zaenkrat ne rabiva. Datoteka, ki jo napiševa,
  je ista datoteka, ki teče v brskalniku — nič se ne prevaja.
- **Brez backenda.** Ni strežnika, ni baze v oblaku, ni API klicev.
- **Brez CDN knjižnic.** Zunanji `<script src="https://...">` razbije offline delovanje,
  ker service worker tuje domene ne predpomni. Če kdaj rabiva knjižnico (npr. za grafe),
  se datoteka **prenese v repozitorij** in servira lokalno.

## Sestavni deli PWA

| Datoteka | Vloga |
|---|---|
| `index.html` | ogrodje strani; vsebino vstavi JavaScript |
| `manifest.json` | ime, ikone, `display: standalone` — brez tega ni namestitve |
| `sw.js` | service worker: predpomni datoteke, omogoča delovanje brez interneta |
| `icons/` | 192 px, 512 px in maskable različica za Android |

`sw.js` ima dva seznama datotek. `FILES` so nujne: `cache.addAll()` pade v celoti,
če ena sama manjka, zato mora biti vsaka nova datoteka dopisana vanj. `OPTIONAL` so
posnetki uvodne animacije — nalagajo se vsak zase in manjkajoča datoteka namestitve
ne podre.

Do odgovora vodita dve poti. Navadna zahteva dobi datoteko iz predpomnilnika, sicer
z interneta. Zahteva z glavo `Range` (posnetek, ki ga predvajalnik jemlje po kosih)
pa gre skozi `partial()`, ki iz shranjene datoteke izreže kos in ga vrne s statusom
**206** — Safari cel odgovor na tako zahtevo zavrne in predvajanje odpove.

Vse tri prve datoteke morajo obstajati, sicer brskalnik ne ponudi namestitve.
Zahtevan je tudi HTTPS — zato GitHub Pages, glej [delovni-tok.md](delovni-tok.md).

**`index.html` ni več čisto prazen.** Poleg `<main>` in `<nav>` je v njem zastor
z uvodno animacijo (`#splash`). To je namerna izjema: zastor se mora pokazati
takoj ob odprtju, torej še preden se naložijo moduli, ki sicer zgradijo vso
vsebino. Vse ostalo še naprej dela JavaScript.

**`sw.js` mora ostati v korenu `aplikacija/`.** Service worker nadzoruje samo svojo
mapo in vse pod njo; iz podmape ne bi videl `index.html`. Zato tudi klic
`navigator.serviceWorker.register('sw.js')` v `js/startup/app.js` ostane brez `../`:
ta pot se bere glede na `index.html`, ne glede na datoteko, v kateri je zapisana.

## Zasloni: pogodba in register

Aplikacija je razdeljena na **zaslone**. Vsak zaslon je svoja datoteka v
`aplikacija/js/screens/` in privzeto izvozi objekt vedno iste oblike:

```js
export default {
  id: 'training',                 // interni kljuc
  route: 'trening',               // kar pise v naslovu: #/trening (brez sumnikov)
  icon: ICON_TRAINING,            // ikona na kvadratku spodaj; niz iz js/icons.js
  title: TEXT.screens.training,   // napis; nizi so v js/besedilo.js
  accent: '#9d0f0b',              // barva tega zaslona
  render(sub) { /* vrne DOM element; `sub` je podpot iz naslova, lahko '' */ }
};
```

**Ikona** je vrisan SVG kot niz, ne pot do datoteke — glej `js/icons.js` in
[odlocitve.md](odlocitve.md). Isti niz gre lahko na kvadratek spodaj in v vrstico
z naslovom na vrhu zaslona (`.brand` v `css/screen.css`).

**Barva** je danes pri vseh štirih zaslonih ista (`#9d0f0b`). Polje kljub temu ostane
pri zaslonu: pogodba se ne spreminja zaradi tega, ker so vrednosti trenutno enake.

**Podpoti.** Prvi kos naslova je zaslon, ostanek dobi zaslon kot argument:
`#/statistika/arhiv` pomeni zaslon `stats` in `sub === 'arhiv'`; enako
`#/statistika/vaje` odpre arhiv vaj. Zaslon, ki podpoti
ne pozna, argument preprosto ignorira. Namen je sistemski gumb *nazaj* na telefonu —
brez svojega naslova bi podpogled ob *nazaj* vrgel ven iz aplikacije.

`js/startup/screen_register.js` je **edino mesto, kjer se doda nov zaslon**. Iz tega seznama
se sama zgradita spodnja vrstica gumbov in usmerjanje; `index.html` ostane nedotaknjen.
Prvi zaslon v seznamu je privzeti.

Tri stvari, ki niso očitne:

- **Barva zaslona živi v modulu zaslona, ne v CSS.** Router jo prepiše v `--accent`
  na `<body>`, CSS pa povsod uporablja samo `var(--accent)`. Zaradi tega je nov
  zaslon res ena sama datoteka.
- **Naslov z lojtro** (`#/trening`) namesto prave poti. Prava pot bi zahtevala strežnik,
  ki vsak naslov vrne na `index.html`; GitHub Pages tega ne zna. Z lojtro delujeta
  gumb *nazaj* in osvežitev na istem zaslonu.
- **`css/screen.css` ima seznam `body[data-screen="…"] .screen`**, ki izklopi
  sredinjenje in polnobarvno ozadje. Zaslona, ki tam ni, se to ne prime in izriše
  se kot en napis na sredini rdeče ploskve. To je edino mesto zunaj registra, kjer
  nov zaslon **mora** biti omenjen.

Ko dodaš zaslon, ga **obvezno dopiši tudi v `FILES` v `sw.js`** (modul in njegov
CSS), CSS pa še z `<link>` v `index.html`. Sicer se aplikacija z internetom odpre
normalno, brez interneta pa se sesuje — kar opaziš šele v telovadnici.

## Kje živi kateri CSS

| Datoteka | Kaj je notri |
|---|---|
| `base.css` | barvni tokeni (`--accent`, `--accent-gradient`, `--accent-glow`, varno območje), reset, postavitev strani |
| `splash.css` | zastor z uvodno animacijo (nad vsem, `z-index: 100`) |
| `screen.css` | ploskev zaslona in **skupni deli**: `.brand` (ikona + naslov), `.section__title`, `.rule`, vrstica `.listrow` (ime + koš), spustni seznam `.sheet`, izbira `.choice` |
| `tabbar.css` | spodnja vrstica: kvadratek, ikona, aktivno stanje s sijem |
| `training.css` | zaslon TRENING in **skupni gradniki, ki so nastali tam**: `.field`, `.btn`, `.modal` |
| `weight.css` | zaslon TEŽA in gradniki grafa, ki jih uporabljata tudi STATISTIKA in PREHRANA: `.picked` (izbirnik), `.graph`, `.chart` (skupaj z drugo serijo `.chart__line--alt`), `.steps` |
| `stats.css` | samo tisto, česar ni ne v training.css ne v weight.css |
| `nutrition.css` | zaslon PREHRANA: `.today` (dnevni skupek), `.meal` (vnos obroka), `.summary` (maintenance), `.series` (kljukici nad grafom) |
| `settings.css` | okno pod zobnikom (`.settings`); gumb `.brand__settings` je v screen.css, ker spada v `.brand` |

Gradnik, ki ga rabi drugi zaslon, se **ne prepiše** — uporabi se isti razred, tudi
če stoji v datoteki tujega zaslona. Ko se skupnih gradnikov nabere preveč, gredo v
svojo datoteko; zaenkrat je selitev dražja od koristi.

Barvni tokeni, ki jih rabi samo en zaslon (`--training-card`, `--training-field` …),
živijo v njegovem CSS in ne v `base.css`.

## Konvencije

### Jezik

- **Koda je angleška**: spremenljivke, funkcije, imena polj, CSS razredi.
  `exercise`, `weightKg`, `addSet()` — ne `vaja`, `tezaKg`, `dodajSet()`.
  Razlog: vsak primer, vsaka dokumentacija in vsak odgovor na spletu je v angleščini.
  Mešanje jezikov pomeni stalno prevajanje pojmov v glavi.
- **Besedilo na zaslonu je slovensko**: "Dodaj serijo", "Telesna teža", "Ponovitve".
- **Komentarji so slovenski.** Timon se uči, komentar pa je tam zato, da mu pojasni,
  zakaj koda počne to, kar počne.
- **Šumniki: v identifikatorjih nikoli, drugod normalno.** Nikoli `težaKg` ali `.gumbi`.
  V komentarjih in besedilu na zaslonu pa polni šumniki — datoteke so UTF-8
  (`<meta charset="utf-8">`), zato se pravilno prikažejo.

### Slovenski nizi

Besedilo za uporabnika ni raztreseno po kodi: vsi nizi so v enem objektu
(`js/besedilo.js`, izvoz `TEXT`), razdeljeni po zaslonih. Zaslon si na vrhu vzame
svoj kos (`const T = TEXT.training;`). Popravek napisa je s tem ena vrstica na enem
mestu. Ime datoteke je edina izjema od pravila "koda angleško" — tako je na prvi
pogled jasno, da notri ni logike, ampak samo slovenski napisi.

## Ciljni napravi

- **Chrome na Androidu** — polna podpora PWA, namestitev prek *Namesti aplikacijo*.
- **Safari na iOS** — namestitev prek Deli → *Dodaj na začetni zaslon*. Nekaj omejitev:
  namestitev gre samo iz Safarija (ne iz Chroma na iPhonu), obvestila so šibkejša,
  shramba je bolj izpostavljena čiščenju. Zato izvoz podatkov, glej
  [podatkovni-model.md](podatkovni-model.md).

Aplikacija se uporablja **v telovadnici, z eno roko, na majhnem zaslonu**. To ni
estetska opomba, ampak zahteva: veliki gumbi, malo tipkanja, čim manj korakov do
vpisanega seta.

## Struktura map

```
Fitnes aplikacija/
├── index.html             samo preusmeritev na aplikacija/ (GitHub Pages strezi koren)
├── CLAUDE.md              indeks za Clauda
├── Claude_kontekst/       podrobni kontekst (ta mapa)
├── aplikacija/            CELA APLIKACIJA
│   ├── index.html         ogrodje: <main> za zaslon, <nav> za gumbe, zastor animacije
│   ├── manifest.json
│   ├── sw.js              CACHE verzija + seznama FILES in OPTIONAL
│   ├── css/               base.css (tokeni), screen.css (skupni deli), tabbar.css,
│   │                      splash.css + ena datoteka na zaslon
│   ├── js/
│   │   ├── startup/       ogrodje aplikacije: zagon, usmerjanje, seznam zaslonov
│   │   │   ├── app.js              zagon: zgradi gumbe, prizge router, registrira SW
│   │   │   ├── router.js           naslov #/... -> zaslon (+ podpot)
│   │   │   ├── navigate.js         samo sprememba naslova (brez uvozov, da ni kroga)
│   │   │   ├── screen_register.js  seznam zaslonov; edino mesto za nov zaslon
│   │   │   └── splash.js           uvodna animacija ob zagonu
│   │   ├── besedilo.js    vsi slovenski nizi (izvoz TEXT)
│   │   ├── store.js       edina pot do localStorage + poizvedbe in ocena 1RM
│   │   ├── chart.js       crtni graf iz SVG in zdruzevanje po obdobjih, brez knjiznice
│   │   ├── icons.js       ikone kot nizi (izvor: icons/*.svg)
│   │   ├── sheet.js       spustni seznam cez zaslon (izbira meritve, izbira vaje)
│   │   ├── backup.js      varnostna kopija v datoteko (mapa / deljenje / prenos)
│   │   ├── settings.js    zobnik in okno pod njim (uvoz, izvoz, izbira mape)
│   │   ├── dom.js         el(), button(), stevilke, datumi — skupno vsem zaslonom
│   │   └── screens/       ena datoteka na zaslon: training.js, weight.js, stats.js
│   ├── icons/             ikone aplikacije (iz zadnje slicice uvodnega posnetka)
│   └── media/             uvodna animacija (mp4 pokoncna in lezeca) + poster
├── fitnes-aplikacija.docx Timonovi osebni zapiski
├── .gitignore             Wordove zaklepne datoteke in navlaka OS
└── .nojekyll              GitHub Pages naj ne poganja Jekylla
```

Prototipne mape (`prototip/`) ni več — svoje delo, dokazati verigo koda → git →
GitHub Pages → telefon, je opravila in bi zdaj le zavajala.

Prava aplikacija živi v mapi `aplikacija/`, torej na naslovu
`https://timonjeretic.github.io/Fitnes-aplikacija/aplikacija/`. Zakaj v podmapi
in ne na korenu, piše v [odlocitve.md](odlocitve.md).

Ker je aplikacija v podmapi, morajo biti **vse poti relativne** (`css/base.css`,
`./index.html`), nikoli absolutne (`/css/base.css`) — absolutna pot na GitHub Pages
kaže na koren domene in razbije namestitev.
