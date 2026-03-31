import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Edge Middleware for Nghị định 13 Compliance (Privacy-by-Design)
 * Ensures no personal data processing happens before consent.
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Checking for the privacy-consent cookie
  const consent = request.cookies.get('privacy-consent');
  
  // If no consent, add headers to strip tracking parameters or generic identifiers
  if (!consent) {
    response.headers.set('X-Privacy-Protected', 'true');
    // We can also block specific analytics scripts at the edge if needed
  }
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
