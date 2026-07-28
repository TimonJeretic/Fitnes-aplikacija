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

## Namestitev na telefon

1. Odpri <https://app.netlify.com/drop>
2. Povleci **mapo `prototip`** na stran (celo mapo, ne posameznih datotek).
3. Dobis naslov tipa `https://nekaj-nakljucnega.netlify.app`.
4. Ta naslov odpri na telefonu:
   - **Android / Chrome:** meni (tri pikice) -> *Namesti aplikacijo*
   - **iPhone / Safari:** Deli -> *Dodaj na zacetni zaslon*
     (mora biti Safari, iz Chroma na iOS ne gre)

Po namestitvi se aplikacija zaganja s svojo ikono, brez naslovne vrstice
brskalnika, in deluje tudi v letalskem nacinu.

## Ko spremenis kodo

Service worker servira shranjeno razlicico, zato sprememb ne bos videl takoj.
Povecaj stevilko predpomnilnika v `sw.js`:

```js
const CACHE = 'prototip-v2';   // v1 -> v2
```

Med razvojem v Chromu pomaga tudi: F12 -> zavihek *Application* ->
*Service workers* -> obkljukaj *Update on reload*.
