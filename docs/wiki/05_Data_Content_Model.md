# 内容与数据模型

## Sanity Schema（内容层）
### 1) country
- `name` (string)
- `slug` (slug)
- `mapImage` (image)
- `summary` (text)
- `featuredRegions` (array of references → region)

### 2) region
- `name` (string)
- `slug` (slug)
- `mapImage` (image)
- `summary` (text)
- `country` (reference → country)
- `featuredHeroes` (array of references → hero)

### 3) hero
- `name` (string)
- `slug` (slug)
- `title` (string)
- `portrait` (image)
- `region` (reference → region)
- `country` (reference → country)
- `roles` (array of string)
- `faction` (string)
- `bio` (portable text)
- `relatedHeroes` (array of references → hero)

### 4) creature
- `name` (string)
- `slug` (slug)
- `portrait` (image)
- `species` (string)
- `category` (string: animal / plant / element)
- `region` (reference → region)
- `country` (reference → country)
- `bio` (portable text)
- `relatedStories` (array of references → story)

### 5) story
- `title` (string)
- `slug` (slug)
- `coverImage` (image)
- `content` (portable text)
- `relatedHeroes` (array of references → hero)
- `relatedRegions` (array of references → region)
- `relatedCreatures` (array of references → creature)

## Supabase 数据模型（用户层）
### 必备表
- `profiles`：`id (uuid)`、`email`、`name`、`avatar_url`、`role`

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

### subscriptions 表（预留）
```sql
-- 未来扩展时启用
```

### orders 表（预留）
```sql
-- 未来扩展时启用
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
import type { Hero, Country } from '@/types/sanity.types'

async function getHero(slug: string): Promise<Hero | null> {
  return client.fetch(heroQuery, { slug })
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
