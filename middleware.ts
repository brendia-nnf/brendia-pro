import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for root and onboarding pages
  if (pathname === "/" || pathname === "/onboarding") {
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for
  // - /api (API routes)
  // - /_next (Next.js internals)
  // - /_vercel (Vercel internals)
  // - /.*\..* (files with extensions, e.g. favicon.ico)
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
