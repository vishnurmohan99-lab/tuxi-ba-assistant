import { NextRequest, NextResponse } from 'next/server';
import { appendStoryToDoc, getDocUrl } from '@/lib/gdocs';

export async function POST(req: NextRequest) {
  try {
    const { feature, title, story } = await req.json();
    if (!feature || !title || !story) {
      return NextResponse.json({ error: 'feature, title, and story are required.' }, { status: 400 });
    }
    const docUrl = await appendStoryToDoc(feature, title, story);
    return NextResponse.json({ success: true, docUrl });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const docUrl = await getDocUrl();
    return NextResponse.json({ docUrl });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
