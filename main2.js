/* =========================================
   Live-Tippen (einfach + mit kleinen Fehlern)
   - Rechts: HTML und CSS werden getippt
   - Links: Überschriften entstehen live
   - CSS wird sofort angewendet
   ========================================= */
(() => {
  // kleine Helfer
  const $  = (s, c=document) => c.querySelector(s);
  const $$ = (s, c=document) => Array.from(c.querySelectorAll(s));
  const wait = (ms) => new Promise(r => setTimeout(r, ms));
  const R = (a,b) => Math.random()*(b-a)+a; // Zufall (float)
  const ABC = "abcdefghijklmnopqrstuvwxyz";

  // 1) Texte links holen und leeren
  const h1s = $$('.vorstellung h1');
  const lines = h1s.map(h => (h.textContent||'').trim());
  h1s.forEach(h => h.textContent = '');

  // 2) Code für rechts vorbereiten
  const htmlText =
`<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Portfolio</title>
    <link rel="stylesheet" href="css/style.css" />
  </head>
  <body>
    <section class="vorstellung">
${lines.map(t => `      <h1>${t}</h1>`).join('\n')}
    </section>
  </body>
</html>`;

  const cssText =
`.vorstellung h1{
  font-family: "Montserrat",
               system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial,
               "Apple SD Gothic Neo", "Malgun Gothic", sans-serif;
  font-weight: 700;
  line-height: 1.05;
  margin: 0 0 .1em 0;
}`;

  // 3) Einfacher Typer (variabler Speed + kleiner Tippfehler)
  async function typeInto(outEl, text, opts={}){
    const min = opts.min ?? 18;     // schneller
    const max = opts.max ?? 110;    // langsamer
    const typo = opts.typo ?? 0.05; // Fehler-Wahrscheinlichkeit
    const onStep = opts.onStep;     // Hook (z.B. CSS live anwenden)

    // Aufbau: Ausgabe + Cursor
    const code = document.createElement('span');
    const cur  = document.createElement('span'); cur.className = 'cursor';
    outEl.textContent = ''; outEl.append(code, cur);

    for(let i=0;i<text.length;i++){
      const ch = text[i];

      // gelegentlicher Tippfehler (1 Zeichen): Buchstabe → löschen → richtig
      if(ch !== ' ' && ch !== '\n' && Math.random() < typo){
        code.textContent += ABC[Math.floor(R(0, ABC.length))];
        if(onStep) onStep(code.textContent);
        await wait(R(min*0.7, max*0.8));
        code.textContent = code.textContent.slice(0, -1);
        if(onStep) onStep(code.textContent);
        await wait(R(30, 70));
      }

      // richtiges Zeichen
      code.textContent += ch;
      if(onStep) onStep(code.textContent);

      // kleine Pausen: Wort/Zeilenende etwas länger
      let d = R(min, max);
      if(ch === ' ') d += R(70, 150);
      if(ch === '\n') d += R(80, 160);
      await wait(d);
    }
    await wait(R(200, 400));
    cur.remove();
  }

  // 4) Linke Überschrift tippen (ganz simpel)
  async function typeH1(el, text){
    const out = document.createElement('span');
    const cur = document.createElement('span'); cur.className = 'typer-cursor';
    el.textContent = ''; el.append(out, cur);
    for(let i=0;i<text.length;i++){
      out.textContent += text[i];
      await wait(R(20, 110));
    }
    await wait(R(150, 300));
    cur.remove();
  }

  // 5) Ablauf: parallel & einfach
  async function run(){
    const htmlArea = $('#editor-html .code-area');
    const cssArea  = $('#editor-css .code-area');
    const live     = $('#live-style');

    // Links: H1s nacheinander tippen (kleiner Abstand)
    (async () => {
      for(let i=0;i<lines.length;i++){
        await typeH1(h1s[i], lines[i]);
        await wait(300); // Abstand zwischen Zeilen
      }
    })();

    // Rechts oben: HTML tippen
    await typeInto(htmlArea, htmlText);

    // Rechts unten: CSS tippen + live anwenden
    await typeInto(cssArea, cssText, {
      onStep: (css) => { live.textContent = css; }
    });
  }

  // Start
  run();
})();
