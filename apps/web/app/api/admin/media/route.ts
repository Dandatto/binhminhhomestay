import { NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { getStore } from "@/lib/store";
import { verifyAdminToken } from "@/lib/internal-auth";

// F-009: MIME whitelist — SVG excluded to prevent stored XSS
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

// F-009: Validate MIME via magic bytes (not client-supplied file.type)
async function readMagicMime(file: File): Promise<string | null> {
  const buffer = await file.slice(0, 8).arrayBuffer();
  const bytes = new Uint8Array(buffer);
  // JPEG
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return "image/jpeg";
  // PNG
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "image/png";
  // GIF
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) return "image/gif";
  // WebP (RIFF....WEBP)
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes[4] !== undefined) {
    // read bytes 8-11 for "WEBP"
    const ext = await file.slice(8, 12).arrayBuffer();
    const extBytes = new Uint8Array(ext);
    if (extBytes[0] === 0x57 && extBytes[1] === 0x45 && extBytes[2] === 0x42 && extBytes[3] === 0x50) {
      return "image/webp";
    }
  }
  return null;
}

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
    const data = await store.getMediaAssets(limit, offset);
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
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // F-009: File size check
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: `File too large. Maximum size is 5 MB.` }, { status: 400 });
    }

    // F-009: Magic bytes MIME validation (server-side, not trusting client file.type)
    const detectedMime = await readMagicMime(file);
    if (!detectedMime || !ALLOWED_MIME_TYPES.includes(detectedMime)) {
      return NextResponse.json({
        error: `Unsupported file type. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`,
      }, { status: 400 });
    }

    let url = "";
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(file.name, file, { access: "public", multipart: true });
      url = blob.url;
    } else {
      console.warn("BLOB_READ_WRITE_TOKEN is missing. Using Mock URL.");
      url = `https://placehold.co/300x300/png?text=${encodeURIComponent(file.name)}`;
    }

    const store = getStore();
    const asset = await store.addMediaAsset({
      blobUrl: url,
      fileName: file.name,
      sizeBytes: file.size,
      mimeType: detectedMime, // Use server-verified MIME, not client-provided
    });

    return NextResponse.json({ asset });
  } catch (error: any) {
    if (error.message?.includes("fetch failed") || error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: "Lỗi Vercel Token: " + error.message }, { status: 401 });
    }
    console.error("[MediaUpload] Error:", error);
    return NextResponse.json({ error: "Upload failed: " + error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const blobUrl = searchParams.get("url");

    if (!id || !blobUrl) {
      return NextResponse.json({ error: "Missing id or url" }, { status: 400 });
    }

    if (!blobUrl.includes("mock-blob") && process.env.BLOB_READ_WRITE_TOKEN) {
      await del(blobUrl);
    } else {
      console.warn("Skipping Vercel Blob delete for mock URL");
    }

    const store = getStore();
    await store.deleteMediaAsset(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[MediaDelete] Error:", error);
    return NextResponse.json({ error: "Delete failed: " + error.message }, { status: 500 });
  }
}
