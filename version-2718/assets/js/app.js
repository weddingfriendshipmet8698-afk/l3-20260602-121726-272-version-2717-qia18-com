(function () {
  var body = document.body;
  var menuToggle = document.querySelector("[data-menu-toggle]");

  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      body.classList.toggle("menu-open");
    });
  }

  var hero = document.querySelector("[data-hero-slider]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var thumbs = Array.prototype.slice.call(hero.querySelectorAll(".hero-thumb"));
    var current = 0;
    var timer = null;

    function setHero(index) {
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
      thumbs.forEach(function (thumb, thumbIndex) {
        thumb.classList.toggle("is-active", thumbIndex === current);
      });
    }

    function nextHero() {
      setHero(current + 1);
    }

    function startHero() {
      stopHero();
      timer = window.setInterval(nextHero, 5200);
    }

    function stopHero() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    var prevButton = hero.querySelector("[data-hero-prev]");
    var nextButton = hero.querySelector("[data-hero-next]");

    if (prevButton) {
      prevButton.addEventListener("click", function () {
        setHero(current - 1);
        startHero();
      });
    }

    if (nextButton) {
      nextButton.addEventListener("click", function () {
        nextHero();
        startHero();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        setHero(Number(dot.getAttribute("data-hero-index")) || 0);
        startHero();
      });
    });

    thumbs.forEach(function (thumb) {
      thumb.addEventListener("mouseenter", function () {
        setHero(Number(thumb.getAttribute("data-hero-index")) || 0);
      });
    });

    hero.addEventListener("mouseenter", stopHero);
    hero.addEventListener("mouseleave", startHero);
    startHero();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  var filterGrid = document.querySelector("[data-filter-grid]");

  if (filterGrid) {
    var localSearch = document.querySelector("[data-local-search]");
    var localYear = document.querySelector("[data-local-year]");
    var localRegion = document.querySelector("[data-local-region]");
    var items = Array.prototype.slice.call(filterGrid.querySelectorAll(".filter-item"));

    function applyLocalFilter() {
      var query = normalize(localSearch && localSearch.value);
      var year = normalize(localYear && localYear.value);
      var region = normalize(localRegion && localRegion.value);

      items.forEach(function (item) {
        var haystack = normalize([
          item.getAttribute("data-title"),
          item.getAttribute("data-year"),
          item.getAttribute("data-region"),
          item.getAttribute("data-type"),
          item.getAttribute("data-genre")
        ].join(" "));
        var itemYear = normalize(item.getAttribute("data-year"));
        var itemRegion = normalize(item.getAttribute("data-region"));
        var matched = (!query || haystack.indexOf(query) !== -1) && (!year || itemYear === year) && (!region || itemRegion === region);
        item.classList.toggle("is-hidden", !matched);
      });
    }

    [localSearch, localYear, localRegion].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyLocalFilter);
        control.addEventListener("change", applyLocalFilter);
      }
    });
  }

  function initPlayer(shell) {
    var video = shell.querySelector("video[data-stream]");
    var button = shell.querySelector("[data-play-button]");

    if (!video || !button) {
      return;
    }

    function attach() {
      if (video.getAttribute("data-ready") === "yes") {
        return;
      }

      var stream = video.getAttribute("data-stream");

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        video.hlsInstance = hls;
      } else {
        video.src = stream;
      }

      video.setAttribute("data-ready", "yes");
    }

    function playVideo() {
      attach();
      shell.classList.add("is-playing");
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          shell.classList.remove("is-playing");
        });
      }
    }

    button.addEventListener("click", playVideo);
    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      }
    });
    video.addEventListener("play", function () {
      shell.classList.add("is-playing");
    });
    video.addEventListener("pause", function () {
      if (!video.ended) {
        shell.classList.remove("is-playing");
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll("[data-player-shell]")).forEach(initPlayer);

  var searchPage = document.querySelector("[data-search-page]");

  if (searchPage && window.SITE_INDEX) {
    var searchInput = searchPage.querySelector("[data-search-input]");
    var searchResults = searchPage.querySelector("[data-search-results]");
    var searchTitle = searchPage.querySelector("[data-search-title]");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    if (searchInput) {
      searchInput.value = initialQuery;
    }

    function cardTemplate(item) {
      var tags = (item.tags || []).slice(0, 4).map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      }).join("");

      return "<article class=\"movie-card\">" +
        "<a class=\"poster-link\" href=\"" + item.url + "\" title=\"" + escapeHtml(item.title) + "\">" +
        "<img src=\"" + item.cover + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">" +
        "<span class=\"poster-shade\"></span><span class=\"poster-play\">播放</span></a>" +
        "<div class=\"movie-card-body\"><div class=\"movie-meta\"><span>" + escapeHtml(item.year) + "</span><span>" + escapeHtml(item.region) + "</span><span>" + escapeHtml(item.type) + "</span></div>" +
        "<h2><a href=\"" + item.url + "\">" + escapeHtml(item.title) + "</a></h2>" +
        "<p>" + escapeHtml(item.oneLine) + "</p><div class=\"tag-row\">" + tags + "</div></div></article>";
    }

    function escapeHtml(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function renderSearch() {
      var query = normalize(searchInput && searchInput.value);
      var results = window.SITE_INDEX.filter(function (item) {
        var haystack = normalize([
          item.title,
          item.year,
          item.region,
          item.type,
          item.genre,
          (item.tags || []).join(" "),
          item.oneLine
        ].join(" "));
        return !query || haystack.indexOf(query) !== -1;
      }).slice(0, 96);

      if (searchTitle) {
        searchTitle.textContent = query ? "与“" + query + "”相关的影片" : "推荐影片";
      }

      if (!results.length) {
        searchResults.innerHTML = "<div class=\"empty-state\">没有找到匹配影片</div>";
        return;
      }

      searchResults.innerHTML = results.map(cardTemplate).join("");
    }

    if (searchInput) {
      searchInput.addEventListener("input", renderSearch);
    }

    renderSearch();
  }
})();
