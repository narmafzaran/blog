import React, { useState } from 'react';
import { Car, Search, Sliders, Shield, Menu, X, Zap, Cpu, Newspaper } from 'lucide-react';
import { SiteSettings } from '../types';

interface NavbarProps {
  settings: SiteSettings;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenCompare: () => void;
  onOpenAdmin: () => void;
  onGoHome: () => void;
}

export default function Navbar({
  settings,
  activeCategory,
  setActiveCategory,
  searchQuery,
  setSearchQuery,
  onOpenCompare,
  onOpenAdmin,
  onGoHome
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const iconMap: Record<string, any> = {
    Car,
    Newspaper,
    Cpu,
    Sliders,
    Zap,
  };

  const defaultCategories = [
    { id: 'news', label: 'اخبار روز', icon: Newspaper },
    { id: 'achievement', label: 'تکنولوژی و دستاوردها', icon: Cpu },
    { id: 'review', label: 'بررسی فنی', icon: Sliders },
    { id: 'electric', label: 'خودروهای برقی', icon: Zap },
  ];

  const categories = [
    { id: 'all', label: 'همه مقالات', icon: Car },
    ...(settings.customCategories && settings.customCategories.length > 0
      ? settings.customCategories.map((c) => ({
          id: c.id,
          label: c.label,
          icon: iconMap[c.iconName || 'Car'] || Car,
        }))
      : defaultCategories)
  ];

  const handleCategoryClick = (catId: string) => {
    setActiveCategory(catId);
    setMobileMenuOpen(false);
    onGoHome(); // Go to homepage when clicking category
  };

  return (
    <header className="sticky top-0 z-45 w-full bg-slate-900 border-b border-slate-800 text-white shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 xl:gap-3 cursor-pointer animate-fade-in" onClick={onGoHome} id="nav-brand">
            <div className="flex h-9 w-9 xl:h-11 xl:w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20 border border-blue-400/20">
              <Car className="h-5 w-5 xl:h-6 xl:w-6 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base xl:text-2xl font-black text-white font-sans flex items-center gap-1">
                {settings.siteName}
              </h1>
              <p className="hidden xl:block text-xs text-slate-400 font-bold">پایگاه تخصصی رسانه خودرویی مدرن</p>
            </div>
          </div>

          {/* Desktop Categories */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 bg-slate-950 p-0.5 xl:p-1 rounded-xl border border-slate-800" id="desktop-nav">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`flex items-center gap-1 px-1.5 py-1.5 xl:px-4 xl:py-2.5 text-[10px] xl:text-sm font-black rounded-lg transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 border border-blue-400/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  id={`cat-btn-${cat.id}`}
                >
                  <Icon className="h-3.5 w-3.5 xl:h-4 xl:w-4" />
                  {cat.label}
                </button>
              );
            })}
          </nav>

          {/* Search, Compare & Admin Actions */}
          <div className="hidden lg:flex items-center gap-1.5 xl:gap-3" id="nav-actions">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="جستجو..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-24 xl:w-56 rounded-xl bg-slate-950 px-2 py-1.5 xl:py-2.5 pr-7 xl:pr-8 text-[11px] xl:text-sm text-slate-100 placeholder-slate-500 border border-slate-800 focus:border-blue-500 focus:bg-slate-900 focus:outline-none transition-all duration-300 text-right dir-rtl"
                id="search-input"
              />
              <Search className="absolute right-2 top-2 xl:top-3.5 h-3 w-3 xl:h-3.5 xl:w-3.5 text-slate-400" />
            </div>

            {/* Compare Button */}
            <button
              onClick={onOpenCompare}
              className="flex items-center gap-1 rounded-xl bg-slate-850 px-2 py-1.5 xl:px-4 xl:py-2.5 text-[11px] xl:text-sm font-black text-slate-200 hover:bg-slate-800 border border-slate-700 transition-all duration-300 cursor-pointer"
              id="compare-trigger-btn"
            >
              <Sliders className="h-3.5 w-3.5 xl:h-4 xl:w-4 text-blue-400" />
              <span>مقایسه</span>
            </button>

            {/* Admin Panel Button */}
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1 rounded-xl bg-slate-850 hover:bg-blue-500/10 px-2 py-1.5 xl:px-4 xl:py-2.5 text-[11px] xl:text-sm font-black text-slate-200 hover:text-white border border-slate-700 hover:border-blue-500/30 transition-all duration-300 cursor-pointer"
              id="admin-panel-btn"
            >
              <Shield className="h-3.5 w-3.5 xl:h-4 xl:w-4 text-blue-400" />
              <span>پنل مدیریت</span>
            </button>
          </div>

          {/* Mobile Actions and Burger */}
          <div className="flex items-center gap-2 lg:hidden">
            {/* Compare Button Mobile */}
            <button
              onClick={onOpenCompare}
              className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
              title="مقایسه خودروها"
            >
              <Sliders className="h-4 w-4 text-blue-400" />
            </button>

            {/* Admin Button Mobile */}
            <button
              onClick={onOpenAdmin}
              className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
              title="پنل مدیریت"
            >
              <Shield className="h-4 w-4 text-blue-400" />
            </button>

            {/* Burger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white"
              id="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-t border-slate-800 px-4 py-4 space-y-4 animate-slide-down" id="mobile-menu">
          {/* Mobile Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="جستجو در مقالات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-slate-950 px-4 py-2.5 pr-10 text-sm text-slate-100 placeholder-slate-500 border border-slate-800 focus:outline-none focus:border-blue-500 text-right"
            />
            <Search className="absolute right-3 top-3.5 h-4 w-4 text-slate-400" />
          </div>

          {/* Mobile Navigation Links */}
          <div className="space-y-1">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border border-blue-400/20 shadow-lg'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5 text-blue-400" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
