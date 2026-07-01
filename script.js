/* =============================================
   script.js — Administración Profesional
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ─────────────────────────────────────────
     BARRA DE PROGRESO DE SCROLL
  ───────────────────────────────────────── */
  const progressBar = document.getElementById('scroll-progress');
  const header      = document.getElementById('header');
  const backToTop   = document.getElementById('back-to-top');

  function updateScroll() {
    const scrolled = window.scrollY;
    const total    = document.documentElement.scrollHeight - window.innerHeight;
    if (progressBar) progressBar.style.width = total > 0 ? `${(scrolled / total) * 100}%` : '0%';
    if (header)      header.classList.toggle('scrolled', scrolled > 60);
    if (backToTop)   backToTop.classList.toggle('visible', scrolled > 400);
  }
  window.addEventListener('scroll', updateScroll, { passive: true });
  updateScroll();

  /* ─────────────────────────────────────────
     BOTÓN VOLVER ARRIBA
  ───────────────────────────────────────── */
  backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ─────────────────────────────────────────
     MENÚ HAMBURGUESA
  ───────────────────────────────────────── */
  const hamburger  = document.getElementById('hamburger');
  const mainNav    = document.getElementById('main-nav');
  const navOverlay = document.getElementById('nav-overlay');

  function isMobile() { return window.innerWidth <= 900; }

  function openNav() {
    if (!mainNav || !hamburger) return;
    mainNav.classList.add('open');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    if (navOverlay) { navOverlay.classList.add('visible'); navOverlay.setAttribute('aria-hidden', 'false'); }
    document.body.style.overflow = 'hidden';
  }

  function closeNav() {
    if (!mainNav || !hamburger) return;
    mainNav.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    if (navOverlay) { navOverlay.classList.remove('visible'); navOverlay.setAttribute('aria-hidden', 'true'); }
    document.body.style.overflow = '';
  }

  hamburger?.addEventListener('click', (e) => {
    e.stopPropagation();
    mainNav?.classList.contains('open') ? closeNav() : openNav();
  });

  navOverlay?.addEventListener('click', closeNav);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mainNav?.classList.contains('open')) closeNav();
  });

  // Cerrar al seleccionar link en móvil
  mainNav?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => { if (isMobile()) closeNav(); });
  });

  // Cerrar si se redimensiona a desktop
  window.addEventListener('resize', () => {
    if (!isMobile() && mainNav?.classList.contains('open')) closeNav();
  });

  /* ─────────────────────────────────────────
     ACTIVE NAV LINK on SCROLL
  ───────────────────────────────────────── */
  const navLinks = document.querySelectorAll('.nav-link:not(.nav-cta)');
  const sections = [...document.querySelectorAll('section[id]')];

  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.35, rootMargin: `-${getComputedStyle(document.documentElement).getPropertyValue('--header-h') || '76px'} 0px -40% 0px` });

  sections.forEach(s => sectionObserver.observe(s));

  /* ─────────────────────────────────────────
     HERO CARRUSEL
  ───────────────────────────────────────── */
  const slides      = document.querySelectorAll('.hero-slide');
  const indicators  = document.querySelectorAll('.indicator');
  const prevBtn     = document.getElementById('carousel-prev');
  const nextBtn     = document.getElementById('carousel-next');
  let currentSlide  = 0;
  let autoplayTimer = null;

  function goToSlide(index) {
    if (!slides.length) return;
    // Reset animaciones del slide saliente
    slides[currentSlide].querySelectorAll('.animate-el').forEach(el => {
      el.style.animation = 'none';
    });
    slides[currentSlide].classList.remove('active');
    slides[currentSlide].setAttribute('aria-hidden', 'true');
    indicators[currentSlide]?.classList.remove('active');
    indicators[currentSlide]?.setAttribute('aria-selected', 'false');

    currentSlide = (index + slides.length) % slides.length;

    slides[currentSlide].classList.add('active');
    slides[currentSlide].setAttribute('aria-hidden', 'false');
    indicators[currentSlide]?.classList.add('active');
    indicators[currentSlide]?.setAttribute('aria-selected', 'true');

    // Reiniciar animaciones del slide entrante
    slides[currentSlide].querySelectorAll('.animate-el').forEach(el => {
      el.style.animation = 'none';
      void el.offsetWidth;
      el.style.animation = '';
    });

    // Reiniciar zoom de imagen
    const bg = slides[currentSlide].querySelector('.slide-bg');
    if (bg) { bg.style.animation = 'none'; void bg.offsetWidth; bg.style.animation = ''; }
  }

  function startAutoplay() {
    clearInterval(autoplayTimer);
    autoplayTimer = setInterval(() => goToSlide(currentSlide + 1), 5500);
  }

  prevBtn?.addEventListener('click', () => { goToSlide(currentSlide - 1); startAutoplay(); });
  nextBtn?.addEventListener('click', () => { goToSlide(currentSlide + 1); startAutoplay(); });
  indicators.forEach((dot, i) => dot.addEventListener('click', () => { goToSlide(i); startAutoplay(); }));

  // Swipe táctil en hero
  let heroTouchStart = 0;
  const carousel = document.getElementById('hero-carousel');
  carousel?.addEventListener('touchstart', e => { heroTouchStart = e.touches[0].clientX; }, { passive: true });
  carousel?.addEventListener('touchend', e => {
    const diff = heroTouchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { goToSlide(diff > 0 ? currentSlide + 1 : currentSlide - 1); startAutoplay(); }
  }, { passive: true });

  if (slides.length > 0) startAutoplay();

  /* ─────────────────────────────────────────
     ANIMACIONES DE SCROLL
  ───────────────────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
  revealEls.forEach(el => revealObs.observe(el));

  /* ─────────────────────────────────────────
     CONTADORES ANIMADOS
  ───────────────────────────────────────── */
  const statNumbers = document.querySelectorAll('.stat-number');
  let countersStarted = false;

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    const start  = performance.now();
    const dur    = 2000;
    function update(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target).toLocaleString('es-MX') + suffix;
      if (p < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const statsSection = document.getElementById('estadisticas');
  if (statsSection) {
    new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !countersStarted) {
        countersStarted = true;
        statNumbers.forEach(el => animateCounter(el));
      }
    }, { threshold: 0.3 }).observe(statsSection);
  }

  /* ─────────────────────────────────────────
     SLIDER DE TESTIMONIOS (grupos de 2)
  ───────────────────────────────────────── */
  const tTrack      = document.getElementById('testimonials-track');
  const tPrev       = document.getElementById('t-prev');
  const tNext       = document.getElementById('t-next');
  const tIndicators = document.getElementById('t-indicators');
  const tGroups     = tTrack ? [...tTrack.querySelectorAll('.testimonials-group')] : [];
  let tCurrent      = 0;
  let tTimer        = null;

  function isMobileSlider() { return window.innerWidth <= 640; }

  function getTotalSlides() {
    // En móvil: 1 tarjeta por "slide" (cada grupo tiene 1 tarjeta visible)
    // En desktop: 1 grupo por slide (2 tarjetas)
    return tGroups.length;
  }

  function buildTDots() {
    if (!tIndicators) return;
    tIndicators.innerHTML = '';
    const total = getTotalSlides();
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('button');
      dot.className = 't-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Grupo ${i + 1}`);
      dot.addEventListener('click', () => { goToT(i); resetTTimer(); });
      tIndicators.appendChild(dot);
    }
  }

  function goToT(index) {
    const total = getTotalSlides();
    tCurrent = ((index % total) + total) % total;
    tTrack.style.transform = `translateX(-${tCurrent * 100}%)`;
    tIndicators?.querySelectorAll('.t-dot').forEach((d, i) => d.classList.toggle('active', i === tCurrent));
  }

  function resetTTimer() {
    clearInterval(tTimer);
    tTimer = setInterval(() => goToT(tCurrent + 1), 6000);
  }

  if (tTrack && tGroups.length > 0) {
    tPrev?.addEventListener('click', () => { goToT(tCurrent - 1); resetTTimer(); });
    tNext?.addEventListener('click', () => { goToT(tCurrent + 1); resetTTimer(); });

    // Swipe táctil
    let tTouchX = 0;
    tTrack.addEventListener('touchstart', e => { tTouchX = e.touches[0].clientX; }, { passive: true });
    tTrack.addEventListener('touchend', e => {
      const diff = tTouchX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) { goToT(diff > 0 ? tCurrent + 1 : tCurrent - 1); resetTTimer(); }
    }, { passive: true });

    buildTDots();
    resetTTimer();
  }

  /* ─────────────────────────────────────────
     ACCORDION FAQ
  ───────────────────────────────────────── */
  document.querySelectorAll('.accordion-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const panel    = btn.nextElementSibling;
      const expanded = btn.getAttribute('aria-expanded') === 'true';

      // Cerrar todos
      document.querySelectorAll('.accordion-btn').forEach(b => {
        b.setAttribute('aria-expanded', 'false');
        const p = b.nextElementSibling;
        if (p) p.classList.remove('open');
      });

      // Abrir el clickeado si estaba cerrado
      if (!expanded && panel) {
        btn.setAttribute('aria-expanded', 'true');
        panel.classList.add('open');
      }
    });
  });

  /* ─────────────────────────────────────────
     FORMULARIO — WhatsApp
  ───────────────────────────────────────── */
  const form = document.getElementById('contact-form');
  if (form) {
    const WA_NUMBER = '5215544705244';

    function validateField(field) {
      const errorEl = field.parentElement.querySelector('.form-error');
      let msg = '';
      if (field.required && !field.value.trim()) {
        msg = 'Este campo es obligatorio.';
      } else if (field.type === 'email' && field.value.trim()) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim())) msg = 'Correo inválido.';
      } else if (field.tagName === 'SELECT' && field.required && !field.value) {
        msg = 'Seleccione una opción.';
      }
      field.classList.toggle('error', !!msg);
      if (errorEl) errorEl.textContent = msg;
      return !msg;
    }

    form.querySelectorAll('input, select, textarea').forEach(f => {
      f.addEventListener('blur', () => validateField(f));
      f.addEventListener('input', () => { if (f.classList.contains('error')) validateField(f); });
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      const fields = form.querySelectorAll('input[required], select[required], textarea[required]');
      let valid = true;
      fields.forEach(f => { if (!validateField(f)) valid = false; });
      if (!valid) { form.querySelector('.error')?.focus(); return; }

      const text = [
        'Hola, me comunico desde su página web.',
        '',
        `*Nombre:* ${form.nombre.value.trim()}`,
        form.empresa.value.trim() ? `*Empresa:* ${form.empresa.value.trim()}` : null,
        `*Correo:* ${form.correo.value.trim()}`,
        form.telefono.value.trim() ? `*Teléfono:* ${form.telefono.value.trim()}` : null,
        `*Servicio:* ${form.servicio.value}`,
        '',
        `*Mensaje:*\n${form.mensaje.value.trim()}`
      ].filter(l => l !== null).join('\n');

      window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');

      const span = form.querySelector('[type="submit"] span');
      if (span) {
        const orig = span.textContent;
        span.textContent = '¡Enviado!';
        setTimeout(() => {
          span.textContent = orig;
          form.reset();
          form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
        }, 3000);
      }
    });
  }

  /* ─────────────────────────────────────────
     SMOOTH ANCHOR LINKS
  ───────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ─────────────────────────────────────────
     LAZY LOADING FALLBACK
  ───────────────────────────────────────── */
  if (!('loading' in HTMLImageElement.prototype)) {
    const lazyImgs = document.querySelectorAll('img[loading="lazy"]');
    const imgObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) img.src = img.dataset.src;
          imgObs.unobserve(img);
        }
      });
    });
    lazyImgs.forEach(img => imgObs.observe(img));
  }

});
