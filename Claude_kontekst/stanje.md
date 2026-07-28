# Stanje projekta

**Zadnja posodobitev:** 2026-07-28

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
  Preverjeno v brskalniku s 65 samodejnimi preizkusi celotne poti: nov trening,
  nova vaja, vpis serij, shranjevanje, autofill iz predloge, stolpec "zadnjič",
  zapisek, preživetje osvežitve, prepis predloge, zavrži, trening brez imena,
  iskanje brez ozira na šumnike in velike črke.

## V teku

- **Namestitev prototipa na telefon (Android).** Zataknilo se je pri tem, da je
  bil naslov odprt v vgrajenem brskalniku (WebView), ki ponuja samo zaznamek.
  V pravem Chromu je pravilna izbira *Dodaj na domači zaslon* → **Namesti**, ne
  *Ustvari bližnjico*. Potrditev: ob zagonu z ikone ni naslovne vrstice.

## Sledi

1. **Preizkus zaslona TRENING na telefonu** — vse do zdaj je preverjeno v brskalniku
   na računalniku. Tipkovnica, velikost tarč in drsenje se pokažejo šele v roki.
2. **Izvoz in uvoz JSON** — varnostna kopija. Ne odlašati; podatki živijo samo na telefonu.
   Ker je vse en objekt pod ključem `fitnes`, je izvoz kratek.
3. **Pregled zgodovine** — treningi se že shranjujejo, videti pa se jih še ne da.
4. **Zaslon TEŽA** — vnos telesne teže; `bodyweightEntries` v shrambi že obstaja.
5. **Grafa** — napredek moči po vaji, telesna teža.

## Odprta vprašanja

- Katera metrika gre na graf moči: najtežja serija, skupni volumen ali ocenjeni 1RM.
  Vpliva samo na prikaz, ne na shranjene podatke, zato je poceni spremenljiva.
- Ali graf pri vajah z lastno težo prišteje telesno težo iz `bodyweightEntries`.
- Kje se ureja in briše zgodovina (napačno vpisan trening). Zaenkrat je ni mogoče
  popraviti, ko je enkrat shranjena.
- Ali prototip po prehodu na pravo aplikacijo ostane v repozitoriju ali se izbriše.
  Zaenkrat ostaja.
- Kaj sploh pride na zaslon **RAČUN**. Aplikacija namenoma nima prijave
  ([produkt.md](produkt.md)); najbolj verjetna vsebina je izvoz/uvoz JSON in
  brisanje podatkov.
- Ali aplikacija ostane v podmapi `aplikacija/` ali se kdaj preseli na koren
  zaradi lepšega naslova.
