import { NextResponse } from 'next/server';

const BUILD_SERVER_URL = process.env.APK_BUILD_SERVER_URL || 'https://sherutools-apk.loca.lt';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const buildId = searchParams.get('buildId');
  
  if (!buildId) {
    return NextResponse.json({ error: 'Missing buildId' }, { status: 400 });
  }

  try {
    // Get build status to get the APK URL
    const statusRes = await fetch(`${BUILD_SERVER_URL}/build/${buildId}`, {
      headers: { 'Bypass-Tunnel-Reminder': 'true' },
    });

    if (!statusRes.ok) {
      return NextResponse.json({ error: 'Build not found' }, { status: 404 });
    }

    const statusData = await statusRes.json();
    
    if (statusData.status !== 'success' || !statusData.apkUrl) {
      return NextResponse.json({ error: 'APK not ready' }, { status: 404 });
    }

    // EAS builds have a direct download URL — redirect to it
    return NextResponse.redirect(statusData.apkUrl);
  } catch {
    return NextResponse.json({ error: 'Download failed' }, { status: 503 });
  }
}
