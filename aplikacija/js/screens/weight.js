// Zaslon: telesna teža. Oblika je razložena v training.js.

import { TEXT } from '../ui.js';

export default {
  id: 'weight',
  route: 'teza',                  // v naslovu ni šumnikov, zato "teza"
  tab: 'W',
  title: TEXT.screens.weight,
  accent: '#2f8fdd',

  render() {
    const title = document.createElement('div');
    title.className = 'screen-title';
    title.textContent = this.title;
    return title;
  }
};
