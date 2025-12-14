'use client'

import { useEffect, useState } from 'react'
import { Amplify } from 'aws-amplify'
import { get, post, del } from 'aws-amplify/api'
import config from '../amplifyconfiguration.json'

// 配置 Amplify
Amplify.configure(config)

interface User {
  id: string
  name: string
  email: string
  createdAt: string
  providerUserId?: string
  avatar?: string
}

interface CurrentUser {
  id: string
  name: string
  email: string
  avatar?: string
}

export default function Home() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  // 获取当前登录用户
  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setCurrentUser(data.user)
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
    } finally {
      setAuthLoading(false)
    }
  }

  // 获取所有用户
  const fetchUsers = async () => {
    setLoading(true)
    try {
      const { body } = await get({
        apiName: 'myApi',
        path: '/users',
      }).response

      const data = await body.json()
      setUsers(data as unknown as User[])
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
      const { body } = await post({
        apiName: 'myApi',
        path: '/users',
        options: {
          body: {
            name,
            email,
          },
        },
      }).response

      console.log('创建成功:', await body.json())
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
      await del({
        apiName: 'myApi',
        path: `/users/${userId}`,
      }).response

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
    fetchCurrentUser()
    fetchUsers()
  }, [])

  return (
    <main style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* 顶部导航栏 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
          paddingBottom: '20px',
          borderBottom: '1px solid #eee',
        }}
      >
        <h1 style={{ fontSize: '28px', margin: 0 }}>
          Singapore Math 平台
        </h1>

        {/* 用户信息区域 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {authLoading ? (
            <span style={{ color: '#666' }}>加载中...</span>
          ) : currentUser ? (
            <>
              {/* 用户头像 */}
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '16px',
                  }}
                >
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
              )}

              {/* 用户名和邮箱 */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '600', color: '#333' }}>
                  {currentUser.name}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {currentUser.email}
                </div>
              </div>

              {/* 登出按钮 */}
              <a
                href="/api/auth/logout"
                style={{
                  padding: '8px 16px',
                  background: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#e5e7eb'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#f3f4f6'
                }}
              >
                退出登录
              </a>
            </>
          ) : (
            <a
              href="/login"
              style={{
                padding: '8px 20px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                textDecoration: 'none',
                cursor: 'pointer',
              }}
            >
              登录
            </a>
          )}
        </div>
      </div>

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
          <li><code>GET /users/by-provider/:providerUserId</code> - 通过 OAuth Provider ID 获取用户</li>
        </ul>
        <h3 style={{ marginTop: '20px', marginBottom: '15px', fontSize: '20px' }}>认证端点</h3>
        <ul style={{ lineHeight: '2', paddingLeft: '20px' }}>
          <li><code>GET /api/auth/login</code> - 跳转到 OAuth 登录</li>
          <li><code>GET /api/auth/callback</code> - OAuth 回调处理</li>
          <li><code>GET /api/auth/logout</code> - 登出</li>
          <li><code>GET /api/auth/me</code> - 获取当前登录用户</li>
        </ul>
      </div>
    </main>
  )
}
