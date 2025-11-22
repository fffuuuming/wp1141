# 数据库设置说明

## ✅ Phase 3 完成状态

数据库连接和模型已全部设置完成。

---

## 📁 创建的文件

### 1. 数据库连接工具
- **文件**: `lib/utils/mongodb.ts`
- **功能**: 
  - MongoDB 连接管理
  - 连接缓存（防止热重载时重复连接）
  - 错误处理

### 2. 数据模型

#### User Model (`lib/models/User.ts`)
- **字段**:
  - `lineUserId`: Line 用户唯一标识符（唯一索引）
  - `displayName`: 显示名称
  - `pictureUrl`: 头像 URL
  - `statusMessage`: 状态消息
  - `messageCount`: 消息总数
  - `lastActiveAt`: 最后活跃时间
  - `createdAt`, `updatedAt`: 时间戳

#### Conversation Model (`lib/models/Conversation.ts`)
- **字段**:
  - `userId`: 用户引用（外键）
  - `lineUserId`: Line 用户 ID（索引）
  - `title`: 对话标题
  - `messageCount`: 消息数量
  - `lastMessageAt`: 最后消息时间（索引）
  - `startedAt`: 开始时间
  - `endedAt`: 结束时间
  - `isActive`: 是否活跃（索引）
  - `metadata`: 额外元数据

#### Message Model (`lib/models/Message.ts`)
- **字段**:
  - `conversationId`: 对话引用（外键，索引）
  - `role`: 角色（'user' | 'bot'）
  - `type`: 消息类型（'text' | 'image' | 'video' | 'audio' | 'file' | 'location' | 'sticker'）
  - `content`: 消息内容
  - `metadata`: 额外元数据
  - `timestamp`: 消息时间戳（索引）

### 3. 类型定义
- **文件**: `types/global.d.ts`
- **功能**: 全局类型定义，支持 mongoose 连接缓存

### 4. 模型导出
- **文件**: `lib/models/index.ts`
- **功能**: 集中导出所有模型和类型

### 5. 测试端点
- **文件**: `app/api/test-db/route.ts`
- **功能**: 测试数据库连接和模型
- **端点**: `GET /api/test-db`

---

## 🔍 验证步骤

### 1. TypeScript 编译检查
```bash
npx tsc --noEmit
```
✅ 应该无错误

### 2. ESLint 检查
```bash
npm run lint
```
✅ 应该无警告或错误

### 3. 数据库连接测试

**前提条件**: 需要先设置 `.env.local` 文件，包含有效的 `MONGODB_URI`

```bash
# 1. 创建 .env.local 文件
cp .env.example .env.local

# 2. 编辑 .env.local，填入 MongoDB Atlas 连接字符串
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/line-chatbot

# 3. 启动开发服务器
npm run dev

# 4. 访问测试端点
curl http://localhost:3000/api/test-db
```

**预期响应**:
```json
{
  "success": true,
  "message": "Database connection successful",
  "data": {
    "userCount": 0,
    "conversationCount": 0,
    "messageCount": 0,
    "timestamp": "2024-11-20T..."
  }
}
```

---

## 📊 数据库索引

为了优化查询性能，已创建以下索引：

### User Collection
- `lineUserId` (唯一索引)

### Conversation Collection
- `userId` + `lastMessageAt` (复合索引)
- `lineUserId` + `lastMessageAt` (复合索引)
- `isActive` + `lastMessageAt` (复合索引)

### Message Collection
- `conversationId` + `timestamp` (复合索引)

---

## 🚀 使用示例

### 在 API 路由中使用数据库

```typescript
import connectDB from '@/lib/utils/mongodb';
import { User, Conversation, Message } from '@/lib/models';

export async function GET() {
  // 连接数据库
  await connectDB();
  
  // 使用模型
  const users = await User.find({});
  const conversations = await Conversation.find({ isActive: true });
  
  return Response.json({ users, conversations });
}
```

---

## ⚠️ 注意事项

1. **环境变量**: 确保 `.env.local` 中包含有效的 `MONGODB_URI`
2. **MongoDB Atlas**: 
   - 需要创建 MongoDB Atlas 账户
   - 配置网络访问（允许 Vercel IP 或 0.0.0.0/0）
   - 创建数据库用户和密码
3. **连接字符串格式**: 
   ```
   mongodb+srv://username:password@cluster.mongodb.net/database-name?retryWrites=true&w=majority
   ```

---

## ✅ 完成检查清单

- [x] MongoDB 连接工具已创建
- [x] User 模型已创建
- [x] Conversation 模型已创建
- [x] Message 模型已创建
- [x] 所有模型都有适当的索引
- [x] TypeScript 类型定义完整
- [x] 测试端点已创建
- [x] TypeScript 编译通过
- [x] ESLint 检查通过

---

## 📝 下一步

Phase 3 已完成！可以继续进入 **Phase 4: Line Bot Foundation**。

