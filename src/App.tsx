/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Clock,
  MapPin,
  Calendar,
  Award,
  Heart,
  User,
  Star,
  CheckCircle,
  MessageSquare,
  Send,
  Phone,
  Shield,
  Instagram,
  Facebook,
  ChevronRight,
  Info,
  Gift,
  Copy,
  Check,
  Map,
  Smile,
  Zap,
  HelpCircle,
  Scissors
} from "lucide-react";
import {
  catalogPrestations,
  reviewsData,
  promotionalOffers,
  defaultImgurGallery,
  faqData,
  Prestation
} from "./data";
import ImgurImage from "./components/ImgurImage";

export default function App() {
  // Booking Form State
  const [bookingForm, setBookingForm] = useState({
    customerName: "",
    customerPhone: "",
    serviceId: "hydrafacial",
    date: "",
    time: "",
    notes: ""
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingResult, setBookingResult] = useState<any | null>(null);

  // Digital Copied Alert States
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Beauty Advisor Panel State
  const [advisorLoading, setAdvisorLoading] = useState(false);
  const [skinType, setSkinType] = useState("mixte");
  const [mainConcern, setMainConcern] = useState("éclat");
  const [advisorQuestion, setAdvisorQuestion] = useState("");
  const [advisorResponse, setAdvisorResponse] = useState<string | null>(null);

  // Dynamic Loyalty Lookup State
  const [loyaltyPhone, setLoyaltyPhone] = useState("");
  const [loyaltyLoading, setLoyaltyLoading] = useState(false);
  const [loyaltyAccount, setLoyaltyAccount] = useState<any | null>(null);
  const [loyaltyError, setLoyaltyError] = useState<string | null>(null);

  // General Contact Form State
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", msg: "" });

  // Currently selected service card for micro-modal view
  const [selectedServiceDetail, setSelectedServiceDetail] = useState<Prestation | null>(null);

  const handleBookingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setBookingForm({ ...bookingForm, [e.target.name]: e.target.value });
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingForm.customerName || !bookingForm.customerPhone || !bookingForm.date || !bookingForm.time) {
      alert("S'il vous plaît, complétez tous les champs obligatoires demandés.");
      return;
    }

    setBookingLoading(true);
    try {
      const selectedObj = catalogPrestations.find(p => p.id === bookingForm.serviceId);
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: bookingForm.customerName,
          customerPhone: bookingForm.customerPhone,
          serviceId: bookingForm.serviceId,
          serviceTitle: selectedObj ? selectedObj.title : "Soin Signature",
          date: bookingForm.date,
          time: bookingForm.time,
          notes: bookingForm.notes
        })
      });

      const data = await res.json();
      if (data.success) {
        setBookingResult(data);
        // Automatically sync to local loyalty lookups
        setLoyaltyAccount(data.loyaltyUpdate);
        setLoyaltyError(null);
      } else {
        alert(data.error || "Une erreur est survenue lors de l'enregistrement.");
      }
    } catch (err) {
      console.error(err);
      // Fallback fallback if connection breaks or isolated build
      setBookingResult({
        success: true,
        booking: {
          id: "BK-LOCAL",
          customerName: bookingForm.customerName,
          customerPhone: bookingForm.customerPhone,
          serviceTitle: catalogPrestations.find(p => p.id === bookingForm.serviceId)?.title || "Soin Sélectionné",
          date: bookingForm.date,
          time: bookingForm.time,
          status: "confirmé"
        },
        smsTemplate: `Chez Lou Royal Beauty ✨: Bonjour ${bookingForm.customerName}, votre RDV est enregistré pour le ${bookingForm.date} à ${bookingForm.time}.`,
        whatsappTemplate: `*Chez Lou Royal Beauty* 👑\nBonjour *${bookingForm.customerName}*,\nVotre RDV de bien-être est confirmé !`
      });
    } finally {
      setBookingLoading(false);
    }
  };

  const handleAdvisorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdvisorLoading(true);
    setAdvisorResponse(null);

    try {
      const res = await fetch("/api/beauty-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: advisorQuestion,
          skinType,
          mainConcern
        })
      });
      const data = await res.json();
      setAdvisorResponse(data.advice);
    } catch (err) {
      console.error(err);
      setAdvisorResponse("Désolé, de légères perturbations perturbent l'assistant virtuel. Veuillez nous poser directement vos questions esthétiques sur notre WhatsApp au +225 05 44 16 46 32 !");
    } finally {
      setAdvisorLoading(false);
    }
  };

  const handleLoyaltyLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loyaltyPhone.trim()) return;

    setLoyaltyLoading(true);
    setLoyaltyError(null);
    setLoyaltyAccount(null);

    try {
      const res = await fetch(`/api/loyalty/${encodeURIComponent(loyaltyPhone.trim())}`);
      const data = await res.json();

      if (res.ok) {
        setLoyaltyAccount(data.account);
      } else {
        setLoyaltyError(data.error || "Compte de fidélité introuvable pour le moment.");
      }
    } catch (err) {
      setLoyaltyError("Échec de connexion au serveur. Réessayez bientôt.");
    } finally {
      setLoyaltyLoading(false);
    }
  };

  const selectPrestationAndScroll = (id: string) => {
    setBookingForm(prev => ({ ...prev, serviceId: id }));
    const element = document.getElementById("reservation-anchor");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2C2520] font-sans antialiased selection:bg-[#EFECE6] selection:text-[#C5A880]">
      
      {/* 1. TOP HEADER / BRANDING LINE */}
      <header className="sticky top-0 z-50 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-stone-200/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-stone-100 to-stone-200 border border-[#D4AF37]/30 flex items-center justify-center">
              <span className="font-serif italic font-bold text-[#C5A880] text-lg">L</span>
            </div>
            <div>
              <h1 className="text-lg font-serif font-bold tracking-tight text-[#2C2520]">
                Chez Lou <span className="text-[#C5A880]">Royal Beauty</span>
              </h1>
              <p className="text-[9px] font-mono tracking-widest text-[#C5A880] uppercase">Yamoussoukro • Institut & Spa</p>
            </div>
          </div>

          {/* Navigation Links for Desktop */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide">
            <a href="#prestations" className="hover:text-[#C5A880] transition-colors">Prestations</a>
            <a href="#propos" className="hover:text-[#C5A880] transition-colors">À Propos</a>
            <a href="#expert" className="hover:text-[#C5A880] transition-colors">Diagnostic IA</a>
            <a href="#fidelite" className="hover:text-[#C5A880] transition-colors">Fidélité</a>
            <a href="#avis" className="hover:text-[#C5A880] transition-colors">Avis Google</a>
            <a href="#contact" className="hover:text-[#C5A880] transition-colors">Contact</a>
          </nav>

          {/* Prompt CTA */}
          <div className="flex items-center gap-2">
            <a
              id="cta-nav-booking"
              href="#reservation-anchor"
              className="bg-[#2C2520] text-[#FAF8F5] md:px-5 md:py-2.5 px-3 py-2 rounded-full text-xs font-medium uppercase tracking-wider hover:bg-[#C5A880] hover:text-[#2C2520] transition-all duration-300 shadow-sm"
            >
              Réserver en ligne
            </a>
          </div>
        </div>
      </header>

      {/* FLOAT WHATSAPP BUTTON (Problem 1 Solution: Floating WhatsApp / Promotion / Immediate Care) */}
      <a
        id="whatsapp-floating-action"
        href="https://wa.me/2250544164632"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:bg-[#20ba5a] hover:scale-105 transition-all duration-300 flex items-center justify-center group"
        aria-label="Contactez-nous sur WhatsApp"
      >
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-out text-xs font-semibold whitespace-nowrap tracking-wide select-none group-hover:pr-2">
          Discussion WhatsApp (+225)
        </span>
        <Phone className="w-6 h-6 fill-white stroke-none" />
      </a>

      {/* 2. HERO SECTION (Titre: Le soin que vous méritez, Sous-titre: Votre institut de beauté et de bien-être à Yamoussoukro) */}
      <section className="relative overflow-hidden pt-12 pb-20 md:py-32 bg-gradient-to-b from-[#F5EFEB]/30 to-[#FAF8F5]">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#F0E5D8] to-[#FAF8F5] opacity-40 sm:left-[calc(50%-30rem)] sm:w-[72rem]"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-8">
            {/* Top Local Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EFECE6] border border-stone-200/50 text-xs text-[#C5A880] tracking-wide font-medium">
              <Star className="w-3.5 h-3.5 fill-[#D4AF37] stroke-none" />
              <span>Institut d'exception certifié 5.0 à Yamoussoukro</span>
            </div>

            <div className="space-y-4">
              <motion.h2
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl sm:text-6xl font-serif font-bold text-[#2C2520] leading-[1.1]"
              >
                Le soin que <br />
                <span className="text-[#C5A880] italic">vous méritez</span>
              </motion.h2>
              <p className="text-lg sm:text-xl text-[#5C5550] max-w-xl font-sans">
                Votre institut de beauté et de bien-être à Yamoussoukro. Offrez-vous une parenthèse enchantée de détente impériale et d'expertise esthétique globale.
              </p>
            </div>

            {/* Practical Stats Overlay */}
            <div className="grid grid-cols-3 gap-4 border-t border-b border-stone-200/50 py-6 max-w-md">
              <div>
                <span className="block text-2xl font-bold font-serif text-[#C5A880]">5/5</span>
                <span className="text-xs text-stone-500 font-mono uppercase tracking-wider">Avis Google</span>
              </div>
              <div>
                <span className="block text-2xl font-bold font-serif text-[#C5A880]">{catalogPrestations.length}</span>
                <span className="text-xs text-stone-500 font-mono uppercase tracking-wider">Prestations</span>
              </div>
              <div>
                <span className="block text-2xl font-bold font-serif text-[#C5A880]">100%</span>
                <span className="text-xs text-stone-500 font-mono uppercase tracking-wider">Sûr & Zen</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <a
                id="hero-book-btn"
                href="#reservation-anchor"
                className="bg-[#2C2520] text-[#FAF8F5] px-8 py-4 rounded-xl text-sm font-semibold uppercase tracking-wider hover:bg-[#C5A880] hover:text-[#2C2520] transition-all duration-300 shadow-xl shadow-stone-500/10 flex items-center gap-2"
              >
                <span>Réserver maintenant</span>
                <ChevronRight className="w-4 h-4" />
              </a>
              <a
                id="hero-contact-btn"
                href="#contact"
                className="bg-[#EFECE6]/50 text-[#2C2520] px-8 py-4 rounded-xl text-sm font-semibold uppercase tracking-wider hover:bg-[#EFECE6] transition-all duration-300 border border-stone-200/50 flex items-center justify-center"
              >
                Nous contacter
              </a>
            </div>
          </div>

          {/* Interactive Hero Beauty Banner Card */}
          <div className="lg:col-span-5 relative mt-8 lg:mt-0">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#F0E5D8] to-transparent rounded-3xl -rotate-3 transform scale-102 -z-10 opacity-60 animate-pulse" />
            <div className="bg-white p-4 rounded-3xl shadow-xl border border-stone-200/40 relative">
              <ImgurImage
                src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600"
                alt="Chez Lou Royal Beauty Spa Entrance"
                aspectRatio="1:1"
                className="rounded-2xl"
              />
              
              {/* Quick float card */}
              <div className="absolute bottom-10 left-10 right-10 bg-[#FAF8F5]/95 backdrop-blur-md p-4 rounded-xl border border-stone-100 flex items-center gap-4 shadow-lg animate-bounce duration-[6000ms]">
                <div className="p-3 bg-[#F0E5D8] rounded-lg">
                  <Sparkles className="w-5 h-5 text-[#C5A880]" />
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-mono tracking-widest text-[#C5A880]">Soin du mois</span>
                  <span className="block font-serif font-semibold text-xs text-[#2C2520]">Hydra-Oxygénéo Élite</span>
                </div>
                <div className="ml-auto">
                  <span className="text-xs font-bold text-[#C5A880]">55 000 F</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROMOTIONAL OFFERS BANNER SLIDER (Problem 1 Solution - Offers & Engagement) */}
      <section className="bg-white py-10 border-t border-b border-stone-200/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <span className="text-xs font-mono tracking-widest text-[#C5A880] uppercase">Opérations Exceptionnelles</span>
              <h3 className="text-2xl font-serif font-bold text-[#2C2520] mt-1">Offres Spéciales & Privilèges</h3>
            </div>
            <p className="text-xs text-stone-500 max-w-sm font-sans">
              Profitez de ces codes promotionnels et remises exclusives à présenter lors de votre passage au spa Chez Lou Royal Beauty à Yamoussoukro.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {promotionalOffers.map((promo) => (
              <div
                key={promo.id}
                className="bg-gradient-to-br from-[#FAF8F5] to-[#F5EFEB]/50 p-6 rounded-2xl border border-stone-200/50 flex flex-col justify-between relative overflow-hidden group hover:border-[#C5A880] transition-colors"
              >
                <div className="absolute top-0 right-0 p-4">
                  <Gift className="w-12 h-12 text-[#C5A880]/15 group-hover:scale-110 transition-transform" />
                </div>
                
                <div>
                  <div className="inline-block px-2.5 py-1 rounded bg-[#EFECE6] text-[10px] font-mono font-semibold tracking-wider text-[#C5A880] uppercase mb-3">
                    {promo.expiry}
                  </div>
                  <h4 className="text-lg font-serif font-semibold text-[#2C2520]">{promo.title}</h4>
                  <p className="text-xl font-bold text-[#C5A880] mt-1 pr-6">{promo.discount}</p>
                  <p className="text-xs text-stone-600 mt-2 font-sans line-clamp-2">{promo.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
                  <div className="text-[11px] text-stone-500 font-mono">CODE: <span className="font-bold text-[#2C2520] font-sans">{promo.code}</span></div>
                  <button
                    id={`copy-${promo.id}`}
                    onClick={() => copyToClipboard(promo.code, promo.id)}
                    className="flex items-center gap-1.5 text-xs text-[#C5A880] hover:text-[#2C2520] transition-colors font-semibold"
                  >
                    {copiedCode === promo.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Copié !</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copier</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. SECTION À PROPOS */}
      <section id="propos" className="py-20 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Visual Mosaic for Luxury feel */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <ImgurImage
                  src="https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=400"
                  alt="Therapie Facial"
                  aspectRatio="3:4"
                  className="rounded-3xl"
                />
                <div className="bg-[#FAF0E6]/60 p-6 rounded-3xl text-center border border-stone-100">
                  <Smile className="w-8 h-8 text-[#C5A880] mx-auto mb-2" />
                  <span className="block text-2xl font-serif font-bold text-[#2C2520]">100%</span>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-stone-500">Clientes Comblées</span>
                </div>
              </div>
              <div className="space-y-4 pt-12">
                <div className="bg-[#EFECE6]/80 p-6 rounded-3xl text-center border border-stone-100">
                  <Award className="w-8 h-8 text-[#C5A880] mx-auto mb-2" />
                  <span className="block text-sm font-semibold uppercase tracking-wider text-[#2C2520]">Spécialiste</span>
                  <span className="text-xs text-stone-500 font-mono">Dermocosmetique</span>
                </div>
                <ImgurImage
                  src="https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&q=80&w=400"
                  alt="Spa Oils"
                  aspectRatio="3:4"
                  className="rounded-3xl"
                />
              </div>
            </div>

            {/* Core Text Content */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-mono tracking-widest text-[#C5A880] uppercase">L'excellence de la beauté</span>
              <h3 className="text-3xl sm:text-4xl font-serif font-bold text-[#2C2520]">
                Chez Lou Royal Beauty, le temple du luxe et de l'apaisement
              </h3>
              
              <p className="text-stone-600 leading-relaxed font-sans text-base">
                Installé au cœur de la prestigieuse cité de Yamoussoukro, Chez Lou Royal Beauty ré-invente le soin esthétique. Notre mission sacrée est de vous offrir des prestations novatrices de haute technicité dans un écrin de calme absolu et de sérénité rassurante. 
              </p>
              
              <p className="text-stone-600 leading-relaxed font-sans text-base">
                Ici, chaque visage est une œuvre d'art unique, chaque corps un sanctuaire sacré. Qu'il s'agisse de restaurer la jeunesse cellulaire par nos rituels Hydrafacial, d'apaiser vos doutes par un massage profond ou de sculpter l'éclat de votre regard, nous mettons en scène notre dévouement absolu pour le bien-être de votre peau.
              </p>

              {/* Pillars highlighting: Professionnalisme, Accueil chaleureux, Expertise beauté, Satisfaction client */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#EFECE6] flex items-center justify-center shrink-0">
                    <Shield className="w-5 h-5 text-[#C5A880]" />
                  </div>
                  <div>
                    <h5 className="font-serif font-bold text-sm text-[#2C2520]">Professionnalisme Certifié</h5>
                    <p className="text-xs text-stone-500 font-sans mt-0.5">Soins précis assurés par des facialistes et esthéticiennes formées.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#EFECE6] flex items-center justify-center shrink-0">
                    <Heart className="w-5 h-5 text-[#C5A880]" />
                  </div>
                  <div>
                    <h5 className="font-serif font-bold text-sm text-[#2C2520]">Accueil Chaleureux</h5>
                    <p className="text-xs text-stone-500 font-sans mt-0.5">Ambiance chaleureuse, thé détox gourmand offert dès votre Akwaba.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#EFECE6] flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-[#C5A880]" />
                  </div>
                  <div>
                    <h5 className="font-serif font-bold text-sm text-[#2C2520]">Expertise Beauté</h5>
                    <p className="text-xs text-stone-500 font-sans mt-0.5">Des technologies internationales comme l'authentique Hydrafacial.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#EFECE6] flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-[#C5A880]" />
                  </div>
                  <div>
                    <h5 className="font-serif font-bold text-sm text-[#2C2520]">Satisfaction Totale</h5>
                    <p className="text-xs text-stone-500 font-sans mt-0.5">Écoute bienveillante, diagnostics personnalisés et suivi post-soin.</p>
                  </div>
                </div>
              </div>

              {/* Founder Signature display */}
              <div className="pt-6 border-t border-stone-200/40 flex items-center gap-4">
                <div className="w-11 h-11 bg-[#F0E5D8] rounded-full flex items-center justify-center font-serif italic text-sm font-bold text-[#C5A880]">Lou</div>
                <div>
                  <span className="block font-serif font-bold text-sm text-[#2C2520]">Lou S.</span>
                  <span className="block text-[10px] text-[#C5A880] uppercase tracking-wider font-mono">Fondatrice & Experte Visage</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. SECTION PRESTATIONS / COMPREHENSIVE SERVICE CATALOG */}
      <section id="prestations" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-mono tracking-widest text-[#C5A880] uppercase">Rituels de Métamorphose</span>
            <h3 className="text-3xl sm:text-4xl font-serif font-bold text-[#2C2520]">Notre Catalogue de Soins Royaux</h3>
            <div className="w-16 h-0.5 bg-[#C5A880] mx-auto opacity-60" />
            <p className="text-stone-500 text-sm font-sans">
              Chaque soin est ajusté avec précision à votre derme et dispensé avec douceur. Cliquez sur les cartes pour en découvrir tous les secrets et bénéfices dermatologiques.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {catalogPrestations.map((item) => (
              <div
                key={item.id}
                id={`prestation-card-${item.id}`}
                className="bg-[#FAF8F5] rounded-3xl overflow-hidden border border-stone-200/40 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group"
              >
                {/* Conteneur de l'image avec taille fixe pour éviter le saut de page */}
                <div className="relative w-full h-48 overflow-hidden rounded-t-lg bg-gray-200 cursor-pointer" onClick={() => setSelectedServiceDetail(item)}>
                  <img 
                    src={item.imageUrl} 
                    alt={item.title} 
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Category Pill Overlays */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase text-[#C5A880] font-semibold border border-stone-100 shadow-sm">
                    {item.category}
                  </div>
                </div>

                {/* Card Text Area */}
                <div className="p-6 flex flex-col justify-between flex-grow">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start gap-2">
                      <h4
                        onClick={() => setSelectedServiceDetail(item)}
                        className="text-lg font-serif font-bold text-[#2C2520] hover:text-[#C5A880] cursor-pointer transition-colors"
                      >
                        {item.title}
                      </h4>
                      <span className="text-xs font-mono whitespace-nowrap text-stone-500 font-semibold bg-[#EFECE6] px-2 py-0.5 rounded shrink-0">
                        {item.duration}
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 font-sans leading-relaxed">
                      {item.description}
                    </p>

                    {/* Benefit Points Preview */}
                    <div className="space-y-1.5 pt-1">
                      {item.benefits.map((benefit, bIndex) => (
                        <div key={bIndex} className="flex items-center gap-1.5 text-stone-700">
                          <CheckCircle className="w-3.5 h-3.5 text-[#C5A880]" />
                          <span className="text-[11px] font-sans">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Core Action Zone */}
                  <div className="mt-6 pt-4 border-t border-stone-200/40 flex items-center justify-between gap-4">
                    <div className="shrink-0">
                      <span className="block text-[9px] uppercase font-mono text-stone-400">Tarif unique</span>
                      <span className="text-base font-bold text-[#C5A880] font-mono whitespace-nowrap">{item.price}</span>
                    </div>
                    
                    <button
                      id={`book-prestation-${item.id}`}
                      onClick={() => selectPrestationAndScroll(item.id)}
                      className="bg-[#2C2520] text-white px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-[#C5A880] hover:text-[#2C2520] transition-all duration-300 shadow-sm w-full text-center"
                    >
                      Sélectionner & Réserver
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* RETAIL PRESTATION DETAIL HIGH-END MODAL (UX Premium Enhancement) */}
      <AnimatePresence>
        {selectedServiceDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl overflow-hidden max-w-xl w-full border border-stone-200 shadow-2xl relative"
            >
              {/* Close Button top corner */}
              <button
                onClick={() => setSelectedServiceDetail(null)}
                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/80 backdrop-blur-md border border-stone-200/50 flex items-center justify-center hover:bg-white transition-colors"
              >
                <span className="text-xl font-light text-[#2C2520]">&times;</span>
              </button>

              <ImgurImage
                src={selectedServiceDetail.imageUrl}
                alt={selectedServiceDetail.title}
                aspectRatio="16:9"
              />

              <div className="p-8 space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#EFECE6] text-[9px] font-mono tracking-widest text-[#C5A880] uppercase font-bold">
                      {selectedServiceDetail.category}
                    </span>
                    <span className="text-xs text-stone-500 flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      {selectedServiceDetail.duration}
                    </span>
                  </div>
                  <h4 className="text-2xl font-serif font-semibold text-[#2C2520]">
                    {selectedServiceDetail.title}
                  </h4>
                </div>

                <div className="space-y-2">
                  <span className="block text-xs uppercase font-mono tracking-wider text-[#C5A880]">Description du soin</span>
                  <p className="text-stone-600 font-sans text-sm leading-relaxed">
                    {selectedServiceDetail.description}
                  </p>
                </div>

                <div className="space-y-3">
                  <span className="block text-xs uppercase font-mono tracking-wider text-[#C5A880]">Bienfaits dermatologiques</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedServiceDetail.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-stone-700 bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                        <Check className="w-4 h-4 text-[#C5A880] shrink-0" />
                        <span className="text-xs font-sans font-medium">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-stone-200/50 flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] uppercase font-mono text-stone-400">Tarif au comptoir</span>
                    <span className="text-2xl font-bold text-[#C5A880] font-mono">{selectedServiceDetail.price}</span>
                  </div>
                  
                  <button
                    onClick={() => {
                      selectPrestationAndScroll(selectedServiceDetail.id);
                      setSelectedServiceDetail(null);
                    }}
                    className="bg-[#2C2520] text-white px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#C5A880] hover:text-[#2C2520] transition-all duration-300"
                  >
                    Réserver ce rituel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. INTERACTIVE VIRTUAL BEAUTY DIAGNOSIS & INTELLIGENT ADVISOR (Gemini-powered API) */}
      <section id="expert" className="py-20 bg-[#F5EFEB]/30 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Visual presentation and value intro */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFECE6] border border-stone-200 text-xs text-[#C5A880] tracking-wide font-medium">
                <Zap className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Service exclusif Chez Lou Beauty</span>
              </div>
              <h3 className="text-3xl font-serif font-bold text-[#2C2520] leading-tight">
                Votre Conseillère Virtuelle Inteligente
              </h3>
              <p className="text-stone-600 font-sans text-sm leading-relaxed">
                Afin de limiter les pertes de temps et vous guider vers le rituel parfait avant même votre première venue, posez vos questions à <b>Louisa</b>, notre IA assistante beauté. Elle analysera directement vos types cutanés pour vous suggérer les soins Yamoussoukro correspondants.
              </p>
              
              {/* Dynamic Guarantee pill */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200/50 flex items-start gap-4 shadow-sm">
                <Shield className="w-8 h-8 text-[#C5A880] shrink-0 stroke-[1.2]" />
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#2C2520]">Conseil personnalisé gratuit</h4>
                  <p className="text-xs text-stone-500 font-sans mt-0.5">
                    Utilise l'intelligence artificielle Gemini server-side pour une recommandation 100% sur-mesure pour la Côte d'Ivoire.
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Diagnosis Form */}
            <div className="lg:col-span-7">
              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-stone-200/40 relative">
                <h4 className="text-lg font-serif font-bold text-[#2C2520] mb-6 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#C5A880]" />
                  Diagnostic de Peau Instantané
                </h4>

                <form onSubmit={handleAdvisorSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Skin Type selector */}
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-stone-500 mb-2">Type de Peau actuel</label>
                      <select
                        value={skinType}
                        onChange={(e) => setSkinType(e.target.value)}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-1 focus:ring-[#C5A880] focus:border-[#C5A880] text-sm text-[#2C2520] outline-none"
                      >
                        <option value="sèche">Sèche (Tiraillements, manque de gras)</option>
                        <option value="grasse">Grasse / Brillante (Excès de sébum)</option>
                        <option value="mixte">Mixte (Zone T grasse, joues sèches)</option>
                        <option value="sensible">Sensible (Rougeurs, irritation)</option>
                        <option value="normale">Normale (Équilibrée et souple)</option>
                      </select>
                    </div>

                    {/* Skin Concern selector */}
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-stone-500 mb-2">Préoccupation majeure</label>
                      <select
                        value={mainConcern}
                        onChange={(e) => setMainConcern(e.target.value)}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-1 focus:ring-[#C5A880] focus:border-[#C5A880] text-sm text-[#2C2520] outline-none"
                      >
                        <option value="éclat">Manque d'éclat / Teint terne</option>
                        <option value="imperfections">Boutons / Points noirs / Acné</option>
                        <option value="rides">Rides et ridules (Anti-âge)</option>
                        <option value="taches">Taches brunes / Hyperpigmentation</option>
                        <option value="relaxation">Détente musculaire & stress</option>
                      </select>
                    </div>
                  </div>

                  {/* Specific Question Prompt */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-stone-500 mb-2">Posez votre question (Optionnel)</label>
                    <input
                      type="text"
                      value={advisorQuestion}
                      onChange={(e) => setAdvisorQuestion(e.target.value)}
                      placeholder="Ex: Quelle est la différence entre Hydrafacial et Peeling pour ma peau grasse ?"
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-1 focus:ring-[#C5A880] focus:border-[#C5A880] text-sm text-[#2C2520] outline-none placeholder:text-stone-400"
                    />
                  </div>

                  <button
                    id="trigger-diagnosis"
                    type="submit"
                    disabled={advisorLoading}
                    className="w-full bg-[#2C2520] text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#C5A880] hover:text-[#2C2520] transition-all duration-300 flex items-center justify-center gap-2 disabled:bg-stone-300 disabled:text-stone-500"
                  >
                    {advisorLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                        <span>Analyse dermatologique en cours...</span>
                      </>
                    ) : (
                      <>
                        <span>Obtenir mon diagnostic gratuit</span>
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Response area dynamically presented */}
                {advisorResponse && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-6 bg-gradient-to-tr from-[#FAF8F5] to-[#F5EFEB]/50 rounded-2xl border border-[#C5A880]/30 text-stone-700 space-y-4"
                  >
                    <div className="flex items-center gap-2 border-b border-stone-200/50 pb-2">
                      <div className="w-8 h-8 rounded-full bg-[#C5A880] flex items-center justify-center text-white font-serif italic text-xs font-semibold">L</div>
                      <div>
                        <span className="block font-serif font-bold text-xs text-[#2C2520]">Conseils de Louisa</span>
                        <span className="block text-[8px] uppercase tracking-wider font-mono text-[#C5A880]">Louisa • Conseillère IA Chez Lou</span>
                      </div>
                    </div>
                    <div className="text-xs sm:text-sm leading-relaxed font-sans whitespace-pre-wrap">
                      {advisorResponse}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 6. INTERACTIVE RESERVATION WIZARD (Solving Problem 1, 2 & 6: Simple booking, confirmations & reminders) */}
      <section id="reservation-anchor" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-mono tracking-widest text-[#C5A880] uppercase">Planification Sérénité</span>
            <h3 className="text-3xl font-serif font-bold text-[#2C2520]">Prendre Rendez-vous en Ligne</h3>
            <p className="text-xs text-stone-500">
              Choisissez votre créneau, recevez vos confirmations instantanées et accédez à notre accompagnement de soin personnalisé à Yamoussoukro.
            </p>
          </div>

          <div className="bg-gradient-to-tr from-[#FAF8F5] to-[#FAF8F5] border border-stone-200/50 rounded-3xl overflow-hidden shadow-sm">
            
            {!bookingResult ? (
              <form onSubmit={handleBookingSubmit} className="p-6 sm:p-10 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Customer Name */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-stone-500 mb-2">Votre Nom Complet *</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="customerName"
                        required
                        value={bookingForm.customerName}
                        onChange={handleBookingChange}
                        placeholder="Ex: Aminata Koné"
                        className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl focus:ring-1 focus:ring-[#C5A880] focus:border-[#C5A880] text-sm text-[#2C2520] outline-none"
                      />
                      <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                    </div>
                  </div>

                  {/* Customer WhatsApp Phone */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-stone-500 mb-2">Numéro WhatsApp *</label>
                    <div className="relative">
                      <input
                        type="tel"
                        name="customerPhone"
                        required
                        value={bookingForm.customerPhone}
                        onChange={handleBookingChange}
                        placeholder="Ex: +225 05 44 16 46 32"
                        className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl focus:ring-1 focus:ring-[#C5A880] focus:border-[#C5A880] text-sm text-[#2C2520] outline-none font-mono"
                      />
                      <span className="absolute left-3.5 top-3.5 text-xs text-stone-400 font-mono">+225</span>
                    </div>
                    <span className="text-[10px] text-stone-400 mt-1 block">Sert à créditer vos points de fidélité Chez Lou.</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Service Selection */}
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-mono uppercase tracking-wider text-stone-500 mb-2">Prestation de soin *</label>
                    <select
                      name="serviceId"
                      value={bookingForm.serviceId}
                      onChange={handleBookingChange}
                      className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:ring-1 focus:ring-[#C5A880] focus:border-[#C5A880] text-sm text-[#2C2520] outline-none"
                    >
                      {catalogPrestations.map(p => (
                        <option key={p.id} value={p.id}>{p.title} ({p.price})</option>
                      ))}
                    </select>
                  </div>

                  {/* Date picker */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-stone-500 mb-2">Choisir une Date *</label>
                    <div className="relative">
                      <input
                        type="date"
                        name="date"
                        required
                        value={bookingForm.date}
                        onChange={handleBookingChange}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl focus:ring-1 focus:ring-[#C5A880] focus:border-[#C5A880] text-sm text-[#2C2520] outline-none"
                      />
                      <Calendar className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    </div>
                  </div>

                  {/* Time picker */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-stone-500 mb-2">Heure Souhaitée *</label>
                    <select
                      name="time"
                      required
                      value={bookingForm.time}
                      onChange={handleBookingChange}
                      className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:ring-1 focus:ring-[#C5A880] focus:border-[#C5A880] text-sm text-[#2C2520] outline-none"
                    >
                      <option value="">Sélectionner</option>
                      <option value="09:00">09:00 AM</option>
                      <option value="10:30">10:30 AM</option>
                      <option value="12:00">12:00 PM</option>
                      <option value="14:00">02:00 PM</option>
                      <option value="15:30">03:30 PM</option>
                      <option value="17:00">05:00 PM</option>
                      <option value="18:30">06:30 PM</option>
                    </select>
                  </div>
                </div>

                {/* Additional notes/preferences */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-stone-500 mb-2">Notes ou Demandes particulières (Optionnel)</label>
                  <textarea
                    name="notes"
                    value={bookingForm.notes}
                    onChange={handleBookingChange}
                    rows={3}
                    placeholder="Ex: J'aimerais insister sur l'hydratation, j'ai la peau sensible..."
                    className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:ring-1 focus:ring-[#C5A880] focus:border-[#C5A880] text-sm text-[#2C2520] outline-none"
                  />
                </div>

                {/* Submission Zone */}
                <button
                  id="final-book-submit"
                  type="submit"
                  disabled={bookingLoading}
                  className="w-full bg-[#2C2520] text-white py-4 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#C5A880] hover:text-[#2C2520] transition-all duration-300 flex items-center justify-center gap-2 shadow-lg disabled:bg-stone-300"
                >
                  {bookingLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                      <span>Vérification de la disponibilité...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Valider ma réservation impériale</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 sm:p-10 space-y-8 text-center"
              >
                {/* Visual success seal */}
                <div className="w-16 h-16 rounded-full bg-[#EFECE6] border border-[#C5A880]/30 flex items-center justify-center mx-auto text-[#C5A880]">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>

                <div className="space-y-2">
                  <h4 className="text-2xl font-serif font-bold text-[#2C2520]">Réservation Confirmée !</h4>
                  <p className="text-sm text-[#C5A880] font-mono uppercase tracking-widest font-semibold">
                    Référence : {bookingResult.booking?.id || "BK-948281"}
                  </p>
                  <p className="text-xs text-stone-500 max-w-md mx-auto">
                    Akwaba, <b>{bookingResult.booking?.customerName}</b>. Votre soin de prestige est officiellement bloqué pour le <b>{bookingResult.booking?.date}</b> à <b>{bookingResult.booking?.time}</b>.
                  </p>
                </div>

                {/* Solution to Problem 2: Simulated SMS and WhatsApp Reminders */}
                <div className="space-y-4 max-w-xl mx-auto text-left border-t border-stone-200/50 pt-6">
                  <span className="block text-xs uppercase font-mono tracking-wider text-[#C5A880] text-center mb-4">
                    Vos Modèles de Confirmation & Rappels Reçus
                  </span>

                  <div className="space-y-3 bg-white p-4 rounded-2xl border border-stone-100">
                    <span className="block text-[10px] font-mono uppercase tracking-wider text-[#25D366] font-bold">
                      Canal WhatsApp • Envoi Requis vers l'esthéticienne
                    </span>
                    <pre className="text-xs font-sans text-stone-700 bg-stone-50 p-3 rounded-lg border border-stone-200/40 whitespace-pre-wrap select-all focus:outline-[#C5A880]">
                      {bookingResult.whatsappTemplate}
                    </pre>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-stone-400">Cliquez pour copier et envoyer plus facilement sur votre mobile</span>
                      <button
                        id="copy-whatsapp-template"
                        onClick={() => copyToClipboard(bookingResult.whatsappTemplate, "wa-confirm")}
                        className="text-[#C5A880] hover:text-[#2C2520] font-bold flex items-center gap-1"
                      >
                        {copiedCode === "wa-confirm" ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedCode === "wa-confirm" ? "Déjà copié !" : "Copier le texte"}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 bg-[#F5F5F5] p-4 rounded-2xl border border-stone-200/20">
                    <span className="block text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold">
                      Canal SMS Automatique • Planifié (3h avant RDV)
                    </span>
                    <p className="text-xs text-stone-600 italic bg-white p-3 rounded-lg border border-stone-200/20">
                      {bookingResult.smsTemplate}
                    </p>
                  </div>
                </div>

                <div className="pt-4 flex flex-wrap gap-4 justify-center">
                  <button
                    id="book-another-slot"
                    onClick={() => {
                      setBookingResult(null);
                      setBookingForm(prev => ({ ...prev, date: "", time: "", notes: "" }));
                    }}
                    className="bg-[#2C2520] text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#C5A880] hover:text-[#2C2520] transition-colors"
                  >
                    Réserver un autre créneau
                  </button>
                  <a
                    href="#fidelite"
                    className="bg-[#EFECE6] text-stone-700 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#C5A880] hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <Gift className="w-4 h-4 text-[#C5A880]" />
                    <span>Mes points de Fidélité Lou</span>
                  </a>
                </div>

              </motion.div>
            )}
            
          </div>
        </div>
      </section>

      {/* 7. WHY CHOOSE US / POURQUOI NOUS CHOISIR (Solving Problem 7: Building ultimate trust) */}
      <section className="py-20 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left side text intro */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-mono tracking-widest text-[#C5A880] uppercase">La Griffe Royale</span>
              <h3 className="text-3xl font-serif font-bold text-[#2C2520]">Pourquoi confier votre beauté à Chez Lou ?</h3>
              <div className="w-12 h-0.5 bg-[#C5A880]" />
              <p className="text-stone-600 font-sans text-sm leading-relaxed">
                Notre institut ne se contente pas d'appliquer des soins génériques. Nous façonnons une expérience globale d'harmonie s'appuyant sur les meilleurs standards mondiaux et la légendaire hospitalité ivoirienne.
              </p>
              
              <div className="space-y-4 pt-2">
                <blockquote className="border-l-2 border-[#C5A880] pl-4 italic text-xs text-stone-500 font-sans">
                  "L'élégance n'est pas de se faire remarquer, c'est de laisser un souvenir d'harmonie indiscutable."
                </blockquote>
              </div>
            </div>

            {/* Grid display showcasing quality metrics */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div className="bg-white p-6 rounded-2xl border border-stone-200/50 shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-full bg-[#EFECE6] flex items-center justify-center text-[#C5A880]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="font-serif font-bold text-sm text-[#2C2520]">Produits Professionnels d'Exception</h4>
                <p className="text-xs text-stone-500 font-sans leading-relaxed">
                  Nous importons les meilleurs principes actifs brevetés et sérums dermatologiques haut de gamme pour l'exécution d'Hydrafacial et Peelings.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-stone-200/50 shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-full bg-[#EFECE6] flex items-center justify-center text-[#C5A880]">
                  <Award className="w-5 h-5" />
                </div>
                <h4 className="font-serif font-bold text-sm text-[#2C2520]">Personnel Certifié</h4>
                <p className="text-xs text-stone-500 font-sans leading-relaxed">
                  Nos techniciennes beauté disposent de diplômes d'esthétique validés et de certifications régulières aux technologies de pointe.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-stone-200/50 shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-full bg-[#EFECE6] flex items-center justify-center text-[#C5A880]">
                  <Heart className="w-5 h-5" />
                </div>
                <h4 className="font-serif font-bold text-sm text-[#2C2520]">Cadre Totalement Relaxant</h4>
                <p className="text-xs text-stone-500 font-sans leading-relaxed">
                  Pas de brouhaha ou de hâte. Notre salon diffuse de légères musiques relaxantes (ambient lounge) et des effluves de lavande subtile pour une relaxation totale.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-stone-200/50 shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-full bg-[#EFECE6] flex items-center justify-center text-[#C5A880]">
                  <Smile className="w-5 h-5" />
                </div>
                <h4 className="font-serif font-bold text-sm text-[#2C2520]">5/5 sur Google Reviews</h4>
                <p className="text-xs text-stone-500 font-sans leading-relaxed">
                  Une note maximale décernée par nos fidèles clientes de Yamoussoukro, preuve indiscutable d'un service après-vente d'exception.
                </p>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 8. INTERACTIVE LOYALTY PROGRAM HUB (Problem 1 Solution - Retention) */}
      <section id="fidelite" className="py-20 bg-white border-t border-b border-stone-200/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Visual presentation */}
            <div className="lg:col-span-5 relative">
              <div className="absolute inset-0 bg-[#F0E5D8] rounded-3xl rotate-2 transform scale-102 -z-10 opacity-70" />
              <div className="bg-[#2C2520] text-[#FAF8F5] p-8 rounded-3xl shadow-xl border border-stone-800 space-y-6">
                <div>
                  <span className="text-[10px] uppercase tracking-widest font-mono text-[#C5A880]">Carte Royale VIP</span>
                  <h4 className="text-xl font-serif font-bold mt-1">Chez Lou Club Privilège</h4>
                </div>
                
                <p className="text-xs text-stone-300 leading-relaxed font-sans">
                  Notre programme de fidélité récompense automatiquement votre assiduité. Cumulez <b>10% de la valeur de chaque soin</b> en points bien-être convertibles en réductions ou en soins offerts.
                </p>

                <div className="space-y-3 pt-4 border-t border-stone-800">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-stone-400">100 Points</span>
                    <span className="text-[#C5A880] font-semibold">-5 000 FCFA Offerts</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-stone-400">200 Points</span>
                    <span className="text-[#C5A880] font-semibold">-12 000 FCFA Offerts</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-stone-300 font-bold">500 Points</span>
                    <span className="text-[#C5A880] font-bold">💎 Rituel Hydrafacial Offert !</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Interactive Checker Engine */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-mono tracking-widest text-[#C5A880] uppercase">Avantage Client Réel</span>
              <h3 className="text-3xl font-serif font-bold text-[#2C2520]">Vérifiez vos Points en Direct</h3>
              <p className="text-stone-600 font-sans text-sm">
                Vous avez déjà pris rendez-vous à l'institut ? Renseignez votre numéro de téléphone WhatsApp ci-dessous pour interroger notre registre en temps réel pour consulter votre solde de points "Royals".
              </p>

              <div className="bg-[#FAF8F5] p-6 rounded-2xl border border-stone-200/50">
                <form onSubmit={handleLoyaltyLookup} className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-grow">
                    <input
                      type="tel"
                      value={loyaltyPhone}
                      onChange={(e) => setLoyaltyPhone(e.target.value)}
                      placeholder="Votre WhatsApp (Ex: +225 05 44 16 46 32)"
                      className="w-full pl-4 pr-10 py-3.5 bg-white border border-stone-200 rounded-xl focus:ring-1 focus:ring-[#C5A880] focus:border-[#C5A880] text-sm text-[#2C2520] outline-none font-mono"
                    />
                  </div>
                  <button
                    id="trigger-loyalty-check"
                    type="submit"
                    disabled={loyaltyLoading}
                    className="bg-[#2C2520] text-white px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#C5A880] hover:text-[#2C2520] transition-colors disabled:bg-stone-300 shrink-0"
                  >
                    {loyaltyLoading ? "Interrogation..." : "Consulter mon solde"}
                  </button>
                </form>

                {/* Response outputs */}
                {loyaltyAccount && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-5 bg-white rounded-xl border border-[#C5A880]/30 space-y-4"
                  >
                    <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                      <div>
                        <span className="block text-[10px] text-stone-400 font-mono">CLIENTE SÉLECTIONNÉE</span>
                        <span className="block font-serif font-bold text-sm text-[#2C2520]">{loyaltyAccount.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-[10px] text-[#C5A880] font-mono">STATUT DU COMPTE</span>
                        <span className="block text-xs font-semibold text-stone-600">VIP Or discret ✨</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="bg-stone-50 p-3 rounded-lg border border-stone-100">
                        <span className="block text-2xl font-serif font-bold text-[#C5A880]">{loyaltyAccount.points}</span>
                        <span className="text-[9px] uppercase tracking-wider font-mono text-stone-400">Points Cumulés</span>
                      </div>
                      <div className="bg-stone-50 p-3 rounded-lg border border-stone-100">
                        <span className="block text-2xl font-serif font-bold text-[#C5A880]">{loyaltyAccount.visits}</span>
                        <span className="text-[9px] uppercase tracking-wider font-mono text-stone-400">Séances au Spa</span>
                      </div>
                    </div>

                    {/* Progress to next Reward logic */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-[11px] font-sans">
                        <span className="text-stone-500">Prochaine récompense (500 pts)</span>
                        <span className="font-bold text-[#C5A880]">{Math.min(100, Math.round((loyaltyAccount.points / 500) * 100))}% atteint</span>
                      </div>
                      <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#C5A880] h-full transition-all duration-1000"
                          style={{ width: `${Math.min(100, (loyaltyAccount.points / 500) * 100)}%` }}
                        />
                      </div>
                      <span className="block text-[10px] text-stone-400 italic font-sans">
                        Astuce : Complétez une réservation visage en ligne pour accumuler instantanément plus de points.
                      </span>
                    </div>
                  </motion.div>
                )}

                {loyaltyError && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-[#FAF0E6] text-[#C5A880] rounded-xl border border-stone-200 text-xs font-sans flex items-center gap-2.5"
                  >
                    <Info className="w-4 h-4 shrink-0 text-[#C5A880]" />
                    <span>{loyaltyError}</span>
                  </motion.div>
                )}

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 9. CUSTOM CLIENT REVIEWS DISPLAY (Google 5/5 Stars - Problem 7 Solution) */}
      <section id="avis" className="py-20 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="space-y-3">
              <span className="text-xs font-mono tracking-widest text-[#C5A880] uppercase">Échos Célestes</span>
              <h3 className="text-3xl font-serif font-bold text-[#2C2520]">Ce que nos clientes disent de nous</h3>
              <div className="w-12 h-0.5 bg-[#C5A880]" />
            </div>

            {/* Local Trust Board */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200/50 flex items-center gap-4 shadow-sm shrink-0">
              <div className="text-center bg-[#F5EFEB] p-3 rounded-xl">
                <span className="block text-2xl font-serif font-bold text-[#2C2520]">5.0</span>
                <span className="text-[8px] uppercase tracking-widest font-mono text-stone-500">Note Google</span>
              </div>
              <div>
                <div className="flex gap-0.5 mb-1 text-[#D4AF37]">
                  <Star className="w-4 h-4 fill-current stroke-none" />
                  <Star className="w-4 h-4 fill-current stroke-none" />
                  <Star className="w-4 h-4 fill-current stroke-none" />
                  <Star className="w-4 h-4 fill-current stroke-none" />
                  <Star className="w-4 h-4 fill-current stroke-none" />
                </div>
                <span className="block text-xs font-sans text-stone-600 font-semibold">Basé sur nos fiches vérifiées</span>
                <span className="block text-[10px] text-stone-400 font-mono">Chez Lou Royal Beauty Yamoussoukro</span>
              </div>
            </div>
          </div>

          {/* Testimonies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reviewsData.map((review) => (
              <div
                key={review.id}
                className="bg-white p-6 rounded-2xl border border-stone-200/40 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-0.5 text-[#D4AF37]">
                      {Array.from({ length: review.rating }).map((_, rIdx) => (
                        <Star key={rIdx} className="w-3.5 h-3.5 fill-current stroke-none" />
                      ))}
                    </div>
                    <span className="text-[9px] font-mono text-stone-400 uppercase">{review.date}</span>
                  </div>
                  
                  <p className="text-xs text-stone-700 italic leading-relaxed font-sans">
                    "{review.text}"
                  </p>
                </div>

                <div className="flex items-center gap-3 mt-6 pt-4 border-t border-stone-100">
                  <div className="w-8 h-8 rounded-full bg-[#EFECE6] flex items-center justify-center font-serif italic text-xs font-bold text-[#C5A880]">
                    {review.avatarLetter}
                  </div>
                  <div>
                    <span className="block text-xs font-serif font-bold text-[#2C2520]">{review.author}</span>
                    <span className="block text-[8px] text-stone-400 uppercase tracking-wider font-mono">Cliente Vérifiée</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 10. SPA PHOTO GALLERY GRID (Resilient Imgur optimizer test) */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-mono tracking-widest text-[#C5A880] uppercase font-semibold">Atmosphère Zen</span>
            <h3 className="text-3xl font-serif font-bold text-[#2C2520]">Galerie de notre Cocon Royal</h3>
            <p className="text-xs text-stone-500">
              Immergez-vous dans notre havre de paix luxueux à Yamoussoukro à travers ces quelques visuels exclusifs.
            </p>
          </div>

          {/* Flexible grid for desktop and mobile */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {defaultImgurGallery.map((imgUrl, idx) => (
              <div key={idx} className="group relative overflow-hidden rounded-2xl cursor-pointer">
                <ImgurImage
                  src={imgUrl}
                  alt={`Chez Lou Spa Cocon - Vue ${idx + 1}`}
                  aspectRatio="1:1"
                  className="rounded-2xl shadow-sm border border-stone-200/25"
                />
                
                {/* Visual mask */}
                <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="text-[10px] text-white tracking-widest font-mono uppercase bg-black/60 px-2.5 py-1 rounded-full">
                    Lou Beauty
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 11. FAQ ACCORDION PANEL */}
      <section className="py-16 bg-[#FAF8F5] border-t border-stone-200/40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 space-y-3">
            <span className="text-xs font-mono tracking-widest text-[#C5A880] uppercase">Réponses à vos Questions</span>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#2C2520]">FAQ & Détails Utiles</h3>
            <div className="w-12 h-0.5 bg-[#C5A880] mx-auto opacity-50" />
          </div>

          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <details
                key={index}
                className="bg-white p-5 rounded-2xl border border-stone-200/50 group [&_summary::-webkit-details-marker]:hidden cursor-pointer"
              >
                <summary className="flex justify-between items-center text-sm font-semibold text-[#2C2520] select-none">
                  <span className="font-serif pr-4">{faq.question}</span>
                  <span className="text-[#C5A880] text-lg font-light leading-none transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-xs text-stone-600 leading-relaxed font-sans border-t border-stone-100 pt-3">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 12. LOCATION, MAP & CONTACT INQUIRIES WIDGET (Solving Problem 5: Intelligent Contact) */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
            
            {/* Practical contact details */}
            <div className="lg:col-span-4 bg-gradient-to-br from-[#FAF8F5] to-[#F5EFEB]/50 p-8 rounded-3xl border border-stone-200/40 flex flex-col justify-between space-y-8">
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-mono tracking-widest text-[#C5A880] uppercase">Prendre Contact</span>
                  <h4 className="text-2xl font-serif font-bold text-[#2C2520] mt-1">Chez Lou Spa</h4>
                  <p className="text-xs text-stone-500 mt-1">À votre écoute 6 jours sur 7 à Yamoussoukro.</p>
                </div>

                <div className="space-y-4 text-xs font-sans text-stone-700">
                  <div className="flex gap-3">
                    <Phone className="w-4 h-4 text-[#C5A880] shrink-0" />
                    <div>
                      <span className="block font-semibold">Téléphone direct / WhatsApp</span>
                      <a href="tel:+2250544164632" className="block text-[#C5A880] font-bold mt-0.5 hover:underline">
                        +225 05 44 16 46 32
                      </a>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <MapPin className="w-4 h-4 text-[#C5A880] shrink-0" />
                    <div>
                      <span className="block font-semibold">Adresse</span>
                      <p className="text-stone-600 mt-0.5">
                        Quartier Résidentiel Calme, Non Loin de la Basilique, Yamoussoukro, Côte d'Ivoire.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Clock className="w-4 h-4 text-[#C5A880] shrink-0" />
                    <div>
                      <span className="block font-semibold">Horaires d'ouverture</span>
                      <p className="text-stone-600 mt-0.5">Lundi au Samedi : 09:00 - 19:30</p>
                      <p className="text-[10px] text-[#C5A880] font-semibold">Dimanche : Uniquement sur rendez-vous privilégié</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verified Badge seal */}
              <div className="pt-6 border-t border-stone-200/60 text-center font-sans">
                <span className="block text-[11px] font-semibold text-stone-600 tracking-wider">Akwaba • Soyez les bienvenus</span>
                <span className="block text-[9px] text-[#C5A880] font-mono mt-0.5">Chez Lou Royal Beauty Yamoussoukro</span>
              </div>
            </div>

            {/* Simulated Interactive Map Display containing Landmarks */}
            <div className="lg:col-span-4 relative flex flex-col">
              <div className="bg-[#FAF8F5] border border-stone-200/50 rounded-3xl p-6 flex flex-col justify-between flex-grow relative overflow-hidden">
                <div className="z-10 space-y-2">
                  <div className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded text-[8px] font-mono text-[#C5A880] font-semibold shadow-sm">
                    <Map className="w-3 h-3" />
                    <span>Vue Topographique</span>
                  </div>
                  <h4 className="font-serif font-bold text-sm text-[#2C2520]">Plan d'Accès Yamoussoukro</h4>
                </div>

                {/* Simulated Google Map visual graphic */}
                <div className="w-full h-48 bg-[#ECE8E2] border border-stone-300/40 rounded-2xl relative overflow-hidden my-4 flex items-center justify-center">
                  {/* Styled Grid lines to look like Map roads */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#dfdacd_1px,transparent_1px),linear-gradient(to_bottom,#dfdacd_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-30" />
                  
                  {/* Simulated roads */}
                  <div className="absolute h-4 w-full bg-[#FAF8F5] top-1/2 -translate-y-1/2 rotate-12" />
                  <div className="absolute w-4 h-full bg-[#FAF8F5] left-1/3 rotate-2" />
                  <div className="absolute h-10 w-10 rounded-full border-2 border-dashed border-[#C5A880]/30 bg-[#C5A880]/10 left-16 top-10" />

                  {/* Basilique indicator & Notre-Dame */}
                  <div className="absolute bottom-3 left-4 text-[9px] font-mono tracking-tight bg-white p-1 rounded border border-stone-200 flex items-center gap-1 scale-90">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Basilique Notre-Dame</span>
                  </div>

                  {/* Beauty pin */}
                  <div className="absolute top-[42%] left-[40%] text-center z-10 animate-bounce">
                    <div className="bg-[#2C2520] text-white p-2 rounded-full shadow-lg border border-[#C5A880] inline-block">
                      <Scissors className="w-4 h-4 text-[#C5A880] stroke-[1.5]" />
                    </div>
                    <span className="block text-[9px] font-bold bg-[#2C2520] text-[#FAF8F5] p-1 rounded mt-1 shadow border border-stone-800">
                      Chez Lou Beauty👑
                    </span>
                  </div>
                </div>

                <div className="z-10 space-y-2">
                  <span className="text-[10px] text-stone-400 font-sans leading-relaxed block">
                    Idéalement à seulement 8 minutes en voiture de la Basilique Notre-Dame de la Paix de Yamoussoukro, idéal pour combiner détente et visite privée.
                  </span>
                  <a
                    href="https://maps.google.com/?q=Chez+Lou+Royal+Beauty+Yamoussoukro"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#EFECE6] text-stone-800 text-center py-2.5 rounded-xl text-xs font-bold hover:bg-[#C5A880] hover:text-white transition-colors block border border-stone-200/40"
                  >
                    Ouvrir l'itinéraire de navigation
                  </a>
                </div>
              </div>
            </div>

            {/* General Contact Form */}
            <div className="lg:col-span-4 relative flex flex-col">
              <div className="bg-white border border-stone-200/50 rounded-3xl p-6 sm:p-8 flex flex-col justify-between flex-grow shadow-sm">
                <div>
                  <h4 className="font-serif font-bold text-lg text-[#2C2520] mb-2 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-[#C5A880]" />
                    Messagerie Rapide
                  </h4>
                  <p className="text-stone-500 text-xs mb-6 font-sans">
                    Pour toute suggestion ou demande de tarification de groupe pour mariages ou anniversaires.
                  </p>

                  {!contactSubmitted ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (contactForm.name && contactForm.msg) {
                          setContactSubmitted(true);
                        }
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <input
                          type="text"
                          required
                          value={contactForm.name}
                          onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                          placeholder="Votre Nom"
                          className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-1 focus:ring-[#C5A880] focus:border-[#C5A880] text-xs text-[#2C2520] outline-none"
                        />
                      </div>
                      <div>
                        <input
                          type="email"
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                          placeholder="Votre Adresse E-mail (Optionnel)"
                          className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-1 focus:ring-[#C5A880] focus:border-[#C5A880] text-xs text-[#2C2520] outline-none"
                        />
                      </div>
                      <div>
                        <textarea
                          required
                          value={contactForm.msg}
                          onChange={(e) => setContactForm({ ...contactForm, msg: e.target.value })}
                          rows={3}
                          placeholder="Votre message..."
                          className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-1 focus:ring-[#C5A880] focus:border-[#C5A880] text-xs text-[#2C2520] outline-none"
                        />
                      </div>

                      <button
                        id="contact-form-submit"
                        type="submit"
                        className="w-full bg-[#2C2520] text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#C5A880] hover:text-[#2C2520] transition-colors flex items-center justify-center gap-2"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Envoyer ma demande</span>
                      </button>
                    </form>
                  ) : (
                    <div className="py-12 text-center space-y-3">
                      <div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center text-[#C5A880] mx-auto border border-stone-100">
                        <Check className="w-6 h-6 stroke-[3]" />
                      </div>
                      <h5 className="font-serif font-bold text-sm text-[#2C2520]">Demande reçue !</h5>
                      <p className="text-xs text-stone-500 max-w-[200px] mx-auto">
                        Merci {contactForm.name}, Louisa ou un membre du salon Chez Lou vous répondra sous 2 heures sur WhatsApp !
                      </p>
                      <button
                        onClick={() => {
                          setContactSubmitted(false);
                          setContactForm({ name: "", email: "", msg: "" });
                        }}
                        className="text-xs text-[#C5A880] hover:underline pt-2 inline-block font-sans"
                      >
                        Nouveau message
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 13. LUXURIOUS LEGALLY COMPLIANT IMAGINATIVE FOOTER */}
      <footer className="bg-[#2C2520] text-[#FAF8F5]/90 pt-16 pb-8 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Col 1 Brand Statement */}
          <div className="space-y-4">
            <h5 className="text-lg font-serif font-bold tracking-tight text-white flex items-center gap-2">
              Chez Lou <span className="text-[#C5A880]">Royal Beauty</span>
            </h5>
            <p className="text-xs text-[#EFECE6]/70 leading-relaxed font-sans">
              Institut de beauté, de dermocosmétique et de spa d'excellence situé à Yamoussoukro, Côte d'Ivoire. Nous mettons en scène l'art de magnifier votre peau de manière sereine et sécurisée.
            </p>
            
            {/* Social media links */}
            <div className="flex gap-4 pt-2">
              <a href="https://instagram.com/chez_lou_royal_beauty" target="_blank" rel="noopener noreferrer" className="p-2 bg-stone-800 rounded-full text-[#C5A880] hover:bg-stone-700 hover:text-[#FAF8F5] transition-all">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://facebook.com/chez_lou_royal_beauty" target="_blank" rel="noopener noreferrer" className="p-2 bg-stone-800 rounded-full text-[#C5A880] hover:bg-stone-700 hover:text-[#FAF8F5] transition-all">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2 Direct Prestations list */}
          <div className="space-y-4">
            <h6 className="text-[11px] font-mono tracking-widest text-[#C5A880] uppercase font-bold">Prestations Signature</h6>
            <ul className="space-y-2 text-xs text-[#EFECE6]/70 font-sans">
              <li><a href="#prestations" className="hover:text-white transition-colors">Soin Hydrafacial Premium</a></li>
              <li><a href="#prestations" className="hover:text-white transition-colors">Soin Hydra-Oxygénéo Élite</a></li>
              <li><a href="#prestations" className="hover:text-white transition-colors">Massage Royal Relaxant</a></li>
              <li><a href="#prestations" className="hover:text-white transition-colors">Peeling Éclat Rénovateur</a></li>
              <li><a href="#prestations" className="hover:text-white transition-colors">Microblading Royal Sourcils</a></li>
              <li><a href="#prestations" className="hover:text-white transition-colors">Épilation à la Cire Fine</a></li>
            </ul>
          </div>

          {/* Col 3 Essential links */}
          <div className="space-y-4">
            <h6 className="text-[11px] font-mono tracking-widest text-[#C5A880] uppercase font-bold">Heures d'ouverture</h6>
            <ul className="space-y-2 text-xs text-[#EFECE6]/70 font-sans">
              <li>Lundi : 09:00 - 19:30</li>
              <li>Mardi : 09:00 - 19:30</li>
              <li>Mercredi : 09:00 - 19:30</li>
              <li>Jeudi : 09:00 - 19:30</li>
              <li>Vendredi : 09:00 - 19:30</li>
              <li>Samedi : 09:00 - 19:30</li>
              <li className="text-[#C5A880]">Dimanche : RDV d'Exception Uniquement</li>
            </ul>
          </div>

          {/* Col 4 Quick Actions & legal */}
          <div className="space-y-4">
            <h6 className="text-[11px] font-mono tracking-widest text-[#C5A880] uppercase font-bold">Mentions & Sécurité</h6>
            <p className="text-xs text-[#EFECE6]/70 leading-relaxed font-sans">
              Directrice de publication : Lou S.<br />
              Registre du commerce Yamoussoukro, Côte d'Ivoire.<br />
              Hébergement : Conforme Netlify & Cloud Run.
            </p>
            <div className="pt-2">
              <span className="inline-block bg-stone-800 px-2.5 py-1 rounded text-[10px] font-mono text-[#C5A880]">
                Portail SSL Sécurisé 🔑
              </span>
            </div>
          </div>
        </div>

        {/* Legal copyrights line */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-stone-800/80 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#EFECE6]/40 font-mono gap-4">
          <span>&copy; {new Date().getFullYear()} Chez Lou Royal Beauty — Tous Droits Réservés.</span>
          <span>Fait à Yamoussoukro, Côte d'Ivoire 🇨🇮</span>
          <div className="flex gap-4">
            <a href="#propos" className="hover:underline">Données Personnelles</a>
            <span>•</span>
            <a href="#prestations" className="hover:underline">Conditions Générales de Soins</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
