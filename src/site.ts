export const siteName = "عرب تك";
export const siteNameEn = "Arab Tech Trends";
export const siteTagline = "التقنية بين يديك";
export const siteUrl = "https://www.arabtechtrends.com";
export const siteDescription =
  "شروحات تقنية عربية دائمة الفائدة في التصميم، المحاسبة، الذكاء الاصطناعي، ويندوز، التطبيقات، الألعاب، وصناعة المحتوى — منذ 2012.";
export const defaultOgImage = "/uploads/arabtech-logo.png";
export const postsPerPage = 24;

export type Category = {
  slug: string;
  label: string;
  keywords: string[];
  wpCategories?: string[];
};

export const categories: Category[] = [
  {
    slug: "photoshop",
    label: "فوتوشوب وتصميم",
    keywords: ["فوتوشوب", "photoshop", "تصميم", "صورة", "صور", "تحرير", "ألوان", "فرش", "طبقات", "layer", "brush", "filter"],
    wpCategories: ["دروس تقنية ومقالات"]
  },
  {
    slug: "accounting-software",
    label: "محاسبة وبرامج",
    keywords: ["محاسبة", "فاتورة", "فواتير", "invoice", "invoices", "quickbooks", "كويك", "بوكس", "الأمين", "المنارة", "odoo", "wafeq", "excel", "pdf"],
    wpCategories: ["دروس تقنية ومقالات", "برامج windows"]
  },
  {
    slug: "youtube-content",
    label: "يوتيوب وصناعة المحتوى",
    keywords: ["يوتيوب", "youtube", "فيديو", "قناة", "مشترك", "shorts", "مونتاج", "تسجيل", "صوت", "ضوضاء", "محتوى"],
    wpCategories: ["دروس تقنية ومقالات"]
  },
  {
    slug: "ai-tools",
    label: "ذكاء اصطناعي وأدوات",
    keywords: ["ذكاء اصطناعي", "بالذكاء", "chatgpt", "gpt", "جيميني", "gemini", "ai", "xai", "grok", "مولد", "أداة", "tools"],
    wpCategories: ["دروس تقنية ومقالات"]
  },
  {
    slug: "windows-pc",
    label: "ويندوز وكمبيوتر",
    keywords: ["ويندوز", "windows", "كمبيوتر", "لابتوب", "pc", "معالج", "processor", "intel", "amd", "nvidia", "rtx", "wifi", "راوتر", "هارد", "رام"],
    wpCategories: ["دروس تقنية ومقالات", "برامج windows"]
  },
  {
    slug: "apps-mobile",
    label: "تطبيقات وموبايل",
    keywords: ["تطبيق", "تطبيقات", "android", "أندرويد", "iphone", "آيفون", "ايفون", "ios", "whatsapp", "واتساب", "gmail", "جيميل", "google", "هاتف", "هواتف", "موبايل"],
    wpCategories: ["تطبيقات android", "مراجعات", "دروس تقنية ومقالات"]
  },
  {
    slug: "gaming-hardware",
    label: "ألعاب وهاردوير",
    keywords: ["ألعاب", "لعبة", "gaming", "game", "xbox", "playstation", "steam", "rog", "keyboard", "mouse", "monitor", "معالج", "كرت شاشة", "rtx"],
    wpCategories: ["ألعاب"]
  },
  {
    slug: "business-online",
    label: "ربح وأعمال أونلاين",
    keywords: ["ربح", "الربح", "استثمار", "أعمال", "مشروع", "دخل", "passive", "income", "paypal", "paymob", "metamask", "etsy", "بطاقة", "بنك", "ضريبة", "vat", "قيمة مضافة"],
    wpCategories: ["الربح من الأنترنت", "دروس تقنية ومقالات"]
  },
  {
    slug: "guides",
    label: "كل الشروحات",
    keywords: ["شرح", "شروحات", "كيفية", "طريقة", "دليل", "نصائح", "أفضل", "مقارنة", "خطوة", "كورس"],
    wpCategories: ["دروس تقنية ومقالات"]
  }
];

export const navCategories = categories.filter((category) => category.slug !== "guides");

/** @deprecated Use categories instead */
export const siteSections = categories.map((c) => c.label);

export const socialLinks = [
  { label: "Facebook", href: "https://www.facebook.com/profile.php?id=61560338201303" },
  { label: "Pinterest", href: "https://www.pinterest.com/arabtechtrends" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/arabtechtrends" },
  { label: "Tumblr", href: "https://www.tumblr.com/blog/arabtechtrends" },
  { label: "Instagram", href: "https://www.instagram.com/arabtechtrends_official/" },
  { label: "YouTube", href: "https://www.youtube.com/@arabtechtrends" },
  { label: "قارئ الفواتير", href: "https://www.youtube.com/channel/UC_ZB9oGAXykxhe9ZzTKBkag" },
  { label: "elnabarawi", href: "https://www.youtube.com/@elnabarawi" },
  { label: "RSS", href: "/feed.xml" }
];

/** Optional — set when Telegram channel is live */
export const telegramChannelUrl: string | undefined = undefined;

export const footerAbout =
  "تم إطلاق الموقع في عام 2012 بهدف تقديم محتوى تقني عربي عملي ودائم الفائدة. نركز الآن على الشروحات والدورات والأدلة التي تساعدك في التصميم، المحاسبة، الذكاء الاصطناعي، ويندوز، التطبيقات، الألعاب، وصناعة المحتوى.";

export function getCategoryBySlug(slug: string) {
  return categories.find((c) => c.slug === slug);
}

export function postMatchesCategory(
  post: { data: { title: string; category: string }; body: string },
  category: Category
) {
  const text = `${post.data.title} ${post.data.category} ${post.body.slice(0, 500)}`.toLowerCase();
  const keywordMatch = category.keywords.some((keyword) => text.includes(keyword.toLowerCase()));
  if (category.slug === "guides") {
    return keywordMatch || category.wpCategories?.includes(post.data.category) === true;
  }
  return keywordMatch;
}

