(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, currentIndex) {
        slide.classList.toggle("active", currentIndex === index);
      });
      dots.forEach(function (dot, currentIndex) {
        dot.classList.toggle("active", currentIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var nextIndex = Number(dot.getAttribute("data-hero-dot"));
        show(nextIndex);
        start();
      });
    });

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    start();
  }

  function setupJumpSearch() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-search-jump]"));
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var query = input ? input.value.trim() : "";
        var target = "./search.html";
        if (query) {
          target += "?q=" + encodeURIComponent(query);
        }
        window.location.href = target;
      });
    });
  }

  function filterCards(grid, query) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
    var words = normalize(query).split(/\s+/).filter(Boolean);
    var visible = 0;
    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute("data-search"));
      var matched = words.length === 0 || words.every(function (word) {
        return haystack.indexOf(word) !== -1;
      });
      card.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    });
    return visible;
  }

  function setupLocalFilter() {
    var input = document.querySelector("[data-card-filter]");
    var grid = document.querySelector("[data-card-grid]");
    var empty = document.querySelector("[data-empty-state]");
    if (!input || !grid) {
      return;
    }
    input.addEventListener("input", function () {
      var visible = filterCards(grid, input.value);
      if (empty) {
        empty.hidden = visible !== 0;
      }
    });
  }

  function setupSortButtons() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-sort]"));
    var grid = document.querySelector("[data-card-grid]");
    if (!buttons.length || !grid) {
      return;
    }
    var originalCards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        buttons.forEach(function (item) {
          item.classList.toggle("active", item === button);
        });
        var mode = button.getAttribute("data-sort");
        var cards = originalCards.slice();
        if (mode !== "default") {
          cards.sort(function (a, b) {
            return Number(b.getAttribute("data-" + mode) || 0) - Number(a.getAttribute("data-" + mode) || 0);
          });
        }
        cards.forEach(function (card) {
          grid.appendChild(card);
        });
      });
    });
  }

  function setupSearchPage() {
    var form = document.querySelector("[data-search-page-form]");
    var input = document.querySelector("[data-search-input]");
    var grid = document.querySelector("[data-card-grid]");
    var summary = document.querySelector("[data-search-summary]");
    var empty = document.querySelector("[data-empty-state]");
    if (!form || !input || !grid) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;

    function apply() {
      var query = input.value.trim();
      var visible = filterCards(grid, query);
      if (summary) {
        summary.textContent = query ? "关键词：" + query : "输入关键词查找影片。";
      }
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var url = new URL(window.location.href);
      if (query) {
        url.searchParams.set("q", query);
      } else {
        url.searchParams.delete("q");
      }
      window.history.replaceState({}, "", url.toString());
      apply();
    });

    input.addEventListener("input", apply);
    apply();
  }

  window.initPlayer = function (videoId, overlayId, sourceUrl) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    if (!video || !overlay || !sourceUrl) {
      return;
    }
    var prepared = false;
    var hls = null;

    function prepare() {
      if (prepared) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          maxBufferLength: 30,
          backBufferLength: 30
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
      prepared = true;
    }

    function start() {
      prepare();
      overlay.classList.add("is-hidden");
      video.controls = true;
      var playAttempt = video.play();
      if (playAttempt && typeof playAttempt.catch === "function") {
        playAttempt.catch(function () {});
      }
    }

    overlay.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("play", function () {
      overlay.classList.add("is-hidden");
    });
    window.addEventListener("beforeunload", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupJumpSearch();
    setupLocalFilter();
    setupSortButtons();
    setupSearchPage();
  });
})();
