'use client'

import { useEffect, useState } from 'react'
import { Amplify } from 'aws-amplify'
import { generateClient } from 'aws-amplify/api'
import config from '../amplifyconfiguration.json'

// 配置 Amplify
Amplify.configure(config)

// 创建 API 客户端
const client = generateClient()

interface User {
  id: string
  name: string
  email: string
  createdAt: string
}

export default function Home() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  // 获取所有用户
  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await client.get({
        apiName: 'myApi',
        path: '/users',
      })

      setUsers(response.body as unknown as User[])
    } catch (error) {
      console.error('获取用户失败:', error)
      alert('获取用户失败')
    } finally {
      setLoading(false)
    }
  }

  // 创建新用户
  const createUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await client.post({
        apiName: 'myApi',
        path: '/users',
        options: {
          body: {
            name,
            email,
          },
        },
      })

      console.log('创建成功:', response)
      alert('用户创建成功！')
      setName('')
      setEmail('')
      fetchUsers() // 刷新列表
    } catch (error) {
      console.error('创建用户失败:', error)
      alert('创建用户失败')
    } finally {
      setLoading(false)
    }
  }

  // 删除用户
  const deleteUser = async (userId: string) => {
    setLoading(true)

    try {
      await client.del({
        apiName: 'myApi',
        path: `/users/${userId}`,
      })

      alert('用户删除成功！')
      fetchUsers() // 刷新列表
    } catch (error) {
      console.error('删除用户失败:', error)
      alert('删除用户失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <main style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '30px', fontSize: '32px' }}>
        Amplify + Lambda + DynamoDB 示例
      </h1>

      {/* 创建用户表单 */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginBottom: '20px', fontSize: '24px' }}>创建新用户</h2>
        <form onSubmit={createUser} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="姓名"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{
              flex: '1',
              minWidth: '200px',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
          <input
            type="email"
            placeholder="邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              flex: '1',
              minWidth: '200px',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px 30px',
              background: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? '处理中...' : '创建用户'}
          </button>
        </form>
      </div>

      {/* 用户列表 */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '24px' }}>用户列表</h2>
          <button
            onClick={fetchUsers}
            disabled={loading}
            style={{
              padding: '8px 20px',
              background: '#eee',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            刷新
          </button>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>加载中...</p>
        ) : users.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>暂无用户数据</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>姓名</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>邮箱</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>创建时间</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>{user.id.substring(0, 8)}...</td>
                    <td style={{ padding: '12px' }}>{user.name}</td>
                    <td style={{ padding: '12px' }}>{user.email}</td>
                    <td style={{ padding: '12px' }}>
                      {new Date(user.createdAt).toLocaleString('zh-CN')}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        onClick={() => deleteUser(user.id)}
                        disabled={loading}
                        style={{
                          padding: '6px 16px',
                          background: '#ff4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* API 说明 */}
      <div style={{
        marginTop: '30px',
        padding: '20px',
        background: '#f9f9f9',
        borderRadius: '8px',
        border: '1px solid #ddd'
      }}>
        <h3 style={{ marginBottom: '15px', fontSize: '20px' }}>API 端点说明</h3>
        <ul style={{ lineHeight: '2', paddingLeft: '20px' }}>
          <li><code>GET /users</code> - 获取所有用户</li>
          <li><code>POST /users</code> - 创建新用户 (body: {`{name, email}`})</li>
          <li><code>GET /users/:id</code> - 获取单个用户</li>
          <li><code>DELETE /users/:id</code> - 删除用户</li>
        </ul>
      </div>
    </main>
  )
}
