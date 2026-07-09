import React, { useState, useEffect } from 'react';
import { Article, SiteSettings } from './types';
import { seedDatabaseIfEmpty, getArticles, getSiteSettings } from './lib/firebase';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ArticleCard from './components/ArticleCard';
import ArticleDetail from './components/ArticleDetail';
import CompareCars from './components/CompareCars';
import AdminPanel from './components/AdminPanel';
import Footer from './components/Footer';
import { Car, Search, RefreshCw, Sparkles, Sliders, Newspaper } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'مجله خودرویی سرعت',
    siteDescription: 'آخرین اخبار، دستاوردها و تکنولوژی‌های روز دنیای خودرو',
    aboutText: 'سرعت یک مجله تخصصی خودرویی مستقل است که با هدف ارتقای آگاهی مخاطبان فارسی‌زبان از پیشرفت‌های صنعت خودروسازی جهان، اخبار روز، بررسی‌های فنی عمیق و مقالات دستاوردهای تکنولوژی خودرو را ارائه می‌دهد.',
    contactEmail: 'info@speedmagazine.ir',
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
    const path = window.location.pathname;
    const hash = window.location.hash;
    const activeSettings = currentSettings || settings;

    // Check pathname first
    if (path.startsWith('/article/')) {
      const decodedPath = decodeURIComponent(path.replace('/article/', ''));
      const article = list.find((a) => a.slug === decodedPath || a.id === decodedPath);
      if (article) {
        setSelectedArticle(article);
        setView('detail');
        document.title = `${article.title} | ${activeSettings.siteName || 'مجله سرعت'}`;
        return;
      }
    } else if (path === '/compare') {
      setView('compare');
      setSelectedArticle(null);
      document.title = `مقایسه خودروها | ${activeSettings.siteName || 'مجله سرعت'}`;
      return;
    } else if (path === '/admin') {
      setView('admin');
      setSelectedArticle(null);
      document.title = `پنل مدیریت | ${activeSettings.siteName || 'مجله سرعت'}`;
      return;
    }

    // Check hash fallback
    if (hash.startsWith('#/article/')) {
      const decodedHash = decodeURIComponent(hash.replace('#/article/', ''));
      const article = list.find((a) => a.slug === decodedHash || a.id === decodedHash);
      if (article) {
        setSelectedArticle(article);
        setView('detail');
        document.title = `${article.title} | ${activeSettings.siteName || 'مجله سرعت'}`;
        return;
      }
    } else if (hash.startsWith('#/category/')) {
      const cat = hash.replace('#/category/', '');
      setActiveCategory(cat);
      setView('home');
      setSelectedArticle(null);
      document.title = `${activeSettings.siteName || 'مجله سرعت'} | آخرین اخبار و دستاوردهای خودرو`;
      return;
    } else if (hash === '#/compare') {
      setView('compare');
      setSelectedArticle(null);
      document.title = `مقایسه خودروها | ${activeSettings.siteName || 'مجله سرعت'}`;
      return;
    } else if (hash === '#/admin') {
      setView('admin');
      setSelectedArticle(null);
      document.title = `پنل مدیریت | ${activeSettings.siteName || 'مجله سرعت'}`;
      return;
    }

    // Default fallback
    setView('home');
    setSelectedArticle(null);
    setActiveCategory('all');
    document.title = `${activeSettings.siteName || 'مجله سرعت'} | آخرین اخبار و دستاوردهای خودرو`;
  };

  // Initialize data
  useEffect(() => {
    let active = true;

    async function init() {
      setLoading(true);
      try {
        // Seed default database if empty
        await seedDatabaseIfEmpty();
        
        // Fetch values
        const fetchedArticles = await getArticles();
        const fetchedSettings = await getSiteSettings();

        if (active) {
          setArticles(fetchedArticles);
          setSettings(fetchedSettings);
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

  const refreshAll = async () => {
    try {
      const fetchedArticles = await getArticles();
      const fetchedSettings = await getSiteSettings();
      setArticles(fetchedArticles);
      setSettings(fetchedSettings);
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
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white relative overflow-x-hidden" dir="rtl" id="app-root">
      
      {/* Background Mesh Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none z-0"></div>
      <div className="absolute top-[40%] left-[30%] w-[35%] h-[35%] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none z-0"></div>

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
          navigate('/admin');
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
                <div className="h-16 w-16 rounded-full border-4 border-slate-800 border-t-blue-500 animate-spin"></div>
                <Car className="h-6 w-6 text-blue-400 absolute top-5 right-5 animate-pulse" />
              </div>
              <div className="text-center">
                <p className="text-base font-black text-white tracking-wide">مجله خودرویی سرعت</p>
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
                <div id="home-view">
                  {/* Hero featured banner - only show when not searching and category is All */}
                  {searchQuery === '' && activeCategory === 'all' && (
                    <HeroSection
                      articles={articles}
                      onSelectArticle={(art) => {
                        navigate(`/article/${art.slug || art.id}`);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    />
                  )}
                  {/* Feed Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-slate-800 pb-5">
                    <div>
                      <h2 className="text-xl font-black text-white flex items-center gap-1.5">
                        <Sparkles className="h-5.5 w-5.5 text-blue-400 animate-pulse" />
                        <span>
                          {activeCategory === 'all'
                            ? 'آخرین مقالات و دستاوردهای خودرویی'
                            : articles.find((a) => a.category === activeCategory)?.categoryLabel || 'آرشیو مقالات'}
                        </span>
                      </h2>
                      <p className="text-xs text-slate-400 font-medium mt-1">بروزترین اخبار مهندسی، رونمایی‌ها و بررسی‌های فنی مستقل با چاشنی سرعت</p>
                    </div>

                    {searchQuery && (
                      <div className="bg-slate-900 text-blue-300 border border-slate-800 px-4 py-2 rounded-xl text-xs font-bold">
                        نتایج جستجو برای: "{searchQuery}"
                      </div>
                    )}
                  </div>

                  {/* Articles Grid */}
                  {filteredArticles.length === 0 ? (
                    <div className="py-20 text-center rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl" id="empty-state">
                      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-lg">
                        <Search className="h-6 w-6" />
                      </div>
                      <h3 className="text-sm font-black text-white">هیچ مقاله‌ای یافت نشد</h3>
                      <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed px-4">
                        موردی منطبق با جستجو یا دسته‌بندی انتخابی شما در پایگاه داده وجود ندارد. لطفاً کلمات کلیدی دیگری را امتحان کنید.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="articles-grid">
                      {filteredArticles.map((article) => (
                        <ArticleCard
                          key={article.id}
                          article={article}
                          onSelect={(art) => {
                            navigate(`/article/${art.slug || art.id}`);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
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
          navigate('/admin');
        }}
        onGoHome={() => {
          navigate('/');
          setSearchQuery('');
        }}
      />
    </div>
  );
}
