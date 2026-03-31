"use client";

import { motion } from "framer-motion";
import { CloudSun, Ship, Utensils, BedDouble, Camera, CloudRain, CloudFog } from "lucide-react";
import { useEffect, useState } from "react";
import type { VesselSchedule } from "@/lib/domain";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export default function BentoDashboard() {
  const [weather, setWeather] = useState({
    temp: "--", condition: "Đang tải...", uvIndex: "--", uvLabel: "", waveHeight: "--", loading: true
  });
  const [vessels, setVessels] = useState<VesselSchedule[]>([]);

  useEffect(() => {
    fetch("/api/v1/weather")
      .then(res => res.json())
      .then(data => {
        if (!data.error) setWeather({ ...data, loading: false });
      });

    fetch("/api/v1/vessels")
      .then(res => res.json())
      .then(data => {
        if (data.vessels) setVessels(data.vessels);
      });
  }, []);

  const WeatherIcon = weather.condition.includes("mưa") ? CloudRain : weather.condition.includes("mù") ? CloudFog : CloudSun;

  const nextVessel = vessels.find(v => v.status === "scheduled" || v.status === "departed");

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-auto gap-4 p-4 mt-40 max-w-7xl mx-auto">
      {/* Weather & Tide Large Block */}
      <motion.div 
        {...fadeIn}
        className="md:col-span-2 md:row-span-2 bg-white/80 p-8 rounded-3xl border border-sky-blue/20 shadow-soft flex flex-col justify-between"
      >
        <div>
          <h3 className="text-ocean-blue/50 font-semibold text-sm mb-4">THỜI TIẾT MINH CHÂU</h3>
          <div className="flex items-center gap-6">
            <WeatherIcon className="w-16 h-16 text-sunrise-yellow" />
            <div>
              <span className="text-6xl font-black text-ocean-blue">{weather.temp}°</span>
              <p className="text-ocean-blue/70">{weather.condition}</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="bg-sky-blue/10 p-4 rounded-2xl">
            <span className="block text-[10px] text-ocean-blue/50 mb-1">ĐỘ CAO SÓNG CHUẨN</span>
            <span className="text-xl font-bold text-ocean-blue">{weather.waveHeight}</span>
          </div>
          <div className="bg-sky-blue/10 p-4 rounded-2xl">
            <span className="block text-[10px] text-ocean-blue/50 mb-1">CHỈ SỐ TIA UV</span>
            <span className="text-xl font-bold text-ocean-blue">{weather.uvIndex} <span className="text-sm font-normal">/ {weather.uvLabel}</span></span>
          </div>
        </div>
      </motion.div>

      {/* Experience Block */}
      <motion.div 
        {...fadeIn}
        transition={{ delay: 0.1 }}
        className="md:col-span-2 bg-ocean-blue p-8 rounded-3xl text-sand-white flex flex-col justify-between group overflow-hidden relative"
      >
        <div className="relative z-10">
          <Camera className="w-8 h-8 text-sunrise-yellow mb-4" />
          <h2 className="text-2xl font-bold">Bãi Robinson</h2>
          <p className="opacity-70 mt-2">Nơi đón ánh bình minh sớm nhất trên đảo Minh Châu.</p>
        </div>
        <div className="absolute top-0 right-0 w-40 h-40 bg-sunrise-yellow/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-150 transition-transform duration-700" />
      </motion.div>

      {/* Dining Short Block */}
      <motion.div 
        {...fadeIn}
        transition={{ delay: 0.2 }}
        className="bg-white/80 p-6 rounded-3xl border border-sky-blue/20 shadow-sm flex flex-col items-center justify-center text-center gap-3 hover:shadow-md transition-shadow"
      >
        <Utensils className="w-6 h-6 text-ocean-blue" />
        <span className="font-bold text-ocean-blue">Ẩm thực</span>
      </motion.div>

      {/* Rooms Short Block */}
      <motion.div 
        {...fadeIn}
        transition={{ delay: 0.3 }}
        className="bg-white/80 p-6 rounded-3xl border border-sky-blue/20 shadow-sm flex flex-col items-center justify-center text-center gap-3 hover:shadow-md transition-shadow"
      >
        <BedDouble className="w-6 h-6 text-ocean-blue" />
        <span className="font-bold text-ocean-blue">Phòng nghỉ</span>
      </motion.div>

      {/* Vessels Status */}
      <motion.div 
        {...fadeIn}
        transition={{ delay: 0.4 }}
        className="md:col-span-2 bg-sunrise-yellow/20 border-2 border-sunrise-yellow/50 p-6 rounded-3xl flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="bg-white p-3 rounded-2xl">
            <Ship className="w-6 h-6 text-ocean-blue" />
          </div>
          <div>
            <h4 className="font-bold text-ocean-blue">Tàu Cao Tốc {nextVessel ? nextVessel.operator : ""}</h4>
            <p className="text-xs text-ocean-blue/60">{nextVessel ? `Chuyến ${nextVessel.departure} · ${nextVessel.direction === "inbound" ? "Vào đảo" : "Về đất liền"}` : "Các chuyến đã chạy hết"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {nextVessel?.status === "departed" && <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />}
          {nextVessel?.status === "scheduled" && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
          {!nextVessel && <div className="w-2 h-2 bg-gray-500 rounded-full" />}
          
          <span className="text-sm font-semibold text-ocean-blue">
            {nextVessel?.status === "departed" && "Đang chạy trên biển"}
            {nextVessel?.status === "scheduled" && "Sắp khởi hành"}
            {!nextVessel && "Biển nghỉ"}
          </span>
        </div>
      </motion.div>
    </div>
  );
}

