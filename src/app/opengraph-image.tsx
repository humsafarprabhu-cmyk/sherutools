import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'SheruTools — Free Online Tools That Actually Work';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%', height: '100%', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '60px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
          <span style={{ fontSize: '72px' }}>🦁</span>
          <span style={{ fontSize: '56px', fontWeight: 'bold', color: '#fff' }}>SheruTools</span>
        </div>
        <div style={{ fontSize: '36px', color: '#94a3b8', marginBottom: '20px' }}>33+ Free Online Tools That Actually Work</div>
        <div style={{ fontSize: '24px', color: '#60a5fa' }}>AI-Powered • No Sign-up • 100% Private • Free Forever</div>
        <div style={{ fontSize: '20px', color: '#475569', marginTop: 'auto' }}>sherutools.com</div>
      </div>
    ),
    { ...size }
  );
}
