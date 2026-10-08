/* ==========================================================================
   DL Cuidado e Acolhimento — main.js
   HTML/CSS/JS puros · GSAP 3 (gsap, ScrollTrigger, SplitText) + Lenis
   Tudo local, sem CDN. Respeita prefers-reduced-motion.
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* 0. Setup                                                            */
  /* ------------------------------------------------------------------ */
  var html = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var REDUCE = html.classList.contains('reduced');
  var HAS_GSAP = !!(window.gsap && window.ScrollTrigger);
  var HAS_SPLIT = !!(window.SplitText);
  var LIBS = HAS_GSAP && HAS_SPLIT;

  // Rede de segurança do <head>: avisa que o JS chegou a rodar
  window.__DL_READY__ = true;
  if (!LIBS) { html.classList.add('no-anim'); html.classList.remove('intro-on'); }

  // Resolve quando as fontes estiverem prontas (com teto de segurança).
  // Evita o aviso "SplitText called before fonts loaded" e reflui de linhas.
  function fontsReady() {
    var p = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
    return Promise.race([p, new Promise(function (res) { window.setTimeout(res, 2000); })]);
  }

  var finePointer = function () { return window.matchMedia('(hover: hover)').matches; };
  var isDesktop = function () { return window.matchMedia('(min-width: 900px)').matches; };
  var clamp = gsap ? gsap.utils.clamp : function (a, b, v) { return Math.max(a, Math.min(b, v)); };

  // Ano do rodapé
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  var nav = $('#nav');
  var heroSection = $('.hero');
  var wafloat = $('#wafloat');

  if (HAS_GSAP) gsap.registerPlugin(ScrollTrigger, SplitText);
  if (HAS_GSAP) gsap.defaults({ ease: 'power4.out', duration: 1.2 });

  var lenis = null;
  var menuOpen = false;
  var heroPlayed = false;
  var heroIntroDone = false;
  var navUnlocked = false;

  /* ------------------------------------------------------------------ */
  /* 1. Scroll suave (Lenis)                                              */
  /* ------------------------------------------------------------------ */
  function initLenis() {
    if (REDUCE || !HAS_GSAP || typeof window.Lenis === 'undefined') return;
    lenis = new window.Lenis({
      lerp: 0.085,
      wheelMultiplier: 0.95,
      smoothWheel: true,
      autoRaf: false
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  function lockScroll() {
    if (lenis) lenis.stop();
    document.body.classList.add('is-locked');
    html.style.overflow = 'hidden';
  }
  function unlockScroll() {
    if (lenis) lenis.start();
    document.body.classList.remove('is-locked');
    html.style.overflow = '';
  }

  /* ------------------------------------------------------------------ */
  /* 2. Âncoras do menu                                                  */
  /* ------------------------------------------------------------------ */
  function scrollToEl(el) {
    if (!el) return;
    var offset = isDesktop() ? -70 : -56;
    if (lenis) {
      lenis.scrollTo(el, {
        offset: offset,
        duration: REDUCE ? 0 : 1.6,
        easing: function (t) { return 1 - Math.pow(1 - t, 4); }
      });
    } else {
      var y = el.getBoundingClientRect().top + window.pageYOffset + offset;
      window.scrollTo({ top: y, behavior: (REDUCE ? 'auto' : 'smooth') });
    }
  }

  function initAnchors() {
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (!id || id === '#' || id.length < 2) return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        if (menuOpen) closeMenu();
        // espera o menu fechar antes de rolar
        window.setTimeout(function () { scrollToEl(target); }, menuOpen ? 480 : 0);
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* 3. Menu mobile                                                      */
  /* ------------------------------------------------------------------ */
  var burger = $('#burger');
  var menu = $('#menu');
  var menuLinks = $$('.menu__list a');
  var menuTl = null;

  function openMenu() {
    if (menuOpen) return;
    menuOpen = true;
    document.body.classList.add('menu-open');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Fechar menu');
    lockScroll();
    updateWA();

    if (!HAS_GSAP || REDUCE) {
      menu.style.clipPath = 'inset(0 0 0% 0)';
      gsap && gsap.set(menuLinks, { opacity: 1, y: 0 });
      return;
    }
    if (menuTl) menuTl.kill();
    menuTl = gsap.timeline();
    menuTl
      .set(menu, { clipPath: 'inset(0 0 100% 0)' })
      .to(menu, { clipPath: 'inset(0 0 0% 0)', duration: 0.9, ease: 'expo.inOut' })
      .fromTo(menuLinks,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.9, stagger: 0.06, ease: 'power4.out' }, '-=0.55');
  }

  function closeMenu() {
    if (!menuOpen) return;
    menuOpen = false;
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Abrir menu');

    var finish = function () {
      document.body.classList.remove('menu-open');
      if (!menuOpen) unlockScroll();
      updateWA();
    };

    if (!HAS_GSAP || REDUCE) {
      menu.style.clipPath = 'inset(0 0 100% 0)';
      finish();
      return;
    }
    if (menuTl) menuTl.kill();
    menuTl = gsap.timeline({ onComplete: finish });
    menuTl
      .to(menuLinks, { opacity: 0, y: 24, duration: 0.35, stagger: 0.03, ease: 'power2.in' })
      .to(menu, { clipPath: 'inset(0 0 100% 0)', duration: 0.7, ease: 'expo.inOut' }, '-=0.2');
  }

  function initMenu() {
    if (!burger || !menu) return;
    burger.addEventListener('click', function () { menuOpen ? closeMenu() : openMenu(); });
    menuLinks.forEach(function (a) {
      a.addEventListener('click', function () { window.setTimeout(closeMenu, 120); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuOpen) closeMenu();
    });
  }

  /* ------------------------------------------------------------------ */
  /* 4. Cursor custom                                                    */
  /* ------------------------------------------------------------------ */
  function initCursor() {
    if (REDUCE || !HAS_GSAP) return;
    if (!window.matchMedia('(hover: hover) and (min-width: 900px)').matches) return;
    var cur = $('#cursor');
    if (!cur) return;

    html.classList.add('cursor-ready');

    var xTo = gsap.quickTo(cur, 'x', { duration: 0.35, ease: 'power3' });
    var yTo = gsap.quickTo(cur, 'y', { duration: 0.35, ease: 'power3' });
    var shown = false;

    window.addEventListener('pointermove', function (e) {
      if (!shown) { shown = true; gsap.set(cur, { x: e.clientX, y: e.clientY }); gsap.to(cur, { opacity: 1, duration: 0.4 }); }
      xTo(e.clientX);
      yTo(e.clientY);
    }, { passive: true });

    document.addEventListener('pointerdown', function () { gsap.to(cur, { scale: 0.85, duration: 0.25 }); });
    document.addEventListener('pointerup', function () { gsap.to(cur, { scale: 1, duration: 0.35 }); });

    var hoverables = $$('a, button, summary, [data-magnet]');
    hoverables.forEach(function (el) {
      el.addEventListener('pointerenter', function () {
        if (el.hasAttribute('data-cursor')) return;
        cur.classList.add('is-active');
      });
      el.addEventListener('pointerleave', function () { cur.classList.remove('is-active'); });
    });

    $$('[data-cursor="ver"]').forEach(function (el) {
      el.addEventListener('pointerenter', function () { cur.classList.add('is-media'); });
      el.addEventListener('pointerleave', function () { cur.classList.remove('is-media'); });
    });
  }

  /* ------------------------------------------------------------------ */
  /* 5. Botões magnéticos                                                */
  /* ------------------------------------------------------------------ */
  function initMagnets() {
    if (REDUCE || !HAS_GSAP || !finePointer()) return;
    $$('[data-magnet]').forEach(function (el) {
      var xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' });
      var yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' });
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.35);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.35);
      });
      el.addEventListener('pointerleave', function () { xTo(0); yTo(0); });
    });
  }

  /* ------------------------------------------------------------------ */
  /* 6. Intro (abertura) — só na 1ª visita, sem porcentagem, teto de 2s   */
  /* ------------------------------------------------------------------ */
  var CAP_MS = 2000;      // teto total da abertura
  var MIN_MS = 900;       // tempo mínimo da logo + linha
  var EXIT_MS = 950;      // duração da saída

  function runIntro(onDone) {
    var intro = $('#intro');
    if (!intro) { onDone(); return; }

    var logo = $('.intro__logo', intro);
    var line = $('.intro__line', intro);
    var t0 = (window.performance && performance.now) ? performance.now() : Date.now();
    var now = function () { return (window.performance && performance.now) ? performance.now() : Date.now(); };

    lockScroll();

    var tl = gsap.timeline();
    tl.fromTo(logo, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.9, ease: 'power3.out' })
      .fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: 'power3.inOut' }, 0.3);

    var ready = false;
    var exited = false;

    var maybeExit = function () {
      if (exited) return;
      var elapsed = now() - t0;
      var animOk = elapsed >= MIN_MS;
      if ((animOk && ready) || elapsed >= (CAP_MS - EXIT_MS)) exit();
    };

    function exit() {
      exited = true;
      window.clearInterval(poll);
      try { sessionStorage.setItem('dl-intro', 'done'); } catch (e) {}

      var out = gsap.timeline({
        onComplete: function () {
          intro.remove();
          html.classList.remove('intro-on');
          unlockScroll();
        }
      });
      out.to(intro, { yPercent: -100, duration: EXIT_MS / 1000, ease: 'expo.inOut' }, 0)
         .to(logo, { opacity: 0, duration: 0.6, ease: 'power2.in' }, 0);

      window.setTimeout(onDone, 300); // hero entra junto com a saída
    }

    var poll = window.setInterval(maybeExit, 40);

    var loaded = new Promise(function (res) {
      if (document.readyState === 'complete') res();
      else window.addEventListener('load', res, { once: true });
    });
    var fonts = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();

    Promise.all([loaded, fonts]).then(function () { ready = true; maybeExit(); });
  }

  /* ------------------------------------------------------------------ */
  /* 7. Hero                                                             */
  /* ------------------------------------------------------------------ */
  var heroSplit = null;

  function buildHeroLines() {
    if (!HAS_SPLIT) return [];
    var title = $('#hero-title');
    if (!title) return [];
    if (heroSplit) heroSplit.revert();
    heroSplit = SplitText.create(title, {
      type: 'lines',
      mask: 'lines',
      linesClass: 'line'
    });
    return heroSplit.lines;
  }

  function heroIntro() {
    if (heroPlayed) return;
    heroPlayed = true;

    // O split do título só acontece depois das fontes (linhas estáveis)
    fontsReady().then(function () {
      if (heroSplit) { heroSplit.revert(); heroSplit = null; }
      buildHeroLines();
      playHeroTimeline();
    });
  }

  function playHeroTimeline() {
    if (!HAS_GSAP) {
      $$('.hero .label, .hero__sub, .hero__actions, .scroll-ind').forEach(function (el) { el.style.opacity = 1; });
      if (nav) nav.style.transform = 'none';
      return;
    }

    var lines = heroSplit ? heroSplit.lines : [];
    var tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    if (nav) { gsap.set(nav, { yPercent: -100, y: 0 }); tl.to(nav, { yPercent: 0, duration: 1.2 }, 0); }
    if (lines.length) tl.fromTo(lines, { yPercent: 115 }, { yPercent: 0, duration: 1.5, stagger: 0.11 }, 0.15);
    else tl.fromTo('#hero-title', { yPercent: 115, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.5 }, 0.15);

    tl.fromTo('.hero__photo .frame', { opacity: 0, y: 40, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 1.8 }, 0.35)
      .to('.hero__glow', { opacity: 1, duration: 2.2 }, 0.5)
      .to('[data-hero-kicker]', { opacity: 1, duration: 0.9 }, 0.8)
      .fromTo('[data-hero-sub]', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.9 }, 0.9)
      .fromTo('[data-hero-actions]', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.05 }, 1.0)
      .fromTo('[data-hero-scroll]', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1.3 }, 1.15)
      .add(function () { heroIntroDone = true; navUnlocked = true; });
  }

  function initHeroScroll() {
    if (!HAS_GSAP || REDUCE || !heroSection) return;

    // parallax de rolagem
    gsap.to('[data-hero-photo]', {
      y: function () { return window.innerHeight * 0.12; },
      ease: 'none',
      scrollTrigger: { trigger: heroSection, start: 'top top', end: 'bottom top', scrub: true, invalidateOnRefresh: true }
    });
    gsap.to('#hero-text', {
      yPercent: -18, opacity: 0.15, ease: 'none',
      scrollTrigger: { trigger: heroSection, start: 'top top', end: 'bottom top', scrub: true, invalidateOnRefresh: true }
    });

    // parallax de mouse (±4°) — só desktop com ponteiro fino
    if (isDesktop() && finePointer()) {
      var frame = $('#hero-frame');
      if (!frame) return;
      var rx = gsap.quickTo(frame, 'rotationX', { duration: 0.8, ease: 'power3' });
      var ry = gsap.quickTo(frame, 'rotationY', { duration: 0.8, ease: 'power3' });
      heroSection.addEventListener('pointermove', function (e) {
        var r = heroSection.getBoundingClientRect();
        var nx = (e.clientX - r.left) / r.width - 0.5;
        var ny = (e.clientY - r.top) / r.height - 0.5;
        ry(nx * 8);
        rx(-ny * 8);
      });
      heroSection.addEventListener('pointerleave', function () { rx(0); ry(0); });
    }
  }

  /* ------------------------------------------------------------------ */
  /* 8. Manifesto — palavras que acendem                                  */
  /* ------------------------------------------------------------------ */
  function initManifesto() {
    var el = $('[data-manifesto]');
    if (!el || !HAS_GSAP || REDUCE || !HAS_SPLIT) return;
    var split = SplitText.create(el, { type: 'words', wordsClass: 'word' });
    gsap.fromTo(split.words,
      { color: 'rgba(25,63,50,0.22)' },
      {
        color: '#193F32',
        ease: 'none',
        stagger: 0.06,
        scrollTrigger: { trigger: el, start: 'top 78%', end: 'bottom 45%', scrub: 0.6 }
      });
  }

  /* ------------------------------------------------------------------ */
  /* 9. Galeria horizontal "Home Care"                                    */
  /* ------------------------------------------------------------------ */
  var galleryTween = null;
  var galleryST = null;

  function initGallery() {
    var sec = $('#homecare');
    var track = $('#gallery-track');
    var bar = $('#gallery-progress');
    if (!sec || !track || !HAS_GSAP || REDUCE) {
      // sem JS/GSAP: rolagem nativa já funciona por CSS
      return;
    }

    var cards = $$('.gcard', track);
    var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };

    var mm = gsap.matchMedia();

    mm.add('(min-width: 900px)', function () {
      var skewTo = gsap.quickTo(track, 'skewX', { duration: 0.6, ease: 'power3' });

      gsap.set(cards, { opacity: 0, y: 60 });

      galleryTween = gsap.to(track, {
        x: function () { return -dist(); },
        ease: 'none',
        scrollTrigger: {
          trigger: sec,
          start: 'top top',
          end: function () { return '+=' + (dist() + window.innerHeight * 0.4); },
          pin: true,
          anticipatePin: 1,
          scrub: 0.8,
          invalidateOnRefresh: true,
          onUpdate: function (self) {
            if (bar) gsap.set(bar, { scaleX: self.progress });
          }
        }
      });

      galleryST = galleryTween.scrollTrigger;

      // skew do track pela velocidade da rolagem
      var skewTick = function () {
        if (!galleryST || !galleryST.isActive) { skewTo(0); return; }
        skewTo(clamp(-6, 6, galleryST.getVelocity() / -500));
      };
      gsap.ticker.add(skewTick);

      // cards entram ao chegar a ~60% da viewport (containerAnimation)
      cards.forEach(function (card) {
        gsap.to(card, {
          opacity: 1, y: 0, duration: 1, ease: 'power4.out',
          scrollTrigger: { trigger: card, containerAnimation: galleryTween, start: 'left 92%', once: true }
        });
      });

      return function () {
        gsap.ticker.remove(skewTick);
        gsap.set(cards, { opacity: 1, y: 0, clearProps: 'transform' });
        gsap.set(track, { x: 0, skewX: 0 });
        if (bar) gsap.set(bar, { scaleX: 0 });
        galleryTween = null;
        galleryST = null;
      };
    });

    // abaixo de 900px: rolagem horizontal nativa com scroll-snap (CSS), sem pin
  }

  /* ------------------------------------------------------------------ */
  /* 10. Títulos de seção — SplitText por linhas                          */
  /* ------------------------------------------------------------------ */
  function initSplitLines() {
    if (!HAS_GSAP || REDUCE || !HAS_SPLIT) return;
    $$('[data-split-lines]').forEach(function (el) {
      SplitText.create(el, {
        type: 'lines',
        mask: 'lines',
        linesClass: 'line',
        autoSplit: true,
        onSplit: function (self) {
          return gsap.from(self.lines, {
            yPercent: 115,
            duration: 1.4,
            stagger: 0.1,
            ease: 'power4.out',
            scrollTrigger: { trigger: el, start: 'top 82%', once: true }
          });
        }
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* 11. Reveal genérico                                                 */
  /* ------------------------------------------------------------------ */
  function initReveals() {
    if (!HAS_GSAP || REDUCE) return;
    $$('[data-reveal]').forEach(function (el) {
      gsap.fromTo(el,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 1.2, ease: 'power4.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true }
        });
    });

    // Acessibilidade: nada que recebe foco pode estar invisível
    document.addEventListener('focusin', function (e) {
      var t = e.target.closest && e.target.closest('[data-reveal]');
      if (t && parseFloat(getComputedStyle(t).opacity) < 0.9) gsap.set(t, { opacity: 1, y: 0 });
    });
  }

  /* ------------------------------------------------------------------ */
  /* 12. Imagens — clip reveal + parallax interno                         */
  /* ------------------------------------------------------------------ */
  function initImages() {
    if (!HAS_GSAP || REDUCE) return;
    $$('.reveal-clip').forEach(function (fr) {
      gsap.fromTo(fr,
        { clipPath: 'inset(0 0 100% 0)' },
        {
          clipPath: 'inset(0 0 0% 0)',
          duration: 1.6,
          ease: 'expo.inOut',
          scrollTrigger: { trigger: fr, start: 'top 85%', once: true }
        });

      // parallax interno: o wrapper (20% mais alto) desliza dentro da moldura
      var inner = fr.querySelector('.frame__inner');
      if (inner) {
        gsap.fromTo(inner, { yPercent: 0 }, {
          yPercent: -5,
          ease: 'none',
          scrollTrigger: { trigger: fr, start: 'top bottom', end: 'bottom top', scrub: true }
        });
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* 13. Marquee                                                          */
  /* ------------------------------------------------------------------ */
  var mqTweens = [];
  var scrollVel = 0;

  function buildMarquee() {
    if (!HAS_GSAP) return;
    mqTweens.forEach(function (t) { t.kill(); });
    mqTweens = [];
    if (REDUCE) return;

    $$('[data-marquee]').forEach(function (inner) {
      if (!inner.dataset.built) {
        var first = inner.firstElementChild;
        if (first) inner.appendChild(first.cloneNode(true));
        inner.dataset.built = '1';
      }
      // zera transform antes de medir
      gsap.set(inner, { xPercent: 0 });
      var half = inner.scrollWidth / 2;
      if (!half) return;
      var dir = parseFloat(inner.getAttribute('data-dir')) || 1;
      var duration = Math.max(10, half / 72); // 1.2px/frame ≈ 72px/s

      var tw = gsap.fromTo(inner,
        { xPercent: dir > 0 ? 0 : -50 },
        { xPercent: dir > 0 ? -50 : 0, duration: duration, ease: 'none', repeat: -1 });
      mqTweens.push(tw);
    });
  }

  function initMarquee() {
    if (!HAS_GSAP || REDUCE) return;

    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: function (self) { scrollVel = self.getVelocity(); }
    });

    gsap.ticker.add(function () {
      scrollVel *= 0.92; // decaimento
      if (!mqTweens.length) return;
      var boost = clamp(-30, 30, scrollVel / 60);
      var ts = clamp(0.25, 2.6, 1 + boost / 72);
      mqTweens.forEach(function (t) { t.timeScale(ts); });
    });

    buildMarquee();
  }

  /* ------------------------------------------------------------------ */
  /* 14. Nav — aparece ao subir, desce ao rolar                           */
  /* ------------------------------------------------------------------ */
  function initNav() {
    if (!HAS_GSAP || REDUCE || !nav) return;
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: function (self) {
        if (!navUnlocked || menuOpen) return;
        var y = self.scroll();
        if (y > 80 && self.direction === 1) {
          gsap.to(nav, { yPercent: -100, duration: 0.5, ease: 'power3.out', overwrite: true });
        } else {
          gsap.to(nav, { yPercent: 0, duration: 0.5, ease: 'power3.out', overwrite: true });
        }
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* 15. WhatsApp flutuante                                              */
  /* ------------------------------------------------------------------ */
  var waPastHero = false;
  var waContact = false;

  function updateWA() {
    if (!wafloat) return;
    wafloat.classList.toggle('is-visible', waPastHero && !waContact && !menuOpen);
  }

  function initWA() {
    if (!wafloat) return;
    if (!HAS_GSAP) { wafloat.classList.add('is-visible'); return; }

    ScrollTrigger.create({
      trigger: heroSection, start: 'bottom 85%', end: 'max',
      onToggle: function (self) { waPastHero = self.isActive; updateWA(); }
    });
    ScrollTrigger.create({
      trigger: '#contato', start: 'top bottom', endTrigger: '.footer', end: 'bottom top',
      onToggle: function (self) { waContact = self.isActive; updateWA(); }
    });
    if (REDUCE) updateWA();
  }

  /* ------------------------------------------------------------------ */
  /* 15b. Pré-formulário → monta a mensagem e abre o WhatsApp             */
  /* ------------------------------------------------------------------ */
  var WA_NUMBER = '5511961147268'; // mesmo número usado nos links do site

  function initPreForm() {
    var form = document.getElementById('preform');
    if (!form) return;

    var fNome = document.getElementById('pf-nome');
    var fNec = document.getElementById('pf-necessidade');
    var fHist = document.getElementById('pf-historia');
    var okBox = document.getElementById('preform-ok');
    var fallback = document.getElementById('preform-fallback');

    function setError(field, errEl, msg) {
      var wrap = field.closest('.field');
      errEl.textContent = msg || '';
      if (msg) wrap.classList.add('is-error');
      else wrap.classList.remove('is-error');
      field.setAttribute('aria-invalid', msg ? 'true' : 'false');
    }

    // limpa o erro enquanto a pessoa digita
    [fNome, fNec].forEach(function (field) {
      field.addEventListener('input', function () {
        var wrap = field.closest('.field');
        if (wrap.classList.contains('is-error')) {
          wrap.classList.remove('is-error');
          wrap.querySelector('.field__err').textContent = '';
          field.setAttribute('aria-invalid', 'false');
        }
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var nome = (fNome.value || '').trim();
      var nec = (fNec.value || '').trim();
      var hist = (fHist.value || '').trim();

      var errNome = document.getElementById('err-nome');
      var errNec = document.getElementById('err-necessidade');

      var bad = [];
      if (nome.length < 2) {
        setError(fNome, errNome, 'Escreva o seu nome para a Daniela saber quem está chamando.');
        bad.push(fNome);
      } else setError(fNome, errNome, '');

      if (nec.length < 5) {
        setError(fNec, errNec, 'Conte um pouquinho mais sobre a necessidade — pode ser com as suas palavras.');
        bad.push(fNec);
      } else setError(fNec, errNec, '');

      if (bad.length) {
        if (HAS_GSAP && !REDUCE) {
          gsap.fromTo(bad[0].closest('.field'), { x: -6 }, { x: 0, duration: .5, ease: 'elastic.out(1, .4)' });
        }
        bad[0].focus();
        return;
      }

      var msg = 'Olá, Daniela! Tudo bem?\n\n' +
        'Meu nome é ' + nome + '.\n\n' +
        '*Qual é a necessidade:*\n' + nec + '\n\n' +
        (hist ? '*Um pouco sobre a história clínica:*\n' + hist + '\n\n' : '') +
        'Podemos conversar?';

      var url = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg);

      if (url.length > 2000) {
        setError(fNec, errNec, 'O texto ficou muito longo para o WhatsApp. Tente resumir um pouco.');
        fNec.focus();
        return;
      }

      if (fallback) fallback.setAttribute('href', url);
      var win = window.open(url, '_blank', 'noopener,noreferrer');

      if (okBox) {
        okBox.hidden = false;
        if (HAS_GSAP && !REDUCE) {
          gsap.fromTo(okBox, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .8, ease: 'power4.out' });
        }
        if (!win) okBox.scrollIntoView({ block: 'nearest', behavior: REDUCE ? 'auto' : 'smooth' });
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* 16. Re-split no resize                                              */
  /* ------------------------------------------------------------------ */
  function initResize() {
    var t = null;
    var lastW = window.innerWidth;
    window.addEventListener('resize', function () {
      if (window.innerWidth === lastW && window.matchMedia('(orientation: portrait)').matches) return;
      lastW = window.innerWidth;
      window.clearTimeout(t);
      t = window.setTimeout(function () {
        if (HAS_SPLIT && heroIntroDone && heroSplit) {
          heroSplit.revert();
          heroSplit = null;
          buildHeroLines();
          if (heroSplit) gsap.set(heroSplit.lines, { yPercent: 0 });
        }
        buildMarquee();
        if (HAS_GSAP) ScrollTrigger.refresh();
      }, 250);
    });
  }

  /* ------------------------------------------------------------------ */
  /* 17. Boot                                                            */
  /* ------------------------------------------------------------------ */
  function boot() {
    initLenis();
    initAnchors();
    initMenu();
    initCursor();
    initMagnets();

    var startHero = function () {
      heroIntro();
      if (!navUnlocked) navUnlocked = true;
    };

    if (html.classList.contains('intro-on') && HAS_GSAP) {
      runIntro(startHero);
    } else {
      html.classList.remove('intro-on');
      var intro = $('#intro');
      if (intro) intro.remove();
      startHero();
    }

    if (!LIBS || REDUCE) {
      navUnlocked = true;
      heroIntroDone = true;
      if (nav) nav.style.transform = 'none';
      html.classList.add('no-anim');
    }

    initHeroScroll();
    initGallery();
    initImages();
    initReveals();
    initMarquee();
    initNav();
    initWA();
    initPreForm();
    initResize();

    // SplitText só depois das fontes prontas
    fontsReady().then(function () {
      initManifesto();
      initSplitLines();
      if (HAS_GSAP) ScrollTrigger.refresh();
    });

    // refresh depois das fontes e do load
    if (HAS_GSAP) {
      fontsReady().then(function () { ScrollTrigger.refresh(); });
      window.addEventListener('load', function () { ScrollTrigger.refresh(); });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
