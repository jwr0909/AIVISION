import React from 'react'
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
  Award,
  Cpu,
} from 'lucide-react'
import Footer from '../components/Footer'

const Home = () => {
  const navigate = useNavigate()

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

  return (
    <div className="flex-1 overflow-auto bg-gray-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* ── 헤더 ── */}
        <div className="text-center mb-8 sm:mb-12">
          {/* 기관 배지 */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3 sm:mb-4">
            <Award className="w-3.5 h-3.5" />
            한국 품질재단 (KFQ) 공식 실습 플랫폼
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight mb-3">
            제조 AI 데이터분석
            <span className="text-blue-400 ml-2">스마트팩토리 실습</span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            AI 비전 불량 검사 · MES 작업실적 관리 · 생산 대시보드부터
            PDF 문서 편집·AI 동영상 제작까지 통합 실습 환경을 제공합니다
          </p>

          {/* 통계 뱃지 */}
          <div className="flex items-center justify-center gap-4 mt-5 flex-wrap">
            {[
              { label: '실습 모듈', value: '6개' },
              { label: 'AI 기능', value: '10+' },
              { label: '스마트팩토리', value: '3종' },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/60 rounded-lg border border-gray-700/40">
                <span className="text-blue-400 font-bold text-sm">{stat.value}</span>
                <span className="text-gray-500 text-xs">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── 제조 AI 스마트팩토리 실습 섹션 ── */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center shrink-0">
              <Cpu className="w-3 h-3 text-white" />
            </div>
            <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">
              스마트팩토리 실습 모듈
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sfCards.map((card) => (
              <button
                key={card.path}
                onClick={() => navigate(card.path)}
                className="w-full bg-gray-900/60 border border-gray-800/60 rounded-xl p-4 sm:p-5 text-left hover:border-blue-500/40 hover:bg-blue-500/5 active:bg-gray-800/40 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                    <card.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-medium text-sm">{card.title}</h3>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 font-medium shrink-0">
                        {card.badge}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs leading-relaxed">{card.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── 데이터 흐름 ── */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-4 text-center">
            제조 AI 데이터 처리 흐름
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
            {workflowSteps.map((step, i, arr) => (
              <React.Fragment key={step.text}>
                <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg px-4 py-2.5 w-full sm:w-auto justify-center">
                  <step.icon className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="text-gray-300 text-sm whitespace-nowrap">{step.text}</span>
                </div>
                {i < arr.length - 1 && (
                  <>
                    <ArrowDown className="w-4 h-4 text-gray-600 shrink-0 sm:hidden" />
                    <ArrowRight className="w-4 h-4 text-gray-600 shrink-0 hidden sm:block" />
                  </>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

      </div>
      <Footer />
    </div>
  )
}

export default Home
