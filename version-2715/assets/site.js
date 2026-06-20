(function () {
  function normalize(text) {
    return String(text || '').toLowerCase().trim();
  }

  function filterCards() {
    var input = document.querySelector('[data-search-input]');
    var select = document.querySelector('[data-year-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var empty = document.querySelector('[data-empty-result]');

    if (!cards.length) {
      return;
    }

    var keyword = normalize(input ? input.value : '');
    var year = select ? select.value : '';
    var visible = 0;

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags') + ' ' + card.getAttribute('data-region'));
      var cardYear = card.getAttribute('data-year');
      var hitKeyword = !keyword || text.indexOf(keyword) !== -1;
      var hitYear = !year || cardYear === year;
      var show = hitKeyword && hitYear;
      card.style.display = show ? '' : 'none';
      if (show) {
        visible += 1;
      }
    });

    if (empty) {
      empty.style.display = visible ? 'none' : 'block';
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var input = document.querySelector('[data-search-input]');
    var select = document.querySelector('[data-year-filter]');
    if (input) {
      input.addEventListener('input', filterCards);
    }
    if (select) {
      select.addEventListener('change', filterCards);
    }
  });
})();
