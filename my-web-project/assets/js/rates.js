// Інформер «Курс валют НБУ»: підставляє офіційні курси у блок <aside id="rates"> на сторінці embed.html.
// Підключається з defer: не блокує завантаження сторінки. Дані: відкрите API Національного банку України.
(() => {
  const API = 'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json';
  const status = document.querySelector('[data-rates-status]');
  const outputs = document.querySelectorAll('[data-rate]');
  if (!outputs.length) return;

  fetch(API)
    .then((response) => {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response.json();
    })
    .then((list) => {
      let date = '';
      outputs.forEach((out) => {
        const item = list.find((x) => x.cc === out.dataset.rate);
        if (!item) return;
        out.textContent = item.rate.toFixed(2) + ' ₴';
        date = item.exchangedate;
      });
      if (status && date) status.textContent = 'Офіційний курс НБУ на ' + date;
    })
    .catch(() => {
      if (status) status.textContent = 'Не вдалося завантажити курси. Спробуйте пізніше.';
    });
})();
