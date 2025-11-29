# Amplify + Next.js + Lambda + DynamoDB 模板

这是一个完整的全栈应用模板，展示了如何使用 AWS Amplify、Next.js、Lambda 和 DynamoDB 构建现代化的 Web 应用。

## 技术栈

### 前端
- **Next.js 14** - React 框架
- **Amplify JS 客户端** - 用于 Auth 和 API 调用
- **TypeScript** - 类型安全

### 后端
- **API Gateway** - REST API 网关（Amplify 自动配置）
- **Lambda** - 无服务器函数（业务逻辑）
- **DynamoDB** - NoSQL 数据库

## 项目结构

```
.
├── app/                          # Next.js 应用目录
│   ├── layout.tsx               # 根布局
│   ├── page.tsx                 # 首页（展示 API 调用）
│   └── globals.css              # 全局样式
├── amplify/                      # Amplify 后端配置
│   └── backend/
│       ├── api/                 # API Gateway 配置
│       │   └── myApi/
│       │       ├── api-params.json
│       │       └── myApi-cloudformation-template.json
│       ├── function/            # Lambda 函数
│       │   └── usersFunction/
│       │       ├── src/
│       │       │   ├── index.js           # ⭐️ Lambda 主函数
│       │       │   └── package.json
│       │       └── usersFunction-cloudformation-template.json
│       └── storage/             # DynamoDB 配置
│           └── usersTable/
│               └── usersTable-cloudformation-template.json
├── amplifyconfiguration.json    # Amplify 配置（前端使用）
├── package.json
└── README.md
```

## Lambda 接口定义详解

### 核心文件：`amplify/backend/function/usersFunction/src/index.js`

这个文件展示了如何在 Lambda 中定义 RESTful API 接口。

### 1. Lambda 处理函数结构

```javascript
exports.handler = async (event, context) => {
  // event 对象包含所有请求信息
  const method = event.httpMethod      // GET, POST, DELETE 等
  const path = event.path             // 请求路径，如 /users
  const body = event.body             // 请求体（字符串格式）
  const params = event.pathParameters // 路径参数，如 {id: "123"}

  // 返回响应对象
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Success' })
  }
}
```

### 2. 路由处理模式

Lambda 通过判断 HTTP 方法和路径来路由请求：

```javascript
// GET /users - 获取所有用户
if (method === 'GET' && path === '/users') {
  return await getAllUsers()
}

// POST /users - 创建新用户
if (method === 'POST' && path === '/users') {
  const body = JSON.parse(event.body)
  return await createUser(body)
}

// GET /users/{id} - 获取单个用户
if (method === 'GET' && event.pathParameters?.id) {
  return await getUserById(event.pathParameters.id)
}

// DELETE /users/{id} - 删除用户
if (method === 'DELETE' && event.pathParameters?.id) {
  return await deleteUser(event.pathParameters.id)
}
```

### 3. DynamoDB 操作

```javascript
const AWS = require('aws-sdk')
const dynamoDB = new AWS.DynamoDB.DocumentClient()
const TABLE_NAME = process.env.STORAGE_USERSTABLE_NAME

// 获取所有项
const result = await dynamoDB.scan({
  TableName: TABLE_NAME
}).promise()

// 获取单个项
const result = await dynamoDB.get({
  TableName: TABLE_NAME,
  Key: { id: userId }
}).promise()

// 创建/更新项
await dynamoDB.put({
  TableName: TABLE_NAME,
  Item: { id: '123', name: 'John' }
}).promise()

// 删除项
await dynamoDB.delete({
  TableName: TABLE_NAME,
  Key: { id: userId }
}).promise()
```

### 4. 完整的 API 接口示例

```javascript
async function createUser(body, headers) {
  // 1. 验证输入
  if (!body.name || !body.email) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: '缺少必填字段' })
    }
  }

  // 2. 创建数据对象
  const user = {
    id: uuidv4(),
    name: body.name,
    email: body.email,
    createdAt: new Date().toISOString()
  }

  // 3. 写入数据库
  await dynamoDB.put({
    TableName: TABLE_NAME,
    Item: user
  }).promise()

  // 4. 返回响应
  return {
    statusCode: 201,
    headers,
    body: JSON.stringify(user)
  }
}
```

## 前端 API 调用

在 Next.js 中使用 Amplify 客户端调用 API：

```typescript
import { generateClient } from 'aws-amplify/api'

const client = generateClient()

// GET 请求
const response = await client.get({
  apiName: 'myApi',
  path: '/users',
})

// POST 请求
const response = await client.post({
  apiName: 'myApi',
  path: '/users',
  options: {
    body: {
      name: 'John',
      email: 'john@example.com',
    },
  },
})

// DELETE 请求
await client.del({
  apiName: 'myApi',
  path: `/users/${userId}`,
})
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 初始化 Amplify

```bash
# 全局安装 Amplify CLI
npm install -g @aws-amplify/cli

# 配置 Amplify
amplify configure

# 初始化项目
amplify init
```

### 3. 部署后端

```bash
# 部署所有后端资源（API Gateway + Lambda + DynamoDB）
amplify push
```

部署完成后，Amplify 会自动更新 `amplifyconfiguration.json` 文件。

### 4. 运行开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## API 端点

部署后，你将获得以下 API 端点：

- `GET /users` - 获取所有用户
- `POST /users` - 创建新用户
  - Body: `{ name: string, email: string }`
- `GET /users/{id}` - 获取单个用户
- `DELETE /users/{id}` - 删除用户

## 学习要点

### 对于学生：如何定义 Lambda 接口？

1. **理解 Lambda 的事件对象**
   - `event.httpMethod` - HTTP 方法
   - `event.path` - 请求路径
   - `event.body` - 请求体
   - `event.pathParameters` - 路径参数

2. **路由模式**
   - 使用 if/else 判断方法和路径
   - 将不同的请求分发到不同的处理函数

3. **响应格式**
   - 必须包含 `statusCode`
   - `headers` 用于设置响应头（CORS、Content-Type）
   - `body` 必须是字符串（使用 `JSON.stringify`）

4. **数据库操作**
   - 使用 AWS SDK 的 DocumentClient
   - 所有操作都是异步的（使用 async/await）
   - 从环境变量获取表名

5. **错误处理**
   - 使用 try/catch 捕获错误
   - 返回适当的 HTTP 状态码（400, 404, 500 等）

## 扩展功能

你可以基于这个模板添加：

- ✅ 用户认证（Amplify Auth）
- ✅ 更多数据表和关系
- ✅ 文件上传（S3）
- ✅ 实时数据（AppSync）
- ✅ 搜索功能（ElasticSearch）

## 常见问题

### Q: Lambda 函数如何访问环境变量？
A: 通过 `process.env.VARIABLE_NAME`。Amplify 会自动设置资源相关的环境变量。

### Q: 如何调试 Lambda 函数？
A: 使用 `console.log()` 记录日志，然后在 CloudWatch Logs 中查看。

### Q: 如何添加新的 API 端点？
A: 在 Lambda 的 `handler` 函数中添加新的路由判断逻辑。

### Q: DynamoDB 表名从哪里来？
A: Amplify 会在部署时自动创建表，并将表名设置为环境变量。

## 相关资源

- [AWS Amplify 文档](https://docs.amplify.aws/)
- [Lambda 开发指南](https://docs.aws.amazon.com/lambda/)
- [DynamoDB 文档](https://docs.aws.amazon.com/dynamodb/)
- [Next.js 文档](https://nextjs.org/docs)

## 许可证

MIT
