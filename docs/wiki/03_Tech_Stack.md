# 技术栈选型

## 主线选型（最终采用）
| 模块 | 选型 | 理由 |
|---|---|---|
| 前端框架 | Next.js 16 (App Router) | SSR/SSG/ISR 原生支持 |
| CMS | Sanity.io | Schema 灵活、预览好用 |
| Auth + DB | Supabase | 单一体系、低维护 |
| 部署 | Vercel | Next.js 原生生态 |
| 样式 | Tailwind + shadcn/ui | 快速 UI 产出 |
| 邮件 | Resend | API 简洁 |
| 分析 | Plausible | 轻量、隐私友好 |

## 关键理由
- **单人维护**：减少多套体系冲突
- **AI 友好**：文档与生态成熟
- **SEO 友好**：SSR/SSG 原生

## 可选替代（不推荐但可替换）
| 模块 | 可替换 | 影响 |
|---|---|---|
| CMS | Contentful / Strapi | 增加配置复杂度 |
| Auth | Clerk / NextAuth | 需重新评估用户数据归属 |
| 部署 | Netlify | Next.js 兼容度需验证 |

## 选择排除项
- 多套鉴权系统（风险高、维护重）
- 自建数据库（运维负担）

## 免费额度与成本预警
| 服务 | 免费额度 | 超出后 | 预警阈值 |
|---|---|---|---|
| Sanity | 100k API CDN 请求/月，1M 资产带宽 | $0.015/1k 请求 | 80k 请求时评估 |
| Supabase | 500MB 数据库，5GB 带宽，50k MAU | 按量计费 | 400MB / 40k MAU |
| Vercel | 100GB 带宽，无限静态请求 | Pro $20/月 | 80GB 带宽 |
| Resend | 3000 邮件/月 | $20/月起 | 2500 邮件 |

### 成本控制策略
- **Sanity**：启用 CDN 缓存，避免客户端直接查询，优先 SSG/ISR
- **Supabase**：合理设计索引，避免全表扫描
- **Vercel**：静态资源走 CDN，图片使用 next/image 自动优化
