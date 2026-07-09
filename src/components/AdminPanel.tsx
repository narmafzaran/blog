import React, { useState, useEffect } from 'react';
import {
  Lock,
  PlusCircle,
  FileText,
  MessageSquare,
  Settings as SettingsIcon,
  Trash2,
  Edit,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Image as ImageIcon,
  Check,
  Cpu,
  Sliders,
  Zap,
  Newspaper,
  Car
} from 'lucide-react';
import { Article, Comment, SiteSettings, CarSpecs } from '../types';
import { saveArticle, deleteArticle, getAllComments, deleteComment, saveSiteSettings } from '../lib/firebase';

interface AdminPanelProps {
  articles: Article[];
  settings: SiteSettings;
  onRefreshAll: () => void;
  onClose: () => void;
}

const PRESET_IMAGES = [
  { name: 'پورشه قرمز ورزشی', url: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=1200' },
  { name: 'تسلا شیک نقره‌ای', url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=1200' },
  { name: 'شاسی‌بلند لوکس مشکی', url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1200' },
  { name: 'کوپه اسپرت در شب', url: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=1200' },
  { name: 'شورولت کامارو زرد', url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1200' },
  { name: 'آئودی لوکس خاکستری', url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200' }
];

export default function AdminPanel({ articles, settings, onRefreshAll, onClose }: AdminPanelProps) {
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');

  // Admin Navigation Tabs
  const [activeTab, setActiveTab] = useState<'create' | 'articles' | 'comments' | 'settings'>('create');

  // Article Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [category, setCategory] = useState<string>('news');
  const [shortDescription, setShortDescription] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0].url);
  const [author, setAuthor] = useState('');
  const [isReview, setIsReview] = useState(false);
  const [specs, setSpecs] = useState<CarSpecs>({
    engine: '',
    power: '',
    torque: '',
    topSpeed: '',
    acceleration: '',
    consumption: '',
    price: ''
  });

  // Custom categories list state
  const [customCats, setCustomCats] = useState<{ id: string; label: string; iconName?: string }[]>(
    settings.customCategories && settings.customCategories.length > 0
      ? settings.customCategories
      : [
          { id: 'news', label: 'اخبار روز', iconName: 'Newspaper' },
          { id: 'achievement', label: 'تکنولوژی و دستاوردها', iconName: 'Cpu' },
          { id: 'review', label: 'بررسی فنی', iconName: 'Sliders' },
          { id: 'electric', label: 'خودروهای برقی', iconName: 'Zap' },
        ]
  );

  const [newCatId, setNewCatId] = useState('');
  const [newCatLabel, setNewCatLabel] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Car');

  const handleAddCategory = () => {
    if (!newCatId || !newCatLabel) {
      showNotification('error', 'لطفاً شناسه و عنوان دسته‌بندی را وارد کنید.');
      return;
    }
    const formattedId = newCatId.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (!formattedId) {
      showNotification('error', 'شناسه دسته‌بندی باید فقط شامل حروف انگلیسی و اعداد و خط تیره باشد.');
      return;
    }
    if (customCats.some(c => c.id === formattedId)) {
      showNotification('error', 'این شناسه دسته‌بندی قبلاً ثبت شده است.');
      return;
    }
    setCustomCats([...customCats, { id: formattedId, label: newCatLabel.trim(), iconName: newCatIcon }]);
    setNewCatId('');
    setNewCatLabel('');
  };

  const handleRemoveCategory = (idToRemove: string) => {
    setCustomCats(customCats.filter(c => c.id !== idToRemove));
  };

  // AI Generator State
  const [aiTopic, setAiTopic] = useState('');
  const [aiCategory, setAiCategory] = useState<string>('news');
  const [generatingWithAi, setGeneratingWithAi] = useState(false);
  const [aiError, setAiError] = useState('');

  // Comments State
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  // Site Settings Form State
  const [siteName, setSiteName] = useState(settings.siteName);
  const [siteDescription, setSiteDescription] = useState(settings.siteDescription);
  const [aboutText, setAboutText] = useState(settings.aboutText);
  const [contactEmail, setContactEmail] = useState(settings.contactEmail);
  const [adminPasscode, setAdminPasscode] = useState(settings.adminPasscode);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Rich Editor & SEO Analysis State
  const [editorMode, setEditorMode] = useState<'edit' | 'preview'>('edit');
  const [seoKeyword, setSeoKeyword] = useState('');

  // Word count and reading time helpers
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const readingTime = Math.ceil(wordCount / 180) || 1;

  // Insert formatting at cursor position in textarea
  const insertAtCursor = (textBefore: string, textAfter: string = '') => {
    const textarea = document.getElementById('article-content-textarea') as HTMLTextAreaElement;
    if (!textarea) {
      setContent(prev => prev + textBefore + textAfter);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = textarea.value;

    const beforeText = currentVal.substring(0, start);
    const selectedText = currentVal.substring(start, end);
    const afterText = currentVal.substring(end);

    const replacement = textBefore + selectedText + textAfter;
    setContent(beforeText + replacement + afterText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + textBefore.length,
        start + textBefore.length + selectedText.length
      );
    }, 10);
  };

  // Auto-generate slug from title for new articles if not manually edited
  useEffect(() => {
    if (!editingId && !isSlugManuallyEdited) {
      const generated = title.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\wآ-ی-]/g, '');
      setSlug(generated);
    }
  }, [title, editingId, isSlugManuallyEdited]);

  // Sync custom categories state with settings prop when updated
  useEffect(() => {
    if (settings.customCategories && settings.customCategories.length > 0) {
      setCustomCats(settings.customCategories);
    }
  }, [settings.customCategories]);

  // Check auth against setting on submission
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === settings.adminPasscode) {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('رمز عبور وارد شده اشتباه است. لطفاً دوباره تلاش کنید.');
    }
  };

  // Fetch comments for moderation
  useEffect(() => {
    if (isAuthenticated && activeTab === 'comments') {
      loadComments();
    }
  }, [isAuthenticated, activeTab]);

  const loadComments = async () => {
    setLoadingComments(true);
    try {
      const data = await getAllComments();
      setComments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingComments(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // AI Generation Trigger
  const handleGenerateWithAi = async () => {
    if (!aiTopic) {
      setAiError('لطفاً ابتدا یک موضوع یا تیتر برای مقاله وارد کنید.');
      return;
    }

    setGeneratingWithAi(true);
    setAiError('');

    try {
      const res = await fetch('/api/generate-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: aiTopic, category: aiCategory })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'خطایی در برقراری ارتباط با سرویس هوش مصنوعی رخ داد.');
      }

      // Populate form fields with the AI response
      setTitle(data.title || '');
      setCategory(data.category || aiCategory);
      setShortDescription(data.shortDescription || '');
      setContent(data.content || '');
      setAuthor(data.author || 'هوش مصنوعی سرعت');
      
      if (data.specs) {
        setSpecs({
          engine: data.specs.engine || '',
          power: data.specs.power || '',
          torque: data.specs.torque || '',
          topSpeed: data.specs.topSpeed || '',
          acceleration: data.specs.acceleration || '',
          consumption: data.specs.consumption || '',
          price: data.specs.price || ''
        });
        setIsReview(true);
      } else {
        setIsReview(data.category === 'review');
      }

      showNotification('success', 'مقاله با هوش مصنوعی با موفقیت تولید شد! فیلدهای فرم زیر پر شدند.');
    } catch (err: any) {
      setAiError(err.message || 'خطایی غیرمنتظره رخ داد.');
      showNotification('error', 'تولید مقاله با هوش مصنوعی شکست خورد.');
    } finally {
      setGeneratingWithAi(false);
    }
  };

  // Reset Article Form
  const resetArticleForm = () => {
    setEditingId(null);
    setTitle('');
    setSlug('');
    setIsSlugManuallyEdited(false);
    if (customCats.length > 0) {
      setCategory(customCats[0].id);
    } else {
      setCategory('news');
    }
    setShortDescription('');
    setContent('');
    setImageUrl(PRESET_IMAGES[0].url);
    setAuthor('');
    setIsReview(false);
    setSpecs({
      engine: '',
      power: '',
      torque: '',
      topSpeed: '',
      acceleration: '',
      consumption: '',
      price: ''
    });
  };

  // Save Article Submit
  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !shortDescription || !content || !author) {
      showNotification('error', 'پر کردن تمام فیلدهای اصلی الزامی است.');
      return;
    }

    const defaultCategoryLabels: Record<string, string> = {
      news: 'اخبار روز',
      achievement: 'دستاوردها و تکنولوژی',
      review: 'بررسی فنی',
      electric: 'خودروهای برقی'
    };

    const customCategoryLabels = customCats.reduce((acc, cat) => {
      acc[cat.id] = cat.label;
      return acc;
    }, {} as Record<string, string>);

    const combinedLabels = { ...defaultCategoryLabels, ...customCategoryLabels };

    const finalSlug = slug.trim()
      ? slug.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\wآ-ی-]/g, '')
      : title.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\wآ-ی-]/g, '');

    const articleData: Partial<Article> = {
      title,
      slug: finalSlug,
      category,
      categoryLabel: combinedLabels[category] || category,
      shortDescription,
      content,
      imageUrl,
      author,
      specs: isReview ? specs : undefined
    };

    if (editingId) {
      articleData.id = editingId;
    }

    try {
      await saveArticle(articleData);
      showNotification('success', editingId ? 'مقاله با موفقیت ویرایش شد.' : 'مقاله جدید با موفقیت منتشر شد.');
      resetArticleForm();
      onRefreshAll();
      setActiveTab('articles'); // redirect to list
    } catch (err) {
      showNotification('error', 'خطا در ذخیره‌سازی مقاله.');
    }
  };

  // Delete Article Action
  const handleDeleteArticle = async (id: string) => {
    if (!confirm('آیا از حذف این مقاله اطمینان دارید؟ این عمل غیرقابل بازگشت است.')) return;
    try {
      await deleteArticle(id);
      showNotification('success', 'مقاله با موفقیت حذف شد.');
      onRefreshAll();
    } catch (err) {
      showNotification('error', 'خطا در حذف مقاله.');
    }
  };

  // Edit Article Pre-population
  const handleStartEdit = (art: Article) => {
    setEditingId(art.id);
    setTitle(art.title);
    setSlug(art.slug || '');
    setIsSlugManuallyEdited(true);
    setCategory(art.category);
    setShortDescription(art.shortDescription);
    setContent(art.content);
    setImageUrl(art.imageUrl);
    setAuthor(art.author);
    if (art.specs) {
      setSpecs(art.specs);
      setIsReview(true);
    } else {
      setIsReview(false);
    }
    setActiveTab('create'); // Switch to editor tab
  };

  // Delete Comment Action
  const handleDeleteComment = async (id: string) => {
    if (!confirm('آیا از حذف این نظر اطمینان دارید؟')) return;
    try {
      await deleteComment(id);
      showNotification('success', 'دیدگاه با موفقیت حذف شد.');
      loadComments();
    } catch (err) {
      showNotification('error', 'خطا در حذف دیدگاه.');
    }
  };

  // Save Settings Submit
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveSiteSettings({
        siteName,
        siteDescription,
        aboutText,
        contactEmail,
        adminPasscode,
        customCategories: customCats
      });
      showNotification('success', 'تنظیمات سایت و دسته‌بندی‌ها با موفقیت بروزرسانی شد.');
      onRefreshAll();
    } catch (err) {
      showNotification('error', 'خطا در ذخیره تنظیمات.');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Password Login Screen
  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-md py-16" id="admin-login-view">
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-900/20 text-blue-400 shadow-xl border border-blue-800">
            <Lock className="h-6 w-6" />
          </div>
          
          <h1 className="text-xl font-black text-white mb-2">ورود به پنل مدیریت مجله</h1>
          <p className="text-xs text-slate-400 font-medium mb-6">برای انتشار مقاله و دسترسی به تنظیمات، رمز عبور را وارد کنید</p>

          <form onSubmit={handleLogin} className="space-y-4 text-right">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">رمز عبور مدیریت *</label>
              <input
                type="password"
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="رمز عبور پیش‌فرض: 123456"
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-center font-mono tracking-widest"
                id="admin-passcode-input"
              />
            </div>

            {authError && <p className="text-[11px] font-bold text-red-400 leading-relaxed text-center">{authError}</p>}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold text-xs py-3.5 transition-all cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="submit"
                className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs py-3.5 shadow-lg border border-blue-400/20 transition-all cursor-pointer"
                id="admin-login-submit"
              >
                ورود به پنل
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl py-6" id="admin-panel-dashboard">
      
      {/* Top Notification Toast */}
      {notification && (
        <div className={`fixed top-6 left-6 z-50 rounded-2xl px-5 py-4 shadow-2xl border text-xs font-bold flex items-center gap-2 animate-bounce ${
          notification.type === 'success'
            ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-300 backdrop-blur-md'
            : 'bg-red-950/80 border-red-500/30 text-red-300 backdrop-blur-md'
        }`}>
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-5 mb-8">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-900/20 text-blue-400 border border-blue-800">
            <Cpu className="h-5.5 w-5.5 animate-spin" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">پیشخوان مدیریت و تنظیمات</h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">افزودن مقالات، ویرایش محتوا، تعدیل دیدگاه‌ها و مدیریت مجله خودرو</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
        >
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Admin Navigation Menu */}
        <div className="lg:col-span-1 space-y-2">
          {[
            { id: 'create', label: 'افزودن مقاله جدید / هوش مصنوعی', icon: PlusCircle },
            { id: 'articles', label: 'مدیریت کل مقالات', icon: FileText },
            { id: 'comments', label: 'تعدیل دیدگاه‌های کاربران', icon: MessageSquare },
            { id: 'settings', label: 'تنظیمات عمومی سایت', icon: SettingsIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as any); }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg border border-blue-400/20'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}

          <button
            onClick={() => setIsAuthenticated(false)}
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition-all mt-4 border border-red-500/20 cursor-pointer"
          >
            <Lock className="h-4.5 w-4.5" />
            <span>خروج از پنل</span>
          </button>
        </div>

        {/* Dashboard Work Area */}
        <div className="lg:col-span-3">
          
          {/* TAB 1: CREATE / AI ARTICLE */}
          {activeTab === 'create' && (
            <div className="space-y-8" id="admin-editor-section">
              
              {/* GEMINI AI AUTOMATIC GENERATOR CARD */}
              <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-2xl border border-blue-900/40">
                <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
                  <Sparkles className="h-5.5 w-5.5 text-amber-400 animate-bounce" />
                  <div>
                    <h2 className="text-base font-black text-white">هوش مصنوعی نویسنده سرعت (Gemini AI)</h2>
                    <p className="text-[10px] text-slate-400">به کمک مدل قدرتمند جمینی، بلافاصله یک مقاله تخصصی فارسی بنویسید</p>
                  </div>
                </div>

                <div className="space-y-4 text-right">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-300 mb-1.5">موضوع یا تیتر مقاله پیشنهادی *</label>
                      <input
                        type="text"
                        value={aiTopic}
                        onChange={(e) => setAiTopic(e.target.value)}
                        placeholder="مثال: جزئیات رونمایی از کراس اوور جدید برقی بی ام و iX3"
                        className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-right"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1.5">دسته‌بندی مقاله</label>
                      <select
                        value={aiCategory}
                        onChange={(e) => setAiCategory(e.target.value)}
                        className="w-full text-xs font-bold rounded-xl bg-slate-950 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-blue-500 [&_option]:bg-slate-950 text-right"
                      >
                        {customCats.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {aiError && <p className="text-[10px] font-bold text-red-400">{aiError}</p>}

                  <button
                    type="button"
                    disabled={generatingWithAi}
                    onClick={handleGenerateWithAi}
                    className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-6 py-3 shadow-lg shadow-amber-500/20 transition-all duration-300 w-full md:w-auto justify-center cursor-pointer"
                    id="ai-generate-btn"
                  >
                    {generatingWithAi ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>در حال تحقیق و تالیف مقاله با هوش مصنوعی (حدود ۱۰ ثانیه)...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        <span>تولید محتوای کامل با هوش مصنوعی جمینی</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* STANDARD WRITE / EDIT FORM */}
              <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-2xl">
                <h2 className="text-base font-black text-white mb-6 pb-3 border-b border-slate-800">
                  {editingId ? 'ویرایش و اصلاح مقاله' : 'انتشار مقاله خودرو جدید'}
                </h2>

                <form onSubmit={handleSaveArticle} className="space-y-6 text-right">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Title */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">عنوان کامل مقاله *</label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="یک عنوان جذاب بنویسید"
                        className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-right"
                      />
                    </div>

                    {/* Slug */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                        <span>آدرس مطلب (Slug) *</span>
                        <span className="text-[10px] text-slate-500">(فقط حروف، اعداد و خط تیره - مثال: bmw-ix3-electric)</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={slug}
                        onChange={(e) => {
                          setIsSlugManuallyEdited(true);
                          setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^\wآ-ی-]/g, ''));
                        }}
                        placeholder="آدرس مطلب انگلیسی یا فارسی"
                        className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-left font-mono"
                        dir="ltr"
                      />
                    </div>

                    {/* Author */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">نویسنده / کارشناس *</label>
                      <input
                        type="text"
                        required
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="نام خود یا هوش مصنوعی سرعت"
                        className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-right"
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">دسته‌بندی محتوا *</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full text-xs font-bold rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-white focus:outline-none focus:border-blue-500 [&_option]:bg-slate-950 text-right"
                      >
                        {customCats.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Image URL with Preset Selector */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1">
                        <ImageIcon className="h-4 w-4 text-blue-400" />
                        لینک تصویر کاور مقاله *
                      </label>
                      <input
                        type="url"
                        required
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-left"
                      />
                      
                      {/* Presets Grid */}
                      <div className="mt-3">
                        <span className="block text-[10px] font-bold text-slate-400 mb-2">یا انتخاب تصاویر باکیفیت خودرویی پیشنهادی:</span>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                          {PRESET_IMAGES.map((img, i) => {
                            const isSelected = imageUrl === img.url;
                            return (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setImageUrl(img.url)}
                                className={`relative aspect-[16/10] rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                                  isSelected ? 'border-blue-500 scale-95 shadow-lg' : 'border-transparent opacity-80 hover:opacity-100'
                                }`}
                                title={img.name}
                              >
                                <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                                {isSelected && (
                                  <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                                    <Check className="h-4 w-4 text-white font-black" />
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Short Description */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">خلاصه مقاله (۱ پاراگراف برای نمایش در لیست) *</label>
                      <textarea
                        required
                        rows={2}
                        value={shortDescription}
                        onChange={(e) => setShortDescription(e.target.value)}
                        placeholder="خلاصه‌ای جذاب و کوتاه برای معرفی بنویسید"
                        className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-right"
                      ></textarea>
                    </div>

                    {/* Content */}
                    <div className="md:col-span-2">
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <label className="block text-xs font-bold text-slate-300">متن کامل مقاله *</label>
                          <span className="text-[10px] text-slate-500">(پشتیبانی از قالب‌بندی و کدهای وردپرسی)</span>
                        </div>
                        
                        {/* Tab switcher: Write vs Preview */}
                        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
                          <button
                            type="button"
                            onClick={() => setEditorMode('edit')}
                            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                              editorMode === 'edit'
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            <Edit className="h-3 w-3" />
                            <span>ویرایشگر متنی</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditorMode('preview')}
                            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                              editorMode === 'preview'
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            <FileText className="h-3 w-3" />
                            <span>پیش‌نمایش زنده وردپرسی</span>
                          </button>
                        </div>
                      </div>

                      {editorMode === 'edit' ? (
                        <div className="space-y-3">
                          {/* Rich Formatting Toolbar */}
                          <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-950 border border-slate-850 rounded-xl" id="wordpress-toolbar">
                            <button
                              type="button"
                              onClick={() => insertAtCursor('## ')}
                              className="px-2.5 py-1.5 text-[10px] font-black text-slate-300 hover:text-white hover:bg-slate-800 rounded transition cursor-pointer"
                              title="تیتر سطح ۲"
                            >
                              H2
                            </button>
                            <button
                              type="button"
                              onClick={() => insertAtCursor('### ')}
                              className="px-2.5 py-1.5 text-[10px] font-black text-slate-300 hover:text-white hover:bg-slate-800 rounded transition cursor-pointer"
                              title="تیتر سطح ۳"
                            >
                              H3
                            </button>
                            <button
                              type="button"
                              onClick={() => insertAtCursor('- ')}
                              className="px-2.5 py-1.5 text-[10px] font-black text-slate-300 hover:text-white hover:bg-slate-800 rounded transition cursor-pointer"
                              title="لیست بالت"
                            >
                              • لیست بالت
                            </button>
                            <button
                              type="button"
                              onClick={() => insertAtCursor('> ')}
                              className="px-2.5 py-1.5 text-[10px] font-black text-slate-300 hover:text-white hover:bg-slate-800 rounded transition cursor-pointer"
                              title="نقل قول"
                            >
                              ” نقل قول
                            </button>
                            <button
                              type="button"
                              onClick={() => insertAtCursor('\n---\n')}
                              className="px-2.5 py-1.5 text-[10px] font-black text-slate-300 hover:text-white hover:bg-slate-800 rounded transition cursor-pointer"
                              title="خط جدا کننده"
                            >
                              — جدا کننده
                            </button>
                            <div className="h-5 w-[1px] bg-slate-800 mx-1"></div>
                            
                            {/* Pro Block helper */}
                            <button
                              type="button"
                              onClick={() => insertAtCursor('➕ نقاط قوت: ')}
                              className="px-2.5 py-1.5 text-[10px] font-black text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded transition cursor-pointer"
                              title="نقطه قوت"
                            >
                              ➕ مزیت
                            </button>
                            {/* Con Block helper */}
                            <button
                              type="button"
                              onClick={() => insertAtCursor('➖ نقاط ضعف: ')}
                              className="px-2.5 py-1.5 text-[10px] font-black text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded transition cursor-pointer"
                              title="نقطه ضعف"
                            >
                              ➖ عیب
                            </button>
                            {/* Key Alert helper */}
                            <button
                              type="button"
                              onClick={() => insertAtCursor('💡 نکته کلیدی: ')}
                              className="px-2.5 py-1.5 text-[10px] font-black text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded transition cursor-pointer"
                              title="نکته کلیدی"
                            >
                              💡 نکته
                            </button>
                            <div className="h-5 w-[1px] bg-slate-800 mx-1"></div>

                            {/* Preset block layout generator */}
                            <button
                              type="button"
                              onClick={() => insertAtCursor('\n### نقد و بررسی کارشناس سرعت\n> طراحی بدنه فوق‌العاده آیرودینامیک به همراه پیشرانه الکتریکی با گشتاور آنی بالا از ویژگی‌های بارز این مدل است.\n\n➕ شتاب صفر تا صد و قدرت بی نظیر پیشرانه\n➕ سیستم تعلیق تطبیقی مجهز به هوش مصنوعی\n➖ قیمت تمام شده جهانی بالا\n\n💡 نکته کلیدی: مهندسی این مدل نشان‌دهنده مسیر آینده سوپراسپرت‌های الکتریکی است.\n')}
                              className="px-2.5 py-1.5 text-[10px] font-black text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded transition flex items-center gap-1 cursor-pointer"
                              title="قالب آماده نقد و بررسی"
                            >
                              <Sparkles className="h-3.5 w-3.5" />
                              <span>درج قالب نقد و بررسی وردپرسی</span>
                            </button>
                          </div>

                          <textarea
                            id="article-content-textarea"
                            required
                            rows={14}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="شرح کامل دستاورد یا خبر خودرو را در اینجا وارد کنید یا از قالب وردپرسی بالا استفاده کنید..."
                            className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-right leading-relaxed font-sans"
                          ></textarea>
                          
                          {/* SEO and readability analysis sidebar */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-right">
                            <div className="space-y-1">
                              <span className="block text-[10px] text-slate-400 font-bold">آمار محتوا:</span>
                              <div className="flex flex-wrap gap-2 text-[10px] font-bold text-slate-200">
                                <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded">کلمات: {wordCount.toLocaleString('fa-IR')}</span>
                                <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded">مطالعه: ~{readingTime.toLocaleString('fa-IR')} دقیقه</span>
                              </div>
                            </div>
                            
                            <div className="space-y-1 md:col-span-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-slate-400 font-bold">دستیار سئو و خوانایی (Yoast SEO):</span>
                                <span className="text-[10px] text-blue-400 font-bold">کلمه کلیدی هدف:</span>
                              </div>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={seoKeyword}
                                  onChange={(e) => setSeoKeyword(e.target.value)}
                                  placeholder="مثال: پورشه"
                                  className="rounded-lg bg-slate-900 border border-slate-800 px-2 py-1 text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-right w-28 shrink-0"
                                />
                                <div className="flex flex-wrap gap-1 items-center text-[9px] font-black">
                                  {/* Title Check */}
                                  <span className={`px-1.5 py-0.5 rounded border ${
                                    title.length >= 25 && title.length <= 75 
                                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                  }`}>
                                    طول تیتر ({title.length})
                                  </span>
                                  {/* Heading Check */}
                                  <span className={`px-1.5 py-0.5 rounded border ${
                                    content.includes('###') || content.includes('##')
                                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                  }`}>
                                    عناوین فرعی
                                  </span>
                                  {/* Keyword check */}
                                  {seoKeyword && (
                                    <>
                                      <span className={`px-1.5 py-0.5 rounded border ${
                                        title.toLowerCase().includes(seoKeyword.toLowerCase())
                                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                      }`}>
                                        در عنوان اصلی
                                      </span>
                                      <span className={`px-1.5 py-0.5 rounded border ${
                                        content.toLowerCase().includes(seoKeyword.toLowerCase())
                                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                      }`}>
                                        تکرار کلمه ({(content.toLowerCase().match(new RegExp(seoKeyword.toLowerCase().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g')) || []).length} بار)
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* WordPress-Style Live Preview container */
                        <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 min-h-[300px] overflow-y-auto max-h-[500px]" dir="rtl">
                          <h2 className="text-xl font-black text-white mb-3">{title || 'عنوان کامل مقاله'}</h2>
                          <div className="flex items-center gap-4 text-[10px] text-slate-400 border-b border-slate-900 pb-2 mb-4 font-bold">
                            <span>نویسنده: {author || 'ثبت نشده'}</span>
                            <span>دسته‌بندی: {category}</span>
                            <span>زمان مطالعه تقریبی: ~{readingTime.toLocaleString('fa-IR')} دقیقه</span>
                          </div>
                          
                          {shortDescription && (
                            <div className="mb-4 border-r-4 border-blue-500 bg-slate-900/40 p-3 rounded-l-xl text-slate-300 text-xs font-bold leading-relaxed">
                              {shortDescription}
                            </div>
                          )}
                          
                          <div className="space-y-4 text-xs font-bold text-slate-300">
                            {content ? content.split('\n').map((para, i) => {
                              const trimmed = para.trim();
                              if (trimmed.startsWith('###')) {
                                return (
                                  <h3 key={i} className="text-base font-black mt-5 mb-2 border-r-4 border-blue-500 pr-2 text-white">
                                    {trimmed.replace('###', '').trim()}
                                  </h3>
                                );
                              } else if (trimmed.startsWith('##')) {
                                return (
                                  <h3 key={i} className="text-lg font-black mt-6 mb-3 border-r-4 border-blue-500 pr-2 text-white">
                                    {trimmed.replace('##', '').trim()}
                                  </h3>
                                );
                              } else if (trimmed === '---') {
                                return <hr key={i} className="my-4 border-slate-800" />;
                              } else if (trimmed.startsWith('>')) {
                                return (
                                  <blockquote key={i} className="my-3 border-r-4 border-amber-500 bg-slate-900 px-4 py-2 rounded-l-lg text-slate-300 italic">
                                    {trimmed.substring(1).trim()}
                                  </blockquote>
                                );
                              } else if (trimmed.startsWith('➕')) {
                                return (
                                  <div key={i} className="flex items-center gap-2 my-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-lg text-emerald-300 text-[11px] font-black">
                                    <span>➕</span>
                                    <span>{trimmed.substring(1).trim()}</span>
                                  </div>
                                );
                              } else if (trimmed.startsWith('➖')) {
                                return (
                                  <div key={i} className="flex items-center gap-2 my-2 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-lg text-rose-300 text-[11px] font-black">
                                    <span>➖</span>
                                    <span>{trimmed.substring(1).trim()}</span>
                                  </div>
                                );
                              } else if (trimmed.startsWith('💡')) {
                                return (
                                  <div key={i} className="my-4 bg-gradient-to-l from-blue-900/40 to-indigo-900/20 border border-blue-800 p-4 rounded-xl text-blue-200 flex items-start gap-2">
                                    <span className="text-sm">💡</span>
                                    <div>
                                      <h4 className="text-white font-black text-xs mb-0.5">نکته کلیدی</h4>
                                      <p className="text-[11px] leading-relaxed">{trimmed.substring(1).trim()}</p>
                                    </div>
                                  </div>
                                );
                              } else if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
                                return (
                                  <li key={i} className="mr-4 mb-2 list-disc text-slate-300 leading-relaxed">
                                    {trimmed.substring(1).trim()}
                                  </li>
                                );
                              } else if (trimmed.length > 0) {
                                return <p key={i} className="mb-3 leading-relaxed text-justify text-slate-300">{trimmed}</p>;
                              }
                              return null;
                            }) : (
                              <p className="text-slate-500 text-center py-10">هیچ محتوایی وارد نشده است.</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Toggle review specifications */}
                    <div className="md:col-span-2 flex items-center gap-2 border-t border-slate-800 pt-4">
                      <input
                        type="checkbox"
                        id="isReviewCheck"
                        checked={isReview}
                        onChange={(e) => setIsReview(e.target.checked)}
                        className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-slate-800 rounded bg-slate-950"
                      />
                      <label htmlFor="isReviewCheck" className="text-xs font-black text-slate-200 cursor-pointer">
                        این مقاله یک بررسی فنی تخصصی است (افزودن مشخصات فنی خودرو برای مقایسه)
                      </label>
                    </div>

                    {/* Technical Specifications Subform */}
                    {isReview && (
                      <div className="md:col-span-2 rounded-2xl bg-slate-950 border border-slate-800 p-5 space-y-4 animate-fade-in text-right">
                        <h3 className="text-xs font-bold text-white border-b border-slate-800 pb-2 flex items-center gap-1.5">
                          <Sliders className="h-4 w-4 text-blue-400" />
                          اطلاعات فنی خودرو
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {[
                            { label: 'موتور / سیستم پیشرانه', key: 'engine', placeholder: 'مثال: ۴ لیتری ۶ سیلندر' },
                            { label: 'حداکثر قدرت', key: 'power', placeholder: 'مثال: ۵۱۸ اسب بخار' },
                            { label: 'حداکثر گشتاور', key: 'torque', placeholder: 'مثال: ۴۶۵ نیوتن متر' },
                            { label: 'شتاب ۰ تا ۱۰۰', key: 'acceleration', placeholder: 'مثال: ۳.۲ ثانیه' },
                            { label: 'حداکثر سرعت', key: 'topSpeed', placeholder: 'مثال: ۲۹۶ کیلومتر بر ساعت' },
                            { label: 'مصرف سوخت ترکیبی', key: 'consumption', placeholder: 'مثال: ۱۳.۴ لیتر در ۱۰۰ کیلومتر' },
                            { label: 'قیمت تقریبی جهانی', key: 'price', placeholder: 'مثال: ۲۲۳,۰۰۰ دلار' },
                          ].map((field) => (
                            <div key={field.key}>
                              <label className="block text-[10px] font-bold text-slate-400 mb-1">{field.label}</label>
                              <input
                                type="text"
                                value={specs[field.key as keyof CarSpecs] || ''}
                                onChange={(e) => setSpecs({ ...specs, [field.key]: e.target.value })}
                                placeholder={field.placeholder}
                                className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>

                  <div className="flex gap-3 justify-end border-t border-slate-800 pt-4">
                    {editingId && (
                      <button
                        type="button"
                        onClick={resetArticleForm}
                        className="rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold text-xs px-6 py-3 transition-all cursor-pointer"
                      >
                        لغو ویرایش
                      </button>
                    )}
                    <button
                      type="submit"
                      className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs px-6 py-3 shadow-lg border border-blue-400/20 transition-all cursor-pointer"
                      id="save-article-btn"
                    >
                      {editingId ? 'بروزرسانی تغییرات' : 'انتشار نهایی مقاله'}
                    </button>
                  </div>

                </form>
              </div>

            </div>
          )}

          {/* TAB 2: ARTICLES MANAGEMENT */}
          {activeTab === 'articles' && (
            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-2xl text-right" id="admin-articles-list">
              <h2 className="text-base font-black text-white mb-6 pb-3 border-b border-slate-800">کل مقالات منتشر شده</h2>

              {articles.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">هیچ مقاله‌ای یافت نشد.</p>
              ) : (
                <div className="space-y-4">
                  {articles.map((art) => (
                    <div key={art.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-950 border border-slate-850 rounded-2xl gap-4 hover:bg-slate-800 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="h-14 w-14 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-800">
                          <img src={art.imageUrl} alt={art.title} className="w-full h-full object-cover" referrerPolicy="referrer" />
                        </div>
                        <div>
                          <h3 className="text-xs font-black text-white line-clamp-1">{art.title}</h3>
                          <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium mt-1">
                            <span>دسته: {art.categoryLabel}</span>
                            <span>نویسنده: {art.author}</span>
                            <span>تاریخ: {formatDate(art.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t border-slate-800 sm:border-t-0 pt-2 sm:pt-0">
                        <button
                          onClick={() => handleStartEdit(art)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-650 transition-all shadow-sm cursor-pointer"
                        >
                          <Edit className="h-3.5 w-3.5 text-blue-400" />
                          <span>ویرایش</span>
                        </button>
                        <button
                          onClick={() => handleDeleteArticle(art.id)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>حذف</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: COMMENTS MODERATION */}
          {activeTab === 'comments' && (
            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-2xl text-right" id="admin-comments-moderation">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
                <h2 className="text-base font-black text-white">تعدیل دیدگاه‌های ثبت شده</h2>
                <button
                  onClick={loadComments}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-750 transition-all cursor-pointer"
                >
                  <RefreshCw className={`h-3 w-3 ${loadingComments ? 'animate-spin' : ''}`} />
                  <span>بروزرسانی</span>
                </button>
              </div>

              {loadingComments ? (
                <div className="py-8 text-center text-xs text-slate-400">در حال بارگذاری دیدگاه‌ها...</div>
              ) : comments.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">هیچ دیدگاهی برای نمایش وجود ندارد.</p>
              ) : (
                <div className="space-y-4">
                  {comments.map((comm) => {
                    const parentArt = articles.find(a => a.id === comm.articleId);
                    return (
                      <div key={comm.id} className="p-4 bg-slate-950 border border-slate-850 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div>
                            <span className="text-xs font-black text-white">{comm.name}</span>
                            <span className="text-[10px] text-slate-400 font-medium mr-2">({comm.email})</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium">{formatDate(comm.createdAt)}</span>
                        </div>

                        {parentArt && (
                          <div className="text-[10px] text-blue-300 font-bold bg-blue-500/10 border border-blue-500/20 inline-block px-2.5 py-1 rounded-lg">
                            مربوط به مقاله: {parentArt.title}
                          </div>
                        )}

                        <p className="text-xs text-slate-300 leading-relaxed bg-slate-900 p-3 rounded-xl border border-slate-800">
                          {comm.content}
                        </p>

                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => handleDeleteComment(comm.id)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>حذف این نظر</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SYSTEM SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-2xl text-right" id="admin-site-settings">
              <h2 className="text-base font-black text-white mb-6 pb-3 border-b border-slate-800">تنظیمات عمومی و کاربری مجله</h2>

              <form onSubmit={handleSaveSettings} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Site Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">عنوان مجله خودرویی *</label>
                    <input
                      type="text"
                      required
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-right"
                    />
                  </div>

                  {/* Contact Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">ایمیل ارتباطی با مدیر *</label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-left"
                    />
                  </div>

                  {/* Site Description */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">شرح کوتاه سایت (توضیحات هدر) *</label>
                    <input
                      type="text"
                      required
                      value={siteDescription}
                      onChange={(e) => setSiteDescription(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-right"
                    />
                  </div>

                  {/* About Text */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">درباره ما (نمایش در فوتر) *</label>
                    <textarea
                      required
                      rows={4}
                      value={aboutText}
                      onChange={(e) => setAboutText(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-right"
                    ></textarea>
                  </div>

                  {/* Admin Passcode */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">رمز عبور ورود به پنل مدیریت *</label>
                    <input
                      type="text"
                      required
                      value={adminPasscode}
                      onChange={(e) => setAdminPasscode(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-center font-mono"
                    />
                  </div>

                </div>

                {/* Custom Categories Management Subsection */}
                <div className="border-t border-slate-800 pt-6 mt-6 space-y-4">
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <SettingsIcon className="h-4.5 w-4.5 text-blue-500" />
                      <span>مدیریت دسته‌بندی‌های دلخواه مجله</span>
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-1">
                      دسته‌بندی‌های سایت را اضافه یا حذف کنید. برای اعمال و ذخیره نهایی تغییرات در دیتابیس، حتماً دکمه «ذخیره تنظیمات سایت» در پایین را فشار دهید.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-950 p-5 rounded-2xl border border-slate-850">
                    {/* Add Category Form */}
                    <div className="space-y-4 md:col-span-1">
                      <span className="block text-[11px] font-black text-white border-b border-slate-800 pb-2">افزودن دسته‌بندی جدید</span>
                      
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">شناسه یکتا (به انگلیسی - slug)</label>
                        <input
                          type="text"
                          value={newCatId}
                          onChange={(e) => setNewCatId(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
                          placeholder="مثال: offroad"
                          className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 text-left font-mono"
                          dir="ltr"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">عنوان فارسی دسته‌بندی</label>
                        <input
                          type="text"
                          value={newCatLabel}
                          onChange={(e) => setNewCatLabel(e.target.value)}
                          placeholder="مثال: خودروهای آفرود"
                          className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 text-right"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">آیکون نمایشی</label>
                        <select
                          value={newCatIcon}
                          onChange={(e) => setNewCatIcon(e.target.value)}
                          className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 [&_option]:bg-slate-950 text-right"
                        >
                          <option value="Car">خودرو (Car)</option>
                          <option value="Newspaper">روزنامه (Newspaper)</option>
                          <option value="Cpu">سی‌پی‌یو / تکنولوژی (Cpu)</option>
                          <option value="Sliders">تنظیمات / فنی (Sliders)</option>
                          <option value="Zap">انرژی / برقی (Zap)</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddCategory}
                        className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2.5 shadow-md transition-all cursor-pointer"
                      >
                        افزودن به لیست
                      </button>
                    </div>

                    {/* Active Categories List */}
                    <div className="md:col-span-2 space-y-3">
                      <span className="block text-[11px] font-black text-white border-b border-slate-800 pb-2">دسته‌بندی‌های فعال فعلی</span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[240px] overflow-y-auto pr-1">
                        {customCats.map((cat) => {
                          const IconComp = {
                            Car: Car,
                            Newspaper: Newspaper,
                            Cpu: Cpu,
                            Sliders: Sliders,
                            Zap: Zap,
                          }[cat.iconName || 'Car'] || Car;

                          return (
                            <div key={cat.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition-all">
                              <div className="flex items-center gap-2.5">
                                <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                                  <IconComp className="h-4 w-4" />
                                </div>
                                <div className="text-right">
                                  <span className="block text-[11px] font-black text-white">{cat.label}</span>
                                  <span className="block text-[9px] font-mono text-slate-500">{cat.id}</span>
                                </div>
                              </div>
                              
                              <button
                                type="button"
                                onClick={() => handleRemoveCategory(cat.id)}
                                className="h-7 w-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 flex items-center justify-center transition-all cursor-pointer"
                                title="حذف دسته‌بندی"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end border-t border-slate-800 pt-4">
                  <button
                    type="submit"
                    className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs px-6 py-3 shadow-lg border border-blue-400/20 transition-all cursor-pointer"
                  >
                    ذخیره تنظیمات سایت
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
