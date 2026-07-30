# Stanje projekta

**Zadnja posodobitev:** 2026-07-30

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
`schemaVersion: 6`. Migracije so napisane in preizkušene z verzij 1, 3, 4 in 5.
Oblika je v [podatkovni-model.md](podatkovni-model.md).

**Zaslon TRENING.** Brez treninga: seznam preteklih treningov (vsak s številom vaj
in košem za brisanje predloge) in pod črto polje za novo ime. Med treningom: kartice
vaj s serijami, stolpec "zadnjič" (dotik prepiše vrednost v polje levo), okno pod
svinčnikom (zapisek, popravek imena vaje, preklop *vaja z lastno težo*), vlečenje
vaj za **pikice** na ploščici z imenom, koš ob plusu (odstrani zadnjo serijo), gumba
*Zavrži* in *Shrani*.

Plus pod serijami odpre **izbiro vrste serije**: *Navaden set, Superset, Dropset,
Myoreps, Elastika, Čas, Prazen set*. Številko dobijo in porabijo samo navaden set,
elastika, čas in prazen set — zaporedje je torej `Set 1, Superset, Set 2, Dropset,
Set 3`. Med dvema supersetoma se izriše `+`, nad dropsetom `↓`. Elastika namesto
teže odpre izbirnik s štirimi barvami, dvema debelinama rdeče, možnostjo BW in
*Počisti izbiro*; v škatlici je risba elastike v svoji barvi. Čas ima namesto
`teža × ponovitve` dve škatlici, minute in sekunde. Prazen set je samo napis čez
celo vrstico. Vrsta se ob dodajanju izbere in se kasneje ne menja; pot nazaj je koš.

**Dodana vaja se odpre brez ene same serije** — tudi tista, ki jo delaš vsak teden.
Vsaka vrstica nastane z gumbom +, koš pa jih odstrani do zadnje. Vaja brez serij
je s tem običajno stanje: v zgodovino ne pride, v predlogo pa gre.

Za **graf moči in rekord šteje samo navaden set** — razlog je v
[odlocitve.md](odlocitve.md).

Izbrana predloga odpre **prazen** trening; vaje prinese gumb *Ponovi zadnji trening*,
ki izgine ob prvi dodani vaji. Plus odpre **okno čez zaslon**: iskalno polje na vrhu,
pod njim cel register vaj po abecedi, zadnja vrstica naredi vpisano ime (*Nova vaja: …*).
Filtra po imenu treninga ni več.

**Zaslon TEŽA.** En izbirnik na vrhu določa, kaj vpisuješ in kaj je na grafu:
telesna teža ali katera od meritev telesa. Meritev nastane iz vpisanega imena in
ima svojo enoto (cm ali kg), izbrano ob nastanku. Pod izbirnikom sta polje za
vrednost in datum (prednastavljen na danes) ter *Shrani*; spodaj graf s preklopom
Dan / Mesec / Leto in gumb *Prikaži pretekle meritve*, kjer se vnos zbriše.

**Zaslon STATISTIKA.** Na `#/statistika` sta gumba *Arhiv treningov* in *Arhiv vaj*,
pod njima naslov *Statistika moči*, izbirnik vaje (samo vaje iz zgodovine, s številom
treningov; dokler ni izbrana, v njem sivo piše "Ime vaje") in graf z obdobji.
Obdobje predstavlja **najboljši** nastop v njem, ne povprečje. Pod grafom so gumbi
Dan / Mesec / Leto in razdelek *Najboljša serija po obdobjih*.
`#/statistika/arhiv` je iskanje čez ime in datum hkrati, vrstica se razpre v cel
trening; **samo za branje**. `#/statistika/vaje` je register vaj po abecedi, dotik
razpre rekord (`PR: 102,5 kg × 5`), koš vajo zbriše iz vseh zapisov hkrati.

**Varnostna kopija.** Zobnik desno zgoraj na vseh treh zaslonih odpre okno
(`js/settings.js`) z gumbi *Uvoz kopije*, *Izvozi zdaj* in — kjer je to mogoče —
*Določi mapo za kopije*; spodaj piše, da kopija nikoli ne nastane sama, kam gre na
tej napravi in kdaj je nastala nazadnje.

**Kopija se ne dela sama — nikoli, na nobeni napravi.** Nastane samo na dotik
*Izvozi zdaj*; shranjen trening in vnos teže je ne sprožita (`afterSave()` ne
obstaja več). Pisanje v datoteko je v `js/backup.js` in ima tri načine, izbrane po
tem, kaj naprava zna, ne po imenu brskalnika:

- **mapa** (namizje, morda Android): mapo izbereš enkrat, ročaj živi v IndexedDB,
  izvoz vanjo piše brez spraševanja. Nastaneta `fitnes-kopija.json` (vedno zadnje
  stanje) in `fitnes-YYYY-MM-DD.json` (enkrat na dan).
- **deljenje** (iPhone): ob izvozu se odpre sistemsko okno za deljenje.
- **prenos**: zasilni izhod, datoteka pade v mapo Prenosi.

Kopija ne more podreti shranjevanja: podatki so v shrambi, preden se karkoli od tega
zgodi, napake pa končajo v stanju pod ključem `fitnes-kopija` in ne na zaslonu.
Uvoz povozi vse, zato pred njim stoji potrditev s številom treningov na obeh straneh.

**Videz.** Ena barva `#9d0f0b` za vso aplikacijo, preliv v `#661714`. Spodaj Timonove
ikone namesto črk (`js/icons.js`), vsak zaslon ima na vrhu isto ikono in naslov
(`.brand`) — ta se ne premakne, drsi samo vsebina med njim in spodnjo vrstico
gumbov. Dotik gumba, s katerim se nekaj izbere, ga pobarva; glavni gumb potemni.
Izbiranje meritve in vaje se odpre v spustnem seznamu čez zaslon (`js/sheet.js`).
Ikone aplikacije so narejene iz zadnje sličice uvodnega posnetka.

## Kaj je preverjeno in kako

Starejši preizkusi so tekli v **brezglavem Edgeu** proti `python -m http.server`.
Od 2026-07-30 je nameščen **Node.js 24**, zato logika shrambe teče kar v njem, izris
pa v **brezglavem Chromu prek DevTools protokola** — ta zna tudi posnetek zaslona in
pravo širino telefona (postopek in pasti: [delovni-tok.md](delovni-tok.md)).

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
- **Vrste serij (verzija 6):** vsaka od sedmih se doda skozi okno pod plusom in
  se izriše po svoje; številčenje da `Set 1, Superset, Superset, Dropset, Myoreps,
  Set 2, Set 3, Set 4`; `+` stoji med dvema supersetoma in `↓` nad dropsetom;
  prazen set nima ne polj ne stolpca "zadnjič"; čas vpisan kot 2 in 5 da 125 sekund
  in prazni polji dasta nazaj `null`; izbrana elastika se shrani in škatlica dobi
  razred `band--red-thick`; koš odstrani zadnjo vrstico. Ob shranjevanju pade ven
  samo prazna **navadna** serija. Na graf moči pride ena sama točka — iz navadne
  serije (102,5 × 8 → 140 kg), superset s 60 kg ne šteje.
- **Vaja brez serij:** vaja s tremi serijami v zgodovini in vaja, ki je še ni bilo,
  se obe odpreta s praznim seznamom vrstic; koš je takrat ugasnjen; plus doda eno
  vrstico in ta v stolpcu "zadnjič" pokaže **prvo** serijo od zadnjič; koš gre
  nazaj do nič. Ob shranjevanju vaja brez serij v zgodovino ne pride, v predlogi
  pa ostane.
- **Migracija 5 → 6** na starem zapisu: `band: 'red'` postane `'red-thin'`, serija
  z elastiko dobi `kind: 'band'`, serija brez nje `'normal'`, trening v teku gre
  skozi isto pot. Izvoz in ponoven uvoz vrste serij ohranita.
- **Arhiv piše isto kot trening:** isti napisi vrstic in zapisi
  `Rdeča debela × 7`, `— × 7` (elastika brez izbire), `1:35` (čas), `—` (prazen set).
- **Izbirnik vaj (popup z iskalnikom):** polje je nad seznamom, seznam je cel
  register po abecedi brez že dodanih vaj, tipkanje ga oži, neznano ime ponudi
  *Nova vaja: …* in ta vrstica vajo res naredi (v treningu in v registru). Vpisano
  ime vaje, ki je v treningu že, dvojnika ne naredi. Popup se pri 360 px ne preliva,
  vrstica je visoka 52 px.
- **Vlečenje samo za pikice:** `pointerdown` na imenu vaje kartice **ne** začne
  vleči, `pointerdown` na pikicah jo začne in spust konča. Ploščica z imenom nima
  več `touch-action: none`, pikice ga imajo; tarča meri 40 × 40 px.
- **Obdobja Dan / Mesec / Leto** na obeh grafih: gumbi imajo te tri napise,
  dnevni graf pusti vsak dan svojo točko (dva vnosa istega dne se zlijeta v
  povprečje, dva treninga istega dne v boljšega od obeh), napis na osi je `1. 8.`
- **Kopija se ne dela sama:** `backup.afterSave()` ne obstaja, noben zaslon ne
  uvaža `backup.js`, shranjen trening in vnos teže pustita `fitnes-kopija` pri miru.
  V nastavitvah piše, da kopija nikoli ne nastane sama.
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
