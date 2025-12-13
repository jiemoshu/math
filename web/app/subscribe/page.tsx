'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getPlans, createSubscription, Plan } from '@/lib/api'

export default function SubscribePage() {
  const router = useRouter()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState<string | null>(null)

  useEffect(() => {
    getPlans()
      .then(setPlans)
      .catch((error) => {
        console.error('Failed to fetch plans:', error)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSubscribe = async (planId: string) => {
    setSubscribing(planId)
    try {
      const result = await createSubscription(planId)
      if (result.checkout_url) {
        window.location.href = result.checkout_url
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Failed to create subscription:', error)
      alert('创建订阅失败，请稍后重试')
    } finally {
      setSubscribing(null)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '80px 24px', textAlign: 'center', color: '#666' }}>
        加载中...
      </div>
    )
  }

  return (
    <div style={{ padding: '48px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#1f2937', marginBottom: '12px' }}>
          选择订阅计划
        </h1>
        <p style={{ fontSize: '16px', color: '#6b7280' }}>
          选择适合您的计划，开始学习之旅
        </p>
      </div>

      {plans.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            justifyContent: 'center',
          }}
        >
          {plans.map((plan) => (
            <div
              key={plan.id}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '32px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <h2
                style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '8px',
                }}
              >
                {plan.name}
              </h2>

              {plan.description && (
                <p
                  style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    marginBottom: '24px',
                    lineHeight: '1.5',
                  }}
                >
                  {plan.description}
                </p>
              )}

              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '36px', fontWeight: '700', color: '#1f2937' }}>
                  {plan.currency} {plan.amount}
                </span>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                  {' '}/ {plan.interval === 'month' ? '月' : '年'}
                </span>
              </div>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={subscribing !== null}
                style={{
                  marginTop: 'auto',
                  padding: '14px 24px',
                  background:
                    subscribing === plan.id
                      ? '#9ca3af'
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: subscribing !== null ? 'not-allowed' : 'pointer',
                }}
              >
                {subscribing === plan.id ? '处理中...' : '订阅'}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            background: 'white',
            borderRadius: '8px',
            padding: '48px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            textAlign: 'center',
          }}
        >
          <p style={{ color: '#6b7280' }}>暂无可用的订阅计划</p>
        </div>
      )}
    </div>
  )
}
