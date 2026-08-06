// Vse besedilo, ki ga uporabnik vidi, je tukaj — na enem mestu.
// Koda je angleška, besedilo na zaslonu slovensko. Če hočeš spremeniti napis,
// ga popraviš tukaj in nikjer drugje.

export const TEXT = {
  appName: 'Fitnes',

  // Imena elastik. Ključi so `store.BANDS`, barve in debeline so v CSS.
  // Skupna obema zaslonoma: vpisujejo se pri treningu, berejo pa tudi v arhivu.
  bands: {
    yellow: 'Rumena',
    green: 'Zelena',
    teal: 'Cian',
    'red-thin': 'Rdeča tanka',
    'red-thick': 'Rdeča debela',
    bw: 'BW (lastna teža)'
  },

  // Imena vrst serij. Ključi so `store.SET_KINDS`. Kar ni oštevilčeno
  // (superset, dropset, myoreps), se s tem napisom tudi imenuje v vrstici.
  // Skupna obema zaslonoma: izbirajo se pri treningu, berejo tudi v arhivu.
  setKinds: {
    normal: 'Navaden set',
    superset: 'Superset',
    dropset: 'Dropset',
    myoreps: 'Myoreps',
    band: 'Elastika',
    time: 'Čas',
    empty: 'Prazen set'
  },

  // Imena zaslonov. Ključi so enaki kot `id` v js/screens/*.js.
  screens: {
    training: 'TRENING',
    weight: 'TEŽA',
    stats: 'STATISTIKA',
    nutrition: 'PREHRANA'
  },

  // Zaslon TRENING.
  training: {
    newWorkout: 'Nov trening',
    workoutName: 'Ime treninga',

    pastWorkouts: 'Pretekli treningi',
    noTemplates: 'Ni še nobenega treninga. Vpiši ime spodaj in začni.',
    createWorkout: 'Ustvari nov trening',
    confirm: 'Potrdi',
    removeTemplate: 'Zbriši trening',
    removeTemplateConfirm: 'Zbrišem ta trening s seznama? '
      + 'Shranjeni treningi in zgodovina ostanejo.',

    date: 'Datum:',
    pickDate: 'Izberi datum treninga',
    repeatLast: 'Ponovi zadnji trening',
    set: 'Set',
    unit: 'kg',
    band: 'Elastika',
    bandNone: 'Počisti izbiro',

    // Čas namesto teže in ponovitev: dve škatlici, med njima dvopičje.
    minutes: 'Minute',
    secondsField: 'Sekunde',

    addSet: 'Dodaj serijo',
    pickSetKind: 'Kakšen set dodaš?',
    // Znamenji v razmiku med dvema vrsticama. Vidita se, ne slišita —
    // napis je namig z miško in za bralnik zaslona.
    supersetLink: 'Skupaj s setom nad njim',
    dropsetLink: 'Nadaljevanje serije nad njim',
    removeLastSet: 'Odstrani zadnjo serijo',
    removeLastSetConfirm: 'Odstranim zadnjo serijo? Vpisana teža in ponovitve bodo izgubljene.',

    exerciseName: 'Ime vaje',
    pickExercise: 'Izberi vajo',
    searchExercise: 'Poišči ali vpiši vajo',
    addNewExercise: 'Nova vaja: ',
    noExercisesYet: 'Registra vaj še ni. Vpiši prvo vajo v polje zgoraj.',
    allAdded: 'Vse vaje iz registra so že v treningu. Novo vpiši v polje zgoraj.',
    nameTaken: 'Vaja s tem imenom že obstaja, zato ime ni shranjeno.',

    note: 'Zapisek',
    notePlaceholder: 'Nastavitev stola, elastika, oprijem …',
    noteHint: 'Zapisek ostane pri vaji tudi za naslednjič.',
    bodyweight: 'Vaja z lastno težo',
    bodyweightHint: 'Zgibi, sklece, dipsi. Vpisana teža šteje kot dodana (pas, utež), '
      + 'graf moči pa prišteje tvojo telesno težo.',
    removeExercise: 'Odstrani vajo iz treninga',
    removeExerciseConfirm: 'Odstranim to vajo? Vpisane serije bodo izgubljene.',
    moveExercise: 'Povleci za premik vaje',
    close: 'Zapri',

    discard: 'Zavrži',
    discardConfirm: 'Zavržem trening? Vpisane serije bodo izgubljene.',
    save: 'Shrani',
    nameMissing: 'Trening rabi ime, preden ga lahko shranim.',
    noExercises: 'V treningu ni nobene vaje. Dodaj vsaj eno ali pritisni Zavrži.',

    // Cardio. Stoji na zaslonu brez treninga, ker se vpiše po teku in ne med
    // serijami; v maintenance na zaslonu PREHRANA gre kot poraba tega dne.
    cardio: 'Vpiši cardio',
    cardioValue: 'Porabljene kalorije',
    cardioUnit: 'kcal',
    cardioSave: 'Shrani cardio',
    cardioSaved: 'Shranjeno.',
    cardioHint: 'En vnos na dan. Ponoven vpis prejšnjega prepiše.'
  },

  // Zaslon TEŽA.
  weight: {
    heading: 'Meritve',
    picked: 'Meritev:',
    bodyweight: 'Telesna teža',
    pickMeasurement: 'Izberi meritev',
    measurementName: 'Ime meritve',
    newMeasurement: 'Nova meritev',
    unit: 'Enota',
    confirm: 'Potrdi',
    close: 'Zapri',

    value: 'Vrednost',
    date: 'Datum',
    save: 'Shrani',

    statistics: 'Statistika',
    history: 'Prikaži pretekle meritve',
    historyEmpty: 'Ni vnosov.',
    removeEntry: 'Zbriši vnos',

    day: 'Dan',
    month: 'Mesec',
    year: 'Leto',
    noData: 'Ni podatkov.',

    // Enota telesne teže. Meritve telesa imajo svojo enoto zapisano v podatkih.
    unitWeight: 'kg'
  },

  // Zaslon STATISTIKA.
  stats: {
    heading: 'Statistika',
    archive: 'Arhiv treningov',
    exerciseArchive: 'Arhiv vaj',
    noExercises: 'Registra vaj še ni. Vaje nastanejo, ko jih vpišeš v trening.',
    pr: 'PR:',
    noRecord: 'Pri tej vaji ni nobene serije s ponovitvami.',
    removeExercise: 'Zbriši vajo',
    removeExerciseConfirm: 'Zbrišem to vajo? Izgine iz registra, iz predlog in iz '
      + 'vseh shranjenih treningov — tudi z grafov.',
    back: '← Nazaj',
    searchWorkouts: 'Ime treninga ali datum',
    noWorkouts: 'Ni še nobenega shranjenega treninga.',
    noMatches: 'Ni zadetkov.',
    removeWorkout: 'Zbriši trening',
    removeWorkoutConfirm: 'Zbrišem ta trening? Izgine iz arhiva in z grafov moči. '
      + 'Trening na seznamu za naslednjič ostane.',
    removedExercise: '(zbrisana vaja)',
    set: 'Set',

    picked: 'Vaja:',
    choose: 'Izberi vajo',
    exerciseName: 'Ime vaje',
    ownBodyweight: 'lastna teža',
    empty: '—',
    close: 'Zapri',
    noTrainedExercises: 'Ko shraniš prvi trening, se vaje pojavijo tukaj.',
    pickExercise: 'Izberi vajo in poglej, kako gre moč skozi čas.',

    day: 'Dan',
    month: 'Mesec',
    year: 'Leto',

    // Naslov razdelka nad izbirnikom vaje; `strength` je ime številke same
    // (uporabljeno v arhivu treningov), zato sta niza dva.
    strengthSection: 'Statistika moči',
    strength: 'Moč (ocena 1RM)',
    unit: 'kg',
    noData: 'Pri tej vaji ni nobene serije s težo in ponovitvami.',
    needsBodyweight: 'To je vaja z lastno težo, tvoje telesne teže pa še ne poznam. '
      + 'Vpiši jo na zaslonu TEŽA in graf se pojavi.',

    topSets: 'Najboljša serija po obdobjih'
  },

  // Zaslon PREHRANA.
  nutrition: {
    heading: 'Prehrana',

    today: 'Danes zaužito',
    kcalUnit: 'kcal',
    proteinUnit: 'g',
    empty: '—',

    addMeal: 'Dodaj obrok',
    kcal: 'Kalorije',
    protein: 'Proteini',
    add: 'Dodaj',
    clearToday: 'Zbriši današnje obroke',
    clearTodayConfirm: 'Zbrišem vse današnje obroke? Dan se s tem postavi na nič.',

    maintenance: 'Maintenance',
    average: 'Povprečno zaužito',

    // Namesto številke, kadar je za izračun premalo podatkov. Vsak razlog pove
    // tudi, kaj je treba narediti, da se številka pojavi.
    noMeals: 'Vpiši obroke vsaj en dan.',
    noTrend: 'Rabim dve tehtanji v zadnjem tednu.',
    shortTrend: 'Tehtanji sta preblizu skupaj.',

    chart: 'Graf',
    showWeight: 'Teža',
    showCalories: 'Kalorije',
    weightUnit: 'kg',
    day: 'Dan',
    month: 'Mesec',
    year: 'Leto',
    noData: 'Ni podatkov.',
    nothingPicked: 'Odkljukaj težo ali kalorije.'
  },

  // Okno pod zobnikom: varnostna kopija podatkov.
  settings: {
    open: 'Nastavitve',
    title: 'Nastavitve',
    close: 'Zapri',

    importAction: 'Uvoz kopije',
    exportAction: 'Izvozi zdaj',
    folderAction: 'Določi mapo za kopije',
    folderChange: 'Zamenjaj mapo',

    // Prva vrstica stanja, na vsaki napravi ista: kopija se nikoli ne naredi sama.
    modeManual: 'Kopija nikoli ne nastane sama — narediš jo z gumbom Izvozi zdaj.',

    // Kam gre kopija na tej napravi. Kateri napis velja, se ne ugiba iz imena
    // brskalnika, ampak iz tega, kaj naprava zna — glej js/backup.js.
    modeDirectory: 'Datoteka gre v izbrano mapo.',
    modeUnset: 'Mapa še ni določena; brez nje se datoteka prenese v mapo Prenosi.',
    modeShare: 'Odpre se okno za deljenje. Izberi Shrani v Datoteke ali svoj oblak.',
    modeDownload: 'Ta brskalnik zna samo prenos v mapo Prenosi.',

    folderLabel: 'Mapa: ',
    lastLabel: 'Zadnja kopija: ',
    never: 'Kopije še ni.',
    problemLabel: 'Zadnja napaka: ',

    // Uvoz povozi vse; potrditev mora pokazati, kaj gre za kaj.
    importIntro: 'Uvoz povozi vse podatke v aplikaciji.',
    importIncoming: 'V datoteki: ',
    importCurrent: 'Zdaj v aplikaciji: ',
    importAsk: 'Nadaljujem?',
    workoutsUnit: ' treningov, ',
    entriesUnit: ' vnosov teže in meritev',

    importBad: 'Te datoteke ne znam prebrati. Ali je to res kopija te aplikacije?',
    importDone: 'Kopija je uvožena. Aplikacija se bo osvežila.',

    folderDone: 'Mapa je izbrana, prva kopija je narejena.',
    folderFailed: 'Mape ni bilo mogoče uporabiti.',
    exportDone: 'Kopija je narejena.',
    exportFailed: 'Kopije ni bilo mogoče narediti.'
  }
};
