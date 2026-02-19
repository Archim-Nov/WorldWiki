# SEO 与性能基线

## SEO 必做清单
- Metadata 完整（title/description/OG）
- Sitemap（动态生成）
- Canonical URL
- 语义化 HTML 结构

## SSG / ISR 策略
- **静态页**：营销页面默认 SSG
- **内容页**：六类内容（国家/区域/生物/英雄/魔法/故事）走 ISR
- **用户页**：Dashboard SSR

## 性能基线
- 首屏 LCP < 2.5s
- TTFB < 0.8s（SSR 页）
- CLS < 0.1

## 图片与媒体优化
- 使用 Next.js `next/image`
- 图片 CDN + 自动压缩
- 统一媒体比例（避免 CLS）

## 预加载与缓存
- 关键字体 preload
- ISR 依赖 Webhook 触发
- Edge 缓存优先
