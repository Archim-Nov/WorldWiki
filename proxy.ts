import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, isValidLocale, localeCookieName } from "@/i18n/routing";
import { stripLocalePrefix } from "@/i18n/path";

const PUBLIC_FILE = /\.[^/]+$/;

function extractLocale(pathname: string): string | null {
  const firstSegment = pathname.split("/")[1];
  return isValidLocale(firstSegment) ? firstSegment : null;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/studio") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const pathnameLocale = extractLocale(pathname);

  if (!pathnameLocale) {
    const cookieLocale = request.cookies.get(localeCookieName)?.value;
    const targetLocale = isValidLocale(cookieLocale) ? cookieLocale : defaultLocale;
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = pathname === "/" ? `/${targetLocale}` : `/${targetLocale}${pathname}`;
    return NextResponse.redirect(redirectUrl);
  }

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = stripLocalePrefix(pathname);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-worldwiki-locale", pathnameLocale);

  const response = NextResponse.rewrite(rewriteUrl, {
    request: { headers: requestHeaders },
  });

  response.cookies.set(localeCookieName, pathnameLocale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)"],
};
