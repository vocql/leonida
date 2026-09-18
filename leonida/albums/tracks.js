/* ==========================================================
   LEONIDA · LOCAL RADIO — FALLBACK TRACK LIST
   leonida/albums/tracks.js

   YOU USUALLY DON'T NEED TO TOUCH THIS FILE.
   The radio now reads leonida/albums/ directly from the repo
   (via the GitHub API, same as the photo/character/place
   galleries) — just drop mp3 files in that folder and they
   show up automatically, in alphabetical order, titled from
   the filename.

   This list is only used as a fallback if that API call ever
   fails (offline, GitHub rate limit, etc.) AND there's no
   cached track list yet in the browser. It's ALSO used to patch
   in artist/genre credit on top of the live GitHub listing,
   matched by filename — since the GitHub API only returns
   filenames, not tags, this is the only place title/artist text
   comes from.

   IMPORTANT: `file` below must exactly match the real filename
   you drop in leonida/albums/ (case-sensitive), or the credit
   won't match up and it'll fall back to a filename-based title
   with no artist line.

     { file: 'my-song.mp3', title: 'My Song', artist: 'Artist Name' }
   ========================================================== */
window.LEONIDA_TRACKS = [
  { file: 'sexy-magic.mp3', title: 'Sexy Magic', artist: 'CA7RIEL, Paco Amoroso, PinkPantheress, Fred again..' },
  { file: 'thats-it.mp3', title: "That's It", artist: 'Yung Lean feat. Future & Metro Boomin' },
  { file: 'last-thing-you-need.mp3', title: 'Last Thing You Need', artist: 'Morgan Wallen' },
  { file: 'rhyno.mp3', title: 'RHYNO', artist: 'Travis Scott' },
  { file: 'macacoa-2000.mp3', title: 'Macacoa 2000', artist: 'Rauw Alejandro' },
  { file: 'bright-lights-big-city.mp3', title: 'Bright Lights, Big City', artist: 'Keith Richards' },
];
