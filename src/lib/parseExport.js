function parseCsv(text, delimiter) {
  const sep = delimiter || (text.includes('\t') && !text.includes(',') ? '\t' : ',')
  const rows = []
  let row = []
  let cell = ''
  let inQuotes = false
  const input = String(text).replace(/^\uFEFF/, '')
  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i]
    const next = input[i + 1]
    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"'
        i += 1
      } else if (ch === '"') {
        inQuotes = false
      } else {
        cell += ch
      }
      continue
    }
    if (ch === '"') {
      inQuotes = true
      continue
    }
    if (ch === sep) {
      row.push(cell)
      cell = ''
      continue
    }
    if (ch === '\n') {
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
      continue
    }
    if (ch === '\r') continue
    cell += ch
  }
  if (cell.length || row.length) {
    row.push(cell)
    rows.push(row)
  }
  return rows.filter((line) => line.some((c) => String(c).trim() !== ''))
}

const DIM_ALIASES = {
  location: ['location', 'locations', 'country', 'countries', 'geography', 'region', 'regions', 'geo'],
  industry: ['industry', 'industries'],
  seniority: ['seniority', 'seniorities', 'job seniority', 'seniority level'],
  titles: [
    'job title',
    'job titles',
    'title',
    'titles',
    'job function',
    'job functions',
    'function',
    'functions',
  ],
  companySize: ['company size', 'company sizes', 'companysize', 'size', 'staff count', 'company size range'],
}

const PERIOD_ALIASES = {
  current: ['current', 'latest', 'now', 'this period', 'this quarter', 'q3', 'present'],
  previous: ['previous', 'prior', 'last period', 'last quarter', 'q2', 'baseline'],
}

function cleanHeader(value) {
  return String(value || '')
    .replace(/^\uFEFF/, '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .replace(/[%()]/g, ' ')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function findDim(name) {
  const h = cleanHeader(name)
  for (const [dim, aliases] of Object.entries(DIM_ALIASES)) {
    if (aliases.includes(h) || aliases.some((a) => h.includes(a))) return dim
  }
  return null
}

function findPeriod(name) {
  const h = cleanHeader(name)
  for (const [period, aliases] of Object.entries(PERIOD_ALIASES)) {
    if (aliases.includes(h) || aliases.some((a) => h === a)) return period
  }
  return null
}

function parseNumber(value) {
  if (value == null || value === '') return null
  if (typeof value === 'number' && Number.isFinite(value)) return value
  let text = String(value).trim()
  if (!text) return null
  if (/^<\s*1/.test(text)) return 0.5
  const isPct = text.includes('%')
  text = text.replace(/%/g, '').trim()
  if (text.includes(',') && text.includes('.')) {
    text = text.replace(/,/g, '')
  } else if (/,\d{1,2}$/.test(text) && !text.includes('.')) {
    text = text.replace(',', '.')
  } else {
    text = text.replace(/,/g, '')
  }
  const n = Number(text)
  if (!Number.isFinite(n)) return null
  if (isPct) return n
  return n
}

function asPercentage(n) {
  if (n == null) return null
  return n
}

function normalizeDemo(demo) {
  for (const period of ['current', 'previous']) {
    for (const dim of Object.keys(demo[period] || {})) {
      const rows = demo[period][dim]
      if (!rows?.length) continue
      const max = Math.max(...rows.map((row) => row.percentage))
      if (max <= 1) {
        rows.forEach((row) => {
          row.percentage *= 100
        })
      }
    }
  }
}

function emptyDemo() {
  return { current: {}, previous: {} }
}

function addRow(demo, period, dim, value, percentage) {
  if (!value || percentage == null || !Number.isFinite(percentage)) return
  if (!demo[period][dim]) demo[period][dim] = []
  const existing = demo[period][dim].find((row) => row.value === value)
  if (existing) existing.percentage = percentage
  else demo[period][dim].push({ value: String(value).trim(), percentage })
}

function objectsFromMatrix(rows) {
  if (!rows.length) return { headers: [], objects: [], matrix: rows }
  let headerIndex = 0
  let best = 0
  for (let i = 0; i < Math.min(rows.length, 12); i += 1) {
    const filled = rows[i].filter((c) => String(c).trim()).length
    if (filled > best) {
      best = filled
      headerIndex = i
    }
  }
  const headers = rows[headerIndex].map((h) => String(h || '').trim())
  const objects = []
  for (let r = headerIndex + 1; r < rows.length; r += 1) {
    const line = rows[r]
    if (!line || line.every((c) => String(c).trim() === '')) continue
    const obj = {}
    headers.forEach((h, i) => {
      if (h) obj[h] = line[i]
    })
    objects.push(obj)
  }
  return { headers, objects, matrix: rows, headerIndex }
}

function headerMap(headers) {
  const map = {}
  headers.forEach((h) => {
    const c = cleanHeader(h)
    if (!c) return
    map[c] = h
  })
  return map
}

function pick(map, names) {
  for (const name of names) {
    if (map[name]) return map[name]
    const found = Object.keys(map).find((k) => k === name || k.startsWith(`${name} `) || k.endsWith(` ${name}`))
    if (found) return map[found]
  }
  return null
}

function periodFromSheet(name) {
  const n = cleanHeader(name)
  if (n.includes('content')) return 'current'
  if (n.includes('audience') || n.includes('follower demographic')) return 'previous'
  return findPeriod(name) || 'current'
}

function titleFromLinkedInUrl(url) {
  const raw = String(url || '').trim()
  const match = raw.match(/linkedin\.com\/posts\/[^/_]+_(.+)$/i)
  if (!match) return raw
  return match[1]
    .replace(/-(?:ugcPost|share|activity)-[A-Za-z0-9_-]+$/i, '')
    .replace(/-+/g, ' ')
    .trim() || raw
}

function isTopPostsSheet(name, headers) {
  const n = cleanHeader(name)
  const urlCount = headers.filter((h) => cleanHeader(h) === 'post url').length
  return n.includes('top post') || urlCount >= 1
}

function isDailySeries(map) {
  return Boolean(pick(map, ['date']) && (pick(map, ['impressions']) || pick(map, ['new followers'])) && !pick(map, ['post url', 'post title']))
}

function isPostTable(map) {
  const url = pick(map, ['post url', 'permalink', 'update url'])
  const title = pick(map, ['post title', 'update title', 'share commentary'])
  const impressions = pick(map, ['impressions', 'members reached'])
  const engagements = pick(map, ['engagements', 'engagement'])
  return Boolean((url || title) && (impressions || engagements))
}

function isLongDemoTable(map) {
  return Boolean(
    pick(map, ['dimension', 'breakdown', 'demographic', 'top demographics']) &&
      pick(map, ['value', 'segment']) &&
      pick(map, ['percentage', 'percent', 'share', 'pct'])
  )
}

function isTwoColDemo(headers, map) {
  if (headers.filter(Boolean).length < 2) return false
  const valueCol = headers[0]
  const dim = findDim(valueCol) || findDim(Object.keys(map)[0])
  const pctCol = pick(map, ['percentage', 'percent', 'share', 'pct', 'followers', 'count'])
  return Boolean(dim && pctCol)
}

function parsePosts(objects, map) {
  const urlKey = pick(map, ['post url', 'permalink', 'update url', 'link'])
  const titleKey = pick(map, ['post title', 'update title', 'share commentary', 'title'])
  const dateKey = pick(map, ['post publish date', 'publish date', 'created date', 'posted date', 'date'])
  const impressionKey = pick(map, ['impressions', 'members reached', 'views', 'unique impressions'])
  const reactionKey = pick(map, ['reactions', 'likes', 'reaction count', 'engagements', 'engagement'])
  const commentKey = pick(map, ['comments', 'comment count'])
  const shareKey = pick(map, ['shares', 'reposts', 'reposts count'])
  const pillarKey = pick(map, ['pillar', 'theme', 'category', 'topic'])
  const icpKey = pick(map, ['icp match', 'icp_match', 'match rate', 'persona match'])

  return objects
    .map((row) => {
      const url = urlKey ? String(row[urlKey] || '').trim() : ''
      const rawTitle = titleKey ? String(row[titleKey] || '').trim() : ''
      const title = url.includes('linkedin.com/posts/') ? titleFromLinkedInUrl(url) : rawTitle || titleFromLinkedInUrl(url)
      const impressions = parseNumber(row[impressionKey])
      if (!title || (impressions == null && !reactionKey)) return null
      const icp = icpKey ? parseNumber(row[icpKey]) : null
      return {
        date: dateKey ? String(row[dateKey] || '').slice(0, 12) : '',
        title,
        url,
        impressions: impressions || 0,
        reactions: parseNumber(row[reactionKey]) || 0,
        comments: parseNumber(row[commentKey]) || 0,
        shares: parseNumber(row[shareKey]) || 0,
        pillar: pillarKey ? String(row[pillarKey] || '').trim() : '',
        icpMatch: icp,
      }
    })
    .filter(Boolean)
}

function parseTopPosts(matrix) {
  const headerIndex = matrix.findIndex((row) => row.some((cell) => cleanHeader(cell) === 'post url'))
  if (headerIndex < 0) return []
  const header = matrix[headerIndex]
  const groups = []
  for (let i = 0; i < header.length; i += 1) {
    if (cleanHeader(header[i]) !== 'post url') continue
    groups.push({
      url: i,
      date: i + 1,
      metric: i + 2,
      metricName: cleanHeader(header[i + 2] || ''),
    })
  }
  const byUrl = new Map()
  for (let r = headerIndex + 1; r < matrix.length; r += 1) {
    const line = matrix[r]
    for (const group of groups) {
      const url = String(line[group.url] || '').trim()
      if (!url.startsWith('http')) continue
      const rec = byUrl.get(url) || {
        url,
        date: '',
        title: titleFromLinkedInUrl(url),
        impressions: 0,
        reactions: 0,
        comments: 0,
        shares: 0,
        pillar: '',
        icpMatch: null,
      }
      const date = String(line[group.date] || '').trim()
      if (date) rec.date = date
      const n = parseNumber(line[group.metric])
      if (n != null) {
        if (group.metricName.includes('impression')) rec.impressions = n
        else rec.reactions = n
      }
      byUrl.set(url, rec)
    }
  }
  return [...byUrl.values()]
}

function parseMeta(name, matrix, meta) {
  const n = cleanHeader(name)
  if (n === 'discovery') {
    for (const line of matrix) {
      const label = cleanHeader(line[0])
      if (label.includes('overall')) meta.dateRange = String(line[1] || '')
      if (label === 'impressions') meta.impressions = parseNumber(line[1])
      if (label.includes('members reached')) meta.membersReached = parseNumber(line[1])
    }
  }
  if (n === 'followers' && matrix[0]) {
    if (String(matrix[0][0] || '').toLowerCase().includes('total follower')) {
      meta.followers = parseNumber(matrix[0][1])
    }
  }
}

function parseLongDemo(objects, map, demo, sheetName) {
  const dimKey = pick(map, ['dimension', 'breakdown', 'demographic', 'top demographics'])
  const valueKey = pick(map, ['value', 'segment'])
  const pctKey = pick(map, ['percentage', 'percent', 'share', 'pct'])
  const periodKey = pick(map, ['period', 'snapshot', 'quarter'])
  const sheetPeriod = periodFromSheet(sheetName)
  for (const row of objects) {
    const dim = findDim(row[dimKey])
    if (!dim) continue
    const period = periodKey ? findPeriod(row[periodKey]) || sheetPeriod : sheetPeriod
    addRow(demo, period, dim, row[valueKey], asPercentage(parseNumber(row[pctKey])))
  }
}

function parseTwoColDemo(objects, headers, map, demo, sheetName) {
  const dim = findDim(headers[0]) || findDim(sheetName)
  if (!dim) return
  const pctCol =
    pick(map, ['percentage', 'percent', 'share', 'pct']) ||
    headers[1]
  const valueCol = headers[0]
  const period = findPeriod(sheetName) || 'current'
  for (const row of objects) {
    addRow(demo, period, dim, row[valueCol], asPercentage(parseNumber(row[pctCol])))
  }
}

function parseStackedDemo(matrix, demo, sheetName) {
  let currentDim = findDim(sheetName)
  let period = findPeriod(sheetName) || 'current'
  for (const line of matrix) {
    const cells = line.map((c) => String(c || '').trim()).filter(Boolean)
    if (!cells.length) continue
    const maybeDim = findDim(cells[0])
    if (maybeDim && cells.length <= 2) {
      currentDim = maybeDim
      continue
    }
    const maybePeriod = findPeriod(cells[0])
    if (maybePeriod && cells.length === 1) {
      period = maybePeriod
      continue
    }
    if (!currentDim || cells.length < 2) continue
    const pct = asPercentage(parseNumber(cells[1]))
    if (pct == null) continue
    addRow(demo, period, currentDim, cells[0], pct)
  }
}

function parseSheets(sheets) {
  const demo = emptyDemo()
  const posts = []
  const notes = []
  const meta = {}
  let hasContent = false
  let hasAudience = false

  for (const { name, matrix } of sheets) {
    parseMeta(name, matrix, meta)
    const { headers, objects } = objectsFromMatrix(matrix)
    const map = headerMap(headers)
    const n = cleanHeader(name)

    if (n.includes('content demographic')) hasContent = true
    if (n.includes('audience demographic')) hasAudience = true

    if (isTopPostsSheet(name, headers) && matrix.some((row) => row.some((cell) => String(cell).includes('linkedin.com/posts/')))) {
      posts.push(...parseTopPosts(matrix))
      continue
    }
    if (isDailySeries(map) || n === 'discovery' || n === 'followers' || n === 'engagement') {
      continue
    }
    if (isPostTable(map)) {
      posts.push(...parsePosts(objects, map))
      continue
    }
    if (isLongDemoTable(map)) {
      parseLongDemo(objects, map, demo, name)
      continue
    }
    if (isTwoColDemo(headers, map)) {
      parseTwoColDemo(objects, headers, map, demo, name)
      continue
    }
    parseStackedDemo(matrix, demo, name)
  }

  const hasCurrent = Object.values(demo.current).some((rows) => rows?.length)
  const hasPrevious = Object.values(demo.previous).some((rows) => rows?.length)
  if (!hasCurrent && hasPrevious) {
    demo.current = demo.previous
    demo.previous = {}
  }

  normalizeDemo(demo)
  const periodLabels = {
    current: hasContent ? 'People who saw your posts' : 'Current mix',
    previous: hasAudience && hasContent ? 'Follower mix' : 'Previous snapshot',
  }

  if (!Object.values(demo.current).some((rows) => rows?.length) && !posts.length) {
    notes.push('Could not find demographics or posts in this file.')
  }
  return { demographics: demo, posts, notes, meta, periodLabels }
}

async function fileToSheets(file) {
  const name = (file.name || '').toLowerCase()
  const isExcel = name.endsWith('.xlsx') || name.endsWith('.xls') || name.endsWith('.xlsm')
  if (!isExcel) {
    const text = await file.text()
    return [{ name: file.name || 'Sheet1', matrix: parseCsv(text) }]
  }
  const XLSX = await import('xlsx')
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  return workbook.SheetNames.map((sheetName) => ({
    name: sheetName,
    matrix: XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, raw: false, defval: '' }),
  }))
}

export async function parseFiles(files) {
  const merged = { demographics: emptyDemo(), posts: [], notes: [], sourceLabel: '' }
  const names = []

  for (const file of files) {
    names.push(file.name)
    const sheets = await fileToSheets(file)
    const parsed = parseSheets(sheets)
    mergeBundle(merged, parsed)
  }

  merged.sourceLabel = names.join(', ')
  if (!Object.keys(merged.demographics.current).length && !merged.posts.length) {
    throw new Error(
      'No audience tables found. Export Followers demographics and Posts from LinkedIn Analytics, or load the invented demo.'
    )
  }
  return merged
}

export function parseCsvText(text, filename = 'paste.csv') {
  const parsed = parseSheets([{ name: filename, matrix: parseCsv(text) }])
  parsed.sourceLabel = filename
  return parsed
}

export function mergeBundle(target, incoming) {
  for (const period of ['current', 'previous']) {
    for (const [dim, rows] of Object.entries(incoming.demographics?.[period] || {})) {
      if (!target.demographics[period][dim]) target.demographics[period][dim] = []
      for (const row of rows) addRow(target.demographics, period, dim, row.value, row.percentage)
    }
  }
  if (incoming.posts?.length) target.posts.push(...incoming.posts)
  if (incoming.notes?.length) target.notes.push(...incoming.notes)
  if (incoming.meta) target.meta = { ...(target.meta || {}), ...incoming.meta }
  if (incoming.periodLabels) target.periodLabels = incoming.periodLabels
  return target
}

const LAST_KEY = 'aqm-last-bundle'

export function persistBundle(bundle) {
  try {
    const slim = {
      demographics: bundle.demographics,
      savedAt: Date.now(),
    }
    localStorage.setItem(LAST_KEY, JSON.stringify(slim))
  } catch {
    /* private mode */
  }
}

export function loadLastDemographics() {
  try {
    const raw = localStorage.getItem(LAST_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function applyPreviousFromLastRun(bundle) {
  const last = loadLastDemographics()
  const hasPrevious = Object.values(bundle.demographics.previous || {}).some((rows) => rows?.length)
  if (hasPrevious || !last?.demographics?.current) return bundle
  return {
    ...bundle,
    demographics: {
      ...bundle.demographics,
      previous: last.demographics.current,
    },
  }
}
