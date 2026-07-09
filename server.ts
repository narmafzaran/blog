import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';
import { db, getSiteSettings } from './src/lib/firebase';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';

// Load environment variables
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // API: AI Article Generation endpoint
  app.post('/api/generate-article', async (req, res) => {
    const { topic, category } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'موضوع مقاله الزامی است.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return res.status(500).json({
        error: 'کلید وب سرویس هوش مصنوعی (GEMINI_API_KEY) یافت نشد. لطفاً در پنل تنظیمات آن را وارد یا بررسی کنید.'
      });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
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
        model: 'gemini-2.5-flash',
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

  // Helper to generate SEO-friendly HTML with article metadata/content or global settings
  async function getDynamicHtml(reqUrl: string, originalPath: string): Promise<string> {
    let templatePath = '';
    if (process.env.NODE_ENV !== 'production') {
      templatePath = path.join(process.cwd(), 'index.html');
    } else {
      templatePath = path.join(process.cwd(), 'dist', 'index.html');
    }

    let html = await fs.promises.readFile(templatePath, 'utf-8');

    try {
      // 1. Fetch site settings
      const settings = await getSiteSettings();

      // 2. Check if this is an article path
      const articleMatch = originalPath.match(/^\/article\/([^/?#]+)/);
      if (articleMatch) {
        const slugOrId = decodeURIComponent(articleMatch[1]);
        let article: any = null;

        // Try fetching from Firestore by slug
        const q = query(collection(db, 'articles'), where('slug', '==', slugOrId));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          article = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
        } else {
          // Try fetching by doc ID
          const docRef = doc(db, 'articles', slugOrId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            article = { id: docSnap.id, ...docSnap.data() };
          }
        }

        if (article) {
          // Replace Title
          const pageTitle = `${article.title} | ${settings.siteName || 'مجله سرعت'}`;
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
          <span>نویسنده: ${article.author || 'سرعت'}</span> | 
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
          `<title>${settings.siteName || 'مجله سرعت'} | آخرین اخبار و دستاوردهای خودرو</title>`
        );

        const metaTags = `
    <meta name="description" content="${settings.siteDescription || ''}" />
    <meta property="og:title" content="${settings.siteName || 'مجله سرعت'}" />
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
