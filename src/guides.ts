import type { Category } from "./site";

export type PillarGuide = {
  slug: string;
  title: string;
  description: string;
  categorySlug: Category["slug"];
  keywords: string[];
  faqs: { question: string; answer: string }[];
};

export const pillarGuides: PillarGuide[] = [
  {
    slug: "samsung-galaxy",
    title: "دليل سامسونج وجالكسي",
    description:
      "كل ما تحتاج معرفته عن هواتف سامسونج: سلسلة Galaxy S و A و Z، تحديثات One UI، الأسعار في السعودية والخليج، والمقارنات.",
    categorySlug: "phones",
    keywords: ["سامسونج", "galaxy", "جالكسي", "one ui", "سامسونج جالكسي"],
    faqs: [
      {
        question: "متى ينزل تحديث One UI لهاتفي؟",
        answer:
          "تُعلن سامسونج جداول التحديث على موقعها الرسمي. نغطي كل إصدار جديد مع قائمة الهواتف المدعومة فور الإعلان."
      },
      {
        question: "ما الفرق بين Galaxy S و Galaxy A؟",
        answer:
          "سلسلة S للفئة الراقية (معالجات أقوى، كاميرات أفضل)، وسلسلة A للفئة الاقتصادية والمتوسطة بأسعار أقل."
      }
    ]
  },
  {
    slug: "iphone-ios",
    title: "دليل آيفون و iOS",
    description:
      "أخبار آبل، تحديثات iOS و iPadOS، أسعار الآيفون في السعودية ومصر، الشروحات، والمقارنات مع أندرويد.",
    categorySlug: "iphone",
    keywords: ["آيفون", "ايفون", "iphone", "ios", "آبل", "apple"],
    faqs: [
      {
        question: "كيف أحدّث iOS على الآيفون؟",
        answer: "الإعدادات → عام → تحديث البرنامج. تأكد من شحن البطارية واتصال Wi‑Fi مستقر قبل التحديث."
      },
      {
        question: "هل يستحق ترقية الآيفون كل سنة؟",
        answer:
          "للمستخدم العادي: كل 3–4 سنوات كافية. راجع مقارناتنا لمعرفة إن كان الفرق بين الجيل الحالي والسابق يبرر التكلفة."
      }
    ]
  },
  {
    slug: "whatsapp-apps",
    title: "دليل واتساب والتطبيقات",
    description:
      "ميزات واتساب وتيليجرام وجيميل وجوجل بلاي، الشروحات العربية، وحلول المشاكل الشائعة في التطبيقات.",
    categorySlug: "apps",
    keywords: ["واتساب", "whatsapp", "تيليجرام", "telegram", "جيميل", "تطبيق"],
    faqs: [
      {
        question: "لماذا لا تصل رسائل واتساب؟",
        answer:
          "تحقق من الاتصال بالإنترنت، وصلاحيات التطبيق، وتاريخ التطبيق. راجع شروحاتنا لحلول مفصّلة لكل إصدار."
      },
      {
        question: "كيف أفعّل التحقق بخطوتين في واتساب؟",
        answer: "الإعدادات → الحساب → التحقق بخطوتين → تفعيل وإدخال رمز PIN."
      }
    ]
  },
  {
    slug: "ai-tools",
    title: "دليل أدوات الذكاء الاصطناعي",
    description:
      "ChatGPT وجيميني وكلود وأدوات AI العربية: الشروحات، المقارنات، ونصائح الاستخدام الآمن للمحتوى والعمل.",
    categorySlug: "guides",
    keywords: ["chatgpt", "جيميني", "gemini", "ذكاء اصطناعي", "ai", "claude"],
    faqs: [
      {
        question: "ما أفضل أداة ذكاء اصطناعي بالعربية؟",
        answer:
          "جيميني و ChatGPT يدعمان العربية جيدًا. للبحث المباشر: Perplexity. نراجع كل أداة بشروحات عربية مستقلة."
      },
      {
        question: "هل محتوى AI آمن للنشر؟",
        answer:
          "راجعه دائمًا وعدّله. لا تنشر معلومات تقنية أو طبية دون التحقق من مصادر موثوقة."
      }
    ]
  }
];

export function getPillarBySlug(slug: string) {
  return pillarGuides.find((g) => g.slug === slug);
}
