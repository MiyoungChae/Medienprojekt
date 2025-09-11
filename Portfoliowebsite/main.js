// alles weich, stabil, mit negativem Text
document.addEventListener('DOMContentLoaded', () => {
  // Wenn die Seite neu geladen wird, sicherstellen, dass wir auf die Start-Section zeigen
  try {
    if (window.location && window.location.hash && window.location.hash !== '#home') {
      // Verhindere zusätzliches History-Eintrag
      history.replaceState(null, '', '#home');
      // sanft scrollen (oder direkt, falls smooth nicht erwünscht)
      const startEl = document.getElementById('home');
      if (startEl) startEl.scrollIntoView({ behavior: 'auto' });
    }
  } catch (e) {
    // ignore
  }
  // sagt: JS ist aktiv
  document.documentElement.classList.add('js');

  // GSAP + Plugin
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  // --- NEGATIV-EFFEKT SICHERN ---
  // Hero darf keine eigene Ebene haben (sonst klappt das Blending nicht)
  const hero = document.querySelector('.startseite');
  if (hero) {
    hero.style.isolation = 'auto';
    hero.style.zIndex = 'auto';
    hero.style.position = hero.style.position || 'relative';
    hero.style.transform = 'none';
    hero.style.opacity = '1';
    hero.style.filter = 'none';
  }
  const wrap = document.querySelector('.start-wrap');
  if (wrap) {
    wrap.style.position = 'relative';
    wrap.style.zIndex = 3;
    wrap.style.color = '#fff';
    wrap.style.mixBlendMode = 'difference';
    wrap.querySelectorAll('*').forEach(n => {
      n.style.color = 'inherit';
      n.style.background = 'transparent';
    });
  }

  // --- SANFTE FADE-UP ANIMATIONEN ---
  const ease = 'power3.out'; // weiche Bewegung
  const Y0 = 28;             // Start von unten
  const START = 'top 80%';   // wann starten (Element bei 80% Sichtbarkeit)

  // mehrere Elemente mit Fade-Up
  const up = (sel, each = 0.08, dur = 1.25) => {
    const list = gsap.utils.toArray(sel);
    list.forEach((el, i) => {
      gsap.fromTo(
        el,
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
            // play on enter, and also play when entering back from above
            toggleActions: 'play none play none'
          }
        }
      );
    });
  };

  // Texte und Karten einblenden
  up('.startseite .reveal2', 0.00, 1.25);   // großer Titel
  up('.startseite .reveal',  0.06, 1.25);   // kleine Zeilen
  up('.about',               0.10, 1.25);   // About-Box
  up('.projects .section-title', 0.00, 0.90); // Projekt-Titel
  up('.project-card',        0.08, 1.50);   // Karten

  // --- FILM: AUTO, RHYTHMUS, KONKAV, DIMM (Auto + Maus-Override) ---
  (function () {
    const strip = document.querySelector('.film-strip');  // sichtbarer Bereich
    const track = document.querySelector('.film-track');  // Reihe mit .film-box
    if (!strip || !track) return;

    // Grund-Boxen (mind. 10) - merken als originals
    let originals = Array.from(track.querySelectorAll('.film-box'));
    if (originals.length === 0) {
      for (let i = 0; i < 10; i++) {
        const b = document.createElement('div');
        b.className = 'film-box';
        track.appendChild(b);
      }
      originals = Array.from(track.querySelectorAll('.film-box'));
    }

    // Reihe auffüllen (für Endlosschleife) - klone nur die originalen Elemente
    const ensureFill = () => {
      let guard = 0;
      while (track.scrollWidth < window.innerWidth * 3 && guard++ < 50) {
        originals.forEach(b => track.appendChild(b.cloneNode(true)));
      }
    };

    // Breite einer Runde berechnen (aktuelle DOM-Elemente berücksichtigen)
    const roundWidth = () => {
      const boxes = Array.from(track.querySelectorAll('.film-box'));
      return boxes.reduce((s, el) => s + el.getBoundingClientRect().width, 0);
    };

    // 3D/“Konkav”-Look
    const depth = 280; // Tiefe
    const tilt  = 26;  // seitliche Drehung
    const minS  = 0.5; // Mitte klein
    const maxS  = 1.0; // Rand groß
    const fade  = 0.15; // Abdunkeln am Rand

    const apply3D = () => {
      const r  = strip.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const all = track.querySelectorAll('.film-box');
      all.forEach(el => {
        const br = el.getBoundingClientRect();
        const bx = br.left + br.width / 2;
        const n  = Math.max(-1, Math.min(1, (bx - cx) / (r.width / 2))); // -1..1
        const a  = Math.abs(n);
        const z  = -depth * (1 - (1 - a) ** 2);
        const ry = -tilt * n;
        const sc = minS + (maxS - minS) * a;
        const op = 1 - Math.max(0, a - 0.7) / 0.3 * fade;
        el.style.transform = `translateZ(${z}px) rotateY(${ry}deg) scale(${sc})`;
        el.style.opacity   = op.toFixed(3);
      });
    };

    // --- Maussteuerung (links=-1, rechts=+1, Mitte=0) ---
    let hoverDir = 0;
    const DEAD_LEFT  = 0.45;
    const DEAD_RIGHT = 0.55;

    const onMove = (e) => {
      const w = window.innerWidth || 1;
      const clientX = (typeof e.clientX === 'number')
        ? e.clientX
        : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      const t = clientX / w; // 0..1
      if (t <= DEAD_LEFT)      hoverDir = -1; // links
      else if (t >= DEAD_RIGHT) hoverDir = +1; // rechts
      else                      hoverDir = 0;  // Mitte
    };

    // nur bei “feinem” Zeiger Mausbewegung nutzen, sonst Touch (optional)
    const fine = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
    if (fine) {
      window.addEventListener('mousemove', onMove, { passive: true });
    } else {
      window.addEventListener('touchmove', onMove, { passive: true });
    }

    // Geschwindigkeit & Rhythmus (Auto)
    let baseSpeed = 500;   // px/s – höher = schneller
    const amp1 = 0.75;     // große Welle
    const amp2 = 0.22;     // kleine Welle
    const f1   = 0.40;     // Frequenz 1
    const f2   = 0.55;     // Frequenz 2
  const holdMs = 10;     // kurze Pause an “Bildkanten" (verringert die Pause zwischen Sprüngen)

    // Laufwerte
    let x = 0;                    // Position
    let W = 0;                    // Breite einer Runde
    let last = performance.now(); // letzte Zeitmarke
    let boxW = 0;                 // Breite eines Bildes
    let holdUntil = 0;            // Pausen-Ende

    // Richtung (Standard = +1 → Auto vorwärts)
    let dir = 1;

    // Start erst nach Layout (2× RAF → Maße stabil)
    const afterLayout = (fn) =>
      requestAnimationFrame(() => requestAnimationFrame(fn));

    afterLayout(() => {
      ensureFill();

      // erste Maße
      const first = track.querySelector('.film-box');
      boxW = first ? first.getBoundingClientRect().width : 0;
      W    = roundWidth();
      x    = 0;

      track.style.transform = 'translate3d(0,0,0)';
      apply3D();

      // Endlosschleife
      const loop = (now) => {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;

        // Richtung aus Maus ableiten (neutral → Standard +1)
        dir = (hoverDir === 0) ? 1 : hoverDir;

        // falls Maße noch fehlen → nachholen
        if (!W || !boxW) {
          const f = track.querySelector('.film-box');
          boxW = f ? f.getBoundingClientRect().width : 0;
          W    = roundWidth();
        }

        // wenn Pause aktiv → nur halten
        if (now < holdUntil) {
          const cur = ((x % W) + W) % W;
          track.style.transform = `translate3d(${-cur}px,0,0)`;
          apply3D();
          requestAnimationFrame(loop);
          return;
        }

        // Rhythmus-Wellen (sanftes Beschleunigen/Abbremsen)
        const s     = now / 1000;
        const rWave = 1
          + amp1 * Math.sin(2 * Math.PI * f1 * s)
          + amp2 * Math.sin(2 * Math.PI * f2 * s + Math.PI / 3);

        // weiter bewegen (mit Richtung)
        x += baseSpeed * rWave * dt * dir;

        // Bildkanten-Schnapp je nach Richtung
        if (boxW > 0) {
          if (dir > 0) {
            const target = (Math.floor(x / boxW) + 1) * boxW;
            if (x >= target) { x = target; holdUntil = now + holdMs; }
          } else if (dir < 0) {
            const target = (Math.ceil(x / boxW) - 1) * boxW;
            if (x <= target) { x = target; holdUntil = now + holdMs; }
          }
        }

        // modulo für Endlosschleife
        const mod = ((x % W) + W) % W;
        track.style.transform = `translate3d(${-mod}px,0,0)`;
        apply3D();

        requestAnimationFrame(loop);
      };

      requestAnimationFrame(loop);
    });

    // Menü: auf/zu (nur Mobile, Desktop bleibt gleich)
const siteHeader = document.querySelector('.site-nav');   // <header class="site-nav">
const toggleBtn  = document.querySelector('.nav-toggle'); // Hamburger-Button
const mainMenu   = document.getElementById('main-menu');  // <ul id="main-menu">

if (siteHeader && toggleBtn && mainMenu) {
  toggleBtn.addEventListener('click', () => {
    const open = siteHeader.classList.toggle('open');  // .site-nav.open toggeln
    toggleBtn.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('no-scroll', open); // Scroll sperren bei offen
  });

  // Menü schließen beim Link-Klick
  mainMenu.addEventListener('click', (e) => {
    if (e.target.closest('a')) {
      siteHeader.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('no-scroll');
    }
  });

  // (optional) ESC zum Schließen
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      siteHeader.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('no-scroll');
    }
  });
}


    // Dim-Effekt beim Scroll (unverändert, stört ScrollTrigger nicht)
    const onScroll = () => {
      const rect = hero ? hero.getBoundingClientRect() : null;
      if (!rect) return;
      if (rect.bottom <= 0) {
        document.body.classList.add('film-dim');
      } else {
        document.body.classList.remove('film-dim');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // neu berechnen bei Größenänderung
    window.addEventListener('resize', () => {
      afterLayout(() => {
        ensureFill();
        const f = track.querySelector('.film-box');
        boxW = f ? f.getBoundingClientRect().width : 0;
        W    = roundWidth();
        apply3D();
        // Falls ScrollTrigger/GSAP Animationen vorhanden sind, neu berechnen
        if (window.ScrollTrigger && typeof window.ScrollTrigger.refresh === 'function') {
          // refresh nach Layout-Änderung, damit ScrollTrigger seine Trigger neu berechnet
          window.ScrollTrigger.refresh();
        }
      });
    }, { passive: true });
  })();

}); // DOMContentLoaded Ende
