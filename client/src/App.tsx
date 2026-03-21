import React, { useState, useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, useLocation, useNavigate } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import Home from './pages/Home'

// 정책/고객지원 페이지
const HelpCenter    = lazy(() => import('./pages/HelpCenter'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const TermsOfService = lazy(() => import('./pages/TermsOfService'))
const CookiePolicy  = lazy(() => import('./pages/CookiePolicy'))

// 스마트팩토리 페이지
const SmartDashboard  = lazy(() => import('./pages/SmartDashboard'))
const WorkResult      = lazy(() => import('./pages/WorkResult'))
const VisionInspection = lazy(() => import('./pages/VisionInspection'))
const ItemMaster      = lazy(() => import('./pages/ItemMaster'))
const DefectType      = lazy(() => import('./pages/DefectType'))
const VisionSetting   = lazy(() => import('./pages/VisionSetting'))

const VALID_PATHS = [
  '/',
  '/help-center',
  '/privacy-policy',
  '/terms-of-service',
  '/cookie-policy',
  '/sf-dashboard',
  '/sf-production',
  '/sf-vision',
  '/sf-item-master',
  '/sf-defect-type',
  '/sf-vision-setting',
]

function SFLoading() {
  return (
    <div className="flex-1 flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <div className="text-slate-500 text-sm">로딩 중...</div>
      </div>
    </div>
  )
}

function PageManager() {
  const location = useLocation()
  const navigate  = useNavigate()
  const path      = location.pathname

  const [sfDashboardLoaded,   setSfDashboardLoaded]   = useState(false)
  const [sfProductionLoaded,  setSfProductionLoaded]  = useState(false)
  const [sfVisionLoaded,      setSfVisionLoaded]      = useState(false)
  const [sfItemMasterLoaded,  setSfItemMasterLoaded]  = useState(false)
  const [sfDefectTypeLoaded,  setSfDefectTypeLoaded]  = useState(false)
  const [sfVisionSettingLoaded, setSfVisionSettingLoaded] = useState(false)

  useEffect(() => {
    if (path === '/sf-dashboard')    setSfDashboardLoaded(true)
    if (path === '/sf-production')   setSfProductionLoaded(true)
    if (path === '/sf-vision')       setSfVisionLoaded(true)
    if (path === '/sf-item-master')  setSfItemMasterLoaded(true)
    if (path === '/sf-defect-type')  setSfDefectTypeLoaded(true)
    if (path === '/sf-vision-setting') setSfVisionSettingLoaded(true)
  }, [path])

  // 유효하지 않은 경로 → 홈으로
  useEffect(() => {
    if (!VALID_PATHS.includes(path)) navigate('/', { replace: true })
  }, [path, navigate])

  return (
    <>
      {/* 홈 */}
      <div
        className="flex-1 flex-col min-h-0 overflow-hidden"
        style={{ display: path === '/' ? 'flex' : 'none' }}
      >
        <Home />
      </div>

      {/* 정책/고객지원 */}
      {['/help-center', '/privacy-policy', '/terms-of-service', '/cookie-policy'].includes(path) && (
        <div className="flex-1 flex-col min-h-0 overflow-auto" style={{ display: 'flex' }}>
          <Suspense fallback={<div className="flex-1 flex items-center justify-center"><span className="text-gray-400 text-sm">로딩 중...</span></div>}>
            {path === '/help-center'      && <HelpCenter />}
            {path === '/privacy-policy'   && <PrivacyPolicy />}
            {path === '/terms-of-service' && <TermsOfService />}
            {path === '/cookie-policy'    && <CookiePolicy />}
          </Suspense>
        </div>
      )}

      {/* 스마트팩토리 — 대시보드 */}
      {sfDashboardLoaded && (
        <div className="flex-1 flex-col min-h-0 overflow-hidden" style={{ display: path === '/sf-dashboard' ? 'flex' : 'none' }}>
          <Suspense fallback={<SFLoading />}>
            <SmartDashboard />
          </Suspense>
        </div>
      )}

      {/* 스마트팩토리 — 작업실적 */}
      {sfProductionLoaded && (
        <div className="flex-1 flex-col min-h-0 overflow-hidden" style={{ display: path === '/sf-production' ? 'flex' : 'none' }}>
          <Suspense fallback={<SFLoading />}>
            <WorkResult />
          </Suspense>
        </div>
      )}

      {/* 스마트팩토리 — AI 비전 */}
      {sfVisionLoaded && (
        <div className="flex-1 flex-col min-h-0 overflow-hidden" style={{ display: path === '/sf-vision' ? 'flex' : 'none' }}>
          <Suspense fallback={<SFLoading />}>
            <VisionInspection />
          </Suspense>
        </div>
      )}

      {/* 스마트팩토리 — 품목등록 */}
      {sfItemMasterLoaded && (
        <div className="flex-1 flex-col min-h-0 overflow-hidden" style={{ display: path === '/sf-item-master' ? 'flex' : 'none' }}>
          <Suspense fallback={<SFLoading />}>
            <ItemMaster />
          </Suspense>
        </div>
      )}

      {/* 스마트팩토리 — 검사요청유형 */}
      {sfDefectTypeLoaded && (
        <div className="flex-1 flex-col min-h-0 overflow-hidden" style={{ display: path === '/sf-defect-type' ? 'flex' : 'none' }}>
          <Suspense fallback={<SFLoading />}>
            <DefectType />
          </Suspense>
        </div>
      )}

      {/* 스마트팩토리 — 비전 검사 설정 */}
      {sfVisionSettingLoaded && (
        <div className="flex-1 flex-col min-h-0 overflow-hidden" style={{ display: path === '/sf-vision-setting' ? 'flex' : 'none' }}>
          <Suspense fallback={<SFLoading />}>
            <VisionSetting />
          </Suspense>
        </div>
      )}
    </>
  )
}

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AppLayout>
        <PageManager />
      </AppLayout>
    </BrowserRouter>
  )
}

export default App
