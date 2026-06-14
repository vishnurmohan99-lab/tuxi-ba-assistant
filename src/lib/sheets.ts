import { google } from 'googleapis';

const SHEET_NAME = 'Tuxi User Stories';
const CONTEXT_SHEET = 'Project Context';

function getAuth() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  return new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

export async function getSheets() {
  const auth = getAuth();
  return google.sheets({ version: 'v4', auth });
}

export async function getAllStories() {
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `'${SHEET_NAME}'!A2:C`,
  });
  return res.data.values || [];
}

export async function getStoriesByFeature(featureName: string) {
  const rows = await getAllStories();
  return rows.filter(
    (row) => row[0]?.toLowerCase() === featureName.toLowerCase()
  );
}

export async function appendStory(feature: string, title: string, story: string) {
  const sheets = await getSheets();
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `'${SHEET_NAME}'!A:C`,
    valueInputOption: 'RAW',
    requestBody: { values: [[feature, title, story]] },
  });
}

export async function updateStory(feature: string, title: string, newStory: string) {
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `'${SHEET_NAME}'!A:C`,
  });
  const rows = res.data.values || [];
  let rowIndex = -1;
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][0]?.toLowerCase() === feature.toLowerCase() && rows[i][1]?.toLowerCase() === title.toLowerCase()) {
      rowIndex = i + 1;
      break;
    }
  }
  if (rowIndex === -1) { await appendStory(feature, title, newStory); return; }
  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `'${SHEET_NAME}'!C${rowIndex}`,
    valueInputOption: 'RAW',
    requestBody: { values: [[newStory]] },
  });
}

// ── Test Cases ───────────────────────────────────────────────

const TEST_SHEET = 'Tuxi Test Cases';

export async function ensureTestSheet() {
  const sheets = await getSheets();
  const meta = await sheets.spreadsheets.get({ spreadsheetId: process.env.GOOGLE_SHEET_ID });
  const exists = meta.data.sheets?.some((s) => s.properties?.title === TEST_SHEET);
  if (!exists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      requestBody: { requests: [{ addSheet: { properties: { title: TEST_SHEET } } }] },
    });
    // Add header row
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `'${TEST_SHEET}'!A1:I1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          'Feature',
          'User Story',
          'Title',
          'Test Case Title',
          'Test Case ID',
          'User Story Reference',
          'Pre-conditions',
          'Test Steps',
          'Expected Result',
        ]],
      },
    });
  }
}

export async function appendTestCase(
  feature: string,
  storyTitle: string,
  testCaseTitle: string,
  testCase: string
) {
  await ensureTestSheet();
  const sheets = await getSheets();

  // Parse test case fields
  const idMatch = testCase.match(/^Test Case ID:\s*(.+)/m);
  const titleMatch = testCase.match(/^Test Case Title:\s*(.+)/m);
  const referenceMatch = testCase.match(/^User Story Reference:\s*(.+)/m);
  const preCondMatch = testCase.match(/Pre-conditions:([\s\S]*?)(?=Test Steps:|$)/i);
  const stepsMatch = testCase.match(/Test Steps:([\s\S]*?)(?=Expected Result:|$)/i);
  const expectedMatch = testCase.match(/Expected Result:([\s\S]*?)(?=Test Type:|$)/i);

  const testCaseId = idMatch ? idMatch[1].trim() : '';
  const parsedTitle = titleMatch ? titleMatch[1].trim() : testCaseTitle;
  const reference = referenceMatch ? referenceMatch[1].trim() : storyTitle;
  const preConditions = preCondMatch ? preCondMatch[1].trim() : '';
  const testSteps = stepsMatch ? stepsMatch[1].trim() : '';
  const expectedResult = expectedMatch ? expectedMatch[1].trim() : '';

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `'${TEST_SHEET}'!A:I`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [[
        feature,
        storyTitle,
        parsedTitle,
        parsedTitle,
        testCaseId,
        reference,
        preConditions,
        testSteps,
        expectedResult,
      ]],
    },
  });
}

// ── Project Context ──────────────────────────────────────────

export async function saveProjectContext(text: string, filename: string) {
  const sheets = await getSheets();

  // Check if Project Context sheet exists, create if not
  const meta = await sheets.spreadsheets.get({ spreadsheetId: process.env.GOOGLE_SHEET_ID });
  const sheetExists = meta.data.sheets?.some((s) => s.properties?.title === CONTEXT_SHEET);

  if (!sheetExists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      requestBody: {
        requests: [{ addSheet: { properties: { title: CONTEXT_SHEET } } }],
      },
    });
  }

  // Clear and write context — row 1 = filename, row 2 = timestamp, row 3+ = text (chunked)
  await sheets.spreadsheets.values.clear({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `'${CONTEXT_SHEET}'!A:A`,
  });

  // Chunk text into rows of 45000 chars (Sheets cell limit is 50000)
  const chunkSize = 45000;
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }

  const values = [
    [filename],
    [new Date().toISOString()],
    ...chunks.map((c) => [c]),
  ];

  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `'${CONTEXT_SHEET}'!A1`,
    valueInputOption: 'RAW',
    requestBody: { values },
  });
}

export async function getProjectContext(): Promise<{ text: string; filename: string; updatedAt: string } | null> {
  try {
    const sheets = await getSheets();
    const meta = await sheets.spreadsheets.get({ spreadsheetId: process.env.GOOGLE_SHEET_ID });
    const sheetExists = meta.data.sheets?.some((s) => s.properties?.title === CONTEXT_SHEET);
    if (!sheetExists) return null;

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `'${CONTEXT_SHEET}'!A:A`,
    });

    const rows = res.data.values || [];
    if (rows.length < 3) return null;

    const filename = rows[0]?.[0] || '';
    const updatedAt = rows[1]?.[0] || '';
    const text = rows.slice(2).map((r) => r[0] || '').join('');

    return { filename, updatedAt, text };
  } catch {
    return null;
  }
}
