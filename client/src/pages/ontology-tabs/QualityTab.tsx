import React, { useState } from 'react';
import { Activity, ShieldAlert, BarChart3 } from 'lucide-react';

const tableQuality = [
  { name: '거래처 마스터', score: 99, color: 'bg-emerald-500' },
  { name: '품목 마스터', score: 90, color: 'bg-blue-500' },
  { name: '작업실적 마스터', score: 90, color: 'bg-indigo-500' },
  { name: '불량 마스터', score: 95, color: 'bg-purple-500' },
  { name: '사원 마스터', score: 85, color: 'bg-rose-500' },
];

export default function QualityTab() {
  const [hoveredTrend, setHoveredTrend] = useState<{ month: string, x: number, complete: number, accurate: number, consistent: number, recent: number } | null>(null);

  const trendData = [
    { month: '1월', x: 0, complete: 85, accurate: 75, consistent: 70, recent: 60 },
    { month: '2월', x: 11.11, complete: 90, accurate: 80, consistent: 65, recent: 70 },
    { month: '3월', x: 22.22, complete: 88, accurate: 85, consistent: 70, recent: 65 },
    { month: '4월', x: 33.33, complete: 85, accurate: 75, consistent: 65, recent: 55 },
    { month: '5월', x: 44.44, complete: 95, accurate: 85, consistent: 55, recent: 60 },
    { month: '6월', x: 55.55, complete: 92, accurate: 80, consistent: 65, recent: 70 },
    { month: '7월', x: 66.66, complete: 85, accurate: 90, consistent: 70, recent: 55 },
    { month: '8월', x: 77.77, complete: 95, accurate: 85, consistent: 60, recent: 65 },
    { month: '9월', x: 88.88, complete: 90, accurate: 80, consistent: 65, recent: 70 },
    { month: '10월', x: 100, complete: 85, accurate: 75, consistent: 70, recent: 60 }
  ];

  const getPoints = (key: 'complete'|'accurate'|'consistent'|'recent') => {
    return trendData.map(d => `${d.x},${100 - d[key]}`).join(' ');
  };

  return (
    <div className="flex flex-col gap-4 p-1">
      {/* 상단 2개 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 차트 1: 데이터 품질 추이 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col relative h-[240px]">
          <div className="flex items-center gap-2 text-indigo-700 font-bold mb-2">
            <Activity className="w-4 h-4" />
            <h3 className="text-[14px]">데이터 품질 추이</h3>
          </div>
          <p className="text-[10px] text-slate-400 mb-6">주간 단위의 데이터 품질 지표별 변화 추이를 표시합니다.</p>
          
          <div className="flex-1 relative w-full h-full flex items-end pt-4 pb-6 px-6">
            <div className="absolute left-6 top-4 bottom-6 w-px bg-slate-100 flex flex-col justify-between items-end pr-2 text-[9px] text-slate-400">
              <span>100</span><span>80</span><span>60</span><span>40</span><span>20</span><span>0</span>
            </div>
            <div className="absolute left-10 right-28 bottom-4 h-px bg-slate-100 flex justify-between pt-2 text-[9px] text-slate-400">
              <span>1월</span><span>2월</span><span>3월</span><span>4월</span><span>5월</span><span>6월</span><span>7월</span><span>8월</span><span>9월</span><span>10월</span>
            </div>
            
            {/* 차트 영역 래퍼 */}
            <div className="absolute left-10 right-28 top-4 bottom-6">
              {/* SVG 차트 (선) */}
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <polyline points={getPoints('complete')} fill="none" stroke="#10B981" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                <polyline points={getPoints('accurate')} fill="none" stroke="#3B82F6" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                <polyline points={getPoints('consistent')} fill="none" stroke="#8B5CF6" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                <polyline points={getPoints('recent')} fill="none" stroke="#F59E0B" strokeWidth="2" vectorEffect="non-scaling-stroke" />
              </svg>
              
              {/* SVG 차트 (점) */}
              <svg className="absolute inset-0 w-full h-full overflow-visible">
                {trendData.map(d => (
                  <g key={d.month}>
                    <circle cx={`${d.x}%`} cy={`${100 - d.complete}%`} r="3.5" fill="#fff" stroke="#10B981" strokeWidth="2" />
                    <circle cx={`${d.x}%`} cy={`${100 - d.accurate}%`} r="3.5" fill="#fff" stroke="#3B82F6" strokeWidth="2" />
                    <circle cx={`${d.x}%`} cy={`${100 - d.consistent}%`} r="3.5" fill="#fff" stroke="#8B5CF6" strokeWidth="2" />
                    <circle cx={`${d.x}%`} cy={`${100 - d.recent}%`} r="3.5" fill="#fff" stroke="#F59E0B" strokeWidth="2" />
                  </g>
                ))}
              </svg>

              {/* Tooltip Hover Area */}
              <div className="absolute inset-0 flex justify-between">
                {trendData.map((d) => (
                  <div 
                    key={d.month} 
                    className="h-full w-8 -ml-4 flex items-center justify-center cursor-pointer group z-10"
                    onMouseEnter={() => setHoveredTrend(d)}
                    onMouseLeave={() => setHoveredTrend(null)}
                  >
                    <div className="w-px h-full bg-slate-200 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>

              {/* Custom Tooltip */}
              {hoveredTrend && (
                <div 
                  className="absolute z-20 bg-white border-2 border-slate-200 shadow-xl rounded-xl p-3 w-40 pointer-events-none transition-all duration-200"
                  style={{ 
                    left: `${hoveredTrend.x}%`,
                    bottom: '20%',
                    transform: `translate(${hoveredTrend.x > 50 ? '-110%' : '10%'}, 0)`
                  }}
                >
                <div className="text-[13px] font-bold text-slate-800 mb-2 pb-2 border-b border-slate-100">{hoveredTrend.month}</div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#10B981]" /><span className="text-slate-600 font-bold">완성도</span></div>
                    <span className="font-bold text-slate-800">{hoveredTrend.complete}%</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#3B82F6]" /><span className="text-slate-600 font-bold">정확도</span></div>
                    <span className="font-bold text-slate-800">{hoveredTrend.accurate}%</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#8B5CF6]" /><span className="text-slate-600 font-bold">일관성</span></div>
                    <span className="font-bold text-slate-800">{hoveredTrend.consistent}%</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#F59E0B]" /><span className="text-slate-600 font-bold">최신성</span></div>
                    <span className="font-bold text-slate-800">{hoveredTrend.recent}%</span>
                  </div>
                </div>
              </div>
            )}
            </div>
            
            <div className="absolute right-4 top-4 flex flex-col gap-1.5 bg-white/80 p-2 rounded border border-slate-100 text-[9px] shadow-sm">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="font-bold text-slate-600">완성도</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /><span className="font-bold text-slate-600">정확도</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-purple-500" /><span className="font-bold text-slate-600">일관성</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500" /><span className="font-bold text-slate-600">최신성</span></div>
            </div>
          </div>
        </div>

        {/* 차트 2: 테이블별 품질 점수 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col relative h-[240px]">
          <div className="flex items-center gap-2 text-emerald-700 font-bold mb-2">
            <ShieldAlert className="w-4 h-4" />
            <h3 className="text-[14px]">테이블별 품질 점수</h3>
          </div>
          <p className="text-[10px] text-slate-400 mb-6">각 테이블의 평균 품질 점수를 게이지로 표시합니다.</p>
          
          <div className="flex-1 flex items-center justify-between px-8">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
                <path d="M 10,50 A 40,40 0 0,1 90,50" fill="none" stroke="#F1F5F9" strokeWidth="15" strokeLinecap="round" />
                <path d="M 10,50 A 40,40 0 0,1 90,50" fill="none" stroke="#10B981" strokeWidth="15" strokeLinecap="round" strokeDasharray="125" strokeDashoffset="12" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
                <span className="text-2xl font-black text-emerald-600">90.5</span>
                <span className="text-[10px] font-bold text-slate-500">평균 점수</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 flex-1 pl-12">
              {tableQuality.map((t, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-sm ${t.color}`} />
                    <span className="text-[11px] font-bold text-slate-700">{t.name}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">{t.score}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 하단 분포도 4개 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 완성도 분포도 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col relative h-[200px]">
          <div className="flex items-center gap-2 text-emerald-600 font-bold mb-2">
            <BarChart3 className="w-4 h-4" />
            <h3 className="text-[13px]">완성도 분포도</h3>
          </div>
          <p className="text-[10px] text-slate-400 mb-4">각 테이블의 완성도 점수를 구간별로 분류합니다.</p>
          <div className="flex-1 flex items-end justify-center gap-4 px-4 pt-4 pb-2">
            <div className="w-8 h-[20%] bg-emerald-400 rounded-t relative group cursor-pointer hover:bg-emerald-500 transition-colors">
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-emerald-600">2개</span>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">품목, 사원</div>
            </div>
            <div className="w-8 h-[0%] bg-emerald-400 rounded-t relative group cursor-pointer hover:bg-emerald-500 transition-colors">
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-emerald-600 opacity-0">0개</span>
            </div>
            <div className="w-8 h-[80%] bg-emerald-400 rounded-t relative group cursor-pointer hover:bg-emerald-500 transition-colors">
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-emerald-600">8개</span>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">작업실적 외 7개</div>
            </div>
            <div className="w-8 h-[80%] bg-emerald-400 rounded-t relative group cursor-pointer hover:bg-emerald-500 transition-colors">
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-emerald-600">8개</span>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">불량 외 7개</div>
            </div>
            <div className="w-8 h-[80%] bg-emerald-400 rounded-t relative group cursor-pointer hover:bg-emerald-500 transition-colors">
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-emerald-600">8개</span>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">거래처 외 7개</div>
            </div>
          </div>
          <div className="flex justify-center gap-4 text-[9px] text-slate-500">
            <span className="w-8 text-center">70-75</span>
            <span className="w-8 text-center">75-80</span>
            <span className="w-8 text-center">80-85</span>
            <span className="w-8 text-center">85-90</span>
            <span className="w-8 text-center">90-100</span>
          </div>
        </div>

        {/* 정확도 분포도 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col relative h-[200px]">
          <div className="flex items-center gap-2 text-blue-600 font-bold mb-2">
            <BarChart3 className="w-4 h-4" />
            <h3 className="text-[13px]">정확도 분포도</h3>
          </div>
          <p className="text-[10px] text-slate-400 mb-4">각 테이블의 정확도 점수를 구간별로 분류합니다.</p>
          <div className="flex-1 flex items-end justify-center gap-4 px-4 pt-4 pb-2">
            <div className="w-8 h-[0%] bg-blue-400 rounded-t relative group cursor-pointer hover:bg-blue-500 transition-colors">
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-blue-600 opacity-0">0개</span>
            </div>
            <div className="w-8 h-[0%] bg-blue-400 rounded-t relative group cursor-pointer hover:bg-blue-500 transition-colors">
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-blue-600 opacity-0">0개</span>
            </div>
            <div className="w-8 h-[60%] bg-blue-400 rounded-t relative group cursor-pointer hover:bg-blue-500 transition-colors">
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-blue-600">6개</span>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">작업실적 외 5개</div>
            </div>
            <div className="w-8 h-[90%] bg-blue-400 rounded-t relative group cursor-pointer hover:bg-blue-500 transition-colors">
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-blue-600">9개</span>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">불량 외 8개</div>
            </div>
            <div className="w-8 h-[70%] bg-blue-400 rounded-t relative group cursor-pointer hover:bg-blue-500 transition-colors">
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-blue-600">7개</span>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">품목 외 6개</div>
            </div>
          </div>
          <div className="flex justify-center gap-4 text-[9px] text-slate-500">
            <span className="w-8 text-center">70-75</span>
            <span className="w-8 text-center">75-80</span>
            <span className="w-8 text-center">80-85</span>
            <span className="w-8 text-center">85-90</span>
            <span className="w-8 text-center">90-100</span>
          </div>
        </div>

        {/* 일관성 분포도 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col relative h-[200px]">
          <div className="flex items-center gap-2 text-purple-600 font-bold mb-2">
            <BarChart3 className="w-4 h-4" />
            <h3 className="text-[13px]">일관성 분포도</h3>
          </div>
          <p className="text-[10px] text-slate-400 mb-4">각 테이블의 일관성 점수를 구간별로 분류합니다.</p>
          <div className="flex-1 flex items-end justify-center gap-4 px-4 pt-4 pb-2">
            <div className="w-8 h-[0%] bg-purple-400 rounded-t relative group cursor-pointer hover:bg-purple-500 transition-colors">
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-purple-600 opacity-0">0개</span>
            </div>
            <div className="w-8 h-[60%] bg-purple-400 rounded-t relative group cursor-pointer hover:bg-purple-500 transition-colors">
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-purple-600">6개</span>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">사원 외 5개</div>
            </div>
            <div className="w-8 h-[80%] bg-purple-400 rounded-t relative group cursor-pointer hover:bg-purple-500 transition-colors">
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-purple-600">8개</span>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">품목 외 7개</div>
            </div>
            <div className="w-8 h-[80%] bg-purple-400 rounded-t relative group cursor-pointer hover:bg-purple-500 transition-colors">
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-purple-600">8개</span>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">불량 외 7개</div>
            </div>
            <div className="w-8 h-[60%] bg-purple-400 rounded-t relative group cursor-pointer hover:bg-purple-500 transition-colors">
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-purple-600">6개</span>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">거래처 외 5개</div>
            </div>
          </div>
          <div className="flex justify-center gap-4 text-[9px] text-slate-500">
            <span className="w-8 text-center">70-75</span>
            <span className="w-8 text-center">75-80</span>
            <span className="w-8 text-center">80-85</span>
            <span className="w-8 text-center">85-90</span>
            <span className="w-8 text-center">90-100</span>
          </div>
        </div>

        {/* 최신성 분포도 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col relative h-[200px]">
          <div className="flex items-center gap-2 text-amber-600 font-bold mb-2">
            <BarChart3 className="w-4 h-4" />
            <h3 className="text-[13px]">최신성 분포도</h3>
          </div>
          <p className="text-[10px] text-slate-400 mb-4">각 테이블의 최신성 점수를 구간별로 분류합니다.</p>
          <div className="flex-1 flex items-end justify-center gap-4 px-4 pt-4 pb-2">
            <div className="w-8 h-[30%] bg-amber-400 rounded-t relative group cursor-pointer hover:bg-amber-500 transition-colors">
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-amber-600">3개</span>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">반품 외 2개</div>
            </div>
            <div className="w-8 h-[30%] bg-amber-400 rounded-t relative group cursor-pointer hover:bg-amber-500 transition-colors">
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-amber-600">3개</span>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">수출 외 2개</div>
            </div>
            <div className="w-8 h-[60%] bg-amber-400 rounded-t relative group cursor-pointer hover:bg-amber-500 transition-colors">
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-amber-600">6개</span>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">사원 외 5개</div>
            </div>
            <div className="w-8 h-[30%] bg-amber-400 rounded-t relative group cursor-pointer hover:bg-amber-500 transition-colors">
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-amber-600">3개</span>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">불량 외 2개</div>
            </div>
            <div className="w-8 h-[80%] bg-amber-400 rounded-t relative group cursor-pointer hover:bg-amber-500 transition-colors">
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-amber-600">8개</span>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">작업실적 외 7개</div>
            </div>
          </div>
          <div className="flex justify-center gap-4 text-[9px] text-slate-500">
            <span className="w-8 text-center">70-75</span>
            <span className="w-8 text-center">75-80</span>
            <span className="w-8 text-center">80-85</span>
            <span className="w-8 text-center">85-90</span>
            <span className="w-8 text-center">90-100</span>
          </div>
        </div>
      </div>
    </div>
  );
}