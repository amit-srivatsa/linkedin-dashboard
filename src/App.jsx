import { useState } from 'react'
import postsData from './data/posts.json'
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

function EditModal({ post, onClose, onSave }) {
  const [form, setForm] = useState({
    postTitle: post.postTitle || '',
    status: post.status || 'todo',
    effort: post.effort || 'low',
    postType: post.postType || 'text',
    link: post.link || ''
  })
  const [password, setPassword] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async () => {
    setIsSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/updatePost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, post: { ...post, ...form } })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to sync to GitHub')
      
      onSave({ ...post, ...form })
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div>
          <h2 className="modal-title">Edit post {post.id}</h2>
          <p style={{fontSize: 14, color: 'var(--text-muted)'}}>{post.idea}</p>
        </div>

        {error && <div style={{padding: 12, background: '#ef444420', color: '#ef4444', borderRadius: 8, fontSize: 14}}>{error}</div>}

        <div>
          <label className="fw-label">Title / Hook</label>
          <textarea 
            className="fw-input" 
            rows={3}
            value={form.postTitle} 
            onChange={e => setForm({...form, postTitle: e.target.value})}
            placeholder="First line of your post..."
          />
        </div>

        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12}}>
          <div>
            <label className="fw-label">Status</label>
            <select className="fw-input" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
              <option value="todo">To do</option>
              <option value="drafted">Drafted</option>
              <option value="posted">Posted</option>
              <option value="skipped">Skipped</option>
            </select>
          </div>
          <div>
            <label className="fw-label">Effort</label>
            <select className="fw-input" value={form.effort} onChange={e => setForm({...form, effort: e.target.value})}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="fw-label">Format</label>
            <select className="fw-input" value={form.postType} onChange={e => setForm({...form, postType: e.target.value})}>
              <option value="text">Text</option>
              <option value="carousel">Carousel</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="poll">Poll</option>
              <option value="article">Article</option>
            </select>
          </div>
        </div>

        <div>
          <label className="fw-label">LinkedIn Link</label>
          <input 
            type="text" 
            className="fw-input" 
            value={form.link} 
            onChange={e => setForm({...form, link: e.target.value})}
            placeholder="https://linkedin.com/posts/..."
          />
        </div>

        <div style={{marginTop: 8, padding: '16px', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0'}}>
          <label className="fw-label">Admin Pin</label>
          <input 
            type="password" 
            className="fw-input" 
            style={{background: '#fff'}}
            value={password} 
            onChange={e => setPassword(e.target.value)}
            placeholder="Required to sync changes"
          />
        </div>

        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose} disabled={isSaving}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={isSaving || !password}>
            {isSaving ? 'Syncing...' : 'Save to GitHub'}
          </button>
        </div>
      </div>
    </div>
  )
}


export default function App() {
  const [posts, setPosts] = useState(postsData)
  const [activeWeek, setActiveWeek] = useState(1)
  const [expandedId, setExpandedId] = useState(null)
  const [showShare, setShowShare] = useState(false)
  const [editingPost, setEditingPost] = useState(null)

  const weekPosts = posts.filter(p => p.week === activeWeek)
  const totalPosted = posts.filter(p => p.status === 'posted').length
  const totalDrafted = posts.filter(p => p.status === 'drafted').length
  const pct = Math.round((totalPosted / 20) * 100)

  return (
    <div className="main">

      <div className="header-grid">
        <div className="bento-card header-brand">
          <div className="logo">
            <span className="logo-mark">LI</span>
            <span className="logo-text">Tracker</span>
          </div>
          <span className="header-divider" />
          <span className="header-period">April 2026</span>
        </div>

        <div className="bento-card header-stats">
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
            <span className="stat-num highlight">{20 - totalPosted - totalDrafted}</span>
            <span className="stat-label">remaining</span>
          </div>
          <button
            onClick={() => setShowShare(true)}
            className="btn btn-primary"
            style={{ padding: '8px 16px', fontSize: 14, marginLeft: 'auto' }}
          >
            Share card
          </button>
        </div>
      </div>

      <div className="bento-card progress-card">
        <div className="progress-header">
          <span>Overall Progress</span>
          <span>{pct}% complete</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

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
                <div className="post-detail" onClick={e => e.stopPropagation()}>
                  <div className="detail-row">
                    <div className="detail-section" style={{flex: 1, minWidth: 200}}>
                      <p className="detail-label">Original brief</p>
                      <p className="detail-value muted">{post.idea}</p>
                    </div>

                    <button 
                      className="edit-btn"
                      onClick={() => setEditingPost(post)}
                    >
                      Edit Post
                    </button>
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
                        <p className="detail-value" style={{ color: ef?.color, fontWeight: 600 }}>
                          {ef?.label}
                        </p>
                      </div>
                    )}
                  </div>

                  {post.link && (
                    <div className="detail-section">
                      <p className="detail-label">LinkedIn link</p>
                      <a
                        href={post.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="detail-link"
                      >
                        View post on LinkedIn ↗
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <footer className="footer">
        <p>Update natively on phone · data saved directly to GitHub <code>main</code> branch</p>
      </footer>

      {showShare && <ShareCard posts={posts} onClose={() => setShowShare(false)} />}
      
      {editingPost && (
        <EditModal 
          post={editingPost} 
          onClose={() => setEditingPost(null)} 
          onSave={(updatedPost) => {
            setPosts(posts.map(p => p.id === updatedPost.id ? updatedPost : p))
          }} 
        />
      )}

    </div>
  )
}
