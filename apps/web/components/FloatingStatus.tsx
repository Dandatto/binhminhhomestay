'use client';

import { Ship, Sun, Wind, Waves } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useRef, useEffect, useState } from 'react';

interface WeatherData {
  temp: number | null;
  condition: string;
  waveHeight: string;
  windSpeed: string;
}

interface VesselTrip {
  operator: string;
  departure: string;
}

import { StatusModal } from './StatusModal';

export function FloatingStatus() {
  const constraintsRef = useRef<HTMLDivElement>(null);
  const [weather, setWeather] = useState<any>(null);
  const [vessels, setVessels] = useState<VesselTrip[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [wRes, vRes] = await Promise.all([
          fetch('/api/v1/weather'),
          fetch('/api/v1/vessels')
        ]);
        if (wRes.ok) setWeather(await wRes.json());
        if (vRes.ok) {
          const vData = await vRes.json();
          setVessels(vData.vessels || []);
        }
      } catch (e) {
        console.error('Lỗi tải dữ liệu Dynamic Island:', e);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000); // 5 phút cập nhật 1 lần
    return () => clearInterval(interval);
  }, []);

  const nextTrip = vessels.find(v => {
    const now = new Date();
    const time = now.getHours() * 100 + now.getMinutes();
    const vTime = parseInt(v.departure.replace(':', ''));
    return vTime > time;
  }) || vessels[0];

  const MarqueeContent = () => (
    <div className="flex items-center gap-4 pr-4">
      {/* Ferry Trip */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <Ship className="w-3.5 h-3.5 text-accent" strokeWidth={2} />
        <span className="text-xs font-semibold text-bg-primary">
          {nextTrip ? `${nextTrip.departure} ${nextTrip.operator}` : 'Đang cập nhật tàu...'}
        </span>
      </div>

      <div className="w-1 h-1 rounded-full bg-bg-primary/40" />

      {/* Weather */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {weather?.temp !== null ? (
          <>
            <span className="text-xs font-semibold text-bg-primary">{weather?.temp}°</span>
            <Sun className="w-3.5 h-3.5 text-accent" strokeWidth={2} />
            <span className="text-[10px] text-bg-primary/80">{weather?.condition}</span>
          </>
        ) : (
          <span className="text-xs font-medium text-bg-primary">Đang tải thời tiết...</span>
        )}
      </div>

      <div className="w-1 h-1 rounded-full bg-bg-primary/40" />
      
      {/* Wave Height */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <Waves className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
        <span className="text-xs font-medium text-bg-primary">Sóng {weather?.waveHeight || '—'}</span>
      </div>

      <div className="w-1 h-1 rounded-full bg-bg-primary/40" />
      
      <span className="text-[10px] font-medium text-bg-primary/70 tracking-tight">Website được tạo bởi Vân Đồn Solutions ©</span>
      
      <div className="w-1 h-1 rounded-full bg-bg-primary/40" />
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 z-50 pointer-events-none" ref={constraintsRef}>
        <motion.div 
          drag
          dragConstraints={constraintsRef}
          dragElastic={0.1}
          dragMomentum={false}
          onTap={() => setIsModalOpen(true)}
          initial={{ y: -100, x: "-50%", opacity: 0 }}
          animate={{ y: 0, x: "-50%", opacity: 1 }}
          className="absolute top-4 left-1/2 bg-text-primary rounded-full py-1.5 flex items-center pointer-events-auto shadow-elevated overflow-hidden min-w-[200px] max-w-[280px] cursor-grab active:cursor-grabbing border border-bg-primary/20"
        >
          <motion.div
            className="flex whitespace-nowrap items-center"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 25 }}
          >
            <AnimatePresence mode="wait">
              <MarqueeContent />
              <MarqueeContent />
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>

      <StatusModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        weather={weather}
        vessels={vessels}
      />
    </>
  );
}
