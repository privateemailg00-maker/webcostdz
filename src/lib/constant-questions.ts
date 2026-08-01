import type { Lang } from "./i18n/translations";

export type ConstQuestion = {
  id: number;
  question: string;
  help: string;
  type: "radio";
  options: string[];
  optionKeys: string[];
  weight: number;
  category: string;
  constKey: "backend" | "speed";
};

type Pack = {
  backend: { category: string; question: string; help: string; options: string[] };
  speed: { category: string; question: string; help: string; options: string[] };
};

const PACKS: Record<Lang, Pack> = {
  ar: {
    backend: {
      category: "التقنية",
      question: "هل تريد نظاماً خلفياً مبرمجاً خصيصاً أم منصة جاهزة؟",
      help: "«النظام الخلفي» هو الجزء غير المرئي من الموقع الذي يحفظ بياناتك (الطلبات، الحسابات، المنتجات). المنصة الجاهزة (مثل خدمات جاهزة للاشتراك) أسرع وأرخص وتناسب أغلب المشاريع، أما النظام المبرمج خصيصاً فيمنحك تحكماً كاملاً ومرونة أكبر لكنه أغلى ويستغرق وقتاً أطول. إذا لم تكن متأكداً اختر المنصة الجاهزة.",
      options: [
        "منصة جاهزة — أسرع وأرخص (موصى به)",
        "نظام خلفي مبرمج خصيصاً — تحكم كامل ومرونة أكبر",
      ],
    },
    speed: {
      category: "مدة الإنجاز",
      question: "ما مدى السرعة التي تريد بها إنجاز الموقع؟",
      help: "كلما أردت الموقع أسرع، زادت التكلفة لأن العمل يتطلب فريقاً أكبر وساعات إضافية. الحد الأدنى للتسليم هو أسبوع واحد.",
      options: [
        "عادي — بدون تكلفة إضافية",
        "سريع — تسليم أقصر (+25%)",
        "مستعجل — أقصى سرعة ممكنة (+50%)",
      ],
    },
  },
  fr: {
    backend: {
      category: "Technique",
      question: "Souhaitez-vous un back-end développé sur mesure ou une plateforme prête à l'emploi ?",
      help: "Le « back-end » est la partie invisible du site qui stocke vos données (commandes, comptes, produits). Une plateforme prête à l'emploi est plus rapide et moins chère et convient à la plupart des projets ; un back-end sur mesure offre un contrôle total et plus de flexibilité, mais coûte plus cher et prend plus de temps. En cas de doute, choisissez la plateforme prête à l'emploi.",
      options: [
        "Plateforme prête à l'emploi — plus rapide et moins chère (recommandé)",
        "Back-end développé sur mesure — contrôle total",
      ],
    },
    speed: {
      category: "Délai",
      question: "À quelle vitesse voulez-vous votre site ?",
      help: "Plus la livraison est rapide, plus le prix augmente : cela demande une équipe plus large et des heures supplémentaires. Le délai minimum est d'une semaine.",
      options: [
        "Standard — sans supplément",
        "Rapide — délai réduit (+25 %)",
        "Urgent — vitesse maximale (+50 %)",
      ],
    },
  },
  en: {
    backend: {
      category: "Technical",
      question: "Do you need a custom coded backend, or a ready-made platform?",
      help: "The 'backend' is the invisible part of a website that stores your data (orders, accounts, products). A ready-made platform is faster and cheaper and fits most projects; a custom coded backend gives full control and more flexibility but costs more and takes longer. If you are unsure, pick the ready-made platform.",
      options: [
        "Ready-made platform — faster and cheaper (recommended)",
        "Custom coded backend — full control and flexibility",
      ],
    },
    speed: {
      category: "Delivery speed",
      question: "How fast do you want your website delivered?",
      help: "The faster you want it, the more it costs — rush work needs a bigger team and extra hours. The minimum delivery time is one week.",
      options: [
        "Standard — no extra cost",
        "Fast — shorter timeline (+25%)",
        "Urgent — maximum speed (+50%)",
      ],
    },
  },
};

export function constantQuestions(lang: Lang): ConstQuestion[] {
  const pack = PACKS[lang] ?? PACKS.en;
  return [
    {
      id: 1,
      type: "radio",
      weight: 3,
      constKey: "backend",
      category: pack.backend.category,
      question: pack.backend.question,
      help: pack.backend.help,
      options: pack.backend.options,
      optionKeys: ["managed", "custom"],
    },
    {
      id: 2,
      type: "radio",
      weight: 2,
      constKey: "speed",
      category: pack.speed.category,
      question: pack.speed.question,
      help: pack.speed.help,
      options: pack.speed.options,
      optionKeys: ["standard", "fast", "urgent"],
    },
  ];
}
