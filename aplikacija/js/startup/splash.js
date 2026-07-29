// Uvodna animacija ob zagonu aplikacije.
//
// Posnetka sta dva, ker je zaslon telefona pokončen, zaslon računalnika pa ležeč;
// isti posnetek bi bil na enem od njiju obrezan. Kateri se predvaja, se odloči
// tukaj in ne v HTML-u: `<source media="...">` pri videu ne dela zanesljivo,
// medtem ko `<picture>` to zna — zato izbiro naredimo sami.
//
// Prvo pravilo te datoteke: **animacija ne sme nikoli zakleniti aplikacije.**
// Če posnetka ni, če se ga ne da predvajati (varčevanje z baterijo na iPhonu
// samodejno predvajanje ustavi) ali če traja predolgo, se zastor umakne in
// aplikacija dela naprej. Zato so poti do konca štiri: konec posnetka, napaka,
// dotik in časovna varovalka.

const MOBILE = 'media/fitnes_aplikacija_start_mobile.mp4';    // 1080x1920, 3,4 s
const DESKTOP = 'media/fitnes_aplikacija_start_PC.mp4';       // 1920x1080, 5 s

// Varovalka: če se do takrat ni zgodilo nič, gre zastor stran po svoje.
// Daljše od daljšega posnetka (5 s) plus čas za nalaganje, a dovolj kratko, da
// nihče ne obstane pred črnim zaslonom, če gre kaj narobe.
const MAX_WAIT = 9000;

// Kolikor traja prelivanje v CSS (.splash transition). Element se odstrani šele
// potem, sicer bi izginil s poskokom.
const FADE = 350;

// Če se posnetek ne da predvajati, ostane na zaslonu slika logotipa. Toliko časa
// naj se vidi, preden gremo naprej — dovolj, da se njen prelet izteče. Brez tega
// zastor le za trenutek pogleda ven in izgine, kar je videti kot napaka.
const HOLD = 1800;

export function playIntro() {
  const splash = document.getElementById('splash');
  if (!splash) return;                     // brez zastora v HTML-u ni česa igrati

  const video = splash.querySelector('.splash__video');

  let finished = false;
  const finish = () => {
    if (finished) return;                  // vsaka od štirih poti sme priti prva
    finished = true;

    splash.classList.add('is-gone');
    setTimeout(() => splash.remove(), FADE);
  };

  if (!video) return finish();

  // Dotik kjerkoli preskoči animacijo. V telovadnici se aplikacija odpre zato,
  // da se vpiše serija — kdor tega ne mara čakati, gre naprej.
  splash.addEventListener('click', finish);

  // Namesto takojšnjega umika: pokaži sliko logotipa in šele nato naprej.
  const hold = () => setTimeout(finish, HOLD);

  // Posnetek je do tega trenutka prosojen, spodaj se vidi slika. Pokažemo ga
  // šele, ko res teče — sicer iPhone čez sliko nariše svoj gumb za predvajanje.
  video.addEventListener('playing', () => video.classList.add('is-playing'));

  video.addEventListener('ended', finish);
  video.addEventListener('error', hold);
  setTimeout(finish, MAX_WAIT);

  video.src = source();

  // Samodejno predvajanje je lahko zavrnjeno — varčevanje z baterijo na iPhonu
  // ga ustavi tudi pri utišanem posnetku. Takrat obvelja slika logotipa.
  const play = () => {
    const started = video.play();
    if (started && typeof started.catch === 'function') started.catch(hold);
  };

  // Drugi poskus, ko je posnetek naložen: prvi klic je lahko prezgoden, če se
  // datoteka takrat še prenaša.
  video.addEventListener('canplay', () => {
    if (video.paused && !finished) play();
  });

  play();
}

// Pokončen zaslon dobi različico za telefon, ležeč tisto za računalnik.
// Primerjava stranic in ne širine v pikah: tablica in majhno okno na računalniku
// se s tem odločita pravilno, brez seznama naprav.
function source() {
  return window.innerHeight >= window.innerWidth ? MOBILE : DESKTOP;
}
