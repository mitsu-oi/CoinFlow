// Інформер «Курс валют НБУ» і конвертер гривні (сторінка embed.html).
// Підключається з defer: не блокує завантаження сторінки. Дані: відкрите API Національного банку України.
(() => {
  const API = 'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json';
  const status = document.querySelector('[data-rates-status]');
  const outputs = document.querySelectorAll('[data-rate]');
  const amount = document.getElementById('uah-amount');
  const converted = document.querySelectorAll('[data-converted]');
  if (!outputs.length) return;

  const rates = {}; // курс гривні до валюти: { USD: 41.2, EUR: 44.7 }
  const nf = new Intl.NumberFormat('uk-UA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const symbols = { USD: '$', EUR: '€' };

  // переводить суму в гривнях у валюту за курсом НБУ
  function convert() {
    converted.forEach((out) => {
      const code = out.dataset.converted;
      const uah = parseFloat(amount ? amount.value : '');
      out.textContent = rates[code] && uah >= 0 ? `${nf.format(uah / rates[code])} ${symbols[code]}` : '—';
    });
  }

  if (amount) amount.addEventListener('input', convert);

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
        rates[out.dataset.rate] = item.rate;
        out.textContent = item.rate.toFixed(2) + ' ₴';
        date = item.exchangedate;
      });
      if (status && date) status.textContent = 'Офіційний курс НБУ на ' + date;
      convert();
    })
    .catch(() => {
      if (status) status.textContent = 'Не вдалося завантажити курси. Спробуйте пізніше.';
    });
})();
