// app.js – Startpunkt der Seite                                       // 이 파일은 전체 앱을 시작합니다 (엔트리)

import { initNegativeHero } from './hero-negative.js';                 // Hero Negativ-Effekt laden         // 히어로 네거티브 로드
import { initFadeUps }      from './animations-fadeup.js';             // Fade-Up Animationen laden         // 페이드업 로드
import { initAboutEffects } from './about.js';                          // About Effekte laden               // 어바웃 효과 로드
import { initNavigation }   from './nav.js';                            // Navigation laden                  // 내비 로드
import { initFilmStrip }    from './film-strip.js';                     // Filmleiste laden                  // 필름 스트립 로드

// === DOM bereit & Grund-Setup ===
document.addEventListener('DOMContentLoaded', () => {                  // Warten bis DOM fertig             // DOM 준비 대기
  // -- Immer bei #home starten --
  try {                                                                // Fehler sicher abfangen            // 에러 방지
    if (window.location && window.location.hash &&                     // Hash vorhanden?                   // 해시 있나?
        window.location.hash !== '#home') {                            // Nicht #home?                      // #home 아님?
      history.replaceState(null, '', '#home');                         // Hash zu #home ändern              // 해시 변경
      const startEl = document.getElementById('home');                 // Home-Element holen                // 홈 요소
      if (startEl) startEl.scrollIntoView({ behavior: 'auto' });       // Sofort hinspringen                // 바로 이동
    }
  } catch (e) {}                                                       // Fehler ignorieren                 // 무시

  document.documentElement.classList.add('js');                        // Kennzeichen: JS aktiv             // JS 활성 표시

  // -- GSAP registrieren (falls da) --
  if (window.gsap && window.ScrollTrigger) {                           // GSAP & ScrollTrigger vorhanden?   // GSAP 있음?
    gsap.registerPlugin(ScrollTrigger);                                // Plugin registrieren               // 등록
  }

  // === Navbar-Höhe messen & CSS-Var setzen ===
  const setNavHeightVar = () => {                                      // Funktion zum Messen               // 높이 함수
    const header = document.querySelector('.site-nav');                // Header finden                     // 헤더 찾기
    const h = header ? header.getBoundingClientRect().height : 0;      // Höhe bestimmen                    // 높이 계산
    document.documentElement.style.setProperty(                        // CSS-Variable setzen               // CSS 변수
      '--nav-height', `${Math.ceil(h)}px`                              // Auf ganze Pixel runden            // 픽셀 반올림
    );
  };
  setNavHeightVar();                                                   // Direkt setzen                     // 즉시 설정
  window.addEventListener('resize', setNavHeightVar, { passive: true });// Bei Resize neu setzen            // 리사이즈 시 갱신

  // === Module starten (sicher & ruhig) ===
  initNegativeHero();                                                  // Negativ-Effekt sichern            // 네거티브 보장
  initFadeUps();                                                       // Fade-Up Effekte starten           // 페이드업 시작
  initAboutEffects();                                                  // About-Effekte starten             // 어바웃 시작
  initNavigation();                                                    // Navigation aktivieren             // 내비 활성
  initFilmStrip();                                                     // Filmleiste starten                // 필름 시작
});
