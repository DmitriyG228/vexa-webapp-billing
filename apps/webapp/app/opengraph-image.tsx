import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Vexa — Meeting Intelligence API'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          backgroundColor: '#fafafa',
          padding: '60px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
          }}
        >
          <div
            style={{
              fontSize: '72px',
              fontWeight: 700,
              color: '#0a0a0a',
              letterSpacing: '-0.04em',
              lineHeight: 1.1,
              textAlign: 'center',
            }}
          >
            Vexa
          </div>
          <div
            style={{
              fontSize: '32px',
              fontWeight: 400,
              color: '#737373',
              letterSpacing: '-0.02em',
              textAlign: 'center',
              maxWidth: '800px',
            }}
          >
            Meeting Intelligence API
          </div>
          <div
            style={{
              display: 'flex',
              gap: '16px',
              marginTop: '20px',
            }}
          >
            <div
              style={{
                padding: '8px 20px',
                borderRadius: '999px',
                border: '1px solid #e5e5e5',
                fontSize: '18px',
                color: '#525252',
              }}
            >
              Open Source
            </div>
            <div
              style={{
                padding: '8px 20px',
                borderRadius: '999px',
                border: '1px solid #e5e5e5',
                fontSize: '18px',
                color: '#525252',
              }}
            >
              Self-Hostable
            </div>
            <div
              style={{
                padding: '8px 20px',
                borderRadius: '999px',
                border: '1px solid #e5e5e5',
                fontSize: '18px',
                color: '#525252',
              }}
            >
              REST + MCP
            </div>
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            fontSize: '16px',
            color: '#a3a3a3',
          }}
        >
          vexa.ai
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
