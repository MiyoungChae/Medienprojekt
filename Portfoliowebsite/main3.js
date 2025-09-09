document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.classList.add('js'); // sagt: JS ist aktiv

  // GSAP laden
  if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger); // Plugin an

  // sanfte Werte
  const ease = 'power3.out'; // weich
  const Y0 = 28; // start unten
  const START = 'top 85%'; // wann starten

  // Fade-Up für viele
  const up = (sel, each = 0.08, dur = 0.95) => {
    const list = gsap.utils.toArray(sel); // alle Elemente
    list.forEach((el, i) => {
      gsap.fromTo(el,
        { y: Y0, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: dur,
          ease,
          delay: i * each,
          scrollTrigger: {
            trigger: el,
            start: START,
            toggleActions: 'play none none reverse'
          }
        }
      );
    });
  };

  // Texte und Karten sichtbar machen
  up('.startseite .reveal2', 0.00, 1.05); // großer Titel
  up('.startseite .reveal',  0.06, 0.95); // kleine Zeilen
  up('.about-panel',         0.10, 0.95); // about box
  up('.projects .section-title', 0.00, 0.90); // proj titel
  up('.project-card',        0.08, 1.00); // karten

  // ===== Film: Auto mit Rhythmus, konkav, dim beim Scroll =====
  (function () {
    const strip = document.querySelector('.film-strip'); // film container
    const track = document.querySelector('.film-track'); // reihe
    if (!strip || !track) return; // sicher

    // boxen prüfen oder bauen
    let base = Array.from(track.querySelectorAll('.film-box')); // original
    if (base.length === 0) {
      for (let i = 0; i < 10; i++) {
        const b = document.createElement('div');
        b.className = 'film-box';
        track.appendChild(b);
      }
      base = Array.from(track.querySelectorAll('.film-box'));
    }

    // nach Layout starten
    const afterLayout = (fn) => requestAnimationFrame(() => requestAnimationFrame(fn)); // sicher

    // genug klone für endlos
    const ensureFill = () => {
      let guard = 0;
      while (track.scrollWidth < window.innerWidth * 3 && guard++ < 50) {
        base.forEach(b => track.appendChild(b.cloneNode(true)));
      }
    };

    // rundenbreite
    const roundWidth = () => base.reduce((s, el) => s + el.offsetWidth, 0); // summe

    // 3D form
    const depth = 280; // tiefe
    const tilt  = 26;  // drehung
    const minS  = 0.5; // mitte klein
    const maxS  = 1.0; // rand groß
    const fade  = 0.15; // abdunkeln

    const apply3D = () => {
      const r = strip.getBoundingClientRect(); // sicht
      const cx = r.left + r.width / 2; // mitte
      const all = track.querySelectorAll('.film-box'); // alle
      all.forEach(el => {
        const br = el.getBoundingClientRect(); // box
        const bx = br.left + br.width / 2; // mitte
        const n = Math.max(-1, Math.min(1, (bx - cx) / (r.width / 2))); // norm -1..1
        const a = Math.abs(n); // abstand
        const z = -depth * (1 - (1 - a) ** 2); // z
        const ry = -tilt * n; // rotate
        const sc = minS + (maxS - minS) * a; // scale
        const op = 1 - Math.max(0, a - 0.7) / 0.3 * fade; // licht
        el.style.transform = `translateZ(${z}px) rotateY(${ry}deg) scale(${sc})`; // set
        el.style.opacity = op.toFixed(3); // set
      });
    };

    // rhythmus: wie blättern
    const baseSpeed = 520; // grundtempo px/s
    const amp1 = 0.85; // starke welle
    const amp2 = 0.35; // kleine welle
    const f1 = 0.40; // frequenz 1
    const f2 = 0.45; // frequenz 2
    let t0 = performance.now(); // startzeit
    let x = 0; // position
    let W = 0; // runde

    const loop = (now) => {
      if (!W) { W = roundWidth(); if (!W) return requestAnimationFrame(loop); } // warte
      const s = (now - t0) / 1000; // sekunden
      const r = 1 + amp1 * Math.sin(2 * Math.PI * f1 * s) + amp2 * Math.sin(2 * Math.PI * f2 * s + Math.PI / 3); // rhythmus
      const dt = 1 / 60; // frame zeit
      x += baseSpeed * r * dt; // vorwärts
      const mod = ((x % W) + W) % W; // modulo
      track.style.transform = `translate3d(${-mod}px,0,0)`; // bewegen
      apply3D(); // form neu
      requestAnimationFrame(loop); // weiter
    };

    afterLayout(() => {
      ensureFill(); // lange spur
      W = roundWidth(); // breite
      track.style.transform = 'translate3d(0,0,0)'; // null
      apply3D(); // form
      requestAnimationFrame(loop); // start
    });

    // dim an/aus beim scroll
    const hero = document.querySelector('.startseite'); // hero
    const onScroll = () => {
      if (!hero) return;
      const r = hero.getBoundingClientRect(); // sichtbereich
      if (r.bottom <= 0) document.body.classList.add('film-dim'); else document.body.classList.remove('film-dim'); // dim
    };
    window.addEventListener('scroll', onScroll, { passive: true }); // hören
    onScroll(); // einmal
    window.addEventListener('resize', () => { // neu rechnen
      requestAnimationFrame(() => requestAnimationFrame(() => { ensureFill(); W = roundWidth(); apply3D(); }));
    }, { passive: true });
  })();
});
