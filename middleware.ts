import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
  if (!isAdminRoute) return NextResponse.next();

  // Si usas cookies de supabase auth helpers, aquí se valida sesión.
  // Si no lo tienes aún, igual te conviene configurar supabase auth helpers.
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
