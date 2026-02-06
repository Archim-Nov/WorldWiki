# Newworld Wiki (Museum Universe)

沉浸式“博物馆宇宙 / 网状探索 wiki”。核心体验是视觉画廊 + 内链探索，而非传统目录或搜索。

## 技术栈
- Next.js App Router
- Sanity（内容管理）
- Supabase（Auth + 数据）
- Tailwind CSS

## 主要入口
- `/` 视觉大厅（首页）
- `/countries` `/regions` `/creatures` `/champions` `/stories`
- `/about` `/contact`
- `/studio`（Sanity Studio）
- `/sitemap.xml`

## 内容类型
- country / region / creature / hero / story
- 富文本支持内链、外链注解
- 详情页底部展示混合类型“相关推荐”（自动补位至 3 项）

## 本地开发
```bash
cd newworld-wiki
npm install
npm run dev
```

## 环境变量
复制 `newworld-wiki/.env.local.example` 为 `.env.local`，至少包含：
```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## 内容填充与样例
- 创作者指南：`docs/CONTENT_GUIDE.md`
- 长详情样例索引：`docs/SAMPLE_CONTENT.md`
- 生成长详情样例（会创建/覆盖 sample-* 文档 ID）：
```bash
npx sanity exec sanity/scripts/seed-long-details.js --dataset production
```

## 资料与计划
- 里程碑：`docs/roadmap/milestones.md`
- 功能清单：`FEATURE_CHECKLIST.md`
- AI 站点地图：`docs/AI_SITEMAP.md`
- 基线规格：`docs/wiki/*`

## 终端乱码修复（不影响网页）
- 运行：`scripts/terminal-utf8.ps1`
- 或使用：`Get-Content -Encoding UTF8 <path>`
