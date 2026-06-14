import { google } from 'googleapis';

function getAuth() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  return new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: privateKey,
    scopes: [
      'https://www.googleapis.com/auth/documents',
      'https://www.googleapis.com/auth/drive',
    ],
  });
}

// ── Get or create the master Tuxi BA Doc ────────────────────

export async function getOrCreateDoc(): Promise<string> {
  const auth = getAuth();
  const drive = google.drive({ version: 'v3', auth });
  const docs = google.docs({ version: 'v1', auth });

  const DOC_NAME = 'Tuxi BA - User Stories';

  // Search for existing doc
  const search = await drive.files.list({
    q: `name='${DOC_NAME}' and mimeType='application/vnd.google-apps.document' and trashed=false`,
    fields: 'files(id, name)',
  });

  if (search.data.files && search.data.files.length > 0) {
    return search.data.files[0].id!;
  }

  // Create new doc
  const doc = await docs.documents.create({
    requestBody: { title: DOC_NAME },
  });

  const docId = doc.data.documentId!;

  // Share with anyone who has the link (optional — makes it easy to access)
  await drive.permissions.create({
    fileId: docId,
    requestBody: { role: 'writer', type: 'user', emailAddress: process.env.GOOGLE_CLIENT_EMAIL! },
  });

  return docId;
}

// ── Check if a feature heading exists in the doc ─────────────

async function getDocContent(docId: string) {
  const auth = getAuth();
  const docs = google.docs({ version: 'v1', auth });
  const res = await docs.documents.get({ documentId: docId });
  return res.data;
}

function findFeatureHeading(doc: any, featureName: string): number | null {
  const content = doc.body?.content || [];
  for (const element of content) {
    if (element.paragraph) {
      const style = element.paragraph.paragraphStyle?.namedStyleType;
      if (style === 'HEADING_1') {
        const text = element.paragraph.elements
          ?.map((e: any) => e.textRun?.content || '')
          .join('')
          .replace(/\n/g, '')
          .trim();
        if (text.toLowerCase() === featureName.toLowerCase()) {
          return element.endIndex;
        }
      }
    }
  }
  return null;
}

function getDocEndIndex(doc: any): number {
  const content = doc.body?.content || [];
  if (content.length === 0) return 1;
  return content[content.length - 1].endIndex - 1;
}

// ── Append a user story under a feature tab ──────────────────

export async function appendStoryToDoc(
  featureName: string,
  storyTitle: string,
  storyContent: string
): Promise<string> {
  const auth = getAuth();
  const docs = google.docs({ version: 'v1', auth });

  const docId = await getOrCreateDoc();
  const doc = await getDocContent(docId);

  const requests: any[] = [];
  const featureIndex = findFeatureHeading(doc, featureName);
  const endIndex = getDocEndIndex(doc);

  if (featureIndex === null) {
    // Feature doesn't exist — add new HEADING_1 section at end
    const insertIndex = endIndex > 1 ? endIndex : 1;

    // Add page break before new feature (except if doc is empty)
    if (endIndex > 1) {
      requests.push({
        insertPageBreak: { location: { index: insertIndex } },
      });
    }

    const afterBreak = endIndex > 1 ? insertIndex + 1 : insertIndex;

    // Feature heading
    requests.push({
      insertText: { location: { index: afterBreak }, text: `${featureName}\n` },
    });
    requests.push({
      updateParagraphStyle: {
        range: { startIndex: afterBreak, endIndex: afterBreak + featureName.length + 1 },
        paragraphStyle: { namedStyleType: 'HEADING_1' },
        fields: 'namedStyleType',
      },
    });

    // Story title as HEADING_2
    const storyTitleIndex = afterBreak + featureName.length + 1;
    requests.push({
      insertText: { location: { index: storyTitleIndex }, text: `${storyTitle}\n` },
    });
    requests.push({
      updateParagraphStyle: {
        range: { startIndex: storyTitleIndex, endIndex: storyTitleIndex + storyTitle.length + 1 },
        paragraphStyle: { namedStyleType: 'HEADING_2' },
        fields: 'namedStyleType',
      },
    });

    // Story content
    const contentIndex = storyTitleIndex + storyTitle.length + 1;
    requests.push({
      insertText: { location: { index: contentIndex }, text: `${storyContent}\n\n` },
    });
    requests.push({
      updateParagraphStyle: {
        range: { startIndex: contentIndex, endIndex: contentIndex + storyContent.length + 2 },
        paragraphStyle: { namedStyleType: 'NORMAL_TEXT' },
        fields: 'namedStyleType',
      },
    });

  } else {
    // Feature exists — find next heading or end of doc to insert story after feature
    const content = doc.body?.content || [];
    let insertAt = endIndex;

    // Find the position just before the next HEADING_1 after this feature
    let foundFeature = false;
    for (const element of content) {
      if (element.paragraph) {
        const style = element.paragraph.paragraphStyle?.namedStyleType;
        const text = element.paragraph.elements
          ?.map((e: any) => e.textRun?.content || '')
          .join('')
          .replace(/\n/g, '')
          .trim();

        if (style === 'HEADING_1' && text.toLowerCase() === featureName.toLowerCase()) {
          foundFeature = true;
          continue;
        }

        if (foundFeature && style === 'HEADING_1') {
          insertAt = element.startIndex;
          break;
        }
      }
    }

    // Insert story title as HEADING_2
    requests.push({
      insertText: { location: { index: insertAt }, text: `${storyTitle}\n` },
    });
    requests.push({
      updateParagraphStyle: {
        range: { startIndex: insertAt, endIndex: insertAt + storyTitle.length + 1 },
        paragraphStyle: { namedStyleType: 'HEADING_2' },
        fields: 'namedStyleType',
      },
    });

    // Story content
    const contentIndex = insertAt + storyTitle.length + 1;
    requests.push({
      insertText: { location: { index: contentIndex }, text: `${storyContent}\n\n` },
    });
    requests.push({
      updateParagraphStyle: {
        range: { startIndex: contentIndex, endIndex: contentIndex + storyContent.length + 2 },
        paragraphStyle: { namedStyleType: 'NORMAL_TEXT' },
        fields: 'namedStyleType',
      },
    });
  }

  // Execute all requests in sequence
  for (const request of requests) {
    await docs.documents.batchUpdate({
      documentId: docId,
      requestBody: { requests: [request] },
    });
  }

  return `https://docs.google.com/document/d/${docId}/edit`;
}

// ── Get doc URL ──────────────────────────────────────────────

export async function getDocUrl(): Promise<string | null> {
  try {
    const docId = await getOrCreateDoc();
    return `https://docs.google.com/document/d/${docId}/edit`;
  } catch {
    return null;
  }
}
