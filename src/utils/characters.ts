export const characters = [
  {
    name: 'Villageois',
    description:
      "Son objectif est de vaincre les Loups-Garous. Sa parole est son seul pouvoir de persuasion pour éliminer les Loups-Garous. Il doit rester à l'affût d'indices, et identifier les coupables.",
    shortDescription: 'Le villageois est un personnage qui a un objectif de vaincre les Loups-Garous.',
    order: -1,
    once: null,
    image: 'https://storage.crisp.chat/users/helpdesk/website/18579a93d9b99c00/simplevillageoiswolfy_14kfm20.png',
    team: 'Villageois',
  },
  {
    name: 'Chasseur',
    description:
      "Son objectif est de vaincre les Loups-Garous. Lorsque le Chasseur meurt, il a le pouvoir d'amener un autre joueur avec lui dans sa tombe.",
    shortDescription: 'Le chasseur à pour objectif de vaincre les Loups-Garous.',
    order: -1,
    once: null,
    image: 'https://storage.crisp.chat/users/helpdesk/website/18579a93d9b99c00/chasseurwolfy_1d4e0kt.png',
    team: 'Villageois',
  },
  {
    name: 'Cupidon',
    description:
      'Cupidon a pour seul pouvoir de nommer les deux amoureux : il sélectionne deux participants et ceux-ci sont informés en privé de leur amour, ils peuvent comuniquer via un channel qui leur ai réservé tout le temps. Une fois désignés, il devient similaire à un Simple Villageois.',
    shortDescription: 'Cupidon peut choisir 2 amoureux.',
    order: 1,
    once: true,
    image: 'https://storage.crisp.chat/users/helpdesk/website/18579a93d9b99c00/cupidonwolfy_hg78vy.png',
    team: 'Villageois',
  },
  {
    name: 'Voyante',
    description:
      "Son objectif est de vaincre les Loups-Garous. Chaque nuit, elle peut connaître le rôle d'un joueur qu'elle aura choisi. Elle doit aider les innocents sans se faire démasquer.",
    shortDescription: "La voyante peut connaître le rôle d'un joueur.",
    order: 2,
    once: false,
    image: 'https://storage.crisp.chat/users/helpdesk/website/18579a93d9b99c00/voyantewolfy_r9i9b2.png',
    team: 'Villageois',
  },
  {
    name: 'Garde',
    description:
      'Son objectif est de vaincre les Loups-Garous. Chaque nuit, il peut protéger un joueur différent contre une attaque des Loups-Garous.',
    shortDescription: 'Le garde peut protéger un joueur de la mort.',
    order: 3,
    once: false,
    image: 'https://storage.crisp.chat/users/helpdesk/website/18579a93d9b99c00/gardewolfy_14hin1n.png',
    team: 'Villageois',
  },
  {
    name: 'Loup-Garou',
    description:
      'Vaincre les villageois est son objectif. Durant la nuit les loups-garous se réunissent pour voter qui va être éliminé. Pendant la journée il ne doit pas être démasqué.',
    shortDescription: 'Le loup-garou à pour objectif de vaincre les villageois.',
    order: 4,
    once: false,
    image: 'https://storage.crisp.chat/users/helpdesk/website/18579a93d9b99c00/loupgarouwolfy_1q2yt0l.png',
    team: 'Loup-Garous',
  },
  {
    name: 'Loup-Blanc',
    description: "Il fait partis des loups-garous vote avec eux, etc mais une nuit sur deux il peut choisir d'en tuer un.",
    shortDescription: 'Le loup-blanc peut tuer un loup-garou.',
    order: 4,
    once: false,
    image: 'https://storage.crisp.chat/users/helpdesk/website/18579a93d9b99c00/loupblancwolfy_1o4eb2a.png',
    team: 'Loup-Garous',
  },
  {
    name: 'Sorcière',
    description:
      'Son objectif est de vaincre les Loups-Garous. Elle se réveille chaque nuit et peut utiliser une de ses deux potions : soigner la victime des Loups-Garous, ou tuer quelqu’un.',
    shortDescription: 'La sorcière peut soigner ou tuer un joueur.',
    order: 5,
    once: false,
    image: 'https://storage.crisp.chat/users/helpdesk/website/18579a93d9b99c00/sorcierewolfy_lu5487.png',
    team: 'Villageois',
  },
];
