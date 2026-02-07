# AI Site Map (Museum Universe)

Purpose: a compact, stable map of this repo so future agents can orient quickly.

Last updated: 2026-02-07

## Start here
- `docs/PROJECT_STATUS.md` - project overview, milestones, feature status, design checklist
- `docs/wiki/*` - completed baseline spec (architecture, data model, ops)
- `docs/CONTENT_GUIDE.md` - creator-friendly content filling guide
- `docs/SAMPLE_CONTENT.md` - sample long-form content index (IDs + slugs)
- `docs/USER_ROLES.md` - user role tiers (reader vs editor)
- Repo (private): `https://github.com/Archim-Nov/WorldWiki.git`

## App routes (Next.js App Router)
- `/` - `app/(marketing)/page.tsx`
- `/countries` + `/countries/[slug]` - list/detail
- `/regions` + `/regions/[slug]`
- `/creatures` + `/creatures/[slug]`
- `/champions` + `/champions/[slug]`
- `/stories` + `/stories/[slug]`
- `/about`, `/contact`

## Layout & UI
- Marketing layout: `app/(marketing)/layout.tsx`
- Header/Footer: `components/layout/*`
- Detail page styles: `app/(marketing)/*/[slug]/*-detail.css`
- Detail page layouts: `app/(marketing)/*/[slug]/layout.tsx`
- List page CSS modules: `app/(marketing)/*/page.module.css`
- Global styles: `app/globals.css`

## Content model (Sanity)
- Schemas: `sanity/schemas/*.ts`
- Queries: `lib/sanity/queries.ts`
- Seed data: `sanity/seed/sample-data.ndjson`
- Long-detail seed script: `sanity/scripts/seed-long-details.js`
- Sample content index: `docs/SAMPLE_CONTENT.md`

## API routes
- `/api/contact` - `app/api/contact/route.ts`
- `/api/newsletter` - `app/api/newsletter/route.ts`
- `/api/webhooks/sanity` - `app/api/webhooks/sanity/route.ts`

## SEO
- Metadata: `app/layout.tsx`
- Sitemap: `app/sitemap.ts`

## Terminal UTF-8 (fix garbled output without touching site)
- Run: `scripts/terminal-utf8.ps1`
- Or: `Get-Content -Encoding UTF8 <path>`
