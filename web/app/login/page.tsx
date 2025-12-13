/**
 * 登录页面
 *
 * 只支持 OAuth2 登录方式
 * 点击登录按钮跳转到 /api/auth/login
 */

'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const redirect = searchParams.get('redirect')

  // 构建登录 URL，如果有 redirect 参数则传递
  const loginUrl = redirect
    ? `/api/auth/login?redirect=${encodeURIComponent(redirect)}`
    : '/api/auth/login'

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
      }}
    >
      <div
        style={{
          background: 'white',
          padding: '40px',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center',
        }}
      >
        {/* Logo / 标题 */}
        <div style={{ marginBottom: '30px' }}>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '10px',
            }}
          >
            Singapore Math
          </h1>
          <p style={{ color: '#666', fontSize: '14px' }}>
            知识图谱学习平台
          </p>
        </div>

        {/* 错误提示 */}
        {error && (
          <div
            style={{
              background: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '20px',
              color: '#dc2626',
              fontSize: '14px',
            }}
          >
            {decodeURIComponent(error)}
          </div>
        )}

        {/* 登录说明 */}
        <p
          style={{
            color: '#666',
            fontSize: '14px',
            marginBottom: '24px',
            lineHeight: '1.6',
          }}
        >
          请使用您的账号登录以继续访问
        </p>

        {/* OAuth 登录按钮 */}
        <a
          href={loginUrl}
          style={{
            display: 'block',
            width: '100%',
            padding: '14px 24px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            textDecoration: 'none',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          登录
        </a>

        {/* 底部说明 */}
        <p
          style={{
            marginTop: '24px',
            fontSize: '12px',
            color: '#999',
          }}
        >
          登录即表示您同意我们的服务条款
        </p>
      </div>
    </main>
  )
}

// 使用 Suspense 包裹以支持 useSearchParams
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          <div style={{ color: 'white', fontSize: '18px' }}>加载中...</div>
        </main>
      }
    >
      <LoginContent />
    </Suspense>
  )
}
