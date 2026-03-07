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

export type WriterWorkflowMode = 'direct' | 'conversation'

export type WriterStage = 'conversation' | 'outline' | 'drafting' | 'calibration' | 'review' | 'submitted'

export type WriterNextAction =
  | 'continue-conversation'
  | 'create-outline'
  | 'start-drafting'
  | 'run-calibration'
  | 'submit'

export type WriterConversationIntent = 'explore' | 'refine' | 'resolve'

export type WriterOutlineStatus = 'pending' | 'accepted' | 'expanded'

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

export interface WriterTypeSuggestion {
  documentType: WriterDocumentType
  score: number
  reason: string
}

export interface WriterConceptDecision {
  id: string
  label: string
  value: string
  locked: boolean
  source: 'user' | 'assistant'
}

export interface WriterConceptCard {
  premise: string
  tone?: string
  goals: string[]
  constraints: string[]
  candidateTypes: WriterTypeSuggestion[]
  openQuestions: string[]
  decisions: WriterConceptDecision[]
  updatedAt: string
}

export interface WriterOutlineBlock {
  id: string
  title: string
  summary: string
  mappedFields: string[]
  status: WriterOutlineStatus
}

export interface WriterSession {
  id: string
  title: string
  documentType: WriterDocumentType
  providerId?: string
  presetIds: string[]
  createdAt: string
  updatedAt: string
  workflowMode?: WriterWorkflowMode
  stage?: WriterStage
  status: 'draft' | 'checked' | 'submitted'
  messages: WriterMessage[]
  draft: WriterDraft
  conceptCard?: WriterConceptCard
  outline?: WriterOutlineBlock[]
  lastCheck?: WriterCheckResult
}

export interface WriterGenerationResult {
  assistantMessage: string
  title?: string
  fields: Record<string, unknown>
  conceptCard?: Partial<WriterConceptCard>
  outline?: WriterOutlineBlock[]
  suggestedNextAction?: WriterNextAction
  rawText: string
}
