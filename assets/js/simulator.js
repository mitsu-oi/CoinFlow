// Калькулятор «Скільки можна витрачати на день».
// Три запитання: дохід, обов'язкові платежі, скільки відкладати. Результат: денний ліміт і розклад «куди йдуть гроші».
// Формула: ліміт на день = (дохід − обов'язкові платежі − відкладене) / 30, з округленням вниз.
(() => {
  const DAYS = 30; // розрахунковий місяць
  const MAX = 1000000; // найбільша сума в полях
  // частка залишку (дохід − обов'язкові платежі), яку людина відкладає
  const SCENARIOS = {
    none: { share: 0, name: 'поки не відкладаю' },
    conservative: { share: 0.3, name: 'трохи: 30 % залишку' },
    balanced: { share: 0.5, name: 'половину залишку' },
    aggressive: { share: 0.7, name: 'більшу частину: 70 % залишку' },
    custom: { share: null, name: 'своя сума' },
  };

  const form = document.querySelector('.simulator-box');
  if (!form) return;

  const out = (name) => form.querySelector(`[data-out="${name}"]`);
  const el = {
    income: document.getElementById('income'),
    expenses: document.getElementById('expenses'),
    savings: document.getElementById('savings'),
    incomeRange: form.querySelector('[data-range="income"]'),
    expensesRange: form.querySelector('[data-range="expenses"]'),
    radios: [...form.querySelectorAll('input[name="scenario"]')],
    custom: form.querySelector('[data-custom]'),
    limit: form.querySelector('.result-value'),
    meta: form.querySelector('.result-meta'),
    free: out('free'),
    split: out('split'),
    expensesOut: out('expenses'),
    savingsOut: out('savings'),
    livingOut: out('living'),
    forecast: out('forecast'),
    status: document.getElementById('sim-status'),
    pdf: document.getElementById('download-pdf'),
    share: document.getElementById('share-link'),
    report: document.getElementById('print-report'),
  };
  // якщо розмітку змінили й чогось бракує, калькулятор не запускається, але сторінка працює далі
  const missing = Object.keys(el).filter((key) => !el[key] && !['status', 'pdf', 'share', 'report'].includes(key));
  if (missing.length || !el.radios.length) {
    console.warn('Калькулятор ліміту не запущено, бракує елементів:', missing.join(', '));
    return;
  }

  const nf = new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 0 });
  const money = (n) => `${nf.format(Math.round(n))} ₴`;
  // будь-яке введення (порожнє, від'ємне, дробове, завелике) зводиться до цілого числа від 0 до MAX
  const amount = (input) => {
    const n = Number(input.value);
    return Number.isFinite(n) ? Math.min(Math.max(Math.round(n), 0), MAX) : 0;
  };
  const round100 = (n) => Math.round(n / 100) * 100;

  let scenario = 'conservative';

  function say(text) {
    if (!el.status) return;
    el.status.textContent = text;
    clearTimeout(say.timer);
    say.timer = setTimeout(() => (el.status.textContent = ''), 4000);
  }

  // ---------- розрахунок (чиста функція) ----------
  function calc() {
    const income = amount(el.income);
    const expenses = amount(el.expenses);
    const free = Math.max(income - expenses, 0);
    const share = SCENARIOS[scenario].share;
    const savings = share === null ? amount(el.savings) : round100(free * share);
    let warning = '';
    if (income === 0) warning = 'Вкажіть, скільки грошей ви отримуєте за місяць.';
    else if (expenses >= income) warning = 'Обов’язкові платежі забирають увесь дохід: на щоденні витрати нічого не лишається. Перевірте суми або пошукайте, що можна скоротити.';
    else if (savings > free) warning = `Ви хочете відкласти більше, ніж лишається після обов’язкових платежів (${money(free)}). Зменште суму.`;
    const living = warning ? 0 : free - savings;
    return { income, expenses, free, savings: warning && savings > free ? 0 : savings, wanted: savings, living, limit: Math.floor(living / DAYS), warning };
  }

  function render() {
    const r = calc();

    // суми біля варіантів «скільки відкладати»
    for (const key of ['none', 'conservative', 'balanced', 'aggressive']) {
      const label = form.querySelector(`[data-amount="${key}"]`);
      if (label) label.textContent = money(round100(r.free * SCENARIOS[key].share));
    }
    el.custom.classList.toggle('hidden', scenario !== 'custom');
    if (scenario !== 'custom') el.savings.value = String(r.wanted); // щоб «своя сума» починалася з поточної
    el.free.textContent = money(r.free);

    // головний результат
    el.limit.textContent = money(r.limit);
    el.meta.classList.toggle('text-amber-300', Boolean(r.warning));
    if (r.warning) el.meta.textContent = r.warning;
    else el.meta.textContent = `Це ${money(r.limit * 7)} на тиждень або ${money(r.living)} на місяць: на їжу, транспорт і все інше.`;

    // розклад «куди йдуть гроші»
    const total = Math.max(r.income, 1);
    const parts = { expenses: Math.min(r.expenses, r.income), savings: r.savings, living: r.living };
    for (const [key, value] of Object.entries(parts)) {
      form.querySelector(`[data-seg="${key}"]`).style.width = `${(value / total) * 100}%`;
    }
    const pct = (value) => (r.income > 0 ? ` (${Math.round((value / r.income) * 100)} %)` : '');
    el.expensesOut.textContent = money(r.expenses) + pct(Math.min(r.expenses, r.income));
    el.savingsOut.textContent = money(r.savings) + pct(r.savings);
    el.livingOut.textContent = money(r.living) + pct(r.living);
    el.split.setAttribute('aria-label', `Розподіл доходу: обов’язкові платежі ${money(r.expenses)}, відкладаю ${money(r.savings)}, на щоденне життя ${money(r.living)}`);

    // прогноз і порада
    if (r.warning) el.forecast.textContent = 'Виправте суми вище, і тут з’явиться прогноз.';
    else if (r.savings > 0) {
      const tight = r.living < r.free * 0.35 ? ' На життя лишається менше третини залишку: перевірте, чи вистачить на їжу й транспорт.' : '';
      el.forecast.textContent = `За пів року ви відкладете ${money(r.savings * 6)}, за рік ${money(r.savings * 12)}.${tight}`;
    } else {
      el.forecast.textContent = `Зараз ви нічого не відкладаєте. Якщо відкладати навіть 10 % залишку (${money(round100(r.free * 0.1))} на місяць), за рік збереться ${money(round100(r.free * 0.1) * 12)}.`;
    }
  }

  // ---------- події ----------
  // числове поле й повзунок показують одне значення
  const pairs = [[el.income, el.incomeRange], [el.expenses, el.expensesRange]];
  pairs.forEach(([field, range]) => {
    field.addEventListener('input', () => {
      range.value = String(Math.min(amount(field), Number(range.max)));
      render();
    });
    range.addEventListener('input', () => {
      field.value = range.value;
      render();
    });
    // після завершення введення в полі лишається очищене число (без мінуса, дробу чи завеликого значення)
    field.addEventListener('change', () => {
      field.value = String(amount(field));
      render();
    });
  });
  el.savings.addEventListener('input', render);
  el.savings.addEventListener('change', () => {
    el.savings.value = String(amount(el.savings));
    render();
  });

  function setScenario(key) {
    if (!SCENARIOS[key]) return;
    scenario = key;
    el.radios.forEach((radio) => (radio.checked = radio.value === key));
    render();
  }
  el.radios.forEach((radio) => radio.addEventListener('change', () => setScenario(radio.value)));
  form.addEventListener('submit', (event) => event.preventDefault());

  // посилання «Детальніше про сценарій» у картках обирають відповідний варіант у калькуляторі
  document.querySelectorAll('[data-scenario]').forEach((link) => {
    link.addEventListener('click', () => setScenario(link.dataset.scenario));
  });

  // ---------- посилання зі збереженим станом ----------
  function stateUrl() {
    const r = calc();
    const params = new URLSearchParams({ income: r.income, expenses: r.expenses, savings: r.wanted, scenario });
    const base = location.href.split('#')[0].split('?')[0];
    return `${base}?${params}#simulator`;
  }

  function restoreFromUrl() {
    const params = new URLSearchParams(location.search);
    for (const key of ['income', 'expenses', 'savings']) {
      if (params.has(key) && params.get(key) !== '') {
        el[key].value = params.get(key);
        el[key].value = String(amount(el[key]));
      }
    }
    el.incomeRange.value = String(Math.min(amount(el.income), Number(el.incomeRange.max)));
    el.expensesRange.value = String(Math.min(amount(el.expenses), Number(el.expensesRange.max)));
    const key = params.get('scenario');
    if (SCENARIOS[key]) scenario = key;
    else if (params.has('savings')) scenario = 'custom'; // старі посилання без сценарію
    el.radios.forEach((radio) => (radio.checked = radio.value === scenario));
  }

  async function share() {
    const url = stateUrl();
    const data = { title: 'Coin Flow — мій денний ліміт', text: `Мій денний ліміт: ${el.limit.textContent}`, url };
    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
      await navigator.clipboard.writeText(url);
      say('Посилання скопійовано: вставте його в повідомлення.');
    } catch (error) {
      if (error && error.name === 'AbortError') return; // користувач закрив вікно «Поділитись»
      say(`Скопіюйте посилання: ${url}`);
    }
  }

  // ---------- PDF: друк підготовленого звіту (у діалозі друку обрати «Зберегти як PDF») ----------
  function printReport() {
    const r = calc();
    const rows = [
      ['Дохід за місяць', money(r.income)],
      ['Обов’язкові платежі', money(r.expenses)],
      ['Відкладаю щомісяця', `${money(r.savings)} (${SCENARIOS[scenario].name})`],
      ['На щоденне життя', money(r.living)],
      ['Можна витрачати на день', money(r.limit)],
      ['Можна витрачати на тиждень', money(r.limit * 7)],
      ['Відкладу за пів року', money(r.savings * 6)],
      ['Відкладу за рік', money(r.savings * 12)],
    ];
    // звіт збирається через textContent: введені дані ніколи не потрапляють у розмітку як HTML
    const add = (tag, className, text) => {
      const node = document.createElement(tag);
      if (className) node.className = className;
      if (text) node.textContent = text;
      return node;
    };
    el.report.replaceChildren();
    el.report.append(add('h1', 'text-2xl font-bold', 'Coin Flow: розрахунок денного ліміту'));
    el.report.append(add('p', 'mt-1', `Дата: ${new Date().toLocaleDateString('uk-UA')}`));
    const table = add('table', 'mt-6');
    rows.forEach(([label, value]) => {
      const tr = document.createElement('tr');
      const th = add('th', 'py-2 pr-6 text-left font-normal', label);
      th.scope = 'row';
      tr.append(th, add('td', 'py-2 font-semibold', value));
      table.append(tr);
    });
    el.report.append(table);
    if (r.warning) el.report.append(add('p', 'mt-4 font-bold', `Увага: ${r.warning}`));
    el.report.append(add('p', 'mt-6 text-sm', `Формула: ліміт = (дохід − обов’язкові платежі − відкладене) / ${DAYS} днів. Розрахунок виконано у вашому браузері, дані нікуди не передавалися.`));
    window.print();
  }

  if (el.share) el.share.addEventListener('click', share);
  if (el.pdf && el.report) el.pdf.addEventListener('click', printReport);

  restoreFromUrl();
  render();
})();
