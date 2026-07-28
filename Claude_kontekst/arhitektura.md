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

Vse tri prve datoteke morajo obstajati, sicer brskalnik ne ponudi namestitve.
Zahtevan je tudi HTTPS — zato GitHub Pages, glej [delovni-tok.md](delovni-tok.md).

## Zasloni: pogodba in register

Aplikacija je razdeljena na **zaslone**. Vsak zaslon je svoja datoteka v
`aplikacija/js/screens/` in privzeto izvozi objekt vedno iste oblike:

```js
export default {
  id: 'training',                 // interni kljuc
  route: 'trening',               // kar pise v naslovu: #/trening (brez sumnikov)
  tab: 'T',                       // crka na kvadratku spodaj
  title: TEXT.screens.training,   // napis; besedilo je v js/ui.js
  accent: '#e05a3a',              // barva tega zaslona
  render() { /* vrne DOM element */ }
};
```

`js/screens/register.js` je **edino mesto, kjer se doda nov zaslon**. Iz tega seznama
se sama zgradita spodnja vrstica gumbov in usmerjanje; `index.html` ostane nedotaknjen.
Prvi zaslon v seznamu je privzeti.

Dve stvari, ki nista očitni:

- **Barva zaslona živi v modulu zaslona, ne v CSS.** Router jo prepiše v `--accent`
  na `<body>`, CSS pa povsod uporablja samo `var(--accent)`. Zaradi tega je nov
  zaslon res ena sama datoteka.
- **Naslov z lojtro** (`#/trening`) namesto prave poti. Prava pot bi zahtevala strežnik,
  ki vsak naslov vrne na `index.html`; GitHub Pages tega ne zna. Z lojtro delujeta
  gumb *nazaj* in osvežitev na istem zaslonu.

Ko dodaš zaslon, ga **obvezno dopiši tudi v `FILES` v `sw.js`**. Sicer se aplikacija
z internetom odpre normalno, brez interneta pa se sesuje — kar opaziš šele v telovadnici.

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

Besedilo za uporabnika naj ne bo raztreseno po kodi. Ko aplikacija preraste eno datoteko,
gredo vsi nizi v en objekt (npr. `ui.js`), da se popravek zapiše na enem mestu.

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
├── CLAUDE.md              indeks za Clauda
├── Claude_kontekst/       podrobni kontekst (ta mapa)
├── aplikacija/            PRAVA APLIKACIJA
│   ├── index.html         ogrodje: <main> za zaslon, <nav> za gumbe
│   ├── manifest.json
│   ├── sw.js              CACHE verzija + seznam vseh datotek
│   ├── css/               base.css (tokeni), screen.css, tabbar.css
│   ├── js/
│   │   ├── app.js         zagon: zgradi gumbe, prizge router, registrira SW
│   │   ├── router.js      naslov #/... -> zaslon
│   │   ├── ui.js          vsi slovenski nizi
│   │   └── screens/       register.js + ena datoteka na zaslon
│   └── icons/
├── prototip/              testna PWA (barvni gumbi) — dokaz, da veriga deluje
├── fitnes-aplikacija.docx Timonovi osebni zapiski
└── .nojekyll              GitHub Pages naj ne poganja Jekylla
```

Prava aplikacija živi v mapi `aplikacija/`, torej na naslovu
`https://timonjeretic.github.io/Fitnes-aplikacija/aplikacija/`. Zakaj v podmapi
in ne na korenu, piše v [odlocitve.md](odlocitve.md).

Ker je aplikacija v podmapi, morajo biti **vse poti relativne** (`css/base.css`,
`./index.html`), nikoli absolutne (`/css/base.css`) — absolutna pot na GitHub Pages
kaže na koren domene in razbije namestitev.
