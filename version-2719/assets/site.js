(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMobileNav() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                window.clearInterval(timer);
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });

        show(0);
        start();
    }

    function setupFilters() {
        var scope = document.querySelector("[data-filter-scope]");
        var input = document.querySelector("[data-filter-input]");
        var yearFilter = document.querySelector("[data-year-filter]");
        var typeFilter = document.querySelector("[data-type-filter]");
        var count = document.querySelector("[data-filter-count]");
        if (!scope || !input) {
            return;
        }
        var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q");
        if (initialQuery) {
            input.value = initialQuery;
        }

        function matchYear(card, value) {
            if (!value) {
                return true;
            }
            var year = Number(card.getAttribute("data-year")) || 0;
            if (value === "1990") {
                return year >= 1990 && year < 2000;
            }
            if (value === "1980") {
                return year > 0 && year < 1990;
            }
            return String(year) === value;
        }

        function apply() {
            var query = input.value.trim().toLowerCase();
            var yearValue = yearFilter ? yearFilter.value : "";
            var typeValue = typeFilter ? typeFilter.value : "";
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute("data-title") || "",
                    card.getAttribute("data-keywords") || "",
                    card.getAttribute("data-year") || "",
                    card.getAttribute("data-type") || ""
                ].join(" ").toLowerCase();
                var matchesQuery = !query || haystack.indexOf(query) !== -1;
                var matchesYear = matchYear(card, yearValue);
                var matchesType = !typeValue || (card.getAttribute("data-type") || "").indexOf(typeValue) !== -1;
                var isVisible = matchesQuery && matchesYear && matchesType;
                card.classList.toggle("hidden", !isVisible);
                if (isVisible) {
                    visible += 1;
                }
            });
            if (count) {
                count.textContent = "显示 " + visible + " / " + cards.length + " 部";
            }
        }

        input.addEventListener("input", apply);
        if (yearFilter) {
            yearFilter.addEventListener("change", apply);
        }
        if (typeFilter) {
            typeFilter.addEventListener("change", apply);
        }
        apply();
    }

    function setupPlayers() {
        var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-play-button]"));
        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                var box = button.closest("[data-player-box]");
                var video = box ? box.querySelector("video") : null;
                if (!video) {
                    return;
                }
                var source = video.getAttribute("data-src");
                if (!source) {
                    button.textContent = "暂无播放源";
                    return;
                }
                function playVideo() {
                    video.play().then(function () {
                        button.classList.add("hidden");
                    }).catch(function () {
                        button.textContent = "点击继续播放";
                    });
                }
                if (video.getAttribute("data-loaded") === "1") {
                    playVideo();
                    return;
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    video.setAttribute("data-loaded", "1");
                    playVideo();
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls();
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.setAttribute("data-loaded", "1");
                        playVideo();
                    });
                    hls.on(window.Hls.Events.ERROR, function () {
                        button.textContent = "播放源加载中，请重试";
                    });
                    return;
                }
                video.src = source;
                video.setAttribute("data-loaded", "1");
                playVideo();
            });
        });
    }

    ready(function () {
        setupMobileNav();
        setupHero();
        setupFilters();
        setupPlayers();
    });
})();
