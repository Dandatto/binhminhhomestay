import Image from 'next/image';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function ExperiencePage() {
  return (
    <div className="h-[100dvh] flex flex-col bg-bg-primary overflow-hidden">
      {/* Sticky Header */}
      <div className="shrink-0 glass px-4 py-4 pt-safe-top flex items-center justify-between">
        <h1 className="font-heading text-xl font-bold text-text-primary">trải nghiệm</h1>
        <LanguageSwitcher />
      </div>

      <div className="flex-1 overflow-y-auto pb-[84px]">
      <div className="flex flex-col gap-8 px-4 pt-6">
        {/* Experience 1 */}
        <div className="bg-surface rounded-card overflow-hidden shadow-soft border border-glass-border">
          <div className="relative aspect-video w-full bg-bg-secondary">
            <Image 
              src="https://picsum.photos/seed/robinson/800/600" 
              alt="Bãi Robinson" 
              fill 
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="p-5">
            <h3 className="font-heading text-2xl font-bold text-text-primary mb-2">Bãi Robinson</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Khám phá bãi biển hoang sơ, nước trong vắt. Thích hợp cho cắm trại, tắm biển và chụp ảnh check-in.
            </p>
          </div>
        </div>

        {/* Experience 2 */}
        <div className="bg-surface rounded-card overflow-hidden shadow-soft border border-glass-border">
          <div className="relative aspect-video w-full bg-bg-secondary">
            <Image 
              src="https://picsum.photos/seed/squid/800/600" 
              alt="Câu mực đêm" 
              fill 
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="p-5">
            <h3 className="font-heading text-2xl font-bold text-text-primary mb-2">Câu mực đêm</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Trải nghiệm làm ngư dân thực thụ. Thưởng thức thành quả ngay trên tàu với món mực hấp gừng nóng hổi.
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
