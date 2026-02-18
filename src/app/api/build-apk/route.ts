import { NextResponse } from 'next/server';

const BUILD_SERVER_URL = process.env.APK_BUILD_SERVER_URL || 'https://sherutools-apk.loca.lt';

// Proxy to local build server
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const res = await fetch(`${BUILD_SERVER_URL}/build`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Bypass-Tunnel-Reminder': 'true',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Build proxy error:', error);
    return NextResponse.json({ error: 'Build server unavailable. Please try again later.' }, { status: 503 });
  }
}

// Check build status
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const buildId = searchParams.get('buildId');
  
  if (!buildId) {
    return NextResponse.json({ error: 'Missing buildId' }, { status: 400 });
  }

  try {
    const res = await fetch(`${BUILD_SERVER_URL}/build/${buildId}`, {
      headers: { 'Bypass-Tunnel-Reminder': 'true' },
    });
    
    if (!res.ok) {
      return NextResponse.json({ error: 'Build not found' }, { status: 404 });
    }

    const data = await res.json();
    
    // If build succeeded, rewrite download URL to go through our proxy
    if (data.status === 'success') {
      data.downloadUrl = `/api/build-apk/download?buildId=${buildId}`;
    }
    
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Build server unavailable' }, { status: 503 });
  }
}
