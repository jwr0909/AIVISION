import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Home,
  HelpCircle,
  Shield,
  FileCheck,
  Cookie,
  LayoutDashboard,
  Factory,
  Eye,
  Award,
} from 'lucide-react'
import { cn } from '../lib/utils'

const Sidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const menuItems = [
    { icon: Home,            label: '홈',        path: '/' },
    { icon: LayoutDashboard, label: '대시보드',   path: '/sf-dashboard' },
    { icon: Factory,         label: '작업실적',   path: '/sf-production' },
    { icon: Eye,             label: 'AI 비전',    path: '/sf-vision' },
  ]

  const supportItems = [
    { icon: HelpCircle, label: 'FAQ',      path: '/help-center' },
    { icon: Shield,     label: '개인정보', path: '/privacy-policy' },
    { icon: FileCheck,  label: '이용약관', path: '/terms-of-service' },
    { icon: Cookie,     label: '쿠키정책', path: '/cookie-policy' },
  ]

  return (
    <>
      {/* ─── 데스크탑 사이드바 ─── */}
      <div className="hidden md:flex w-14 h-full bg-gray-950 border-r border-gray-800/50 flex-col items-center py-3 shrink-0">

        {/* 로고 배지 */}
        <button
          onClick={() => navigate('/')}
          className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center mb-5 hover:bg-blue-500 transition-colors shrink-0"
          title="한국 품질재단 AI 스마트팩토리"
        >
          <Award className="w-5 h-5 text-white" />
        </button>

        {/* 메뉴 */}
        <div className="flex flex-col gap-1 flex-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path
            const isSf = item.path.startsWith('/sf-')
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center transition-all group relative',
                  isActive
                    ? isSf
                      ? 'bg-blue-700 text-white shadow-lg shadow-blue-900/40'
                      : 'bg-gray-800 text-white'
                    : isSf
                      ? 'text-blue-400/70 hover:text-blue-300 hover:bg-blue-900/30'
                      : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
                )}
                title={item.label}
              >
                <item.icon className="w-5 h-5" />
                {isActive && isSf && (
                  <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-blue-400 rounded-r-full" />
                )}
                <span className={cn(
                  'absolute left-full ml-3 px-2.5 py-1.5 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg z-50',
                  isSf
                    ? 'bg-blue-900 text-blue-100 border border-blue-700/50'
                    : 'bg-gray-800 text-white border border-gray-700/50'
                )}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>

        {/* 고객지원 (하단) */}
        <div className="flex flex-col gap-1 mt-auto pt-2 border-t border-gray-800/50">
          {supportItems.map((item) => (
            <a
              key={item.path}
              href={item.path}
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-all group relative text-gray-600 hover:text-gray-400 hover:bg-gray-800/50"
              title={item.label}
            >
              <item.icon className="w-4 h-4" />
              <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg border border-gray-700/50 z-50">
                {item.label}
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* ─── 모바일 하단 네비게이션 ─── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-gray-950 border-t border-gray-800/50 flex items-center justify-around z-50">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path
          const isSf = item.path.startsWith('/sf-')
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all',
                isActive
                  ? 'text-blue-400'
                  : isSf
                    ? 'text-blue-500/50 active:text-blue-300'
                    : 'text-gray-500 active:text-gray-300'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[9px] font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </>
  )
}

export default Sidebar
