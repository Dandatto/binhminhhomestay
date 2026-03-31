"use client";

import { useState, useEffect } from "react";
import { useAdmin } from "@/components/AdminContext";

export default function AdminPricingPage() {
  const { token } = useAdmin();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    const res = await fetch("/api/admin/settings", {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setSettings(data.settings);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [token]);

  const updateSetting = async (key: string, value: string) => {
    setSaving(true);
    await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ key, value })
    });
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaving(false);
  };

  const handleInputChange = (k: string, v: string) => {
    setSettings(prev => ({ ...prev, [k]: v }));
  };

  const saveAll = async () => {
    for (const [k, v] of Object.entries(settings)) {
      await updateSetting(k, v);
    }
    alert("Đã lưu bảng giá thành công!");
  };

  return (
    <div className="p-8 max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-black text-ocean-blue">Cấu hình Bảng Giá Nhanh</h1>
        <p className="text-ocean-blue/60 mt-1">Thay đổi ở đây sẽ ngay lập tức áp dụng cho khách hàng đang xem web.</p>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-soft border border-sky-blue/10 space-y-8">
        
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-ocean-blue border-b border-sky-blue/20 pb-2">Giá phòng gốc (Standard)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PricingInput label="Combo 3N2D / Khách" settingKey="pricing_combo" val={settings['pricing_combo']} onChange={handleInputChange} />
            <PricingInput label="Căn Phi Thuyền (2 Giường)" settingKey="pricing_room_2_bed" val={settings['pricing_room_2_bed']} onChange={handleInputChange} />
            <PricingInput label="Căn Phi Thuyền (1 Giường)" settingKey="pricing_room_1_bed" val={settings['pricing_room_1_bed']} onChange={handleInputChange} />
            <PricingInput label="Homestay (2 Giường)" settingKey="pricing_homestay_2_bed" val={settings['pricing_homestay_2_bed']} onChange={handleInputChange} />
            <PricingInput label="Homestay (1 Giường)" settingKey="pricing_homestay_1_bed" val={settings['pricing_homestay_1_bed']} onChange={handleInputChange} />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-ocean-blue border-b border-sky-blue/20 pb-2">Thuật toán Phụ thu</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PricingInput label="Phụ thu cuối tuần (vnd)" settingKey="pricing_weekend_surcharge" val={settings['pricing_weekend_surcharge']} onChange={handleInputChange} />
            <div>
              <label className="block text-xs font-bold text-ocean-blue/50 mb-2 uppercase">Hệ số Lễ Tết (1.0 = tắt, 1.5 = +50%)</label>
              <input 
                type="number" step="0.1"
                value={settings['pricing_holiday_multiplier'] || ''}
                onChange={(e) => handleInputChange('pricing_holiday_multiplier', e.target.value)}
                className="w-full border border-sky-blue/30 rounded-xl px-4 py-3 bg-red-50 text-red-700 font-bold focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button 
            onClick={saveAll} 
            disabled={saving}
            className="bg-ocean-blue text-white px-8 py-4 rounded-2xl font-black text-lg hover:shadow-lg transition-all disabled:opacity-50"
          >
            {saving ? "Đang lưu..." : "ÁP DỤNG CẤU HÌNH"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PricingInput({ label, settingKey, val, onChange }: any) {
  return (
    <div>
      <label className="block text-xs font-bold text-ocean-blue/50 mb-2 uppercase">{label}</label>
      <div className="relative">
        <input 
          type="number" 
          value={val || ''}
          onChange={(e) => onChange(settingKey, e.target.value)}
          className="w-full border border-sky-blue/30 rounded-xl pl-4 pr-12 py-3 text-ocean-blue font-bold focus:outline-none focus:ring-2 focus:ring-ocean-blue"
        />
        <span className="absolute right-4 top-3 text-ocean-blue/30 font-bold">VNĐ</span>
      </div>
    </div>
  )
}
