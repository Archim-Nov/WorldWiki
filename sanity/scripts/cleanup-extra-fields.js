import { getCliClient } from 'sanity/cli'

const DOC_TYPES = ['country', 'region', 'hero', 'creature', 'story', 'magic']

function getArg(name) {
  const full = process.argv.find((arg) => arg.startsWith(`${name}=`))
  if (!full) return null
  return full.slice(name.length + 1).trim()
}

function hasFlag(flag) {
  return process.argv.includes(flag)
}

const dataset = getArg('--dataset') || process.env.SANITY_DATASET || 'production'
const apply = hasFlag('--apply')
const apiVersion = '2025-02-06'

const client = getCliClient({
  apiVersion,
  dataset,
})

const query = `
  *[_type in $types && defined(extraFields)] | order(_updatedAt desc) {
    _id,
    _type,
    _updatedAt,
    "extraCount": count(extraFields)
  }
`

function chunk(array, size) {
  const chunks = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

async function run() {
  console.log(`[cleanup-extra-fields] Dataset: ${dataset}`)
  console.log(`[cleanup-extra-fields] Mode: ${apply ? 'APPLY' : 'DRY-RUN'}`)

  const docs = await client.fetch(query, { types: DOC_TYPES })
  const total = docs.length
  const totalEntries = docs.reduce((sum, doc) => sum + (doc.extraCount || 0), 0)

  console.log(`[cleanup-extra-fields] Matched docs: ${total}`)
  console.log(`[cleanup-extra-fields] Total extra field entries: ${totalEntries}`)

  if (total === 0) {
    console.log('[cleanup-extra-fields] Nothing to clean.')
    return
  }

  if (!apply) {
    console.log('[cleanup-extra-fields] Dry-run complete. Re-run with --apply to execute.')
    return
  }

  const batches = chunk(docs, 50)
  let cleaned = 0

  for (const [index, batch] of batches.entries()) {
    let tx = client.transaction()
    for (const doc of batch) {
      tx = tx.patch(doc._id, (patch) => patch.unset(['extraFields']))
    }
    await tx.commit()
    cleaned += batch.length
    console.log(
      `[cleanup-extra-fields] Batch ${index + 1}/${batches.length} committed (${cleaned}/${total}).`
    )
  }

  console.log(`[cleanup-extra-fields] Done. Cleaned ${cleaned} docs.`)
}

run().catch((error) => {
  console.error('[cleanup-extra-fields] Failed:', error)
  process.exit(1)
})
