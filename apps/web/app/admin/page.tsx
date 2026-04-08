'use client';

import { useState } from 'react';
import { useEffect } from 'react';
import { BookingCard } from '@/components/BookingCard';
import { DollarSign, Ship, Image as ImageIcon, FileText, BarChart3, BedDouble, Sun, Moon, QrCode } from 'lucide-react';
import { AdminChart } from '@/components/AdminChart';
import { QuickKnowledgeUpdate } from '@/components/QuickKnowledgeUpdate';
import { AdminQRModal } from '@/components/AdminQRModal';
import { AdminSessionsWidget } from '@/components/AdminSessionsWidget';

export default function AdminPage() {
  const [adminTheme, setAdminTheme] = useState<'admin-dark' | 'admin-light'>('admin-dark');
  const [qrModalOpen, setQrModalOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', adminTheme);
  }, [adminTheme]);

  return (
    <div className="h-[100dvh] flex flex-col bg-bg-primary overflow-hidden transition-colors duration-500">
      {/* QR Modal — mounts at root level for correct z-index stacking */}
      <AdminQRModal isOpen={qrModalOpen} onClose={() => setQrModalOpen(false)} />

      {/* ── Sticky Header ─────────────────────────────────────────── */}
      <div className="shrink-0 glass px-4 py-4 pt-safe-top flex items-center justify-between">
        <h1 className="font-heading text-xl font-bold text-text-primary">BMH</h1>
        <div className="flex items-center gap-2">
          {/* QR Check-in — primary staff action */}
          <button
            onClick={() => setQrModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 min-h-[36px]
                       bg-accent text-bg-primary text-[0.6875rem] font-sans font-medium
                       rounded-full active:scale-95 transition-transform duration-[150ms]"
          >
            <QrCode className="w-3.5 h-3.5" strokeWidth={1.5} />
            Check-in
          </button>
          <button
            onClick={() => setAdminTheme(t => t === 'admin-dark' ? 'admin-light' : 'admin-dark')}
            className="flex items-center justify-center w-9 h-9 rounded-full
                       bg-text-primary text-bg-primary border border-bg-primary/20
                       active:scale-95 transition-transform duration-[150ms]"
            aria-label="Toggle Admin Theme"
          >
            {adminTheme === 'admin-dark'
              ? <Sun  className="w-5 h-5" strokeWidth={1.5} />
              : <Moon className="w-5 h-5" strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {/* ── Scrollable body ───────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto pb-[84px]">

        <div className="px-4 mt-4">
          <AdminChart />
        </div>

        {/* Metrics Strip */}
        <div className="px-4 py-4">
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            <div className="flex-shrink-0 bg-text-primary text-bg-primary px-4 py-3 rounded-card">
              <div className="text-[0.6875rem] font-sans text-bg-primary/70 mb-1 flex items-center gap-1">
                <BarChart3 className="w-3 h-3" strokeWidth={1.5} /> hôm nay
              </div>
              <div className="font-bold flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-accent" strokeWidth={1.5} /> 15tr
              </div>
            </div>
            <div className="flex-shrink-0 bg-surface text-text-primary px-4 py-3 rounded-card border border-[var(--glass-border)]">
              <div className="text-[0.6875rem] font-sans text-text-secondary mb-1">phòng trống</div>
              <div className="font-bold flex items-center gap-1">
                <BedDouble className="w-4 h-4 text-accent" strokeWidth={1.5} /> 2
              </div>
            </div>
            <div className="flex-shrink-0 bg-surface text-text-primary px-4 py-3 rounded-card border border-[var(--glass-border)]">
              <div className="text-[0.6875rem] font-sans text-text-secondary mb-1">tàu tới</div>
              <div className="font-bold flex items-center gap-1">
                <Ship className="w-4 h-4 text-accent" strokeWidth={1.5} /> 14:00
              </div>
            </div>
          </div>
        </div>

        {/* ── Active Sessions Widget ──────────────────────────────── */}
        <div className="px-4 mb-4">
          <AdminSessionsWidget />
        </div>

        <div className="px-4 mb-6">
          <QuickKnowledgeUpdate />
        </div>

        {/* Booking Cards */}
        <div className="px-4 flex flex-col gap-4 mb-6">
          <BookingCard status="new"       guestName="Nguyễn Văn A" dates="15-17/04" room="Phi Thuyền" />
          <BookingCard status="deposited" guestName="Trần B"        dates="18-20/04" room="Nhà Gỗ Bungalow" />
        </div>

        {/* Quick Actions Strip */}
        <div className="mx-4 bg-surface rounded-card border border-[var(--glass-border)] p-3
                        flex justify-between items-center mb-4">
          {[
            { icon: DollarSign, label: 'giá',      accent: true  },
            { icon: Ship,       label: 'tàu',      accent: false },
            { icon: ImageIcon,  label: 'ảnh',      accent: false },
            { icon: FileText,   label: 'bài viết', accent: false },
          ].map(({ icon: Icon, label, accent }) => (
            <button key={label}
              className="flex flex-col items-center gap-1 p-2 flex-1 active:scale-95 transition-transform duration-[150ms]"
            >
              <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center
                ${accent
                  ? 'border-accent text-accent bg-accent/5'
                  : 'border-text-primary text-text-primary bg-text-primary/5'}`}>
                <Icon className="w-6 h-6" strokeWidth={2} />
              </div>
              <span className="text-[0.6875rem] font-sans font-bold text-text-primary mt-1">{label}</span>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
