import { NextRequest, NextResponse } from 'next/server';
import { generateUserStories } from '@/lib/openrouter';
import { getStoriesByFeature } from '@/lib/sheets';

export async function POST(req: NextRequest) {
  try {
    const { featureName, newStoriesRequired, additionalNotes } =
      await req.json();

    if (!featureName || !newStoriesRequired) {
      return NextResponse.json(
        { error: 'featureName and newStoriesRequired are required.' },
        { status: 400 }
      );
    }

    // Read existing stories for context
    const existingRows = await getStoriesByFeature(featureName);
    const existingContext =
      existingRows.length > 0
        ? existingRows.map((r) => `- ${r[1]}`).join('\n')
        : 'No existing stories found for this feature.';

    const prompt = `
Add new user stories to an existing Tuxi feature.

Feature Name: ${featureName}

Existing Stories Already Created (for context and consistency):
${existingContext}

New User Stories Required:
${newStoriesRequired}

${additionalNotes ? `Additional Notes:\n${additionalNotes}` : ''}

Generate each new user story in the Tuxi format. Maintain consistency with existing stories. Separate each story with ===STORY_BREAK===
    `.trim();

    const raw = await generateUserStories(prompt);

    const stories = raw
      .split('===STORY_BREAK===')
      .map((s: string) => s.trim())
      .filter(Boolean);

    return NextResponse.json({ stories, feature: featureName });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
