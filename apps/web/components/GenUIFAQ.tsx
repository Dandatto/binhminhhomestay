"use client";

import { motion } from "framer-motion";
import { Map, Bus, Compass } from "lucide-react";
import { useState } from "react";

export default function GenUIFAQ() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<null | "map" | "bus">(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.toLowerCase().includes("đi") || query.toLowerCase().includes("đến")) {
      setResponse("map");
    } else if (query.toLowerCase().includes("tàu") || query.toLowerCase().includes("vận tải")) {
      setResponse("bus");
    } else {
      setResponse(null);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <form onSubmit={handleSearch} className="relative group">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Hỏi bất cứ điều gì về Minh Châu..."
          className="w-full bg-white p-6 rounded-[24px] shadow-soft border-2 border-ocean-blue/5 outline-none focus:border-sunrise-yellow transition-all text-lg font-medium pr-16"
        />
        <button className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-ocean-blue text-white rounded-xl hover:bg-ocean-blue/90 transition-colors">
          <Compass className="w-6 h-6 animate-pulse" />
        </button>
      </form>

      <motion.div 
        layout
        className="glass rounded-[32px] p-8 border border-ocean-blue/10 min-h-[100px] flex items-center justify-center text-center"
      >
        {!response ? (
          <p className="text-ocean-blue/40 font-medium italic">
            &quot;Dandatto AI đang đợi câu hỏi của bạn. Hãy thử hỏi: &apos;Làm sao để đến homestay?&apos;&quot;
          </p>
        ) : response === "map" ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-4">
            <div className="flex items-center gap-2 text-ocean-blue font-bold">
              <Map className="w-5 h-5" />
              <span>Bản đồ lộ trình thông minh</span>
            </div>
            <div className="aspect-video bg-sky-blue/10 rounded-2xl flex items-center justify-center border-2 border-dashed border-sky-blue/30">
              <span className="text-sky-blue font-black tracking-widest">[ INTERACTIVE MAP COMPONENT ]</span>
            </div>
            <p className="text-sm text-ocean-blue/70">
              Đi từ Ao Tiên, bạn có thể gọi Taxi 033-xxx-xxxx hoặc báo Bình Minh đón bằng xe điện.
            </p>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-4">
            <div className="flex items-center gap-2 text-ocean-blue font-bold">
              <Bus className="w-5 h-5" />
              <span>Lịch trình vận tải đa phương thức</span>
            </div>
            <div className="p-4 bg-white/50 rounded-xl space-y-2 text-left">
              <div className="flex justify-between border-b pb-2">
                <span>Tàu Havaco</span>
                <span className="font-bold">07:30 - Ao Tiên</span>
              </div>
              <div className="flex justify-between">
                <span>Tàu Quang Minh</span>
                <span className="font-bold">10:30 - Ao Tiên</span>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
