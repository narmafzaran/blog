import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';
import crypto from 'crypto';

// Load environment variables
dotenv.config();

const PORT = 3000;

// Local JSON Database Setup
const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');
const UPLOADS_DIR = path.join(DB_DIR, 'uploads');

// Default mock articles
const DEFAULT_ARTICLES = [
  {
    id: 'art-1',
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
    id: 'art-2',
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
۲. **افزایش ۱۶ برابری برد پیمایشی**: بازدهی ساختاری و الکتریکی بالا، برد کل خودرو را به شکل چشمگیری افزایش می‌دهد.
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
    id: 'art-3',
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
    id: 'art-4',
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

// Default mock settings
const DEFAULT_SETTINGS = {
  siteName: 'مجله خودرویی سرعت‌گیر',
  siteDescription: 'آخرین اخبار، دستاوردها و تکنولوژی‌های روز دنیای خودرو',
  aboutText: 'سرعت‌گیر یک مجله تخصصی خودرویی مستقل است که با هدف ارتقای آگاهی مخاطبان فارسی‌زبان از پیشرفت‌های صنعت خودروسازی جهان، اخبار روز، بررسی‌های فنی عمیق و مقالات دستاوردهای تکنولوژی خودرو را ارائه می‌دهد.',
  contactEmail: 'info@soraatgir.ir',
  adminPasscode: '8d969eee76d0cb34d130826f40b4b632939251db021500271d596b1578b11201', // SHA-256 hash of "123456"
  adminUsername: 'admin',
  adminRouteSlug: 'soraatgir-secure-panel',
  faviconUrl: '',
  logoUrl: '',
  geminiApiKey: '',
  customScripts: ''
};

// Default mock videos
const DEFAULT_VIDEOS = [
  {
    id: 'vid-1',
    title: 'بررسی پورشه ۹۱۱ در جاده‌های کوهستانی آلپ',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-sports-car-driving-on-a-mountain-road-34444-large.mp4',
    description: 'تجربه سواری پرشتاب با پورشه ۹۱۱ در پیچ‌وخم‌های دیدنی جاده‌های کوهستانی آلپ سوئیس به همراه تحلیل کارایی ترمزها.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=600',
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000
  },
  {
    id: 'vid-2',
    title: 'تست شتاب و آیرودینامیک سوپراسپرت در پیست مسابقه',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-fast-sports-car-on-a-race-track-40342-large.mp4',
    description: 'تست تهاجمی ترمزگیری شدید، پایداری پیچ‌ها و تولید نیروی دوان‌فورس روی چرخ‌های کوپه مسابقه‌ای در پیست مرطوب.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=600',
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000
  },
  {
    id: 'vid-3',
    title: 'سیستم‌های دیجیتال و کابین تعاملی خودروهای برقی آینده',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-neon-lights-on-a-car-dashboard-41885-large.mp4',
    description: 'معرفی کنسول‌های لمسی عریض، نورپردازی هوشمند متحرک ال‌ای‌دی و دستیار رانندگی خودران خودروهای نسل جدید.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=600',
    createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000
  }
];

// Ensure database directory and file exist
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(
    DB_FILE,
    JSON.stringify({
      articles: DEFAULT_ARTICLES,
      videos: DEFAULT_VIDEOS,
      comments: [],
      settings: DEFAULT_SETTINGS
    }, null, 2),
    'utf-8'
  );
}

// Read from JSON DB
function readDB() {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const data = JSON.parse(raw);
    let changed = false;
    if (!data.articles || data.articles.length === 0) {
      data.articles = DEFAULT_ARTICLES;
      changed = true;
    }
    if (!data.videos || data.videos.length === 0) {
      data.videos = DEFAULT_VIDEOS;
      changed = true;
    }
    if (!data.comments) {
      data.comments = [];
      changed = true;
    }
    if (!data.settings) {
      data.settings = DEFAULT_SETTINGS;
      changed = true;
    } else {
      // Ensure default values are populated if missing
      if (!data.settings.adminUsername) {
        data.settings.adminUsername = 'admin';
        changed = true;
      }
      if (!data.settings.adminRouteSlug) {
        data.settings.adminRouteSlug = 'soraatgir-secure-panel';
        changed = true;
      }
      // If adminPasscode is not hashed (length !== 64), hash it!
      if (data.settings.adminPasscode && data.settings.adminPasscode.length !== 64) {
        data.settings.adminPasscode = crypto.createHash('sha256').update(data.settings.adminPasscode).digest('hex');
        changed = true;
      }
    }
    if (changed) {
      writeDB(data);
    }
    return data;
  } catch (error) {
    console.error('Error reading JSON DB, using fallback defaults:', error);
    return {
      articles: DEFAULT_ARTICLES,
      videos: DEFAULT_VIDEOS,
      comments: [],
      settings: DEFAULT_SETTINGS
    };
  }
}

// Write to JSON DB
function writeDB(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing to JSON DB:', error);
  }
}

async function startServer() {
  const app = express();

  // Middleware to support larger base64 file payloads and JSON bodies
  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ limit: '100mb', extended: true }));

  // Serve uploaded files statically
  app.use('/uploads', express.static(UPLOADS_DIR));

  // POST Upload Image (Base64)
  app.post('/api/upload', (req, res) => {
    try {
      const { fileName, fileType, base64 } = req.body;
      if (!base64) {
        return res.status(400).json({ error: 'محتوای فایل معتبر نیست.' });
      }

      // Check format and extract pure base64
      let pureBase64 = base64;
      if (base64.includes(';base64,')) {
        pureBase64 = base64.split(';base64,')[1];
      }

      const buffer = Buffer.from(pureBase64, 'base64');
      
      // Determine file extension
      let ext = 'png';
      if (fileType) {
        const match = fileType.match(/\/([a-zA-Z0-9]+)$/);
        if (match) ext = match[1];
      } else if (fileName) {
        const match = fileName.match(/\.([a-zA-Z0-9]+)$/);
        if (match) ext = match[1];
      }
      
      // Sanitize extension
      if (!['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext.toLowerCase())) {
        ext = 'png';
      }

      const uniqueName = `upload-${Date.now()}-${crypto.randomUUID().substring(0, 8)}.${ext}`;
      const targetPath = path.join(UPLOADS_DIR, uniqueName);

      fs.writeFileSync(targetPath, buffer);

      res.json({ url: `/uploads/${uniqueName}` });
    } catch (error: any) {
      console.error('Error in /api/upload:', error);
      res.status(500).json({ error: 'خطایی در بارگذاری تصویر رخ داد.' });
    }
  });

  // Helper to log requests
  function logRequest(message: string) {
    console.log(`[Diagnostic Log] ${message}`);
  }

  // --- LOCAL DATABASE REST ENDPOINTS ---

  // GET Settings
  app.get('/api/settings', (req, res) => {
    const db = readDB();
    res.json(db.settings || DEFAULT_SETTINGS);
  });

  // POST Settings (Save)
  app.post('/api/settings', (req, res) => {
    const { 
      siteName, 
      siteDescription, 
      aboutText, 
      contactEmail, 
      adminPasscode,
      customCategories,
      geminiApiKey,
      faviconUrl,
      logoUrl,
      adminUsername,
      adminRouteSlug,
      customScripts
    } = req.body;
    
    const db = readDB();
    
    // Hash passcode if it's updated and not already hashed (length !== 64)
    let processedPasscode = adminPasscode || db.settings.adminPasscode;
    if (processedPasscode && processedPasscode.length !== 64) {
      processedPasscode = crypto.createHash('sha256').update(processedPasscode).digest('hex');
    }

    db.settings = {
      siteName: siteName || db.settings.siteName,
      siteDescription: siteDescription || db.settings.siteDescription,
      aboutText: aboutText || db.settings.aboutText,
      contactEmail: contactEmail || db.settings.contactEmail,
      adminPasscode: processedPasscode,
      customCategories: customCategories !== undefined ? customCategories : db.settings.customCategories,
      geminiApiKey: geminiApiKey !== undefined ? geminiApiKey : db.settings.geminiApiKey,
      faviconUrl: faviconUrl !== undefined ? faviconUrl : db.settings.faviconUrl,
      logoUrl: logoUrl !== undefined ? logoUrl : db.settings.logoUrl,
      adminUsername: adminUsername || db.settings.adminUsername || 'admin',
      adminRouteSlug: adminRouteSlug || db.settings.adminRouteSlug || 'soraatgir-secure-panel',
      customScripts: customScripts !== undefined ? customScripts : db.settings.customScripts
    };
    writeDB(db);
    res.json(db.settings);
  });

  // --- CAPTCHA & SECURE LOGIN SYSTEM ---
  const captchas = new Map<string, { answer: string; expires: number }>();

  // GET Captcha Challenge
  app.get('/api/admin/captcha', (req, res) => {
    const id = Math.random().toString(36).substring(2, 15);
    const num1 = Math.floor(Math.random() * 9) + 1;
    const num2 = Math.floor(Math.random() * 9) + 1;
    const operators = ['+', '-'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    let answer = 0;
    if (operator === '+') {
      answer = num1 + num2;
    } else {
      answer = num1 - num2;
    }

    const displayChallenge = `${num1} ${operator === '+' ? '+' : '-'} ${num2} = ?`;

    const noiseLines = Array.from({ length: 4 }, () => {
      const x1 = Math.floor(Math.random() * 120);
      const y1 = Math.floor(Math.random() * 40);
      const x2 = Math.floor(Math.random() * 120);
      const y2 = Math.floor(Math.random() * 40);
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#3a6d8c" stroke-width="1.5" opacity="0.3" />`;
    }).join('');

    const svg = `<svg width="120" height="40" viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg" style="background-color: #020617; border-radius: 8px; border: 1px solid #1e293b;">
      <defs>
        <linearGradient id="captchaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ead8b1" />
          <stop offset="100%" stop-color="#3a6d8c" />
        </linearGradient>
      </defs>
      ${noiseLines}
      <text x="50%" y="55%" font-family="monospace, system-ui, sans-serif" font-weight="bold" font-size="18" fill="url(#captchaGrad)" text-anchor="middle" dominant-baseline="middle" letter-spacing="1">
        ${displayChallenge}
      </text>
    </svg>`;

    captchas.set(id, { answer: String(answer), expires: Date.now() + 5 * 60 * 1000 });
    res.json({ id, svg });
  });

  // POST Admin Login (Server-side validation of credentials and CAPTCHA)
  app.post('/api/admin/login', (req, res) => {
    try {
      const { username, password, captchaId, captchaAnswer } = req.body;
      const db = readDB();

      // 1. CAPTCHA verification
      if (!captchaId || !captchaAnswer) {
        return res.status(400).json({ error: 'لطفاً پاسخ عبارت امنیتی را وارد کنید.' });
      }
      
      const captchaRecord = captchas.get(captchaId);
      if (!captchaRecord) {
        return res.status(400).json({ error: 'کد امنیتی نامعتبر یا منقضی شده است. لطفا مجددا تلاش کنید.' });
      }
      
      if (captchaRecord.expires < Date.now()) {
        captchas.delete(captchaId);
        return res.status(400).json({ error: 'کد امنیتی منقضی شده است. لطفا مجددا تلاش کنید.' });
      }
      
      if (captchaRecord.answer.trim() !== captchaAnswer.trim()) {
        return res.status(400).json({ error: 'پاسخ عبارت امنیتی اشتباه است.' });
      }

      // Delete captcha to prevent reuse
      captchas.delete(captchaId);

      // 2. Username verification
      const expectedUsername = db.settings.adminUsername || 'admin';
      if (username !== expectedUsername) {
        return res.status(401).json({ error: 'نام کاربری یا رمز عبور اشتباه است.' });
      }

      // 3. Password verification
      const inputHash = crypto.createHash('sha256').update(password).digest('hex');
      const expectedHash = db.settings.adminPasscode;

      if (inputHash !== expectedHash) {
        return res.status(401).json({ error: 'نام کاربری یا رمز عبور اشتباه است.' });
      }

      res.json({ success: true, message: 'ورود موفقیت‌آمیز بود.' });
    } catch (err: any) {
      console.error('Error in /api/admin/login:', err);
      res.status(500).json({ error: 'خطای سرور در انجام فرآیند ورود.' });
    }
  });

  // GET Articles
  app.get('/api/articles', (req, res) => {
    const db = readDB();
    // Sort descending by createdAt
    const sorted = [...db.articles].sort((a: any, b: any) => b.createdAt - a.createdAt);
    res.json(sorted);
  });

  // GET Single Article (by Slug)
  app.get('/api/articles/slug/:slug', (req, res) => {
    const db = readDB();
    const article = db.articles.find((a: any) => a.slug === req.params.slug);
    if (article) {
      res.json(article);
    } else {
      res.status(404).json({ error: 'مقاله پیدا نشد.' });
    }
  });

  // POST Article (Save / Update)
  app.post('/api/articles', (req, res) => {
    const article = req.body;
    const db = readDB();

    if (article.id) {
      const idx = db.articles.findIndex((a: any) => a.id === article.id);
      if (idx !== -1) {
        db.articles[idx] = {
          ...db.articles[idx],
          ...article,
          id: article.id // ensure ID is preserved
        };
        writeDB(db);
        return res.json({ id: article.id });
      } else {
        return res.status(404).json({ error: 'مقاله پیدا نشد.' });
      }
    } else {
      const newId = 'art-' + crypto.randomUUID().substring(0, 8);
      const newArticle = {
        views: 0,
        likes: 0,
        createdAt: Date.now(),
        ...article,
        id: newId
      };
      db.articles.push(newArticle);
      writeDB(db);
      return res.status(201).json({ id: newId });
    }
  });

  // DELETE Article
  app.delete('/api/articles/:id', (req, res) => {
    const db = readDB();
    const initialLength = db.articles.length;
    db.articles = db.articles.filter((a: any) => a.id !== req.params.id);
    if (db.articles.length < initialLength) {
      writeDB(db);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'مقاله پیدا نشد.' });
    }
  });

  // POST Article Increment Views
  app.post('/api/articles/:id/view', (req, res) => {
    const db = readDB();
    const article = db.articles.find((a: any) => a.id === req.params.id);
    if (article) {
      article.views = (article.views || 0) + 1;
      writeDB(db);
      res.json({ views: article.views });
    } else {
      res.status(404).json({ error: 'مقاله پیدا نشد.' });
    }
  });

  // POST Article Increment Likes
  app.post('/api/articles/:id/like', (req, res) => {
    const db = readDB();
    const article = db.articles.find((a: any) => a.id === req.params.id);
    if (article) {
      article.likes = (article.likes || 0) + 1;
      writeDB(db);
      res.json({ likes: article.likes });
    } else {
      res.status(404).json({ error: 'مقاله پیدا نشد.' });
    }
  });

  // GET Videos
  app.get('/api/videos', (req, res) => {
    const db = readDB();
    const sorted = [...db.videos].sort((a: any, b: any) => b.createdAt - a.createdAt);
    res.json(sorted);
  });

  // POST Video (Save / Update)
  app.post('/api/videos', (req, res) => {
    const video = req.body;
    const db = readDB();

    if (video.id) {
      const idx = db.videos.findIndex((v: any) => v.id === video.id);
      if (idx !== -1) {
        db.videos[idx] = {
          ...db.videos[idx],
          ...video,
          id: video.id
        };
        writeDB(db);
        return res.json({ id: video.id });
      } else {
        return res.status(404).json({ error: 'ویدیو پیدا نشد.' });
      }
    } else {
      const newId = 'vid-' + crypto.randomUUID().substring(0, 8);
      const newVideo = {
        createdAt: Date.now(),
        ...video,
        id: newId
      };
      db.videos.push(newVideo);
      writeDB(db);
      return res.status(201).json({ id: newId });
    }
  });

  // DELETE Video
  app.delete('/api/videos/:id', (req, res) => {
    const db = readDB();
    const initialLength = db.videos.length;
    db.videos = db.videos.filter((v: any) => v.id !== req.params.id);
    if (db.videos.length < initialLength) {
      writeDB(db);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'ویدیو پیدا نشد.' });
    }
  });

  // GET Comments for article
  app.get('/api/comments/article/:articleId', (req, res) => {
    const db = readDB();
    const articleComments = db.comments.filter((c: any) => c.articleId === req.params.articleId && c.approved !== false);
    const sorted = [...articleComments].sort((a: any, b: any) => b.createdAt - a.createdAt);
    res.json(sorted);
  });

  // GET All Comments (Admin)
  app.get('/api/admin/comments', (req, res) => {
    const db = readDB();
    const sorted = [...db.comments].sort((a: any, b: any) => b.createdAt - a.createdAt);
    res.json(sorted);
  });

  // POST Submit Comment
  app.post('/api/comments', (req, res) => {
    const { articleId, authorName, authorEmail, content } = req.body;
    if (!articleId || !authorName || !content) {
      return res.status(400).json({ error: 'فیلدهای اجباری ارسال نشده‌اند.' });
    }
    const db = readDB();
    const newId = 'cmt-' + crypto.randomUUID().substring(0, 8);
    const newComment = {
      id: newId,
      articleId,
      authorName,
      authorEmail: authorEmail || '',
      content,
      approved: true, // Auto approved
      createdAt: Date.now()
    };
    db.comments.push(newComment);
    writeDB(db);
    res.status(201).json({ id: newId });
  });

  // DELETE Comment
  app.delete('/api/comments/:id', (req, res) => {
    const db = readDB();
    const initialLength = db.comments.length;
    db.comments = db.comments.filter((c: any) => c.id !== req.params.id);
    if (db.comments.length < initialLength) {
      writeDB(db);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'دیدگاه پیدا نشد.' });
    }
  });

  // POST Approve Comment
  app.post('/api/comments/:id/approve', (req, res) => {
    const db = readDB();
    const comment = db.comments.find((c: any) => c.id === req.params.id);
    if (comment) {
      comment.approved = true;
      writeDB(db);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'دیدگاه پیدا نشد.' });
    }
  });

  // API: AI Article Generation endpoint
  app.post('/api/generate-article', async (req, res) => {
    const { topic, category } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'موضوع مقاله الزامی است.' });
    }

    const db = readDB();
    const apiKey = db.settings?.geminiApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
      return res.status(500).json({
        error: 'کلید وب سرویس هوش مصنوعی (GEMINI_API_KEY) یافت نشد. لطفاً در پنل تنظیمات آن را وارد یا بررسی کنید.'
      });
    }

    try {
      const ai = new GoogleGenAI({ 
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      const prompt = `یک مقاله کامل و جامع خودرویی به زبان فارسی درباره موضوع زیر بنویس.
موضوع: "${topic}"
دسته بندی احتمالی ترجیحی: "${category || 'news'}" (یکی از گزینه‌های: news [اخبار], achievement [دستاوردها], review [بررسی فنی], electric [خودروهای برقی])

ساختار پاسخ باید به صورت یک شیء JSON با ساختار زیر باشد:
{
  "title": "عنوان جذاب فارسی برای مقاله",
  "category": "یکی از موارد: news, achievement, review, electric",
  "shortDescription": "یک پاراگراف کوتاه خلاصه و جذاب از مقاله برای نمایش در کارت‌ها",
  "content": "متن کامل مقاله با ساختار غنی فارسی شامل عنوان‌های فرعی با هشتگ (###) و پاراگراف‌های جذاب و خوانا بدون استفاده از کدهای اضافه",
  "author": "یک نام نویسنده فرضی فارسی یا نام کارشناس خودرو",
  "specs": { // این بخش اختیاری است و فقط اگر موضوع درباره یک خودروی خاص برای بررسی است مقداردهی شود، در غیر این صورت فیلدها را بنویس یا خالی بگذار
    "engine": "نام یا حجم موتور و آرایش سیلندرها به فارسی",
    "power": "قدرت بر حسب اسب بخار با اعداد فارسی یا انگلیسی مناسب",
    "torque": "گشتاور بر حسب نیوتن متر",
    "topSpeed": "حداکثر سرعت به کیلومتر بر ساعت",
    "acceleration": "شتاب صفر تا صد بر حسب ثانیه",
    "consumption": "مصرف سوخت ترکیبی در ۱۰۰ کیلومتر",
    "price": "قیمت تقریبی به دلار یا ریال"
  }
}

تذکر: پاسخ فقط و فقط باید به صورت JSON معتبر باشد و هیچ متن دیگری قبل یا بعد از آن فرستاده نشود. اعداد فارسی در جاهای مناسب استفاده شوند.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('پاسخ خالی از هوش مصنوعی دریافت شد.');
      }

      const generatedArticle = JSON.parse(responseText);
      return res.json(generatedArticle);
    } catch (error: any) {
      console.error('Error generating article with Gemini:', error);
      return res.status(500).json({
        error: `خطا در تولید محتوا: ${error.message || 'خطای ناشناخته در سرور'}`
      });
    }
  });

  // --- SSR / SEO OPTIMIZED DYNAMIC PAGE RENDERING ---

  // Instantly gets local settings
  async function getSiteSettingsREST() {
    try {
      const db = readDB();
      return db.settings;
    } catch (err) {
      console.error('Local DB Error getting settings:', err);
      return DEFAULT_SETTINGS;
    }
  }

  // Instantly gets local article by slug
  async function getArticleBySlugREST(slug: string) {
    try {
      const db = readDB();
      return db.articles.find((a: any) => a.slug === slug) || null;
    } catch (err) {
      console.error('Local DB Error querying article by slug:', err);
      return null;
    }
  }

  // Instantly gets local article by id
  async function getArticleByIdREST(id: string) {
    try {
      const db = readDB();
      return db.articles.find((a: any) => a.id === id) || null;
    } catch (err) {
      console.error('Local DB Error querying article by ID:', err);
      return null;
    }
  }

  // Helper to generate SEO-friendly HTML with article metadata/content or global settings
  async function getDynamicHtml(reqUrl: string, originalPath: string): Promise<string> {
    logRequest(`getDynamicHtml called for reqUrl: "${reqUrl}", originalPath: "${originalPath}"`);
    let templatePath = '';
    if (process.env.NODE_ENV !== 'production') {
      templatePath = path.join(process.cwd(), 'index.html');
    } else {
      templatePath = path.join(process.cwd(), 'dist', 'index.html');
    }

    let html = await fs.promises.readFile(templatePath, 'utf-8');

    try {
      // 1. Fetch site settings locally (0ms)
      let settings = await getSiteSettingsREST();
      if (!settings) {
        settings = DEFAULT_SETTINGS;
      }

      // Inject custom header scripts if defined
      if (settings && settings.customScripts) {
        html = html.replace('</head>', `${settings.customScripts}\n</head>`);
      }

      // 2. Check if this is an article path
      const articleMatch = originalPath.match(/^\/article\/([^/?#]+)/);
      logRequest(`articleMatch: ${articleMatch ? 'Matched: ' + articleMatch[1] : 'No match'}`);
      if (articleMatch) {
        let slugOrId = decodeURIComponent(articleMatch[1]);
        if (slugOrId.endsWith('/')) {
          slugOrId = slugOrId.slice(0, -1);
        }
        logRequest(`Extracted slugOrId: "${slugOrId}"`);
        let article: any = null;

        // Try fetching via local DB by slug
        article = await getArticleBySlugREST(slugOrId);
        if (article) {
          logRequest(`Found article by slug: "${article.title}"`);
        } else {
          // Try fetching via local DB by doc ID
          article = await getArticleByIdREST(slugOrId);
          if (article) {
            logRequest(`Found article by ID: "${article.title}"`);
          } else {
            logRequest(`Article NOT found by slug or ID: "${slugOrId}"`);
          }
        }

        if (article) {
          // Replace Title
          const pageTitle = `${article.title} | ${settings.siteName || 'مجله سرعت‌گیر'}`;
          html = html.replace(/<title>.*?<\/title>/, `<title>${pageTitle}</title>`);

          // Convert article content to simple HTML paragraphs/headers
          const formattedContent = (article.content || '')
            .split('\n')
            .map((line: string) => {
              const trimmed = line.trim();
              if (trimmed.startsWith('###')) {
                return `<h3>${trimmed.replace('###', '').trim()}</h3>`;
              } else if (trimmed.startsWith('##')) {
                return `<h2>${trimmed.replace('##', '').trim()}</h2>`;
              } else if (trimmed.startsWith('>')) {
                return `<blockquote style="border-right: 4px solid #3b82f6; padding-right: 12px; margin: 12px 0; color: #94a3b8; font-style: italic;">${trimmed.substring(1).trim()}</blockquote>`;
              } else if (trimmed.length > 0) {
                return `<p style="margin-bottom: 12px; line-height: 1.8;">${trimmed}</p>`;
              }
              return '';
            })
            .join('\n');

          // Prepare Meta Tags
          const metaTags = `
    <meta name="description" content="${article.shortDescription || ''}" />
    <meta property="og:title" content="${article.title}" />
    <meta property="og:description" content="${article.shortDescription || ''}" />
    <meta property="og:image" content="${article.imageUrl || ''}" />
    <meta property="og:type" content="article" />
    <meta name="twitter:card" content="summary_large_image" />
          `;
          html = html.replace('</head>', `${metaTags}\n</head>`);

          // Inject inside #root for view-source visibility (SEO)
          const serverContent = `
    <div id="root">
      <article style="direction: rtl; text-align: right; max-width: 800px; margin: 40px auto; padding: 20px; font-family: system-ui, -apple-system, sans-serif; color: #cbd5e1; background: #020617; line-height: 1.8;">
        <h1 style="font-size: 2.2rem; font-weight: 900; color: #ffffff; margin-bottom: 12px; line-height: 1.4;">${article.title}</h1>
        <div style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 24px; border-bottom: 1px solid #1e293b; padding-bottom: 12px;">
          <span>نویسنده: ${article.author || 'سرعت‌گیر'}</span> | 
          <span>دسته‌بندی: ${article.categoryLabel || article.category}</span>
        </div>
        ${article.imageUrl ? `<img src="${article.imageUrl}" alt="${article.title}" style="width: 100%; max-width: 800px; height: auto; border-radius: 16px; margin-bottom: 28px;" />` : ''}
        <p style="font-size: 1.15rem; font-weight: bold; color: #f1f5f9; margin-bottom: 28px; border-right: 4px solid #3b82f6; padding-right: 16px; line-height: 1.6;">${article.shortDescription || ''}</p>
        <div style="font-size: 1.05rem; color: #cbd5e1;">
          ${formattedContent}
        </div>
      </article>
    </div>
          `;
          html = html.replace('<div id="root"></div>', serverContent);
          return html;
        }
      }

      // Default Fallback (Homepage or other pages)
      if (settings) {
        html = html.replace(
          /<title>.*?<\/title>/,
          `<title>${settings.siteName || 'مجله سرعت‌گیر'} | آخرین اخبار و دستاوردهای خودرو</title>`
        );

        const metaTags = `
    <meta name="description" content="${settings.siteDescription || ''}" />
    <meta property="og:title" content="${settings.siteName || 'مجله سرعت‌گیر'}" />
    <meta property="og:description" content="${settings.siteDescription || ''}" />
    <meta property="og:type" content="website" />
        `;
        html = html.replace('</head>', `${metaTags}\n</head>`);
      }
    } catch (error) {
      console.error('Error generating dynamic HTML:', error);
    }

    return html;
  }

  // Serve static assets and main application
  let vite: any = null;

  // Force production mode if running from the compiled dist bundle or if dist/index.html exists (and we are not in AI Studio sandbox)
  const isProd = 
    process.env.NODE_ENV === 'production' || 
    (fs.existsSync(path.join(process.cwd(), 'dist/index.html')) && process.env.DISABLE_HMR !== 'true');

  if (isProd) {
    process.env.NODE_ENV = 'production';
  }

  if (process.env.NODE_ENV !== 'production') {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    // Custom HTML rendering for any other request in development
    app.get('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let html = await getDynamicHtml(url, req.path);
        // Apply Vite HTML transforms
        html = await vite.transformIndexHtml(url, html);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { index: false }));
    
    app.get('*', async (req, res) => {
      try {
        const html = await getDynamicHtml(req.originalUrl, req.path);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (err) {
        console.error('Production fallback error:', err);
        res.sendFile(path.join(distPath, 'index.html'));
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Failed to start:', err);
});
