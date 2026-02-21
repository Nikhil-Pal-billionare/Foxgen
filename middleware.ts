import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  /* ===============================
     ✅ CONTENT SECURITY POLICY
     =============================== */
  res.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https: https://static.aiquickdraw.com",
      "media-src 'self' blob: https: https://static.aiquickdraw.com",
      "connect-src 'self' https: https://api.kie.ai",
      "font-src 'self' https: data:",
      "frame-src 'self' https://api.razorpay.com",
    ].join("; ")
  );

  /* ===============================
     ✅ SUPABASE AUTH (OAUTH SAFE)
     =============================== */
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookies) =>
          cookies.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          ),
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = req.nextUrl.pathname;

  /* ===============================
     ✅ ALLOW AUTH CALLBACKS
     =============================== */
  if (pathname.startsWith("/auth")) {
    return res;
  }

  /* ===============================
     🔐 PROTECTED ROUTES
     =============================== */

  if (!session && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  if (!session && pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  if (session && (pathname === "/sign-in" || pathname === "/sign-up")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return res;
}

/* ===============================
   ✅ MATCHER
   =============================== */
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/sign-in",
    "/sign-up",
  ],
};
