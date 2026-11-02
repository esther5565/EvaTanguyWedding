/* ==========================================================
   FAQ CONTENT: edit this file, no need to touch the page code.

   Each topic has an id (used in links such as qa.html#gifts), a title and its
   questions. Every text exists in three languages: en, es, fr.
   - Questions are shown in CAPITALS automatically: write them normally.
   - Answers: a new line starts a new paragraph. For a link write
       [text shown](https://example.com)
   - Anything in [square brackets] below is a PLACEHOLDER: replace it with your answer.
   - Optional: show a question only to some invitations, with the program keys
     from guests.js:      programs: ["full"],
   ========================================================== */
const FAQ = [
  {
    id: "travel",
    title: { en: "Travel & stay", es: "Viaje y alojamiento", fr: "Voyage et hébergement" },
    items: [
      {
        q: { en: "How do I get to Girona?", es: "¿Cómo llego a Girona?", fr: "Comment venir à Girona ?" },
        a: {
          en: "[Add how to get to Girona: nearest airports, trains from Barcelona, driving directions.]",
          es: "[Añade cómo llegar a Girona: aeropuertos cercanos, trenes desde Barcelona, indicaciones en coche.]",
          fr: "[Ajoutez comment venir à Girona : aéroports proches, trains depuis Barcelone, itinéraire en voiture.]",
        },
      },
      {
        q: { en: "Where should I stay?", es: "¿Dónde me alojo?", fr: "Où loger ?" },
        a: {
          en: "[Add your hotel recommendations, any special rate or discount code, and booking links.]",
          es: "[Añade vuestras recomendaciones de hoteles, tarifas especiales o códigos de descuento y enlaces de reserva.]",
          fr: "[Ajoutez vos hôtels recommandés, tarifs spéciaux ou codes de réduction, et les liens de réservation.]",
        },
      },
      {
        q: { en: "How do I get to the venue?", es: "¿Cómo llego al lugar de la boda?", fr: "Comment rejoindre le lieu de la cérémonie ?" },
        a: {
          en: "[Add the venue address, parking information and whether a shuttle is provided.]",
          es: "[Añade la dirección del lugar, información de aparcamiento y si habrá autobús o transporte.]",
          fr: "[Ajoutez l’adresse du lieu, les informations de parking et si une navette est prévue.]",
        },
      },
    ],
  },
  {
    id: "wedding-day",
    title: { en: "Wedding day", es: "El día de la boda", fr: "Le jour J" },
    items: [
      {
        q: { en: "What time does it start?", es: "¿A qué hora empieza?", fr: "À quelle heure ça commence ?" },
        a: {
          en: "[Add the arrival time and a short summary of the day. The full schedule is on the Program page.]",
          es: "[Añade la hora de llegada y un breve resumen del día. El programa completo está en la página Programa.]",
          fr: "[Ajoutez l’heure d’arrivée et un bref résumé de la journée. Le programme complet est sur la page Programme.]",
        },
      },
      {
        q: { en: "What is the dress code?", es: "¿Cuál es el código de vestimenta?", fr: "Quel est le code vestimentaire ?" },
        a: {
          en: "[Add the dress code and any colours to wear or avoid.]",
          es: "[Añade el código de vestimenta y los colores que se recomiendan o se deben evitar.]",
          fr: "[Ajoutez le code vestimentaire et les couleurs à porter ou à éviter.]",
        },
      },
      {
        q: { en: "What if it rains?", es: "¿Y si llueve?", fr: "Et s’il pleut ?" },
        a: {
          en: "[Add your weather plan and what guests should bring.]",
          es: "[Añade vuestro plan en caso de lluvia y qué deben llevar los invitados.]",
          fr: "[Ajoutez votre plan en cas de pluie et ce que les invités doivent prévoir.]",
        },
      },
    ],
  },
  {
    id: "food",
    title: { en: "Food & drinks", es: "Comida y bebida", fr: "Repas et boissons" },
    items: [
      {
        q: { en: "Can you cater for dietary needs and allergies?", es: "¿Pueden adaptar el menú a dietas y alergias?", fr: "Pouvez-vous adapter le menu aux régimes et allergies ?" },
        a: {
          en: "[Add how guests should tell you about dietary needs or allergies, and by when.]",
          es: "[Añade cómo deben comunicar los invitados sus dietas o alergias, y hasta cuándo.]",
          fr: "[Ajoutez comment les invités doivent signaler régimes ou allergies, et avant quelle date.]",
        },
      },
      {
        q: { en: "Will there be vegetarian or vegan options?", es: "¿Habrá opciones vegetarianas o veganas?", fr: "Y aura-t-il des options végétariennes ou véganes ?" },
        a: {
          en: "[Add details about the menu.]",
          es: "[Añade detalles sobre el menú.]",
          fr: "[Ajoutez des précisions sur le menu.]",
        },
      },
      {
        q: { en: "Will drinks be served?", es: "¿Se servirán bebidas?", fr: "Des boissons seront-elles servies ?" },
        a: {
          en: "[Add details about the bar, which drinks are included and any late-night snacks.]",
          es: "[Añade detalles sobre el bar, qué bebidas están incluidas y si habrá algo de picar por la noche.]",
          fr: "[Ajoutez des précisions sur le bar, les boissons incluses et un éventuel en-cas de fin de soirée.]",
        },
      },
    ],
  },
  {
    id: "guests",
    title: { en: "Guests", es: "Invitados", fr: "Invités" },
    items: [
      {
        q: { en: "Can I bring my children?", es: "¿Puedo llevar a mis hijos?", fr: "Puis-je venir avec mes enfants ?" },
        a: {
          en: "[Add your policy on children and any childcare arrangements.]",
          es: "[Añade vuestra política sobre niños y si habrá servicio de cuidado infantil.]",
          fr: "[Ajoutez votre position sur les enfants et un éventuel mode de garde.]",
        },
      },
      {
        q: { en: "Can I bring a +1?", es: "¿Puedo traer un acompañante (+1)?", fr: "Puis-je venir accompagné(e) (+1) ?" },
        a: {
          en: "[Explain who can bring a +1. Guests who can will see the question on the RSVP page.]",
          es: "[Explica quién puede traer un acompañante. Quienes puedan verán la pregunta en la página RSVP.]",
          fr: "[Expliquez qui peut venir accompagné. Les invités concernés verront la question sur la page RSVP.]",
        },
      },
      {
        q: { en: "Can I take photos?", es: "¿Puedo hacer fotos?", fr: "Puis-je prendre des photos ?" },
        a: {
          en: "[Add your photo policy, for example about phones during the ceremony. Guests can share their pictures on the Moments page.]",
          es: "[Añade vuestra política sobre fotos, por ejemplo sobre móviles durante la ceremonia. Los invitados pueden compartir sus fotos en la página Momentos.]",
          fr: "[Ajoutez votre position sur les photos, par exemple les téléphones pendant la cérémonie. Les invités peuvent partager leurs photos sur la page Moments.]",
        },
      },
    ],
  },
  {
    id: "gifts",
    title: { en: "Gifts", es: "Regalos", fr: "Cadeaux" },
    items: [
      {
        q: { en: "Do you have a gift list?", es: "¿Tenéis lista de regalos?", fr: "Avez-vous une liste de cadeaux ?" },
        a: {
          en: "[Add a link to your gift list or honeymoon fund. Avoid putting bank details on this page.]",
          es: "[Añade un enlace a vuestra lista de regalos o fondo de luna de miel. Evita poner datos bancarios en esta página.]",
          fr: "[Ajoutez un lien vers votre liste de cadeaux ou cagnotte de voyage de noces. Évitez de mettre des coordonnées bancaires sur cette page.]",
        },
      },
      {
        q: { en: "Is a gift expected?", es: "¿Es necesario hacer un regalo?", fr: "Un cadeau est-il attendu ?" },
        a: {
          en: "[Tell guests whether gifts are expected or entirely optional.]",
          es: "[Cuenta a los invitados si se espera un regalo o si es totalmente opcional.]",
          fr: "[Dites aux invités si un cadeau est attendu ou entièrement facultatif.]",
        },
      },
      {
        q: { en: "How can I send a gift?", es: "¿Cómo puedo enviar un regalo?", fr: "Comment envoyer un cadeau ?" },
        a: {
          en: "[Add instructions for giving a gift in person or by delivery.]",
          es: "[Añade instrucciones para entregar un regalo en persona o por envío.]",
          fr: "[Ajoutez les instructions pour offrir un cadeau en main propre ou par livraison.]",
        },
      },
    ],
  },
];
