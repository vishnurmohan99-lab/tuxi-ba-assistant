import { NextRequest, NextResponse } from 'next/server';
import { generateUserStories } from '@/lib/openrouter';
import { getStoriesByFeature } from '@/lib/sheets';

export async function POST(req: NextRequest) {
  try {
    const { featureName, existingStoryTitle, modificationRequest } =
      await req.json();

    if (!featureName || !existingStoryTitle || !modificationRequest) {
      return NextResponse.json(
        { error: 'featureName, existingStoryTitle, and modificationRequest are required.' },
        { status: 400 }
      );
    }

    // Fetch existing story from Google Sheets
    const rows = await getStoriesByFeature(featureName);
    const existingRow = rows.find(
      (r) => r[1]?.toLowerCase() === existingStoryTitle.toLowerCase()
    );

    const existingStoryContent = existingRow
      ? existingRow[2]
      : 'No existing story found. Generate from scratch using the modification request as context.';

    const prompt = `
Update the following existing Tuxi user story.

Feature Name: ${featureName}

Existing User Story Title: ${existingStoryTitle}

Existing User Story Content:
${existingStoryContent}

Modification Request:
${modificationRequest}

Generate the updated user story in the Tuxi format. Preserve all existing functionality unless explicitly changed by the modification request.
    `.trim();

    const raw = await generateUserStories(prompt);

    return NextResponse.json({
      story: raw.trim(),
      feature: featureName,
      title: existingStoryTitle,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
