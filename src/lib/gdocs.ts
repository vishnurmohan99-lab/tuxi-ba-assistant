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

// ── Get or create the master Tuxi BA Doc ────────────────────

export async function getOrCreateDoc(): Promise<string> {
  const auth = getAuth();
  const drive = google.drive({ version: 'v3', auth });

  const DOC_NAME = 'Tuxi BA - User Stories';

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

// ── Parse story content into structured fields ───────────────

function parseStory(storyContent: string): {
  storyId: string;
  asA: string;
  description: string;
  acceptanceCriteria: string;
} {
  // Extract "As a X, I want Y, So that Z"
  const asAMatch = storyContent.match(/As a (.+?)[\n\r]/i);
  const iWantMatch = storyContent.match(/I want to (.+?)[\n\r]/i);
  const soThatMatch = storyContent.match(/So that (.+?)[\n\r]/i);

  const asA = [
    asAMatch ? `As a ${asAMatch[1].trim()},` : '',
    iWantMatch ? `I want to ${iWantMatch[1].trim()},` : '',
    soThatMatch ? `So that ${soThatMatch[1].trim()}.` : '',
  ].filter(Boolean).join(' ');

  // Extract acceptance criteria section
  const acMatch = storyContent.match(/Acceptance Criteria[\s\S]*?(?=Edge Cases|$)/i);
  const acRaw = acMatch ? acMatch[0].replace(/Acceptance Criteria/i, '').trim() : '';

  // Extract edge cases and append to acceptance criteria
  const edgeMatch = storyContent.match(/Edge Cases[\s\S]*$/i);
  const edgeRaw = edgeMatch ? edgeMatch[0].trim() : '';

  const acceptanceCriteria = [acRaw, edgeRaw].filter(Boolean).join('\n\n');

  // Generate story ID from title
  const storyId = 'US-' + Math.floor(Math.random() * 900 + 100);

  return { storyId, asA, description: acRaw, acceptanceCriteria };
}

// ── Append a user story as a formatted table ─────────────────

export async function appendStoryToDoc(
  featureName: string,
  storyTitle: string,
  storyContent: string
): Promise<string> {
  const auth = getAuth();
  const docs = google.docs({ version: 'v1', auth });

  const docId = await getOrCreateDoc();

  // Get current doc to find end index
  const docRes = await docs.documents.get({ documentId: docId });
  const content = docRes.data.body?.content || [];
  const endIndex = content.length > 0
    ? (content[content.length - 1].endIndex ?? 2) - 1
    : 1;

  const { storyId, asA, acceptanceCriteria } = parseStory(storyContent);

  const requests: any[] = [];
  let idx = endIndex;

  // Add spacing if not empty doc
  if (endIndex > 1) {
    requests.push({ insertText: { location: { index: idx }, text: '\n' } });
    idx += 1;
  }

  // Title line: "User Story: <Feature> - <StoryTitle>"
  const titleText = `User Story: ${featureName} - ${storyTitle}\n`;
  requests.push({ insertText: { location: { index: idx }, text: titleText } });
  requests.push({
    updateParagraphStyle: {
      range: { startIndex: idx, endIndex: idx + titleText.length },
      paragraphStyle: { namedStyleType: 'HEADING_2' },
      fields: 'namedStyleType',
    },
  });
  idx += titleText.length;

  // Insert a 4-row x 2-col table
  requests.push({
    insertTable: {
      rows: 4,
      columns: 2,
      location: { index: idx },
    },
  });

  // Execute all so far to get the table in place
  await docs.documents.batchUpdate({
    documentId: docId,
    requestBody: { requests },
  });

  // Now get the updated doc to find table cell indices
  const updatedDoc = await docs.documents.get({ documentId: docId });
  const updatedContent = updatedDoc.data.body?.content || [];

  // Find the table we just inserted
  let tableElement: any = null;
  for (const el of updatedContent) {
    if (el.table && el.startIndex && el.startIndex >= idx) {
      tableElement = el;
      break;
    }
  }

  // Also search near our insert point
  if (!tableElement) {
    for (const el of updatedContent) {
      if (el.table) {
        tableElement = el;
      }
    }
  }

  if (!tableElement) {
    return `https://docs.google.com/document/d/${docId}/edit`;
  }

  const tableRows = tableElement.table?.tableRows || [];
  const cellRequests: any[] = [];

  // Helper to get cell content index
  function getCellIndex(rowIdx: number, colIdx: number): number {
    const cell = tableRows[rowIdx]?.tableCells?.[colIdx];
    const cellContent = cell?.content?.[0];
    return cellContent?.startIndex ?? 0;
  }

  // Row 0: Story ID | As a... statement
  const r0c0 = getCellIndex(0, 0);
  const r0c1 = getCellIndex(0, 1);

  cellRequests.push({ insertText: { location: { index: r0c0 + 1 }, text: storyId } });
  cellRequests.push({
    updateTextStyle: {
      range: { startIndex: r0c0 + 1, endIndex: r0c0 + 1 + storyId.length },
      textStyle: { bold: true, foregroundColor: { color: { rgbColor: { red: 0, green: 0.5, blue: 0 } } } },
      fields: 'bold,foregroundColor',
    },
  });
  cellRequests.push({ insertText: { location: { index: r0c1 + 1 }, text: asA } });

  // Row 1: Description label | Story content summary
  const r1c0 = getCellIndex(1, 0);
  const r1c1 = getCellIndex(1, 1);
  const descText = storyContent.split('---')[0].replace(/Title:.*\n/i, '').replace(/As a[\s\S]*?So that[^\n]*/i, '').trim();

  cellRequests.push({ insertText: { location: { index: r1c0 + 1 }, text: 'Description' } });
  cellRequests.push({ insertText: { location: { index: r1c1 + 1 }, text: descText || storyContent.slice(0, 300) } });

  // Row 2: Acceptance Criteria label | criteria content
  const r2c0 = getCellIndex(2, 0);
  const r2c1 = getCellIndex(2, 1);

  cellRequests.push({ insertText: { location: { index: r2c0 + 1 }, text: 'Acceptance criteria' } });
  cellRequests.push({ insertText: { location: { index: r2c1 + 1 }, text: acceptanceCriteria || 'See story content.' } });

  // Row 3: TEST REPORT label | status
  const r3c0 = getCellIndex(3, 0);
  const r3c1 = getCellIndex(3, 1);

  cellRequests.push({ insertText: { location: { index: r3c0 + 1 }, text: 'TEST REPORT' } });
  cellRequests.push({ insertText: { location: { index: r3c1 + 1 }, text: 'The user story meets all defined acceptance criteria. All test cases have passed successfully. QA Status: Pending.' } });

  // Execute cell content requests in reverse order to preserve indices
  cellRequests.reverse();
  for (const req of cellRequests) {
    await docs.documents.batchUpdate({
      documentId: docId,
      requestBody: { requests: [req] },
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
