# Fitnes aplikacija

Osebni dnevnik treningov in prehrane: vaje, seti, ponovitve, kile, obroki, plus
grafi napredka moči, telesne teže in vnosa kalorij. PWA brez backenda — podatki
živijo na telefonu.

- **Živa aplikacija:** https://timonjeretic.github.io/Fitnes-aplikacija/aplikacija/
- **Repozitorij je JAVEN.** Vse, kar gre v git, je javno berljivo. Nič občutljivega
  v kodo ali dokumente.

## Trenutno stanje

Cela aplikacija stoji v `aplikacija/`. Štirje zasloni delajo: **TRENING** (predloge,
register vaj, serije sedmih vrst s stolpcem "zadnjič", vlečenje vaj, vpis cardia),
**TEŽA** (telesna teža in meritve telesa, graf), **STATISTIKA** (graf moči, arhiv
treningov, arhiv vaj) in **PREHRANA** (obroki, maintenance, graf teže in kalorij
hkrati na dveh oseh).
Podatkovni model je pri `schemaVersion: 7`, edina pot do njega je `js/store.js`.
Zobnik desno zgoraj odpre okno z varnostno kopijo: uvoz, izvoz in izbira mape, v
katero se podatki zapišejo ob vsakem shranjenem treningu (`js/backup.js`).
Videz je poenoten: ena barva `#9d0f0b`, ikone namesto črk spodaj, uvodna animacija
ob zagonu. Vse je preverjeno v brskalniku na računalniku, **na telefonu ne**.

Podrobnosti in kaj sledi: `Claude_kontekst/stanje.md`

## TODO

- **Nastavi razmerje osi na grafu prehrane.** `AXIS_RATIO` v `aplikacija/js/chart.js`
  je zdaj 40 (1 kg = 40 kcal). Prava vrednost se pokaže šele na resničnih podatkih:
  večja številka črti stisne skupaj, manjša ju razmakne.
- **Poglej, ali sta 0,8 in 1,2 prava množitelja za os Y.** Dno osi je najnižja
  vrednost krat `Y_FLOOR`, vrh najvišja krat `Y_CEILING` (`aplikacija/js/chart.js`).
  Pri teži je krivulja s tem skoraj ravna; bližje ena, bolj se razpre.
- **Označi vaje z lastno težo.** Migracija je vse vaje postavila na
  `usesBodyweight: false`. Zgibi, sklece in dipsi rabijo preklop v oknu pod
  svinčnikom, sicer graf moči pri njih upošteva samo dodano težo in ne telesne.
  Odkar je elastika svoja **vrsta serije**, to velja tudi za zgibe: serija vrste
  *Elastika* na graf moči ne gre, zgib brez elastike pa se vpiše kot *Navaden set*
  in takrat mora biti vaja označena z lastno težo, sicer je na grafu ni.
- **Vpiši telesno težo na zaslonu TEŽA.** Brez enega samega tehtanja vaje z
  lastno težo grafa nimajo; namesto njega piše razlog.
- **Preizkusi na telefonu.** Tipkovnica, velikost tarč in drsenje arhiva se
  pokažejo šele v roki.
- **Kopijo naredi sam, ko jo hočeš.** Zobnik desno zgoraj → *Izvozi zdaj*. Kopija
  **nikoli** ne nastane sama, na nobeni napravi — prej je na iPhonu ob vsakem
  shranjenem treningu skočilo okno za deljenje. Na namizju se z *Določi mapo za
  kopije* enkrat izbere mapa in izvoz gre tiho vanjo; na iPhonu se odpre okno za
  deljenje, drugje datoteka pade v Prenose.

## Stalna pravila

- **Koda angleško, vmesnik slovensko.** Identifikatorji, polja in CSS razredi angleško
  (`weightKg`, `addSet()`), besedilo na zaslonu slovensko ("Dodaj serijo").
  V kodi nikoli šumnikov; v komentarjih in UI besedilu so normalni.
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
- **Besedilo za uporabnika gre v `aplikacija/js/besedilo.js`** (izvoz `TEXT`),
  nikoli razsuto po zaslonih.
- **Aplikacija se uporablja v telovadnici, z eno roko.** Veliki gumbi, malo tipkanja,
  čim manj korakov do vpisanega seta.

## Vzdrževanje konteksta — moja odgovornost, ne Timonova

- Datoteke v `Claude_kontekst/` berem **sam od sebe**, kadar so relevantne za nalogo.
- Ko sprejmeva odločitev, jo **takoj** zapišem v `odlocitve.md`. Ko odločitev pade,
  starega vpisa ne brišem — označim ga kot ovrženega in dodam novega.
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
| `Claude_kontekst/delovni-tok.md` | poganjaš lokalno, objavljaš, preizkušaš brez Node.js, nameščaš na telefon ali bereš docx |
| `Claude_kontekst/odlocitve.md` | se sprašuješ, zakaj je nekaj tako; preden predlagaš spremembo pristopa |
| `Claude_kontekst/stanje.md` | začenjaš sejo in rabiš vedeti, kje sva ostala |

Te poti so navadne markdown povezave in se **ne** nalagajo samodejno. To je namerno:
indeks ostane kratek, podrobnosti se preberejo po potrebi.
