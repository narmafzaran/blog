import { initializeApp } from 'firebase/app';
import {
  initializeFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  increment,
  limit
} from 'firebase/firestore';
import { Article, Comment, SiteSettings } from '../types';
import firebaseConfig from '@/firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);

// Collection references
const ARTICLES_COLLECTION = 'articles';
const COMMENTS_COLLECTION = 'comments';
const SETTINGS_COLLECTION = 'settings';

// Default mock articles to seed the database if empty
const DEFAULT_ARTICLES: Omit<Article, 'id'>[] = [
  {
    title: 'بررسی پورشه ۹۱۱ جی‌تی۳ آر‌اس (911 GT3 RS)؛ هیولای پیست در لباس خیابان',
    slug: 'porsche-911-gt3-rs-review',
    category: 'review',
    categoryLabel: 'بررسی خودرو',
    shortDescription: 'پورشه با معرفی نسل جدید ۹۱۱ جی‌تی۳ آر‌اس بار دیگر مرزهای مهندسی آیرودینامیک را در خودروهای جاده‌ای جابجا کرد. در این مقاله به بررسی عمیق مشخصات و عملکرد این شاهکار مهندسی می‌پردازیم.',
    imageUrl: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=1200',
    content: `پورشه ۹۱۱ جی‌تی۳ آر‌اس (911 GT3 RS) همواره به عنوان اوج مهندسی خودروهای اسپرت تنفس طبیعی شناخته می‌شود. اما نسل جدید ۹۹۲ این خودرو، چیزی فراتر از یک ارتقای ساده است؛ این یک خودروی مسابقه‌ای تمام عیار است که مجوز تردد در خیابان را دریافت کرده است.

### آیرودینامیک انقلابی
اولین چیزی که در مواجهه با جی‌تی۳ آر‌اس جلب توجه می‌کند، بال عقب غول‌آسای آن است. این بال مجهز به سیستم DRS (کاهش پسار) مشابه خودروهای فرمول یک است. برای اولین بار در یک خودروی تولیدی پورشه، رادیاتور مرکزی در جلوی خودرو نصب شده (جایی که معمولاً صندوق بار بود) تا فضا برای باله‌های فعال جلو آزاد شود. این تغییرات باعث شده تا خودرو در سرعت ۲۸۵ کیلومتر بر ساعت، نیروی رو به پایین (Downforce) شگفت‌انگیز ۸۶۰ کیلوگرم تولید کند؛ یعنی سه برابر بیشتر از جی‌تی۳ استاندارد!

### نیروگاه تنفس طبیعی
در قلب این هیولا، یک موتور ۴ لیتری ۶ سیلندر تخت تنفس طبیعی قرار دارد که قادر است ۵۱۸ اسب بخار قدرت در دور موتور خیره‌کننده ۹۰۰۰ دور بر دقیقه تولید کند. نیروی موتور از طریق گیربکس ۷ سرعته دوکلاچه PDK به چرخ‌های عقب منتقل می‌شود. شتاب صفر تا ۱۰۰ کیلومتر بر ساعت این خودرو تنها ۳.۲ ثانیه طول می‌کشد و حداکثر سرعت آن ۲۹۶ کیلومتر بر ساعت است.

### سواری و فرمان‌پذیری
سیستم تعلیق این خودرو به طور مستقیم از خودروهای مسابقه‌ای الهام گرفته شده است. راننده می‌تواند از روی فرمان، میزان بازی کمک‌فنرها، کنترل کشش و دیفرانسیل لغزش محدود را در چندین سطح مختلف تنظیم کند. جی‌تی۳ آر‌اس جاده‌ها را با چسبندگی بی‌نظیری می‌شکافد و فرمان‌پذیری آن به قدری دقیق است که گویی خودرو افکار شما را می‌خواند.

### جمع‌بندی
پورشه ۹۱۱ جی‌تی۳ آر‌اس ارزان نیست، اما برای کسانی که به دنبال خالص‌ترین و سریع‌ترین تجربه رانندگی در پیست هستند، هیچ گزینه‌ای بهتر از این اثر هنری متحرک وجود ندارد.`,
    author: 'پژمان احمدی',
    views: 1240,
    likes: 85,
    createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    specs: {
      engine: '۴.۰ لیتری ۶ سیلندر تخت تنفس طبیعی',
      power: '۵۱۸ اسب بخار',
      torque: '۴۶۵ نیوتن متر',
      topSpeed: '۲۹۶ کیلومتر بر ساعت',
      acceleration: '۳.۲ ثانیه',
      consumption: '۱۳.۴ لیتر در ۱۰۰ کیلومتر',
      price: '۲۲۳,۰۰۰ دلار'
    }
  },
  {
    title: 'انقلاب تسلا در صنعت خودروسازی؛ بررسی دقیق باتری‌های انقلابی ۴۶۸۰',
    slug: 'tesla-4680-battery-technology',
    category: 'achievement',
    categoryLabel: 'دستاوردها و تکنولوژی',
    shortDescription: 'تسلا با توسعه نسل جدید سلول‌های باتری ۴۶۸۰، گام بزرگی در جهت کاهش هزینه‌ها و افزایش برد خودروهای الکتریکی برداشته است. این تکنولوژی چگونه کار می‌کند؟',
    imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=1200',
    content: `تسلا سال‌هاست که به عنوان رهبر بازار خودروهای الکتریکی شناخته می‌شود. با این حال، بزرگ‌ترین چالش خودروهای برقی همواره موضوع باتری، هزینه تولید و مسافت قابل پیمایش بوده است. معرفی باتری‌های انقلابی سلول ۴۶۸۰ پاسخی جامع به این چالش‌ها است.

### ساختار بدون لبه (Tabless) چیست؟
سلول‌های سنتی باتری از برگه‌های فلزی کوچکی به نام تب (Tab) برای اتصال الکترودها به مدار بیرونی استفاده می‌کنند. این طراحی باعث افزایش مقاومت الکتریکی و تولید حرارت زیاد می‌شود. تسلا در سلول‌های ۴۶۸۰ از طراحی انقلابی Tabless استفاده کرده است. در این فناوری، لبه‌های فویل‌های الکترود به صورت مارپیچ روی هم قرار می‌گیرند که باعث کاهش چشمگیر مسافت طی شده توسط جریان الکتریکی و در نتیجه کاهش دما و افزایش دوام باتری می‌شود.

### مزایای کلیدی باتری ۴۶۸۰
۱. **افزایش ۵ برابری ظرفیت انرژی**: به دلیل ابعاد بزرگ‌تر (قطر ۴۶ میلی‌متر و ارتفاع ۸۰ میلی‌متر)، انرژی بسیار بیشتری ذخیره می‌شود.
۲. **افزایش ۱۶ درابری برد پیمایشی**: بازدهی ساختاری و الکتریکی بالا، برد کل خودرو را به شکل چشمگیری افزایش می‌دهد.
۳. **کاهش ۵۶ درصدی هزینه تولید در هر کیلووات ساعت**: این باتری‌ها ارزان‌تر ساخته می‌شوند و فرآیند تولید ساده‌تری دارند.
۴. **باتری به عنوان بخش ساختاری خودرو (Structural Battery Pack)**: تسلا این سلول‌ها را مستقیماً در شاسی خودرو ادغام می‌کند که وزن خودرو را کاهش داده و ایمنی تصادفات را بالا می‌برد.

### آینده بازار با تکنولوژی جدید
باتری ۴۶۸۰ در حال حاضر در سایبرتراک و برخی مدل‌های وای (Model Y) به کار گرفته شده است. این دستاورد بزرگ، راه را برای تولید خودروهای الکتریکی ارزان‌قیمت‌تر (مثلاً پروژه ۲۵ هزار دلاری تسلا) باز خواهد کرد و رقبای سنتی را بیش از پیش به چالش خواهد کشید.`,
    author: 'سارا رضایی',
    views: 950,
    likes: 62,
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000
  },
  {
    title: 'شیائومی SU7 اولترا با شتاب باورنکردنی معرفی شد؛ تهدیدی جدی برای پورشه و تسلا',
    slug: 'xiaomi-su7-ultra-revealed',
    category: 'electric',
    categoryLabel: 'خودروهای برقی',
    shortDescription: 'غول فناوری چینی، شیائومی، نسخه فوق اسپرت SU7 Ultra را معرفی کرد؛ ابرخودرویی الکتریکی با مشخصات فنی فراتر از هایپرکارهای چند میلیون دلاری.',
    imageUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=1200',
    content: `پس از موفقیت شگفت‌انگیز اولین خودروی برقی شیائومی یعنی سدان SU7، این شرکت اکنون با معرفی نسخه وحشی و پرچمدار **SU7 Ultra** مرزهای جدیدی را ثبت کرده است. این خودرو نه تنها یک سدان چهاردر خانوادگی است، بلکه یک ابرخودروی برقی تمام عیار است که برای پیست‌های مسابقه بهینه‌سازی شده است.

### نیروگاه سه‌موتوره وحشتناک
شیائومی SU7 اولترا مجهز به سه موتور الکتریکی قدرتمند است؛ دو موتور انقلابی V8s شیائومی و یک موتور V6s. این پکیج در مجموع **۱۵۴۸ اسب بخار قدرت** تولید می‌کند! برای مقایسه، این رقم حتی از بوگاتی شیرون بنزینی هم بیشتر است.

عملکرد شتاب‌گیری این سدان برقی ذهن را مخدوش می‌کند:
* **شتاب ۰ تا ۱۰۰ کیلومتر بر ساعت**: فقط ۱.۹۷ ثانیه!
* **شتاب ۰ تا ۲۰۰ کیلومتر بر ساعت**: ۵.۹۶ ثانیه!
* **حداکثر سرعت**: فراتر از ۳۵۰ کیلومتر بر ساعت!

### باتری و سیستم شارژ فوق سریع
برای تامین نیروی این موتورهای پرمصرف، شیائومی با همکاری شرکت بزرگ CATL از باتری جدید Qilin 2.0 استفاده کرده است. این باتری حتی در زمان دشارژ بالا (کم بودن شارژ) نیز می‌تواند خروجی قدرت بالایی را حفظ کند. سیستم شارژ سریع این خودرو اجازه می‌دهد تا در عرض کمتر از ۱۲ دقیقه، شارژ باتری از ۱۰ به ۸۰ درصد برسد.

### بدنه فیبرکربنی و آیرودینامیک پیست
برای کاهش وزن، بخش‌های زیادی از بدنه این خودرو از جنس فیبرکربن سبک ساخته شده است. کیت آیرودینامیک ویژه شامل بال عقب بزرگ و دیفیوزرهای تهاجمی، نیروی رو به پایین ۲۱۴۵ کیلوگرمی تولید می‌کند که چسبندگی بی‌نظیری را در پیچ‌های تند پیست نوربرگ‌رینگ آلمان برای این خودرو فراهم می‌کند.

### آیا شیائومی خودروساز واقعی است؟
با ثبت زمان دور پیست شگفت‌انگیز در نوربرگ‌رینگ، شیائومی ثابت کرد که ورودش به صنعت خودرو یک حرکت نمایشی نبوده، بلکه تهدیدی جدی برای خودروسازان باسابقه جهان مثل پورشه و تسلا است.`,
    author: 'کیوان خسروی',
    views: 1820,
    likes: 120,
    createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
    specs: {
      engine: '۳ موتور الکتریکی (دو موتور V8s و یک V6s)',
      power: '۱۵۴۸ اسب بخار',
      torque: '۱۷۷۰ نیوتن متر',
      topSpeed: '۳۵۰ کیلومتر بر ساعت',
      acceleration: '۱.۹۷ ثانیه',
      consumption: '۲۰.۲ کیلووات ساعت در ۱۰۰ کیلومتر',
      price: '۱۱۴,۰۰۰ دلار'
    }
  },
  {
    title: 'نگاهی به آینده با کانسپت جدید آئودی اسکای‌اسفر (Audi Skysphere)؛ خودروی تبدیل‌شونده با طول متغیر',
    slug: 'audi-skysphere-concept-future',
    category: 'news',
    categoryLabel: 'اخبار خودرو',
    shortDescription: 'کانسپت انقلابی آئودی اسکای‌اسفر با قابلیت شگفت‌انگیز تغییر فاصله بین دو محور چرخ‌ها، چشم‌انداز بی‌نظیری از آینده خودروهای لوکس و خودران را ارائه می‌دهد.',
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200',
    content: `آئودی با معرفی کانسپت اسکای‌اسفر (Audi Skysphere)، ایده‌ای کاملاً جدید از خودروهای لوکس آینده را به نمایش گذاشته است. این کوپه برقی دو نفره، تعریفی جدید از آزادی حرکت و سواری لوکس ارائه می‌دهد که در آن خودرو نه فقط یک وسیله نقلیه، بلکه یک فضای تجربه دیجیتال است.

### تغییر طول جادویی بدنه
بزرگ‌ترین نوآوری در آئودی اسکای‌اسفر، قابلیت تغییر فیزیکی طول خودرو است! این خودرو دارای دو حالت رانندگی مجزا است:
۱. **حالت اسپرت (Sports)**: در این حالت، طول خودرو ۴.۹۴ متر است. راننده فرمان و پدال‌ها را در دست دارد و خودرو واکنش‌های تیز و پویایی از خود نشان می‌دهد.
۲. **حالت گرند تورینگ (Grand Touring)**: با فعال شدن این حالت، بدنه خودرو ۲۵ سانتی‌متر افزایش یافته و به ۵.۱۹ متر می‌رسد! فرمان و پدال‌ها کاملاً در داشبورد پنهان می‌شوند و خودرو وارد حالت خودران سطح ۴ می‌شود. سرنشینان در این حالت می‌توانند از فضای پای بی‌نظیر و سرگرمی‌های چندرسانه‌ای لذت ببرند.

### پیشرانه برقی پیشرفته
اسکای‌اسفر از یک موتور الکتریکی روی محور عقب استفاده می‌کند که ۶۲۴ اسب بخار قدرت و ۷۵۰ نیوتن متر گشتاور تولید می‌کند. شتاب صفر تا ۱۰۰ کیلومتر بر ساعت این خودروی لوکس تنها ۴ ثانیه است. باتری ۸۰ کیلووات ساعتی آن برد پیمایشی معادل ۵۰۰ کیلومتر (بر اساس استاندارد WLTP) ارائه می‌دهد.

### طراحی خیره‌کننده و کابین دیجیتال
جلوپنجره مشبک دیجیتالی آئودی در جلو با چراغ‌های LED داینامیک، پیام‌های تصویری مختلفی را نمایش می‌دهد. در داخل کابین، هیچ دکمه فیزیکی دیده نمی‌شود و یک صفحه نمایش لمسی غول‌پیکر با عرض ۱۴۱ سانتی‌متر تمام داشبورد را پوشانده است که دسترسی به اینترنت، فیلم، بازی و شبکه‌های اجتماعی را فراهم می‌کند.

این پروژه نمایشی شگفت‌انگیز از دهه آینده صنعت خودروسازی است؛ زمانی که رانندگی تفریحی داینامیک و استراحت مطلق در حین حرکت در یک خودرو با هم تلفیق می‌شوند.`,
    author: 'علیرضا راد',
    views: 1100,
    likes: 54,
    createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000
  }
];

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'مجله خودرویی سرعت',
  siteDescription: 'آخرین اخبار، دستاوردها و تکنولوژی‌های روز دنیای خودرو',
  aboutText: 'سرعت یک مجله تخصصی خودرویی مستقل است که با هدف ارتقای آگاهی مخاطبان فارسی‌زبان از پیشرفت‌های صنعت خودروسازی جهان، اخبار روز، بررسی‌های فنی عمیق و مقالات دستاوردهای تکنولوژی خودرو را ارائه می‌دهد.',
  contactEmail: 'info@speedmagazine.ir',
  adminPasscode: '123456' // Simple default admin code
};

// Seed the database if it is empty
export async function seedDatabaseIfEmpty() {
  try {
    const q = query(collection(db, ARTICLES_COLLECTION), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      console.log('Seeding default articles to Firestore...');
      for (const article of DEFAULT_ARTICLES) {
        await addDoc(collection(db, ARTICLES_COLLECTION), article);
      }
      console.log('Successfully seeded articles!');
    }

    // Seed settings if empty
    const settingsRef = doc(db, SETTINGS_COLLECTION, 'global');
    const settingsSnap = await getDoc(settingsRef);
    if (!settingsSnap.exists()) {
      console.log('Seeding default settings to Firestore...');
      await setDoc(settingsRef, DEFAULT_SETTINGS);
      console.log('Successfully seeded settings!');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Get all articles
export async function getArticles(): Promise<Article[]> {
  try {
    const q = query(collection(db, ARTICLES_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    })) as Article[];
  } catch (error) {
    console.error('Error getting articles from Firestore:', error);
    // Fallback to localStorage
    const local = localStorage.getItem('local_articles');
    if (local) {
      return JSON.parse(local);
    }
    return DEFAULT_ARTICLES.map((a, i) => ({ id: `default-${i}`, ...a })) as Article[];
  }
}

// Get a single article by slug
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const q = query(collection(db, ARTICLES_COLLECTION), where('slug', '==', slug), limit(1));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      return { id: docSnap.id, ...docSnap.data() } as Article;
    }
    return null;
  } catch (error) {
    console.error('Error getting article by slug:', error);
    return null;
  }
}

// Increment view count
export async function incrementArticleViews(articleId: string) {
  try {
    const articleRef = doc(db, ARTICLES_COLLECTION, articleId);
    await updateDoc(articleRef, {
      views: increment(1)
    });
  } catch (error) {
    console.error('Error incrementing views:', error);
  }
}

// Increment likes count
export async function incrementArticleLikes(articleId: string) {
  try {
    const articleRef = doc(db, ARTICLES_COLLECTION, articleId);
    await updateDoc(articleRef, {
      likes: increment(1)
    });
  } catch (error) {
    console.error('Error incrementing likes:', error);
  }
}

// Helper to recursively remove undefined properties (which Firestore does not allow)
function removeUndefined<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(removeUndefined) as unknown as T;
  }
  const cleaned: any = {};
  for (const key of Object.keys(obj)) {
    const val = (obj as any)[key];
    if (val !== undefined) {
      cleaned[key] = removeUndefined(val);
    }
  }
  return cleaned as T;
}

// Save or Update Article (Admin)
export async function saveArticle(article: Partial<Article>): Promise<string> {
  try {
    if (article.id) {
      const articleRef = doc(db, ARTICLES_COLLECTION, article.id);
      const updatedData = { ...article };
      delete updatedData.id;
      await setDoc(articleRef, removeUndefined(updatedData), { merge: true });
      return article.id;
    } else {
      const newArticle = {
        views: 0,
        likes: 0,
        createdAt: Date.now(),
        ...article
      };
      const docRef = await addDoc(collection(db, ARTICLES_COLLECTION), removeUndefined(newArticle));
      return docRef.id;
    }
  } catch (error) {
    console.error('Error saving article:', error);
    // Local storage fallback
    const local = localStorage.getItem('local_articles');
    const articles: Article[] = local ? JSON.parse(local) : DEFAULT_ARTICLES.map((a, i) => ({ id: `default-${i}`, ...a }));
    if (article.id) {
      const idx = articles.findIndex(a => a.id === article.id);
      if (idx !== -1) {
        articles[idx] = { ...articles[idx], ...article } as Article;
      }
    } else {
      const newArt = {
        id: `local-${Date.now()}`,
        views: 0,
        likes: 0,
        createdAt: Date.now(),
        ...article
      } as Article;
      articles.push(newArt);
    }
    localStorage.setItem('local_articles', JSON.stringify(articles));
    return article.id || `local-${Date.now()}`;
  }
}

// Delete Article (Admin)
export async function deleteArticle(articleId: string) {
  try {
    const articleRef = doc(db, ARTICLES_COLLECTION, articleId);
    await deleteDoc(articleRef);
  } catch (error) {
    console.error('Error deleting article:', error);
    const local = localStorage.getItem('local_articles');
    if (local) {
      const articles: Article[] = JSON.parse(local);
      const filtered = articles.filter(a => a.id !== articleId);
      localStorage.setItem('local_articles', JSON.stringify(filtered));
    }
  }
}

// Get comments for an article
export async function getComments(articleId: string): Promise<Comment[]> {
  try {
    const q = query(
      collection(db, COMMENTS_COLLECTION),
      where('articleId', '==', articleId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    })) as Comment[];
  } catch (error) {
    console.error('Error getting comments:', error);
    const local = localStorage.getItem(`local_comments_${articleId}`);
    return local ? JSON.parse(local) : [];
  }
}

// Get all comments (for admin moderation)
export async function getAllComments(): Promise<Comment[]> {
  try {
    const q = query(collection(db, COMMENTS_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    })) as Comment[];
  } catch (error) {
    console.error('Error getting all comments:', error);
    return [];
  }
}

// Add comment
export async function addComment(comment: Omit<Comment, 'id' | 'approved' | 'createdAt'>): Promise<string> {
  try {
    const newComment = {
      ...comment,
      approved: true, // Auto approved for simpler user experience, but moderate-able
      createdAt: Date.now()
    };
    const docRef = await addDoc(collection(db, COMMENTS_COLLECTION), removeUndefined(newComment));
    return docRef.id;
  } catch (error) {
    console.error('Error adding comment:', error);
    const localKey = `local_comments_${comment.articleId}`;
    const local = localStorage.getItem(localKey);
    const comments: Comment[] = local ? JSON.parse(local) : [];
    const newComm = {
      id: `local-${Date.now()}`,
      approved: true,
      createdAt: Date.now(),
      ...comment
    } as Comment;
    comments.push(newComm);
    localStorage.setItem(localKey, JSON.stringify(comments));
    return newComm.id;
  }
}

// Delete comment
export async function deleteComment(commentId: string) {
  try {
    const commentRef = doc(db, COMMENTS_COLLECTION, commentId);
    await deleteDoc(commentRef);
  } catch (error) {
    console.error('Error deleting comment:', error);
  }
}

// Get site settings
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, 'global');
    const snap = await getDoc(settingsRef);
    if (snap.exists()) {
      return snap.data() as SiteSettings;
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error getting site settings:', error);
    const local = localStorage.getItem('local_settings');
    return local ? JSON.parse(local) : DEFAULT_SETTINGS;
  }
}

// Save site settings
export async function saveSiteSettings(settings: SiteSettings) {
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, 'global');
    await setDoc(settingsRef, removeUndefined(settings), { merge: true });
  } catch (error) {
    console.error('Error saving site settings:', error);
    localStorage.setItem('local_settings', JSON.stringify(settings));
  }
}
