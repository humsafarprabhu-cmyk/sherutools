import { NextResponse } from 'next/server';

const BUILD_SERVER_URL = process.env.APK_BUILD_SERVER_URL || 'https://sherutools-apk.loca.lt';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const buildId = searchParams.get('buildId');
  
  if (!buildId) {
    return NextResponse.json({ error: 'Missing buildId' }, { status: 400 });
  }

  try {
    // Get signed download URL from build server
    const res = await fetch(`${BUILD_SERVER_URL}/download/${buildId}`, {
      headers: { 'Bypass-Tunnel-Reminder': 'true' },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'APK not ready' }, { status: 404 });
    }

    const data = await res.json();
    
    if (data.downloadUrl) {
      // Redirect user's browser to the signed S3 URL
      return NextResponse.redirect(data.downloadUrl);
    }
    
    return NextResponse.json({ error: 'No download URL available' }, { status: 404 });
  } catch {
    return NextResponse.json({ error: 'Download failed' }, { status: 503 });
  }
}
