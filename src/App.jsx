import { useState } from 'react'
import posts from './data/posts.json'
import './App.css'
import ShareCard from './ShareCard.jsx'

const PILLAR = {
  'AI in practice':    { color: '#1E40AF', bg: '#DBEAFE', short: 'AI' },
  'NL-anchored':       { color: '#92400E', bg: '#FEF3C7', short: 'NL' },
  'Marketing craft':   { color: '#166534', bg: '#DCFCE7', short: 'MKT' },
  'Open availability': { color: '#7E22CE', bg: '#F3E8FF', short: 'OA' },
}

const STATUS = {
  todo:    { label: 'To do',   color: '#6B6B6B', bg: '#F0EDEA' },
  drafted: { label: 'Drafted', color: '#92400E', bg: '#FEF3C7' },
  posted:  { label: 'Posted',  color: '#166534', bg: '#DCFCE7' },
  skipped: { label: 'Skipped', color: '#9CA3AF', bg: '#F3F4F6' },
}

const EFFORT = {
  low:    { label: 'Low',    color: '#22C55E' },
  medium: { label: 'Medium', color: '#F59E0B' },
  high:   { label: 'High',   color: '#EF4444' },
}

const POST_TYPE = {
  text:     { label: 'Text',     icon: 'Aa' },
  carousel: { label: 'Carousel', icon: '⊞' },
  image:    { label: 'Image',    icon: '⬜' },
  video:    { label: 'Video',    icon: '▷' },
  poll:     { label: 'Poll',     icon: '▤' },
  article:  { label: 'Article',  icon: '≣' },
}

export default function App() {
  const [activeWeek, setActiveWeek] = useState(1)
  const [expandedId, setExpandedId] = useState(null)
  const [showShare, setShowShare] = useState(false)

  const weekPosts = posts.filter(p => p.week === activeWeek)
  const totalPosted = posts.filter(p => p.status === 'posted').length
  const totalDrafted = posts.filter(p => p.status === 'drafted').length
  const pct = Math.round((totalPosted / 20) * 100)

  return (
    <div className="app">

      <header className="header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-mark">LI</span>
            <span className="logo-text">Tracker</span>
          </div>
          <span className="header-divider" />
          <span className="header-period">April 2026</span>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-num">{totalPosted}</span>
            <span className="stat-label">posted</span>
          </div>
          <div className="stat-sep" />
          <div className="stat-item">
            <span className="stat-num">{totalDrafted}</span>
            <span className="stat-label">drafted</span>
          </div>
          <div className="stat-sep" />
          <div className="stat-item">
            <span className="stat-num">{20 - totalPosted - totalDrafted}</span>
            <span className="stat-label">remaining</span>
          </div>
          <button
            onClick={() => setShowShare(true)}
            style={{
              marginLeft: 12, fontSize: 12, padding: '5px 12px',
              background: '#FFD02F', border: 'none', borderRadius: 99,
              cursor: 'pointer', fontWeight: 600, fontFamily: 'Outfit, sans-serif', color: '#1A1A1A'
            }}
          >
            Share card
          </button>
        </div>
      </header>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${pct}%` }}
          title={`${pct}% complete`}
        />
      </div>

      <main className="main">

        <div className="week-tabs">
          {[1, 2, 3, 4].map(w => {
            const wPosted = posts.filter(p => p.week === w && p.status === 'posted').length
            const wDrafted = posts.filter(p => p.week === w && p.status === 'drafted').length
            const isActive = activeWeek === w
            return (
              <button
                key={w}
                className={`week-tab ${isActive ? 'active' : ''}`}
                onClick={() => { setActiveWeek(w); setExpandedId(null) }}
              >
                <span className="wt-label">Week {w}</span>
                <span className="wt-sub">{wPosted}/5 posted{wDrafted ? ` · ${wDrafted} drafted` : ''}</span>
                <div className="wt-bar">
                  <div className="wt-fill posted" style={{ width: `${(wPosted / 5) * 100}%` }} />
                  <div className="wt-fill drafted" style={{ width: `${(wDrafted / 5) * 100}%` }} />
                </div>
              </button>
            )
          })}
        </div>

        <div className="posts-list">
          {weekPosts.map(post => {
            const isExpanded = expandedId === post.id
            const pl = PILLAR[post.pillar]
            const st = STATUS[post.status] || STATUS.todo
            const ef = EFFORT[post.effort]
            const tp = POST_TYPE[post.postType]

            return (
              <div
                key={post.id}
                className={`post-card ${isExpanded ? 'expanded' : ''} ${post.status === 'skipped' ? 'skipped' : ''}`}
                onClick={() => setExpandedId(isExpanded ? null : post.id)}
              >
                <div className="post-row">
                  <div className="post-day">{post.day}</div>

                  <div className="post-body">
                    <span
                      className="pillar-tag"
                      style={{ color: pl?.color, background: pl?.bg }}
                    >
                      {post.pillar}
                    </span>
                    <p className="post-idea">
                      {post.postTitle || post.idea}
                    </p>
                  </div>

                  <div className="post-actions">
                    {tp && (
                      <span className="type-chip" title={tp.label}>
                        {tp.icon}
                      </span>
                    )}
                    {ef && (
                      <span
                        className="effort-dot"
                        style={{ background: ef.color }}
                        title={`Effort: ${ef.label}`}
                      />
                    )}
                    {post.link && (
                      <a
                        href={post.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-btn"
                        onClick={e => e.stopPropagation()}
                        title="View on LinkedIn"
                      >
                        ↗
                      </a>
                    )}
                    <span
                      className="status-pill"
                      style={{ color: st.color, background: st.bg }}
                    >
                      {st.label}
                    </span>
                    <span className={`expand-icon ${isExpanded ? 'open' : ''}`}>›</span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="post-detail">
                    <div className="detail-section">
                      <p className="detail-label">Original brief</p>
                      <p className="detail-value muted">{post.idea}</p>
                    </div>

                    {post.postTitle && (
                      <div className="detail-section">
                        <p className="detail-label">What you posted</p>
                        <p className="detail-value">{post.postTitle}</p>
                      </div>
                    )}

                    <div className="detail-row">
                      {post.postType && (
                        <div className="detail-section">
                          <p className="detail-label">Format</p>
                          <p className="detail-value">{POST_TYPE[post.postType]?.label || post.postType}</p>
                        </div>
                      )}
                      {post.effort && (
                        <div className="detail-section">
                          <p className="detail-label">Effort</p>
                          <p className="detail-value" style={{ color: ef?.color, fontWeight: 500 }}>
                            {ef?.label}
                          </p>
                        </div>
                      )}
                    </div>

                    {post.link ? (
                      <div className="detail-section">
                        <p className="detail-label">LinkedIn link</p>
                        <a
                          href={post.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="detail-link"
                          onClick={e => e.stopPropagation()}
                        >
                          View post on LinkedIn ↗
                        </a>
                      </div>
                    ) : (
                      <p className="detail-empty">
                        No post details yet. Tell Claude to update this entry.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <footer className="footer">
          <p>Update via Claude chat · data lives in <code>src/data/posts.json</code></p>
        </footer>

      </main>
      {showShare && <ShareCard posts={posts} onClose={() => setShowShare(false)} />}
    </div>
  )
}
