// Спільна поведінка сторінок Coin Flow: мобільне меню, випадне меню, форми підписки.
(() => {
  // ---------- мобільне меню (details/summary): закривається після вибору пункту, по Esc і кліку поза меню ----------
  const mobileMenu = document.querySelector('header details');
  if (mobileMenu) {
    const close = () => mobileMenu.removeAttribute('open');
    mobileMenu.addEventListener('click', (event) => {
      if (event.target.closest('a')) close();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && mobileMenu.open) {
        close();
        mobileMenu.querySelector('summary').focus();
      }
    });
    document.addEventListener('click', (event) => {
      if (mobileMenu.open && !mobileMenu.contains(event.target)) close();
    });
  }

  // ---------- випадне меню «Більше»: aria-expanded і закриття по Esc ----------
  const dropdown = document.querySelector('header li.group');
  if (dropdown) {
    const toggle = dropdown.querySelector('button');
    const setExpanded = (value) => toggle.setAttribute('aria-expanded', String(value));
    setExpanded(false);
    dropdown.addEventListener('mouseenter', () => setExpanded(true));
    dropdown.addEventListener('mouseleave', () => setExpanded(dropdown.matches(':focus-within')));
    dropdown.addEventListener('focusin', () => setExpanded(true));
    dropdown.addEventListener('focusout', (event) => {
      if (!dropdown.contains(event.relatedTarget)) setExpanded(dropdown.matches(':hover'));
    });
    dropdown.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        document.activeElement.blur();
        setExpanded(false);
      }
    });
  }

  // ---------- фон Hero: спочатку легке зображення (15 КБ), відео (1,6 МБ) підставляється після першої дії користувача ----------
  const heroImage = document.querySelector('img[data-video]');
  if (heroImage) {
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const saveData = navigator.connection && navigator.connection.saveData; // режим заощадження трафіку
    const startVideo = () => {
      const video = document.createElement('video');
      video.className = heroImage.className;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.setAttribute('aria-hidden', 'true');
      video.poster = heroImage.currentSrc || heroImage.src;
      // зображення замінюється лише тоді, коли відео вже готове грати: без миготіння порожнього кадру
      video.addEventListener('canplay', () => {
        heroImage.replaceWith(video);
        video.play().catch(() => {}); // якщо браузер заборонив автозапуск, лишається перший кадр
      }, { once: true });
      video.src = heroImage.dataset.video;
      video.load();
    };
    if (!calm && !saveData) {
      // Чекаємо першої дії користувача (рух миші, дотик, прокрутка, клавіша): до цього моменту
      // браузер уже показав перший екран, і відео не конкурує з важливими ресурсами
      const events = ['pointermove', 'pointerdown', 'touchstart', 'keydown', 'scroll'];
      const onFirstAction = () => {
        events.forEach((name) => window.removeEventListener(name, onFirstAction));
        startVideo();
      };
      events.forEach((name) => window.addEventListener(name, onFirstAction, { passive: true }));
    }
  }

  // ---------- форми підписки (ранній доступ, розсилка): валідація email і повідомлення про успіх ----------
  document.querySelectorAll('form[data-subscribe]').forEach((form) => {
    const email = form.querySelector('input[type="email"]');
    if (!email) return;

    let message = form.parentElement.querySelector('[data-subscribe-message]');
    if (!message) {
      message = document.createElement('p');
      message.setAttribute('data-subscribe-message', '');
      message.setAttribute('role', 'status');
      message.className = 'mt-3 text-sm font-semibold text-brand-300';
      form.insertAdjacentElement('afterend', message);
    }

    email.addEventListener('invalid', () => {
      email.setCustomValidity(
        email.validity.valueMissing ? 'Вкажіть адресу email.' : 'Email має бути у форматі name@example.com.',
      );
    });
    email.addEventListener('input', () => {
      email.setCustomValidity('');
      message.textContent = '';
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      message.textContent = `Дякуємо! Ми надішлемо лист на ${email.value.trim()}.`;
      form.reset();
    });
  });
})();
