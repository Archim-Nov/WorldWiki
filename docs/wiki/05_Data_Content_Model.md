# 内容与数据模型

## Sanity Schema（内容层）
### 1) page
- `title` (string)
- `slug` (slug)
- `content` (portable text)
- `seo` (object: title/description/image)

### 2) post
- `title`
- `slug`
- `excerpt`
- `coverImage`
- `content`
- `publishedAt`
- `updatedAt`
- `author`
- `tags`

### 3) product
- `title`
- `slug`
- `price`
- `features`
- `cta`
- `seo`

## Supabase 数据模型（用户层）
### 必备表
- `profiles`：`id (uuid)`、`email`、`name`、`avatar_url`
- `subscriptions`：`id`、`user_id`、`status`、`plan`、`current_period_end`
- `orders`：`id`、`user_id`、`amount`、`status`、`created_at`

### 关系与原则
- **用户主键**以 Supabase Auth 的 `user.id` 为唯一来源
- 内容与用户关联时，使用 `user_id` 作为外键
- CMS 内容不直接存敏感用户数据

## Row Level Security (RLS) 策略
**重要**：所有用户相关表必须启用 RLS，否则数据将对所有人可见。

### profiles 表
```sql
-- 启用 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 用户只能读取自己的 profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- 用户只能更新自己的 profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

### subscriptions 表
```sql
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);
```

### orders 表
```sql
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);
```

### RLS 检查清单
- [ ] 所有用户表已启用 RLS
- [ ] 每张表至少有 SELECT 策略
- [ ] 写操作（INSERT/UPDATE/DELETE）策略已审核
- [ ] Service Role Key 仅在服务端使用，永不暴露给客户端

## 数据读取分层
- `lib/sanity/*`：只处理内容读取
- `lib/supabase/*`：只处理用户与业务数据
- 页面层只做数据拼装，不写复杂逻辑

## 版本与迁移策略
- Supabase 迁移脚本必须版本化
- CMS Schema 变更需记录在变更日志

## TypeScript 类型安全

### Sanity 类型生成
使用 `sanity-typegen` 从 Schema 自动生成 TypeScript 类型。

**安装与配置**：
```bash
npm install -D @sanity/codegen
```

**package.json 脚本**：
```json
{
  "scripts": {
    "typegen": "sanity schema extract && sanity typegen generate"
  }
}
```

**sanity.config.ts 配置**：
```ts
// 在 sanity 目录下创建 sanity.cli.ts
import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  },
  codegen: {
    outputPath: './types/sanity.types.ts',
  },
})
```

**使用示例**：
```ts
import type { Post, Page } from '@/types/sanity.types'

async function getPost(slug: string): Promise<Post | null> {
  return client.fetch(postQuery, { slug })
}
```

### Supabase 类型生成
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/supabase.types.ts
```

**使用示例**：
```ts
import { Database } from '@/types/supabase.types'

type Profile = Database['public']['Tables']['profiles']['Row']
```

### 类型安全检查清单
- [ ] Sanity 类型已生成并导入
- [ ] Supabase 类型已生成并导入
- [ ] GROQ 查询返回值有明确类型
- [ ] API 路由请求/响应有类型定义
