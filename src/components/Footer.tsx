import React from 'react';
import { Car, Mail, ShieldAlert, Award, ChevronRight, Phone } from 'lucide-react';
import { SiteSettings } from '../types';

interface FooterProps {
  settings: SiteSettings;
  setActiveCategory: (cat: string) => void;
  onOpenCompare: () => void;
  onOpenAdmin: () => void;
  onGoHome: () => void;
}

export default function Footer({
  settings,
  setActiveCategory,
  onOpenCompare,
  onOpenAdmin,
  onGoHome
}: FooterProps) {
  
  const handleCategoryClick = (catId: string) => {
    setActiveCategory(catId);
    onGoHome();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950/40 backdrop-blur-xl text-slate-300 mt-20 border-t border-white/10" id="main-footer">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Brand Info Column */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3 cursor-pointer" onClick={onGoHome}>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg border border-blue-400/20">
                <Car className="h-5.5 w-5.5 text-white" />
              </div>
              <h2 className="text-lg font-black text-white">{settings.siteName}</h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed text-justify">
              {settings.aboutText}
            </p>
          </div>

          {/* Quick links */}
          <div className="md:col-span-3 space-y-4">
            <h3 className="text-sm font-black text-white border-r-2 border-blue-500 pr-2">دسته‌بندی‌های پیشنهادی</h3>
            <ul className="space-y-2 text-xs">
              {(settings.customCategories && settings.customCategories.length > 0
                ? settings.customCategories.slice(0, 4).map(c => ({ id: c.id, label: c.label }))
                : [
                    { id: 'news', label: 'آخرین اخبار روز خودرو' },
                    { id: 'achievement', label: 'تکنولوژی و دستاوردها' },
                    { id: 'review', label: 'بررسی‌های تخصصی و مشخصات' },
                    { id: 'electric', label: 'خودروهای نوین و برقی' },
                  ]
              ).map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => handleCategoryClick(link.id)}
                    className="flex items-center gap-1 hover:text-white transition-colors py-1 cursor-pointer"
                  >
                    <ChevronRight className="h-3 w-3 text-blue-500 transform rotate-180" />
                    <span>{link.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact / Admin tools */}
          <div className="md:col-span-4 space-y-4">
            <h3 className="text-sm font-black text-white border-r-2 border-blue-500 pr-2">پل‌های ارتباطی و دسترسی</h3>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-400" />
                <span className="text-slate-400 font-medium">پشتیبانی:</span>
                <span className="font-mono text-white select-all">{settings.contactEmail}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-blue-400" />
                <span className="text-slate-400 font-medium">ساعات کار:</span>
                <span className="text-white">شنبه تا پنجشنبه (۹ صبح الی ۱۸ عصر)</span>
              </li>
              
              <li className="pt-2">
                <button
                  onClick={onOpenCompare}
                  className="flex items-center gap-1.5 rounded-lg bg-white/5 hover:bg-white/10 px-3 py-2 text-[10px] font-bold text-white transition-all border border-white/10 cursor-pointer"
                >
                  <Award className="h-3.5 w-3.5 text-blue-400" />
                  <span>ابزار مقایسه تخصصی خودروها</span>
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright and status */}
        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-500 font-medium">
          <p>
            © {new Date().getFullYear()} {settings.siteName}. تمامی حقوق مادی و معنوی محفوظ است.
          </p>
          <div className="flex items-center gap-2 text-slate-400">
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1 hover:text-white transition-all border border-white/10 px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 cursor-pointer"
            >
              <ShieldAlert className="h-3 w-3 text-blue-400" />
              <span>پنل مدیریت و بروزرسانی محتوا</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
