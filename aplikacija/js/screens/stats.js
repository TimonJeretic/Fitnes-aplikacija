// Zaslon: statistika. Oblika je razložena v training.js.

import { TEXT } from '../ui.js';

export default {
  id: 'stats',
  route: 'statistika',
  tab: 'S',
  title: TEXT.screens.stats,
  accent: '#3fae7a',

  render() {
    const title = document.createElement('div');
    title.className = 'screen-title';
    title.textContent = this.title;
    return title;
  }
};
