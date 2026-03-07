import { notFound } from 'next/navigation'
import { WriterWorkbench } from '@/components/writer'
import { getWriterSchemaSummary } from '@/lib/writer/schema/introspect'
import { listPromptPresets } from '@/lib/writer/storage/presets'
import { listProviderSummaries } from '@/lib/writer/storage/providers'
import { getWriterSession } from '@/lib/writer/storage/sessions'

type WriterSessionPageProps = {
  params: Promise<{ sessionId: string }>
}

export default async function WriterSessionPage({ params }: WriterSessionPageProps) {
  const { sessionId } = await params
  const session = await getWriterSession(sessionId)

  if (!session) {
    notFound()
  }

  const [providers, presets] = await Promise.all([
    listProviderSummaries(),
    listPromptPresets(),
  ])

  const schema = getWriterSchemaSummary(session.documentType)

  return <WriterWorkbench initialSession={session} schema={schema} providers={providers} presets={presets} />
}
