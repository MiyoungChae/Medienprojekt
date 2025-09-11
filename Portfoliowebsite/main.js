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

  // set CSS var --nav-height so components (like .about::before) can avoid overlapping header
  const setNavHeightVar = () => {
    const header = document.querySelector('.site-nav');
    const h = header ? header.getBoundingClientRect().height : 0;
    document.documentElement.style.setProperty('--nav-height', `${Math.ceil(h)}px`);
  };
  setNavHeightVar();
  window.addEventListener('resize', () => setNavHeightVar(), { passive: true });

  // dim underlying content when About section becomes active (focus-out effect)
  const aboutSection = document.querySelector('.about');
  if (aboutSection) {
  // progress-driven dim: 0..maxAlpha based on how much About has entered the viewport under the nav
  // reduce final darkness (more transparent overall) and make the ramp faster early on
  const maxAlpha = 0.25; // final semi-transparent alpha (lighter)
    // New behavior: start dimming as soon as any part of About enters the viewport.
    // The overlay will only cover the visible portion of .about (so Projects remain unaffected),
    // and will always sit beneath the About content (z-index controlled in CSS).
    const updateAboutDim = () => {
      const rect = aboutSection.getBoundingClientRect();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 0;

      // compute visible region of the About section inside the viewport
      const visibleTop = Math.max(rect.top, 0);
      const visibleBottom = Math.min(rect.bottom, window.innerHeight);
      const visibleH = Math.max(0, visibleBottom - visibleTop);
      const totalH = rect.height || 1;

      if (visibleH <= 0) {
        // About not visible: clear overlay (only dim var needed; overlay is in .about::after)
        document.documentElement.style.setProperty('--about-dim', '0');
        document.body.classList.remove('about-active');
        return;
      }

  // compute the About frame bounds (frame is positioned inside .about at top = navH)
  const frameTop = rect.top + navH;
  const frameHeight = Math.max(0, rect.height - navH);
  const frameBottom = frameTop + frameHeight;
  // overlay should be intersection of frame bounds and viewport so it never covers Projects
  const overlayTop = Math.max(frameTop, 0);
  const overlayBottom = Math.min(frameBottom, window.innerHeight);
  const overlayHeight = Math.max(0, overlayBottom - overlayTop);

  // progress from 0..1 based on how much of About is visible
  // start dimming immediately when any part is visible; use exponent to speed initial ramp
  const visibleRatio = Math.max(0, Math.min(1, visibleH / totalH));
  const exponent = 0.6; // keeps the quicker initial ramp
  const progress = Math.pow(visibleRatio, exponent);
  const alpha = progress * maxAlpha;

  document.documentElement.style.setProperty('--about-dim', String(alpha));
  document.body.classList.toggle('about-active', alpha > 0);
    };
    window.addEventListener('scroll', updateAboutDim, { passive: true });
    window.addEventListener('resize', updateAboutDim, { passive: true });
    // initial check
    setTimeout(updateAboutDim, 50);
  }

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
    // We also compute the width of the original set so we can cycle strictly over originals
    const roundWidth = () => {
      const boxes = Array.from(track.querySelectorAll('.film-box'));
      return boxes.reduce((s, el) => s + el.getBoundingClientRect().width, 0);
    };
    const originalsWidth = () => originals.reduce((s, el) => s + el.getBoundingClientRect().width, 0);

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
  const holdMs = 3000;     // kurze Pause an “Bildkanten" (3 Sekunden)

    // Laufwerte
    let x = 0;                    // Position
    let W = 0;                    // Breite einer Runde
  let last = performance.now(); // letzte Zeitmarke
    let boxW = 0;                 // Breite eines Bildes
    let holdUntil = 0;            // Pausen-Ende
  // RAF handle and loop reference so we can restart on resize
  let rafId = 0;
  let loop = null;

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
  // width of only the originals (the intended cycle length)
  const Worig = originalsWidth();
  // if originals have zero width yet, fallback to full W
  track.dataset.originalsWidth = Worig || W;
      x    = 0;

      track.style.transform = 'translate3d(0,0,0)';
      apply3D();

  // Endlosschleife
  loop = (now) => {
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
          const WorigNow = parseFloat(track.dataset.originalsWidth) || W;
          const cur = ((x % WorigNow) + WorigNow) % WorigNow;
          track.style.transform = `translate3d(${-cur}px,0,0)`;
          apply3D();
          rafId = requestAnimationFrame(loop);
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

  // Use the originals' width for modulo so we cycle over the original set
  const WorigNow = parseFloat(track.dataset.originalsWidth) || W;
  const mod = ((x % WorigNow) + WorigNow) % WorigNow;
  track.style.transform = `translate3d(${-mod}px,0,0)`;
        apply3D();

        rafId = requestAnimationFrame(loop);
      };

      rafId = requestAnimationFrame(loop);
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

// NAV PREVIEW: pointer + touch handling (small, robust)
(function () {
  const items = document.querySelectorAll('.nav-menu li');
  if (!items || items.length === 0) return;

  // pointer devices: show on pointerenter/leave
  items.forEach(li => {
    li.addEventListener('pointerenter', () => li.classList.add('hovering'));
    li.addEventListener('pointerleave', () => li.classList.remove('hovering'));
  });

  // touch devices: two-tap pattern — first tap shows preview, second tap follows link
  let lastTapItem = null;
  items.forEach(li => {
    li.addEventListener('touchstart', (ev) => {
      // only when menu overlay open
      if (!siteHeader.classList.contains('open')) return;
      const now = Date.now();
      // if same item tapped within short time and already hovering -> allow navigation
      if (lastTapItem === li && li.classList.contains('hovering')) {
        // allow default behavior (link click)
        lastTapItem = null;
        return;
      }
      // otherwise show preview and prevent immediate navigation
      ev.preventDefault();
      items.forEach(i => i.classList.remove('hovering'));
      li.classList.add('hovering');
      lastTapItem = li;
      // hide preview after short timeout if user does nothing
      setTimeout(() => {
        if (lastTapItem === li) {
          li.classList.remove('hovering');
          lastTapItem = null;
        }
      }, 2200);
    }, { passive: false });
  });

  // clicking outside or closing menu clears hovering
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-menu')) {
      items.forEach(i => i.classList.remove('hovering'));
      lastTapItem = null;
    }
  });
})();

// FLOATING PREVIEW: position .nav-preview as fixed overlay next to menu item
(function () {
  const menu = document.getElementById('main-menu');
  if (!menu) return;
  const previews = menu.querySelectorAll('.nav-preview');

  const clearFloating = () => previews.forEach(p => { p.classList.remove('floating','visible'); p.style.left=''; p.style.top=''; });

  menu.addEventListener('pointerenter', (e) => {
    const li = e.target.closest('li');
    if (!li) return;
    const preview = li.querySelector('.nav-preview');
    if (!preview) return;
    // compute position: align vertically to li center, place to the right of menu column
    const rect = li.getBoundingClientRect();
    const px = window.innerWidth - rect.left + 12; // place near right side of li
    const top = rect.top + rect.height/2;
    preview.classList.add('floating','visible');
    preview.style.left = (rect.left - preview.offsetWidth - 36) + 'px';
    preview.style.top = (top - preview.offsetHeight/2) + 'px';
    // hide other previews
    previews.forEach(p => { if (p !== preview) p.classList.remove('floating','visible'); });
  }, true);

  menu.addEventListener('pointerleave', (e) => {
    clearFloating();
  }, true);

  // keep previews cleared when menu closes
  const header = document.querySelector('.site-nav');
  const obs = new MutationObserver(() => { if (!header.classList.contains('open')) clearFloating(); });
  obs.observe(header, { attributes: true, attributeFilter:['class'] });
})();


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
  // recompute originals width
  const Worig = originalsWidth();
  track.dataset.originalsWidth = Worig || W;
        apply3D();
  // reset timing and restart RAF to avoid large dt/freezing after resize
  last = performance.now();
  if (typeof rafId === 'number' && rafId) cancelAnimationFrame(rafId);
  if (typeof loop === 'function') rafId = requestAnimationFrame(loop);
        // Falls ScrollTrigger/GSAP Animationen vorhanden sind, neu berechnen
        if (window.ScrollTrigger && typeof window.ScrollTrigger.refresh === 'function') {
          // refresh nach Layout-Änderung, damit ScrollTrigger seine Trigger neu berechnet
          window.ScrollTrigger.refresh();
        }
      });
    }, { passive: true });
  })();

}); // DOMContentLoaded Ende
