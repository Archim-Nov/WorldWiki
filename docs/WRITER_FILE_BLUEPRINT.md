# Writer 模块文件蓝图

本文件把 `NewWorld Writer` 的首批实现拆到文件级别，并约定每个文件的主要导出接口，便于按当前仓库结构逐步落地。

## 目标边界

- 仅新增后台创作工作台，不改公开站点结构
- 不替换现有 `Sanity Studio`
- MVP 先打通：`新建条目 -> 结构化编辑 -> 本地草稿 -> 校验 -> 提交 draft`
- `Schema 自动改代码` 不进第一批，只预留接口

## 第一批文件与接口

### 类型与常量

| 文件 | 主要导出 |
| --- | --- |
| `types/writer.ts` | `WriterDocumentType`, `WriterProviderConfig`, `WriterSession`, `WriterDraft`, `WriterSchemaSummary`, `WriterCheckResult` |
| `lib/writer/constants.ts` | `WRITER_DOCUMENT_TYPES`, `WRITER_PROVIDER_KINDS`, `DEFAULT_WRITER_STORAGE_DIR`, `DEFAULT_OPENAI_BASE_URL` |
| `lib/writer/utils.ts` | `createWriterId()`, `createTimestamp()`, `slugifyText()`, `deepClone()` |

### Schema 解析

| 文件 | 主要导出 |
| --- | --- |
| `lib/writer/schema/document-config.ts` | `writerDocumentConfigMap`, `getDocumentConfig()` |
| `lib/writer/schema/introspect.ts` | `listWriterSchemas()`, `getWriterSchemaSummary()`, `getWriterFieldDefinition()` |

### 本地存储

| 文件 | 主要导出 |
| --- | --- |
| `lib/writer/storage/paths.ts` | `getWriterStorageRoot()`, `getWriterProvidersPath()`, `getWriterPresetsPath()`, `getWriterSessionsDir()` |
| `lib/writer/storage/fs.ts` | `ensureWriterStorage()`, `readJsonFile()`, `writeJsonFile()`, `deleteJsonFile()`, `listJsonFiles()` |
| `lib/writer/storage/providers.ts` | `listProviderConfigs()`, `saveProviderConfig()`, `deleteProviderConfig()`, `maskProviderConfig()` |
| `lib/writer/storage/presets.ts` | `listPromptPresets()`, `savePromptPreset()`, `deletePromptPreset()` |
| `lib/writer/storage/sessions.ts` | `listWriterSessions()`, `getWriterSession()`, `createWriterSession()`, `updateWriterSession()`, `deleteWriterSession()` |
| `lib/writer/storage/snapshots.ts` | `listSnapshots()`, `saveSnapshot()` |

### Sanity 桥接

| 文件 | 主要导出 |
| --- | --- |
| `lib/sanity/write-client.ts` | `writeClient`, `isSanityWriteEnabled()` |
| `lib/writer/sanity/portable-text.ts` | `plainTextToPortableText()`, `portableTextToPlainText()` |
| `lib/writer/sanity/reference-search.ts` | `searchWriterReferences()` |
| `lib/writer/sanity/draft-mapper.ts` | `mapDraftToSanityDocument()` |
| `lib/writer/sanity/submit.ts` | `submitWriterDraft()`, `publishWriterDocument()` |

### AI 与提示词

| 文件 | 主要导出 |
| --- | --- |
| `lib/writer/providers/base.ts` | `WriterProvider` 接口 |
| `lib/writer/providers/openai-compatible.ts` | `OpenAICompatibleProvider` |
| `lib/writer/providers/cli.ts` | `CliWriterProvider` |
| `lib/writer/providers/registry.ts` | `getProviderInstance()`, `getDefaultProviderConfig()` |
| `lib/writer/prompts/assemble.ts` | `buildGenerationPrompt()`, `buildClassificationPrompt()` |

### 分类与校验

| 文件 | 主要导出 |
| --- | --- |
| `lib/writer/classifier/rules.ts` | `classifyWriterTypeWithRules()` |
| `lib/writer/classifier/service.ts` | `classifyWriterType()` |
| `lib/writer/checkers/schema.ts` | `validateWriterDraft()` |
| `lib/writer/checkers/duplicates.ts` | `findPotentialDuplicates()` |
| `lib/writer/checkers/relations.ts` | `suggestRelatedReferences()` |
| `lib/writer/checkers/consistency.ts` | `runWriterChecks()` |

### API 路由

| 文件 | 主要导出 |
| --- | --- |
| `app/api/writer/config/route.ts` | `GET` |
| `app/api/writer/providers/route.ts` | `GET`, `POST`, `DELETE` |
| `app/api/writer/presets/route.ts` | `GET`, `POST`, `DELETE` |
| `app/api/writer/sessions/route.ts` | `GET`, `POST` |
| `app/api/writer/sessions/[id]/route.ts` | `GET`, `PATCH`, `DELETE` |
| `app/api/writer/schema/route.ts` | `GET` |
| `app/api/writer/classify/route.ts` | `POST` |
| `app/api/writer/generate/route.ts` | `POST` |
| `app/api/writer/check/route.ts` | `POST` |
| `app/api/writer/references/route.ts` | `GET` |
| `app/api/writer/submit/route.ts` | `POST` |

### 页面与组件

| 文件 | 主要导出 |
| --- | --- |
| `app/(dashboard)/writer/layout.tsx` | Writer 区域布局 |
| `app/(dashboard)/writer/page.tsx` | Writer 首页 |
| `app/(dashboard)/writer/new/page.tsx` | 新建条目页 |
| `app/(dashboard)/writer/[sessionId]/page.tsx` | 创作工作台页 |
| `app/(dashboard)/writer/settings/page.tsx` | Provider / Preset 设置页 |
| `components/writer/WriterOverview.tsx` | 首页摘要 |
| `components/writer/NewEntryWizard.tsx` | 新建流程 |
| `components/writer/WriterWorkbench.tsx` | 创作工作台壳层 |
| `components/writer/StructuredFieldEditor.tsx` | 结构化字段编辑 |
| `components/writer/FieldInput.tsx` | 基础字段输入 |
| `components/writer/ReferenceFieldPicker.tsx` | 引用选择 |
| `components/writer/ChecksPanel.tsx` | 校验结果展示 |
| `components/writer/ProviderManager.tsx` | Provider 设置 |
| `components/writer/PresetManager.tsx` | 预设设置 |

## 请求体草案

### `POST /api/writer/sessions`

```json
{
  "documentType": "country",
  "title": "北境王国",
  "sourceText": "一个高海拔山地国家，信奉星辉。",
  "providerId": "openai-main",
  "presetIds": ["project-core", "country-default"]
}
```

### `PATCH /api/writer/sessions/[id]`

```json
{
  "title": "北境王国",
  "draft": {
    "fields": {
      "name": "北境王国",
      "summary": "位于高海拔山脉之间的古老国家。"
    },
    "lockedFields": ["slug"]
  },
  "messages": []
}
```

### `POST /api/writer/generate`

```json
{
  "sessionId": "writer_xxx",
  "instruction": "根据当前简介扩写 summary 和 customs，不要修改 slug。",
  "mode": "rewrite"
}
```

### `POST /api/writer/check`

```json
{
  "sessionId": "writer_xxx"
}
```

### `POST /api/writer/submit`

```json
{
  "sessionId": "writer_xxx",
  "action": "saveDraft"
}
```

## 当前实施顺序

1. 类型、常量、Schema 解析
2. 本地存储与 Session 管理
3. Sanity draft 映射与提交
4. 分类、校验、基础 AI Provider
5. 后台页面与最小交互
6. 聚焦测试与自测
