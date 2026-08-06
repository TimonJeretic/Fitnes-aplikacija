# Dnevnik odločitev

Zakaj so stvari take, kot so. Namen: da se o istem ne razpravlja dvakrat.
Vsak vpis ima **kaj**, **zakaj** in **kaj bi ga ovrglo**.

Nove odločitve dodajam sam, takoj ko padejo — brez čakanja, da Timon reče.
Ko odločitev pade, starega vpisa **ne brišem**: označim ga kot ovrženega in
povem, kaj ga je ovrglo. Prav to, kar je bilo predvideno kot razlog za spremembo,
je največ vredno naslednjič.

Vpisi niso strogo po datumu — vpis, ki ga iščeš, najdeš po naslovu.

---

## 2026-08-06 — Os Y gre od najnižje krat 0,8 do najvišje krat 1,2

**Odločitev:** `scaleY()` v `js/chart.js` postavi dno osi na `min × 0,8` in vrh na
`max × 1,2`. Konstanti sta `Y_FLOOR` in `Y_CEILING`. Velja za vse tri grafe (teža in
meritve, moč, prehrana); pri dveh serijah se to zgodi pred zaklepom razmerja osi,
zato `AXIS_RATIO` ostane nedotaknjen.

**Zakaj:** tako je naročeno. Rob je s tem sorazmeren s **številkami** in ne z njihovim
razponom. Stari rez (10 % razpona, največ do polovice najnižje vrednosti) je vsak graf
raztegnil čez vso višino, zato je nihanje pol kilograma izgledalo enako dramatično kot
nihanje treh — krivulja je bila vedno enako strma in oblika ni pomenila nič. Novo
pravilo pusti, da je majhno nihanje videti majhno.

**Cena:** pri teži okoli 84 kg je os od 66,9 do 101 in krivulja je skoraj ravna črta.
Trend se prebere iz številk ob točkah in iz smeri, ne iz naklona.

**Rezerva za ničlo in negativne vrednosti:** množenje drži samo pri pozitivnih
številkah — pri ničli da razpon nič (delitev z njim bi bila `NaN`), pri negativnih pa
os obrne in podatke odreže. Takrat se pas naredi drugače (20 % največje absolutne
vrednosti). V praksi se to ne zgodi: teža, moč in kalorije so vedno večje od nič.

**Kaj bi jo ovrglo:** graf, na katerem se sprememba ne vidi več. Takrat gre množitelj
bliže ena (0,95 / 1,05) — to je popravek dveh konstant, ne pravila.

---

## 2026-08-06 — Trening se zbriše v arhivu, s košem ob vrstici

**Odločitev:** vrstica v arhivu treningov (`#/statistika/arhiv`) ima ob sebi koš, ki
trening **s potrditvijo** zbriše iz zgodovine (`store.removeWorkout`). Vrstica in koš
sta dva gumba v skupnem `.listrow` — isti vzorec kot v arhivu vaj in na seznamu
preteklih treningov.

**Zakaj:** to je bilo eno od odprtih vprašanj v [stanje.md](stanje.md) ("kje se ureja
in briše zgodovina"). Napačno vpisan ali podvojen trening je do zdaj ostal na grafu
moči za vedno. Brisanje je od obojega — popravljanja in brisanja — manjši poseg:
zbrišeš in vpišeš na novo.

**Predloga ostane.** Zbrisan je en dan, ne ime treninga. Nasprotje `removeExercise()`,
ki vajo pobere iz vseh treningov hkrati.

**Zakaj koš ob vrstici in ne v razprtem treningu:** vrstica arhiva je gumb, gumb v
gumbu pa ni veljaven zapis. Koš zunaj nje je hkrati tam, kjer ga aplikacija že ima na
dveh drugih seznamih.

**Popravljanja shranjenega treninga še vedno ni.** To je svoje vprašanje: rabi pot do
urejanja serij, ki je danes samo v treningu v teku.

**Kaj bi jo ovrglo:** pomotoma zbrisan trening. Takrat rabi aplikacija koš za nedavno
zbrisano — enako kot je zapisano pri brisanju vaje.

---

## 2026-08-06 — Datum treninga se izbere s koledarčkom, trening pa gre v zgodovino s tem datumom

**Odločitev:** ob datumu v treningu v teku stoji koledarček
(`.training__calendar` v `training.js`). Privzet je dan, ko je bil trening ustvarjen;
izbrani dan se zapiše v `draft.startedAt`. `saveWorkout()` odslej vzame datum od tam
(`workoutDate()`) in ne več iz trenutka shranjevanja.

**Zakaj:** trening se ne vpisuje vedno takrat, ko se zgodi — vpišeš ga zvečer doma ali
naslednje jutro, in do zdaj je pristal na napačnem dnevu, na grafu in v arhivu.
Stranska korist: trening, začet pred polnočjo in shranjen po njej, ostane na svojem
dnevu.

**Zakaj nevidno polje čez ikono in ne gumb, ki bi koledar odprl iz kode:** iz kode ga
odpre samo `showPicker()`, ki ga starejši iOS nima. Polje `<input type="date">`
odpre sistemski koledar povsod; dodan klic `showPicker()` je samo za Chrome na
računalniku, ki koledarja ob dotiku po polju sam od sebe ne odpre.

**Zakaj se ura ohrani:** menja se dan, ne trenutek. Ura v žigu ni nikjer izpisana,
odloča pa vrstni red dveh treningov istega dne.

**Kaj bi jo ovrglo:** želja po popravku datuma tudi po shranjevanju. To je del
urejanja zgodovine in spada v arhiv, ne sem.

---

## 2026-08-06 — Ikona zaslona PREHRANA je jabolko

**Odločitev:** `ICON_NUTRITION` v `js/icons.js` je risba jabolka s peclem in listom.
Zamenjala je začasno črko **P**. Izvorna datoteka je `aplikacija/icons/prehrana.svg`,
tako kot pri `trening.svg`, `tehtanje.svg` in `statistika.svg`.

**Zakaj:** vpis "Ikone namesto črk na spodnjih gumbih" spet drži za vse štiri gumbe.
Jabolko je najbolj razumljiv znak za hrano — pri drsečem pogledu v telovadnici se ga
ne zamenja z ničemer, kar aplikacija že ima.

**Kako je narejena:** izvorna risba stoji na velikem praznem platnu
(`viewBox="0 0 810 1440"`), zato je niz v `icons.js` obrezan na
`viewBox="115 371 580 698"` — samo toliko, kolikor risba res zaseda, sicer bi bila
ikona v 28 px gumbu drobna. Pot je nespremenjena, samo zapisana relativno; `fill` je
`currentColor`, da barvo pobere iz CSS kot vse ostale.

**Kaj bi jo ovrglo:** če bi jabolko na telefonu pri 28 px razpadlo — list in pecelj sta
najtanjša dela risbe. Takrat se pecelj odebeli ali odreže, ne pa zamenja cela ikona.

**Zakaj `prehrana.svg` ni v `FILES` v `sw.js`:** izvorne risbe se ob zagonu ne nalagajo,
ikone živijo kot nizi v `icons.js`. Isto velja za `trening.svg` in ostale.

---

## 2026-08-02 — Prehrana je četrti zaslon

**Odločitev:** aplikacija dobi zaslon **PREHRANA** (`js/screens/nutrition.js`,
pot `#/prehrana`) in z njim četrti gumb v spodnji vrstici. Beleži obroke
(kalorije + proteini), pokaže dnevni skupek, izračunan maintenance in povprečen
vnos, ter graf teže in kalorij hkrati.

**Zakaj zaslon in ne podpot pod TEŽO:** prehrana se odpre štirikrat na dan, teža
enkrat. Vsak dodaten dotik do vpisa obroka bi bil plačan vsak dan, gumb spodaj pa
je en dotik od koderkoli.

**To ovrže razlog iz vpisa "Zaslon RAČUN je odstranjen" (2026-07-29).** Tam je
četrti gumb padel, ker je bil **prazen** — tarča, ki ni delala ničesar, in je pri
tem ožila tri prave. Ta gumb ni prazen. Isto velja za pomislek iz vpisa
"Nastavitve so okno pod zobnikom, ne zaslon": tam je bilo rečeno, da mora vrstica
ostati pri treh velikih tarčah. Preverjeno pri 320, 360 in 390 px: štirje
kvadratki po 60 px z 12 px razmika vzamejo 276 px, torej se ne stisnejo.

**~~Ikona je začasna črka P.~~ OVRŽENO 2026-08-06.** `ICON_NUTRITION` je bil SVG z
besedilom, ne risba — zavestno kršenje vpisa "Ikone namesto črk na spodnjih gumbih",
za en gumb in do prave risbe. Prava risba je prišla, glej vpis
"Ikona zaslona PREHRANA je jabolko" spodaj.

**Kaj bi jo ovrglo:** peti zaslon. Pri petih kvadratkih vrstica ne zdrži in
zasloni gredo v podpoti (`#/prehrana/…`), kot je predvideno pri nastavitvah.

---

## 2026-08-02 — Maintenance se izračuna iz podatkov, ne iz formule za BMR

**Odločitev:** vzdrževalne kalorije se ne računajo iz višine, starosti in spola
(Mifflin-St Jeor), ampak iz tega, kar aplikacija že ve:

```
maintenance = povprecen vnos - trend teze - povprecen cardio
```

Sedemdnevno okno, `7700 kcal` na kilogram, natančno v `nutritionSummary()` v
`store.js` in razloženo v [podatkovni-model.md](podatkovni-model.md).

**Zakaj:** Mifflin je ocena povprečnega človeka in bi rabil štiri nova polja v
nastavitvah, ki bi jih Timon vpisal enkrat in nikoli popravil. Izračun iz podatkov
pove, kako se odziva **njegovo** telo, in se sam popravlja, ko se metabolizem
premakne. Cena je čakanje: brez tedna vnosov in dveh tehtanj številke ni.

**Zakaj NEAT in ne skupni TDEE:** odštet cardio pusti tisto, kar se ne spreminja
od dneva do dneva. Kar pokuriš na tekaču, prišteješ sam tisti dan — številka na
zaslonu ostane ista in je zato uporabna kot izhodišče.

**Znana netočnost, ki je bila izbrana zavestno:** povprečen cardio se deli s
številom dni, ko je cardio bil, ne z vsemi sedmimi. Dvakratni tek po 400 kcal v
tednu tako odšteje 400, čeprav je prispeval 800/7 ≈ 114 kcal na dan. NEAT je s tem
podcenjen. Tako je bilo naročeno; konstanta `CARDIO_OVER_ALL_DAYS` v `store.js` to
obrne v eni vrstici.

**Kaj bi jo ovrglo:** teden ali dva uporabe, ki bi pokazala, da številka preveč
skače (tehtanje po vikendu, en dan brez beleženja). Takrat gre okno na 14 dni ali
trend na premico skozi vse točke namesto skozi prvo in zadnjo — oboje je sprememba
znotraj iste funkcije.

---

## 2026-08-02 — Graf zna dve seriji in dve osi Y

**Odločitev:** `lineChart()` v `js/chart.js` sprejme neobvezno drugo serijo
(`options.second`). Z dvema serijama dobi graf še desno os, razmerje med osema pa
je **zaklenjeno** na `AXIS_RATIO = 40` (1 kg leve osi = 40 kcal desne). Podpis in
vedenje z eno serijo se nista spremenila; TEŽA in STATISTIKA sta nedotaknjeni.

**Zakaj:** teža in kalorije se brati skupaj ali pa nič — vprašanje je vedno "sem
shujšal, ker sem manj jedel". Dva grafa eden pod drugim tega ne pokažeta, ker
očesu ne uspe poravnati dveh časovnih osi.

**Zakaj zaklenjeno razmerje in ne dve neodvisni osi:** neodvisno raztegnjeni osi
bi vsakič napolnili višino in bližina črt ne bi pomenila ničesar — graf bi izgledal
dramatično tudi pri nihanju 200 kcal. Zaklenjeno razmerje naredi iz bližine
podatek. Skupen razpon je večji od obeh, da se nobena serija ne odreže, sredina pa
je vsaki svoja, da črti ležita druga ob drugi.

**To ovrže mejo iz vpisa "Graf je ročno napisan SVG" (2026-07-29):** tam je bilo
zapisano, da bi potreba po več serijah hkrati odločitev ovrgla. Potreba je prišla,
knjižnica pa še vedno ni odgovor — druga serija je bila ~60 vrstic v isti datoteki.
Vpis o ročnem SVG s tem **ostane v veljavi**, samo njegova meja se je premaknila.

**Kaj bi jo ovrglo:** tretja serija, stolpci ali povečevanje s prsti. Pri tem se
`chart.js` ne da več držati na tej velikosti.

---

## 2026-08-02 — Cardio je en vnos na dan in se vpisuje na zaslonu TRENING

**Odločitev:** porabljene kalorije s cardiem so svoja entiteta (`cardioEntries`),
en vnos na dan, ponoven vpis prepiše. Polje stoji na zaslonu **TRENING**, v stanju
brez treninga, pod razdelkom *Ustvari nov trening*.

**Zakaj tam in ne na PREHRANI:** cardio je vadba, ne hrana. Vpiše se po teku, ko si
že v zavihku TRENING, in ne takrat, ko vpisuješ kosilo.

**Zakaj en vnos na dan:** isto pravilo kot pri tehtanju. Dva teka na isti dan sta
redkost, seznam z brisanjem posameznega vnosa pa bi bil tretji tak seznam v
aplikaciji. Prazno polje ob shranjevanju vnos odstrani — brez tega pomotoma
vpisanega cardia ne bi bilo mogoče umakniti.

**Kaj bi jo ovrglo:** redno dvakratno cardio na dan. Takrat postane vnos seštevek
več zapisov, kot so obroki.

---

## 2026-08-02 — Obrok ima samo kalorije in proteine, popravlja se cel dan

**Odločitev:** obrok je `{ kcal, proteinG }` in nič drugega — brez imena, ure,
ogljikovih hidratov in maščob. Današnjih obrokov zaslon ne našteva; X ob vnosu
pobriše **vse današnje** in vpišeš jih na novo.

**Zakaj:** zaslon se odpre štirikrat na dan in vsako polje je takrat en korak več.
Kalorije in proteini sta edini številki, po katerih se odloča.

**Zakaj brez seznama in brez koša pri posameznem obroku:** seznam bi zaslon
podaljšal pod graf, popravek pa je pri štirih številkah hitrejši, če dan vržeš
stran in ga vpišeš znova. Brisanje gre zato **čez potrditev** — za razliko od koša
pri posameznem tehtanju na zaslonu TEŽA, kjer vidiš točno, kaj brišeš.

**Kaj bi jo ovrglo:** dan z osmimi obroki ali želja videti, kaj je bilo kdaj.
Takrat pride seznam pod skupek in obrok dobi ime.

---

## 2026-07-30 — Izbirnik vaj je popup z iskalnim poljem, brez filtra po treningu

**Odločitev:** plus v treningu odpre spustni seznam čez zaslon (`js/sheet.js`).
Na vrhu je **iskalno polje**, ki se lepi na vrh okna, pod njim **cel register vaj**
po abecedi. Tipkanje seznam oži; ime, ki ga v seznamu ni, ponudi zadnja vrstica s
prekinjeno obrobo (*Nova vaja: …*). Vaja, ki je v treningu že zdaj, se ne ponudi.
Filtriranje po imenu treninga je **ovrženo** (glej vpis 2026-07-29 spodaj),
`store.exercisesForWorkoutName` je odstranjena.

**Zakaj brez filtra:** pri prvem "Legs" ni imel česa ponuditi, pri treningu, ki
namenoma meša sheme, pa je skril ravno tisto vajo, ki si jo iskal. To je bilo v
starem vpisu predvideno kot razlog za spremembo in se je zgodilo. Iskalno polje
naredi isto, kar je hotel filter — kratek seznam — brez ugibanja, kaj kam spada.

**Zakaj iskanje in novo ime v istem polju:** prej sta bila dva okvirja, seznam
zgoraj in "Nova vaja" spodaj, torej dve polji za isto misel ("hočem to vajo").
Zdaj je en korak: tipkaš, dokler ni na zaslonu tisto, kar hočeš, in se tega
dotakneš. Vrstica *Nova vaja* se pokaže tudi pri delnem imenu — vaja z imenom
"Zg" je legitimna in seznam nima pravice odločati, kdaj je vpis dokončan.

**Kurzor se v polje NE postavi sam.** Tipkovnica bi pokrila seznam, na iPhonu pa
je ostala odprta tudi potem, ko je bilo polje že odstranjeno z zaslona — in
naslednji dotik v polje za kilažo ni prijel.

**Kaj bi jo ovrglo:** register, ki bi zrasel do sto vaj, in želja po skupinah
(potisk / poteg / noge). Takrat gre nad seznam vrstica z skupinami, ne filter po
imenu treninga.

---

## 2026-07-30 — Obdobja na grafih so Dan, Mesec, Leto

**Odločitev:** graf na TEŽI in STATISTIKI ima tri obdobja: **Dan**, Mesec, Leto.
Teden je odstranjen; `chart.js` pri `step: 'day'` obdobja ne združuje več, ampak
vsak dan pusti svojo točko.

**Zakaj:** teden ni bil ne eno ne drugo. Za branje napredka je bil predrobna
delitev (na letnem razmiku se točke stiskajo v črto), za popravljanje in
preverjanje pa pregrob — hotel si videti **tisti trening**, ne povprečje sedmih
dni. Dan je tisto, kar je v podatkih dejansko zapisano: tehtanje ima dan, trening
ima dan.

**Kaj s tem ne izgubiva:** dan v izračunu ostane obdobje kot vsako drugo, zato
dve tehtanji istega dne še vedno dasta eno točko (povprečje), dva treninga
istega dne pa najboljšega od obeh.

**Kaj bi jo ovrglo:** dnevni graf, ki bi pri dveh letih podatkov postal
neberljiv. Takrat rabi graf okno ("zadnjih 90 dni"), ne novega obdobja.

---

## 2026-07-30 — Varnostna kopija se nikoli ne naredi sama

**Odločitev:** kopija nastane **izključno** na dotik gumba *Izvozi zdaj* v oknu
pod zobnikom. `backup.afterSave()` je odstranjena, klicev iz `save()` obeh
zaslonov ni več. Prvo vrstico v nastavitvah to tudi izrecno pove.

**Zakaj:** na iPhonu je samodejna kopija ob vsakem shranjenem treningu in vsakem
vnosu teže odprla sistemsko okno za deljenje — sredi treninga, z eno roko. Okno
zahteva odgovor, torej je bila varnostna kopija naenkrat najbolj vsiljiv del
aplikacije. To je bilo v starem vpisu predvideno kot razlog za spremembo
("Timon je izbral, da se odpre ob vsakem shranjevanju") in se je pri prvi uporabi
v telovadnici tudi zgodilo.

**Zakaj tudi na Androidu in namizju nič:** kopija ob shranjevanju je smiselna
samo, če je tiha, tiha pa je lahko samo v izbrani mapi. Dva različna odgovora na
isto vprašanje ("se kopija dela sama?") sta slabša od enega jasnega — in podatki
so v `localStorage` shranjeni takoj, ne šele s kopijo.

**Kar ostane:** izbira mape, dnevna kopija in trije načini (mapa / deljenje /
prenos). Vsi trije zdaj visijo na istem gumbu, ne več na shranjenem treningu.

**Kaj bi jo ovrglo:** izgubljeni podatki, ker je Timon na izvoz pozabil. Takrat
kopija ne gre nazaj na vsako shranjevanje, ampak največ enkrat na dan, in samo v
načinu **mapa**, kjer je tiha.

---

## 2026-07-30 — Ročaj za premikanje vaje so samo pikice

**Odločitev:** vlečenje se začne samo na pikicah desno na ploščici z imenom
(`.exercise__grip`, tarča 40 × 40 px, `touch-action: none`). Cela ploščica ni več
ročaj in `touch-action` ima privzeto vrednost.

**Zakaj:** ploščica z imenom je najširša stvar na kartici, torej tisto, na kar
prst pri drsenju po treningu pade najpogosteje. Z `touch-action: none` na njej
drsenje ni prijelo — stran je obstala, kot da se je aplikacija zataknila.
Namesto tega je vajo začela vleči.

**Zakaj pikice in ne dolg pritisk:** dolg pritisk je nevidno pravilo, ki se ga je
treba naučiti, in pri vsakem dotiku doda pol sekunde čakanja. Pikice so bile že
prej edini namig, da se vaja da premakniti; zdaj so tudi edina tarča.

**Kaj bi jo ovrglo:** pritožba, da je pikice s palcem težko zadeti. Takrat se
tarča razširi po celi višini ploščice, ne pa nazaj na njeno širino.

---

## 2026-07-30 — Vaja "Pull ups" namesto teže vpisuje barvo elastike

**Odločitev:** vaja, ki se imenuje **natanko** "Pull ups", ima namesto polja za
težo izbirnik elastike. Dotik odpre spustni seznam s štirimi barvami
(rumena `#fbdc06`, zelena `#00bf63`, turkizna `#269797`, rdeča `#9d0f0b`),
možnostjo **BW** (zgib brez elastike) in vrstico *Počisti izbiro*. Napisa "kg"
pri tej vaji ni. Izbrano se zapiše v `set.band`, `schemaVersion` gre na **5**.

**Zakaj po imenu in ne z zastavico pri vaji:** zastavica bi pomenila še eno
kljukico v oknu pod svinčnikom in še eno stvar, ki jo je treba nastaviti pri
vsaki novi vaji. Elastika je pri enem samem gibu, in ta gib ima ime. "Pullups"
ali "Pull-ups" je zato navadna vaja s kilogrami — primerjava je brez ozira na
velike črke in presledke ob robu (tipkanje), ne pa brez ozira na presledek v
sredini (drugo ime).

**Zakaj serija z elastiko ne gre na graf moči in ne šteje za rekord:** elastika
del teže odvzame, koliko je ne vemo. Šteti tako serijo kot polno lastno težo bi
krivuljo dvignilo po nedolžnem. **BW** je izjema: to je zgib brez pomoči in šteje
normalno. V arhivu se serija z elastiko izpiše z imenom barve ("Zelena × 7"),
da je zapis še vedno berljiv.

**Migracija ni potrebna:** serija brez polja `band` je serija brez elastike.
Verzija se dvigne samo zato, da se ve, od kdaj polje obstaja.

**Kaj bi jo ovrglo:** druga vaja z elastiko (na primer "Dips"). Takrat gre ime iz
kode v podatke — polje pri vaji, ki pove, da se vpisuje elastika in ne teža.

---

## 2026-07-30 — Napis serije se razteza, številke se držijo črte

**Odločitev:** `.set-row__label` ("Set 1") ima `flex: 1` in ne fiksne širine.
Prostor, ki v vrstici ostane, pobere on; današnji številki sta zato vedno tik ob
črti, ki ju loči od prejšnjega treninga.

**Zakaj:** prej je prostor pobrala črta (`margin-left: auto`), zato je bila
sredina vrstice prazna, številke pa razmetane po robovih. Prazen pas na sredini
je bil videti kot napaka v postavitvi.

**Kaj bi jo ovrglo:** daljši napis od "Set 10" — takrat je treba `min-width`
povečati, sicer napis pade v dve vrstici.

---

## 2026-07-29 — Glava in spodnja vrstica sta pribiti, drsi samo vsebina

**Odločitev:** `.brand` (ikona, naslov, zobnik) je `position: sticky; top: 0` s
podlago v barvi strani. Spodnja vrstica gumbov je zunaj drsečega dela že po
zgradbi strani. Drsi torej samo tisto med njima.

**Zakaj:** naslov pove, kje si, zobnik pa je edina pot do varnostne kopije. Oboje
je prej pri dolgem treningu odrsalo z zaslona in ju je bilo treba iskati z
vračanjem na vrh — sredi serije, z eno roko.

**Posledica, ki je zahtevala popravek kode:** lepljivo se drži **svojega starša**.
Dokler je bila glava v ovoju `<header>`, je odlepila, brž ko je ovoj odrsal.
Zato je zdaj otrok korena zaslona, ki je visok kot cela vsebina — `training.js`
ovoja ne dela več.

**Posledica za vse, kar se lepi pod njo:** iskalno polje v arhivu treningov ima
`top: var(--brand-h)` in ne 0, sicer bi zdrsnilo za glavo. Višina je zapisana na
enem mestu v `base.css`.

**Kaj bi jo ovrglo:** zaslon, kjer je naslov tako visok, da za vsebino ne ostane
dovolj prostora. Takrat se glava ob drsenju navzdol skrije in ob drsenju navzgor
vrne.

---

## 2026-07-29 — Koš stoji ob plusu in odstrani zadnjo serijo

**Odločitev:** koša v vsaki vrstici serije ni več. Ob plusu pod serijami je koš,
ki odstrani **zadnjo** serijo. Pri edini seriji je ugasnjen.

**Zakaj:** koš v vrstici je jemal prostor natanko tam, kjer ga rabijo številke —
polji za težo in ponovitve sta bili zaradi njega ozki, stolpec "zadnjič" pa
stisnjen na 30 px. Razlog, da se serija briše, je skoraj vedno ponesreči
pritisnjen plus, kar pomeni **zadnjo** serijo; za ta primer je en koš dovolj.
Ta vpis ovrže odločitev *Koš pri vsaki seriji namesto gumba "−"* niže v tem
dnevniku: takrat je štelo, da se izbriše natanko tista serija, na katero pokažeš,
zdaj pa je pretehtal prostor v vrstici.

**Kaj se je s tem sprostilo:** napis serije 44 → 54 px, polji za težo in
ponovitve 52 → 58 px, stolpec "zadnjič" 30 → 40 px in za dve piki večja pisava.
Izmerjeno: pri 360 px vrstica zasede 308 px od 312.

**Kaj bi jo ovrglo:** če bi se v praksi pogosto brisala serija na sredini. Takrat
nazaj koš v vrstici — a takrat mora prostor priti od kod drugod.

---

## 2026-07-29 — Zaslon STATISTIKA brez treh številk pod grafom

**Odločitev:** ploščic *Zadnje / Rekord / Sprememba* ni več. Zaslon je: oba
arhiva, naslov *Statistika moči*, izbirnik vaje, graf, obdobja in *Najboljša
serija po obdobjih*.

**Zakaj:** tako je narisan Timonov načrt zaslona. Rekord ima svoje mesto v arhivu
vaj, kjer je izpisan rdeče, zadnjo vrednost in smer pa pove krivulja sama.
Ploščice so bile tretja različica iste zgodbe na istem zaslonu.

**Zraven:** v izbirniku vaje ni več napisa "Vaja:". Dokler vaja ni izbrana, v njem
sivo piše "Ime vaje" — izgleda kot polje, ki čaka na dotik, in ne kot gumb z
uganko, kaj se za njim skriva.

**Kaj bi jo ovrglo:** želja po eni številki, ki jo prebereš brez branja grafa.
Takrat ena ploščica (rekord), ne tri.

---

## 2026-07-29 — Vrstica z uro je `black`, ne `black-translucent`

**Odločitev:** `<meta name="apple-mobile-web-app-status-bar-style">` v `index.html`
je `black`. Vsebina se torej začne **pod** vrstico z uro in ne pod njo.

**Zakaj:** pri `black-translucent` iOS vsebino potisne navzgor pod vrstico z uro,
okna pa ne poveča. Spodaj zato ostane pas, visok natanko toliko kot vrstica z uro
(~59 px na iPhonu 15 Pro Max). Ta pas je **zunaj okna** aplikacije: vanj ne seže
niti zastor z animacijo, ki je `position: fixed; inset: 0` — prav to je bil dokaz,
da prazen prostor pod ikonami ni naš odmik. `viewport-fit=cover` tega ne odpravi,
ker okno ni obrezano, ampak premaknjeno.

**Cena:** vsebina se ne razliva več pod uro, kar je bilo lepše. V zameno je zaslon
spodaj cel in gumbi sedijo tam, kjer je palec.

**Posledica:** `--safe-top` je v nameščeni aplikaciji odslej 0. Zasloni imajo
`calc(var(--safe-top) + 14px)`, zato se naslov pomakne tik pod uro — namerno.

**Kaj bi jo ovrglo:** želja po vsebini pod uro. Takrat nazaj na `black-translucent`
in prazen pas spodaj je cena, ki jo je treba sprejeti.

---

## 2026-07-29 — Service worker odgovarja na zahteve po kosih (`Range`)

**Odločitev:** `sw.js` prestreza zahteve z glavo `Range` posebej in iz shranjene
datoteke izreže zahtevani kos ter ga vrne s statusom **206**. Ostale zahteve gredo
po stari poti (najprej predpomnilnik, nato internet).

**Zakaj:** brez tega uvodni posnetek na iPhonu ni deloval — zastor je za trenutek
pogledal ven in izginil, na računalniku pa je bilo vse v redu. Vzrok: predvajalnik
posnetka ne zahteva v celoti, ampak po kosih. Safari na tako zahtevo vztraja pri
delnem odgovoru; cel posnetek s statusom 200 sprejme kot napako in predvajanje
odpove. Chrome je bolj popustljiv, zato se napaka na računalniku ni pokazala.

**Posledica:** velika datoteka se pri vsaki zahtevi po kosu prebere v pomnilnik v
celoti (`arrayBuffer()`). Pri 1 MB posnetku je to nič; pri urnem videu bi bilo treba
brati po kosih.

**Kaj bi jo ovrglo:** nič — to je zahteva standarda in ne posebnost iPhona.

---

## 2026-07-29 — Ikona aplikacije je logotip iz uvodnega posnetka

**Odločitev:** `icons/icon-192.png`, `icon-512.png` in `icon-512-maskable.png` so
narejene iz zadnje sličice uvodnega posnetka: bel logotip LAPI na rdečem prelivu
aplikacije. Ista sličica je tudi `media/intro-poster.jpg`.

**Zakaj:** ikona na domačem zaslonu in prva stvar, ki jo vidiš ob odprtju, morata
biti ista slika — sicer je videti, kot da si odprl nekaj drugega. Logotip je že
obstajal v posnetku, zato ni bilo treba nikamor nalagati nove datoteke.

**Zakaj tri velikosti:** Android izreže ikono v obliko, ki si jo izbere sam
(*maskable*), zato ima ta različica logotip pomanjšan na polovico stranice — kar
štrli iz varnega kroga, se odreže. iPhone manifesta ne bere in vzame
`apple-touch-icon` iz `index.html`; prosojnost bi izrisal črno, zato je ozadje
poln preliv in ne prosojnost.

**Kaj bi jo ovrglo:** nov logotip. Postopek je zapisan v [delovni-tok.md](delovni-tok.md).

---

## 2026-07-29 — Uvodna animacija ob zagonu

**Odločitev:** ob odprtju aplikacije se predvaja kratek posnetek čez cel zaslon
(`aplikacija/media/*.mp4`, `js/startup/splash.js`). Posnetka sta **dva**: pokončen
za telefon in ležeč za računalnik; kateri se predvaja, se odloči po obliki zaslona
(`window.innerHeight >= window.innerWidth`).

**Zakaj mp4 in ne GIF ali animacija v CSS:** na iPhonu je h.264 edini format, ki se
zanesljivo predvaja, in je pri isti kakovosti večkrat manjši od GIF-a. Element ima
`muted` in `playsinline` — brez tega iOS samodejnega predvajanja ne dovoli, posnetek
pa bi se odprl v svojem predvajalniku čez cel zaslon.

**Zakaj dva posnetka in ne en raztegnjen:** zaslon telefona je pokončen, zaslon
računalnika ležeč. En sam posnetek bi bil na enem od njiju obrezan čez pol slike.
Izbira je v JavaScriptu, ker `<source media="...">` pri videu ne dela zanesljivo.

**Železno pravilo:** animacija ne sme nikoli zakleniti aplikacije. Zastor se umakne
po štirih poteh — konec posnetka, napaka, **dotik** (preskok) in časovna varovalka
(9 s). Če posnetka sploh ni na disku, se aplikacija odpre normalno; zato sta
posnetka v `sw.js` v ločenem seznamu `OPTIONAL`, ki ob manjkajoči datoteki ne
podre namestitve, kot bi jo `cache.addAll()`.

**Dopolnjeno isti dan:** pod posnetkom leži slika (`media/intro-poster.jpg`, zadnja
sličica animacije), posnetek pa je prosojen, dokler res ne steče (`playing` →
`is-playing`). Ob napaki ali zavrnjenem predvajanju zastor počaka 1,8 s (`HOLD`),
da se slika s preletom pokaže in umakne.

**Zakaj to ni robni primer:** v **varčevanju z baterijo** iPhone samodejno
predvajanje ustavi tudi pri utišanem posnetku. Prej sta se takrat zgodili dve
grdi stvari — iPhone je čez `poster` narisal svoj sivi gumb za predvajanje
(videti kot okvara), zastor pa je izginil skoraj takoj. Zato `poster` na
elementu ni več; slika je svoj element pod njim, gumba pa ni, ker je posnetek
takrat neviden.

**Kaj bi jo ovrglo:** če se izkaže, da čakanje pred vsakim vpisom serije moti bolj,
kot animacija razveseli. Takrat se predvaja samo ob prvem odprtju v dnevu — to je
ena vrstica v `splash.js` in en zapis v shrambi.

---

## 2026-07-29 — Arhiv vaj: rekord in brisanje

**Odločitev:** pod *Arhiv treningov* je enak gumb *Arhiv vaj* (`#/statistika/vaje`).
Notri je register vaj po abecedi; dotik po imenu razpre **rekord** vaje, koš jo
zbriše. Rekord je **najtežja serija v zgodovini** (pri isti teži tista z več
ponovitvami), izpisana rdeče: `PR: 102,5 kg × 5`.

**Zakaj rekord in ne ocena 1RM:** graf moči že kaže oceno. Rekord je tisto, kar si
res dvignila — številka, ki jo hočeš prekositi in ki je ne rabiš razlagati.

**Brisanje odstrani vajo povsod:** iz registra, iz predlog, iz shranjenih treningov
in iz treninga v teku. Vaja s tem izgine tudi z grafov in iz arhiva treningov.
Trening, ki mu ne ostane nobena vaja, se **ne** zbriše: da je bil ta dan trening,
ostane dejstvo. Zato ima brisanje potrditev, ki to pove.

**Zakaj ne "skrij namesto zbriši":** skrita vaja bi ostala v podatkih in bi se
prej ali slej pojavila tam, kjer je nihče ne pričakuje. Register nastaja sam od
sebe med treningom, zato mora obstajati tudi način, da se ga pospravi.

**Kaj bi jo ovrglo:** želja po vračanju pomotoma zbrisanega. Takrat rabi aplikacija
košo za nedavno zbrisano ali izvoz podatkov pred brisanjem.

---

## 2026-07-29 — Izbirnik vaj ponuja samo vaje tega treninga — **OVRŽENO 2026-07-30**

> Ovrgel jo je vpis *Izbirnik vaj je popup z iskalnim poljem* (2026-07-30): zgodilo
> se je natanko to, kar je bilo tukaj predvideno kot razlog za spremembo — trening,
> ki meša sheme. `store.exercisesForWorkoutName` ne obstaja več.

**Odločitev:** "Izberi vajo" ponudi vaje, ki spadajo k treningu **s tem imenom** —
iz njegove predloge in iz zgodovine treningov z istim imenom
(`store.exercisesForWorkoutName`). Vaja, ki je v treningu že dodana, se ne ponudi
drugič. Ime treninga, ki ga še ni bilo, nima česa ponuditi, zato se takrat ponudi
cel register.

**Zakaj:** pri "Pull" ni kaj iskati med vajami, ki jih delaš pri "Push" — seznam
je bil dvakrat daljši, kot bi moral biti. Register vaj ostane **skupen**: ista vaja
je ista vaja, ne glede na to, v katerem treningu se pojavi. Filtriranje je stvar
tega, kaj se ponudi, ne tega, kako so podatki zapisani.

**Zakaj cel register, kadar imena še ni bilo:** prazen izbirnik bi ob prvem "Legs"
pomenil, da moraš vsako vajo vpisati na roko — tudi tisto, ki v registru že je.

**Kaj bi jo ovrglo:** trening, ki namenoma meša vaje iz več shem (npr. "Poljubno").
Takrat bi rabil gumb "pokaži vse vaje" pod seznamom.

---

## 2026-07-29 — Ime vaje se da popraviti

**Odločitev:** v oknu pod svinčnikom je ime vaje polje in ne napis
(`store.renameExercise`). Ime, ki ga ima že druga vaja, se zavrne z opozorilom.

**Zakaj:** register nastaja iz tipkanja med treningom in tipkarska napaka je do
zdaj ostala v njem za vedno — "Bench pres" in "Bench press" bi bili dve vaji z
ločenima grafoma. Popravek je varen, ker vajo vse naslavlja z `id`: ime se
spremeni tudi v zgodovini in na grafu, podatki pa se ne premaknejo.

**Zakaj zavrnitev in ne združitev:** združevanje dveh vaj v eno je poseg v
zgodovino in rabi svojo potrditev. Za popravek črke to ni potrebno.

**Kaj bi jo ovrglo:** potreba po združevanju podvojenih vaj, ki so že nastale.
To je svoje opravilo, ne stranski učinek preimenovanja.

---

## 2026-07-29 — Izbiranje gre v spustni seznam čez zaslon

**Odločitev:** izbira meritve (TEŽA) in izbira vaje (STATISTIKA) se odpreta v
spustnem seznamu čez ves zaslon: ozadje se zabriše (`backdrop-filter`), ploskev
seznama je **svetlejša** od strani. Skupna koda je v `js/sheet.js`, videz v
`css/screen.css` (`.sheet`). Iskalnega polja v seznamu ni — vpisi so urejeni
po abecedi.

**Zakaj:** seznam, vgrajen v zaslon, je odrival vsebino pod sabo, zato je bilo
treba po izbiri iskati, kam je skočil vnos. Zabrisano ozadje pove, da ta trenutek
nič drugega ne dela, in odpravi zgrešen dotik mimo seznama. Svetlejša ploskev je
edini način, da nekaj v temni aplikaciji izgleda, kot da leži **nad** stranjo.

**Zakaj brez iskalnega polja:** abecedni seznam je pri desetih do petdesetih vpisih
hitrejši od tipkanja z eno roko, tipkovnica pa bi pokrila pol seznama.

**Popravek isti dan:** vrstice seznama so navadni sivi pravokotniki, tudi trenutno
izbrana. Rdeča obroba je pridržana za izbiro enote (cm / kg) spodaj — dve različni
"izbrano" v istem oknu ne povesta nobene stvari jasno. Katera vrstica je izbrana,
piše na gumbu, s katerega se seznam odpre.

**Kaj bi jo ovrglo:** register, ki preraste dve dolžini zaslona. Takrat gre iskalno
polje nazaj — na vrh seznama, ne namesto njega.

---

## 2026-07-29 — Meritev ima svojo enoto (`schemaVersion: 4`)

**Odločitev:** meritev telesa ima polje `unit` (`'cm'` ali `'kg'`), izbrano ob
nastanku v spustnem seznamu. Vnos meritve hrani `value` namesto `valueCm`.
Migracija postavi stare meritve na `'cm'` in preimenuje polje.

**Zakaj:** vse meritve niso obsegi. Telesna maščoba, teža z opremo ali kar koli, kar
se meri v kilogramih, je do zdaj v aplikacijo prišlo kot "cm" in je bilo na grafu
narobe označeno.

**Zakaj se enota **ne** da spremeniti kasneje:** stare in nove točke bi bile na
istem grafu v različnih enotah in krivulja bi pokazala skok, ki se ni zgodil.
Meritev v napačni enoti se naredi na novo pod drugim imenom.

**Kaj bi jo ovrglo:** potreba po pretvorbi (cm → palci). Takrat enota ni več
lastnost meritve, ampak nastavitev prikaza, in podatki ostanejo v eni sami enoti.

---

## 2026-07-29 — Registra vaj in meritev sta po abecedi

**Odločitev:** `searchExercises`, `searchTrainedExercises` in `searchMeasurements`
vračajo vpise urejene po abecedi (slovensko, prek `localeCompare('sl')`). Predloge
treningov (`searchTemplates`) ostanejo v vrstnem redu nastanka.

**Zakaj:** register vaj se bere kot imenik — vedeti moraš, kje iskati, ne kdaj si
vajo prvič vpisal. Pri predlogah je nasprotno: Push, Pull, Legs je zaporedje tedna
in abeceda bi ga razmetala.

**Kaj bi jo ovrglo:** nič na obzorju. Če bi kdaj štel "najpogosteje uporabljene na
vrh", to ne bi zamenjalo abecede, ampak dodalo kratek seznam nad njo.

---

## 2026-07-29 — Koš pri vsaki seriji namesto gumba "−" — **OVRŽENO isti dan**

> Ovrže jo *Koš stoji ob plusu in odstrani zadnjo serijo* na vrhu tega dnevnika.
> Razlog je natanko tisti, ki je spodaj naveden kot cena: koš je jemal prostor
> številkam. Vpis ostane, ker pove, kaj se pri tem izgubi.

**Odločitev:** vsaka vrstica serije ima čisto desno, za svojo črto, koš, ki odstrani
**natanko tisto** serijo. Gumb `−`, ki je odstranil zadnjo serijo, je odstranjen.
Koš je pri edini seriji ugasnjen (`disabled`): vaja brez serij nima kaj pokazati,
odstrani se z `×` spodaj desno na kartici. Vprašanje za potrditev pride samo,
kadar je v seriji kaj vpisanega.

**Zakaj:** najpogostejši razlog za odstranjevanje je pomotoma pritisnjen plus, in
takrat hočeš stran **to** vrstico. `−` je odstranil zadnjo — če si se zmotil na
sredini, si moral brisati in znova vpisovati. Dva gumba za isto dejanje sta bila
tudi eden preveč.

**Cena:** vrstica ima zdaj štiri stolpce (napis, vpis, zadnjič, koš):

- napis je ozek in fiksen (44 px) — pove samo, katera serija po vrsti je to;
- polji za težo in ponovitve sta **fiksni in enako veliki** (52 px), ob polju za
  težo stoji "kg";
- stolpec "zadnjič" je ozek (30 px, manjša pisava) — je podatek, ne tarča;
- koš je 24 px; prostor, ki v vrstici ostane, pobere črta pred njim, zato je koš
  vedno ob desnem robu.

**Zakaj fiksni in ne raztegljivi polji:** raztegljivi sta bili pri vaji brez
zgodovine nesmiselno široki, predvsem pa se je vrstica ob pomanjšanju pisave
premaknila za las. Fiksna širina pomeni, da se ob vpisovanju ne premakne nič.

Preverjeno pri 360 in 390 px (izmerjeno, ne ocenjeno: vrstica je pri 360 px
široka natanko toliko, kolikor je prostora).

**Podrobnost:** pri vaji brez zgodovine odpade stolpec "zadnjič" **in z njim njegova
črta** — sicer bi se ob črti pred košem videli dve črti druga ob drugi.

**Kaj bi jo ovrglo:** telefon, ožji od 360 px. Takrat se najprej umakne napis
"Set 1" (ostane samo številka), stolpca s številkami pa se ne dotikava.

---

## 2026-07-29 — Ena barva za vso aplikacijo (`#9d0f0b`)

**Odločitev:** vsi trije zasloni imajo isti `accent`: rdečo `#9d0f0b`. Preliv gre iz
nje v `#661714` (`--accent-gradient` v `css/base.css`) in pobarva ploščico z imenom
vaje. Vsak zaslon barvo še vedno pove sam v svojem modulu — polje `accent` ostaja,
samo vrednost je pri vseh treh ista.

**Zakaj:** tri barve (rdeča, modra, zelena) so ogrodje iz časa, ko so bili zasloni
prazni in je barva bila edino, kar jih je ločilo. Zdaj jih loči vsebina, ikona na
vrhu in ikona spodaj — tri barve pa so pomenile, da aplikacija na vsakem zaslonu
izgleda kot druga aplikacija.

**Zakaj polje `accent` kljub temu ostane:** pogodba zaslona se ne spreminja zaradi
tega, ker so vrednosti trenutno enake. Nov zaslon je še vedno ena datoteka, CSS pa
še vedno pozna samo `var(--accent)`.

**Kaj bi jo ovrglo:** zaslon, ki mora biti na pogled nevaren ali drugačen (brisanje
podatkov, nastavitve). Takrat dobi svojo barvo in nič drugega se ne spremeni.

---

## 2026-07-29 — Dotik gumba ga pobarva v barvo aplikacije

**Odločitev:** vsak gumb, s katerim se nekaj **izbere** (predloga treninga, vrstica
predloga, vrstica arhiva, izbirnik meritve, škatlica v stolpcu "zadnjič", obdobje
grafa), se ob `:active` pobarva v `--accent` z belim besedilom. Brisanje je izjema:
tam ostane rdečkasta obroba, ne barva aplikacije. Glavni gumb (*Shrani*, *Potrdi*)
ob dotiku **potemni** v `--accent-deep`.

**Zakaj:** v telovadnici je dotik pogosto neroden, zaslon pa gledaš pol sekunde.
Barva je edini odgovor, ki ga v tem času zaznaš — sprememba odtenka sive ni.
Glavni gumb je že rdeč, zato svetlejša rdeča na njem ne bi bila viden odziv, temnejša
pa je.

**Kaj bi jo ovrglo:** nič na obzorju. Če bi se barva zaslona kdaj razlikovala od
barve gumbov, bi bilo treba pravilo napisati z lastnim tokenom in ne z `--accent`.

---

## 2026-07-29 — Zaslon TRENING brez treninga: seznam namesto šepetalnika

**Odločitev:** prazno stanje zaslona TRENING sta dva razdelka: **Pretekli treningi**
(vse predloge, vsaka s številom vaj in košem za brisanje) in **Ustvari nov trening**
(polje za ime + *Potrdi*). Iskalnega polja s predlogi nad seznamom ni več, velikega
plusa na sredini tudi ne.

**Zakaj:** predlog je peščica (Push, Pull, Legs, Upper) in vse gredo na zaslon hkrati —
iskanje po štirih vrsticah je bilo tipkanje brez koristi. Velik plus ni delal ničesar
sam po sebi, samo postavil je kurzor v polje, ki je bilo tako ali tako vidno.
Koš je nov: predloga je do zdaj nastala sama ob shranjevanju in je ni bilo mogoče
odstraniti, zato so se v seznamu nabirale tipkarske napake.

**Posledica:** `store.removeTemplate(id)` briše **samo** predlogo. Shranjeni treningi
hranijo svoje vaje sami, zato zgodovina in grafi ostanejo nedotaknjeni.

**Kaj bi jo ovrglo:** toliko predlog, da seznam ne gre več na zaslon. Takrat se
iskalno polje vrne — nad seznam, ne namesto njega.

---

## 2026-07-29 — Ikone namesto črk na spodnjih gumbih

**Odločitev:** na kvadratkih spodaj so Timonove ikone (`aplikacija/icons/*.svg`),
ne črke T / W / S. Zaslon jih pove prek polja `icon` v svojem modulu. Ikone so v kodo
prilepljene kot nizi v `js/icons.js` in ne naložene kot datoteke.

**Zakaj kot nizi:** `<img src="icons/trening.svg">` bi bila dodatna zahteva na zaslon
in dodatna vrstica v `sw.js`, barve pa CSS pri `<img>` ne more spremeniti. Vrisan SVG
z `fill="currentColor"` prevzame barvo besedila, zato je ista ikona bela spodaj in
bela na vrhu zaslona, brez druge datoteke.

**Videz:** ikona je **vedno bela**; ob dotiku in na odprtem zaslonu se pobarva samo
kvadratek za njo. Aktivni kvadratek ima poleg barve še komaj opazen sij
(`--accent-glow`) — dovolj, da veš, kje si, premalo, da bi vleklo pogled.

**Kaj bi jo ovrglo:** ikona, ki bi rabila več barv hkrati (npr. dvobarvni logotip).
Takrat gre ta ena ikona v datoteko, ostale ostanejo v kodi.

---

## 2026-07-29 — Zaslon RAČUN je odstranjen

**Odločitev:** četrti zaslon (gumb A, `js/screens/account.js`) je izbrisan. Ostanejo
trije: TRENING, TEŽA, STATISTIKA.

**Zakaj:** zaslon je stal prazen, odkar je nastalo ogrodje, in za njegovo edino
verjetno vsebino (izvoz/uvoz JSON) ni bilo odločeno, da spada prav tja. Prazen gumb
v vrstici je stalna tarča za napačen dotik in zožuje tri prave gumbe.

**Posledica:** izvoz/uvoz podatkov rabi novo mesto — glej odprta vprašanja v
[stanje.md](stanje.md).

**Kaj bi jo ovrglo:** dovolj vsebine za svoj zaslon (izvoz, uvoz, brisanje, nastavitve
skupaj). Nov zaslon je ena datoteka in ena vrstica v registru, zato vrnitev ni draga.

---

## 2026-07-29 — Številsko polje sprejme največ tri števke in eno decimalko

**Odločitev:** `limitNumber()` v `js/dom.js` sproti počisti vnos v polja za težo in
ponovitve: dovoljeno je `123` ali `123,4`. Ločilo na zaslonu je **vejica**; pika se
pri tipkanju prepiše vanjo, `parseNumber()` pa razume oboje.

**Zakaj:** daljšega vnosa polje ne pokaže do konca — vpisal bi številko, ki je ne
vidiš. Nad 999,9 kg ali 999 ponovitev ni resnične meritve, zato omejitev ne odreže
ničesar pravega. Popravlja se sproti in ne šele ob shranjevanju: v polju vedno piše
natanko to, kar bo šlo v podatke.

**Popravek isti dan:** prvotna meja so bile štiri števke (`1234`), a "1234,5" v
škatlici ni bilo berljivo. Poleg omejitve se pri vnosu, daljšem od štirih znakov,
pisava tudi pomanjša (razred `is-long`) — številka se raje stisne, kot da bi ji
konec ušel čez rob.

**Kaj bi jo ovrglo:** teža v gramih ali druga enota, kjer so tri števke premalo.

---

## 2026-07-29 — Koren repozitorija preusmeri na `aplikacija/`

**Odločitev:** `index.html` v korenu je samo preusmeritev na `aplikacija/`
(`<meta refresh>` + `location.replace`). Aplikacija ostane v podmapi.

**Zakaj:** GitHub Pages streže koren, ta pa ni imel `index.html` in je vrnil 404 —
naslov je bilo treba vsakič popraviti na roko. Selitev aplikacije v koren bi
spremenila obseg service workerja in pot v `manifest.json`, nameščene aplikacije na
telefonu pa bi bilo treba dodati na novo.

**Kaj bi jo ovrglo:** želja po čistem naslovu brez preskoka. Takrat se aplikacija
preseli v koren in ta datoteka izgine.

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

**Posledica:** privzeti zaslon se v `router.js` bere skozi funkcijo `defaultScreen()`
in ne iz konstante ob nalaganju modula, `navigate()` pa je izločen v svojo datoteko
`js/startup/navigate.js`. Zaslon, ki hoče spremeniti naslov, bi sicer uvozil router,
ta pa register — v takem krogu register ob nalaganju routerja še ni izpolnjen.

**Kaj bi jo ovrglo:** nič. Če bi zaslon rabil več ravni, se isto pravilo ponovi globlje.

---

## 2026-07-29 — Skupni pomočniki v js/dom.js

**Odločitev:** `el()`, `button()`, `icon()`, `withLabel()`, `parseNumber()`,
`limitNumber()`, `formatNumber()`, `formatRounded()`, `formatDate()` in `formatDay()`
živijo v `aplikacija/js/dom.js`.

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

**Zakaj:** koren repozitorija je skupen s `CLAUDE.md`, `Claude_kontekst/` in `.docx`
(takrat tudi s `prototip/`). Če se mednje vsujejo še `index.html`, `css/`, `js/` in `icons/`, na prvi
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

## 2026-07-29 — Meritve vedno v centimetrih ~~(OVRŽENO isti dan)~~

> **Ovrženo** z vpisom *Meritev ima svojo enoto (`schemaVersion: 4`)* zgoraj.
> Ostaja zapisano, ker pove, zakaj polja `unit` sprva ni bilo in kaj ga je prineslo.

**Odločitev:** `measurement` nima polja za enoto. Vse meritve so v cm, teža v kg.

**Zakaj:** isti razlog kot pri vaji brez `category` — vsako polje je en korak več ob
prvem vnosu. Obseg roke in pasu se meri s trakom, drugih enot ni.

**Kaj jo je ovrglo:** meritve, ki niso obsegi (telesna maščoba v kg). Predvideno je
bilo pravilno — dodano je bilo natanko neobvezno polje `unit` s privzeto `'cm'`.

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
med 82 in 85 kg bi bila pri ničli nevidna. ~~Odreže se toliko, da podatki napolnijo
višino (10 % razpona pod najnižjo vrednostjo), a nikoli več kot **polovico najnižje
vrednosti** — sicer majhno nihanje izgleda kot preobrat.~~ **OVRŽENO 2026-08-06** —
rez je zdaj `min × 0,8` do `max × 1,2`, glej vpis *Os Y gre od najnižje krat 0,8 do
najvišje krat 1,2* na vrhu dnevnika. Os je vedno označena s številkami.

**Kaj bi jo ovrglo:** potreba po grafu, ki ga ni mogoče narisati z eno črto
(stolpci, več serij hkrati, povečevanje s prsti).

---

## 2026-07-28 — Naslov z lojtro (`#/trening`)

**Odločitev:** zaslon se bere iz `location.hash`, ne iz prave poti.

**Zakaj:** prava pot (`/trening`) zahteva strežnik, ki vsak naslov vrne na `index.html`.
GitHub Pages tega ne zna in strežnika nimava. Lojtra zastonj prinese delujoč sistemski
gumb *nazaj* in to, da po osvežitvi ostaneš na istem zaslonu.

**Kaj bi jo ovrglo:** selitev na gostovanje, ki zna preusmeritve. Ni na obzorju.

---

## 2026-07-29 — Varnostna kopija: kam in kdaj

> **Del "kdaj" je ovržen 2026-07-30** — glej vpis *Varnostna kopija se nikoli ne
> naredi sama*. Kopija ne nastane ob shranjenem treningu, ampak samo na dotik gumba
> *Izvozi zdaj*; `afterSave()` ne obstaja več. Del "kam" (mapa, dve datoteki, trije
> načini, pravilo brez `await`) velja naprej.

**Odločitev:** kopija nastane **ob shranjenem treningu in ob shranjenem vnosu teže**,
ne ob vsaki spremembi. Kam gre, se ne določi v kodi, ampak z mapo, ki jo Timon izbere
enkrat; ročaj te mape živi v IndexedDB.

**Zakaj ob shranjevanju in ne v `store.write()`:** osnutek treninga se shranjuje ob
vsakem dotiku (telefon se zaklene sredi serije). Kopija na tej ravni bi pomenila
štirideset zapisov na trening, pri načinu s prenosom pa štirideset datotek v mapi
Prenosi. Klic zato stoji v `save()` obeh zaslonov, kjer je "shranil sem nekaj" res
dogodek in ne vmesno stanje.

**Zakaj mapa in ne pot v kodi:** spletna aplikacija poti na disk ne dobi in je ne sme
dobiti. `showDirectoryPicker()` je edini način, da uporabnik enkrat pokaže mesto,
aplikacija pa nato piše brez spraševanja. Poti kot niza brskalnik ne izda nikoli —
zato v nastavitvah piše samo ime mape.

**Zakaj dve datoteki:** `fitnes-kopija.json` se prepisuje in je vedno zadnje stanje;
`fitnes-YYYY-MM-DD.json` nastane enkrat na dan. Ena sama datoteka ne bi imela koraka
nazaj ob skvarjenem zapisu, nova datoteka ob vsakem shranjevanju pa bi v letu naredila
par sto datotek. Dnevna kopija je sredina, ki je Timon izrecno izbral.

**Zakaj trije načini in ne en:** iPhone `showDirectoryPicker()` nima in ga ne bo imel,
zato tam kopija gre skozi okno za deljenje (Timon je izbral, da se odpre ob vsakem
shranjevanju). Kaj naprava zna, se ugotovi iz obstoja funkcij — nikoli iz imena
brskalnika, ker se ta lažejo in se seznami starajo.

**Podrobnost, ki je bila odločitev in ne slučaj:** na poti do `navigator.share()` ni
nobenega `await`. Brskalnik deljenje dovoli samo neposredno iz dotika; en sam `await`
pred klicem to dovoljenje porabi in klic zavrne. Zato `exportNow()` najprej sinhrono
pogleda, ali je izbira mape sploh mogoča, in šele nato gre po eni ali drugi poti.

**Kaj bi jo ovrglo:** prava sinhronizacija (Google Drive API) — a ta pomeni prijavo,
`client_id` v javnem repozitoriju in odvisnost od interneta v telovadnici. Za dnevnik
treningov nesorazmerno.

---

## 2026-07-29 — Nastavitve so okno pod zobnikom, ne zaslon

**Odločitev:** izvoz, uvoz in izbira mape živijo v oknu, ki ga odpre zobnik desno
zgoraj na vseh treh zaslonih. Četrtega zaslona ni.

**Zakaj:** spodnja vrstica je za palec v telovadnici in mora ostati pri treh velikih
tarčah. Varnostna kopija ni opravilo, ki bi ga delal med serijami — je nekaj, kar
nastane samo od sebe, uporabnik pa se tja spusti enkrat na začetku. Zobnik je poleg
tega na istem mestu na vseh treh zaslonih, zato ga ni treba iskati.

**Kaj bi jo ovrglo:** če bi se v nastavitvah nabralo toliko stvari, da okno ne bi bilo
več pregledno. Takrat postane podpot (`#/statistika/nastavitve`), ne pa četrti gumb.

---

## 2026-07-30 — Serija ima vrsto, izbere se ob dodajanju

**Odločitev:** plus pod vajo ne doda več kar prazne vrstice, ampak odpre okno z
vrstami serij: *Navaden set, Superset, Dropset, Myoreps, Elastika, Čas, Prazen set*.
Vrsta se zapiše v `set.kind` in se kasneje **ne da spremeniti**.

**Zakaj vrsta in ne prosto polje:** trening ni samo teža × ponovitve. Dropset,
superset in myoreps so isto delo v drugačnih pogojih; če se zapišejo kot navadne
serije, izgleda zgodovina, kot da si nekega dne padel s 102,5 na 40 kg. Vrsta to
pove z eno besedo in brez tipkanja.

**Zakaj se ne da spremeniti:** sprememba vrste bi odprla vprašanje, kam gredo že
vpisane številke (teža pri elastiki, ponovitve pri času). Pot nazaj je koš ob
plusu, ki odstrani zadnjo serijo — napačno izbrana vrsta stane dva dotika.

**Kaj šteje za moč:** samo `normal`. Krivulja mora primerjati primerljivo; dropset
z utrujeno mišico ni ista teža kot prva serija, elastika del teže odvzame, čas in
prazen set teže sploh nimata. Isto pravilo velja za rekord (PR) — obe številki
prideta iz istega vira, sicer se razideta.

**Kaj preživi shranjevanje:** prazna **navadna** serija je pomotoma pritisnjen plus
in se zavrže; vsaka druga vrsta ostane tudi prazna, ker si jo izbral iz seznama.
Prazen set drugače v zgodovino sploh ne bi mogel priti — po zgradbi nima česa
izpolniti.

**Kaj bi jo ovrglo:** če bi se pokazalo, da je vrst preveč in da je izbiranje med
sedmimi vrsticami sredi serije počasnejše od enega dotika na plus. Takrat postane
plus "navaden set", vrsta pa dolg pritisk.

---

## 2026-07-30 — Elastika je vrsta serije, ne lastnost vaje "Pull ups"

**Odločitev:** pravilo, da se pri vaji z imenom natanko "Pull ups" namesto teže
vpisuje elastika, je odstranjeno (`store.usesBands()` ne obstaja več). Elastiko
izbereš tako, da dodaš set vrste *Elastika*. Migracija na verzijo 6 obstoječe
serije z izbrano elastiko označi kot take, zato v arhivu ni nič drugače.

**Zakaj:** ime vaje je bilo tiho stikalo. Elastika se uporablja tudi pri veslanju,
odmikih in raztezanju, "Pull ups" pa se pogosto dela brez nje — pravilo je torej
hkrati premalo in preveč. Vrsta serije je izrecna izbira in velja za vsako vaj.

**Cena:** zgib brez elastike, vpisan kot `band: 'bw'`, po migraciji ne šteje več za
moč. Zgibi, ki naj bodo na grafu, se vpišejo kot navaden set pri vaji z lastno težo
— tam se telesna teža prišteje in številka je pravilnejša, kot je bila prej.

**Elastike so zdaj štiri barve in dve debelini** (`red-thin`, `red-thick`), ker sta
v telovadnici res dve rdeči. Stara `'red'` se preslika v `'red-thin'`.

---

## 2026-07-30 — Elastika je risba, ne barvna ploskev

**Odločitev:** škatlica z elastiko ostane temna kot vsako drugo polje, v njej pa
leži risba elastike v svoji barvi — podolgovata zanka, narisana kot SVG pot v
`js/screens/training.js`. Datoteke `icons/elastika_*.svg` niso v uporabi.

**Zakaj ne datoteke:** vsaka je ~210 KB (SVG z vgrajeno sliko PNG), skupaj okoli
1 MB v predpomnilniku za offline — več kot cela aplikacija. Pri 20 px se sliko
zmehča, risba pa ostane ostra na vsakem zaslonu in barvo dobi iz CSS, zato je ena
sama pot dovolj za vseh pet elastik.

**Zakaj ne polna barvna ploskev, kot je bila prej:** ploskev je vlekla pogled z
vrstice nase in ni znala ločiti tanke rdeče od debele. Risba oboje reši: debelina
poteze je debelina elastike.

---

## 2026-07-30 — Vaja se odpre brez ene same serije

**Odločitev:** dodana vaja nima nobene vrstice. Vsaka serija nastane z gumbom +
pod njo. Velja povsod: za vajo iz izbirnika, za vajo, ki je register še ne pozna,
in za *Ponovi zadnji trening*. Koš ob plusu zdaj odstrani tudi zadnjo vrstico.

**Zakaj:** prej se je odprlo toliko praznih vrstic, kolikor si jih naredil zadnjič
(ali ena, če vaje še ni bilo). Odkar ima serija vrsto, bi bilo to ugibanje dvakrat:
koliko serij in kakšnih. Vrstica, ki je nisi naredil, se mora pobrisati — in to je
dražje od dotika na +, ker se je treba prej prepričati, da je res prazna.

**Kaj se pri tem ne izgubi:** stolpec "zadnjič" se ravna po **mestu** vrstice in ne
po tem, ali je vrstica nastala vnaprej. Prva dodana serija se zato spet primerja s
prvo od zadnjič, druga z drugo.

**Posledica v podatkih:** vaja brez serij je od zdaj običajno stanje in ne okvara.
`saveWorkout()` jo iz zgodovine izpusti (že prej), predloga pa jo obdrži — vaja, ki
je ta dan nisi uspel narediti, se mora naslednjič spet ponuditi.

**Kaj bi jo ovrglo:** če bi se pokazalo, da je pri dolgem treningu dotikov preveč.
Takrat ni pot nazaj k ugibanju, ampak gumb, ki podvoji zadnjo vrstico — ta ne
ugiba, ampak ponovi to, kar si pravkar vpisal.
