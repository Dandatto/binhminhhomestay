import BentoDashboard from "@/components/BentoDashboard";
import Script from "next/script";
import { getStore } from "@/lib/store";
import Image from "next/image";

export const revalidate = 60; // Cache 1 minute

export default async function HomePage() {
  const store = getStore();
  const settings = await store.getSettings();
  const heroBg = settings.HOME_HERO_BG;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    "name": "Binh Minh Homestay",
    "description": "Nơi đón bình minh sớm nhất trên đảo Minh Châu.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Vân Đồn",
      "addressRegion": "Quảng Ninh",
      "addressCountry": "VN"
    },
    "starRating": {
      "@type": "Rating",
      "ratingValue": "5"
    }
  };

  return (
    <main className="pb-24 relative md:pb-0 h-[100dvh] overflow-y-auto overflow-x-hidden snap-y snap-mandatory md:h-auto md:overflow-visible md:snap-none">
      <Script
        id="hotel-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Dynamic Hero Background */}
      {heroBg && (
        <div className="absolute top-0 left-0 w-full h-[100dvh] -z-10 bg-ocean-blue">
          <Image 
            src={heroBg} 
            alt="Binh Minh Homestay Hero" 
            fill
            priority
            quality={90}
            unoptimized={heroBg.includes('vercel-storage.com') || heroBg.includes('placehold.co')}
            className="object-cover opacity-60" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ocean-blue/30 via-transparent to-sand-white" />
        </div>
      )}

      {/* Hero Snap Section */}
      <section className="min-h-[100dvh] w-full flex flex-col items-center justify-center px-6 text-center max-w-4xl mx-auto snap-start relative pt-12 md:pt-32 pb-24">
        <h1 className={`text-5xl md:text-7xl font-sans tracking-tighter mb-6 leading-none ${heroBg ? 'text-white' : 'text-ocean-blue'}`}>
          Cứ để đất liền <br /> 
          <span className="text-sky-blue font-serif italic font-normal">đợi chúng ta một chút.</span>
        </h1>
        <p className={`text-lg max-w-xl mx-auto font-sans font-medium ${heroBg ? 'text-white/80' : 'text-ocean-blue/60'}`}>
          Dandatto không nói quá, nhưng Bãi Robinson thực sự là nơi đầu tiên đón ánh bình minh sớm nhất đảo. Nghỉ ngơi tại &quot;Căn Phi Thuyền&quot; hiện đại, một khung cửa nhìn ra biển và không có tiếng báo thức.
        </p>
      </section>

      {/* Grid Snap Section */}
      <section className="min-h-[100dvh] w-full snap-start pb-12 pt-12 flex flex-col items-center justify-center">
        <BentoDashboard />
      </section>
    </main>
  );
}

