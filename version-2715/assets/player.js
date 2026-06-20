(function () {
  function initPlayer() {
    var video = document.querySelector('[data-hls-player]');
    if (!video) {
      return;
    }

    var src = video.getAttribute('data-src');
    var message = document.querySelector('[data-player-message]');

    function setMessage(text) {
      if (message) {
        message.textContent = text;
      }
    }

    if (!src) {
      setMessage('当前影片没有可用播放源。');
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      setMessage('已绑定 HLS 播放源，可直接点击播放。');
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        setMessage('HLS 播放源已加载完成，可点击播放器开始播放。');
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setMessage('播放器加载遇到网络或格式问题，请刷新页面后重试。');
        }
      });
      return;
    }

    video.src = src;
    setMessage('浏览器不支持 HLS.js，已尝试直接绑定播放源。');
  }

  document.addEventListener('DOMContentLoaded', initPlayer);
})();
