"use client";

import { useState, useEffect, useCallback } from "react";
import { useAdmin } from "@/components/AdminContext";
import { toast } from "sonner";
import { Copy, Trash, UploadCloud, Loader2, Image as ImageIcon, MoreVertical, X, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import type { MediaAsset } from "@/lib/domain";

export default function AdminPhotosPage() {
  const { token } = useAdmin();
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Context Menu State
  const [contextMenuOpen, setContextMenuOpen] = useState<string | null>(null);
  const [settingImageKey, setSettingImageKey] = useState<string | null>(null);

  const IMAGE_POSITIONS = [
    { key: "HOME_HERO_BG", label: "Ảnh nền Trang chủ (Trên cùng)" },
    { key: "HOME_ABOUT_IMG", label: "Ảnh mục Về Binh Minh" },
    { key: "PROMO_BANNER_IMG", label: "Ảnh Banner Khuyến Mãi" },
    { key: "ROOM_VILLA_COVER", label: "Ảnh đại diện Khu Villa" },
    { key: "ROOM_BUNGALOW_COVER", label: "Ảnh đại diện Khu Bungalow" }
  ];

  const fetchAssets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/media?limit=50", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAssets(data.assets || []);
      }
    } catch {
      toast.error("Lỗi khi tải danh sách ảnh");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Chỉ chấp nhận file định dạng hình ảnh (jpg, png, webp...)");
      return;
    }

    setUploading(true);
    const uploadingToast = toast.loading("Đang tải ảnh lên máy chủ...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/media", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        toast.dismiss(uploadingToast);
        toast.success("Tải ảnh thành công!");
        fetchAssets();
      } else {
        const err = await res.json();
        toast.dismiss(uploadingToast);
        toast.error(`Lỗi: ${err.error}`);
      }
    } catch {
      toast.dismiss(uploadingToast);
      toast.error("Lỗi kết nối khi tải ảnh");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDelete = async (id: string, url: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa ảnh này?")) return;
    
    const deletingToast = toast.loading("Đang xóa ảnh khỏi máy chủ...");
    try {
      const res = await fetch(`/api/admin/media?id=${id}&url=${encodeURIComponent(url)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.dismiss(deletingToast);
        toast.success("Đã xóa ảnh");
        fetchAssets();
      } else {
        toast.dismiss(deletingToast);
        toast.error("Xóa thất bại");
      }
    } catch {
      toast.dismiss(deletingToast);
      toast.error("Lỗi xóa ảnh");
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Đã copy đường dẫn ảnh");
  };

  const handleApplySetting = async (key: string, url: string) => {
    setSettingImageKey(key);
    const applyToast = toast.loading("Đang cài đặt ảnh...");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ key, value: url })
      });
      if (res.ok) {
        toast.dismiss(applyToast);
        toast.success("Đã cài đặt ảnh cho Website thành công!");
        setContextMenuOpen(null);
      } else {
        toast.dismiss(applyToast);
        toast.error("Cài đặt thất bại");
      }
    } catch {
      toast.dismiss(applyToast);
      toast.error("Lỗi kết nối");
    } finally {
      setSettingImageKey(null);
    }
  };

  function bytesToMB(bytes: number) {
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-soft border border-sky-blue/10">
        <div>
          <h1 className="text-3xl font-black text-ocean-blue flex items-center gap-3">
            <ImageIcon className="w-8 h-8 text-indigo-500" /> Thư viện Hình ảnh
          </h1>
          <p className="text-ocean-blue/60 mt-2 font-medium">Lưu trữ hình ảnh của Homestay lên nền tảng mây (Vercel Blob). Copy link để chèn vào Banner hoặc Phòng.</p>
        </div>
        <button onClick={fetchAssets} className="text-sm font-bold text-ocean-blue bg-sand-white px-4 py-2 rounded-xl hover:bg-sky-blue/10 transition-colors">
          Làm mới 🔄
        </button>
      </div>

      {/* Upload Zone */}
      <div 
        className={`w-full h-48 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all bg-white
          ${isDragging ? "border-ocean-blue bg-ocean-blue/5 scale-[1.01]" : "border-sky-blue/30 hover:border-ocean-blue/50"}
          ${uploading ? "opacity-50 pointer-events-none" : "cursor-pointer"}
        `}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <label className="flex flex-col items-center w-full h-full justify-center cursor-pointer">
          <input 
            type="file" className="hidden" accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleUpload(e.target.files[0]);
                e.target.value = ""; // reset input
              }
            }}
          />
          {uploading ? (
            <Loader2 className="w-10 h-10 animate-spin text-ocean-blue/50 mb-3" />
          ) : (
            <UploadCloud className="w-10 h-10 text-ocean-blue/50 mb-3" />
          )}
          <p className="font-bold text-ocean-blue text-lg">
            {uploading ? "Đang xử lý..." : "Kéo thả ảnh vào đây, hoặc Click để chọn file"}
          </p>
          <p className="text-ocean-blue/50 text-sm font-medium mt-1">Chấp nhận JPG, PNG, WEBP. Ảnh tự động tối ưu hóa.</p>
        </label>
      </div>

      {/* Gallery Grid */}
      <div className="bg-white rounded-3xl shadow-soft border border-sky-blue/10 overflow-hidden p-6 max-h-[600px] overflow-y-auto">
        <h2 className="text-xl font-bold text-ocean-blue mb-6">Tất cả Ảnh ({assets.length}/50)</h2>
        
        {loading && assets.length === 0 ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-ocean-blue/30" /></div>
        ) : assets.length === 0 ? (
          <div className="text-center py-12 text-ocean-blue/40 font-bold bg-sand-white/50 rounded-2xl border border-dashed border-sky-blue/20">Chưa có hình ảnh nào được tải lên.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {assets.map((asset) => (
              <div key={asset.id} className="group relative bg-sand-white rounded-2xl p-2 border border-sky-blue/10 hover:shadow-md transition-shadow">
                
                {/* Thumbnail (unoptimized because vercel blob returns cdn URL directly) */}
                <div className="w-full aspect-square relative rounded-xl overflow-hidden bg-gray-100">
                  <Image 
                    src={asset.blobUrl} 
                    alt={asset.fileName} 
                    fill 
                    unoptimized
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Actions overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                    <button 
                      onClick={() => handleCopyLink(asset.blobUrl)}
                      className="p-3 bg-white text-ocean-blue rounded-full hover:scale-110 active:scale-95 transition-transform shadow-lg"
                      title="Copy đường dẫn"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setContextMenuOpen(asset.id)}
                      className="p-3 bg-sunrise-yellow text-ocean-blue rounded-full hover:scale-110 active:scale-95 transition-transform shadow-lg"
                      title="Cài đặt trên Web"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(asset.id, asset.blobUrl)}
                      className="p-3 bg-red-500 text-white rounded-full hover:scale-110 active:scale-95 transition-transform shadow-lg"
                      title="Xóa ảnh"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Info block */}
                <div className="p-2 space-y-1">
                  <p className="text-xs font-bold text-ocean-blue truncate" title={asset.fileName}>{asset.fileName}</p>
                  <div className="flex justify-between items-center text-[10px] text-ocean-blue/50 font-mono">
                    <span>{bytesToMB(asset.sizeBytes)}</span>
                    <span>{new Date(asset.createdAt).toLocaleDateString("vi-VN")}</span>
                  </div>
                </div>
                
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Context Menu Modal */}
      {contextMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ocean-blue/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-sky-blue/10">
              <h3 className="font-black text-xl text-ocean-blue">Gán ảnh cho Website</h3>
              <button 
                onClick={() => setContextMenuOpen(null)}
                className="p-2 bg-sand-white rounded-full text-ocean-blue hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-3">
              <p className="text-sm font-medium text-ocean-blue/70 mb-4">Bạn muốn sử dụng ảnh này cho vị trí nào trên trang web khách hàng?</p>
              
              {IMAGE_POSITIONS.map((pos) => (
                <button
                  key={pos.key}
                  disabled={settingImageKey !== null}
                  onClick={() => handleApplySetting(pos.key, assets.find(a => a.id === contextMenuOpen)?.blobUrl || "")}
                  className="w-full flex items-center justify-between p-4 bg-sand-white hover:bg-ocean-blue/5 rounded-2xl border border-sky-blue/20 transition-all font-bold text-ocean-blue disabled:opacity-50"
                >
                  <span className="flex items-center gap-3">
                    <ImageIcon className="w-5 h-5 text-indigo-500" />
                    {pos.label}
                  </span>
                  {settingImageKey === pos.key ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5 text-ocean-blue/30" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
