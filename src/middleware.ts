import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const protectedPaths = ["/provider", "/patient", "/admin", "/settings", "/onboarding"];
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  const authPaths = ["/login", "/signup"];
  const isAuthPage = authPaths.some((path) => pathname.startsWith(path));

  if (user && (isAuthPage || pathname === "/")) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const role = profile?.role;
    const url = request.nextUrl.clone();
    if (role === "provider") url.pathname = "/provider/dashboard";
    else if (role === "patient") url.pathname = "/patient/dashboard";
    else if (role === "admin") url.pathname = "/admin/dashboard";
    else url.pathname = "/onboarding";
    return NextResponse.redirect(url);
  }

  if (user && isProtected) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const role = profile?.role;

    if (!role && pathname !== "/onboarding") {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }

    if (role && pathname.startsWith("/onboarding")) {
      const url = request.nextUrl.clone();
      url.pathname = `/${role}/dashboard`;
      return NextResponse.redirect(url);
    }

    if (role === "provider" && pathname.startsWith("/patient")) {
      const url = request.nextUrl.clone();
      url.pathname = "/provider/dashboard";
      return NextResponse.redirect(url);
    }

    if (role === "provider" && pathname.startsWith("/admin")) {
      const url = request.nextUrl.clone();
      url.pathname = "/provider/dashboard";
      return NextResponse.redirect(url);
    }

    if (role === "patient" && pathname.startsWith("/provider")) {
      const url = request.nextUrl.clone();
      url.pathname = "/patient/dashboard";
      return NextResponse.redirect(url);
    }

    if (role === "patient" && pathname.startsWith("/admin")) {
      const url = request.nextUrl.clone();
      url.pathname = "/patient/dashboard";
      return NextResponse.redirect(url);
    }

    if (role === "admin" && pathname.startsWith("/provider")) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/dashboard";
      return NextResponse.redirect(url);
    }

    if (role === "admin" && pathname.startsWith("/patient")) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};
