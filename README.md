# Audience quality map

In-browser ICP diagnostic for LinkedIn analytics exports.

Native LinkedIn analytics treats all reach as equal. This tool asks a different question: **did the right fifty decision-makers see the work, or did the graph just go up?**

Drop a standard Followers / Posts export, set a target persona, and read three numbers:

1. **ICP match rate** (share of reach inside the persona envelope)
2. **Wasted reach** (the rest: viral drift)
3. **Pillar vs audience pull** (which topics buy decision-makers, which topics buy noise)

[Load the invented demo](http://localhost:5173) locally. Public posts and screenshots must use that demo. Never commit a real export.

## How it works

- **Client-side only.** CSV and XLSX are parsed in the browser with SheetJS. Nothing is uploaded.
- **Target persona.** Titles, seniority, industry, company size, geography. Saved in `localStorage` on this device.
- **Match rate.** Each LinkedIn demographic list is scored against the persona. Seniority is weighted highest so intern and student noise cannot look like pipeline. LinkedIn does not export a true cross-tab, so this is an envelope, not an AND of all four filters.
- **Pillars.** Post titles are classified into governance, marketing craft, founder notes, and NL-anchored. Override by adding a `pillar` column. If the file includes `icp_match` per post (as the demo does), you get quality by topic. Native LinkedIn exports usually do not.
- **Drift.** If the file has a previous snapshot, or you drop a later export, the last run on this device is used as the baseline.

## How to export from LinkedIn

1. Open LinkedIn Analytics (creator or Page).
2. Export **Followers** (demographics: location, industry, seniority, titles, company size).
3. Export **Posts** / updates for the same window.
4. Drop both files here.

Creator **Aggregate analytics** `.xlsx` works too. The app reads Content demographics as people who saw your posts, Audience demographics as follower mix, and Top posts (impressions plus engagements). Real exports stay on your machine and are gitignored.

The parser also accepts a simple long table:

```
period,dimension,value,percentage
current,location,Netherlands,10
current,seniority,Director,6
```

and a posts table with `title`, `impressions`, optional `pillar` and `icp_match`.

Sample files live in `public/demo/`.

## Privacy

| What | How |
| --- | --- |
| File handling | Read in memory in this tab. Never sent to a server |
| Persona | `localStorage` on this device only |
| Last snapshot | `localStorage`, used only to compute drift |
| Accounts | None. No LinkedIn login, scrape, or API |
| Demo data | Invented. Not a real audience |

## What I left out

- Follower count as a headline metric
- Scheduling or publishing
- Scrapers, extensions, or OAuth
- True cross-tab intersection (LinkedIn does not export it)
- Per-post demographics unless you add them (Day 27 can extend this)

## Team of fifty

An editorial director with fifty writers should be able to say: we did not just get 20k views. We moved Heads of Content in enterprise from 8% to 27% of active reach. That is the sentence this dashboard is built to produce.

## Run locally

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

```bash
npm run build
```

Vercel deploys from `main` if this repo is connected.

## Stack

Vite, React, pure CSS (Outfit, yellow `#FFD02F`, bento cards), SheetJS in the browser. No backend.

Built for Buildtober day 2.
