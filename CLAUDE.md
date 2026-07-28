# Fitnes aplikacija

Osebni dnevnik treningov: vaje, seti, ponovitve, kile, plus grafa napredka
moči in telesne teže. PWA brez backenda — podatki živijo na telefonu.

- **Živa aplikacija:** https://timonjeretic.github.io/Fitnes-aplikacija/
- **Repozitorij je JAVEN.** Vse, kar gre v git, je javno berljivo. Nič občutljivega
  v kodo ali dokumente.

## Trenutno stanje

Prototip PWA deluje in je objavljen; prava aplikacija se še ni začela. Naslednji korak
je potrditev podatkovnega modela. Podrobnosti: `Claude_kontekst/stanje.md`

## Stalna pravila

- **Koda angleško, vmesnik slovensko.** Identifikatorji, polja in CSS razredi angleško
  (`weightKg`, `addSet()`), besedilo na zaslonu slovensko ("Dodaj serijo").
  V kodi nikoli šumnikov; v UI besedilu so normalni.
- **Po vsaki spremembi kode povečaj `CACHE` verzijo v `sw.js`.** Sicer telefon servira
  staro različico in izgleda, kot da koda ne deluje. To je najpogostejša past v projektu.
- **Aplikacija se uporablja v telovadnici, z eno roko.** Veliki gumbi, malo tipkanja,
  čim manj korakov do vpisanega seta.

## Vzdrževanje konteksta — moja odgovornost, ne Timonova

- Datoteke v `Claude_kontekst/` berem **sam od sebe**, kadar so relevantne za nalogo.
- Ko sprejmeva odločitev, jo **takoj** zapišem v `odlocitve.md`.
- Ko se spremeni stanje projekta (nova funkcija, deploy, potrjeno delovanje),
  posodobim `stanje.md`.
- Ko se spremeni podatkovni model ali arhitektura, posodobim ustrezno datoteko
  **v istem commitu kot kodo**. Dokument in koda se ne smeta razjti.
- **Edina izjema:** `fitnes-aplikacija.docx`, berem ga **samo**
  na izrecno zahtevo in ga nikoli ne spreminjam. Navodilo za branje je v `delovni-tok.md`.

## Kje kaj piše

Odpri samo tisto datoteko, ki jo za trenutno nalogo res potrebuješ.

| Datoteka | Odpri, ko |
|---|---|
| `Claude_kontekst/produkt.md` | se sprašuješ, kaj naj aplikacija dela ali česa namenoma ne; slovar BW/BB/DB |
| `Claude_kontekst/podatkovni-model.md` | delaš s podatki, shrambo, migracijami ali grafi |
| `Claude_kontekst/arhitektura.md` | pišeš kodo: konvencije, sestavni deli PWA, struktura map |
| `Claude_kontekst/delovni-tok.md` | poganjaš lokalno, objavljaš, nameščaš na telefon ali bereš docx |
| `Claude_kontekst/odlocitve.md` | se sprašuješ, zakaj je nekaj tako; preden predlagaš spremembo pristopa |
| `Claude_kontekst/stanje.md` | začenjaš sejo in rabiš vedeti, kje sva ostala |

Te poti so navadne markdown povezave in se **ne** nalagajo samodejno. To je namerno:
indeks ostane kratek, podrobnosti se preberejo po potrebi.
