

(function() {
  "use strict";

  /**
   * Apply .scrolled class to the body as the page is scrolled down
   */
  function toggleScrolled() {
    const selectBody = document.querySelector('body');
    const selectHeader = document.querySelector('#header');
    if (!selectHeader.classList.contains('scroll-up-sticky') && !selectHeader.classList.contains('sticky-top') && !selectHeader.classList.contains('fixed-top')) return;
    window.scrollY > 100 ? selectBody.classList.add('scrolled') : selectBody.classList.remove('scrolled');
  }

  document.addEventListener('scroll', toggleScrolled);
  window.addEventListener('load', toggleScrolled);

  /**
   * Mobile nav toggle
   */
  const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');
  const mobileNav = document.querySelector('#navmenu');
  const mobileNavList = document.querySelector('#navmenu > ul');

  function setMobileNavState(isOpen) {
    const body = document.querySelector('body');
    body.classList.toggle('mobile-nav-active', isOpen);

    if (mobileNav) {
      mobileNav.classList.toggle('navmenu-open', isOpen);
    }

    if (mobileNavToggleBtn) {
      mobileNavToggleBtn.classList.toggle('bi-list', !isOpen);
      mobileNavToggleBtn.classList.toggle('bi-x', isOpen);
      mobileNavToggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }

    if (mobileNavList) {
      mobileNavList.style.display = isOpen ? 'block' : '';
      mobileNavList.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    }
  }

  function mobileNavToogle() {
    setMobileNavState(!document.querySelector('body').classList.contains('mobile-nav-active'));
  }
  if (mobileNavToggleBtn) {
    mobileNavToggleBtn.addEventListener('click', mobileNavToogle);
    mobileNavToggleBtn.setAttribute('aria-label', 'Abrir menu');
    mobileNavToggleBtn.setAttribute('aria-expanded', 'false');
  }

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.querySelectorAll('#navmenu a').forEach(navmenu => {
    navmenu.addEventListener('click', () => {
      if (document.querySelector('.mobile-nav-active')) {
        setMobileNavState(false);
      }
    });

  });

  /**
   * Toggle mobile nav dropdowns
   */
  document.querySelectorAll('.navmenu .toggle-dropdown').forEach(navmenu => {
    navmenu.addEventListener('click', function(e) {
      e.preventDefault();
      this.parentNode.classList.toggle('active');
      this.parentNode.nextElementSibling.classList.toggle('dropdown-active');
      e.stopImmediatePropagation();
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1200) {
      setMobileNavState(false);
    }
  });

  /**
   * Booksy booking widget
   */
  const booksyConfig = {
    id: '1735115',
    country: 'us',
    lang: 'en',
    scriptUrl: 'https://booksy.com/widget/code.js?id=1735115&country=us&lang=en',
    fallbackUrl: 'https://booksy.com/en-us/1735115_isa-bellas-aesthetic_skin-care_36800_houston?do=invite'
  };

  let booksyScriptPromise;
  let booksyDialog;
  let lastBooksyTrigger;

  function loadBooksyScript() {
    if (booksyScriptPromise) return booksyScriptPromise;

    booksyScriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector('script[data-booksy-widget-script]');
      if (existingScript) {
        resolve();
        return;
      }

      const host = document.createElement('div');
      host.id = 'booksy-script-host';
      host.setAttribute('aria-hidden', 'true');
      document.body.appendChild(host);

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = booksyConfig.scriptUrl;
      script.async = true;
      script.dataset.booksyWidgetScript = 'true';
      script.onload = resolve;
      script.onerror = reject;
      host.appendChild(script);
    });

    return booksyScriptPromise;
  }

  function getBooksyDialog() {
    if (booksyDialog) return booksyDialog;

    booksyDialog = document.createElement('div');
    booksyDialog.className = 'booksy-modal';
    booksyDialog.setAttribute('role', 'dialog');
    booksyDialog.setAttribute('aria-modal', 'true');
    booksyDialog.setAttribute('aria-label', 'Reservar cita en Booksy');
    booksyDialog.innerHTML = `
      <div class="booksy-modal__panel">
        <button class="booksy-modal__close" type="button" aria-label="Cerrar reserva">&times;</button>
        <iframe class="booksy-modal__frame" title="Reserva tu cita en Booksy" loading="lazy"></iframe>
        <a class="booksy-modal__fallback" href="${booksyConfig.fallbackUrl}" target="_blank" rel="noopener">Abrir en Booksy</a>
      </div>
    `;
    document.body.appendChild(booksyDialog);

    booksyDialog.addEventListener('click', (event) => {
      if (event.target === booksyDialog || event.target.closest('.booksy-modal__close')) {
        closeBooksyDialog();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && booksyDialog.classList.contains('is-open')) {
        closeBooksyDialog();
      }
    });

    return booksyDialog;
  }

  function openFallbackBooksyDialog(trigger) {
    lastBooksyTrigger = trigger || document.activeElement;
    const dialog = getBooksyDialog();
    const frame = dialog.querySelector('.booksy-modal__frame');
    const widgetUrl = `https://booksy.com/widget/index.html?id=${booksyConfig.id}&country=${booksyConfig.country}&lang=${booksyConfig.lang}&mode=dialog&theme=default`;

    if (!frame.src) {
      frame.src = widgetUrl;
    }

    dialog.classList.add('is-open');
    document.body.classList.add('booksy-modal-active');
    dialog.querySelector('.booksy-modal__close').focus();
  }

  function preserveCurrentScroll(callback) {
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const restoreScroll = () => window.scrollTo(scrollX, scrollY);

    callback();
    restoreScroll();
    window.requestAnimationFrame(restoreScroll);
    window.setTimeout(restoreScroll, 60);
    window.setTimeout(restoreScroll, 250);
  }

  function openBooksyDialog(trigger) {
    lastBooksyTrigger = trigger || document.activeElement;

    if (trigger) {
      trigger.setAttribute('aria-busy', 'true');
    }

    loadBooksyScript()
      .then(() => {
        const widgetButton = document.querySelector('#booksy-script-host .booksy-widget-button');

        if (widgetButton) {
          preserveCurrentScroll(() => widgetButton.click());
          return;
        }

        openFallbackBooksyDialog(trigger);
      })
      .catch(() => {
        openFallbackBooksyDialog(trigger);
      })
      .finally(() => {
        if (trigger) {
          trigger.removeAttribute('aria-busy');
        }
      });
  }

  function closeBooksyDialog() {
    if (!booksyDialog) return;

    booksyDialog.classList.remove('is-open');
    document.body.classList.remove('booksy-modal-active');

    if (lastBooksyTrigger && typeof lastBooksyTrigger.focus === 'function') {
      lastBooksyTrigger.focus();
    }
  }

  document.querySelectorAll('a[href*="booksy.com"], .home-reserve-btn:not([href]), .hero-cta:not([href])').forEach((trigger) => {
    trigger.classList.add('js-booksy-trigger');
    trigger.setAttribute('role', trigger.hasAttribute('href') ? 'link' : 'button');
    trigger.setAttribute('tabindex', trigger.getAttribute('tabindex') || '0');

    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      openBooksyDialog(trigger);
      setMobileNavState(false);
    });

    trigger.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openBooksyDialog(trigger);
        setMobileNavState(false);
      }
    });
  });

  /**
   * Preloader
   */
  const preloader = document.querySelector('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove();
    });
  }

  /**
   * Scroll top button
   */
  let scrollTop = document.querySelector('.scroll-top');

  function toggleScrollTop() {
    if (scrollTop) {
      window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }
  }
  if (scrollTop) {
    scrollTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  window.addEventListener('load', toggleScrollTop);
  document.addEventListener('scroll', toggleScrollTop);

  /**
   * Animation on scroll function and init
   */
  function aosInit() {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }
  window.addEventListener('load', aosInit);

  /**
   * Initiate glightbox
   */
  const glightbox = GLightbox({
    selector: '.glightbox'
  });

  /**
   * Initiate Pure Counter
   */
  new PureCounter();

  /**
   * Init isotope layout and filters
   */
  document.querySelectorAll('.isotope-layout').forEach(function(isotopeItem) {
    let layout = isotopeItem.getAttribute('data-layout') ?? 'masonry';
    let filter = isotopeItem.getAttribute('data-default-filter') ?? '*';
    let sort = isotopeItem.getAttribute('data-sort') ?? 'original-order';

    let initIsotope;
    imagesLoaded(isotopeItem.querySelector('.isotope-container'), function() {
      initIsotope = new Isotope(isotopeItem.querySelector('.isotope-container'), {
        itemSelector: '.isotope-item',
        layoutMode: layout,
        filter: filter,
        sortBy: sort
      });
    });

    isotopeItem.querySelectorAll('.isotope-filters li').forEach(function(filters) {
      filters.addEventListener('click', function() {
        isotopeItem.querySelector('.isotope-filters .filter-active').classList.remove('filter-active');
        this.classList.add('filter-active');
        initIsotope.arrange({
          filter: this.getAttribute('data-filter')
        });
        if (typeof aosInit === 'function') {
          aosInit();
        }
      }, false);
    });

  });

  /**
   * Init swiper sliders
   */
  function initSwiper() {
    document.querySelectorAll(".init-swiper").forEach(function(swiperElement) {
      let config = JSON.parse(
        swiperElement.querySelector(".swiper-config").innerHTML.trim()
      );

      if (swiperElement.classList.contains("swiper-tab")) {
        initSwiperWithCustomPagination(swiperElement, config);
      } else {
        new Swiper(swiperElement, config);
      }
    });
  }

  window.addEventListener("load", initSwiper);

  /**
   * Frequently Asked Questions Toggle
   */
  document.querySelectorAll('.faq-item h3, .faq-item .faq-toggle, .faq-item .faq-header').forEach((faqItem) => {
    faqItem.addEventListener('click', () => {
      faqItem.parentNode.classList.toggle('faq-active');
    });
  });

})();
