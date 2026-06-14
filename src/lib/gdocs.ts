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

// ── Parse story into structured fields ───────────────────────

function parseStory(storyContent: string, featureName: string, storyTitle: string) {
  const asAMatch = storyContent.match(/As a\s+(.+)/i);
  const iWantMatch = storyContent.match(/I want to\s+(.+)/i);
  const soThatMatch = storyContent.match(/So that\s+(.+)/i);

  const asA = [
    asAMatch ? `As a ${asAMatch[1].trim()},` : '',
    iWantMatch ? `I want to ${iWantMatch[1].trim()},` : '',
    soThatMatch ? `So that ${soThatMatch[1].trim()}.` : '',
  ].filter(Boolean).join(' ');

  // Get acceptance criteria section
  const acMatch = storyContent.match(/Acceptance Criteria([\s\S]*?)(?=Edge Cases|$)/i);
  const acText = acMatch ? acMatch[1].trim() : '';

  // Get edge cases
  const edgeMatch = storyContent.match(/Edge Cases([\s\S]*?)$/i);
  const edgeText = edgeMatch ? edgeMatch[1].trim() : '';

  const acceptanceCriteria = [acText, edgeText ? `Edge Cases:\n${edgeText}` : ''].filter(Boolean).join('\n\n');

  // Description = everything before acceptance criteria
  const descMatch = storyContent.match(/So that[^\n]*\n([\s\S]*?)(?=---|\nAcceptance Criteria|$)/i);
  const description = descMatch ? descMatch[1].trim() : `${featureName} - ${storyTitle}`;

  const storyId = `US-${Math.floor(Math.random() * 900 + 100)}`;

  return { storyId, asA, description, acceptanceCriteria };
}

// ── Get safe end index ───────────────────────────────────────

async function getSafeEndIndex(docId: string, docs: any): Promise<number> {
  const res = await docs.documents.get({ documentId: docId });
  const content = res.data.body?.content || [];
  if (content.length === 0) return 1;
  const lastEl = content[content.length - 1];
  const endIdx = lastEl.endIndex ?? 2;
  // Return index of last character (before the final newline)
  return Math.max(1, endIdx - 1);
}

// ── Append story as formatted table ─────────────────────────

export async function appendStoryToDoc(
  featureName: string,
  storyTitle: string,
  storyContent: string
): Promise<string> {
  const auth = getAuth();
  const docs = google.docs({ version: 'v1', auth });
  const docId = await getOrCreateDoc();

  const { storyId, asA, description, acceptanceCriteria } = parseStory(storyContent, featureName, storyTitle);

  // Step 1: Get current end index
  let endIdx = await getSafeEndIndex(docId, docs);

  // Step 2: Insert title heading
  const titleText = `User Story: ${featureName} - ${storyTitle}`;

  // Insert newline first if doc has content
  if (endIdx > 1) {
    await docs.documents.batchUpdate({
      documentId: docId,
      requestBody: {
        requests: [
          { insertText: { location: { index: endIdx }, text: '\n' } },
        ],
      },
    });
    endIdx += 1;
  }

  // Insert title text
  await docs.documents.batchUpdate({
    documentId: docId,
    requestBody: {
      requests: [
        { insertText: { location: { index: endIdx }, text: titleText + '\n' } },
      ],
    },
  });

  // Style title as Heading 2
  await docs.documents.batchUpdate({
    documentId: docId,
    requestBody: {
      requests: [
        {
          updateParagraphStyle: {
            range: { startIndex: endIdx, endIndex: endIdx + titleText.length + 1 },
            paragraphStyle: { namedStyleType: 'HEADING_2' },
            fields: 'namedStyleType',
          },
        },
      ],
    },
  });

  // Step 3: Get new end index after title
  endIdx = await getSafeEndIndex(docId, docs);

  // Step 4: Insert table at end
  await docs.documents.batchUpdate({
    documentId: docId,
    requestBody: {
      requests: [
        {
          insertTable: {
            rows: 4,
            columns: 2,
            location: { index: endIdx },
          },
        },
      ],
    },
  });

  // Step 5: Get updated doc with table
  const updatedDoc = await docs.documents.get({ documentId: docId });
  const updatedContent = updatedDoc.data.body?.content || [];

  // Find last table in doc
  let tableEl: any = null;
  for (const el of updatedContent) {
    if (el.table) tableEl = el;
  }

  if (!tableEl) {
    return `https://docs.google.com/document/d/${docId}/edit`;
  }

  const rows = tableEl.table?.tableRows || [];

  // Helper: get first content index of a cell
  function cellIdx(row: number, col: number): number {
    return rows[row]?.tableCells?.[col]?.content?.[0]?.startIndex ?? 0;
  }

  // Step 6: Fill cells one at a time in REVERSE order to preserve indices
  const cellData = [
    { row: 3, col: 1, text: 'The user story meets all defined acceptance criteria. All test cases have passed successfully. QA Status: Pending.' },
    { row: 3, col: 0, text: 'TEST REPORT' },
    { row: 2, col: 1, text: acceptanceCriteria || 'See story content.' },
    { row: 2, col: 0, text: 'Acceptance criteria' },
    { row: 1, col: 1, text: description },
    { row: 1, col: 0, text: 'Description' },
    { row: 0, col: 1, text: asA },
    { row: 0, col: 0, text: storyId },
  ];

  for (const cell of cellData) {
    const idx = cellIdx(cell.row, cell.col);
    if (idx <= 0) continue;

    await docs.documents.batchUpdate({
      documentId: docId,
      requestBody: {
        requests: [
          { insertText: { location: { index: idx + 1 }, text: cell.text } },
        ],
      },
    });
  }

  // Step 7: Style story ID cell green + bold
  // Re-fetch to get updated indices
  const finalDoc = await docs.documents.get({ documentId: docId });
  const finalContent = finalDoc.data.body?.content || [];
  let finalTable: any = null;
  for (const el of finalContent) {
    if (el.table) finalTable = el;
  }

  if (finalTable) {
    const finalRows = finalTable.table?.tableRows || [];
    const idCell = finalRows[0]?.tableCells?.[0];
    const idContent = idCell?.content?.[0];
    if (idContent) {
      const idStart = idContent.startIndex + 1;
      const idEnd = idStart + storyId.length;
      await docs.documents.batchUpdate({
        documentId: docId,
        requestBody: {
          requests: [
            {
              updateTextStyle: {
                range: { startIndex: idStart, endIndex: idEnd },
                textStyle: {
                  bold: true,
                  foregroundColor: {
                    color: { rgbColor: { red: 0, green: 0.5, blue: 0 } },
                  },
                },
                fields: 'bold,foregroundColor',
              },
            },
          ],
        },
      });
    }
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
