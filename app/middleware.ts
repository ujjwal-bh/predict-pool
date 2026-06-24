import { withAuth } from 'next-auth/middleware';
import { NextRequest } from 'next/server';

export default withAuth(
  function middleware(req: NextRequest) {
    return undefined;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protected routes that require authentication
        const protectedPaths = ['/dashboard', '/pools', '/api/'];

        const isProtectedPath = protectedPaths.some(path =>
          req.nextUrl.pathname.startsWith(path)
        );

        if (isProtectedPath) {
          return !!token;
        }

        return true;
      },
    },
  }
);

export const config = {
  matcher: ['/((?!login|signup|_next/static|_next/image|file.svg|globe.svg|next.svg|vercel.svg|window.svg).*)'],
};
