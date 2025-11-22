# Line Chatbot System

一个整合 Line Messaging API 的智慧聊天机器人系统，包含 Webhook 式的 AI Bot 后端和管理后台。

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 设置环境变量

#### 选项 A: 使用本地 MongoDB（推荐用于开发）

运行快速设置脚本：

```bash
./scripts/setup-local-mongodb.sh
```

或手动创建 `.env.local`：

```bash
cp .env.local.example .env.local
```

确保 MongoDB 服务正在运行：
```bash
brew services start mongodb-community  # 如果未运行
```

#### 选项 B: 使用 MongoDB Atlas（云端）

```bash
cp .env.local.example .env.local
```

编辑 `.env.local` 文件，填入：
- Line Channel Secret & Access Token
- MongoDB Atlas 连接字符串（`mongodb+srv://...`）
- LLM API Key (OpenAI 或 Anthropic)

**注意**: 本地 MongoDB 使用 `mongodb://localhost:27017/line-chatbot`，无需额外配置。

详细说明请查看 [本地 MongoDB 设置指南](./docs/LOCAL_MONGODB_SETUP.md)

### 3. 验证项目设置

运行验证脚本检查项目配置：

```bash
node scripts/verify-setup.js
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 查看应用

## 📁 项目结构

```
├── app/                    # Next.js App Router
│   ├── api/                # API 路由
│   │   ├── webhook/        # Line Webhook 端点
│   │   └── conversations/  # 对话管理 API
│   ├── dashboard/          # 管理后台
│   ├── layout.tsx          # 根布局
│   └── page.tsx            # 首页
├── lib/                    # 工具库
│   ├── config.ts           # 环境变量配置
│   ├── services/           # 服务层
│   ├── models/             # 数据模型
│   └── utils/              # 工具函数
├── types/                  # TypeScript 类型定义
├── scripts/                 # 项目脚本
│   └── verify-setup.js      # 项目验证脚本
└── docs/                    # 项目文档
    ├── IMPLEMENTATION_PLAN.md
    ├── PROGRESS.md
    ├── VERIFICATION_REPORT.md
    └── DATABASE_SETUP.md
```

## 🛠️ 技术栈

- **框架**: Next.js 14+ (App Router)
- **语言**: TypeScript
- **数据库**: MongoDB Atlas + Mongoose
- **样式**: Tailwind CSS
- **验证**: Zod
- **API**: Line Messaging API
- **LLM**: OpenAI / Anthropic

## 📋 开发命令

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint

# TypeScript 类型检查
npx tsc --noEmit
```

## ✅ 验证检查

项目包含完整的验证系统，可以检查：

- ✅ 项目文件结构
- ✅ 依赖包安装
- ✅ 配置文件完整性
- ✅ TypeScript 编译
- ✅ ESLint 检查

运行 `node scripts/verify-setup.js` 进行完整验证。

## 📝 开发进度

查看 [IMPLEMENTATION_PLAN.md](./docs/IMPLEMENTATION_PLAN.md) 了解完整的开发计划。

查看 [PROGRESS.md](./docs/PROGRESS.md) 了解当前进度。

查看 [VERIFICATION_REPORT.md](./docs/VERIFICATION_REPORT.md) 查看最新验证报告。

查看 [DATABASE_SETUP.md](./docs/DATABASE_SETUP.md) 了解数据库设置详情。

## 🔒 安全注意事项

- ⚠️ 不要将 `.env.local` 文件提交到版本控制
- ⚠️ 确保所有敏感信息都通过环境变量管理
- ⚠️ 在生产环境中使用安全的密钥管理方案

## 📚 相关文档

- [Next.js 文档](https://nextjs.org/docs)
- [Line Messaging API](https://developers.line.biz/en/docs/messaging-api/)
- [Mongoose 文档](https://mongoosejs.com/docs/)
- [Zod 文档](https://zod.dev/)

