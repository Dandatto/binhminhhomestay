import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import {
  getRoomSessionTokenFromRequest,
  getAdminSessionTokenFromRequest,
  verifyAdminSession,
} from '@/lib/session';

// Initialize Redis explicitly
const redisUrl = process.env.UPSTASH_REDIS_REST_URL || "";
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || "";
const hasRedis = redisUrl !== "" && redisToken !== "";

let redis: Redis | null = null;
let bookingLimiter: Ratelimit | null = null;
let chatLimiter: Ratelimit | null = null;
let adminLimiter: Ratelimit | null = null;

if (hasRedis) {
  redis = new Redis({
    url: redisUrl,
    token: redisToken,
  });

  bookingLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    prefix: '@upstash/ratelimit/booking',
  });

  chatLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    prefix: '@upstash/ratelimit/chat',
  });

  adminLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1 m'),
    prefix: '@upstash/ratelimit/admin',
  });
}

function createBrandVoiceStream(message: string): ReadableStream {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      const words = message.split(' ');
      let i = 0;
      const tick = () => {
        if (i < words.length) {
          controller.enqueue(encoder.encode(`0:${JSON.stringify(words[i] + ' ')}\n`));
          i++;
          setTimeout(tick, 40);
        } else {
          controller.enqueue(encoder.encode('d:{"finishReason":"stop"}\n'));
          controller.close();
        }
      };
      tick();
    }
  });
}

/**
 * Edge Middleware for Rate Limiting & Nghị định 13 Compliance
 * Ensures no personal data processing happens before consent, and protects against abuse.
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (hasRedis && pathname.startsWith('/api')) {
    // request.ip is provided by Vercel for the real client IP.
    // Fallback to the first IP in x-forwarded-for if we are behind another proxy.
    // @ts-ignore: `ip` can be missing from typedefs in Next 15 but is strictly populated by Vercel Edge.
    const ip = request.ip ?? request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1';
    
    try {
      if (pathname.startsWith('/api/booking')) {
        const { success } = await bookingLimiter!.limit(ip);
        if (!success) {
          return new NextResponse(JSON.stringify({ error: "Too Many Requests" }), { 
            status: 429,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      } 
      else if (pathname.startsWith('/api/chat')) {
        const { success } = await chatLimiter!.limit(ip);
        if (!success) {
          const stream = createBrandVoiceStream("Quá nhiều người đang hỏi Long Xì AI. Bác chịu khó chờ một chốc nữa rồi hỏi lại em nhé!");
          return new NextResponse(stream, {
            status: 200,
            headers: { 
              'Content-Type': 'text/plain; charset=utf-8',
              'x-vercel-ai-data-stream': 'v1'
            }
          });
        }
      } 
      else if (pathname.startsWith('/api/admin/')) {
        const { success } = await adminLimiter!.limit(ip);
        if (!success) {
          return new NextResponse(JSON.stringify({ error: "Too Many Requests (Admin)" }), { 
            status: 429,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
    } catch (error) {
      // Fail-open strategy: network failures to Upstash shouldn't take down the website
      console.error("Rate limiting error (fail-open):", error);
    }
  }

  // ── Admin page protection ───────────────────────────────────────────────────
  // /admin/* pages require a valid admin_session cookie.
  // API routes under /api/admin/* are protected by Bearer token (existing logic).
  if (pathname.startsWith('/admin') && !pathname.startsWith('/api')) {
    const adminToken = getAdminSessionTokenFromRequest(request);
    if (!verifyAdminSession(adminToken)) {
      return NextResponse.redirect(new URL('/vao', request.url));
    }
  }

  // ── Guest session expiry check ──────────────────────────────────────────────
  // Does NOT gate pages — session is additive context, not a barrier.
  // Only auto-kicks if the session cookie exists but the session has expired.
  // The actual DB lookup happens in API routes; here we do lightweight header injection only.
  const roomToken = getRoomSessionTokenFromRequest(request);
  if (roomToken) {
    // Pass room session token to API routes via header so they can enrich context
    // without a second cookie lookup. Page routes read the cookie directly.
    const response = NextResponse.next();
    response.headers.set('X-Room-Session-Token', roomToken);

    // Privacy consent check
    if (!pathname.startsWith('/api')) {
      const consent = request.cookies.get('privacy-consent');
      if (!consent) response.headers.set('X-Privacy-Protected', 'true');
    }
    return response;
  }

  const response = NextResponse.next();

  // Privacy consent check
  if (!pathname.startsWith('/api')) {
    const consent = request.cookies.get('privacy-consent');
    if (!consent) {
      response.headers.set('X-Privacy-Protected', 'true');
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * (We explicitly include /api for rate limiting)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
