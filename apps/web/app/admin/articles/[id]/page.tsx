"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAdmin } from "@/components/AdminContext";
import { ArticleEditor } from "@/components/ArticleEditor";
import { Loader2 } from "lucide-react";
import type { Article } from "@/lib/domain";

export default function EditArticlePage() {
  const { id } = useParams();
  const { token } = useAdmin();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticle() {
      try {
        const res = await fetch(`/api/admin/articles/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setArticle(data.article);
        }
      } catch (err) {
        console.error("Lỗi tải bài viết:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchArticle();
  }, [id, token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[500px]">
        <Loader2 className="w-10 h-10 animate-spin text-ocean-blue/30" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-20 text-ocean-blue font-bold">
        Bài viết không tồn tại.
      </div>
    );
  }

  return <ArticleEditor initialData={article} />;
}
