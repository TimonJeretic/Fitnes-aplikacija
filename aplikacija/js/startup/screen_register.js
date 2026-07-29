// Seznam vseh zaslonov aplikacije.
//
// Sama datoteka zaslona živi v js/screens/, tukaj je samo seznam. To je edino
// mesto, kjer se zaslon vpiše v aplikacijo. Iz tega seznama se zgradijo
// gumbi v spodnji vrstici in naslovi (#/trening, #/teza, ...). Prvi zaslon
// v seznamu je tudi privzeti — tisti, ki se odpre ob zagonu.
//
// Ko dodaš nov zaslon, ga ne pozabi dopisati tudi v FILES v sw.js,
// sicer aplikacija brez interneta ne bo delovala.

import training from '../screens/training.js';
import weight from '../screens/weight.js';
import stats from '../screens/stats.js';
import account from '../screens/account.js';

// Vrstni red tukaj = vrstni red gumbov spodaj.
export const SCREENS = [training, weight, stats, account];
