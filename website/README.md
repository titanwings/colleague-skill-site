# colleague-skill 官方网站

基于 Astro + Tailwind CSS 构建，部署在 GitHub Pages。

## 本地开发

```bash
cd website
npm install
npm run dev
# 访问 http://localhost:4321/colleague-skill/
```

## 构建

```bash
npm run build
# 输出到 dist/
```

## 贡献 Skill 到 Gallery

### 方式一：提 Issue（推荐给非技术用户）

直接填这个 [Issue 模板](https://github.com/titanwings/colleague-skill-site/issues/new?template=submit-skill.yml)，维护者会帮你转成 YAML 提交。

### 方式二：直接提 PR（推荐给开发者）

1. Fork 仓库
2. 复制 `src/content/skills/_template.yaml`，改名为你的 slug（例如 `my-colleague.yaml`）
3. 填好字段（参考模板注释）
4. 提 PR，CI 会自动验证格式

**YAML 字段说明：**

| 字段 | 必填 | 说明 |
|------|------|------|
| `name` | ✅ | Skill 名称，中文/英文都行 |
| `slug` | ✅ | 唯一标识符，只能用小写字母、数字、连字符 |
| `author.name` | ✅ | 你的名字 |
| `author.github` | ✅ | 你的 GitHub 用户名 |
| `description` | ✅ | 一段话描述这个同事能做什么 |
| `tags` | ✅ | 从预设列表选，可多选 |
| `personality` | ❌ | 性格标签，3个以内 |
| `company_culture` | ❌ | 企业文化风格 |
| `level` | ❌ | 职级描述 |
| `preview_conversation` | ❌ | 预览对话（强烈建议填） |
| `created_at` | ✅ | 格式 YYYY-MM-DD |
| `skill_repo` | ❌ | 你的 skill 文件所在仓库 |

## 目录结构

```
website/
├── src/
│   ├── content/skills/   # 社区 Skill 数据（YAML）
│   ├── components/       # Astro 组件
│   ├── pages/            # 页面路由
│   ├── layouts/          # 布局组件
│   ├── lib/              # 工具函数
│   └── types/            # TypeScript 类型
├── public/               # 静态资源
└── .github/              # CI/CD 和模板
```

## 部署

推送到 `main` 分支的 `website/` 目录变更会自动触发 GitHub Pages 部署。

需要在仓库 Settings → Pages 中：
- Source: GitHub Actions
