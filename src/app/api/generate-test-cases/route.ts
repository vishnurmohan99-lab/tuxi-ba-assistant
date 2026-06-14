import { NextRequest, NextResponse } from 'next/server';
import { generateTestCases } from '@/lib/openrouter';
import { getProjectContext, appendTestCase } from '@/lib/sheets';

export async function POST(req: NextRequest) {
  try {
    const { feature, storyTitle, storyContent, save } = await req.json();
    if (!storyContent) {
      return NextResponse.json({ error: 'storyContent is required.' }, { status: 400 });
    }

    const context = await getProjectContext();
    const raw = await generateTestCases(storyContent, context?.text);

    const testCases = raw
      .split('===TC_BREAK===')
      .map((t: string) => t.trim())
      .filter(Boolean);

    // If save flag is set, save to Google Sheets
    if (save && feature && storyTitle) {
      for (const tc of testCases) {
        const titleMatch = tc.match(/^Test Case Title:\s*(.+)/m);
        const tcTitle = titleMatch ? titleMatch[1].trim() : 'Untitled Test Case';
        await appendTestCase(feature, storyTitle, tcTitle, tc);
      }
    }

    return NextResponse.json({ testCases });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
