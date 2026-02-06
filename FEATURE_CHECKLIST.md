# Museum Universe 整体计划（Overview）

定位：**博物馆宇宙 / 优美的游戏网状 wiki**。核心目标是让用户沉浸式探索世界，而不是指引流量的商业页面。

---

## 一、体验原则
- 视觉入口优先：用画廊与大图块引导探索
- 网状连接优先：内链与相关推荐替代目录与搜索
- 轻导航：仅 5 个入口 + 返回

---

## 二、信息架构（5 个入口）
- 国家 Countries
- 区域 Regions
- 生物 Creatures
- 英雄 Champions
- 故事 Stories

明确不做：树形目录、搜索框、面包屑、营销落地页。

---

## 三、内容模型（核心实体）
- country / region / creature / hero / story
- 以“关联关系”组织内容，而非层级分类

---

## 四、MVP 范围（必须交付）
- 五入口的列表页与详情页
- 英雄画廊 + 基础筛选（国家/区域）
- 生物画廊 + 分类筛选（动物/植物/元素）
- 详情页内链 + 相关内容模块
- 基础 sitemap + metadata

---

## 五、里程碑计划
详见：`docs/roadmap/milestones.md`

---

## 六、审核自检
- 是否能“无目标地逛”并发现新内容？
- 是否像画册/展馆，而不是促销页？
- 是否每页都有自然的 2–3 个探索出口？

最后更新：2026-02-04

---

## Status Update (2026-02-04)
- [x] Five entry list pages + detail pages implemented (countries/regions/creatures/champions/stories).
- [x] Sanity schemas and GROQ queries for the five core entities.
- [x] Navigation limited to five entry points.
- [x] Home page uses five visual entrance blocks.
- [x] Gallery-style grids/cards for each entry type.
- [x] Champions filters by country/region (chips).
- [x] Creature category filters (animal/plant/element).
- [x] Rich text rendering + internal/external links for story/hero/creature.
- [x] Mixed-type recommendations + unified bottom grid on detail pages.
- [x] Mobile layout optimizations for detail + list pages + header/footer.
- [x] Dynamic sitemap with env-based baseUrl.
- [x] Seed data + demo stories prepared for quick verification.
- [ ] OG/Twitter images.
