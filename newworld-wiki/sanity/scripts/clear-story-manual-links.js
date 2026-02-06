import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2022-06-01', dataset: 'production' })

const storyIds = [
  'story-first-lantern',
  'story-ashes-of-spire',
  'story-steppe-oath',
  'story-river-of-echoes',
  'story-starlit-index',
]

async function run() {
  for (const id of storyIds) {
    await client
      .patch(id)
      .unset(['relatedHeroes', 'relatedRegions', 'relatedCreatures'])
      .commit()
    // eslint-disable-next-line no-console
    console.log(`Cleared manual relations for ${id}`)
  }
}

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error)
  process.exit(1)
})
