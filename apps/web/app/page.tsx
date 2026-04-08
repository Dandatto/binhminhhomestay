'use client';

import { StoriesBar } from '@/components/StoriesBar';
import { ActionBar } from '@/components/ActionBar';
import { ChatTeaser } from '@/components/ChatTeaser';
import { HomeStatusBar } from '@/components/HomeStatusBar';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useTheme } from '@/components/ThemeProvider';
import { motion, AnimatePresence } from 'motion/react';

export default function HomePage() {
  const { theme } = useTheme();

  // Map themes to local generated images
  const themeAssets = {
    dawn: '/hero-dawn.png',
    day: '/hero-day.png',
    dusk: '/hero-dusk.png',
    night: '/hero-night.png'
  };

  const overlayStyles = {
    dawn: 'from-black/20 via-transparent to-black/60',
    day: 'from-black/30 via-transparent to-black/70',
    dusk: 'from-black/40 via-transparent to-black/80',
    night: 'from-black/60 via-transparent to-black/90'
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-bg-primary relative transition-colors duration-1000">
      {/* TikTok Feed Hybrid Style (Main One-page View) */}
      <section className="h-full w-full relative">
        {/* Header for Home */}
        <div className="absolute top-0 left-0 right-0 z-40 px-[max(1.5rem,10vw)] h-20 flex items-center justify-end">
          <div className="mt-safe-top">
            <LanguageSwitcher />
          </div>
        </div>

        {/* Full-bleed background with Cross-fade animation */}
        <div className="absolute inset-0 bg-bg-primary overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={theme}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.9 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <img 
                src={themeAssets[theme]} 
                alt={`Minh Chau ${theme}`}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </AnimatePresence>
          
          {/* Edge vignette — focus eye toward center, subtly darkens periphery on desktop */}
          <div
            className="absolute inset-0 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.35) 0%, transparent 18%, transparent 82%, rgba(0,0,0,0.35) 100%)' }}
          />
          {/* M3 Scrim: vertical gradient for caption readability */}
          <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/20 via-transparent to-black/80 pointer-events-none transition-all duration-1000" />
        </div>

        <StoriesBar />
        <ActionBar />
        
        {/* Caption & Chat Teaser Group */}
        <div className="absolute left-[max(1.5rem,10vw)] right-[max(1.5rem,10vw)] bottom-28 z-40 flex flex-col gap-2">
          {/* iOS Weather Widget — no card, just layered text */}
          <HomeStatusBar />

          {/* M3 Display Headline */}
          <h1 className="font-heading text-[clamp(1.8rem,5.5vw,3.5rem)] text-[#FEF7FF] leading-tight tracking-tighter drop-shadow-sm">
            Cứ để <strong className="text-accent font-bold">đất liền</strong> đợi chúng ta...
          </h1>

          {/* 5x gap before chips — breathing room */}
          <div className="mt-[3.5rem]">
            <ChatTeaser />
          </div>
        </div>
      </section>
    </div>
  );
}
