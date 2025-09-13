// about.js – Dim-Overlay, kurzer Scroll-Halt, Projector, Tipp-Effekt   // 어바웃 섹션: 딤, 멈춤, 프로젝터, 타자

export function initAboutEffects() {                                   // Startfunktion                     // 시작 함수
  const aboutSection = document.querySelector('.about');               // About finden                       // 어바웃 찾기
  if (!aboutSection) return;                                           // Nicht da? Ende                     // 없으면 종료

  // === 1) Dim-Overlay je nach Sichtbarkeit ===
  const maxAlpha = 0.25;                                               // Maximale Dunkelheit                 // 최대 어둡기
  const updateAboutDim = () => {                                       // Overlay berechnen                   // 오버레이 계산
    const rect = aboutSection.getBoundingClientRect();                 // Lage/Höhe holen                     // 위치/높이
    const navH = parseInt(getComputedStyle(document.documentElement)   // Nav-Höhe lesen                      // 네비 높이
      .getPropertyValue('--nav-height')) || 0;

    const visibleTop    = Math.max(rect.top, 0);                       // Sicht oben                          // 보이는 상단
    const visibleBottom = Math.min(rect.bottom, window.innerHeight);   // Sicht unten                         // 보이는 하단
    const visibleH      = Math.max(0, visibleBottom - visibleTop);     // Sicht-Höhe                           // 보이는 높이
    const totalH        = rect.height || 1;                            // Gesamt-Höhe                          // 전체 높이

    if (visibleH <= 0) {                                               // Nicht sichtbar?                      // 안 보이면
      document.documentElement.style.setProperty('--about-dim', '0');  // Kein Dim                             // 딤 0
      document.body.classList.remove('about-active');                  // Klasse weg                           // 클래스 제거
      return;                                                          // Ende                                 // 종료
    }

    const visibleRatio = Math.max(0, Math.min(1, visibleH / totalH));  // Anteil 0..1                          // 비율
    const exponent     = 0.6;                                          // Schneller Start                      // 빠른 시작
    const progress     = Math.pow(visibleRatio, exponent);             // Verlauf                              // 진행도
    const alpha        = progress * maxAlpha;                          // Ziel-Alpha                           // 알파

    document.documentElement.style.setProperty('--about-dim', String(alpha)); // CSS-Var setzen               // 변수 설정
    document.body.classList.toggle('about-active', alpha > 0);         // Klasse an/aus                        // 토글
  };
  window.addEventListener('scroll',  updateAboutDim, { passive: true });// Beim Scroll updaten                  // 스크롤 갱신
  window.addEventListener('resize',  updateAboutDim, { passive: true });// Bei Resize updaten                   // 리사이즈 갱신
  setTimeout(updateAboutDim, 50);                                      // Früher Check                         // 초기 체크

  // === 2) Kurzer Scroll-Halt am oberen Rahmen ===
  let holdActive = false;                                              // Hält gerade?                         // 멈춤?
  let lastTriggerTs = 0;                                               // Letzte Auslösung                     // 마지막 시점
  const HOLD_MS = 2000;                                                // Halt-Dauer                           // 2초
  const REQUIRED_WHEELS = 3;                                           // Erst nach 3 Ticks                    // 3번 후
  const COUNT_RESET_MS = 1200;                                         // Reset nach Pause                     // 쉬면 초기화
  const TRIGGER_WINDOW = 120;                                          // Toleranz in px                       // 허용 범위
  let zoneActive = false;                                              // In Zone?                             // 영역 안?
  let wheelCount = 0;                                                  // Zähler                               // 카운트
  let lastWheelTs = 0;                                                 // Zeitstempel                          // 시간

  const preventScrollEvents = (e) => {                                 // Scroll blocken                       // 스크롤 차단
    if (!holdActive) return;                                           // Nur bei Halt                         // 멈춤일 때
    if (e.type === 'keydown') {                                        // Tasten?                              // 키보드?
      const keys = ['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' ']; // Relevante Tasten       // 해당 키
      if (keys.includes(e.key)) e.preventDefault();                    // Standard stoppen                     // 기본 방지
    } else {
      e.preventDefault();                                              // Touch/Rad stoppen                    // 차단
    }
  };

  const disableHold = () => {                                          // Halt beenden                         // 멈춤 해제
    if (!holdActive) return;                                           // Nicht aktiv?                         // 아니면
    holdActive = false;                                                // Flag aus                             // 해제
    document.body.classList.remove('about-hold');                      // Klasse weg                           // 클래스 제거
    const y = parseInt(document.body.dataset.freezeY || '0', 10) || 0;// Alte Y-Pos                           // Y 복원
    const x = parseInt(document.body.dataset.freezeX || '0', 10) || 0;// Alte X-Pos                           // X 복원
    document.body.classList.remove('scroll-freeze');                   // Fixierung lösen                      // 고정 해제
    document.body.style.top  = '';                                     // Stil zurück                          // 스타일 초기화
    document.body.style.left = '';                                     // Stil zurück                          // 스타일 초기화
    window.scrollTo(x, y);                                             // Position halten                      // 위치 유지
    window.removeEventListener('wheel',     preventScrollEvents, { passive: false }); // Listener weg         // 제거
    window.removeEventListener('touchmove', preventScrollEvents, { passive: false }); // Listener weg         // 제거
    window.removeEventListener('keydown',   preventScrollEvents, { passive: false }); // Listener weg         // 제거
  };

  const enableHold = () => {                                           // Halt starten                         // 멈춤 시작
    if (holdActive) return;                                            // Schon aktiv?                         // 이미?
    holdActive = true;                                                 // Flag an                              // 설정
    document.body.classList.add('about-hold');                         // Klasse an                            // 클래스 추가
    const scrollY = window.scrollY || window.pageYOffset || 0;         // Aktuelle Y                           // 현재 Y
    const scrollX = window.scrollX || window.pageXOffset || 0;         // Aktuelle X                           // 현재 X
    document.body.dataset.freezeY = String(scrollY);                   // Merken                               // 저장
    document.body.dataset.freezeX = String(scrollX);                   // Merken                               // 저장
    document.body.style.top  = `-${scrollY}px`;                        // Body fixieren                        // 고정
    document.body.style.left = `-${scrollX}px`;                        // Body fixieren                        // 고정
    document.body.classList.add('scroll-freeze');                      // Fix-Klasse                           // 고정 클래스
    window.addEventListener('wheel',     preventScrollEvents, { passive: false }); // Scroll sperren          // 차단
    window.addEventListener('touchmove', preventScrollEvents, { passive: false }); // Scroll sperren          // 차단
    window.addEventListener('keydown',   preventScrollEvents, { passive: false }); // Scroll sperren          // 차단
    setTimeout(disableHold, HOLD_MS);                                  // Nach Zeit lösen                      // 시간 후 해제
  };

  const checkAboutTop = () => {                                        // Zone prüfen                          // 영역 확인
    const rect = aboutSection.getBoundingClientRect();                 // Lage holen                           // 위치
    const navH = parseInt(getComputedStyle(document.documentElement)   // Nav-Höhe                             // 네비 높이
      .getPropertyValue('--nav-height')) || 0;
    const frameTopToViewport = rect.top + navH;                        // Abstand oben                         // 상단 거리
    if (frameTopToViewport <= 0 && frameTopToViewport > -TRIGGER_WINDOW) { // In Zone?                       // 영역 안?
      if (!zoneActive) { zoneActive = true; wheelCount = 0; lastWheelTs = 0; } // Zähler starten            // 카운트 시작
    } else { zoneActive = false; wheelCount = 0; }                      // Zone verlassen                       // 영역 밖
  };
  window.addEventListener('scroll', checkAboutTop, { passive: true }); // Beim Scroll prüfen                   // 스크롤 확인
  checkAboutTop();                                                      // Einmal initial                       // 초기 1회

  const snapToFrameTop = () => {                                       // Exakt ausrichten                     // 정확 정렬
    const rect = aboutSection.getBoundingClientRect();                 // Lage holen                           // 위치
    const navH = parseInt(getComputedStyle(document.documentElement)   // Nav-Höhe                             // 네비 높이
      .getPropertyValue('--nav-height')) || 0;
    const delta = rect.top + navH;                                     // Differenz                            // 차이
    if (Math.abs(delta) > 0.5) {                                       // Genug Abstand?                       // 충분?
      const x = window.scrollX || window.pageXOffset || 0;             // X-Pos                                // X
      const y = (window.scrollY || window.pageYOffset || 0) + delta;   // Neue Y                               // 새 Y
      try { window.scrollTo({ left: x, top: y, behavior: 'auto' }); }  // Sofort springen                      // 즉시 이동
      catch(_) { window.scrollTo(x, y); }                               // Fallback                             // 대안
    }
  };

  const tryCountAndHold = () => {                                      // Zählen & ggf. halten                 // 카운트/멈춤
    if (!zoneActive) return;                                           // Nur in Zone                          // 영역만
    const now = performance.now();                                     // Zeit jetzt                           // 현재 시간
    if (lastWheelTs && (now - lastWheelTs) > COUNT_RESET_MS) {         // Zu lange Pause?                      // 쉬었나?
      wheelCount = 0;                                                  // Reset                                // 초기화
    }
    lastWheelTs = now;                                                 // Zeit merken                          // 시간 저장
    wheelCount++;                                                      // +1                                   // 증가
    if (wheelCount >= REQUIRED_WHEELS &&                               // Genug Ticks?                         // 충분?
        (now - lastTriggerTs) > (HOLD_MS + 600)) {                     // Abstand groß genug?                  // 간격?
      lastTriggerTs = now; zoneActive = false; wheelCount = 0;         // Reset                                // 초기화
      snapToFrameTop();                                                // Genau ausrichten                     // 정렬
      enableHold();                                                    // Kurz halten                          // 멈춤
    }
  };

  window.addEventListener('wheel', (e) => { if (e.deltaY > 0) tryCountAndHold(); }, { passive: true }); // Mausrad ↓ zählen // 아래 스크롤 카운트
  window.addEventListener('keydown', (e) => { const keysDown = ['ArrowDown','PageDown','End',' ']; if (zoneActive && keysDown.includes(e.key)) tryCountAndHold(); }, { passive: true }); // Tasten zählen // 키 입력 카운트
  window.addEventListener('touchmove', () => { tryCountAndHold(); }, { passive: true }); // Touch zählen // 터치 카운트

  // === 3) Projector-Reveal für das Foto ===
  (function initProjectorReveal(){
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; // Wenig Bewegung? // 모션 줄임?
    const monitor = document.querySelector('.about .crt-monitor');     // Monitor-Element                      // 모니터 요소
    if (!monitor) return;                                              // Fehlend? Ende                        // 없으면 종료
    monitor.classList.add('projector');                                // Markierung                           // 표시
    const img = monitor.querySelector('img');                          // Bild holen                           // 이미지

    if (prefersReduced) {                                              // Motion reduzieren                     // 모션 줄임
      monitor.classList.add('projector-on');                           // Sofort an                            // 즉시 켬
      window.dispatchEvent(new CustomEvent('about-projector-ready'));  // Event senden                         // 이벤트
      monitor.classList.add('pixel-intensify');                        // Pixel stärker                        // 픽셀 강화
      return;                                                          // Ende                                 // 종료
    }

    const io = new IntersectionObserver((entries) => {                 // Beobachter                           // 관찰자
      entries.forEach((entry) => {                                     // Für jeden Eintrag                    // 각 엔트리
        if (entry.isIntersecting) {                                    // Sichtbar?                            // 보임?
          setTimeout(() => {                                           // Kleine Pause                         // 약간 대기
            monitor.classList.add('projector-on');                     // Einschalten                          // 켜기
            if (img) {                                                 // Bild vorhanden?                      // 이미지?
              const onAnimEnd = (e) => {                               // Wenn Reveal fertig                   // 끝나면
                if (e && e.animationName !== 'projectorOn') return;    // Richtig?                             // 확인
                img.removeEventListener('animationend', onAnimEnd);    // Listener weg                         // 제거
                window.dispatchEvent(new CustomEvent('about-projector-ready')); // Event                      // 이벤트
                monitor.classList.add('pixel-intensify');              // Pixel stärker                        // 픽셀 강화
              };
              const fallbackTimer = setTimeout(() => {                 // Fallback                             // 대안
                img && img.removeEventListener && img.removeEventListener('animationend', onAnimEnd); // Aufräumen // 정리
                window.dispatchEvent(new CustomEvent('about-projector-ready')); // Event                      // 이벤트
              }, 3000);                                                // etwas Puffer                         // 버퍼
              img.addEventListener('animationend', (e) => {            // Ende hören                           // 끝 감지
                if (e.animationName === 'projectorOn') clearTimeout(fallbackTimer); // Fallback stoppen      // 대안 해제
                onAnimEnd(e);                                          // Ausführen                            // 실행
              }, { once: true });                                      // Nur einmal                           // 1회
            } else {                                                   // Kein Bild                            // 이미지 없음
              setTimeout(() => {                                       // Kurzer Fallback                      // 짧은 대안
                window.dispatchEvent(new CustomEvent('about-projector-ready')); // Event                      // 이벤트
                monitor.classList.add('pixel-intensify');              // Pixel stärker                        // 강화
              }, 1600);
            }
          }, 1000);                                                    // 1s Verzögerung                       // 1초 지연
          io.disconnect();                                             // Beobachtung beenden                  // 관찰 종료
        }
      });
    }, { root: null, threshold: 0.08 });                               // Früh triggern                        // 조기 트리거
    io.observe(monitor);                                               // Start beobachten                     // 관찰 시작

    setTimeout(() => {                                                 // Später Fallback                      // 늦은 대안
      const hasOn = monitor.classList.contains('projector-on');        // Schon an?                            // 켜짐?
      if (!hasOn) {                                                    // Noch nicht?                          // 아니면
        monitor.classList.add('projector-on');                         // Einschalten                          // 켜기
        monitor.classList.add('pixel-intensify');                      // Pixel stärker                        // 강화
        window.dispatchEvent(new CustomEvent('about-projector-ready')); // Event                               // 이벤트
      }
    }, 6000);
  })();

  // === 4) Tipp-Schreibeffekt für Texte ===
  (function initAboutTyping(){
    const about = document.querySelector('.about');                    // About finden                         // 어바웃
    const panel = document.querySelector('.about-panel');              // Panel finden                         // 패널
    if (!about || !panel) return;                                      // Fehlend? Ende                        // 없으면 종료

    const h2 = panel.querySelector('h2');                              // Überschrift                          // 제목
    const ps = Array.from(panel.querySelectorAll('p'));                // Absätze                               // 문단
    if (!h2) return;                                                   // Ohne H2: Ende                        // H2 없으면

    const makeTarget = (el) => {                                       // Ziel vorbereiten                     // 타깃 준비
      if (!el || el.dataset.typed) return null;                        // Schon gemacht?                       // 이미?
      const text = el.textContent;                                     // Text sichern                         // 텍스트 저장
      el.textContent = '';                                             // Leeren                               // 비우기
      const span = document.createElement('span'); span.className = 'type-target'; // Ziel-Span              // 타깃 스팬
      span.textContent = text;                                         // Volltext merken                      // 원문 보관
      const caret = document.createElement('span'); caret.className = 'typing-caret'; // Cursor              // 캐럿
      el.appendChild(span); el.appendChild(caret);                     // Anhängen                             // 추가
      el.dataset.typed = '1';                                          // Markieren                            // 표시
      return { el, span, caret, text };                                // Paket zurück                         // 객체 반환
    };

    const items = [makeTarget(h2), ...ps.map(makeTarget)].filter(Boolean); // Ziele sammeln                  // 타깃 목록
    if (items.length === 0) return;                                    // Keine Ziele? Ende                    // 없으면 종료

    const NAME_TEXT = 'Miyoung Chae';                                  // Name                                 // 이름
    let nameEl = panel.querySelector('.about-name');                   // Name-Element                         // 이름 요소
    if (!nameEl) {                                                     // Fehlend?                             // 없으면
      nameEl = document.createElement('p'); nameEl.className = 'about-name'; nameEl.textContent = NAME_TEXT; panel.appendChild(nameEl); // Neu anlegen // 생성
    }
    const nameItem = makeTarget(nameEl);                               // Für Tippen vorbereiten               // 타자 준비

    const typeText = async (item, speed = 14) => {                     // Tippen-Funktion                      // 타자 함수
      const { span, caret, text } = item;                              // Teile holen                          // 부분
      span.textContent = ''; span.style.visibility = 'visible';        // Sichtbar & leer                      // 보이기/비우기
      caret.style.display = 'inline-block';                            // Cursor an                            // 캐럿 보임
      for (let i = 1; i <= text.length; i++) {                         // Buchstabe für Buchstabe              // 한 글자씩
        span.textContent = text.slice(0, i);                           // Teiltext                             // 부분 텍스트
        await new Promise(r => setTimeout(r, speed));                  // kurze Pause                          // 잠깐 대기
      }
      caret.style.display = 'none';                                    // Cursor aus                           // 캐럿 숨김
    };

    let started = false; let panelVisible = false; let projectorReady = false; // Status Flags               // 상태 플래그

    const maybeStart = async () => {                                   // Start prüfen                         // 시작 확인
      if (started || !panelVisible || !projectorReady) return;         // Bedingungen nicht?                   // 조건 미충족?
      started = true;                                                  // Markieren                            // 표시
      items.forEach(({ el }) => { el.style.opacity = '1'; });          // Sichtbar                             // 보이기
      await typeText(items[0], 10);                                    // H2 schneller                         // 제목 빠름
      for (let i = 1; i < items.length; i++) {                         // Danach Absätze                       // 그 다음
        await new Promise(r => setTimeout(r, 220));                    // kleine Pause                         // 짧게 대기
        await typeText(items[i], 14);                                  // normal schnell                       // 보통 속도
      }
      if (nameItem) await typeText(nameItem, 42);                      // Name langsam                         // 이름 느리게
    };

    const io = new IntersectionObserver((entries, obs) => {            // Beobachter                           // 관찰자
      entries.forEach(e => {
        if (e.isIntersecting) {                                        // Sichtbar?                            // 보임?
          panelVisible = true; obs.disconnect();                        // Beobachtung aus                      // 중지
          const fallback = setTimeout(() => {                          // Fallback nach 8s                     // 8초 대안
            if (!started) {
              items.forEach(({ el, span, caret, text }) => { span.style.visibility = 'visible'; span.textContent = text; if (caret) caret.style.display = 'none'; el.style.opacity = '1'; }); // Direkt zeigen // 즉시 표시
              if (nameItem) { const { el, span, caret } = nameItem; span.style.visibility = 'visible'; span.textContent = NAME_TEXT; if (caret) caret.style.display = 'none'; el.style.opacity = '1'; } // 이름도 즉시 // 이름 표시
              started = true;                                          // Markieren                            // 표시
            }
          }, 8000);
          const clearIfStarted = () => { if (started) clearTimeout(fallback); }; // Fallback stoppen          // 대안 중지
          window.addEventListener('about-projector-ready', clearIfStarted, { once: true }); // Einmal hören   // 1회 청취
          maybeStart();                                                // Versuch starten                      // 시작 시도
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -20% 0px' });           // Früh triggern                        // 조기 트리거
    io.observe(panel);                                                 // Beobachten                           // 관찰

    window.addEventListener('about-projector-ready', () => {           // Wenn Projektor bereit                // 준비 이벤트
      projectorReady = true;                                           // Flag setzen                          // 설정
      maybeStart();                                                    // Start prüfen                         // 확인
    }, { once: true });
  })();
}
