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

function parseStory(storyContent: string, featureName: string, storyTitle: string) {
  const asAMatch = storyContent.match(/As a\s+(.+)/i);
  const iWantMatch = storyContent.match(/I want to\s+(.+)/i);
  const soThatMatch = storyContent.match(/So that\s+(.+)/i);

  const asA = [
    asAMatch ? `As a ${asAMatch[1].trim()},` : '',
    iWantMatch ? `I want to ${iWantMatch[1].trim()},` : '',
    soThatMatch ? `So that ${soThatMatch[1].trim()}.` : '',
  ].filter(Boolean).join(' ');

  const acMatch = storyContent.match(/Acceptance Criteria([\s\S]*?)(?=Edge Cases|$)/i);
  const acText = acMatch ? acMatch[1].trim() : '';
  const edgeMatch = storyContent.match(/Edge Cases([\s\S]*?)$/i);
  const edgeText = edgeMatch ? edgeMatch[1].trim() : '';
  const acceptanceCriteria = [acText, edgeText ? `Edge Cases:\n${edgeText}` : ''].filter(Boolean).join('\n\n');
  const storyId = `US-${Math.floor(Math.random() * 900 + 100)}`;

  return { storyId, asA, acceptanceCriteria };
}

// Insert text at end of doc safely
async function insertAtEnd(docId: string, docs: any, text: string) {
  await docs.documents.batchUpdate({
    documentId: docId,
    requestBody: {
      requests: [{
        insertText: {
          endOfSegmentLocation: { segmentId: '' },
          text,
        },
      }],
    },
  });
}

// Style the last N characters from end of doc
async function styleLastChars(docId: string, docs: any, charCount: number, style: any) {
  const res = await docs.documents.get({ documentId: docId });
  const content = res.data.body?.content || [];
  const endIndex = (content[content.length - 1]?.endIndex ?? 2) - 1;
  const startIndex = endIndex - charCount;
  if (startIndex < 1) return;

  await docs.documents.batchUpdate({
    documentId: docId,
    requestBody: { requests: [{ ...style, range: { startIndex, endIndex } }] },
  });
}

export async function appendStoryToDoc(
  featureName: string,
  storyTitle: string,
  storyContent: string
): Promise<string> {
  const auth = getAuth();
  const docs = google.docs({ version: 'v1', auth });
  const docId = await getOrCreateDoc();

  const { storyId, asA, acceptanceCriteria } = parseStory(storyContent, featureName, storyTitle);

  // Check if doc has existing content
  const docRes = await docs.documents.get({ documentId: docId });
  const docContent = docRes.data.body?.content || [];
  const hasContent = docContent.length > 1;

  // Add separator if doc already has content
  if (hasContent) {
    await insertAtEnd(docId, docs, '\n\n');
  }

  // Insert title
  const titleText = `User Story: ${featureName} - ${storyTitle}\n`;
  await insertAtEnd(docId, docs, titleText);

  // Style title as Heading 2
  await styleLastChars(docId, docs, titleText.length, {
    updateParagraphStyle: {
      paragraphStyle: { namedStyleType: 'HEADING_2' },
      fields: 'namedStyleType',
    },
  });

  // Insert table
  const docAfterTitle = await docs.documents.get({ documentId: docId });
  const contentAfterTitle = docAfterTitle.data.body?.content || [];
  const insertTableAt = (contentAfterTitle[contentAfterTitle.length - 1]?.endIndex ?? 2) - 1;

  await docs.documents.batchUpdate({
    documentId: docId,
    requestBody: {
      requests: [{
        insertTable: {
          rows: 4,
          columns: 2,
          location: { index: insertTableAt },
        },
      }],
    },
  });

  // Get table cell indices
  const docWithTable = await docs.documents.get({ documentId: docId });
  const tableContent = docWithTable.data.body?.content || [];

  // Find last table
  let tableEl: any = null;
  for (const el of tableContent) {
    if (el.table) tableEl = el;
  }

  if (!tableEl) return `https://docs.google.com/document/d/${docId}/edit`;

  const rows = tableEl.table?.tableRows || [];

  function cellStartIndex(row: number, col: number): number {
    return rows[row]?.tableCells?.[col]?.content?.[0]?.startIndex ?? 0;
  }

  // Fill cells in REVERSE order to preserve indices
  const cells = [
    { row: 3, col: 1, text: 'The user story meets all defined acceptance criteria. All test cases have passed successfully. QA Status: Pending.' },
    { row: 3, col: 0, text: 'TEST REPORT' },
    { row: 2, col: 1, text: acceptanceCriteria || 'See story content.' },
    { row: 2, col: 0, text: 'Acceptance criteria' },
    { row: 1, col: 1, text: storyContent },
    { row: 1, col: 0, text: 'Description' },
    { row: 0, col: 1, text: asA },
    { row: 0, col: 0, text: storyId },
  ];

  for (const cell of cells) {
    const idx = cellStartIndex(cell.row, cell.col);
    if (idx <= 0) continue;
    await docs.documents.batchUpdate({
      documentId: docId,
      requestBody: {
        requests: [{
          insertText: {
            location: { index: idx + 1 },
            text: cell.text,
          },
        }],
      },
    });
  }

  // Style story ID green + bold
  const finalDoc = await docs.documents.get({ documentId: docId });
  const finalContent = finalDoc.data.body?.content || [];
  let finalTable: any = null;
  for (const el of finalContent) {
    if (el.table) finalTable = el;
  }

  if (finalTable) {
    const finalRows = finalTable.table?.tableRows || [];
    const idCellContent = finalRows[0]?.tableCells?.[0]?.content?.[0];
    if (idCellContent) {
      const idStart = idCellContent.startIndex + 1;
      const idEnd = idStart + storyId.length;
      await docs.documents.batchUpdate({
        documentId: docId,
        requestBody: {
          requests: [{
            updateTextStyle: {
              range: { startIndex: idStart, endIndex: idEnd },
              textStyle: {
                bold: true,
                foregroundColor: { color: { rgbColor: { red: 0, green: 0.5, blue: 0 } } },
              },
              fields: 'bold,foregroundColor',
            },
          }],
        },
      });
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
