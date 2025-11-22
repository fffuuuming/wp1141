# 本地 MongoDB 设置指南

## ✅ MongoDB 服务状态

您的 MongoDB 服务已经在运行：
```
mongodb-community started
```

---

## 📝 设置步骤

### 1. 创建环境变量文件

如果还没有 `.env.local` 文件，请创建它：

```bash
cp .env.local.example .env.local
```

### 2. 配置本地 MongoDB 连接

编辑 `.env.local` 文件，设置 MongoDB URI：

```bash
# 本地 MongoDB（默认端口 27017）
MONGODB_URI=mongodb://localhost:27017/line-chatbot
```

**说明**：
- `mongodb://` - 本地 MongoDB 连接协议
- `localhost:27017` - MongoDB 默认地址和端口
- `line-chatbot` - 数据库名称（可以自定义）

### 3. 其他必需的环境变量

在 `.env.local` 中还需要设置：

```bash
# Line API（暂时可以用占位符，稍后配置）
LINE_CHANNEL_SECRET=placeholder_for_now
LINE_CHANNEL_ACCESS_TOKEN=placeholder_for_now

# LLM API Key（暂时可以用占位符，稍后配置）
LLM_PROVIDER=openai
OPENAI_API_KEY=placeholder_for_now
```

---

## 🔍 验证 MongoDB 连接

### 方法 1: 使用测试 API 端点

1. 启动开发服务器：
```bash
npm run dev
```

2. 在另一个终端测试连接：
```bash
curl http://localhost:3000/api/test-db
```

**预期响应**：
```json
{
  "success": true,
  "message": "Database connection successful",
  "data": {
    "userCount": 0,
    "conversationCount": 0,
    "messageCount": 0,
    "timestamp": "2024-11-21T..."
  }
}
```

### 方法 2: 使用 MongoDB Shell

```bash
# 使用 mongosh（MongoDB 6.0+）
mongosh

# 或使用 mongo（旧版本）
mongo
```

在 MongoDB shell 中：
```javascript
// 切换到数据库
use line-chatbot

// 查看集合
show collections

// 查看用户集合
db.users.find()
```

### 方法 3: 检查 MongoDB 服务状态

```bash
# 检查服务状态
brew services list | grep mongodb

# 如果服务未运行，启动它
brew services start mongodb-community

# 查看 MongoDB 日志
tail -f /usr/local/var/log/mongodb/mongo.log
# 或
tail -f /opt/homebrew/var/log/mongodb/mongo.log
```

---

## 🛠️ MongoDB 常用命令

### 启动/停止服务

```bash
# 启动 MongoDB
brew services start mongodb-community

# 停止 MongoDB
brew services stop mongodb-community

# 重启 MongoDB
brew services restart mongodb-community
```

### 查看 MongoDB 信息

```bash
# 查看数据目录（通常在）
ls -la /usr/local/var/mongodb
# 或
ls -la /opt/homebrew/var/mongodb

# 查看配置文件
cat /usr/local/etc/mongod.conf
# 或
cat /opt/homebrew/etc/mongod.conf
```

---

## 🔧 故障排除

### 问题 1: 连接被拒绝

**错误信息**：
```
MongoServerError: connect ECONNREFUSED 127.0.0.1:27017
```

**解决方案**：
1. 确认 MongoDB 服务正在运行：
   ```bash
   brew services list | grep mongodb
   ```

2. 如果未运行，启动服务：
   ```bash
   brew services start mongodb-community
   ```

3. 检查端口是否被占用：
   ```bash
   lsof -i :27017
   ```

### 问题 2: 权限错误

**错误信息**：
```
MongoServerError: not authorized on line-chatbot to execute command
```

**解决方案**：
本地 MongoDB 默认不需要认证。如果遇到此错误：
1. 检查 MongoDB 配置文件中是否启用了认证
2. 或者使用不带认证的连接字符串

### 问题 3: 数据库不存在

**说明**：
MongoDB 会在首次写入时自动创建数据库和集合，这是正常行为。

---

## 📊 数据库结构

项目会自动创建以下集合：

- `users` - 用户信息
- `conversations` - 对话记录
- `messages` - 消息内容

这些集合会在首次使用时自动创建。

---

## 🔄 从本地切换到 MongoDB Atlas

如果将来需要使用 MongoDB Atlas（云端），只需更新 `.env.local`：

```bash
# 从本地切换到 Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/line-chatbot?retryWrites=true&w=majority
```

---

## ✅ 验证清单

- [ ] MongoDB 服务正在运行
- [ ] `.env.local` 文件已创建
- [ ] `MONGODB_URI` 设置为 `mongodb://localhost:27017/line-chatbot`
- [ ] 测试端点返回成功响应
- [ ] 可以连接到数据库

---

## 📚 相关资源

- [MongoDB 官方文档](https://docs.mongodb.com/)
- [MongoDB Homebrew 安装指南](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-os-x/)
- [Mongoose 文档](https://mongoosejs.com/docs/)

