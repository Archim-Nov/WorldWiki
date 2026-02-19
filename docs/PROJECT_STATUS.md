# Museum Universe — 项目总览与状态

定位：**博物馆宇宙 / 优美的游戏网状 wiki**。核心目标是让用户沉浸式探索世界，而不是指引流量的商业页面。

最后更新：2026-02-19

---

## 一、体验原则

- 视觉入口优先：用画廊与大图块引导探索
- 网状连接优先：内链与相关推荐替代目录与搜索
- 轻导航：仅 6 个入口 + 返回

明确不做：树形目录、面包屑、营销落地页（搜索仅作辅助入口）。

---

## 二、信息架构（6 个入口）

| 入口 | 路由 | 说明 |
|---|---|---|
| 国家 Countries | `/countries` | 国家列表 + 详情 |
| 区域 Regions | `/regions` | 区域列表 + 详情 |
| 生物 Creatures | `/creatures` | 生物画廊 + 分类筛选 |
| 英雄 Champions | `/champions` | 英雄画廊 + 国家/区域筛选 |
| 魔法 Magics | `/magics` | 原理/法术列表 + 详情 |
| 故事 Stories | `/stories` | 故事列表 + 详情 |

内容模型核心实体：`country / region / creature / hero / story / magic`，以"关联关系"组织内容，而非层级分类。

---

## 三、技术栈

- **框架**：Next.js App Router（SSR/SSG/ISR）
- **内容管理**：Sanity（Studio 嵌入 `/studio`）
- **认证与数据**：Supabase Auth + DB
- **样式**：Tailwind CSS
- **部署**：Vercel（全托管）
- **邮件**：Resend（联系表单）

---

## 四、里程碑完成状态

### M1 — 内容模型与基础骨架 ✅

- [x] Sanity schema 替换为 country/region/creature/hero/story/magic
- [x] 移除旧 post/page schema
- [x] 六入口路由骨架 + 详情页 `/[slug]`
- [x] 导航切换为六入口
- [x] 样例内容种子数据（`sanity/seed/sample-data.ndjson`）

### M2 — 画廊体验与视觉入口 ✅

- [x] 统一画廊卡片规范
- [x] 英雄画廊网格 + 筛选器（国家/区域标签）
- [x] 生物画廊 + 分类筛选（动物/植物/元素）
- [x] 区域/国家/生物画廊基础网格
- [x] 首页改为"视觉大厅"：六入口大图块

### M3 — 网状连接与关联探索 ✅

- [x] 详情页底部"相关推荐"模块（统一样式）
- [x] 富文本内链渲染（传记/故事）
- [x] 混合类型自动推荐（内链 + 兜底关联）

### M4 — 详情页形态统一 ✅

- [x] 六类详情页各有差异化布局
- [x] 移动端适配与阅读排版优化（详情页 + 列表页 + Header/Footer）

### M5 — 轻量 SEO 与发布准备 ✅

- [x] 动态 Sitemap 覆盖六类内容
- [x] 基础 metadata（title/description）
- [x] baseUrl 读取部署环境变量
- [x] robots.txt（`app/robots.ts`）
- [x] OG/Twitter 图片（`/opengraph-image`、`/twitter-image`）

---

## 五、已实现的附加功能

### 用户系统
- [x] Supabase Auth 集成（登录/注册）
- [x] 登录页 `/login`、注册页 `/register`
- [x] Dashboard 页面 `/dashboard`（已登录用户）
- [x] 基于 profiles 的角色访问控制（Studio 权限）
- [x] Header 登录状态动态显示（`UserNav` 组件）
  - 未登录：显示"登录"链接
  - 已登录：显示用户首字母圆形图标 → `/dashboard`
  - 实时监听 `onAuthStateChange`

### 内容运营
- [x] Sanity Studio 嵌入（`/studio`）
- [x] 长详情样例种子脚本（25 条，每类 5 条）
- [x] 内容填充指南（`docs/CONTENT_GUIDE.md`）
- [x] Sanity Webhook ISR（`/api/webhooks/sanity`）
- [x] 数组键修复脚本（`scripts/`）

### API
- [x] 联系表单 `/api/contact`
- [x] Newsletter 订阅 `/api/newsletter`

---

## 六、设计验收清单

### 全局体验
- [ ] 视觉基调一致（浅色、克制、自然质感）
- [ ] 页面间差异化明确（布局/节奏/图像比例）
- [ ] 404/空态/加载态有清晰反馈

### 响应式与可读性
- [ ] 手机端首屏信息完整（360px 宽度可读）
- [ ] 文本行宽与行距舒适（正文 1.6–1.9 行高）
- [ ] 卡片与网格在 2/3/4 列断点下稳定

### 详情页视觉
- [ ] Hero/Creature 以画像为主视觉
- [ ] Country/Region 以地图或场景为主视觉
- [ ] Magic 以封面与元数据卡片为主视觉
- [ ] Story 以封面为主视觉
- [ ] 底部"相关推荐"统一样式且展示 3 项

### 动效与一致性
- [ ] 轮播滑动方向明确，视觉差异明显
- [ ] 色彩/边框/圆角/阴影统一
- [ ] 图片裁切比例一致

### 发布前检查
- [ ] 视觉回归：移动端 + 桌面端各 1 次
- [ ] 关键入口可达：登录、Dashboard、Studio
- [ ] 数据完整：每类至少 1 条可展示内容

---

## 七、剩余工作

| 项目 | 说明 | 优先级 |
|---|---|---|
| 无（M5 已完成） | 下一阶段重点转向体验验收与测试补盲 | - |

---

## 八、文档索引

| 文件 | 用途 |
|---|---|
| `docs/CONTENT_GUIDE.md` | 内容创作者填充指南 |
| `docs/SAMPLE_CONTENT.md` | 长详情样例索引（ID + slug） |
| `docs/USER_ROLES.md` | 用户分级与权限矩阵 |
| `docs/AI_SITEMAP.md` | AI 协作站点地图 |
| `docs/wiki/01-07, 09` | 基线架构规格（目标/架构/技术栈/数据模型/SEO/AI 流程/运维） |

---

## 九、审核自检

- 是否能"无目标地逛"并发现新内容？
- 是否像画册/展馆，而不是促销页？
- 是否每页都有自然的 2–3 个探索出口？
