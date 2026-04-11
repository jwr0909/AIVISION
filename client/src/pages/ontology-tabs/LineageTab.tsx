import React, { useState } from 'react';
import { GitBranch, Activity, PlayCircle, Network, Building2, ShoppingCart, Package, Users, Wrench, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';

export default function LineageTab() {
  const [hoveredFlow, setHoveredFlow] = useState<{ month: string, x: number, flow: number } | null>(null);
  const [hoveredRadar, setHoveredRadar] = useState<{ name: string, value: string } | null>(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalyzed, setIsAnalyzed] = useState(false);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setIsAnalyzed(false);
    setTimeout(() => {
      setIsAnalyzing(false);
      setIsAnalyzed(true);
    }, 1500);
  };

  const flowData = [
    { month: '1월', x: 0, flow: 72 },
    { month: '2월', x: 10, flow: 66 },
    { month: '3월', x: 20, flow: 84 },
    { month: '4월', x: 30, flow: 90 },
    { month: '5월', x: 40, flow: 72 },
    { month: '6월', x: 50, flow: 66 },
    { month: '7월', x: 60, flow: 96 },
    { month: '8월', x: 70, flow: 102 },
    { month: '9월', x: 80, flow: 96 },
    { month: '10월', x: 90, flow: 72 },
    { month: '11월', x: 100, flow: 66 },
  ];

  const getFlowPoints = () => flowData.map(d => `${d.x},${100 - (d.flow / 120 * 100)}`).join(' ');
  const getFlowArea = () => `0,100 ` + getFlowPoints() + ` 100,100`;

  return (
    <div className="flex flex-col gap-4 p-1">
      {/* 상단 2개 차트 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 차트 1: 리니지 복잡도 분석 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col relative h-[280px]">
          <div className="flex items-center gap-2 text-indigo-700 font-bold mb-2">
            <GitBranch className="w-4 h-4" />
            <h3 className="text-[14px]">리니지 복잡도 분석</h3>
          </div>
          <p className="text-[10px] text-slate-400 mb-6">데이터의 리니지 복잡도를 기반으로 분류하여 표시합니다.</p>
          
          <div className="flex-1 relative w-full h-full flex items-center justify-center pt-2">
            <svg viewBox="-30 -30 160 160" className="w-48 h-48 overflow-visible">
              <polygon points="50,10 90,50 50,90 10,50" fill="none" stroke="#E2E8F0" strokeWidth="1" />
              <polygon points="50,25 75,50 50,75 25,50" fill="none" stroke="#E2E8F0" strokeWidth="1" />
              <polygon points="50,40 60,50 50,60 40,50" fill="none" stroke="#E2E8F0" strokeWidth="1" />
              
              <polygon 
                points="50,15 80,50 50,70 30,50" 
                fill="rgba(99, 102, 241, 0.4)" 
                stroke="#6366F1" 
                strokeWidth="2" 
                className="cursor-pointer transition-all hover:fill-[rgba(99,102,241,0.6)]"
                onMouseEnter={() => setHoveredRadar({ name: '전체 플로우', value: '45개' })}
                onMouseLeave={() => setHoveredRadar(null)}
              />
              
              {/* Radar hover points */}
              <circle cx="50" cy="15" r="4" fill="transparent" className="cursor-pointer" onMouseEnter={() => setHoveredRadar({ name: '단순 플로우', value: '35개' })} onMouseLeave={() => setHoveredRadar(null)} />
              <circle cx="80" cy="50" r="4" fill="transparent" className="cursor-pointer" onMouseEnter={() => setHoveredRadar({ name: '보통 플로우', value: '60개' })} onMouseLeave={() => setHoveredRadar(null)} />
              <circle cx="50" cy="70" r="4" fill="transparent" className="cursor-pointer" onMouseEnter={() => setHoveredRadar({ name: '복잡 플로우', value: '20개' })} onMouseLeave={() => setHoveredRadar(null)} />
              <circle cx="30" cy="50" r="4" fill="transparent" className="cursor-pointer" onMouseEnter={() => setHoveredRadar({ name: '고도화 플로우', value: '10개' })} onMouseLeave={() => setHoveredRadar(null)} />

              <line x1="50" y1="10" x2="50" y2="90" stroke="#E2E8F0" strokeWidth="1" className="pointer-events-none" />
              <line x1="10" y1="50" x2="90" y2="50" stroke="#E2E8F0" strokeWidth="1" className="pointer-events-none" />
              
              <text x="50" y="-5" className="text-[10px] font-bold fill-slate-500 pointer-events-none" textAnchor="middle">단순</text>
              <text x="100" y="53" className="text-[10px] font-bold fill-slate-500 pointer-events-none" textAnchor="start">보통</text>
              <text x="50" y="110" className="text-[10px] font-bold fill-slate-500 pointer-events-none" textAnchor="middle">복잡</text>
              <text x="0" y="53" className="text-[10px] font-bold fill-slate-500 pointer-events-none" textAnchor="end">고도화</text>
            </svg>

            {hoveredRadar && (
              <div 
                className="absolute z-20 bg-white/95 backdrop-blur-sm border border-indigo-100 shadow-xl rounded-xl p-2 w-28 text-center pointer-events-none transition-all duration-200"
                style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
              >
                <div className="text-[11px] font-bold text-slate-700 mb-0.5">{hoveredRadar.name}</div>
                <div className="text-[14px] font-black text-indigo-600">{hoveredRadar.value}</div>
              </div>
            )}
            
            <div className="absolute right-4 top-4 flex flex-col gap-1.5 bg-white/80 p-2 rounded border border-slate-100 text-[9px] shadow-sm">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded bg-indigo-500" />
                <span className="font-bold text-slate-600">데이터 플로우 수</span>
              </div>
            </div>
          </div>
        </div>

        {/* 차트 2: 데이터 플로우 추이 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col relative h-[280px]">
          <div className="flex items-center gap-2 text-blue-700 font-bold mb-2">
            <Activity className="w-4 h-4" />
            <h3 className="text-[14px]">데이터 플로우 추이</h3>
          </div>
          <p className="text-[10px] text-slate-400 mb-6">데이터의 리니지 수의 변화를 시계열로 표시합니다.</p>
          
          <div className="flex-1 relative w-full h-full flex items-end pt-4 pb-6 px-6">
            <div className="absolute left-6 top-4 bottom-6 w-px bg-slate-100 flex flex-col justify-between items-end pr-2 text-[9px] text-slate-400">
              <span>120</span><span>90</span><span>60</span><span>30</span><span>0</span>
            </div>
            <div className="absolute left-10 right-28 bottom-4 h-px bg-slate-100 flex justify-between pt-2 text-[9px] text-slate-400">
              <span>1월</span><span>3월</span><span>5월</span><span>7월</span><span>9월</span><span>11월</span>
            </div>
            
            {/* 차트 영역 래퍼 */}
            <div className="absolute left-10 right-28 top-4 bottom-6">
              {/* SVG 차트 (영역 및 선) */}
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <polygon points={getFlowArea()} fill="rgba(99, 102, 241, 0.2)" />
                <polyline points={getFlowPoints()} fill="none" stroke="#6366F1" strokeWidth="2" vectorEffect="non-scaling-stroke" />
              </svg>
              
              {/* SVG 차트 (점) */}
              <svg className="absolute inset-0 w-full h-full overflow-visible">
                {flowData.map(d => (
                  <circle key={d.month} cx={`${d.x}%`} cy={`${100 - (d.flow / 120 * 100)}%`} r="3.5" fill="#fff" stroke="#6366F1" strokeWidth="2" />
                ))}
              </svg>

              {/* Tooltip Hover Area */}
              <div className="absolute inset-0 flex justify-between">
                {flowData.map((d) => (
                  <div 
                    key={d.month} 
                    className="h-full w-8 -ml-4 flex items-center justify-center cursor-pointer group z-10"
                    onMouseEnter={() => setHoveredFlow(d)}
                    onMouseLeave={() => setHoveredFlow(null)}
                  >
                    <div className="w-px h-full bg-indigo-200 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>

              {/* Custom Tooltip */}
              {hoveredFlow && (
                <div 
                  className="absolute z-20 bg-white border-2 border-indigo-200 shadow-xl rounded-xl p-3 w-36 pointer-events-none transition-all duration-200"
                  style={{ 
                    left: `${hoveredFlow.x}%`,
                    bottom: '20%',
                    transform: `translate(${hoveredFlow.x > 50 ? '-110%' : '10%'}, 0)`
                  }}
                >
                  <div className="text-[13px] font-bold text-slate-800 mb-2 pb-2 border-b border-slate-100">{hoveredFlow.month}</div>
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#6366F1]" /><span className="text-slate-600 font-bold">플로우 수 :</span></div>
                    <span className="font-bold text-slate-800">{hoveredFlow.flow}개</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="absolute right-4 top-4 flex flex-col gap-1.5 bg-white/80 p-2 rounded border border-slate-100 text-[9px] shadow-sm">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded bg-indigo-500" />
                <span className="font-bold text-slate-600">데이터 플로우 수</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 데이터 리니지 시각화 섹션 (구현됨) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col min-h-[400px]">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-700 font-bold mb-1">
              <Network className="w-4 h-4" />
              <h3 className="text-[14px]">데이터 리니지 역추적 시뮬레이션</h3>
            </div>
            <p className="text-[11px] text-slate-500">결과 데이터(불량)의 발생 원인을 역추적하여 근본 원인을 파악합니다.</p>
          </div>
          
          {!isAnalyzed ? (
            <button 
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-70"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
              {isAnalyzing ? '리니지 분석 중...' : '불량 원인 역추적 시작'}
            </button>
          ) : (
            <button 
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors shadow-sm"
              onClick={() => setIsAnalyzed(false)}
            >
              <RefreshCw className="w-4 h-4" /> 초기화
            </button>
          )}
        </div>
        
        {/* 분석 전 상태 */}
        {!isAnalyzed && !isAnalyzing && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50/50">
            <Network className="w-16 h-16 text-slate-300 mb-4" />
            <h4 className="text-sm font-bold text-slate-700 mb-2">대기 중</h4>
            <p className="text-xs text-slate-500 text-center max-w-md mb-6">우측 상단의 버튼을 눌러 최신 불량 데이터의 원인 제공 파이프라인을 시각화하세요.</p>
          </div>
        )}

        {/* 로딩 상태 */}
        {isAnalyzing && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50/50">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
            <h4 className="text-sm font-bold text-indigo-700 mb-2">AI가 데이터 트리를 탐색 중입니다...</h4>
            <p className="text-xs text-slate-500 text-center max-w-md">불량 테이블에서부터 관련 속성을 역추적하고 있습니다.</p>
          </div>
        )}

        {/* 분석 완료 후 그래프 렌더링 */}
        {isAnalyzed && (
          <div className="flex-1 relative w-full min-h-[400px] bg-slate-50/30 overflow-x-auto overflow-y-hidden">
            <div className="relative w-full min-w-[800px] h-[400px]">
              
              {/* SVG 연결선 */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                <defs>
                  <marker id="arrowHead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#CBD5E1" />
                  </marker>
                  <marker id="arrowHeadHighlight" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#F43F5E" />
                  </marker>
                </defs>
                
                {/* 1단계 -> 2단계 */}
                <line x1="15%" y1="50%" x2="33%" y2="50%" stroke="#CBD5E1" strokeWidth="2" markerEnd="url(#arrowHead)" strokeDasharray="4 2" className="animate-[dash_1s_linear_infinite]" />
                
                {/* 2단계 -> 3단계 */}
                <line x1="33%" y1="50%" x2="55%" y2="28%" stroke="#CBD5E1" strokeWidth="2" markerEnd="url(#arrowHead)" strokeDasharray="4 2" className="animate-[dash_1s_linear_infinite]" />
                <line x1="33%" y1="50%" x2="55%" y2="72%" stroke="#CBD5E1" strokeWidth="2" markerEnd="url(#arrowHead)" strokeDasharray="4 2" className="animate-[dash_1s_linear_infinite]" />
                
                {/* 3단계 -> 4단계 */}
                <line x1="55%" y1="28%" x2="75%" y2="50%" stroke="#F43F5E" strokeWidth="2" markerEnd="url(#arrowHeadHighlight)" strokeDasharray="4 2" className="animate-[dash_1s_linear_infinite]" />
                <line x1="55%" y1="72%" x2="75%" y2="50%" stroke="#CBD5E1" strokeWidth="2" markerEnd="url(#arrowHead)" strokeDasharray="4 2" className="animate-[dash_1s_linear_infinite]" />
                
                {/* 4단계 -> 5단계 (타겟) */}
                <line x1="75%" y1="50%" x2="92%" y2="50%" stroke="#F43F5E" strokeWidth="2" markerEnd="url(#arrowHeadHighlight)" strokeDasharray="4 2" className="animate-[dash_1s_linear_infinite]" />
              </svg>

              {/* 노드들 */}
              {/* 1단계 */}
              <div className="absolute left-[15%] top-[50%] transform -translate-x-1/2 -translate-y-1/2 bg-white border border-slate-200 rounded-xl shadow-sm p-3 w-36 z-10 flex gap-3 items-center">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Building2 className="w-4 h-4" /></div>
                <div className="flex flex-col"><span className="text-[11px] font-bold text-slate-700 whitespace-nowrap">거래처 마스터</span><span className="text-[9px] text-slate-400 whitespace-nowrap">원자재 공급처</span></div>
              </div>

              {/* 2단계 */}
              <div className="absolute left-[33%] top-[50%] transform -translate-x-1/2 -translate-y-1/2 bg-white border border-slate-200 rounded-xl shadow-sm p-3 w-36 z-10 flex gap-3 items-center">
                <div className="p-2 bg-teal-50 text-teal-600 rounded-lg"><ShoppingCart className="w-4 h-4" /></div>
                <div className="flex flex-col"><span className="text-[11px] font-bold text-slate-700 whitespace-nowrap">구매 마스터</span><span className="text-[9px] text-slate-400 whitespace-nowrap">자재 입고 내역</span></div>
              </div>

              {/* 3단계 */}
              <div className="absolute left-[55%] top-[28%] transform -translate-x-1/2 -translate-y-1/2 bg-white border-2 border-rose-300 rounded-xl shadow-md shadow-rose-100 p-3 w-[150px] z-10 flex gap-3 items-center">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Package className="w-4 h-4" /></div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-rose-600 whitespace-nowrap">품목 마스터 (원인)</span>
                  <span className="text-[9px] text-slate-400 whitespace-nowrap">A자재 불량 로트</span>
                </div>
              </div>
              
              <div className="absolute left-[55%] top-[72%] transform -translate-x-1/2 -translate-y-1/2 bg-white border border-slate-200 rounded-xl shadow-sm p-3 w-36 z-10 flex gap-3 items-center">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Users className="w-4 h-4" /></div>
                <div className="flex flex-col"><span className="text-[11px] font-bold text-slate-700 whitespace-nowrap">사원 마스터</span><span className="text-[9px] text-slate-400 whitespace-nowrap">작업자 정보</span></div>
              </div>

              {/* 4단계 */}
              <div className="absolute left-[75%] top-[50%] transform -translate-x-1/2 -translate-y-1/2 bg-white border-2 border-rose-300 rounded-xl shadow-md shadow-rose-100 p-3 w-36 z-10 flex gap-3 items-center">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Wrench className="w-4 h-4" /></div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-700 whitespace-nowrap">작업실적 마스터</span>
                  <span className="text-[9px] text-rose-500 font-bold whitespace-nowrap">오류 공정 전파</span>
                </div>
              </div>

              {/* 5단계 (최종 타겟) */}
              <div className="absolute left-[92%] top-[50%] transform -translate-x-1/2 -translate-y-1/2 bg-rose-50 border-2 border-rose-500 rounded-xl shadow-lg p-3 w-40 z-10 flex gap-3 items-center ring-4 ring-rose-500/20">
                <div className="p-2 bg-rose-500 text-white rounded-lg"><AlertTriangle className="w-5 h-5" /></div>
                <div className="flex flex-col">
                  <span className="text-[12px] font-black text-rose-700 whitespace-nowrap">불량 마스터</span>
                  <span className="text-[10px] text-rose-600 font-bold whitespace-nowrap">최종 불량 판정</span>
                </div>
              </div>
              
            </div>
            <style>{`
              @keyframes dash {
                to {
                  stroke-dashoffset: -12;
                }
              }
            `}</style>
          </div>
        )}
      </div>
    </div>
  );
}
