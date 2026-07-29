# Dnevnik odločitev

Zakaj so stvari take, kot so. Namen: da se o istem ne razpravlja dvakrat.
Vsak vpis ima **kaj**, **zakaj** in **kaj bi ga ovrglo**.

Nove odločitve dodajam sam, takoj ko padejo — brez čakanja, da Timon reče.

---

## 2026-07-29 — Formula moči: koren ponovitev

**Odločitev:** graf moči riše oceno 1RM po Timonovi formuli

```
1RM = weightKg * (1 + (sqrt(reps) - 1) / 5)
```

Vrednost treninga je **najboljša** serija tiste vaje tisti dan, ne povprečje.

**Zakaj:** izbirali smo med najtežjo serijo, skupnim volumnom in ocenjenim 1RM.
Najtežja serija ne loči `100 × 3` od `100 × 8`. Volumen meri opravljeno delo in ne
moči — dodana serija dvigne graf, tudi če si tisti dan slabši. Ostane ocena 1RM.

Zakaj ta zapis in ne Epley (`W × (1 + reps/30)`): Epley je premočrten v ponovitvah,
zato razliko med 18 in 20 ponovitvami obteži enako kot med 2 in 4. To ne drži — dvig
s treh na pet ponovitev je veliko težji od dviga z osemnajstih na dvajset. Koren je
konkaven in to razliko zaobjame sam. Stranska korist: ne rabi zgornje meje ponovitev,
ki jo premočrtne formule potrebujejo, da pri dvajsetih ponovitvah ne pobegnejo.
Pri eni ponovitvi vrne točno vpisano težo.

**Posledica:** ocena se **ne shranjuje**, ampak računa ob branju. Shranjena vrednost
bi pomenila, da popravek formule zahteva predelavo cele zgodovine.

**Kaj bi jo ovrglo:** primerjava z resničnimi poskusi 1RM, ki bi pokazala, da ocena
sistematično greši. Sprememba je poceni: en izraz v `store.js`, noben podatek.

---

## 2026-07-29 — Vaja ve, ali je z lastno težo

**Odločitev:** vaja dobi polje `usesBodyweight` (privzeto `false`), preklop je v oknu
pod svinčnikom. Graf moči pri takih vajah prišteje telesno težo iz `bodyweightEntries`
tistega dne.

**Zakaj:** to je natanko primer, ki ga je vpis *Vaja ima samo ime in zapisek* navedel
kot tisto, kar bi ga ovrglo. Brez polja se ne da ločiti "lastna teža" od "nisem
vpisal" — oboje je `weightKg: null`. Ena pozabljena teža pri benchu bi bench za vedno
spremenila v vajo z lastno težo, brez sledi, zakaj graf laže.

Prištevanje in ne golo štetje ponovitev: pri zgibih z 20 kg na pasu je moč res
`telesna teža + 20`, in samo tako je ta vaja primerljiva s samo sabo skozi leta,
ko se telesna teža spreminja.

**Cena:** obstoječe vaje po migraciji vse ležijo na `false`. Zgibe, sklece in dipse
mora Timon označiti sam, enkrat na vajo.

**Kaj bi jo ovrglo:** nič predvidljivega. Če bi se izkazalo, da je stikalo prepogosto
spregledano, se doda predlog ob prvem vnosu vaje z prazno težo.

---

## 2026-07-29 — Arhiv treningov ima svoj naslov

**Odločitev:** router razume podpot (`#/statistika/arhiv`). Prvi kos naslova je
zaslon, ostanek dobi zaslon kot argument v `render(sub)`.

**Zakaj:** arhiv je še vedno STATISTIKA — isti gumb spodaj, ista barva — a mora imeti
svoj naslov. Brez tega bi sistemski gumb *nazaj* iz arhiva vrgel ven iz aplikacije
namesto nazaj na graf. Aplikacija se uporablja na telefonu, kjer je *nazaj* sistemska
kretnja in ne gumb na zaslonu.

**Posledica:** `DEFAULT_SCREEN` v `router.js` se bere šele ob klicu in ne ob nalaganju
modula. Zaslon, ki hoče `navigate()`, uvozi router, ta pa uvozi register — v takem
krogu register ob nalaganju routerja še ni izpolnjen.

**Kaj bi jo ovrglo:** nič. Če bi zaslon rabil več ravni, se isto pravilo ponovi globlje.

---

## 2026-07-29 — Skupni pomočniki v js/dom.js

**Odločitev:** `el()`, `button()`, `icon()`, `withLabel()`, `parseNumber()`,
`formatNumber()`, `formatDate()`, `formatDay()` živijo v `aplikacija/js/dom.js`.

**Zakaj:** prva dva zaslona sta imela vsak svojo kopijo, kar je bilo še sprejemljivo —
`weight.js` je to celo zapisal kot namen ("ko jih bo rabil še tretji zaslon, se
izluščijo"). S tretjim zaslonom bi bile tri kopije in popravek decimalne vejice bi
bilo treba napisati trikrat.

**Meja:** v `dom.js` gre samo tisto, kar ne ve nič o vsebini aplikacije. Nič o vajah,
nič o teži, nič o shrambi — sicer to ne bi bila skupna datoteka, ampak drugi store.

**Kaj bi jo ovrglo:** nič. Datoteka je majhna in brez odvisnosti.

---

## 2026-07-28 — PWA namesto React Native ali Flutter

**Odločitev:** aplikacija je PWA.

**Zakaj:** cilj je 0 € stroškov in delovanje na Androidu in iPhonu. Prava iOS aplikacija
se na iPhone ne da namestiti brez Applovega podpisa: ali plačaš 99 €/leto, ali jo vsakih
7 dni znova podpisuješ prek AltStore. PWA teh omejitev nima — odpreš naslov in namestiš.
Poleg tega je vstopna ovira najnižja, kar za prvo aplikacijo v življenju šteje največ.

**Kaj bi jo ovrglo:** potreba po widgetu, Apple Watch ali dostopu do Apple Health.
Nič od tega PWA ne zmore.

---

## 2026-07-28 — Brez backenda

**Odločitev:** ni strežnika. Podatki živijo v shrambi brskalnika na telefonu.

**Zakaj:** aplikacijo uporablja ena oseba na eni napravi. Strežnik bi prinesel račune,
prijavo, gostovanje in vzdrževanje — vse to za nič.

**Posledica:** varnostna kopija je izvoz v JSON datoteko. To ni dodatek, ampak zahteva v1.

**Kaj bi jo ovrglo:** želja po istih podatkih na več napravah. Takrat Supabase ali
Firebase, ne lastnoročno pisan strežnik.

---

## 2026-07-28 — Javen repozitorij + GitHub Pages

**Odločitev:** repozitorij `TimonJeretic/Fitnes-aplikacija` je javen, gostuje GitHub Pages.

**Zakaj:** Pages iz **zasebnega** repozitorija zahteva plačljiv paket GitHub Pro.
Alternativi z zasebnim repozitorijem (Netlify, Cloudflare Pages) sta brezplačni, a
zahtevata še eno storitev. Koda ne vsebuje skrivnosti, podatki o treningih pa nikoli
ne pridejo v repozitorij — živijo na telefonu.

**Posledica, ki jo je treba imeti v mislih:** vse v repozitoriju je **javno berljivo**,
vključno z `fitnes-aplikacija.docx`. Nič občutljivega ne sme noter.

---

## 2026-07-28 — Koda angleško, vmesnik slovensko

**Odločitev:** identifikatorji angleško, besedilo na zaslonu slovensko, v kodi brez šumnikov.

**Zakaj:** vsak primer in vsak odgovor, ki ga bo Timon našel na spletu, je v angleščini.
Slovenski identifikatorji bi zahtevali stalno prevajanje pojmov.

**Posledica:** prototip barvnih gumbov je bil prepisan iz slovenskih imen v angleška.

---

## 2026-07-28 — localStorage namesto IndexedDB (za v1)

**Odločitev:** vsi podatki so en JSON objekt v `localStorage`, s poljem `schemaVersion`.

**Zakaj:** IndexedDB ima neroden API in za udobno uporabo zahteva knjižnico, knjižnica pa
build korak ali vendorano datoteko. Dnevnik treningov je majhen — nekaj tisoč setov je
pod 1 MB, omejitev je okoli 5 MB.

**Kaj bi jo ovrglo:** približevanje 5 MB. Ker gre dostop do podatkov skozi eno plast,
je prehod na IndexedDB lokalna sprememba.

---

## 2026-07-28 — Treningi gnezdeni, ne normalizirani

**Odločitev:** trening je en objekt s poljem vaj, vsaka vaja pa s poljem serij.
Ločene tabele `sets` s tujimi ključi (`workoutId`, `exerciseId`) ni. Register vaj
ostane ploščat, ker je zapisek last vaje.

**Zakaj:** en trening je natanko to, kar je na zaslonu. "Shrani" postane
`workouts.push(draft)`, "zavrži" pa `draft = null` — brez čiščenja sirot po treh
tabelah in brez združevanja pri vsakem izrisu. Serija zato ne rabi niti `id` niti
`order`: mesto v polju je zaporedje, od zunaj je nihče ne naslavlja.

**Cena:** graf moči bo moral prehoditi vse treninge, namesto da filtrira eno
tabelo. Pri nekaj sto treningih je to nič.

**Kaj bi jo ovrglo:** potreba po poizvedbah čez vse serije naenkrat, ki bi bile
prepočasne — realno šele pri desettisočih vnosov.

---

## 2026-07-28 — Predloga treninga je svoja entiteta

**Odločitev:** obstaja `templates`: ime treninga in zaporedje vaj. Ob shranjevanju
treninga se predloga z istim imenom prepiše.

**Zakaj:** razmislila sva tudi, da predloge sploh ne bi bilo in bi "Push" pomenil
zadnji shranjeni trening s tem imenom. Timon je izbral izrecno predlogo: ime, ki
mu pripišeš zaporedje vaj. Šepetalnik tako bere kratek seznam imen in ne celotne
zgodovine, predloga pa lahko obdrži vajo, ki je tisti dan ni uspel narediti.

**Posledica:** dve mesti, ki se lahko razideta (predloga in zgodovina). Zato gresta
vpis v zgodovino in prepis predloge skozi eno funkcijo — `saveWorkout()`.

**Kaj bi jo ovrglo:** če bi se izkazalo, da predloge nikoli ne urejaš drugače kot
prek shranjevanja treninga; takrat je zadnji trening s tem imenom dovolj.

---

## 2026-07-28 — Vaja ima samo ime in zapisek

**Odločitev:** `exercise` nima `category` (push/pull/legs/upper) ne `equipment`
(bodyweight/barbell/…). Ima `name` in `note`.

**Zakaj:** aplikacija se uporablja med serijo, z eno roko. Vsako polje je en korak
več ob prvem vnosu vaje. Sklop treninga je itak že ime treninga ("Push"), vrsta
opreme pa je v praksi kar del imena ("BB bench press", "DB incline press").

**Posledica:** vprašanje iz starega predloga — ali vaja pripada enemu sklopu ali
več — odpade.

**Kaj bi jo ovrglo:** graf, ki bi hotel združevati po opremi ali sklopu. Dodati
neobvezno polje je poceni; zato je izpust varna smer.

---

## 2026-07-28 — Trening v teku se zapisuje sproti

**Odločitev:** `draft` gre v `localStorage` ob vsaki spremembi, ne šele ob "Shrani".

**Zakaj:** telefon se v telovadnici zaklene, iOS aplikacijo v ozadju ubije. Trening,
ki bi živel samo v pomnilniku, bi bil takrat izgubljen — in to sredi vadbe, ko ga
ni časa vpisovati znova.

**Posledica:** `draft` je hkrati stanje zaslona: če obstaja, si v treningu.

---

## 2026-07-29 — Predloga se ne odpre sama

**Odločitev:** izbira predloge odpre **prazen** trening. Vaje iz nje se prepišejo
vanj šele na dotik gumba *Ponovi zadnji trening* desno zgoraj. Gumb izgine, brž
ko je v treningu prva vaja.

**Zakaj:** isto ime pogosto pomeni drugačen dan — krajši trening, zasedena naprava,
druga vrsta vaj. Prej si moral odvečne vaje brisati eno po eno; zdaj je privzeto
stanje prazen list, poln trening pa je en dotik stran. Gumb izgine, ko dodaš prvo
vajo, da s ponesrečenim dotikom ne prepišeš tega, kar si že vpisal.

**Posledica:** prazen trening je zdaj resnična možnost, zato *Shrani* zavrne trening
brez vaj. Brez tega bi shranjevanje predlogo prepisalo v nič.

**Kaj bi jo ovrglo:** če bi se v praksi pokazalo, da je trening skoraj vedno enak
predlogi — takrat je en dotik odveč in vaje naj se odprejo same.

---

## 2026-07-29 — Vrstni red vaj se spreminja z vlečenjem

**Odločitev:** ploščica z imenom vaje je hkrati ročaj. Primeš jo in vlečeš vajo gor
ali dol. Puščic *gor/dol* ni. Odstranitev vaje je gumb **×** desno spodaj na kartici
in ne več v oknu pod svinčnikom.

**Zakaj:** vrstni red se v telovadnici spremeni sproti (naprava je zasedena, vajo
prestaviš na konec). Dva gumba na vsako vajo bi kartico natrpala, vlečenje pa je
gib, ki ga telefon že ima. Ločen ročaj bi vzel še eno tarčo, ploščica z imenom pa
je največja stvar na kartici in ni imela nobene druge naloge. Šest pik na njej je
edini namig, da se da prijeti.

**Cena:** `touch-action: none` na ploščici — s prstom na njej ne moreš drsati po
strani. Drsi se povsod drugje po kartici.

**Zakaj ne HTML5 `draggable`:** na telefonu ne dela. Zato pointer dogodki, ki z eno
kodo pokrijejo prst in miško. Med vlečenjem se premika samo slika (`transform`),
zaporedje se zapiše šele ob spustu — če aplikacija sredi giba umre, ni pol
premaknjenega treninga.

**Kaj bi jo ovrglo:** če bi se vaje premikale po nesreči. Takrat vlečenje šele po
kratkem pritisku (long press).

---

## 2026-07-28 — Brez build koraka

**Odločitev:** navaden HTML/CSS/JS z ES moduli. Ni Node.js, ni npm, ni bundlerja.

**Zakaj:** Node na računalniku ni nameščen. Datoteka, ki jo napiševa, je ista datoteka,
ki teče v brskalniku — kar je pri učenju bistveno, ker ni skritega vmesnega koraka.

**Kaj bi jo ovrglo:** potreba po knjižnici, ki obstaja samo kot npm paket in je ni mogoče
vendorati kot eno datoteko.

---

## 2026-07-28 — Aplikacija v mapi `aplikacija/`, ne na korenu

**Odločitev:** prava aplikacija živi v `aplikacija/`, naslov je
`https://timonjeretic.github.io/Fitnes-aplikacija/aplikacija/`.

**Zakaj:** koren repozitorija je skupen z `CLAUDE.md`, `Claude_kontekst/`, `prototip/`
in `.docx`. Če se mednje vsujejo še `index.html`, `css/`, `js/` in `icons/`, na prvi
pogled ni več jasno, kaj je aplikacija in kaj so zapiski. Ta odločitev prepiše prejšnji
zapis v [arhitektura.md](arhitektura.md), da gre aplikacija na koren.

**Cena:** naslov je daljši in `.../aplikacija/` je videti nerodno.

**Kaj bi jo ovrglo:** želja po čistem naslovu. Selitev je poceni — mapa se prestavi na
koren, poti so že relativne, popravi se samo `CACHE` verzija in ta dokument.

---

## 2026-07-28 — Register zaslonov namesto ročnega preklapljanja

**Odločitev:** vsak zaslon je svoja datoteka v `js/screens/`, ki izvozi objekt vedno iste
oblike. `js/startup/screen_register.js` jih našteje. Iz tega seznama se sama zgradita spodnja
vrstica gumbov in usmerjanje po naslovu (`#/trening`).

**Zakaj:** brez tega bi bilo dodajanje zaslona popravek na štirih mestih — HTML za gumb,
CSS za barvo, `if` v preklopu in nekje še napis. To je natanko tisto, kar se pri učenju
sesuje. Tako je nov zaslon **nova datoteka + ena vrstica**. Preverjeno s petim,
začasnim zaslonom: gumb, barva in naslov so se pojavili sami.

**Posledica:** vsak nov modul je treba dopisati v `FILES` v `sw.js`, sicer aplikacija
brez interneta ne dela. To je edina cena razdelitve na module.

**Kaj bi jo ovrglo:** nič predvidljivega. Če bi zaslonov postalo veliko, se doda
lena naložitev (`import()` na klic), register pa ostane isti.

---

## 2026-07-29 — Meritve telesa so svoja entiteta, ločena od teže

**Odločitev:** telesna teža ostane `bodyweightEntries`. Meritve delov telesa (roka,
prsi, pas) so nov par tabel: `measurements` (register imen) in `measurementEntries`
(vrednosti). `schemaVersion` gre s tem na 2.

**Zakaj:** razmislila sva tudi, da bi bila teža samo prva meritev v skupnem registru.
Tega ne: teža ima drugo enoto (kg proti cm), edina je, ki jo bo rabil graf moči pri
vajah z lastno težo, in v shrambi je že bila. Združitev bi zahtevala migracijo
obstoječih zapisov v zameno za nič.

**Posledica:** zaslon TEŽA ima en sam izbirnik, v katerem je telesna teža prva
vrstica, čeprav ni v registru meritev. Filtrira se posebej, v `weight.js`.

**Kaj bi jo ovrglo:** želja po meritvah v drugih enotah (% maščobe), kjer bi bilo
polje za enoto vseeno potrebno. Takrat je teža lahko ena od njih.

---

## 2026-07-29 — Meritve vedno v centimetrih

**Odločitev:** `measurement` nima polja za enoto. Vse meritve so v cm, teža v kg.

**Zakaj:** isti razlog kot pri vaji brez `category` — vsako polje je en korak več ob
prvem vnosu. Obseg roke in pasu se meri s trakom, drugih enot ni.

**Kaj bi jo ovrglo:** merjenje odstotka maščobe ali kožne gube v mm. Dodati
neobvezno polje `unit` z privzeto vrednostjo `'cm'` je poceni.

---

## 2026-07-29 — En vnos na dan, ponoven vpis prepiše

**Odločitev:** teža in meritev imata na en dan največ en zapis. Vpis z že
uporabljenim datumom obstoječega prepiše.

**Zakaj:** popravek tipkarske napake je s tem ponoven vpis in ne iskanje po seznamu.
Graf tudi nima dveh točk na istem dnevu, kar bi pri povprečenju po tednu izgledalo
kot nihanje, ki ga ni bilo.

**Posledica:** datum je v shrambi ISO **dan** (`'2026-07-29'`) in ne poln žig kot pri
treningu — sicer dva vnosa istega dne nikoli ne bi imela istega ključa.

**Kaj bi jo ovrglo:** tehtanje zjutraj in zvečer kot namerna meritev. Zaenkrat je to
šum, ne podatek.

---

## 2026-07-29 — Graf je ročno napisan SVG

**Odločitev:** `aplikacija/js/chart.js` sestavi graf iz SVG elementov. Knjižnice ni.

**Zakaj:** knjižnica bi pomenila build korak ali vendorano datoteko, CDN pa bi razbil
delovanje brez interneta. Graf, ki ga rabiva, je ena črta s časovno osjo — to je manj
kode kot vzdrževanje vendorane knjižnice.

**Podrobnost, ki je bila odločitev in ne slučaj:** os Y **ne** začne pri nič. Razlika
med 82 in 85 kg bi bila pri ničli nevidna. Odreže se toliko, da podatki napolnijo
višino (10 % razpona pod najnižjo vrednostjo), a nikoli več kot **polovico najnižje
vrednosti** — sicer majhno nihanje izgleda kot preobrat. Os je zato vedno označena.

**Kaj bi jo ovrglo:** potreba po grafu, ki ga ni mogoče narisati z eno črto
(stolpci, več serij hkrati, povečevanje s prsti).

---

## 2026-07-28 — Naslov z lojtro (`#/trening`)

**Odločitev:** zaslon se bere iz `location.hash`, ne iz prave poti.

**Zakaj:** prava pot (`/trening`) zahteva strežnik, ki vsak naslov vrne na `index.html`.
GitHub Pages tega ne zna in strežnika nimava. Lojtra zastonj prinese delujoč sistemski
gumb *nazaj* in to, da po osvežitvi ostaneš na istem zaslonu.

**Kaj bi jo ovrglo:** selitev na gostovanje, ki zna preusmeritve. Ni na obzorju.
