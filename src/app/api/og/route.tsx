import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import React from 'react';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || 'Flowra – 팀을 위한 업무/일정 협업 플랫폼';
  const description = searchParams.get('description') || '업무와 일정을 한 곳에서. Discord 알림과 함께 팀의 생산성을 높이세요.';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          backgroundImage: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0a1330 100%)',
          color: 'white',
          padding: '64px',
          fontFamily: 'Pretendard, Noto Sans KR, Inter, system-ui, Arial',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, opacity: 0.95 }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: 12,
            background: 'linear-gradient(135deg,#2563eb,#7c3aed)',
            boxShadow: '0 6px 32px rgba(37,99,235,.4)'
          }} />
          <div style={{ fontSize: 40, fontWeight: 800 }}>Flowra</div>
        </div>

        <div style={{ height: 24 }} />

        <div style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.2 }}>{title}</div>
        <div style={{ height: 12 }} />
        <div style={{ fontSize: 28, opacity: 0.8 }}>{description}</div>

        <div style={{ position: 'absolute', right: 48, bottom: 48, opacity: 0.7, fontSize: 22 }}>flowra.app</div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}


