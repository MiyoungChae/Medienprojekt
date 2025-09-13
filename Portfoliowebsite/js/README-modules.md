# JS Modules created from app.js

These files implement the functions imported by `js/app.js`:

- `hero-negative.js` → `initNegativeHero()`
- `animations-fadeup.js` → `initFadeUps()`
- `about.js` → `initAboutEffects()`
- `nav.js` → `initNavigation()`
- `film-strip.js` → `initFilmStrip()`

Usage
- Ensure GSAP and the ScrollTrigger plugin are loaded before `js/app.js`.
- In your HTML, load `js/app.js` as a module or via bundler.

Example (plain HTML):

```html
<script defer src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script defer src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script type="module" src="js/app.js"></script>
```

Note: Your current `index.html` references `main.js`. Replace with `type=module` and `src=js/app.js` to use these modules.
