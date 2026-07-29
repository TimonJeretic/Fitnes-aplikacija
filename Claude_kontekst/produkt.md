# Produkt — kaj gradiva

Osebni dnevnik treningov. 

## Osnovna zanka

1. Timon odpre aplikacijo v telovadnici.
2. Izbere sklop treninga (push / pull / legs / upper).
3. Za vsako vajo vpiše sete: število ponovitev in težo.
4. Ime vaje prvič vpiše ročno; ob naslednjih vnosih mu aplikacija ponudi že
   uporabljena imena. Predlogi nastanejo iz **zgodovine njegovih vnosov**, ne iz
   vnaprej pripravljenega seznama vaj.

## Sklopi treninga

V praksi `push`, `pull`, `legs`, `upper`. Aplikacija jih **ne pozna kot seznam**:
ime treninga je prosto besedilo in predloga nastane iz njega. Sklop je s tem že
ime treninga, zato vaja ne rabi polja `category` — glej [odlocitve.md](odlocitve.md).

## Grafi

- **Napredek moči po vaji** — linijski graf **ocene 1RM** skozi čas za izbrano vajo,
  ne vpisane teže: sicer `100 × 3` in `100 × 8` izgledata enako. Formula in razlog
  sta v [podatkovni-model.md](podatkovni-model.md). Namen: na prvi pogled videti,
  ali moč raste ali pada.
- **Telesna teža in meritve telesa** — linijski graf skozi čas. Samostojen vnos,
  ni vezan na noben trening. Telesna teža je hkrati tisto, kar graf moči prišteje
  pri vajah z lastno težo.

## Slovar

| Kratica | Pomen |
|---|---|
| BW | bodyweight — vaja z lastno težo |
| BB | barbell — drog |
| DB | dumbbell — ročka |

Kratice živijo v **imenih vaj, ki jih vpiše Timon** ("BB bench press"), aplikacija
sama jih ne uporablja. V kodi se pišejo s polnimi imeni (`bodyweight`, `barbell`,
`dumbbell`) — glej [arhitektura.md](arhitektura.md).

## Česa aplikacija namenoma NE dela

- ni računov in ni prijave
- ni sinhronizacije med napravami
- ni deljenja, socialnih funkcij ali primerjav z drugimi
- ni vnaprej pripravljene baze vaj — seznam nastane izključno iz Timonovih vnosov
- ne načrtuje treningov vnaprej; aplikacija beleži, kar se je že zgodilo

Vsaka od teh točk je **odločitev, ne pomanjkljivost**. Če se katera spremeni,
se sprememba zapiše v [odlocitve.md](odlocitve.md).

## Izvor

Specifikacija je v `fitnes-aplikacija.docx`. Ta datoteka je njegov
osebni zapisnik — berem jo **samo na izrecno zahtevo**. Ta dokument je moj delovni
vir resnice; če se docx dopolni, mi bo rekel, naj ga preberem, in nato posodobim
to datoteko.
