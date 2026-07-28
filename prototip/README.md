# Prototip – barvni gumbi

Testna PWA. Namen: preveriti celotno pot od kode do ikone na telefonu.

## Datoteke

| Datoteka | Kaj dela |
|---|---|
| `index.html` | vsa vsebina, slog in logika (za prototip je vse v eni datoteki) |
| `manifest.json` | opis aplikacije za brskalnik – ime, ikone, `display: standalone` |
| `sw.js` | service worker – shrani datoteke, da aplikacija dela brez interneta |
| `icons/` | ikone 192 in 512 px + maskable razlicica za Android |

## Zagon na racunalniku

V tej mapi odpri terminal in pozeni:

```
python -m http.server 5500
```

Nato v Chromu odpri <http://localhost:5500>.

`localhost` steje kot varen naslov, zato tukaj deluje tudi service worker
in Chrome v naslovni vrstici ponudi ikono za namestitev.

Streznik ustavis s `Ctrl + C`.

## Objava na GitHub Pages

Projekt je objavljen preko GitHub Pages iz veje `main`, koren repozitorija:

<https://timonjeretic.github.io/Fitnes-aplikacija/prototip/>

Objavis tako, da spremembe potisnes:

```
git add .
git commit -m "opis spremembe"
git push
```

Datoteka `.nojekyll` v korenu repozitorija pove GitHubu, naj datotek ne
obdela z Jekyllom, ampak jih servira take, kot so.

Po pushu traja priblizno minuto, da se objava zgradi. Stanje vidis v
repozitoriju pod zavihkom *Actions*.

Aplikacija tece v podmapi (`/Fitnes-aplikacija/prototip/`), zato so vse poti
v `manifest.json` in `sw.js` relativne (`.` oz. `./`). Ce jih spremenis v
absolutne (`/index.html`), namestitev na Pages neha delovati.

## Namestitev na telefon

Na telefonu odpri zgornji naslov in:

- **Android / Chrome:** meni (tri pikice) -> *Namesti aplikacijo*
- **iPhone / Safari:** Deli -> *Dodaj na zacetni zaslon*
  (mora biti Safari, iz Chroma na iOS ne gre)

Po namestitvi se aplikacija zaganja s svojo ikono, brez naslovne vrstice
brskalnika, in deluje tudi v letalskem nacinu.

## Ko spremenis kodo

Service worker servira shranjeno razlicico, zato sprememb ne bos videl takoj —
niti v namescen aplikaciji niti v navadnem brskalniku, ker si delita isti
predpomnilnik. Ob **vsaki** spremembi povecaj stevilko v `sw.js`:

```js
const CACHE = 'prototip-v2';   // v1 -> v2
```

Brskalnik `sw.js` preverja mimo predpomnilnika, zato ze en spremenjen bajt
sprozi namestitev nove razlicice in izbris stare.

Nato:

1. Pocakaj minuto, da se GitHub Pages zgradi.
2. Stran nalozi **dvakrat** — prvi reload namesti novo razlicico, drugi jo
   pokaze. Na telefonu je najbolj zanesljivo aplikacijo popolnoma zapreti
   (odstrani iz seznama odprtih) in znova odpreti.

GitHub Pages servira datoteke z `Cache-Control: max-age=600`, zato zna
posodobitev na robnem strezniku zamujati do 10 minut.

Med razvojem na `localhost` si prihranis to cakanje: F12 -> zavihek
*Application* -> *Service workers* -> obkljukaj *Update on reload*.
Takrat stevilke ni treba spreminjati.
