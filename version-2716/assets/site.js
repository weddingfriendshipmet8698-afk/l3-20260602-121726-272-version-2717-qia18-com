(function () {
  const toggle = document.querySelector('[data-mobile-toggle]');
  const menu = document.querySelector('[data-mobile-menu]');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      const open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('is-active', itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('is-active', itemIndex === index);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      play();
    }

    dots.forEach(function (dot, itemIndex) {
      dot.addEventListener('click', function () {
        show(itemIndex);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    play();
  }

  document.querySelectorAll('[data-filter-grid]').forEach(function (root) {
    const input = root.querySelector('[data-filter-input]');
    const category = root.querySelector('[data-filter-category]');
    const year = root.querySelector('[data-filter-year]');
    const type = root.querySelector('[data-filter-type]');
    const cards = Array.from(root.querySelectorAll('[data-card]'));
    const empty = root.querySelector('[data-empty-state]');

    function matchYear(cardYear, selected) {
      if (!selected) {
        return true;
      }
      const value = Number(cardYear || 0);
      const target = Number(selected);
      if (selected === '2010') {
        return value >= 2010 && value <= 2019;
      }
      if (selected === '2000') {
        return value < 2010;
      }
      return value === target;
    }

    function apply() {
      const keyword = input ? input.value.trim().toLowerCase() : '';
      const selectedCategory = category ? category.value : '';
      const selectedYear = year ? year.value : '';
      const selectedType = type ? type.value : '';
      let visible = 0;

      cards.forEach(function (card) {
        const text = card.getAttribute('data-text') || '';
        const cardCategory = card.getAttribute('data-category') || '';
        const cardYear = card.getAttribute('data-year') || '';
        const cardType = card.getAttribute('data-type') || '';
        const okKeyword = !keyword || text.indexOf(keyword) !== -1;
        const okCategory = !selectedCategory || cardCategory === selectedCategory;
        const okYear = matchYear(cardYear, selectedYear);
        const okType = !selectedType || cardType.indexOf(selectedType) !== -1;
        const ok = okKeyword && okCategory && okYear && okType;
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [input, category, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  });
})();
