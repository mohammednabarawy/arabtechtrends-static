import type { Category } from "./site";

export type PillarGuide = {
  slug: string;
  title: string;
  description: string;
  categorySlug: Category["slug"];
  keywords: string[];
  icon: string;
  faqs: { question: string; answer: string }[];
};

export const pillarGuides: PillarGuide[] = [
  {
    slug: "photoshop-course",
    title: "دليل فوتوشوب والتصميم",
    description:
      "مسار منظم لتعلم فوتوشوب من الأساسيات حتى الطبقات، التحديد، الألوان، الفلاتر، وتجهيز الصور للمحتوى والعمل.",
    categorySlug: "photoshop",
    keywords: ["فوتوشوب", "photoshop", "تصميم", "صور", "طبقات", "فرش"],
    icon: `<svg xmlns="http://www.গামীw3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-palette"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>`,
    faqs: [
      {
        question: "من أين أبدأ تعلم فوتوشوب؟",
        answer:
          "ابدأ بفهم الواجهة، صيغ الملفات، أدوات التحديد، ثم الطبقات والألوان. رتبنا مقالات الدورة لتسير من الأساسيات إلى التطبيقات العملية."
      },
      {
        question: "هل أحتاج خبرة تصميم قبل فوتوشوب؟",
        answer:
          "لا. يكفي أن تتعلم الأدوات تدريجيا وتطبق على صور بسيطة، ثم تنتقل إلى التعديل المتقدم والقوالب والمشاريع الصغيرة."
      }
    ]
  },
  {
    slug: "accounting-software",
    title: "دليل برامج المحاسبة والفواتير",
    description:
      "شروحات QuickBooks والأمين والمنارة وقارئ الفواتير، مع خطوات عملية للتصدير، إدارة الفواتير، وربط البيانات مع Excel و PDF.",
    categorySlug: "accounting-software",
    keywords: ["محاسبة", "فاتورة", "فواتير", "quickbooks", "الأمين", "المنارة", "invoice"],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-calculator"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>`,
    faqs: [
      {
        question: "ما أفضل نقطة بداية لتعلم برامج المحاسبة؟",
        answer:
          "ابدأ بالمفاهيم الأساسية مثل العملاء والموردين والفواتير، ثم طبق على برنامج واحد مثل QuickBooks أو الأمين قبل الانتقال للتكاملات."
      },
      {
        question: "هل يمكن استخراج بيانات الفواتير تلقائيا؟",
        answer:
          "نعم، يمكن استخدام أدوات قراءة الفواتير والباركود لتصدير البيانات إلى Excel أو PDF ثم مزامنتها مع أنظمة محاسبية عند الحاجة."
      }
    ]
  },
  {
    slug: "youtube-content",
    title: "دليل يوتيوب وصناعة المحتوى",
    description:
      "أفكار فيديوهات، تحسين العناوين، التسجيل، تقليل الضوضاء، وزيادة فرص نمو القناة بمحتوى عملي بعيد عن الأخبار المؤقتة.",
    categorySlug: "youtube-content",
    keywords: ["يوتيوب", "youtube", "قناة", "فيديو", "مشترك", "shorts", "تسجيل"],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-youtube"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>`,
    faqs: [
      {
        question: "كيف أختار فكرة فيديو مناسبة؟",
        answer:
          "اختر مشكلة واضحة يبحث عنها الناس، ثم حولها إلى عنوان محدد ووعد عملي. المقالات هنا تساعدك في الأفكار والعناوين والتسجيل."
      },
      {
        question: "هل أحتاج معدات احترافية للبداية؟",
        answer:
          "لا. ابدأ بميكروفون مقبول وإضاءة جيدة، وركز على وضوح الشرح والصوت قبل الاستثمار في معدات أغلى."
      }
    ]
  },
  {
    slug: "ai-tools",
    title: "دليل أدوات الذكاء الاصطناعي",
    description:
      "شروحات عملية لاستخدام ChatGPT وجيميني وأدوات توليد الصور والفيديو في الكتابة، التصميم، الإنتاجية، وصناعة المحتوى.",
    categorySlug: "ai-tools",
    keywords: ["chatgpt", "جيميني", "gemini", "ذكاء اصطناعي", "ai", "grok", "مولد"],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bot"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>`,
    faqs: [
      {
        question: "ما أفضل استخدام عملي للذكاء الاصطناعي؟",
        answer:
          "ابدأ بالمهام المتكررة: تلخيص، كتابة مسودات، توليد أفكار، تحسين صور، أو تجهيز سكربت فيديو، ثم راجع النتائج بنفسك قبل النشر."
      },
      {
        question: "هل يمكن الاعتماد على محتوى AI كما هو؟",
        answer:
          "لا. استخدمه كمساعد، لكن راجع الحقائق وعدل الأسلوب وأضف خبرتك حتى يكون المحتوى مفيدا ومناسبا لموقعك أو عملك."
      }
    ]
  }
];
export function getPillarBySlug(slug: string) {
  return pillarGuides.find((g) => g.slug === slug);
}

