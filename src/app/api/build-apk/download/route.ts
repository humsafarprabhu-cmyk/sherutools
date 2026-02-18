import { NextResponse } from 'next/server';

const BUILD_SERVER_URL = process.env.APK_BUILD_SERVER_URL || 'https://sherutools-apk.loca.lt';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const buildId = searchParams.get('buildId');
  
  if (!buildId) {
    return NextResponse.json({ error: 'Missing buildId' }, { status: 400 });
  }

  try {
    // Proxy through build server (it handles EAS auth)
    const res = await fetch(`${BUILD_SERVER_URL}/download/${buildId}`, {
      headers: { 'Bypass-Tunnel-Reminder': 'true' },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'APK not ready' }, { status: 404 });
    }

    const apkBuffer = await res.arrayBuffer();
    const contentDisposition = res.headers.get('content-disposition') || 'attachment; filename="app.apk"';
    
    return new NextResponse(apkBuffer, {
      headers: {
        'Content-Type': 'application/vnd.android.package-archive',
        'Content-Disposition': contentDisposition,
        'Content-Length': String(apkBuffer.byteLength),
      },
    });
  } catch {
    return NextResponse.json({ error: 'Download failed' }, { status: 503 });
  }
}
