# Podatkovni model

> **Status: POTRJEN in implementiran** (2026-07-28) v `aplikacija/js/store.js`.
> Vsaka nadaljnja sprememba strukture zahteva migracijo v `migrate()` in dvig
> `schemaVersion` — od tu naprej so na telefonu pravi podatki.

## Shramba

Vse je **en JSON objekt v `localStorage`** pod ključem `fitnes`:

```js
{
  schemaVersion: 1,
  exercises: [],          // register vaj
  templates: [],          // predloge treningov
  workouts: [],           // zgodovina
  bodyweightEntries: [],  // telesna teža
  draft: null             // trening v teku
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
| `createdAt` | string | ISO datum |

Register nastane **izključno iz Timonovih vnosov** med treningom. Vnaprej
pripravljene baze vaj ni. Ta tabela je hkrati vir za šepetalnik imen.

Vaja **nima** polj `category` in `equipment`. Vsako dodatno polje je en korak več
ob prvem vnosu vaje, v telovadnici pa šteje vsak korak. Neobvezno polje se doda
kasneje poceni; odstraniti obveznega ni.

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
ne skupna. Ali naj graf moči prišteje telesno težo iz `bodyweightEntry`, se odloči,
ko bo graf nastal — to je vprašanje prikaza, ne shrambe.

### `bodyweightEntry` — telesna teža

| Polje | Tip | Opomba |
|---|---|---|
| `id` | string | |
| `date` | string | ISO datum |
| `weightKg` | number | |

Zaslon TEŽA še ni narejen; polje v shrambi že obstaja.

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
