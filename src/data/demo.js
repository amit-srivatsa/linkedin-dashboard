function dist(entries) {
  return entries.map(([value, percentage]) => ({ value, percentage }))
}

export const DEMO_DEMOGRAPHICS = {
  current: {
    location: dist([
      ['India', 36],
      ['United States', 18],
      ['United Kingdom', 7],
      ['Netherlands', 10],
      ['Germany', 4],
      ['United Arab Emirates', 6],
      ['Canada', 5],
      ['Other', 14],
    ]),
    industry: dist([
      ['Higher Education', 18],
      ['Staffing and Recruiting', 14],
      ['IT Services', 13],
      ['Financial Services', 11],
      ['Software Development', 8],
      ['Marketing and Advertising', 6],
      ['Technology, Information and Internet', 4],
      ['Legal Services', 2],
      ['Other', 24],
    ]),
    seniority: dist([
      ['Entry', 24],
      ['Senior', 25],
      ['Manager', 23],
      ['Training', 8],
      ['Unpaid', 8],
      ['Director', 6],
      ['VP', 3],
      ['CXO', 2],
      ['Owner', 1],
    ]),
    titles: dist([
      ['Software Engineer', 18],
      ['Student', 14],
      ['Recruiter', 12],
      ['Marketing Manager', 10],
      ['Content Manager', 8],
      ['Product Manager', 7],
      ['Data Analyst', 6],
      ['Head of Content', 2],
      ['CMO', 1],
      ['VP Marketing', 1],
      ['Content Director', 1],
      ['Other', 20],
    ]),
    companySize: dist([
      ['11-50', 24],
      ['51-200', 22],
      ['1-10', 18],
      ['201-500', 12],
      ['501-1000', 6],
      ['1001-5000', 8],
      ['5001-10000', 4],
      ['10001+', 6],
    ]),
  },
  previous: {
    location: dist([
      ['India', 41],
      ['United States', 19],
      ['United Kingdom', 8],
      ['Netherlands', 7],
      ['Germany', 3],
      ['United Arab Emirates', 5],
      ['Canada', 5],
      ['Other', 12],
    ]),
    industry: dist([
      ['Higher Education', 21],
      ['Staffing and Recruiting', 16],
      ['IT Services', 14],
      ['Financial Services', 10],
      ['Software Development', 6],
      ['Marketing and Advertising', 5],
      ['Technology, Information and Internet', 3],
      ['Legal Services', 1],
      ['Other', 24],
    ]),
    seniority: dist([
      ['Entry', 28],
      ['Senior', 24],
      ['Manager', 22],
      ['Training', 9],
      ['Unpaid', 9],
      ['Director', 4],
      ['VP', 2],
      ['CXO', 1],
      ['Owner', 1],
    ]),
    titles: dist([
      ['Software Engineer', 20],
      ['Student', 16],
      ['Recruiter', 13],
      ['Marketing Manager', 9],
      ['Content Manager', 7],
      ['Product Manager', 7],
      ['Data Analyst', 6],
      ['Head of Content', 1],
      ['CMO', 1],
      ['Other', 20],
    ]),
    companySize: dist([
      ['11-50', 26],
      ['51-200', 24],
      ['1-10', 20],
      ['201-500', 10],
      ['501-1000', 5],
      ['1001-5000', 7],
      ['5001-10000', 3],
      ['10001+', 5],
    ]),
  },
}

export const DEMO_POSTS = [
  {
    date: '2026-09-04',
    pillar: 'governance',
    title: 'Your EU AI Act register is a content problem first',
    impressions: 2400,
    reactions: 94,
    comments: 31,
    shares: 18,
    icpMatch: 0.71,
  },
  {
    date: '2026-09-11',
    pillar: 'governance',
    title: 'Article 50 in plain English for marketers',
    impressions: 3100,
    reactions: 110,
    comments: 42,
    shares: 22,
    icpMatch: 0.64,
  },
  {
    date: '2026-09-18',
    pillar: 'governance',
    title: 'What I would put on an enterprise AI tool register',
    impressions: 1800,
    reactions: 76,
    comments: 28,
    shares: 14,
    icpMatch: 0.68,
  },
  {
    date: '2026-08-28',
    pillar: 'founder',
    title: 'I shipped a health tracker instead of another SaaS wrapper',
    impressions: 12400,
    reactions: 410,
    comments: 88,
    shares: 36,
    icpMatch: 0.11,
  },
  {
    date: '2026-09-08',
    pillar: 'founder',
    title: 'Ten years of briefs, one weekend of code',
    impressions: 9800,
    reactions: 355,
    comments: 61,
    shares: 29,
    icpMatch: 0.14,
  },
  {
    date: '2026-09-22',
    pillar: 'founder',
    title: 'What moving cities did to the people who still see my posts',
    impressions: 8600,
    reactions: 290,
    comments: 54,
    shares: 21,
    icpMatch: 0.18,
  },
  {
    date: '2026-09-02',
    pillar: 'craft',
    title: 'The brief I used on a 40-market product line, stripped of the jargon',
    impressions: 4200,
    reactions: 148,
    comments: 39,
    shares: 19,
    icpMatch: 0.41,
  },
  {
    date: '2026-09-16',
    pillar: 'craft',
    title: 'Style guides fail because nobody can lint them',
    impressions: 3600,
    reactions: 132,
    comments: 44,
    shares: 16,
    icpMatch: 0.48,
  },
  {
    date: '2026-09-25',
    pillar: 'nl',
    title: 'Dutch MKB owners are not afraid of AI. They are afraid of leaks.',
    impressions: 5100,
    reactions: 167,
    comments: 51,
    shares: 24,
    icpMatch: 0.38,
  },
]

export const DEMO_BUNDLE = {
  demographics: DEMO_DEMOGRAPHICS,
  posts: DEMO_POSTS,
  sourceLabel: 'Invented demo (not a real account)',
}

export function demographicsToCsv(demographics) {
  const lines = ['period,dimension,value,percentage']
  for (const period of Object.keys(demographics)) {
    for (const dimension of Object.keys(demographics[period])) {
      for (const row of demographics[period][dimension]) {
        lines.push(`${period},${dimension},"${row.value}",${row.percentage}`)
      }
    }
  }
  return lines.join('\n')
}

export function postsToCsv(posts) {
  const lines = ['date,pillar,title,impressions,reactions,comments,shares,icp_match']
  for (const post of posts) {
    lines.push(
      `${post.date},${post.pillar},"${post.title.replaceAll('"', '""')}",${post.impressions},${post.reactions},${post.comments},${post.shares},${post.icpMatch}`
    )
  }
  return lines.join('\n')
}
