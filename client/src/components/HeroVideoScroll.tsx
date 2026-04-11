import React from 'react'
import { Award } from 'lucide-react'

interface HeroVideoScrollProps {
  scrollProgress: number;
}

export default function HeroVideoScroll({ scrollProgress }: HeroVideoScrollProps) {
  // 스크롤 진행률(0~1)에 따른 패럴랙스(시차) 및 투명도 계산
  const translateY = scrollProgress * 200 // 최대 200px 아래로 이동
  const opacity = Math.max(0, 1 - scrollProgress * 1.5) // 스크롤할수록 서서히 투명해짐

  return (
    <div className="relative w-full h-[85vh] sm:h-[90vh] overflow-hidden flex items-center justify-center bg-black">
      
      {/* 
        자동 재생되는 Animated WebP 비디오 배경 
        스크롤 시 패럴랙스 효과 (아래로 이동) 적용
      */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{ 
          transform: `translateY(${translateY}px)`,
          opacity: Math.max(0.2, 1 - scrollProgress) // 배경은 최소 20% 투명도 유지
        }}
      >
        <img
          src={`/hero.webp?v=${Date.now()}`}
          alt="Hero Background"
          className="w-full h-full object-cover opacity-60"
        />
      </div>
      
      {/* 히어로 텍스트 오버레이 (스크롤 시 위로 약간 올라가면서 투명해짐) */}
      <div 
        className="relative z-10 text-center px-4 flex flex-col items-center"
        style={{
          transform: `translateY(-${scrollProgress * 100}px)`,
          opacity: opacity
        }}
      >
        {/* 기관 배지 */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3 sm:mb-4 backdrop-blur-sm">
          <Award className="w-3.5 h-3.5" />
          한국 품질재단 (KFQ) 공식 실습 플랫폼
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4 drop-shadow-lg">
          제조 AI 데이터분석
          <span className="text-blue-400 ml-2">스마트팩토리 실습</span>
        </h1>
        <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed drop-shadow-md">
          AI 비전 불량 검사 · MES 작업실적 관리 · 생산 대시보드부터<br className="hidden sm:block" />
          PDF 문서 편집·AI 동영상 제작까지 통합 실습 환경을 제공합니다
        </p>

        {/* 통계 뱃지 */}
        <div className="flex items-center justify-center gap-4 mt-6 flex-wrap">
          {[
            { label: '실습 모듈', value: '6개' },
            { label: 'AI 기능', value: '10+' },
            { label: '스마트팩토리', value: '3종' },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-2 px-3 py-1.5 bg-gray-900/60 backdrop-blur-sm rounded-lg border border-gray-700/40">
              <span className="text-blue-400 font-bold text-sm">{stat.value}</span>
              <span className="text-gray-400 text-xs">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* 스크롤 유도 인디케이터 */}
      <div 
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center transition-opacity"
        style={{ opacity: 1 - scrollProgress * 3 }}
      >
        <span className="text-white text-xs mb-1.5 opacity-80">아래로 스크롤하세요</span>
        <div className="w-4 h-6 border-2 border-white/50 rounded-full flex justify-center p-0.5 animate-bounce">
          <div className="w-1 h-1.5 bg-white rounded-full" />
        </div>
      </div>
    </div>
  )
}
