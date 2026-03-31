import { getStore } from "@/lib/store";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Tag } from "lucide-react";

export const revalidate = 60; // Cache 1 minute cho SEO

export default async function NewsPage() {
  const store = getStore();
  // Lấy danh sách bài viết đã PUBLISHED
  const { articles } = await store.getArticles(20, 0, true);

  return (
    <div className="min-h-screen bg-sand-white pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <header className="mb-16 text-center">
          <h1 className="text-4xl lg:text-5xl font-black text-ocean-blue tracking-tight mb-4">
            Tin Tức & <span className="text-sunrise-yellow">Cẩm Nang</span>
          </h1>
          <p className="text-lg text-ocean-blue/70 max-w-2xl mx-auto font-medium">
            Thông tin mới nhất về Binh Minh Homestay, cẩm nang du lịch trải nghiệm đảo ngọc và các ưu đãi không thể bỏ lỡ.
          </p>
        </header>

        {articles.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-sky-blue/10">
            <h3 className="text-xl font-bold text-ocean-blue mb-2">Chưa có bản tin nào.</h3>
            <p className="text-ocean-blue/60">Quay lại sau nhé, chúng tôi đang chuẩn bị những nội dung thú vị nhất!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <Link key={article.id} href={`/news/${article.slug}`} className="group flex flex-col bg-white rounded-3xl overflow-hidden shadow-soft hover:shadow-lg border border-sky-blue/10 transition-all hover:-translate-y-1">
                {/* Cover */}
                <div className="w-full aspect-[4/3] relative bg-ocean-blue/5 overflow-hidden">
                  {article.coverImage ? (
                    <Image
                      src={article.coverImage}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-ocean-blue/20 bg-gradient-to-br from-sand-white to-sky-blue/20">
                      Binh Minh Homestay
                    </div>
                  )}
                  {/* Category / Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-sm text-ocean-blue text-xs font-black px-3 py-1.5 rounded-full shadow-sm">
                      Mới Nhất
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-4 text-xs font-bold text-ocean-blue/50 mb-3">
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {format(new Date(article.publishDate), "dd MMM, yyyy", { locale: vi })}</span>
                  </div>
                  
                  <h2 className="text-xl font-black text-ocean-blue mb-3 line-clamp-2 group-hover:text-sunset-coral transition-colors">
                    {article.title}
                  </h2>
                  
                  {article.summary && (
                    <p className="text-sm font-medium text-ocean-blue/70 line-clamp-3 mb-6 flex-1">
                      {article.summary}
                    </p>
                  )}

                  {article.tags && (
                    <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-sky-blue/10">
                      {article.tags.split(",").slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="flex items-center text-[10px] uppercase tracking-wider font-bold text-ocean-blue bg-sand-white px-2 py-1 rounded-md">
                          <Tag className="w-3 h-3 mr-1 opacity-50"/> {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
