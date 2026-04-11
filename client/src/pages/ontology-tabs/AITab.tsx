import React, { useState } from 'react';
import { Activity, BarChart2, Share2, Boxes, TrendingUp, Network, BookOpen, Fingerprint } from 'lucide-react';

const concepts = [
  { name: '거래처', count: 7, icon: BookOpen, attributes: ['거래처코드', '거래처명', '대표자명', '사업자번호', '연락처', '주소', '상태'], relatedTo: ['주문', '구매', '수출'] },
  { name: '품목', count: 9, icon: BookOpen, attributes: ['품목코드', '품목명', '규격', '단위', '안전재고', '단가', '구분', '사용여부', '비고'], relatedTo: ['작업실적', '불량', '주문', '구매'] },
  { name: '주문', count: 6, icon: BookOpen, attributes: ['주문번호', '일자', '납기일', '거래처코드', '담당자', '진행상태'], relatedTo: ['거래처', '품목', '출고'] },
  { name: '직원', count: 10, icon: BookOpen, attributes: ['사번', '이름', '부서', '직급', '입사일', '이메일', '연락처', '상태', '권한', '비고'], relatedTo: ['작업실적', '불량'] },
  { name: '구매', count: 9, icon: BookOpen, attributes: ['발주번호', '발주일', '거래처코드', '품목코드', '수량', '단가', '금액', '납기일', '상태'], relatedTo: ['거래처', '품목'] },
  { name: '수출', count: 4, icon: BookOpen, attributes: ['수출번호', '수출일자', '거래처코드', '도착항'], relatedTo: ['거래처', '출고'] },
  { name: '출고', count: 4, icon: BookOpen, attributes: ['출고번호', '출고일자', '주문번호', '출고수량'], relatedTo: ['주문', '품목'] },
  { name: '불량', count: 9, icon: BookOpen, attributes: ['불량번호', '발생일', '작업실적번호', '품목코드', '불량유형', '수량', '원인', '조치', '담당자'], relatedTo: ['작업실적', '품목', '직원'] },
  { name: '반품', count: 7, icon: BookOpen, attributes: ['반품번호', '반품일자', '출고번호', '품목코드', '수량', '사유', '상태'], relatedTo: ['출고', '품목', '거래처'] },
];

const inferredRelations = [
  { source: 'work_mst', target: 'item_mst', conf: 98, type: 'Foreign_key', color: 'bg-blue-600' },
  { source: 'bad_mst', target: 'item_mst', conf: 96, type: 'Foreign_key', color: 'bg-blue-600' },
  { source: 'bad_mst', target: 'work_mst', conf: 92, type: 'Inferred', color: 'bg-emerald-500' },
  { source: 'work_mst', target: 'emp_mst', conf: 95, type: 'Foreign_key', color: 'bg-blue-600' },
  { source: 'item_mst', target: 'cust_mst', conf: 89, type: 'Foreign_key', color: 'bg-blue-600' },
  { source: 'bad_mst', target: 'emp_mst', conf: 78, type: 'Inferred', color: 'bg-emerald-500' }
];

export default function AITab() {
  const [hoveredActivity, setHoveredActivity] = useState<{ time: string, x: number, query: number, vector: number } | null>(null);
  const [hoveredInference, setHoveredInference] = useState<{ time: string, x: number, inference: number, analysis: number } | null>(null);
  const [hoveredConcept, setHoveredConcept] = useState<string | null>(null);

  const activityData = [
    { time: '0h', x: 0, query: 480, vector: 144 },
    { time: '2h', x: 9.09, query: 560, vector: 168 },
    { time: '4h', x: 18.18, query: 640, vector: 192 },
    { time: '6h', x: 27.27, query: 480, vector: 144 },
    { time: '8h', x: 36.36, query: 560, vector: 168 },
    { time: '10h', x: 45.45, query: 640, vector: 192 },
    { time: '12h', x: 54.54, query: 400, vector: 120 },
    { time: '14h', x: 63.63, query: 320, vector: 96 },
    { time: '16h', x: 72.72, query: 480, vector: 144 },
    { time: '18h', x: 81.81, query: 800, vector: 240 },
    { time: '20h', x: 90.9, query: 240, vector: 72 },
    { time: '22h', x: 100, query: 160, vector: 48 },
  ];

  const inferenceData = [
    { time: '0h', x: 0, inference: 160, analysis: 80 },
    { time: '2h', x: 10, inference: 200, analysis: 96 },
    { time: '4h', x: 20, inference: 400, analysis: 80 },
    { time: '6h', x: 30, inference: 320, analysis: 64 },
    { time: '8h', x: 40, inference: 160, analysis: 80 },
    { time: '10h', x: 50, inference: 200, analysis: 96 },
    { time: '12h', x: 60, inference: 400, analysis: 64 },
    { time: '14h', x: 70, inference: 400, analysis: 80 },
    { time: '16h', x: 80, inference: 160, analysis: 64 },
    { time: '18h', x: 90, inference: 120, analysis: 48 },
    { time: '20h', x: 100, inference: 400, analysis: 80 },
  ];

  const getInferencePoints = (key: 'inference' | 'analysis') => 
    inferenceData.map(d => `${d.x},${100 - (d[key] / 800 * 100)}`).join(' ');
  const getInferenceArea = (key: 'inference' | 'analysis') => 
    `0,100 ` + getInferencePoints(key) + ` 100,100`;

  return (
    <div className="flex flex-col gap-4 p-1">
      {/* 상단 2개 차트 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 차트 1 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col relative h-[240px]">
          <div className="flex items-center gap-2 text-orange-600 font-bold mb-2">
            <Activity className="w-4 h-4" />
            <h3 className="text-[14px]">AI 플랫폼 활동</h3>
          </div>
          <p className="text-[10px] text-slate-400 mb-6">시간대별 AI 플랫폼의 활동량을 보여줍니다.</p>
          
          <div className="flex-1 relative w-full h-full flex items-end pt-4 pb-6 px-6">
            <div className="absolute left-6 top-4 bottom-6 w-px bg-slate-100 flex flex-col justify-between items-end pr-2 text-[9px] text-slate-400">
              <span>800</span><span>600</span><span>400</span><span>200</span><span>0</span>
            </div>
            
            {/* 차트 영역 래퍼 */}
            <div className="absolute left-10 right-24 bottom-6 top-4">
              <div className="absolute inset-0 flex items-end justify-between px-2">
                {activityData.map((d, i) => (
                  <div 
                    key={i} 
                    className="flex gap-1 items-end h-full group relative cursor-pointer"
                    onMouseEnter={() => setHoveredActivity(d)}
                    onMouseLeave={() => setHoveredActivity(null)}
                  >
                    <div className="w-3 bg-purple-500 rounded-t transition-colors group-hover:bg-purple-400" style={{ height: `${(d.vector / 800) * 100}%` }}></div>
                    <div className="w-3 bg-orange-400 rounded-t transition-colors group-hover:bg-orange-300" style={{ height: `${(d.query / 800) * 100}%` }}></div>
                  </div>
                ))}
              </div>

              {/* Custom Tooltip */}
              {hoveredActivity && (
                <div 
                  className="absolute z-20 bg-white border-2 border-orange-100 shadow-xl rounded-xl p-3 w-36 pointer-events-none transition-all duration-200"
                  style={{ 
                    left: `${hoveredActivity.x}%`,
                    bottom: '50%',
                    transform: `translate(${hoveredActivity.x > 50 ? '-110%' : '10%'}, 50%)`
                  }}
                >
                  <div className="text-[13px] font-bold text-slate-800 mb-2 pb-2 border-b border-slate-100">{hoveredActivity.time}</div>
                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-orange-400" /><span className="text-slate-600 font-bold">쿼리</span></div>
                    <span className="font-bold text-slate-800">{hoveredActivity.query}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-purple-500" /><span className="text-slate-600 font-bold">벡터화</span></div>
                    <span className="font-bold text-slate-800">{hoveredActivity.vector}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="absolute left-10 right-24 bottom-2 h-px bg-slate-100 flex justify-between text-[10px] text-slate-500 font-medium px-4">
              <span>0h</span><span>3h</span><span>6h</span><span>9h</span><span>12h</span><span>15h</span><span>18h</span><span>21h</span>
            </div>

            <div className="absolute right-4 top-4 flex flex-col gap-1.5 bg-white/80 p-2 rounded border border-slate-100 text-[9px] shadow-sm">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-orange-400" /><span className="font-bold text-slate-600">쿼리</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-purple-500" /><span className="font-bold text-slate-600">벡터화</span></div>
            </div>
          </div>
        </div>

        {/* 차트 2 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col relative h-[240px]">
          <div className="flex items-center gap-2 text-indigo-700 font-bold mb-2">
            <TrendingUp className="w-4 h-4" />
            <h3 className="text-[14px]">AI 추론 성능</h3>
          </div>
          <p className="text-[10px] text-slate-400 mb-6">시간대별 AI 추론 성능 지표입니다.</p>
          
          <div className="flex-1 relative w-full h-full flex items-end pt-4 pb-6 px-6">
            <div className="absolute left-6 top-4 bottom-6 w-px bg-slate-100 flex flex-col justify-between items-end pr-2 text-[9px] text-slate-400">
              <span>800</span><span>600</span><span>400</span><span>200</span><span>0</span>
            </div>
            <div className="absolute left-10 right-24 bottom-4 h-px bg-slate-100 flex justify-between pt-2 text-[9px] text-slate-400">
              <span>0h</span><span>4h</span><span>8h</span><span>12h</span><span>16h</span><span>20h</span>
            </div>
            
            {/* 차트 영역 래퍼 */}
            <div className="absolute left-10 right-24 top-4 bottom-6">
              {/* SVG 차트 (영역 및 선) */}
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <polygon points={getInferenceArea('inference')} fill="rgba(249, 115, 22, 0.2)" />
                <polyline points={getInferencePoints('inference')} fill="none" stroke="#F97316" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                
                <polygon points={getInferenceArea('analysis')} fill="rgba(168, 85, 247, 0.2)" />
                <polyline points={getInferencePoints('analysis')} fill="none" stroke="#A855F7" strokeWidth="2" vectorEffect="non-scaling-stroke" />
              </svg>
              
              {/* SVG 차트 (점) */}
              <svg className="absolute inset-0 w-full h-full overflow-visible">
                {inferenceData.map(d => (
                  <g key={d.time}>
                    <circle cx={`${d.x}%`} cy={`${100 - (d.inference / 800 * 100)}%`} r="3.5" fill="#fff" stroke="#F97316" strokeWidth="2" />
                    <circle cx={`${d.x}%`} cy={`${100 - (d.analysis / 800 * 100)}%`} r="3.5" fill="#fff" stroke="#A855F7" strokeWidth="2" />
                  </g>
                ))}
              </svg>

              {/* Tooltip Hover Area */}
              <div className="absolute inset-0 flex justify-between">
                {inferenceData.map((d) => (
                  <div 
                    key={d.time} 
                    className="h-full w-8 -ml-4 flex items-center justify-center cursor-pointer group z-10"
                    onMouseEnter={() => setHoveredInference(d)}
                    onMouseLeave={() => setHoveredInference(null)}
                  >
                    <div className="w-px h-full bg-indigo-200 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>

              {/* Custom Tooltip */}
              {hoveredInference && (
                <div 
                  className="absolute z-20 bg-white border-2 border-indigo-200 shadow-xl rounded-xl p-3 w-36 pointer-events-none transition-all duration-200"
                  style={{ 
                    left: `${hoveredInference.x}%`,
                    bottom: '20%',
                    transform: `translate(${hoveredInference.x > 50 ? '-110%' : '10%'}, 0)`
                  }}
                >
                  <div className="text-[13px] font-bold text-slate-800 mb-2 pb-2 border-b border-slate-100">{hoveredInference.time}</div>
                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#F97316]" /><span className="text-slate-600 font-bold">추론 수 :</span></div>
                    <span className="font-bold text-slate-800">{hoveredInference.inference}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#A855F7]" /><span className="text-slate-600 font-bold">분석 수 :</span></div>
                    <span className="font-bold text-slate-800">{hoveredInference.analysis}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="absolute right-4 top-4 flex flex-col gap-1.5 bg-white/80 p-2 rounded border border-slate-100 text-[9px] shadow-sm">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-orange-500" /><span className="font-bold text-slate-600">추론 수</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-purple-500" /><span className="font-bold text-slate-600">분석 수</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* 중간 통계 4장 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-2xl font-black text-fuchsia-600">7</span>
            <span className="text-[11px] font-bold text-slate-600">AI 추론 엔터티</span>
          </div>
          <Boxes className="w-8 h-8 text-fuchsia-500/20" />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-2xl font-black text-blue-600">90.5%</span>
            <span className="text-[11px] font-bold text-slate-600">추론 신뢰도</span>
          </div>
          <TrendingUp className="w-8 h-8 text-blue-500/20" />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-2xl font-black text-emerald-600">8</span>
            <span className="text-[11px] font-bold text-slate-600">자동 발견 매핑</span>
          </div>
          <Network className="w-8 h-8 text-emerald-500/20" />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-2xl font-black text-orange-600">81</span>
            <span className="text-[11px] font-bold text-slate-600">비즈니스 가치</span>
          </div>
          <BarChart2 className="w-8 h-8 text-orange-500/20" />
        </div>
      </div>

      {/* 온톨로지 개념 계층 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 relative overflow-hidden">
        <div className="flex items-center gap-2 mb-4 text-fuchsia-700 font-bold">
          <Fingerprint className="w-4 h-4" />
          <h3 className="text-[14px]">온톨로지 개념 계층</h3>
        </div>
        <p className="text-[11px] text-slate-500 mb-6">AI가 자동으로 발견한 핵심 비즈니스 개념 및 관계</p>

        <div className="mb-8">
          <h4 className="text-xs font-bold text-indigo-900 mb-3">핵심 비즈니스 개념</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative">
            {concepts.map((concept, i) => (
              <div 
                key={i} 
                className="flex flex-col gap-1 p-3 bg-slate-50 border border-slate-100 rounded-lg hover:border-indigo-200 hover:shadow-sm transition-all cursor-help relative group"
                onMouseEnter={() => setHoveredConcept(concept.name)}
                onMouseLeave={() => setHoveredConcept(null)}
              >
                <div className="flex items-center gap-1.5 font-bold text-slate-700 text-[13px]">
                  <concept.icon className="w-3.5 h-3.5 text-indigo-500" />
                  {concept.name}
                </div>
                <div className="text-[10px] text-slate-400 pl-5">{concept.count} 속성</div>

                {/* Tooltip */}
                {hoveredConcept === concept.name && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-white border border-slate-200 shadow-xl rounded-lg p-3 z-50 pointer-events-none">
                    <div className="text-xs font-bold text-indigo-900 mb-2 pb-1.5 border-b border-slate-100">AI가 분석한 개념 상세</div>
                    <div className="mb-2.5">
                      <span className="text-[10px] font-bold text-slate-500 block mb-1">포함된 주요 속성 ({concept.count}개)</span>
                      <div className="flex flex-wrap gap-1">
                        {concept.attributes.map((attr, idx) => (
                          <span key={idx} className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{attr}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 block mb-1">시맨틱 연결 엔터티</span>
                      <div className="flex flex-wrap gap-1">
                        {concept.relatedTo.map((rel, idx) => (
                          <span key={idx} className="text-[9px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded border border-indigo-100">{rel}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-emerald-900 mb-3">자동 발견된 관계</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inferredRelations.map((rel, i) => (
              <div key={i} className="flex flex-col gap-2 pb-3 border-b border-slate-100 last:border-0">
                <div className="flex items-center gap-4 text-sm font-bold text-slate-700">
                  <span>{rel.source}</span>
                  <div className="flex-1 h-px bg-slate-200 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-[10px] text-slate-400">CONNECT</div>
                  </div>
                  <span>{rel.target}</span>
                </div>
                <div className="flex justify-between items-center px-1">
                  <span className={`text-[10px] text-white font-bold px-1.5 py-0.5 rounded ${rel.color}`}>{rel.type}</span>
                  <span className="text-[10px] text-slate-500 font-bold">{rel.conf}% 신뢰도</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}