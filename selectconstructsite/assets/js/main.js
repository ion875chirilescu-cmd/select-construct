/* ==========================================================================
   SELECT CONSTRUCT — scripturi site
   Fără dependențe externe. Tot ce e configurabil se află în CONFIG.
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     CONFIGURARE — modifică doar aici
     ------------------------------------------------------------------ */
  var CONFIG = {
    // Adresa pe care ajung solicitările din formular (metoda implicită: mailto).
    email: 'contactselectconstruct.md@gmail.com',

    // Numărul afișat în mesajele formularului (eroare de trimitere, exemplu de format).
    phone: '076 986 728',

    // Adresa care primește cererile din formular. Pe Vercel, funcția din
    // site/api/oferta.js le salvează în baza de date Neon.
    // Dacă adresa nu răspunde — site-ul e găzduit altundeva, fără funcții —
    // formularul revine automat la deschiderea clientului de e-mail.
    // Golește câmpul ca să folosești direct varianta cu e-mail.
    formEndpoint: '/api/oferta',

    // Moneda afișată în calculator (lei moldovenești).
    currency: 'lei',

    // Formatarea cifrelor (separator de mii).
    locale: 'ro-MD'
  };

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ------------------------------------------------------------------
     1. TEMĂ (luminos / întunecat)
     ------------------------------------------------------------------ */
  function initTheme() {
    var toggle = $('.theme-toggle');
    if (!toggle) return;

    toggle.addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('sc-theme', next); } catch (e) { /* stocare indisponibilă */ }
      var meta = $('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', next === 'dark' ? '#0E0E0E' : '#F6F4F0');
    });
  }

  /* ------------------------------------------------------------------
     2. NAVIGAȚIE MOBILĂ
     ------------------------------------------------------------------ */
  function initNav() {
    var toggle = $('.nav-toggle');
    var nav = $('#site-nav');
    if (!toggle || !nav) return;

    function close() {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Deschide meniul');
    }

    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Închide meniul' : 'Deschide meniul');
    });

    $$('a', nav).forEach(function (link) { link.addEventListener('click', close); });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { close(); toggle.focus(); }
    });

    // dincolo de 1100px navigația e din nou orizontală, deci închidem panoul
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1100) close();
    });
  }

  /* ------------------------------------------------------------------
     3. HEADER LIPIT + LINK ACTIV
     ------------------------------------------------------------------ */
  function initHeader() {
    var header = $('.site-header');
    if (header) {
      var onScroll = function () {
        header.classList.toggle('is-stuck', window.scrollY > 8);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    var links = $$('.site-nav a');
    var sections = links
      .map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); })
      .filter(Boolean);

    if (!sections.length || !('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(function (s) { observer.observe(s); });
  }

  /* ------------------------------------------------------------------
     4. APARIȚIE LA DERULARE
     ------------------------------------------------------------------ */
  function initReveal() {
    var targets = $$('.section-head, .services, .step, .work, .testimonial, .faq-item, .feature, .quote-card, .mini-stats, .calc-form, .calc-result, .contact-form, .contact-list, .ba-wrap');
    if (reduceMotion || !('IntersectionObserver' in window)) return;

    targets.forEach(function (el) { el.classList.add('reveal'); });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        setTimeout(function () { el.classList.add('is-visible'); }, Math.min(i, 5) * 70);
        observer.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .12 });

    targets.forEach(function (el) { observer.observe(el); });
  }

  /* ------------------------------------------------------------------
     5. CONTOARE (cifrele din hero)
     ------------------------------------------------------------------ */
  function initCounters() {
    var nums = $$('.stats strong[data-count]');
    if (!nums.length) return;

    var suffix = function (el) { return el.getAttribute('data-suffix') || ''; };

    if (reduceMotion || !('IntersectionObserver' in window)) {
      nums.forEach(function (n) { n.textContent = n.getAttribute('data-count') + suffix(n); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.getAttribute('data-count'), 10) || 0;
        var start = null;
        var duration = 1100;

        function tick(ts) {
          if (start === null) start = ts;
          var p = Math.min((ts - start) / duration, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased).toLocaleString(CONFIG.locale) + suffix(el);
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        observer.unobserve(el);
      });
    }, { threshold: .5 });

    nums.forEach(function (n) { n.textContent = '0' + suffix(n); observer.observe(n); });
  }

  /* ------------------------------------------------------------------
     6. FILTRARE LUCRĂRI
     ------------------------------------------------------------------ */
  function initGallery() {
    var chips = $$('.filters .chip');
    var works = $$('#gallery .work');
    if (!chips.length || !works.length) return;

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var filter = chip.getAttribute('data-filter');

        chips.forEach(function (c) {
          var active = c === chip;
          c.classList.toggle('is-active', active);
          c.setAttribute('aria-selected', String(active));
        });

        works.forEach(function (work) {
          var show = filter === 'toate' || work.getAttribute('data-cat') === filter;
          work.classList.toggle('is-hidden', !show);
        });
      });
    });
  }

  /* ------------------------------------------------------------------
     7. COMPARAȚIE ÎNAINTE / DUPĂ
     ------------------------------------------------------------------ */
  function initBeforeAfter() {
    var range = $('#baRange');
    var before = $('#baBefore');
    var handle = $('#baHandle');
    if (!range || !before || !handle) return;

    function update() {
      var v = Number(range.value);
      before.style.clipPath = 'inset(0 ' + (100 - v) + '% 0 0)';
      handle.style.left = v + '%';
    }
    range.addEventListener('input', update);
    update();
  }

  /* ------------------------------------------------------------------
     8. CALCULATOR DE PREȚ (orientativ, doar manoperă)
     ------------------------------------------------------------------
     min / max  = lei per mp, manoperă
     days       = zile lucrătoare per mp
     mat        = factor pentru estimarea materialelor de bază
     ------------------------------------------------------------------ */
  var AREA_HINTS = {
    utila:  'Suprafața utilă a locuinței (mp de pardoseală).',
    montaj: 'Suprafața efectivă de montaj (mp acoperiți).'
  };

  var RATES = {
    renovare:   { min: 1200, max: 2200, days: 0.55, mat: 0.55, basis: 'utila',  label: 'Renovare completă' },
    zugravit:   { min: 380,  max: 600,  days: 0.09, mat: 0.30, basis: 'utila',  label: 'Zugrăveli' },
    baie:       { min: 3200, max: 5500, days: 2.00, mat: 0.50, basis: 'utila',  label: 'Baie la cheie' },
    bucatarie:  { min: 1900, max: 3300, days: 0.90, mat: 0.42, basis: 'utila',  label: 'Bucătărie la cheie' },
    gresie:     { min: 230,  max: 390,  days: 0.16, mat: 0.35, basis: 'montaj', label: 'Gresie / faianță' },
    parchet:    { min: 110,  max: 190,  days: 0.07, mat: 0.25, basis: 'montaj', label: 'Parchet' },
    rigips:     { min: 280,  max: 480,  days: 0.20, mat: 0.85, basis: 'montaj', label: 'Gips-carton' },
    instalatii: { min: 400,  max: 700,  days: 0.22, mat: 0.65, basis: 'utila',  label: 'Instalații' }
  };

  // rotunjire „de deviz": cu cât suma e mai mare, cu atât pasul e mai mare
  function niceRound(value) {
    var step = value >= 20000 ? 500 : value >= 5000 ? 100 : 50;
    return Math.round(value / step) * step;
  }

  function formatLei(value) {
    return Math.round(value).toLocaleString(CONFIG.locale);
  }

  function initCalculator() {
    var form = $('#calcForm');
    if (!form) return;

    var typeEl   = $('#calcType');
    var areaEl   = $('#calcArea');
    var areaOut  = $('#calcAreaOut');
    var areaHint = $('#calcAreaHint');
    var demoEl   = $('#calcDemo');

    var minEl  = $('#calcMin');
    var maxEl  = $('#calcMax');
    var perEl  = $('#calcPer');
    var daysEl = $('#calcDays');
    var matEl  = $('#calcMat');

    function level() {
      var checked = form.querySelector('input[name="calcLevel"]:checked');
      return checked ? parseFloat(checked.value) : 1;
    }

    function update() {
      var rate = RATES[typeEl.value] || RATES.renovare;
      var area = Number(areaEl.value);
      var mult = level();
      var demolition = demoEl.checked;

      areaOut.textContent = area;
      if (areaHint) areaHint.textContent = AREA_HINTS[rate.basis];

      var min = rate.min * area * mult;
      var max = rate.max * area * mult;

      if (demolition) { min *= 1.12; max *= 1.15; }

      // rotunjim ca să nu pară un preț „exact"
      min = niceRound(min);
      max = niceRound(max);

      var days = Math.max(2, Math.ceil(area * rate.days * (demolition ? 1.18 : 1)));
      var materials = niceRound(((min + max) / 2) * rate.mat);

      minEl.textContent = formatLei(min);
      maxEl.textContent = formatLei(max);
      perEl.textContent = formatLei((min + max) / 2 / area);

      var daysText = days + ' zile';
      if (days >= 10) daysText += ' (≈ ' + Math.round(days / 5) + ' săpt.)';
      daysEl.textContent = daysText;
      matEl.textContent = '≈ ' + formatLei(materials) + ' ' + CONFIG.currency;
    }

    form.addEventListener('input', update);
    form.addEventListener('change', update);
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    update();
  }

  /* ------------------------------------------------------------------
     9. FORMULAR DE CONTACT
     ------------------------------------------------------------------ */
  function initContactForm() {
    var form = $('#contactForm');
    if (!form) return;

    var status = $('#formStatus');
    // numere din Republica Moldova: mobil (06x, 07x) și fix Chișinău (022),
    // scrise local (069 123 456) sau internațional (+373 69 123 456)
    var phoneRe = /^(\+?373[\s.-]?|0)(6\d|7[6-9]|22)[\s.-]?\d{3}[\s.-]?\d{3}$/;
    var emailRe = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

    function setError(field, message) {
      var wrapper = field.closest('.field') || field.closest('.checkbox') || field.parentElement;
      var box = document.querySelector('[data-error-for="' + field.id + '"]');
      if (wrapper) wrapper.classList.toggle('has-error', Boolean(message));
      if (box) box.textContent = message || '';
      field.setAttribute('aria-invalid', message ? 'true' : 'false');
      return !message;
    }

    function validate() {
      var ok = true;
      var name = $('#fName'), phone = $('#fPhone'), email = $('#fEmail');
      var type = $('#fType'), area = $('#fArea'), gdpr = $('#fGdpr');

      ok = setError(name, name.value.trim().length < 3 ? 'Scrie numele tău complet.' : '') && ok;
      ok = setError(phone, phoneRe.test(phone.value.trim()) ? '' : 'Număr de telefon invalid (ex: ' + CONFIG.phone + ').') && ok;
      ok = setError(email, email.value.trim() && !emailRe.test(email.value.trim()) ? 'Adresa de e-mail nu pare corectă.' : '') && ok;
      ok = setError(type, type.value ? '' : 'Alege tipul lucrării.') && ok;

      var areaValue = Number(area.value);
      ok = setError(area, area.value && (!areaValue || areaValue <= 0) ? 'Introdu o suprafață validă.' : '') && ok;
      ok = setError(gdpr, gdpr.checked ? '' : 'Avem nevoie de acordul tău ca să te putem contacta.') && ok;

      return ok;
    }

    function collect() {
      var data = {};
      new FormData(form).forEach(function (value, key) { data[key] = value; });
      return data;
    }

    function buildBody(data) {
      return [
        'Solicitare ofertă — selectconstruct.md',
        '',
        'Nume: ' + (data.nume || '—'),
        'Telefon: ' + (data.telefon || '—'),
        'E-mail: ' + (data.email || '—'),
        'Tip lucrare: ' + (data.lucrare || '—'),
        'Suprafață: ' + (data.suprafata ? data.suprafata + ' mp' : '—'),
        '',
        'Detalii:',
        data.mesaj || '—'
      ].join('\n');
    }

    function show(message, kind) {
      status.textContent = message;
      status.className = 'form-status ' + (kind || '');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // capcană pentru roboți: dacă e completat, ne oprim în tăcere
      if ($('#fWebsite').value) return;

      if (!validate()) {
        show('Mai sunt câmpuri de corectat.', 'err');
        var firstError = form.querySelector('.has-error input, .has-error select, [aria-invalid="true"]');
        if (firstError) firstError.focus();
        return;
      }

      var data = collect();
      var button = form.querySelector('button[type="submit"]');

      if (!CONFIG.formEndpoint) { trimitePrinEmail(data); return; }

      button.disabled = true;
      show('Se trimite...', '');

      fetch(CONFIG.formEndpoint, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (corp) {
            return { res: res, corp: corp };
          });
        })
        .then(function (r) {
          if (r.res.ok) {
            form.reset();
            show('Mulțumim! Te contactăm în aceeași zi lucrătoare.', 'ok');
            return;
          }
          // 400 și 429 vin cu explicații scrise pentru vizitator; le arătăm.
          // Restul înseamnă că adresa nu există sau serverul e picat — atunci
          // nu-l lăsăm pe om cu mâna în aer, ci trecem pe e-mail.
          if (r.res.status === 400 || r.res.status === 429) {
            show(r.corp.eroare || 'Verifică datele introduse.', 'err');
          } else {
            trimitePrinEmail(data);
          }
        })
        .catch(function () {
          // fără rețea sau adresa lipsește cu totul (site găzduit fără funcții)
          trimitePrinEmail(data);
        })
        .then(function () { button.disabled = false; });
    });

    /** Varianta de rezervă: deschide clientul de e-mail cu mesajul pregătit. */
    function trimitePrinEmail(data) {
      var subiect = 'Cerere ofertă — ' + (data.lucrare || 'lucrare interioară');
      window.location.href = 'mailto:' + CONFIG.email +
        '?subject=' + encodeURIComponent(subiect) +
        '&body=' + encodeURIComponent(buildBody(data));

      show('Am pregătit mesajul în aplicația ta de e-mail. Dacă nu s-a deschis, ' +
           'scrie-ne la ' + CONFIG.email + ' sau sună la ' + CONFIG.phone + '.', 'ok');
    }

    // curățăm eroarea imediat ce omul corectează câmpul
    var errored = false;
    form.addEventListener('submit', function () { errored = true; }, true);
    $$('input, select, textarea', form).forEach(function (field) {
      ['input', 'change'].forEach(function (evt) {
        field.addEventListener(evt, function () {
          if (errored) validate();
        });
      });
    });
  }

  /* ------------------------------------------------------------------
     10. FOTOGRAFII OPȚIONALE
     ------------------------------------------------------------------
     Miniaturile din portofoliu și imaginea din hero au fiecare o fotografie
     pre-legată. Dacă fișierul există în assets/img/lucrari/, o arătăm; dacă
     lipsește, scoatem elementul și rămâne desenul de dedesubt. Așa se pot
     adăuga poze doar copiindu-le în folder, fără să se atingă HTML-ul.
     ------------------------------------------------------------------ */
  function initPhotos() {
    $$('.work-img img, .hero-photo').forEach(function (img) {
      var arata  = function () { img.classList.add('is-ready'); };
      var renunt = function () { img.remove(); };

      if (img.complete) {
        (img.naturalWidth > 0 ? arata : renunt)();
      } else {
        img.addEventListener('load', arata);
        img.addEventListener('error', renunt);
      }
    });
  }

  /* ------------------------------------------------------------------
     11. AN CURENT ÎN FOOTER
     ------------------------------------------------------------------ */
  function initYear() {
    var el = $('#year');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ------------------------------------------------------------------
     PORNIRE
     ------------------------------------------------------------------ */
  function init() {
    initTheme();
    initNav();
    initHeader();
    initReveal();
    initCounters();
    initGallery();
    initBeforeAfter();
    initCalculator();
    initContactForm();
    initPhotos();
    initYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
