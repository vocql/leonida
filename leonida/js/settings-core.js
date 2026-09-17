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

  var RADIO_STATIONS = [];

  var DEFAULTS = {
    /* radio */
    radioStation: '',
    radioVolume: 25,
    radioPlaying: false,
    /* countdown */
    timezone: 'auto',
    /* theme */
    theme: 'sakura',
    customA: '#fff0f6',
    customB: '#ffd6e8',
    customC: '#ffb3d1',
    customD: '#f875aa',
    customE: '#d6336c',
    /* appearance */
    bgDarken: 0,
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
    muteTrailers: true,
    loopTrailer: false,
    hideFileNames: true,
    hideCardNumbers: true,
    disableImageHoverZoom: false,
    lightboxSpeed: 'normal',
    /* effects */
    cursorGlow: false,
    ambientPulse: false,
    scanlineOverlay: false,
    pageFadeIn: false,
    /* sound & alerts */
    uiClickSounds: false,
    uiHoverSounds: false,
    uiSoundVolume: 40,
    milestoneAlerts: false,
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
    autoSaveOnChange: true,
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
    try { document.dispatchEvent(new CustomEvent('leonida:settings-changed', { detail: s })); } catch (e) {}
    return s;
  }
  function clearSettings() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  }

  var VAR_RULES = {
    bgDarken: function (v) { return ['--bgd-opacity', (Math.max(0, Math.min(90, v)) / 100).toFixed(2)]; },
    lightboxSpeed: function (v) { return ['--ls-lb-speed', { slow: '0.35s', normal: '0.15s', fast: '0.05s' }[v] || '0.15s']; }
  };

  var CUSTOM_COLOR_KEYS = ['customA', 'customB', 'customC', 'customD', 'customE'];
  var SUNSET_VARS = ['--sunset-a', '--sunset-b', '--sunset-c', '--sunset-d', '--sunset-e'];

  function apply(s) {
    var root = document.documentElement;
    Object.keys(s).forEach(function (k) {
      if (k === 'lastPage' || k === '_savedAt' || k === 'radioStation' || k === 'radioVolume' || k === 'radioPlaying' || CUSTOM_COLOR_KEYS.indexOf(k) !== -1) return;
      var v = s[k];
      if (typeof v === 'boolean') root.classList.toggle('ls-' + k, v);
      else if (typeof v === 'string') root.setAttribute('data-ls-' + k, v);
    });
    Object.keys(VAR_RULES).forEach(function (k) {
      if (s[k] !== undefined) { var pair = VAR_RULES[k](s[k]); root.style.setProperty(pair[0], pair[1]); }
    });
    if (s.theme === 'custom') {
      CUSTOM_COLOR_KEYS.forEach(function (k, i) { root.style.setProperty(SUNSET_VARS[i], s[k]); });
    } else {
      SUNSET_VARS.forEach(function (v) { root.style.removeProperty(v); });
    }
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
    return RADIO_STATIONS[0] || null;
  }
  function radioApplyVolume(v) { radioAudio.volume = Math.max(0, Math.min(100, v)) / 100; }
  function radioPlay(id) {
    var st = stationById(id || current.radioStation);
    if (!st) return;
    if (radioAudio.src.indexOf(st.url) === -1) radioAudio.src = st.url;
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
  radioAudio.addEventListener('play', function () { document.documentElement.classList.add('ls-radio-playing'); });
  radioAudio.addEventListener('pause', function () { document.documentElement.classList.remove('ls-radio-playing'); });
  radioAudio.addEventListener('ended', function () { document.documentElement.classList.remove('ls-radio-playing'); });

  /* ---------- live clock (top-right pill) ----------
     Reads the same "timezone" setting as the countdown, so changing
     it in Settings updates the clock too. Only runs if a page has
     a #lsClockTime element.
     - Ticks once a second for the time itself.
     - Also re-renders immediately (no up-to-1s lag) whenever the
       timezone setting changes, either in this tab (saveSettings
       fires 'leonida:settings-changed') or in another tab/page
       (the browser's built-in 'storage' event).
     - The tz value is cached and only re-read from storage when a
       change event actually fires, instead of JSON-parsing
       localStorage on every single tick. */
  var clockTz = current.timezone;
  function formatClockTime(tz) {
    var opts = { hour: '2-digit', minute: '2-digit', hour12: true };
    if (tz && tz !== 'auto') opts.timeZone = tz;
    try { return new Intl.DateTimeFormat('en-US', opts).format(new Date()); }
    catch (e) {
      try { return new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date()); }
      catch (e2) { var d = new Date(); return (d.getHours() % 12 || 12) + ':' + String(d.getMinutes()).padStart(2, '0'); }
    }
  }
  function tickClock() {
    try {
      var el = document.getElementById('lsClockTime');
      if (!el) return;
      el.textContent = formatClockTime(clockTz);
    } catch (e) { /* never let a formatting hiccup kill the interval */ }
  }
  function refreshClockTz() {
    clockTz = loadSettings().timezone;
    tickClock();
  }
  var clockTimer = null;
  function startClock() {
    var el = document.getElementById('lsClockTime');
    if (!el) {
      /* Element not in the DOM yet on this pass (e.g. injected later
         by another script) - keep checking briefly instead of giving
         up silently. */
      setTimeout(startClock, 100);
      return;
    }
    if (clockTimer) return; /* already running */
    tickClock();
    clockTimer = setInterval(tickClock, 1000);
    document.addEventListener('leonida:settings-changed', refreshClockTz);
    window.addEventListener('storage', function (e) {
      if (!e.key || e.key === STORAGE_KEY) refreshClockTz();
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startClock);
  else startClock();
  window.addEventListener('load', startClock); /* safety net in case DOMContentLoaded was missed */

  /* ---------- cursor glow trail (Effects tab) ----------
     Always tracked; CSS hides it unless html.ls-cursorGlow is set. */
  var cursorGlowEl = null;
  document.addEventListener('mousemove', function (e) {
    if (!document.body) return;
    if (!cursorGlowEl) {
      cursorGlowEl = document.createElement('div');
      cursorGlowEl.id = 'lsCursorGlow';
      document.body.appendChild(cursorGlowEl);
    }
    cursorGlowEl.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)';
  }, { passive: true });

  /* ---------- auto-load tracks from leonida/music/ via GitHub ----------
     Same repo the photo/character/place galleries already pull from.
     leonida/music/tracks.js is only used as a fallback if the API call
     fails (offline, rate-limited, etc.) or turns up nothing. */
  var GH_USER = 'vocql', GH_REPO = 'leonidagta', GH_BRANCH = 'main', GH_PATH = 'leonida/music';
  var AUDIO_EXTS = ['.mp3', '.wav', '.m4a', '.ogg', '.flac', '.aac'];
  var RADIO_CACHE_KEY = 'leonida_radio_cache_v1';

  function titleFromFilename(name) {
    return name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }
  function tracksFromManifest() {
    var raw = Array.isArray(window.LEONIDA_TRACKS) ? window.LEONIDA_TRACKS : [];
    return raw.filter(function (t) { return t && t.file; }).map(function (t) {
      return { id: t.file, name: t.title || titleFromFilename(t.file), genre: t.artist || '', url: GH_PATH + '/' + t.file };
    });
  }
  function setStations(list) {
    RADIO_STATIONS.length = 0;
    Array.prototype.push.apply(RADIO_STATIONS, list);
  }

  var resumeStarted = false;
  function attemptResume() {
    if (resumeStarted) return; resumeStarted = true;
    if (!current.radioPlaying) return;
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
  function notifyRadioReady() {
    attemptResume();
    try { document.dispatchEvent(new Event('leonida:radio-ready')); } catch (e) {}
  }

  (function loadTracks() {
    var hadCache = false;
    try {
      var cached = JSON.parse(localStorage.getItem(RADIO_CACHE_KEY) || 'null');
      if (cached && Array.isArray(cached.stations) && cached.stations.length) { setStations(cached.stations); hadCache = true; }
    } catch (e) {}
    if (hadCache) notifyRadioReady(); /* instant resume/UI from cache; fetch below refreshes in the background */

    var apiURL = 'https://api.github.com/repos/' + GH_USER + '/' + GH_REPO + '/contents/' + GH_PATH + '?ref=' + GH_BRANCH;
    fetch(apiURL, { headers: { 'Accept': 'application/vnd.github.v3+json' } })
      .then(function (res) { if (!res.ok) throw new Error('status ' + res.status); return res.json(); })
      .then(function (files) {
        if (!Array.isArray(files)) throw new Error('bad response');
        var tracks = files
          .filter(function (f) { return f.type === 'file' && AUDIO_EXTS.some(function (ext) { return f.name.toLowerCase().indexOf(ext) === f.name.toLowerCase().length - ext.length; }); })
          .sort(function (a, b) { return a.name.localeCompare(b.name); })
          .map(function (f) { return { id: f.name, name: titleFromFilename(f.name), genre: '', url: GH_PATH + '/' + f.name }; });
        if (tracks.length) {
          setStations(tracks);
          try { localStorage.setItem(RADIO_CACHE_KEY, JSON.stringify({ stations: tracks, savedAt: Date.now() })); } catch (e) {}
          notifyRadioReady();
        } else if (!hadCache) {
          setStations(tracksFromManifest());
          notifyRadioReady();
        }
      })
      .catch(function () {
        if (!hadCache) { setStations(tracksFromManifest()); notifyRadioReady(); }
      });
  })();

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
