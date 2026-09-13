import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { url } = await request.json();
    const spreadsheetId = extractSpreadsheetId(url);

    if (!spreadsheetId) {
      return NextResponse.json(
        { error: 'Enter a valid Google Sheets link.' },
        { status: 400 },
      );
    }

    const exportUrl = new URL(
      `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export`,
    );
    exportUrl.searchParams.set('format', 'csv');

    const gid = extractGid(url);
    if (gid) exportUrl.searchParams.set('gid', gid);

    const response = await fetch(exportUrl.toString(), {
      headers: { Accept: 'text/csv,text/plain,*/*' },
      cache: 'no-store',
    });

    const text = await response.text();

    if (!response.ok || looksLikeGoogleAccessPage(text)) {
      return NextResponse.json(
        {
          error:
            'Could not read that sheet. Make sure sharing is set to anyone with the link can view.',
        },
        { status: 400 },
      );
    }

    return NextResponse.json({ csv: text });
  } catch {
    return NextResponse.json(
      { error: 'Could not fetch that Google Sheet.' },
      { status: 500 },
    );
  }
}

function extractSpreadsheetId(value) {
  const match = String(value || '').match(/\/spreadsheets\/d\/([^/]+)/);
  return match?.[1] || null;
}

function extractGid(value) {
  try {
    return new URL(value).searchParams.get('gid');
  } catch {
    return null;
  }
}

function looksLikeGoogleAccessPage(text) {
  const sample = String(text || '').slice(0, 2000).toLowerCase();
  return (
    sample.includes('<html') &&
    (sample.includes('google') || sample.includes('sign in'))
  );
}
