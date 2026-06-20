(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var isOpen = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!isOpen));
      mobilePanel.hidden = isOpen;
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var activeIndex = 0;
    var timer = null;

    var showSlide = function (index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === activeIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === activeIndex);
      });
    };

    var startTimer = function () {
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        showSlide(index);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  var categoryPage = document.querySelector('[data-category-page]');

  if (categoryPage) {
    var filterInput = categoryPage.querySelector('[data-filter-input]');
    var yearSelect = categoryPage.querySelector('[data-filter-year]');
    var typeSelect = categoryPage.querySelector('[data-filter-type]');
    var cards = Array.prototype.slice.call(categoryPage.querySelectorAll('.movie-card'));

    var normalize = function (value) {
      return String(value || '').toLowerCase().trim();
    };

    var applyFilters = function () {
      var query = normalize(filterInput && filterInput.value);
      var year = yearSelect ? yearSelect.value : 'all';
      var type = typeSelect ? typeSelect.value : 'all';

      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-tags')
        ].join(' '));
        var matchesQuery = !query || text.indexOf(query) !== -1;
        var matchesYear = year === 'all' || card.getAttribute('data-year') === year;
        var matchesType = type === 'all' || card.getAttribute('data-type') === type;
        card.classList.toggle('is-filtered-out', !(matchesQuery && matchesYear && matchesType));
      });
    };

    [filterInput, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });
  }

  var searchPage = document.querySelector('[data-search-page]');

  if (searchPage && window.MovieSearchIndex) {
    var form = searchPage.querySelector('[data-search-form]');
    var input = searchPage.querySelector('[data-search-input]');
    var results = searchPage.querySelector('[data-search-results]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    var renderResult = function (item) {
      var tags = item.tags.slice(0, 4).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return '' +
        '<article class="search-result-item">' +
          '<a href="' + item.url + '"><img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy"></a>' +
          '<div>' +
            '<h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>' +
            '<p>' + escapeHtml(item.oneLine) + '</p>' +
            '<div class="movie-meta-line"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.type) + '</span></div>' +
            '<div class="tag-row">' + tags + '</div>' +
          '</div>' +
        '</article>';
    };

    var runSearch = function (query) {
      var normalized = String(query || '').toLowerCase().trim();

      if (!normalized) {
        results.innerHTML = '<div class="empty-state">输入片名、类型、地区或标签开始搜索。</div>';
        return;
      }

      var matched = window.MovieSearchIndex.filter(function (item) {
        return item.searchText.indexOf(normalized) !== -1;
      }).slice(0, 80);

      if (!matched.length) {
        results.innerHTML = '<div class="empty-state">没有找到匹配的影片。</div>';
        return;
      }

      results.innerHTML = matched.map(renderResult).join('');
    };

    if (input) {
      input.value = initialQuery;
      runSearch(initialQuery);
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var query = input.value.trim();
        var nextUrl = query ? './search.html?q=' + encodeURIComponent(query) : './search.html';
        window.history.replaceState({}, '', nextUrl);
        runSearch(query);
      });
    }
  }

  window.MoviePlayer = {
    mount: function (sourceUrl, playerId) {
      var root = document.getElementById(playerId);

      if (!root) {
        return;
      }

      var video = root.querySelector('video');
      var overlay = root.querySelector('.player-overlay');
      var hls = null;

      if (!video) {
        return;
      }

      var bindSource = function () {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = sourceUrl;
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(sourceUrl);
          hls.attachMedia(video);
          return;
        }

        video.src = sourceUrl;
      };

      var start = function () {
        bindSource();
        var playPromise = video.play();

        if (playPromise && typeof playPromise.then === 'function') {
          playPromise.then(function () {
            if (overlay) {
              overlay.classList.add('is-hidden');
            }
          }).catch(function () {
            video.controls = true;
          });
        } else if (overlay) {
          overlay.classList.add('is-hidden');
        }
      };

      if (overlay) {
        overlay.addEventListener('click', start);
      }

      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });

      video.addEventListener('ended', function () {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      });

      video.addEventListener('error', function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    }
  };

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();
