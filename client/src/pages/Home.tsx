import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ScanLine,
  Upload,
  Download,
  ArrowRight,
  ArrowDown,
  Eraser,
  LayoutDashboard,
  Factory,
  Eye,
  BarChart2,
  Cpu,
} from 'lucide-react'
import Footer from '../components/Footer'
import HeroVideoScroll from '../components/HeroVideoScroll'

const Home = () => {
  const navigate = useNavigate()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  const handleScroll = () => {
    if (!scrollContainerRef.current) return
    const target = scrollContainerRef.current
    
    // 히어로 패럴랙스 영역의 가상 높이
    const animationHeight = 800
    
    // 현재 스크롤 위치 계산
    let progress = target.scrollTop / animationHeight
    
    // 진행률은 0 ~ 1 사이로 제한
    if (progress < 0) progress = 0
    if (progress > 1) progress = 1
    
    setScrollProgress(progress)
  }

  const workflowSteps = [
    { icon: Upload,    text: '데이터 업로드' },
    { icon: Eraser,    text: '전처리·정제' },
    { icon: ScanLine,  text: 'AI 분석·인식' },
    { icon: BarChart2, text: '시각화·리포트' },
    { icon: Download,  text: '결과 다운로드' },
  ]

  // 제조 AI 스마트팩토리 실습 메뉴
  const sfCards = [
    {
      icon: LayoutDashboard,
      title: '통합 대시보드',
      desc: '생산 라인 KPI, 불량률 Pareto 차트, 실시간 품질 현황을 한눈에 모니터링',
      path: '/sf-dashboard',
      gradient: 'from-blue-600 to-cyan-500',
      badge: '실시간',
    },
    {
      icon: Factory,
      title: '작업실적 등록',
      desc: 'MES 바코드/QR 스캔으로 공정별 생산 실적·불량 수량을 빠르게 등록·관리',
      path: '/sf-production',
      gradient: 'from-emerald-500 to-teal-500',
      badge: 'MES 연동',
    },
    {
      icon: Eye,
      title: 'AI 비전 검사',
      desc: '실시간 웹캠 AI 불량 감지, 신뢰도 스코어, 이미지 캡처 히스토리 로그',
      path: '/sf-vision',
      gradient: 'from-violet-500 to-purple-600',
      badge: 'AI 검사',
    },
  ]

  // 최상단 네비게이션 바 컴포넌트
  const TopNav = () => {
    return (
      <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-black">KQ</span>
          </div>
          <span className="font-bold text-white tracking-wide text-lg drop-shadow-md">품질재단 ERP</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => navigate('/sf-dashboard')} className="text-sm font-medium text-gray-200 hover:text-white transition-colors drop-shadow-md">통합 대시보드</button>
          <button onClick={() => navigate('/sf-item-master')} className="text-sm font-medium text-gray-200 hover:text-white transition-colors drop-shadow-md">기준정보 관리</button>
          <button onClick={() => navigate('/sf-production')} className="text-sm font-medium text-gray-200 hover:text-white transition-colors drop-shadow-md">작업실적 등록</button>
          <button onClick={() => navigate('/sf-vision')} className="text-sm font-medium text-gray-200 hover:text-white transition-colors drop-shadow-md">AI 비전 검사</button>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/sf-dashboard')} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-blue-600/30">
            실습 시작하기
          </button>
        </div>
      </nav>
    )
  }

  return (
    <div 
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto bg-gray-950 scroll-smooth relative"
    >
      <TopNav />
      {/* 히어로 애니메이션 스크롤 영역 */}
      <div className="relative w-full">
        <HeroVideoScroll scrollProgress={scrollProgress} />
      </div>

      {/* 메인 컨텐츠 영역 */}
      <div className="relative z-20 bg-gray-950 py-10 border-t border-gray-800/60 shadow-2xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          
          {/* ── 제조 AI 스마트팩토리 실습 섹션 ── */}
          <div className="mb-12 sm:mb-16">
            <div className="flex items-center gap-2 mb-6 sm:mb-8">
              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/20">
                <Cpu className="w-3.5 h-3.5 text-white" />
              </div>
              <h2 className="text-base font-semibold text-blue-400 uppercase tracking-wider">
                스마트팩토리 실습 모듈
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {sfCards.map((card) => (
                <button
                  key={card.path}
                  onClick={() => navigate(card.path)}
                  className="w-full bg-gray-900/60 border border-gray-800/60 rounded-xl p-5 sm:p-6 text-left hover:border-blue-500/40 hover:bg-blue-500/5 active:bg-gray-800/40 transition-all duration-300 group shadow-lg hover:shadow-blue-900/10"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300 shadow-inner`}>
                      <card.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="text-white font-medium text-base">{card.title}</h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 font-medium shrink-0 border border-blue-500/20">
                          {card.badge}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm leading-relaxed">{card.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ── 데이터 흐름 ── */}
          <div className="mb-12 sm:mb-16">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-6 text-center">
              제조 AI 데이터 처리 흐름
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              {workflowSteps.map((step, i, arr) => (
                <React.Fragment key={step.text}>
                  <div className="flex items-center gap-2.5 bg-gray-900/80 border border-gray-800 rounded-lg px-5 py-3 w-full sm:w-auto justify-center hover:bg-gray-800 transition-colors shadow-sm">
                    <step.icon className="w-5 h-5 text-blue-400 shrink-0" />
                    <span className="text-gray-300 text-sm font-medium whitespace-nowrap">{step.text}</span>
                  </div>
                  {i < arr.length - 1 && (
                    <>
                      <ArrowDown className="w-5 h-5 text-gray-600 shrink-0 sm:hidden" />
                      <ArrowRight className="w-5 h-5 text-gray-600 shrink-0 hidden sm:block" />
                    </>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

        </div>
        <Footer />
      </div>
    </div>
  )
}

export default Home
