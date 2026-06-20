
(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMobileMenu() {
        var button = qs('[data-menu-button]');
        var nav = qs('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function setupHero() {
        var hero = qs('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = qsa('[data-hero-slide]', hero);
        var dots = qsa('[data-hero-dot]', hero);
        var prev = qs('[data-hero-prev]', hero);
        var next = qs('[data-hero-next]', hero);
        var index = 0;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
            });
        });
        if (slides.length > 1) {
            window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }
        show(0);
    }

    function setupSearch() {
        var input = qs('[data-search-input]');
        var yearSelect = qs('[data-year-filter]');
        var categorySelect = qs('[data-category-filter]');
        var cards = qsa('[data-title]');
        if (!input || cards.length === 0) {
            return;
        }

        function normalize(text) {
            return String(text || '').toLowerCase().trim();
        }

        function filter() {
            var q = normalize(input.value);
            var year = yearSelect ? yearSelect.value : '';
            var category = categorySelect ? categorySelect.value : '';
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-category')
                ].join(' '));
                var matchText = !q || haystack.indexOf(q) !== -1;
                var matchYear = !year || card.getAttribute('data-year') === year;
                var matchCategory = !category || card.getAttribute('data-category') === category;
                card.style.display = matchText && matchYear && matchCategory ? '' : 'none';
            });
        }

        input.addEventListener('input', filter);
        if (yearSelect) {
            yearSelect.addEventListener('change', filter);
        }
        if (categorySelect) {
            categorySelect.addEventListener('change', filter);
        }
    }

    function setupPlayers() {
        qsa('[data-player]').forEach(function (box) {
            var video = qs('video', box);
            var button = qs('[data-play-button]', box);
            if (!video || !button) {
                return;
            }

            function attachSource() {
                var source = video.getAttribute('data-src');
                if (!source || video.getAttribute('data-ready') === '1') {
                    return;
                }
                video.setAttribute('data-ready', '1');
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    video._hls = hls;
                } else {
                    video.src = source;
                }
            }

            function play() {
                attachSource();
                button.classList.add('hidden');
                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function () {
                        button.classList.remove('hidden');
                    });
                }
            }

            button.addEventListener('click', play);
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener('play', function () {
                button.classList.add('hidden');
            });
            video.addEventListener('pause', function () {
                button.classList.remove('hidden');
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileMenu();
        setupHero();
        setupSearch();
        setupPlayers();
    });
})();
