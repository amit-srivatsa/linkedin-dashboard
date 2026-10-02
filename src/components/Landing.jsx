import { IconLock, IconUpload } from '../icons.jsx'

export default function Landing({
  dragging,
  error,
  onDemo,
  fileRef,
  onDragOver,
  onDragLeave,
  onDrop,
}) {
  return (
    <div className="landing">
      <div className="bento-card drop-card">
        <p className="eyebrow">Audience quality map</p>
        <h1>Did the right fifty people see this, or did the graph just go up?</h1>
        <p className="lede">
          Drop a LinkedIn analytics export. Set the persona you actually sell to.
          Get ICP match rate and wasted reach, not another impressions trophy.
        </p>

        <div
          className={`dropzone ${dragging ? 'dragging' : ''}`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <IconUpload size={28} />
          <p>Drop CSV or XLSX here</p>
          <p className="drop-sub">Followers demographics, posts, or both. Multiple files are fine.</p>
          <div className="drop-actions">
            <button className="btn btn-primary" type="button" onClick={() => fileRef.current?.click()}>
              Choose files
            </button>
            <button className="btn btn-outline" type="button" onClick={onDemo}>
              Load invented demo
            </button>
          </div>
        </div>

        {error && <p className="error-banner" role="alert">{error}</p>}

        <div className="privacy-row">
          <IconLock />
          <span>The file never leaves this browser. No login, no scrape, no LinkedIn API.</span>
        </div>
      </div>

      <div className="how-grid">
        <div className="bento-card how-card">
          <p className="how-k">1</p>
          <h2>Export from LinkedIn</h2>
          <p>Analytics, then Followers and Posts. Download the spreadsheet LinkedIn already gives you.</p>
        </div>
        <div className="bento-card how-card">
          <p className="how-k">2</p>
          <h2>Name the persona</h2>
          <p>Titles, seniority, industry, company size, geography. The native dashboard never asks this.</p>
        </div>
        <div className="bento-card how-card">
          <p className="how-k">3</p>
          <h2>Read the variance</h2>
          <p>Match rate, wasted reach, which pillars pull decision-makers, and whether the mix is drifting toward them.</p>
        </div>
      </div>
    </div>
  )
}
