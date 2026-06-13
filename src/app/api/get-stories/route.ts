import { NextRequest, NextResponse } from 'next/server';
import { getAllStories, getStoriesByFeature } from '@/lib/sheets';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const feature = searchParams.get('feature');

    const rows = feature
      ? await getStoriesByFeature(feature)
      : await getAllStories();

    const stories = rows.map((row) => ({
      feature: row[0] || '',
      title: row[1] || '',
      story: row[2] || '',
    }));

    return NextResponse.json({ stories });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
