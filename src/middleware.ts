import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/login', '/api/auth/login'];

async function verifySession(token: string, secret: string): Promise<boolean> {
  try {
    const [timestamp, signature] = token.split('.');
    if (!timestamp || !signature) return false;

    const ts = parseInt(timestamp, 10);
    if (isNaN(ts)) return false;

    // Expire sessions after 7 days
    if (Date.now() - ts > 7 * 24 * 60 * 60 * 1000) return false;

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const sigBytes = Uint8Array.from(
      signature.match(/.{1,2}/g)!.map((b) => parseInt(b, 16))
    );

    return crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes,
      new TextEncoder().encode(timestamp)
    );
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    // If SESSION_SECRET is not configured, block all access
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const token = req.cookies.get('baflow_session')?.value;
  if (!token || !(await verifySession(token, secret))) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
