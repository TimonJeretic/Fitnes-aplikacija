# Dnevnik odločitev

Zakaj so stvari take, kot so. Namen: da se o istem ne razpravlja dvakrat.
Vsak vpis ima **kaj**, **zakaj** in **kaj bi ga ovrglo**.

Nove odločitve dodajam sam, takoj ko padejo — brez čakanja, da Timon reče.

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
oblike. `js/screens/register.js` jih našteje. Iz tega seznama se sama zgradita spodnja
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

## 2026-07-28 — Naslov z lojtro (`#/trening`)

**Odločitev:** zaslon se bere iz `location.hash`, ne iz prave poti.

**Zakaj:** prava pot (`/trening`) zahteva strežnik, ki vsak naslov vrne na `index.html`.
GitHub Pages tega ne zna in strežnika nimava. Lojtra zastonj prinese delujoč sistemski
gumb *nazaj* in to, da po osvežitvi ostaneš na istem zaslonu.

**Kaj bi jo ovrglo:** selitev na gostovanje, ki zna preusmeritve. Ni na obzorju.
