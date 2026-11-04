// Генерує pricing.html і docs.html із header та footer, взятих з index.html.
// Запуск: npm run build:pages (повторювати після змін у шапці або підвалі index.html).
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

// ---------- шматки index.html ----------
const skipStart = index.lastIndexOf('<a', index.indexOf('href="#main"'));
const headerEnd = index.indexOf('</header>') + '</header>'.length;
const footerStart = index.indexOf('<footer');
const footerEnd = index.indexOf('</footer>') + '</footer>'.length;
if (skipStart < 0 || headerEnd < 9 || footerStart < 0) throw new Error('Не знайдено header/footer в index.html');

// посилання-якорі ведуть на головну сторінку
const toIndex = (html) =>
  html
    .replace(/href="#top"/g, 'href="index.html"')
    .replace(/href="#(?!main")([\w-]+)"/g, 'href="index.html#$1"')
    .replace(/\s+aria-current="page"/g, '');
// на підсторінках пункт «Симулятор» не поточний: прибираємо його виділення (білий жирний текст)
const unhighlight = (html) =>
  html
    .replace(/(href="index\.html#simulator"\s+class="[^"]*?)font-semibold text-white( transition-colors)/, '$1font-medium text-slate-300 hover:text-white$2')
    .replace(/(href="index\.html#simulator"\s+class="[^"]*?)font-semibold text-white( focus-visible)/, '$1text-slate-300 transition-colors hover:bg-white/10 hover:text-white$2');
const skipAndHeader = unhighlight(toIndex(index.slice(skipStart, headerEnd)));
const footer = toIndex(index.slice(footerStart, footerEnd));

const FA_SRI = (index.match(/integrity="(sha512-[^"]+)"/) || [])[1];

const head = (title, description) => `<!DOCTYPE html>
<html lang="uk">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="description" content="${description}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Manrope:wght@600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css"${FA_SRI ? ` integrity="${FA_SRI}"` : ''} crossorigin="anonymous" referrerpolicy="no-referrer">
    <link rel="stylesheet" href="css/tailwind.css">
    <script src="assets/js/site.js" defer></script>
  </head>
  <body class="flex min-h-screen flex-col bg-background font-sans text-slate-50 antialiased" id="top">
    `;

const markCurrent = (html, href) => html.split(`href="${href}" class="`).join(`href="${href}" aria-current="page" class="`);
const page = (title, description, main, current) =>
  head(title, description) + markCurrent(skipAndHeader, current) + '\n\n' + main + '\n\n    ' + footer + '\n  </body>\n</html>\n';

// ---------- спільні класи ----------
const H1 = 'font-heading text-3xl leading-display font-semibold text-balance text-slate-50 sm:text-4xl md:text-5xl';
const BTN = 'inline-flex min-h-12 w-full items-center justify-center rounded-md border-2 px-5.5 py-2.5 text-base font-semibold transition-colors duration-150 focus-visible:ring-3 focus-visible:ring-brand-300 focus-visible:outline-none';
const BTN_PRIMARY = `${BTN} border-transparent bg-brand-500 text-slate-950 hover:bg-brand-400 active:bg-brand-700`;
const BTN_GHOST = `${BTN} border-slate-700 text-slate-50 hover:border-slate-400 hover:bg-slate-800 active:border-brand-500 active:bg-slate-900`;
const CHECK = '<svg class="mt-1 size-4 shrink-0 text-brand-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8.5 6.5 12 13 4.5"></path></svg>';

// ---------- Прайс ----------
const plans = [
  { id: 'free', name: 'Free', price: '0 ₴', note: 'Для швидкого розрахунку без реєстрації.', features: ['Розрахунок безпечного денного ліміту', 'Три сценарії накопичення', 'Збереження результату у PDF'], cta: 'Почати безкоштовно', featured: false },
  { id: 'pro', name: 'Pro', price: '199 ₴', note: 'Для тих, хто планує бюджет щомісяця.', features: ['Усе з плану Free', 'Орієнтовна дата досягнення цілі', 'Поділитись планом із родиною чи партнером', 'Пріоритетна підтримка'], cta: 'Спробувати Pro', featured: true },
  { id: 'team', name: 'Team', price: '499 ₴', note: 'Для спільного бюджету невеликої команди.', features: ['Усе з плану Pro', 'До 5 користувачів', 'Спільні цілі й сценарії', 'Допомога з налаштуванням'], cta: 'Зв’язатися з нами', featured: false },
];
const planCard = (p) => `
        <li class="flex">
          <article
            class="flex w-full flex-col gap-5 rounded-xl border bg-slate-800 p-8 ${p.featured ? 'border-brand-500 shadow-card' : 'border-slate-700'}"
            aria-labelledby="plan-${p.id}"
          >
            <div class="flex items-center justify-between gap-3">
              <h2 id="plan-${p.id}" class="font-heading text-2xl leading-heading font-semibold text-slate-50">${p.name}</h2>${p.featured ? `
              <p class="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-300">Популярний</p>` : ''}
            </div>
            <p class="text-slate-400">${p.note}</p>
            <p class="font-heading text-4xl font-bold text-slate-50">${p.price}<span class="text-base font-normal text-slate-400"> / міс</span></p>
            <ul class="flex flex-col gap-3 text-slate-300">${p.features.map((f) => `
              <li class="flex gap-3">${CHECK}<span>${f}</span></li>`).join('')}
            </ul>
            <a href="index.html#early-access" aria-describedby="plan-${p.id}" class="${p.featured ? BTN_PRIMARY : BTN_GHOST} mt-auto">${p.cta}</a>
          </article>
        </li>`;

const pricingMain = `    <main id="main" tabindex="-1" class="mx-auto w-full max-w-6xl flex-1 px-4 py-16 md:px-6 md:py-24">
      <div class="mb-12 text-center md:mb-16">
        <h1 class="${H1}">Прайс</h1>
        <p class="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
          Почніть безкоштовно й переходьте на розширений план, коли знадобиться більше можливостей.
          Ціни на цій сторінці демонстраційні.
        </p>
      </div>
      <ul class="grid grid-cols-1 gap-6 lg:grid-cols-3">${plans.map(planCard).join('')}
      </ul>
    </main>`;

// ---------- Документація ----------
const docs = [
  { id: 'start', title: 'Початок роботи', body: ['У розділі «Розрахувати мій ліміт» вкажіть щомісячний дохід, обов’язкові витрати й заплановані заощадження за допомогою повзунків. Безпечний денний ліміт з’явиться одразу, реєстрація не потрібна.'] },
  { id: 'formula', title: 'Формула розрахунку', body: ['Ліміт = (дохід − обов’язкові витрати − заплановані заощадження) / кількість днів.', 'Приклад: (25 000 − 7 000 − 4 500) / 30 = 450 ₴ на день.'] },
  { id: 'scenarios', title: 'Сценарії накопичення', body: ['Агресивний сценарій відкладає 70% на заощадження, збалансований — 50%, консервативний — 30%. Оберіть сценарій у симуляторі, і діаграма динаміки накопичення оновиться.'] },
  { id: 'export', title: 'Збереження результату', body: ['Результат можна завантажити у форматі PDF або поділитися посиланням на розрахунок із родиною чи партнером.'] },
  { id: 'privacy', title: 'Конфіденційність', body: ['Розрахунок виконується локально в браузері й не передає ваші дані третім особам. Реєстрація потрібна лише для раннього доступу.'] },
];
const tocLink = 'flex min-h-11 items-center rounded-md px-3 text-slate-300 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-brand-400';
const docsMain = `    <main id="main" tabindex="-1" class="mx-auto w-full max-w-6xl flex-1 px-4 py-16 md:px-6 md:py-24">
      <div class="mb-12 md:mb-16">
        <h1 class="${H1}">Документація</h1>
        <p class="mt-4 max-w-2xl text-lg text-slate-400">Коротко про те, як працює Coin Flow: від першого розрахунку до збереження результату.</p>
      </div>

      <div class="grid grid-cols-1 gap-10 lg:grid-cols-[16rem_1fr]">
        <nav aria-labelledby="toc-title" class="lg:sticky lg:top-24 lg:self-start">
          <h2 id="toc-title" class="mb-2 px-3 font-heading text-lg font-semibold text-slate-50">Зміст</h2>
          <ul>${docs.map((d) => `
            <li><a href="#${d.id}" class="${tocLink}">${d.title}</a></li>`).join('')}
          </ul>
        </nav>

        <div class="flex flex-col gap-6">${docs.map((d) => `
          <section id="${d.id}" aria-labelledby="${d.id}-title" class="scroll-mt-24 rounded-xl border border-slate-700 bg-slate-800 p-8">
            <h2 id="${d.id}-title" class="font-heading text-2xl leading-heading font-semibold text-slate-50">${d.title}</h2>${d.body.map((p) => `
            <p class="mt-3 text-slate-400">${p}</p>`).join('')}
          </section>`).join('')}
        </div>
      </div>
    </main>`;

// ---------- Вбудований контент (ембеддинг) ----------
const FRAME = 'size-full border-0';
const BOX = 'overflow-hidden rounded-xl border border-slate-700 bg-slate-800 shadow-card';
const SUB = 'mt-2 text-slate-400';
const H2 = 'font-heading text-2xl leading-heading font-semibold text-slate-50';
const MAP_SRC = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2573.072235948753!2d24.029717!3d49.839683!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDnCsDUwJzIyLjkiTiAyNMKwMDEnNDcuMCJF!5e0!3m2!1suk!2sua!4v1710000000000!5m2!1suk!2sua';

const embedMain = `    <main id="main" tabindex="-1" class="mx-auto w-full max-w-6xl flex-1 px-4 py-16 md:px-6 md:py-24">
      <div class="mb-12 md:mb-16">
        <h1 class="${H1}">Корисні матеріали</h1>
        <p class="mt-4 max-w-2xl text-lg text-slate-400">
          Усе, що допоможе планувати бюджет: актуальні курси валют із конвертером, відео про фінансову зрілість
          і офіс Coin Flow на карті. Блоки вбудовано зі сторонніх сервісів (YouTube, Google Maps, API НБУ).
        </p>
      </div>

      <div class="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_20rem]">
        <div class="flex min-w-0 flex-col gap-12">
          <!-- 1. Відео зі стороннього хостингу (YouTube, режим без cookie) -->
          <section id="promo-video" aria-labelledby="promo-video-title">
            <h2 id="promo-video-title" class="${H2}">Відео про фінансову зрілість</h2>
            <p class="${SUB}">Про гроші в стосунках і планування спільного бюджету (YouTube).</p>
            <div class="mt-4 aspect-video w-full max-w-3xl ${BOX}">
              <iframe
                src="https://www.youtube-nocookie.com/embed/VmX7Pqh-enw"
                title="Відео: Як досягти фінансової зрілості? Все про гроші в стосунках, Кушнерук та Довгань"
                class="${FRAME}"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowfullscreen
                loading="lazy"
                referrerpolicy="strict-origin-when-cross-origin"
                sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
              ></iframe>
            </div>
          </section>

          <!-- 2. Нативне HTML5-відео (локальний файл) -->
          <section id="native-video" aria-labelledby="native-video-title">
            <h2 id="native-video-title" class="${H2}">Coin Flow у русі</h2>
            <p class="${SUB}">Анімація сервісу: повзунки, сценарії й накопичення. Відео лежить на нашому сервері.</p>
            <div class="mt-4 aspect-video w-full max-w-3xl ${BOX}">
              <video class="size-full object-cover" controls muted loop playsinline preload="metadata">
                <source src="assets/images/hero.mp4" type="video/mp4">
                Ваш браузер не підтримує тег відео.
              </video>
            </div>
          </section>

          <!-- 3. Інтерактивна карта (iframe) -->
          <section id="map" aria-labelledby="map-title">
            <h2 id="map-title" class="${H2}">Де нас знайти</h2>
            <p class="${SUB}">Офіс Coin Flow у Львові. Приходьте на консультацію або напишіть на hello@coinflow.ua.</p>
            <div class="mt-4 h-80 w-full md:h-[450px] ${BOX}">
              <iframe
                src="${MAP_SRC}"
                title="Інтерактивна карта: офіс Coin Flow, Львів"
                class="${FRAME}"
                allowfullscreen
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
                sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
              ></iframe>
            </div>
          </section>
        </div>

        <!-- 4. Динамічний інформер: курс валют НБУ і конвертер (скрипт підключається асинхронно) -->
        <aside id="rates" aria-labelledby="rates-title" class="h-fit rounded-xl border border-slate-700 bg-slate-800 p-6 lg:sticky lg:top-24">
          <h2 id="rates-title" class="${H2}">Курс валют НБУ</h2>
          <p class="mt-2 text-sm text-slate-400">Враховуйте курс, якщо частина витрат чи заощаджень у валюті.</p>
          <dl class="mt-4 flex flex-col gap-3">
            <div class="flex items-baseline justify-between gap-4 border-b border-slate-700 pb-3">
              <dt class="text-slate-400">Долар США, USD</dt>
              <dd class="font-semibold text-slate-50"><output data-rate="USD">…</output></dd>
            </div>
            <div class="flex items-baseline justify-between gap-4">
              <dt class="text-slate-400">Євро, EUR</dt>
              <dd class="font-semibold text-slate-50"><output data-rate="EUR">…</output></dd>
            </div>
          </dl>
          <p role="status" data-rates-status class="mt-4 text-sm text-slate-400">Завантаження курсів…</p>

          <div class="mt-5 border-t border-slate-700 pt-5">
            <label for="uah-amount" class="font-semibold text-slate-50">Скільки це у валюті?</label>
            <p id="uah-hint" class="mt-1 text-sm text-slate-400">Наприклад, ваш безпечний ліміт на день.</p>
            <div class="mt-3 flex items-center gap-2">
              <input
                type="number" id="uah-amount" inputmode="decimal" min="0" step="any" value="450"
                aria-describedby="uah-hint"
                class="min-h-12 w-full min-w-0 rounded-md border border-slate-700 bg-slate-900 px-4 text-base text-slate-50 focus:border-brand-300 focus:ring-3 focus:ring-brand-300/35 focus:outline-none"
              >
              <span class="text-slate-300" aria-hidden="true">₴</span>
            </div>
            <dl class="mt-3 flex flex-col gap-2 text-sm">
              <div class="flex items-baseline justify-between gap-4">
                <dt class="text-slate-400">У доларах</dt>
                <dd class="font-semibold text-slate-50"><output data-converted="USD" for="uah-amount">—</output></dd>
              </div>
              <div class="flex items-baseline justify-between gap-4">
                <dt class="text-slate-400">У євро</dt>
                <dd class="font-semibold text-slate-50"><output data-converted="EUR" for="uah-amount">—</output></dd>
              </div>
            </dl>
          </div>
          <script src="assets/js/rates.js" defer></script>
        </aside>
      </div>
    </main>`;

fs.writeFileSync(path.join(root, 'embed.html'), page('Корисні матеріали — Coin Flow', 'Курс валют НБУ з конвертером гривні, відео про фінансову зрілість і карта офісу Coin Flow.', embedMain, 'embed.html'));
fs.writeFileSync(path.join(root, 'pricing.html'), page('Прайс — Coin Flow', 'Тарифи Coin Flow: Free, Pro і Team. Почніть безкоштовно.', pricingMain, 'pricing.html'));
fs.writeFileSync(path.join(root, 'docs.html'), page('Документація — Coin Flow', 'Документація Coin Flow: формула розрахунку, сценарії накопичення, збереження результату й конфіденційність.', docsMain, 'docs.html'));
console.log('Створено: pricing.html, docs.html');
