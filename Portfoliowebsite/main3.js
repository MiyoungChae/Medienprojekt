// main3.js (nur Hero + globales Neon-Licht; keine Boxen)
document.addEventListener('DOMContentLoaded', () => {
  if (!window.gsap) return;

  // --- Hero-Texte weich einblenden ---
  const wrap  = document.querySelector('.start-wrap');                  // Bereich mit Titeln
  const items = wrap ? wrap.querySelectorAll('h1.reveal, h1.reveal2') : null; // alle Titel
  if (wrap && items && items.length) {
    gsap.set(wrap,  { y: 64, opacity: 0, force3D: true, willChange: 'transform,opacity' });
    gsap.set(items, { y: 36, opacity: 0, skewY: 4,  force3D: true, willChange: 'transform,opacity' });

    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    tl.to(wrap,  { y: 0, opacity: 1, duration: 3.0, ease: 'power3.out' }, 0); // deine 3.0s beibehalten
    tl.to(items, { y: 0, opacity: 1, skewY: 0, duration: 0.6, stagger: { each: 0.12 } }, 0.12);
  }

  // --- Globales Neon-Licht folgt der Maus (über die ganze Seite) ---
  // Element dynamisch erzeugen (kein HTML ändern nötig)
  const glow = document.createElement('div');
  glow.id = 'cursorGlow';
  document.body.appendChild(glow);

  let gx = 0, gy = 0, ticking = false;

  const move = (e) => {
    gx = e.clientX; gy = e.clientY;
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => {
        glow.style.left = gx + 'px';
        glow.style.top  = gy + 'px';
        ticking = false;
      });
    }
    glow.style.opacity = '1';
  };

  const leave = () => { glow.style.opacity = '0'; };

  window.addEventListener('mousemove', move);
  window.addEventListener('mouseleave', leave);

  // Touch (optional)
  window.addEventListener('touchmove', (e) => {
    const t = e.touches && e.touches[0];
    if (!t) return;
    glow.style.left = t.clientX + 'px';
    glow.style.top  = t.clientY + 'px';
    glow.style.opacity = '1';
  }, { passive: true });
  window.addEventListener('touchend', leave);
});
