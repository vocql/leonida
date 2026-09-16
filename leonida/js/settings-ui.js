/* ==========================================================
   LEONIDA · SETTINGS UI
   leonida/js/settings-ui.js  (load with `defer`)
   Builds the gear button + tabbed panel from a schema and
   wires it to window.LeonidaSettings (settings-core.js).
   ========================================================== */
(function () {
  'use strict';
  if (window.__lsUiInit) return;
  window.__lsUiInit = true;
  if (!window.LeonidaSettings) return;

  var LS = window.LeonidaSettings;

  /* ---- shared with index.html's countdown timer: keep this constant
     in sync with RELEASE_DATE_STR in index.html ---- */
  var RELEASE_DATE_STR = '2026-11-19T00:00:00';

  function getTzOffsetMinutes(timeZone, atDate) {
    try {
      var dtf = new Intl.DateTimeFormat('en-US', { timeZone: timeZone, timeZoneName: 'longOffset', hour: '2-digit', hour12: false });
      var part = dtf.formatToParts(atDate).find(function (p) { return p.type === 'timeZoneName'; });
      var m = part && part.value.match(/GMT([+-]\d{1,2})(?::?(\d{2}))?/);
      if (!m) return 0;
      var sign = m[1].charAt(0) === '-' ? -1 : 1;
      var hh = Math.abs(parseInt(m[1], 10));
      var mm = m[2] ? parseInt(m[2], 10) : 0;
      return sign * (hh * 60 + mm);
    } catch (e) { return 0; }
  }
  function computeTargetMs(tz) {
    if (!tz || tz === 'auto') return new Date(RELEASE_DATE_STR).getTime();
    try {
      var asUtcMs = Date.parse(RELEASE_DATE_STR + 'Z');
      var offsetMin = getTzOffsetMinutes(tz, new Date(asUtcMs));
      return asUtcMs - offsetMin * 60000;
    } catch (e) { return new Date(RELEASE_DATE_STR).getTime(); }
  }
  function formatTzPreview(tz) {
    try {
      var targetMs = computeTargetMs(tz);
      var opts = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' };
      if (tz && tz !== 'auto') opts.timeZone = tz;
      return 'Hits zero: ' + new Intl.DateTimeFormat('en-US', opts).format(new Date(targetMs));
    } catch (e) { return ''; }
  }
  function updateTzPreview() {
    var previewEl = document.getElementById('lsTzPreview');
    if (!previewEl) return;
    var sel = document.querySelector('[data-key="timezone"]');
    var tz = sel ? sel.value : (LS.get('timezone') || 'auto');
    previewEl.textContent = formatTzPreview(tz);
  }

  var SCHEMA = [
    { id: 'radio', label: 'Radio', custom: true },
    { id: 'countdown', label: 'Countdown', fields: [
      { key: 'timezone', type: 'select', label: 'Timezone', sub: 'Count down to release in this zone', instant: true,
        options: [
          ['auto', 'Automatic (Device)'],
          ['UTC', 'UTC'],
          ['America/Los_Angeles', 'US Pacific'],
          ['America/Denver', 'US Mountain'],
          ['America/Chicago', 'US Central'],
          ['America/New_York', 'US Eastern'],
          ['America/Mexico_City', 'Mexico City'],
          ['America/Sao_Paulo', 'Brazil (São Paulo)'],
          ['Europe/London', 'UK / Ireland'],
          ['Europe/Berlin', 'Central Europe'],
          ['Europe/Athens', 'Eastern Europe'],
          ['Europe/Moscow', 'Moscow'],
          ['Africa/Johannesburg', 'South Africa'],
          ['Asia/Dubai', 'Gulf (Dubai)'],
          ['Asia/Kolkata', 'India'],
          ['Asia/Jakarta', 'Indonesia'],
          ['Asia/Shanghai', 'China'],
          ['Asia/Singapore', 'Singapore'],
          ['Asia/Seoul', 'South Korea'],
          ['Asia/Tokyo', 'Japan'],
          ['Australia/Sydney', 'Australia Eastern'],
          ['Pacific/Auckland', 'New Zealand']
        ] }
    ]},
    { id: 'appearance', label: 'Appearance', fields: [
      { key: 'theme', type: 'select', label: 'Theme', sub: 'Accent color across the site',
        options: [['sunset', 'Sunset'], ['vice', 'Vice Neon'], ['mono', 'Blackout Mono']] },
      { key: 'bgDarken', type: 'range', label: 'Background Dim', sub: 'How dark the backdrop looks', min: 0, max: 90 },
      { key: 'hideBackgroundImage', type: 'toggle', label: 'Hide Background Image', sub: 'Plain dark background instead' },
      { key: 'gridDensity', type: 'select', label: 'Grid Density', sub: 'Card size in galleries',
        options: [['comfortable', 'Comfortable'], ['compact', 'Compact'], ['cozy', 'Cozy']] },
      { key: 'cardRadius', type: 'select', label: 'Card Corners', sub: 'Corner roundness of cards',
        options: [['sharp', 'Sharp'], ['rounded', 'Rounded'], ['round', 'Round']] },
      { key: 'glowIntensity', type: 'select', label: 'Glow Intensity', sub: 'Neon glow on hover & highlights',
        options: [['off', 'Off'], ['normal', 'Normal'], ['boosted', 'Boosted']] },
      { key: 'textSize', type: 'select', label: 'Text Size', sub: 'Readable body text size',
        options: [['small', 'Small'], ['default', 'Default'], ['large', 'Large']] }
    ]},
    { id: 'navigation', label: 'Navigation', fields: [
      { key: 'navAutoHide', type: 'toggle', label: 'Auto-hide Nav', sub: 'Fades the nav bar when idle' },
      { key: 'hideTooltips', type: 'toggle', label: 'Hide Nav Tooltips', sub: 'No labels on hover' },
      { key: 'compactNav', type: 'toggle', label: 'Compact Nav', sub: 'Smaller nav bar' },
      { key: 'hideBrandMark', type: 'toggle', label: 'Hide Logo', sub: 'Hide the top-left brand mark' },
      { key: 'hideEyebrows', type: 'toggle', label: 'Hide Section Labels', sub: 'Hide the small "Leonida ·" tags' },
      { key: 'hideCountBadges', type: 'toggle', label: 'Hide Count Badges', sub: 'Hide "N items" counters' },
      { key: 'defaultLandingPage', type: 'select', label: 'Landing Page', sub: 'Where the site opens by default',
        options: [['home', 'Home'], ['map', 'Map'], ['places', 'Places'], ['characters', 'Characters'], ['screenshots', 'Screenshots'], ['trailers', 'Trailers']] }
    ]},
    { id: 'media', label: 'Media', fields: [
      { key: 'autoplayTrailers', type: 'toggle', label: 'Autoplay Trailers', sub: 'Auto-play video on open' },
      { key: 'muteTrailers', type: 'toggle', label: 'Mute Trailers', sub: 'Start trailers muted' },
      { key: 'loopTrailer', type: 'toggle', label: 'Loop Trailer', sub: 'Repeat the current trailer' },
      { key: 'hideFileNames', type: 'toggle', label: 'Hide File Names', sub: 'Hide filename text on cards' },
      { key: 'hideCardNumbers', type: 'toggle', label: 'Hide Card Numbers', sub: 'Hide "#01" badges' },
      { key: 'disableImageHoverZoom', type: 'toggle', label: 'Disable Image Zoom', sub: 'No zoom on hover' },
      { key: 'lightboxSpeed', type: 'select', label: 'Lightbox Speed', sub: 'Image transition speed',
        options: [['slow', 'Slow'], ['normal', 'Normal'], ['fast', 'Fast']] }
    ]},
    { id: 'accessibility', label: 'Accessibility', fields: [
      { key: 'reduceMotion', type: 'toggle', label: 'Reduce Motion', sub: 'Turns off most animations' },
      { key: 'disableShimmerText', type: 'toggle', label: 'Disable Text Shimmer', sub: 'Static gradient titles' },
      { key: 'highContrastText', type: 'toggle', label: 'High Contrast Text', sub: 'Brighter body text' },
      { key: 'largerClickTargets', type: 'toggle', label: 'Larger Click Targets', sub: 'Bigger buttons' },
      { key: 'underlineLinks', type: 'toggle', label: 'Underline Links', sub: 'Underline nav & links' },
      { key: 'disableBlur', type: 'toggle', label: 'Disable Blur Effects', sub: 'Better performance on old devices' },
      { key: 'focusOutlines', type: 'toggle', label: 'Visible Focus Outlines', sub: 'Always show keyboard focus ring' }
    ]},
    { id: 'data', label: 'Data', fields: [
      { key: 'rememberLastPage', type: 'toggle', label: 'Remember Last Page', sub: 'Reopen where you left off' },
      { key: 'autoSaveOnChange', type: 'toggle', label: 'Auto-save Changes', sub: 'Save instantly, no button needed' },
      { key: 'confirmBeforeReset', type: 'toggle', label: 'Confirm Before Reset', sub: 'Ask before clearing settings' },
      { key: 'showDebugInfo', type: 'toggle', label: 'Show Debug Info', sub: 'Storage size & last saved time' },
      { key: 'exportSettings', type: 'action', label: 'Export Settings', sub: 'Copy your settings as text', action: 'export', btnText: 'Copy' },
      { key: 'importSettings', type: 'action', label: 'Import Settings', sub: 'Paste settings you exported', action: 'import', btnText: 'Paste' },
      { key: 'clearAllData', type: 'action', label: 'Clear All Data', sub: 'Erase saved settings', action: 'clear', btnText: 'Clear', danger: true }
    ]}
  ];

  var GEAR_SVG = '<svg viewBox="0 0 24 24" class="ls-gear-svg">' +
    '<defs><linearGradient id="lsGearGrad" x1="0%" y1="0%" x2="100%" y2="100%">' +
    '<stop offset="0%"><animate attributeName="stop-color" values="#ff6fa0;#4dd8ff;#c94bff;#7fe8ff;#ff6fa0" dur="6s" repeatCount="indefinite"/></stop>' +
    '<stop offset="100%"><animate attributeName="stop-color" values="#4dd8ff;#ff6fa0;#7fe8ff;#c94bff;#4dd8ff" dur="6s" repeatCount="indefinite"/></stop>' +
    '</linearGradient></defs>' +
    '<g fill="none" stroke="url(#lsGearGrad)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' +
    '<circle cx="12" cy="12" r="3"/>' +
    '<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>' +
    '</g></svg>';

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  function injectButton() {
    var nav = document.getElementById('bottomNav');
    if (!nav) return null;
    var sep = el('div', 'bottom-nav-sep');
    var btn = el('button', 'bottom-nav-btn', GEAR_SVG + '<span class="bottom-nav-tip">Settings</span>');
    btn.id = 'ls-settings-btn';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Settings');
    nav.appendChild(sep);
    nav.appendChild(btn);
    return btn;
  }

  function fieldRow(f, value) {
    var row = el('div', 'ls-row');
    var left = el('div', '', '<div class="ls-row-label">' + f.label + '</div><div class="ls-row-sub">' + f.sub + '</div>');
    row.appendChild(left);

    if (f.type === 'toggle') {
      var wrap = el('label', 'ls-switch');
      var input = document.createElement('input');
      input.type = 'checkbox'; input.dataset.key = f.key; input.checked = !!value;
      wrap.appendChild(input); wrap.appendChild(el('span', 'ls-slider'));
      row.appendChild(wrap);
    } else if (f.type === 'select') {
      var sel = document.createElement('select');
      sel.className = 'ls-select'; sel.dataset.key = f.key;
      if (f.instant) sel.dataset.instant = '1';
      f.options.forEach(function (o) {
        var opt = document.createElement('option');
        opt.value = o[0]; opt.textContent = o[1];
        if (o[0] === value) opt.selected = true;
        sel.appendChild(opt);
      });
      row.appendChild(sel);
    } else if (f.type === 'range') {
      var rng = document.createElement('input');
      rng.type = 'range'; rng.className = 'ls-range'; rng.dataset.key = f.key;
      rng.min = f.min; rng.max = f.max; rng.value = value;
      row.appendChild(rng);
    } else if (f.type === 'action') {
      var abtn = el('button', 'ls-action-btn' + (f.danger ? ' danger' : ''), f.btnText || 'Go');
      abtn.type = 'button'; abtn.dataset.action = f.action;
      row.appendChild(abtn);
    }
    return row;
  }

  function buildRadioPane() {
    var radio = LS.radio;
    var wrap = el('div', '');

    var now = el('div', 'ls-radio-now');
    var eq = el('div', 'ls-radio-eq', '<span></span><span></span><span></span>');
    var text = el('div', 'ls-radio-nowtext');
    var nameEl = el('div', 'ls-radio-station');
    var genreEl = el('div', 'ls-radio-genre');
    text.appendChild(nameEl); text.appendChild(genreEl);
    var playBtn = el('button', 'ls-radio-playbtn', '&#9658;');
    playBtn.type = 'button';
    now.appendChild(eq); now.appendChild(text); now.appendChild(playBtn);
    wrap.appendChild(now);

    var grid = el('div', 'ls-radio-stations');
    radio.stations.forEach(function (st) {
      var b = el('button', 'ls-station-btn', '<span class="ls-station-name">' + st.name + '</span><span class="ls-station-genre">' + st.genre + '</span>');
      b.type = 'button';
      b.dataset.station = st.id;
      grid.appendChild(b);
    });
    wrap.appendChild(grid);

    var volRow = el('div', 'ls-row');
    volRow.style.marginTop = '4px';
    var volLeft = el('div', '', '<div class="ls-row-label">Volume</div><div class="ls-row-sub">Radio playback volume</div>');
    var volInput = document.createElement('input');
    volInput.type = 'range'; volInput.className = 'ls-range'; volInput.min = 0; volInput.max = 100;
    volInput.value = LS.get('radioVolume');
    volRow.appendChild(volLeft); volRow.appendChild(volInput);
    wrap.appendChild(volRow);

    function refresh() {
      var st = radio.stations.filter(function (s) { return s.id === radio.getStation(); })[0] || radio.stations[0];
      nameEl.textContent = st.name;
      genreEl.textContent = st.genre;
      var playing = radio.isPlaying();
      eq.classList.toggle('playing', playing);
      playBtn.innerHTML = playing ? '&#10074;&#10074;' : '&#9658;';
      grid.querySelectorAll('.ls-station-btn').forEach(function (b) {
        b.classList.toggle('active', b.dataset.station === st.id);
      });
    }

    grid.addEventListener('click', function (e) {
      var b = e.target.closest('.ls-station-btn'); if (!b) return;
      radio.play(b.dataset.station);
      refresh();
    });
    playBtn.addEventListener('click', function () { radio.toggle(); refresh(); });
    volInput.addEventListener('input', function () { radio.setVolume(parseInt(volInput.value, 10)); });
    radio.audio.addEventListener('play', refresh);
    radio.audio.addEventListener('pause', refresh);
    radio.audio.addEventListener('error', refresh);

    refresh();
    return wrap;
  }

  function buildPanel() {
    var overlay = el('div', ''); overlay.id = 'lsOverlay';
    var panel = el('div', ''); panel.id = 'lsPanel';

    /* ---- left sidebar: title + vertical tab list ---- */
    var side = el('div', 'ls-side');
    side.appendChild(el('div', 'ls-side-title', 'Settings'));
    var tabs = el('div', 'ls-tabs');
    side.appendChild(tabs);
    panel.appendChild(side);

    /* ---- right side: close button, active pane, footer ---- */
    var main = el('div', 'ls-main');

    var head = el('div', 'ls-head');
    var closeBtn = el('button', 'ls-close', '&#10005;'); closeBtn.id = 'lsClose'; closeBtn.type = 'button';
    head.appendChild(closeBtn);
    main.appendChild(head);

    var body = el('div', 'ls-body');
    var current = LS.getAll();

    SCHEMA.forEach(function (tab, i) {
      var tabBtn = el('button', 'ls-tab' + (i === 0 ? ' active' : ''), tab.label);
      tabBtn.type = 'button'; tabBtn.dataset.tab = tab.id;
      tabs.appendChild(tabBtn);

      var pane = el('div', 'ls-pane' + (i === 0 ? ' active' : ''));
      pane.dataset.pane = tab.id;
      if (tab.custom && tab.id === 'radio') {
        pane.appendChild(buildRadioPane());
      } else {
        tab.fields.forEach(function (f) { pane.appendChild(fieldRow(f, current[f.key])); });
      }
      if (tab.id === 'countdown') {
        var tzPreview = el('div', 'ls-tz-preview'); tzPreview.id = 'lsTzPreview';
        pane.appendChild(tzPreview);
        var tzNote = el('div', 'ls-tz-note', 'Changes here save instantly \u2014 no need to hit Save.');
        pane.appendChild(tzNote);
      }
      body.appendChild(pane);
    });

    main.appendChild(body);

    var debug = el('div', 'ls-debug'); debug.id = 'lsDebug';
    main.appendChild(debug);

    var footer = el('div', 'ls-footer');
    var resetBtn = el('button', 'ls-btn', 'Reset'); resetBtn.id = 'lsReset'; resetBtn.type = 'button';
    var saveBtn = el('button', 'ls-btn ls-btn-save', 'Save'); saveBtn.id = 'lsSave'; saveBtn.type = 'button';
    var toast = el('div', 'ls-toast', 'Saved!'); toast.id = 'lsToast';
    footer.appendChild(resetBtn); footer.appendChild(saveBtn); footer.appendChild(toast);
    main.appendChild(footer);

    panel.appendChild(main);

    document.body.appendChild(overlay);
    document.body.appendChild(panel);
    return { overlay: overlay, panel: panel, tabs: tabs, body: body, debug: debug, toast: toast };
  }

  function readForm(body) {
    var draft = LS.getAll();
    body.querySelectorAll('input[type="checkbox"][data-key]').forEach(function (i) { draft[i.dataset.key] = i.checked; });
    body.querySelectorAll('select[data-key]').forEach(function (s) { draft[s.dataset.key] = s.value; });
    body.querySelectorAll('input[type="range"][data-key]').forEach(function (r) { draft[r.dataset.key] = parseInt(r.value, 10); });
    return draft;
  }

  function updateDebug(debugEl) {
    if (!LS.get('showDebugInfo')) { debugEl.textContent = ''; return; }
    var raw = localStorage.getItem(LS.storageKey) || '';
    var saved = LS.get('_savedAt');
    debugEl.textContent = 'storage: ' + raw.length + ' bytes · saved: ' + (saved ? new Date(saved).toLocaleTimeString() : 'never');
  }

  function showToast(toastEl) {
    toastEl.classList.add('show');
    setTimeout(function () { toastEl.classList.remove('show'); }, 1400);
  }

  function initNavAutoHide() {
    var nav = document.getElementById('bottomNav');
    if (!nav) return;
    var timer = null;
    function onActivity() {
      if (!LS.get('navAutoHide')) { nav.classList.remove('ls-nav-dim'); return; }
      nav.classList.remove('ls-nav-dim');
      clearTimeout(timer);
      timer = setTimeout(function () { nav.classList.add('ls-nav-dim'); }, 3000);
    }
    document.addEventListener('mousemove', onActivity);
    document.addEventListener('touchstart', onActivity);
    onActivity();
  }

  function runAction(action, refs) {
    if (action === 'export') {
      var json = JSON.stringify(LS.getAll());
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(json).then(function () { showToast(refs.toast); }).catch(function () { window.prompt('Copy your settings:', json); });
      } else {
        window.prompt('Copy your settings:', json);
      }
    } else if (action === 'import') {
      var pasted = window.prompt('Paste your exported settings JSON:');
      if (!pasted) return;
      try {
        var parsed = JSON.parse(pasted);
        var merged = Object.assign({}, LS.defaults, parsed);
        LS.save(merged);
        LS.apply(merged);
        rerenderPanel(refs);
        showToast(refs.toast);
      } catch (e) { window.alert('That didn\'t look like valid settings data.'); }
    } else if (action === 'clear') {
      if (LS.get('confirmBeforeReset') && !window.confirm('Erase all saved Leonida settings?')) return;
      LS.radio.pause();
      LS.clear();
      LS.apply(LS.defaults);
      rerenderPanel(refs);
      showToast(refs.toast);
    }
  }

  function rerenderPanel(refs) {
    var current = LS.getAll();
    refs.body.querySelectorAll('input[type="checkbox"][data-key]').forEach(function (i) { i.checked = !!current[i.dataset.key]; });
    refs.body.querySelectorAll('select[data-key]').forEach(function (s) { s.value = current[s.dataset.key]; });
    refs.body.querySelectorAll('input[type="range"][data-key]').forEach(function (r) { r.value = current[r.dataset.key]; });
    updateDebug(refs.debug);
    updateTzPreview();
  }

  function init() {
    var btn = injectButton();
    if (!btn) return;
    var refs = buildPanel();

    function open() { rerenderPanel(refs); updateDebug(refs.debug); refs.overlay.classList.add('active'); refs.panel.classList.add('active'); }
    function close() { refs.overlay.classList.remove('active'); refs.panel.classList.remove('active'); LS.apply(LS.getAll()); }

    btn.addEventListener('click', open);
    document.getElementById('lsClose').addEventListener('click', close);
    refs.overlay.addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && refs.panel.classList.contains('active')) close(); });

    refs.tabs.addEventListener('click', function (e) {
      var t = e.target.closest('.ls-tab'); if (!t) return;
      refs.tabs.querySelectorAll('.ls-tab').forEach(function (x) { x.classList.toggle('active', x === t); });
      refs.body.querySelectorAll('.ls-pane').forEach(function (p) { p.classList.toggle('active', p.dataset.pane === t.dataset.tab); });
    });

    refs.body.addEventListener('input', function (e) {
      var draft = readForm(refs.body);
      LS.apply(draft);
      if (e.target && e.target.dataset.key === 'timezone') updateTzPreview();
      var isInstant = e.target && e.target.dataset.instant === '1';
      if (LS.get('autoSaveOnChange') || isInstant) {
        LS.save(draft);
        updateDebug(refs.debug);
        if (isInstant) showToast(refs.toast);
      }
    });

    refs.body.addEventListener('click', function (e) {
      var b = e.target.closest('.ls-action-btn'); if (!b) return;
      runAction(b.dataset.action, refs);
    });

    document.getElementById('lsSave').addEventListener('click', function () {
      var draft = readForm(refs.body);
      LS.save(draft);
      LS.apply(draft);
      updateDebug(refs.debug);
      showToast(refs.toast);
    });

    document.getElementById('lsReset').addEventListener('click', function () {
      if (LS.get('confirmBeforeReset') && !window.confirm('Reset all settings to defaults?')) return;
      LS.radio.pause();
      LS.save(Object.assign({}, LS.defaults));
      LS.apply(LS.defaults);
      rerenderPanel(refs);
    });

    initNavAutoHide();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
