import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { verifyAdminToken } from "@/lib/internal-auth";

// F-016: Content length limits
const MAX_TITLE_LEN = 200;
const MAX_SUMMARY_LEN = 500;
const MAX_CONTENT_LEN = 50_000;

export async function GET(request: Request) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    // F-008: Pagination upper bound
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 200);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const store = getStore();
    const data = await store.getArticles(limit, offset, false);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // F-016: Validate content length
    if (typeof body.title === "string" && body.title.length > MAX_TITLE_LEN) {
      return NextResponse.json({ error: `title exceeds maximum length of ${MAX_TITLE_LEN}` }, { status: 400 });
    }
    if (typeof body.summary === "string" && body.summary.length > MAX_SUMMARY_LEN) {
      return NextResponse.json({ error: `summary exceeds maximum length of ${MAX_SUMMARY_LEN}` }, { status: 400 });
    }
    if (typeof body.content === "string" && body.content.length > MAX_CONTENT_LEN) {
      return NextResponse.json({ error: `content exceeds maximum length of ${MAX_CONTENT_LEN}` }, { status: 400 });
    }

    const store = getStore();

    // Auto-generate slug if not provided
    let slug = body.slug;
    if (!slug) {
      slug = body.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[đĐ]/g, "d")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        + "-" + Date.now().toString().slice(-6);
    }

    const article = await store.createArticle({
      title: body.title,
      slug,
      summary: body.summary,
      content: body.content,
      coverImage: body.coverImage,
      tags: body.tags,
      status: body.status || "PUBLISHED",
      publishDate: body.publishDate || new Date().toISOString(),
    });

    return NextResponse.json({ article });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
