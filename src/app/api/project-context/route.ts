import { NextRequest, NextResponse } from 'next/server';
import { saveProjectContext, getProjectContext } from '@/lib/sheets';

// GET — fetch saved context info
export async function GET() {
  try {
    const context = await getProjectContext();
    return NextResponse.json({ context });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST — save new context from PDF text
export async function POST(req: NextRequest) {
  try {
    const { text, filename } = await req.json();
    if (!text) return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    await saveProjectContext(text, filename || 'unknown.pdf');
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
