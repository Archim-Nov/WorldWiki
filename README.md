# WorldWiki

沉浸式游戏世界百科，以"博物馆宇宙"为设计理念。用户通过视觉画廊与网状内链自由探索，而非传统的目录树或搜索框。

## 设计理念

- **视觉入口优先** — 画廊大图块引导探索，不依赖文字列表
- **网状连接** — 内链与自动推荐替代层级分类，每个页面都有 2-3 个自然出口
- **轻导航** — 仅 5 个顶级入口，保持简洁

## 架构

```
浏览器
  │
  ▼
Vercel Edge（缓存 / 中间件）
  │
  ├── Next.js 16 App Router ── SSR / SSG / ISR
  │     ├── (marketing)  五入口画廊 + 详情页
  │     ├── (auth)       登录 / 注册
  │     ├── (dashboard)  用户面板
  │     └── /studio      Sanity Studio（嵌入式）
  │
  ├── Sanity ─── 内容管理（country / region / creature / hero / story）
  ├── Supabase ─ 认证 + 用户数据（profiles + 角色控制）
  └── Resend ─── 邮件通知
```

## 技术栈

| 层 | 选型 |
|---|---|
| 框架 | Next.js 16 (App Router) |
| 内容管理 | Sanity |
| 认证与数据 | Supabase Auth + PostgreSQL |
| 样式 | Tailwind CSS |
| 邮件 | Resend |
| 部署 | Vercel |

## 项目结构

```
WorldWiki/
├── app/
│   ├── (marketing)/     # 五入口：countries/regions/creatures/champions/stories
│   ├── (auth)/          # login / register
│   ├── (dashboard)/     # 用户面板
│   ├── api/             # contact / newsletter / webhooks
│   ├── sitemap.ts
│   └── layout.tsx
├── components/
│   ├── layout/          # Header / Footer / UserNav
│   └── marketing/       # 轮播 / 筛选器 / 展柜
├── lib/
│   ├── sanity/          # client + queries
│   └── supabase/        # client (browser) + server
├── sanity/
│   ├── schemas/         # country / region / creature / hero / story
│   ├── scripts/         # 种子数据脚本
│   └── sanity.config.ts
├── docs/                # 项目文档
├── scripts/             # 工具脚本
├── public/
└── types/
```

## 快速开始

### 1. 克隆与安装

```bash
git clone https://github.com/Archim-Nov/WorldWiki.git
cd WorldWiki
npm install
```

### 2. 配置环境变量

复制 `.env.local.example` 为 `.env.local`，填入以下值：

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### 3. 启动开发服务器

```bash
npm run dev
```

打开 `http://localhost:3000` 查看站点，`http://localhost:3000/studio` 进入内容管理后台。

### 4. 填充样例数据（可选）

```bash
npx sanity exec sanity/scripts/seed-long-details.js --dataset production
```

会生成 25 条样例内容（每类 5 条），用于快速验证页面效果。

## 内容模型

五类核心实体以**关联关系**组织，而非层级分类：

```
country ←── region ←── hero
                  ←── creature
                           ↕
                        story ──→ hero / region / creature
```

- **Country** — 国家，包含精选地区
- **Region** — 区域，归属国家，包含精选英雄
- **Hero** — 英雄，关联地区/国家/阵营，传记支持富文本内链
- **Creature** — 生物，分类为动物/植物/元素
- **Story** — 故事，关联英雄/地区/生物，正文支持富文本内链

详情页底部自动生成混合类型推荐（内链 + 同类兜底），保证每页至少 3 条出口。

## 用户系统

| 角色 | 权限 |
|---|---|
| 未登录 | 浏览所有公开页面 |
| 普通用户 | 登录 + Dashboard |
| 可编辑用户 | 以上 + 通过 Dashboard 进入 Studio 编辑内容 |

认证由 Supabase Auth 管理，编辑权限需管理员在 Sanity 项目中授权。

## 文档

| 文件 | 说明 |
|---|---|
| [`docs/PROJECT_STATUS.md`](docs/PROJECT_STATUS.md) | 里程碑状态 + 功能清单 + 设计验收 |
| [`docs/CONTENT_GUIDE.md`](docs/CONTENT_GUIDE.md) | 内容创作者填充指南 |
| [`docs/SAMPLE_CONTENT.md`](docs/SAMPLE_CONTENT.md) | 样例数据索引（ID + slug） |
| [`docs/USER_ROLES.md`](docs/USER_ROLES.md) | 用户分级与权限矩阵 |
| [`docs/AI_SITEMAP.md`](docs/AI_SITEMAP.md) | AI 协作站点地图 |
| [`docs/wiki/*`](docs/wiki/INDEX.md) | 基线架构规格 |

## 部署

项目部署在 Vercel 上，推送到 `master` 分支即自动部署。

Sanity 内容更新通过 Webhook (`/api/webhooks/sanity`) 触发 ISR 重验证，无需手动重新部署。

## License

Private repository.
