"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Sunrise, Wind, Waves, MapPin } from "lucide-react";
import { useRef } from "react";
import { FishJump, WittyEntrance } from "@/components/MicroInteractions";
import Script from "next/script";

export default function ExperiencePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AttractionLandingPage",
    "mainEntity": {
      "@type": "TouristAttraction",
      "name": "Bãi Robinson",
      "description": "Nơi đón bình minh sớm nhất trên đảo Minh Châu.",
      "location": {
        "@type": "Place",
        "name": "Đảo Minh Châu, Vân Đồn, Quảng Ninh"
      }
    }
  };
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);

  return (
    <main className="bg-sand-white" ref={containerRef}>
      <Script
        id="experience-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero Section */}
      <section className="h-screen flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
        <motion.div style={{ opacity, scale }} className="z-10">
          <WittyEntrance>
            <Sunrise className="w-16 h-16 text-sunrise-yellow mx-auto mb-8" />
            <h1 className="text-6xl md:text-8xl font-black text-ocean-blue tracking-tighter leading-none mb-6">
              Bãi <br /> Robinson.
            </h1>
            <p className="text-xl text-ocean-blue/60 max-w-lg mx-auto font-medium">
              Chỉ 1.5km từ trung tâm, nhưng cảm giác như một thế giới khác.
            </p>
          </WittyEntrance>
        </motion.div>

        {/* Decorative elements */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-1 h-12 bg-ocean-blue/20 rounded-full" />
        </div>
      </section>

      {/* Storytelling Section 1 */}
      <section className="py-32 px-6 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
        <div className="space-y-8">
          <h2 className="text-4xl font-bold text-ocean-blue">Tại sao gọi là Robinson?</h2>
          <p className="text-lg text-ocean-blue/70 leading-relaxed">
            Vì ở đây không có sóng wifi (thực ra là có, nhưng chúng tôi khuyên bạn nên tắt nó đi). Ở đây chỉ có tiếng sóng vỗ, tiếng gió rít qua những rặng phi lao và ánh nắng đầu tiên của ngày mới.
          </p>
          <div className="flex gap-4">
            <div className="p-4 glass rounded-2xl flex flex-col gap-2">
              <Wind className="w-5 h-5 text-sky-blue" />
              <span className="text-sm font-bold">Gió biển</span>
            </div>
            <div className="p-4 glass rounded-2xl flex flex-col gap-2">
              <Waves className="w-5 h-5 text-ocean-blue" />
              <span className="text-sm font-bold">Sóng êm</span>
            </div>
          </div>
        </div>
        <div className="aspect-[4/5] bg-ocean-blue/5 rounded-[40px] flex items-center justify-center border border-ocean-blue/10 relative overflow-hidden group">
          <FishJump className="z-10">
            <div className="w-32 h-32 bg-sunrise-yellow rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
          </FishJump>
          <span className="text-ocean-blue/30 font-bold italic absolute bottom-8">Authentic Robinson Vibes</span>
        </div>
      </section>

      {/* Interactive Map/Wayyfinding */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <MapPin className="w-12 h-12 text-ocean-blue mx-auto" />
          <h2 className="text-4xl font-bold text-ocean-blue tracking-tight">Hành trình ra bãi tắm</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Step number="1" title="Nhảy lên xe điện" desc="5 phút từ Bình Minh Homestay." />
            <Step number="2" title="Đi bộ xuyên rừng" desc="10 phút trekking nhẹ qua rừng phi lao." />
            <Step number="3" title="Chạm tay vào biển" desc="Đừng quên mang theo một ly cà phê." />
          </div>
        </div>
      </section>
    </main>
  );
}

function Step({ number, title, desc }: { number: string; title: string; desc: string }) {
  return (
    <div className="p-8 border border-ocean-blue/5 rounded-3xl flex flex-col items-center gap-4 hover:bg-sand-white transition-colors group">
      <div className="w-10 h-10 bg-ocean-blue text-white rounded-full flex items-center justify-center font-bold group-hover:bg-sunrise-yellow group-hover:text-ocean-blue transition-colors">
        {number}
      </div>
      <h3 className="font-bold text-ocean-blue">{title}</h3>
      <p className="text-sm text-ocean-blue/60">{desc}</p>
    </div>
  );
}
