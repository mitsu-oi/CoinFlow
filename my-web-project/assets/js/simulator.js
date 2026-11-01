// Симулятор «Безпечний ліміт»: повзунки, сценарії, діаграма, збереження у PDF і посилання.
// Формула: ліміт на день = (дохід − обов'язкові витрати − заплановані заощадження) / кількість днів (30).
(() => {
  const DAYS = 30; // розрахунковий місяць
  const MONTHS = 6; // горизонт накопичення
  const STEP = 500; // крок повзунків, ₴
  const MAX = 100000;
  const SCENARIOS = {
    aggressive: { share: 0.7, name: 'Агресивний' },
    balanced: { share: 0.5, name: 'Збалансований' },
    conservative: { share: 0.3, name: 'Консервативний' },
  };

  const form = document.querySelector('.simulator-box');
  if (!form) return;

  const inputs = {
    income: document.getElementById('income'),
    expenses: document.getElementById('expenses'),
    savings: document.getElementById('savings'),
  };
  const outputs = {
    income: form.querySelector('output[for="income"]'),
    expenses: form.querySelector('output[for="expenses"]'),
    savings: form.querySelector('output[for="savings"]'),
  };
  const limitOut = form.querySelector('.result-value');
  const meta = form.querySelector('.result-meta');
  const chart = form.querySelector('.chart-bars');
  const bars = [...form.querySelectorAll('.chart-bars .bar')];
  const caption = form.querySelector('.chart-caption');
  const radios = [...form.querySelectorAll('input[name="scenario"]')];
  const status = document.getElementById('sim-status');
  const pdfButton = document.getElementById('download-pdf');
  const shareButton = document.getElementById('share-link');
  const report = document.getElementById('print-report');

  const nf = new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 0 });
  const money = (n) => nf.format(Math.round(n)) + ' ₴';
  const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
  const snap = (n) => clamp(Math.round(n / STEP) * STEP, 0, MAX);
  const num = (input) => Number(input.value) || 0;

  let scenario = null; // ключ обраного сценарію або null (власні значення)

  function say(text) {
    if (!status) return;
    status.textContent = text;
    clearTimeout(say.timer);
    say.timer = setTimeout(() => (status.textContent = ''), 4000);
  }

  function calc() {
    const income = num(inputs.income);
    const expenses = num(inputs.expenses);
    const savings = num(inputs.savings);
    const free = income - expenses;
    let limit = 0;
    let warning = '';
    if (income === 0) warning = 'Вкажіть щомісячний дохід, щоб побачити ліміт.';
    else if (free <= 0) warning = 'Витрати не менші за дохід — вільних коштів немає.';
    else if (savings > free) warning = `Заощадження більші за вільні кошти (${money(free)}) — зменште їх.`;
    else limit = Math.floor((free - savings) / DAYS); // «безпечний» ліміт округлюємо вниз
    return { income, expenses, savings, free, limit, warning };
  }

  function render() {
    const r = calc();
    for (const key of Object.keys(inputs)) {
      const value = num(inputs[key]);
      outputs[key].textContent = money(value);
      inputs[key].setAttribute('aria-valuetext', money(value));
    }
    limitOut.textContent = `${nf.format(r.limit)} ₴ / день`;
    meta.textContent = r.warning || `Цільові заощадження ${money(r.savings * MONTHS)} за ${MONTHS} міс.`;
    meta.classList.toggle('text-amber-300', Boolean(r.warning));

    // діаграма: накопичення зростає лінійно, найвищий стовпчик = сума за 6 місяців
    bars.forEach((bar, i) => {
      bar.style.height = r.savings > 0 ? `${Math.round(((i + 1) / MONTHS) * 100)}%` : '4%';
    });
    const m3 = money(r.savings * 3);
    const m6 = money(r.savings * MONTHS);
    caption.textContent = `Через 3 міс. — ${m3} · через ${MONTHS} міс. — ${m6}`;
    chart.setAttribute(
      'aria-label',
      `Стовпчаста діаграма: накопичення зростає від січня до червня, через 3 місяці ${m3}, через ${MONTHS} місяців ${m6}`,
    );
  }

  function syncRadios() {
    radios.forEach((radio) => (radio.checked = radio.value === scenario));
  }

  // сценарій задає заощадження як частку вільних коштів (дохід − витрати)
  function applyScenario(key) {
    if (!SCENARIOS[key]) return;
    scenario = key;
    const free = Math.max(num(inputs.income) - num(inputs.expenses), 0);
    inputs.savings.value = snap(free * SCENARIOS[key].share);
    syncRadios();
    render();
  }

  function onInput(event) {
    if (event.target === inputs.savings) {
      scenario = null; // ручна зміна заощаджень = власний сценарій
      syncRadios();
    } else if (scenario) {
      const free = Math.max(num(inputs.income) - num(inputs.expenses), 0);
      inputs.savings.value = snap(free * SCENARIOS[scenario].share);
    }
    render();
  }

  Object.values(inputs).forEach((input) => input.addEventListener('input', onInput));
  radios.forEach((radio) => radio.addEventListener('change', () => applyScenario(radio.value)));
  form.addEventListener('submit', (event) => event.preventDefault());

  // «Детальніше про сценарій» у картках обирає відповідний сценарій у симуляторі
  document.querySelectorAll('[data-scenario]').forEach((link) => {
    link.addEventListener('click', () => applyScenario(link.dataset.scenario));
  });

  // ---------- посилання зі збереженим станом ----------
  function stateUrl() {
    const params = new URLSearchParams({
      income: num(inputs.income),
      expenses: num(inputs.expenses),
      savings: num(inputs.savings),
    });
    if (scenario) params.set('scenario', scenario);
    const base = location.href.split('#')[0].split('?')[0];
    return `${base}?${params}#simulator`;
  }

  function restoreFromUrl() {
    const params = new URLSearchParams(location.search);
    for (const key of Object.keys(inputs)) {
      if (params.has(key) && params.get(key) !== '') inputs[key].value = snap(Number(params.get(key)) || 0);
    }
    const key = params.get('scenario');
    if (SCENARIOS[key]) {
      scenario = key;
      const free = Math.max(num(inputs.income) - num(inputs.expenses), 0);
      inputs.savings.value = snap(free * SCENARIOS[key].share); // сценарій визначає заощадження
      syncRadios();
    }
  }

  async function share() {
    const url = stateUrl();
    const data = { title: 'Coin Flow — мій безпечний ліміт', text: `Мій безпечний ліміт: ${limitOut.textContent}`, url };
    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
      await navigator.clipboard.writeText(url);
      say('Посилання скопійовано — вставте його в повідомлення.');
    } catch (error) {
      if (error && error.name === 'AbortError') return; // користувач закрив вікно «Поділитись»
      const field = document.createElement('textarea');
      field.value = url;
      field.setAttribute('readonly', '');
      field.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
      document.body.appendChild(field);
      field.select();
      let copied = false;
      try {
        copied = document.execCommand('copy');
      } catch (e) {
        copied = false;
      }
      field.remove();
      say(copied ? 'Посилання скопійовано — вставте його в повідомлення.' : `Скопіюйте посилання: ${url}`);
    }
  }

  // ---------- PDF: друк підготовленого звіту (у діалозі друку обрати «Зберегти як PDF») ----------
  function printReport() {
    const r = calc();
    const date = new Date().toLocaleDateString('uk-UA');
    const scenarioName = scenario ? SCENARIOS[scenario].name : 'власні значення';
    const row = (label, value) => `<tr><th scope="row" class="py-2 pr-6 text-left font-normal">${label}</th><td class="py-2 font-semibold">${value}</td></tr>`;
    report.innerHTML = `
      <h1 class="text-2xl font-bold">Coin Flow — розрахунок безпечного денного ліміту</h1>
      <p class="mt-1">Дата: ${date}</p>
      <h2 class="mt-6 text-lg font-bold">Вхідні дані</h2>
      <table class="mt-2">
        ${row('Щомісячний дохід', money(r.income))}
        ${row('Обов’язкові витрати', money(r.expenses))}
        ${row('Щомісячні заощадження', money(r.savings))}
        ${row('Сценарій накопичення', scenarioName)}
      </table>
      <h2 class="mt-6 text-lg font-bold">Результат</h2>
      <table class="mt-2">
        ${row('Безпечний ліміт', `${nf.format(r.limit)} ₴ / день`)}
        ${row('Накопичення за 3 міс.', money(r.savings * 3))}
        ${row(`Накопичення за ${MONTHS} міс.`, money(r.savings * MONTHS))}
      </table>
      ${r.warning ? `<p class="mt-4 font-bold">Увага: ${r.warning}</p>` : ''}
      <p class="mt-6 text-sm">Формула: ліміт = (дохід − витрати − заощадження) / ${DAYS} днів. Розрахунок виконано локально в браузері, дані нікуди не передавалися.</p>`;
    window.print();
  }

  if (shareButton) shareButton.addEventListener('click', share);
  if (pdfButton && report) pdfButton.addEventListener('click', printReport);

  restoreFromUrl();
  render();
})();
