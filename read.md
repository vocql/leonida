# 🌊 LEONIDA — Site Documentation

> Everything you need to know about the site, where stuff lives, and how to change it.

---

## 📁 File Structure

```
leonida/
├── images/
│   ├── others.jpg          ← Background image used on every page
│   └── leonida.png         ← Favicon (tab icon)
├── music/
│   └── relax.mp3           ← Background music on the home page
├── places/                 ← Drop images here for the Places page
├── people/                 ← Drop images here for the Characters page
└── photos/                 ← Screenshots go here (named 1.jpg, 2.jpg … 70.jpg)

index.html                  ← THE whole site lives in this one file
README.md                   ← This file
```

---

## 🗂️ Pages Overview

| Page | ID in HTML | Scrollable |
|------|-----------|------------|
| Home | `#page-home` | ❌ No |
| Map | `#page-map` | ❌ No |
| Places | `#page-places` | ✅ Yes |
| Characters | `#page-characters` | ✅ Yes |
| Screenshots | `#page-screenshots` | ✅ Yes |
| Trailers | `#page-trailers` | ✅ Yes |

To make any page scrollable, find this CSS block and add the page ID:

```css
#page-places,
#page-characters,
#page-screenshots,
#page-trailers {
  overflow-y: auto;
  overflow-x: hidden;
}
```

---

## 🔧 How to Edit Each Section

---

### 🏠 Home Page

**Change the release date text:**
Search for `November 19, 2026` — it appears in 3 places:
1. The subtitle under the countdown
2. The nav footer (bottom of the side menu)
3. The loading screen date

**Change the countdown target date:**
Find this line in the `<script>`:
```js
const target = new Date('2026-11-19T00:00:00');
```
Replace with your date in `YYYY-MM-DD` format.

**Change platform badges** (PS5 / Xbox):
Find:
```html
<div class="platform-badge">PS5</div>
<div class="platform-badge">Xbox Series X|S</div>
```

**Change background music:**
Replace the file at `leonida/music/relax.mp3`
Or update the source line:
```html
<source src="leonida/music/relax.mp3" type="audio/mpeg">
```

---

### 🗺️ Map Page

The map loads from an external iframe. To change the map URL:
```js
function initMap() {
  document.getElementById('mapIframe').src = 'https://map.stateofleonida.net/';
}
```
Replace the URL with any other map embed link.

---

### 📍 Places Page

Images are loaded **automatically** from your GitHub repo.

**To add images:** Drop `.jpg`, `.png`, `.webp`, or `.gif` files into:
```
leonida/places/
```

**To change the GitHub repo it pulls from**, find `initPlaces()` in the script:
```js
loadGithubImages({
  user: 'vocql',        // ← your GitHub username
  repo: 'leonidagta',  // ← your repo name
  branch: 'main',
  path: 'leonida/places',
  ...
```

---

### 👤 Characters Page

Same auto-loading as Places but from `leonida/people/`.

**Image naming tip:** The filename becomes the character's display name.
Example: `lucia-caminos.jpg` → displays as **Lucia Caminos**

**Built-in bios** are matched by filename. Characters with bios:
- lucia, jason, boobie, cal, drequan, real dimez, bae luxe, roxy, raul, brian, stefanie

**To add a new character bio**, find `const CHARACTER_BIOS = {` in the script and add a new entry:
```js
'yourcharactername': {
  fullName: 'Full Name Here',
  role: 'Their Role',
  quote: "An optional quote.",
  bio: [
    "First paragraph of their bio.",
    "Second paragraph of their bio."
  ]
},
```
The key must match the image filename (lowercase, spaces instead of dashes/underscores).

**To change the GitHub folder:**
Find `initCharacters()` and update:
```js
path: 'leonida/people',
```

---

### 📸 Screenshots Page

Screenshots are loaded by **number** — it tries `1.jpg` through `70.jpg` from:
```
leonida/photos/
```

**To increase the max number checked**, find `initScreenshots()`:
```js
const TOTAL = 70;  // ← change this to however many you have
```

**To change the folder path:**
```js
const IMAGES_PATH = 'leonida/photos/';
```

---

### 🎬 Trailers Page

Trailers use YouTube thumbnail images and open in a built-in lightbox player.

**To add/update a trailer**, find the `TRAILERS` array in the script:
```js
const TRAILERS = [
  { vid: 'QdBZY2fkU-0', title: 'Trailer 1', year: 'Dec 2023' },
  { vid: 'VQRLujxTm3c', title: 'Trailer 2', year: 'May 2025' },
  // Add new trailers here ↓
  { vid: 'XXXXXXXXXXX', title: 'Trailer 3', year: '2026' },
];
```
`vid` = the YouTube video ID (the part after `?v=` in the URL).

**When adding Trailer 3, update 3 things:**

| What | How to find it | Change |
|------|---------------|--------|
| Count badge | Search `<span>2</span> trailers` | `2` → `3` |
| TBA card | Search `trailer-card tba` | Replace whole div |
| TRAILERS array | Search `const TRAILERS` | Add third entry |

**Step 1 — TRAILERS array** (search `const TRAILERS`):
```js
const TRAILERS = [
  { vid: 'QdBZY2fkU-0', title: 'Trailer 1', year: 'Dec 2023' },
  { vid: 'VQRLujxTm3c', title: 'Trailer 2', year: 'May 2025' },
  { vid: 'XXXXXXXXXXX', title: 'Trailer 3', year: '2026' },  // ← add this line
];
```

**Step 2 — Count badge Line 1239** (search `<span>2</span> trailers`):
```html
<!-- BEFORE -->
<div class="count-badge"><span>2</span> trailers</div>

<!-- AFTER -->
<div class="count-badge"><span>3</span> trailers</div>
```

**Step 3 — Replace the TBA card** (search `trailer-card tba`, replace the whole block):
```html
<!-- REMOVE THIS ↓ -->
<div class="trailer-card tba" style="transition-delay:0.2s">
  <div class="new-badge">NEW</div>
  <div class="thumb-wrap">
    <div class="tba-icon">▶</div>
    <div class="tba-label">Coming Soon</div>
  </div>
  <div class="card-label">
    <span class="card-label-title">Trailer 3</span>
    <span class="card-label-year">2026</span>
  </div>
</div>

<!-- REPLACE WITH THIS ↓ -->
<div class="trailer-card" data-vid="XXXXXXXXXXX" data-title="Trailer 3" data-year="2026" style="transition-delay:0.2s">
  <div class="thumb-wrap">
    <img src="https://img.youtube.com/vi/XXXXXXXXXXX/maxresdefault.jpg" alt="GTA VI Trailer 3" loading="lazy">
  </div>
  <div class="card-label">
    <span class="card-label-title">Trailer 3</span>
    <span class="card-label-year">2026</span>
  </div>
</div>
```
Replace both instances of `XXXXXXXXXXX` with the actual YouTube video ID.

---

## 🎨 Colours

All colours are defined as CSS variables at the top of the `<style>` block:

```css
:root {
  --cyan:   #00ffff;   ← Main accent (borders, glows, bars)
  --pink:   #ff00c8;   ← Secondary accent (hover states, pulse dots)
  --purple: #7700ff;   ← Gradient mid colour
  --bg:     #04001a;   ← Base dark background colour
}
```

---

## 🌅 Background Image

Used on **every page** including the loading screen. To swap it out, replace:
```
leonida/images/others.jpg
```
Or find all instances of `others.jpg` in the HTML and update the path.

---

## ⏳ Loading Screen

The loading screen shows automatically on page load and disappears after all messages cycle through (~15 seconds max).

**To change loading messages**, find this array in the script:
```js
const messages = [
  'Connecting…', 'Loading assets…', 'Syncing locations…', 'Init map systems…',
  'Loading profiles…', 'Fetching archive…', 'Calibrating grid…', 'Scanning feeds…',
  'Decrypting files…', 'Almost there…', 'Welcome to Leonida'
];
```

**To change how long the loading screen stays up**, find:
```js
}, 15000);  // ← 15000ms = 15 seconds
```

---

## 🧭 Navigation

The nav links are in the `#navOverlay` section. Each link has a `data-page` attribute that matches the page ID:

```html
<li><a data-page="home">Home</a></li>
<li><a data-page="map">Map</a></li>
<li><a data-page="places">Places</a></li>
<li><a data-page="characters">Characters</a></li>
<li><a data-page="screenshots">Screenshots</a></li>
<li><a data-page="trailers">Trailers</a></li>
```

To rename a nav link, just change the text. The `data-page` value must always match the `id` of the page div (`page-home`, `page-map`, etc.).

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Escape` | Close lightbox → close nav menu |
| `←` Arrow | Previous image in lightbox |
| `→` Arrow | Next image in lightbox |

---

## 🐙 GitHub Repo Settings

Three pages (Places, Characters, Screenshots) pull images from GitHub. All settings are in `initPlaces()`, `initCharacters()`, and `initScreenshots()` inside the script.

| Setting | Current Value |
|---------|--------------|
| GitHub User | `vocql` |
| GitHub Repo | `leonidagta` |
| Branch | `main` |
| Places folder | `leonida/places` |
| Characters folder | `leonida/people` |
| Screenshots folder | `leonida/photos/` |

---

*Last updated: May 2026 — added Trailer 3 step-by-step guide*
