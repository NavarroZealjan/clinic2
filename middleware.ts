// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // open paths
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/login") ||
    pathname.startsWith("/api/logout") ||
    pathname.startsWith("/login")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;
  if (!token) {
    if (pathname.startsWith("/doctor") || pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;   
    if (pathname.startsWith("/admin") && decoded.role !== "admin") {
      return NextResponse.redirect(new URL("", req.url));
    }
    
    /* ----REMOVE CONDITION FOR /doctor ----*/

    // if (pathname.startsWith('/doctor') && decoded.role !== 'doctor') {
    //   return NextResponse.redirect(new URL('/', req.url));
    // }

    return NextResponse.next();
  } catch (err) {
    if (pathname.startsWith("/doctor") || pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  }
}

export const config = {
  /* -- REMOVE /doctor/:path ------- */
  // matcher: ["/doctor/:path*", "/admin/:path*", "/login", "/api/admin/:path*"],

  matcher: [ "/login", "/api/admin/:path*"],
};
