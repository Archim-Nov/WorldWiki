# Sample Content Index

Purpose: quick reference for the long-detail sample content seeded into Sanity.

Last updated: 2026-02-06

## Overview
- Dataset: `production`
- Seed script: `sanity/scripts/seed-long-details.js`
- Count: 25 docs (5 per type)
- Images: unique random photos from `picsum.photos` uploaded into Sanity assets
- Stories: each story body is 1000+ Chinese characters

## Countries (5)
| Document ID | Slug |
| --- | --- |
| `sample-country-frostgate` | `sample-frostgate` |
| `sample-country-crimson-tide` | `sample-crimson-tide` |
| `sample-country-mistwood` | `sample-mistwood` |
| `sample-country-embersand` | `sample-embersand` |
| `sample-country-starbay` | `sample-starbay` |

## Regions (5)
| Document ID | Slug |
| --- | --- |
| `sample-region-froststep` | `sample-froststep` |
| `sample-region-vermilion-reef` | `sample-vermilion-reef` |
| `sample-region-mistweald` | `sample-mistweald` |
| `sample-region-ashdune` | `sample-ashdune` |
| `sample-region-starlit-archipelago` | `sample-starlit-archipelago` |

## Heroes (5)
| Document ID | Slug |
| --- | --- |
| `sample-hero-yaohan` | `sample-yaohan` |
| `sample-hero-linqi` | `sample-linqi` |
| `sample-hero-qilan` | `sample-qilan` |
| `sample-hero-sharen` | `sample-sharen` |
| `sample-hero-zixun` | `sample-zixun` |

## Creatures (5)
| Document ID | Slug | Category |
| --- | --- | --- |
| `sample-creature-icehorn` | `sample-icehorn-stag` | `animal` |
| `sample-creature-tideglider` | `sample-tideglider` | `animal` |
| `sample-creature-lumaflora` | `sample-lumaflora` | `plant` |
| `sample-creature-mistfungus` | `sample-mistbound-fungus` | `plant` |
| `sample-creature-embermote` | `sample-embermote` | `element` |

## Stories (5)
| Document ID | Slug |
| --- | --- |
| `sample-story-frost-oath` | `sample-frost-oath` |
| `sample-story-mistwood-whisper` | `sample-mistwood-whisper` |
| `sample-story-crimson-tide` | `sample-crimson-tide` |
| `sample-story-ashdune-guide` | `sample-ashdune-guide` |
| `sample-story-starbay-lantern` | `sample-starbay-lantern` |

## Notes
- Display names/titles are in Chinese and live in Sanity; use the IDs/slugs above for stable linking.
- References: regions link to countries; stories link to related heroes/regions/creatures (see seed script).

## Organizations + Magic Expansion (15)
- Seed script: `sanity/scripts/seed-org-magic-content.js`
- Count: 15 docs (organization 5 + principle 5 + spell 5)
- Image strategy: curated real photos from Unsplash uploaded into Sanity assets

### Organizations (5)
| Document ID | Slug |
| --- | --- |
| `seed-org-astral-council` | `org-astral-council` |
| `seed-org-ember-bank` | `org-ember-bank` |
| `seed-org-veil-rangers` | `org-veil-rangers` |
| `seed-org-runic-forge` | `org-runic-forge` |
| `seed-org-echo-courier` | `org-echo-courier` |

### Magic Principles (5)
| Document ID | Slug |
| --- | --- |
| `seed-magic-principle-resonance` | `principle-resonance-law` |
| `seed-magic-principle-anchor` | `principle-anchor-conservation` |
| `seed-magic-principle-phase` | `principle-phase-shift` |
| `seed-magic-principle-memory` | `principle-memory-circuit` |
| `seed-magic-principle-threshold` | `principle-threshold-fission` |

### Magic Spells (5)
| Document ID | Slug | Element |
| --- | --- | --- |
| `seed-magic-spell-skyward-lance` | `spell-skyward-lance` | `fire` |
| `seed-magic-spell-mire-bind` | `spell-mire-bind` | `earth` |
| `seed-magic-spell-ember-gate` | `spell-ember-gate` | `fire` |
| `seed-magic-spell-aurora-veil` | `spell-aurora-veil` | `water` |
| `seed-magic-spell-silent-bell` | `spell-silent-bell` | `wind` |
