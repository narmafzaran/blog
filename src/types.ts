export interface CarSpecs {
  engine: string;       // موتور
  power: string;        // قدرت (اسب بخار)
  torque: string;       // گشتاور (نیوتن متر)
  topSpeed: string;     // حداکثر سرعت
  acceleration: string; // شتاب ۰ تا ۱۰۰
  consumption: string;  // مصرف سوخت ترکیبی
  price: string;        // قیمت تقریبی
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  category: string;
  categoryLabel: string;
  shortDescription: string;
  content: string;
  imageUrl: string;
  author: string;
  views: number;
  likes: number;
  createdAt: number; // timestamp
  specs?: CarSpecs;
}

export interface Comment {
  id: string;
  articleId: string;
  name: string;
  email: string;
  content: string;
  approved: boolean;
  createdAt: number;
}

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  aboutText: string;
  contactEmail: string;
  adminPasscode: string;
  customCategories?: { id: string; label: string; iconName?: string }[];
}
