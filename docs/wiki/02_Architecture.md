# 架构与数据流

## 分层结构
```
浏览器 (SSG/SSR 渲染页面)
        │
        ▼
Vercel Edge (缓存 / 中间件 / 重定向)
        │
        ├─ Next.js App Router (页面与 API)
        ├─ ISR 缓存与重验证
        │
        ├─ Sanity (内容与媒体)
        ├─ Supabase (用户与业务数据)
        ├─ Resend (邮件服务)
        └─ 第三方 API (支付/分析等)
```

## 核心职责
- **Next.js**：页面渲染、API 路由、SEO 输出、缓存策略
- **Sanity**：内容管理、预览、媒体管理
- **Supabase**：用户认证、用户表、业务表（订单、订阅）
- **Vercel**：部署、Edge 缓存、预览环境
- **Resend**：表单通知、订阅邮件

## 关键数据流
### 1) 页面访问（SSR/SSG）
1. 用户请求页面
2. Vercel Edge 命中缓存或转发至 Next.js
3. Next.js 读取 Sanity（内容）与 Supabase（用户状态）
4. 返回 HTML + 元数据

### 2) 内容更新（ISR）
1. Sanity 内容发布
2. Webhook 调用 `/api/webhooks/sanity`
3. 验签成功后触发 `revalidatePath` 或 `revalidateTag`
4. 页面在下次访问时更新

### 3) 联系表单
1. 用户提交表单
2. `/api/contact` 验证与限流
3. 触发 Resend 发送邮件

### 4) 用户鉴权
1. 客户端调用 Supabase Auth
2. Next.js 读取 session/cookie
3. `(dashboard)` 路由强制鉴权

## 缓存与重验证策略
- 静态页面：默认 SSG
- 动态内容：ISR（短期缓存 + Webhook 重验证）
- 用户敏感页：SSR 或 Server Actions
