# LinkedIn Dashboard — Handoff

## What this is
A Vite + React dashboard for tracking a 4-week LinkedIn content strategy. Miro-inspired design (yellow #FFD02F accent, dark header, warm canvas background). Deployed to Vercel, connected to GitHub for auto-deploy on push.

## Repo
`https://github.com/amit-srivatsa/linkedin-dashboard`

## Stack
- Vite + React (no TypeScript)
- Pure CSS (no Tailwind, no component library)
- Google Fonts: Outfit
- No backend, no database

## How data works
All post data lives in one file: `src/data/posts.json`

This is the single source of truth. To update the dashboard, edit this file and push to `main`. Vercel auto-deploys in ~30 seconds.

### Post object schema
```json
{
  "id": "w1-1",
  "week": 1,
  "day": "Mon",
  "pillar": "AI in practice",
  "idea": "The original brief/prompt for this post",
  "status": "todo",
  "postTitle": "What was actually posted",
  "postType": "carousel",
  "effort": "medium",
  "link": "https://linkedin.com/posts/..."
}
```

**Valid values:**
- `status`: `todo` | `drafted` | `posted` | `skipped`
- `postType`: `text` | `carousel` | `image` | `video` | `poll` | `article`
- `effort`: `low` | `medium` | `high`
- `pillar`: `AI in practice` | `NL-anchored` | `Marketing craft` | `Open availability`

Empty string `""` means not set yet. Leave blank if unknown.

## File structure
```
linkedin-dashboard/
├── src/
│   ├── data/posts.json     ← EDIT THIS to update the dashboard
│   ├── App.jsx             ← Main component
│   ├── App.css             ← All styles
│   └── main.jsx            ← Entry point
├── index.html
├── package.json
├── vite.config.js
└── vercel.json
```

## Update workflow
1. Edit `src/data/posts.json`
2. `git add src/data/posts.json`
3. `git commit -m "Update post data"`
4. `git push origin main`
5. Vercel deploys automatically

## Common tasks

### Mark a post as posted
Find the post by `id` (format: `w{week}-{dayIndex}`, e.g. `w1-3` = Week 1 Wednesday), update:
```json
"status": "posted",
"postTitle": "Actual title or first line of the post",
"postType": "carousel",
"effort": "medium",
"link": "https://www.linkedin.com/posts/..."
```

### Add a new week or change the brief
Edit the `idea` field of the relevant post object.

### Change status only
Just update the `status` field. Other fields can stay empty.

## Local dev
```bash
npm install
npm run dev
```
Runs at `http://localhost:5173`

## Deploy
```bash
npm run build   # outputs to dist/
```
Vercel handles deployment automatically on push to `main`.
