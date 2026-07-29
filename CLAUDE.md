# Fitnes aplikacija

Osebni dnevnik treningov: vaje, seti, ponovitve, kile, plus grafa napredka
moči in telesne teže. PWA brez backenda — podatki živijo na telefonu.

- **Živa aplikacija:** https://timonjeretic.github.io/Fitnes-aplikacija/
- **Repozitorij je JAVEN.** Vse, kar gre v git, je javno berljivo. Nič občutljivega
  v kodo ali dokumente.

## Trenutno stanje

Prava aplikacija stoji v `aplikacija/`. Podatkovni model je potrjen in
implementiran (`js/store.js`), zaslon **TRENING** dela: predloge treningov,
register vaj, serije s stolpcem "zadnjič", zapiski pri vajah, premikanje vaj
z vlečenjem, shrani/zavrži. Dela tudi zaslon **TEŽA**: vnos telesne teže in meritev
telesa, zgodovina vnosov in graf napredka (`js/chart.js`, ročno napisan SVG).
Zaslon **STATISTIKA** ima arhiv treningov (`#/statistika/arhiv`) in graf moči po
vaji. Zaslonov je troje; prazni zaslon RAČUN je odstranjen.
Videz je poenoten: ena barva `#9d0f0b` za vso aplikacijo, ikone namesto črk na
spodnjih gumbih (`js/icons.js`), dotik gumba ga pobarva.
Podrobnosti: `Claude_kontekst/stanje.md`

## TODO

- **Označi vaje z lastno težo.** Migracija na `schemaVersion: 3` je vse obstoječe
  vaje postavila na `usesBodyweight: false`. Zgibi, sklece in dipsi rabijo preklop
  v oknu pod svinčnikom na zaslonu TRENING — brez tega graf moči pri njih upošteva
  samo dodano težo in ne telesne.
- **Vpiši telesno težo na zaslonu TEŽA.** Dokler ni nobenega tehtanja, vaje z
  lastno težo grafa nimajo; namesto njega piše razlog.
- **Preizkusi na telefonu.** Vse je preverjeno v brskalniku na računalniku.
  Tipkovnica, velikost tarč in drsenje arhiva se pokažejo šele v roki.

**Preizkusi brez Node.js:** brezglavi Edge zna pognati stran in izpisati DOM —
`msedge.exe --headless --disable-gpu --virtual-time-budget=8000 --dump-dom <naslov>`,
ob tem pa `python -m http.server 5500` iz korena. Tako so bili preverjeni zasloni.
Dve pasti (okno ne gre pod ~490 px, service worker servira staro kodo) so opisane
v `Claude_kontekst/delovni-tok.md`.

## Stalna pravila

- **Koda angleško, vmesnik slovensko.** Identifikatorji, polja in CSS razredi angleško
  (`weightKg`, `addSet()`), besedilo na zaslonu slovensko ("Dodaj serijo").
  V kodi nikoli šumnikov; v UI besedilu so normalni.
- **Verzije `CACHE` v `sw.js` ne spreminjam — to dela Timon sam.** Nikoli je ne
  popravim na svojo pest, tudi če sem kodo pravkar spremenil. Ko končam spremembo,
  ga samo **opozorim, da jo je treba dvigniti**, sicer telefon servira staro
  različico in izgleda, kot da koda ne deluje.
  Vsako novo datoteko pa **moram** sam dopisati v `FILES` v `aplikacija/sw.js`,
  sicer aplikacija brez interneta ne dela. To ni verzija in ni Timonovo delo.
- **Nov zaslon = nova datoteka v `aplikacija/js/screens/` + ena vrstica v
  `aplikacija/js/startup/screen_register.js`.**
  Gumb, barva in naslov se naredijo sami. Podrobnosti: `Claude_kontekst/arhitektura.md`.
- **Do podatkov samo prek `aplikacija/js/store.js`.** Noben zaslon ne kliče
  `localStorage` neposredno in ne brska po poljih sam — kar rabi, vpraša store.
  Ob spremembi strukture podatkov se dvigne `schemaVersion` in dopolni `migrate()`,
  sicer posodobitev pobriše zgodovino treningov.
- **Aplikacija se uporablja v telovadnici, z eno roko.** Veliki gumbi, malo tipkanja,
  čim manj korakov do vpisanega seta.

## Vzdrževanje konteksta — moja odgovornost, ne Timonova

- Datoteke v `Claude_kontekst/` berem **sam od sebe**, kadar so relevantne za nalogo.
- Ko sprejmeva odločitev, jo **takoj** zapišem v `odlocitve.md`.
- Ko se spremeni stanje projekta (nova funkcija, deploy, potrjeno delovanje),
  posodobim `stanje.md`.
- Ko se spremeni podatkovni model ali arhitektura, posodobim ustrezno datoteko
  **v istem commitu kot kodo**. Dokument in koda se ne smeta razjti.
- **Edina izjema:** `fitnes-aplikacija.docx`, berem ga **samo**
  na izrecno zahtevo in ga nikoli ne spreminjam. Navodilo za branje je v `delovni-tok.md`.

## Kje kaj piše

Odpri samo tisto datoteko, ki jo za trenutno nalogo res potrebuješ.

| Datoteka | Odpri, ko |
|---|---|
| `Claude_kontekst/produkt.md` | se sprašuješ, kaj naj aplikacija dela ali česa namenoma ne; slovar BW/BB/DB |
| `Claude_kontekst/podatkovni-model.md` | delaš s podatki, shrambo, migracijami ali grafi |
| `Claude_kontekst/arhitektura.md` | pišeš kodo: konvencije, sestavni deli PWA, struktura map |
| `Claude_kontekst/delovni-tok.md` | poganjaš lokalno, objavljaš, nameščaš na telefon ali bereš docx |
| `Claude_kontekst/odlocitve.md` | se sprašuješ, zakaj je nekaj tako; preden predlagaš spremembo pristopa |
| `Claude_kontekst/stanje.md` | začenjaš sejo in rabiš vedeti, kje sva ostala |

Te poti so navadne markdown povezave in se **ne** nalagajo samodejno. To je namerno:
indeks ostane kratek, podrobnosti se preberejo po potrebi.
