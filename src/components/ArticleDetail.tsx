import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Calendar,
  Eye,
  Heart,
  User,
  MessageSquare,
  Send,
  Sparkles,
  Share2,
  Gauge,
  Zap,
  Tag
} from 'lucide-react';
import { Article, Comment } from '../types';
import { getComments, addComment, incrementArticleLikes, incrementArticleViews } from '../lib/firebase';
import { motion } from 'motion/react';

interface ArticleDetailProps {
  article: Article;
  onBack: () => void;
  onRefreshArticles: () => void;
}

export default function ArticleDetail({ article, onBack, onRefreshArticles }: ArticleDetailProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [likesCount, setLikesCount] = useState(article.likes);
  const [hasLiked, setHasLiked] = useState(false);
  const [loadingComments, setLoadingComments] = useState(true);

  // New Comment Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState(false);

  // Fetch comments and increment views on mount
  useEffect(() => {
    let active = true;

    async function init() {
      // Increment views
      await incrementArticleViews(article.id);
      
      // Load comments
      try {
        const data = await getComments(article.id);
        if (active) {
          setComments(data);
          setLoadingComments(false);
        }
      } catch (err) {
        console.error('Error fetching comments:', err);
        if (active) setLoadingComments(false);
      }
    }

    init();

    return () => {
      active = false;
    };
  }, [article.id]);

  const handleLike = async () => {
    if (hasLiked) return;
    setHasLiked(true);
    setLikesCount(prev => prev + 1);
    await incrementArticleLikes(article.id);
    onRefreshArticles(); // update main view as well
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !commentText) return;

    setSubmittingComment(true);
    try {
      await addComment({
        articleId: article.id,
        name,
        email,
        content: commentText
      });
      
      // Refresh comments
      const updatedComments = await getComments(article.id);
      setComments(updatedComments);
      
      // Reset form
      setCommentText('');
      setCommentSuccess(true);
      setTimeout(() => setCommentSuccess(false), 4000);
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.shortDescription,
        url: window.location.href,
      }).catch(err => console.log(err));
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('لینک مقاله با موفقیت در حافظه کپی شد!');
    }
  };

  return (
    <div className="mx-auto max-w-4xl py-6" id="article-detail-view">
      
      {/* Back button */}
      <button
        onClick={onBack}
        className="group mb-6 flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 px-5 py-3 text-sm font-black text-slate-200 hover:bg-slate-800 hover:text-white transition-all duration-300 shadow-xl cursor-pointer"
        id="detail-back-btn"
      >
        <ArrowRight className="h-4.5 w-4.5 transform group-hover:translate-x-1 transition-transform" />
        <span>بازگشت به مقالات</span>
      </button>

      {/* Main Container */}
      <div className="overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
        
        {/* Cover image */}
        <div className="relative aspect-[16/9] w-full bg-slate-950 overflow-hidden">
          <img
            src={article.imageUrl || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200'}
            alt={article.title}
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent"></div>
        </div>

        {/* Article Body Wrapper */}
        <div className="p-6 md:p-12">
          
          {/* Header Metadata */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="inline-flex items-center gap-1 px-4 py-1.5 text-sm font-black rounded-lg bg-blue-900/90 text-blue-200 border border-blue-800">
              {article.categoryLabel}
            </span>
            <div className="flex items-center gap-6 text-sm text-slate-300 font-bold">
              <span className="flex items-center gap-1.5">
                <User className="h-4.5 w-4.5 text-blue-400" />
                <span>نویسنده: {article.author}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4.5 w-4.5 text-blue-400" />
                <span>{formatDate(article.createdAt)}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="h-4.5 w-4.5 text-blue-400" />
                <span>{(article.views + 1).toLocaleString('fa-IR')} بازدید</span>
              </span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-8">
            {article.title}
          </h1>

          {/* Short Description highlight box */}
          <div className="mb-10 border-r-4 border-blue-500 bg-slate-950 border border-slate-800 p-6 rounded-l-2xl text-slate-100 text-base md:text-lg leading-relaxed font-semibold">
            {article.shortDescription}
          </div>

          {/* Core Content */}
          <div className="markdown-body mb-12 text-slate-200" id="article-main-content">
            {article.content.split('\n').map((para, i) => {
              const trimmed = para.trim();
              if (trimmed.startsWith('###')) {
                return (
                  <h3 key={i} className="text-2xl font-black mt-10 mb-5 border-r-4 border-blue-500 pr-4 text-white">
                    {trimmed.replace('###', '').trim()}
                  </h3>
                );
              } else if (trimmed.startsWith('##')) {
                return (
                  <h3 key={i} className="text-3xl font-black mt-12 mb-6 border-r-4 border-blue-500 pr-4 text-white">
                    {trimmed.replace('##', '').trim()}
                  </h3>
                );
              } else if (trimmed === '---') {
                return <hr key={i} className="my-8 border-slate-800" />;
              } else if (trimmed.startsWith('>')) {
                return (
                  <blockquote key={i} className="my-6 border-r-4 border-amber-500 bg-slate-900/60 px-6 py-4 rounded-l-xl text-slate-300 italic font-bold leading-relaxed">
                    {trimmed.substring(1).trim()}
                  </blockquote>
                );
              } else if (trimmed.startsWith('➕')) {
                return (
                  <div key={i} className="flex items-center gap-2.5 my-2.5 bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-xl text-emerald-300 text-sm font-black">
                    <span className="text-lg">➕</span>
                    <span>{trimmed.substring(1).trim()}</span>
                  </div>
                );
              } else if (trimmed.startsWith('➖')) {
                return (
                  <div key={i} className="flex items-center gap-2.5 my-2.5 bg-rose-500/10 border border-rose-500/20 px-4 py-3 rounded-xl text-rose-300 text-sm font-black">
                    <span className="text-lg">➖</span>
                    <span>{trimmed.substring(1).trim()}</span>
                  </div>
                );
              } else if (trimmed.startsWith('💡')) {
                return (
                  <div key={i} className="my-6 bg-gradient-to-l from-blue-900/40 to-indigo-900/20 border border-blue-800 px-6 py-5 rounded-2xl text-blue-200 text-base font-bold flex items-start gap-3">
                    <span className="text-xl mt-0.5">💡</span>
                    <div>
                      <h4 className="text-white font-black text-sm mb-1">نکته کلیدی</h4>
                      <p className="text-sm leading-relaxed">{trimmed.substring(1).trim()}</p>
                    </div>
                  </div>
                );
              } else if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
                return (
                  <li key={i} className="mr-6 mb-3 list-disc text-slate-200 text-base font-bold leading-relaxed">
                    {trimmed.substring(1).trim()}
                  </li>
                );
              } else if (trimmed.length > 0) {
                return <p key={i} className="mb-6 leading-loose text-justify text-slate-200 text-base md:text-lg font-bold">{trimmed}</p>;
              }
              return null;
            })}
          </div>

          {/* Specifications Table (If reviews or specified) */}
          {article.specs && (
            <div className="mb-10 rounded-2xl border border-slate-800 bg-slate-950 p-6" id="article-specs-card">
              <div className="flex items-center gap-2 border-b border-slate-850 pb-3 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-900/20 text-blue-400 border border-blue-800">
                  <Gauge className="h-5.5 w-5.5" />
                </div>
                <h3 className="text-lg font-black text-white">مشخصات فنی و عملکردی</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'موتور / سیستم پیشرانه', value: article.specs.engine },
                  { label: 'حداکثر قدرت موتور', value: article.specs.power },
                  { label: 'حداکثر گشتاور خروزی', value: article.specs.torque },
                  { label: 'شتاب صفر تا صد', value: article.specs.acceleration },
                  { label: 'حداکثر سرعت ایمن', value: article.specs.topSpeed },
                  { label: 'مصرف سوخت ترکیبی', value: article.specs.consumption },
                  { label: 'قیمت تقریبی جهانی', value: article.specs.price },
                ].map((spec, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-900 rounded-xl border border-slate-800 shadow-sm">
                    <span className="text-sm text-slate-300 font-bold">{spec.label}</span>
                    <span className="text-sm font-black text-white text-left">{spec.value || 'نامشخص'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer of Article: Like and Share Actions */}
          <div className="flex items-center justify-between border-t border-b border-slate-800 py-6 my-10">
            <div className="flex items-center gap-3">
              <button
                onClick={handleLike}
                disabled={hasLiked}
                className={`flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-black transition-all duration-300 shadow-xl cursor-pointer ${
                  hasLiked
                    ? 'bg-blue-900/40 text-blue-300 border border-blue-800 cursor-not-allowed'
                    : 'bg-slate-800 text-slate-200 hover:text-white border border-slate-700 hover:border-slate-650'
                }`}
                id="like-btn"
              >
                <Heart className={`h-5 w-5 ${hasLiked ? 'fill-blue-400 text-blue-400' : ''}`} />
                <span>{hasLiked ? 'مقاله‌ را پسندیدید' : 'این مقاله را می‌پسندم'} ({likesCount.toLocaleString('fa-IR')})</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center justify-center h-12 w-12 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-750 hover:border-slate-650 transition-all shadow-xl cursor-pointer"
                title="اشتراک گذاری"
              >
                <Share2 className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-300 font-bold">
              <Tag className="h-5 w-5 text-blue-400" />
              <span>دسته: {article.categoryLabel}</span>
            </div>
          </div>

          {/* Comments Section */}
          <div className="mt-14" id="comments-section">
            <div className="flex items-center gap-2.5 mb-8 border-b border-slate-800 pb-4">
              <MessageSquare className="h-6 w-6 text-blue-400" />
              <h2 className="text-xl font-black text-white">نظرات کاربران ({comments.length.toLocaleString('fa-IR')})</h2>
            </div>

            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="bg-slate-950 border border-slate-800 p-6 rounded-2xl mb-10">
              <h3 className="text-base font-black text-white mb-5 flex items-center gap-1.5">
                <Sparkles className="h-5 w-5 text-blue-400" />
                دیدگاه خود را ثبت کنید
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">نام و نام خانوادگی *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: رضا محمدی"
                    className="w-full rounded-xl bg-slate-900 border border-slate-800 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-right"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">آدرس ایمیل * (منتشر نخواهد شد)</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    className="w-full rounded-xl bg-slate-900 border border-slate-800 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-left"
                  />
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-bold text-slate-300 mb-2">متن دیدگاه شما *</label>
                <textarea
                  required
                  rows={4}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="دیدگاه خود را درباره این خودرو یا مقاله بنویسید..."
                  className="w-full rounded-xl bg-slate-900 border border-slate-800 px-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-right"
                ></textarea>
              </div>

              <div className="flex items-center justify-between flex-wrap gap-4">
                <button
                  type="submit"
                  disabled={submittingComment}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm px-7 py-3.5 shadow-lg border border-blue-400/20 transition-all cursor-pointer"
                >
                  <span>{submittingComment ? 'در حال ثبت...' : 'ارسال دیدگاه'}</span>
                  <Send className="h-4 w-4" />
                </button>

                {commentSuccess && (
                  <span className="text-sm font-black text-emerald-400 animate-fade-in">
                    ✓ دیدگاه شما با موفقیت ثبت شد و به زودی نمایش داده می‌شود.
                  </span>
                )}
              </div>
            </form>

            {/* Comments List */}
            {loadingComments ? (
              <div className="py-10 text-center text-sm text-slate-400 font-bold">در حال بارگذاری نظرات...</div>
            ) : comments.length === 0 ? (
              <div className="py-12 text-center bg-slate-950 rounded-xl border border-dashed border-slate-800 text-sm text-slate-400 font-bold">
                هیچ دیدگاهی برای این مقاله ثبت نشده است. اولین نفری باشید که دیدگاه خود را می‌نویسد!
              </div>
            ) : (
              <div className="space-y-5">
                {comments.map((comment) => (
                  <div key={comment.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 shadow-lg flex gap-4 items-start">
                    {/* Fake avatar */}
                    <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 font-black text-sm shrink-0 shadow-sm border border-blue-500/20">
                      {comment.name.charAt(0)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                        <span className="text-sm font-black text-white">{comment.name}</span>
                        <span className="text-xs text-slate-400 font-bold">{formatDate(comment.createdAt)}</span>
                      </div>
                      <p className="text-sm text-slate-200 leading-relaxed font-semibold">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
