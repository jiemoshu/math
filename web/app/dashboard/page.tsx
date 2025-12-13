'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getCurrentSubscription, cancelSubscription, Subscription } from '@/lib/api'

export default function DashboardPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [canceling, setCanceling] = useState(false)

  const fetchSubscription = async () => {
    setLoading(true)
    try {
      const data = await getCurrentSubscription()
      setSubscription(data)
    } catch (error) {
      console.error('Failed to fetch subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscription()
  }, [])

  const handleCancel = async () => {
    if (!confirm('确定要取消订阅吗？取消后将在当前周期结束时失效。')) {
      return
    }

    setCanceling(true)
    try {
      await cancelSubscription()
      await fetchSubscription()
    } catch (error) {
      console.error('Failed to cancel subscription:', error)
      alert('取消订阅失败，请稍后重试')
    } finally {
      setCanceling(false)
    }
  }

  const getStatusLabel = (status: Subscription['status']) => {
    const labels: Record<Subscription['status'], string> = {
      active: '生效中',
      canceled: '已取消',
      expired: '已过期',
      past_due: '逾期',
      trialing: '试用中',
    }
    return labels[status] || status
  }

  const getStatusColor = (status: Subscription['status']) => {
    const colors: Record<Subscription['status'], string> = {
      active: '#10b981',
      canceled: '#6b7280',
      expired: '#ef4444',
      past_due: '#f59e0b',
      trialing: '#3b82f6',
    }
    return colors[status] || '#6b7280'
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
        加载中...
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '800px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px', color: '#1f2937' }}>
        管理订阅
      </h1>

      {subscription ? (
        <div
          style={{
            background: 'white',
            borderRadius: '8px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                {subscription.plan.name}
              </h2>
              <span
                style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  background: `${getStatusColor(subscription.status)}20`,
                  color: getStatusColor(subscription.status),
                  borderRadius: '4px',
                  fontSize: '13px',
                  fontWeight: '500',
                }}
              >
                {getStatusLabel(subscription.status)}
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
                {subscription.plan.currency} {subscription.plan.amount}
              </div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>
                / {subscription.plan.interval === 'month' ? '月' : '年'}
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
            <div style={{ display: 'grid', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280', fontSize: '14px' }}>当前周期开始</span>
                <span style={{ color: '#1f2937', fontSize: '14px' }}>
                  {new Date(subscription.current_period_start).toLocaleDateString('zh-CN')}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280', fontSize: '14px' }}>下次扣费时间</span>
                <span style={{ color: '#1f2937', fontSize: '14px' }}>
                  {subscription.cancel_at_period_end
                    ? '不再续费'
                    : new Date(subscription.current_period_end).toLocaleDateString('zh-CN')}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280', fontSize: '14px' }}>创建时间</span>
                <span style={{ color: '#1f2937', fontSize: '14px' }}>
                  {new Date(subscription.created_at).toLocaleDateString('zh-CN')}
                </span>
              </div>
            </div>
          </div>

          {subscription.status === 'active' && !subscription.cancel_at_period_end && (
            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
              <button
                onClick={handleCancel}
                disabled={canceling}
                style={{
                  padding: '10px 20px',
                  background: 'white',
                  color: '#ef4444',
                  border: '1px solid #ef4444',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: canceling ? 'not-allowed' : 'pointer',
                  opacity: canceling ? 0.6 : 1,
                }}
              >
                {canceling ? '处理中...' : '取消订阅'}
              </button>
            </div>
          )}

          {subscription.cancel_at_period_end && (
            <div
              style={{
                marginTop: '24px',
                padding: '12px 16px',
                background: '#fef3c7',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#92400e',
              }}
            >
              订阅将在 {new Date(subscription.current_period_end).toLocaleDateString('zh-CN')} 结束后失效
            </div>
          )}
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
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            您当前没有活跃的订阅
          </p>
          <Link
            href="/subscribe"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              textDecoration: 'none',
            }}
          >
            选择订阅计划
          </Link>
        </div>
      )}
    </div>
  )
}
