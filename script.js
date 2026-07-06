/* =============================================
   script.js — Administración Profesional
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ─────────────────────────────────────────
     PANTALLA DE CARGA / TRANSICIÓN ENTRE PÁGINAS
  ───────────────────────────────────────── */
  const pageLoader = document.getElementById('page-loader');
  const loaderStart = performance.now();
  const LOADER_MIN_MS = 550;   // tiempo mínimo visible para que no "parpadee"
  const LOADER_MAX_MS = 4000;  // respaldo por si 'load' nunca dispara

  function hideLoader() {
    if (pageLoader) pageLoader.classList.add('hidden');
  }
  function showLoader() {
    if (pageLoader) pageLoader.classList.remove('hidden');
  }

  if (pageLoader) {
    window.addEventListener('load', () => {
      const elapsed = performance.now() - loaderStart;
      setTimeout(hideLoader, Math.max(0, LOADER_MIN_MS - elapsed));
    });
    setTimeout(hideLoader, LOADER_MAX_MS);

    // Transición al navegar a otra página del sitio (no anclas, no externos)
    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;
      if (href.startsWith('#')) return;                         // ancla en la misma página
      if (href.startsWith('http://') || href.startsWith('https://')) return; // enlaces externos (WhatsApp, redes, etc.)
      if (href.startsWith('mailto:') || href.startsWith('tel:')) return;
      if (link.target === '_blank' || link.hasAttribute('download')) return;

      link.addEventListener('click', e => {
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1) return;
        e.preventDefault();
        showLoader();
        setTimeout(() => { window.location.href = href; }, 420);
      });
    });
  }

  /* ─────────────────────────────────────────
     BARRA DE PROGRESO + HEADER SCROLL
  ───────────────────────────────────────── */
  const progressBar = document.getElementById('scroll-progress');
  const header      = document.getElementById('header');
  const backToTop   = document.getElementById('back-to-top');

  function updateScroll() {
    const scrolled = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    if (progressBar) progressBar.style.width = total > 0 ? `${(scrolled / total) * 100}%` : '0%';
    if (header)    header.classList.toggle('scrolled', scrolled > 60);
    if (backToTop) backToTop.classList.toggle('visible', scrolled > 400);
  }
  window.addEventListener('scroll', updateScroll, { passive: true });
  updateScroll();

  backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ─────────────────────────────────────────
     MENÚ MÓVIL (drawer independiente)
  ───────────────────────────────────────── */
  const hamburger   = document.getElementById('hamburger');
  const mobileNav   = document.getElementById('main-nav-mobile');
  const navOverlay  = document.getElementById('nav-overlay');

  function openMenu() {
    mobileNav.classList.add('is-open');
    navOverlay.classList.add('visible');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileNav.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    mobileNav.classList.remove('is-open');
    navOverlay.classList.remove('visible');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileNav.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  hamburger?.addEventListener('click', () => {
    mobileNav?.classList.contains('is-open') ? closeMenu() : openMenu();
  });

  navOverlay?.addEventListener('click', closeMenu);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });

  // Cerrar al pulsar cualquier enlace del menú móvil
  mobileNav?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => closeMenu());
  });

  // Si viewport sube a desktop con menú abierto → cerrarlo
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) closeMenu();
  });

  /* ─────────────────────────────────────────
     ACTIVE NAV LINK AL HACER SCROLL
  ───────────────────────────────────────── */
  const desktopLinks = document.querySelectorAll('#main-nav-desktop .nav-link:not(.nav-cta)');
  const sections     = [...document.querySelectorAll('section[id]')];

  const secObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        desktopLinks.forEach(l => {
          l.classList.toggle('active', l.getAttribute('href') === `#${entry.target.id}`);
        });
      }
    });
  }, { threshold: 0.3 });
  sections.forEach(s => secObs.observe(s));

  /* ─────────────────────────────────────────
     HERO CARRUSEL
  ───────────────────────────────────────── */
  const slides     = document.querySelectorAll('.hero-slide');
  const indicators = document.querySelectorAll('.indicator');
  const prevBtn    = document.getElementById('carousel-prev');
  const nextBtn    = document.getElementById('carousel-next');
  let current  = 0;
  let heroTimer = null;

  function goToSlide(idx) {
    if (!slides.length) return;
    slides[current].querySelectorAll('.animate-el').forEach(el => { el.style.animation = 'none'; });
    slides[current].classList.remove('active');
    slides[current].setAttribute('aria-hidden', 'true');
    indicators[current]?.classList.remove('active');

    current = ((idx % slides.length) + slides.length) % slides.length;

    slides[current].classList.add('active');
    slides[current].setAttribute('aria-hidden', 'false');
    indicators[current]?.classList.add('active');

    slides[current].querySelectorAll('.animate-el').forEach(el => {
      el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
    });
    const bg = slides[current].querySelector('.slide-bg');
    if (bg) { bg.style.animation = 'none'; void bg.offsetWidth; bg.style.animation = ''; }
  }

  function heroAutoplay() {
    clearInterval(heroTimer);
    heroTimer = setInterval(() => goToSlide(current + 1), 5500);
  }

  prevBtn?.addEventListener('click', () => { goToSlide(current - 1); heroAutoplay(); });
  nextBtn?.addEventListener('click', () => { goToSlide(current + 1); heroAutoplay(); });
  indicators.forEach((dot, i) => dot.addEventListener('click', () => { goToSlide(i); heroAutoplay(); }));

  let hTouchX = 0;
  document.getElementById('hero-carousel')?.addEventListener('touchstart', e => { hTouchX = e.touches[0].clientX; }, { passive: true });
  document.getElementById('hero-carousel')?.addEventListener('touchend', e => {
    const d = hTouchX - e.changedTouches[0].clientX;
    if (Math.abs(d) > 50) { goToSlide(d > 0 ? current + 1 : current - 1); heroAutoplay(); }
  }, { passive: true });

  if (slides.length) heroAutoplay();

  /* ─────────────────────────────────────────
     ANIMACIONES DE SCROLL
  ───────────────────────────────────────── */
  const revEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
  const revObs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revObs.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
  revEls.forEach(el => revObs.observe(el));

  /* ─────────────────────────────────────────
     CONTADORES ANIMADOS
  ───────────────────────────────────────── */
  let countered = false;
  const statEls = document.querySelectorAll('.stat-number');
  function animateNum(el) {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    const t0 = performance.now();
    (function tick(now) {
      const p = Math.min((now - t0) / 2000, 1);
      el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target).toLocaleString('es-MX') + suffix;
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }
  const statsEl = document.getElementById('estadisticas');
  if (statsEl) {
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !countered) { countered = true; statEls.forEach(animateNum); }
    }, { threshold: 0.3 }).observe(statsEl);
  }

  /* ─────────────────────────────────────────
     SLIDER TESTIMONIOS (grupos de 2)
  ───────────────────────────────────────── */
  const tTrack  = document.getElementById('testimonials-track');
  const tGroups = tTrack ? [...tTrack.querySelectorAll('.testimonials-group')] : [];
  const tPrev   = document.getElementById('t-prev');
  const tNext   = document.getElementById('t-next');
  const tDots   = document.getElementById('t-indicators');
  let tCur = 0, tTimer = null;

  function goT(idx) {
    tCur = ((idx % tGroups.length) + tGroups.length) % tGroups.length;
    if (tTrack) tTrack.style.transform = `translateX(-${tCur * 100}%)`;
    tDots?.querySelectorAll('.t-dot').forEach((d, i) => d.classList.toggle('active', i === tCur));
  }

  function tAutoplay() { clearInterval(tTimer); tTimer = setInterval(() => goT(tCur + 1), 6000); }

  if (tGroups.length) {
    // Crear dots
    tGroups.forEach((_, i) => {
      const d = document.createElement('button');
      d.className = 't-dot' + (i === 0 ? ' active' : '');
      d.setAttribute('aria-label', `Grupo ${i + 1}`);
      d.addEventListener('click', () => { goT(i); tAutoplay(); });
      tDots?.appendChild(d);
    });

    tPrev?.addEventListener('click', () => { goT(tCur - 1); tAutoplay(); });
    tNext?.addEventListener('click', () => { goT(tCur + 1); tAutoplay(); });

    let tTX = 0;
    tTrack?.addEventListener('touchstart', e => { tTX = e.touches[0].clientX; }, { passive: true });
    tTrack?.addEventListener('touchend', e => {
      const d = tTX - e.changedTouches[0].clientX;
      if (Math.abs(d) > 50) { goT(d > 0 ? tCur + 1 : tCur - 1); tAutoplay(); }
    }, { passive: true });

    tAutoplay();
  }

  /* ─────────────────────────────────────────
     ACCORDION FAQ
  ───────────────────────────────────────── */
  document.querySelectorAll('.accordion-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      document.querySelectorAll('.accordion-btn').forEach(b => {
        b.setAttribute('aria-expanded', 'false');
        b.nextElementSibling?.classList.remove('open');
      });
      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        btn.nextElementSibling?.classList.add('open');
      }
    });
  });

  /* ─────────────────────────────────────────
     FORMULARIO → WHATSAPP
  ───────────────────────────────────────── */
  const form = document.getElementById('contact-form');
  if (form) {
    const WA = '5215544705244';

    function validate(f) {
      const err = f.parentElement.querySelector('.form-error');
      let msg = '';
      if (f.required && !f.value.trim()) msg = 'Este campo es obligatorio.';
      else if (f.type === 'email' && f.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value)) msg = 'Correo inválido.';
      else if (f.tagName === 'SELECT' && f.required && !f.value) msg = 'Seleccione una opción.';
      f.classList.toggle('error', !!msg);
      if (err) err.textContent = msg;
      return !msg;
    }

    form.querySelectorAll('input,select,textarea').forEach(f => {
      f.addEventListener('blur', () => validate(f));
      f.addEventListener('input', () => { if (f.classList.contains('error')) validate(f); });
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      let ok = true;
      form.querySelectorAll('input[required],select[required],textarea[required]').forEach(f => { if (!validate(f)) ok = false; });
      if (!ok) { form.querySelector('.error')?.focus(); return; }

      const lines = [
        'Hola, me comunico desde su página web.', '',
        `*Nombre:* ${form.nombre.value.trim()}`,
        form.empresa.value.trim() ? `*Empresa:* ${form.empresa.value.trim()}` : null,
        `*Correo:* ${form.correo.value.trim()}`,
        form.telefono.value.trim() ? `*Teléfono:* ${form.telefono.value.trim()}` : null,
        `*Servicio:* ${form.servicio.value}`, '',
        `*Mensaje:*\n${form.mensaje.value.trim()}`
      ].filter(l => l !== null).join('\n');

      window.open(`https://wa.me/${WA}?text=${encodeURIComponent(lines)}`, '_blank', 'noopener');

      const span = form.querySelector('[type="submit"] span');
      if (span) {
        const orig = span.textContent;
        span.textContent = '¡Enviado!';
        setTimeout(() => { span.textContent = orig; form.reset(); }, 3000);
      }
    });
  }

  /* ─────────────────────────────────────────
     SMOOTH SCROLL PARA ANCLAS
  ───────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });

});
