# Перенесення дизайн-системи Coin Flow в Tailwind CSS (ЛР №6, етап 14)

Джерело значень — токени в `:root` файлу `css/style.css` (перенесені з Figma, ЛР №4). Tailwind v4 підключено в
`src/input.css`, власні токени оголошено в блоці `@theme`.

**Принцип:** Tailwind — для layout, spacing, typography, colors, responsive, hover/focus, flex, grid, positioning.
Власний CSS (`style.css`) — для того, що неможливо або недоцільно виразити утилітами.

## 1. Відповідність токенів дизайн-системи класам Tailwind

### Кольори

| Токен | Значення | Клас Tailwind | Збіг |
|---|---|---|---|
| `--color-primary` | `#10b981` | `brand-500` (= `emerald-500`) | точний |
| `--color-primary-hover` | `#34d399` | `brand-400` (= `emerald-400`) | точний |
| `--color-primary-active` | `#047857` | `brand-700` (= `emerald-700`) | точний |
| `--color-accent` | `#6ee7b7` | `brand-300` (= `emerald-300`) | точний |
| `--color-text` | `#f8fafc` | `text-slate-50` | точний |
| `--color-text-muted` | `#94a3b8` | `text-slate-400` | точний |
| `--color-surface` | `#1e293b` | `bg-slate-800` | точний |
| `--color-surface-alt` | `#0f172a` | `bg-slate-900` | точний |
| `--color-border` | `#334155` | `border-slate-700` | точний |
| `--color-disabled` | `#475569` | `bg-slate-600` | точний |
| `--color-background` | `#111928` | `bg-background` | **власний** (у палітрі немає) |
| `--color-secondary` | `#0d192e` | `bg-secondary` | **власний** |
| `--color-error` | `#e5484d` | `text-error` | **власний** (`red-500` інший) |
| `--color-primary-soft` / `-border` | 12% / 40% primary | `bg-brand-500/12`, `border-brand-500/40` | точний (модифікатор прозорості) |

### Типографіка

| Токен Figma | Значення | Клас Tailwind | Збіг |
|---|---|---|---|
| Display/L | 56 px | `text-display-l` | **власний** (поруч `text-5xl` = 48, `text-6xl` = 60) |
| Display/M | 40 px | `text-display-m` | **власний** |
| Heading/H1 | 48 px | `text-5xl` | точний |
| Heading/H2 | 36 px | `text-4xl` | точний |
| Heading/H3 | 32 px | `text-h3` | **власний** (`text-3xl` = 30) |
| Heading/H4 | 28 px | `text-h4` | **власний** |
| Heading/H5 | 24 px | `text-2xl` | точний |
| Heading/H6, Body/L | 18 px | `text-lg` | точний |
| Body/M | 16 px | `text-base` | точний |
| Body/S | 14 px | `text-sm` | точний |
| Caption | 12 px | `text-xs` | точний |
| line-height body 1.5 | | `leading-normal` | точний |
| line-height 1.2 / 1.3 | | `leading-display` / `leading-heading` | **власний** (`leading-tight` = 1.25) |
| Шрифти | Manrope / Inter | `font-heading` / `font-sans` | власний `@theme` |
| Weights 400/500/600/700 | | `font-normal/medium/semibold/bold` | точний |

### Відступи та розміри (крок 4 px = 1 одиниця Tailwind)

| Токен | px | Клас |
|---|---|---|
| `--spacing-2xs` … `-3xl` | 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 | `1 · 2 · 3 · 4 · 6 · 8 · 12 · 16` (`p-4`, `gap-6`, `mb-16`) |
| `--spacing-inner` | 20 | `5` |
| `--spacing-section` | 96 (72 на мобільному) | `py-24` (`py-18`) |
| `--container-width` | 1280 | `max-w-7xl` |
| `--control-height` | 48 | `h-12` / `min-h-12` |
| `--touch-target` | 44 | `min-h-11` |
| `--header-height` | 84 (72) | `h-21` (`h-18`) |
| `--logo-height` | 64 (56) | `h-16` (`h-14`) |
| `--icon-box-size` / `--icon-image-size` | 72 / 48 | `size-18` / `size-12` |

### Радіуси, тіні, анімація

| Токен | Значення | Клас | Збіг |
|---|---|---|---|
| `--radius-sm/md/lg/xl/full` | 4 / 8 / 12 / 16 / 999 | `rounded-sm/md/lg/xl/full` | через `@theme` (значення збігаються зі `style.css`) |
| `--shadow-md` | `0 8px 24px rgba(0,0,0,.35)` | `shadow-card` | **власний** |
| `--shadow-focus` | `0 0 0 3px #6ee7b7` | `ring-3 ring-brand-300` | точний |
| `--transition-fast` | 0.15s ease-out | `duration-150 ease-out` | точний |
| `--transition-base` | 0.25s ease | `duration-250` | наближений (стандартна крива Tailwind інша) |

## 2. Аналіз `style.css` за трьома групами

### Група 1. Повністю замінюється класами Tailwind

| Правило | Еквівалент | Причина |
|---|---|---|
| `.container` | `mx-auto w-full max-w-7xl px-6 max-[769px]:px-5` | прості властивості без селекторів. **Вже перенесено** |
| `.section` | `py-24 max-[769px]:py-18` | лише padding |
| `.section-heading(.center)` | `mb-16 max-[769px]:mb-12`, `text-center` | лише margin і вирівнювання |
| `.cta-row`, `.cta-actions`, `.result-actions`, `.email-row` | `flex flex-wrap gap-4` | прямий збіг flex-утиліт |
| `.simulator-form`, `.simulator-result`, `.faq-list` | `flex flex-col gap-6` / `gap-4` | прямий збіг |
| `.field-top`, `.range-scale`, `.chart-header` | `flex items-center justify-between gap-4` | прямий збіг |
| Поверхні (`.field-block`, `.info-card`, `.faq-item` …) | `rounded-xl border border-slate-700 bg-slate-800` | усі кольори й радіус точні |
| `.card-copy`, `.faq-answer`, `.chart-label` та інші «muted» | `text-slate-400` | колір точний |
| Жирні підписи (`.field-label`, `.card-title` …) | `font-semibold` | одна властивість |
| `.result-box` | `bg-brand-500/12 border-brand-500/40` | color-mix = модифікатор прозорості |
| `.chart-bars`, `.bar-group` | `grid grid-cols-6 items-end gap-3 h-45`, `flex flex-col items-center justify-end` | сітка і flex |
| `.bar` | `bg-linear-to-b from-brand-400 to-brand-500 rounded-t-md` | градієнт є в Tailwind |
| `.hero .eyebrow` | `inline-flex rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-brand-300` | тег-бейдж |
| `.rating` | `text-slate-50 tracking-[.14em]` | дві властивості |
| `.visually-hidden`, `.skip-link` | `sr-only`, `sr-only focus:not-sr-only …` | вбудована утиліта (skip-link у Header вже так) |
| `@media (prefers-reduced-motion)` для відео | `motion-reduce:hidden` на `<video>` | варіант Tailwind |
| `.icon`, `.icon-sm` | `shrink-0 text-xl leading-none text-brand-500`, `text-xs` | розмір і колір іконок Font Awesome |

### Група 2. Частково замінюється

| Правило | Що перенести на Tailwind | Що лишити і чому |
|---|---|---|
| `html` (smooth scroll, `scroll-padding-top`) | `scroll-smooth scroll-pt-21` на `<html>` | висота шапки тепер 65 px (змінилась), треба оновити значення |
| `body` | `min-h-screen bg-background text-slate-50 font-sans antialiased` | повний збіг, але `body` лишається для сумісності з легасі, доки не перенесено все |
| `h1–h6`, `.title*` | `font-heading font-semibold leading-display text-balance` | розміри різні в різних контекстах (`.simulator .title-md`, `.cta-panel .title-md`): залежать від батьківського селектора, їх переписують **кожному елементу окремо** |
| `.title-md`, `.hero .title-xl` | `text-4xl min-[769px]:text-5xl`, `text-display-m min-[769px]:text-display-l` | **mobile-first перевертає логіку**: у ЛР 5 було `max-width`, у Tailwind `min-width` |
| `.scenario-option` | `has-checked:bg-brand-500 has-focus-visible:ring-3` | `legend` і `fieldset` потребують власних правил (див. групу 3) |
| `.card-link` | `mt-auto inline-flex gap-2 font-semibold text-brand-500 hover:text-brand-400` | стрілка `::after` з шрифтом Font Awesome (або замінити її inline SVG) |
| `.hero` | `relative flex items-center overflow-hidden border-b border-slate-700 bg-background py-16` | висота `min(809px, 100vh − var(--header-height))` потребує arbitrary value |
| `.simulator-box` | `grid gap-8 p-8 rounded-xl border bg-slate-900` | `repeat(auto-fit, minmax(320px, 1fr))` це arbitrary value |
| `.cta-banner`, `.cta-panel` | `bg-linear-135 from-brand-500/12 to-slate-800` | є, але градієнт до `--color-secondary` у `.cta-panel` треба `to-secondary` |
| `.result-value` | `font-heading font-bold text-brand-500 block` | `clamp(2rem, 4vw, 2.5rem)` лише arbitrary |
| `.faq-grid`, `.faq-support` | `grid lg:grid-cols-[2fr_1fr] gap-6`, `lg:sticky lg:top-[calc(50vh-7rem)]` | дві arbitrary-формули |
| `.faq-summary` | `block cursor-pointer list-none` | маркер Safari: `[&::-webkit-details-marker]:hidden` |
| `.three-columns`, `.services-grid` | `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6` (**вже в Card-сітці**) | `auto-fit/minmax` не потрібен, але використовується в секціях, що ще не мігрували |
| `.btn:disabled` | `disabled:bg-slate-600 disabled:text-slate-400` | `pointer-events: none` для `aria-disabled`: `aria-disabled:pointer-events-none` |

### Група 3. Доцільно залишити в `style.css`

| Правило | Причина |
|---|---|
| `:root` токени | єдине джерело значень для легасі-секцій; дублюються в `@theme`, поки всі секції не перенесено |
| `.hero-video` (`mask-image` radial-gradient, `transform`, `aspect-ratio`) | складний ефект розчинення країв: утилітами це довга arbitrary-рядок |
| `.hero-overlay` та його мобільний варіант | багатоступеневий `linear-gradient` із `color-mix` і різними значеннями для екранів |
| Мобільні перевизначення `:root` (`--spacing-section: 72px`, висота шапки) | змінні перевизначаються в медіазапиті, у Tailwind це окремі префікси на кожному елементі |
| `legend { float: left; width: 100% }`, `legend + * { clear: both }`, `fieldset { min-width: 0 }` | хак для стилізації `legend`; sibling-селектор незручний утилітами |
| `:focus-visible { box-shadow }` (глобальне кільце) | глобальне правило для всіх інтерактивних елементів, вигідніше мати в одному місці |
| `.card-link::after` (Font Awesome) | псевдоелемент з іконковим шрифтом |
| `.footer-address::before { content: "Адреса" }` | текстові підписи через `content` (**вже не використовується**, див. нижче) |

## 3. Мертвий CSS після інтеграції компонентів (етап 13)

Після того, як Header і Footer замінено компонентами Tailwind, у `index.html` більше не зустрічається **30 класів**
зі `style.css`:

`active, brand, burger, copyright, dropdown, dropdown-toggle, footer, footer-address, footer-brand, footer-col,
footer-contact, footer-grid, footer-legal, footer-links, footer-list, footer-meta, footer-title, header, header-actions,
header-inner, header-menu, header-nav, icon-sm, menu-item, mini-icon, scenario-icon, services-grid, skip-link,
submenu, submenu-item`

Правила для них можна видалити зі `style.css` (шапка, підвал, сітка Services, плитки іконок). Це помітно
зменшить файл. Я їх **не видаляла** — за методичкою цей етап лише аналіз.

## 4. Що змінено в коді на цьому етапі

- `src/input.css` (`@theme`): додано власні токени, яких немає в стандартній шкалі: `text-display-l/m`, `text-h3/h4`,
  `leading-display/heading`, `bg-background`, `bg-secondary`, `text-error`, `shadow-card`.
- **Знайдено й виправлено помилку інтеграції (етап 13):** клас `.container` зі `style.css` збігається з утилітою
  `container` у Tailwind, яка в шарі `utilities` перебивала власні стилі. Наслідок: між брейкпоінтами (наприклад, на
  700 px) контент звужувався до 640 px, а на екранах від 1536 px розтягувався до 1536 px замість 1280 px. Раніше
  перевірка проходила лише на ширинах, що збігаються з брейкпоінтами, тому помилки не було видно. Тепер десять
  блоків використовують `mx-auto w-full max-w-7xl px-6 max-[769px]:px-5`, а правило `.container` і токени
  `--container-width` / `--container-padding` видалено зі `style.css`.
- Перевірка на 12 ширинах (390 … 1920 px): геометрія й стилі всіх легасі-секцій збігаються з версією без Tailwind,
  крім фону трьох повзунків (`range`): preflight Tailwind робить його прозорим замість білого, на вигляд це не
  впливає.

## 5. Рекомендований порядок подальшої міграції

1. Видалити мертвий CSS (розділ 3).
2. Перенести секції «Як працює», «Чому Coin Flow», «Відгуки» на компонент Card (група 1).
3. Перенести форму раннього доступу, FAQ і фінальний CTA (група 1–2).
4. Симулятор і Hero переносити останніми: у них найбільше arbitrary values і псевдоелементів.
5. Коли `style.css` скоротиться до групи 3, прибрати шар `legacy` і лишити лише потрібні правила.

## 6. Етап 15: адаптивність і брейкпоінти

Перевірка виконана на ширинах 320 / 375 / 768 / 1280 px (горизонтальний скрол, розмір зон натискання, шрифти, елементи за межами екрана).

### Відповідність таблиці з методички

| Елемент | Mobile (без префікса) | Tablet (`sm:`/`md:`) | Desktop (`lg:`/`xl:`) | Де |
|---|---|---|---|---|
| Сітка карток | `grid-cols-1` | `sm:grid-cols-2` | `lg:grid-cols-3` | Card-сітка, `index.html` (сценарії, можливості) |
| Сітка підвалу | `grid-cols-1` | `md:grid-cols-2` | `lg:grid-cols-4` | Footer |
| Розмір тексту | `text-sm` | `md:text-base` | — | опис і заголовок картки (`text-xl md:text-2xl`) |
| Заголовок сторінки | `text-2xl` | `sm:text-3xl md:text-4xl` | `lg:text-5xl` | `<h1>` демо-сторінок (було без `sm:` та `lg:`) |
| Відступи | `p-5`, `px-4` | `md:p-6`, `md:px-6` | `lg:px-10 2xl:px-16` | картка, шапка |
| Кнопки | `w-full` | `md:w-auto` (картка — `sm:w-auto`) | — | Button (**додано**), Card CTA, меню в Header |
| Логотип у шапці | `h-10` | `md:h-12` | — | Header (**додано**) |

### Що додано або виправлено

- **Button:** `w-full md:w-auto` (на мобільному кнопка на всю ширину).
- **`<h1>` демо-сторінок:** повна драбина `text-2xl sm:text-3xl md:text-4xl lg:text-5xl`.
- **Header:** посилання-логотип `min-h-11` (було 40×40 px), логотип `md:h-12`.
- **Зони натискання на мобільному (≥ 44 px):**
  - повзунки симулятора: `-my-3.5 py-3.5 align-middle` збільшує зону до 44 px без зсуву макета (без `align-middle` секція росла на 36 px);
  - посилання «Детальніше» в картках переваг: `min-h-11` (картки стали на 12 px вищі);
  - питання FAQ (`summary`): `-my-2.5 py-2.5`, макет не змінюється.
- **Результат:** на 320 і 375 px усі інтерактивні елементи сторінки та компонентів ≥ 44 px, горизонтального скролу нема,
  елементів за межами екрана нема. axe-core: 0 порушень. W3C Nu: 0 помилок і попереджень.

### Свідомі рішення

- **Шрифт 12 px** лишився у бейджів карток і тегу «Планування бюджету» (токен Caption з дизайн-системи, контраст достатній).
- **Зони натискання на планшеті й десктопі** 36 px у списках посилань підвалу й меню: вимога 44 px стосується дотику, на цих
  ширинах основний ввід мишею (мінімум WCAG 2.2 AA для розміру цілі — 24 px).
- Breakpoint `max-[769px]` (а не `max-md`) потрібен, щоб збігатися з легасі-правилом `≤ 768 px` (у Tailwind v4 `max-*` строго «менше»).

## 7. Етап 17: рафінування

| Напрямок | Що зроблено |
|---|---|
| Семантика | перевірено: `header`, `nav`, `main`, `section`, `article`, `footer`, `address`, ієрархія `h1 → h2 → h3` (змін не потрібно) |
| Доступність | `alt=""` для декоративних зображень, `aria-label` у кнопок без тексту (бургер: `sr-only`, соцмережі: `aria-label`), `aria-describedby` у CTA карток; **картка стала повністю клікабельною** (розтягнуте посилання `after:absolute after:inset-0` на CTA, батько `relative`) |
| Продуктивність | `loading="lazy"` + `decoding="async"` для іконок карток і логотипа в підвалі; `width`/`height` у логотипів (без стрибків макета); логотип у шапці без `lazy` (він над згином) |
| Візуальні покращення | стрілка в CTA картки зсувається при наведенні (`group-hover:translate-x-1`), піднімання картки, тінь, зелена рамка; усе вимикається при `prefers-reduced-motion` |

## 8. Перенесення решти компонентів прямо в `index.html`

Після етапу 13 у проєкті лишалися секції на старих класах. Тепер усі компоненти зі списку лабораторної
(Header, Hero, Button, Card, Navigation, Footer) працюють **безпосередньо в `index.html`**; сторінки в `components/` — лише пісочниця.

| Що перенесено | Було | Стало |
|---|---|---|
| Кнопки (9 шт.) | `.btn .btn-primary/ghost/secondary` | утиліти Tailwind (висота 48 px, радіус `rounded-md`, hover/active/focus-кільце) |
| Hero (текст) | `.hero-copy`, `.eyebrow`, `.title-xl`, `.description`, `.cta-row` | утиліти; у `style.css` лишилися лише `.hero`, `.hero-video`, `.hero-overlay` (група 3) |
| Заголовки й відступи секцій | `.section`, `.section-heading`, `.title-md` | `py-24`, `mb-16 text-center`, `text-4xl min-[769px]:text-5xl` тощо |
| Картки «Як працює», «Чому Coin Flow», «Відгуки» | `.info-card`, `.three-columns` | Card-сітка `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` |
| Мобільна ширина кнопок у формі й фінальному CTA | правило `.email-row .btn`, `.cta-actions .btn` | `max-[769px]:flex-[1_1_100%]` на самих кнопках |

**Видалено мертвий CSS:** зі `style.css` прибрано правила для 66 класів, які більше не зустрічаються в розмітці
(шапка, меню, підвал, `.btn*`, `.info-card`, `.title*`, `.section*` тощо). Файл скоротився з 1451 до ~775 рядків, W3C CSS валідний.

**Перевірка:** висоти всіх секцій на 390 / 768 / 1280 px збігаються з версією до перенесення, піксельне порівняння
показало лише ~116 пікселів різниці (іконка-стрілка в посиланнях «Детальніше»: Font Awesome замінено на SVG).
W3C Nu: 0 помилок, axe-core: 0 порушень, на 320 і 375 px усі інтерактивні елементи ≥ 44 px.
