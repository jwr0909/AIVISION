import React, { useState } from 'react';
import { Link, ArrowRight, Activity, BarChart2, Share2, SearchCode, RefreshCw, Trash2 } from 'lucide-react';

export default function MapperTab() {
  const [hoveredLine, setHoveredLine] = useState<{ month: string, x: number, relations: number } | null>(null);

  const [relationsData, setRelationsData] = useState([
    { source: 'work_mst', target: 'item_mst', conf: 98, type: 'Foreign_key', color: 'bg-blue-600' },
    { source: 'bad_mst', target: 'item_mst', conf: 96, type: 'Foreign_key', color: 'bg-blue-600' },
    { source: 'bad_mst', target: 'work_mst', conf: 92, type: 'Inferred', color: 'bg-emerald-500' },
    { source: 'work_mst', target: 'emp_mst', conf: 95, type: 'Foreign_key', color: 'bg-blue-600' },
    { source: 'item_mst', target: 'cust_mst', conf: 89, type: 'Foreign_key', color: 'bg-blue-600' },
    { source: 'bad_mst', target: 'emp_mst', conf: 78, type: 'Inferred', color: 'bg-emerald-500' }
  ]);

  const [sourceTable, setSourceTable] = useState('');
  const [targetTable, setTargetTable] = useState('');

  const handleDeleteRelation = (index: number) => {
    if (confirm('이 관계를 삭제하시겠습니까?')) {
      const newData = [...relationsData];
      newData.splice(index, 1);
      setRelationsData(newData);
    }
  };

  const handleCreateRelation = () => {
    if (!sourceTable || !targetTable) {
      alert('원본 테이블과 대상 테이블을 모두 선택해주세요.');
      return;
    }
    
    if (sourceTable === targetTable) {
      alert('원본 테이블과 대상 테이블이 동일할 수 없습니다.');
      return;
    }

    // 이미 존재하는 관계인지 확인
    const exists = relationsData.some(r => r.source === sourceTable && r.target === targetTable);
    if (exists) {
      alert('이미 존재하는 관계입니다.');
      return;
    }

    // 새로운 관계 추가
    const newRelation = {
      source: sourceTable,
      target: targetTable,
      conf: Math.floor(Math.random() * (99 - 85 + 1)) + 85, // 85~99 사이 랜덤 신뢰도
      type: 'User_defined',
      color: 'bg-purple-600'
    };

    setRelationsData([newRelation, ...relationsData]);
    
    // 선택 초기화
    setSourceTable('');
    setTargetTable('');
    
    alert('새로운 시맨틱 관계가 생성되었습니다! 하단 리스트에 추가되었습니다.');
  };

  const lineData = [
    { month: '1월', x: 0, relations: 70 },
    { month: '2월', x: 9.09, relations: 63 },
    { month: '3월', x: 18.18, relations: 70 },
    { month: '4월', x: 27.27, relations: 84 },
    { month: '5월', x: 36.36, relations: 91 },
    { month: '6월', x: 45.45, relations: 98 },
    { month: '7월', x: 54.54, relations: 91 },
    { month: '8월', x: 63.63, relations: 70 },
    { month: '9월', x: 72.72, relations: 105 },
    { month: '10월', x: 81.81, relations: 112 },
    { month: '11월', x: 90.9, relations: 119 },
    { month: '12월', x: 100, relations: 98 }
  ];
  const getPoints = () => lineData.map(d => `${d.x},${100 - (d.relations / 140 * 100)}`).join(' ');

  return (
    <div className="flex flex-col gap-4 p-1">
      {/* 시각적 관계 매퍼 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Link className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-800">시각적 관계 매퍼 (Visual Mapper)</h3>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold border border-blue-100 ml-2">BETA</span>
          </div>
          <p className="text-[11px] text-slate-500">테이블 간의 시맨틱 관계를 직접 정의하여 온톨로지를 확장하세요</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-4 bg-slate-50/50 p-6 rounded-xl border border-slate-100">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-slate-400" />
              원본 테이블 (Source)
            </label>
            <select 
              value={sourceTable}
              onChange={(e) => setSourceTable(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">선택하세요...</option>
              <option value="item_mst">item_mst (품목)</option>
              <option value="work_mst">work_mst (작업실적)</option>
              <option value="bad_mst">bad_mst (불량)</option>
              <option value="emp_mst">emp_mst (사원)</option>
              <option value="cust_mst">cust_mst (거래처)</option>
            </select>
          </div>
          
          <div 
            className="flex flex-col items-center justify-center shrink-0 w-16 h-16 bg-white rounded-full border border-indigo-100 shadow-sm text-indigo-500 my-4 md:my-0 md:mt-6 z-10 hover:bg-indigo-50 hover:scale-105 transition-all cursor-pointer group"
            onClick={handleCreateRelation}
          >
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            <span className="text-[9px] font-bold mt-1">CONNECT</span>
          </div>

          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-rose-400" />
              대상 테이블 (Target)
            </label>
            <select 
              value={targetTable}
              onChange={(e) => setTargetTable(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">선택하세요...</option>
              <option value="item_mst">item_mst (품목)</option>
              <option value="work_mst">work_mst (작업실적)</option>
              <option value="bad_mst">bad_mst (불량)</option>
              <option value="emp_mst">emp_mst (사원)</option>
              <option value="cust_mst">cust_mst (거래처)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50"
            onClick={() => alert('AI가 추천하는 최적의 매핑 리스트가 곧 업데이트될 예정입니다.')}
          >
            <RefreshCw className="w-3.5 h-3.5" /> 자동 매핑 추천
          </button>
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 shadow-sm"
            onClick={handleCreateRelation}
          >
            <SearchCode className="w-3.5 h-3.5" /> 시맨틱 관계 생성
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 차트 1 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col relative h-[240px]">
          <div className="flex items-center gap-2 text-fuchsia-700 font-bold mb-2">
            <Activity className="w-4 h-4" />
            <h3 className="text-[14px]">관계 생성 추이</h3>
          </div>
          <p className="text-[10px] text-slate-400 mb-6">월별로 발견된 테이블 간 관계 수의 변화 추이를 보여줍니다. 시간에 따른 온톨로지 확장 속도를 확인할 수 있습니다.</p>
          
          <div className="flex-1 relative w-full h-full flex items-end pt-4 pb-6 px-6">
            <div className="absolute left-6 top-4 bottom-6 w-px bg-slate-100 flex flex-col justify-between items-end pr-2 text-[9px] text-slate-400">
              <span>140</span><span>105</span><span>70</span><span>35</span><span>0</span>
            </div>
            <div className="absolute left-10 right-24 bottom-4 h-px bg-slate-100 flex justify-between pt-2 text-[9px] text-slate-400">
              <span>1월</span><span>2월</span><span>3월</span><span>4월</span><span>5월</span><span>6월</span><span>7월</span><span>8월</span><span>9월</span><span>10월</span><span>11월</span><span>12월</span>
            </div>
            
            {/* 차트 영역 래퍼 */}
            <div className="absolute left-10 right-24 top-4 bottom-6">
              {/* SVG 차트 (선) */}
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <polyline points={getPoints()} fill="none" stroke="#A855F7" strokeWidth="2" vectorEffect="non-scaling-stroke" />
              </svg>
              {/* SVG 차트 (점) */}
              <svg className="absolute inset-0 w-full h-full overflow-visible">
                {lineData.map(d => (
                  <circle key={d.month} cx={`${d.x}%`} cy={`${100 - (d.relations / 140 * 100)}%`} r="3.5" fill="#fff" stroke="#A855F7" strokeWidth="2" />
                ))}
              </svg>

              {/* 툴팁 표시를 위한 Hover 영역 */}
              <div className="absolute inset-0 flex justify-between">
                {lineData.map((d) => (
                  <div 
                    key={d.month} 
                    className="h-full w-8 -ml-4 flex items-center justify-center cursor-pointer group z-10"
                    onMouseEnter={() => setHoveredLine(d)}
                    onMouseLeave={() => setHoveredLine(null)}
                  >
                    <div className="w-px h-full bg-fuchsia-200 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>

              {/* 커스텀 툴팁 */}
              {hoveredLine && (
                <div 
                  className="absolute z-20 bg-white border-2 border-fuchsia-200 shadow-xl rounded-xl p-3 w-36 pointer-events-none transition-all duration-200"
                  style={{ 
                    left: `${hoveredLine.x}%`,
                    bottom: '20%',
                    transform: `translate(${hoveredLine.x > 50 ? '-110%' : '10%'}, 0)`
                  }}
                >
                  <div className="text-[13px] font-bold text-slate-800 mb-2 pb-2 border-b border-slate-100">{hoveredLine.month}</div>
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#A855F7]" /><span className="text-slate-600 font-bold">관계 수 :</span></div>
                    <span className="font-bold text-slate-800">{hoveredLine.relations}개</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="absolute right-4 top-4 flex items-center gap-1.5 bg-white/80 p-1.5 rounded border border-slate-100 text-[9px] shadow-sm">
              <div className="w-2 h-2 rounded-full bg-fuchsia-500" />
              <span className="font-bold text-slate-600">관계 수</span>
            </div>
          </div>
        </div>

        {/* 차트 2 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col relative h-[240px]">
          <div className="flex items-center gap-2 text-blue-700 font-bold mb-2">
            <BarChart2 className="w-4 h-4" />
            <h3 className="text-[14px]">관계 신뢰도 분포</h3>
          </div>
          <p className="text-[10px] text-slate-400 mb-6">발견된 관계들을 신뢰도 구간별로 분류하여 표시합니다. 90% 이상은 자동 적용되며, 70% 미만은 사용자 검토가 필요할 수 있습니다.</p>
          
          <div className="flex-1 relative w-full h-full flex items-end pt-4 pb-6 px-6">
            <div className="absolute left-6 top-4 bottom-6 w-px bg-slate-100 flex flex-col justify-between items-end pr-2 text-[9px] text-slate-400">
              <span>30</span><span>20</span><span>10</span><span>0</span>
            </div>
            
            <div className="absolute inset-x-10 bottom-6 top-4 flex items-end justify-around w-[calc(100%-4rem)]">
              <div className="w-16 bg-emerald-500/80 rounded-t h-[60%] hover:bg-emerald-500 transition-colors cursor-pointer group relative">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">18</div>
              </div>
              <div className="w-16 bg-blue-500/80 rounded-t h-[90%] hover:bg-blue-500 transition-colors cursor-pointer group relative">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">27</div>
              </div>
              <div className="w-16 bg-amber-500/80 rounded-t h-[40%] hover:bg-amber-500 transition-colors cursor-pointer group relative">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">12</div>
              </div>
              <div className="w-16 bg-rose-500/80 rounded-t h-[20%] hover:bg-rose-500 transition-colors cursor-pointer group relative">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">6</div>
              </div>
            </div>

            <div className="absolute left-10 right-6 bottom-2 h-px bg-slate-100 flex justify-around text-[10px] text-slate-500 font-medium">
              <span className="w-16 text-center">90-100%</span>
              <span className="w-16 text-center">80-90%</span>
              <span className="w-16 text-center">70-80%</span>
              <span className="w-16 text-center">&lt; 70%</span>
            </div>

            <div className="absolute right-4 top-10 flex items-center gap-1.5 bg-white/80 p-1.5 rounded border border-slate-100 text-[9px] shadow-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-bold text-slate-600">관계 수</span>
            </div>
          </div>
        </div>
      </div>

      {/* 테이블 관계 리스트 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 relative overflow-hidden pb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-emerald-700 font-bold">
            <Share2 className="w-4 h-4" />
            <h3 className="text-[14px]">테이블 관계</h3>
          </div>
          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">{relationsData.length}개</span>
        </div>
        <p className="text-[11px] text-slate-500 mb-4">자동 감지된 테이블 간 관계를 확인하고 관리하세요</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {relationsData.map((rel, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:border-slate-300 transition-colors bg-slate-50/50 cursor-pointer">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-700 text-sm">{rel.source}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span className="font-mono font-bold text-slate-700 text-sm">{rel.target}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-500">{rel.conf}% 신뢰도</span>
                  <span className={`text-[9px] text-white font-bold px-1.5 py-0.5 rounded ${rel.color}`}>
                    {rel.type}
                  </span>
                </div>
              </div>
              <div 
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                onClick={() => handleDeleteRelation(idx)}
                title="삭제"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}