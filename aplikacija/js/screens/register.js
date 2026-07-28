// Seznam vseh zaslonov aplikacije.
//
// To je edino mesto, kjer se doda nov zaslon. Iz tega seznama se zgradijo
// gumbi v spodnji vrstici in naslovi (#/trening, #/teza, ...). Prvi zaslon
// v seznamu je tudi privzeti — tisti, ki se odpre ob zagonu.
//
// Ko dodaš nov zaslon, ga ne pozabi dopisati tudi v FILES v sw.js,
// sicer aplikacija brez interneta ne bo delovala.

import training from './training.js';
import weight from './weight.js';
import stats from './stats.js';
import account from './account.js';

// Vrstni red tukaj = vrstni red gumbov spodaj.
export const SCREENS = [training, weight, stats, account];
