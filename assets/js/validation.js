// Клієнтська валідація форми зворотного зв'язку (contact.html, ЛР №9).
// Ванільний JavaScript без бібліотек. Дані нікуди не надсилаються: після успішної перевірки
// показується модальне вікно з демонстрацією успішного надсилання.
(() => {
  const form = document.getElementById('feedbackForm');
  if (!form) return;

  // ---------- правила (RegEx) ----------
  // Ім'я: літери будь-якої мови (в т.ч. кирилиця), пробіл, апостроф, дефіс; 2–60 символів, починається з літери
  const REGEX_NAME = /^\p{L}[\p{L}\s'’-]{1,59}$/u;
  // Email: локальна частина @ домен . зона (мінімум 2 літери)
  const REGEX_EMAIL = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  // Телефон: строго +380 і ще рівно 9 цифр
  const REGEX_PHONE = /^\+380\d{9}$/;
  const MESSAGE_MIN = 10;

  const el = {
    username: document.getElementById('username'),
    email: document.getElementById('email'),
    phone: document.getElementById('phone'),
    message: document.getElementById('message'),
    agreement: document.getElementById('agreement'),
    status: document.getElementById('formStatus'),
  };
  const touched = new Set(); // поля, з якими користувач уже взаємодіяв (до цього помилки не показуємо)

  // ---------- UI-стани поля: normal / error / success ----------
  const errorOf = (input) => document.getElementById(input.id + 'Error');
  const okIconOf = (input) => input.parentElement.querySelector('[data-ok]');

  function clearError(input) {
    input.classList.remove('border-red-500', 'border-green-500');
    if (input.type !== 'checkbox') input.classList.add('border-slate-700');
    input.setAttribute('aria-invalid', 'false');
    const error = errorOf(input);
    error.textContent = '';
    error.classList.add('hidden');
    const icon = okIconOf(input);
    if (icon) icon.classList.add('hidden');
  }

  function showError(input, message) {
    clearError(input);
    input.classList.remove('border-slate-700');
    input.classList.add('border-red-500');
    input.setAttribute('aria-invalid', 'true');
    const error = errorOf(input);
    error.textContent = message;
    error.classList.remove('hidden');
  }

  function showSuccess(input) {
    clearError(input);
    if (input.type === 'checkbox') return;
    input.classList.remove('border-slate-700');
    input.classList.add('border-green-500');
    const icon = okIconOf(input);
    if (icon) icon.classList.remove('hidden');
  }

  // ---------- функції валідації: повертають повідомлення про помилку або '' ----------
  const checkName = () => {
    const value = el.username.value.trim();
    if (!value) return 'Вкажіть ім’я.';
    if (value.length < 2) return 'Ім’я має містити щонайменше 2 символи.';
    if (!REGEX_NAME.test(value)) return 'Ім’я може містити лише літери, пробіл, апостроф і дефіс.';
    return '';
  };
  const checkEmail = () => {
    const value = el.email.value.trim();
    if (!value) return 'Вкажіть електронну пошту.';
    return REGEX_EMAIL.test(value) ? '' : 'Введіть коректну електронну адресу, наприклад user@mail.com.';
  };
  const checkPhone = () => {
    const value = el.phone.value;
    if (!value) return 'Вкажіть номер телефону.';
    return REGEX_PHONE.test(value) ? '' : 'Номер має бути у форматі +380XXXXXXXXX (після +380 рівно 9 цифр).';
  };
  const checkMessage = () => {
    const length = el.message.value.trim().length;
    if (!length) return 'Напишіть повідомлення.';
    return length >= MESSAGE_MIN ? '' : `Повідомлення має містити щонайменше ${MESSAGE_MIN} символів (зараз ${length}).`;
  };
  const checkAgreement = () => (el.agreement.checked ? '' : 'Щоб надіслати форму, потрібна ваша згода.');

  const rules = {
    username: checkName,
    email: checkEmail,
    phone: checkPhone,
    message: checkMessage,
    agreement: checkAgreement,
  };

  // перевіряє поле й показує результат; повертає true, якщо поле коректне
  function validateField(key) {
    const input = el[key];
    const message = rules[key]();
    if (message) showError(input, message);
    else showSuccess(input);
    hideStatusIfFixed();
    return !message;
  }

  // підсумкове повідомлення під формою зникає, щойно жодне поле більше не має помилки
  function hideStatusIfFixed() {
    if (el.status.classList.contains('hidden')) return;
    if (form.querySelector('[aria-invalid="true"]')) return;
    el.status.textContent = '';
    el.status.classList.add('hidden');
  }
  const validateName = () => validateField('username');
  const validateEmail = () => validateField('email');
  const validatePhone = () => validateField('phone');
  const validateMessage = () => validateField('message');
  const validateAgreement = () => validateField('agreement');

  // ---------- телефон: безпечна нормалізація введення (Edge Cases) ----------
  // Прибираємо все, крім цифр (літери, пробіли, дужки, дефіси), «0…» -> «+380…», зайві цифри відкидаємо.
  function normalizePhone(raw) {
    let digits = raw.replace(/\D/g, '');
    if (!digits) return raw.trim().startsWith('+') ? '+' : '';
    if (!'380'.startsWith(digits.slice(0, 3))) {
      digits = digits.startsWith('0') ? '38' + digits : '380' + digits; // 0501234567 -> 380501234567; 501234567 -> 380501234567
    }
    return '+' + digits.slice(0, 12);
  }

  el.phone.addEventListener('input', () => {
    const normalized = normalizePhone(el.phone.value);
    if (normalized !== el.phone.value) el.phone.value = normalized;
  });

  // ---------- динамічна валідація: input -> оновлення вже показаного стану, blur -> фінальна перевірка ----------
  ['username', 'email', 'phone', 'message'].forEach((key) => {
    const input = el[key];
    input.addEventListener('input', () => {
      if (touched.has(key)) validateField(key);
    });
    input.addEventListener('blur', () => {
      // порожнє поле, у яке не вводили дані (просто пройшли Tab-ом), не підсвічуємо
      if (!touched.has(key) && !input.value) return;
      touched.add(key);
      validateField(key);
    });
  });
  el.agreement.addEventListener('change', () => {
    touched.add('agreement');
    validateAgreement();
  });

  // ---------- модальне вікно успіху ----------
  const modal = document.getElementById('successModal');
  const closeBtn = document.getElementById('closeModalBtn');
  const submitBtn = form.querySelector('button[type="submit"]');
  // усе, що поза модальним вікном, стає неактивним (inert): клік і Tab під ним не працюють
  const background = () => [...document.body.children].filter((node) => node !== modal && node.tagName !== 'SCRIPT');
  let modalOpen = false;

  function openModal() {
    modalOpen = true;
    background().forEach((node) => node.setAttribute('inert', ''));
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.documentElement.classList.add('overflow-hidden'); // не прокручувати сторінку під вікном
    closeBtn.focus();
  }

  function closeModal() {
    if (!modalOpen) return;
    modalOpen = false;
    modal.classList.remove('flex');
    modal.classList.add('hidden');
    background().forEach((node) => node.removeAttribute('inert'));
    document.documentElement.classList.remove('overflow-hidden');
    submitBtn.focus(); // повертаємо фокус туди, звідки відкрили вікно
  }

  closeBtn.addEventListener('click', closeModal);
  // клік по затемненню закриває вікно; клік усередині картки — ні (target збігається лише з оверлеєм)
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener('keydown', (event) => {
    if (!modalOpen) return;
    if (event.key === 'Escape') closeModal();
    if (event.key === 'Tab') {
      event.preventDefault(); // у вікні одна кнопка: фокус не виходить за його межі
      closeBtn.focus();
    }
  });

  // ---------- надсилання (імітація) ----------
  form.addEventListener('submit', (event) => {
    event.preventDefault(); // не перезавантажуємо сторінку
    if (modalOpen) return; // захист від швидкого повторного натискання

    Object.keys(rules).forEach((key) => touched.add(key));
    // обов'язково виконуємо всі перевірки (без раннього виходу), щоб підсвітити всі помилки одразу
    const results = [validateName(), validateEmail(), validatePhone(), validateMessage(), validateAgreement()];
    const firstInvalid = Object.keys(rules).find((_, index) => !results[index]);

    if (firstInvalid) {
      el.status.textContent = 'Перевірте виділені поля: форму ще не надіслано.';
      el.status.classList.remove('hidden');
      el[firstInvalid].focus();
      return;
    }

    el.status.textContent = '';
    el.status.classList.add('hidden');
    form.reset(); // очищаємо поля і повертаємо початковий вигляд
    Object.keys(rules).forEach((key) => clearError(el[key]));
    touched.clear();
    openModal();
  });
})();
