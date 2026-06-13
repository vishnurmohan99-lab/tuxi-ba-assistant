import { NextRequest, NextResponse } from 'next/server';
import { appendStory, updateStory } from '@/lib/sheets';

export async function POST(req: NextRequest) {
  try {
    const { feature, title, story, mode } = await req.json();

    if (!feature || !title || !story) {
      return NextResponse.json(
        { error: 'feature, title, and story are required.' },
        { status: 400 }
      );
    }

    if (mode === 'update') {
      await updateStory(feature, title, story);
    } else {
      await appendStory(feature, title, story);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
