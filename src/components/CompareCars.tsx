import React, { useState } from 'react';
import { Sliders, X, Sparkles, Check, Info, Zap, Gauge } from 'lucide-react';
import { Article } from '../types';

interface CompareCarsProps {
  articles: Article[];
  onClose: () => void;
}

export default function CompareCars({ articles, onClose }: CompareCarsProps) {
  // Filter only articles that have specifications
  const reviewCars = articles.filter(art => art.specs !== undefined);

  // Set default cars to compare if available
  const [car1Id, setCar1Id] = useState<string>(reviewCars[0]?.id || '');
  const [car2Id, setCar2Id] = useState<string>(reviewCars[1]?.id || reviewCars[0]?.id || '');

  const car1 = reviewCars.find(c => c.id === car1Id);
  const car2 = reviewCars.find(c => c.id === car2Id);

  // Helper to extract numeric values for simple visual comparison bars (e.g. "518 اسب بخار" -> 518)
  const extractNumber = (val: string | undefined): number => {
    if (!val) return 0;
    const match = val.replace(/[^\d.]/g, ''); // Extract numbers
    return match ? parseFloat(match) : 0;
  };

  // Compute percentage for a comparative bar (e.g. max horsepower is around 1600)
  const getPowerPercentage = (powerStr: string | undefined) => {
    const num = extractNumber(powerStr);
    return Math.min(100, Math.max(5, (num / 1600) * 100));
  };

  // Acceleration 0-100 (lower is better, max around 10 seconds, min around 1.5)
  const getAccelPercentage = (accelStr: string | undefined) => {
    const num = extractNumber(accelStr);
    if (num === 0) return 0;
    // inverse calculation: 10s is 10%, 2s is 90%
    return Math.min(100, Math.max(5, ((12 - num) / 10) * 100));
  };

  return (
    <div className="mx-auto max-w-5xl py-6" id="car-comparison-view">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-8">
        <div className="flex items-center gap-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <Sliders className="h-5.5 w-5.5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">مقایسه تخصصی خودروها</h1>
            <p className="text-sm text-slate-300 font-bold mt-1.5">مشخصات فنی و عملکردی دو خودرو را در کنار هم مقایسه کنید</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0c0f17] hover:bg-[#141824] text-slate-300 hover:text-white border border-white/5 transition-all cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {reviewCars.length < 1 ? (
        <div className="py-12 text-center rounded-3xl bg-[#0c0f17] border border-white/5 shadow-2xl">
          <p className="text-base font-bold text-slate-200">موردی برای مقایسه یافت نشد.</p>
          <p className="text-sm text-slate-400 mt-2">لطفاً ابتدا از پنل مدیریت چند مقاله با دسته‌بندی "بررسی فنی" بهمراه جدول مشخصات آپلود کنید.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Pickers column (RTL-friendly layouts) */}
          <div className="lg:col-span-12 bg-[#0c0f17] rounded-3xl p-6 border border-white/5 shadow-2xl flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="flex items-center gap-2 text-base font-black text-white">
              <Sparkles className="h-5.5 w-5.5 text-rose-500" />
              <span>خودروهای مورد نظر را برای مقایسه انتخاب کنید:</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              {/* Select Car 1 */}
              <div className="flex-1 sm:w-64">
                <label className="block text-xs font-bold text-slate-300 mb-1.5">خودروی اول</label>
                <select
                  value={car1Id}
                  onChange={(e) => setCar1Id(e.target.value)}
                  className="w-full text-sm font-bold rounded-xl bg-[#05070c] border border-white/5 px-4 py-3.5 text-white focus:outline-none focus:border-rose-500 [&_option]:bg-[#05070c] [&_option]:text-white"
                >
                  {reviewCars.map(car => (
                    <option key={car.id} value={car.id}>{car.title.substring(0, 45)}...</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-center font-black text-sm text-slate-400 px-1">VS</div>

              {/* Select Car 2 */}
              <div className="flex-1 sm:w-64">
                <label className="block text-xs font-bold text-slate-300 mb-1.5">خودروی دوم</label>
                <select
                  value={car2Id}
                  onChange={(e) => setCar2Id(e.target.value)}
                  className="w-full text-sm font-bold rounded-xl bg-[#05070c] border border-white/5 px-4 py-3.5 text-white focus:outline-none focus:border-rose-500 [&_option]:bg-[#05070c] [&_option]:text-white"
                >
                  {reviewCars.map(car => (
                    <option key={car.id} value={car.id}>{car.title.substring(0, 45)}...</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Quick Stats Comparison Cards */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Left Car Quick Card */}
            {car1 && (
              <div className="bg-[#0c0f17] rounded-3xl p-6 border border-white/5 shadow-2xl flex flex-col items-center text-center">
                <div className="aspect-[16/10] w-full rounded-2xl overflow-hidden mb-4 bg-[#05070c] border border-white/5">
                  <img src={car1.imageUrl} alt={car1.title} className="w-full h-full object-cover" referrerPolicy="referrer" />
                </div>
                <span className="inline-block px-3.5 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-black mb-2.5">خودروی اول</span>
                <h3 className="text-base font-black text-white leading-snug line-clamp-2">{car1.title}</h3>
                <p className="text-xs text-slate-300 font-bold mt-1.5">به قلم: {car1.author}</p>
              </div>
            )}

            {/* Right Car Quick Card */}
            {car2 && (
              <div className="bg-[#0c0f17] rounded-3xl p-6 border border-white/5 shadow-2xl flex flex-col items-center text-center">
                <div className="aspect-[16/10] w-full rounded-2xl overflow-hidden mb-4 bg-[#05070c] border border-white/5">
                  <img src={car2.imageUrl} alt={car2.title} className="w-full h-full object-cover" referrerPolicy="referrer" />
                </div>
                <span className="inline-block px-3.5 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-black mb-2.5">خودروی دوم</span>
                <h3 className="text-base font-black text-white leading-snug line-clamp-2">{car2.title}</h3>
                <p className="text-xs text-slate-300 font-bold mt-1.5">به قلم: {car2.author}</p>
              </div>
            )}

          </div>

          {/* Comparative Specifications Details Grid */}
          <div className="lg:col-span-8 bg-[#0c0f17] rounded-3xl p-6 border border-white/5 shadow-2xl space-y-8">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <Zap className="h-5.5 w-5.5 text-rose-500" />
              <h2 className="text-lg font-black text-white">جدول مقایسه پارامترها</h2>
            </div>

            {car1 && car2 && (
              <div className="space-y-6">
                
                {/* Spec Row: Engine */}
                <div className="border-b border-white/5 pb-4">
                  <span className="block text-sm font-bold text-slate-300 mb-2.5">موتور / سیستم پیشرانه</span>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-[#05070c] rounded-xl border border-white/5">
                      <span className="text-xs block font-bold text-rose-500 mb-1.5">خودروی اول</span>
                      <span className="text-sm font-black text-white">{car1.specs?.engine || 'نامشخص'}</span>
                    </div>
                    <div className="p-4 bg-[#05070c] rounded-xl border border-white/5">
                      <span className="text-xs block font-bold text-amber-500 mb-1.5">خودروی دوم</span>
                      <span className="text-sm font-black text-white">{car2.specs?.engine || 'نامشخص'}</span>
                    </div>
                  </div>
                </div>

                {/* Spec Row: Power */}
                <div className="border-b border-white/5 pb-4">
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-sm font-bold text-slate-300">حداکثر قدرت خروجی</span>
                    <span className="text-xs text-slate-400 font-bold">قدرت بیشتر برتر است</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div className="p-4 bg-[#05070c] rounded-xl border border-white/5">
                      <span className="text-sm font-black text-white">{car1.specs?.power || 'نامشخص'}</span>
                    </div>
                    <div className="p-4 bg-[#05070c] rounded-xl border border-white/5">
                      <span className="text-sm font-black text-white">{car2.specs?.power || 'نامشخص'}</span>
                    </div>
                  </div>
                  {/* Visual comparison bars */}
                  <div className="space-y-1.5 pt-1">
                    <div className="w-full bg-[#05070c] h-2.5 rounded-full overflow-hidden flex border border-white/5">
                      <div
                        className="bg-gradient-to-r from-rose-500 to-red-600 h-full rounded-full transition-all duration-1000"
                        style={{ width: `${getPowerPercentage(car1.specs?.power)}%` }}
                      ></div>
                    </div>
                    <div className="w-full bg-[#05070c] h-2.5 rounded-full overflow-hidden flex border border-white/5">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all duration-1000"
                        style={{ width: `${getPowerPercentage(car2.specs?.power)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Spec Row: Acceleration */}
                <div className="border-b border-white/5 pb-4">
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-sm font-bold text-slate-300">شتاب صفر تا صد (ثانیه)</span>
                    <span className="text-xs text-slate-400 font-bold">زمان کمتر برتر است</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div className="p-4 bg-[#05070c] rounded-xl border border-white/5">
                      <span className="text-sm font-black text-white">{car1.specs?.acceleration || 'نامشخص'}</span>
                    </div>
                    <div className="p-4 bg-[#05070c] rounded-xl border border-white/5">
                      <span className="text-sm font-black text-white">{car2.specs?.acceleration || 'نامشخص'}</span>
                    </div>
                  </div>
                  {/* Visual comparison bars */}
                  <div className="space-y-1.5 pt-1">
                    <div className="w-full bg-[#05070c] h-2.5 rounded-full overflow-hidden flex border border-white/5">
                      <div
                        className="bg-gradient-to-r from-rose-500 to-red-600 h-full rounded-full transition-all duration-1000"
                        style={{ width: `${getAccelPercentage(car1.specs?.acceleration)}%` }}
                      ></div>
                    </div>
                    <div className="w-full bg-[#05070c] h-2.5 rounded-full overflow-hidden flex border border-white/5">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all duration-1000"
                        style={{ width: `${getAccelPercentage(car2.specs?.acceleration)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Spec Row: Torque */}
                <div className="border-b border-white/5 pb-4">
                  <span className="block text-sm font-bold text-slate-300 mb-2.5">حداکثر گشتاور خروجی</span>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-[#05070c] rounded-xl border border-white/5 text-sm font-black text-white">
                      {car1.specs?.torque || 'نامشخص'}
                    </div>
                    <div className="p-4 bg-[#05070c] rounded-xl border border-white/5 text-sm font-black text-white">
                      {car2.specs?.torque || 'نامشخص'}
                    </div>
                  </div>
                </div>

                {/* Spec Row: Top Speed */}
                <div className="border-b border-white/5 pb-4">
                  <span className="block text-sm font-bold text-slate-300 mb-2.5">حداکثر سرعت ایمن</span>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-[#05070c] rounded-xl border border-white/5 text-sm font-black text-white">
                      {car1.specs?.topSpeed || 'نامشخص'}
                    </div>
                    <div className="p-4 bg-[#05070c] rounded-xl border border-white/5 text-sm font-black text-white">
                      {car2.specs?.topSpeed || 'نامشخص'}
                    </div>
                  </div>
                </div>

                {/* Spec Row: Fuel / Power consumption */}
                <div className="border-b border-white/5 pb-4">
                  <span className="block text-sm font-bold text-slate-300 mb-2.5">مصرف سوخت / مصرف انرژی ترکیبی</span>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-[#05070c] rounded-xl border border-white/5 text-sm font-black text-white">
                      {car1.specs?.consumption || 'نامشخص'}
                    </div>
                    <div className="p-4 bg-[#05070c] rounded-xl border border-white/5 text-sm font-black text-white">
                      {car2.specs?.consumption || 'نامشخص'}
                    </div>
                  </div>
                </div>

                {/* Spec Row: Price */}
                <div>
                  <span className="block text-sm font-bold text-slate-300 mb-2.5">قیمت تقریبی جهانی</span>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-sm font-black text-rose-400">
                      {car1.specs?.price || 'نامشخص'}
                    </div>
                    <div className="p-4 bg-[#05070c] border border-white/5 rounded-xl text-sm font-black text-slate-300">
                      {car2.specs?.price || 'نامشخص'}
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>
      )}
    </div>
  );
}
