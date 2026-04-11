import React, { useState } from 'react'
import { Database, Activity, RefreshCw, Trash2, X, Play, Clock, PieChart, ShieldAlert, Share2, SearchCode, Eye } from 'lucide-react'

import TableTab from './ontology-tabs/TableTab'
import MapperTab from './ontology-tabs/MapperTab'
import AITab from './ontology-tabs/AITab'
import LineageTab from './ontology-tabs/LineageTab'
import QualityTab from './ontology-tabs/QualityTab'

export default function OntologyManagement() {
  const [activeTab, setActiveTab] = useState('개요')
  const [hoveredTrend, setHoveredTrend] = useState<{ month: string, x: number, total: number, vectorized: number, relations: number } | null>(null)
  const [hoveredPie, setHoveredPie] = useState<{ name: string, count: number, percent: number, color: string } | null>(null)

  const trendData = [
    { month: '1월', x: 0, total: 42, vectorized: 38, relations: 45 },
    { month: '2월', x: 9.09, total: 40, vectorized: 36, relations: 48 },
    { month: '3월', x: 18.18, total: 48, vectorized: 40, relations: 52 },
    { month: '4월', x: 27.27, total: 48, vectorized: 40, relations: 60 },
    { month: '5월', x: 36.36, total: 58, vectorized: 45, relations: 65 },
    { month: '6월', x: 45.45, total: 65, vectorized: 48, relations: 78 },
    { month: '7월', x: 54.54, total: 68, vectorized: 50, relations: 85 },
    { month: '8월', x: 63.63, total: 70, vectorized: 45, relations: 82 },
    { month: '9월', x: 72.72, total: 72, vectorized: 51, relations: 115 },
    { month: '10월', x: 81.81, total: 68, vectorized: 58, relations: 105 },
    { month: '11월', x: 90.9, total: 78, vectorized: 60, relations: 125 },
    { month: '12월', x: 100, total: 80, vectorized: 62, relations: 122 },
  ];

  const getPoints = (key: 'total'|'vectorized'|'relations') => {
    return trendData.map(d => `${d.x},${100 - (d[key] / 140 * 100)}`).join(' ');
  };

  return (
    <div className="flex-1 flex flex-col gap-4 p-6 bg-slate-50 h-full min-h-0 overflow-hidden relative">
      {/* 상단 헤더 & 컨트롤 영역 */}
      <div className="flex items-center justify-between mb-2 shrink-0 flex-wrap gap-4">
        <div>
          <h2 className="text-[20px] font-bold text-indigo-900 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-indigo-500" />
            온톨로지 관리
          </h2>
          <p className="text-xs text-slate-500 mt-1">실시간 데이터 통합 및 지능형 온톨로지 관리</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* 상태 인디케이터 */}
          <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-lg border border-slate-200 text-[11px] font-bold text-slate-600 shadow-sm">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /> 캐시: 16초 전</div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /> 스트림 활성</div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /> 소스: 활성</div>
          </div>
          
          {/* 액션 버튼 */}
          <button className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 rounded-lg text-xs font-bold transition-colors">
            <X className="w-3.5 h-3.5" /> 스트림 정지
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-bold transition-colors">
            <Activity className="w-3.5 h-3.5" /> 수동모드
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-xs font-bold shadow-sm transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> 강제 새로고침
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-bold transition-colors">
            <Trash2 className="w-3.5 h-3.5" /> 캐시 초기화
          </button>
        </div>
      </div>

      {/* 상단 5개 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 shrink-0">
        <div className="bg-[#EEF2FF] rounded-xl border border-[#E0E7FF] overflow-hidden shadow-sm flex flex-col relative">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-white/40">
            <span className="w-5 h-5 rounded-full bg-white/80 text-indigo-600 flex items-center justify-center text-xs font-bold">1</span>
            <span className="text-xs font-bold text-indigo-900">총 테이블</span>
          </div>
          <div className="p-4 flex flex-col items-center justify-center flex-1 z-10">
            <div className="text-3xl font-black text-indigo-600 mb-1">10</div>
            <div className="text-[11px] text-indigo-500 font-medium">개</div>
          </div>
          <Database className="absolute -left-2 -bottom-2 w-16 h-16 text-indigo-500/10 z-0" />
        </div>

        <div className="bg-[#F8FAFC] rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col relative">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-200/60">
            <span className="w-5 h-5 rounded-full bg-white text-fuchsia-600 flex items-center justify-center text-xs font-bold shadow-sm">2</span>
            <span className="text-xs font-bold text-fuchsia-900">벡터화 완료</span>
          </div>
          <div className="p-4 flex flex-col items-center justify-center flex-1 z-10">
            <div className="text-3xl font-black text-fuchsia-600 mb-1">7</div>
            <div className="text-[11px] text-fuchsia-500 font-medium">개</div>
          </div>
          <Database className="absolute -left-2 -bottom-2 w-16 h-16 text-fuchsia-500/10 z-0" />
        </div>

        <div className="bg-[#F0FDF4] rounded-xl border border-[#DCFCE7] overflow-hidden shadow-sm flex flex-col relative">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-white/40">
            <span className="w-5 h-5 rounded-full bg-white/80 text-emerald-600 flex items-center justify-center text-xs font-bold">3</span>
            <span className="text-xs font-bold text-emerald-900">품질 점수</span>
          </div>
          <div className="p-4 flex flex-col items-center justify-center flex-1 z-10">
            <div className="text-3xl font-black text-emerald-600 mb-1">90.5%</div>
            <div className="text-[11px] text-emerald-500 font-medium">평균</div>
          </div>
          <ShieldAlert className="absolute -left-2 -bottom-2 w-16 h-16 text-emerald-500/10 z-0" />
        </div>

        <div className="bg-[#FFF7ED] rounded-xl border border-[#FFEDD5] overflow-hidden shadow-sm flex flex-col relative">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-white/40">
            <span className="w-5 h-5 rounded-full bg-white/80 text-orange-600 flex items-center justify-center text-xs font-bold">4</span>
            <span className="text-xs font-bold text-orange-900">관계</span>
          </div>
          <div className="p-4 flex flex-col items-center justify-center flex-1 z-10">
            <div className="text-3xl font-black text-orange-600 mb-1">8</div>
            <div className="text-[11px] text-orange-500 font-medium">개</div>
          </div>
          <Share2 className="absolute -left-2 -bottom-2 w-16 h-16 text-orange-500/10 z-0" />
        </div>

        <div className="bg-[#F0FDF4] rounded-xl border border-[#DCFCE7] overflow-hidden shadow-sm flex flex-col relative">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-white/40">
            <span className="w-5 h-5 rounded-full bg-white/80 text-emerald-600 flex items-center justify-center text-xs font-bold">5</span>
            <span className="text-xs font-bold text-emerald-900">캐시 주기</span>
          </div>
          <div className="p-4 flex flex-col items-center justify-center flex-1 z-10">
            <div className="text-3xl font-black text-emerald-600 mb-1">15</div>
            <div className="text-[11px] text-emerald-500 font-medium">분</div>
          </div>
          <Clock className="absolute -left-2 -bottom-2 w-16 h-16 text-emerald-500/10 z-0" />
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div className="flex items-center justify-center border-b border-slate-200 shrink-0 bg-slate-50 sticky top-0 z-20 pb-0 mt-0">
        <div className="flex gap-6">
          <button 
            onClick={() => setActiveTab('개요')}
            className={`flex items-center gap-1.5 px-2 py-3 font-bold text-[13px] transition-colors ${activeTab === '개요' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <Eye className="w-4 h-4" /> 개요
          </button>
          <button 
            onClick={() => setActiveTab('테이블')}
            className={`flex items-center gap-1.5 px-2 py-3 font-bold text-[13px] transition-colors ${activeTab === '테이블' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <Database className="w-4 h-4" /> 테이블
          </button>
          <button 
            onClick={() => setActiveTab('관계 매퍼')}
            className={`flex items-center gap-1.5 px-2 py-3 font-bold text-[13px] transition-colors ${activeTab === '관계 매퍼' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <Share2 className="w-4 h-4" /> 관계 매퍼
          </button>
          <button 
            onClick={() => setActiveTab('AI')}
            className={`flex items-center gap-1.5 px-2 py-3 font-bold text-[13px] transition-colors ${activeTab === 'AI' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <SearchCode className="w-4 h-4" /> AI
          </button>
          <button 
            onClick={() => setActiveTab('리니지')}
            className={`flex items-center gap-1.5 px-2 py-3 font-bold text-[13px] transition-colors ${activeTab === '리니지' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <Share2 className="w-4 h-4 rotate-90" /> 리니지
          </button>
          <button 
            onClick={() => setActiveTab('품질')}
            className={`flex items-center gap-1.5 px-2 py-3 font-bold text-[13px] transition-colors ${activeTab === '품질' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <ShieldAlert className="w-4 h-4" /> 품질
          </button>
        </div>
      </div>

      {/* 메인 2단 대시보드 (개요 탭일때만 보임) */}
      {activeTab === '개요' && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0 pb-12 pt-4 overflow-y-auto pr-2 custom-scrollbar">
        {/* 좌측 컬럼 */}
        <div className="flex flex-col gap-4">
          
          {/* 시스템 현황 */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 text-indigo-700 font-bold mb-6">
              <Activity className="w-4 h-4" />
              <h3 className="text-[14px]">시스템 현황</h3>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between text-[13px] font-bold mb-2 text-slate-700">
                <span>벡터화 진행률</span>
                <span className="text-indigo-600">70%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                <div className="bg-gradient-to-r from-blue-500 to-[#B222DB] h-full rounded-full" style={{ width: '70%' }}></div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-xs text-slate-500 font-medium">마지막 동기화</span>
                <span className="text-xs font-bold text-slate-700">2026. 4. 4. 오후 1:49:19</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-xs text-slate-500 font-medium">평균 품질 점수</span>
                <span className="text-sm font-bold text-emerald-600">90.5%</span>
              </div>
            </div>
          </div>

          {/* 패턴 분석 */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex-1 flex flex-col relative h-[240px]">
            <div className="flex items-center gap-2 text-indigo-700 font-bold mb-2">
              <Activity className="w-4 h-4" />
              <h3 className="text-[14px]">데이터 품질 메트릭 변화</h3>
            </div>
            <p className="text-[10px] text-slate-400 mb-6">최근 10일간의 데이터 품질 지표별 추이를 표시합니다.</p>
            
            <div className="flex-1 relative w-full h-full flex items-end pt-4 pb-6 px-6">
              <div className="absolute left-6 top-4 bottom-6 w-px bg-slate-100 flex flex-col justify-between items-end pr-2 text-[9px] text-slate-400">
                <span>100</span><span>86</span><span>78</span><span>70</span>
              </div>
              <div className="absolute left-10 right-8 bottom-4 h-px bg-slate-100 flex justify-between pt-2 text-[9px] text-slate-400">
                <span>1일</span><span>2일</span><span>3일</span><span>4일</span><span>5일</span><span>6일</span><span>7일</span><span>8일</span><span>9일</span><span>10일</span>
              </div>
              
              {/* 차트 영역 래퍼 */}
              <div className="absolute left-10 right-8 top-4 bottom-6">
                {/* SVG 차트 (선) */}
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <polyline points="0,20 11.11,10 22.22,12 33.33,15 44.44,5 55.55,8 66.66,15 77.77,5 88.88,10 100,15" fill="none" stroke="#10B981" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                  <polyline points="0,5 11.11,3 22.22,10 33.33,18 44.44,15 55.55,12 66.66,8 77.77,15 88.88,18 100,10" fill="none" stroke="#3B82F6" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                  <polyline points="0,15 11.11,8 22.22,5 33.33,12 44.44,18 55.55,10 66.66,5 77.77,12 88.88,5 100,8" fill="none" stroke="#8B5CF6" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                  <polyline points="0,12 11.11,25 22.22,8 33.33,5 44.44,20 55.55,22 66.66,12 77.77,18 88.88,8 100,15" fill="none" stroke="#F59E0B" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                </svg>
                
                {/* Tooltip Hover Area */}
                <div className="absolute inset-0 flex justify-between">
                  {[0,1,2,3,4,5,6,7,8,9].map((i) => (
                    <div 
                      key={i} 
                      className="h-full w-8 -ml-4 flex items-center justify-center cursor-pointer group z-10"
                      onMouseEnter={() => setHoveredTrend({ month: `${i+1}일`, x: i * 11.11, total: 0, vectorized: 0, relations: 0 })}
                      onMouseLeave={() => setHoveredTrend(null)}
                    >
                      <div className="w-px h-full bg-indigo-200 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>

                {/* Custom Tooltip */}
                {hoveredTrend && (
                  <div 
                    className="absolute z-30 bg-white/95 backdrop-blur-sm border border-slate-200 shadow-lg rounded-lg p-2.5 w-32 pointer-events-none"
                    style={{ 
                      left: `${hoveredTrend.x}%`,
                      bottom: '50%',
                      transform: `translate(${hoveredTrend.x > 50 ? '-110%' : '10%'}, 50%)`
                    }}
                  >
                    <div className="text-[12px] font-black text-slate-800 mb-1.5 pb-1 border-b border-slate-100">{hoveredTrend.month}</div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#10B981]">완성도:</span>
                        <span className="text-[10px] font-bold text-slate-700">87.0%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#3B82F6]">정확도:</span>
                        <span className="text-[10px] font-bold text-slate-700">92.0%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#8B5CF6]">일관성:</span>
                        <span className="text-[10px] font-bold text-slate-700">85.0%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#F59E0B]">최신성:</span>
                        <span className="text-[10px] font-bold text-slate-700">80.0%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* 범례 */}
            <div className="absolute right-4 top-4 flex flex-col gap-2 bg-white p-2 text-[10px]">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded bg-emerald-500" />
                <div>
                  <div className="font-bold text-slate-700 leading-none">완성도</div>
                  <div className="text-[8px] text-slate-400 mt-0.5">필수 필드 채움 정도</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded bg-blue-500" />
                <div>
                  <div className="font-bold text-slate-700 leading-none">정확도</div>
                  <div className="text-[8px] text-slate-400 mt-0.5">오류 없음 및 검증 통과율</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded bg-purple-500" />
                <div>
                  <div className="font-bold text-slate-700 leading-none">일관성</div>
                  <div className="text-[8px] text-slate-400 mt-0.5">데이터 형식 일관성</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded bg-amber-500" />
                <div>
                  <div className="font-bold text-slate-700 leading-none">최신성</div>
                  <div className="text-[8px] text-slate-400 mt-0.5">데이터 업데이트 주기</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 우측 컬럼 */}
        <div className="flex flex-col gap-4">
          
          {/* 주의사항 */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 text-amber-600 font-bold mb-4">
              <ShieldAlert className="w-4 h-4" />
              <h3 className="text-[14px]">주의사항</h3>
            </div>
            
            <div className="bg-[#FEFCE8] border border-[#FEF08A] rounded-lg p-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-slate-800 mb-0.5">반품 마스터</div>
                <div className="text-[11px] text-slate-500">데이터 품질 점검 필요</div>
              </div>
              <div className="px-2 py-1 bg-[#FEF08A] text-amber-800 font-bold text-xs rounded border border-amber-300 shadow-sm">
                79.8%
              </div>
            </div>
          </div>

          {/* 관계 유형 분포 */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex-1 flex flex-col">
            <div className="flex items-center gap-2 text-fuchsia-700 font-bold mb-2">
              <Share2 className="w-4 h-4" />
              <h3 className="text-[14px]">관계 유형 분포</h3>
            </div>
            <p className="text-[10px] text-slate-400 mb-8 leading-relaxed">
              테이블 간 관계를 유형별로 분류하여 표시합니다. Foreign Key, Naming Pattern, Data Match, Inferred 등 각 관계 유형의 비율을 확인할 수 있습니다.
            </p>
            
            <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-8 relative">
              
              <div className="relative w-40 h-40 shrink-0 mx-auto sm:mx-0">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90 rounded-full drop-shadow-md">
                  {/* Background/Base */}
                  <circle cx="50" cy="50" r="50" fill="#f1f5f9" />
                  
                  {/* A855F7 (Purple): 45/100 -> 45% -> 0 to 162deg -> dasharray: 45 * 3.14 (circumference = 314.159) */}
                  <circle 
                    cx="50" cy="50" r="25" fill="none" stroke="#A855F7" strokeWidth="50" strokeDasharray="141.37 314.16" 
                    className="cursor-pointer transition-opacity hover:opacity-80 outline-none"
                    onMouseEnter={() => setHoveredPie({ name: 'Foreign Key', count: 45, percent: 45, color: '#A855F7' })}
                    onMouseLeave={() => setHoveredPie(null)}
                  />
                  
                  {/* 06B6D4 (Cyan): 30/100 -> 30% -> dashoffset: -141.37, dasharray: 30% of 314.16 = 94.24 */}
                  <circle 
                    cx="50" cy="50" r="25" fill="none" stroke="#06B6D4" strokeWidth="50" strokeDasharray="94.24 314.16" strokeDashoffset="-141.37" 
                    className="cursor-pointer transition-opacity hover:opacity-80 outline-none"
                    onMouseEnter={() => setHoveredPie({ name: 'Naming Pattern', count: 30, percent: 30, color: '#06B6D4' })}
                    onMouseLeave={() => setHoveredPie(null)}
                  />
                  
                  {/* F59E0B (Amber): 15/100 -> 15% -> dashoffset: -(141.37 + 94.24) = -235.61, dasharray: 15% of 314.16 = 47.12 */}
                  <circle 
                    cx="50" cy="50" r="25" fill="none" stroke="#F59E0B" strokeWidth="50" strokeDasharray="47.12 314.16" strokeDashoffset="-235.61" 
                    className="cursor-pointer transition-opacity hover:opacity-80 outline-none"
                    onMouseEnter={() => setHoveredPie({ name: 'Data Match', count: 15, percent: 15, color: '#F59E0B' })}
                    onMouseLeave={() => setHoveredPie(null)}
                  />
                  
                  {/* 10B981 (Emerald): 10/100 -> 10% -> dashoffset: -(235.61 + 47.12) = -282.73, dasharray: 10% of 314.16 = 31.42 */}
                  <circle 
                    cx="50" cy="50" r="25" fill="none" stroke="#10B981" strokeWidth="50" strokeDasharray="31.42 314.16" strokeDashoffset="-282.73" 
                    className="cursor-pointer transition-opacity hover:opacity-80 outline-none"
                    onMouseEnter={() => setHoveredPie({ name: 'Inferred', count: 10, percent: 10, color: '#10B981' })}
                    onMouseLeave={() => setHoveredPie(null)}
                  />
                  
                  {/* SVG Pie Chart lines for separation */}
                  <line x1="50" y1="50" x2="100" y2="50" stroke="white" strokeWidth="1.5" className="pointer-events-none" />
                  <line x1="50" y1="50" x2="34.55" y2="97.55" stroke="white" strokeWidth="1.5" className="pointer-events-none" />
                  <line x1="50" y1="50" x2="2.45" y2="65.45" stroke="white" strokeWidth="1.5" className="pointer-events-none" />
                  <line x1="50" y1="50" x2="20.6" y2="9.5" stroke="white" strokeWidth="1.5" className="pointer-events-none" />
                  {/* 중앙 십자 교차점 정리 */}
                  <circle cx="50" cy="50" r="0.5" fill="white" className="pointer-events-none" />
                </svg>

                {/* Pie Chart Tooltip */}
                {hoveredPie && (
                  <div 
                    className="absolute z-30 bg-white/95 backdrop-blur-sm border border-slate-200 shadow-xl rounded-xl p-3 w-36 pointer-events-none transition-all duration-200"
                    style={{
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <div className="flex items-center justify-center gap-1.5 mb-2 pb-2 border-b border-slate-100">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: hoveredPie.color }} />
                      <span className="text-[12px] font-bold leading-tight" style={{ color: hoveredPie.color }}>
                        {hoveredPie.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-slate-500 font-bold">비율</span>
                      <span className="font-bold text-slate-800">{hoveredPie.percent}%</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-bold">개수</span>
                      <span className="font-bold text-slate-800">{hoveredPie.count}개</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 우측 범례 */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#A855F7]" />
                  <div>
                    <div className="text-[11px] font-bold text-slate-800">Foreign Key (45개)</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">스키마에 정의된 외래키 관계</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#06B6D4]" />
                  <div>
                    <div className="text-[11px] font-bold text-slate-800">Naming Pattern (30개)</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">컬럼명 패턴으로 발견된 관계</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                  <div>
                    <div className="text-[11px] font-bold text-slate-800">Data Match (15개)</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">데이터 값 비교로 발견된 관계</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#10B981]" />
                  <div>
                    <div className="text-[11px] font-bold text-slate-800">Inferred (10개)</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">AI가 추론한 관계</div>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
      )}

      {/* 테이블 탭 */}
      {activeTab === '테이블' && (
        <div className="flex-1 overflow-y-auto mt-4 pb-12 pr-2 custom-scrollbar">
          <TableTab />
        </div>
      )}

      {/* 관계 매퍼 탭 */}
      {activeTab === '관계 매퍼' && (
        <div className="flex-1 overflow-y-auto mt-4 pb-12 pr-2 custom-scrollbar">
          <MapperTab />
        </div>
      )}

      {/* AI 탭 */}
      {activeTab === 'AI' && (
        <div className="flex-1 overflow-y-auto mt-4 pb-12 pr-2 custom-scrollbar">
          <AITab />
        </div>
      )}

      {/* 리니지 탭 */}
      {activeTab === '리니지' && (
        <div className="flex-1 overflow-y-auto mt-4 pb-12 pr-2 custom-scrollbar">
          <LineageTab />
        </div>
      )}

      {/* 품질 탭 */}
      {activeTab === '품질' && (
        <div className="flex-1 overflow-y-auto mt-4 pb-12 pr-2 custom-scrollbar">
          <QualityTab />
        </div>
      )}

      {/* 하단 플로팅 상태바 및 버튼 */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-white border-t border-slate-200 flex items-center px-6 gap-2 z-40 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
        <Activity className="w-4 h-4 text-slate-600" />
        <span className="text-[11px] font-bold text-slate-800">실시간 이벤트 스트림 & 데이터 소스 현황</span>
        <span className="px-2 py-0.5 bg-emerald-500 text-white rounded text-[10px] font-bold ml-2 shadow-sm">LIVE</span>
      </div>

    </div>
  )
}
