import { NewEntryWizard } from '@/components/writer'
import { listWriterSchemas } from '@/lib/writer/schema/introspect'
import { listProviderSummaries } from '@/lib/writer/storage/providers'

export default async function WriterNewPage() {
  const [schemas, providers] = await Promise.all([
    Promise.resolve(listWriterSchemas()),
    listProviderSummaries(),
  ])

  return <NewEntryWizard schemas={schemas} providers={providers} />
}
