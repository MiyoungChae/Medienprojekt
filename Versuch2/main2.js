/* =========================================
   Ziel (B1):
   - Links: Texte tippen erst ab dem Moment,
     wenn der rechte Code die <section class="vorstellung"> startet.
   - Davor: keine Animation.
   - Tipp-Geschwindigkeit: wie echte Person.
   ========================================= */
(() => {
  // kleine Hilfen
  const $  = (s, c=document) => c.querySelector(s);
  const $$ = (s, c=document) => Array.from(c.querySelectorAll(s));
  const wait = (ms) => new Promise(r => setTimeout(r, ms));
  const R = (a,b) => Math.random()*(b-a)+a; // Zufallszahl
  const ABC = "abcdefghijklmnopqrstuvwxyz"; // Buchstaben für Fehler

  // DOM-Elemente holen
  const previewRoot = $('.vorstellung');      // linke Vorschau
  const editorArea  = $('#editor .code-area'); // rechte Editor-Fläche (eine)
  const liveStyle   = $('#live-style');       // <style> für Live-CSS

  // H1-Texte (Vorlage) aus dem HTML lesen
  const initialH1s = $$('.vorstellung h1');
  const lines = initialH1s.map(h => (h.textContent || '').trim());

  // Links am Anfang leer lassen (damit Tippen sichtbar startet)
  previewRoot.innerHTML = '';

  // Basis-CSS (nur bis echtes <style> im Code getippt ist)
  const baseCSS = `
.vorstellung h1{
  font-family: "Montserrat", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial,
               "Apple SD Gothic Neo", "Malgun Gothic", sans-serif;
  font-weight: 700;
  line-height: 1.05;
  margin: 0 0 .1em 0;
}
`;
  liveStyle.textContent = baseCSS;

  // kompletter Text, der rechts getippt wird (HTML + inline <style>)
  const docText =
`<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Portfolio</title>
    <style>
/* ===== Beispiel-Stil: alles in einer Datei ===== */
.vorstellung h1{
  font-family: "Montserrat",
               system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial,
               "Apple SD Gothic Neo", "Malgun Gothic", sans-serif;
  font-weight: 700;
  line-height: 1.05;
  margin: 0 0 .1em 0;
}
/* hier könnte man mehr Styles schreiben */
    </style>
  </head>
  <body>
    <section class="vorstellung">
${lines.map(t => `      <h1>${t}</h1>`).join('\n')}
    </section>
  </body>
</html>`;

  // Status-Flags (B1: merken, was schon passiert ist)
  let leftTypingStarted = false;     // wurde links schon mit Tippen begonnen?
  let styleReplaced     = false;     // wurde echtes CSS schon gesetzt?

  // Funktion: Linke Seite "wirklich tippen", Zeile für Zeile (H1)
  // B1: realistische Tipp-Geschwindigkeit
  async function typeLinesToPreview(target, texts, opts = {}){
    const min = opts.min ?? 35;  // schneller
    const max = opts.max ?? 95;  // langsamer
    const linePause = opts.linePause ?? [220, 420]; // Pause zwischen H1
    const wordExtra = opts.wordExtra ?? [40, 120];  // kleine Pause nach Leerzeichen

    target.innerHTML = ''; // sicher leer

    for(const t of texts){
      // Container pro H1
      const h1  = document.createElement('h1');
      const out = document.createElement('span');
      const cur = document.createElement('span');
      cur.className = 'typer-cursor';
      h1.append(out, cur);
      target.appendChild(h1);

      for(let i=0; i<t.length; i++){
        out.textContent += t[i];

        // kleine natürliche Pausen
        let d = R(min, max);
        if(t[i] === ' ') d += R(wordExtra[0], wordExtra[1]);
        await wait(d);
      }
      await wait(R(linePause[0], linePause[1]));
      cur.remove();
    }
  }

  // Funktion: schaut in den "bisher getippten" Code (prefix)
  // und aktualisiert Live-CSS + Start-Signal für linkes Tippen.
  function applyPreviewFrom(prefix){
    // CSS aus <style> holen (nur wenn es vollständig im prefix ist)
    const styleMatch = prefix.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
    if(styleMatch){
      liveStyle.textContent = styleMatch[1];
      styleReplaced = true;
    } else if(!styleReplaced){
      liveStyle.textContent = baseCSS;
    }

    // Start der linken Tipp-Animation:
    // erst NACHDEM das öffnende <section class="vorstellung"> im Code erscheint.
    const sectionOpenSeen = /<section[^>]*class=(["'])?vorstellung\1?[^>]*>/.test(prefix);
    if(sectionOpenSeen && !leftTypingStarted){
      leftTypingStarted = true;

      // (1) Animationen erst jetzt erlauben (z.B. Canvas, CSS-Animationen)
      document.body.classList.add('anim-on');
      // wenn du eine Canvas-Animation hast (z.B. Glühwürmchen), hier starten:
      // startFireflies();  // <- deine Funktion, falls vorhanden

      // (2) Linke Seite: echte Tipp-Animation starten (asynchron)
      // Geschwindigkeit menschlich: min 35–45 / max 90–110 ist angenehm
      typeLinesToPreview(previewRoot, lines, { min: 40, max: 110, linePause: [250, 500], wordExtra: [60, 140] })
        .catch(console.error);
    }

    // WICHTIG:
    // Wir setzen NICHT mehr direkt HTML in die linke Vorschau,
    // weil wir die echte Tipp-Animation nutzen wollen.
    // Darum KEIN previewRoot.innerHTML = sectMatch[2];
  }

  // Funktion: tippt Text rechts (Code) mit kleinen Fehlern (optional)
  async function typeInto(outEl, text, {min=35, max=110, typo=0.02} = {}){
    if(!outEl) return;
    const code = document.createElement('span');
    const cur  = document.createElement('span');
    cur.className = 'cursor';
    outEl.textContent = '';
    outEl.append(code, cur);

    for(let i=0; i<text.length; i++){
      const ch = text[i];

      // manchmal ein Mini-Fehler (optional & selten)
      if(ch !== ' ' && ch !== '\n' && Math.random() < typo){
        code.textContent += ABC[Math.floor(R(0, ABC.length))];
        applyPreviewFrom(code.textContent);
        await wait(R(min*0.7, max*0.8));
        code.textContent = code.textContent.slice(0, -1);
        applyPreviewFrom(code.textContent);
        await wait(R(30, 70));
      }

      // richtiges Zeichen
      code.textContent += ch;
      applyPreviewFrom(code.textContent);

      // Pausen wie echte Person
      let d = R(min, max);
      if(ch === ' ')  d += R(70, 150);
      if(ch === '\n') d += R(90, 170);
      await wait(d);
    }
    await wait(R(200, 400));
    cur.remove();
  }

  // Start
  (async function run(){
    // B1: Rechts tippt normal-schnell, links startet erst bei <section …>
    await typeInto(editorArea, docText, { min: 38, max: 115, typo: 0.01 });
  })();
})();
