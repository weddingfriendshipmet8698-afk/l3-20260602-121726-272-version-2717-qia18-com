(function () {
  const body = document.body;
  const toggle = document.querySelector('[data-menu-toggle]');
  const panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
      body.classList.toggle('no-scroll', panel.classList.contains('open'));
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  let activeSlide = 0;
  let timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeSlide);
    });
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }

    timer = window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      if (timer) {
        window.clearInterval(timer);
      }
      showSlide(index);
      startHero();
    });
  });

  showSlide(0);
  startHero();

  const filterForm = document.querySelector('[data-filter-form]');
  if (filterForm) {
    const keyword = filterForm.querySelector('[data-filter-keyword]');
    const year = filterForm.querySelector('[data-filter-year]');
    const type = filterForm.querySelector('[data-filter-type]');
    const cards = Array.from(document.querySelectorAll('[data-movie-card]'));

    function applyFilter(event) {
      if (event) {
        event.preventDefault();
      }

      const keywordValue = (keyword.value || '').trim().toLowerCase();
      const yearValue = year.value || '';
      const typeValue = type.value || '';

      cards.forEach(function (card) {
        const haystack = (card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags')).toLowerCase();
        const matchKeyword = !keywordValue || haystack.indexOf(keywordValue) !== -1;
        const matchYear = !yearValue || card.getAttribute('data-year') === yearValue;
        const matchType = !typeValue || card.getAttribute('data-type') === typeValue;
        card.style.display = matchKeyword && matchYear && matchType ? '' : 'none';
      });
    }

    filterForm.addEventListener('submit', applyFilter);
    [keyword, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
  }

  function startVideo(wrap) {
    const video = wrap.querySelector('video');
    const source = video ? video.getAttribute('data-src') : '';
    if (!video || !source) {
      return;
    }

    wrap.classList.add('is-playing');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.play().catch(function () {});
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      return;
    }

    video.src = source;
    video.play().catch(function () {});
  }

  document.querySelectorAll('[data-video-wrap]').forEach(function (wrap) {
    wrap.addEventListener('click', function (event) {
      if (event.target.tagName.toLowerCase() !== 'video') {
        startVideo(wrap);
      }
    });
  });

  const searchBox = document.querySelector('[data-search-box]');
  const resultBox = document.querySelector('[data-search-results]');

  function renderSearchResults(query) {
    if (!resultBox || !window.SEARCH_MOVIES) {
      return;
    }

    const value = (query || '').trim().toLowerCase();
    const rows = window.SEARCH_MOVIES.filter(function (item) {
      const haystack = (item.title + ' ' + item.region + ' ' + item.type + ' ' + item.year + ' ' + item.category + ' ' + item.tags).toLowerCase();
      return !value || haystack.indexOf(value) !== -1;
    }).slice(0, 80);

    resultBox.innerHTML = rows.map(function (item) {
      return '<a class="search-result" href="' + item.link + '">' +
        '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '">' +
        '<span>' +
          '<h3>' + item.title + '</h3>' +
          '<span class="card-meta"><span>' + item.year + '</span><span>' + item.region + ' · ' + item.type + '</span><span>' + item.category + '</span></span>' +
          '<p>' + item.oneLine + '</p>' +
        '</span>' +
      '</a>';
    }).join('');
  }

  if (searchBox && resultBox) {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q') || '';
    searchBox.value = q;
    renderSearchResults(q);
    searchBox.addEventListener('input', function () {
      renderSearchResults(searchBox.value);
    });
  }
})();
