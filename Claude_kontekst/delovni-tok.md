# Delovni tok

## Okolje

| Orodje | Stanje |
|---|---|
| Python | 3.13.14 — na voljo, uporabljava ga za lokalni strežnik |
| git | 2.54.0 |
| Node.js | **ni nameščen** — in ga zaenkrat ne rabiva |
| gh CLI | **ni nameščen** — GitHub nastavitve ureja Timon prek brskalnika |

## Lokalni zagon

V mapi projekta (ali v `prototip/`):

```
python -m http.server 5500
```

Nato `http://localhost:5500` v Chromu. Ustavi se s `Ctrl + C`.

**Zakaj strežnik in ne dvoklik na datoteko?** Ob dvokliku se naslov začne s `file://`,
kjer se service worker iz varnostnih razlogov ne registrira. Aplikacija bi delovala,
PWA del pa ne. `localhost` velja za varen naslov, zato tam deluje vse.

## Objava

```
git add -A
git commit -m "opis spremembe"
git push
```

GitHub Pages je nastavljen na vejo `main`, mapa `/ (root)`. Objava traja minuto ali dve,
napredek je viden v zavihku **Actions** na GitHubu.

- Prava aplikacija (kasneje): `https://timonjeretic.github.io/Fitnes-aplikacija/`
- Prototip: `https://timonjeretic.github.io/Fitnes-aplikacija/prototip/`

Datoteka `.nojekyll` na korenu prepreči, da bi GitHub Pages spustil datoteke skozi Jekyll
in preskočil tiste, ki se začnejo s podčrtajem.

## Pravilo predpomnilnika — najpogostejša past

Service worker trmasto servira shranjeno različico. Po **vsaki** spremembi kode je treba
povečati verzijo v `sw.js`:

```js
const CACHE = 'prototip-v2';   // v1 -> v2 -> v3 ...
```

Med razvojem v Chromu pomaga tudi: `F12` → zavihek **Application** → **Service workers**
→ obkljukaj **Update on reload**.

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
