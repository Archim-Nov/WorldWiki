# 运维与安全

## 环境与发布
- **dev**：本地开发
- **preview**：PR 预览（Vercel）
- **prod**：线上环境

### 必须区分的环境变量
- `SANITY_PROJECT_ID`
- `SANITY_DATASET`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `RESEND_API_KEY`

## 监控与可观测
- 性能：Vercel Speed Insights 或 Lighthouse
- 错误：Sentry 或 Vercel Error Monitoring
- 分析：Plausible

## 安全基线
- Webhook 签名校验
- API 限流（基础 rate limit）
- CSP 与安全头（最小集）
- 不在客户端暴露敏感密钥

## 备份与恢复
- Sanity 自带历史版本
- Supabase 定期备份

## 运营维护节奏
- 每月依赖更新审查
- 每季度内容与 SEO 复盘
