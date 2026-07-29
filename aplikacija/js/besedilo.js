// Vse besedilo, ki ga uporabnik vidi, je tukaj — na enem mestu.
// Koda je angleška, besedilo na zaslonu slovensko. Če hočeš spremeniti napis,
// ga popraviš tukaj in nikjer drugje.

export const TEXT = {
  appName: 'Fitnes',

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
    startNew: '+ Naredi nov trening',
    startNewHint: 'Najprej vpiši ime treninga',

    date: 'Datum:',
    repeatLast: 'Ponovi zadnji trening',
    set: 'Set',
    addSet: 'Dodaj serijo',
    removeSet: 'Odstrani zadnjo serijo',

    exerciseName: 'Ime vaje',
    addExercise: 'Dodaj vajo',
    newExercise: '+ Nova vaja',

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
    picked: 'Meritev:',
    bodyweight: 'Telesna teža',
    measurementName: 'Ime meritve',
    newMeasurement: '+ Nova meritev',
    close: 'Zapri',

    value: 'Vrednost',
    date: 'Datum',
    save: 'Shrani',

    history: 'Stare meritve',
    historyEmpty: 'Ni vnosov.',
    removeEntry: 'Zbriši vnos',

    week: 'Tedni',
    month: 'Meseci',
    year: 'Leta',
    noData: 'Ni podatkov.',

    unitWeight: 'kg',
    unitMeasurement: 'cm'
  },

  // Zaslon STATISTIKA.
  stats: {
    archive: 'Arhiv treningov',
    back: '← Nazaj',
    searchWorkouts: 'Ime treninga ali datum',
    noWorkouts: 'Ni še nobenega shranjenega treninga.',
    noMatches: 'Ni zadetkov.',
    exerciseCount: 'vaj',
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

    week: 'Tedni',
    month: 'Meseci',
    year: 'Leta',

    strength: 'Moč (ocena 1RM)',
    unit: 'kg',
    noData: 'Pri tej vaji ni nobene serije s težo in ponovitvami.',
    needsBodyweight: 'To je vaja z lastno težo, tvoje telesne teže pa še ne poznam. '
      + 'Vpiši jo na zaslonu TEŽA in graf se pojavi.',

    latest: 'Zadnje',
    record: 'Rekord',
    change: 'Sprememba',

    topSets: 'Najboljša serija po obdobjih',
    plusBodyweight: 'z lastno težo'
  }
};
