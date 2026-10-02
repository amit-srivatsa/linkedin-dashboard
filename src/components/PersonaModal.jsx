import { useState } from 'react'
import { PERSONA_FIELDS, DEFAULT_PERSONA } from '../lib/persona.js'
import { IconClose } from '../icons.jsx'

export default function PersonaModal({ persona, onSave, onClose }) {
  const [form, setForm] = useState(() => ({
    name: persona.name,
    titles: [...persona.titles],
    seniorities: [...persona.seniorities],
    industries: [...persona.industries],
    companySizes: [...persona.companySizes],
    locations: [...persona.locations],
  }))
  const [drafts, setDrafts] = useState({})

  function addTag(key) {
    const value = (drafts[key] || '').trim()
    if (!value) return
    if (form[key].some((item) => item.toLowerCase() === value.toLowerCase())) {
      setDrafts((d) => ({ ...d, [key]: '' }))
      return
    }
    setForm((f) => ({ ...f, [key]: [...f[key], value] }))
    setDrafts((d) => ({ ...d, [key]: '' }))
  }

  function removeTag(key, value) {
    setForm((f) => ({ ...f, [key]: f[key].filter((item) => item !== value) }))
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal-card persona-modal"
        role="dialog"
        aria-labelledby="persona-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <h2 id="persona-title" className="modal-title">Target persona</h2>
            <p className="modal-sub">The match rate is scored against this list. Keep it tight.</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <IconClose />
          </button>
        </div>

        <label className="fw-label" htmlFor="persona-name">Persona name</label>
        <input
          id="persona-name"
          className="fw-input"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        {PERSONA_FIELDS.map((field) => (
          <div key={field.key} className="tag-field">
            <label className="fw-label" htmlFor={`draft-${field.key}`}>
              {field.label}
              <span className="fw-hint">{field.hint}</span>
            </label>
            <div className="tag-row">
              {form[field.key].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className="tag"
                  onClick={() => removeTag(field.key, tag)}
                >
                  {tag}
                  <span aria-hidden="true">×</span>
                </button>
              ))}
            </div>
            <input
              id={`draft-${field.key}`}
              className="fw-input"
              value={drafts[field.key] || ''}
              placeholder="Add and press enter"
              onChange={(e) => setDrafts((d) => ({ ...d, [field.key]: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addTag(field.key)
                }
              }}
            />
          </div>
        ))}

        <div className="modal-actions">
          <button
            className="btn btn-outline"
            type="button"
            onClick={() => setForm({
              name: DEFAULT_PERSONA.name,
              titles: [...DEFAULT_PERSONA.titles],
              seniorities: [...DEFAULT_PERSONA.seniorities],
              industries: [...DEFAULT_PERSONA.industries],
              companySizes: [...DEFAULT_PERSONA.companySizes],
              locations: [...DEFAULT_PERSONA.locations],
            })}
          >
            Reset defaults
          </button>
          <button className="btn btn-primary" type="button" onClick={() => onSave(form)}>
            Save persona
          </button>
        </div>
      </div>
    </div>
  )
}
