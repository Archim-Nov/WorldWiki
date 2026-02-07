# 项目目录结构与边界

## 目录结构（标准）
```
WorldWiki/
├── app/
│   ├── (marketing)/
│   ├── (auth)/
│   ├── (dashboard)/
│   ├── api/
│   ├── layout.tsx
│   ├── globals.css
│   └── sitemap.ts
├── components/
├── lib/
├── sanity/
├── public/
├── docs/
├── scripts/
├── types/
├── .env.local
└── package.json
```

## 目录边界规则
- `app/`：路由与页面，只做数据拼装与渲染
- `components/`：UI 组件，不含数据读取
- `lib/`：数据访问、工具函数
- `sanity/`：CMS 配置与 Schema
- `public/`：静态资源

## 命名规范
- 路由目录：语义化命名，避免缩写
- 组件：`PascalCase` 文件名
- 工具函数：`camelCase`

## 文件职责示例
| 文件 | 责任 |
|---|---|
| `lib/sanity/client.ts` | Sanity 客户端 |
| `lib/sanity/queries.ts` | GROQ 查询 |
| `app/(marketing)/countries/[slug]/page.tsx` | 国家详情渲染 |
| `app/api/contact/route.ts` | 联系表单 API |
| `app/error.tsx` | 全局错误边界 |
| `app/loading.tsx` | 全局加载状态 |
| `app/not-found.tsx` | 404 页面 |

## 错误处理规范

### 必备文件
```
app/
├── error.tsx          # 全局错误边界（客户端组件）
├── loading.tsx        # 全局 Suspense fallback
├── not-found.tsx      # 404 页面
├── (marketing)/
│   ├── error.tsx      # 营销页错误边界（可选）
│   └── loading.tsx    # 营销页加载状态
└── (dashboard)/
    ├── error.tsx      # Dashboard 错误边界
    └── loading.tsx    # Dashboard 加载状态
```

### error.tsx 模板
```tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <h2>出错了</h2>
      <button onClick={() => reset()}>重试</button>
    </div>
  )
}
```

### loading.tsx 模板
```tsx
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent" />
    </div>
  )
}
```

### 错误处理原则
- **error.tsx 必须是客户端组件**（`'use client'`）
- **生产环境不暴露错误详情**，仅显示友好提示
- **开发环境可显示完整错误栈**用于调试
- **API 路由统一返回格式**：`{ error: string, code?: string }`
