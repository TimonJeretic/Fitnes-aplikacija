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

## V teku

- **Namestitev prototipa na telefon (Android).** Zataknilo se je pri tem, da je
  bil naslov odprt v vgrajenem brskalniku (WebView), ki ponuja samo zaznamek.
  V pravem Chromu je pravilna izbira *Dodaj na domači zaslon* → **Namesti**, ne
  *Ustvari bližnjico*. Potrditev: ob zagonu z ikone ni naslovne vrstice.

## Sledi

1. **Potrditev podatkovnega modela** — [podatkovni-model.md](podatkovni-model.md) ima tri
   odprta vprašanja (ali vaja pripada več sklopom, kako se beležijo BW vaje, katera
   metrika gre na graf moči). To je edina odločitev, ki je kasneje res draga.
2. **v1 dnevnika treningov** — vnos treninga, seti, predlaganje imen vaj.
3. **Izvoz in uvoz JSON** — varnostna kopija. Ne odlašati; podatki živijo samo na telefonu.
4. **Grafa** — napredek moči po vaji, telesna teža.

## Odprta vprašanja za 

- Tri odprta vprašanja o podatkovnem modelu iz točke 1 zgoraj.
- Ali prototip po prehodu na pravo aplikacijo ostane v repozitoriju ali se izbriše.
