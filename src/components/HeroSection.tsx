import React from 'react';
import { Calendar, User, Eye, ArrowLeft, Award, Zap, Sliders, Newspaper } from 'lucide-react';
import { Article } from '../types';
import { motion } from 'motion/react';

interface HeroSectionProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
}

export default function HeroSection({ articles, onSelectArticle }: HeroSectionProps) {
  if (articles.length === 0) return null;

  const featured = articles[0]; // Take the latest article as featured

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'news': return <Newspaper className="h-4.5 w-4.5" />;
      case 'achievement': return <Award className="h-4.5 w-4.5" />;
      case 'review': return <Sliders className="h-4.5 w-4.5" />;
      case 'electric': return <Zap className="h-4.5 w-4.5" />;
      default: return null;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'news': return 'bg-blue-900/90 text-blue-100 border border-blue-700/80';
      case 'achievement': return 'bg-indigo-900/90 text-indigo-100 border border-indigo-700/80';
      case 'review': return 'bg-purple-900/90 text-purple-100 border border-purple-700/80';
      case 'electric': return 'bg-emerald-900/90 text-emerald-100 border border-emerald-700/80';
      default: return 'bg-slate-800/90 text-slate-200 border border-slate-700/80';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-2xl mb-12" id="hero-section">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={featured.imageUrl || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200'}
          alt={featured.title}
          className="h-full w-full object-cover opacity-50 transform scale-102 hover:scale-100 transition-transform duration-10000"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-l from-slate-950/70 via-slate-950/30 to-transparent"></div>
      </div>

      {/* Content Area */}
      <div className="relative z-10 max-w-5xl px-6 py-20 md:py-28 md:px-14 flex flex-col items-start gap-5 text-right">
        
        {/* Animated Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`flex items-center gap-1.5 px-4.5 py-2 rounded-full text-sm font-black ${getCategoryColor(featured.category)}`}
          id="hero-badge"
        >
          {getCategoryIcon(featured.category)}
          <span>{featured.categoryLabel}</span>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl md:text-5xl lg:text-6xl font-black leading-tight text-white"
          id="hero-title"
        >
          {featured.title}
        </motion.h2>

        {/* Short Description */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-slate-200 text-base md:text-lg max-w-3xl leading-relaxed mt-3"
          id="hero-desc"
        >
          {featured.shortDescription}
        </motion.p>

        {/* Meta info */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap items-center gap-x-8 gap-y-3 mt-5 text-sm text-slate-300 font-bold"
          id="hero-meta"
        >
          <div className="flex items-center gap-1.5">
            <User className="h-4.5 w-4.5 text-blue-400" />
            <span>نویسنده: {featured.author}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4.5 w-4.5 text-blue-400" />
            <span>{formatDate(featured.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Eye className="h-4.5 w-4.5 text-blue-400" />
            <span>{featured.views.toLocaleString('fa-IR')} بازدید</span>
          </div>
        </motion.div>

        {/* Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          onClick={() => onSelectArticle(featured)}
          className="group flex items-center gap-2 mt-8 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 px-8 py-4 text-base font-extrabold text-white shadow-xl shadow-blue-600/20 border border-blue-400/20 transition-all duration-300 cursor-pointer"
          id="hero-cta-btn"
        >
          <span>مطالعه کامل مقاله</span>
          <ArrowLeft className="h-4.5 w-4.5 transform group-hover:-translate-x-1 transition-transform" />
        </motion.button>

      </div>
    </div>
  );
}
