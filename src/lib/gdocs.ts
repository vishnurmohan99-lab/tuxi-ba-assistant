import { google } from 'googleapis';

const FOLDER_ID = '1KuWc9UIUzmT5eUGrLaz3jXbCG28JQx4O';

function getAuth() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  return new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: privateKey,
    scopes: [
      'https://www.googleapis.com/auth/documents',
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.file',
    ],
  });
}

export async function getOrCreateDoc(): Promise<string> {
  const auth = getAuth();
  const drive = google.drive({ version: 'v3', auth });
  const DOC_NAME = 'BAflow - User Stories';

  const search = await drive.files.list({
    q: `name='${DOC_NAME}' and mimeType='application/vnd.google-apps.document' and '${FOLDER_ID}' in parents and trashed=false`,
    fields: 'files(id, name)',
    includeItemsFromAllDrives: true,
    supportsAllDrives: true,
  });

  if (search.data.files && search.data.files.length > 0) {
    return search.data.files[0].id!;
  }

  const file = await drive.files.create({
    supportsAllDrives: true,
    requestBody: {
      name: DOC_NAME,
      mimeType: 'application/vnd.google-apps.document',
      parents: [FOLDER_ID],
    },
    fields: 'id',
  });

  return file.data.id!;
}

function parseStory(storyContent: string) {
  const asAMatch = storyContent.match(/As a\s+(.+)/i);
  const iWantMatch = storyContent.match(/I want to\s+(.+)/i);
  const soThatMatch = storyContent.match(/So that\s+(.+)/i);

  const asA = [
    asAMatch ? `As a ${asAMatch[1].trim()}` : '',
    iWantMatch ? `I want to ${iWantMatch[1].trim()}` : '',
    soThatMatch ? `So that ${soThatMatch[1].trim()}` : '',
  ].filter(Boolean).join(', ');

  const acMatch = storyContent.match(/Acceptance Criteria([\s\S]*?)(?=Edge Cases|$)/i);
  const acText = acMatch ? acMatch[1].trim() : '';

  const edgeMatch = storyContent.match(/Edge Cases([\s\S]*?)$/i);
  const edgeText = edgeMatch ? edgeMatch[1].trim() : '';

  const storyId = `US-${Math.floor(Math.random() * 900 + 100)}`;

  return { storyId, asA, acText, edgeText };
}

export async function appendStoryToDoc(
  featureName: string,
  storyTitle: string,
  storyContent: string
): Promise<string> {
  const auth = getAuth();
  const docs = google.docs({ version: 'v1', auth });
  const docId = await getOrCreateDoc();

  const { storyId, asA, acText, edgeText } = parseStory(storyContent);

  // Build the full formatted text block
  const separator = '\n' + '─'.repeat(60) + '\n\n';
  const block = [
    `User Story: ${featureName} - ${storyTitle}`,
    `Story ID: ${storyId}`,
    ``,
    `${asA}`,
    ``,
    `DESCRIPTION`,
    storyContent.split('---')[0].replace(/Title:.*\n/i, '').replace(/As a[\s\S]*?So that[^\n]*/i, '').trim(),
    ``,
    `ACCEPTANCE CRITERIA`,
    acText,
    edgeText ? `\nEDGE CASES\n${edgeText}` : '',
    ``,
    `TEST REPORT`,
    `QA Status: Pending — All test cases to be verified against acceptance criteria.`,
    ``,
    separator,
  ].filter((line) => line !== null).join('\n');

  // Insert at end of document
  await docs.documents.batchUpdate({
    documentId: docId,
    requestBody: {
      requests: [
        {
          insertText: {
            endOfSegmentLocation: { segmentId: '' },
            text: block,
          },
        },
      ],
    },
  });

  // Now style the title as Heading 2
  const updatedDoc = await docs.documents.get({ documentId: docId });
  const content = updatedDoc.data.body?.content || [];

  // Find the title line we just inserted
  const titleText = `User Story: ${featureName} - ${storyTitle}`;
  for (const el of content) {
    if (el.paragraph) {
      const text = el.paragraph.elements
        ?.map((e: any) => e.textRun?.content || '')
        .join('')
        .replace(/\n/g, '')
        .trim();
      if (text === titleText) {
        await docs.documents.batchUpdate({
          documentId: docId,
          requestBody: {
            requests: [
              {
                updateParagraphStyle: {
                  range: {
                    startIndex: el.startIndex,
                    endIndex: el.endIndex,
                  },
                  paragraphStyle: { namedStyleType: 'HEADING_2' },
                  fields: 'namedStyleType',
                },
              },
            ],
          },
        });
        break;
      }
    }
  }

  return `https://docs.google.com/document/d/${docId}/edit`;
}

export async function getDocUrl(): Promise<string | null> {
  try {
    const docId = await getOrCreateDoc();
    return `https://docs.google.com/document/d/${docId}/edit`;
  } catch {
    return null;
  }
}
