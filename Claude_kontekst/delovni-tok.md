# Delovni tok

## Okolje

| Orodje | Stanje |
|---|---|
| Python | 3.14.3 — na voljo, uporabljava ga za lokalni strežnik |
| git | 2.54.0 |
| Node.js | 24.15 — nameščen od 2026-07-30. Aplikacija ga **ne** rabi (brez build koraka), preizkusi pa ga uporabljajo |
| gh CLI | **ni nameščen** — GitHub nastavitve ureja Timon prek brskalnika |

## Lokalni zagon

V mapi projekta (na korenu, ne v podmapi):

```
python -m http.server 5500
```

Nato v Chromu: `http://localhost:5500/aplikacija/`

Ustavi se s `Ctrl + C`. Če pisalo javi, da je vrata 5500 zasedena, teče strežnik že od prej
— ali ga ugasni ali uporabi drugo številko (`5501`).

**Zakaj strežnik in ne dvoklik na datoteko?** Ob dvokliku se naslov začne s `file://`,
kjer se service worker iz varnostnih razlogov ne registrira. Pri pravi aplikaciji je
še huje: tam se ne naložijo niti ES moduli, tako da ostane bel zaslon.
`localhost` velja za varen naslov, zato tam deluje vse.

## Objava

```
git add -A
git commit -m "opis spremembe"
git push
```

GitHub Pages je nastavljen na vejo `main`, mapa `/ (root)`. Objava traja minuto ali dve,
napredek je viden v zavihku **Actions** na GitHubu.

Naslov: `https://timonjeretic.github.io/Fitnes-aplikacija/aplikacija/`
(koren repozitorija nanj samo preusmeri).

Datoteka `.nojekyll` na korenu prepreči, da bi GitHub Pages spustil datoteke skozi Jekyll
in preskočil tiste, ki se začnejo s podčrtajem.

## Pravilo predpomnilnika — najpogostejša past

Service worker trmasto servira shranjeno različico. Po **vsaki** spremembi kode je treba
povečati verzijo v `aplikacija/sw.js`:

```js
const CACHE = 'aplikacija-v7';   // v7 -> v8 -> v9 ...
```

To dvigne **Timon sam** — Claude ga na to samo opozori (glej `CLAUDE.md`).

Druga past, ki jo prinese razdelitev na module: vsaka nova datoteka (`js/screens/*.js`,
nov CSS) mora biti našteta v `FILES` v `aplikacija/sw.js`. Če je ni, se aplikacija
z internetom odpre normalno, brez interneta pa se sesuje. Nujne datoteke gredo v
`FILES`, uvodni posnetki v `OPTIONAL` — ta ob manjkajoči datoteki ne podre namestitve.

Med razvojem v Chromu pomaga tudi: `F12` → zavihek **Application** → **Service workers**
→ obkljukaj **Update on reload**.

## Preizkus izrisa v brezglavem brskalniku

Strežnik mora teči. Na voljo sta dve poti; **najprej poskusi drugo**, ker da sliko.

### Hitro: zgradba izpisa

```
msedge.exe --headless --disable-gpu --user-data-dir=<polna pot> --virtual-time-budget=8000 --dump-dom <naslov>
```

Dovolj za preizkuse, ki sami preverijo, kar hočejo, in rezultat zapišejo v stran
(npr. v `<pre>`); izpis se potem samo prebere. Videza ne pove.

**Posnetka zaslona s tem ne dobiš.** `--screenshot` je Edge 150 opustil — datoteka
preprosto ne nastane, brez sporočila o napaki.

### Počasneje: pravi posnetek pri pravi širini telefona

Chrome zna posnetek (`--headless=new --screenshot`), a **okna ne pomanjša pod
500 px** — pri `--window-size=390` dobiš 390 px širok **izrez** 500 px široke strani
in vse izgleda preozko. Pravo širino da samo DevTools protokol.

Node.js je nameščen, `WebSocket` je v njem vgrajen, zato zadošča kratek skript:
zaženi Chrome z `--remote-debugging-port`, poberi naslov iz `http://127.0.0.1:<port>/json/list`,
in po vrsti pošlji `Page.enable`, `Runtime.enable`,
`Emulation.setDeviceMetricsOverride` (`width`, `height`, `deviceScaleFactor: 2`,
`mobile: true`), `Page.navigate` in `Page.captureScreenshot`
(`captureBeyondViewport: true` zajame tudi to, kar je pod robom).

Ob tem se splača poslušati `Runtime.exceptionThrown` in `Runtime.consoleAPICalled` —
napaka v modulu se drugače pokaže samo kot prazen zaslon.

### Pasti, ki so vse stale eno napačno ugotovitev

- **`--user-data-dir` mora biti absolutna pot.** Relativne (`./p_1890`) Chromium ne
  razreši glede na mapo, iz katere ga zaženeš, ampak glede na svojo —
  `C:\Program Files (x86)\Microsoft\Edge\Application`, kamor pisati ne sme. Zagon se
  ne konča z napako v konzoli, ampak odpre **okno z opozorilom** in obvisi: `--headless`
  ga ne prepreči. Proces potem straši čez zaslon, dokler ga ne ubiješ. Profil zato
  vedno v začasno mapo s polno potjo.
- **Okno ne gre pod 500 px.** `--window-size=390,844` naredi sliko 390 px široko,
  stran pa se vseeno postavi pri 500 px — slika je torej **odrezana**, ne ozka.
  Velja za Edge in za Chrome, tudi za `--headless=new`. Pravo širino da
  `Emulation.setDeviceMetricsOverride` prek protokola (zgoraj); brez njega se
  postavitev preveri tako, da se aplikacija naloži v `<iframe width="360">`, kar pa
  ne sproži pravil `@media` po širini okna.
- **Service worker servira staro kodo.** Če se ista mapa `--user-data-dir` uporabi
  dvakrat, drugi zagon dobi datoteke iz predpomnilnika in sprememb **ni videti**.
  Za vsak zagon nova mapa profila (ali pa profil pobriši).
- **Izpis se zajame ob dogodku `load`, torej prezgodaj za vse, kar čaka.** Rezultata
  `await`-a (na primer namestitve service workerja) v `--dump-dom` ni. `--virtual-time-budget`
  tu ne pomaga, ampak škodi: ura teče pospešeno, service worker pa se namesti v pravem
  času in ga zato nikoli ne dočaka. Rešitev: dogodek `load` zadrži nedosegljiva slika
  (`<img src="http://10.255.255.1/x.png">`), izpis pa se zajame z `--timeout=15000`
  v pravem času. Tako je bil preverjen odgovor 206 na zahtevo z glavo `Range`.

Shramba se napolni z začasno stranjo, ki v `localStorage` zapiše ključ `fitnes` in
jo naloži isti profil — zasloni brez podatkov povedo malo.

## Ikone aplikacije

Vse tri ikone v `aplikacija/icons/` so narejene iz zadnje sličice uvodnega posnetka.
Ob novem logotipu se postopek ponovi (Pillow je nameščen, Node ni potreben):

1. sličica iz posnetka:
   `ffmpeg -sseof -0.3 -i media/fitnes_aplikacija_start_mobile.mp4 -frames:v 1 logo.png`
2. iz nje se z odmikom svetlosti (`lum > 140`) izreže bel logotip s prosojnim ozadjem,
   ta pa se položi na preliv `#9d0f0b → #661714`;
3. tri datoteke: `icon-512.png` in `icon-192.png` z logotipom čez **68 %** stranice,
   `icon-512-maskable.png` čez **50 %** — Android ikono izreže v svojo obliko in vse
   zunaj notranjih 80 % lahko odpade.

Ozadje mora biti polno, brez prosojnosti: iPhone prosojne dele ikone izriše črno.
Ista sličica, pomanjšana na 540×960, je `media/intro-poster.jpg`.

## Namestitev na telefon

**Android / Chrome:** meni ⋮ → *Dodaj na domači zaslon* → izberi **Namesti**
(ne *Ustvari bližnjico* — to je le zaznamek, ki se odpre v brskalniku z naslovno vrstico).

**iPhone / Safari:** Deli → *Dodaj na začetni zaslon*. Mora biti Safari; iz Chroma na
iOS ne gre.

**Pozor na vgrajene brskalnike.** Če povezavo odpreš iz sporočila ali družbenega omrežja,
se odpre v WebView, ki ponuja samo zaznamek. Znak, da si v njem: v meniju piše
*Odpri v Samsung Browser* ali podobno. Naslov je treba odpreti v pravem brskalniku.

**Kako preveriš, da je res nameščena:** zaženi jo z ikone. Če na vrhu **ni naslovne vrstice**,
je namestitev prava. Če jo vidiš, imaš samo zaznamek.

## Branje fitnes-aplikacija.docx

Orodje Read ne zna razčleniti `.docx`. Datoteka je ZIP, besedilo je v `word/document.xml`.
Ta ukaz ga prebere v pomnilniku, brez razpakiranja na disk:

```powershell
Add-Type -AssemblyName System.IO.Compression.FileSystem
$path = "c:\Users\timon\Osebno\Programi\Fitnes aplikacija\fitnes-aplikacija.docx"
$zip = [System.IO.Compression.ZipFile]::OpenRead($path)
try {
  $entry = $zip.Entries | Where-Object { $_.FullName -eq 'word/document.xml' }
  $sr = New-Object System.IO.StreamReader($entry.Open())
  $xml = $sr.ReadToEnd(); $sr.Close()
  $xml = $xml -replace '</w:p>', "`n" -replace '<w:br[^>]*/>', "`n" -replace '<[^>]+>', ''
  $xml -replace '&amp;', '&' -replace '&lt;', '<' -replace '&gt;', '>' -replace '&quot;', '"'
} finally { $zip.Dispose() }
```

Če je dokument odprt v Wordu, obstaja tudi zaklepna datoteka `~$tnes-aplikacija.docx`.
To je začasna navlaka; v `.gitignore` je vzorec `~$*`, da ne pride v repozitorij.
