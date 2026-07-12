import React, { useState, useEffect } from 'react';
import { Article, SiteSettings, Video } from './types';
import { seedDatabaseIfEmpty, getArticles, getSiteSettings, getVideos } from './lib/firebase';
import Navbar from './components/Navbar';
import HomeView from './components/HomeView';
import ArticleDetail from './components/ArticleDetail';
import CompareCars from './components/CompareCars';
import AdminPanel from './components/AdminPanel';
import Footer from './components/Footer';
import { Car } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'مجله خودرویی سرعت‌گیر',
    siteDescription: 'آخرین اخبار، دستاوردها و تکنولوژی‌های روز دنیای خودرو',
    aboutText: 'سرعت‌گیر یک مجله تخصصی خودرویی مستقل است که با هدف ارتقای آگاهی مخاطبان فارسی‌زبان از پیشرفت‌های صنعت خودروسازی جهان، اخبار روز، بررسی‌های فنی عمیق و مقالات دستاوردهای تکنولوژی خودرو را ارائه می‌دهد.',
    contactEmail: 'info@soraatgir.ir',
    adminPasscode: '123456'
  });

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [view, setView] = useState<'home' | 'compare' | 'admin' | 'detail'>('home');
  const [loading, setLoading] = useState<boolean>(true);

  const navigate = (path: string) => {
    window.history.pushState(null, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  // Synchronize state with current URL pathname or hash
  const applyRoute = (list: Article[], currentSettings?: SiteSettings) => {
    let path = window.location.pathname;
    let hash = window.location.hash;
    const activeSettings = currentSettings || settings;

    // Normalize trailing slashes
    if (path.length > 1 && path.endsWith('/')) {
      path = path.slice(0, -1);
    }
    if (hash.endsWith('/')) {
      hash = hash.slice(0, -1);
    }

    // Check pathname first
    if (path.startsWith('/article/')) {
      const decodedPath = decodeURIComponent(path.replace('/article/', ''));
      const article = list.find((a) => a.slug === decodedPath || a.id === decodedPath);
      if (article) {
        setSelectedArticle(article);
        setView('detail');
        document.title = `${article.title} | ${activeSettings.siteName || 'مجله سرعت‌گیر'}`;
        return;
      }
    } else if (path === '/compare') {
      setView('compare');
      setSelectedArticle(null);
      document.title = `مقایسه خودروها | ${activeSettings.siteName || 'مجله سرعت‌گیر'}`;
      return;
    } else if (path === '/' + (activeSettings.adminRouteSlug || 'soraatgir-secure-panel')) {
      setView('admin');
      setSelectedArticle(null);
      document.title = `پنل مدیریت | ${activeSettings.siteName || 'مجله سرعت‌گیر'}`;
      return;
    }

    // Check hash fallback
    if (hash.startsWith('#/article/')) {
      const decodedHash = decodeURIComponent(hash.replace('#/article/', ''));
      const article = list.find((a) => a.slug === decodedHash || a.id === decodedHash);
      if (article) {
        setSelectedArticle(article);
        setView('detail');
        document.title = `${article.title} | ${activeSettings.siteName || 'مجله سرعت‌گیر'}`;
        return;
      }
    } else if (hash.startsWith('#/category/')) {
      const cat = hash.replace('#/category/', '');
      setActiveCategory(cat);
      setView('home');
      setSelectedArticle(null);
      document.title = `${activeSettings.siteName || 'مجله سرعت‌گیر'} | آخرین اخبار و دستاوردهای خودرو`;
      return;
    } else if (hash === '#/compare') {
      setView('compare');
      setSelectedArticle(null);
      document.title = `مقایسه خودروها | ${activeSettings.siteName || 'مجله سرعت‌گیر'}`;
      return;
    } else if (hash === '#/' + (activeSettings.adminRouteSlug || 'soraatgir-secure-panel')) {
      setView('admin');
      setSelectedArticle(null);
      document.title = `پنل مدیریت | ${activeSettings.siteName || 'مجله سرعت‌گیر'}`;
      return;
    }

    // Default fallback
    setView('home');
    setSelectedArticle(null);
    setActiveCategory('all');
    document.title = `${activeSettings.siteName || 'مجله سرعت‌گیر'} | آخرین اخبار و دستاوردهای خودرو`;
  };

  // Initialize data
  useEffect(() => {
    let active = true;

    async function init() {
      setLoading(true);
      try {
        // Seed default database if empty (runs in the background without blocking the UI)
        seedDatabaseIfEmpty().catch((err) => console.error('Background seeding error:', err));
        
        // Fetch values
        const fetchedArticles = await getArticles();
        const fetchedSettings = await getSiteSettings();
        const fetchedVideos = await getVideos();

        if (active) {
          setArticles(fetchedArticles);
          setSettings(fetchedSettings);
          setVideos(fetchedVideos);
          // Apply initial route from URL
          applyRoute(fetchedArticles, fetchedSettings);
        }
      } catch (error) {
        console.error('Error initializing application:', error);
      } finally {
        if (active) setLoading(false);
      }
    }

    init();

    return () => {
      active = false;
    };
  }, []);

  // Listen for both hash and popstate changes to route
  useEffect(() => {
    const handleNavigation = () => {
      applyRoute(articles);
    };
    window.addEventListener('popstate', handleNavigation);
    window.addEventListener('hashchange', handleNavigation);
    return () => {
      window.removeEventListener('popstate', handleNavigation);
      window.removeEventListener('hashchange', handleNavigation);
    };
  }, [articles, settings]);

  // Set favicon dynamically
  useEffect(() => {
    if (settings && settings.faviconUrl) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = settings.faviconUrl;
    }
  }, [settings]);

  const refreshAll = async () => {
    try {
      const fetchedArticles = await getArticles();
      const fetchedSettings = await getSiteSettings();
      const fetchedVideos = await getVideos();
      setArticles(fetchedArticles);
      setSettings(fetchedSettings);
      setVideos(fetchedVideos);
    } catch (err) {
      console.error(err);
    }
  };

  // Filter articles based on active category and search query
  const filteredArticles = articles.filter((art) => {
    const matchesCategory = activeCategory === 'all' || art.category === activeCategory;
    const matchesSearch =
      searchQuery === '' ||
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Category change wrapper
  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    if (cat === 'all') {
      navigate('/');
    } else {
      window.location.hash = `#/category/${cat}`;
    }
    setSearchQuery('');
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#001224] text-slate-100 font-sans antialiased selection:bg-[#ead8b1] selection:text-[#001f3f] relative overflow-x-hidden" dir="rtl" id="app-root">
      
      {/* Background Mesh Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#3a6d8c]/10 blur-[140px] rounded-full pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-[#6a9ab0]/5 blur-[140px] rounded-full pointer-events-none z-0"></div>
      <div className="absolute top-[40%] left-[30%] w-[35%] h-[35%] bg-[#ead8b1]/5 blur-[120px] rounded-full pointer-events-none z-0"></div>

      {/* Top sticky navbar */}
      <Navbar
        settings={settings}
        activeCategory={activeCategory}
        setActiveCategory={handleCategoryChange}
        searchQuery={searchQuery}
        setSearchQuery={(q) => {
          setSearchQuery(q);
          navigate('/');
        }}
        onOpenCompare={() => {
          navigate('/compare');
        }}
        onOpenAdmin={() => {
          navigate('/' + (settings.adminRouteSlug || 'soraatgir-secure-panel'));
        }}
        onGoHome={() => {
          navigate('/');
          setSearchQuery('');
        }}
      />

      {/* Main body wrapper */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 z-10">
        <AnimatePresence mode="wait">
          
          {loading ? (
            /* Preloader screen */
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 gap-5"
              id="app-loader"
            >
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-white/5 border-t-[#ead8b1] animate-spin"></div>
                {settings.logoUrl ? (
                  <img src={settings.logoUrl} alt={settings.siteName} className="h-6 w-6 rounded-md object-cover absolute top-5 right-5 animate-pulse" />
                ) : (
                  <Car className="h-6 w-6 text-[#ead8b1] absolute top-5 right-5 animate-pulse" />
                )}
              </div>
              <div className="text-center">
                <p className="text-base font-black text-white tracking-wide">مجله خودرویی سرعت‌گیر</p>
                <p className="text-sm text-slate-400 mt-2">در حال بارگذاری پایگاه داده و پیکربندی مجله...</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={view + (selectedArticle?.id || '') + activeCategory}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="w-full"
            >
              {/* VIEW 1: HOME PAGE GRID */}
              {view === 'home' && (
                <HomeView
                  articles={articles}
                  videos={videos}
                  activeCategory={activeCategory}
                  searchQuery={searchQuery}
                  filteredArticles={filteredArticles}
                  navigate={navigate}
                />
              )}

              {/* VIEW 2: ARTICLE DETAILS VIEW */}
              {view === 'detail' && selectedArticle && (
                <ArticleDetail
                  article={selectedArticle}
                  onBack={() => {
                    navigate('/');
                  }}
                  onRefreshArticles={refreshAll}
                />
              )}

              {/* VIEW 3: CAR COMPARISON TOOL */}
              {view === 'compare' && (
                <CompareCars
                  articles={articles}
                  onClose={() => { navigate('/'); }}
                />
              )}

              {/* VIEW 4: ADMIN DASHBOARD CONTROL PANEL */}
              {view === 'admin' && (
                <AdminPanel
                  articles={articles}
                  videos={videos}
                  settings={settings}
                  onRefreshAll={refreshAll}
                  onClose={() => { navigate('/'); }}
                />
              )}

            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer
        settings={settings}
        setActiveCategory={handleCategoryChange}
        onOpenCompare={() => {
          navigate('/compare');
        }}
        onOpenAdmin={() => {
          navigate('/' + (settings.adminRouteSlug || 'soraatgir-secure-panel'));
        }}
        onGoHome={() => {
          navigate('/');
          setSearchQuery('');
        }}
      />
    </div>
  );
}
