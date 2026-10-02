const STORAGE_KEY = 'aqm-persona-v1'

export const DEFAULT_PERSONA = {
  name: 'Enterprise content leaders in NL and EU',
  titles: [
    'Head of Content',
    'VP Content',
    'Content Director',
    'Editorial Director',
    'CMO',
    'Brand Director',
    'Head of Marketing',
    'VP Marketing',
  ],
  industries: [
    'Software Development',
    'Technology, Information and Internet',
    'Marketing and Advertising',
    'Legal Services',
    'Professional Services',
  ],
  seniorities: ['Director', 'VP', 'CXO', 'Owner', 'Partner', 'Executive'],
  companySizes: ['201-500', '501-1000', '1001-5000', '5001-10000', '10001+'],
  locations: [
    'Netherlands',
    'Amsterdam',
    'Rotterdam',
    'Belgium',
    'Germany',
    'United Kingdom',
    'Ireland',
    'Sweden',
    'Denmark',
  ],
}

export const PERSONA_FIELDS = [
  { key: 'titles', label: 'Job titles', hint: 'Roles you actually want in the room' },
  { key: 'seniorities', label: 'Seniority', hint: 'Director and above filters intern noise' },
  { key: 'industries', label: 'Industries', hint: 'Markets you sell or hire into' },
  { key: 'companySizes', label: 'Company size', hint: 'LinkedIn buckets, 201+' },
  { key: 'locations', label: 'Geography', hint: 'Where the work and the buyers sit' },
]

export function loadPersona() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return structuredClone(DEFAULT_PERSONA)
    const parsed = JSON.parse(raw)
    return {
      ...structuredClone(DEFAULT_PERSONA),
      ...parsed,
      titles: parsed.titles?.length ? parsed.titles : DEFAULT_PERSONA.titles,
      seniorities: parsed.seniorities?.length ? parsed.seniorities : DEFAULT_PERSONA.seniorities,
      industries: parsed.industries?.length ? parsed.industries : DEFAULT_PERSONA.industries,
      companySizes: parsed.companySizes?.length ? parsed.companySizes : DEFAULT_PERSONA.companySizes,
      locations: parsed.locations?.length ? parsed.locations : DEFAULT_PERSONA.locations,
    }
  } catch {
    return structuredClone(DEFAULT_PERSONA)
  }
}

export function savePersona(persona) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(persona))
}

export function resetPersona() {
  localStorage.removeItem(STORAGE_KEY)
  return structuredClone(DEFAULT_PERSONA)
}
