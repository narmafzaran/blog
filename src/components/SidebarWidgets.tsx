import React, { useState, useEffect } from 'react';
import { Article } from '../types';
import { Flame, GitCompare, ArrowLeft, BarChart2, Star, CheckCircle, Award } from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarWidgetsProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
  onOpenCompare: () => void;
}

export default function SidebarWidgets({ articles, onSelectArticle, onOpenCompare }: SidebarWidgetsProps) {
  // 1. Trending Articles sorted by views
  const trendingArticles = [...articles]
    .sort((a, b) => b.views - a.views)
    .slice(0, 4);

  // 2. Poll State Management using localStorage
  const POLL_ID = 'speed_poll_v1';
  const [votedOption, setVotedOption] = useState<number | null>(null);
  const [pollVotes, setPollVotes] = useState<number[]>([142, 85, 118]); // Default mock starting votes

  useEffect(() => {
    const savedVote = localStorage.getItem(POLL_ID);
    if (savedVote !== null) {
      setVotedOption(parseInt(savedVote, 10));
    }
    const savedVotesArray = localStorage.getItem(POLL_ID + '_votes');
    if (savedVotesArray) {
      try {
        setPollVotes(JSON.parse(savedVotesArray));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const handleVote = (optionIndex: number) => {
    if (votedOption !== null) return; // Already voted

    const updatedVotes = [...pollVotes];
    updatedVotes[optionIndex] += 1;
    setPollVotes(updatedVotes);
    setVotedOption(optionIndex);

    localStorage.setItem(POLL_ID, optionIndex.toString());
    localStorage.setItem(POLL_ID + '_votes', JSON.stringify(updatedVotes));
  };

  const totalVotes = pollVotes.reduce((a, b) => a + b, 0);
  const pollOptions = [
    'بنزینی سنتی تنفس طبیعی دور بالا (مثل پورشه ۹۱۱)',
    'سه‌موتوره برقی با شتاب آنی زیر ۲ ثانیه (مثل شیائومی SU7)',
    'هیبریدی فوق‌پیشرفته با الهام از موتورهای فرمول یک'
  ];

  const faNumbers = ['۱', '۲', '۳', '۴', '۵'];

  return (
    <div className="space-y-8" id="sidebar-widgets-panel">
      
      {/* WIDGET 1: TRENDING ARTICLES */}
      <div className="bg-[#001f3f] border border-[#3a6d8c]/15 rounded-3xl p-6 shadow-xl relative overflow-hidden" id="widget-trending-articles">
        {/* Decorative Top Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-l from-[#ead8b1] via-[#3a6d8c] to-transparent"></div>

        <div className="flex items-center gap-2 mb-5">
          <Flame className="h-5 w-5 text-[#ead8b1] animate-pulse" />
          <h3 className="text-sm font-black text-white">داغ‌ترین‌های این هفته</h3>
        </div>

        <div className="space-y-4">
          {trendingArticles.map((art, idx) => (
            <div 
              key={art.id}
              onClick={() => onSelectArticle(art)}
              className="flex items-start gap-3.5 group cursor-pointer pb-4 border-b border-[#3a6d8c]/10 last:border-0 last:pb-0"
              id={`trending-item-${idx}`}
            >
              {/* Numeric rank indicator */}
              <div className="flex-shrink-0 h-7 w-7 rounded-lg bg-[#001224] border border-[#3a6d8c]/15 flex items-center justify-center font-mono text-xs font-black text-[#ead8b1] group-hover:bg-[#ead8b1] group-hover:text-[#001f3f] group-hover:border-[#ead8b1] transition-colors">
                {faNumbers[idx]}
              </div>

              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-[#ead8b1] font-extrabold block mb-0.5">{art.categoryLabel}</span>
                <h4 className="text-xs md:text-sm font-black text-slate-100 group-hover:text-[#ead8b1] leading-snug line-clamp-2 transition-colors">
                  {art.title}
                </h4>
                <div className="text-[10px] text-slate-400 font-bold mt-1">
                  {art.views.toLocaleString('fa-IR')} بازدید
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WIDGET 2: INTERACTIVE CAR POLL */}
      <div className="bg-[#001f3f] border border-[#3a6d8c]/15 rounded-3xl p-6 shadow-xl relative overflow-hidden" id="widget-weekly-poll">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-l from-[#ead8b1] via-[#6a9ab0] to-transparent"></div>

        <div className="flex items-center gap-2 mb-4">
          <BarChart2 className="h-5 w-5 text-[#ead8b1]" />
          <h3 className="text-sm font-black text-white">نظرسنجی تخصصی هفته</h3>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed font-bold mb-5">
          به نظر شما آینده صنعت ابرخودروها به کدام فناوری پیشرانه تعلق دارد؟
        </p>

        <div className="space-y-3">
          {pollOptions.map((option, idx) => {
            const votes = pollVotes[idx];
            const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
            const isSelected = votedOption === idx;

            return (
              <button
                key={idx}
                onClick={() => handleVote(idx)}
                disabled={votedOption !== null}
                className={`w-full text-right text-xs relative overflow-hidden rounded-xl border p-3.5 transition-all duration-300 ${
                  votedOption !== null
                    ? isSelected
                      ? 'border-[#ead8b1] bg-[#ead8b1]/10'
                      : 'border-white/5 bg-[#001224]/40 opacity-70'
                    : 'border-[#3a6d8c]/15 hover:border-[#ead8b1]/30 bg-[#001224] hover:bg-[#001f3f] cursor-pointer'
                }`}
                id={`poll-option-${idx}`}
              >
                {/* Background progress bar animation if voted */}
                {votedOption !== null && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`absolute inset-y-0 right-0 z-0 ${
                      isSelected ? 'bg-[#ead8b1]/10' : 'bg-[#6a9ab0]/5'
                    }`}
                  ></motion.div>
                )}

                <div className="relative z-10 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 max-w-[82%]">
                    {votedOption !== null && isSelected ? (
                      <CheckCircle className="h-4 w-4 text-[#ead8b1] flex-shrink-0" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-slate-700 flex items-center justify-center text-[10px] font-mono text-slate-400 flex-shrink-0">
                        {idx + 1}
                      </div>
                    )}
                    <span className="text-slate-100 font-bold line-clamp-2 leading-relaxed">{option}</span>
                  </div>

                  {votedOption !== null && (
                    <span className="font-mono font-black text-xs text-[#ead8b1]">
                      {percentage.toLocaleString('fa-IR')}%
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-[#3a6d8c]/10 flex items-center justify-between text-[10px] text-slate-400 font-bold">
          <span>{totalVotes.toLocaleString('fa-IR')} رای ثبت شده</span>
          {votedOption !== null && (
            <span className="text-[#ead8b1] flex items-center gap-1">
              رای شما با موفقیت ثبت شد
            </span>
          )}
        </div>
      </div>

      {/* WIDGET 3: SMART COMPARISON TOOL CALL TO ACTION */}
      <div className="bg-gradient-to-br from-[#001f3f] to-[#3a6d8c]/10 border border-[#3a6d8c]/15 rounded-3xl p-6 shadow-xl relative overflow-hidden group" id="widget-compare-cta">
        <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-[#ead8b1]/5 rounded-full blur-2xl group-hover:bg-[#ead8b1]/10 transition-colors"></div>
        
        <div className="flex items-center gap-2 mb-3.5">
          <GitCompare className="h-5 w-5 text-[#ead8b1]" />
          <h3 className="text-sm font-black text-white">ابزار مقایسه فنی سرعت‌گیر</h3>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed font-bold mb-5">
          آیا می‌خواهید مشخصات فنی غول‌های خودرویی مانند پورشه ۹۱۱ جی‌تی۳ آر‌اس، شیائومی اولترا و کانسپت آئودی را رو در رو مقایسه کنید؟
        </p>

        <button
          onClick={onOpenCompare}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#ead8b1] to-[#6a9ab0] hover:from-white hover:to-[#ead8b1] text-[#001f3f] text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg hover:shadow-[#ead8b1]/10 transition-all duration-300 cursor-pointer animate-fade-in"
          id="compare-cta-btn"
        >
          <span>ورود به آزمایشگاه مقایسه خودرو</span>
          <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
        </button>
      </div>

    </div>
  );
}
