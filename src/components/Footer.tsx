import React, { useState } from 'react';
import { 
  Car, 
  Mail, 
  ShieldAlert, 
  Award, 
  ChevronRight, 
  Phone, 
  Sparkles, 
  Send, 
  Layers, 
  Compass, 
  BookOpen, 
  Globe, 
  Clock,
  CheckCircle,
  Cpu
} from 'lucide-react';
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
  const [copied, setCopied] = useState(false);

  const handleCategoryClick = (catId: string) => {
    setActiveCategory(catId);
    onGoHome();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const copyEmail = () => {
    if (settings.contactEmail) {
      navigator.clipboard.writeText(settings.contactEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <footer className="relative bg-gradient-to-b from-[#00172d] via-[#001020] to-[#000a14] text-slate-300 mt-28 border-t border-[#3a6d8c]/25 overflow-hidden" id="main-footer">
      {/* Decorative Radial Lighting Overlays */}
      <div className="absolute top-0 left-1/4 -translate-y-1/2 w-96 h-96 bg-[#ead8b1]/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 translate-y-1/2 w-80 h-80 bg-[#3a6d8c]/10 blur-[100px] rounded-full pointer-events-none"></div>

      {/* Top Border Glow Accent */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#ead8b1]/40 to-transparent"></div>

      <div className="mx-auto max-w-7xl px-4 pt-16 pb-8 sm:px-6 lg:px-8 relative z-10">
        
        {/* Brand Header Section */}
        <div className="flex flex-col md:flex-row items-center justify-between pb-10 mb-10 border-b border-[#3a6d8c]/15 gap-6">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={onGoHome}>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#ead8b1] to-[#fff3d1] shadow-xl shadow-[#ead8b1]/5 border border-[#ead8b1]/30 transform group-hover:scale-105 transition-all duration-300 overflow-hidden">
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt={settings.siteName} className="h-full w-full object-cover" />
              ) : (
                <Car className="h-6 w-6 text-[#001f3f]" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-xl font-black text-white tracking-tight">{settings.siteName}</h2>
                <Sparkles className="h-4 w-4 text-[#ead8b1] animate-pulse" />
              </div>
              <p className="text-[10px] text-[#6a9ab0] font-medium mt-0.5">مرجع تخصصی نقد، بررسی و تحلیل دنیای خودرو</p>
            </div>
          </div>

          {/* Quick Stats or Features in Footer */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <div className="flex items-center gap-2 bg-[#001f3f]/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-[#3a6d8c]/15">
              <CheckCircle className="h-4 w-4 text-[#ead8b1]" />
              <span className="text-[10px] font-bold text-slate-200">بروزرسانی‌های لحظه‌ای</span>
            </div>
            <div className="flex items-center gap-2 bg-[#001f3f]/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-[#3a6d8c]/15">
              <Cpu className="h-4 w-4 text-[#ead8b1]" />
              <span className="text-[10px] font-bold text-slate-200">فناوری‌های نوین خودرو</span>
            </div>
            <div className="flex items-center gap-2 bg-[#001f3f]/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-[#3a6d8c]/15">
              <Compass className="h-4 w-4 text-[#ead8b1]" />
              <span className="text-[10px] font-bold text-slate-200">مقایسه هوشمند مشخصات</span>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pb-10">
          
          {/* Column 1: About Platform */}
          <div className="md:col-span-5 space-y-5">
            <h3 className="text-sm font-black text-white border-r-2 border-[#ead8b1] pr-2.5">درباره این رسانه</h3>
            <p className="text-xs text-slate-400 leading-relaxed text-justify pl-4 font-normal">
              {settings.aboutText || "ما در این پلتفرم با تمرکز بر آخرین دستاوردهای تکنولوژی، مقایسه خودروهای برتر بازار، تحلیل اخبار روز صنعت حمل‌ونقل و ارائه اطلاعات فنی تلاش می‌کنیم مرجعی معتبر برای پاسخ به نیازهای شما باشیم."}
            </p>
            
            {/* Elegant Social Connectors */}
            <div className="space-y-3 pt-2">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">ما را در شبکه‌های اجتماعی دنبال کنید</span>
              <div className="flex gap-2">
                {['تلگرام', 'اینستاگرام', 'یوتیوب', 'آپارات'].map((social, i) => (
                  <button 
                    key={social} 
                    className="px-3 py-1.5 text-[10px] font-bold bg-[#001f3f] hover:bg-[#ead8b1] hover:text-[#001224] text-slate-300 rounded-lg border border-[#3a6d8c]/15 hover:border-transparent transition-all duration-300 cursor-pointer"
                  >
                    {social}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Recommended Categories (Interactive Links) */}
          <div className="md:col-span-3 space-y-5">
            <h3 className="text-sm font-black text-white border-r-2 border-[#ead8b1] pr-2.5">دسته‌بندی‌های تخصصی</h3>
            <ul className="space-y-3 text-xs">
              {(settings.customCategories && settings.customCategories.length > 0
                ? settings.customCategories.slice(0, 4).map(c => ({ id: c.id, label: c.label }))
                : [
                    { id: 'news', label: 'آخرین اخبار روز خودرو' },
                    { id: 'achievement', label: 'تکنولوژی و دستاوردهای فنی' },
                    { id: 'review', label: 'بررسی‌های تخصصی و تجربی' },
                    { id: 'electric', label: 'خودروهای برقی و هوشمند' },
                  ]
              ).map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => handleCategoryClick(link.id)}
                    className="group flex items-center gap-2 hover:text-[#ead8b1] text-slate-400 transition-all py-1.5 cursor-pointer text-right w-full"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-[#6a9ab0] group-hover:bg-[#ead8b1] transition-colors"></div>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{link.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Communication Card & Tools */}
          <div className="md:col-span-4 space-y-5">
            <h3 className="text-sm font-black text-white border-r-2 border-[#ead8b1] pr-2.5">پشتیبانی و ابزارهای کاربردی</h3>
            
            {/* Contact Details Card */}
            <div className="bg-gradient-to-br from-[#001f3f]/40 to-[#001224]/80 backdrop-blur-md rounded-2xl p-4 border border-[#3a6d8c]/15 space-y-3">
              <div 
                onClick={copyEmail}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#001224] border border-[#3a6d8c]/10 hover:border-[#ead8b1]/30 transition-all cursor-pointer group"
                title="برای کپی کردن ایمیل کلیک کنید"
              >
                <div className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-[#ead8b1]" />
                  <div className="text-right">
                    <span className="block text-[9px] text-slate-500 font-bold">پست الکترونیکی پشتیبانی</span>
                    <span className="block text-xs font-mono text-slate-300 font-semibold select-all">{settings.contactEmail || "info@soraatgir.ir"}</span>
                  </div>
                </div>
                <span className="text-[9px] text-[#6a9ab0] bg-[#3a6d8c]/10 px-2 py-0.5 rounded-md group-hover:text-[#ead8b1] transition-colors">
                  {copied ? "کپی شد!" : "کپی"}
                </span>
              </div>

              <div className="flex items-center gap-3 px-1 text-xs">
                <Clock className="h-4 w-4 text-[#6a9ab0]" />
                <div className="text-right leading-tight">
                  <span className="block text-[9px] text-slate-500 font-bold">پاسخگویی و مشاوره</span>
                  <span className="text-[11px] text-slate-300 font-semibold">شنبه تا پنجشنبه (۹ صبح الی ۱۸ عصر)</span>
                </div>
              </div>
            </div>

            {/* Quick Action Button */}
            <button
              onClick={onOpenCompare}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#001f3f] to-[#012d5c] hover:from-[#ead8b1] hover:to-[#ffedd1] hover:text-[#001224] text-slate-200 hover:shadow-lg hover:shadow-[#ead8b1]/5 px-4 py-3 text-xs font-black transition-all duration-300 border border-[#3a6d8c]/20 hover:border-transparent cursor-pointer group"
            >
              <Award className="h-4 w-4 text-[#ead8b1] group-hover:text-[#001f3f] transition-colors" />
              <span>اجرای ماژول مقایسه هوشمند مشخصات فنی</span>
            </button>
          </div>

        </div>

        {/* Bottom copyright and Security Status */}
        <div className="border-t border-[#3a6d8c]/15 mt-8 pt-6 flex flex-col md:flex-row items-center justify-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-2.5 text-slate-500 text-[11px] text-center">
            <Globe className="h-4 w-4 text-[#6a9ab0] shrink-0" />
            <p>
              © {new Date().getFullYear()} <a href="https://soraatgir.ir" target="_blank" rel="noopener noreferrer" className="hover:text-[#ead8b1] underline decoration-[#ead8b1]/30 font-bold transition-colors">{settings.siteName || 'مجله سرعت‌گیر'} (soraatgir.ir)</a>. تمامی حقوق مادی، معنوی و محتوای این پلتفرم محفوظ است.
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
}
