// Sprememba naslova. Ni v routerji, ker bi tam lahko nastal krog odvisnosti
// Ni velika skrb ampak to onemogoči roben pogoj cikla
// Router -> Register -> Zaslon -> Router
// Zdej zaslon uvozi iz tukaj namesto routerja.

export function navigate(route) {
  const target = '#/' + route;
  if (location.hash === target) return;   // brez tega bi klik na isto pot izrisal dvakrat
  location.hash = target;
}
