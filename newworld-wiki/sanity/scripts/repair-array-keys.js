import { randomUUID } from 'node:crypto'
import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2025-02-06', dataset: 'production' })

const targets = [
  { type: 'country', field: 'featuredRegions' },
  { type: 'region', field: 'featuredHeroes' },
  { type: 'hero', field: 'relatedHeroes' },
  { type: 'creature', field: 'relatedStories' },
  { type: 'story', field: 'relatedHeroes' },
  { type: 'story', field: 'relatedRegions' },
  { type: 'story', field: 'relatedCreatures' },
]

function generateKey(used) {
  let key = randomUUID()
  while (used.has(key)) {
    key = randomUUID()
  }
  used.add(key)
  return key
}

function ensureKeys(items = []) {
  const used = new Set()
  let changed = false
  const next = items.map((item) => {
    if (!item || typeof item !== 'object') return item
    if (item._key) {
      used.add(item._key)
      return item
    }
    changed = true
    return { ...item, _key: generateKey(used) }
  })
  return { changed, next }
}

async function fixField(type, field) {
  const query = `*[_type == "${type}" && defined(${field}) && count(${field}[@._key == null]) > 0]{_id, ${field}}`
  const docs = await client.fetch(query)
  let updatedCount = 0

  for (const doc of docs) {
    const { changed, next } = ensureKeys(doc[field])
    if (!changed) continue

    await client
      .patch(doc._id)
      .set({ [field]: next })
      .commit({ autoGenerateArrayKeys: false })

    updatedCount += 1
    // eslint-disable-next-line no-console
    console.log(`${type}.${field}: fixed ${doc._id}`)
  }

  return updatedCount
}

async function run() {
  let total = 0
  for (const target of targets) {
    // eslint-disable-next-line no-console
    console.log(`Scanning ${target.type}.${target.field}...`)
    total += await fixField(target.type, target.field)
  }
  // eslint-disable-next-line no-console
  console.log(`Done. Updated ${total} documents.`)
}

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error)
  process.exit(1)
})
