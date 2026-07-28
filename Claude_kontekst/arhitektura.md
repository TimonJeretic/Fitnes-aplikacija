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
| `index.html` | vsebina in logika |
| `manifest.json` | ime, ikone, `display: standalone` — brez tega ni namestitve |
| `sw.js` | service worker: predpomni datoteke, omogoča delovanje brez interneta |
| `icons/` | 192 px, 512 px in maskable različica za Android |

Vse tri prve datoteke morajo obstajati, sicer brskalnik ne ponudi namestitve.
Zahtevan je tudi HTTPS — zato GitHub Pages, glej [delovni-tok.md](delovni-tok.md).

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
├── prototip/              testna PWA (barvni gumbi) — dokaz, da veriga deluje
├── fitnes-aplikacija.docx Timonovi osebni zapiski
├── .nojekyll              GitHub Pages naj ne poganja Jekylla
└── (kasneje) index.html, manifest.json, sw.js, icons/  <- prava aplikacija na korenu
```

Prava aplikacija bo živela na **korenu repozitorija**, da bo naslov čist:
`https://timonjeretic.github.io/Fitnes-aplikacija/`. Prototip ostane v podmapi,
dokler ga ne bova več rabila.
