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

## 2026-07-28 — Brez build koraka

**Odločitev:** navaden HTML/CSS/JS z ES moduli. Ni Node.js, ni npm, ni bundlerja.

**Zakaj:** Node na računalniku ni nameščen. Datoteka, ki jo napiševa, je ista datoteka,
ki teče v brskalniku — kar je pri učenju bistveno, ker ni skritega vmesnega koraka.

**Kaj bi jo ovrglo:** potreba po knjižnici, ki obstaja samo kot npm paket in je ni mogoče
vendorati kot eno datoteko.
