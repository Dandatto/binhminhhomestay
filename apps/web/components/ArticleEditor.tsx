"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/components/AdminContext";
import { toast } from "sonner";
import { Save, ArrowLeft, Image as ImageIcon, CheckCircle2, Loader2, X } from "lucide-react";
import Image from "next/image";
import type { Article, MediaAsset } from "@/lib/domain";



interface ArticleEditorProps {
  initialData?: Article;
}

export function ArticleEditor({ initialData }: ArticleEditorProps) {
  const { token } = useAdmin();
  const router = useRouter();

  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || "");
  const [status, setStatus] = useState<Article["status"]>(initialData?.status || "PUBLISHED");
  // Auto-generation fields
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [tags, setTags] = useState(initialData?.tags || "");
  
  const [saving, setSaving] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<"cover" | "content">("content");

  // Fetch media library when modal opens
  useEffect(() => {
    if (!showMediaModal) return;
    const fetchMedia = async () => {
      setMediaLoading(true);
      try {
        const res = await fetch("/api/admin/media?limit=50", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMediaAssets(data.assets || []);
        }
      } catch {
        toast.error("Không thể tải thư viện ảnh");
      } finally {
        setMediaLoading(false);
      }
    };
    fetchMedia();
  }, [showMediaModal, token]);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Vui lòng điền đủ Tiêu đề và Nội dung bài viết");
      return;
    }

    setSaving(true);
    const savingToast = toast.loading("Đang lưu bài viết...");

    try {
      const payload = {
        title,
        content,
        coverImage: coverImage || undefined,
        status,
        slug: slug.trim() || undefined,
        tags: tags.trim() || undefined,
        // Publish date defaults to now on server if not provided
      };

      const url = initialData ? `/api/admin/articles/${initialData.id}` : "/api/admin/articles";
      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.dismiss(savingToast);
        toast.success("Đã lưu bài viết thành công!");
        router.push("/admin/articles");
        router.refresh();
      } else {
        const err = await res.json();
        toast.dismiss(savingToast);
        toast.error(`Lưu thất bại: ${err.error}`);
      }
    } catch {
      toast.dismiss(savingToast);
      toast.error("Lỗi mạng khi lưu bài viết");
    } finally {
      setSaving(false);
    }
  };

  const handleLocalUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file hình ảnh hợp lệ");
      return;
    }

    const uploadingToast = toast.loading("Đang tải ảnh lên thư viện...");
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/media", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        toast.dismiss(uploadingToast);
        handleSelectImage(data.asset.blobUrl);
      } else {
        const err = await res.json();
        toast.dismiss(uploadingToast);
        toast.error(`Lỗi: ${err.error || 'Unauthorized'}`);
      }
    } catch {
      toast.dismiss(uploadingToast);
      toast.error("Lỗi mạng khi tải ảnh");
    }
    
    // reset input
    e.target.value = "";
  };

  const handleSelectImage = (url: string) => {
    if (mediaTarget === "cover") {
      setCoverImage(url);
    } else {
      // Insert markdown image into content
      const imgMarkdown = `\n\n![Mô tả ảnh](${url})\n\n`;
      setContent(prev => prev + imgMarkdown);
      toast.success("Đã chèn ảnh vào nội dung!");
    }
    setShowMediaModal(false);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex justify-between items-center">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-ocean-blue hover:text-ocean-blue/70 font-bold transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Trở lại
        </button>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="flex items-center gap-2 text-white bg-ocean-blue px-6 py-3 rounded-xl hover:brightness-110 font-bold transition-all shadow-lg disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Lưu Bài Viết
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl shadow-soft border border-sky-blue/10 p-6 space-y-6">
            
            <div>
              <label className="block text-sm font-bold text-ocean-blue mb-2">Tiêu đề bài viết</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Cẩm nang du lịch Vịnh Hạ Long 2026..."
                className="w-full text-2xl font-black text-ocean-blue bg-sand-white p-4 rounded-xl border border-sky-blue/20 focus:outline-none focus:ring-2 focus:ring-sunrise-yellow/50"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-ocean-blue">Nội dung chính</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => { setMediaTarget("content"); setShowMediaModal(true); }}
                    className="flex items-center gap-1.5 text-xs font-bold text-ocean-blue bg-sky-blue/10 px-3 py-1.5 rounded-lg hover:bg-sky-blue/20 transition-colors"
                  >
                    <ImageIcon className="w-4 h-4 text-indigo-500" /> Chèn Ảnh
                  </button>
                </div>
              </div>
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Nhập nội dung vào đây... (Hỗ trợ xuống dòng, tự động định dạng)"
                className="w-full h-[500px] text-[15px] leading-relaxed text-ocean-blue bg-sand-white p-4 rounded-xl border border-sky-blue/20 focus:outline-none focus:ring-2 focus:ring-sunrise-yellow/50 font-sans resize-none"
              />
              <p className="text-xs text-ocean-blue/50 mt-3 font-medium">✨ Mẹo: Trình soạn thảo sẽ tự động định dạng nội dung của bạn thành thiết kế chuẩn mực trên website để tối ưu hiển thị.</p>
            </div>

          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-soft border border-sky-blue/10 p-6 space-y-6">
            <h3 className="font-black text-ocean-blue text-lg border-b border-sky-blue/10 pb-4">Cài đặt hiển thị</h3>
            
            {/* Cover Image */}
            <div>
              <label className="flex justify-between items-center text-sm font-bold text-ocean-blue mb-2">
                Ảnh đại diện (Nổi bật)
                <button 
                  onClick={() => { setMediaTarget("cover"); setShowMediaModal(true); }}
                  className="text-xs text-blue-500 hover:underline"
                >
                  Chọn từ thư viện
                </button>
              </label>
              <div 
                className="w-full aspect-video rounded-xl border-2 border-dashed border-sky-blue/30 bg-sand-white flex items-center justify-center overflow-hidden cursor-pointer hover:border-sunrise-yellow/50 transition-colors relative"
                onClick={() => { setMediaTarget("cover"); setShowMediaModal(true); }}
              >
                {coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={coverImage} alt="Cover Preview" className="object-cover w-full h-full" />
                ) : (
                  <div className="text-center text-ocean-blue/40">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <span className="text-xs font-bold">Chưa có ảnh bìa</span>
                  </div>
                )}
              </div>
            </div>

            {/* Trạng thái */}
            <div>
              <label className="block text-sm font-bold text-ocean-blue mb-2">Trạng thái xuất bản</label>
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value as Article["status"])}
                className="w-full bg-sand-white p-3 rounded-xl border border-sky-blue/20 text-sm font-bold text-ocean-blue focus:outline-none focus:ring-2 focus:ring-sunrise-yellow/50"
              >
                <option value="PUBLISHED">🟢 Đăng công khai (Lên Web)</option>
                <option value="DRAFT">🟡 Lưu bản nháp (Chưa hiện Web)</option>
              </select>
            </div>

            {/* AI Auto-gen Fields (Slug, Tags) */}
            <div className="pt-4 border-t border-sky-blue/10 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-ocean-blue/50 mb-4 bg-sand-white p-3 rounded-lg border border-sky-blue/10">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Hệ thống AI tự động sinh SEO Meta, Đường dẫn URL & Tag nếu để trống.</span>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-ocean-blue mb-1">Đường dẫn tĩnh (Slug / URL)</label>
                <input 
                  type="text" 
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="Để trống tự tạo..."
                  className="w-full text-xs font-mono text-ocean-blue/70 bg-sand-white p-2.5 rounded-lg border border-sky-blue/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ocean-blue mb-1">Từ khóa (Tags)</label>
                <input 
                  type="text" 
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="dulich, halong, binhminh..."
                  className="w-full text-xs font-mono text-ocean-blue/70 bg-sand-white p-2.5 rounded-lg border border-sky-blue/20 focus:outline-none"
                />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Floating Save Button at Bottom for Low-tech user easily finding it */}
      <div className="flex justify-end pt-8 pb-4 border-t border-sky-blue/20">
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="flex items-center gap-2 text-white bg-ocean-blue px-8 py-4 rounded-full hover:brightness-110 font-bold transition-all shadow-xl disabled:opacity-50 text-lg hover:scale-105 active:scale-95"
        >
          {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
          Lưu & Đăng Bài Viết
        </button>
      </div>

      {/* Media Picker Modal */}
      {showMediaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ocean-blue/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl max-h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-sky-blue/10">
              <div className="flex items-center gap-4">
                <h3 className="font-black text-xl text-ocean-blue"><ImageIcon className="w-6 h-6 inline-block text-indigo-500 mr-2"/> Chọn Ảnh</h3>
                <label className="cursor-pointer bg-sunrise-yellow/20 hover:bg-sunrise-yellow/30 text-ocean-blue px-4 py-2 rounded-xl font-bold text-sm transition-colors border border-sunrise-yellow/50">
                  Tải ảnh từ máy tính
                  <input type="file" className="hidden" accept="image/*" onChange={handleLocalUpload} />
                </label>
              </div>
              <button 
                onClick={() => setShowMediaModal(false)}
                className="p-2 bg-sand-white rounded-full text-ocean-blue hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto">
              {mediaLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-ocean-blue/30" /></div>
              ) : mediaAssets.length === 0 ? (
                <div className="text-center py-20 text-ocean-blue/50">Thư viện trống. Hãy vào menu &quot;Thư viện ảnh&quot; tải ảnh lên trước.</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {mediaAssets.map((asset) => (
                    <div 
                      key={asset.id} 
                      className="group cursor-pointer aspect-square relative rounded-xl overflow-hidden bg-gray-100 border-2 border-transparent hover:border-sunrise-yellow transition-colors shadow-sm"
                      onClick={() => handleSelectImage(asset.blobUrl)}
                    >
                      <Image 
                        src={asset.blobUrl} 
                        alt="Media" 
                        fill 
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-ocean-blue/0 group-hover:bg-ocean-blue/20 transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 bg-white text-ocean-blue text-xs font-bold px-3 py-1.5 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all">
                          Chọn ảnh này
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
