# AI 协作规范

## 安全区（AI 可直接修改）
| 区域 | 允许范围 | 约束 |
|---|---|---|
| UI 组件 | `components/` | 遵循现有设计 Token |
| 样式 | Tailwind 类名 | 不新增全局 CSS |
| GROQ 查询 | `lib/sanity/queries.ts` | 必须可复用 |
| 文案 | marketing 页面草稿 | 上线前人工审核 |

## 敏感区（AI 仅提议）
| 区域 | 风险 | 处理 |
|---|---|---|
| 鉴权 | 安全漏洞 | 必须人工审核 |
| 数据库 | 数据损坏 | 迁移脚本版本化 |
| Webhook | 伪造 | 必须签名校验 |
| 支付 | 资金风险 | 人工操作 |

## 代码审查要点
- 不引入第二套 Auth
- 不修改 `.env` 或暴露密钥
- API 必须限流与输入校验
- ISR 必须有签名校验

## AI 提示词模板（简化）
```
目标：在 components/marketing 下生成 Hero 组件
约束：必须使用 Tailwind，复用现有 Button 组件
输出：仅提供 TSX 文件内容
```
