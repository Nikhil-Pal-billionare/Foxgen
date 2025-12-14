import { NextResponse, NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const session = req.cookies.get("sb-access-token");

  const protectedRoutes = [
    // "/dashboard",
    "/script-generator",
    "/voiceover",
    "/image-generator",
    "/video-generator"
  ];

  if (protectedRoutes.some(r => req.nextUrl.pathname.startsWith(r))) {
    if (!session) {
      return NextResponse.redirect(new URL("/auth/sign-in", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/script-generator/:path*",
    "/voiceover/:path*",
    "/image-generator/:path*",
    "/video-generator/:path*"
  ]
};
