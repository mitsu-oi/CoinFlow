// Ініціалізація сторонніх JS-бібліотек (ЛР №10): Swiper.js, Fancybox v5, Typed.js.
// Самі бібліотеки підключені через CDN у index.html перед </body>, цей файл — після них.
// Усе виконується після побудови DOM (DOMContentLoaded); якщо CDN недоступний, сторінка працює без ефектів.
document.addEventListener('DOMContentLoaded', () => {
  // користувачі з увімкненою опцією «зменшити рух» не отримують автопрогортання і друкування
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Typed.js: ефект друкування в Hero ----------
  const typedTarget = document.getElementById('typed-text');
  if (typedTarget && typeof Typed !== 'undefined' && !calm) {
    new Typed('#typed-text', {
      strings: [
        'Безпечний ліміт на кожен день.',
        'Сценарії накопичення без складних таблиць.',
        'Розрахунок у вашому браузері, без реєстрації.',
      ],
      typeSpeed: 45, // швидкість друку, мс
      backSpeed: 25, // швидкість стирання
      backDelay: 2200, // пауза перед стиранням
      startDelay: 400,
      smartBackspace: true, // стирає лише ту частину, що відрізняється від наступного рядка
      loop: true,
    });
  }

  if (typeof Swiper === 'undefined') return;

  // зупиняє автопрогортання, поки у слайдері фокус клавіатури (WCAG 2.2.2)
  const pauseOnFocus = (swiper) => {
    if (!swiper.autoplay || !swiper.autoplay.running) return;
    swiper.el.addEventListener('focusin', () => swiper.autoplay.stop());
    swiper.el.addEventListener('focusout', () => swiper.autoplay.start());
  };

  // ---------- Swiper.js: слайдер відгуків (5 слайдів) ----------
  const reviews = new Swiper('.reviews-swiper', {
    loop: true,
    spaceBetween: 24,
    autoplay: calm
      ? false
      : {
          delay: 3500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true, // зупинка при наведенні миші
        },
    pagination: { el: '.reviews-pagination', clickable: true },
    navigation: { prevEl: '.reviews-prev', nextEl: '.reviews-next' },
    // адаптивність: телефон — 1 слайд, планшет — 2, десктоп — 3
    breakpoints: {
      320: { slidesPerView: 1 },
      768: { slidesPerView: 2 },
      1024: { slidesPerView: 3 },
    },
    a11y: {
      containerMessage: 'Слайдер відгуків',
      containerRoleDescriptionMessage: 'слайдер',
      itemRoleDescriptionMessage: 'слайд',
      slideLabelMessage: 'Відгук {{index}} з {{slidesLength}}',
      paginationBulletMessage: 'Перейти до відгуку {{index}}',
    },
  });
  pauseOnFocus(reviews);

  // ---------- Swiper.js: галерея з перемиканням стрілками (6 зображень) ----------
  const gallery = new Swiper('.gallery-swiper', {
    rewind: true, // з останнього слайда — на перший (без дублікатів, які зламали б альбом Fancybox)
    spaceBetween: 24,
    autoplay: calm
      ? false
      : {
          delay: 4500,
          disableOnInteraction: true, // після ручного гортання автопрогортання вимикається
          pauseOnMouseEnter: true,
        },
    pagination: { el: '.gallery-pagination', clickable: true },
    navigation: { prevEl: '.gallery-prev', nextEl: '.gallery-next' },
    breakpoints: {
      320: { slidesPerView: 1 },
      768: { slidesPerView: 2 },
      1024: { slidesPerView: 3 },
    },
    a11y: {
      containerMessage: 'Галерея зображень',
      containerRoleDescriptionMessage: 'слайдер',
      itemRoleDescriptionMessage: 'слайд',
      slideLabelMessage: 'Зображення {{index}} з {{slidesLength}}',
      paginationBulletMessage: 'Перейти до зображення {{index}}',
    },
  });
  pauseOnFocus(gallery);

  // ---------- Fancybox v5: перегляд зображень альбому на весь екран ----------
  // Бібліотека (стилі та скрипт, ~50 КБ) потрібна лише в галереї, тому завантажується на вимогу:
  // коли користувач наближається до секції або ставить фокус на зображення.
  const FANCYBOX = {
    css: 'https://cdn.jsdelivr.net/npm/@fancyapps/ui@5.0.36/dist/fancybox/fancybox.css',
    cssIntegrity: 'sha384-qlUhevqmCF5AxtnfkF0zXJClBzA6GJuX/UrLejCfE61bBGt+zo/My0AJ+ojVmUSb',
    js: 'https://cdn.jsdelivr.net/npm/@fancyapps/ui@5.0.36/dist/fancybox/fancybox.umd.js',
    jsIntegrity: 'sha384-BodKYo5iRmFaqEaP1o8AAu9hCHqLvNhSWEg12QF1IjPnl1SgsrwQMSMKUB4POJ18',
  };
  let fancyboxRequested = false;

  function bindFancybox() {
    if (typeof Fancybox === 'undefined') return;
    Fancybox.bind('[data-fancybox="coinflow-gallery"]', {
      Carousel: { transition: 'fade' }, // плавне згасання між зображеннями
      Images: { Panzoom: { maxScale: 3 } }, // збільшення до 3×
      Thumbs: { autoStart: true },
      Toolbar: { display: { left: ['infobar'], right: ['thumbs', 'close'] } },
      l10n: {
        CLOSE: 'Закрити',
        NEXT: 'Наступне',
        PREV: 'Попереднє',
        MODAL: 'Закрити це вікно можна клавішею Esc',
        ERROR: 'Щось пішло не так. Спробуйте пізніше',
        IMAGE_ERROR: 'Зображення не знайдено',
        ELEMENT_NOT_FOUND: 'Елемент не знайдено',
        TOGGLE_ZOOM: 'Змінити масштаб',
        TOGGLE_THUMBS: 'Мініатюри',
        TOGGLE_SLIDESHOW: 'Слайдшоу',
        TOGGLE_FULLSCREEN: 'На весь екран',
        DOWNLOAD: 'Завантажити',
      },
    });
  }

  function loadFancybox() {
    if (fancyboxRequested) return;
    fancyboxRequested = true;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = FANCYBOX.css;
    link.integrity = FANCYBOX.cssIntegrity;
    link.crossOrigin = 'anonymous';
    const script = document.createElement('script');
    script.src = FANCYBOX.js;
    script.integrity = FANCYBOX.jsIntegrity;
    script.crossOrigin = 'anonymous';
    script.addEventListener('load', bindFancybox);
    document.head.append(link, script);
  }

  const gallerySection = document.getElementById('gallery');
  if (gallerySection) {
    if ('IntersectionObserver' in window) {
      // починаємо завантаження за 600 px до появи галереї на екрані
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            loadFancybox();
            observer.disconnect();
          }
        },
        { rootMargin: '600px 0px' },
      );
      observer.observe(gallerySection);
    } else {
      loadFancybox();
    }
    // запасний шлях: фокус клавіатури чи дотик до галереї до спрацювання спостерігача
    gallerySection.addEventListener('focusin', loadFancybox, { once: true });
    gallerySection.addEventListener('pointerdown', loadFancybox, { once: true });
  }
});
