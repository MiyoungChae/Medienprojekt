// Seite: sanftes Fade-Up. In-Viewport sofort, sonst mit ScrollTrigger.
document.addEventListener('DOMContentLoaded', () => {
  // GSAP/ScrollTrigger vorhanden?
  if (!window.gsap) {
    // Fallback: alles sichtbar machen (CDN blockiert o.ä.)
    safeShowAll();
    return;
  }
  if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  const ease = 'power2.out';
  const Y0   = 40;          // Start-Y
  const START_POS = 0.85;   // "top 85%"

  // 요소가 이미 화면 안에 있는지 체크
  const inView = (el) => {
    const r = el.getBoundingClientRect();
    return r.top <= window.innerHeight * START_POS;
  };

  // 개별 요소에 안전한 페이드업 적용
  const fadeUpSmart = (selector, delayStep = 0.08, duration = 1.0) => {
    const els = gsap.utils.toArray(selector);
    els.forEach((el, i) => {
      const anim = () => gsap.fromTo(el,
        { y: Y0, opacity: 0 },
        { y: 0, opacity: 1, duration, ease, delay: i * delayStep }
      );

      if (inView(el) || !window.ScrollTrigger) {
        // 이미 보이는 경우: 즉시 애니메이션
        anim();
      } else {
        // 스크롤로 들어올 때 실행
        ScrollTrigger.create({
          trigger: el,
          start: `top ${Math.round(START_POS*100)}%`,
          once: true,
          onEnter: anim
        });
      }
    });
  };

  // Hero 먼저
  fadeUpSmart('.startseite .reveal2', 0.00, 1.15);
  fadeUpSmart('.startseite .reveal',  0.08, 1.00);

  // 나머지
  fadeUpSmart('.photo-box',    0.10, 1.00);
  fadeUpSmart('.about-panel',  0.10, 1.00);
  fadeUpSmart('.project-card', 0.10, 1.00);
  fadeUpSmart('.section-title',0.00, 1.00);
  fadeUpSmart('.footer .reveal',0.06, 1.00);

  // 폰트/이미지 로딩 후 레이아웃 확정 → 트리거 재계산
  const doRefresh = () => window.ScrollTrigger && ScrollTrigger.refresh(true);
  window.addEventListener('load', doRefresh, { once: true });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(doRefresh).catch(()=>{});
  }

  // 혹시라도 1.5초 내 애니메이션 못 받으면 가시화(안전)
  setTimeout(() => {
    const anyHidden = document.querySelector(
      '.reveal[style*="opacity: 0"], .reveal2[style*="opacity: 0"]'
    );
    if (anyHidden) safeShowAll();
  }, 1500);

  // ---- utils ----
  function safeShowAll(){
    gsap.set('.reveal, .reveal2, .photo-box, .about-panel, .project-card, .section-title, .footer .reveal',
      { opacity: 1, y: 0 });
  }
});
