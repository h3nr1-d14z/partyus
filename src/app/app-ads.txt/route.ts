import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function parseCsvField(line: string): string {
  let result = '';
  let i = 0;
  let inQuotes = false;

  while (i < line.length) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        result += '"';
        i += 2;
      } else if (char === '"') {
        inQuotes = false;
        i += 1;
      } else {
        result += char;
        i += 1;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
        i += 1;
      } else if (char === ',') {
        // Return first field only; app-ads.txt only needs one value per line
        return result;
      } else {
        result += char;
        i += 1;
      }
    }
  }

  return result;
}

function cleanCsvToAppAds(content: string): string {
  return content
    .split(/\r?\n/)
    .map(line => {
      const trimmed = line.trim();
      if (trimmed === '' || trimmed.startsWith('#')) {
        return trimmed;
      }
      return parseCsvField(line);
    })
    .join('\n');
}

export async function GET() {
  const url = process.env.APP_ADS_URL;

  if (!url) {
    return new NextResponse('APP_ADS_URL environment variable is not configured', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      throw new Error(`Upstream returned ${response.status}: ${response.statusText}`);
    }

    const raw = await response.text();
    const data = cleanCsvToAppAds(raw);

    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'CDN-Cache-Control': 'no-store',
        'Vercel-CDN-Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Error fetching app-ads.txt:', error);
    return new NextResponse('Failed to fetch app-ads.txt content', {
      status: 502,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}
