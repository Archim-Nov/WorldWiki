# Museum Universe 里程碑计划（可执行任务清单）

说明：本计划用于落地“博物馆宇宙 / 优美的游戏网状 wiki”。重点是视觉画廊与网状连接，不做营销落地页与搜索框。

---

## M1 — 内容模型与基础骨架（Foundation）

**目标**：确立数据结构与最小路由骨架，确保五入口能跑通。

**任务清单**
- Sanity schema 替换为 `country/region/creature/hero/story`。
- 移除/废弃 `post/page` 相关 schema 与查询。
- 建立五入口路由骨架：
  - `/countries`、`/regions`、`/creatures`、`/champions`、`/stories`
  - 对应详情页 `/[slug]`
- 准备基础样例内容（每类至少 3 条）。
- 切换导航为五入口（仅基础链接即可）。

**交付物**
- 五入口页面可访问（哪怕是占位）
- Sanity 后台可录入 5 类内容

**验收标准**
- 可从首页或导航进入五入口页面
- 任一入口可打开至少 1 条详情页

---

## M2 — 画廊体验与视觉入口（Gallery）

**目标**：让“画廊”成为主要浏览方式，确立视觉基调。

**任务清单**
- 统一画廊卡片规范（比例、裁切、悬停动效）。
- 英雄画廊实现瀑布流或网格。
- 英雄筛选器：国家/区域（标签）。
- 生物筛选器：分类（动物/植物/元素）。
- 区域/国家/生物画廊实现基础网格。
- 首页改为“视觉大厅”：五入口大图块。

**交付物**
- 英雄画廊可正常筛选
- 五入口在首页以视觉块形式呈现

**验收标准**
- 用户不需要搜索框即可浏览 80% 内容
- 画廊视觉统一、交互顺滑

---

## M3 — 网状连接与关联探索（The Web）

**目标**：用故事线与内链建立“网状”体验。

**任务清单**
- 详情页底部“相关推荐”模块（统一样式）。
- 传记/故事内链（富文本标注 + 渲染）。
- 关联查询逻辑（内链 + 兜底关联）。

**交付物**
- 每个详情页都有至少 2 条相关推荐

**验收标准**
- 任一详情页可自然跳转到其他 2–3 个页面

---

## M4 — 详情页形态统一（Detail Layout）

**目标**：详情页呈现“展馆式”体验。

**任务清单**
- 保持入口差异化的前提下，移动端适配与阅读排版优化。

**交付物**
- 详情页在移动端阅读体验优化完成（保持差异化结构）

**验收标准**
- 详情页在手机端体验良好

---

## M5 — 轻量 SEO 与发布准备（Release）

**目标**：最低限度的分享与索引能力。

**任务清单**
- Sitemap 覆盖五类内容
- 基础 metadata（title/description）
- baseUrl 读取部署环境变量
- 可选：基础 OG/Twitter 图

**交付物**
- Sitemap 可用
- 分享链接显示基本信息

**验收标准**
- 搜索引擎可索引五类页面

---

## 里程碑节奏建议（可调整）
- M1：1 周
- M2：1–2 周
- M3：1 周
- M4：1 周
- M5：0.5 周

最后更新：2026-02-04

---

## Completion Status (2026-02-05)
Note: The wiki documentation in `docs/wiki/*` is complete; future changes are tracked here.

### M1 — Foundation (Done)
- [x] Sanity schemas replaced with country/region/creature/hero/story.
- [x] Legacy post/page schema and queries removed from active use.
- [x] Five entry routes + detail pages implemented.
- [x] Navigation limited to five entry links.
- [x] Sample content seed file prepared (`sanity/seed/sample-data.ndjson`).

### M2 — Gallery (Done)
- [x] Gallery card styles in list pages.
- [x] Champions gallery grid.
- [x] Country/Region/Creature gallery grids.
- [x] Home page as visual hall with five entrance blocks.
- [x] Champions filters (country/region).
- [x] Creature category filters (animal/plant/element).

### M3 — The Web (Done)
- [x] Unified bottom recommendations on detail pages.
- [x] Rich text rendering with inline links inside stories/bios.
- [x] Mixed-type automatic recommendations (internal links + fallbacks).

### M4 — Detail Layout (Done)
- [x] Detail pages exist for all five types with large visual + info areas.
- [x] Mobile layout optimization across detail + list pages + header/footer.

### M5 — Release (In Progress)
- [x] Dynamic sitemap for five content types.
- [x] Basic metadata (title/description).
- [x] Sitemap baseUrl reads deployment env vars.
- [ ] OG/Twitter images.
