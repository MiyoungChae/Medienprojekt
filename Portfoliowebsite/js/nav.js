// nav.js – Hamburger-Menü, ESC, Hover/Touch-Preview                    // 내비 메뉴 열기/닫기 및 미리보기

export function initNavigation() {                                     // Startfunktion                       // 시작 함수
  const siteHeader = document.querySelector('.site-nav');              // Header                               // 헤더
  const toggleBtn  = document.querySelector('.nav-toggle');            // Hamburger-Button                     // 버튼
  const mainMenu   = document.getElementById('main-menu');             // UL-Menü                              // 메뉴

  // === Grund-Interaktion ===
  if (siteHeader && toggleBtn && mainMenu) {                           // Alles da?                            // 모두 있음?
    if (!toggleBtn.dataset.bound) {                                    // Noch nicht gebunden?                 // 미바인딩?
      toggleBtn.addEventListener('click', () => {                      // Klick                                // 클릭
        const open = siteHeader.classList.toggle('open');              // Öffnen/Schließen                     // 토글
        toggleBtn.setAttribute('aria-expanded', String(open));         // ARIA setzen                          // 접근성
        document.body.classList.toggle('no-scroll', open);             // Body scroll sperren                  // 스크롤 잠금
      });
      toggleBtn.dataset.bound = '1';                                   // Markiert                             // 표시
    }

    if (!mainMenu.dataset.bound) {                                     // Schutz vor Doppelbindung             // 중복 방지
      mainMenu.addEventListener('click', (e) => {                      // Klick im Menü                        // 메뉴 클릭
        if (e.target.closest('a')) {                                   // Ein Link?                            // 링크?
          siteHeader.classList.remove('open');                         // Menü zu                              // 닫기
          toggleBtn.setAttribute('aria-expanded', 'false');            // ARIA zurück                          // 접근성
          document.body.classList.remove('no-scroll');                 // Scroll frei                          // 해제
        }
      });
      mainMenu.dataset.bound = '1';                                    // Markiert                             // 표시
    }

    if (!siteHeader.dataset.escBound) {                                // ESC noch nicht gebunden?             // ESC 미바인딩?
      document.addEventListener('keydown', (e) => {                    // Tastatur                             // 키보드
        if (e.key === 'Escape') {                                      // ESC?                                 // ESC?
          siteHeader.classList.remove('open');                         // Menü zu                              // 닫기
          toggleBtn.setAttribute('aria-expanded', 'false');            // ARIA zurück                          // 접근성
          document.body.classList.remove('no-scroll');                 // Scroll frei                          // 해제
        }
      });
      siteHeader.dataset.escBound = '1';                               // Markiert                             // 표시
    }
  }

  // === Hover/Touch Preview (Overlay) ===
  (function () {
    const items = document.querySelectorAll('.nav-menu li');           // Menü-Punkte                          // 항목
    if (!items || !items.length) return;                               // Keine? Ende                          // 없으면 종료

    items.forEach(li => {                                              // Desktop-Hover                        // 데스크톱
      li.addEventListener('pointerenter', () => li.classList.add('hovering')); // Hover an                   // 호버 켬
      li.addEventListener('pointerleave', () => li.classList.remove('hovering')); // Hover aus              // 호버 끔
    });

    let lastTapItem = null;                                            // Für Touch                            // 터치 기억
    items.forEach(li => {
      li.addEventListener('touchstart', (ev) => {                      // Touchstart                           // 터치
        if (!siteHeader || !siteHeader.classList.contains('open')) return; // Nur wenn offen                 // 열린 경우
        if (lastTapItem === li && li.classList.contains('hovering')) { // Zweiter Tap?                        // 두 번째?
          lastTapItem = null; return;                                  // Jetzt folgen                         // 이동
        }
        ev.preventDefault();                                           // Navigation stoppen                   // 이동 방지
        items.forEach(i => i.classList.remove('hovering'));            // Andere aus                           // 해제
        li.classList.add('hovering');                                  // Dieses an                            // 이것만
        lastTapItem = li;                                              // Merken                               // 저장
        setTimeout(() => {                                             // Timeout                              // 시간 제한
          if (lastTapItem === li) { li.classList.remove('hovering'); lastTapItem = null; } // Zurücksetzen   // 초기화
        }, 2200);
      }, { passive: false });
    });

    document.addEventListener('click', (e) => {                        // Klick außerhalb                      // 바깥 클릭
      if (!e.target.closest('.nav-menu')) {                            // Nicht im Menü?                       // 메뉴 밖?
        items.forEach(i => i.classList.remove('hovering'));            // Hover weg                            // 제거
        lastTapItem = null;                                            // Reset                                 // 초기화
      }
    });
  })();

  // === Floating Preview neben Menüpunkt ===
  (function () {
    const menu = document.getElementById('main-menu');                 // Menü                                 // 메뉴
    if (!menu) return;                                                 // Fehlend? Ende                        // 없으면 종료
    const previews = menu.querySelectorAll('.nav-preview');            // Vorschauen                           // 프리뷰

    const clearFloating = () =>                                        // Alle verstecken                      // 모두 숨김
      previews.forEach(p => { p.classList.remove('floating','visible'); p.style.left=''; p.style.top=''; });

    menu.addEventListener('pointerenter', (e) => {                     // Zeiger rein                          // 포인터 진입
      const li = e.target.closest('li');                               // LI finden                            // 항목 찾기
      if (!li) return;                                                 // Kein LI?                             // 없으면
      const preview = li.querySelector('.nav-preview');                // Vorschau holen                        // 프리뷰
      if (!preview) return;                                            // Keine? Ende                          // 없으면 종료
      const rect = li.getBoundingClientRect();                         // Maße holen                           // 위치/크기
      const top = rect.top + rect.height/2;                            // Mitte berechnen                      // 중앙
      preview.classList.add('floating','visible');                     // Anzeigen                             // 보이기
      preview.style.left = (rect.left - preview.offsetWidth - 36) + 'px'; // Links daneben                    // 왼쪽 배치
      preview.style.top  = (top - preview.offsetHeight/2) + 'px';      // Vertikal mittig                      // 세로 중앙
      previews.forEach(p => { if (p !== preview) p.classList.remove('floating','visible'); }); // Andere aus // 다른 것 숨김
    }, true);

    menu.addEventListener('pointerleave', () => { clearFloating(); }, true); // Raus: weg                     // 나가면 숨김

    const header = document.querySelector('.site-nav');                // Header                               // 헤더
    if (header) {                                                      // Da?                                  // 있나?
      const obs = new MutationObserver(() => {                         // Auf Klasse achten                    // 클래스 감시
        if (!header.classList.contains('open')) clearFloating();       // Menü zu → verstecken                 // 닫히면 숨김
      });
      obs.observe(header, { attributes: true, attributeFilter:['class'] }); // Beobachten                     // 관찰
    }
  })();
}
