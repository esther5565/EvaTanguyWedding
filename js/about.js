/* ==========================================================
   ABOUT US CONTENT: edit this file, no need to touch the page code.

   - Every text exists in three languages: en, es, fr.
   - Anything in [square brackets] is a PLACEHOLDER: replace it with your own text.
   - photo: the small round picture of each stop (files in photos/about/).
     To change one, put another square-ish image there and change the path.
   - stat: the little number pill on the opposite side of each stop.
       value: 12            a number that counts up   |   value: "[N]"  a placeholder
       kind: "together"     days since togetherSince (below)
       kind: "daysToGo"     days until the wedding (WEDDING in guests.js)
     Delete the whole stat line of a stop to remove its pill.
   - Use {date} in a text to insert the wedding day and month in the guest's language.
   ========================================================== */
const ABOUT = {
  /* The day your "days together" counter starts from: [year, month, day].
     Example: [2019, 5, 14] = 14 May 2019. While it is null the pill shows [N]. */
  togetherSince: null,

  intro: {
    en: "[Write a short, warm introduction to the two of you here: two or three sentences.]",
    es: "[Escribe aquí una presentación breve y cálida de los dos: dos o tres frases.]",
    fr: "[Écrivez ici une courte présentation chaleureuse de vous deux : deux ou trois phrases.]",
  },

  end: { en: "See you in Girona", es: "Nos vemos en Girona", fr: "Rendez-vous à Girona" },

  stops: [
    {
      photo: "photos/about/02.jpg",
      title: { en: "How we met", es: "Cómo nos conocimos", fr: "Notre rencontre" },
      text: { en: "[Where and when]", es: "[Dónde y cuándo]", fr: "[Où et quand]" },
      stat: { kind: "together", label: { en: "days together", es: "días juntos", fr: "jours ensemble" } },
    },
    {
      photo: "photos/about/01.jpg",
      title: { en: "First date", es: "Primera cita", fr: "Premier rendez-vous" },
      text: { en: "[The story in one line]", es: "[La historia en una línea]", fr: "[L’histoire en une phrase]" },
      stat: { value: "[N]", label: { en: "live shows seen together", es: "shows en directo juntos", fr: "spectacles vus ensemble" } },
    },
    {
      photo: "photos/about/03.jpg",
      title: { en: "First trip together", es: "Nuestro primer viaje", fr: "Notre premier voyage" },
      text: { en: "[Destination, year]", es: "[Destino, año]", fr: "[Destination, année]" },
      stat: { value: "[N]", label: { en: "countries visited", es: "países visitados", fr: "pays visités" } },
    },
    {
      photo: "photos/about/04.jpg",
      title: { en: "Moving in", es: "Mudándonos juntos", fr: "Emménager ensemble" },
      text: { en: "[City, year]", es: "[Ciudad, año]", fr: "[Ville, année]" },
      stat: { value: "[N]", label: { en: "spaces made home", es: "espacios hechos hogar", fr: "lieux devenus notre chez-nous" } },
    },
    {
      photo: "photos/about/06.jpg",
      title: { en: "The proposal", es: "La pedida", fr: "La demande en mariage" },
      text: { en: "[The moment]", es: "[El momento]", fr: "[Le moment]" },
      stat: { value: 1, label: { en: "yes, no take-backs", es: "sí, sin vuelta atrás", fr: "oui, sans retour en arrière" } },
    },
    {
      photo: "photos/about/05.jpg",
      title: { en: "The wedding", es: "La boda", fr: "Le mariage" },
      text: { en: "Girona, {date}", es: "Girona, {date}", fr: "Girona, {date}" },
      stat: { kind: "daysToGo", label: { en: "days to go", es: "días para la boda", fr: "jours avant le mariage" } },
    },
  ],
};
