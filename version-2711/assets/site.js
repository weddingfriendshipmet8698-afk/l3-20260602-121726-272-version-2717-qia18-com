(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobilePanel = document.querySelector('.mobile-panel');
    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var prev = document.querySelector('.hero-prev');
    var next = document.querySelector('.hero-next');
    var current = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('active', i === current);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('active', i === current);
        });
    }

    function startHeroTimer() {
        if (!slides.length) {
            return;
        }
        clearInterval(timer);
        timer = setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            showSlide(parseInt(dot.getAttribute('data-slide'), 10) || 0);
            startHeroTimer();
        });
    });

    if (prev) {
        prev.addEventListener('click', function () {
            showSlide(current - 1);
            startHeroTimer();
        });
    }

    if (next) {
        next.addEventListener('click', function () {
            showSlide(current + 1);
            startHeroTimer();
        });
    }

    startHeroTimer();

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    var globalSearchInput = document.querySelector('.global-search-input');
    if (globalSearchInput) {
        globalSearchInput.value = query;
    }

    function applyFilter(root) {
        var textInput = root.querySelector('.card-filter-input') || root.querySelector('.global-search-input');
        var yearSelect = root.querySelector('.year-filter');
        var cards = Array.prototype.slice.call(root.querySelectorAll('.movie-card'));
        var empty = root.querySelector('.empty-result');
        var initialText = query.trim().toLowerCase();
        if (textInput && initialText && !textInput.value) {
            textInput.value = initialText;
        }

        function filterCards() {
            var text = textInput ? textInput.value.trim().toLowerCase() : '';
            var year = yearSelect ? yearSelect.value : '';
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = card.innerText.toLowerCase() + ' ' + Array.prototype.map.call(card.attributes, function (attr) {
                    return attr.value;
                }).join(' ').toLowerCase();
                var okText = !text || haystack.indexOf(text) !== -1;
                var okYear = !year || card.getAttribute('data-year') === year;
                var ok = okText && okYear;
                card.style.display = ok ? '' : 'none';
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.style.display = visible ? 'none' : 'block';
            }
        }

        if (textInput) {
            textInput.addEventListener('input', filterCards);
        }
        if (yearSelect) {
            yearSelect.addEventListener('change', filterCards);
        }
        filterCards();
    }

    document.querySelectorAll('.content-section').forEach(applyFilter);
}());

function initMoviePlayer(videoId, overlayId, source) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    if (!video || !overlay || !source) {
        return;
    }
    var started = false;
    var hlsInstance = null;

    function hideOverlay() {
        overlay.classList.add('hide');
    }

    function start() {
        hideOverlay();
        if (started) {
            video.play().catch(function () {});
            return;
        }
        started = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.play().catch(function () {});
            return;
        }
        if (typeof Hls !== 'undefined' && Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
            });
            return;
        }
        video.src = source;
        video.play().catch(function () {});
    }

    overlay.addEventListener('click', start);
    video.addEventListener('click', function () {
        if (!started || video.paused) {
            start();
        }
    });
    video.addEventListener('play', hideOverlay);
    window.addEventListener('pagehide', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
