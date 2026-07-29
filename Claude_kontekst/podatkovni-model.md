# Podatkovni model

> **Status: POTRJEN in implementiran** v `aplikacija/js/store.js`.
> Trenutna `schemaVersion` je **3** (2026-07-29, dodano `usesBodyweight` pri vaji).
> Vsaka nadaljnja sprememba strukture zahteva migracijo v `migrate()` in dvig
> `schemaVersion` — na telefonu so pravi podatki.

## Shramba

Vse je **en JSON objekt v `localStorage`** pod ključem `fitnes`:

```js
{
  schemaVersion: 3,
  exercises: [],           // register vaj
  templates: [],           // predloge treningov
  workouts: [],            // zgodovina
  bodyweightEntries: [],   // telesna teža
  measurements: [],        // register meritev telesa
  measurementEntries: [],  // izmerjene vrednosti
  draft: null              // trening v teku
}
```

Register vaj je **ploščat**, treningi so **gnezdeni**. Razlog: zapisek je last vaje,
zato vaja obstaja natanko enkrat; trening pa je natanko to, kar je na zaslonu, zato
je en objekt. "Shrani" je s tem `workouts.push(...)`, "zavrži" pa `draft = null`,
brez čiščenja sirot po treh tabelah.

**Zakaj localStorage in ne IndexedDB:** brez build koraka, brez knjižnic, sinhronen
in razumljiv API. Dnevnik treningov je majhen — nekaj tisoč serij je pod 1 MB,
omejitev pa je okoli 5 MB. Zadošča za leta uporabe.

**Do podatkov se pride samo prek `js/store.js`.** Noben zaslon ne kliče
`localStorage` neposredno. Zato je prehod na IndexedDB, če ga bo kdaj treba,
zamenjava ene datoteke.

## Entitete

### `exercise` — vaja

| Polje | Tip | Opomba |
|---|---|---|
| `id` | string | `crypto.randomUUID()` |
| `name` | string | kot ga je Timon vpisal, npr. "BB bench press" |
| `note` | string | trajni zapisek: nastavitev stola, elastika, oprijem |
| `usesBodyweight` | boolean | vaja z lastno težo (zgibi, sklece, dipsi) |
| `createdAt` | string | ISO datum |

Register nastane **izključno iz Timonovih vnosov** med treningom. Vnaprej
pripravljene baze vaj ni. Ta tabela je hkrati vir za šepetalnik imen.

Vaja **nima** polj `category` in `equipment`. Vsako dodatno polje je en korak več
ob prvem vnosu vaje, v telovadnici pa šteje vsak korak. Neobvezno polje se doda
kasneje poceni; odstraniti obveznega ni.

`usesBodyweight` je izjema od tega pravila in edino dodano polje. Vpliva samo na
graf moči: tam se telesna teža prišteje k vpisani. Vnosa ne podaljša — privzeto je
`false`, preklopi se v oknu pod svinčnikom, enkrat na vajo. Zakaj polje in ne
ugibanje iz podatkov: prazen `weightKg` pomeni "lastna teža **ali** nisem vpisal",
zato bi ena pozabljena teža pri benchu bench za vedno spremenila v vajo z lastno težo.

### `template` — predloga treninga

| Polje | Tip | Opomba |
|---|---|---|
| `id` | string | |
| `name` | string | "Push"; hkrati ključ za šepetalnik |
| `exerciseIds` | string[] | zaporedje vaj |
| `updatedAt` | string | ISO datum |

Predloga je **ime, ki mu pripada zaporedje vaj**. Ob shranjevanju treninga se
predloga z istim imenom **prepiše** — če si danes zamenjal vajo, je od zdaj naprej
to tvoj Push. Zgodovina ostane nedotaknjena.

Imena se primerjajo prek `normalizeName()`: brez velikih črk, brez šumnikov, brez
odvečnih presledkov. "Počepi " in "pocepi" sta ista stvar.

Predloga se **briše** s košem na zaslonu TRENING (`store.removeTemplate(id)`).
Brisanje odstrani samo vrstico iz `templates`: shranjeni treningi hranijo svoje
vaje sami, `templateId` v njih je le namig, iz česa je trening nastal. Zgodovina
in grafi zato ostanejo nedotaknjeni, tudi če predloge ni več.

### `workout` — trening

| Polje | Tip | Opomba |
|---|---|---|
| `id` | string | |
| `name` | string | ime treninga ob shranjevanju |
| `templateId` | string | predloga, ki je bila takrat prepisana |
| `date` | string | ISO datum |
| `exercises` | array | `{ exerciseId, sets: [...] }` |

Vsak shranjen trening ostane tukaj za vedno. Prazne serije se ob shranjevanju
zavržejo, predloga pa dobi **vse** vaje — tudi tiste, ki jih tisti dan ni uspel
narediti; naslednjič naj se spet ponudijo.

### `set` — posamezna serija

| Polje | Tip | Opomba |
|---|---|---|
| `weightKg` | number \| null | `null` = telesna teža ali neizpolnjeno |
| `reps` | number \| null | |

**Nima `id` in nima `order`** — mesto v polju `sets` je zaporedje. Serija ni nikoli
naslovljena od zunaj, zato bi bil id mrtvo polje.

Pri vajah z lastno težo gre v `weightKg` **dodana** teža (npr. pas pri dipsih),
ne skupna. Graf moči telesno težo **prišteje** — z vrednostjo iz `bodyweightEntry`,
ki velja na dan tistega treninga. To je vprašanje prikaza in ne shrambe: v podatkih
ostane samo tisto, kar si vpisal.

### `bodyweightEntry` — telesna teža

| Polje | Tip | Opomba |
|---|---|---|
| `id` | string | |
| `date` | string | ISO **dan**: `'2026-07-29'` |
| `weightKg` | number | |

### `measurement` — meritev telesa

| Polje | Tip | Opomba |
|---|---|---|
| `id` | string | |
| `name` | string | kot ga je Timon vpisal, npr. "Roka" |
| `createdAt` | string | ISO datum |

Register nastane enako kot register vaj: iz imen, vpisanih na zaslonu TEŽA.
Vnaprej pripravljenega seznama delov telesa ni. Meritev **nima polja za enoto** —
vse meritve so v centimetrih.

### `measurementEntry` — izmerjena vrednost

| Polje | Tip | Opomba |
|---|---|---|
| `id` | string | |
| `measurementId` | string | katera meritev |
| `date` | string | ISO **dan** |
| `valueCm` | number | vedno centimetri |

### Datum in pravilo "en vnos na dan"

Pri obeh vnosih zgoraj je `date` ISO **dan** (`'2026-07-29'`), ne poln časovni žig
kot pri `workout`. Razloga sta dva: `<input type="date">` daje in jemlje točno to
obliko, tehtanje pa je dejstvo dneva — poln žig bi ob pretvorbi v UTC vnos znal
premakniti na sosednji dan. Nizi te oblike se sortirajo leksikografsko enako kot po času.

Na en dan gre **en vnos** na serijo. Ponoven vpis istega dne obstoječega prepiše:
popravek tipkarske napake je s tem ponoven vpis, graf pa nima dveh točk na isti dan.

### `draft` — trening v teku

Ista oblika kot `workout`, brez `id` in `date`, z `startedAt`.

Zapiše se **ob vsaki spremembi**, ne šele ob "Shrani". Telefon se v telovadnici
zaklene in sistem aplikacijo ubije — ob vrnitvi mora biti trening cel. Prisotnost
`draft` je hkrati tisto, kar zaslonu TRENING pove, katero od dveh stanj naj pokaže.

## Poizvedbe

Zasloni ne brskajo po podatkih sami. Kar rabijo, je v `store.js`:

- `searchTemplates(query)`, `searchExercises(query)` — šepetalnik; prazno iskanje
  vrne vse, ujemanja na začetku imena so prva.
- `lastSetsFor(exerciseId)` — serije iz **zadnjega treninga kjerkoli v zgodovini**,
  v katerem se je ta vaja pojavila, ne glede na ime treninga. To je številka,
  ki jo hočeš prekositi.
- `upsertTemplate(name, exerciseIds)`, `saveWorkout(draft)`.
- `getBodyweightEntries()`, `addBodyweight(weightKg, date)`, `removeBodyweight(id)`.
- `searchMeasurements(query)`, `findMeasurementByName(name)`, `createMeasurement(name)`,
  `getMeasurementEntries(measurementId)`, `addMeasurementEntry(measurementId, valueCm, date)`,
  `removeMeasurementEntry(id)`.
- `todayIso()` — današnji dan v **lokalnem** času. `new Date().toISOString()` vzame
  UTC in bi tik po polnoči ponudil včerajšnji datum.
- `setExerciseBodyweight(id, value)` — preklop "vaja z lastno težo".

Za zaslon STATISTIKA:

- `listWorkouts()`, `searchWorkouts(query)` — arhiv, **najnovejši prvi**. Iskanje teče
  čez ime in datum hkrati: iskalni niz treninga vsebuje ime, ISO dan in slovenski
  zapis datuma, zato `push`, `2026` in `29.7` najdejo isto stvar brez posebne logike.
- `getWorkoutView(id)` — shranjen trening z **razrešenimi imeni vaj**. Trening hrani
  samo `exerciseId`; razrešitev pripada sem, ker zaslon ne sme brskati po registru.
  `name: null` pomeni, da vaje v registru ni več.
- `searchTrainedExercises(query)` — samo vaje, ki so vsaj enkrat v zgodovini, s
  številom treningov. Vaja, ki je bila samo dodana v predlogo, nima česa pokazati.
- `strengthSeries(exerciseId)` — najboljša ocena 1RM po treningih, **najstarejši prvi**.
  Vrne `{ points, needsBodyweight }`; drugo pove, da je vaja z lastno težo in tehtanja
  še ni. Prehod čez vse treninge je sprejeta cena gnezdenega zapisa ([odlocitve.md](odlocitve.md)).
- `estimate1RM(weightKg, reps)` — formula moči, zapisana natanko enkrat, tukaj.
- `bodyweightAt(day)` — zadnje tehtanje na ta dan ali pred njim; brez enega samega
  tehtanja `null`.

Vsi seznami vnosov pridejo **najstarejši prvi**, ker graf riše od leve proti desni.
Izjema je arhiv treningov: tam iščeš skoraj vedno zadnje, zato so najnovejši prvi.

## Ocena moči (1RM)

Graf moči ne riše vpisane teže, ampak oceno največje teže za eno ponovitev:

```
1RM = weightKg * (1 + (sqrt(reps) - 1) / 5)
```

Vrednost treninga je **najboljša** serija tiste vaje tisti dan, ne povprečje —
ogrevalne serije ne smejo vleči krivulje navzdol.

Ocena se **ne shranjuje**. Izračun je poceni, shranjena vrednost pa bi pomenila, da
popravek formule zahteva predelavo cele zgodovine. Zato je tudi sprememba formule
poceni: dotakne se enega izraza v `store.js` in nobenega podatka.

## Migracije

`schemaVersion` je obvezno polje. Ob spremembi strukture se poveča in `migrate()`
v `store.js` pretvori stare podatke. Brez tega bo posodobitev nekomu (Timonu)
pobrisala zgodovino treningov.

`migrate()` je hkrati zaščita pred pokvarjenim zapisom: manjkajoča ali napačna
polja se nadomestijo s praznimi, da aplikacija ne obstane.

## Varnostna kopija

Podatki živijo samo v brskalniku na telefonu. Če Timon odstrani aplikacijo ali
iOS počisti shrambo, jih ni več. Zato je **izvoz v JSON datoteko obvezna funkcija v1**,
ne dodatek za kasneje. Uvoz iste datoteke mora podatke vrniti. Ker je vse en objekt
pod enim ključem, je izvoz `JSON.stringify` celotne shrambe. **Še ni narejeno.**
