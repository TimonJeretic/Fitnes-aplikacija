// Vse besedilo, ki ga uporabnik vidi, je tukaj — na enem mestu.
// Koda je angleška, besedilo na zaslonu slovensko. Če hočeš spremeniti napis,
// ga popraviš tukaj in nikjer drugje.

export const TEXT = {
  appName: 'Fitnes',

  // Imena zaslonov. Ključi so enaki kot `id` v js/screens/*.js.
  screens: {
    training: 'TRENING',
    weight: 'TEŽA',
    stats: 'STATISTIKA',
    account: 'RAČUN'
  },

  // Zaslon TRENING.
  training: {
    newWorkout: 'Nov trening',
    workoutName: 'Ime treninga',
    startNew: '+ Naredi nov trening',
    startNewHint: 'Najprej vpiši ime treninga',

    date: 'Datum:',
    set: 'Set',
    addSet: 'Dodaj serijo',
    removeSet: 'Odstrani zadnjo serijo',

    exerciseName: 'Ime vaje',
    addExercise: 'Dodaj vajo',
    newExercise: '+ Nova vaja',

    note: 'Zapisek',
    notePlaceholder: 'Nastavitev stola, elastika, oprijem …',
    noteHint: 'Zapisek ostane pri vaji tudi za naslednjič.',
    removeExercise: 'Odstrani iz treninga',
    removeExerciseConfirm: 'Odstranim to vajo iz treninga?',
    close: 'Zapri',

    discard: 'Zavrži',
    discardConfirm: 'Zavržem trening? Vpisane serije bodo izgubljene.',
    save: 'Shrani',
    nameMissing: 'Trening rabi ime, preden ga lahko shranim.'
  }
};
