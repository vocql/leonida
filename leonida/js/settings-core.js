/* ==========================================================
   LEONIDA · SETTINGS CORE
   leonida/js/settings-core.js
   Loads SYNCHRONOUSLY, early in <head>, with no defer/async.
   Applies saved settings to <html> immediately so there's no
   flash of default styling. Keep this file small on purpose.
   ========================================================== */
(function () {
  'use strict';
  if (window.__lsCoreInit) return;
  window.__lsCoreInit = true;

  var STORAGE_KEY = 'leonida_settings_v2';
  var PAGE_MAP = { index: 'home', map: 'map', places: 'places', characters: 'characters', screenshots: 'screenshots', trailers: 'trailers' };

  var RADIO_STATIONS = [
    { id: 'vicewave',     name: 'Vice Wave',      genre: 'Vaporwave / Retro',  url: 'https://ice1.somafm.com/vaporwaves-128-mp3' },
    { id: 'sunsetgold',   name: 'Sunset Gold',    genre: '70s AM Gold',        url: 'https://ice1.somafm.com/seventies-128-mp3' },
    { id: 'coastalchill', name: 'Coastal Chill',  genre: 'Ambient / Chillout', url: 'https://ice1.somafm.com/groovesalad-128-mp3' },
    { id: 'undercover',   name: 'Undercover FM',  genre: 'Spy Lounge',         url: 'https://ice1.somafm.com/secretagent-128-mp3' },
    { id: 'nightdrive',   name: 'Night Drive',    genre: 'Deep House',        url: 'https://ice1.somafm.com/fluid-128-mp3' },
    { id: 'heatfm',       name: 'Heat FM',        genre: 'Techno',            url: 'https://ice1.somafm.com/thetrip-128-mp3' }
  ];

  var DEFAULTS = {
    /* radio */
    radioStation: 'vicewave',
    radioVolume: 60,
    radioPlaying: false,
    /* countdown */
    timezone: 'auto',
    /* appearance */
    theme: 'sunset',
    bgDarken: 52,
    hideBackgroundImage: false,
    gridDensity: 'comfortable',
    cardRadius: 'rounded',
    glowIntensity: 'normal',
    textSize: 'default',
    /* navigation */
    navAutoHide: false,
    hideTooltips: false,
    compactNav: false,
    hideBrandMark: false,
    hideEyebrows: false,
    hideCountBadges: false,
    defaultLandingPage: 'home',
    /* media */
    autoplayTrailers: true,
    muteTrailers: false,
    loopTrailer: false,
    hideFileNames: false,
    hideCardNumbers: false,
    disableImageHoverZoom: false,
    lightboxSpeed: 'normal',
    /* accessibility */
    reduceMotion: false,
    disableShimmerText: false,
    highContrastText: false,
    largerClickTargets: false,
    underlineLinks: false,
    disableBlur: false,
    focusOutlines: false,
    /* data */
    rememberLastPage: false,
    autoSaveOnChange: false,
    confirmBeforeReset: true,
    showDebugInfo: false,
    /* internal (not shown in UI) */
    lastPage: 'home',
    _savedAt: null
  };

  function loadSettings() {
    try {
      var raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return Object.assign({}, DEFAULTS, raw);
    } catch (e) { return Object.assign({}, DEFAULTS); }
  }
  function saveSettings(s) {
    s._savedAt = Date.now();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (e) {}
    return s;
  }
  function clearSettings() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  }

  var VAR_RULES = {
    bgDarken: function (v) { return ['--bgd-opacity', (Math.max(0, Math.min(90, v)) / 100).toFixed(2)]; },
    lightboxSpeed: function (v) { return ['--ls-lb-speed', { slow: '0.35s', normal: '0.15s', fast: '0.05s' }[v] || '0.15s']; }
  };

  function apply(s) {
    var root = document.documentElement;
    Object.keys(s).forEach(function (k) {
      if (k === 'lastPage' || k === '_savedAt' || k === 'radioStation' || k === 'radioVolume' || k === 'radioPlaying') return;
      var v = s[k];
      if (typeof v === 'boolean') root.classList.toggle('ls-' + k, v);
      else if (typeof v === 'string') root.setAttribute('data-ls-' + k, v);
    });
    Object.keys(VAR_RULES).forEach(function (k) {
      if (s[k] !== undefined) { var pair = VAR_RULES[k](s[k]); root.style.setProperty(pair[0], pair[1]); }
    });
  }

  var current = loadSettings();
  apply(current);

  var file = (location.pathname.split('/').pop() || 'index').replace(/\.html?$/, '') || 'index';
  var pageKey = PAGE_MAP[file] || 'home';
  if (current.rememberLastPage && current.lastPage !== pageKey) {
    current.lastPage = pageKey;
    saveSettings(current);
  }

  /* ---------- radio engine ---------- */
  var radioAudio = new Audio();
  radioAudio.preload = 'none';
  radioAudio.crossOrigin = 'anonymous';

  function stationById(id) {
    for (var i = 0; i < RADIO_STATIONS.length; i++) { if (RADIO_STATIONS[i].id === id) return RADIO_STATIONS[i]; }
    return RADIO_STATIONS[0];
  }
  function radioApplyVolume(v) { radioAudio.volume = Math.max(0, Math.min(100, v)) / 100; }
  function radioPlay(id) {
    var st = stationById(id || current.radioStation);
    if (radioAudio.src !== st.url) radioAudio.src = st.url;
    radioApplyVolume(current.radioVolume);
    var p = radioAudio.play();
    if (p && p.catch) p.catch(function () { /* blocked until user interacts; retried below */ });
    current.radioStation = st.id;
    current.radioPlaying = true;
    saveSettings(current);
  }
  function radioPause() {
    radioAudio.pause();
    current.radioPlaying = false;
    saveSettings(current);
  }
  function radioToggle() { if (radioAudio.paused) radioPlay(); else radioPause(); }
  function radioSetVolume(v) {
    current.radioVolume = v;
    radioApplyVolume(v);
    saveSettings(current);
  }

  radioApplyVolume(current.radioVolume);
  if (current.radioPlaying) {
    radioPlay(current.radioStation);
    var resumeOnce = function () {
      if (current.radioPlaying && radioAudio.paused) {
        var p = radioAudio.play();
        if (p && p.catch) p.catch(function () {});
      }
      document.removeEventListener('click', resumeOnce);
      document.removeEventListener('keydown', resumeOnce);
      document.removeEventListener('touchstart', resumeOnce);
    };
    document.addEventListener('click', resumeOnce, { once: true });
    document.addEventListener('keydown', resumeOnce, { once: true });
    document.addEventListener('touchstart', resumeOnce, { once: true });
  }

  window.LeonidaSettings = {
    get: function (k) { return loadSettings()[k]; },
    getAll: loadSettings,
    save: saveSettings,
    clear: clearSettings,
    apply: apply,
    defaults: DEFAULTS,
    storageKey: STORAGE_KEY,
    currentPage: pageKey,
    radio: {
      stations: RADIO_STATIONS,
      audio: radioAudio,
      play: radioPlay,
      pause: radioPause,
      toggle: radioToggle,
      setVolume: radioSetVolume,
      isPlaying: function () { return !radioAudio.paused; },
      getStation: function () { return current.radioStation; }
    }
  };
})();
