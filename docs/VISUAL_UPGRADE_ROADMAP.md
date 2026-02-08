# Visual Upgrade Roadmap

基于 LOL Universe / Dota 2 Wiki 的对标分析，按影响力排序的视觉升级路线图。

---

## 当前进度

| 编号 | 改动 | 状态 |
|------|------|------|
| 1 | 详情页 Hero 改造 | **已完成** — Stories 保留全屏+滚动渐隐；其余 4 类改为 2/3 屏 Hero + 底部渐变过渡 |
| 2 | 区域视觉身份系统 | **已完成** — Sanity schema 增加 themeColor，详情页注入 `--theme-hue` CSS 变量 |
| 3 | 列表页卡片悬停增强 | **已完成** — 图片放大 1.06、默认去饱和、悬停恢复、400ms 缓动 |
| 4 | 大气氛围层 | **已完成** — 噪点纹理覆盖、首页呼吸动画、ambient keyframes |
| 5 | 故事沉浸式阅读 | **已完成** — 正文 680px 窄栏、行高 2.0、增强 drop cap、图片全幅出血 |
| 6 | Header 滚动隐藏 | **已完成** — ScrollHeader 客户端组件、向下隐藏向上滑出 |
| 7 | 页面过渡动画 | **已完成** — fadeIn 入场动画、loading.tsx 骨架屏 |

---

## 优先级总览

| 优先级 | 改动 | 理由 |
|--------|------|------|
| P0 | 详情页 Hero 改造 | 视觉冲击力提升最大，改动集中 |
| P0 | 列表页卡片悬停增强 | 改动小，效果明显 |
| P1 | 区域视觉身份系统 | 差异化体验的核心 |
| P1 | 大气氛围层 | 纯 CSS 可实现，提升质感 |
| P2 | 故事沉浸式阅读 | 内容体验升级 |
| P2 | Header 滚动隐藏 | 小改动，减少干扰 |
| P3 | 页面过渡动画 | 锦上添花 |

---

## 1. 详情页 Hero 改造 [P0] — 已完成

### 差距分析

当前英雄详情页用 112px 圆形头像 + 三栏布局，更像资料卡片。LOL Universe 的角色页是全屏立绘 + 大气背景 + 角色名压在画面上，进入瞬间就有沉浸感。

### 迭代历史

**第一轮：全屏 Hero + 滚动渐隐**
- 创建通用 `DetailHeroFade` 组件（`components/marketing/DetailHeroFade.tsx`）
- 5 类详情页统一升级为全屏 Hero + 居中标题 + 滚动渐隐
- 删除旧的 `StoryHeroFade` 组件

**第二轮：差异化调整（解决审美疲劳）**
- 问题：5 类页面全部全屏 + 居中 + 渐隐，重复感过强
- 方案：Stories 保留全屏沉浸体验；其余 4 类改为 2/3 屏 Hero
- 改动要点：
  - 高度 `100svh` → `66svh`（2/3 屏幕）
  - 内容对齐：居中 → 底部对齐（`flex-end`）
  - 渐变：暗色遮罩 → `transparent → rgba(0,0,0,0.18) → var(--background)` 平滑过渡到正文
  - 移除 `DetailHeroFade` 组件（4 类页面不再需要滚动渐隐）
  - 移除 `grayscale` / `brightness` 滤镜和 `opacity` CSS 变量绑定

### 当前状态

| 类型 | Hero 高度 | 滚动渐隐 | 内容对齐 | 背景图 | 标签 |
|------|----------|----------|---------|--------|------|
| Champion | 66svh | 无 | 底部 | `portrait` | "Champion Archive" |
| Country | 66svh | 无 | 底部 | `mapImage` | "Country Atlas" |
| Region | 66svh | 无 | 底部 | `mapImage` | "Region Stage" |
| Creature | 66svh | 无 | 底部 | `portrait` | "Specimen Sheet" |
| Story | 100svh | `DetailHeroFade` | 居中 | `coverImage` | "Short Story" |

### 改动文件

1. `components/marketing/DetailHeroFade.tsx` — 新建（仅 Stories 使用）
2. `components/marketing/StoryHeroFade.tsx` — 删除
3. `app/(marketing)/stories/[slug]/page.tsx` — 替换引用为 DetailHeroFade
4. `app/(marketing)/champions/[slug]/page.tsx` — 2/3 屏 Hero，移除 DetailHeroFade
5. `app/(marketing)/champions/[slug]/hero-detail.css` — 2/3 屏 Hero 样式 + bio modal 样式
6. `app/(marketing)/countries/[slug]/page.tsx` — 2/3 屏 Hero，移除 DetailHeroFade
7. `app/(marketing)/countries/[slug]/country-detail.css` — 2/3 屏 Hero 样式
8. `app/(marketing)/regions/[slug]/page.tsx` — 2/3 屏 Hero，移除 DetailHeroFade
9. `app/(marketing)/regions/[slug]/region-detail.css` — 2/3 屏 Hero 样式
10. `app/(marketing)/creatures/[slug]/page.tsx` — 2/3 屏 Hero，移除 DetailHeroFade
11. `app/(marketing)/creatures/[slug]/creature-detail.css` — 2/3 屏 Hero 样式

---

## 2. 区域视觉身份系统 [P1] — 已完成

### 差距分析

已有 section-specific 颜色（countries=金、regions=橙、creatures=青），但 LOL Universe 的每个地区有完全不同的视觉氛围——德玛西亚是蓝金石质感，诺克萨斯是暗红铁锈，艾欧尼亚是翠绿水墨。

### 建议方案

- 每个国家/区域在 Sanity 中增加 `themeColor` 和可选的 `backgroundTexture` 字段
- 进入该国家/区域的详情页时，页面背景色、光晕色、边框色都跟随主题
- 属于该国家的英雄/生物详情页也继承这套视觉
- 用户在不同区域间切换时，能明显感受到"进入了另一个世界"

### 涉及改动

- Sanity schema: `country.ts` / `region.ts` 增加 `themeColor`、`backgroundTexture` 字段
- GROQ 查询: 各详情页查询需 join 国家/区域的主题色
- CSS: 详情页根元素通过 `style` 注入 `--theme-hue` 等 CSS 变量
- 英雄/生物详情页: 从关联的 region/country 继承主题色

---

## 3. 列表页卡片悬停增强 [P0] — 已完成

### 差距分析

当前列表页是标准卡片网格，悬停效果仅 `scale(1.02)`。LOL Universe 的角色选择界面有悬停时角色放大、背景变色、粒子飘散的效果，每张卡片都像一个小舞台。

### 建议方案

- 卡片悬停时图片放大幅度加大（当前 1.02 → 建议 1.06-1.08）
- 悬停时卡片底部加一层该角色所属区域的主题色光晕
- 卡片默认略微 desaturate，悬停时恢复饱和度（聚焦效果）
- 英雄列表考虑用竖版立绘卡片（4:5 或 3:4），而非方形

### 涉及改动

- 各列表页 CSS / Tailwind 类调整
- 卡片组件的 hover 状态增强
- 可选：卡片底部光晕需要 CSS `box-shadow` 或 `::after` 伪元素

---

## 4. 大气氛围层 [P1] — 已完成

### 差距分析

LOL Universe 页面背景不是纯色，而是有微妙的粒子、雾气、光斑在缓慢移动。这是"高级感"的重要来源。

### 建议方案（轻量实现）

- 用 CSS `radial-gradient` + `animation` 做缓慢移动的光斑（不需要 canvas）
- 详情页背景加一层极低透明度的噪点纹理（`background-image: url(noise.svg)`）
- 首页 Hero 区域加微弱的渐变色呼吸动画
- 不需要 WebGL 或 canvas，纯 CSS 就能做到 80% 的效果

### 涉及改动

- 新增 `public/textures/noise.svg` 噪点纹理
- 全局或详情页 CSS 增加氛围层样式
- 首页 Hero 区域增加呼吸动画 `@keyframes`

---

## 5. 故事沉浸式阅读 [P2] — 已完成

### 差距分析

当前故事页和其他详情页结构类似。LOL Universe 的故事页是沉浸式阅读——窄栏正文、大留白、章节间插入全幅插图、背景随内容变化。

### 建议方案

- 故事正文区域限制最大宽度（~680px），居中，加大行高（1.8-2.0）
- 富文本中的图片渲染为全幅出血（break out of container）
- 正文首字母 drop cap 保留（已有），加强效果
- 背景可以根据故事关联的区域切换主题色

### 涉及改动

- `story-detail.css` 正文区域样式调整
- `PortableContent` 组件中图片渲染逻辑（全幅出血）
- 可选：故事页背景色跟随关联区域主题

---

## 6. Header 滚动隐藏 [P2] — 已完成

### 差距分析

当前 Header 是标准的 sticky 导航栏，始终占据顶部空间。LOL Universe 的导航在浏览内容时几乎消失，只在需要时出现。

### 建议方案

- 向下滚动时 Header 自动隐藏，向上滚动时滑出
- 或者：滚动后 Header 缩小为更紧凑的版本（降低高度、缩小 logo）
- 详情页的全屏 Hero 区域内，Header 用全透明背景，与画面融为一体

### 涉及改动

- Header 组件增加滚动方向检测逻辑（客户端组件）
- Header CSS 增加 `transform: translateY(-100%)` 隐藏动画
- 可选：详情页 Hero 区域内 Header 透明模式

---

## 7. 页面过渡动画 [P3] — 已完成

### 差距分析

当前页面切换是硬切。LOL Universe 在页面间有淡入淡出或滑动过渡。

### 建议方案

- 用 Next.js 的 `loading.tsx` + CSS animation 做简单的淡入效果
- 或用 View Transitions API（现代浏览器已支持）做跨页面过渡
- 最简单的：给 main content 区域加一个 `@keyframes fadeIn` 入场动画

### 涉及改动

- 各路由组增加 `loading.tsx` 骨架屏/淡入
- 全局 CSS 增加 `@keyframes fadeIn` 动画
- 可选：探索 View Transitions API 集成
