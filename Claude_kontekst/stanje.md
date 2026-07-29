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
- **Ogrodje prave aplikacije** (`aplikacija/`) — prazen zaslon, spodaj štirje kvadratni
  gumbi T / W / S / A. Klik odpre zaslon svoje barve z napisom TRENING / TEŽA /
  STATISTIKA / RAČUN. Vsebine še ni; namen je bil postaviti razširljivo ogrodje.
  Preverjeno lokalno: vsi štirje zasloni, naslov `#/...` in gumb *nazaj*, nesmiseln
  naslov pade na TRENING, service worker se registrira, aplikacija se naloži tudi
  z ugasnjenim strežnikom. Razširljivost preizkušena s petim, začasnim zaslonom.

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
- Kaj sploh pride na zaslon **RAČUN**. Aplikacija namenoma nima prijave
  ([produkt.md](produkt.md)); najbolj verjetna vsebina je izvoz/uvoz JSON in
  brisanje podatkov.
- Ali aplikacija ostane v podmapi `aplikacija/` ali se kdaj preseli na koren
  zaradi lepšega naslova.
