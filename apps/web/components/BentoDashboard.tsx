'use client';

import Link from 'next/link';
import { Sun, Ship, Palmtree, Fish } from 'lucide-react';
import { motion } from 'motion/react';

export function BentoDashboard() {
  return (
    <div className="p-4 grid grid-cols-2 gap-4 auto-rows-[160px]">
      {/* Golden Ratio: Large item spanning 2 columns */}
      <motion.div whileTap={{ scale: 0.98 }} className="col-span-2 bg-text-primary rounded-card p-5 shadow-soft flex flex-col justify-between text-bg-primary relative overflow-hidden">
        <div className="absolute -right-4 -top-4 opacity-10">
          <Ship className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Ship className="w-5 h-5 text-accent" strokeWidth={1.5} />
            <span className="text-sm font-medium text-bg-secondary/80 uppercase tracking-wider">Chuyến tiếp theo</span>
          </div>
          <h3 className="text-4xl font-heading font-bold">14:00</h3>
          <p className="text-sm text-bg-secondary/80 mt-1">Tàu cao tốc Havaco • Bến Cái Rồng</p>
        </div>
      </motion.div>

      {/* Smaller items */}
      <motion.div whileTap={{ scale: 0.95 }} className="bg-surface rounded-card p-4 shadow-soft flex flex-col justify-between border border-glass-border">
        <div>
          <h3 className="text-3xl font-heading font-bold text-text-primary">27°</h3>
          <div className="flex items-center gap-1.5 mt-1">
            <p className="text-sm text-text-secondary">Biển êm</p>
            <Sun className="w-4 h-4 text-accent" strokeWidth={1.5} />
          </div>
        </div>
        <div className="text-xs font-medium text-text-secondary/60 uppercase tracking-wider">Thời tiết</div>
      </motion.div>

      <motion.div whileTap={{ scale: 0.95 }}>
        <Link href="/experience" className="bg-bg-secondary/50 rounded-card p-4 shadow-soft flex flex-col justify-between h-full border border-glass-border">
          <div>
            <h3 className="text-xl font-heading font-bold text-text-primary">Bãi Robinson</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <p className="text-sm text-text-secondary">Trải nghiệm</p>
              <Palmtree className="w-4 h-4 text-accent" strokeWidth={1.5} />
            </div>
          </div>
          <div className="text-xs font-medium text-text-secondary/60 uppercase tracking-wider">Khám phá</div>
        </Link>
      </motion.div>

      <motion.div whileTap={{ scale: 0.98 }} className="col-span-2">
        <Link href="/dining" className="bg-accent/10 rounded-card p-5 shadow-soft flex items-center justify-between h-full border border-glass-border">
          <div>
            <div className="text-xs font-medium text-text-secondary/60 uppercase tracking-wider mb-1">Ăn uống</div>
            <h3 className="text-xl font-heading font-bold text-text-primary">Hải sản tươi sống</h3>
            <p className="text-sm text-text-secondary mt-1">BBQ bãi biển & Đặc sản địa phương</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-bg-primary flex items-center justify-center shadow-sm">
            <Fish className="w-6 h-6 text-accent" strokeWidth={1.5} />
          </div>
        </Link>
      </motion.div>
    </div>
  );
}
