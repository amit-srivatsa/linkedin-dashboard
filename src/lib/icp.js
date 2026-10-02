import { PILLARS, classifyPillar, pillarById } from './pillars.js'

export const DIMENSION_WEIGHTS = {
  seniority: 0.3,
  titles: 0.25,
  industry: 0.2,
  location: 0.15,
  companySize: 0.1,
}

export const DIMENSION_META = {
  seniority: { label: 'Seniority', personaKey: 'seniorities' },
  titles: { label: 'Job titles', personaKey: 'titles' },
  industry: { label: 'Industry', personaKey: 'industries' },
  location: { label: 'Geography', personaKey: 'locations' },
  companySize: { label: 'Company size', personaKey: 'companySizes' },
}

const SENIOR_LEVELS = ['director', 'vp', 'cxo', 'owner', 'partner', 'executive', 'c-suite', 'c suite']

const GEO_HINTS = [
  { country: 'india', rx: /bengaluru|bangalore|delhi|hyderabad|mumbai|chennai|noida|pune|kolkata|gurgaon|gurugram|\bindia\b/ },
  { country: 'netherlands', rx: /amsterdam|utrecht|rotterdam|hague|den haag|eindhoven|brabantine|haarlem|leiden|\bnetherlands\b|\bholland\b/ },
  { country: 'united kingdom', rx: /london|united kingdom|\bengland\b|manchester|scotland|\buk\b/ },
  { country: 'ireland', rx: /dublin|\bireland\b/ },
  { country: 'germany', rx: /berlin|munich|hamburg|frankfurt|\bgermany\b/ },
  { country: 'belgium', rx: /brussels|antwerp|\bbelgium\b/ },
  { country: 'spain', rx: /barcelona|madrid|\bspain\b/ },
  { country: 'united states', rx: /new york|san francisco|bay area|chicago|seattle|united states|\busa\b/ },
]

function norm(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/,/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokens(value) {
  return norm(value)
    .split(/[\s,/()|+_-]+/)
    .filter(Boolean)
}

function sizeKey(value) {
  return norm(value).replace(/employees?/g, '').replace(/\s+/g, '')
}

function locationKeys(value) {
  const v = norm(value)
  const keys = new Set([v, ...tokens(value)])
  for (const hint of GEO_HINTS) {
    if (hint.rx.test(v)) keys.add(hint.country)
  }
  return keys
}

export function valueMatches(value, targets, dimension) {
  const v = norm(value)
  if (!v) return false
  if (dimension === 'companySize') {
    const left = sizeKey(value)
    return (targets || []).some((t) => left && left === sizeKey(t))
  }
  if (dimension === 'location') {
    const keys = locationKeys(value)
    return (targets || []).some((t) => {
      const targetKeys = locationKeys(t)
      for (const key of keys) {
        if (targetKeys.has(key)) return true
      }
      return false
    })
  }
  const vTokens = tokens(value)
  return (targets || []).some((t) => {
    const n = norm(t)
    if (!n) return false
    if (v === n) return true
    if (vTokens.includes(n)) return true
    if (n.length >= 5 && (v.includes(n) || (n.includes(v) && v.length >= 5))) return true
    return false
  })
}

export function dimensionMatch(rows, targets, dimension) {
  if (!rows?.length) return { match: null, covered: 0, rows: [] }
  const annotated = rows.map((row) => {
    const inTarget = valueMatches(row.value, targets, dimension)
    return { ...row, inTarget }
  })
  const match = annotated.reduce((sum, row) => sum + (row.inTarget ? row.percentage : 0), 0)
  const covered = annotated.reduce((sum, row) => sum + row.percentage, 0)
  return {
    match,
    covered,
    rows: annotated.sort((a, b) => b.percentage - a.percentage),
  }
}

function rowsFor(demographics, dimension, period) {
  const bucket = demographics?.[period]?.[dimension] || []
  return bucket
}

function seniorityIndex(rows) {
  if (!rows?.length) return null
  return rows.reduce((sum, row) => sum + (valueMatches(row.value, SENIOR_LEVELS) ? row.percentage : 0), 0)
}

function pct(n) {
  if (n == null || Number.isNaN(n)) return null
  return Math.round(n * 10) / 10
}

function share(value, rows) {
  const wanted = norm(value)
  return (rows || []).reduce((sum, row) => {
    const keys = locationKeys(row.value)
    if (keys.has(wanted) || norm(row.value) === wanted) return sum + row.percentage
    return sum
  }, 0)
}

function weightedMatch(dimensions) {
  const usable = dimensions.filter((d) => d.match != null)
  const weightSum = usable.reduce((sum, d) => sum + d.weight, 0)
  if (!weightSum) return null
  const score = usable.reduce((sum, d) => sum + d.match * (d.weight / weightSum), 0)
  return score
}

function engagementRate(post) {
  const impressions = Number(post.impressions) || 0
  if (!impressions) return 0
  const reactions = Number(post.reactions) || 0
  const comments = Number(post.comments) || 0
  const shares = Number(post.shares) || 0
  return ((reactions + comments + shares) / impressions) * 100
}

function pillarVerdict(pillar) {
  const icp = pillar.icpMatch
  const reach = pillar.shareOfImpressions
  if (icp == null) {
    if (reach >= 40) return { label: 'High reach, unknown quality', tone: 'warn' }
    return { label: 'Needs a quality read', tone: 'muted' }
  }
  if (icp >= 45 && reach < 35) return { label: 'Double down', tone: 'good' }
  if (icp < 20 && reach >= 35) return { label: 'Cut or recast', tone: 'bad' }
  if (icp >= 35) return { label: 'Keep', tone: 'good' }
  return { label: 'Watch', tone: 'warn' }
}

function headlineFor(matchRate, wastedRate, geo) {
  const matchPct = Math.round(matchRate)
  const wastedPct = Math.round(wastedRate)
  const india = geo.current.India
  const nl = geo.current.Netherlands
  const hasFollowerGeo = geo.previous && (geo.previous.India > 0 || geo.previous.Netherlands > 0)
  if (matchRate < 20) {
    if (hasFollowerGeo) {
      return `Only ${matchPct}% of people who saw your posts sit inside the persona. ${wastedPct}% is wasted reach. Followers are ${Math.round(geo.previous.India)}% India and ${Math.round(geo.previous.Netherlands)}% Netherlands. Content reach is ${Math.round(india)}% India and ${Math.round(nl)}% NL.`
    }
    return `Only ${matchPct}% of this reach sits inside your persona. ${wastedPct}% is wasted reach (viral drift). India is ${Math.round(india)}% of the mix. The Netherlands, where the work sits, is ${Math.round(nl)}%.`
  }
  if (matchRate < 40) {
    return `${matchPct}% of reach is inside the persona. Better than noise, still a long way from a pipeline you can defend to a leadership team.`
  }
  return `${matchPct}% of reach is inside the persona. This is starting to look like editorial governance, not a vanity graph.`
}

export function diagnose(bundle, persona) {
  const demographics = bundle.demographics || { current: {}, previous: {} }
  const dimKeys = Object.keys(DIMENSION_WEIGHTS)

  const dimensions = dimKeys.map((key) => {
    const meta = DIMENSION_META[key]
    const currentRows = rowsFor(demographics, key, 'current')
    const previousRows = rowsFor(demographics, key, 'previous')
    const current = dimensionMatch(currentRows, persona[meta.personaKey], key)
    const previous = previousRows.length
      ? dimensionMatch(previousRows, persona[meta.personaKey], key)
      : { match: null, rows: [] }
    return {
      key,
      label: meta.label,
      weight: DIMENSION_WEIGHTS[key],
      match: current.match,
      previousMatch: previous.match,
      rows: current.rows,
      previousRows: previous.rows,
    }
  })

  const matchRateRaw = weightedMatch(dimensions)
  const previousDims = dimensions.map((d) => ({
    ...d,
    match: d.previousMatch,
    weight: d.weight,
  }))
  const previousMatchRaw = weightedMatch(previousDims.filter((d) => d.match != null).length ? previousDims : [])

  const matchRate = matchRateRaw == null ? 0 : matchRateRaw
  const previousMatchRate = previousMatchRaw
  const wastedRate = 100 - matchRate

  const locationNow = rowsFor(demographics, 'location', 'current')
  const locationPrev = rowsFor(demographics, 'location', 'previous')
  const geo = {
    current: {
      India: share('India', locationNow),
      Netherlands: share('Netherlands', locationNow),
    },
    previous: {
      India: share('India', locationPrev),
      Netherlands: share('Netherlands', locationPrev),
    },
  }

  const seniorNow = seniorityIndex(rowsFor(demographics, 'seniority', 'current'))
  const seniorPrev = seniorityIndex(rowsFor(demographics, 'seniority', 'previous'))

  const posts = (bundle.posts || []).map((post, index) => {
    const pillarId = classifyPillar(post.title || post.text, post.pillar)
    const icp =
      post.icpMatch == null || post.icpMatch === ''
        ? null
        : Number(post.icpMatch) <= 1
          ? Number(post.icpMatch) * 100
          : Number(post.icpMatch)
    return {
      ...post,
      id: post.id || `p-${index}`,
      pillarId,
      icpMatch: Number.isFinite(icp) ? icp : null,
      engagement: engagementRate(post),
    }
  })

  const totalImpressions = posts.reduce((sum, p) => sum + (Number(p.impressions) || 0), 0)
  const hasPostIcp = posts.some((p) => p.icpMatch != null)

  const pillars = [...PILLARS.map((p) => p.id), 'other']
    .map((id) => {
      const group = posts.filter((p) => p.pillarId === id)
      if (!group.length) return null
      const impressions = group.reduce((sum, p) => sum + (Number(p.impressions) || 0), 0)
      const icpPosts = group.filter((p) => p.icpMatch != null)
      const icpMatch = icpPosts.length
        ? icpPosts.reduce((sum, p) => sum + p.icpMatch * (Number(p.impressions) || 1), 0) /
          icpPosts.reduce((sum, p) => sum + (Number(p.impressions) || 1), 0)
        : null
      const engagement =
        impressions > 0
          ? group.reduce((sum, p) => {
              const reactions = (Number(p.reactions) || 0) + (Number(p.comments) || 0) + (Number(p.shares) || 0)
              return sum + reactions
            }, 0) / impressions * 100
          : 0
      const meta = pillarById(id)
      const pillar = {
        id,
        label: meta.label,
        color: meta.color,
        bg: meta.bg,
        posts: group.length,
        impressions,
        shareOfImpressions: totalImpressions ? (impressions / totalImpressions) * 100 : 0,
        icpMatch,
        engagement,
      }
      const verdict = pillarVerdict(pillar)
      return { ...pillar, verdict }
    })
    .filter(Boolean)
    .sort((a, b) => b.impressions - a.impressions)

  const limitations = []
  limitations.push(
    'LinkedIn does not export a true cross-tab of title × seniority × industry × location. The match rate is a seniority-weighted envelope across separate lists.'
  )
  if (!hasPostIcp) {
    limitations.push(
      'This export has no per-post audience mix. Pillar quality uses account-level demographics plus reach. The invented demo shows the full per-pillar ICP view.'
    )
  }
  if (!Object.keys(demographics.previous || {}).length) {
    limitations.push(
      'No previous period in this file. Drift appears after you drop a later export (the last run is stored on this device) or when the file includes a previous snapshot.'
    )
  }

  return {
    matchRate: pct(matchRate),
    wastedRate: pct(wastedRate),
    previousMatchRate: previousMatchRate == null ? null : pct(previousMatchRate),
    matchDelta:
      previousMatchRate == null || matchRateRaw == null ? null : pct(matchRateRaw - previousMatchRate),
    headline: headlineFor(matchRate, wastedRate, geo),
    dimensions,
    seniorityIndex: seniorNow == null ? null : pct(seniorNow),
    previousSeniorityIndex: seniorPrev == null ? null : pct(seniorPrev),
    geo: {
      current: { India: pct(geo.current.India), Netherlands: pct(geo.current.Netherlands) },
      previous: {
        India: pct(geo.previous.India),
        Netherlands: pct(geo.previous.Netherlands),
      },
    },
    pillars,
    posts,
    totalImpressions,
    hasPostIcp,
    limitations,
    sourceLabel: bundle.sourceLabel || 'Uploaded export',
    personaName: persona.name,
    periodLabels: bundle.periodLabels || { current: 'Current mix', previous: 'Previous snapshot' },
    meta: bundle.meta || {},
  }
}
