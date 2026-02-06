# 内容填充指南（创作者友好版）

这份指南面向内容编辑与策划，目标是快速产出可展示的高质量条目。

## 推荐流程
1. 先建国家（Country）→ 再建地区（Region）→ 再建英雄/生物（Hero/Creature）→ 最后写故事（Story）。
2. 每条内容至少填完必填字段，配图后再补富文本与关联项。

## 字段说明（按类型）

### Country（国家）
- **必填**：`name`、`slug`
- **推荐**：`mapImage`（地图/场景图）、`summary`（2–4 句概述）
- **可选**：`featuredRegions`（手动精选地区）
- **自动兜底**：不填 `featuredRegions` 时，会自动展示该国家下的地区。

### Region（地区）
- **必填**：`name`、`slug`
- **推荐**：`mapImage`、`summary`、`country`（归属国家）
- **可选**：`featuredHeroes`（手动精选英雄）
- **自动兜底**：不填 `featuredHeroes` 时，会自动展示属于该地区的英雄。

### Hero（英雄）
- **必填**：`name`、`slug`
- **推荐**：`portrait`（竖图）、`region`、`country`、`bio`（富文本传记）
- **可选**：`title`、`faction`、`roles`
- **可选关联**：`relatedHeroes`
- **自动兜底**：未填 `relatedHeroes` 时，会基于**同阵营 / 同地区**自动补位。
- **自动关联故事**：故事中引用该英雄时会自动出现在英雄详情页的相关推荐里。

### Creature（生物）
- **必填**：`name`、`slug`
- **推荐**：`portrait`、`species`、`category`、`region`、`country`、`bio`
- **分类取值**：`animal` / `plant` / `element`（页面显示为“动物 / 植物 / 元素”）
- **可选关联**：`relatedStories`
- **自动兜底**：未填 `relatedStories` 时，会基于引用该生物的故事自动补位。

### Story（故事）
- **必填**：`title`、`slug`
- **推荐**：`coverImage`、`content`（富文本正文）
- **可选关联**：`relatedHeroes`、`relatedRegions`、`relatedCreatures`
- **自动兜底**：相关推荐不足 3 条时，会使用正文内链与地区/生物/英雄等自动补位。

## 图片建议
- **Story 封面**：宽图（16:9 或 3:2），主体居中。
- **Hero/Creature 画像**：竖图（4:5 或 3:4），适合人物/生物特写。
- **Country/Region 地图**：宽图（16:9 或 3:2），以地形或场景为主。

## 富文本与内链
在 `bio` / `content` 中选中文字后添加：
- **Internal Link**：指向其他条目（国家 / 地区 / 英雄 / 生物 / 故事）
- **External Link**：指向外部 URL

内链不仅用于阅读跳转，也会参与“相关推荐”的自动补位。

## 推荐字数（建议值）
- `summary`：50–120 字
- `hero.bio` / `creature.bio`：200–600 字
- `story.content`：1000 字以上

## 发布前检查清单
- 必填字段完整（name/title + slug）
- 图片已上传（特别是封面/画像）
- 地区/国家引用一致
- 生物已填写 `category`
- 相关推荐有 1–3 条（可手动也可依赖自动兜底）

## 常见问题
**Q: 不想手动维护相关推荐可以吗？**  
可以，系统会根据关联与内链自动补位到 3 条，保持页面完整。

**Q: 分类值要填中文吗？**  
不需要，填写 `animal` / `plant` / `element` 即可，页面会自动显示中文标签。
