import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { pdfBase64 } = await req.json();
    if (!pdfBase64) {
      return NextResponse.json({ text: '' });
    }

    // Convert base64 to buffer and extract text using basic parsing
    const buffer = Buffer.from(pdfBase64, 'base64');
    const pdfString = buffer.toString('latin1');

    // Extract readable text from PDF stream
    const textMatches = pdfString.match(/\(([^)]{2,})\)/g) || [];
    const extracted = textMatches
      .map((m) => m.slice(1, -1))
      .filter((t) => /[a-zA-Z]{2,}/.test(t))
      .join(' ')
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return NextResponse.json({ text: extracted });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
