# Medienprojekt – Portfolio

Dies ist mein Projekt für Cimdata (Webdesign / Mediengestaltung).

## Inhalte
- HTML / CSS / JS Beispiele zur Übung
- Layout- und Wireframe-Übungen
- Dokumentation mit Markdown

## Ziel
Ein Portfolio für meine Ausbildung als Mediengestalterin Digital & Print.  
Das Projekt zeigt meinen Lernprozess sowie verschiedene Arbeiten aus den Bereichen Branding, Print, Web und Foto/Video.  
Mein Ziel ist es, ein klares und nutzerfreundliches Design zu entwickeln, das meine gestalterischen Fähigkeiten sichtbar macht.  
Durch die Projektarbeit möchte ich außerdem meine Grundlagen im Webdesign und in der Webentwicklung festigen und weiter ausbauen.

## Konzept
Dieses Portfolio entstand im Rahmen meiner Umschulung zur Mediengestalterin Digital & Print.  
Das Ziel war es, eine klare und minimalistische Portfolio-Webseite zu entwickeln, die meine Arbeiten aus den Bereichen Branding, Print, Web und Foto/Video präsentiert.  
Die Navigation umfasst: Über mich, Arbeiten, Kontakt, Download (Lebenslauf).

## Wireframes
Basierend auf dem Konzept habe ich Wireframes erstellt, um die Struktur und das Layout zu definieren.  
Der Fokus lag auf einem sauberen Raster, großen Visuals und einer klaren Kategorisierung meiner Projekte.  
Die Wireframes helfen, das Grundgerüst zu testen, bevor Farben, Typografie und Bilder integriert werden.


## Prozess
1. Recherche und Inspirationssammlung  
   - Plattformen: Behance, Awwwards  
   - Fokus: minimalistische, kreative Portfolio-Webseiten  
   - Inspiration: dezente Animationen (Scroll, Fade)  
   - Ziel: Klarheit + Nutzerfreundlichkeit mit Bewegung verbinden  

2. Erstellung eines Konzepts und einer Sitemap  
   - Hauptnavigation definiert: Über mich, Arbeiten, Kontakt, Download  
   - Inhaltskategorien festgelegt: Branding, Printdesign, Webdesign, Foto/Video  
   - Struktur geplant: Startseite → About me →Projects (Karten) → Detailseiten  
   - Zusatzbereiche berücksichtigt: Footer, Impressum  

3. Entwicklung von Wireframes für Start- und Unterseiten  
   - Für jede Seite die Titel, Bildpositionen und ungefähren Größen definiert.  
   - Die Projektübersicht in vier Kategorien gegliedert: **Logodesign, Printdesign, Webdesign sowie Foto- und Videoarbeiten**.  
   - Diese Kategorien in einer Kartenstruktur angelegt, sodass man zu den jeweiligen Detailseiten mit den einzelnen Arbeiten navigieren kann.  
   - Zusätzlich habe ich einfache Wireframes für den Footer sowie für die Bereiche **Kontakt** und **Impressum** erstellt.  

4. Umsetzung der Designs mit HTML, CSS und JavaScript
   -Startseite (Hero) mit GSAP + ScrollTrigger
     Typo-Intro (H1/Hero-Claim) mit sanftem Fade/Slide-In
     Scroll-Hinweis (minimaler Pfeil)
     „Spotlight“-Cursor (Neon-Glow), optional abschaltbar via prefers-reduced-motion
   -Struktur
     Semantisches HTML (header, main, section, nav)
     Responsive Typografie (Clamp-Funktionen) & Mobile-First
   -Typografie
     Inter (Text), Montserrat (Headlines) – WOFF2 lokal eingebunden
   -Farbsystem
     Dark-Hero (#111 Hintergrund, #fff Text), hohe Kontraste für Lesbarkeit
   -Animationen (GSAP ScrollTrigger)
     Content-Blöcke kommen von rechts nach links in den Viewport
     Stagger (zeitversetzt), weiche Easing-Kurven, einmaliges Abspielen (once: true)


## Arbeit vom 09.09.2025

- **Startseite (Hero)**
  - Text kommt weich von unten hoch (Fade-Up).
  - Text hat jetzt einen *Negativ-Effekt* (mix-blend-mode).

- **Film-Hintergrund**
  - Film-Streifen bewegt sich automatisch nach rechts/links.
  - Bewegung ist nicht immer gleich schnell, sondern wie beim Blättern.
  - Stoppt kurz bei jedem Bild (Rhythmus).

- **Scroll-Effekte**
  - Wenn man runter scrollt, wird der Film unscharf und dunkler.
  - Andere Texte und Boxen kommen sanft hoch (ScrollTrigger).

- **About-Bereich**
  - Nur ein großes Foto-Box bleibt.
  - Text daneben wurde geordnet.

- **Projects**
  - Karten stehen im Grid sauber nebeneinander.
  - Farben und Kontrast angepasst.

 
  


