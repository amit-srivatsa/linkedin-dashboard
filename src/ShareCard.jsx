import { useState } from 'react'

const PILLAR = {
  'AI in practice':    { color: '#1E40AF', bg: '#DBEAFE' },
  'NL-anchored':       { color: '#92400E', bg: '#FEF3C7' },
  'Marketing craft':   { color: '#166534', bg: '#DCFCE7' },
  'Open availability': { color: '#7E22CE', bg: '#F3E8FF' },
}

export default function ShareCard({ posts, onClose }) {
  const total = posts.filter(p => p.status === 'posted').length
  const drafted = posts.filter(p => p.status === 'drafted').length

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, padding: '20px'
    }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '32px', width: '100%', maxWidth: 520 }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <p style={{ fontSize: 13, fontFamily: 'monospace', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
              LinkedIn content tracker · April 2026
            </p>
            <p style={{ fontSize: 26, fontWeight: 700, color: '#1A1A1A', letterSpacing: '-0.02em' }}>
              Building in public
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 44, fontWeight: 700, color: '#FFD02F', lineHeight: 1 }}>
              {total}<span style={{ fontSize: 20, color: '#9CA3AF', fontWeight: 400 }}>/20</span>
            </p>
            <p style={{ fontSize: 13, color: '#6B6B6B', marginTop: 4 }}>published</p>
          </div>
        </div>

        {[1, 2, 3, 4].map(w => {
          const wp = posts.filter(p => p.week === w)
          const posted = wp.filter(p => p.status === 'posted').length
          const draft = wp.filter(p => p.status === 'drafted').length
          return (
            <div key={w} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontFamily: 'monospace', color: '#6B6B6B' }}>Week {w}</span>
                <span style={{ fontSize: 13, color: '#9CA3AF' }}>
                  {posted}/5 posted{draft ? ` · ${draft} drafted` : ''}
                </span>
              </div>
              <div style={{ height: 6, background: '#F0EDEA', borderRadius: 4, overflow: 'hidden', display: 'flex' }}>
                <div style={{ width: `${(posted / 5) * 100}%`, background: '#22C55E', transition: 'width 0.3s' }} />
                <div style={{ width: `${(draft / 5) * 100}%`, background: '#FFD02F', transition: 'width 0.3s' }} />
              </div>
            </div>
          )
        })}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginTop: 24, paddingTop: 20, borderTop: '1px solid #F0EDEA' }}>
          {Object.entries(PILLAR).map(([name, style]) => {
            const count = posts.filter(p => p.pillar === name && p.status === 'posted').length
            return (
              <div key={name} style={{ background: style.bg, borderRadius: 10, padding: '12px 14px' }}>
                <p style={{ fontSize: 24, fontWeight: 700, color: style.color }}>{count}</p>
                <p style={{ fontSize: 12, color: style.color, lineHeight: 1.3, marginTop: 4 }}>{name}</p>
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 28 }}>
          <p style={{ fontSize: 13, color: '#9CA3AF', fontFamily: 'monospace' }}>screenshot to share on LinkedIn</p>
          <button onClick={onClose} style={{
            fontSize: 14, padding: '8px 18px', borderRadius: 99,
            border: '1px solid #E8E4DC', background: 'transparent',
            cursor: 'pointer', color: '#6B6B6B', fontFamily: 'Outfit, sans-serif', fontWeight: 500
          }}>
            Close
          </button>
        </div>

      </div>
    </div>
  )
}
