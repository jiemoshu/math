# 快速开始指南

这个指南将帮助你在 10 分钟内启动并运行这个模板项目。

## 前置要求

- Node.js 18+ 和 npm
- AWS 账户
- AWS CLI（已配置）

## 步骤 1: 安装依赖

```bash
npm install
```

## 步骤 2: 安装和配置 Amplify CLI

```bash
# 全局安装 Amplify CLI
npm install -g @aws-amplify/cli

# 配置 Amplify（只需做一次）
amplify configure
```

执行 `amplify configure` 时，会打开浏览器登录 AWS 控制台。按照提示：
1. 登录 AWS 控制台
2. 创建 IAM 用户（Amplify 需要管理员权限）
3. 下载访问密钥
4. 在终端输入访问密钥

## 步骤 3: 初始化 Amplify 项目

```bash
amplify init
```

回答以下问题：
```
? Enter a name for the project: demo
? Enter a name for the environment: dev
? Choose your default editor: Visual Studio Code (或你的编辑器)
? Choose the type of app: javascript
? What javascript framework are you using: react
? Source Directory Path: app
? Distribution Directory Path: .next
? Build Command: npm run build
? Start Command: npm run dev
? Do you want to use an AWS profile? Yes
? Please choose the profile you want to use: default (或你的 AWS profile)
```

## 步骤 4: 添加 API 资源

```bash
# 添加 REST API
amplify add api
```

选择：
```
? Select from one of the below mentioned services: REST
? Provide a friendly name for your resource: myApi
? Provide a path (e.g., /book/{isbn}): /users
? Choose a Lambda source: Create a new Lambda function
? Provide an AWS Lambda function name: usersFunction
? Choose the runtime: NodeJS
? Choose a function template: Hello World
? Do you want to configure advanced settings? No
? Do you want to edit the local lambda function now? No
? Restrict API access? No
? Do you want to add another path? Yes
? Provide a path: /users/{id}
? Choose a Lambda source: Use a Lambda function already added in the current Amplify project
? Choose the Lambda function: usersFunction
? Restrict API access? No
? Do you want to add another path? No
```

## 步骤 5: 添加 DynamoDB 表

```bash
# 添加存储
amplify add storage
```

选择：
```
? Select from one of the below mentioned services: NoSQL Database
? Provide a friendly name: usersTable
? Provide table name: Users
? What would you like to name this column: id
? Choose the data type: string
? Would you like to add another column? No
? Please choose partition key for the table: id
? Do you want to add a sort key to your table? No
? Do you want to add global secondary indexes? No
? Do you want to add a Lambda Trigger? No
```

## 步骤 6: 替换 Lambda 代码

将模板中的 Lambda 代码复制到 Amplify 生成的函数目录：

```bash
# 复制 Lambda 函数代码
cp amplify/backend/function/usersFunction/src/index.js \
   amplify/backend/function/usersFunction-GENERATED/src/index.js

# 复制 package.json
cp amplify/backend/function/usersFunction/src/package.json \
   amplify/backend/function/usersFunction-GENERATED/src/package.json
```

或者手动复制 `amplify/backend/function/usersFunction/src/index.js` 的内容。

## 步骤 7: 部署到 AWS

```bash
# 部署所有资源
amplify push
```

这会：
1. 创建 DynamoDB 表
2. 部署 Lambda 函数
3. 创建 API Gateway
4. 设置权限和 IAM 角色

部署大约需要 3-5 分钟。

完成后，Amplify 会自动更新 `amplifyconfiguration.json` 文件。

## 步骤 8: 启动开发服务器

```bash
npm run dev
```

打开浏览器访问 http://localhost:3000

你应该能看到用户管理界面！

## 步骤 9: 测试 API

在界面上：
1. 输入姓名和邮箱，点击"创建用户"
2. 查看用户列表
3. 点击"删除"按钮删除用户

或者使用 curl 测试：

```bash
# 获取你的 API 端点
amplify status

# 获取所有用户
curl https://YOUR-API-ID.execute-api.REGION.amazonaws.com/dev/users

# 创建用户
curl -X POST https://YOUR-API-ID.execute-api.REGION.amazonaws.com/dev/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com"}'
```

## 步骤 10: 查看日志

查看 Lambda 函数的日志：

```bash
amplify console api
# 选择 "Lambda function"
# 点击 "Monitor" 标签
# 点击 "View logs in CloudWatch"
```

## 常用命令

```bash
# 查看项目状态
amplify status

# 部署更改
amplify push

# 删除后端资源（小心！）
amplify delete

# 打开 AWS 控制台
amplify console

# 查看 API 端点
amplify status
```

## 本地测试 Lambda

你可以在本地模拟 Lambda：

```bash
# 安装本地测试工具
npm install -g lambda-local

# 测试 Lambda 函数
cd amplify/backend/function/usersFunction/src
lambda-local -l index.js -h handler -e test-event.json
```

创建 `test-event.json`:
```json
{
  "httpMethod": "GET",
  "path": "/users",
  "headers": {},
  "body": null
}
```

## 故障排除

### 问题: Lambda 函数没有权限访问 DynamoDB

确保 Lambda 的 IAM 角色有 DynamoDB 权限。检查 CloudFormation 模板中的权限配置。

### 问题: CORS 错误

确保 Lambda 响应包含 CORS 头：
```javascript
headers: {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
}
```

### 问题: 找不到 DynamoDB 表

检查环境变量：
```bash
amplify env get --name dev
```

确保 Lambda 函数的环境变量正确设置了表名。

## 下一步

现在你已经成功运行了模板！接下来可以：

1. 📖 阅读 `README.md` 了解架构
2. 💻 阅读 `amplify/backend/function/usersFunction/src/LAMBDA_GUIDE.md` 学习如何定义接口
3. 🔧 修改 Lambda 代码添加新功能
4. 🎨 自定义前端界面
5. 📊 添加更多数据表和 API

## 成本估算

使用 AWS 免费套餐，这个模板项目几乎免费：
- Lambda: 前 100 万次请求免费
- DynamoDB: 前 25GB 存储免费
- API Gateway: 前 100 万次调用免费

只要在学习和开发阶段，基本不会产生费用。

## 清理资源

当你完成学习后，删除所有资源以避免费用：

```bash
amplify delete
```

这会删除所有 AWS 资源（API Gateway、Lambda、DynamoDB）。

---

祝你学习愉快！如果遇到问题，查看 README.md 或 AWS Amplify 文档。
