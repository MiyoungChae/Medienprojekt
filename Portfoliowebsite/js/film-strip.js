// film-strip.js – Endlose Filmleiste: Auto+Maus, 3D-Konkav, Rhythmus   // 필름 스트립 자동/마우스, 3D, 리듬

export function initFilmStrip() {                                      // Startfunktion                       // 시작 함수
  const strip = document.querySelector('.film-strip');                 // Sichtbereich                         // 보이는 영역
  const track = document.querySelector('.film-track');                 // Laufband                             // 트랙
  const hero  = document.querySelector('.startseite');                 // Für Dim-Logik                        // 딤 용도
  if (!strip || !track) return;                                        // Fehlend? Ende                        // 없으면 종료

  // === Grund-Boxen sicherstellen ===
  let originals = Array.from(track.querySelectorAll('.film-box'));     // Originale sammeln                    // 원본 목록
  if (!originals.length) {                                             // Keine da?                            // 없으면
    for (let i = 0; i < 10; i++) {                                     // Mindestens 10                        // 최소 10
      const b = document.createElement('div'); b.className = 'film-box'; track.appendChild(b); // Box bauen  // 박스 추가
    }
    originals = Array.from(track.querySelectorAll('.film-box'));       // Neu lesen                            // 다시 읽기
  }

  // === Füllung für Endlosschleife ===
  const ensureFill = () => {                                           // Ausreichend füllen                   // 충분히 채움
    let guard = 0;                                                     // Schutz gegen Endlos                   // 보호
    while (track.scrollWidth < window.innerWidth * 3 && guard++ < 50) {// 3× Fensterbreite                     // 3배
      originals.forEach(b => track.appendChild(b.cloneNode(true)));    // Nur Originale klonen                 // 원본 복제
    }
  };

  // === Breiten berechnen ===
  const roundWidth = () =>                                             // Aktuelle Rundenbreite                 // 라운드 폭
    Array.from(track.querySelectorAll('.film-box'))                    // Alle Boxen                            // 모든 박스
      .reduce((s, el) => s + el.getBoundingClientRect().width, 0);     // Summe                                 // 합계
  const originalsWidth = () =>                                         // Breite der Originale                  // 원본 폭
    originals.reduce((s, el) => s + el.getBoundingClientRect().width, 0);

  // === 3D/Konkav-Look ===
  const depth = 280, tilt = 26, minS = 0.5, maxS = 1.0, fade = 0.15;   // Parameter                             // 파라미터
  const apply3D = () => {                                              // 3D anwenden                           // 3D 적용
    const r  = strip.getBoundingClientRect();                          // Strip-Maße                            // 크기
    const cx = r.left + r.width / 2;                                   // Mitte                                 // 중앙
    const all = track.querySelectorAll('.film-box');                   // Alle Boxen                            // 모든 박스
    all.forEach(el => {                                                // Für jede Box                          // 각 박스
      const br = el.getBoundingClientRect();                           // Box-Maße                              // 크기
      const bx = br.left + br.width / 2;                               // Box-Zentrum                           // 중심
      const n  = Math.max(-1, Math.min(1, (bx - cx) / (r.width / 2))); // Norm -1..1                            // 정규
      const a  = Math.abs(n);                                          // Abstand Mitte                         // 거리
      const z  = -depth * (1 - (1 - a) ** 2);                          // Tiefe                                 // 깊이
      const ry = -tilt * n;                                            // Drehung                               // 회전
      const sc = minS + (maxS - minS) * a;                             // Skala                                 // 스케일
      const op = 1 - Math.max(0, a - 0.7) / 0.3 * fade;                // Opazität                              // 투명도
      el.style.transform = `translateZ(${z}px) rotateY(${ry}deg) scale(${sc})`; // Transform                   // 변형
      el.style.opacity   = op.toFixed(3);                              // Opazität setzen                        // 투명도
    });
  };

  // === Maus/Touch steuern Richtung ===
  let hoverDir = 0; const DEAD_LEFT = 0.45, DEAD_RIGHT = 0.55;         // Richtungszonen                        // 방향 구역
  const onMove = (e) => {                                              // Bewegung lesen                         // 움직임
    const w = window.innerWidth || 1;                                  // Fensterbreite                          // 폭
    const clientX = (typeof e.clientX === 'number') ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0); // Position // 위치
    const t = clientX / w;                                             // 0..1 Position                          // 정규 위치
    hoverDir = (t <= DEAD_LEFT) ? -1 : (t >= DEAD_RIGHT ? +1 : 0);     // Links / Rechts / Mitte                 // 좌/우/중앙
  };
  const fine = window.matchMedia && window.matchMedia('(pointer: fine)').matches; // Feiner Zeiger?           // 정밀 포인터?
  if (fine) window.addEventListener('mousemove', onMove, { passive: true }); else window.addEventListener('touchmove', onMove, { passive: true }); // Events // 이벤트

  // === Geschwindigkeit & Rhythmus ===
  let baseSpeed = 500; const amp1 = 0.75, amp2 = 0.22, f1 = 0.40, f2 = 0.55; // Parameter                     // 파라미터
  const holdMs = 3000;                                                // Pause an Kanten                       // 경계 멈춤

  // === Laufzustand ===
  let x = 0, W = 0, last = performance.now(), boxW = 0, holdUntil = 0; // Position/Zeiten                      // 상태값
  let rafId = 0, loop = null, dir = 1;                                 // Loop & Richtung                       // 루프/방향

  const afterLayout = (fn) => requestAnimationFrame(() => requestAnimationFrame(fn)); // Sicher nach Layout     // 레이아웃 후

  // === Start nach Layout ===
  afterLayout(() => {                                                  // Nach Layout starten                    // 레이아웃 후 시작
    ensureFill();                                                      // Auffüllen                              // 채우기
    const first = track.querySelector('.film-box');                    // Erste Box                              // 첫 박스
    boxW = first ? first.getBoundingClientRect().width : 0;           // Breite dieser Box                      // 폭
    W    = roundWidth();                                               // Gesamtbreite                           // 합계
    const Worig = originalsWidth();                                    // Originalbreite                         // 원본 폭
    track.dataset.originalsWidth = Worig || W;                         // Für Modulo speichern                   // 저장
    x = 0;                                                             // Startposition                          // 초기화
    track.style.transform = 'translate3d(0,0,0)';                      // Anfangstransform                       // 초기 변환
    apply3D();                                                         // 3D anwenden                            // 적용

    // === Hauptschleife ===
    loop = (now) => {                                                  // Frame-Funktion                         // 프레임
      const dt = Math.min(0.05, (now - last) / 1000); last = now;      // Zeitdifferenz clamp                    // dt 제한
      dir = (hoverDir === 0) ? 1 : hoverDir;                           // Maus überschreibt                      // 마우스 우선

      if (!W || !boxW) {                                               // Maße fehlen?                           // 치수 없음?
        const f = track.querySelector('.film-box');                    // Box holen                              // 박스
        boxW = f ? f.getBoundingClientRect().width : 0; W = roundWidth(); // Neu messen                        // 다시 측정
      }

      if (now < holdUntil) {                                           // Pause aktiv?                           // 멈춤 중?
        const WorigNow = parseFloat(track.dataset.originalsWidth) || W;// Originalbreite jetzt                   // 현재 원본 폭
        const cur = ((x % WorigNow) + WorigNow) % WorigNow;            // Modulo-Position                        // 모듈러
        track.style.transform = `translate3d(${-cur}px,0,0)`;          // Position halten                        // 유지
        apply3D();                                                     // 3D updaten                             // 갱신
        rafId = requestAnimationFrame(loop);                           // Nächster Frame                         // 다음
        return;                                                        // Zurück                                 // 리턴
      }

      const s = now / 1000;                                            // Zeit in s                              // 초
      const rWave = 1 + amp1 * Math.sin(2 * Math.PI * f1 * s) + amp2 * Math.sin(2 * Math.PI * f2 * s + Math.PI / 3); // Rhythmus // 리듬
      x += baseSpeed * rWave * dt * dir;                               // Bewegung berechnen                     // 이동

      if (boxW > 0) {                                                  // Kanten-Schnapp                         // 경계 스냅
        if (dir > 0) { const target = (Math.floor(x / boxW) + 1) * boxW; if (x >= target) { x = target; holdUntil = now + holdMs; } } // Vorwärts // 전진
        else if (dir < 0) { const target = (Math.ceil(x / boxW) - 1) * boxW; if (x <= target) { x = target; holdUntil = now + holdMs; } } // Rückwärts // 후진
      }

      const WorigNow = parseFloat(track.dataset.originalsWidth) || W;  // Breite Originale                       // 원본 폭
      const mod = ((x % WorigNow) + WorigNow) % WorigNow;              // Modulo                                 // 모듈로
      track.style.transform = `translate3d(${-mod}px,0,0)`;            // Anwenden                               // 적용
      apply3D();                                                       // 3D updaten                             // 갱신
      rafId = requestAnimationFrame(loop);                             // Weiterlaufen                           // 다음 프레임
    };

    rafId = requestAnimationFrame(loop);                               // Loop starten                           // 루프 시작
  });

  // === Dim-Effekt nach Hero ===
  const onScroll = () => {                                             // Beim Scroll                            // 스크롤 시
    const rect = hero ? hero.getBoundingClientRect() : null;           // Hero-Lage                              // 위치
    if (!rect) return;                                                 // Kein Hero?                             // 없으면
    if (rect.bottom <= 0) document.body.classList.add('film-dim');     // Hero weg → dim                         // 딤 추가
    else                  document.body.classList.remove('film-dim');  // Hero sichtbar → normal                 // 딤 해제
  };
  window.addEventListener('scroll', onScroll, { passive: true });      // Listener                               // 리스너
  onScroll();                                                          // Initial prüfen                          // 초기 체크

  // === Resize neu berechnen & Loop sauber neu starten ===
  window.addEventListener('resize', () => {                            // Bei Resize                             // 리사이즈
    afterLayout(() => {                                                // Nach Layout                            // 이후
      ensureFill();                                                    // Füllung prüfen                         // 채움 확인
      const f = track.querySelector('.film-box');                      // Box holen                              // 박스
      boxW = f ? f.getBoundingClientRect().width : 0;                  // Breite neu                             // 폭 갱신
      W    = roundWidth();                                             // Gesamt neu                             // 합계
      const Worig = originalsWidth();                                  // Original neu                           // 원본 폭
      track.dataset.originalsWidth = Worig || W;                       // Speichern                               // 저장
      apply3D();                                                       // 3D updaten                              // 갱신
      last = performance.now();                                        // Zeit reset                              // 시간 리셋
      if (typeof rafId === 'number' && rafId) cancelAnimationFrame(rafId); // Loop stoppen                       // 중단
      if (typeof loop === 'function') rafId = requestAnimationFrame(loop);   // Loop neu                          // 재시작
      if (window.ScrollTrigger && typeof window.ScrollTrigger.refresh === 'function') { window.ScrollTrigger.refresh(); } // GSAP refresh // 리프레시
    });
  }, { passive: true });
}
