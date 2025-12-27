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
      "img-src 'self' data: blob: https:",
      "media-src 'self' blob: https:", // 🔥 REQUIRED FOR AUDIO
      "connect-src 'self' https:",
      "font-src 'self' https: data:",
      "frame-src 'self' https://api.razorpay.com",
    ].join("; ")
  );

  /* ===============================
     ✅ SUPABASE AUTH
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
    data: { user },
  } = await supabase.auth.getUser();

  // 🔐 Protect dashboard routes
  if (!user && req.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/dashboard((?!/_next).*)"],
};

