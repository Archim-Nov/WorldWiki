import { unstable_noStore as noStore } from 'next/cache'
import { WriterOverview } from '@/components/writer'
import { listWriterSessions } from '@/lib/writer/storage/sessions'
import { getLocale } from 'next-intl/server'
import { withLocalePrefix } from '@/i18n/path'

export default async function WriterHomePage() {
  noStore()

  const locale = await getLocale()
  const sessions = await listWriterSessions()
  return <WriterOverview sessions={sessions} basePath={withLocalePrefix('/writer', locale)} />
}