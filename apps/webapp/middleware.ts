export { default } from "next-auth/middleware";

// This config specifies that the middleware applies
// to all routes starting with /dashboard or /account
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/account/:path*',
  ],
};
