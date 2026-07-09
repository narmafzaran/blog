import React from 'react';
import { Calendar, Eye, Heart, User, ArrowLeft, Zap, Award, Sliders, Newspaper } from 'lucide-react';
import { Article } from '../types';
import { motion } from 'motion/react';

interface ArticleCardProps {
  key?: string;
  article: Article;
  onSelect: (article: Article) => void;
}

export default function ArticleCard({ article, onSelect }: ArticleCardProps) {
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'news': return <Newspaper className="h-3.5 w-3.5" />;
      case 'achievement': return <CpuIcon className="h-3.5 w-3.5" />;
      case 'review': return <Sliders className="h-3.5 w-3.5" />;
      case 'electric': return <Zap className="h-3.5 w-3.5" />;
      default: return null;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'news': return 'bg-blue-950/95 text-blue-300 border-blue-800';
      case 'achievement': return 'bg-indigo-950/95 text-indigo-300 border-indigo-800';
      case 'review': return 'bg-purple-950/95 text-purple-300 border-purple-800';
      case 'electric': return 'bg-emerald-950/95 text-emerald-300 border-emerald-800';
      default: return 'bg-slate-900/95 text-slate-200 border-slate-800';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4 }}
      className="group flex flex-col overflow-hidden rounded-2xl bg-slate-900 border border-slate-850 hover:border-slate-700 shadow-xl hover:shadow-2xl transition-all duration-300"
      id={`article-card-${article.id}`}
    >
      {/* Article Image Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
        <img
          src={article.imageUrl || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=600'}
          alt={article.title}
          className="h-full w-full object-cover transform group-hover:scale-102 transition-transform duration-500"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
        {/* Dark vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent"></div>
        
        {/* Category Floating Badge */}
        <span className={`absolute top-4 right-4 flex items-center gap-1 px-3.5 py-1.5 text-xs font-black rounded-lg border shadow-lg ${getCategoryColor(article.category)}`}>
          {article.categoryLabel}
        </span>
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-6">
        
        {/* Author & Date line */}
        <div className="flex items-center justify-between text-xs text-slate-300 mb-3.5 font-bold">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4 text-blue-400" />
            <span>{article.author}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-blue-400" />
            <span>{formatDate(article.createdAt)}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-black leading-snug text-white group-hover:text-blue-400 line-clamp-2 mb-2.5 transition-colors">
          {article.title}
        </h3>

        {/* Short Description */}
        <p className="text-slate-300 text-sm leading-relaxed line-clamp-3 mb-5 font-medium">
          {article.shortDescription}
        </p>

        {/* Spacer to push metrics to bottom */}
        <div className="mt-auto pt-4 border-t border-slate-800/80 flex items-center justify-between">
          
          {/* Interaction stats */}
          <div className="flex items-center gap-3 text-xs text-slate-300 font-bold">
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4 text-slate-400" />
              <span>{article.views.toLocaleString('fa-IR')}</span>
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-4 w-4 text-blue-400" />
              <span>{article.likes.toLocaleString('fa-IR')}</span>
            </span>
          </div>

          {/* Action trigger */}
          <button
            onClick={() => onSelect(article)}
            className="flex items-center gap-1 text-sm font-black text-blue-400 group-hover:translate-x-[-4px] transition-transform cursor-pointer"
          >
            <span>ادامه مطلب</span>
            <ArrowLeft className="h-4 w-4" />
          </button>

        </div>
      </div>
    </motion.article>
  );
}

// Inline fallback icon for achievement
function CpuIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="16" height="16" x="4" y="4" rx="2" />
      <rect width="6" height="6" x="9" y="9" rx="1" />
      <path d="M9 1v3" />
      <path d="M15 1v3" />
      <path d="M9 20v3" />
      <path d="M15 20v3" />
      <path d="M20 9h3" />
      <path d="M20 15h3" />
      <path d="M1 9h3" />
      <path d="M1 15h3" />
    </svg>
  );
}
