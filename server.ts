/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

const PORT = 3000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simulating full persistence in-memory for live demo/preview interactions
interface Appointment {
  id: string;
  customerName: string;
  customerPhone: string;
  serviceId: string;
  serviceTitle: string;
  date: string;
  time: string;
  notes: string;
  status: "confirmé" | "en_attente";
  loyaltyPointsEarned: number;
}

interface LoyaltyAccount {
  phone: string;
  name: string;
  points: number;
  visits: number;
}

const appointmentsStore: Appointment[] = [];
const loyaltyStore: Record<string, LoyaltyAccount> = {
  // Seed initial accounts for simulation
  "+2250544164632": { phone: "+2250544164632", name: "Aminata Koné", points: 250, visits: 3 },
  "+2250707070707": { phone: "+2250707070707", name: "Grace Kouassi", points: 150, visits: 2 }
};

// Initialize Gemini Client
let aiClient: GoogleGenAI | null = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Initialized server-side Gemini client successfully.");
  } else {
    console.warn("GEMINI_API_KEY is not defined or is placeholder. Falling back to rule-based virtual advisor simulation.");
  }
} catch (e) {
  console.error("Failed to initialize Gemini AI Client:", e);
}

// REST API Roots

// 1. Diagnostics & Health
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    salon: "Chez Lou Royal Beauty",
    location: "Yamoussoukro",
    geminiActive: !!aiClient,
  });
});

// 2. Intelligent Beauty & Skincare Advisor (Gemini-powered)
app.post("/api/beauty-advisor", async (req, res) => {
  const { question, skinType, mainConcern } = req.body;

  if (!question && !skinType) {
    return res.status(400).json({ error: "Veuillez fournir une question ou spécifier vos caractéristiques de peau." });
  }

  // Construct prompt for localized deluxe beauty aesthetic advice
  const prompt = `
Vous êtes "Louisa", la conseillère virtuelle d'élite et facialiste senior de l'institut de beauté et spa prestige "Chez Lou Royal Beauty", situé à Yamoussoukro, Côte d'Ivoire (Téléphone: +225 05 44 16 46 32, note Google: 5/5, spécialisé dans l'Hydrafacial, l'Hydra-Oxygénéo, les massages royaux relaxants, le peeling d'éclat rénovateur, le microblading précis de sourcils, et l'épilation délicate à la cire).

Votre but est de fournir des conseils de routine visage/corps extrêmement chaleureux, luxueux, précis et orientés bien-être, de façon très professionnelle. Répondez exclusivement en français.

Détails de la cliente :
- Question/Symptômes : ${question || "Pas de question spécifique, souhaite un diagnostic général"}
- Type de peau : ${skinType || "Non spécifié"}
- Préoccupation principale : ${mainConcern || "Éclat et relaxation complète"}

Dans votre réponse :
1. Saluez la cliente avec la légendaire hospitalité ivoorienne ("Akwaba" ou similaire très distingué).
2. Présentez une analyse professionnelle de ses besoins de peau ou de bien-être.
3. Recommandez précisément un ou deux de nos soins signatures de Chez Lou Royal Beauty (comme le Soin Hydrafacial Premium à 45 000 FCFA ou l'Hydra-Oxygénéo à 55 000 FCFA) en expliquant pourquoi cela convient à sa situation.
4. Suggérez une mini-routine à faire à la maison à Yamoussoukro (en s'adaptant au climat chaud et humide ivoirien, comme l'utilisation de crèmes légères, protection solaire fluide et hydratation constante).
5. Gardez un ton bienveillant, élégant (mots clés : éclat royal, détente majestueuse, pureté de la peau), et invitez-la à réserver une séance directement sur notre site.

Répondez de manière structurée avec un français irréprochable et des espacements agréables.
`;

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          temperature: 0.7,
        }
      });
      return res.json({ advice: response.text });
    } catch (e: any) {
      console.error("Gemini invocation error:", e);
      // Fallback if API fails mid-way
      return res.json({ advice: simulateFrenchAdvice(skinType, mainConcern, question) });
    }
  } else {
    // Elegant hardcoded localized knowledge fallback
    return res.json({ advice: simulateFrenchAdvice(skinType, mainConcern, question) });
  }
});

// 3. Simple Booking System + Reminders Generator
app.post("/api/reservations", (req, res) => {
  const { customerName, customerPhone, serviceId, serviceTitle, date, time, notes } = req.body;

  if (!customerName || !customerPhone || !serviceId || !date || !time) {
    return res.status(400).json({ error: "Tous les champs requis de réservation doivent être complétés." });
  }

  // Generate ID
  const bookingId = "BK-" + Math.floor(100000 + Math.random() * 900000);
  
  // Calculate simulated loyalty points: 10% of standard prices (approximated fallback if pricing is dynamic)
  // prices range: 15k to 75k. Let's award 10 points per 10 000 FCFA
  const numericalPrice = serviceId === "hydrafacial" ? 45000 : 
                         serviceId === "hydra-oxygeneo" ? 55000 :
                         serviceId === "massage" ? 35000 :
                         serviceId === "peeling" ? 40000 :
                         serviceId === "microblading" ? 75000 : 15000;
  
  const loyaltyPointsEarned = Math.round(numericalPrice * 0.001); // 45 points for 45 000 FCFA

  const newBooking: Appointment = {
    id: bookingId,
    customerName,
    customerPhone: customerPhone.trim(),
    serviceId,
    serviceTitle,
    date,
    time,
    notes: notes || "Aucune note",
    status: "confirmé", // Immediate reservation auto-confirmation to solve Problème 2
    loyaltyPointsEarned,
  };

  appointmentsStore.push(newBooking);

  // Update or Create Loyalty account
  const cleanPhone = customerPhone.trim();
  if (loyaltyStore[cleanPhone]) {
    loyaltyStore[cleanPhone].points += loyaltyPointsEarned;
    loyaltyStore[cleanPhone].visits += 1;
  } else {
    loyaltyStore[cleanPhone] = {
      phone: cleanPhone,
      name: customerName,
      points: loyaltyPointsEarned + 50, // Welcome points (50 bonus points)
      visits: 1
    };
  }

  // Generate notification SMS and WhatsApp Templates for Problème 2 (Forgotten appointments)
  const smsTemplate = `Chez Lou Royal Beauty ✨: Bonjour ${customerName}, votre rendez-vous pour "${serviceTitle}" est CONFIRMÉ le ${date} à ${time}. Lieu: Yamoussoukro, Côte d'Ivoire. Tél: +225 05 44 16 46 32. À bientôt pour votre pause douceur !`;

  const whatsappTemplate = `*Chez Lou Royal Beauty* 👑💅\nBonjour *${customerName}*,\n\nNous vous confirmons avec joie votre instant de bien-être :\n🌸 *Soin* : ${serviceTitle}\n📅 *Date* : ${date}\n⏰ *Heure* : ${time}\n📍 *Lieu* : Yamoussoukro, Côte d'Ivoire\n\n*Rappel Automatique* : Un SMS de rappel vous sera envoyé 3 heures avant votre soin. Si vous avez un empêchement, merci de nous contacter au +225 05 44 16 46 32.\n\n_Détendez-vous, nous préparons votre cocon de douceur..._ ✨🧖‍♀️`;

  res.json({
    success: true,
    booking: newBooking,
    loyaltyUpdate: loyaltyStore[cleanPhone],
    smsTemplate,
    whatsappTemplate,
    message: "Rendez-vous enregistré et confirmé automatiquement."
  });
});

// 4. Loyalty Inquiry API
app.get("/api/loyalty/:phone", (req, res) => {
  const phone = req.params.phone.trim();
  const account = loyaltyStore[phone];

  if (!account) {
    return res.status(404).json({
      error: "Aucun compte trouvé avec ce numéro. Il sera créé automatiquement lors de votre première réservation en ligne !"
    });
  }

  // Retrieve upcoming bookings if any
  const userBookings = appointmentsStore.filter(a => a.customerPhone === phone);

  res.json({
    account,
    bookings: userBookings,
  });
});

// Helper for offline localized beauty advice
function simulateFrenchAdvice(skinType: string, concern: string, question: string): string {
  const cleanType = (skinType || "mixte").toLowerCase();
  const cleanConcern = (concern || "éclat").toLowerCase();
  
  let advice = `✨ **Akwaba chez Lou Royal Beauty !** ✨\n\nJe suis ravie de vous accueillir virtuellement, ô Reine. Yamoussoukro offre un climat magnifique mais chaud et humide, ce qui demande une attention toute particulière pour votre peau. Pour une peau de type **${skinType || "non spécifié"}** avec une préoccupation de **${concern || "vitalité"}**, voici mon diagnostic d'experte :\n\n`;

  if (cleanType.includes("gras") || cleanType.includes("imperf")) {
    advice += `💆‍♀️ **Analyse dermatologique** : La chaleur humide peut stimuler la production de sébum, obstruant les pores et créant de petites imperfections. Votre barrière cutanée demande un nettoyage en profondeur sans être agressée.\n\n`;
    advice += `🌟 **Soin recommandé** : Je vous conseille vivement notre **Soin Hydrafacial Premium (45 000 FCFA)**. Grâce à sa technologie unique d'extraction par vortex, il éliminera la totalité de l'excès de sébum et purifiera vos pores pour vous redonner un fini mat et radieux.\n\n`;
  } else if (cleanType.includes("sec") || cleanType.includes("déshydr")) {
    advice += `💆‍♀️ **Analyse dermatologique** : Les climatiseurs et la perte insensible en eau assoiffent votre épiderme. Elle perd son rebondi naturel et tiraille.\n\n`;
    advice += `🌟 **Soin recommandé** : Notre **Soin Hydra-Oxygénéo Élite (55 000 FCFA)** est fait pour vous. Il ré-oxygénera votre peau de l'intérieur et offrira une infusion maximale de principes actifs hydratants et nourrissants.\n\n`;
  } else {
    advice += `💆‍♀️ **Analyse dermatologique** : Pour préserver l'équilibre de votre grain de peau et raviver l'éclat de votre teint fatigué, un nettoyage hydratant et resserrant est idéal.\n\n`;
    advice += `🌟 **Soin recommandé** : Le **Peeling Éclat Rénovateur (40 000 FCFA)** ou un **Soin Hydrafacial Premium (45 000 FCFA)** pour booster le collagène et vous offrir un teint éclatant instantanément.\n\n`;
  }

  advice += `🏡 **Votre routine à la maison à Yamoussoukro** :\n`;
  advice += `- Nettoyez votre visage matin et soir avec un gel doux moussant.\n`;
  advice += `- Appliquez un sérum hautement concentré en Vitamine C pour un éclat royal.\n`;
  advice += `- **Crucial** : Un écran solaire fluide SPF 50+ non comédogène tous les matins pour faire face au soleil de notre belle capitale.\n\n`;
  advice += `📞 *Nous serions honorées de prendre soin de vous. N'hésitez pas à cliquer sur le bouton de réservation ci-dessus ou à nous contacter directement sur WhatsApp au +225 05 44 16 46 32 !*`;

  return advice;
}

// Vite integration middleware & static hosting
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Dev Mode: run Vite Dev Server
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    
    app.use(vite.middlewares);
    console.log("Vite development middleware registered.");
  } else {
    // Production Mode: serve static files
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static files server registered.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Chez Lou Royal Beauty backend running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start fullstack server:", err);
});
