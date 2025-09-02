/* ============================================================
   FIRELIES — CLUSTER UM DEN MAUSZEIGER (mit sanftem Fluss)
   ------------------------------------------------------------
   Kurz erklärt (auf Deutsch, einfach):
   - Wir zeichnen Leuchtpunkte (Fireflies) auf ein <canvas>.
   - Sie bewegen sich automatisch (leichtes Treiben) und blinken.
   - Die 5 nächsten Punkte folgen einem "Trail" (Spur) der Maus.
   - Sie sammeln sich um die Maus (Cluster), aber überlappen nicht.
   - Mehrere Farben (Palette) für einen lebendigen Look.

   STRUKTUR-ÜBERSICHT:
   1) Setup (Canvas, Größen, Optionen)
   2) Utils (Zufall, Lerp, Clamp …)
   3) Pointer & Trail (Mausposition + Spur)
   4) Klasse Firefly (Zustand, Bewegung, Zeichnen)
   5) Kräfte / Logik (Anker-Spring, Zentrum, Separation)
   6) Loop (Update + Render)
   ============================================================ */

(() => {
  "use strict";

  /* ========== 1) SETUP ========== */
  const canvas = document.getElementById('ff');
  const ctx = canvas.getContext('2d', { alpha: true });
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  let W = 0, H = 0;

  const isMobile = Math.min(window.innerWidth, window.innerHeight) < 768;
  const COUNT = parseInt(css('--count-mobile', '--count-desktop'));
  const WRAP_M = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--wrap-margin'));

  // Mehrfarbige Palette (Glow-Farbe; Kern bleibt weiß)
  // Einfach formuliert: bunte, helle Ränder – weißes Zentrum
  const PALETTE = [
    { h:195, s:90, l:64 }, // Cyan
    { h:205, s:85, l:65 }, // Himmelblau
    { h:285, s:90, l:62 }, // Violett
    { h:295, s:92, l:64 }, // Magenta-Violett
    { h:105, s:96, l:60 }, // Lime
    { h: 55, s:95, l:60 }, // Gelb
    { h: 15, s:90, l:62 }, // Koralle
    { h:335, s:90, l:62 }, // Pink
  ];

  /* Basis-Tempo und Tiefenwirkung */
  const BASE_SPEED   = 300;   // Grundtempo der freien Bewegung
  const WIGGLE_AMT   = 0.04;  // kleines "Wabern" pro Partikel
  const Z_SPEED_MIN  = -0.03, Z_SPEED_MAX = 0.05;

  const Z_NEAR_SCALE = 2.70, Z_FAR_SCALE = 0.45;  // Größenfaktor nah/fern
  const ALPHA_NEAR   = 0.9, ALPHA_FAR   = 0.35; // Transparenz nah/fern

  /* Glow (Lichtschein) */
  const BLOOM1 = 1.0, BLOOM2 = 4.5, SHADOW_FACTOR = 1.2;

  /* Cluster-Follow (um die Maus) */
  const FOLLOW_COUNT = 5;

  // Maus-Trail (Spur) → weicher, "magischer" Fluss
  const TRAIL_LEN    = 56;
  const LAG_STEPS    = [ 0, 5, 10, 15, 20 ];   // kleine Verzögerung je Partikel
  const RING_RADII   = [ 18, 24, 30, 36, 42 ]; // kleine Radien → dicht an der Maus
  const ANGLE_OFFSETS= [ 0.00, 0.6, -0.6, 1.2, -1.2 ]; // Winkel auf dem kleinen Kreis

  // Sanfte Feder (Spring-PD) zum Anker
  const SPRING_K = 28.0;  // Federstärke
  const SPRING_D = 22.0;  // Dämpfung (macht es weich)

  // Leichter Fluss in Tangentenrichtung der Spur
  const TANGENTIAL = 1100;

  // Zusätzliche Anziehung zur Spur-Mitte (Mausnähe)
  const ATTR_CENTER = 2200;     // wie stark zum Zentrum
  const CENTER_FALLOFF = 0.004; // je größer, desto schneller fällt es mit Distanz ab

  // Wenn weit weg → kurzer "Schnapp"-Boost
  const SNAP_DIST  = 160;
  const SNAP_BOOST = 3200;

  // Separation (nur ganz nah, um Überlappung zu vermeiden)
  const SEP_RADIUS   = 16;
  const SEP_STRENGTH = 1200;

  // Sicherheit: Maximalwerte
  const MAX_ACCEL  = 20000;
  const MAX_SPEED  = 2400;
  const TURN_LIMIT = 14000;

  // Nur fürs Rendering leicht glätten (die Logik nutzt "raw" Maus)
  const MOUSE_LERP = 0.55;

  /* ========== 2) UTILS ========== */
  function css(mobileVar, desktopVar){
    const root = getComputedStyle(document.documentElement);
    return isMobile ? root.getPropertyValue(mobileVar).trim()
                    : root.getPropertyValue(desktopVar).trim();
  }
  const rand=(a,b)=>Math.random()*(b-a)+a;
  const randInt=(a,b)=>Math.floor(rand(a,b+1));
  const lerp=(a,b,t)=>a+(b-a)*t;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

  function resize(){
    W = Math.max(document.documentElement.clientWidth, window.innerWidth||0);
    H = Math.max(document.documentElement.clientHeight, window.innerHeight||0);
    canvas.width  = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    ctx.setTransform(DPR,0,0,DPR,0,0);
  }
  resize();
  let rT; window.addEventListener('resize', ()=>{ clearTimeout(rT); rT=setTimeout(resize,120); });

  /* ========== 3) POINTER & TRAIL ========== */
  // mouse.rawX/Y = echte Mausposition (ohne Verzögerung)
  // mouse.x/y    = leicht geglättet (nur fürs Zeichnen schön)
  const mouse = { rawX: W/2, rawY: H/2, x: W/2, y: H/2, has:false };

  // Spur der letzten Positionen (für Fluss & Richtung)
  const trail = []; // Array von {x,y}
  function pushTrail(x,y){
    trail.push({x,y});
    if(trail.length > TRAIL_LEN) trail.shift();
  }
  // Anfang: Spur vorfüllen, damit am Start nicht "leer" ist
  for(let i=0;i<TRAIL_LEN;i++) pushTrail(mouse.rawX, mouse.rawY);

  // Pointer-Events (funktioniert für Maus, Touch, Stift)
  window.addEventListener('pointermove', e => {
    mouse.rawX = e.clientX; mouse.rawY = e.clientY; mouse.has = true;
  }, {passive:true});
  window.addEventListener('mouseenter', e => {
    mouse.rawX = e.clientX; mouse.rawY = e.clientY; mouse.has = true;
  });

  /* ========== 4) KLASSE: FIREFLY ========== */
  class Firefly{
    constructor(){ this.reset(true); }
    reset(atRandom=false){
      this.x = atRandom ? rand(-WRAP_M, W+WRAP_M) : (Math.random()<.5 ? -WRAP_M : W+WRAP_M);
      this.y = atRandom ? rand(-WRAP_M, H+WRAP_M) : rand(-WRAP_M, H+WRAP_M);
      this.z = Math.random();                          // Tiefe (0..1)
      this.vz = rand(Z_SPEED_MIN, Z_SPEED_MAX);        // Tiefen-Geschwindigkeit

      const root = getComputedStyle(document.documentElement);
      const minS = parseFloat(root.getPropertyValue('--min-size'));
      const maxS = parseFloat(root.getPropertyValue('--max-size'));
      this.baseSize = rand(minS, maxS);

      const c = PALETTE[randInt(0, PALETTE.length-1)];
      this.h=c.h; this.s=c.s; this.l=c.l;             // Glow-Farbe

      const ang = rand(0, Math.PI*2);
      const speed = BASE_SPEED * (0.85 + 0.5*(1 - this.z));
      this.vx = Math.cos(ang)*speed;
      this.vy = Math.sin(ang)*speed;

      // leichtes Wabern
      this.wx = rand(0, Math.PI*2);
      this.wy = rand(0, Math.PI*2);
      this.wsx = rand(0.4, 0.9);
      this.wsy = rand(0.4, 0.9);

      this.friction   = rand(0.985, 0.995);           // sanftes Abklingen
      this.flicker    = rand(0, Math.PI*2);           // Blinken (Phase)
      this.flickerSpd = rand(1.5, 3.0);               // Blinken (Tempo)
    }
    step(dt){
      // Tiefe aktualisieren (vor/zurück)
      this.z += this.vz * dt;
      if(this.z<0){ this.z=0; this.vz = Math.abs(this.vz); }
      else if(this.z>1){ this.z=1; this.vz = -Math.abs(this.vz); }

      // kleines Wabern
      this.wx += this.wsx*dt;
      this.wy += this.wsy*dt;
      this.vx += Math.cos(this.wx) * (WIGGLE_AMT * this.baseSize);
      this.vy += Math.sin(this.wy) * (WIGGLE_AMT * this.baseSize);

      // Begrenzung & Dämpfung
      const sp = Math.hypot(this.vx,this.vy);
      if(sp > MAX_SPEED){ const k = MAX_SPEED/sp; this.vx*=k; this.vy*=k; }
      this.vx *= this.friction; this.vy *= this.friction;

      // Bewegung (nah = etwas schneller)
      const zScale = 0.85 + 0.5*(1 - this.z);
      this.x += this.vx * zScale * dt;
      this.y += this.vy * zScale * dt;

      // "Wrap" am Rand
      if(this.x < -WRAP_M) this.x = W + WRAP_M; else if(this.x > W + WRAP_M) this.x = -WRAP_M;
      if(this.y < -WRAP_M) this.y = H + WRAP_M; else if(this.y > H + WRAP_M) this.y = -WRAP_M;

      // Blinken fortsetzen
      this.flicker += this.flickerSpd * dt;
    }
    draw(ctx){
      // Größe/Alpha je nach Tiefe
      const scale = Z_FAR_SCALE + (Z_NEAR_SCALE - Z_FAR_SCALE) * (1 - this.z);
      const size  = this.baseSize * scale;
      const alpha = ALPHA_FAR + (ALPHA_NEAR - ALPHA_FAR) * (1 - this.z);

      // sanftes Flackern
      const flick = 0.85 + 0.25 * (0.5 + 0.5 * Math.sin(this.flicker));
      const a = alpha * flick;

      ctx.save();
      ctx.globalCompositeOperation = 'lighter'; // Licht addieren

      // Kern (weiß + leichte farbige Kante)
      ctx.shadowBlur  = size * SHADOW_FACTOR;
      ctx.shadowColor = `hsla(${this.h} ${this.s}% ${this.l}% / ${a})`;

      const g0 = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, size*0.9);
      g0.addColorStop(0.0, `hsla(0 0% 100% / ${a})`); // Weiß im Kern
      g0.addColorStop(0.35, `hsla(${this.h} ${this.s}% ${this.l}% / ${a*0.85})`);
      g0.addColorStop(1.0, `hsla(${this.h} ${this.s}% ${this.l}% / 0)`);
      ctx.fillStyle = g0;
      ctx.beginPath(); ctx.arc(this.x, this.y, size, 0, Math.PI*2); ctx.fill();

      // weicher äußerer Glow (zwei Ringe)
      const r1 = size * BLOOM1;
      const g1 = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, r1);
      g1.addColorStop(0.0, `hsla(${this.h} ${this.s}% ${this.l}% / ${a*0.25})`);
      g1.addColorStop(1.0, `hsla(${this.h} ${this.s}% ${this.l}% / 0)`);
      ctx.fillStyle = g1; ctx.beginPath(); ctx.arc(this.x, this.y, r1, 0, Math.PI*2); ctx.fill();

      const r2 = size * BLOOM2;
      const g2 = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, r2);
      g2.addColorStop(0.0, `hsla(${this.h} ${this.s}% ${this.l}% / ${a*0.12})`);
      g2.addColorStop(1.0, `hsla(${this.h} ${this.s}% ${this.l}% / 0)`);
      ctx.fillStyle = g2; ctx.beginPath(); ctx.arc(this.x, this.y, r2, 0, Math.PI*2); ctx.fill();

      ctx.restore();
    }
  }

  // Partikel erzeugen
  let flies = new Array(COUNT).fill(0).map(()=>new Firefly());

  /* ========== 5) KRÄFTE / LOGIK ========== */

  // Punkt der Spur mit Verzögerung (lag) holen
  function getTrailPointByLag(lag){
    const idx = clamp(trail.length - 1 - lag, 0, trail.length - 1);
    return trail[idx] || {x: mouse.rawX, y: mouse.rawY};
  }
  // Tangentenrichtung der Spur (für "Fluss")
  function getTrailTangent(lag){
    const i2 = clamp(trail.length - 1 - lag, 1, trail.length - 1);
    const i1 = clamp(i2 - 4, 0, trail.length - 1);
    const a = trail[i1] || {x: mouse.rawX, y: mouse.rawY};
    const b = trail[i2] || {x: mouse.rawX, y: mouse.rawY};
    let tx = b.x - a.x, ty = b.y - a.y;
    const len = Math.hypot(tx,ty) || 1;
    return { x: tx/len, y: ty/len }; // Einheitsvektor
  }

  // leichte Anziehung zum Spur-Zentrum (damit sie sich "sammeln")
  function attractToCenter(f, c, dt){
    const dx = c.x - f.x, dy = c.y - f.y;
    const d  = Math.hypot(dx,dy) || 1;
    let s = ATTR_CENTER * (1 / (1 + d * CENTER_FALLOFF));
    let ax = (dx / d) * s;
    let ay = (dy / d) * s;
    // begrenzen
    let amag = Math.hypot(ax, ay);
    if(amag > TURN_LIMIT){ const k = TURN_LIMIT / amag; ax*=k; ay*=k; }
    if(amag > MAX_ACCEL){ const k = MAX_ACCEL / amag; ax*=k; ay*=k; }
    f.vx += ax * dt; f.vy += ay * dt;
  }

  // Hauptlogik für die 5 Folger (Cluster + Fluss)
  function applyClusterFlow(followers, dt){
    followers.forEach((f, idx) => {
      const lag = LAG_STEPS[idx % LAG_STEPS.length] | 0;
      const R   = RING_RADII[idx % RING_RADII.length];
      const phi = ANGLE_OFFSETS[idx % ANGLE_OFFSETS.length];

      const c = getTrailPointByLag(lag);  // Mittelpunkt auf der Spur
      const t = getTrailTangent(lag);     // Tangente (Richtung)
      const n = { x: -t.y, y: t.x };      // Normale (90°)

      // Zielpunkt (Anker) auf kleinem Kreis um die Spur
      const cos = Math.cos(phi), sin = Math.sin(phi);
      const axp = c.x + (t.x * cos + n.x * sin) * R;
      const ayp = c.y + (t.y * cos + n.y * sin) * R;

      // Feder (Spring-PD) hin zum Anker → weich, nicht ruckartig
      let dx = f.x - axp, dy = f.y - ayp;
      const dist = Math.hypot(dx,dy) || 1;
      dx /= dist; dy /= dist; // Richtung Anker→Partikel
      const error = dist;
      const vr = (f.vx * dx + f.vy * dy); // radiale Geschwindigkeit

      // Beschleunigung Richtung Anker
      let ax = (-SPRING_K * error - SPRING_D * vr) * dx;
      let ay = (-SPRING_K * error - SPRING_D * vr) * dy;

      // sanfter Fluss entlang der Tangente
      ax += TANGENTIAL * t.x;
      ay += TANGENTIAL * t.y;

      // Wenn zu weit weg → kurzer Snap-Boost
      if(error > SNAP_DIST){
        ax += (axp - f.x) / error * SNAP_BOOST;
        ay += (ayp - f.y) / error * SNAP_BOOST;
      }

      // begrenzen
      let amag = Math.hypot(ax, ay);
      if(amag > TURN_LIMIT){ const k = TURN_LIMIT / amag; ax*=k; ay*=k; }
      if(amag > MAX_ACCEL){ const k = MAX_ACCEL / amag; ax*=k; ay*=k; }

      f.vx += ax * dt; f.vy += ay * dt;

      // zusätzlich leicht zum Zentrum ziehen → "sammeln"
      attractToCenter(f, c, dt);
    });

    // Separation: ganz nah → nur leicht wegschubsen (kein Auseinanderlaufen)
    for(let i=0;i<followers.length;i++){
      for(let j=i+1;j<followers.length;j++){
        const a = followers[i], b = followers[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d  = Math.hypot(dx,dy);
        if(d > 0 && d < SEP_RADIUS){
          const push = (1 - d/SEP_RADIUS);
          let fx = (dx / d) * (SEP_STRENGTH * push);
          let fy = (dy / d) * (SEP_STRENGTH * push);
          a.vx += fx * dt; a.vy += fy * dt;
          b.vx -= fx * dt; b.vy -= fy * dt;
        }
      }
    }
  }

  /* ========== 6) LOOP (UPDATE + RENDER) ========== */
  let last = performance.now();
  function loop(now){
    const dt = Math.min((now - last) / 1000, 0.05); // Sekunden, capped
    last = now;

    // fürs Zeichnen leicht glätten
    if(mouse.has){
      mouse.x = lerp(mouse.x, mouse.rawX, MOUSE_LERP);
      mouse.y = lerp(mouse.y, mouse.rawY, MOUSE_LERP);
    }

    // Spur immer mit der echten Position füttern
    pushTrail(mouse.rawX, mouse.rawY);

    // Leinwand leeren
    ctx.clearRect(0,0,W,H);

    // die 5 nächsten Partikel auswählen und Cluster-Fluss anwenden
    if(mouse.has){
      const mx = mouse.rawX, my = mouse.rawY;
      const ds = flies.map((f,i)=>{
        const dx = mx - f.x, dy = my - f.y;
        return { i, d2: dx*dx + dy*dy };
      }).sort((a,b)=>a.d2 - b.d2);

      const followers = [];
      for(let k=0; k<Math.min(FOLLOW_COUNT, ds.length); k++){
        followers.push(flies[ds[k].i]);
      }
      applyClusterFlow(followers, dt);
    }

    // alle Partikel updaten und zeichnen
    for(const f of flies){ f.step(dt); f.draw(ctx); }

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

})();



/* ============================================================
   TYPER — Überschriften links wie getippt anzeigen
   ------------------------------------------------------------
   Einfache Erklärung (DE):
   - Nimmt alle <h1> in .vorstellung.
   - Merkt sich den Text, leert die Zeilen.
   - Tippt jede Zeile Zeichen für Zeichen.
   - Kleine, zufällige Pausen → wirkt menschlich.
   ============================================================ */
(() => {
  "use strict";

  /* ---------- 1) Elemente & Texte holen ---------- */
  const h1List = Array.from(document.querySelectorAll('.startseite h1'));
  if(!h1List.length) return;            // Wenn nichts da ist, nichts tun.
  const texts = h1List.map(el => (el.textContent || '').trim());

  /* ---------- 2) Start: alles leeren ---------- */
  h1List.forEach(el => { el.textContent = ''; });

  /* ---------- 3) kleine Helfer ---------- */
  const wait = (ms) => new Promise(r => setTimeout(r, ms));
  const rand = (a,b) => Math.random() * (b - a) + a;

  /* ---------- 4) Eine Zeile tippen ---------- */
  async function typeLine(el, text){
    // Struktur: Ausgabe-Span + blinkender Cursor
    const out = document.createElement('span');
    const cur = document.createElement('span');
    cur.className = 'typer-cursor';
    el.append(out, cur);

    for(let i=0; i<text.length; i++){
      out.textContent += text[i];

      // Tempo: mal schneller, mal langsamer (zufällig)
      let d = rand(5, 10);                // Grundtempo (ms)
      if(text[i] === ' ') d += rand(60, 140);          // nach Leerzeichen kurz warten
      if(/[.,!?;:]/.test(text[i])) d += rand(120, 260); // bei Satzzeichen länger
      await wait(d);
    }

    // Am Zeilenende kurz halten, dann Cursor entfernen
    await wait(rand(150, 350));
    cur.remove();
  }

  /* ---------- 5) Alle Zeilen nacheinander tippen ---------- */
  (async () => {
    await wait(250);                       // kleiner Startpuffer
    for(let i=0; i<h1List.length; i++){
      await typeLine(h1List[i], texts[i]); // Zeile i tippen
      await wait(220);                     // kleine Pause zwischen den Zeilen
    }
  })();
})();
