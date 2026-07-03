export const siteName = "عرب تك";
export const siteNameEn = "Arab Tech Trends";
export const siteTagline = "التقنية بين يديك";
export const siteUrl = "https://www.arabtechtrends.com";
export const siteDescription =
  "أخبار تقنية عربية، مراجعات الهواتف والتطبيقات، شروحات ونصائح للأندرويد والآيفون والكمبيوتر — منذ 2012.";
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
    slug: "news",
    label: "أخبار تقنية",
    keywords: ["أخبار", "news"],
    wpCategories: ["أخبار"]
  },
  {
    slug: "phones",
    label: "هواتف",
    keywords: ["هاتف", "هواتف", "سامسونج", "شاومي", "ريلمي", "هونر", "موتورولا", "فيفو", "اوبو", "ون بلس", "galaxy", "redmi", "poco"],
    wpCategories: ["أخبار"]
  },
  {
    slug: "android",
    label: "أندرويد",
    keywords: ["أندرويد", "android", "one ui", "hyperos", "coloros", "miui"],
    wpCategories: ["تطبيقات android", "أخبار"]
  },
  {
    slug: "iphone",
    label: "آيفون",
    keywords: ["آيفون", "ايفون", "iphone", "آبل", "apple", "ios"],
    wpCategories: ["أخبار", "دروس تقنية ومقالات"]
  },
  {
    slug: "apps",
    label: "تطبيقات",
    keywords: ["تطبيق", "واتساب", "تيليجرام", "جيميل", "telegram", "whatsapp", "google play"],
    wpCategories: ["تطبيقات android", "أخبار"]
  },
  {
    slug: "computer",
    label: "كمبيوتر",
    keywords: ["كمبيوتر", "ويندوز", "windows", "لابتوب", "معالج", "nvidia", "amd", "لابتوب"],
    wpCategories: ["دروس تقنية ومقالات", "أخبار"]
  },
  {
    slug: "games",
    label: "ألعاب",
    keywords: ["لعبة", "ألعاب", "gaming", "game", "بلايستيشن", "xbox", "ستيم"],
    wpCategories: ["ألعاب"]
  },
  {
    slug: "guides",
    label: "شروحات",
    keywords: ["شرح", "شروحات", "كيفية", "طريقة", "دليل", "نصائح"],
    wpCategories: ["دروس تقنية ومقالات"]
  },
  {
    slug: "ai",
    label: "ذكاء اصطناعي",
    keywords: ["ذكاء اصطناعي", "chatgpt", "جيميني", "gemini", "claude", "ai", "شات جي بي تي", "deepseek"],
    wpCategories: ["دروس تقنية ومقالات", "أخبار"]
  }
];

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
  "تم إطلاق الموقع في عام 2012، بهدف تقديم محتوى قيم باللغة العربية. نحن متخصصون في تقديم أفضل وأحدث الأخبار والمراجعات والشروحات والنصائح المتعلقة بالهواتف والكمبيوتر والإنترنت والتطبيقات والألعاب.";

export function getCategoryBySlug(slug: string) {
  return categories.find((c) => c.slug === slug);
}

export function postMatchesCategory(
  post: { data: { title: string; category: string }; body: string },
  category: Category
) {
  const text = `${post.data.title} ${post.data.category} ${post.body.slice(0, 500)}`.toLowerCase();
  if (category.wpCategories?.includes(post.data.category)) {
    if (category.slug === "news" && post.data.category === "أخبار") return true;
    if (category.slug === "games" && post.data.category === "ألعاب") return true;
    if (category.slug === "guides" && post.data.category === "دروس تقنية ومقالات") {
      return category.keywords.some((k) => text.includes(k.toLowerCase()));
    }
  }
  return category.keywords.some((keyword) => text.includes(keyword.toLowerCase()));
}
