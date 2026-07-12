import React, { useState, useRef } from 'react';
import { Video } from '../types';
import { Play, Tv, X, Clock, Video as VideoIcon, ChevronLeft, ChevronRight, Fuel, Cpu, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LatestVideosProps {
  videos: Video[];
}

// Robust helper to parse and format embed/direct video URLs
export function getEmbedDetails(url: string): { type: 'youtube' | 'aparat' | 'mp4' | 'unknown'; embedUrl: string } {
  if (!url) return { type: 'unknown', embedUrl: '' };

  const cleanUrl = url.trim();

  // 1. Check for MP4
  if (cleanUrl.toLowerCase().endsWith('.mp4') || cleanUrl.includes('preview/mixkit') || cleanUrl.includes('.mp4?')) {
    return { type: 'mp4', embedUrl: cleanUrl };
  }

  // 2. Check for YouTube
  const ytMatch = cleanUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch) {
    return { type: 'youtube', embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1` };
  }

  // 3. Check for Aparat
  const aparatMatch = cleanUrl.match(/aparat\.com\/v\/([a-zA-Z0-9]+)/i);
  if (aparatMatch) {
    return { type: 'aparat', embedUrl: `https://www.aparat.com/video/video/embed/videohash/${aparatMatch[1]}/vt/frame?autoplay=true` };
  }
  
  if (cleanUrl.includes('aparat.com/video/video/embed')) {
    // Already an embed URL, append autoplay if needed
    const sep = cleanUrl.includes('?') ? '&' : '?';
    return { type: 'aparat', embedUrl: `${cleanUrl}${sep}autoplay=true` };
  }

  // 4. Try parsing if user pasted entire iframe code
  const iframeSrcMatch = cleanUrl.match(/src="([^"]+)"/);
  if (iframeSrcMatch) {
    const src = iframeSrcMatch[1];
    if (src.includes('aparat.com')) {
      return { type: 'aparat', embedUrl: src };
    }
    if (src.includes('youtube.com')) {
      return { type: 'youtube', embedUrl: src };
    }
    return { type: 'unknown', embedUrl: src };
  }

  return { type: 'unknown', embedUrl: cleanUrl };
}

interface CardCarSpecs {
  carName: string;
  driveType: string;
  engineType: string;
  engineCc: string;
  cylinders: string;
  imageUrl: string;
}

function getSpecsForVideo(video: Video, idx: number): CardCarSpecs {
  const title = video.title || '';
  
  // High quality images matching the car models
  const gacImg = 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=600';
  const nissanImg = 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=600';
  const daciaImg = 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=600';
  const porscheImg = 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=600';

  // Map indexes or keywords to match the exact cards shown in the user's image
  if (idx === 0) {
    return {
      carName: 'جی ای سی M8',
      driveType: 'دیفرانسیل جلو',
      engineType: 'توربوشارژ',
      engineCc: '۱۹۹۱CC',
      cylinders: '۴ سیلندر',
      imageUrl: video.thumbnailUrl || gacImg
    };
  }
  
  if (idx === 1) {
    return {
      carName: 'نیسان N6',
      driveType: 'دیفرانسیل جلو',
      engineType: 'پلاگین هیبریدی',
      engineCc: '۱۴۹۷CC',
      cylinders: '۴ سیلندر',
      imageUrl: video.thumbnailUrl || nissanImg
    };
  }

  if (idx === 2) {
    return {
      carName: 'داچیا بیگستر',
      driveType: 'دیفرانسیل جلو',
      engineType: 'هایبرید',
      engineCc: '۱۲۰۰CC',
      cylinders: '۴ سیلندر',
      imageUrl: video.thumbnailUrl || daciaImg
    };
  }

  if (title.includes('پورشه') || title.includes('911')) {
    return {
      carName: 'پورشه ۹۱۱ جی‌تی۳',
      driveType: 'دیفرانسیل عقب',
      engineType: 'تنفس طبیعی',
      engineCc: '۳۹۹۶CC',
      cylinders: '۶ سیلندر',
      imageUrl: video.thumbnailUrl || porscheImg
    };
  }

  return {
    carName: video.title.split(' ').slice(0, 3).join(' ') || 'خودروی مدرن',
    driveType: 'دیفرانسیل جلو',
    engineType: 'توربوشارژ',
    engineCc: '۲۰۰۰CC',
    cylinders: '۴ سیلندر',
    imageUrl: video.thumbnailUrl || daciaImg
  };
}

export default function LatestVideos({ videos }: LatestVideosProps) {
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!videos || videos.length === 0) return null;

  const handlePlayVideo = (video: Video) => {
    setActiveVideo(video);
  };

  const closePlayer = () => {
    setActiveVideo(null);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 310; // Card width + gap
      const multiplier = direction === 'left' ? -1 : 1;
      scrollRef.current.scrollBy({
        left: multiplier * scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="my-16 relative overflow-hidden bg-[#f4f5f7] py-12 px-6 md:px-10 rounded-[3rem] border border-slate-200/60 shadow-inner" id="latest-videos-section">
      {/* Decorative Tire Tracks Background Pattern */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-darken select-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <pattern id="tire-tracks" width="120" height="120" patternUnits="userSpaceOnUse" patternTransform="rotate(25)">
            <rect width="120" height="120" fill="none" />
            <path d="M15,0 L15,120 M35,0 L35,120" stroke="#000000" strokeWidth="8" strokeDasharray="12,12" />
            <path d="M80,0 L80,120 M100,0 L100,120" stroke="#000000" strokeWidth="8" strokeDasharray="12,12" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#tire-tracks)" />
        </svg>
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Blue Title Banner Card (Right side in RTL) */}
        <div className="lg:col-span-3 order-1 lg:order-2 flex">
          <div className="relative w-full overflow-hidden bg-[#001224] border border-[#3a6d8c]/25 rounded-[2.5rem] p-8 flex flex-col justify-between min-h-[380px] lg:min-h-[420px] shadow-2xl text-white group-hover:shadow-blue-950/30 transition-all duration-500">
            {/* Top Row: Navigation and Title */}
            <div className="flex items-start justify-between gap-4">
              {/* Navigation Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => scroll('right')}
                  className="w-10 h-10 rounded-full bg-white text-[#001224] flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer border border-transparent hover:border-white/20"
                  aria-label="بعدی"
                >
                  <ChevronRight className="h-5.5 w-5.5 stroke-[2.5]" />
                </button>
                <button
                  onClick={() => scroll('left')}
                  className="w-10 h-10 rounded-full bg-white text-[#001224] flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer border border-transparent hover:border-white/20"
                  aria-label="قبلی"
                >
                  <ChevronLeft className="h-5.5 w-5.5 stroke-[2.5]" />
                </button>
              </div>

              {/* Title Section */}
              <div className="text-right">
                <span className="text-xs font-medium text-blue-100/80 tracking-wide block">ماشین و</span>
                <h2 className="text-lg md:text-xl font-black text-white mt-1 leading-tight">مشخصات فنی خودرو</h2>
              </div>
            </div>

            {/* Elegant Car Image with Bottom Fade */}
            <div className="relative h-44 lg:h-52 w-full mt-6 select-none overflow-hidden rounded-2xl border border-[#3a6d8c]/15 shadow-inner">
              <img
                src="https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=600"
                alt="مشخصات خودرو"
                className="h-full w-full object-cover transform scale-102 hover:scale-105 transition-transform duration-500 rounded-2xl"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#001224] via-transparent to-transparent"></div>
            </div>
          </div>
        </div>

        {/* Horizontal Carousel Section (Left side in RTL) */}
        <div className="lg:col-span-9 order-2 lg:order-1 flex items-center">
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto py-4 px-2 w-full scroll-smooth scrollbar-none snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {videos.map((video, idx) => {
              const specs = getSpecsForVideo(video, idx);
              return (
                <div
                  key={video.id}
                  className="snap-start min-w-[290px] w-[290px] bg-white rounded-[2.2rem] p-4 border border-slate-200/50 shadow-[0_12px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_45px_rgba(0,0,0,0.07)] hover:border-slate-300/60 transition-all duration-350 flex flex-col justify-between group/card"
                >
                  <div>
                    {/* Visual Cover Header */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[1.8rem] bg-slate-50 shadow-sm">
                      <img
                        src={specs.imageUrl}
                        alt={specs.carName}
                        className="h-full w-full object-cover transform group-hover/card:scale-104 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      {/* Interactive Play Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover/card:opacity-100 transition-opacity duration-350">
                        <button
                          onClick={() => handlePlayVideo(video)}
                          className="w-12 h-12 rounded-full bg-white text-[#001224] flex items-center justify-center shadow-2xl transform scale-90 group-hover/card:scale-100 transition-all duration-350 cursor-pointer"
                        >
                          <Play className="h-5 w-5 fill-[#001224] ml-0.5" />
                        </button>
                      </div>
                    </div>

                    {/* Meta & Identity Block */}
                    <div className="text-right mt-4 px-1">
                      <h3 className="text-sm font-black text-slate-800 leading-snug group-hover/card:text-[#001224] transition-colors duration-300">
                        {specs.carName}
                      </h3>
                      <div className="mt-1.5">
                        <span className="inline-block bg-slate-100 text-slate-500 text-[9px] font-bold px-3 py-1 rounded-full border border-slate-200/30">
                          {specs.driveType}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Specification Badge Row */}
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100/80 px-1">
                    {/* Left spec widgets */}
                    <div className="flex items-center gap-4">
                      {/* Cylinder badge */}
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-50/70 text-[#001224] flex items-center justify-center border border-blue-100/30">
                          <Layers className="h-4 w-4" />
                        </div>
                        <span className="text-[9px] font-black text-slate-400 mt-1">{specs.cylinders}</span>
                      </div>

                      {/* CC badge */}
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-50/70 text-[#001224] flex items-center justify-center border border-blue-100/30">
                          <Cpu className="h-4 w-4" />
                        </div>
                        <span className="text-[9px] font-black text-slate-400 mt-1">{specs.engineCc}</span>
                      </div>

                      {/* Fuel/Engine type badge */}
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-50/70 text-[#001224] flex items-center justify-center border border-blue-100/30">
                          <Fuel className="h-4 w-4" />
                        </div>
                        <span className="text-[9px] font-black text-slate-400 mt-1">{specs.engineType}</span>
                      </div>
                    </div>

                    {/* View/Play Button on right side */}
                    <div className="flex flex-col items-center">
                      <button
                        onClick={() => handlePlayVideo(video)}
                        className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-[#001224] hover:text-white hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer border border-slate-200/60"
                        title="پخش ویدیو"
                      >
                        <ChevronLeft className="h-4.5 w-4.5" />
                      </button>
                      <span className="text-[9px] font-black text-slate-400 mt-1">همه</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Lightbox Video Player Modal */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 p-4 backdrop-blur-md"
            id="video-player-lightbox"
          >
            {/* Close handler for background */}
            <div className="absolute inset-0 cursor-pointer" onClick={closePlayer} />

            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25 }}
              className="relative w-full max-w-4xl bg-[#001224] border border-[#ead8b1]/20 rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col"
            >
              {/* Top Bar */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#3a6d8c]/15 bg-[#001f3f]">
                <h3 className="text-xs md:text-sm font-black text-white flex items-center gap-2">
                  <Tv className="h-4.5 w-4.5 text-[#ead8b1]" />
                  <span>{activeVideo.title}</span>
                </h3>
                <button
                  onClick={closePlayer}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer border border-white/5"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Video Player Box */}
              <div className="relative aspect-video w-full bg-black">
                {(() => {
                  const { type, embedUrl } = getEmbedDetails(activeVideo.videoUrl);

                  if (type === 'mp4') {
                    return (
                      <video
                        src={embedUrl}
                        controls
                        autoPlay
                        className="h-full w-full"
                        style={{ outline: 'none' }}
                      />
                    );
                  }

                  if (type === 'youtube' || type === 'aparat') {
                    return (
                      <iframe
                        src={embedUrl}
                        title={activeVideo.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="h-full w-full border-0 absolute inset-0"
                      />
                    );
                  }

                  // Unknown / fallback iframe source
                  return (
                    <iframe
                      src={activeVideo.videoUrl}
                      title={activeVideo.title}
                      allowFullScreen
                      className="h-full w-full border-0 absolute inset-0"
                    />
                  );
                })()}
              </div>

              {/* Description box */}
              {activeVideo.description && (
                <div className="p-6 bg-[#001f3f]/50 border-t border-[#3a6d8c]/15 text-right">
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                    {activeVideo.description}
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
