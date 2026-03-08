# Austrum / WorldWiki

一个以世界观条目为核心的 Next.js 站点，同时内置了一套面向编辑团队的本地 AI Writer 工作区。

这个仓库当前不是“纯展示型 Wiki”。它已经同时承担两件事：

- 对外提供世界观条目的浏览、检索与详情展示
- 对内提供一个本地创作工具，让编辑通过 AI 对话、预设提示词、条目卡片和 Sanity 推送完成写作流程

如果你是第一次接手这个项目，建议先把它理解成：**前台站点 + 编辑后台 + 本地 AI 创作工作流**。

## 当前能力

### 1. 世界观站点

当前站点已经覆盖多类核心条目内容，至少包括：

- `country`
- `region`
- `creature`
- `hero`
- `story`
- `magic`

前台页面负责展示这些内容，Sanity 作为内容源，Next.js 负责页面组织、多语言与渲染。

### 2. Writer 本地创作工作区

`/writer` 是这套项目现在最重要的编辑入口，面向 `editor` 角色开放。

Writer 当前已经具备这些能力：

- 接入 AI Provider，支持两类来源：
  - `cli`：适合接本地命令行模型或本地代理配置
  - `openai-compatible`：适合接各类兼容 OpenAI API 的远程接口
- 支持维护多个 Provider，并在设置页中新增、编辑、切换默认 Provider
- 支持维护 Prompt Preset，用来沉淀世界观约束、写作规则、校准要求与任务模版
- 支持“对话式创作”与“编辑已有条目”两种入口
- 支持在工作区里一边聊天，一边同步整理 Entry Card
- 支持字段锁定，锁定后 AI 后续轮次不再覆盖该字段
- 支持基于现有 schema 展示字段，而不是要求编辑手写 JSON
- 支持导入 Sanity 已有条目继续补写、改写和校准
- 支持进行一致性检查、基础字段完整性检查和提交前校验
- 支持推送回 Sanity

## Writer 现在的推荐流程

这套 Writer 目前更适合下面这条创作链路：

1. 进入 `/writer/new`
2. 选择一种入口：
   - **对话式创作**：从一个概念、设定片段或零散想法开始
   - **编辑已有条目**：从 Sanity 导入现有内容继续迭代
3. 选择 Provider 和初始 Preset
4. 进入 `/writer/[sessionId]` 工作区
5. 在聊天区和 AI 讨论设定，AI 每一轮都会尝试同步更新 Entry Card
6. 你可以手动修改卡片字段，并锁定不希望 AI 改动的字段
7. 在确认字段、正文和设定一致性后，执行 Sanity 推送

和传统“直接填 CMS 表单”不同，这里更强调：

- 先讨论概念
- 再收束结构
- 最后产出可提交条目

## 核心页面

- `/writer`
  - Writer 总览页
  - 查看当前会话、入口说明和工作流提示
- `/writer/new`
  - 创建新会话
  - 支持“对话式创作”与“编辑已有条目”
  - 会在创建时带入 Provider 和预设
- `/writer/[sessionId]`
  - 主工作区
  - 当前版本以 **Entry Card + Writer Chat** 为核心
- `/writer/settings`
  - 维护 Provider 与 Prompt Preset
  - 新增或编辑后，会立即影响后续新会话与当前工作区选择项

## 技术栈

- `Next.js 16`（App Router）
- `React 19`
- `TypeScript`
- `Tailwind CSS 4`
- `next-intl`
- `Sanity`
- `Supabase`
- `Resend`
- `Vitest`
- `ESLint`

## 目录结构

以下只列当前理解项目所需的关键目录：

```text
app/
  (dashboard)/writer/      Writer 页面与会话路由
  api/writer/              Writer 的配置、会话、提交等接口
components/
  writer/                  Writer UI 组件
lib/
  sanity/                  Sanity 查询与写入能力
  writer/                  Writer 的 schema、存储、provider、检查器
messages/                  多语言文案
sanity/                    Sanity schema 与 Studio 相关定义
types/                     全局类型定义
.local/writer/             Writer 本地数据目录（运行时生成）
```

## 本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 准备环境变量

复制示例文件：

```bash
cp .env.local.example .env.local
```

Windows PowerShell 可用：

```powershell
Copy-Item .env.local.example .env.local
```

### 3. 启动开发环境

```bash
npm run dev
```

默认会启动 Next.js 本地开发服务器。

## 环境变量说明

最常用的环境变量如下。

### 站点与 Sanity 读取

- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`

### 邮件 / Webhook

- `RESEND_API_KEY`
- `CONTACT_FROM_EMAIL`
- `CONTACT_TO_EMAIL`
- `SANITY_WEBHOOK_SECRET`

### Writer 相关

- `WRITER_ENABLED`
  - 设置为 `false` 时，Writer 接口层会认为该功能关闭
- `WRITER_STORAGE_DIR`
  - 本地存储目录，默认值为 `.local/writer`
- `WRITER_DEFAULT_PROVIDER`
  - 指定默认 Provider

### Sanity 写入

Sanity 提交至少需要下面这些变量：

- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `SANITY_API_WRITE_TOKEN`

同时，写入层也兼容以下 token 名称：

- `SANITY_API_TOKEN`
- `SANITY_STUDIO_TOKEN`

### 可选能力

如果你启用了缓存或限流相关能力，还可能会用到 Upstash 变量；这部分不是 Writer 启动的前置条件。

## 为什么 Sanity 推送会置灰

如果你在 Writer 里看到 Sanity 推送按钮不可用，优先检查下面几项：

1. `.env.local` 是否缺少写入变量
   - 最常见的是没有配置 `SANITY_API_WRITE_TOKEN`
2. 改完环境变量后是否重启了 Next.js 开发服务器
3. `NEXT_PUBLIC_SANITY_PROJECT_ID` / `NEXT_PUBLIC_SANITY_DATASET` 是否为空
4. 当前账号是否具备进入 Writer 的编辑权限
5. `WRITER_ENABLED` 是否被显式设置为 `false`

当前项目里，后端会明确返回 Sanity 写入状态；如果缺少 token，提示语义是：**Sanity push is disabled because no write token is configured.**

所以这类“置灰”通常不是前端 bug，而是环境没有满足写入条件。

## Provider 与 Preset

Writer 的 AI 行为主要由两部分决定：

### Provider

Provider 决定“调用哪一个模型入口”。当前支持：

- `cli`
- `openai-compatible`

你可以在 `/writer/settings` 中新增或编辑 Provider。

### Prompt Preset

Preset 决定“AI 应该以什么方式理解和处理你的设定”。它非常适合承载：

- 基础世界观
- 统一文风要求
- 类型约束
- 冲突检查规则
- 校准提示词

目前推荐做法是：把“探索概念、收束设定、排查冲突、条目成稿”都尽量前置到 Preset 中，而不是让编辑每次重复解释。

## 编辑已有条目

`/writer/new` 现在的第二个入口已经不再强调“快速建稿”，而是更明确地定位为：**编辑已有条目**。

它适合这些场景：

- 旧条目太短，需要补写
- 条目结构已经存在，但语言风格需要统一
- 需要先把 Sanity 中的默认字段和值读出来，再做增删和改写
- 想基于现有正文继续和 AI 协作，而不是重新从空白 JSON 开始

导入后，Writer 会把现有字段和值带进会话，而不是给你一个空草稿。

## 多语言

项目已经接入 `next-intl`，包括 Writer 及其子页面也在逐步纳入多语言文案体系。

相关文案主要位于：

- `messages/zh-CN.json`
- `messages/en.json`

如果你新增了 Writer 页面、按钮或错误提示，记得同步补齐多语言键值。

## 常用命令

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test
npm run test:watch
npm run test:coverage
```

## 开发注意事项

### 1. Writer 本地数据不在数据库里

Writer 的 Provider、Preset、Session 等本地数据默认存放在：

```text
.local/writer
```

这意味着：

- 本地开发时方便快速迭代
- 迁移机器时需要考虑目录复制或重新初始化
- 清理工作区时不要误删仍在使用的会话文件

### 2. 不要把字段枚举值交给模型自由发挥

像 `magic` 这类条目，经常会依赖固定枚举值。如果模型输出了未收录值，前台页面可能无法正确映射文案。

更稳妥的做法是：

- 在 Prompt Preset 里写清楚允许值
- 在 schema / checker 层继续收紧校验
- 不要依赖模型“猜对”枚举标签

### 3. 修改 `.env.local` 后要重启服务

尤其是 Sanity 写入、Writer 开关、默认 Provider 这一类配置，不重启开发服务器通常不会立即生效。

## 适合下一步继续做的事

如果接下来还要继续迭代这套工具，优先级建议是：

1. 继续强化聊天态创作体验，让 AI 的每轮回复都更稳定地收束到 Entry Card
2. 把字段级校验和枚举约束前移到提示词与 checker 双保险里
3. 继续补齐 Writer 全链路多语言
4. 增加更清晰的会话版本、草稿删除与恢复能力
5. 增加更明确的 Sanity 提交结果反馈与失败原因说明

## 一句话总结

这个项目当前最有价值的部分，不只是“一个世界观网站”，而是**一套围绕 Sanity 和 AI 协作写作搭起来的本地编辑工作台**。

如果你要继续开发它，请优先保护这条主线：

**聊天讨论 → 条目卡收束 → 字段校验 → 推送到 Sanity**
