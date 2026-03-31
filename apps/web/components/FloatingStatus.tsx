"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Ship, CloudSun, Waves, CloudRain, CloudFog } from "lucide-react";
import { useState, useEffect } from "react";
import type { VesselSchedule } from "@/lib/domain";

export type StatusType = "normal" | "alert" | "info";

export default function FloatingStatus() {
  const [weather, setWeather] = useState({
    temp: "--", condition: "Đang tải", waveHeight: "--", loading: true
  });
  const [vessels, setVessels] = useState<VesselSchedule[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    fetch("/api/v1/weather").then(res => res.json()).then(data => {
      if (!data.error) setWeather({ ...data, loading: false });
    });
    fetch("/api/v1/vessels").then(res => res.json()).then(data => {
      if (data.vessels) setVessels(data.vessels);
    });
  }, []);

  const nextVessel = vessels.find(v => v.status === "scheduled" || v.status === "departed");

  let statusText = "Biển êm, tàu neo đậu";
  let statusType: StatusType = "info";

  if (nextVessel) {
    statusText = `Tàu ${nextVessel.operator} ${nextVessel.status === 'departed' ? 'đang chạy' : 'sắp chạy'} lúc ${nextVessel.departure}`;
    statusType = nextVessel.status === 'departed' ? "alert" : "normal";
  } else if (vessels.length > 0) {
    statusText = "Các chuyến tàu hôm nay đã cập bến";
  }

  const WeatherIcon = weather.condition.includes("mưa") ? CloudRain : weather.condition.includes("mù") ? CloudFog : CloudSun;

  return (
    <div className="flex justify-center w-full px-4 pt-4 pointer-events-none fixed top-0 z-50">
      <motion.div
        layout
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onHoverStart={() => setIsExpanded(true)}
        onHoverEnd={() => setIsExpanded(false)}
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          pointer-events-auto cursor-pointer
          flex items-center gap-3 px-4 py-2 rounded-full
          glass shadow-lg transition-all duration-300
          ${isExpanded ? "max-w-md" : "max-w-[240px]"}
        `}
      >
        <motion.div 
          animate={{ rotate: statusType === "alert" ? [0, 10, -10, 0] : 0 }}
          transition={{ repeat: Infinity, duration: 2 }}
          className={`p-1.5 rounded-full ${statusType === "alert" ? "bg-blue-100 text-blue-600" : "bg-sky-blue/20 text-ocean-blue"}`}
        >
          <Ship className="w-4 h-4" />
        </motion.div>

        <div className="flex flex-col overflow-hidden">
          <span className="text-xs font-semibold whitespace-nowrap text-ocean-blue">
            {statusText}
          </span>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="pt-2 text-[10px] text-ocean-blue/70"
              >
                <div className="flex gap-4">
                  <div className="flex items-center gap-1">
                    <WeatherIcon className="w-3 h-3" /> {weather.temp}°C
                  </div>
                  <div className="flex items-center gap-1">
                    <Waves className="w-3 h-3" /> Sóng {weather.waveHeight}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
