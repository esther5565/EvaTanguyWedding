/* ==========================================================
   DATA FILE – edit this file to manage guests and programs
   ========================================================== */

/* Wedding date (month is 0-based: 8 = September) */
const WEDDING = new Date(2027, 8, 25, 0, 0, 0);

/* Venue shown on the Program page. PLACEHOLDER: replace with the real address.
   Clicking it opens Google Maps for that address. "maps" is optional: paste a
   Google Maps "Share" link here to point at an exact pin instead. */
const VENUE = {
  address: "Plaça de la Catedral, 17004 Girona, Spain",
  maps: "",
};

/* Where RSVP answers are sent (a Google Sheet, which opens in Excel).
   Setup: see tools/rsvp-google-script.gs, then paste the web app URL here.
   While this is empty the RSVP page runs in TEST MODE: nothing is sent, the
   browser downloads a small CSV instead. Fill it in before sharing the site. */
const RSVP_ENDPOINT = "";

/* Moments (photo gallery + uploads) uses the same Google script, so the same URL.
   Only change this if you ever run photos from a separate script. */
const MOMENTS_ENDPOINT = RSVP_ENDPOINT;

/* Language used when a guest has none, or before login */
const DEFAULT_LANG = "en";

/* One line per guest.
   lang:    "en" | "es" | "fr"   (add more in js/i18n.js)
   program: key of a program in PROGRAMS below ("full", "evening", ...)
   plusOne: true if the guest may bring a +1 (shows the extra button), otherwise false */
const GUESTS = [
  { first: "Esther", last: "Berges", lang: "en", program: "full", plusOne: true },
  // { first: "Name",  last: "Surname", lang: "es", program: "evening", plusOne: false },
  // { first: "Name",  last: "Surname", lang: "fr", program: "full", plusOne: true },
];

/* Programs shown on program.html, depending on the invitation.
   event: key translated in js/i18n.js ("event.<key>")
   time:  placeholder "--:--" until the real times are decided */
const PROGRAMS = {
  full: [
    { time: "--:--", event: "ceremony" },
    { time: "--:--", event: "cocktail" },
    { time: "--:--", event: "dinner" },
    { time: "--:--", event: "party" },
  ],
  evening: [
    { time: "--:--", event: "party" },
  ],
};
