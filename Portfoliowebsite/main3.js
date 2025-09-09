document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.classList.add('js'); // Klasse "js" setzen

  // === Film ===
  (function () {
    const strip = document.querySelector('.film-strip'); // Rahmen
    const track = document.querySelector('.film-track'); // Reihe
    if (!strip || !track) return;

    // Boxen holen oder neue machen
    let boxes = Array.from(track.querySelectorAll('.film-box'));
    if (boxes.length === 0) {
      for (let i = 0; i < 10; i++) {
        const b = document.createElement('div');
        b.className = 'film-box';
        track.appendChild(b);
      }
      boxes = Array.from(track.querySelectorAll('.film-box'));
    }

    // nach Layout starten
    const afterLayout = (fn) => requestAnimationFrame(() => requestAnimationFrame(fn));

    // genug Klone, damit endlos läuft
    const ensureFill = () => {
      let guard = 0;
      while (track.scrollWidth < window.innerWidth * 3 && guard++ < 50) {
        boxes.forEach(b => track.appendChild(b.cloneNode(true)));
      }
    };

    // Breite einer Runde
    const roundWidth = () => boxes.reduce((s, el) => s + el.offsetWidth, 0);

    // 3D Effekt (konkav)
    const depth = 280;   // Tiefe
    const tilt  = 26;    // Drehung
    const minS  = 0.5;   // Mitte klein
    const maxS  = 1.0;   // Rand groß
    const fade  = 0.15;  // Abdunkeln am Rand

    const apply3D = () => {
      const r = strip.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const all = track.querySelectorAll('.film-box');
      all.forEach(el => {
        const br = el.getBoundingClientRect();
        const bx = br.left + br.width / 2;
        const n = Math.max(-1, Math.min(1, (bx - cx) / (r.width / 2)));
        const a = Math.abs(n);
        const z = -depth * (1 - (1 - a) ** 2);
        const ry = -tilt * n;
        const sc = minS + (maxS - minS) * a;
        const op = 1 - Math.max(0, a - 0.7) / 0.3 * fade;
        el.style.transform = `translateZ(${z}px) rotateY(${ry}deg) scale(${sc})`;
        el.style.opacity = op.toFixed(3);
      });
    };

    // automatische Bewegung
    let x = 0;
    let last = 0;
    let W = 0;
    const speed = 140; // Pixel pro Sekunde

    const loop = (ts) => {
      if (!last) last = ts;
      const dt = Math.min(0.05, (ts - last) / 1000);
      last = ts;

      if (W <= 0) {
        W = roundWidth();
        if (W <= 0) return requestAnimationFrame(loop);
      }

      x += speed * dt;
      const mod = ((x % W) + W) % W;
      track.style.transform = `translate3d(${-mod}px,0,0)`;
      apply3D();

      requestAnimationFrame(loop);
    };

    afterLayout(() => {
      ensureFill();
      W = roundWidth();
      track.style.transform = 'translate3d(0,0,0)';
      apply3D();
      requestAnimationFrame(loop);
    });

    // dim ein/aus mit Scroll
    const hero = document.querySelector('.startseite');
    const onScroll = () => {
      if (!hero) return;
      const r = hero.getBoundingClientRect();
      if (r.bottom <= 0) document.body.classList.add('film-dim');
      else document.body.classList.remove('film-dim');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  })();
});
