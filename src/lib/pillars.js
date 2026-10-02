export const PILLARS = [
  {
    id: 'governance',
    label: 'Governance & compliance',
    color: '#1E40AF',
    bg: '#DBEAFE',
    keywords: ['governance', 'compliance', 'eu ai act', 'article 50', 'policy', 'register', 'legal', 'risk', 'eu recruitment', 'ai rules'],
  },
  {
    id: 'craft',
    label: 'Marketing craft',
    color: '#166534',
    bg: '#DCFCE7',
    keywords: ['brief', 'voice', 'copy', 'audit', 'linter', 'style guide', 'content ops', 'editorial', 'prompt', 'writing', 'audience', 'linkedin data', 'newsletter', 'content roles', 'marketing jds'],
  },
  {
    id: 'founder',
    label: 'Founder notes',
    color: '#9A3412',
    bg: '#FFEDD5',
    keywords: ['i built', 'i shipped', 'i learned', 'weekend', 'career', 'personal', 'network', 'health tracker', 'last day', 'wife', 'tattoo', 'hired a team', 'chess'],
  },
  {
    id: 'nl',
    label: 'NL-anchored',
    color: '#92400E',
    bg: '#FEF3C7',
    keywords: ['netherlands', 'dutch', 'amsterdam', 'mkb', 'gemeente', 'expat', 'utrecht', 'makelaar', 'canals'],
  },
]

const UNCATEGORISED = {
  id: 'other',
  label: 'Uncategorised',
  color: '#6B6B6B',
  bg: '#F0EDEA',
  keywords: [],
}

export function pillarById(id) {
  return PILLARS.find((p) => p.id === id) || UNCATEGORISED
}

export function classifyPillar(text, explicit) {
  if (explicit) {
    const known = PILLARS.find(
      (p) => p.id === explicit || p.label.toLowerCase() === String(explicit).toLowerCase()
    )
    if (known) return known.id
    if (explicit === 'other') return 'other'
  }
  const hay = String(text || '').toLowerCase()
  if (!hay) return 'other'
  let best = 'other'
  let score = 0
  for (const pillar of PILLARS) {
    const hits = pillar.keywords.filter((k) => hay.includes(k)).length
    if (hits > score) {
      score = hits
      best = pillar.id
    }
  }
  return best
}
