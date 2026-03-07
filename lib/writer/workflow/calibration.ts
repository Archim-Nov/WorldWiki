import type {
  WriterCalibrationPatch,
  WriterCheckIssue,
  WriterCheckResult,
  WriterFieldDefinition,
  WriterSchemaSummary,
  WriterSession,
} from '@/types/writer'
import { portableTextToPlainText } from '@/lib/writer/sanity/portable-text'
import { createWriterId, deepClone, slugifyText } from '@/lib/writer/utils'

function cleanText(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function toPlainText(value: unknown) {
  if (typeof value === 'string') return value.trim()
  return portableTextToPlainText(value).trim()
}

function uniqueTexts(values: Array<string | undefined>) {
  const seen = new Set<string>()
  const result: string[] = []

  for (const value of values) {
    const normalized = cleanText(value)
    if (!normalized || seen.has(normalized)) continue
    seen.add(normalized)
    result.push(normalized)
  }

  return result
}

function ensureEnding(value: string) {
  const normalized = value.trim()
  if (!normalized) return ''
  return /[。！？!?]$/.test(normalized) ? normalized : `${normalized}。`
}

function joinSentences(values: Array<string | undefined>, separator = '；') {
  return ensureEnding(uniqueTexts(values).join(separator))
}

function buildParagraphs(values: Array<string | undefined>) {
  return uniqueTexts(values)
    .map((value) => ensureEnding(value))
    .filter(Boolean)
}

function stretchText(baseText: string, minLength: number, extras: string[]) {
  let nextText = baseText.trim()

  for (const extra of extras) {
    if (nextText.length >= minLength) break
    const normalized = extra.trim()
    if (!normalized || nextText.includes(normalized)) continue
    nextText = nextText ? `${nextText}\n\n${normalized}` : normalized
  }

  return nextText
}

function getFieldMap(schema: WriterSchemaSummary) {
  return new Map(schema.fields.map((field) => [field.name, field]))
}

function getSubject(session: WriterSession, schema: WriterSchemaSummary) {
  const titleValue = cleanText(session.draft.fields[schema.titleField])
  return titleValue || session.title.trim() || schema.title
}

function getPremise(session: WriterSession) {
  return cleanText(session.conceptCard?.premise) || cleanText(session.draft.sourceText)
}

function getGoalText(session: WriterSession) {
  return uniqueTexts(session.conceptCard?.goals ?? []).slice(0, 3)
}

function getConstraintText(session: WriterSession) {
  return uniqueTexts(session.conceptCard?.constraints ?? []).slice(0, 2)
}

function getDecisionText(session: WriterSession) {
  return uniqueTexts(
    (session.conceptCard?.decisions ?? [])
      .filter((decision) => cleanText(decision.value))
      .slice(0, 4)
      .map((decision) => `${decision.label}：${decision.value}`)
  )
}

function getOpenQuestionText(session: WriterSession) {
  return uniqueTexts(session.conceptCard?.openQuestions ?? []).slice(0, 2)
}

function getOutlineSummaries(session: WriterSession, fieldName?: string) {
  const outline = session.outline ?? []
  const picked = fieldName
    ? outline.filter((block) => block.mappedFields.includes(fieldName))
    : outline.filter((block) => block.status !== 'pending')

  const source = picked.length > 0 ? picked : outline
  return uniqueTexts(source.slice(0, 4).map((block) => `${block.title}：${block.summary}`))
}

function createSummarySuggestion(session: WriterSession, schema: WriterSchemaSummary) {
  const subject = getSubject(session, schema)
  const premise = getPremise(session)
  const goals = getGoalText(session)
  const decisions = getDecisionText(session)
  const outline = getOutlineSummaries(session)

  return joinSentences([
    premise ? `${subject}的核心设定是：${premise}` : `${subject}是当前世界观中的重要条目，需要先明确其定位与辨识度`,
    goals.length > 0 ? `本条目重点突出${goals.join('、')}` : undefined,
    decisions.length > 0 ? `当前已确认${decisions.join('；')}` : undefined,
    outline[0] ? `可从${outline[0]}` : undefined,
  ])
}

function createBodySuggestion(args: {
  session: WriterSession
  schema: WriterSchemaSummary
  field: WriterFieldDefinition
  minLength: number
  emphasis?: string
}) {
  const { session, schema, field, minLength, emphasis } = args
  const subject = getSubject(session, schema)
  const premise = getPremise(session)
  const goals = getGoalText(session)
  const decisions = getDecisionText(session)
  const constraints = getConstraintText(session)
  const outline = getOutlineSummaries(session, field.name)
  const generalOutline = getOutlineSummaries(session)
  const openQuestions = getOpenQuestionText(session)
  const currentText = toPlainText(session.draft.fields[field.name])

  const paragraphs = buildParagraphs([
    premise
      ? `${subject}的基础设定可以先这样落笔：${premise}`
      : `${subject}需要先交代其在世界观中的来源、定位与存在意义，让读者知道它为什么值得单独成条。`,
    outline[0]
      ? `围绕${field.title}可优先展开：${outline.join('；')}`
      : generalOutline[0]
        ? `可以沿着当前雏形继续扩写：${generalOutline.join('；')}`
        : `建议从外观、功能、历史脉络与现实影响几个层面补足${field.title}。`,
    goals.length > 0 ? `本次创作应重点体现：${goals.join('；')}` : undefined,
    decisions.length > 0 ? `已经确认的设定包括：${decisions.join('；')}` : undefined,
    constraints.length > 0 ? `撰写时需要保持：${constraints.join('；')}` : undefined,
    emphasis ? `这一版草稿尤其要照顾：${emphasis}` : undefined,
    openQuestions.length > 0 ? `若后续继续细化，可优先回答：${openQuestions.join('；')}` : undefined,
  ])

  const extraParagraphs = buildParagraphs([
    `${subject}与其他国家、区域、角色或生物之间的关联，也应在正文中留下可继续补充的接口，方便后续接入引用与世界观联动。`,
    `在文风上保持设定集条目的客观与清晰：先交代核心信息，再展开细节，最后补充影响、限制或余波，这样更适合后续继续润色。`,
    `如果这一字段对应的是正式正文，建议至少包含“背景来源—当前形态—关键机制—外部影响”四层信息；若对应的是说明型字段，则至少给出定义、作用与边界。`,
  ])

  const baseText = currentText
    ? stretchText(currentText, minLength, [...paragraphs, ...extraParagraphs])
    : stretchText(paragraphs.join('\n\n'), minLength, extraParagraphs)

  return baseText
}

function inferCountryKind(session: WriterSession) {
  const corpus = `${getPremise(session)} ${(session.conceptCard?.decisions ?? []).map((item) => item.value).join(' ')}`.toLowerCase()
  if (/联盟|协会|公会|教团|学院|组织|company|guild|order|organization/.test(corpus)) {
    return 'organization'
  }
  return 'nation'
}

function inferCreatureCategory(session: WriterSession) {
  const corpus = `${getPremise(session)} ${(session.conceptCard?.decisions ?? []).map((item) => item.value).join(' ')}`.toLowerCase()
  if (/树|花|草|藤|蕈|菌|plant|flora|forest/.test(corpus)) {
    return 'plant'
  }
  if (/元素|精灵|火|炎|风|雷|冰|水|earth|wind|fire|water|element/.test(corpus)) {
    return 'element'
  }
  return 'animal'
}

function inferMagicKind(session: WriterSession) {
  const corpus = `${getPremise(session)} ${(session.conceptCard?.decisions ?? []).map((item) => item.value).join(' ')}`.toLowerCase()
  if (/法术|术式|spell|casting/.test(corpus)) {
    return 'spell'
  }
  if (/原理|法则|规则|理论|体系|principle|law|theory|system/.test(corpus)) {
    return 'principle'
  }
  return 'spell'
}

function inferMagicElement(session: WriterSession) {
  const corpus = `${getPremise(session)} ${(session.conceptCard?.decisions ?? []).map((item) => item.value).join(' ')}`.toLowerCase()
  if (/潮|海|浪|河|湖|冰|雪|water|ice|sea|river|tide/.test(corpus)) {
    return 'water'
  }
  if (/火|炎|熔|burn|flame|fire|lava/.test(corpus)) {
    return 'fire'
  }
  if (/风|岚|暴|storm|wind|air/.test(corpus)) {
    return 'wind'
  }
  if (/土|岩|石|山|earth|rock|stone|mountain/.test(corpus)) {
    return 'earth'
  }
  return undefined
}

function inferOptionValue(field: WriterFieldDefinition, session: WriterSession) {
  if (!field.options || field.options.length === 0) return undefined

  if (session.documentType === 'country' && field.name === 'kind') {
    return inferCountryKind(session)
  }

  if (session.documentType === 'creature' && field.name === 'category') {
    return inferCreatureCategory(session)
  }

  if (session.documentType === 'magic' && field.name === 'kind') {
    return inferMagicKind(session)
  }

  if (session.documentType === 'magic' && field.name === 'element') {
    return inferMagicElement(session)
  }

  return field.options.length === 1 ? field.options[0]?.value : undefined
}

function createPatch(args: {
  field?: WriterFieldDefinition
  kind: WriterCalibrationPatch['kind']
  nextValue: unknown
  title: string
  reason: string
}) {
  return {
    id: createWriterId('patch'),
    kind: args.kind,
    title: args.title,
    reason: args.reason,
    fieldName: args.field?.name,
    nextValue: deepClone(args.nextValue),
  } satisfies WriterCalibrationPatch
}

function buildPatchFromIssue(args: {
  issue: WriterCheckIssue
  session: WriterSession
  schema: WriterSchemaSummary
  fieldMap: Map<string, WriterFieldDefinition>
}) {
  const { issue, session, schema, fieldMap } = args
  const field = issue.fieldName ? fieldMap.get(issue.fieldName) : undefined

  if (field?.name && session.draft.lockedFields.includes(field.name)) {
    return null
  }

  if (issue.code === 'slug-has-spaces') {
    const slugField = field ?? fieldMap.get(schema.slugField)
    if (!slugField) return null

    const currentValue = cleanText(session.draft.fields[slugField.name])
    const fallbackValue = slugifyText(getSubject(session, schema))
    const nextValue = slugifyText(currentValue || fallbackValue)
    if (!nextValue) return null

    return createPatch({
      field: slugField,
      kind: 'schema',
      nextValue,
      title: `规范化 ${slugField.title}`,
      reason: '自动移除空格并转成可提交到 Sanity 的 slug 格式。',
    })
  }

  if (issue.code === 'creature-category-missing') {
    const categoryField = field ?? fieldMap.get('category')
    if (!categoryField) return null

    return createPatch({
      field: categoryField,
      kind: 'schema',
      nextValue: inferCreatureCategory(session),
      title: '补全生物分类',
      reason: '根据现有概念先推断一个 category，后续仍可手动修改。',
    })
  }

  if (issue.code === 'magic-kind-missing') {
    const kindField = field ?? fieldMap.get('kind')
    if (!kindField) return null

    return createPatch({
      field: kindField,
      kind: 'schema',
      nextValue: inferMagicKind(session),
      title: '补全魔法类型',
      reason: '根据概念先推断为 principle 或 spell，便于继续完善条目。',
    })
  }

  if (issue.code === 'magic-element-missing') {
    const elementField = field ?? fieldMap.get('element')
    const nextValue = inferMagicElement(session)
    if (!elementField || !nextValue) return null

    return createPatch({
      field: elementField,
      kind: 'schema',
      nextValue,
      title: '补全魔法元素',
      reason: '根据现有描述推断一个 element，帮助法术条目先通过结构校验。',
    })
  }

  if (!field) return null

  if (issue.code === 'required-field-missing') {
    if (field.kind === 'slug') {
      const nextValue = slugifyText(getSubject(session, schema))
      if (!nextValue) return null
      return createPatch({
        field,
        kind: 'schema',
        nextValue,
        title: `补全 ${field.title}`,
        reason: '这是必填字段，先生成一版可用的 slug 初稿。',
      })
    }

    if (field.name === schema.titleField) {
      const nextValue = getSubject(session, schema)
      if (!nextValue) return null
      return createPatch({
        field,
        kind: 'schema',
        nextValue,
        title: `补全 ${field.title}`,
        reason: '这是必填字段，先回填当前会话标题作为草稿。',
      })
    }

    if (field.options && field.options.length > 0) {
      const optionValue = inferOptionValue(field, session)
      if (!optionValue) return null
      return createPatch({
        field,
        kind: 'schema',
        nextValue: optionValue,
        title: `补全 ${field.title}`,
        reason: '这是必填选项字段，先根据概念推断一个可继续编辑的值。',
      })
    }

    if (field.kind === 'text' || field.kind === 'portableText') {
      return createPatch({
        field,
        kind: 'style',
        nextValue: createBodySuggestion({ session, schema, field, minLength: field.name === 'content' ? 1000 : 220 }),
        title: `补全 ${field.title}`,
        reason: '这是必填正文类字段，先补出可继续润色的结构化草稿。',
      })
    }

    if (field.kind === 'string') {
      const nextValue = field.name === 'summary' ? createSummarySuggestion(session, schema) : getSubject(session, schema)
      if (!nextValue) return null
      return createPatch({
        field,
        kind: 'schema',
        nextValue,
        title: `补全 ${field.title}`,
        reason: '这是必填字段，先补一版基础文本，避免空值阻塞提交。',
      })
    }
  }

  if (issue.code === 'recommended-field-missing') {
    if (field.options && field.options.length > 0) {
      const optionValue = inferOptionValue(field, session)
      if (!optionValue) return null
      return createPatch({
        field,
        kind: 'schema',
        nextValue: optionValue,
        title: `补全推荐字段 ${field.title}`,
        reason: '该字段会明显影响条目完整度，先补一个可调整的推荐值。',
      })
    }

    if (field.kind === 'text' || field.kind === 'portableText') {
      return createPatch({
        field,
        kind: 'style',
        nextValue:
          field.name === 'summary'
            ? createSummarySuggestion(session, schema)
            : createBodySuggestion({ session, schema, field, minLength: field.name === 'content' ? 1000 : 220 }),
        title: `补全推荐字段 ${field.title}`,
        reason: '该字段建议尽早补上，方便条目进入可审阅状态。',
      })
    }

    if (field.kind === 'slug') {
      const nextValue = slugifyText(getSubject(session, schema))
      if (!nextValue) return null
      return createPatch({
        field,
        kind: 'schema',
        nextValue,
        title: `补全推荐字段 ${field.title}`,
        reason: '先生成可用 slug，避免后续提交时再返工。',
      })
    }
  }

  if (issue.code === 'summary-too-short') {
    return createPatch({
      field,
      kind: 'style',
      nextValue: stretchText(toPlainText(session.draft.fields[field.name]), 70, [createSummarySuggestion(session, schema)]),
      title: '扩写摘要',
      reason: '把摘要扩成更适合列表与详情页展示的概览文本。',
    })
  }

  if (issue.code === 'bio-too-short') {
    return createPatch({
      field,
      kind: 'style',
      nextValue: createBodySuggestion({
        session,
        schema,
        field,
        minLength: 240,
        emphasis: '背景、定位、行为模式与世界观关联',
      }),
      title: '扩写正文',
      reason: '把人物或生物正文扩成更完整的设定描述。',
    })
  }

  if (issue.code === 'story-too-short') {
    return createPatch({
      field,
      kind: 'style',
      nextValue: createBodySuggestion({
        session,
        schema,
        field,
        minLength: 1000,
        emphasis: '背景、冲突、发展、转折、结果与余波',
      }),
      title: '扩写故事正文',
      reason: '先把故事补成可继续精修的完整叙事骨架。',
    })
  }

  return null
}

function dedupePatches(patches: WriterCalibrationPatch[]) {
  const seen = new Set<string>()

  return patches.filter((patch) => {
    const key = `${patch.fieldName ?? 'general'}::${patch.title}::${JSON.stringify(patch.nextValue)}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function buildWriterCalibrationPatches(args: {
  session: WriterSession
  checkResult?: WriterCheckResult
  schema: WriterSchemaSummary
}) {
  const { session, schema } = args
  const checkResult = args.checkResult ?? session.lastCheck
  if (!checkResult) return [] as WriterCalibrationPatch[]

  const fieldMap = getFieldMap(schema)

  return dedupePatches(
    checkResult.issues
      .map((issue) => buildPatchFromIssue({ issue, session, schema, fieldMap }))
      .filter(Boolean) as WriterCalibrationPatch[]
  )
}

export function applyWriterCalibrationPatches(args: { session: WriterSession; patchIds?: string[] }) {
  const { session, patchIds } = args
  const currentPatches = session.calibrationPatches ?? []
  const targetIds = new Set((patchIds && patchIds.length > 0 ? patchIds : currentPatches.map((patch) => patch.id)).filter(Boolean))
  const nextFields = {
    ...deepClone(session.draft.fields),
  }
  const appliedPatches: WriterCalibrationPatch[] = []
  const remainingPatches: WriterCalibrationPatch[] = []

  for (const patch of currentPatches) {
    if (!targetIds.has(patch.id) || !patch.fieldName || session.draft.lockedFields.includes(patch.fieldName)) {
      remainingPatches.push(patch)
      continue
    }

    nextFields[patch.fieldName] = deepClone(patch.nextValue)
    appliedPatches.push(patch)
  }

  return {
    draft: {
      ...session.draft,
      fields: nextFields,
    },
    appliedPatches,
    remainingPatches,
  }
}
