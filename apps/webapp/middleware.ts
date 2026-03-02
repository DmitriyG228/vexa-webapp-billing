import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  if (!token) {
    const baseUrl = process.env.NEXTAUTH_URL || req.nextUrl.origin;
    const signInUrl = new URL("/signin", baseUrl);
    signInUrl.searchParams.set("callbackUrl", `${baseUrl}${req.nextUrl.pathname}`);
    return NextResponse.redirect(signInUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/account/:path*',
  ],
};
