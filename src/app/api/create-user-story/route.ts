import { NextRequest, NextResponse } from 'next/server';
import { generateUserStories } from '@/lib/openrouter';

export async function POST(req: NextRequest) {
  try {
    const { featureName, featureDescription, storiesRequired, additionalNotes } =
      await req.json();

    if (!featureName || !featureDescription || !storiesRequired) {
      return NextResponse.json(
        { error: 'featureName, featureDescription, and storiesRequired are required.' },
        { status: 400 }
      );
    }

    const prompt = `
Create user stories for the following new Tuxi feature.

Feature Name: ${featureName}

Feature Description: ${featureDescription}

User Stories Required:
${storiesRequired}

${additionalNotes ? `Additional Notes:\n${additionalNotes}` : ''}

Generate each user story in the Tuxi format. Separate each story with ===STORY_BREAK===
    `.trim();

    const raw = await generateUserStories(prompt);

    // Split into individual stories
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
