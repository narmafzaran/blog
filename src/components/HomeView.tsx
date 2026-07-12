import React from 'react';
import { Article, Video } from '../types';
import HeroSection from './HeroSection';
import SpecsShowcase from './SpecsShowcase';
import SidebarWidgets from './SidebarWidgets';
import LatestVideos from './LatestVideos';
import ArticleCard from './ArticleCard';
import { Search, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface HomeViewProps {
  articles: Article[];
  videos: Video[];
  activeCategory: string;
  searchQuery: string;
  filteredArticles: Article[];
  navigate: (path: string) => void;
}

export default function HomeView({
  articles,
  videos,
  activeCategory,
  searchQuery,
  filteredArticles,
  navigate,
}: HomeViewProps) {
  return (
    <div id="home-view">
      {/* Hero featured banner - only show when not searching and category is All */}
      {searchQuery === '' && activeCategory === 'all' && (
        <>
          <HeroSection
            articles={articles}
            onSelectArticle={(art) => {
              navigate(`/article/${art.slug || art.id}`);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
          <SpecsShowcase
            articles={articles}
            onSelectArticle={(art) => {
              navigate(`/article/${art.slug || art.id}`);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </>
      )}

      {/* 2-Column Portal Layout (Feed + Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="home-portal-layout">
        
        {/* Main Feed (8 columns on large screens) */}
        <div className="lg:col-span-8 space-y-6" id="main-feed-column">
          {/* Feed Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-[#3a6d8c]/15 pb-5">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-1.5">
                <Sparkles className="h-5.5 w-5.5 text-[#ead8b1] animate-pulse" />
                <span>
                  {activeCategory === 'all'
                    ? 'آخرین مقالات و دستاوردهای خودرویی'
                    : articles.find((a) => a.category === activeCategory)?.categoryLabel || 'آرشیو مقالات'}
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-1">بروزترین اخبار مهندسی، رونمایی‌ها و بررسی‌های فنی مستقل با چاشنی سرعت‌گیر</p>
            </div>

            {searchQuery && (
              <div className="bg-[#001f3f] text-[#ead8b1] border border-[#3a6d8c]/30 px-4 py-2 rounded-xl text-xs font-bold">
                نتایج جستجو برای: "{searchQuery}"
              </div>
            )}
          </div>

          {filteredArticles.length === 0 ? (
            <div className="py-20 text-center rounded-3xl bg-[#001f3f] border border-[#3a6d8c]/15 shadow-2xl" id="empty-state">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ead8b1]/10 text-[#ead8b1] border border-[#ead8b1]/20 shadow-lg">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-black text-white">هیچ مقاله‌ای یافت نشد</h3>
              <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed px-4">
                موردی منطبق با جستجو یا دسته‌بندی انتخابی شما در پایگاه داده وجود ندارد. لطفاً کلمات کلیدی دیگری را امتحان کنید.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="articles-grid">
              {filteredArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onSelect={(art) => {
                    navigate(`/article/${art.slug || art.id}`);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Column (4 columns on large screens) */}
        <div className="lg:col-span-4" id="sidebar-column">
          <SidebarWidgets
            articles={articles}
            onSelectArticle={(art) => {
              navigate(`/article/${art.slug || art.id}`);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenCompare={() => {
              navigate('/compare');
            }}
          />
        </div>

      </div>

      {/* Latest Videos Section */}
      <LatestVideos videos={videos} />
    </div>
  );
}
