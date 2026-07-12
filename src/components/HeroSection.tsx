import React from 'react';
import { Calendar, User, Eye, ArrowLeft, Award, Zap, Sliders, Newspaper, MessageSquare, Flame } from 'lucide-react';
import { Article } from '../types';
import { motion } from 'motion/react';

interface HeroSectionProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
}

export default function HeroSection({ articles, onSelectArticle }: HeroSectionProps) {
  if (articles.length === 0) return null;

  const featured = articles[0]; // Primary featured article (latest)
  const secondary1 = articles[1]; // Secondary featured article
  const secondary2 = articles[2]; // Tertiary featured article

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'news': return <Newspaper className="h-4 w-4" />;
      case 'achievement': return <Award className="h-4 w-4" />;
      case 'review': return <Sliders className="h-4 w-4" />;
      case 'electric': return <Zap className="h-4 w-4" />;
      default: return null;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'news': return 'bg-[#001224] text-[#6a9ab0] border-[#3a6d8c]/30';
      case 'achievement': return 'bg-[#001224] text-[#ead8b1] border-[#ead8b1]/30';
      case 'review': return 'bg-[#001224] text-sky-200 border-[#3a6d8c]/20';
      case 'electric': return 'bg-[#001224] text-emerald-400 border-emerald-500/20';
      default: return 'bg-[#001224] text-slate-300 border-white/5';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('fa-IR', {
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12" id="hero-bento-grid">
      
      {/* 1. PRIMARY FEATURED STORY (Takes 8 columns on large screens) */}
      <motion.div 
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.5 }}
         onClick={() => onSelectArticle(featured)}
         className="lg:col-span-8 group relative overflow-hidden rounded-3xl border border-[#3a6d8c]/15 bg-[#001f3f] text-white shadow-2xl aspect-[16/10] lg:aspect-auto lg:h-[500px] cursor-pointer flex flex-col justify-end hover:border-[#ead8b1]/30 transition-colors"
         id="hero-primary-card"
       >
         {/* Background Image with Slow Zoom on Hover */}
         <div className="absolute inset-0 z-0">
           <img
             src={featured.imageUrl || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200'}
             alt={featured.title}
             className="h-full w-full object-cover opacity-60 transform group-hover:scale-103 transition-transform duration-700 ease-out"
             referrerPolicy="no-referrer"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-transparent"></div>
           <div className="absolute inset-0 bg-gradient-to-l from-slate-950/40 via-transparent to-transparent"></div>
         </div>
 
         {/* Sticky Label: "گزارش ویژه سرعت" */}
         <div className="absolute top-5 right-5 flex items-center gap-1.5 bg-[#ead8b1] text-[#001f3f] text-[11px] font-black px-3 py-1 rounded-full shadow-lg border border-[#ead8b1]/30 tracking-wider animate-pulse z-10">
           <Flame className="h-3.5 w-3.5 fill-[#001f3f]" />
           <span>گزارش ویژه سرعت‌گیر</span>
         </div>
 
         {/* Content Panel */}
         <div className="relative z-10 p-6 md:p-10 flex flex-col items-start gap-3 text-right">
           <span className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-black border ${getCategoryColor(featured.category)}`}>
             {getCategoryIcon(featured.category)}
             <span>{featured.categoryLabel}</span>
           </span>
 
           <h1 className="text-2xl md:text-4xl lg:text-4xl font-black leading-tight text-white group-hover:text-[#ead8b1] transition-colors mt-1.5">
             {featured.title}
           </h1>
 
           <p className="text-slate-300 text-sm md:text-base max-w-2xl leading-relaxed mt-1 line-clamp-2 font-medium">
             {featured.shortDescription}
           </p>
 
           {/* Metadata Grid */}
           <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-xs text-slate-400 font-bold border-t border-[#3a6d8c]/15 pt-4 w-full">
             <div className="flex items-center gap-1">
               <User className="h-4 w-4 text-[#6a9ab0]" />
               <span>{featured.author}</span>
             </div>
             <div className="flex items-center gap-1">
               <Calendar className="h-4 w-4 text-[#6a9ab0]" />
               <span>{formatDate(featured.createdAt)}</span>
             </div>
             <div className="flex items-center gap-1">
               <Eye className="h-4 w-4 text-[#6a9ab0]" />
               <span>{featured.views.toLocaleString('fa-IR')} بازدید</span>
             </div>
           </div>
         </div>
       </motion.div>
 
       {/* 2. SECONDARY & TERTIARY STORIES (Takes 4 columns on large screens) */}
       <div className="lg:col-span-4 flex flex-col gap-6" id="hero-secondary-column">
         
         {/* SECONDARY STORY CARD */}
         {secondary1 ? (
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: 0.15 }}
             onClick={() => onSelectArticle(secondary1)}
             className="flex-1 group relative overflow-hidden rounded-3xl border border-[#3a6d8c]/15 bg-[#001f3f] text-white shadow-xl cursor-pointer flex flex-col justify-end min-h-[238px] hover:border-[#ead8b1]/30 transition-colors"
             id="hero-secondary-card-1"
           >
             <div className="absolute inset-0 z-0">
               <img
                 src={secondary1.imageUrl || 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=600'}
                 alt={secondary1.title}
                 className="h-full w-full object-cover opacity-45 transform group-hover:scale-103 transition-transform duration-700 ease-out"
                 referrerPolicy="no-referrer"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent"></div>
             </div>
 
             <div className="relative z-10 p-5 flex flex-col items-start gap-2 text-right">
               <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-black border ${getCategoryColor(secondary1.category)}`}>
                 {getCategoryIcon(secondary1.category)}
                 <span>{secondary1.categoryLabel}</span>
               </span>
 
               <h2 className="text-base md:text-lg font-black leading-snug text-white group-hover:text-[#ead8b1] transition-colors mt-1 line-clamp-2">
                 {secondary1.title}
               </h2>
 
               <div className="flex items-center gap-4 text-[11px] text-slate-400 font-bold mt-2">
                 <span>{secondary1.author}</span>
                 <span>•</span>
                 <span>{formatDate(secondary1.createdAt)}</span>
               </div>
             </div>
           </motion.div>
         ) : (
           <div className="flex-1 bg-[#001f3f]/50 rounded-3xl border border-[#3a6d8c]/10 border-dashed flex items-center justify-center text-slate-500 text-xs font-bold">
             محتوای بیشتری وجود ندارد
           </div>
         )}
 
         {/* TERTIARY STORY CARD */}
         {secondary2 ? (
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: 0.25 }}
             onClick={() => onSelectArticle(secondary2)}
             className="flex-1 group relative overflow-hidden rounded-3xl border border-[#3a6d8c]/15 bg-[#001f3f] text-white shadow-xl cursor-pointer flex flex-col justify-end min-h-[238px] hover:border-[#ead8b1]/30 transition-colors"
             id="hero-secondary-card-2"
           >
             <div className="absolute inset-0 z-0">
               <img
                 src={secondary2.imageUrl || 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80&w=600'}
                 alt={secondary2.title}
                 className="h-full w-full object-cover opacity-45 transform group-hover:scale-103 transition-transform duration-700 ease-out"
                 referrerPolicy="no-referrer"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent"></div>
             </div>
 
             <div className="relative z-10 p-5 flex flex-col items-start gap-2 text-right">
               <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-black border ${getCategoryColor(secondary2.category)}`}>
                 {getCategoryIcon(secondary2.category)}
                 <span>{secondary2.categoryLabel}</span>
               </span>
 
               <h2 className="text-base md:text-lg font-black leading-snug text-white group-hover:text-[#ead8b1] transition-colors mt-1 line-clamp-2">
                 {secondary2.title}
               </h2>
 
               <div className="flex items-center gap-4 text-[11px] text-slate-400 font-bold mt-2">
                 <span>{secondary2.author}</span>
                 <span>•</span>
                 <span>{formatDate(secondary2.createdAt)}</span>
               </div>
             </div>
           </motion.div>
         ) : (
           <div className="flex-1 bg-[#001f3f]/50 rounded-3xl border border-[#3a6d8c]/10 border-dashed flex items-center justify-center text-slate-500 text-xs font-bold">
             محتوای بیشتری وجود ندارد
           </div>
         )}

      </div>
    </div>
  );
}
