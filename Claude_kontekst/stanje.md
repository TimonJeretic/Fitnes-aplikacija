# Stanje projekta

**Zadnja posodobitev:** 2026-07-29

To datoteko posodabljam sam, kadar se stanje spremeni. Kronologije tukaj ni —
piše, kaj **danes** stoji. Zakaj je nekaj tako, je v [odlocitve.md](odlocitve.md).

## Kaj stoji

**Ogrodje.** Aplikacija živi v `aplikacija/` in je nameščiva PWA: `manifest.json`,
`sw.js` s predpomnilnikom in ikone. `index.html` v korenu samo preusmeri v podmapo.
Zasloni so trije (TRENING, TEŽA, STATISTIKA), našteti v `js/startup/screen_register.js`;
prazni četrti zaslon RAČUN je odstranjen. Router zna podpoti (`#/statistika/arhiv`),
zato sistemski gumb *nazaj* dela pravilno. Ob zagonu se predvaja uvodni posnetek
(`js/startup/splash.js`), ki ga dotik preskoči in ki aplikacije nikoli ne zaklene.

**Podatki.** `js/store.js` je edina pot do `localStorage`, model je pri
`schemaVersion: 5`. Migracije so napisane in preizkušene z verzij 1, 3 in 4. Oblika
je v [podatkovni-model.md](podatkovni-model.md).

**Zaslon TRENING.** Brez treninga: seznam preteklih treningov (vsak s številom vaj
in košem za brisanje predloge) in pod črto polje za novo ime. Med treningom: kartice
vaj s serijami, stolpec "zadnjič" (dotik prepiše vrednost v polje levo), okno pod
svinčnikom (zapisek, popravek imena vaje, preklop *vaja z lastno težo*), vlečenje
vaj z ime-ploščico kot ročajem, koš ob plusu (odstrani zadnjo serijo), gumba
*Zavrži* in *Shrani*. Vaja z imenom natanko **"Pull ups"** namesto teže vpisuje
**barvo elastike**: prva škatlica odpre izbirnik s štirimi barvami, možnostjo BW
in *Počisti izbiro*, napisa "kg" pri njej ni.
Izbrana predloga odpre **prazen** trening; vaje prinese gumb *Ponovi zadnji trening*,
ki izgine ob prvi dodani vaji. Izbirnik vaj ponudi samo vaje tega treninga.

**Zaslon TEŽA.** En izbirnik na vrhu določa, kaj vpisuješ in kaj je na grafu:
telesna teža ali katera od meritev telesa. Meritev nastane iz vpisanega imena in
ima svojo enoto (cm ali kg), izbrano ob nastanku. Pod izbirnikom sta polje za
vrednost in datum (prednastavljen na danes) ter *Shrani*; spodaj graf s preklopom
Teden / Mesec / Leto in gumb *Prikaži pretekle meritve*, kjer se vnos zbriše.

**Zaslon STATISTIKA.** Na `#/statistika` sta gumba *Arhiv treningov* in *Arhiv vaj*,
pod njima naslov *Statistika moči*, izbirnik vaje (samo vaje iz zgodovine, s številom
treningov; dokler ni izbrana, v njem sivo piše "Ime vaje") in graf z obdobji.
Obdobje predstavlja **najboljši** nastop v njem, ne povprečje. Pod grafom so gumbi
Teden / Mesec / Leto in razdelek *Najboljša serija po obdobjih*.
`#/statistika/arhiv` je iskanje čez ime in datum hkrati, vrstica se razpre v cel
trening; **samo za branje**. `#/statistika/vaje` je register vaj po abecedi, dotik
razpre rekord (`PR: 102,5 kg × 5`), koš vajo zbriše iz vseh zapisov hkrati.

**Varnostna kopija.** Zobnik desno zgoraj na vseh treh zaslonih odpre okno
(`js/settings.js`) z gumbi *Uvoz kopije*, *Izvozi zdaj* in — kjer je to mogoče —
*Določi mapo za kopije*; spodaj piše, kako kopija na tej napravi nastane in kdaj je
nastala nazadnje. Pisanje v datoteko je v `js/backup.js` in ima tri načine, izbrane
po tem, kaj naprava zna, ne po imenu brskalnika:

- **mapa** (namizje, morda Android): mapo izbereš enkrat, ročaj živi v IndexedDB,
  aplikacija vanjo tiho piše ob vsakem shranjenem treningu ali vnosu teže. Nastaneta
  `fitnes-kopija.json` (vedno zadnje stanje) in `fitnes-YYYY-MM-DD.json` (enkrat na dan).
- **deljenje** (iPhone): ob vsakem shranjevanju se odpre sistemsko okno za deljenje.
- **prenos**: zasilni izhod, datoteka pade v mapo Prenosi.

Kopija ne more podreti shranjevanja: trening je shranjen, preden se karkoli od tega
zgodi, napake pa končajo v stanju pod ključem `fitnes-kopija` in ne na zaslonu.
Uvoz povozi vse, zato pred njim stoji potrditev s številom treningov na obeh straneh.

**Videz.** Ena barva `#9d0f0b` za vso aplikacijo, preliv v `#661714`. Spodaj Timonove
ikone namesto črk (`js/icons.js`), vsak zaslon ima na vrhu isto ikono in naslov
(`.brand`) — ta se ne premakne, drsi samo vsebina med njim in spodnjo vrstico
gumbov. Dotik gumba, s katerim se nekaj izbere, ga pobarva; glavni gumb potemni.
Izbiranje meritve in vaje se odpre v spustnem seznamu čez zaslon (`js/sheet.js`).
Ikone aplikacije so narejene iz zadnje sličice uvodnega posnetka.

## Kaj je preverjeno in kako

Node.js ni nameščen, zato je vse teklo v **brezglavem Edgeu** proti
`python -m http.server` (postopek in pasti: [delovni-tok.md](delovni-tok.md)).

- **Samodejni preizkusi** shrambe, grafa in zaslonov: TRENING (cela pot od novega
  treninga do shranjenega, vlečenje, omejitev vnosa), TEŽA (migracija, prepis vnosa
  na isti dan, povprečenje po obdobjih, rez osi Y), STATISTIKA (formula moči in
  njena konkavnost, prištevanje telesne teže, iskanje po imenu in datumu).
  Imena se povsod primerjajo brez ozira na šumnike in velike črke.
- **Izris vseh poti** na polni shrambi: `#/trening` (prazen in s treningom v teku),
  `#/teza`, `#/statistika`, `#/statistika/arhiv`, `#/statistika/vaje` in nesmiseln
  naslov.
- **Postavitev** izmerjena pri 320, 360, 390 in 430 px — nič se ne preliva čez rob.
  Vrstica serije je izmerjena po delih: pri 360 px zasede 308 px od 312, pri 320 px
  pa 270 od 272 (tam jo skrči `@media (max-width: 340px)` v `training.css`).
- **Lepljiva glava** (`.brand`): po 300 px drsenja ostane na vrhu zaslona,
  spodnja vrstica gumbov pa je zunaj drsečega dela že po zgradbi strani.
- **Delni odgovor (206)** service workerja na zahtevo z glavo `Range` — brez tega
  se uvodni posnetek na iPhonu ni predvajal.
- **Varnostna kopija:** izvoz da veljaven JSON, branje nazaj ohrani števila,
  tuja datoteka JSON in skvarjeno besedilo sta zavrnjena (ne izpraznita podatkov),
  uvoz vase ohrani vse. Okno se izriše z vsemi gumbi, stanje ("Mapa še ni določena",
  "Kopije še ni") se dopiše iz IndexedDB. Zobnik je na vseh treh zaslonih.
  **Pisanje v mapo in okno za deljenje nista preizkušena** — oboje zahteva sistemsko
  okno in pravi dotik, brezglavi brskalnik pa tega ne zna.

**Na telefonu preverjeno (iPhone, nameščena aplikacija):** ikona na domačem zaslonu,
uvodna animacija in prazen pas pod spodnjimi gumbi. Zadnji je bil **zunaj** okna
aplikacije: kriv je bil `black-translucent`, ki vsebino potisne pod uro, okna pa ne
poveča. Zamenjano za `black` — pas je izginil, cena je, da se vsebina zgoraj ne
razliva več pod uro. Odmik pod gumbi je `max(calc(var(--safe-bottom) - 14px), 8px)`
(na iPhonu 20 px), da črtica za domov leži na podlagi pod kvadratki.

Uvodna animacija se v **varčevanju z baterijo** ne predvaja — takrat iPhone ustavi
samodejno predvajanje tudi pri utišanem posnetku. Namesto nje se pokaže slika
logotipa; to ni okvara in se ne da zaobiti.

**Še ni preverjeno v roki:** tipkovnica, ki je na iOS ostala odprta za polje,
odstranjeno z zaslona (zato `blur()` pred vsakim takim izrisom in izrecni
`user-select: text` na poljih), ter nova razporeditev vrstice serije.

## Sledi

1. **Preizkus na telefonu** — vse zgoraj je iz brskalnika na računalniku.
   Tipkovnica, velikost tarč in drsenje se pokažejo šele v roki.
2. **Označi vaje z lastno težo** — migracija je vse vaje postavila na `false`.
   Zgibi, sklece in dipsi rabijo preklop v oknu pod svinčnikom.
3. **Vpiši prvo telesno težo** — brez nje vaje z lastno težo grafa moči nimajo.
4. **Določi mapo za kopije** in preveri, da datoteka res nastane. Na Androidu je
   odprto vprašanje, ali Chrome `showDirectoryPicker()` sploh ima; če ga nima, pade
   na okno za deljenje. Vidi se v nastavitvah — napis pove, kateri način velja.

## Odprta vprašanja

- **Kje se ureja in briše zgodovina** (napačno vpisan trening). Arhiv jo pokaže,
  popraviti pa je še ni mogoče, ko je enkrat shranjena.
- **Kam pride brisanje podatkov.** Izvoz in uvoz sta zdaj v oknu pod zobnikom;
  brisanje vsega tam namenoma še ni, ker je preblizu gumbu za uvoz.
- **Ali aplikacija ostane v podmapi `aplikacija/`** ali se kdaj preseli na koren
  zaradi lepšega naslova.
