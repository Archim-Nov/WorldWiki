# AI Site Map (Museum Universe)

Purpose: a compact, stable map of this repo so future agents can orient quickly.

Last updated: 2026-02-06

## Start here
- `FEATURE_CHECKLIST.md` - product intent and experience principles
- `docs/roadmap/milestones.md` - executable milestones and status
- `docs/wiki/*` - completed baseline spec (architecture, data model, ops)
- `docs/CONTENT_GUIDE.md` - creator-friendly content filling guide
- `docs/SAMPLE_CONTENT.md` - sample long-form content index (IDs + slugs)

## App routes (Next.js App Router)
- `/` - `newworld-wiki/app/(marketing)/page.tsx`
- `/countries` + `/countries/[slug]` - list/detail
- `/regions` + `/regions/[slug]`
- `/creatures` + `/creatures/[slug]`
- `/champions` + `/champions/[slug]`
- `/stories` + `/stories/[slug]`
- `/about`, `/contact`

## Layout & UI
- Marketing layout: `newworld-wiki/app/(marketing)/layout.tsx`
- Header/Footer: `newworld-wiki/components/layout/*`
- Detail page styles: `newworld-wiki/app/(marketing)/*/[slug]/*-detail.css`
- Detail page layouts: `newworld-wiki/app/(marketing)/*/[slug]/layout.tsx`
- List page CSS modules: `newworld-wiki/app/(marketing)/*/page.module.css`
- Global styles: `newworld-wiki/app/globals.css`

## Content model (Sanity)
- Schemas: `newworld-wiki/sanity/schemas/*.ts`
- Queries: `newworld-wiki/lib/sanity/queries.ts`
- Seed data: `newworld-wiki/sanity/seed/sample-data.ndjson`
- Long-detail seed script: `newworld-wiki/sanity/scripts/seed-long-details.js`
- Sample content index: `docs/SAMPLE_CONTENT.md`

## API routes
- `/api/contact` - `newworld-wiki/app/api/contact/route.ts`
- `/api/newsletter` - `newworld-wiki/app/api/newsletter/route.ts`
- `/api/webhooks/sanity` - `newworld-wiki/app/api/webhooks/sanity/route.ts`

## SEO
- Metadata: `newworld-wiki/app/layout.tsx`
- Sitemap: `newworld-wiki/app/sitemap.ts`

## Terminal UTF-8 (fix garbled output without touching site)
- Run: `scripts/terminal-utf8.ps1`
- Or: `Get-Content -Encoding UTF8 <path>`
