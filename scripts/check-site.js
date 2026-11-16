// Перевірка сайту перед деплоєм (крок CI в GitHub Actions, локально: npm run check).
// 1) синтаксис усіх JS-файлів; 2) кожен локальний файл, на який посилаються сторінки, існує;
// 3) базові вимоги SEO та доступності: lang, title, description, один <h1>, alt у зображень.
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const pages = ['index.html', 'pricing.html', 'docs.html', 'embed.html', 'contact.html'];
const errors = [];
const fail = (message) => errors.push(message);

// ---------- 1. синтаксис JavaScript ----------
const scripts = [
  ...fs.readdirSync(path.join(root, 'assets/js')).map((name) => 'assets/js/' + name),
  ...fs.readdirSync(path.join(root, 'scripts')).map((name) => 'scripts/' + name),
].filter((file) => file.endsWith('.js'));
for (const file of scripts) {
  const result = spawnSync(process.execPath, ['--check', path.join(root, file)], { encoding: 'utf8' });
  if (result.status !== 0) fail(`${file}: синтаксична помилка\n${result.stderr.trim()}`);
}

// ---------- 2 і 3. сторінки ----------
const sprite = fs.readFileSync(path.join(root, 'assets/icons/sprite.svg'), 'utf8');
for (const page of pages) {
  const file = path.join(root, page);
  if (!fs.existsSync(file)) {
    fail(`${page}: файл не знайдено`);
    continue;
  }
  const html = fs.readFileSync(file, 'utf8');

  // локальні посилання: href, src, poster, data-src, data-video
  const links = [...html.matchAll(/\s(?:href|src|poster|data-src|data-video)="([^"]+)"/g)].map((match) => match[1]);
  for (const link of new Set(links)) {
    if (/^(https?:|mailto:|tel:|data:|#)/.test(link)) continue;
    const [target, fragment] = link.split('#');
    if (!target) continue;
    if (!fs.existsSync(path.join(root, target))) fail(`${page}: немає файлу «${target}»`);
    else if (target.endsWith('sprite.svg') && fragment && !sprite.includes(`id="${fragment}"`)) fail(`${page}: у спрайті немає іконки «${fragment}»`);
  }

  if (!/<html[^>]*\slang="uk"/.test(html)) fail(`${page}: немає lang="uk"`);
  if (!/<title>[^<]{5,}<\/title>/.test(html)) fail(`${page}: немає <title>`);
  if (!/<meta\s+name="description"\s+content="[^"]{20,}"/.test(html)) fail(`${page}: немає meta description`);
  if (!/<link\s+rel="canonical"/.test(html)) fail(`${page}: немає canonical`);
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) fail(`${page}: заголовків <h1> має бути 1, знайдено ${h1}`);
  const noAlt = (html.match(/<img\b(?![^>]*\salt=)[^>]*>/g) || []).length;
  if (noAlt) fail(`${page}: зображень без alt: ${noAlt}`);
}

for (const file of ['css/tailwind.css', 'css/legacy.min.css', 'robots.txt', 'sitemap.xml']) {
  if (!fs.existsSync(path.join(root, file))) fail(`немає файлу ${file}`);
}

if (errors.length) {
  console.error(`Перевірку не пройдено (${errors.length}):\n- ` + errors.join('\n- '));
  process.exit(1);
}
console.log(`Перевірку пройдено: ${scripts.length} скриптів, ${pages.length} сторінок, посилання та SEO-теги в порядку.`);
