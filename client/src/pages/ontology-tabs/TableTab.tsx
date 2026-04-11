import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ChevronDown, CheckCircle2, Database, Activity } from 'lucide-react';

const tableData = [
  { id: 'C', title: '거래처 마스터', name: 'cust_mst', desc: '고객 및 공급업체 정보', records: '1,250', columns: '4', quality: 99.6, days: 2, iconColor: 'bg-blue-500', path: null },
  { id: 'I', title: '품목 마스터', name: 'item_mst', desc: '제품 및 재료 정보', records: '3,480', columns: '4', quality: 90.3, days: 1, iconColor: 'bg-emerald-500', path: '/sf-item-master' },
  { id: 'E', title: '직원 마스터', name: 'emp_mst', desc: '직원 정보 및 조직도', records: '156', columns: '4', quality: 90.3, days: 3, iconColor: 'bg-amber-500', path: null },
  { id: 'O', title: '주문 마스터', name: 'od_mst', desc: '고객 주문 정보 관리', records: '5,680', columns: '4', quality: 95.7, days: 0, iconColor: 'bg-purple-500', path: null },
  { id: 'W', title: '작업실적 마스터', name: 'work_mst', desc: '생산 및 실적 관리', records: '2,340', columns: '4', quality: 90.3, days: 1, iconColor: 'bg-cyan-500', path: '/sf-production' },
  { id: 'T', title: '구매 마스터', name: 't_pur_mst', desc: '구매 발주 관리', records: '3,920', columns: '4', quality: 94.9, days: 0, iconColor: 'bg-rose-500', path: null },
  { id: 'T', title: '수출 마스터', name: 't_exp_mst', desc: '수출 관리', records: '890', columns: '4', quality: 88.2, days: 2, iconColor: 'bg-teal-500', path: null },
  { id: 'D', title: '출고 마스터', name: 'dg_mst', desc: '제품 출고 관리', records: '7,820', columns: '4', quality: 97.8, days: 0, iconColor: 'bg-indigo-500', path: null },
  { id: 'B', title: '불량 마스터', name: 'bad_mst', desc: '품질 불량(유형) 관리', records: '1,240', columns: '4', quality: 84.6, days: 1, iconColor: 'bg-slate-500', path: '/sf-defect-type' },
  { id: 'R', title: '반품 마스터', name: 'return_mst', desc: '제품 반품 관리', records: '340', columns: '4', quality: 79.8, days: 1, iconColor: 'bg-slate-600', path: null }
];

export default function TableTab() {
  const navigate = useNavigate();
  const [hoveredVector, setHoveredVector] = useState<{ month: string, x: number, total: number, vectorized: number } | null>(null);
  const [hoveredActivity, setHoveredActivity] = useState<{ month: string, x: number, tables: number, relations: number } | null>(null);
  const [vectorizedTables, setVectorizedTables] = useState<string[]>([]);

  React.useEffect(() => {
    const fetchVectorizedTables = () => {
      fetch('/api/data-analysis/vectorized-tables')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.tables) {
            setVectorizedTables(data.tables);
          }
        })
        .catch(err => console.error('벡터화 테이블 조회 실패:', err));
    };

    fetchVectorizedTables();
    
    // 2초마다 벡터화 상태 업데이트 (다른 탭/화면에서 업데이트된 내용 반영)
    const interval = setInterval(fetchVectorizedTables, 2000);
    return () => clearInterval(interval);
  }, []);

  const vectorData = [
    { month: '1월', x: 0, total: 40, vectorized: 28 },
    { month: '2월', x: 9.09, total: 55, vectorized: 35 },
    { month: '3월', x: 18.18, total: 45, vectorized: 38 },
    { month: '4월', x: 27.27, total: 68, vectorized: 52 },
    { month: '5월', x: 36.36, total: 70, vectorized: 48 },
    { month: '6월', x: 45.45, total: 72, vectorized: 52 },
    { month: '7월', x: 54.54, total: 68, vectorized: 54 },
    { month: '8월', x: 63.63, total: 70, vectorized: 52 },
    { month: '9월', x: 72.72, total: 72, vectorized: 60 },
    { month: '10월', x: 81.81, total: 68, vectorized: 70 },
    { month: '11월', x: 90.9, total: 70, vectorized: 68 },
    { month: '12월', x: 100, total: 88, vectorized: 68 }
  ];

  const activityData = [
    { month: '1월', x: 0, tables: 40, relations: 68 },
    { month: '2월', x: 9.09, tables: 55, relations: 85 },
    { month: '3월', x: 18.18, tables: 48, relations: 68 },
    { month: '4월', x: 27.27, tables: 68, relations: 85 },
    { month: '5월', x: 36.36, tables: 70, relations: 100 },
    { month: '6월', x: 45.45, tables: 72, relations: 100 },
    { month: '7월', x: 54.54, tables: 68, relations: 95 },
    { month: '8월', x: 63.63, tables: 70, relations: 120 },
    { month: '9월', x: 72.72, tables: 72, relations: 135 },
    { month: '10월', x: 81.81, tables: 68, relations: 105 },
    { month: '11월', x: 90.9, tables: 70, relations: 105 },
    { month: '12월', x: 100, tables: 88, relations: 115 }
  ];

  const getActivityArea = (key: 'tables'|'relations') => {
    const points = activityData.map(d => `${d.x},${100 - (d[key] / 140 * 100)}`);
    return `0,100 ${points.join(' ')} 100,100`;
  };

  const getActivityPoints = (key: 'tables'|'relations') => {
    return activityData.map(d => `${d.x},${100 - (d[key] / 140 * 100)}`).join(' ');
  };

  return (
    <div className="flex flex-col gap-4 p-1">
      {/* 상단 차트 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-2">
        {/* 차트 1: 테이블 벡터화 현황 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col relative h-[260px]">
          <div className="flex items-center gap-2 text-emerald-700 font-bold mb-2">
            <Database className="w-4 h-4" />
            <h3 className="text-[14px]">테이블 벡터화 현황</h3>
          </div>
          <p className="text-[10px] text-slate-400 mb-6">월별 전체 테이블 수와 벡터화된 테이블 수를 막대 그래프로 비교 표시합니다. 벡터화 진행률과 추이를 한눈에 확인할 수 있습니다.</p>
          
          <div className="flex-1 relative w-full h-full flex items-end pt-4 pb-6 px-6">
            <div className="absolute left-6 top-4 bottom-6 w-px bg-slate-100 flex flex-col justify-between items-end pr-2 text-[9px] text-slate-400">
              <span>100</span><span>75</span><span>50</span><span>25</span><span>0</span>
            </div>
            
            <div className="absolute left-10 right-32 top-4 bottom-6">
              <div className="absolute inset-0 flex items-end justify-between px-2">
                {vectorData.map((d, i) => (
                  <div 
                    key={i} 
                    className="flex gap-1 items-end h-full group relative cursor-pointer"
                    onMouseEnter={() => setHoveredVector(d)}
                    onMouseLeave={() => setHoveredVector(null)}
                  >
                    <div className="w-3 bg-emerald-500 rounded-t transition-colors group-hover:bg-emerald-400" style={{ height: `${(d.total / 100) * 100}%` }}></div>
                    <div className="w-3 bg-blue-500 rounded-t transition-colors group-hover:bg-blue-400" style={{ height: `${(d.vectorized / 100) * 100}%` }}></div>
                  </div>
                ))}
              </div>

              {/* Custom Tooltip */}
              {hoveredVector && (
                <div 
                  className="absolute z-20 bg-white border-2 border-emerald-100 shadow-xl rounded-xl p-3 w-40 pointer-events-none transition-all duration-200"
                  style={{ 
                    left: `${hoveredVector.x}%`,
                    bottom: '50%',
                    transform: `translate(${hoveredVector.x > 50 ? '-110%' : '10%'}, 50%)`
                  }}
                >
                  <div className="text-[13px] font-bold text-slate-800 mb-2 pb-2 border-b border-slate-100">{hoveredVector.month}</div>
                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-emerald-500" /><span className="text-slate-600 font-bold">전체 테이블</span></div>
                    <span className="font-bold text-slate-800">{hoveredVector.total}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-blue-500" /><span className="text-slate-600 font-bold">벡터화됨</span></div>
                    <span className="font-bold text-slate-800">{hoveredVector.vectorized}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="absolute left-10 right-32 bottom-2 h-px bg-slate-100 flex justify-between text-[10px] text-slate-500 font-medium px-3">
              <span>1월</span><span>2월</span><span>3월</span><span>4월</span><span>5월</span><span>6월</span><span>7월</span><span>8월</span><span>9월</span><span>10월</span><span>11월</span><span>12월</span>
            </div>
            
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-bold text-slate-500 tracking-widest">
              테이블 수
            </div>

            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 text-[10px] bg-white/90 p-2 rounded w-24">
              <div className="flex items-start gap-2">
                <div className="w-3 h-3 rounded-sm bg-emerald-500 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="font-bold text-slate-700 truncate">전체 테이블</div>
                  <div className="text-[8px] text-slate-400 whitespace-normal leading-tight mt-0.5">데이터베이스의 전체 테이블 수</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-3 h-3 rounded-sm bg-blue-500 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="font-bold text-slate-700 truncate">벡터화됨</div>
                  <div className="text-[8px] text-slate-400 whitespace-normal leading-tight mt-0.5">AI 검색 가능한 테이블 수</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 차트 2: 데이터 활동 추이 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col relative h-[260px]">
          <div className="flex items-center gap-2 text-indigo-700 font-bold mb-2">
            <Activity className="w-4 h-4" />
            <h3 className="text-[14px]">데이터 활동 추이</h3>
          </div>
          <p className="text-[10px] text-slate-400 mb-6">월별 테이블 수와 관계 수의 변화를 영역 차트로 표시합니다. 데이터베이스의 성장 패턴과 관계 형성 추이를 시각적으로 확인할 수 있습니다.</p>
          
          <div className="flex-1 relative w-full h-full flex items-end pt-4 pb-6 px-6">
            <div className="absolute left-6 top-4 bottom-6 w-px bg-slate-100 flex flex-col justify-between items-end pr-2 text-[9px] text-slate-400">
              <span>140</span><span>105</span><span>70</span><span>35</span><span>0</span>
            </div>
            
            {/* 차트 영역 래퍼 */}
            <div className="absolute left-10 right-32 top-4 bottom-6">
              {/* SVG 차트 (영역 및 선) */}
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <polygon points={getActivityArea('relations')} fill="rgba(245, 158, 11, 0.2)" />
                <polyline points={getActivityPoints('relations')} fill="none" stroke="#F59E0B" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                
                <polygon points={getActivityArea('tables')} fill="rgba(168, 85, 247, 0.2)" />
                <polyline points={getActivityPoints('tables')} fill="none" stroke="#A855F7" strokeWidth="2" vectorEffect="non-scaling-stroke" />
              </svg>
              
              {/* Tooltip Hover Area */}
              <div className="absolute inset-0 flex justify-between">
                {activityData.map((d) => (
                  <div 
                    key={d.month} 
                    className="h-full w-8 -ml-4 flex items-center justify-center cursor-pointer group z-10"
                    onMouseEnter={() => setHoveredActivity(d)}
                    onMouseLeave={() => setHoveredActivity(null)}
                  >
                    <div className="w-px h-full bg-indigo-200 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>

              {/* Custom Tooltip */}
              {hoveredActivity && (
                <div 
                  className="absolute z-20 bg-white border-2 border-indigo-200 shadow-xl rounded-xl p-3 w-40 pointer-events-none transition-all duration-200"
                  style={{ 
                    left: `${hoveredActivity.x}%`,
                    bottom: '20%',
                    transform: `translate(${hoveredActivity.x > 50 ? '-110%' : '10%'}, 0)`
                  }}
                >
                  <div className="text-[13px] font-bold text-slate-800 mb-2 pb-2 border-b border-slate-100">{hoveredActivity.month}</div>
                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#F59E0B]" /><span className="text-slate-600 font-bold">관계 수</span></div>
                    <span className="font-bold text-slate-800">{hoveredActivity.relations}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#A855F7]" /><span className="text-slate-600 font-bold">테이블 수</span></div>
                    <span className="font-bold text-slate-800">{hoveredActivity.tables}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="absolute left-10 right-32 bottom-2 h-px bg-slate-100 flex justify-between text-[10px] text-slate-500 font-medium">
              <span>1월</span><span>2월</span><span>3월</span><span>4월</span><span>5월</span><span>6월</span><span>7월</span><span>8월</span><span>9월</span><span>10월</span><span>11월</span><span>12월</span>
            </div>

            <div className="absolute -left-2 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-bold text-slate-500 tracking-widest">
              개수
            </div>

            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 text-[10px] bg-white/90 p-2 rounded w-24">
              <div className="flex items-start gap-2">
                <div className="w-3 h-3 rounded-sm bg-purple-500 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="font-bold text-slate-700 truncate">테이블 수</div>
                  <div className="text-[8px] text-slate-400 whitespace-normal leading-tight mt-0.5">월별 전체 테이블 수 변화</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-3 h-3 rounded-sm bg-amber-500 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="font-bold text-slate-700 truncate">관계 수</div>
                  <div className="text-[8px] text-slate-400 whitespace-normal leading-tight mt-0.5">월별 발견된 관계 수</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 툴바 */}
      <div className="flex items-center justify-between mb-2">
        <div className="relative w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="테이블 검색..." 
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
            모든 테이블 <ChevronDown className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Filter className="w-4 h-4" /> 필터
          </button>
        </div>
      </div>

      {/* 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-8">
        {tableData.map((table, idx) => (
          <div 
            key={idx} 
            className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
            onClick={() => {
              if (table.path) {
                navigate(table.path);
              } else {
                alert('해당 테이블 화면은 현재 데모(PoC) 버전에서 제공되지 않습니다.');
              }
            }}
          >
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex items-start gap-3 mb-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold shrink-0 ${table.iconColor}`}>
                  {table.id}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 truncate">{table.title}</h3>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">{table.name}</p>
                  <p className="text-[11px] text-slate-500 mt-1">{table.desc}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-5 flex-1">
                <div className="text-center">
                  <div className="text-lg font-bold text-slate-800">{table.records}</div>
                  <div className="text-[10px] text-slate-400">레코드</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-slate-800">{table.columns}</div>
                  <div className="text-[10px] text-slate-400">컬럼</div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-[10px] font-bold text-slate-500">데이터 품질</span>
                  <span className={`text-[10px] font-bold ${table.quality >= 90 ? 'text-blue-600' : table.quality >= 80 ? 'text-amber-500' : 'text-rose-500'}`}>
                    {table.quality}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${table.quality >= 90 ? 'bg-blue-600' : table.quality >= 80 ? 'bg-amber-400' : 'bg-rose-500'}`} 
                    style={{ width: `${table.quality}%` }}
                  />
                </div>
              </div>
            </div>
            
            <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {vectorizedTables.includes(table.name) ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-100">
                    <CheckCircle2 className="w-3 h-3" /> 벡터화됨
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold border border-slate-200">
                    대기중
                  </span>
                )}
                <span className="text-[10px] font-mono text-slate-400 bg-white px-1.5 rounded border border-slate-200">dbo</span>
              </div>
              <span className="text-[10px] text-slate-400">{table.days === 0 ? '오늘' : `${table.days}일 전`}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}