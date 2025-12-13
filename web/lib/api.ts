/**
 * API 工具函数 - 统一处理所有 API 请求
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''
const NEXTPAY_BASE_URL = process.env.NEXT_PUBLIC_NEXTPAY_URL || 'https://pay.arbella.group'

// 通用请求函数
async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }))
    throw new Error(error.message || `Request failed: ${response.status}`)
  }

  return response.json()
}

// ========== 订阅相关类型 ==========

export interface Plan {
  id: string
  name: string
  description?: string
  amount: number
  currency: string
  interval: 'month' | 'year'
  interval_count: number
}

export interface Subscription {
  id: string
  status: 'active' | 'canceled' | 'expired' | 'past_due' | 'trialing'
  plan: Plan
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  created_at: string
}

export interface Order {
  id: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  created_at: string
  description?: string
}

// ========== 订阅 API ==========

export async function getPlans(): Promise<Plan[]> {
  return request<Plan[]>(`${NEXTPAY_BASE_URL}/api/plans`)
}

export async function getCurrentSubscription(): Promise<Subscription | null> {
  try {
    return await request<Subscription>(`${API_BASE_URL}/api/subscription`)
  } catch {
    return null
  }
}

export async function createSubscription(planId: string): Promise<{ checkout_url: string }> {
  return request<{ checkout_url: string }>(`${API_BASE_URL}/api/subscription`, {
    method: 'POST',
    body: JSON.stringify({ plan_id: planId }),
  })
}

export async function cancelSubscription(): Promise<void> {
  await request<void>(`${API_BASE_URL}/api/subscription/cancel`, {
    method: 'POST',
  })
}

// ========== 订单 API ==========

export async function getOrders(): Promise<Order[]> {
  return request<Order[]>(`${API_BASE_URL}/api/orders`)
}

// ========== 用户认证 API ==========

export interface CurrentUser {
  id: string
  name: string
  email: string
  avatar?: string
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const data = await request<{ user: CurrentUser }>('/api/auth/me')
    return data.user
  } catch {
    return null
  }
}
