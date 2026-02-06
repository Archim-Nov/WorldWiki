# 内容填充指南（创作者友好版）

这份指南面向内容编辑与策划，目标是快速产出可展示的高质量条目。

## 登录与权限
要在线创作/修改内容，需要具备 Sanity Studio 的访问权限（管理员或编辑）。
用户分级说明见：`docs/USER_ROLES.md`。

### 在线登录（推荐）
1. 打开项目的 Studio 地址：`https://你的域名/studio`
2. 点击右上角登录按钮，选择分配给你的登录方式（邮箱/SSO）
3. 登录成功后即可看到内容列表

### 本地登录（开发环境）
1. 在本地启动站点：`npm run dev`
2. 打开：`http://localhost:3000/studio`
3. 使用同一账号登录

> 如果看不到 Studio 或无法登录，请联系管理员确认账号权限或项目 ID。

## 在线创作与修改流程
1. 在左侧导航选择内容类型（Country / Region / Hero / Creature / Story）
2. 点击 **Create new** 新建条目，或打开现有条目进行编辑
3. 按下面字段说明填写内容并上传图片
4. 点击 **Publish** 发布（未发布内容仅你可见）
5. 若需要修改，直接编辑并再次 **Publish** 覆盖更新

## 推荐流程（内容建构顺序）
1. 先建 `country`
2. 再建 `region`
3. 再建 `hero` / `creature`
4. 最后写 `story`

这样可以保证引用关系与推荐逻辑更完整。

## 字段说明（按类型）

### Country（国家）
字段清单：
```text
name*             名称（必填）
slug*             路径标识（必填）
mapImage          地图/场景图（推荐）
summary           简短概述（推荐）
featuredRegions   精选地区（可选）
```
说明：
- `featuredRegions` 留空时会自动展示该国家下的地区。

### Region（地区）
字段清单：
```text
name*             名称（必填）
slug*             路径标识（必填）
mapImage          地图/场景图（推荐）
summary           简短概述（推荐）
country           归属国家（推荐）
featuredHeroes    精选英雄（可选）
```
说明：
- `featuredHeroes` 留空时会自动展示属于该地区的英雄。

### Hero（英雄）
字段清单：
```text
name*             名称（必填）
slug*             路径标识（必填）
title             称号（可选）
portrait          画像（推荐）
region            所属地区（推荐）
country           所属国家（推荐）
roles             职业/职责（可选）
faction           阵营/组织（可选）
bio               传记正文（推荐）
relatedHeroes     相关英雄（可选）
```
说明：
- `relatedHeroes` 为空时，会基于同阵营/同地区自动补位。
- 任何故事中引用该英雄，都会自动出现在英雄详情页的相关推荐里。

### Creature（生物）
字段清单：
```text
name*             名称（必填）
slug*             路径标识（必填）
portrait          画像（推荐）
species           生物学种类（推荐）
category          分类（推荐）
region            所属地区（推荐）
country           所属国家（推荐）
bio               生态描述（推荐）
relatedStories    相关故事（可选）
```
分类取值：
```text
animal / plant / element
```
说明：
- `relatedStories` 为空时，会基于引用该生物的故事自动补位。

### Story（故事）
字段清单：
```text
title*            标题（必填）
slug*             路径标识（必填）
coverImage        封面图（推荐）
content           正文（推荐）
relatedHeroes     相关英雄（可选）
relatedRegions    相关地区（可选）
relatedCreatures  相关生物（可选）
```
说明：
- 相关推荐不足 3 条时，会使用正文内链与地区/生物/英雄等自动补位。

## 图片建议
- Story 封面：宽图（16:9 或 3:2），主体居中
- Hero/Creature 画像：竖图（4:5 或 3:4），适合人物/生物特写
- Country/Region 地图：宽图（16:9 或 3:2），以地形或场景为主

## 富文本与内链
在 `bio` / `content` 中选中文字后可添加：
- `Internal Link`：指向其他条目（country / region / hero / creature / story）
- `External Link`：指向外部 URL

内链不仅用于阅读跳转，也会参与“相关推荐”的自动补位。

## 推荐字数（建议值）
- `summary`：50–120 字
- `hero.bio` / `creature.bio`：200–600 字
- `story.content`：1000 字以上

## 发布前检查清单
- 必填字段完整（`name/title` + `slug`）
- 图片已上传（特别是封面/画像）
- 地区/国家引用一致
- 生物已填写 `category`
- 相关推荐至少 1–3 条（可手动也可依赖自动兜底）

## 常见问题
**Q: 不想手动维护相关推荐可以吗？**  
可以，系统会根据关联与内链自动补位到 3 条，保持页面完整。

**Q: 分类值要填中文吗？**  
不需要，填写 `animal` / `plant` / `element` 即可，页面会自动显示中文标签。
