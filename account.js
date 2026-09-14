'use strict';
/* ── LEONIDA ACCOUNTS (Supabase) ─────────────────────
   Handles login/register, profile settings (avatar +
   background), and owner/VIP roles, entirely client-side
   against Supabase Auth + Postgres + Storage. Needs
   supabase-config.js loaded first (defines `supabaseClient`).
*/
(function () {
  const $ = (id) => document.getElementById(id);
  const toggleBtn   = $('accountToggleBtn');
  const guestIcon   = $('acctGuestIcon');
  const btnAvatar   = $('acctBtnAvatar');
  const panel       = $('accountPanel');
  const authView    = $('authView');
  const profileView = $('profileView');

  const bgLayer = document.getElementById('bgImageLayer');
  const DEFAULT_BG = 'leonida/images/lucia.jpg';

  // Supabase Auth needs something shaped like an email. Since the
  // site only collects a username, we synthesize one. This means
  // "Confirm email" MUST be turned off in
  // Supabase → Authentication → Providers → Email, otherwise
  // signup will hang waiting on a confirmation email nobody gets.
  const FAKE_EMAIL_DOMAIN = 'leonida.local';
  const emailFor = (username) => `${username.toLowerCase()}@${FAKE_EMAIL_DOMAIN}`;

  let currentUser = null; // { id, username, role, pfp_url, background }

  /* ── PANEL OPEN/CLOSE ─────────────────────────── */
  toggleBtn.addEventListener('click', () => {
    const open = panel.classList.toggle('open');
    toggleBtn.classList.toggle('open', open);
  });
  document.addEventListener('click', (e) => {
    if (!panel.contains(e.target) && !toggleBtn.contains(e.target)) {
      panel.classList.remove('open');
      toggleBtn.classList.remove('open');
    }
  });

  /* ── AUTH TABS ────────────────────────────────── */
  document.querySelectorAll('.acct-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.acct-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const isLogin = tab.dataset.tab === 'login';
      $('loginForm').style.display    = isLogin ? '' : 'none';
      $('registerForm').style.display = isLogin ? 'none' : '';
    });
  });

  /* ── LOGIN ────────────────────────────────────── */
  $('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    $('loginError').textContent = '';
    const username = $('loginUsername').value.trim();
    const password = $('loginPassword').value;
    const { error } = await supabaseClient.auth.signInWithPassword({
      email: emailFor(username),
      password,
    });
    if (error) { $('loginError').textContent = 'Incorrect username or password.'; return; }
    await loadProfileAndApply();
    panel.classList.remove('open'); toggleBtn.classList.remove('open');
  });

  /* ── REGISTER ─────────────────────────────────── */
  $('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    $('registerError').textContent = '';
    const username = $('regUsername').value.trim();
    const pw1 = $('regPassword').value, pw2 = $('regPassword2').value;

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      $('registerError').textContent = 'Username must be 3-20 characters (letters, numbers, underscore).';
      return;
    }
    if (pw1 !== pw2) { $('registerError').textContent = 'Passwords do not match.'; return; }
    if (pw1.length < 6) { $('registerError').textContent = 'Password must be at least 6 characters.'; return; }

    // best-effort uniqueness check (the DB is the real enforcement)
    const { data: existing } = await supabaseClient
      .from('profiles').select('username').ilike('username', username).maybeSingle();
    if (existing) { $('registerError').textContent = 'That username is already taken.'; return; }

    const { data, error } = await supabaseClient.auth.signUp({
      email: emailFor(username),
      password: pw1,
      options: { data: { username } },
    });
    if (error) {
      $('registerError').textContent = error.message.includes('already registered')
        ? 'That username is already taken.'
        : error.message;
      return;
    }
    if (!data.session) {
      $('registerError').textContent =
        'Account created, but email confirmation is still enabled on this Supabase project — turn it off in Authentication → Providers → Email to allow instant login.';
      return;
    }
    await loadProfileAndApply();
    panel.classList.remove('open'); toggleBtn.classList.remove('open');
  });

  /* ── LOGOUT ───────────────────────────────────── */
  $('logoutBtn').addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
    currentUser = null;
    applyUser();
    panel.classList.remove('open'); toggleBtn.classList.remove('open');
  });

  /* ── LOAD PROFILE ─────────────────────────────── */
  async function loadProfileAndApply() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) { currentUser = null; applyUser(); return; }
    const { data: profile, error } = await supabaseClient
      .from('profiles').select('*').eq('id', session.user.id).single();
    if (error || !profile) { currentUser = null; applyUser(); return; }
    currentUser = profile;
    applyUser();
  }

  // keep the UI in sync with token refreshes / cross-tab logout
  supabaseClient.auth.onAuthStateChange((_event, session) => {
    if (!session) { currentUser = null; applyUser(); }
  });

  /* ── APPLY CURRENT USER TO UI ─────────────────── */
  function roleLabel(role) { return role === 'owner' ? 'Owner' : role === 'vip' ? 'VIP' : 'Member'; }

  function applyUser() {
    if (currentUser) {
      authView.style.display = 'none';
      profileView.style.display = '';
      guestIcon.style.display = 'none';
      btnAvatar.style.display = '';
      btnAvatar.src = currentUser.pfp_url || 'leonida/images/newlogo.png';
      $('profileAvatarImg').src = currentUser.pfp_url || 'leonida/images/newlogo.png';
      $('profileUsername').textContent = currentUser.username;
      const badge = $('profileRoleBadge');
      badge.textContent = roleLabel(currentUser.role);
      badge.className = 'acct-role-badge ' + (currentUser.role === 'owner' ? 'owner' : currentUser.role === 'vip' ? 'vip' : 'member');
      toggleBtn.classList.remove('role-vip', 'role-owner');
      if (currentUser.role === 'vip') toggleBtn.classList.add('role-vip');
      if (currentUser.role === 'owner') toggleBtn.classList.add('role-owner');
      $('ownerAdminSection').style.display = currentUser.role === 'owner' ? '' : 'none';
      if (currentUser.role === 'owner') loadUserList();
      applyBackground(currentUser.background || DEFAULT_BG);
      markSelectedBg(currentUser.background || DEFAULT_BG);
    } else {
      authView.style.display = '';
      profileView.style.display = 'none';
      guestIcon.style.display = '';
      btnAvatar.style.display = 'none';
      toggleBtn.classList.remove('role-vip', 'role-owner');
      applyBackground(localStorage.getItem('leonida_guest_bg') || DEFAULT_BG);
    }
  }

  function applyBackground(url) {
    bgLayer.style.backgroundImage = `url('${url}')`;
    if (!currentUser) localStorage.setItem('leonida_guest_bg', url);
  }

  /* ── BACKGROUND PICKER ────────────────────────── */
  // Backgrounds live in the same GitHub repo as the rest of the
  // site's images — drop files into leonida/backgrounds/ and they
  // show up here automatically, same as places/characters/screenshots.
  async function loadBackgrounds() {
    const grid = $('bgGrid');
    grid.innerHTML = '';
    let list = [DEFAULT_BG];
    try {
      const res = await fetch('https://api.github.com/repos/vocql/leonidagta/contents/leonida/backgrounds?ref=main', {
        headers: { Accept: 'application/vnd.github.v3+json' },
      });
      if (res.ok) {
        const files = await res.json();
        const exts = ['.jpg', '.jpeg', '.png', '.webp'];
        if (Array.isArray(files)) {
          const extra = files
            .filter(f => f.type === 'file' && exts.some(ext => f.name.toLowerCase().endsWith(ext)))
            .map(f => `https://raw.githubusercontent.com/vocql/leonidagta/main/leonida/backgrounds/${f.name}`);
          if (extra.length) list = [DEFAULT_BG, ...extra];
        }
      }
    } catch (e) { /* fall back to default only */ }

    list.forEach(url => {
      const thumb = document.createElement('div');
      thumb.className = 'bg-thumb';
      thumb.style.backgroundImage = `url('${url}')`;
      thumb.dataset.url = url;
      thumb.addEventListener('click', async () => {
        applyBackground(url);
        markSelectedBg(url);
        if (currentUser) {
          const { data, error } = await supabaseClient
            .from('profiles').update({ background: url }).eq('id', currentUser.id).select().single();
          if (!error) currentUser = data;
        }
      });
      grid.appendChild(thumb);
    });
  }
  function markSelectedBg(url) {
    document.querySelectorAll('.bg-thumb').forEach(t => t.classList.toggle('selected', t.dataset.url === url));
  }

  /* ── PFP UPLOAD ───────────────────────────────── */
  $('pfpUploadTrigger').addEventListener('click', () => $('pfpFileInput').click());
  $('pfpFileInput').addEventListener('change', async () => {
    const file = $('pfpFileInput').files[0];
    if (!file || !currentUser) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      alert('Please choose a JPG, PNG, WEBP or GIF image.'); return;
    }
    if (file.size > 4 * 1024 * 1024) { alert('Image must be under 4MB.'); return; }

    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `${currentUser.id}/pfp-${Date.now()}.${ext}`;
    const { error: upErr } = await supabaseClient.storage.from('avatars').upload(path, file, { upsert: true });
    if (upErr) { alert('Could not upload avatar: ' + upErr.message); return; }

    const { data: pub } = supabaseClient.storage.from('avatars').getPublicUrl(path);
    const { data, error } = await supabaseClient
      .from('profiles').update({ pfp_url: pub.publicUrl }).eq('id', currentUser.id).select().single();
    if (error) { alert('Could not save avatar: ' + error.message); return; }
    currentUser = data;
    applyUser();
  });

  /* ── OWNER: MEMBER MANAGEMENT ─────────────────── */
  async function loadUserList() {
    const list = $('acctUserList');
    list.innerHTML = '<div style="font-size:11px;color:rgba(255,255,255,0.25);padding:6px 0;">Loading…</div>';
    const { data: users, error } = await supabaseClient
      .from('profiles').select('*').order('created_at', { ascending: true });
    if (error) {
      list.innerHTML = '<div style="font-size:11px;color:#ff6b7a;padding:6px 0;">' + error.message + '</div>';
      return;
    }
    list.innerHTML = '';
    users.filter(u => u.role !== 'owner').forEach(u => {
      const row = document.createElement('div');
      row.className = 'acct-user-row';
      const isVip = u.role === 'vip';
      row.innerHTML = `<span class="un">${u.username}</span>`;
      const btn = document.createElement('button');
      btn.className = 'acct-vip-toggle' + (isVip ? ' active' : '');
      btn.textContent = isVip ? 'VIP ✓' : 'Make VIP';
      btn.addEventListener('click', async () => {
        const { error: toggleErr } = await supabaseClient
          .from('profiles').update({ role: isVip ? 'member' : 'vip' }).eq('id', u.id);
        if (toggleErr) { alert(toggleErr.message); return; }
        loadUserList();
      });
      row.appendChild(btn);
      list.appendChild(row);
    });
    if (!list.children.length) list.innerHTML = '<div style="font-size:11px;color:rgba(255,255,255,0.25);padding:6px 0;">No other members yet.</div>';
  }

  /* ── INIT ─────────────────────────────────────── */
  async function init() {
    await loadBackgrounds();
    await loadProfileAndApply();
  }
  init();
})();
