# Wiki 总览
**定位**：单人 + AI 辅助开发的商业化 Web 架构规划（SSR/SSG/ISR）。

## 读者与目标
- **读者**：独立开发者、全栈个人项目
- **目标**：在低维护成本下快速上线，并可持续演进

## 文件导航
| 文件 | 用途 |
|---|---|
| `docs/wiki/01_Goals_and_Scope.md` | 项目目标、边界与假设 |
| `docs/wiki/02_Architecture.md` | 架构分层、数据流、职责划分 |
| `docs/wiki/03_Tech_Stack.md` | 技术栈选择与替代方案说明 |
| `docs/wiki/04_Project_Structure.md` | 目录结构、代码边界、命名规则 |
| `docs/wiki/05_Data_Content_Model.md` | Sanity Schema 与 Supabase 数据模型 |
| `docs/wiki/06_SEO_Performance.md` | SEO、SSG/ISR、性能基线 |
| `docs/wiki/07_AI_Workflow.md` | AI 可改区域、风险点、审查流程 |
| `docs/wiki/08_Execution_Checklists.md` | 分阶段计划 + 任务拆解 + Checklist |
| `docs/wiki/09_Operations_Security.md` | 环境、发布、监控、安全基线 |

## 关键决策（一句话）
- **不是传统 SPA**：采用 SSR/SSG/ISR 的 Next.js 方案
- **单一主线**：Supabase 作为唯一 Auth + DB
- **全托管**：Vercel + Sanity + Supabase + Resend
