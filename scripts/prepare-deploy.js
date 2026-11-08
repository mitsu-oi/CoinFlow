// Збирає чисту папку для Netlify: лише те, що потрібно сайту (без node_modules, components, src, документації)
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const out = path.resolve(root, '..', 'coin-flow-deploy');
const include = ['index.html', 'pricing.html', 'docs.html', 'embed.html', 'contact.html', 'css/tailwind.css', 'css/style.css', 'assets'];

fs.rmSync(out, { recursive: true, force: true });
for (const item of include) {
  fs.cpSync(path.join(root, item), path.join(out, item), { recursive: true });
}

// Netlify дописує в кінець відповіді власний скрипт (/.netlify/scripts/hud) ПІСЛЯ </html>, і валідатор W3C
// дає «Stray start tag script». Закриваючі теги </body> і </html> у HTML необов'язкові, тому в копії для
// публікації їх прибираємо: дописаний скрипт тоді опиняється всередині <body>, і сторінка лишається валідною.
// Основний index.html у проєкті не змінюється.
for (const page of ['index.html', 'pricing.html', 'docs.html', 'embed.html', 'contact.html']) {
  const file = path.join(out, page);
  const html = fs.readFileSync(file, 'utf8');
  const stripped = html.replace(/\s*<\/body>\s*<\/html>\s*$/i, '\n');
  if (stripped === html) throw new Error('Не знайдено </body></html> наприкінці ' + page);
  fs.writeFileSync(file, stripped);
}

const list = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    return e.isDirectory() ? list(full) : [path.relative(out, full).split(path.sep).join('/')];
  });

const files = list(out);
const bytes = files.reduce((sum, f) => sum + fs.statSync(path.join(out, f)).size, 0);
console.log(`Готово: ${out}`);
files.forEach((f) => console.log('  ' + f));
console.log(`Усього файлів: ${files.length}, ${(bytes / 1024 / 1024).toFixed(2)} МБ`);
