// Vse besedilo, ki ga uporabnik vidi, je tukaj — na enem mestu.
// Koda je angleška, besedilo na zaslonu slovensko. Če hočeš spremeniti napis,
// ga popraviš tukaj in nikjer drugje.

export const TEXT = {
  appName: 'Fitnes',

  // Imena elastik pri zgibih. Ključi so `store.BANDS`, same barve so v CSS.
  // Skupna obema zaslonoma: vpisujejo se pri treningu, berejo pa tudi v arhivu.
  bands: {
    yellow: 'Rumena',
    green: 'Zelena',
    teal: 'Turkizna',
    red: 'Rdeča',
    bw: 'BW (lastna teža)'
  },

  // Imena zaslonov. Ključi so enaki kot `id` v js/screens/*.js.
  screens: {
    training: 'TRENING',
    weight: 'TEŽA',
    stats: 'STATISTIKA'
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
    repeatLast: 'Ponovi zadnji trening',
    set: 'Set',
    unit: 'kg',
    band: 'Barva elastike',
    bandNone: 'Počisti izbiro',

    addSet: 'Dodaj serijo',
    removeLastSet: 'Odstrani zadnjo serijo',
    removeLastSetConfirm: 'Odstranim zadnjo serijo? Vpisana teža in ponovitve bodo izgubljene.',

    exerciseName: 'Ime vaje',
    pickExercise: 'Izberi vajo',
    newExercise: 'Nova vaja',
    noExercisesYet: 'Registra vaj še ni. Vpiši prvo vajo spodaj.',
    allAdded: 'Vse vaje tega treninga so že dodane. Novo vpiši spodaj.',
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
    noExercises: 'V treningu ni nobene vaje. Dodaj vsaj eno ali pritisni Zavrži.'
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

    week: 'Teden',
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

    week: 'Teden',
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

  // Okno pod zobnikom: varnostna kopija podatkov.
  settings: {
    open: 'Nastavitve',
    title: 'Nastavitve',
    close: 'Zapri',

    importAction: 'Uvoz kopije',
    exportAction: 'Izvozi zdaj',
    folderAction: 'Določi mapo za kopije',
    folderChange: 'Zamenjaj mapo',

    // Kaj se dogaja s kopijami na tej napravi. Kateri napis velja, se ne ugiba iz
    // imena brskalnika, ampak iz tega, kaj naprava zna — glej js/backup.js.
    modeDirectory: 'Kopija nastane sama ob vsakem shranjevanju.',
    modeUnset: 'Mapa še ni določena, zato se kopija ne dela sama.',
    modeShare: 'Ob shranjevanju se odpre okno za deljenje. '
      + 'Izberi Shrani v Datoteke ali svoj oblak.',
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
