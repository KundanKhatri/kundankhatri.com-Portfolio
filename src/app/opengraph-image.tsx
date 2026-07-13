import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Kundan Khatri — I build systems that make businesses money.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 80,
          background: '#050508',
          color: '#f2f4f8',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', color: '#00e5ff', fontSize: 26, letterSpacing: 6, textTransform: 'uppercase' }}>
          Kundan Khatri · ZeroTheory AI Pvt Ltd
        </div>
        <div style={{ display: 'flex', fontSize: 76, fontWeight: 700, lineHeight: 1.05, marginTop: 28, maxWidth: 980 }}>
          I build systems that make businesses money.
        </div>
        <div style={{ display: 'flex', gap: 18, marginTop: 44, fontSize: 30, color: '#00e5ff' }}>
          <span>₹4L in 10 days</span>
          <span style={{ color: '#3a3f4c' }}>·</span>
          <span>AI agents</span>
          <span style={{ color: '#3a3f4c' }}>·</span>
          <span>production platforms</span>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: 6,
            background: 'linear-gradient(90deg, #00e5ff, transparent 70%)',
            display: 'flex',
          }}
        />
      </div>
    ),
    size,
  );
}
