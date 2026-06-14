import { google } from 'googleapis';

const SHEET_NAME = 'Tuxi User Stories';

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

export async function appendStory(
  feature: string,
  title: string,
  story: string
) {
  const sheets = await getSheets();
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `'${SHEET_NAME}'!A:C`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [[feature, title, story]],
    },
  });
}

export async function updateStory(
  feature: string,
  title: string,
  newStory: string
) {
  const sheets = await getSheets();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `'${SHEET_NAME}'!A:C`,
  });

  const rows = res.data.values || [];
  let rowIndex = -1;

  for (let i = 0; i < rows.length; i++) {
    if (
      rows[i][0]?.toLowerCase() === feature.toLowerCase() &&
      rows[i][1]?.toLowerCase() === title.toLowerCase()
    ) {
      rowIndex = i + 1;
      break;
    }
  }

  if (rowIndex === -1) {
    await appendStory(feature, title, newStory);
    return;
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `'${SHEET_NAME}'!C${rowIndex}`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [[newStory]],
    },
  });
}