// Сторонні JS-бібліотеки (ЛР №10, оптимізовано в ЛР №12): Swiper.js, Fancybox v5, Typed.js.
// Swiper і Fancybox потрібні лише нижче першого екрана, тому їхні стилі та скрипти завантажуються з CDN
// на вимогу, коли користувач наближається до відгуків або галереї. Так вони не сповільнюють перший показ сторінки.
// Усе виконується після побудови DOM; якщо CDN недоступний, сторінка працює без ефектів.
document.addEventListener('DOMContentLoaded', () => {
  // користувачі з увімкненою опцією «зменшити рух» не отримують автопрогортання і друкування
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // файли з CDN із фіксованими версіями та контрольними сумами (SRI): змінений файл браузер не виконає
  const CDN = {
    swiperCss: {
      url: 'https://cdn.jsdelivr.net/npm/swiper@11.2.10/swiper-bundle.min.css',
      integrity: 'sha384-gAPqlBuTCdtVcYt9ocMOYWrnBZ4XSL6q+4eXqwNycOr4iFczhNKtnYhF3NEXJM51',
    },
    swiperJs: {
      url: 'https://cdn.jsdelivr.net/npm/swiper@11.2.10/swiper-bundle.min.js',
      integrity: 'sha384-2UI1PfnXFjVMQ7/ZDEF70CR943oH3v6uZrFQGGqJYlvhh4g6z6uVktxYbOlAczav',
    },
    fancyboxCss: {
      url: 'https://cdn.jsdelivr.net/npm/@fancyapps/ui@5.0.36/dist/fancybox/fancybox.css',
      integrity: 'sha384-qlUhevqmCF5AxtnfkF0zXJClBzA6GJuX/UrLejCfE61bBGt+zo/My0AJ+ojVmUSb',
    },
    fancyboxJs: {
      url: 'https://cdn.jsdelivr.net/npm/@fancyapps/ui@5.0.36/dist/fancybox/fancybox.umd.js',
      integrity: 'sha384-BodKYo5iRmFaqEaP1o8AAu9hCHqLvNhSWEg12QF1IjPnl1SgsrwQMSMKUB4POJ18',
    },
  };

  // ---------- завантаження ресурсу один раз (повторний виклик повертає той самий Promise) ----------
  const requested = new Map();
  function load({ url, integrity }) {
    if (requested.has(url)) return requested.get(url);
    const isStyle = url.endsWith('.css');
    const element = document.createElement(isStyle ? 'link' : 'script');
    const promise = new Promise((resolve, reject) => {
      element.addEventListener('load', resolve);
      element.addEventListener('error', () => reject(new Error('Не вдалося завантажити ' + url)));
    });
    if (isStyle) {
      element.rel = 'stylesheet';
      element.href = url;
    } else {
      element.src = url;
    }
    element.integrity = integrity;
    element.crossOrigin = 'anonymous';
    document.head.append(element);
    requested.set(url, promise);
    return promise;
  }

  // викликає callback один раз, коли секція за 600 px від екрана (або отримала фокус чи дотик раніше)
  function whenNear(section, callback) {
    if (!section) return;
    let done = false;
    const run = () => {
      if (done) return;
      done = true;
      callback();
    };
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            observer.disconnect();
            run();
          }
        },
        { rootMargin: '600px 0px' },
      );
      observer.observe(section);
    } else {
      run();
    }
    section.addEventListener('focusin', run, { once: true });
    section.addEventListener('pointerdown', run, { once: true });
  }

  const quiet = () => {}; // помилка мережі не повинна зупиняти інші скрипти сторінки

  // ---------- Typed.js: ефект друкування в Hero (запуск у вільний момент, щоб не затримувати перший показ) ----------
  const typedTarget = document.getElementById('typed-text');
  if (typedTarget && typeof Typed !== 'undefined' && !calm) {
    const startTyped = () =>
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
    if ('requestIdleCallback' in window) window.requestIdleCallback(startTyped, { timeout: 2000 });
    else setTimeout(startTyped, 200);
  }

  // ---------- Swiper.js ----------
  const loadSwiper = () => {
    load(CDN.swiperCss).catch(quiet);
    return load(CDN.swiperJs);
  };

  // зупиняє автопрогортання, поки у слайдері фокус клавіатури (WCAG 2.2.2)
  const pauseOnFocus = (swiper) => {
    if (!swiper.autoplay || !swiper.autoplay.running) return;
    swiper.el.addEventListener('focusin', () => swiper.autoplay.stop());
    swiper.el.addEventListener('focusout', () => swiper.autoplay.start());
  };

  // слайдер відгуків (5 слайдів)
  function initReviews() {
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
  }

  // галерея з перемиканням стрілками (6 зображень)
  function initGallery() {
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
  }

  // ---------- Fancybox v5: перегляд зображень альбому на весь екран ----------
  function bindFancybox() {
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

  // ---------- запуск на вимогу ----------
  whenNear(document.getElementById('reviews'), () => {
    loadSwiper().then(initReviews).catch(quiet);
  });
  whenNear(document.getElementById('gallery'), () => {
    loadSwiper().then(initGallery).catch(quiet);
    load(CDN.fancyboxCss).catch(quiet);
    load(CDN.fancyboxJs).then(bindFancybox).catch(quiet);
  });
});
