/* ═══════════════════════════════════════════════════════
   PORTFOLIO — SCRIPT.JS
   ═══════════════════════════════════════════════════════ */

'use strict';

/* ── Helpers ─────────────────────────────────────────── */
const qs  = (sel, root = document) => root.querySelector(sel);
const qsa = (sel, root = document) => [...root.querySelectorAll(sel)];

/* ════════════════════════════════════════════════════════
   1. NAVBAR — shrink on scroll + active link highlight
   ════════════════════════════════════════════════════════ */
(function initNavbar () {
  const navbar = qs('#navbar');
  const links  = qsa('.nav-links a');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
    highlightActiveLink();
  }, { passive: true });

  function highlightActiveLink () {
    const scrollMid = window.scrollY + window.innerHeight / 2;
    qsa('section[id]').forEach(sec => {
      if (scrollMid >= sec.offsetTop && scrollMid < sec.offsetTop + sec.offsetHeight) {
        links.forEach(a => a.classList.remove('active'));
        const active = links.find(a => a.getAttribute('href') === `#${sec.id}`);
        if (active) active.classList.add('active');
      }
    });
  }

  /* Hamburger — toggle .open class (CSS handles the rest) */
  const hamburger = qs('#hamburger');
  const navLinks  = qs('.nav-links');
  hamburger?.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('active', isOpen);
    /* Animate bars → X */
    const [a, b, c] = hamburger.querySelectorAll('span');
    if (isOpen) {
      a.style.transform = 'translateY(7px) rotate(45deg)';
      b.style.opacity   = '0';
      c.style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      a.style.transform = b.style.opacity = c.style.transform = '';
    }
  });

  /* Close menu when a nav link is tapped */
  navLinks?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger?.querySelectorAll('span').forEach(s => s.style = '');
    });
  });

  /* Close menu on outside click */
  document.addEventListener('click', e => {
    if (!navbar.contains(e.target)) {
      navLinks?.classList.remove('open');
      hamburger?.querySelectorAll('span').forEach(s => s.style = '');
    }
  });
})();

/* ════════════════════════════════════════════════════════
   2. TYPED TEXT EFFECT (hero)
   ════════════════════════════════════════════════════════ */
(function initTyped () {
  const el = qs('#typed');
  if (!el) return;

  /* ← Edit these to match your actual roles */
  const words = [
    'amazing web apps.',
    'intuitive UIs.',
    'scalable backends.',
    'delightful experiences.',
  ];

  let wIdx = 0, cIdx = 0, deleting = false;

  function tick () {
    const word    = words[wIdx];
    el.textContent = deleting ? word.slice(0, cIdx--) : word.slice(0, cIdx++);

    let delay = deleting ? 60 : 100;

    if (!deleting && cIdx > word.length) {
      delay   = 1800;
      deleting = true;
    } else if (deleting && cIdx < 0) {
      deleting = false;
      wIdx     = (wIdx + 1) % words.length;
      cIdx     = 0;
      delay    = 300;
    }

    setTimeout(tick, delay);
  }

  tick();
})();

/* ════════════════════════════════════════════════════════
   3. SCROLL REVEAL — IntersectionObserver
   ════════════════════════════════════════════════════════ */
(function initReveal () {
  /* Add .reveal to every section child that should animate in */
  const targets = qsa(
    '.skill-card, .project-card, .timeline-item, .testimonial-card, ' +
    '.highlight-item, .about-card, .soft-item, .tool-pill, ' +
    '.contact-info-item'
  );

  targets.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${(i % 6) * 60}ms`;
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        /* trigger skill bar fill */
        if (entry.target.classList.contains('skill-card')) {
          entry.target.classList.add('visible');
        }
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach(el => observer.observe(el));
})();

/* ════════════════════════════════════════════════════════
   4. SKILLS TABS
   ════════════════════════════════════════════════════════ */
(function initTabs () {
  const btns     = qsa('.tab-btn');
  const contents = qsa('.tab-content');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      btns.forEach(b => b.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      qs(`#tab-${target}`)?.classList.add('active');
    });
  });
})();

/* ════════════════════════════════════════════════════════
   5. PROJECT FILTER
   ════════════════════════════════════════════════════════ */
(function initFilter () {
  const btns  = qsa('.filter-btn');
  const cards = qsa('.project-card');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      cards.forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;
        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        if (match) {
          card.style.opacity   = '1';
          card.style.transform = 'scale(1)';
          card.style.display   = '';
        } else {
          card.style.opacity   = '0';
          card.style.transform = 'scale(0.95)';
          setTimeout(() => { if (!match) card.style.display = 'none'; }, 300);
        }
      });
    });
  });
})();

/* ════════════════════════════════════════════════════════
   6. PROJECT CARD LINKS
   ════════════════════════════════════════════════════════ */
(function initProjectLinks () {
  const linkedCards = qsa('.project-card[data-url]');
  if (!linkedCards.length) return;

  const openCardLink = card => {
    const url = card.dataset.url;
    if (url) window.open(url, '_blank', 'noopener');
  };

  linkedCards.forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('a, button')) return;
      openCardLink(card);
    });

    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openCardLink(card);
      }
    });
  });
})();

/* ════════════════════════════════════════════════════════
   7. CONTACT FORM — Formspree real submission
   ════════════════════════════════════════════════════════ */
(function initForm () {
  const form    = qs('#contact-form');
  const success = qs('#form-success');
  const error   = qs('#form-error');
  const submit  = qs('#form-submit');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    submit.textContent = 'Sending…';
    submit.disabled    = true;
    success.classList.add('hidden');
    error.classList.add('hidden');

    try {
      const res = await fetch(form.action, {
        method:  'POST',
        body:    new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        form.reset();
        success.classList.remove('hidden');
        setTimeout(() => success.classList.add('hidden'), 6000);
      } else {
        error.classList.remove('hidden');
      }
    } catch {
      error.classList.remove('hidden');
    } finally {
      submit.textContent = 'Send Message →';
      submit.disabled    = false;
    }
  });
})();

/* ════════════════════════════════════════════════════════
   8. FOOTER YEAR
   ════════════════════════════════════════════════════════ */
const yearEl = qs('#footer-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ════════════════════════════════════════════════════════
   9. CUSTOM CURSOR (desktop only)
   ════════════════════════════════════════════════════════ */
(function initCursor () {
  if (window.matchMedia('(pointer: coarse)').matches) return; /* skip touch */

  const outer = document.createElement('div');
  const inner = document.createElement('div');
  outer.className = 'cursor-outer';
  inner.className = 'cursor-inner';
  document.body.append(outer, inner);

  /* Inject cursor CSS dynamically */
  const style = document.createElement('style');
  style.textContent = `
    body { cursor: none; }
    a, button, [role="button"], input, textarea, label { cursor: none; }

    .cursor-outer {
      position: fixed; pointer-events: none; z-index: 9999;
      width: 36px; height: 36px;
      border: 2px solid rgba(168,85,247,0.6);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      transition: width .25s, height .25s, border-color .25s, opacity .3s;
      will-change: transform;
    }
    .cursor-inner {
      position: fixed; pointer-events: none; z-index: 9999;
      width: 8px; height: 8px;
      background: var(--primary-2, #a855f7);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      transition: width .15s, height .15s, opacity .3s;
      will-change: transform;
    }
    .cursor-outer.hovered {
      width: 50px; height: 50px;
      border-color: rgba(6,182,212,0.7);
    }
    .cursor-inner.hovered { width: 12px; height: 12px; }
    .cursor-outer.clicking { width: 26px; height: 26px; }
  `;
  document.head.append(style);

  let mx = 0, my = 0, ox = 0, oy = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    inner.style.left = mx + 'px';
    inner.style.top  = my + 'px';
  });

  /* Smooth follow for outer ring */
  (function loop () {
    ox += (mx - ox) * 0.14;
    oy += (my - oy) * 0.14;
    outer.style.left = ox + 'px';
    outer.style.top  = oy + 'px';
    requestAnimationFrame(loop);
  })();

  /* Hover state on interactive elements */
  document.addEventListener('mouseover', e => {
    if (e.target.closest('a, button, input, textarea, [role="button"]')) {
      outer.classList.add('hovered');
      inner.classList.add('hovered');
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest('a, button, input, textarea, [role="button"]')) {
      outer.classList.remove('hovered');
      inner.classList.remove('hovered');
    }
  });
  document.addEventListener('mousedown', () => outer.classList.add('clicking'));
  document.addEventListener('mouseup',   () => outer.classList.remove('clicking'));
})();

/* ════════════════════════════════════════════════════════
   10. SMOOTH PARALLAX on hero orbs
   ════════════════════════════════════════════════════════ */
(function initParallax () {
  const orbs = qsa('.orb');
  if (!orbs.length) return;

  window.addEventListener('mousemove', e => {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;

    orbs.forEach((orb, i) => {
      const factor = (i + 1) * 12;
      orb.style.transform = `translate(${dx * factor}px, ${dy * factor}px)`;
    });
  }, { passive: true });
})();

/* ════════════════════════════════════════════════════════
   11. STAT COUNTER ANIMATION
   ════════════════════════════════════════════════════════ */
(function initCounters () {
  const stats = qsa('.stat-num');
  if (!stats.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el   = entry.target;
      const text = el.textContent.trim();
      /* Extract leading number */
      const num  = parseInt(text.match(/\d+/)?.[0], 10);
      if (isNaN(num)) return;
      const suffix = text.replace(/\d+/, '');
      let   cur    = 0;
      const step   = Math.ceil(num / 40);
      const timer  = setInterval(() => {
        cur = Math.min(cur + step, num);
        el.textContent = cur + suffix;
        if (cur >= num) clearInterval(timer);
      }, 30);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  stats.forEach(el => observer.observe(el));
})();

/* ════════════════════════════════════════════════════════
   12. SCROLL PROGRESS BAR
   ════════════════════════════════════════════════════════ */
(function initProgressBar () {
  const bar = document.createElement('div');
  bar.style.cssText = `
    position: fixed; top: 0; left: 0; z-index: 200;
    height: 3px; width: 0%;
    background: linear-gradient(90deg, #7c3aed, #06b6d4);
    transition: width 0.1s linear;
    pointer-events: none;
  `;
  document.body.prepend(bar);

  window.addEventListener('scroll', () => {
    const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
    bar.style.width = pct + '%';
  }, { passive: true });
})();

/* ════════════════════════════════════════════════════════
   13. GLOWING CARD EFFECT — mouse-tracking tilt on cards
   ════════════════════════════════════════════════════════ */
(function initCardTilt () {
  const cards = qsa('.project-card, .testimonial-card, .timeline-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `perspective(600px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s ease';
    });
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.1s ease';
    });
  });
})();
