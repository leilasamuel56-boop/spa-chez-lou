/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Prestation {
  id: string;
  title: string;
  category: string;
  duration: string;
  price: string;
  description: string;
  benefits: string[];
  imageUrl: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  text: string;
  avatarLetter: string;
}

export interface PromoOffer {
  id: string;
  title: string;
  discount: string;
  code: string;
  description: string;
  expiry: string;
}

export const catalogPrestations: Prestation[] = [
  {
    id: "hydrafacial",
    title: "Soin Hydrafacial Premium",
    category: "Visage",
    duration: "60 min",
    price: "45 000 FCFA",
    description: "Un traitement révolutionnaire qui nettoie, exfolie, extrait les impuretés et hydrate la peau en profondeur grâce à des sérums infusés de nutriments essentiels.",
    benefits: ["Teint instantanément éclatant", "Resserre les pores", "Élimine points noirs"],
    imageUrl: "https://i.imgur.com/6NDwPYn.jpeg"
  },
  {
    id: "hydra-oxygeneo",
    title: "Soin Hydra-Oxygénéo Élite",
    category: "Visage",
    duration: "75 min",
    price: "55 000 FCFA",
    description: "Le traitement ultime 3-en-1 combinant l'exfoliation douce, l'oxygénation naturelle de la peau de l'intérieur, et l'infusion d'ingrédients actifs rajeunissants.",
    benefits: ["Oxygénation cellulaire active", "Effet repulpant immédiat", "Améliore l'élasticité"],
    imageUrl: "https://i.imgur.com/34ZH8B4.jpeg"
  },
  {
    id: "massage",
    title: "Massage Royal Relaxant",
    category: "Corps",
    duration: "90 min",
    price: "35 000 FCFA",
    description: "Un massage holistique enveloppant aux huiles précieuses chaudes de coco et de karité pour libérer les tensions musculaires et apaiser l'esprit.",
    benefits: ["Détente musculaire absolue", "Élimine le stress profond", "Améliore le sommeil"],
    imageUrl: "https://i.imgur.com/l4lbwCd.jpeg"
  },
  {
    id: "peeling",
    title: "Peeling Éclat Rénovateur",
    category: "Visage",
    duration: "45 min",
    price: "40 000 FCFA",
    description: "Soin exfoliant dermatologique contrôlé pour stimuler le renouvellement des cellules, atténuer les taches et lisser le grain de peau.",
    benefits: ["Réduit l'acné et les cicatrices", "Estompe l'hyperpigmentation", "Peau lissée et rajeunie"],
    imageUrl: "https://i.imgur.com/bJspmfh.jpeg"
  },
  {
    id: "microblading",
    title: "Microblading Royal Sourcils",
    category: "Regard",
    duration: "120 min",
    price: "75 000 FCFA",
    description: "Technique de maquillage semi-permanent poil à poil pour restructurer et redessiner vos sourcils de façon ultra-naturelle et harmonieuse.",
    benefits: ["Tracé poil à poil réaliste", "Tenue longue durée (1-2 ans)", "Regard structuré au réveil"],
    imageUrl: "https://i.imgur.com/dtnBysT.jpeg"
  },
  {
    id: "epilation-cire",
    title: "Épilation à la Cire Fine",
    category: "Corps",
    duration: "30 min",
    price: "15 000 FCFA",
    description: "Épilation professionnelle à base de cire naturelle hypoallergénique, douce pour l'épiderme, pour une peau parfaitement soyeuse.",
    benefits: ["Repousse ralentie (3-4 semaines)", "Cire tiède non irritante", "Idéal peaux sensibles"],
    imageUrl: "https://i.imgur.com/lBQZW2N.jpeg"
  }
];

export const reviewsData: Review[] = [
  {
    id: "1",
    author: "Aminata Koné",
    rating: 5,
    date: "Il y a 2 semaines",
    text: "Bon accueil client et maîtrise son travail. L'Hydrafacial a donné un éclat incroyable à ma peau. Je recommande vivement Chez Lou Royal Beauty !",
    avatarLetter: "A"
  },
  {
    id: "2",
    author: "Grace Kouassi",
    rating: 5,
    date: "Il y a 1 mois",
    text: "Le meilleur spa de Yamoussoukro ! L'ambiance est extrêmement calme et zen, le cadre est somptueux. Masages divins.",
    avatarLetter: "G"
  },
  {
    id: "3",
    author: "Mariam Diarra",
    rating: 5,
    date: "Il y a 3 semaines",
    text: "Un service haut de gamme fantastique. Le personnel est très attentionné, à l'écoute et très professionnel. Un vrai bonheur après des journées stressantes.",
    avatarLetter: "M"
  },
  {
    id: "4",
    author: "Stéphane Koffi",
    rating: 5,
    date: "Il y a 5 jours",
    text: "Une qualité exceptionnelle de soins ! De passage à Yamoussoukro, j'ai pris une séance de massage relaxant. Technique parfaite.",
    avatarLetter: "S"
  }
];

export const promotionalOffers: PromoOffer[] = [
  {
    id: "promo-wel",
    title: "Offre de Bienvenue",
    discount: "-15% sur votre 1er Soin",
    code: "ROYALWELCOME",
    description: "Valable sur toutes les prestations visage pour votre première visite à l'institut.",
    expiry: "Prochainement"
  },
  {
    id: "promo-hyd",
    title: "Duo Éclat & Détente",
    discount: "Masssage + Hydrafacial à 70 000 FCFA",
    code: "DUOROYAL",
    description: "Profitez d'un massage relaxant de 60 min combiné avec le soin Hydrafacial pour rééquilibrer corps et esprit.",
    expiry: "Ce mois-ci"
  }
];

// Elegant placeholder images and direct support for easy custom host list
export const defaultImgurGallery = [
  "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600", // Spa lobby
  "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=600", // Skin therapy
  "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&q=80&w=600", // Hot stones massage
  "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&q=80&w=600", // Facial mist
  "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&q=80&w=600", // Aromatherapy
  "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600"  // Zen candle setup
];

export const faqData = [
  {
    question: "Quelle est la différence entre l'Hydrafacial et l'Hydra-Oxygénéo ?",
    answer: "L'Hydrafacial utilise la technologie brevetée d'aspiration vortex pour nettoyer et infuser des sérums hydratants. L'Hydra-Oxygénéo combine une exfoliation mécanique douce avec une réaction naturelle qui stimule l'apport d'oxygène de l'intérieur de la peau, complété par de l'échographie pour faire pénétrer les nutriments."
  },
  {
    question: "Dois-je réserver à l'avance pour Chez Lou Royal Beauty ?",
    answer: "Oui, nous vous conseillons vivement de planifier vos rendez-vous 24h à 48h à l'avance afin de vous garantir une expérience sereine et calme, et pour que nous puissions préparer votre cabine personnalisée."
  },
  {
    question: "Où se situe précisément votre institut à Yamoussoukro ?",
    answer: "Nous sommes idéalement situés dans un quartier chic et calme de Yamoussoukro, en Côte d'Ivoire. Notre situation géographique exacte est fournie lors de la confirmation, et un itinéraire Google Maps est disponible directement au bas de notre site."
  },
  {
    question: "Le programme de fidélité est-il gratuit ?",
    answer: "Absolument ! Notre programme est entièrement gratuit. Vous cumulez automatiquement des points à chaque prestation (10% de la valeur de votre prestation cumulé en points cadeaux). Vous pouvez suivre vos points directement sur notre site en renseignant votre numéro WhatsApp."
  },
  {
    question: "Quels types d'huiles utilisez-vous pour les massages ?",
    answer: "Nous utilisons exclusivement des huiles végétales de qualité supérieure certifiées pures (beurre de Karité fondant premium, huile de noix de Coco vierge et extraits d'huiles essentielles zen de Lavande ou d'Eucalyptus) très apaisantes et respectueuses de tous les types de peau."
  }
];
