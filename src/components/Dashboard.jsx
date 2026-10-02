import { IconCheck } from '../icons.jsx'
import { pillarById } from '../lib/pillars.js'

function Bar({ value, max = 100, tone = 'neutral' }) {
  const width = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className="bar-track" aria-hidden="true">
      <div className={`bar-fill tone-${tone}`} style={{ width: `${width}%` }} />
    </div>
  )
}

function deltaLabel(n) {
  if (n == null) return null
  const rounded = Math.round(n * 10) / 10
  const sign = rounded > 0 ? '+' : ''
  return `${sign}${rounded} pts`
}

export default function Dashboard({ report, persona, onEditPersona, onReset, onReplace }) {
  const drift = report.previousMatchRate != null
  const nlDelta =
    report.geo.previous.Netherlands != null
      ? report.geo.current.Netherlands - report.geo.previous.Netherlands
      : null
  const indiaDelta =
    report.geo.previous.India != null
      ? report.geo.current.India - report.geo.previous.India
      : null

  return (
    <div className="dash">
      <div className="header-grid">
        <div className="bento-card header-brand">
          <div className="logo">
            <span className="logo-mark">AQ</span>
            <span className="logo-text">Audience quality</span>
          </div>
          <span className="header-divider" />
          <span className="header-period">{report.sourceLabel}</span>
        </div>
        <div className="bento-card header-stats header-actions">
          <button className="btn btn-outline" type="button" onClick={onEditPersona}>
            Edit persona
          </button>
          <button className="btn btn-outline" type="button" onClick={onReplace}>
            New file
          </button>
          <button className="btn btn-outline" type="button" onClick={onReset}>
            Clear
          </button>
        </div>
      </div>

      <section className="bento-card hero-card" aria-labelledby="match-heading">
        <p className="eyebrow">ICP match rate</p>
        <div className="hero-nums">
          <div>
            <p id="match-heading" className="stat-num hero-match">{report.matchRate}%</p>
            <p className="stat-label">inside persona</p>
          </div>
          <div className="stat-sep tall" />
          <div>
            <p className="stat-num highlight">{report.wastedRate}%</p>
            <p className="stat-label">wasted reach</p>
          </div>
          {drift && (
            <>
              <div className="stat-sep tall" />
              <div>
                <p className="stat-num">{deltaLabel(report.matchDelta)}</p>
                <p className="stat-label">vs previous snapshot</p>
              </div>
            </>
          )}
        </div>
        <p className="hero-copy">{report.headline}</p>
        <p className="persona-chip">Scored against {report.personaName}</p>
      </section>

      <section className="bento-card" aria-labelledby="overlap-heading">
        <div className="section-head">
          <h2 id="overlap-heading">Target overlap matrix</h2>
          <p>Each LinkedIn list scored against your persona. Weights favour seniority so intern noise does not look like pipeline.</p>
        </div>
        <div className="overlap-list">
          {report.dimensions.map((dim) => (
            <div key={dim.key} className="overlap-row">
              <div className="overlap-meta">
                <span className="overlap-label">{dim.label}</span>
                <span className="overlap-weight">weight {Math.round(dim.weight * 100)}%</span>
              </div>
              <Bar value={dim.match || 0} tone={dim.match >= 30 ? 'good' : dim.match >= 15 ? 'warn' : 'bad'} />
              <span className="overlap-value">{dim.match == null ? '—' : `${Math.round(dim.match)}%`}</span>
            </div>
          ))}
        </div>
        {report.dimensions.map((dim) => (
          <details key={`${dim.key}-rows`} className="dim-details">
            <summary>See {dim.label.toLowerCase()} breakdown</summary>
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Segment</th>
                  <th scope="col">Actual</th>
                  <th scope="col">In persona</th>
                </tr>
              </thead>
              <tbody>
                {dim.rows.slice(0, 8).map((row) => (
                  <tr key={row.value}>
                    <td>{row.value}</td>
                    <td>{Math.round(row.percentage * 10) / 10}%</td>
                    <td>{row.inTarget ? <span className="in-yes"><IconCheck /> Yes</span> : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        ))}
      </section>

      <section className="bento-card" aria-labelledby="pillar-heading">
        <div className="section-head">
          <h2 id="pillar-heading">Pillar vs audience pull</h2>
          <p>
            {report.hasPostIcp
              ? 'Impressions tell you what travelled. ICP match tells you who arrived.'
              : 'This file has no per-post audience mix. Reach by pillar is still useful. Load the invented demo to see quality by topic.'}
          </p>
        </div>
        {report.pillars.length === 0 ? (
          <p className="empty-note">No posts in this export. Drop the Posts spreadsheet to attribute topics.</p>
        ) : (
          <div className="pillar-grid">
            {report.pillars.map((pillar) => (
              <article key={pillar.id} className="pillar-card">
                <span className="pillar-tag" style={{ color: pillar.color, background: pillar.bg }}>
                  {pillar.label}
                </span>
                <p className="pillar-icp">
                  {pillar.icpMatch == null ? 'n/a' : `${Math.round(pillar.icpMatch)}%`}
                  <span> ICP match</span>
                </p>
                <p className="pillar-reach">{Math.round(pillar.shareOfImpressions)}% of impressions · {pillar.posts} posts</p>
                <span className={`verdict verdict-${pillar.verdict.tone}`}>{pillar.verdict.label}</span>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="bento-card" aria-labelledby="drift-heading">
        <div className="section-head">
          <h2 id="drift-heading">Audience drift</h2>
          <p>
            {drift
              ? `${report.periodLabels.current} vs ${report.periodLabels.previous.toLowerCase()}. Is the mix moving toward the people you want to work with?`
              : 'Drop a later export to compare. This browser stores the last snapshot locally.'}
          </p>
        </div>
        <div className="drift-grid">
          <div className="drift-stat">
            <p className="stat-label">Director+ share</p>
            <p className="stat-num">{report.seniorityIndex == null ? '—' : `${report.seniorityIndex}%`}</p>
            {report.previousSeniorityIndex != null && (
              <p className="delta">{deltaLabel(report.seniorityIndex - report.previousSeniorityIndex)} vs previous</p>
            )}
          </div>
          <div className="drift-stat">
            <p className="stat-label">Netherlands</p>
            <p className="stat-num">{report.geo.current.Netherlands}%</p>
            {nlDelta != null && <p className="delta">{deltaLabel(nlDelta)} vs previous</p>}
          </div>
          <div className="drift-stat">
            <p className="stat-label">India</p>
            <p className="stat-num">{report.geo.current.India}%</p>
            {indiaDelta != null && <p className="delta">{deltaLabel(indiaDelta)} vs previous</p>}
          </div>
        </div>
      </section>

      {report.posts.length > 0 && (
        <section className="bento-card" aria-labelledby="posts-heading">
          <div className="section-head">
            <h2 id="posts-heading">Posts in this export</h2>
            <p>
              {report.totalImpressions.toLocaleString()} impressions across {report.posts.length} updates
              {report.meta?.dateRange ? ` · ${report.meta.dateRange}` : ''}.
            </p>
          </div>
          <div className="posts-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Post</th>
                  <th scope="col">Pillar</th>
                  <th scope="col">Impressions</th>
                  <th scope="col">ICP</th>
                </tr>
              </thead>
              <tbody>
                {report.posts
                  .slice()
                  .sort((a, b) => (b.impressions || 0) - (a.impressions || 0))
                  .map((post) => (
                    <tr key={post.id}>
                      <td>
                        <span className="post-title">{post.title}</span>
                        {post.date && <span className="post-date">{post.date}</span>}
                      </td>
                      <td>{pillarById(post.pillarId).label}</td>
                      <td>{Number(post.impressions).toLocaleString()}</td>
                      <td>{post.icpMatch == null ? '—' : `${Math.round(post.icpMatch)}%`}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="bento-card limits-card">
        <h2>What this run cannot see</h2>
        <ul>
          {report.limitations.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p className="limits-persona">
          Target is {persona.seniorities.join(', ')} in {persona.locations.slice(0, 3).join(', ')}
          {persona.locations.length > 3 ? ' and more' : ''}.
        </p>
      </section>
    </div>
  )
}
