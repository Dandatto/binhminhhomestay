'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BedDouble, Utensils, Compass, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// ─── M3E Navigation Bar — 5 tabs, persistent (never auto-hide) ──────────────
// Spec: Material Design 3 Expressive — NavigationBar
// Active indicator: shared layoutId pill (emphasized decelerate spring)
// Tap target: min 44px per M3E + Apple HIG
// Safe area: accounts for iOS home indicator via pb-safe-bottom

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
};

const NAV_ITEMS: NavItem[] = [
  { href: '/',       label: 'cổng', icon: Home     },
  { href: '/rooms',  label: 'ngủ',  icon: BedDouble },
  { href: '/dining', label: 'ăn',   icon: Utensils  },
  { href: '/play',   label: 'chơi', icon: Compass   },
  { href: '/admin',  label: 'vào',  icon: LogIn     },
];

// M3E motion tokens
const NAV_ENTER = { type: 'spring' as const, damping: 26, stiffness: 220, restDelta: 0.001 };
const PILL_SPRING = { type: 'spring' as const, stiffness: 350, damping: 30 };

export function MobileNav() {
  const pathname = usePathname();

  // Active detection — inclusive of sub-routes
  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href === '/rooms') return pathname === '/rooms' || pathname === '/booking';
    if (href === '/dining') return pathname === '/dining';
    if (href === '/play') return pathname === '/play' || pathname === '/explore' || pathname === '/experience';
    if (href === '/admin') return pathname.startsWith('/admin');
    return false;
  };

  return (
    <motion.nav
      initial={{ y: 80, opacity: 0, x: '-50%' }}
      animate={{ y: 0, opacity: 1, x: '-50%' }}
      transition={NAV_ENTER}
      className="absolute bottom-5 left-1/2 z-40
                 flex items-center justify-around
                 px-3 py-2
                 w-[calc(100vw-2rem)] max-w-[440px]
                 bg-[rgba(212,184,122,0.92)] backdrop-blur-3xl
                 border border-[rgba(235,210,160,0.50)]
                 shadow-[0_8px_32px_rgba(140,100,40,0.22)]
                 rounded-[32px]"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className="relative flex-1 flex flex-col items-center justify-center min-h-[44px] py-1 gap-0.5"
          >
            {/* M3E active indicator pill — shared layoutId for smooth transition */}
            <AnimatePresence>
              {active && (
                <motion.div
                  layoutId="nav-active-pill"
                  className="absolute inset-x-1 inset-y-0 bg-[rgba(0,0,0,0.10)] rounded-2xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={PILL_SPRING}
                />
              )}
            </AnimatePresence>

            {/* Icon + label — M3E state layer via whileTap */}
            <motion.div
              whileTap={{ scale: 0.86 }}
              transition={{ duration: 0.15 }}
              className="z-10 flex flex-col items-center gap-0.5"
            >
              <Icon
                className={`w-[22px] h-[22px] transition-colors duration-[200ms]
                  ${active ? 'text-[#1A1000]' : 'text-[#6B4E20]'}`}
                strokeWidth={active ? 2.5 : 1.5}
              />
              {/* M3E label-small: 0.6875rem / font-medium / font-sans (Inter) */}
              <span
                className={`text-[0.6875rem] font-medium font-sans tracking-tight
                  transition-colors duration-[200ms]
                  ${active ? 'text-[#1A1000]' : 'text-[#6B4E20]'}`}
              >
                {item.label}
              </span>
            </motion.div>

            {/* Admin notification badge */}
            {item.href === '/admin' && (
              <span className="absolute top-1.5 right-2.5 w-1.5 h-1.5
                               bg-red-500 rounded-full border border-[#D4B87A]" />
            )}
          </Link>
        );
      })}
    </motion.nav>
  );
}
