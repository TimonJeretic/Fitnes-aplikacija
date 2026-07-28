# Podatkovni model

> **Status: PREDLOG.** Ni še potrjen in ni še implementiran.
> To je najdražja odločitev v projektu — ko so podatki enkrat v telefonu, vsaka
> sprememba strukture zahteva migracijo. Zato se potrdi, preden nastane prva vrstica kode.

## Entitete

### `exercise` — vaja

| Polje | Tip | Opomba |
|---|---|---|
| `id` | string | naključen, npr. `crypto.randomUUID()` |
| `name` | string | kot ga je Timon vpisal, npr. "BB bench press" |
| `category` | string | `push` \| `pull` \| `legs` \| `upper` |
| `equipment` | string | `bodyweight` \| `barbell` \| `dumbbell` \| `machine` \| `cable` |
| `createdAt` | string | ISO datum |

Ta tabela je hkrati vir za predlaganje imen: ko Timon tipka, iščemo po `name`.

### `workout` — trening

| Polje | Tip | Opomba |
|---|---|---|
| `id` | string | |
| `date` | string | ISO datum |
| `split` | string | `push` \| `pull` \| `legs` \| `upper` |
| `note` | string | neobvezen zapisek |

### `set` — posamezna serija

| Polje | Tip | Opomba |
|---|---|---|
| `id` | string | |
| `workoutId` | string | kateremu treningu pripada |
| `exerciseId` | string | katera vaja |
| `order` | number | zaporedje seta znotraj vaje (1, 2, 3 …) |
| `reps` | number | ponovitve |
| `weightKg` | number \| null | `null` pri čistih BW vajah |

### `bodyweightEntry` — telesna teža

| Polje | Tip | Opomba |
|---|---|---|
| `id` | string | |
| `date` | string | ISO datum |
| `weightKg` | number | |

## Odprta vprašanja (rešiti pred implementacijo)

1. **Ali vaja pripada enemu sklopu ali več?**
   Trenutni predlog: enemu (`category` je en niz). Realno pa marsikatera vaja sodi
   v `push` in `upper` hkrati. Alternativa: `categories` kot polje nizov.
   Cena poznejše spremembe: srednja.

2. **Kako se beležijo BW vaje?**
   Predlog: `weightKg = null` pomeni čisto telesno težo. Če Timon dodaja utež
   (npr. pas pri dipsih), gre v `weightKg` **dodana** teža, ne skupna.
   Odprto: ali naj graf pri BW vajah prišteje telesno težo iz `bodyweightEntry`?

3. **Katera metrika se riše na grafu moči?**
   Predlog: **najtežji set v treningu** — najbolj neposredno odgovarja na
   "ali sem močnejši". Alternativi: skupni volumen (teža × ponovitve × seti)
   ali ocenjeni 1RM. Odločitev vpliva samo na prikaz, ne na shranjene podatke,
   zato je poceni spremenljiva kasneje.

## Shramba

Vsi podatki so **en JSON objekt v `localStorage`**:

```js
{
  schemaVersion: 1,
  exercises: [],
  workouts: [],
  sets: [],
  bodyweightEntries: []
}
```

**Zakaj localStorage in ne IndexedDB:** brez build koraka, brez knjižnic, sinhronen
in razumljiv API. Dnevnik treningov je majhen — nekaj tisoč setov je pod 1 MB,
omejitev pa je okoli 5 MB. Zadošča za leta uporabe.

**Polje `schemaVersion` je obvezno.** Ob spremembi strukture se poveča in koda ob
zagonu pretvori stare podatke. Brez tega bo posodobitev nekomu (Timonu) pobrisala
zgodovino treningov.

**Pot naprej, če prerastemo localStorage:** prehod na IndexedDB. Ker vsi podatki
tečejo skozi eno plast za dostop do shrambe, je zamenjava lokalna in ne zadeva UI.

## Varnostna kopija

Podatki živijo samo v brskalniku na telefonu. Če Timon odstrani aplikacijo ali
iOS počisti shrambo, jih ni več. Zato je **izvoz v JSON datoteko obvezna funkcija v1**,
ne dodatek za kasneje. Uvoz iste datoteke mora podatke vrniti.
