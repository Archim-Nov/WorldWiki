import type { WriterCheckIssue, WriterDraft } from '@/types/writer'
import { getWriterSchemaSummary } from '@/lib/writer/schema/introspect'
import { isNonEmptyString } from '@/lib/writer/utils'

function createIssue(issue: Omit<WriterCheckIssue, 'id'>): WriterCheckIssue {
  return {
    id: `${issue.code}_${issue.fieldName ?? 'general'}`,
    ...issue,
  }
}

export function validateWriterDraft(draft: WriterDraft) {
  const schema = getWriterSchemaSummary(draft.documentType)
  const issues: WriterCheckIssue[] = []

  for (const field of schema.fields) {
    const value = draft.fields[field.name]

    if (field.required) {
      const isMissing =
        value === undefined ||
        value === null ||
        (typeof value === 'string' && value.trim().length === 0) ||
        (Array.isArray(value) && value.length === 0)

      if (isMissing) {
        issues.push(
          createIssue({
            level: 'error',
            code: 'required-field-missing',
            fieldName: field.name,
            message: `字段 ${field.title} 不能为空。`,
          })
        )
      }
    }

    if (field.kind === 'slug' && isNonEmptyString(value) && /\s/.test(value)) {
      issues.push(
        createIssue({
          level: 'warning',
          code: 'slug-has-spaces',
          fieldName: field.name,
          message: 'Slug 中包含空格，保存时会自动转成连字符。',
        })
      )
    }
  }

  return issues
}
