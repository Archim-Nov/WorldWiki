import { NewEntryWizard } from '@/components/writer'
import { listWriterSchemas } from '@/lib/writer/schema/introspect'
import { listPromptPresets } from '@/lib/writer/storage/presets'
import { listProviderSummaries } from '@/lib/writer/storage/providers'

export default async function WriterNewPage() {
  const [schemas, providers, presets] = await Promise.all([
    Promise.resolve(listWriterSchemas()),
    listProviderSummaries(),
    listPromptPresets(),
  ])

  return <NewEntryWizard schemas={schemas} providers={providers} presets={presets} />
}
