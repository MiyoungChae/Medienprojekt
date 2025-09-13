// animations-fadeup.js – Sanfte Fade-Up-Scroll-Effekte                 // 스크롤 시 부드럽게 등장하는 효과

export function initFadeUps() {                                        // Startfunktion                     // 시작 함수
  if (!(window.gsap && window.ScrollTrigger)) return;                  // Ohne GSAP nicht nötig              // 없으면 종료

  // === Grundeinstellungen ===
  const ease  = 'power3.out';                                          // Weiche Kurve                       // 부드러움
  const Y0    = 28;                                                    // Start unten                        // 아래 오프셋
  const START = 'top 80%';                                             // Startpunkt                         // 시작 지점

  // === Helfer: mehrere Elemente einblenden ===
  const up = (sel, each = 0.08, dur = 1.25) => {                       // Selektor/Versatz/Dauer             // 선택/지연/지속
    const list = gsap.utils.toArray(sel);                              // Zu Array machen                    // 배열 변환
    list.forEach((el, i) => {                                          // Für jedes Element                  // 각 요소
      gsap.fromTo(                                                     // Von/Zu Animation                   // fromTo
        el, { y: Y0, opacity: 0 },                                     // Startwerte                         // 시작값
        {
          y: 0, opacity: 1, duration: dur, ease,                       // Zielwerte                          // 목표값
          delay: i * each,                                             // Stufen-Verzögerung                 // 단계 지연
          scrollTrigger: {                                             // Beim Scroll steuern                // 스크롤 트리거
            trigger: el,                                               // Auslöser                           // 트리거
            start: START,                                              // Startpunkt                         // 시작
            toggleActions: 'play none play none'                       // Vor/zurück abspielen               // 앞/뒤
          }
        }
      );
    });
  };

  // === Anwendungsfälle ===
  up('.startseite .reveal2', 0.00, 1.25);                              // Großer Titel                       // 큰 제목
  up('.startseite .reveal',  0.06, 1.25);                              // Kleine Zeilen                      // 작은 줄
  up('.about',               0.10, 1.25);                              // About-Box                          // 어바웃 박스
  up('.projects .section-title', 0.00, 0.90);                          // Projekt-Titel                      // 프로젝트 제목
  up('.project-card',        0.08, 1.50);                              // Projekt-Karten                     // 프로젝트 카드
}
