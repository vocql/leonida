/* ==========================================================
   LEONIDA · LOCAL RADIO — FALLBACK TRACK LIST
   leonida/music/tracks.js

   YOU USUALLY DON'T NEED TO TOUCH THIS FILE.
   The radio now reads leonida/music/ directly from the repo
   (via the GitHub API, same as the photo/character/place
   galleries) — just drop mp3 files in that folder and they
   show up automatically, in alphabetical order, titled from
   the filename.

   This list is only used as a fallback if that API call ever
   fails (offline, GitHub rate limit, etc.) AND there's no
   cached track list yet in the browser. If you want to define
   custom titles/artists for that fallback case, add entries
   here the same way as before:

     { file: 'my-song.mp3', title: 'My Song', artist: 'Artist Name' }
   ========================================================== */
window.LEONIDA_TRACKS = [
  // { file: 'example-track.mp3', title: 'Example Track', artist: 'Artist Name' },
];
