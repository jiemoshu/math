# Lambda 接口定义完整指南

## 目录
1. [基础概念](#基础概念)
2. [event 对象详解](#event-对象详解)
3. [路由模式](#路由模式)
4. [请求处理](#请求处理)
5. [响应格式](#响应格式)
6. [错误处理](#错误处理)
7. [最佳实践](#最佳实践)

---

## 基础概念

### Lambda 是什么？
Lambda 是 AWS 的无服务器计算服务。你只需要编写函数代码，AWS 会自动处理服务器管理、扩展和高可用性。

### Lambda 如何定义 API 接口？
当 Lambda 与 API Gateway 集成时：
1. 客户端发送 HTTP 请求到 API Gateway
2. API Gateway 将请求转换为 `event` 对象
3. Lambda 函数处理 `event` 并返回响应
4. API Gateway 将响应返回给客户端

```
客户端 → API Gateway → Lambda → DynamoDB
                ↓
              响应
```

---

## event 对象详解

### event 对象包含什么？

```javascript
{
  httpMethod: "GET",              // HTTP 方法
  path: "/users/123",             // 请求路径
  pathParameters: {                // 路径参数
    id: "123"
  },
  queryStringParameters: {         // 查询参数 (?key=value)
    page: "1",
    limit: "10"
  },
  headers: {                       // 请求头
    "Content-Type": "application/json",
    "Authorization": "Bearer token..."
  },
  body: "{\"name\":\"John\"}",    // 请求体（字符串格式）
  isBase64Encoded: false,
  requestContext: {                // 请求上下文
    requestId: "abc-123",
    identity: {
      sourceIp: "1.2.3.4"
    }
  }
}
```

### 如何使用 event 对象？

```javascript
exports.handler = async (event) => {
  // 1. 获取 HTTP 方法
  const method = event.httpMethod // "GET", "POST", "PUT", "DELETE"

  // 2. 获取路径
  const path = event.path // "/users" 或 "/users/123"

  // 3. 获取路径参数（如 /users/{id} 中的 id）
  const userId = event.pathParameters?.id

  // 4. 获取查询参数（如 /users?page=1）
  const page = event.queryStringParameters?.page

  // 5. 获取请求体（需要解析 JSON）
  const body = event.body ? JSON.parse(event.body) : {}

  // 6. 获取请求头
  const authToken = event.headers?.Authorization

  // 处理请求...
}
```

---

## 路由模式

### 模式 1: 简单路由（推荐用于小型 API）

```javascript
exports.handler = async (event) => {
  const method = event.httpMethod
  const path = event.path

  // GET /users
  if (method === 'GET' && path === '/users') {
    return await getAllUsers()
  }

  // POST /users
  if (method === 'POST' && path === '/users') {
    return await createUser(JSON.parse(event.body))
  }

  // GET /users/{id}
  if (method === 'GET' && path.startsWith('/users/')) {
    const id = event.pathParameters.id
    return await getUserById(id)
  }

  // DELETE /users/{id}
  if (method === 'DELETE' && path.startsWith('/users/')) {
    const id = event.pathParameters.id
    return await deleteUser(id)
  }

  // 未匹配的路由
  return {
    statusCode: 404,
    body: JSON.stringify({ error: 'Not Found' })
  }
}
```

### 模式 2: 路由表（推荐用于大型 API）

```javascript
// 定义路由表
const routes = {
  'GET /users': getAllUsers,
  'POST /users': createUser,
  'GET /users/{id}': getUserById,
  'PUT /users/{id}': updateUser,
  'DELETE /users/{id}': deleteUser,
}

exports.handler = async (event) => {
  const method = event.httpMethod
  const path = event.path

  // 构建路由键
  const routeKey = `${method} ${path}`

  // 查找处理函数
  const handler = routes[routeKey]

  if (handler) {
    return await handler(event)
  }

  return {
    statusCode: 404,
    body: JSON.stringify({ error: 'Route not found' })
  }
}
```

### 模式 3: 正则表达式路由（高级）

```javascript
const routes = [
  { pattern: /^GET \/users$/, handler: getAllUsers },
  { pattern: /^POST \/users$/, handler: createUser },
  { pattern: /^GET \/users\/[\w-]+$/, handler: getUserById },
  { pattern: /^DELETE \/users\/[\w-]+$/, handler: deleteUser },
]

exports.handler = async (event) => {
  const routeKey = `${event.httpMethod} ${event.path}`

  for (const route of routes) {
    if (route.pattern.test(routeKey)) {
      return await route.handler(event)
    }
  }

  return {
    statusCode: 404,
    body: JSON.stringify({ error: 'Not Found' })
  }
}
```

---

## 请求处理

### 处理查询参数

```javascript
// GET /users?page=1&limit=10
async function getAllUsers(event) {
  const page = parseInt(event.queryStringParameters?.page || '1')
  const limit = parseInt(event.queryStringParameters?.limit || '20')

  const params = {
    TableName: TABLE_NAME,
    Limit: limit
  }

  const result = await dynamoDB.scan(params).promise()

  return {
    statusCode: 200,
    body: JSON.stringify({
      data: result.Items,
      page,
      total: result.Count
    })
  }
}
```

### 处理请求体

```javascript
// POST /users
async function createUser(event) {
  // 解析 JSON
  const body = JSON.parse(event.body)

  // 验证必填字段
  if (!body.name || !body.email) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Missing required fields: name, email'
      })
    }
  }

  // 验证邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(body.email)) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Invalid email format'
      })
    }
  }

  // 创建用户
  const user = {
    id: uuidv4(),
    name: body.name,
    email: body.email,
    createdAt: new Date().toISOString()
  }

  await dynamoDB.put({
    TableName: TABLE_NAME,
    Item: user
  }).promise()

  return {
    statusCode: 201,
    body: JSON.stringify(user)
  }
}
```

### 处理路径参数

```javascript
// GET /users/{id}
async function getUserById(event) {
  const userId = event.pathParameters.id

  const result = await dynamoDB.get({
    TableName: TABLE_NAME,
    Key: { id: userId }
  }).promise()

  if (!result.Item) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: `User ${userId} not found`
      })
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify(result.Item)
  }
}
```

---

## 响应格式

### 基本响应结构

```javascript
{
  statusCode: 200,              // HTTP 状态码
  headers: {                    // 响应头
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  },
  body: JSON.stringify({        // 响应体（必须是字符串）
    message: 'Success'
  })
}
```

### 常用状态码

```javascript
// 成功响应
200 - OK (获取成功)
201 - Created (创建成功)
204 - No Content (删除成功，无返回内容)

// 客户端错误
400 - Bad Request (请求参数错误)
401 - Unauthorized (未授权)
403 - Forbidden (禁止访问)
404 - Not Found (资源不存在)
409 - Conflict (资源冲突，如重复创建)

// 服务器错误
500 - Internal Server Error (服务器内部错误)
502 - Bad Gateway (网关错误)
503 - Service Unavailable (服务不可用)
```

### 响应辅助函数

```javascript
// 成功响应
function success(data, statusCode = 200) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(data)
  }
}

// 错误响应
function error(message, statusCode = 500) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({ error: message })
  }
}

// 使用示例
return success({ user: userData }, 201)
return error('User not found', 404)
```

---

## 错误处理

### 基础错误处理

```javascript
exports.handler = async (event) => {
  try {
    // 处理请求
    const result = await processRequest(event)
    return success(result)
  } catch (err) {
    console.error('Error:', err)
    return error(err.message)
  }
}
```

### 分类错误处理

```javascript
class ValidationError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ValidationError'
    this.statusCode = 400
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message)
    this.name = 'NotFoundError'
    this.statusCode = 404
  }
}

exports.handler = async (event) => {
  try {
    // 验证输入
    if (!event.body) {
      throw new ValidationError('Request body is required')
    }

    // 查找资源
    const user = await findUser(userId)
    if (!user) {
      throw new NotFoundError('User not found')
    }

    return success(user)

  } catch (err) {
    console.error('Error:', err)

    // 根据错误类型返回不同状态码
    const statusCode = err.statusCode || 500
    return error(err.message, statusCode)
  }
}
```

---

## 最佳实践

### 1. 使用环境变量

```javascript
// ❌ 不好：硬编码
const TABLE_NAME = 'Users-dev'

// ✅ 好：使用环境变量
const TABLE_NAME = process.env.STORAGE_USERSTABLE_NAME
```

### 2. 输入验证

```javascript
// ✅ 总是验证输入
function validateUser(data) {
  if (!data.name || typeof data.name !== 'string') {
    throw new ValidationError('Invalid name')
  }
  if (!data.email || !isValidEmail(data.email)) {
    throw new ValidationError('Invalid email')
  }
  return true
}
```

### 3. 设置 CORS 头

```javascript
// ✅ 允许跨域请求
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
}

// 处理 OPTIONS 预检请求
if (event.httpMethod === 'OPTIONS') {
  return {
    statusCode: 200,
    headers,
    body: ''
  }
}
```

### 4. 记录日志

```javascript
// ✅ 记录关键信息
console.log('Request:', {
  method: event.httpMethod,
  path: event.path,
  requestId: event.requestContext.requestId
})

console.log('Processing user:', userId)
console.error('Error occurred:', error)
```

### 5. 使用异步/等待

```javascript
// ❌ 不好：Promise 链
dynamoDB.get(params).promise()
  .then(result => {
    return processResult(result)
  })
  .then(data => {
    return formatData(data)
  })

// ✅ 好：async/await
const result = await dynamoDB.get(params).promise()
const processed = await processResult(result)
const formatted = await formatData(processed)
```

### 6. 响应时间优化

```javascript
// ✅ 并行执行独立操作
const [user, posts, comments] = await Promise.all([
  getUserById(userId),
  getUserPosts(userId),
  getUserComments(userId)
])

// ❌ 避免串行执行
const user = await getUserById(userId)      // 等待
const posts = await getUserPosts(userId)    // 等待
const comments = await getUserComments(userId) // 等待
```

### 7. 限制返回数据大小

```javascript
// ✅ 使用分页
async function getAllUsers(event) {
  const limit = Math.min(
    parseInt(event.queryStringParameters?.limit || '20'),
    100 // 最大限制
  )

  const params = {
    TableName: TABLE_NAME,
    Limit: limit
  }

  const result = await dynamoDB.scan(params).promise()
  return success(result.Items)
}
```

---

## 完整示例

这里是一个包含所有最佳实践的完整示例：

查看 `index.js` 文件，它展示了：
- ✅ 清晰的路由结构
- ✅ 完整的输入验证
- ✅ 适当的错误处理
- ✅ CORS 配置
- ✅ 环境变量使用
- ✅ DynamoDB 操作
- ✅ 详细的代码注释

---

## 学习检查清单

作为学生，确保你理解了：

- [ ] Lambda 的 event 对象包含哪些信息
- [ ] 如何获取 HTTP 方法、路径、参数
- [ ] 如何路由不同的请求到不同的处理函数
- [ ] 如何解析和验证请求体
- [ ] 如何构建响应对象（statusCode, headers, body）
- [ ] 如何使用 DynamoDB DocumentClient
- [ ] 如何处理错误并返回适当的状态码
- [ ] 如何设置 CORS 头
- [ ] 为什么响应的 body 必须是字符串

掌握这些后，你就能够定义任何 Lambda API 接口了！
