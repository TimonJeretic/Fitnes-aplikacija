// Zaslon: trening.
//
// Vsak zaslon izvozi objekt z isto obliko. To je edina pogodba v aplikaciji:
// dokler jo modul spoštuje, ga router zna prikazati, tab vrstica pa mu sama
// naredi gumb. Nov zaslon = kopija te datoteke + ena vrstica v register.js.

import { TEXT } from '../ui.js';

export default {
  id: 'training',                 // interni ključ (angleško, brez šumnikov)
  route: 'trening',               // kar piše v naslovu: #/trening
  tab: 'T',                       // črka na kvadratku spodaj
  title: TEXT.screens.training,   // napis; besedilo živi v ui.js
  accent: '#e05a3a',              // barva tega zaslona

  // Vrne DOM element, ki ga router vstavi v <main>. Zdaj je to samo napis;
  // ko bo zaslon dobil pravo vsebino (seznam vaj, serije), se spremeni
  // samo ta funkcija — router in CSS ostaneta nedotaknjena.
  render() {
    const title = document.createElement('div');
    title.className = 'screen-title';
    title.textContent = this.title;
    return title;
  }
};
