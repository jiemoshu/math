/**
 * Next.js Middleware - 路由保护
 *
 * 功能:
 * - 未登录用户访问受保护页面时，重定向到登录页
 * - 已登录用户访问登录页时，重定向到首页
 *
 * 受保护路由: 除 /login 和 /api/auth/* 外的所有路由
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getIronSession } from 'iron-session'
import { sessionOptions, SessionData } from '@/lib/session'

// 公开路由（无需登录）
const PUBLIC_ROUTES = ['/login', '/api/auth']

// 静态资源路径
const STATIC_PATHS = ['/_next', '/favicon.ico', '/static']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 跳过静态资源
  if (STATIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // 检查是否为公开路由
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route))

  // 获取 session
  const response = NextResponse.next()
  const session = await getIronSession<SessionData>(request, response, sessionOptions)
  const isLoggedIn = !!session.user

  // 未登录用户访问受保护页面 -> 重定向到登录页
  if (!isLoggedIn && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url)
    // 保存原始 URL，登录后可以跳回
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 已登录用户访问登录页 -> 重定向到首页
  if (isLoggedIn && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

// 配置 matcher，指定哪些路由需要经过 middleware
export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了:
     * - _next/static (静态文件)
     * - _next/image (图片优化)
     * - favicon.ico (网站图标)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
