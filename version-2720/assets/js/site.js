function setupMenu() {
  var button = document.querySelector("[data-menu-button]");
  var menu = document.querySelector("[data-menu]");

  if (!button || !menu) {
    return;
  }

  button.addEventListener("click", function () {
    var open = menu.classList.toggle("is-open");
    button.setAttribute("aria-expanded", open ? "true" : "false");
  });
}

function setupHero() {
  var root = document.querySelector("[data-hero]");

  if (!root) {
    return;
  }

  var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
  var prev = root.querySelector("[data-hero-prev]");
  var next = root.querySelector("[data-hero-next]");
  var current = 0;
  var timer = null;

  function show(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  }

  function start() {
    stop();
    timer = window.setInterval(function () {
      show(current + 1);
    }, 5600);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      show(Number(dot.getAttribute("data-hero-dot")) || 0);
      start();
    });
  });

  if (prev) {
    prev.addEventListener("click", function () {
      show(current - 1);
      start();
    });
  }

  if (next) {
    next.addEventListener("click", function () {
      show(current + 1);
      start();
    });
  }

  root.addEventListener("mouseenter", stop);
  root.addEventListener("mouseleave", start);
  show(0);
  start();
}

function normalizeText(value) {
  return String(value || "").toLowerCase().trim();
}

function setupFilters() {
  var areas = Array.prototype.slice.call(document.querySelectorAll("[data-filter-area]"));

  areas.forEach(function (area) {
    var input = area.querySelector("[data-query-input]");
    var year = area.querySelector("[data-filter-year]");
    var type = area.querySelector("[data-filter-type]");
    var category = area.querySelector("[data-filter-category]");
    var params = new URLSearchParams(window.location.search);
    var queryValue = params.get("q");
    var scope = area.parentElement || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));

    if (input && queryValue && !input.value) {
      input.value = queryValue;
    }

    function apply() {
      var q = normalizeText(input && input.value);
      var selectedYear = normalizeText(year && year.value);
      var selectedType = normalizeText(type && type.value);
      var selectedCategory = normalizeText(category && category.value);

      cards.forEach(function (card) {
        var haystack = normalizeText([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-category")
        ].join(" "));
        var matchesQuery = !q || haystack.indexOf(q) !== -1;
        var matchesYear = !selectedYear || normalizeText(card.getAttribute("data-year")) === selectedYear;
        var matchesType = !selectedType || normalizeText(card.getAttribute("data-type")).indexOf(selectedType) !== -1 || normalizeText(card.getAttribute("data-genre")).indexOf(selectedType) !== -1;
        var matchesCategory = !selectedCategory || normalizeText(card.getAttribute("data-category")) === selectedCategory;
        card.classList.toggle("is-hidden", !(matchesQuery && matchesYear && matchesType && matchesCategory));
      });
    }

    [input, year, type, category].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    apply();
  });
}

function setupPlayerScroll() {
  var triggers = Array.prototype.slice.call(document.querySelectorAll("[data-scroll-player]"));

  triggers.forEach(function (trigger) {
    trigger.addEventListener("click", function (event) {
      var frame = document.querySelector(".player-shell");

      if (frame) {
        event.preventDefault();
        frame.scrollIntoView({ behavior: "smooth", block: "center" });
        var overlay = document.querySelector("[data-player-overlay]");

        if (overlay) {
          overlay.click();
        }
      }
    });
  });
}

function initMoviePlayer(src) {
  var video = document.querySelector("[data-player-video]");
  var overlay = document.querySelector("[data-player-overlay]");
  var loaded = false;
  var hlsInstance = null;

  if (!video || !overlay || !src) {
    return;
  }

  function load() {
    if (loaded) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({ enableWorker: true });
      hlsInstance.loadSource(src);
      hlsInstance.attachMedia(video);
    } else {
      video.src = src;
    }

    loaded = true;
  }

  function play() {
    load();
    overlay.classList.add("is-hidden");
    video.controls = true;
    var request = video.play();

    if (request && typeof request.catch === "function") {
      request.catch(function () {});
    }
  }

  overlay.addEventListener("click", play);
  video.addEventListener("click", function () {
    if (video.paused) {
      play();
    }
  });
  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}

window.initMoviePlayer = initMoviePlayer;

document.addEventListener("DOMContentLoaded", function () {
  setupMenu();
  setupHero();
  setupFilters();
  setupPlayerScroll();
});
