import { NextResponse } from 'next/server';

function allowedOrigins() {
  return [
    process.env.FRONTEND_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    'http://localhost:3000',
    'http://localhost:5173',
  ]
    .filter(Boolean)
    .map((origin) => origin.replace(/\/$/, ''));
}

export function middleware(request) {
  const origin = request.headers.get('origin');
  const allowed =
    origin && allowedOrigins().includes(origin.replace(/\/$/, ''));
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: allowed ? 204 : 403,
      headers: {
        ...(allowed
          ? {
              'Access-Control-Allow-Origin': origin,
              'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
              Vary: 'Origin',
            }
          : {}),
      },
    });
  }
  const response = NextResponse.next();
  if (allowed) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization',
    );
    response.headers.set('Vary', 'Origin');
  }
  return response;
}

export const config = { matcher: '/api/:path*' };
