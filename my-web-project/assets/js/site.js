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
