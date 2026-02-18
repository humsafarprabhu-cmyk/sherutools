import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', background: 'linear-gradient(135deg, #3b82f6, #10b981)', borderRadius: '8px', fontSize: '20px' }}>
        🦁
      </div>
    ),
    { ...size }
  );
}
