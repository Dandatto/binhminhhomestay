import { getStore } from "@/lib/store";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, User, Share2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Metadata } from 'next';

export const revalidate = 60;

export async function generateMetadata(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  { params }: any
): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const store = getStore();
  const article = await store.getArticleBySlug(resolvedParams.slug);

  if (!article || article.status !== "PUBLISHED") {
    return { title: "Không tìm thấy bài viết | Binh Minh Homestay" };
  }

  return {
    title: `${article.title} - Tin Tức Binh Minh Homestay`,
    description: article.summary,
    openGraph: {
      images: article.coverImage ? [article.coverImage] : [],
    },
  };
}

export default async function ArticleDetailPage(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  { params }: any
) {
  // Await params correctly in Next.js 15
  const resolvedParams = await Promise.resolve(params);
  const store = getStore();
  const article = await store.getArticleBySlug(resolvedParams.slug);

  if (!article || article.status !== "PUBLISHED") {
    notFound();
  }

  return (
    <div className="min-h-screen bg-sand-white pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        
        {/* Navigation */}
        <Link href="/news" className="inline-flex items-center gap-2 text-sm font-bold text-ocean-blue/60 hover:text-ocean-blue transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Về trang Tin tức
        </Link>

        <article className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-soft border border-sky-blue/10">
          
          {/* Header */}
          <header className="mb-10 text-center">
            {article.tags && (
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {article.tags.split(",").map((tag, idx) => (
                  <span key={idx} className="text-xs uppercase tracking-wider font-bold text-sunrise-yellow bg-sunrise-yellow/10 px-3 py-1 rounded-full">
                    {tag.trim()}
                  </span>
                ))}
              </div>
            )}

            <h1 className="text-3xl md:text-5xl font-black text-ocean-blue tracking-tight leading-tight mb-6">
              {article.title}
            </h1>

            <div className="flex items-center justify-center gap-6 text-sm font-medium text-ocean-blue/50">
              <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {format(new Date(article.publishDate), "dd/MM/yyyy", { locale: vi })}</span>
              <span className="flex items-center gap-2"><User className="w-4 h-4" /> Admin</span>
            </div>
          </header>

          {/* Cover Image */}
          {article.coverImage && (
            <div className="w-full aspect-video relative rounded-3xl overflow-hidden mb-12 shadow-md">
              <Image
                src={article.coverImage}
                alt={article.title}
                fill
                priority
                className="object-cover"
              />
            </div>
          )}

          {/* Markdown Content rendered nicely */}
          <div className="prose prose-lg prose-ocean-blue max-w-none 
                          prose-headings:font-black prose-headings:text-ocean-blue 
                          prose-p:text-ocean-blue/80 prose-p:leading-relaxed prose-p:font-medium
                          prose-a:text-sunrise-yellow prose-a:font-bold prose-a:no-underline hover:prose-a:underline
                          prose-img:rounded-2xl prose-img:shadow-md
                          prose-strong:text-ocean-blue prose-strong:font-black">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {article.content}
            </ReactMarkdown>
          </div>

          {/* Footer Actions */}
          <footer className="mt-16 pt-8 border-t border-sky-blue/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm font-bold text-ocean-blue/50">
              Chia sẻ cẩm nang này nếu bạn thấy hữu ích!
            </div>
            <button className="flex items-center gap-2 bg-ocean-blue/5 text-ocean-blue px-6 py-3 rounded-xl font-bold hover:bg-ocean-blue hover:text-white transition-all">
              <Share2 className="w-5 h-5"/> Chia sẻ
            </button>
          </footer>
        </article>

      </div>
    </div>
  );
}
