// Трекер накопичень (ЛР №11): інтерактивний віджет на чистому JavaScript.
// Захисне програмування: дані з полів вважаються «брудними», перевіряються перед розрахунком,
// а результат виводиться лише через textContent. Код ізольовано в IIFE, глобальних змінних немає.
(() => {
  // ---------- бізнес-правила ----------
  const LIMITS = {
    goal: { min: 1000, max: 10000000 },
    saved: { min: 0, max: 10000000 },
    monthly: { min: 100, max: 1000000 },
  };
  const RATES = { cash: 0, deposit: 0.12, bonds: 0.16 }; // річна ставка залежно від місця зберігання
  const BUFFER = 0.1; // запас на інфляцію: ціль +10 %
  const INDEXATION = 0.1; // щорічне збільшення внеску: +10 %
  const MAX_MONTHS = 600; // межа розрахунку (50 років): цикл гарантовано завершується

  const money = new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 0 });
  const monthYear = new Intl.DateTimeFormat('uk-UA', { month: 'long', year: 'numeric' });
  const formatMoney = (value) => `${money.format(value)} ₴`;

  // ---------- валідація та нормалізація одного числового поля ----------
  // Повертає { value } для коректного значення або { error } з текстом для користувача.
  function readAmount(input, { min, max }) {
    const range = `від ${money.format(min)} до ${money.format(max)} ₴`;
    const raw = input.value.trim();
    if (raw === '') {
      // badInput: у полі є символи, які браузер не зміг прочитати як число («e», «--», вставлений текст)
      return { error: input.validity.badInput ? `Введіть число ${range}, без літер і символів.` : `Заповніть поле: сума ${range}.` };
    }
    const number = Number(raw);
    if (!Number.isFinite(number)) return { error: `Введіть число ${range}.` };
    if (number < min || number > max) return { error: `Сума має бути ${range}.` };
    const value = Math.round(number); // дробові суми округлюємо до гривні
    return { value, rounded: value !== number };
  }

  // ---------- розрахунок (чиста функція: без DOM, приймає лише перевірені числа) ----------
  function calculate({ goal, saved, monthly, rate, withBuffer, withIndexation }) {
    const target = withBuffer ? Math.round(goal * (1 + BUFFER)) : goal;
    let balance = saved;
    let contribution = monthly;
    let contributed = 0;
    let months = 0;

    while (balance < target && months < MAX_MONTHS) {
      balance += (balance * rate) / 12 + contribution; // відсотки за місяць і внесок
      contributed += contribution;
      months += 1;
      if (withIndexation && months % 12 === 0) contribution = Math.round(contribution * (1 + INDEXATION));
    }

    return {
      target,
      months,
      contributed,
      interest: Math.max(0, Math.round(balance - saved - contributed)),
      reached: balance >= target,
    };
  }

  // «27» -> «2 роки 3 міс.»
  function formatTerm(months) {
    const years = Math.floor(months / 12);
    const rest = months % 12;
    const lastTwo = years % 100;
    const last = years % 10;
    const word = lastTwo >= 11 && lastTwo <= 14 ? 'років' : last === 1 ? 'рік' : last >= 2 && last <= 4 ? 'роки' : 'років';
    if (years === 0) return `${rest} міс.`;
    return rest === 0 ? `${years} ${word}` : `${years} ${word} ${rest} міс.`;
  }

  // ---------- один екземпляр віджета ----------
  function initTracker(root) {
    const field = (name) => root.querySelector(`[data-field="${name}"]`);
    const out = (name) => root.querySelector(`[data-out="${name}"]`);
    const el = {
      goal: field('goal'), saved: field('saved'), monthly: field('monthly'),
      storage: field('storage'), buffer: field('buffer'), indexation: field('indexation'),
      term: out('term'), date: out('date'), target: out('target'),
      contributed: out('contributed'), interest: out('interest'), note: out('note'),
    };
    // Fail-Safe: якщо розмітку змінили й елемента немає, віджет не запускається, але сторінка працює далі
    const missing = Object.keys(el).filter((key) => !el[key]);
    if (missing.length) {
      console.warn('Трекер накопичень не запущено, бракує елементів:', missing.join(', '));
      return;
    }

    function setFieldError(name, message) {
      const input = el[name];
      const error = root.querySelector(`[data-error="${name}"]`);
      input.classList.toggle('border-red-500', Boolean(message));
      input.classList.toggle('border-slate-700', !message);
      input.setAttribute('aria-invalid', message ? 'true' : 'false');
      if (!error) return;
      error.textContent = message || '';
      error.classList.toggle('hidden', !message);
    }

    function showNote(message) {
      el.note.textContent = message || '';
      el.note.classList.toggle('hidden', !message);
    }

    function showEmpty(message) {
      el.term.textContent = '—';
      el.date.textContent = '';
      el.target.textContent = '—';
      el.contributed.textContent = '—';
      el.interest.textContent = '—';
      showNote(message);
    }

    function update() {
      // 1. збір і перевірка даних
      const values = {};
      let hasError = false;
      let wasRounded = false;
      ['goal', 'saved', 'monthly'].forEach((name) => {
        const result = readAmount(el[name], LIMITS[name]);
        setFieldError(name, result.error);
        if (result.error) hasError = true;
        else {
          values[name] = result.value;
          if (result.rounded) wasRounded = true;
        }
      });
      if (hasError) {
        showEmpty('Виправте поля, позначені червоним, і розрахунок оновиться.');
        return;
      }

      // невідоме значення select (наприклад, змінене в DevTools) не ламає розрахунок: ставка 0 %
      const rate = Object.hasOwn(RATES, el.storage.value) ? RATES[el.storage.value] : 0;

      // 2. розрахунок
      const plan = calculate({
        goal: values.goal, saved: values.saved, monthly: values.monthly, rate,
        withBuffer: el.buffer.checked, withIndexation: el.indexation.checked,
      });

      // 3. виведення (тільки textContent)
      el.target.textContent = formatMoney(plan.target);
      el.contributed.textContent = formatMoney(plan.contributed);
      el.interest.textContent = formatMoney(plan.interest);

      if (plan.months === 0) {
        el.term.textContent = 'Ціль досягнуто';
        el.date.textContent = 'Накопиченої суми вже вистачає.';
      } else if (!plan.reached) {
        el.term.textContent = 'Понад 50 років';
        el.date.textContent = '';
        showNote('За таких умов ціль надто далека. Збільште щомісячний внесок або зменште суму цілі.');
        return;
      } else {
        const date = new Date();
        date.setDate(1); // щоб додавання місяців не «перестрибувало» через короткі місяці
        date.setMonth(date.getMonth() + plan.months);
        el.term.textContent = formatTerm(plan.months);
        el.date.textContent = `Орієнтовно: ${monthYear.format(date)}`;
      }
      showNote(wasRounded ? 'Дробові суми округлено до цілих гривень.' : '');
    }

    // миттєвий перерахунок: input для полів, change для списку й прапорців
    ['goal', 'saved', 'monthly'].forEach((name) => {
      el[name].addEventListener('input', update);
      // після завершення введення дробове значення в полі замінюється округленим
      el[name].addEventListener('change', () => {
        const result = readAmount(el[name], LIMITS[name]);
        if (!result.error && result.rounded) el[name].value = String(result.value);
        update();
      });
    });
    ['storage', 'buffer', 'indexation'].forEach((name) => el[name].addEventListener('change', update));
    // Enter у полі не повинен надсилати форму й перезавантажувати сторінку
    const form = root.querySelector('form');
    if (form) form.addEventListener('submit', (event) => event.preventDefault());

    update();
  }

  document.querySelectorAll('[data-goal-tracker]').forEach(initTracker);
})();
