import React from 'react';
import { Article } from '../types';
import { Gauge, Flame, Zap, Compass, ChevronLeft } from 'lucide-react';
import { motion } from 'motion/react';

interface SpecsShowcaseProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
}

export default function SpecsShowcase({ articles, onSelectArticle }: SpecsShowcaseProps) {
  // Filter only articles that have specifications (specs) defined
  const performanceCars = articles.filter((art) => art.specs && art.specs.acceleration);

  if (performanceCars.length === 0) return null;

  return (
    <div className="mb-14" id="specs-showcase-section">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[#ead8b1] animate-ping"></div>
          <h2 className="text-lg md:text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Gauge className="h-5.5 w-5.5 text-[#ead8b1]" />
            <span>ویترین مشخصات فنی سوپراسپرت‌ها</span>
          </h2>
        </div>
        <p className="text-xs text-slate-400 font-bold hidden sm:block">مقایسه زنده رکوردها و پیشرانه‌های مهندسی</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="specs-showcase-grid">
        {performanceCars.slice(0, 2).map((car, idx) => {
          const specs = car.specs!;
          return (
            <motion.div
              key={car.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="relative overflow-hidden rounded-3xl bg-[#001f3f] border border-[#3a6d8c]/15 hover:border-[#ead8b1]/30 shadow-xl transition-all duration-300 group"
              id={`specs-car-${car.id}`}
            >
              {/* Image background with very subtle zoom */}
              <div className="absolute inset-0 opacity-15 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none">
                <img
                  src={car.imageUrl}
                  alt={car.title}
                  className="w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent"></div>
              </div>

              {/* Glowing decorative indicator */}
              <div className="absolute top-0 left-10 w-24 h-[1px] bg-gradient-to-r from-transparent via-[#ead8b1] to-transparent"></div>

              <div className="p-6 md:p-8 flex flex-col justify-between h-full relative z-10">
                <div>
                  {/* Brand Tag */}
                  <div className="flex items-center justify-between mb-3.5">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-[#001224] text-[#ead8b1] border border-[#ead8b1]/20 px-3 py-1 rounded-md">
                      ابر خودروی هفته
                    </span>
                    <span className="text-xs font-mono text-slate-400 font-bold">0-100: {specs.acceleration}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base md:text-lg font-black text-white group-hover:text-[#ead8b1] transition-colors line-clamp-1 mb-5">
                    {car.title.replace('بررسی ', '').replace('معرفی ', '')}
                  </h3>

                  {/* Tech Spec Instrument Cluster */}
                  <div className="grid grid-cols-3 gap-3 mb-6 font-mono">
                    <div className="bg-[#001224] border border-[#3a6d8c]/15 p-3 rounded-2xl text-center">
                      <p className="text-[10px] text-slate-400 font-bold mb-1 font-sans">شتاب</p>
                      <p className="text-sm md:text-base font-black text-[#ead8b1] tracking-tight">{specs.acceleration}</p>
                    </div>
                    <div className="bg-[#001224] border border-[#3a6d8c]/15 p-3 rounded-2xl text-center">
                      <p className="text-[10px] text-slate-400 font-bold mb-1 font-sans">قدرت</p>
                      <p className="text-xs md:text-sm font-black text-amber-400 tracking-tight leading-normal overflow-hidden text-ellipsis whitespace-nowrap" title={specs.power}>
                        {specs.power.split(' ')[0]} <span className="text-[10px] font-normal font-sans">HP</span>
                      </p>
                    </div>
                    <div className="bg-[#001224] border border-[#3a6d8c]/15 p-3 rounded-2xl text-center">
                      <p className="text-[10px] text-slate-400 font-bold mb-1 font-sans">حداکثر سرعت</p>
                      <p className="text-xs md:text-sm font-black text-[#6a9ab0] tracking-tight leading-normal overflow-hidden text-ellipsis whitespace-nowrap" title={specs.topSpeed}>
                        {specs.topSpeed.split(' ')[0]} <span className="text-[9px] font-normal font-sans">KM/H</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#3a6d8c]/15">
                  <div className="text-xs text-slate-300 font-bold flex items-center gap-1.5">
                    <Compass className="h-4 w-4 text-[#6a9ab0]" />
                    <span>پیشرانه: {specs.engine.length > 28 ? specs.engine.substring(0, 28) + '...' : specs.engine}</span>
                  </div>

                  <button
                    onClick={() => onSelectArticle(car)}
                    className="flex items-center gap-1.5 text-xs font-black text-[#ead8b1] hover:text-[#ffffff] transition-all cursor-pointer"
                  >
                    <span>بررسی فنی</span>
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
