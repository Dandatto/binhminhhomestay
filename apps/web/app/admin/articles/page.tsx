"use client";

import { useState, useEffect, useCallback } from "react";
import { useAdmin } from "@/components/AdminContext";
import { toast } from "sonner";
import { Plus, Edit, Trash, FileText, Loader2, Image as ImageIcon, Eye } from "lucide-react";
import Link from "next/link";
import type { Article } from "@/lib/domain";

export default function AdminArticlesPage() {
  const { token } = useAdmin();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/articles?limit=50", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setArticles(data.articles || []);
      }
    } catch {
      toast.error("Lỗi khi tải danh sách bài viết");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa bài viết "${title}" không?`)) return;
    
    const deletingToast = toast.loading("Đang xóa bài viết...");
    try {
      const res = await fetch(`/api/admin/articles/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.dismiss(deletingToast);
        toast.success("Đã xóa bài viết");
        fetchArticles();
      } else {
        toast.dismiss(deletingToast);
        toast.error("Xóa thất bại");
      }
    } catch {
      toast.dismiss(deletingToast);
      toast.error("Lỗi mạng khi xóa bài viết");
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-soft border border-sky-blue/10">
        <div>
          <h1 className="text-3xl font-black text-ocean-blue flex items-center gap-3">
            <FileText className="w-8 h-8 text-orange-500" /> Quản trị Bài Viết
          </h1>
          <p className="text-ocean-blue/60 mt-2 font-medium">Viết tin tức, cẩm nang du lịch và các chương trình khuyến mãi.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={fetchArticles} className="text-sm font-bold text-ocean-blue bg-sand-white px-4 py-2 rounded-xl hover:bg-sky-blue/10 transition-colors">
            Làm mới 🔄
          </button>
          <Link href="/admin/articles/new" className="flex items-center gap-2 text-sm font-bold text-white bg-sunrise-yellow px-5 py-2 rounded-xl hover:brightness-105 transition-all shadow-md">
            <Plus className="w-5 h-5"/> Bài viết mới
          </Link>
        </div>
      </div>

      {/* Articles List */}
      <div className="bg-white rounded-3xl shadow-soft border border-sky-blue/10 overflow-hidden">
        {loading && articles.length === 0 ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-ocean-blue/30" /></div>
        ) : articles.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="bg-sand-white inline-flex p-4 rounded-full mb-4">
              <FileText className="w-10 h-10 text-ocean-blue/20" />
            </div>
            <h3 className="text-xl font-bold text-ocean-blue mb-2">Chưa có bài viết nào</h3>
            <p className="text-ocean-blue/60 mb-6">Hãy tạo bài viết đầu tiên để thu hút khách hàng đến với Binh Minh Homestay.</p>
            <Link href="/admin/articles/new" className="inline-flex items-center gap-2 text-sm font-bold text-white bg-ocean-blue px-6 py-3 rounded-xl hover:brightness-110 transition-all shadow-md">
              <Plus className="w-5 h-5"/> Viết ngay
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-sand-white/50 text-ocean-blue/60 text-sm border-b border-sky-blue/10">
                  <th className="p-4 font-bold">Bài viết</th>
                  <th className="p-4 font-bold">Trạng thái</th>
                  <th className="p-4 font-bold">Ngày đăng xuất bản</th>
                  <th className="p-4 font-bold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-blue/10">
                {articles.map((article) => (
                  <tr key={article.id} className="hover:bg-sand-white/20 transition-colors">
                    <td className="p-4">
                      <div className="flex gap-4 items-center">
                        {article.coverImage ? (
                          <div className="w-16 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 relative border border-sky-blue/10">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={article.coverImage} alt="Cover" className="object-cover w-full h-full" />
                          </div>
                        ) : (
                          <div className="w-16 h-12 rounded-lg bg-sand-white border border-sky-blue/20 flex items-center justify-center flex-shrink-0 text-ocean-blue/20">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-ocean-blue text-[15px]">{article.title}</p>
                          <p className="text-xs text-ocean-blue/50 mt-1 font-mono">/news/{article.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {article.status === 'PUBLISHED' ? (
                        <span className="bg-teal-500/10 text-teal-600 px-3 py-1 rounded-full text-xs font-bold border border-teal-500/20">Kích hoạt</span>
                      ) : (
                        <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-bold border border-gray-200">Bản nháp</span>
                      )}
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-medium text-ocean-blue/80">
                        {new Date(article.publishDate).toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/news/${article.slug}`} target="_blank" className="p-2 text-ocean-blue/50 hover:bg-sky-blue/10 hover:text-ocean-blue rounded-lg transition-colors" title="Xem Bài">
                          <Eye className="w-5 h-5" />
                        </Link>
                        <Link href={`/admin/articles/${article.id}`} className="p-2 text-blue-500/50 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors" title="Chỉnh sửa">
                          <Edit className="w-5 h-5" />
                        </Link>
                        <button onClick={() => handleDelete(article.id, article.title)} className="p-2 text-red-500/50 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors" title="Xóa">
                          <Trash className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
