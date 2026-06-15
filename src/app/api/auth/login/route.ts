import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  const validUsername = process.env.LOGIN_USERNAME;
  const validPassword = process.env.LOGIN_PASSWORD;
  const secret = process.env.SESSION_SECRET;

  if (!validUsername || !validPassword || !secret) {
    return NextResponse.json({ error: 'Auth not configured' }, { status: 500 });
  }

  // Constant-time comparison to prevent timing attacks
  const usernameMatch = username === validUsername;
  const passwordMatch = crypto.timingSafeEqual(
    Buffer.from(password ?? ''),
    Buffer.from(validPassword)
  );

  if (!usernameMatch || !passwordMatch) {
    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
  }

  const timestamp = Date.now().toString();
  const signature = crypto.createHmac('sha256', secret).update(timestamp).digest('hex');
  const token = `${timestamp}.${signature}`;

  const res = NextResponse.json({ ok: true });
  res.cookies.set('baflow_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });

  return res;
}
