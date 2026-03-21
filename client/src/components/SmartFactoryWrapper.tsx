import React, { ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Factory, Eye, Bell, Package, ShieldAlert, Settings } from 'lucide-react'

interface SmartFactoryWrapperProps {
  children: ReactNode
}

const sfMenuItems = [
  { path: '/sf-dashboard',   label: '대시보드',    description: '생산 및 품질 현황' },
  { path: '/sf-production',  label: '작업실적입력', description: '생산 실적 등록' },
  { path: '/sf-vision',      label: 'AI 비전 검사', description: '불량 감지 모니터링' },
  { path: '/sf-vision-setting', label: '비전 설정',   description: 'AI 모델 학습 및 설정' },
  { path: '/sf-item-master', label: '품목등록',     description: '품목 마스터 관리' },
  { path: '/sf-defect-type', label: '검사요청유형', description: '불량유형 마스터 관리' },
]

const sfMenuIcons: Record<string, React.ElementType> = {
  '/sf-dashboard':   LayoutDashboard,
  '/sf-production':  Factory,
  '/sf-vision':      Eye,
  '/sf-vision-setting': Settings,
  '/sf-item-master': Package,
  '/sf-defect-type': ShieldAlert,
}

/**
 * 스마트팩토리 섹션 전용 래퍼
 * - 라이트 테마 CSS 변수 override
 * - 상단 헤더에 한국 품질재단 브랜딩 표시
 */
export default function SmartFactoryWrapper({ children }: SmartFactoryWrapperProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const currentMenu = sfMenuItems.find(m => m.path === location.pathname)

  return (
    <div className="sf-light flex flex-col h-full bg-slate-50">
      {/* 스마트팩토리 상단 헤더 */}
      <header className="h-12 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 shadow-sm">
        <div className="flex items-center h-full">
          <div className="flex items-center gap-2 mr-4">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white text-[10px] font-black">KQ</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-xs font-bold text-slate-700">한국 품질재단</span>
              <span className="text-xs text-blue-600 font-semibold ml-1.5">제조AI 스마트팩토리 실습</span>
            </div>
          </div>
          
          {/* 서브 탭 네비게이션 */}
          <nav className="flex items-center h-full gap-1 pt-1">
            {sfMenuItems.map((item) => {
              const isActive = location.pathname === item.path
              const Icon = sfMenuIcons[item.path]
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-1.5 px-3 h-full text-xs font-medium transition-colors border-b-2 mt-[1px] ${
                    isActive
                      ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2 text-slate-500">
          <button className="relative p-1.5 hover:bg-slate-100 rounded-md transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
          </button>
          <div className="text-right hidden sm:block">
            <div className="text-[10px] font-bold text-slate-600">{new Date().toLocaleDateString('ko-KR')}</div>
            <div className="text-[9px] text-slate-400">실습 환경</div>
          </div>
        </div>
      </header>

      {/* 페이지 콘텐츠 */}
      <div className="flex-1 overflow-auto p-4 lg:p-5">
        {children}
      </div>
    </div>
  )
}
