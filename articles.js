/**
 * ╔══════════════════════════════════════════════╗
 * ║           ARTICLES REGISTRY                  ║
 * ╠══════════════════════════════════════════════╣
 * ║  To add a new article:                       ║
 * ║  1. Drop your PDF into leonida/articles/     ║
 * ║  2. Add one entry to the array below         ║
 * ╚══════════════════════════════════════════════╝
 *
 * Fields:
 *   file     — PDF filename inside leonida/articles/
 *   title    — shown on the card
 *   date     — display date e.g. 'May 2025'
 *   category — tag on the card e.g. 'Analysis', 'Guide', 'News', 'Fan Theory'
 *   summary  — short teaser shown on the card
 *   thumb    — optional thumbnail image URL; leave '' for gradient placeholder
 */

const ARTICLES = [
 {
    file:     '1.pdf',       // exact filename in leonida/articles/
    title:    'Take-Two CEO Strauss Zelnick Denies Crunch at Rockstar Amid GTA VI Rumors', // shown on the card
    date:     'May 2026',             // shown on the card
    category: 'Analysis',            // the colored tag on the card
    summary:  'A short description.', // teaser text under the title
    thumb:    '',                     // leave blank OR paste an image URL
  },

];
