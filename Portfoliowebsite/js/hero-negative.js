// hero-negative.js – Stabiler Negativ-Text im Hero                     // 히어로의 네거티브 텍스트를 안정화합니다

export function initNegativeHero() {                                   // Startfunktion                     // 시작 함수
  // === Hero-Layer neutralisieren ===
  const hero = document.querySelector('.startseite');                  // Hero finden                        // 히어로 찾기
  if (hero) {                                                          // Wenn vorhanden                     // 있으면
    hero.style.isolation = 'auto';                                     // Keine neue Ebene                   // 새 레이어 금지
    hero.style.zIndex = 'auto';                                        // Standard Stapel                    // 기본 z-index
    hero.style.position = hero.style.position || 'relative';           // Position sichern                   // 위치 보장
    hero.style.transform = 'none';                                     // Keine Transform-Ebene              // 트랜스폼 제거
    hero.style.opacity = '1';                                          // Voll sichtbar                      // 불투명
    hero.style.filter = 'none';                                        // Keine Filter                       // 필터 없음
  }

  // === Wrapper auf Negativ setzen ===
  const wrap = document.querySelector('.start-wrap');                  // Text-Wrapper                       // 래퍼
  if (wrap) {                                                          // Wenn vorhanden                     // 있으면
    wrap.style.position = 'relative';                                  // Relative Position                  // 상대 위치
    wrap.style.zIndex = 3;                                             // Über Hintergrund                   // 위 레이어
    wrap.style.color = '#fff';                                         // Weißer Text                        // 흰 텍스트
    wrap.style.mixBlendMode = 'difference';                            // Negativ-Mischung                   // 네거티브
    wrap.querySelectorAll('*').forEach(n => {                          // Kinder angleichen                  // 자식 통일
      n.style.color = 'inherit';                                       // Farbe erben                        // 색 상속
      n.style.background = 'transparent';                              // Kein Hintergrund                   // 배경 없음
    });
  }
}
