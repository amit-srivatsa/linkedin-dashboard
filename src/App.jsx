import { useMemo, useRef, useState } from 'react'
import './App.css'
import Landing from './components/Landing.jsx'
import Dashboard from './components/Dashboard.jsx'
import PersonaModal from './components/PersonaModal.jsx'
import { DEMO_BUNDLE } from './data/demo.js'
import { diagnose } from './lib/icp.js'
import { applyPreviousFromLastRun, parseFiles, persistBundle } from './lib/parseExport.js'
import { loadPersona, savePersona } from './lib/persona.js'

export default function App() {
  const [persona, setPersona] = useState(() => loadPersona())
  const [bundle, setBundle] = useState(null)
  const [error, setError] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [personaOpen, setPersonaOpen] = useState(false)
  const fileRef = useRef(null)

  const report = useMemo(() => (bundle ? diagnose(bundle, persona) : null), [bundle, persona])

  function setFromBundle(next) {
    const withDrift = applyPreviousFromLastRun(next)
    setBundle(withDrift)
    persistBundle(withDrift)
    setError(null)
  }

  async function ingestFiles(fileList) {
    const files = [...fileList]
    if (!files.length) return
    try {
      const parsed = await parseFiles(files)
      setFromBundle(parsed)
    } catch (err) {
      setError(err.message || 'Could not read that file.')
    }
  }

  function handleDemo() {
    setFromBundle({
      demographics: structuredClone(DEMO_BUNDLE.demographics),
      posts: DEMO_BUNDLE.posts.map((p) => ({ ...p })),
      sourceLabel: DEMO_BUNDLE.sourceLabel,
    })
  }

  function handleSavePersona(next) {
    setPersona(next)
    savePersona(next)
    setPersonaOpen(false)
  }

  return (
    <div className="main">
      {!report ? (
        <Landing
          dragging={dragging}
          error={error}
          fileRef={fileRef}
          onDemo={handleDemo}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            ingestFiles(e.dataTransfer.files)
          }}
        />
      ) : (
        <Dashboard
          report={report}
          persona={persona}
          onEditPersona={() => setPersonaOpen(true)}
          onReset={() => {
            setBundle(null)
            setError(null)
          }}
          onReplace={() => fileRef.current?.click()}
        />
      )}

      <input
        ref={fileRef}
        type="file"
        accept=".csv,.xlsx,.xls,.tsv,text/csv"
        multiple
        hidden
        onChange={(e) => {
          ingestFiles(e.target.files)
          e.target.value = ''
        }}
      />

      {personaOpen && (
        <PersonaModal
          persona={persona}
          onSave={handleSavePersona}
          onClose={() => setPersonaOpen(false)}
        />
      )}

      <footer className="footer">
        <p>Buildtober day 2. Public code, private data. Invented numbers in the demo.</p>
      </footer>
    </div>
  )
}
