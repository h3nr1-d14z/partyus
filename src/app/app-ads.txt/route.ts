import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

    const data = await response.text();

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
