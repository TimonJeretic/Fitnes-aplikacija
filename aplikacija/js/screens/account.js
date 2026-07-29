// Zaslon: račun. Oblika je razložena v training.js.
// Opomba: aplikacija namenoma nima prijave (glej Claude_kontekst/produkt.md).
// Ta zaslon je zaenkrat prazen; kaj bo v njem, se še odloči.

import { TEXT } from '../besedilo.js';

export default {
  id: 'account',
  route: 'racun',                 // v naslovu ni šumnikov, zato "racun"
  tab: 'A',
  title: TEXT.screens.account,
  accent: '#8b6ad4',

  render() {
    const title = document.createElement('div');
    title.className = 'screen-title';
    title.textContent = this.title;
    return title;
  }
};
