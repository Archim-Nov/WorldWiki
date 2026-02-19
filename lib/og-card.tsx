import type { ReactElement } from 'react'

type OgCardOptions = {
  title: string
  subtitle: string
}

export function createOgCard({ title, subtitle }: OgCardOptions): ReactElement {
  return (
    <div
      style={{
        alignItems: 'stretch',
        background:
          'linear-gradient(135deg, #f8f4e8 0%, #efe6cf 42%, #dec89c 100%)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        justifyContent: 'space-between',
        padding: '64px',
        position: 'relative',
        width: '100%',
      }}
    >
      <div
        style={{
          alignSelf: 'flex-start',
          border: '1px solid rgba(74, 55, 20, 0.22)',
          borderRadius: '999px',
          color: '#4a3714',
          display: 'flex',
          fontSize: 24,
          letterSpacing: 4,
          padding: '12px 24px',
          textTransform: 'uppercase',
          width: 'auto',
        }}
      >
        WorldWiki
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 980 }}>
        <div
          style={{
            color: '#221605',
            display: 'flex',
            fontSize: 78,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: -1.2,
          }}
        >
          {title}
        </div>
        <div
          style={{
            color: '#4a3714',
            display: 'flex',
            fontSize: 34,
            lineHeight: 1.3,
            maxWidth: 930,
          }}
        >
          {subtitle}
        </div>
      </div>

      <div
        style={{
          bottom: 28,
          color: 'rgba(74, 55, 20, 0.75)',
          display: 'flex',
          fontSize: 24,
          position: 'absolute',
          right: 64,
        }}
      >
        worldwiki
      </div>
    </div>
  )
}
