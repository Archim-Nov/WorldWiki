# 执行计划 + Checklist

## 分阶段计划（可执行）
### Phase 1：初始化
- 初始化 Next.js 项目
- Sanity Studio 初始化
- shadcn/ui 初始化
- Supabase SDK 安装

### Phase 2：内容系统
- Schema 与查询
- 博客/营销页面
- SEO Metadata

### Phase 3：用户系统
- Supabase Auth
- Dashboard 路由保护
- 用户资料页

### Phase 4：运营功能
- 联系表单（Resend）
- Newsletter
- Webhook ISR

### Phase 5：上线准备
- 预览环境
- 分析接入
- 监控与验收

---

## 任务拆分清单（细粒度）
- [ ] 初始化 `app/` 结构
- [ ] 添加 `components/layout/`（Header/Footer/Nav）
- [ ] 添加 `components/marketing/`（Hero/CTA）
- [ ] 添加 `components/blog/`（PostCard/PostBody）
- [ ] Sanity Schema：page/post/product
- [ ] GROQ 查询写入 `lib/sanity/queries.ts`
- [ ] Supabase `profiles` 表
- [ ] Auth 页面（登录/注册）
- [ ] Dashboard 鉴权包装
- [ ] `app/api/contact/route.ts`
- [ ] `app/api/newsletter/route.ts`
- [ ] `app/api/webhooks/sanity/route.ts`
- [ ] Sitemap 生成
- [ ] Metadata + Open Graph

---

## Plan Checklist（功能清单）
| 模块 | 功能项 | 验收标准 | 状态 |
|---|---|---|---|
| 基础 | 项目可运行 | `npm run dev` 正常启动 | ☐ |
| 内容 | Studio 可访问 | Sanity 正常加载 | ☐ |
| 内容 | Schema 完整 | page/post/product 已定义 | ☐ |
| 页面 | 首页/关于/定价 | 可访问 | ☐ |
| 页面 | 博客列表/详情 | slug 路由正常 | ☐ |
| SEO | Metadata | 标题/描述正确 | ☐ |
| SEO | Sitemap | 可访问并含动态条目 | ☐ |
| 鉴权 | Auth | 登录/注册可用 | ☐ |
| 鉴权 | Dashboard | 未登录不可访问 | ☐ |
| API | Contact | 邮件发送成功 | ☐ |
| API | Newsletter | 订阅成功 | ☐ |
| Webhook | ISR | 发布后可更新 | ☐ |
| 发布 | 预览环境 | Vercel Preview 正常 | ☐ |
| 发布 | 生产环境 | 域名访问正常 | ☐ |
