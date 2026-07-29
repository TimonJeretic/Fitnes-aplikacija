# Delovni tok

## Okolje

| Orodje | Stanje |
|---|---|
| Python | 3.13.14 — na voljo, uporabljava ga za lokalni strežnik |
| git | 2.54.0 |
| Node.js | **ni nameščen** — in ga zaenkrat ne rabiva |
| gh CLI | **ni nameščen** — GitHub nastavitve ureja Timon prek brskalnika |

## Lokalni zagon

V mapi projekta (na korenu, ne v podmapi):

```
python -m http.server 5500
```

Nato v Chromu:

- prava aplikacija: `http://localhost:5500/aplikacija/`
- prototip: `http://localhost:5500/prototip/`

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

- Prava aplikacija: `https://timonjeretic.github.io/Fitnes-aplikacija/aplikacija/`
- Prototip: `https://timonjeretic.github.io/Fitnes-aplikacija/prototip/`

Datoteka `.nojekyll` na korenu prepreči, da bi GitHub Pages spustil datoteke skozi Jekyll
in preskočil tiste, ki se začnejo s podčrtajem.

## Pravilo predpomnilnika — najpogostejša past

Service worker trmasto servira shranjeno različico. Po **vsaki** spremembi kode je treba
povečati verzijo v tistem `sw.js`, ki mu spremenjena datoteka pripada:

```js
const CACHE = 'aplikacija-v1';   // v1 -> v2 -> v3 ...   (aplikacija/sw.js)
const CACHE = 'prototip-v2';     // (prototip/sw.js)
```

Prototip in aplikacija imata **ločena predpomnilnika** — sprememba v enem ne vpliva
na drugega.

Druga past, ki jo prinese razdelitev na module: vsaka nova datoteka (`js/screens/*.js`,
nov CSS) mora biti našteta v `FILES` v `aplikacija/sw.js`. Če je ni, se aplikacija
z internetom odpre normalno, brez interneta pa se sesuje.

Med razvojem v Chromu pomaga tudi: `F12` → zavihek **Application** → **Service workers**
→ obkljukaj **Update on reload**.

## Preizkus izrisa v brezglavem brskalniku

Node.js ni nameščen, zato zaslone preverjava z brezglavim Edgeom. Strežnik mora teči.

```
msedge.exe --headless --disable-gpu --virtual-time-budget=8000 --dump-dom <naslov>
msedge.exe --headless --disable-gpu --window-size=780,940 --screenshot=<pot.png> <naslov>
```

Dve pasti, ki sta obe stali eno napačno ugotovitev:

- **Okno ne gre pod ~490 px.** `--window-size=390,844` naredi sliko 390 px široko,
  stran pa se vseeno postavi pri ~488 px — slika je torej **odrezana**, ne ozka.
  Postavitev pri 320 / 360 / 390 px se zato preveri tako, da se aplikacija naloži
  v `<iframe width="360">` na začasni strani v korenu projekta (ime naj se začne s
  podčrtajem, po preizkusu se pobriše).
- **Service worker servira staro kodo.** Če se ista mapa `--user-data-dir` uporabi
  dvakrat, drugi zagon dobi datoteke iz predpomnilnika in sprememb **ni videti**.
  Za vsak zagon nova mapa profila (ali pa profil pobriši).

Shramba se napolni z začasno stranjo, ki v `localStorage` zapiše ključ `fitnes` in
jo naloži isti profil — zasloni brez podatkov povedo malo.

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
