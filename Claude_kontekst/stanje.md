# Stanje projekta

**Zadnja posodobitev:** 2026-07-29

To datoteko posodabljam sam, kadar se stanje spremeni.

## Narejeno

- **Prototip PWA** (`prototip/`) — dva gumba, ki ob kliku dobita naključno barvo.
  Namen ni bila funkcionalnost, ampak dokaz, da veriga koda → git → GitHub Pages →
  namestitev na telefon deluje od začetka do konca.
- **GitHub Pages deluje.** Preverjeno: `index.html`, `manifest.json`, `sw.js` in ikone
  se vsi strežejo prek HTTPS na
  `https://timonjeretic.github.io/Fitnes-aplikacija/prototip/`.
  Vsi pogoji za namestitev PWA so torej izpolnjeni.
- **Kontekstna dokumentacija** — `CLAUDE.md` kot indeks in ta mapa.
- **Ogrodje prave aplikacije** (`aplikacija/`) — prazen zaslon, spodaj kvadratni
  gumbi T / W / S. Klik odpre zaslon svoje barve z napisom TRENING / TEŽA /
  STATISTIKA. Vsebine še ni; namen je bil postaviti razširljivo ogrodje.
  Preverjeno lokalno: vsi zasloni, naslov `#/...` in gumb *nazaj*, nesmiseln
  naslov pade na TRENING, service worker se registrira, aplikacija se naloži tudi
  z ugasnjenim strežnikom. Razširljivost preizkušena z začasnim dodatnim zaslonom.
  (Četrti gumb A — RAČUN — je obstajal do 2026-07-29, ko je bil odstranjen;
  glej [odlocitve.md](odlocitve.md).)

- **Podatkovni model potrjen in implementiran** — `aplikacija/js/store.js` je edina
  pot do `localStorage`. Oblika in razlogi so v [podatkovni-model.md](podatkovni-model.md),
  odločitve v [odlocitve.md](odlocitve.md). Tri stara odprta vprašanja so s tem zaprta.
- **Zaslon TRENING dela.** Prazno stanje s šepetalnikom predlog in velikim plusom;
  trening s karticami vaj, serijami, stolpcem "zadnjič" (klik prepiše vrednost),
  zapiskom pod svinčnikom ter gumboma Zavrži in Shrani. Shranjevanje doda trening
  v zgodovino in prepiše predlogo z istim imenom.
  Izbrana predloga odpre **prazen** trening; vaje prinese gumb *Ponovi zadnji
  trening*, ki izgine ob prvi dodani vaji. Vrstni red vaj se spreminja z vlečenjem
  ploščice z imenom, vaja pa se odstrani z **×** desno spodaj na kartici.
  Preverjeno v brskalniku s 87 samodejnimi preizkusi celotne poti: nov trening,
  nova vaja, vpis serij, shranjevanje, ponovitev predloge, stolpec "zadnjič",
  zapisek, preživetje osvežitve, premikanje vaj z vlečenjem, odstranitev vaje,
  prepis predloge, zavrži, trening brez imena in brez vaj, iskanje brez ozira
  na šumnike in velike črke. Postavitev izmerjena pri 390 px — nič se ne preliva
  čez rob.
  **Popravki 2026-07-29:** vlečena kartica gre pod lepljivo vrstico *Zavrži / Shrani*
  (`z-index` 1 proti 2), ne več čeznjo. Ko se prst med vlečenjem približa zgornjemu
  ali spodnjemu robu (pas 90 px), seznam sam odrsa v to smer, hitreje bližje robu;
  odrsano je všteto v lego kartice, zato ta ostane pod prstom. Polji za težo in
  ponovitve sprejmeta največ štiri števke in eno decimalko (`1234` ali `123,4`),
  pika se prepiše v vejico. Preverjeno s 31 samodejnimi preizkusi (omejitev vnosa,
  `z-index`, drsenje ob robu, kartica se drži prsta pri 360 px odrsanega, zapisan
  vrstni red). Opomba za preizkuse: v brezglavem brskalniku `requestAnimationFrame`
  nikoli ne sproži, zato ga je bilo treba v preizkusu nadomestiti s časovnikom.
- **Zaslon TEŽA dela.** En sam izbirnik na vrhu določa, kaj vpisuješ **in** kaj je na
  grafu: telesna teža (kg) ali katera od meritev telesa (cm). Meritev nastane iz
  vpisanega imena, tako kot vaja. Pod izbirnikom sta polje za vrednost in datum,
  prednastavljen na danes; desno od *Shrani* je *Stare meritve*, kjer se posamezen
  vnos zbriše z **×**. Spodaj je graf s preklopom Tedni / Meseci / Leta, ki vnose v
  obdobju povpreči v eno točko.
  Podatkovni model je zaradi tega pri `schemaVersion: 2` — dodana sta `measurements`
  in `measurementEntries`, migracija preverjena na zapisu verzije 1.
  Preverjeno v brskalniku z 91 samodejnimi preizkusi (72 za shrambo, graf in zaslon,
  19 integracijskih čez router in oba zaslona): migracija, prepis vnosa na isti dan,
  imena brez ozira na šumnike in velike črke, povprečenje po tednu/mesecu/letu,
  omejitev reza osi Y, brisanje vnosa, preživetje osvežitve. Postavitev izmerjena
  pri 320, 360, 390 in 430 px — nič se ne preliva čez rob.

- **Zaslon STATISTIKA dela.** Dva pogleda, ločena s podpotjo v naslovu.
  Na `#/statistika` je zgoraj gumb *Arhiv treningov*, pod njim izbirnik vaje
  (ponudijo se samo vaje, ki so vsaj enkrat v zgodovini, s številom treningov), pod
  tem pa graf moči s preklopom Tedni / Meseci / Leta. Obdobje predstavlja **najboljši**
  nastop v njem, ne povprečje. Pod grafom so tri številke — zadnje, rekord in
  sprememba od začetka (barvna) — in seznam najboljših serij po obdobjih z datumom,
  dejansko serijo in oceno.
  Na `#/statistika/arhiv` je iskalno polje, ki se drži vrha, in seznam treningov
  (ime levo, datum desno); dotik razpre cel trening pod vrstico in odrine spodnje.
  Arhiv je **samo za branje**. Iskanje teče čez ime in datum hkrati.
  Podatkovni model je zaradi tega pri `schemaVersion: 3` — vaja je dobila
  `usesBodyweight`; graf pri takih vajah prišteje telesno težo tistega dne.
  Router zna podpoti, zato sistemski gumb *nazaj* iz arhiva vrne na graf.
  Preverjeno v brskalniku s 74 samodejnimi preizkusi (migracija z verzije 1,
  formula moči in njena konkavnost, prištevanje telesne teže pri zgibih z
  in brez pasu, združevanje po tednu/mesecu/letu, iskanje po imenu in datumu,
  razpiranje vrstic arhiva, ohranitev kurzorja med iskanjem) in z izrisom prave
  aplikacije na vseh poteh: `#/statistika`, `#/statistika/arhiv`, `#/trening`,
  `#/teza` in nesmiseln naslov. Preizkusi so tekli v brezglavem Edgeu, ker Node.js
  na tem računalniku ni nameščen.

- **Videz je poenoten (2026-07-29).** Vsi trije zasloni imajo isto barvo `#9d0f0b`,
  preliv gre iz nje v `#661714` in pobarva ploščico z imenom vaje. Na kvadratkih
  spodaj so Timonove ikone namesto črk (`js/icons.js`, izvor `icons/*.svg`); ikona
  je vedno bela, pobarva se kvadratek za njo, aktivni ima še komaj opazen sij.
  Vsak zaslon ima na vrhu isto ikono in naslov (`.brand`). Dotik gumba, s katerim
  se nekaj izbere, ga pobarva v barvo aplikacije; glavni gumb ob dotiku potemni.
  Stolpec "zadnjič" ni več bel, ampak komaj svetlejši od vnosnega polja s sivo
  številko — je podatek, ne tarča.
  **Zaslon TRENING brez treninga** je zdaj seznam preteklih treningov (vsak s
  številom vaj in košem za brisanje predloge) in pod črto polje za novo ime z
  gumbom *Potrdi*. Šepetalnika in velikega plusa ni več.
  **Zaslon TEŽA** je dobil naslov *Meritve*, gumb *Shrani* stoji sam, pod črto je
  razdelek *Statistika*: graf, pod njim Teden / Mesec / Leto in *Prikaži pretekle
  meritve*. Isti vrstni red (graf, pod njim obdobja) ima zdaj tudi STATISTIKA.
  Odločitve so v [odlocitve.md](odlocitve.md).
  Preverjeno v brezglavem Edgeu z izrisom vseh poti (`#/trening` prazen in s
  treningom v teku, `#/teza`, `#/statistika`, `#/statistika/arhiv`) na polni shrambi;
  posnetki zaslona pregledani pri 488 px (glej opombo o brezglavem oknu v
  [delovni-tok.md](delovni-tok.md)).
- **Serija se odstrani s košem v svoji vrstici (2026-07-29).** Vsaka vrstica ima
  čisto desno, za svojo črto, koš, ki odstrani natanko to serijo; gumba `−` za
  zadnjo serijo ni več. Pri edini seriji je koš ugasnjen. Zaradi četrtega stolpca
  so se polja zožila na 42 px (višina ostaja 46). Preverjeno pri **360 in 390 px**
  z aplikacijo v okvirju prave širine.

- **Spustni seznami, enote in prazen pas na iPhonu (2026-07-29).**
  Izbira meritve in izbira vaje se odpreta v spustnem seznamu čez zaslon
  (`js/sheet.js`): zabrisano ozadje, svetlejša ploskev, vpisi po abecedi, spodaj
  okvir za nov vpis z izbiro enote (cm / kg). Meritev ima od zdaj svojo enoto,
  zato je model pri **`schemaVersion: 4`** — `valueCm` se je preimenoval v `value`,
  stare meritve so dobile `'cm'`. Migracija preverjena na zapisu verzije 3.
  Register vaj in meritev se vrača po abecedi, predloge treningov v vrstnem redu
  nastanka. Izbirnik vaje na zaslonu TRENING ima zdaj isto postavitev kot prazen
  zaslon: seznam vaj, črta, *Nova vaja*, polje in *Potrdi*.
  Prazen pas pod ikonami na iPhonu je odpravljen: `height: 100dvh` (prej `100%`,
  kar je pri nameščeni aplikaciji nižje od zaslona) in `max()` namesto seštevanja
  varnega območja v spodnji vrstici. **Na telefonu še ni preverjeno.**
  Preverjeno v brskalniku pri 360 in 390 px: vse tri poti, oba spustna seznama,
  migracija z verzije 3.

- **Vrstica serije predelana in hrošč s tipkovnico (2026-07-29).** Napis serije je
  ozek (46 px), polji za današnjo težo in ponovitve se raztegneta čez ves prostor,
  ki ostane, stolpec "zadnjič" je ozek in manjši, koš je ob desnem robu. Vnos je
  omejen na tri števke in eno decimalko (`999,9`), pri več kot štirih znakih se
  pisava pomanjša (`is-long`). Izbrana enota v spustnem seznamu ima samo rdečo
  obrobo, ne polnila — sicer tekmuje z gumbom *Potrdi*.
  **Hrošč:** po dodajanju vaje prek *Izberi vajo* ni bilo mogoče vpisati kilaže.
  Vzrok: ob odpiranju izbirnika je koda sama postavila kurzor v polje za novo vajo,
  na iPhonu pa je tipkovnica ostala odprta tudi potem, ko je bilo polje z izrisom
  odstranjeno z zaslona. Odpravljeno: kurzorja ne postavljamo več sami, pred vsakim
  izrisom, ki odstrani polje, gre `blur()`, polja pa imajo izrecno
  `user-select: text` (podedovan `none` zna na iOS preprečiti kurzor v polju).
  V brskalniku na računalniku se hrošč ni pokazal — **potrditev na telefonu čaka**.

- **Izbirnik vaj po treningu, popravek imena vaje (2026-07-29).** "Izberi vajo"
  ponudi samo vaje tega treninga (predloga + zgodovina treningov z istim imenom)
  in izpusti tiste, ki so v treningu že dodane; pri imenu treninga, ki ga še ni
  bilo, ponudi cel register. Ime vaje je v oknu pod svinčnikom polje — tipkarska
  napaka se popravi in velja povsod, zasedeno ime se zavrne. V spustnem seznamu
  vrstice nimajo obrobe (navadni sivi pravokotniki), rdečo obrobo ima samo izbira
  enote. Preverjeno v brskalniku: "Pull" z že dodanim Veslanjem ponudi samo Zgibi,
  preimenovanje se zapiše, zasedeno ime pa ne.

- **Arhiv vaj in ožja polja (2026-07-29).** Pod *Arhiv treningov* je enak gumb
  *Arhiv vaj* (`#/statistika/vaje`): register po abecedi, dotik po imenu razpre
  rekord vaje v rdeči (`PR: 102,5 kg × 5` z datumom in imenom treninga), koš vajo
  zbriše — iz registra, predlog, shranjenih treningov in treninga v teku hkrati.
  Preverjeno, da za zbrisano vajo ne ostane nobena sled.
  Vrstica serije: polji za težo in ponovitve sta fiksni in enako veliki (52 px),
  ob teži piše "kg", stolpec "zadnjič" je 30 px, koš 24 px ob desnem robu.
  Izmerjeno pri 360 px: vrstica je široka natanko toliko, kolikor je prostora,
  in se ob pomanjšanju pisave ne premakne.
  Vrstica z imenom in košem je zdaj skupni `.listrow` v `css/screen.css`
  (uporabljata jo zaslon TRENING in arhiv vaj).

- **Uvodna animacija (2026-07-29).** Ob zagonu se čez cel zaslon predvaja Timonov
  posnetek: pokončen na telefonu (`fitnes_aplikacija_start_mobile.mp4`, 3,4 s),
  ležeč na računalniku (`fitnes_aplikacija_start_PC.mp4`, 5 s). Dotik ga preskoči.
  Zastor se umakne ob koncu posnetka, ob napaki, ob dotiku ali po 9 s — preverjeno
  je tudi, da se aplikacija normalno odpre, **kadar posnetkov ni**. Posnetka sta v
  `sw.js` v seznamu `OPTIONAL`, ki ob manjkajoči datoteki ne podre namestitve.
  Novi datoteki: `js/startup/splash.js`, `css/splash.css`, mapa `media/`.
  **Popravek 2026-07-29 (iPhone):** posnetek se na telefonu ni predvajal — zastor je
  za trenutek pogledal ven in izginil. Vzrok ni bil posnetek, ampak service worker:
  na zahtevo z glavo `Range` je vračal celo datoteko s statusom 200, Safari pa
  vztraja pri delnem odgovoru. `sw.js` zdaj take zahteve prestreže in vrne **206**;
  preverjeno v brezglavem brskalniku (`bytes 0-99/644769`, `video/mp4`), navadne
  zahteve pa še naprej dobijo cel odgovor. Ob zavrnjenem predvajanju (varčevanje z
  baterijo) zastor počaka 1,8 s, da se vidi `media/intro-poster.jpg` — zadnja
  sličica posnetka z logotipom.
  **Popravek 2026-07-29 (drugič):** posnetek se na telefonu še vedno ni predvajal,
  ker je bilo vklopljeno **varčevanje z baterijo** (rumena ikona baterije na
  posnetku zaslona) — takrat iPhone samodejno predvajanje ustavi tudi pri utišanem
  posnetku in čez `poster` nariše svoj gumb za predvajanje. Zato je slika zdaj svoj
  element pod posnetkom, posnetek pa je prosojen, dokler ne steče. Brez varčevanja
  z baterijo se predvaja normalno; preverjeno v brezglavem brskalniku, kjer se
  posnetek predvaja in prekrije sliko.

- **Ikona aplikacije (2026-07-29).** `icons/icon-192.png`, `icon-512.png` in
  `icon-512-maskable.png` niso več začasne: narejene so iz zadnje sličice uvodnega
  posnetka — bel logotip LAPI na rdečem prelivu. Imena datotek so ista, zato
  `manifest.json` in `apple-touch-icon` v `index.html` ostaneta nespremenjena.
  Postopek za nov logotip je v [delovni-tok.md](delovni-tok.md).

- **Prazen pas pod spodnjimi gumbi (2026-07-29).** Odmik spodaj je zdaj ravnih 8 px,
  brez varnega območja: pas 34 px za črtico za domov je bil videti kot napaka,
  črtica pa se itak skrije sama. Večji del praznine pa ni bil naš — na iPhonu se je
  nad črnim pasom končal tudi zastor z animacijo, ki je `position: fixed; inset: 0`,
  kar pomeni, da okno aplikacije ni segalo do roba zaslona. Izmerjeno z začasno
  merilno črto ob dnu okna, potrjeno na telefonu; črta je odstranjena.
  **Vzrok:** `black-translucent` v `index.html` — iOS pri tej nastavitvi vsebino
  potisne pod uro, okna pa ne poveča, zato spodaj ostane pas v višini vrstice z uro.
  Nastavitev je zamenjana za `black`. Čaka preizkus na telefonu; z njo se vsebina
  zgoraj ne razliva več pod uro, naslov zaslona pa se pomakne 14 px podnjo.

## V teku

- **Namestitev prototipa na telefon (Android).** Zataknilo se je pri tem, da je
  bil naslov odprt v vgrajenem brskalniku (WebView), ki ponuja samo zaznamek.
  V pravem Chromu je pravilna izbira *Dodaj na domači zaslon* → **Namesti**, ne
  *Ustvari bližnjico*. Potrditev: ob zagonu z ikone ni naslovne vrstice.

## Sledi

1. **Preizkus zaslona STATISTIKA v brskalniku** — edini zaslon brez samodejnih
   preizkusov. Najprej: migracija na `schemaVersion: 3`, podpot `#/statistika/arhiv`
   in sistemski gumb *nazaj*, ročni preračun formule moči na eni znani seriji.
2. **Označi vaje z lastno težo** — migracija je vse vaje postavila na `false`.
   Zgibi, sklece in dipsi rabijo preklop v oknu pod svinčnikom, sicer graf moči
   pri njih riše samo dodano težo.
3. **Preizkus na telefonu** — vse do zdaj je preverjeno v brskalniku na računalniku.
   Tipkovnica, velikost tarč in drsenje se pokažejo šele v roki.
4. **Izvoz in uvoz JSON** — varnostna kopija. Ne odlašati; podatki živijo samo na telefonu.
   Ker je vse en objekt pod ključem `fitnes`, je izvoz kratek.

## Odprta vprašanja

- Kje se ureja in briše zgodovina (napačno vpisan trening). Arhiv jo zdaj pokaže,
  popraviti pa je še ni mogoče, ko je enkrat shranjena.
- Ali prototip po prehodu na pravo aplikacijo ostane v repozitoriju ali se izbriše.
  Zaenkrat ostaja.
- Kam pride **izvoz/uvoz JSON in brisanje podatkov**. Zaslon RAČUN, ki je bil za to
  najbolj verjetno mesto, je odstranjen; najbolj verjetno je zdaj podpot pod
  STATISTIKA ali novo okno.
- Ali aplikacija ostane v podmapi `aplikacija/` ali se kdaj preseli na koren
  zaradi lepšega naslova.
