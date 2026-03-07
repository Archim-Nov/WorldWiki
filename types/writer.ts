export type WriterDocumentType =
  | 'country'
  | 'region'
  | 'creature'
  | 'hero'
  | 'story'
  | 'magic'

export type WriterProviderKind = 'openai-compatible' | 'cli'

export type WriterFieldKind =
  | 'string'
  | 'text'
  | 'slug'
  | 'stringArray'
  | 'reference'
  | 'referenceArray'
  | 'image'
  | 'portableText'
  | 'unknown'

export type WriterMessageRole = 'system' | 'user' | 'assistant'

export type WriterCheckLevel = 'error' | 'warning' | 'info'

export type WriterGenerationMode = 'scaffold' | 'rewrite' | 'fill-missing'

export interface WriterFieldOption {
  title: string
  value: string
}

export interface WriterReferenceValue {
  _ref: string
  _type: 'reference'
  label?: string
  targetType?: string
}

export interface WriterFieldDefinition {
  name: string
  title: string
  kind: WriterFieldKind
  required: boolean
  description?: string
  options?: WriterFieldOption[]
  referenceTypes?: string[]
}

export interface WriterFieldGroup {
  id: string
  title: string
  fieldNames: string[]
}

export interface WriterSchemaSummary {
  documentType: WriterDocumentType
  title: string
  titleField: string
  slugField: string
  bodyField?: string
  fields: WriterFieldDefinition[]
  groups: WriterFieldGroup[]
}

export interface WriterPromptPreset {
  id: string
  name: string
  scope: 'project' | 'documentType' | 'task'
  documentType?: WriterDocumentType
  content: string
  enabled: boolean
  updatedAt: string
}

export interface WriterProviderConfig {
  id: string
  name: string
  kind: WriterProviderKind
  enabled: boolean
  model?: string
  baseUrl?: string
  apiKey?: string
  command?: string
  args?: string[]
  temperature?: number
  updatedAt: string
}

export interface WriterProviderSummary extends Omit<WriterProviderConfig, 'apiKey'> {
  hasApiKey: boolean
  apiKeyPreview?: string
}

export interface WriterMessage {
  id: string
  role: WriterMessageRole
  content: string
  createdAt: string
}

export interface WriterDraft {
  documentType: WriterDocumentType
  sourceText: string
  fields: Record<string, unknown>
  lockedFields: string[]
  updatedAt: string
}

export interface WriterDuplicateCandidate {
  id: string
  type: string
  title: string
  slug?: string
  reason: string
}

export interface WriterRelatedSuggestion {
  refId: string
  type: string
  label: string
  reason: string
}

export interface WriterCheckIssue {
  id: string
  level: WriterCheckLevel
  code: string
  message: string
  fieldName?: string
}

export interface WriterCheckResult {
  issues: WriterCheckIssue[]
  duplicates: WriterDuplicateCandidate[]
  relatedSuggestions: WriterRelatedSuggestion[]
  checkedAt: string
}

export interface WriterSnapshot {
  id: string
  sessionId: string
  createdAt: string
  reason: string
  draft: WriterDraft
}

export interface WriterSession {
  id: string
  title: string
  documentType: WriterDocumentType
  providerId?: string
  presetIds: string[]
  createdAt: string
  updatedAt: string
  status: 'draft' | 'checked' | 'submitted'
  messages: WriterMessage[]
  draft: WriterDraft
  lastCheck?: WriterCheckResult
}

export interface WriterTypeSuggestion {
  documentType: WriterDocumentType
  score: number
  reason: string
}

export interface WriterGenerationResult {
  assistantMessage: string
  title?: string
  fields: Record<string, unknown>
  rawText: string
}
