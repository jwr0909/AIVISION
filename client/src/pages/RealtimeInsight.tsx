import React, { useState } from 'react'
import {
  Database,
  BarChart2,
  Network,
  Activity,
  Zap,
  Shield,
  AlertTriangle,
  Clock,
  Pause,
  Download,
  Eye,
  TrendingUp,
  Target,
  Brain,
  ChevronDown,
  Cpu,
  Layers,
  ShieldAlert,
  Info,
  PlayCircle,
  Settings,
  Lightbulb,
  ClipboardList,
  CheckSquare,
  RefreshCw,
  Save,
  Filter,
  Search,
  Crosshair,
  Repeat,
  Link2,
  GitMerge,
  Share2
} from 'lucide-react'
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceDot } from 'recharts'

const anomalyChartData = [
  { time: '02:00', expected: 180, measured: 180.2 },
  { time: '03:00', expected: 180, measured: 179.8 },
  { time: '04:00', expected: 180, measured: 180.1 },
  { time: '05:00', expected: 180, measured: 180.5 },
  { time: '06:00', expected: 180, measured: 179.5 },
  { time: '07:00', expected: 180, measured: 180.3 },
  { time: '08:00', expected: 180, measured: 180.8 },
  { time: '09:00', expected: 180, measured: 181.5 },
  { time: '10:00', expected: 180, measured: 184.2 },
  { time: '10:30', expected: 180, measured: 198.5, anomaly: 198.5 },
  { time: '11:00', expected: 180, measured: 195.2, anomaly: 195.2 },
  { time: '11:30', expected: 180, measured: 181.0 },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const expected = payload.find((p: any) => p.dataKey === 'expected')?.value;
    const measured = payload.find((p: any) => p.dataKey === 'measured')?.value;
    const isAnomaly = payload.find((p: any) => p.dataKey === 'anomaly')?.value != null;
    
    return (
      <div className="bg-white border border-indigo-100 shadow-lg rounded-lg p-3 z-20 flex flex-col gap-1 min-w-[130px]">
        <div className="text-[11px] font-bold text-slate-800 border-b border-slate-100 pb-1 mb-1">오전 {label}</div>
        <div className="flex justify-between text-[11px] gap-3">
          <span className="text-slate-500">예상 온도:</span><span className="font-bold text-blue-600">{expected}℃</span>
        </div>
        <div className="flex justify-between text-[11px] gap-3">
          <span className="text-slate-500">측정 온도:</span><span className={`font-bold ${isAnomaly ? 'text-rose-500' : 'text-emerald-600'}`}>{measured}℃</span>
        </div>
        <div className="flex justify-between text-[11px] gap-3">
          <span className="text-slate-500">편차:</span><span className="font-bold text-slate-700">{measured && expected ? (measured - expected).toFixed(1) : 0}℃</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function RealtimeInsight() {
  const [activeTab, setActiveTab] = useState('개요')
  const [expandedModel, setExpandedModel] = useState<{ id: number, type: 'predict' | 'evaluate' | 'settings' } | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // 새 모델 생성을 위한 상태 관리
  const [newModelName, setNewModelName] = useState('')
  const [newModelType, setNewModelType] = useState('classification')
  const [newModelTarget, setNewModelTarget] = useState('')
  const [createdModels, setCreatedModels] = useState<any[]>([])
  
  // 융합 탭: 네트워크 시각화 뷰를 위한 상태
  const [selectedEntity, setSelectedEntity] = useState<any>(null)

  // 학습 진행률 업데이트 효과
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCreatedModels(prevModels => 
        prevModels.map(model => {
          if (model.progress < 100) {
            const nextProgress = Math.min(100, model.progress + Math.floor(Math.random() * 5) + 1);
            return {
              ...model,
              progress: nextProgress,
              status: nextProgress === 100 ? 'ready' : 'training'
            };
          }
          return model;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleCreateModel = () => {
    if (!newModelName || !newModelTarget) {
      alert('모델 이름과 목표 컬럼을 입력해주세요.');
      return;
    }

    const newId = 5 + createdModels.length; // 기존 4개 다음부터 id 할당
    
    const newModel = {
      id: newId,
      name: newModelName,
      type: newModelType,
      target: newModelTarget,
      progress: 0,
      status: 'training',
      createdAt: new Date().toLocaleString('ko-KR', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    };

    setCreatedModels([...createdModels, newModel]);
    
    // 폼 초기화
    setNewModelName('');
    setNewModelType('classification');
    setNewModelTarget('');
    
    alert('성공적으로 모델 생성 파이프라인이 등록되었습니다.\n데이터 수집 및 초기 학습이 진행 중입니다.');
    setIsModalOpen(false);
  };

  const toggleModelExpand = (id: number, type: 'predict' | 'evaluate' | 'settings') => {
    if (expandedModel?.id === id && expandedModel?.type === type) {
      setExpandedModel(null)
    } else {
      setExpandedModel({ id, type })
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 bg-[#F4F7FB] min-h-full h-full overflow-y-auto font-sans">
      
      {/* 1. 상단 헤더 & 컨트롤 */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100 shadow-sm">
            <Activity className="w-4 h-4 text-indigo-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">실시간 인사이트 플랫폼</h2>
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-md shadow-sm">
            <Activity className="w-3 h-3" /> LIVE
          </span>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button 
            className="flex-1 md:flex-none flex items-center justify-between gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-md hover:bg-slate-50 shadow-sm"
            onClick={() => alert('조회 기간을 설정합니다.\n(현재 데모에서는 최근 24시간 데이터 기준으로 표시됩니다.)')}
          >
            24시간 <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>
          <button 
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-md shadow-sm transition-colors"
            onClick={() => alert('실시간 데이터 스트리밍 수신을 일시정지합니다.')}
          >
            <Pause className="w-4 h-4 fill-current" /> 일시정지
          </button>
          <button 
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-bold rounded-md shadow-sm transition-colors"
            onClick={() => alert('현재 화면의 분석 데이터를 JSON 형식으로 내보냅니다.')}
          >
            <Download className="w-4 h-4" /> JSON
          </button>
        </div>
      </div>

      {/* 2. 상단 통계 지표 (스크롤 가능) */}
      <div className="flex gap-3 overflow-x-auto pb-2 shrink-0 hide-scrollbar">
        {/* 데이터 수집 */}
        <div className="min-w-[140px] flex-1 bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
          <div className="text-xs font-bold text-slate-500 mb-2">데이터 수집</div>
          <div className="flex items-end justify-between">
            <div className="text-2xl font-black text-slate-800">1491<span className="text-sm font-bold text-slate-500">/s</span></div>
            <Database className="w-6 h-6 text-blue-500/80 mb-1" />
          </div>
        </div>

        {/* 처리된 레코드 */}
        <div className="min-w-[140px] flex-1 bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
          <div className="text-xs font-bold text-slate-500 mb-2">처리된 레코드</div>
          <div className="flex items-end justify-between">
            <div className="text-2xl font-black text-slate-800">37,292</div>
            <BarChart2 className="w-6 h-6 text-emerald-500/80 mb-1" />
          </div>
        </div>

        {/* 활성 연결 */}
        <div className="min-w-[140px] flex-1 bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
          <div className="text-xs font-bold text-slate-500 mb-2">활성 연결</div>
          <div className="flex items-end justify-between">
            <div className="text-2xl font-black text-slate-800">10</div>
            <Network className="w-6 h-6 text-fuchsia-500/80 mb-1" />
          </div>
        </div>

        {/* 시스템 부하 */}
        <div className="min-w-[140px] flex-1 bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="text-xs font-bold text-slate-500 mb-2 z-10">시스템 부하</div>
          <div className="flex items-end justify-between z-10">
            <div className="text-2xl font-black text-slate-800">36.1%</div>
            <Activity className="w-6 h-6 text-orange-500/80 mb-1" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100">
            <div className="h-full bg-blue-600 rounded-r-full" style={{ width: '36.1%' }}></div>
          </div>
        </div>

        {/* 메모리 사용 */}
        <div className="min-w-[140px] flex-1 bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="text-xs font-bold text-slate-500 mb-2 z-10">메모리 사용</div>
          <div className="flex items-end justify-between z-10">
            <div className="text-2xl font-black text-slate-800">69.4%</div>
            <Zap className="w-6 h-6 text-yellow-500/80 mb-1" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100">
            <div className="h-full bg-blue-600 rounded-r-full" style={{ width: '69.4%' }}></div>
          </div>
        </div>

        {/* 이상 탐지 */}
        <div className="min-w-[130px] flex-1 bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
          <div className="text-xs font-bold text-slate-500 mb-2">이상 탐지</div>
          <div className="flex items-end justify-between">
            <div className="text-2xl font-black text-rose-500">2</div>
            <Shield className="w-6 h-6 text-rose-400/80 mb-1" />
          </div>
        </div>

        {/* 알림 */}
        <div className="min-w-[130px] flex-1 bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
          <div className="text-xs font-bold text-slate-500 mb-2">알림</div>
          <div className="flex items-end justify-between">
            <div className="text-2xl font-black text-orange-500">0</div>
            <AlertTriangle className="w-6 h-6 text-orange-400/80 mb-1" />
          </div>
        </div>

        {/* 업데이트 */}
        <div className="min-w-[140px] flex-1 bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
          <div className="text-xs font-bold text-slate-500 mb-2">업데이트</div>
          <div className="flex items-end justify-between">
            <div className="text-sm font-bold text-slate-600 pb-1 whitespace-nowrap">오전 12:53:28</div>
            <Clock className="w-6 h-6 text-slate-400 mb-1" />
          </div>
        </div>
      </div>

      {/* 3. 탭 메뉴 */}
      <div className="flex items-center justify-center border-b border-slate-200 shrink-0">
        <div className="flex gap-2 md:gap-6">
          {[
            { id: '개요', icon: Eye },
            { id: '예측', icon: TrendingUp },
            { id: '이상탐지', icon: AlertTriangle },
            { id: '패턴', icon: Target },
            { id: '융합', icon: Zap }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-3 text-[13px] font-bold transition-colors ${
                activeTab === tab.id
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.id}
            </button>
          ))}
        </div>
      </div>

      {/* 탭 내용 */}
      {activeTab === '개요' && (
        <>
          {/* 4. 중앙 4개 요약 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
            {/* 예측 모델 */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-100">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">1</span>
                <span className="text-xs font-bold text-slate-700">예측 모델</span>
              </div>
              <div className="p-6 flex flex-col items-center justify-center relative">
                <div className="text-3xl font-black text-blue-600 z-10">4</div>
                <div className="text-[11px] font-bold text-slate-400 mt-1 z-10">개</div>
                <Info className="absolute left-4 bottom-4 w-12 h-12 text-slate-100 z-0" />
              </div>
            </div>

            {/* 이상 탐지 */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-100">
                <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold">2</span>
                <span className="text-xs font-bold text-slate-700">이상 탐지</span>
              </div>
              <div className="p-6 flex flex-col items-center justify-center relative">
                <div className="text-3xl font-black text-red-500 z-10">2</div>
                <div className="text-[11px] font-bold text-slate-400 mt-1 z-10">건</div>
                <AlertTriangle className="absolute left-4 bottom-4 w-12 h-12 text-slate-100 z-0" />
              </div>
            </div>

            {/* 패턴 */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-100">
                <span className="w-5 h-5 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center text-xs font-bold">3</span>
                <span className="text-xs font-bold text-slate-700">패턴</span>
              </div>
              <div className="p-6 flex flex-col items-center justify-center relative">
                <div className="text-3xl font-black text-yellow-500 z-10">4</div>
                <div className="text-[11px] font-bold text-slate-400 mt-1 z-10">개</div>
                <Target className="absolute left-4 bottom-4 w-12 h-12 text-slate-100 z-0" />
              </div>
            </div>

            {/* 처리된 레코드 */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-100">
                <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold">4</span>
                <span className="text-xs font-bold text-slate-700">처리된 레코드</span>
              </div>
              <div className="p-6 flex flex-col items-center justify-center relative">
                <div className="text-3xl font-black text-emerald-500 z-10">37.3K</div>
                <div className="text-[11px] font-bold text-slate-400 mt-1 z-10">건</div>
                <Activity className="absolute left-4 bottom-4 w-12 h-12 text-slate-100 z-0" />
              </div>
            </div>
          </div>

          {/* 5. 하단 상세 패널 Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 pb-8">
            
            {/* 패널 1: 예측 모델 */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100">
                <div className="flex items-center gap-2 text-purple-700 font-bold text-[15px]">
                  <Info className="w-5 h-5" /> 예측 모델
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
              
              <div className="p-4 flex flex-col gap-3">
                {/* 항목 1 */}
                <div className="bg-white border border-slate-100 rounded-lg p-3 flex flex-col gap-1.5 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-slate-800">고객 행동 예측 모델</span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">ready</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>classification</span>
                    <span>정확도: 87.0%</span>
                  </div>
                </div>

                {/* 항목 2 */}
                <div className="bg-white border border-slate-100 rounded-lg p-3 flex flex-col gap-1.5 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-slate-800">수출 예측 모델</span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">ready</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>timeseries</span>
                    <span>정확도: 91.0%</span>
                  </div>
                </div>

                {/* 항목 3 */}
                <div className="bg-white border border-slate-100 rounded-lg p-3 flex flex-col gap-1.5 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-slate-800">품질 불량 탐지 모델</span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">ready</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>anomaly</span>
                    <span>정확도: 94.0%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 패널 2: 이상 탐지 */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100">
                <div className="flex items-center gap-2 text-purple-700 font-bold text-[15px]">
                  <AlertTriangle className="w-5 h-5" /> 이상 탐지
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
              
              <div className="p-4">
                <div className="bg-white border border-slate-100 rounded-lg p-3 flex gap-3 hover:shadow-sm transition-shadow">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <div className="flex flex-col gap-1">
                    <span className="text-[13px] font-bold text-slate-800 leading-snug">피크 시간 대비 시스템 성능 저하 감지</span>
                    <span className="text-[11px] text-slate-500">2026. 4. 10. 오전 12:08:29</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 패널 3: 패턴 분석 */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100">
                <div className="flex items-center gap-2 text-purple-700 font-bold text-[15px]">
                  <TrendingUp className="w-5 h-5" /> 패턴 분석
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
              
              <div className="p-4 flex flex-col gap-3">
                {/* Trend */}
                <div className="bg-white border border-slate-100 rounded-lg p-3 flex flex-col gap-1.5 hover:shadow-sm transition-all group">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-slate-800">Trend</span>
                    <span className="text-[11px] text-slate-500">강도: 85%</span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center justify-between">
                    <span>방향: increasing</span>
                  </div>
                </div>

                {/* Seasonal */}
                <div className="bg-white border border-slate-100 rounded-lg p-3 flex flex-col gap-1.5 hover:shadow-sm transition-all group">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-slate-800">Seasonal</span>
                    <span className="text-[11px] text-slate-500">강도: 72%</span>
                  </div>
                </div>

                {/* Cyclic */}
                <div className="bg-white border border-slate-100 rounded-lg p-3 flex flex-col gap-1.5 hover:shadow-sm transition-all group">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-slate-800">Cyclic</span>
                    <span className="text-[11px] text-slate-500">강도: 61%</span>
                  </div>
                </div>

                {/* Irregular */}
                <div className="bg-white border border-slate-100 rounded-lg p-3 flex flex-col gap-1.5 hover:shadow-sm transition-all group">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-slate-800">Irregular</span>
                    <span className="text-[11px] text-slate-500">강도: 45%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 예측 탭 */}
      {activeTab === '예측' && (
        <div className="flex flex-col gap-4 flex-1 pb-8">
          {/* 예측 탭 헤더 */}
          <div className="flex items-center justify-between">
            <h3 className="text-[17px] font-black text-slate-800">예측 모델 관리</h3>
            <button 
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-[13px] font-bold transition-colors shadow-sm"
              onClick={() => setIsModalOpen(true)}
            >
              <Brain className="w-4 h-4" />
              새 모델 생성
            </button>
          </div>

          {/* 예측 모델 그리드 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* 1. 고객 행동 예측 모델 */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-purple-700 font-bold text-[15px]">
                  <Info className="w-5 h-5" /> 고객 행동 예측 모델
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded">ready</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-slate-400">모델 타입</span>
                  <span className="text-[13px] font-bold text-slate-800">classification</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-slate-400">정확도</span>
                  <span className="text-[13px] font-bold text-slate-800">87.0%</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-1">
                <span className="text-[11px] font-bold text-slate-400">입력 특성</span>
                <div className="flex flex-wrap gap-1.5">
                  {['고객유형', '거래빈도', '주문패턴', '지역정보'].map(feat => (
                    <span key={feat} className="text-[10px] font-bold text-slate-700 bg-[#F4F7FB] px-2 py-1 rounded-md">{feat}</span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1 mt-1">
                <span className="text-[11px] font-bold text-slate-400">목표 컬럼</span>
                <span className="text-[13px] font-bold text-slate-800">customer_behavior</span>
              </div>

              <div className="flex flex-col gap-1 mt-1">
                <span className="text-[11px] font-bold text-slate-400">학습 일시</span>
                <span className="text-[13px] font-bold text-slate-800">2026. 4. 10. 오전 12:52:12</span>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100 mt-2">
                <button 
                  className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-md text-[11px] font-bold transition-colors ${
                    expandedModel?.id === 1 && expandedModel?.type === 'predict' 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                  onClick={() => toggleModelExpand(1, 'predict')}
                >
                  <PlayCircle className="w-3.5 h-3.5" /> 예측 실행 {expandedModel?.id === 1 && expandedModel?.type === 'predict' && <ChevronDown className="w-3 h-3 ml-1" />}
                </button>
                <button 
                  className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-md text-[11px] font-bold transition-colors ${
                    expandedModel?.id === 1 && expandedModel?.type === 'evaluate' 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                  onClick={() => toggleModelExpand(1, 'evaluate')}
                >
                  <BarChart2 className="w-3.5 h-3.5" /> 성능 평가 {expandedModel?.id === 1 && expandedModel?.type === 'evaluate' && <ChevronDown className="w-3 h-3 ml-1" />}
                </button>
                <button 
                  className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-md text-[11px] font-bold transition-colors ${
                    expandedModel?.id === 1 && expandedModel?.type === 'settings' 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                  onClick={() => toggleModelExpand(1, 'settings')}
                >
                  <Settings className="w-3.5 h-3.5" /> 설정 {expandedModel?.id === 1 && expandedModel?.type === 'settings' && <ChevronDown className="w-3 h-3 ml-1" />}
                </button>
              </div>

              {/* 1번 모델 확장 패널 */}
              {expandedModel?.id === 1 && (
                <div className="mt-2 pt-4 border-t border-slate-100 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  {expandedModel.type === 'predict' && (
                    <>
                      <div className="flex items-center gap-2 text-emerald-700 font-bold text-[14px] mb-1">
                        <PlayCircle className="w-4 h-4" /> 예측 실행 결과
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-emerald-50/50 rounded-lg p-4 flex flex-col gap-1">
                          <span className="text-[11px] font-bold text-emerald-600">예측 결과</span>
                          <span className="text-[15px] font-black text-emerald-700">high_value_customer</span>
                        </div>
                        <div className="bg-blue-50/50 rounded-lg p-4 flex flex-col gap-1">
                          <span className="text-[11px] font-bold text-blue-500">신뢰도</span>
                          <span className="text-[15px] font-black text-blue-600">87.0%</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 mt-1">
                        <div className="flex items-center gap-1.5 text-slate-800 font-bold text-[13px]">
                          <ClipboardList className="w-4 h-4 text-orange-400" /> 분석 인사이트
                        </div>
                        <ul className="flex flex-col gap-1.5 ml-1">
                          <li className="flex items-center gap-2 text-[12px] text-slate-600"><Lightbulb className="w-3.5 h-3.5 text-amber-500" /> 활성 고객 패턴 감지</li>
                          <li className="flex items-center gap-2 text-[12px] text-slate-600"><Lightbulb className="w-3.5 h-3.5 text-amber-500" /> 재구매 확률 높음</li>
                          <li className="flex items-center gap-2 text-[12px] text-slate-600"><Lightbulb className="w-3.5 h-3.5 text-amber-500" /> 프리미엄 서비스 추천</li>
                        </ul>
                      </div>
                      
                      <div className="text-[10px] text-slate-400 mt-2">
                        실행 시간: 2026. 4. 10. 오전 1:18:11
                      </div>
                    </>
                  )}

                  {expandedModel.type === 'evaluate' && (
                    <>
                      <div className="flex items-center gap-2 text-indigo-600 font-bold text-[14px] mb-1">
                        <BarChart2 className="w-4 h-4" /> 성능 평가 결과
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-[#F8FAFC] rounded-lg p-3 flex flex-col gap-2">
                          <span className="text-[11px] font-bold text-indigo-500">정확도</span>
                          <div className="flex items-end gap-2">
                            <span className="text-[15px] font-black text-indigo-700 w-12">88.6%</span>
                            <div className="flex-1 h-2 bg-indigo-100 rounded-full mb-1.5"><div className="h-full bg-indigo-500 rounded-full" style={{ width: '88.6%' }}></div></div>
                          </div>
                        </div>
                        <div className="bg-[#F0FDF4] rounded-lg p-3 flex flex-col gap-2">
                          <span className="text-[11px] font-bold text-emerald-600">정밀도</span>
                          <div className="flex items-end gap-2">
                            <span className="text-[15px] font-black text-emerald-700 w-12">91.1%</span>
                            <div className="flex-1 h-2 bg-emerald-100 rounded-full mb-1.5"><div className="h-full bg-emerald-500 rounded-full" style={{ width: '91.1%' }}></div></div>
                          </div>
                        </div>
                        <div className="bg-[#FAF5FF] rounded-lg p-3 flex flex-col gap-2">
                          <span className="text-[11px] font-bold text-purple-600">재현율</span>
                          <div className="flex items-end gap-2">
                            <span className="text-[15px] font-black text-purple-700 w-12">93.2%</span>
                            <div className="flex-1 h-2 bg-purple-100 rounded-full mb-1.5"><div className="h-full bg-purple-500 rounded-full" style={{ width: '93.2%' }}></div></div>
                          </div>
                        </div>
                        <div className="bg-[#FFF7ED] rounded-lg p-3 flex flex-col gap-2">
                          <span className="text-[11px] font-bold text-orange-600">F1 점수</span>
                          <div className="flex items-end gap-2">
                            <span className="text-[15px] font-black text-orange-700 w-12">88.1%</span>
                            <div className="flex-1 h-2 bg-orange-100 rounded-full mb-1.5"><div className="h-full bg-orange-500 rounded-full" style={{ width: '88.1%' }}></div></div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 mt-2">
                        <div className="flex items-center gap-1.5 text-slate-800 font-bold text-[13px]">
                          <BarChart2 className="w-4 h-4 text-slate-400" /> 평가 메트릭
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          <div className="bg-[#F8FAFC] rounded-lg flex flex-col items-center justify-center py-3">
                            <span className="text-[14px] font-black text-slate-700">56</span>
                            <span className="text-[9px] text-slate-400">True +</span>
                          </div>
                          <div className="bg-[#F8FAFC] rounded-lg flex flex-col items-center justify-center py-3">
                            <span className="text-[14px] font-black text-slate-700">7</span>
                            <span className="text-[9px] text-slate-400">False +</span>
                          </div>
                          <div className="bg-[#F8FAFC] rounded-lg flex flex-col items-center justify-center py-3">
                            <span className="text-[14px] font-black text-slate-700">103</span>
                            <span className="text-[9px] text-slate-400">True -</span>
                          </div>
                          <div className="bg-[#F8FAFC] rounded-lg flex flex-col items-center justify-center py-3">
                            <span className="text-[14px] font-black text-slate-700">16</span>
                            <span className="text-[9px] text-slate-400">False -</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-[10px] text-slate-400 mt-2">
                        평가 시간: 2026. 4. 10. 오전 1:18:21
                      </div>
                    </>
                  )}

                  {expandedModel.type === 'settings' && (
                    <>
                      <div className="flex items-center gap-2 text-slate-700 font-bold text-[14px] mb-1">
                        <Settings className="w-4 h-4" /> 모델 설정
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-bold text-slate-600">학습률</label>
                          <input type="text" defaultValue="0.001" className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-medium text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-bold text-slate-600">배치 크기</label>
                          <input type="text" defaultValue="32" className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-medium text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 mt-2">
                        <label className="text-[11px] font-bold text-slate-600">특성 선택</label>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input type="checkbox" defaultChecked className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5" />
                            <span className="text-[12px] text-slate-700">고객유형</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input type="checkbox" defaultChecked className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5" />
                            <span className="text-[12px] text-slate-700">거래빈도</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input type="checkbox" defaultChecked className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5" />
                            <span className="text-[12px] text-slate-700">주문패턴</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input type="checkbox" defaultChecked className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5" />
                            <span className="text-[12px] text-slate-700">지역정보</span>
                          </label>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-3 pt-4 border-t border-slate-100">
                        <button 
                          className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-[12px] font-bold transition-colors shadow-sm"
                          onClick={() => alert('설정이 성공적으로 저장되었습니다.')}
                        >
                          설정 저장
                        </button>
                        <button 
                          className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-[12px] font-bold transition-colors shadow-sm"
                          onClick={() => alert('새로운 설정으로 모델 재훈련 파이프라인을 시작합니다.\n백그라운드에서 진행되며 완료 시 알림이 전송됩니다.')}
                        >
                          재훈련
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* 2. 수출 예측 모델 */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-purple-700 font-bold text-[15px]">
                  <Info className="w-5 h-5" /> 수출 예측 모델
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded">ready</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-slate-400">모델 타입</span>
                  <span className="text-[13px] font-bold text-slate-800">timeseries</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-slate-400">정확도</span>
                  <span className="text-[13px] font-bold text-slate-800">91.0%</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-1">
                <span className="text-[11px] font-bold text-slate-400">입력 특성</span>
                <div className="flex flex-wrap gap-1.5">
                  {['수출량', '국가별패턴', '환율', '계절성'].map(feat => (
                    <span key={feat} className="text-[10px] font-bold text-slate-700 bg-[#F4F7FB] px-2 py-1 rounded-md">{feat}</span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1 mt-1">
                <span className="text-[11px] font-bold text-slate-400">목표 컬럼</span>
                <span className="text-[13px] font-bold text-slate-800">export_amount</span>
              </div>

              <div className="flex flex-col gap-1 mt-1">
                <span className="text-[11px] font-bold text-slate-400">학습 일시</span>
                <span className="text-[13px] font-bold text-slate-800">2026. 4. 10. 오전 12:52:12</span>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100 mt-2">
                <button 
                  className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-md text-[11px] font-bold transition-colors ${
                    expandedModel?.id === 2 && expandedModel?.type === 'predict' 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                  onClick={() => toggleModelExpand(2, 'predict')}
                >
                  <PlayCircle className="w-3.5 h-3.5" /> 예측 실행 {expandedModel?.id === 2 && expandedModel?.type === 'predict' && <ChevronDown className="w-3 h-3 ml-1" />}
                </button>
                <button 
                  className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-md text-[11px] font-bold transition-colors ${
                    expandedModel?.id === 2 && expandedModel?.type === 'evaluate' 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                  onClick={() => toggleModelExpand(2, 'evaluate')}
                >
                  <BarChart2 className="w-3.5 h-3.5" /> 성능 평가 {expandedModel?.id === 2 && expandedModel?.type === 'evaluate' && <ChevronDown className="w-3 h-3 ml-1" />}
                </button>
                <button 
                  className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-md text-[11px] font-bold transition-colors ${
                    expandedModel?.id === 2 && expandedModel?.type === 'settings' 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                  onClick={() => toggleModelExpand(2, 'settings')}
                >
                  <Settings className="w-3.5 h-3.5" /> 설정 {expandedModel?.id === 2 && expandedModel?.type === 'settings' && <ChevronDown className="w-3 h-3 ml-1" />}
                </button>
              </div>

              {/* 2번 모델 확장 패널 */}
              {expandedModel?.id === 2 && (
                <div className="mt-2 pt-4 border-t border-slate-100 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  {expandedModel.type === 'predict' && (
                    <>
                      <div className="flex items-center gap-2 text-emerald-700 font-bold text-[14px] mb-1">
                        <PlayCircle className="w-4 h-4" /> 예측 실행 결과
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-emerald-50/50 rounded-lg p-4 flex flex-col gap-1">
                          <span className="text-[11px] font-bold text-emerald-600">예측 수출량 (다음 달)</span>
                          <span className="text-[15px] font-black text-emerald-700">1,250,000 USD</span>
                        </div>
                        <div className="bg-blue-50/50 rounded-lg p-4 flex flex-col gap-1">
                          <span className="text-[11px] font-bold text-blue-500">예측 오차 범위</span>
                          <span className="text-[15px] font-black text-blue-600">± 4.2%</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 mt-1">
                        <div className="flex items-center gap-1.5 text-slate-800 font-bold text-[13px]">
                          <ClipboardList className="w-4 h-4 text-orange-400" /> 분석 인사이트
                        </div>
                        <ul className="flex flex-col gap-1.5 ml-1">
                          <li className="flex items-center gap-2 text-[12px] text-slate-600"><Lightbulb className="w-3.5 h-3.5 text-amber-500" /> 북미 시장 수요 급증 패턴 반영</li>
                          <li className="flex items-center gap-2 text-[12px] text-slate-600"><Lightbulb className="w-3.5 h-3.5 text-amber-500" /> 환율 변동성(원/달러 상승) 긍정적 영향</li>
                          <li className="flex items-center gap-2 text-[12px] text-slate-600"><Lightbulb className="w-3.5 h-3.5 text-amber-500" /> 계절적 성수기 진입 (Q3)</li>
                        </ul>
                      </div>
                      
                      <div className="text-[10px] text-slate-400 mt-2">
                        실행 시간: 2026. 4. 10. 오전 2:10:45
                      </div>
                    </>
                  )}

                  {expandedModel.type === 'evaluate' && (
                    <>
                      <div className="flex items-center gap-2 text-indigo-600 font-bold text-[14px] mb-1">
                        <BarChart2 className="w-4 h-4" /> 성능 평가 결과
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-[#F8FAFC] rounded-lg p-3 flex flex-col gap-2">
                          <span className="text-[11px] font-bold text-indigo-500">RMSE (평균 제곱근 오차)</span>
                          <div className="flex items-end gap-2">
                            <span className="text-[15px] font-black text-indigo-700 w-12">12.4</span>
                            <div className="flex-1 h-2 bg-indigo-100 rounded-full mb-1.5"><div className="h-full bg-indigo-500 rounded-full" style={{ width: '85%' }}></div></div>
                          </div>
                        </div>
                        <div className="bg-[#F0FDF4] rounded-lg p-3 flex flex-col gap-2">
                          <span className="text-[11px] font-bold text-emerald-600">MAE (평균 절대 오차)</span>
                          <div className="flex items-end gap-2">
                            <span className="text-[15px] font-black text-emerald-700 w-12">9.8</span>
                            <div className="flex-1 h-2 bg-emerald-100 rounded-full mb-1.5"><div className="h-full bg-emerald-500 rounded-full" style={{ width: '90%' }}></div></div>
                          </div>
                        </div>
                        <div className="bg-[#FAF5FF] rounded-lg p-3 flex flex-col gap-2">
                          <span className="text-[11px] font-bold text-purple-600">MAPE (평균 절대 백분율 오차)</span>
                          <div className="flex items-end gap-2">
                            <span className="text-[15px] font-black text-purple-700 w-12">5.2%</span>
                            <div className="flex-1 h-2 bg-purple-100 rounded-full mb-1.5"><div className="h-full bg-purple-500 rounded-full" style={{ width: '95%' }}></div></div>
                          </div>
                        </div>
                        <div className="bg-[#FFF7ED] rounded-lg p-3 flex flex-col gap-2">
                          <span className="text-[11px] font-bold text-orange-600">R² (결정계수)</span>
                          <div className="flex items-end gap-2">
                            <span className="text-[15px] font-black text-orange-700 w-12">0.91</span>
                            <div className="flex-1 h-2 bg-orange-100 rounded-full mb-1.5"><div className="h-full bg-orange-500 rounded-full" style={{ width: '91%' }}></div></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-[10px] text-slate-400 mt-2">
                        평가 시간: 2026. 4. 10. 오전 2:11:05
                      </div>
                    </>
                  )}

                  {expandedModel.type === 'settings' && (
                    <>
                      <div className="flex items-center gap-2 text-slate-700 font-bold text-[14px] mb-1">
                        <Settings className="w-4 h-4" /> 모델 설정
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-bold text-slate-600">시계열 주기(Window)</label>
                          <input type="text" defaultValue="30 days" className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-medium text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-bold text-slate-600">환율 데이터 가중치</label>
                          <input type="text" defaultValue="1.5" className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-medium text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 mt-2">
                        <label className="text-[11px] font-bold text-slate-600">특성 선택</label>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input type="checkbox" defaultChecked className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5" />
                            <span className="text-[12px] text-slate-700">수출량</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input type="checkbox" defaultChecked className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5" />
                            <span className="text-[12px] text-slate-700">국가별패턴</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input type="checkbox" defaultChecked className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5" />
                            <span className="text-[12px] text-slate-700">환율</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input type="checkbox" defaultChecked className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5" />
                            <span className="text-[12px] text-slate-700">계절성</span>
                          </label>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-3 pt-4 border-t border-slate-100">
                        <button 
                          className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-[12px] font-bold transition-colors shadow-sm"
                          onClick={() => alert('설정이 성공적으로 저장되었습니다.')}
                        >
                          설정 저장
                        </button>
                        <button 
                          className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-[12px] font-bold transition-colors shadow-sm"
                          onClick={() => alert('새로운 설정으로 시계열 모델 재훈련 파이프라인을 시작합니다.\n백그라운드에서 진행되며 완료 시 알림이 전송됩니다.')}
                        >
                          재훈련
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* 3. 공정 이상 탐지 모델 */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-purple-700 font-bold text-[15px]">
                  <Info className="w-5 h-5" /> 공정 이상 탐지 모델
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded">ready</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-slate-400">모델 타입</span>
                  <span className="text-[13px] font-bold text-slate-800">anomaly</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-slate-400">정확도</span>
                  <span className="text-[13px] font-bold text-slate-800">94.0%</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-1">
                <span className="text-[11px] font-bold text-slate-400">입력 특성</span>
                <div className="flex flex-wrap gap-1.5">
                  {['실린더온도', '냉각밸브압력', '진동', 'rpm'].map(feat => (
                    <span key={feat} className="text-[10px] font-bold text-slate-700 bg-[#F4F7FB] px-2 py-1 rounded-md">{feat}</span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1 mt-1">
                <span className="text-[11px] font-bold text-slate-400">목표 컬럼</span>
                <span className="text-[13px] font-bold text-slate-800">process_anomaly</span>
              </div>

              <div className="flex flex-col gap-1 mt-1">
                <span className="text-[11px] font-bold text-slate-400">학습 일시</span>
                <span className="text-[13px] font-bold text-slate-800">2026. 4. 10. 오전 12:52:12</span>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100 mt-2">
                <button 
                  className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-md text-[11px] font-bold transition-colors ${
                    expandedModel?.id === 3 && expandedModel?.type === 'predict' 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                  onClick={() => toggleModelExpand(3, 'predict')}
                >
                  <PlayCircle className="w-3.5 h-3.5" /> 예측 실행 {expandedModel?.id === 3 && expandedModel?.type === 'predict' && <ChevronDown className="w-3 h-3 ml-1" />}
                </button>
                <button 
                  className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-md text-[11px] font-bold transition-colors ${
                    expandedModel?.id === 3 && expandedModel?.type === 'evaluate' 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                  onClick={() => toggleModelExpand(3, 'evaluate')}
                >
                  <BarChart2 className="w-3.5 h-3.5" /> 성능 평가 {expandedModel?.id === 3 && expandedModel?.type === 'evaluate' && <ChevronDown className="w-3 h-3 ml-1" />}
                </button>
                <button 
                  className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-md text-[11px] font-bold transition-colors ${
                    expandedModel?.id === 3 && expandedModel?.type === 'settings' 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                  onClick={() => toggleModelExpand(3, 'settings')}
                >
                  <Settings className="w-3.5 h-3.5" /> 설정 {expandedModel?.id === 3 && expandedModel?.type === 'settings' && <ChevronDown className="w-3 h-3 ml-1" />}
                </button>
              </div>

              {/* 3번 모델 확장 패널 */}
              {expandedModel?.id === 3 && (
                <div className="mt-2 pt-4 border-t border-slate-100 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  {expandedModel.type === 'predict' && (
                    <>
                      <div className="flex items-center gap-2 text-emerald-700 font-bold text-[14px] mb-1">
                        <PlayCircle className="w-4 h-4" /> 예측 실행 결과
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-rose-50/50 rounded-lg p-4 flex flex-col gap-1">
                          <span className="text-[11px] font-bold text-rose-600">위험도 수준</span>
                          <span className="text-[15px] font-black text-rose-700">고위험 (High Risk)</span>
                        </div>
                        <div className="bg-blue-50/50 rounded-lg p-4 flex flex-col gap-1">
                          <span className="text-[11px] font-bold text-blue-500">예상 불량률</span>
                          <span className="text-[15px] font-black text-blue-600">3.8% (상승 주의)</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 mt-1">
                        <div className="flex items-center gap-1.5 text-slate-800 font-bold text-[13px]">
                          <ClipboardList className="w-4 h-4 text-orange-400" /> 분석 인사이트
                        </div>
                        <ul className="flex flex-col gap-1.5 ml-1">
                          <li className="flex items-center gap-2 text-[12px] text-slate-600"><Lightbulb className="w-3.5 h-3.5 text-amber-500" /> 특정 라인 온도 변화 이상 패턴 감지</li>
                          <li className="flex items-center gap-2 text-[12px] text-slate-600"><Lightbulb className="w-3.5 h-3.5 text-amber-500" /> 과거 동일 조건 하단 크랙 불량 발생 이력</li>
                          <li className="flex items-center gap-2 text-[12px] text-slate-600"><Lightbulb className="w-3.5 h-3.5 text-amber-500" /> 설비 점검 및 작업자 주의 환기 요망</li>
                        </ul>
                      </div>
                      
                      <div className="text-[10px] text-slate-400 mt-2">
                        실행 시간: 2026. 4. 10. 오전 2:15:30
                      </div>
                    </>
                  )}

                  {expandedModel.type === 'evaluate' && (
                    <>
                      <div className="flex items-center gap-2 text-indigo-600 font-bold text-[14px] mb-1">
                        <BarChart2 className="w-4 h-4" /> 성능 평가 결과
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-[#F8FAFC] rounded-lg p-3 flex flex-col gap-2">
                          <span className="text-[11px] font-bold text-indigo-500">정확도 (Accuracy)</span>
                          <div className="flex items-end gap-2">
                            <span className="text-[15px] font-black text-indigo-700 w-12">94.0%</span>
                            <div className="flex-1 h-2 bg-indigo-100 rounded-full mb-1.5"><div className="h-full bg-indigo-500 rounded-full" style={{ width: '94%' }}></div></div>
                          </div>
                        </div>
                        <div className="bg-[#FAF5FF] rounded-lg p-3 flex flex-col gap-2">
                          <span className="text-[11px] font-bold text-purple-600">재현율 (Recall)</span>
                          <div className="flex items-end gap-2">
                            <span className="text-[15px] font-black text-purple-700 w-12">96.5%</span>
                            <div className="flex-1 h-2 bg-purple-100 rounded-full mb-1.5"><div className="h-full bg-purple-500 rounded-full" style={{ width: '96.5%' }}></div></div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 mt-2">
                        <div className="flex items-center gap-1.5 text-slate-800 font-bold text-[13px]">
                          <BarChart2 className="w-4 h-4 text-slate-400" /> 이상 탐지 혼동 행렬
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          <div className="bg-[#F8FAFC] rounded-lg flex flex-col items-center justify-center py-3">
                            <span className="text-[14px] font-black text-slate-700">128</span>
                            <span className="text-[9px] text-slate-400">정상 판정 (TN)</span>
                          </div>
                          <div className="bg-[#F8FAFC] rounded-lg flex flex-col items-center justify-center py-3 border border-rose-200">
                            <span className="text-[14px] font-black text-rose-500">4</span>
                            <span className="text-[9px] text-rose-400">오탐지 (FP)</span>
                          </div>
                          <div className="bg-[#F8FAFC] rounded-lg flex flex-col items-center justify-center py-3 border border-amber-200">
                            <span className="text-[14px] font-black text-amber-500">2</span>
                            <span className="text-[9px] text-amber-400">미탐지 (FN)</span>
                          </div>
                          <div className="bg-[#F8FAFC] rounded-lg flex flex-col items-center justify-center py-3">
                            <span className="text-[14px] font-black text-slate-700">45</span>
                            <span className="text-[9px] text-slate-400">이상 탐지 (TP)</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-[10px] text-slate-400 mt-2">
                        평가 시간: 2026. 4. 10. 오전 2:16:01
                      </div>
                    </>
                  )}

                  {expandedModel.type === 'settings' && (
                    <>
                      <div className="flex items-center gap-2 text-slate-700 font-bold text-[14px] mb-1">
                        <Settings className="w-4 h-4" /> 모델 설정
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-bold text-slate-600">이상치 탐지 임계값(Threshold)</label>
                          <input type="text" defaultValue="0.85" className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-medium text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-bold text-slate-600">알림 발생 빈도 조절</label>
                          <select className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-medium text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
                            <option>즉시 알림 (민감)</option>
                            <option selected>3회 이상 감지 시 (보통)</option>
                            <option>시간당 1회 요약 (둔감)</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 mt-2">
                        <label className="text-[11px] font-bold text-slate-600">모니터링 특성 선택</label>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input type="checkbox" defaultChecked className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5" />
                            <span className="text-[12px] text-slate-700">실린더온도</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input type="checkbox" defaultChecked className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5" />
                            <span className="text-[12px] text-slate-700">냉각밸브압력</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input type="checkbox" defaultChecked className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5" />
                            <span className="text-[12px] text-slate-700">진동</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input type="checkbox" defaultChecked className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5" />
                            <span className="text-[12px] text-slate-700">rpm</span>
                          </label>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-3 pt-4 border-t border-slate-100">
                        <button 
                          className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-[12px] font-bold transition-colors shadow-sm"
                          onClick={() => alert('설정이 성공적으로 저장되었습니다.')}
                        >
                          설정 저장
                        </button>
                        <button 
                          className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-[12px] font-bold transition-colors shadow-sm"
                          onClick={() => alert('재학습 스케줄러를 등록합니다.\n(다음 유휴 시간에 진행됩니다.)')}
                        >
                          재훈련 예약
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* 4. 주문 최적화 모델 */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-purple-700 font-bold text-[15px]">
                  <Info className="w-5 h-5" /> 주문 최적화 모델
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded">ready</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-slate-400">모델 타입</span>
                  <span className="text-[13px] font-bold text-slate-800">regression</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-slate-400">정확도</span>
                  <span className="text-[13px] font-bold text-slate-800">86.0%</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-1">
                <span className="text-[11px] font-bold text-slate-400">입력 특성</span>
                <div className="flex flex-wrap gap-1.5">
                  {['주문패턴', '고객유형', '계절성', '재고수준'].map(feat => (
                    <span key={feat} className="text-[10px] font-bold text-slate-700 bg-[#F4F7FB] px-2 py-1 rounded-md">{feat}</span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1 mt-1">
                <span className="text-[11px] font-bold text-slate-400">목표 컬럼</span>
                <span className="text-[13px] font-bold text-slate-800">optimal_order_qty</span>
              </div>

              <div className="flex flex-col gap-1 mt-1">
                <span className="text-[11px] font-bold text-slate-400">학습 일시</span>
                <span className="text-[13px] font-bold text-slate-800">2026. 4. 10. 오전 12:52:12</span>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100 mt-2">
                <button 
                  className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-md text-[11px] font-bold transition-colors ${
                    expandedModel?.id === 4 && expandedModel?.type === 'predict' 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                  onClick={() => toggleModelExpand(4, 'predict')}
                >
                  <PlayCircle className="w-3.5 h-3.5" /> 예측 실행 {expandedModel?.id === 4 && expandedModel?.type === 'predict' && <ChevronDown className="w-3 h-3 ml-1" />}
                </button>
                <button 
                  className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-md text-[11px] font-bold transition-colors ${
                    expandedModel?.id === 4 && expandedModel?.type === 'evaluate' 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                  onClick={() => toggleModelExpand(4, 'evaluate')}
                >
                  <BarChart2 className="w-3.5 h-3.5" /> 성능 평가 {expandedModel?.id === 4 && expandedModel?.type === 'evaluate' && <ChevronDown className="w-3 h-3 ml-1" />}
                </button>
                <button 
                  className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-md text-[11px] font-bold transition-colors ${
                    expandedModel?.id === 4 && expandedModel?.type === 'settings' 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                  onClick={() => toggleModelExpand(4, 'settings')}
                >
                  <Settings className="w-3.5 h-3.5" /> 설정 {expandedModel?.id === 4 && expandedModel?.type === 'settings' && <ChevronDown className="w-3 h-3 ml-1" />}
                </button>
              </div>

              {/* 4번 모델 확장 패널 */}
              {expandedModel?.id === 4 && (
                <div className="mt-2 pt-4 border-t border-slate-100 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  {expandedModel.type === 'predict' && (
                    <>
                      <div className="flex items-center gap-2 text-emerald-700 font-bold text-[14px] mb-1">
                        <PlayCircle className="w-4 h-4" /> 예측 실행 결과
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-emerald-50/50 rounded-lg p-4 flex flex-col gap-1">
                          <span className="text-[11px] font-bold text-emerald-600">최적 발주량 제안</span>
                          <span className="text-[15px] font-black text-emerald-700">4,500 Unit</span>
                        </div>
                        <div className="bg-blue-50/50 rounded-lg p-4 flex flex-col gap-1">
                          <span className="text-[11px] font-bold text-blue-500">예상 재고 유지 일수</span>
                          <span className="text-[15px] font-black text-blue-600">14.5 일 (적정)</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 mt-1">
                        <div className="flex items-center gap-1.5 text-slate-800 font-bold text-[13px]">
                          <ClipboardList className="w-4 h-4 text-orange-400" /> 분석 인사이트
                        </div>
                        <ul className="flex flex-col gap-1.5 ml-1">
                          <li className="flex items-center gap-2 text-[12px] text-slate-600"><Lightbulb className="w-3.5 h-3.5 text-amber-500" /> 다음 달 고객 주문 급증 대비 재고 사전 확보 필요</li>
                          <li className="flex items-center gap-2 text-[12px] text-slate-600"><Lightbulb className="w-3.5 h-3.5 text-amber-500" /> 현재 물류 창고 CAPA 대비 적정 수치</li>
                          <li className="flex items-center gap-2 text-[12px] text-slate-600"><Lightbulb className="w-3.5 h-3.5 text-amber-500" /> 원자재 단가 상승 전 선발주로 5% 비용 절감 효과 예상</li>
                        </ul>
                      </div>
                      
                      <div className="text-[10px] text-slate-400 mt-2">
                        실행 시간: 2026. 4. 10. 오전 2:18:44
                      </div>
                    </>
                  )}

                  {expandedModel.type === 'evaluate' && (
                    <>
                      <div className="flex items-center gap-2 text-indigo-600 font-bold text-[14px] mb-1">
                        <BarChart2 className="w-4 h-4" /> 성능 평가 결과
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-[#F8FAFC] rounded-lg p-3 flex flex-col gap-2">
                          <span className="text-[11px] font-bold text-indigo-500">R² (설명력)</span>
                          <div className="flex items-end gap-2">
                            <span className="text-[15px] font-black text-indigo-700 w-12">0.89</span>
                            <div className="flex-1 h-2 bg-indigo-100 rounded-full mb-1.5"><div className="h-full bg-indigo-500 rounded-full" style={{ width: '89%' }}></div></div>
                          </div>
                        </div>
                        <div className="bg-[#F0FDF4] rounded-lg p-3 flex flex-col gap-2">
                          <span className="text-[11px] font-bold text-emerald-600">MSE (평균 제곱 오차)</span>
                          <div className="flex items-end gap-2">
                            <span className="text-[15px] font-black text-emerald-700 w-12">150.2</span>
                            <div className="flex-1 h-2 bg-emerald-100 rounded-full mb-1.5"><div className="h-full bg-emerald-500 rounded-full" style={{ width: '80%' }}></div></div>
                          </div>
                        </div>
                        <div className="bg-[#FAF5FF] rounded-lg p-3 flex flex-col gap-2">
                          <span className="text-[11px] font-bold text-purple-600">안전 재고 유지율</span>
                          <div className="flex items-end gap-2">
                            <span className="text-[15px] font-black text-purple-700 w-12">98.2%</span>
                            <div className="flex-1 h-2 bg-purple-100 rounded-full mb-1.5"><div className="h-full bg-purple-500 rounded-full" style={{ width: '98.2%' }}></div></div>
                          </div>
                        </div>
                        <div className="bg-[#FFF7ED] rounded-lg p-3 flex flex-col gap-2">
                          <span className="text-[11px] font-bold text-orange-600">재고 회전율 향상 기여도</span>
                          <div className="flex items-end gap-2">
                            <span className="text-[15px] font-black text-orange-700 w-12">+12%</span>
                            <div className="flex-1 h-2 bg-orange-100 rounded-full mb-1.5"><div className="h-full bg-orange-500 rounded-full" style={{ width: '70%' }}></div></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-[10px] text-slate-400 mt-2">
                        평가 시간: 2026. 4. 10. 오전 2:19:12
                      </div>
                    </>
                  )}

                  {expandedModel.type === 'settings' && (
                    <>
                      <div className="flex items-center gap-2 text-slate-700 font-bold text-[14px] mb-1">
                        <Settings className="w-4 h-4" /> 모델 설정
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-bold text-slate-600">안전 재고 일수 (Buffer)</label>
                          <input type="text" defaultValue="5 days" className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-medium text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-bold text-slate-600">목표 서비스 수준 (Service Level)</label>
                          <input type="text" defaultValue="99.5%" className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-medium text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 mt-2">
                        <label className="text-[11px] font-bold text-slate-600">고려 특성 변수</label>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input type="checkbox" defaultChecked className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5" />
                            <span className="text-[12px] text-slate-700">주문패턴</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input type="checkbox" defaultChecked className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5" />
                            <span className="text-[12px] text-slate-700">고객유형</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input type="checkbox" defaultChecked className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5" />
                            <span className="text-[12px] text-slate-700">계절성</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input type="checkbox" defaultChecked className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5" />
                            <span className="text-[12px] text-slate-700">재고수준</span>
                          </label>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-3 pt-4 border-t border-slate-100">
                        <button 
                          className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-[12px] font-bold transition-colors shadow-sm"
                          onClick={() => alert('설정이 성공적으로 저장되었습니다.')}
                        >
                          설정 저장
                        </button>
                        <button 
                          className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-[12px] font-bold transition-colors shadow-sm"
                          onClick={() => alert('새로운 설정으로 시뮬레이션 환경을 업데이트합니다.')}
                        >
                          설정 적용 및 시뮬레이션
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* 5. 동적으로 생성된 예측 모델들 */}
            {createdModels.map((model) => (
              <div key={model.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 text-indigo-700 font-bold text-[15px]">
                    <Info className="w-5 h-5" /> {model.name}
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded ${
                    model.status === 'training' 
                      ? 'text-blue-600 bg-blue-50 animate-pulse' 
                      : 'text-emerald-600 bg-emerald-50'
                  }`}>
                    {model.status === 'training' ? 'training...' : 'ready'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-bold text-slate-400">모델 타입</span>
                    <span className="text-[13px] font-bold text-slate-800">{model.type}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-bold text-slate-400">학습 진행률</span>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ease-out ${
                            model.status === 'training' ? 'bg-blue-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${model.progress}%` }}
                        ></div>
                      </div>
                      <span className={`text-[11px] font-bold ${
                        model.status === 'training' ? 'text-blue-600' : 'text-emerald-600'
                      }`}>
                        {model.progress}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1 mt-1">
                  <span className="text-[11px] font-bold text-slate-400">목표 컬럼</span>
                  <span className="text-[13px] font-bold text-slate-800">{model.target}</span>
                </div>

                <div className="flex flex-col gap-1 mt-1">
                  <span className="text-[11px] font-bold text-slate-400">요청 일시</span>
                  <span className="text-[13px] font-bold text-slate-800">{model.createdAt}</span>
                </div>
                
                {/* 학습 완료 시 나타나는 액션 버튼들 */}
                {model.status === 'ready' && (
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100 mt-2 animate-in fade-in duration-500">
                    <button 
                      className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-md text-[11px] font-bold transition-colors ${
                        expandedModel?.id === model.id && expandedModel?.type === 'predict' 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                      onClick={() => toggleModelExpand(model.id, 'predict')}
                    >
                      <PlayCircle className="w-3.5 h-3.5" /> 예측 실행 {expandedModel?.id === model.id && expandedModel?.type === 'predict' && <ChevronDown className="w-3 h-3 ml-1" />}
                    </button>
                    <button 
                      className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-md text-[11px] font-bold transition-colors ${
                        expandedModel?.id === model.id && expandedModel?.type === 'evaluate' 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                      onClick={() => toggleModelExpand(model.id, 'evaluate')}
                    >
                      <BarChart2 className="w-3.5 h-3.5" /> 성능 평가 {expandedModel?.id === model.id && expandedModel?.type === 'evaluate' && <ChevronDown className="w-3 h-3 ml-1" />}
                    </button>
                    <button 
                      className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-md text-[11px] font-bold transition-colors ${
                        expandedModel?.id === model.id && expandedModel?.type === 'settings' 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                      onClick={() => toggleModelExpand(model.id, 'settings')}
                    >
                      <Settings className="w-3.5 h-3.5" /> 설정 {expandedModel?.id === model.id && expandedModel?.type === 'settings' && <ChevronDown className="w-3 h-3 ml-1" />}
                    </button>
                  </div>
                )}
                
                {/* 동적 모델 확장 패널 */}
                {expandedModel?.id === model.id && model.status === 'ready' && (
                  <div className="mt-2 pt-4 border-t border-slate-100 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    {expandedModel.type === 'predict' && (
                      <>
                        <div className="flex items-center gap-2 text-emerald-700 font-bold text-[14px] mb-1">
                          <PlayCircle className="w-4 h-4" /> 예측 실행 결과
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-emerald-50/50 rounded-lg p-4 flex flex-col gap-1">
                            <span className="text-[11px] font-bold text-emerald-600">최근 예측 결과</span>
                            <span className="text-[15px] font-black text-emerald-700">
                              {model.type === 'anomaly' ? '정상 (Normal)' : 
                               model.type === 'regression' ? '124.5' : 
                               model.type === 'timeseries' ? '상승 추세' : 'Class A'}
                            </span>
                          </div>
                          <div className="bg-blue-50/50 rounded-lg p-4 flex flex-col gap-1">
                            <span className="text-[11px] font-bold text-blue-500">신뢰도 (Confidence)</span>
                            <span className="text-[15px] font-black text-blue-600">{(85 + Math.random() * 10).toFixed(1)}%</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 mt-1">
                          <div className="flex items-center gap-1.5 text-slate-800 font-bold text-[13px]">
                            <ClipboardList className="w-4 h-4 text-orange-400" /> 실시간 데이터 분석 인사이트
                          </div>
                          <ul className="flex flex-col gap-1.5 ml-1">
                            <li className="flex items-center gap-2 text-[12px] text-slate-600"><Lightbulb className="w-3.5 h-3.5 text-amber-500" /> 현재 수집되는 {model.target} 데이터 스트림 안정적</li>
                            <li className="flex items-center gap-2 text-[12px] text-slate-600"><Lightbulb className="w-3.5 h-3.5 text-amber-500" /> 이전 패턴과 유사한 정상 범위 내 분포</li>
                          </ul>
                        </div>
                      </>
                    )}
                    {expandedModel.type === 'evaluate' && (
                      <>
                        <div className="flex items-center gap-2 text-indigo-600 font-bold text-[14px] mb-1">
                          <BarChart2 className="w-4 h-4" /> 초기 성능 평가 결과
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-[#F8FAFC] rounded-lg p-3 flex flex-col gap-2">
                            <span className="text-[11px] font-bold text-indigo-500">종합 정확도 (Accuracy)</span>
                            <div className="flex items-end gap-2">
                              <span className="text-[15px] font-black text-indigo-700 w-12">92.4%</span>
                              <div className="flex-1 h-2 bg-indigo-100 rounded-full mb-1.5"><div className="h-full bg-indigo-500 rounded-full" style={{ width: '92.4%' }}></div></div>
                            </div>
                          </div>
                          <div className="bg-[#F0FDF4] rounded-lg p-3 flex flex-col gap-2">
                            <span className="text-[11px] font-bold text-emerald-600">F1 점수 (F1-Score)</span>
                            <div className="flex items-end gap-2">
                              <span className="text-[15px] font-black text-emerald-700 w-12">89.1%</span>
                              <div className="flex-1 h-2 bg-emerald-100 rounded-full mb-1.5"><div className="h-full bg-emerald-500 rounded-full" style={{ width: '89.1%' }}></div></div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 mt-2">
                          <div className="flex items-center gap-1.5 text-slate-800 font-bold text-[13px]">
                            <BarChart2 className="w-4 h-4 text-slate-400" /> 평가 데이터 분포
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="bg-[#F8FAFC] rounded-lg flex flex-col items-center justify-center py-3">
                              <span className="text-[14px] font-black text-slate-700">1,024</span>
                              <span className="text-[9px] text-slate-400">평가 데이터 수</span>
                            </div>
                            <div className="bg-[#F8FAFC] rounded-lg flex flex-col items-center justify-center py-3">
                              <span className="text-[14px] font-black text-emerald-500">946</span>
                              <span className="text-[9px] text-slate-400">정답 수 (TP+TN)</span>
                            </div>
                            <div className="bg-[#F8FAFC] rounded-lg flex flex-col items-center justify-center py-3">
                              <span className="text-[14px] font-black text-rose-500">78</span>
                              <span className="text-[9px] text-slate-400">오답 수 (FP+FN)</span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                    {expandedModel.type === 'settings' && (
                      <>
                        <div className="flex items-center gap-2 text-slate-700 font-bold text-[14px] mb-1">
                          <Settings className="w-4 h-4" /> 파이프라인 세부 설정
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-bold text-slate-600">학습률 (Learning Rate)</label>
                            <input type="text" defaultValue="0.01" className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-medium text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-bold text-slate-600">데이터 수집 주기</label>
                            <select className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-medium text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
                              <option>실시간 (Real-time)</option>
                              <option selected>1분 단위 배치 (1 Min Batch)</option>
                              <option>1시간 단위 배치 (1 Hour Batch)</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-3 pt-4 border-t border-slate-100">
                          <button 
                            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-[12px] font-bold transition-colors shadow-sm"
                            onClick={() => alert('설정이 성공적으로 저장되었습니다.')}
                          >
                            설정 저장
                          </button>
                          <button 
                            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-[12px] font-bold transition-colors shadow-sm"
                            onClick={() => alert('새로운 설정으로 파라미터 미세 튜닝(Fine-Tuning)을 예약합니다.')}
                          >
                            파라미터 튜닝
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 이상탐지 탭 */}
      {activeTab === '이상탐지' && (
        <div className="flex flex-col gap-4 flex-1 pb-8 animate-in fade-in duration-300">
          {/* 헤더 */}
          <div className="flex items-center justify-between">
            <h3 className="text-[17px] font-black text-slate-800">이상 탐지 모니터링</h3>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-md text-[12px] font-bold hover:bg-slate-50 shadow-sm transition-colors">
                <Filter className="w-3.5 h-3.5" /> 필터
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-md text-[12px] font-bold hover:bg-slate-50 shadow-sm transition-colors">
                <RefreshCw className="w-3.5 h-3.5" /> 새로고침
              </button>
            </div>
          </div>

          {/* 메인 차트 (Mock-up) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4 relative overflow-hidden">
            <div className="flex items-center justify-between z-10">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-[14px]">
                <Activity className="w-4 h-4" /> 최근 48시간 이상 탐지
              </div>
              <span className="text-[12px] font-medium text-slate-500">실시간 모니터링</span>
            </div>
            
            {/* 실제 차트 영역 (Recharts) */}
            <div className="h-[300px] w-full mt-2 relative">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={anomalyChartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorExpected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                  <YAxis domain={[170, 210]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dx={-10} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' }} />
                  <Area type="monotone" dataKey="expected" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorExpected)" />
                  <Line type="monotone" dataKey="measured" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="anomaly" stroke="#f43f5e" strokeWidth={3} dot={{ r: 5, fill: '#f43f5e', strokeWidth: 2, stroke: '#fff' }} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>

              {/* 오른쪽 범례 (Legend) */}
              <div className="absolute top-2 right-4 bg-white/80 backdrop-blur border border-slate-100 shadow-sm rounded-lg p-3 z-10 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-700 leading-none">예상 온도</span>
                    <span className="text-[8px] text-slate-400 leading-none mt-0.5">정상 범위 기준값</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-700 leading-none">측정 온도</span>
                    <span className="text-[8px] text-slate-400 leading-none mt-0.5">실제 라인 센서값</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-rose-500 rounded-sm"></div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-700 leading-none">이상 탐지</span>
                    <span className="text-[8px] text-slate-400 leading-none mt-0.5">임계치 초과 구간</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 하단 로그 및 상세 카드 Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* 실시간 탐지 로그 리스트 */}
            <div className="bg-[#FFFDF5] rounded-xl border border-amber-100 shadow-sm p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-amber-100/50 pb-2">
                <div className="flex items-center gap-1.5 text-amber-600 font-bold text-[13px]">
                  <AlertTriangle className="w-4 h-4" /> 실시간 탐지 로그
                </div>
                <span className="text-[11px] font-medium text-amber-600/70">최근 1건</span>
              </div>
              
              <div 
                className="bg-white rounded-lg border border-amber-100 p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden group"
                onClick={() => alert('클릭하신 [사출 공정 3라인 실린더 온도 급상승 감지] 로그의 상세 원시 데이터(Raw Data)를 조회하는 페이지로 이동합니다.\n\n이 기능은 데모 버전에서 구현 대기 중입니다.')}
              >
                {/* 좌측 강조 라인 */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400 group-hover:w-1.5 transition-all"></div>
                
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span className="text-[14px] font-bold text-slate-800 group-hover:text-amber-700 transition-colors">사출 공정 3라인 실린더 온도 급상승 감지</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-amber-500 -rotate-90 transition-transform" />
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-black rounded">보통</span>
                  <span className="text-[11px] text-slate-500 font-medium mt-0.5">2026. 4. 10. 오전 10:46:12</span>
                </div>
                
                <div className="flex flex-col gap-1 mt-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-600">이상 점수:</span>
                    <span className="font-black text-slate-800">2.1</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: '40%' }}></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-slate-400">영향 메트릭:</span>
                    <span className="text-[11px] font-bold text-slate-700">실린더 3구역 온도, 냉각 밸브 압력</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-slate-400">권장 조치:</span>
                    <span className="text-[11px] font-bold text-slate-700">냉각수 밸브 1차 점검 및 라인 일시정지</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 탐지 상세 정보 카드 */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-2 text-purple-600 font-black text-[15px]">
                  <AlertTriangle className="w-5 h-5 text-amber-500" /> 사출 공정 3라인 실린더 온도 급상승 감지
                </div>
                <span className="text-[12px] font-black text-slate-600 tracking-wider">MEDIUM</span>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mt-2">
                {/* 영향받는 메트릭 */}
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[12px] font-bold text-slate-800">영향받는 메트릭</span>
                    <span className="text-[13px] font-bold text-slate-600 mt-1">실린더 3구역 온도 <span className="mx-1 text-slate-300">|</span> 냉각 밸브 압력</span>
                  </div>
                  
                  <div className="flex flex-col gap-1 mt-4">
                    <span className="text-[12px] font-bold text-slate-800">권장 조치</span>
                    <ul className="flex flex-col gap-1.5 mt-1 ml-1">
                      <li className="flex items-center gap-2 text-[12px] text-slate-600 before:content-['•'] before:text-slate-400">냉각수 밸브 1차 점검 및 라인 일시정지</li>
                      <li className="flex items-center gap-2 text-[12px] text-slate-600 before:content-['•'] before:text-slate-400">압력 센서 캘리브레이션 진행</li>
                      <li className="flex items-center gap-2 text-[12px] text-slate-600 before:content-['•'] before:text-slate-400">히터 릴레이 모듈 교체 고려</li>
                    </ul>
                  </div>
                </div>

                {/* 이상 점수 그래프 */}
                <div className="flex flex-col gap-1">
                  <span className="text-[12px] font-bold text-slate-800">이상 점수</span>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[20px] font-black text-slate-800">2.1</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: '40%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 패턴 탭 */}
      {activeTab === '패턴' && (
        <div className="flex flex-col gap-4 flex-1 pb-8 animate-in fade-in duration-300">
          {/* 헤더 */}
          <div className="flex items-center justify-between">
            <h3 className="text-[17px] font-black text-slate-800">패턴 매칭 & 시계열 분석</h3>
            <div className="flex items-center gap-2">
              <button 
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 border border-indigo-600 text-white rounded-md text-[12px] font-bold hover:bg-indigo-700 shadow-sm transition-colors"
                onClick={() => alert('과거 데이터에서 선택한 패턴과 유사한 구간을 검색합니다.')}
              >
                <Search className="w-3.5 h-3.5" /> 패턴 검색
              </button>
              <button 
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-md text-[12px] font-bold hover:bg-slate-50 shadow-sm transition-colors"
                onClick={() => alert('시계열 분석을 위한 파라미터(Window Size, Threshold 등)를 설정합니다.')}
              >
                <Settings className="w-3.5 h-3.5" /> 시계열 분석 설정
              </button>
            </div>
          </div>

          {/* 상단 요약 지표 (패턴 탭 전용) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-indigo-100 shadow-sm p-4 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-slate-500">탐지된 패턴 (최근 24h)</span>
              <div className="flex items-end justify-between mt-2">
                <span className="text-[24px] font-black text-indigo-700">4<span className="text-[12px] font-medium text-slate-400 ml-1">건</span></span>
                <TrendingUp className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div className="bg-white rounded-xl border border-emerald-100 shadow-sm p-4 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-slate-500">강한 패턴 일치율 (&gt;80%)</span>
              <div className="flex items-end justify-between mt-2">
                <span className="text-[24px] font-black text-emerald-600">2<span className="text-[12px] font-medium text-slate-400 ml-1">건</span></span>
                <Target className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div className="bg-white rounded-xl border border-amber-100 shadow-sm p-4 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-slate-500">알 수 없는 패턴 (분석 요망)</span>
              <div className="flex items-end justify-between mt-2">
                <span className="text-[24px] font-black text-amber-600">1<span className="text-[12px] font-medium text-slate-400 ml-1">건</span></span>
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div className="bg-white rounded-xl border border-purple-100 shadow-sm p-4 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-slate-500">패턴 기반 예측 정확도</span>
              <div className="flex items-end justify-between mt-2">
                <span className="text-[24px] font-black text-purple-600">89<span className="text-[16px] font-black">%</span></span>
                <Target className="w-5 h-5 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 좌측: 시계열 분해 (Decomposition) 패널 */}
            <div className="bg-[#FAF5FF] rounded-xl border border-purple-100 shadow-sm p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-purple-700 font-bold text-[14px] border-b border-purple-200/50 pb-2">
                <Activity className="w-4 h-4" /> 시계열 특성 분해 (Time-series Decomposition)
              </div>
              
              <div className="flex flex-col gap-3">
                {/* 트렌드 */}
                <div className="bg-white rounded-lg border border-purple-100 p-3 shadow-sm group hover:border-purple-300 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-purple-500" />
                      <span className="text-[13px] font-bold text-slate-800">트렌드 (Trend)</span>
                    </div>
                    <span className="text-[11px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">강도 85%</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded font-bold">증가 추세</span>
                    </div>
                    <span>최근 3일 연속 상승 패턴 감지</span>
                  </div>
                  {/* 미니 프로그레스 바 형태의 시각화 */}
                  <div className="w-full h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-300 to-purple-600 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>

                {/* 계절성 */}
                <div className="bg-white rounded-lg border border-purple-100 p-3 shadow-sm group hover:border-purple-300 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Repeat className="w-4 h-4 text-indigo-500" />
                      <span className="text-[13px] font-bold text-slate-800">계절성 (Seasonality)</span>
                    </div>
                    <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">강도 72%</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-600">주기:</span>
                      <span className="text-slate-700">약 8시간 (교대 근무 주기)</span>
                    </div>
                  </div>
                  <div className="w-full h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-300 to-indigo-600 rounded-full" style={{ width: '72%' }}></div>
                  </div>
                </div>

                {/* 순환성 */}
                <div className="bg-white rounded-lg border border-purple-100 p-3 shadow-sm group hover:border-purple-300 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <RefreshCw className="w-4 h-4 text-blue-500" />
                      <span className="text-[13px] font-bold text-slate-800">순환성 (Cyclic)</span>
                    </div>
                    <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">강도 61%</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-600">주기:</span>
                      <span className="text-slate-700">약 5일 (설비 점검 주기)</span>
                    </div>
                  </div>
                  <div className="w-full h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-300 to-blue-600 rounded-full" style={{ width: '61%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* 우측: 패턴 매칭 결과 및 액션 */}
            <div className="flex flex-col gap-4">
              
              {/* 현재 매칭된 위험 패턴 */}
              <div className="bg-white rounded-xl border border-rose-200 shadow-sm p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Target className="w-24 h-24 text-rose-500" />
                </div>
                
                <div className="flex items-center gap-2 text-rose-600 font-bold text-[14px] border-b border-rose-100 pb-2 mb-3 relative z-10">
                  <Crosshair className="w-4 h-4" /> 현재 진행 중인 유사 패턴 매칭
                </div>
                
                <div className="flex flex-col gap-1.5 relative z-10">
                  <h4 className="text-[15px] font-black text-slate-800">설비 노후화로 인한 전력 소비 점진적 증가 패턴</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] text-slate-500">유사도 (Similarity Score)</span>
                    <span className="text-[14px] font-black text-rose-500 animate-pulse">88.4% 매칭</span>
                  </div>
                </div>

                <div className="bg-rose-50 rounded-lg p-3 mt-4 relative z-10 border border-rose-100">
                  <span className="text-[11px] font-bold text-rose-700 block mb-1">과거 유사 사례 조치 결과</span>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    2025년 11월, 동일한 패턴(유사도 89%)이 3일간 지속된 후 <span className="font-bold text-rose-600">메인 모터 과열로 인한 라인 중단(2시간)</span> 발생 이력 있음.
                  </p>
                </div>
              </div>

              {/* 패턴 기반 권장 사항 (플랫폼 맞춤형) */}
              <div className="bg-[#F0FDF4] rounded-xl border border-emerald-200 shadow-sm p-5 flex-1">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-[14px] border-b border-emerald-200/50 pb-2 mb-3">
                  <Lightbulb className="w-4 h-4" /> 패턴 분석 기반 권장 액션
                </div>
                
                <ul className="flex flex-col gap-3">
                  <li className="flex items-start gap-2 bg-white p-3 rounded-lg border border-emerald-100 shadow-sm group hover:border-emerald-300 transition-colors cursor-pointer">
                    <CheckSquare className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[12px] font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">강한 트렌드 패턴을 활용한 수요 예측 모델 갱신</span>
                      <span className="text-[10px] text-slate-500">현재 증가 추세인 트렌드 가중치를 '수출 예측 모델'에 반영하여 정확도 향상 권장</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2 bg-white p-3 rounded-lg border border-emerald-100 shadow-sm group hover:border-emerald-300 transition-colors cursor-pointer">
                    <CheckSquare className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[12px] font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">계절성(교대 근무) 패턴을 고려한 냉각수 세팅</span>
                      <span className="text-[10px] text-slate-500">주기적으로 발생하는 온도 상승 패턴에 대비, 교대 시간 30분 전 쿨링 타임 스케줄링 설정</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2 bg-white p-3 rounded-lg border border-rose-100 shadow-sm group hover:border-rose-300 transition-colors cursor-pointer">
                    <AlertTriangle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[12px] font-bold text-slate-800 group-hover:text-rose-700 transition-colors">매칭된 위험 패턴 기반 예방 보전 지시</span>
                      <span className="text-[10px] text-slate-500">전력 소비 패턴이 위험 수위에 도달함. 주말 유휴 시간에 2라인 메인 모터 선제 점검 지시서 발송 요망</span>
                    </div>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 융합 탭 */}
      {activeTab === '융합' && (
        <div className="flex flex-col gap-4 flex-1 pb-8 animate-in fade-in duration-300">
          {/* 헤더 */}
          <div className="flex items-center justify-between">
            <h3 className="text-[17px] font-black text-slate-800">데이터 융합 네트워크</h3>
            <div className="flex items-center gap-2">
              <button 
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 border border-indigo-600 text-white rounded-md text-[12px] font-bold hover:bg-indigo-700 shadow-sm transition-colors"
                onClick={() => alert('서로 다른 데이터 소스(온도, 전력, 진동 등) 간의 상관관계를 분석하는 파이프라인을 실행합니다.')}
              >
                <Share2 className="w-3.5 h-3.5" /> 네트워크 분석
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* 좌측: 주요 엔티티 리스트 */}
            <div className="bg-[#F8FAFC] rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-200/50 pb-2">
                <div className="flex items-center gap-2 text-indigo-700 font-bold text-[14px]">
                  <Share2 className="w-4 h-4" /> 주요 융합 엔티티 (상위 5개)
                </div>
                <span className="text-[11px] font-bold text-slate-500">총 48개</span>
              </div>

              <div className="flex flex-col gap-3">
                {[
                  { id: 1, name: '메인 사출 모터 (Line 3)', type: 'equipment', links: 8, risk: 2.1, linkProgress: 100, riskProgress: 80, isAlert: true },
                  { id: 2, name: '냉각수 펌프 밸브', type: 'component', links: 5, risk: 0.8, linkProgress: 60, riskProgress: 30, isAlert: false },
                  { id: 3, name: '실린더 온도 센서', type: 'sensor', links: 4, risk: 0.5, linkProgress: 50, riskProgress: 20, isAlert: false },
                  { id: 4, name: '북미 수출용 조립품 (A-type)', type: 'product', links: 3, risk: 0.2, linkProgress: 40, riskProgress: 10, isAlert: false },
                  { id: 5, name: '고강도 강화 플라스틱 원료', type: 'material', links: 2, risk: 0.1, linkProgress: 25, riskProgress: 5, isAlert: false },
                ].map((entity) => (
                  <div 
                    key={entity.id}
                    className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all group flex flex-col gap-3 relative overflow-hidden cursor-pointer"
                    onClick={() => alert(`클릭하신 [${entity.name}] 엔티티를 중심으로 네트워크 연관성 다이어그램(Graph UI)을 화면에 렌더링합니다.\n\n이 기능은 데모 버전에서 구현 대기 중입니다.`)}
                  >
                    {entity.isAlert && <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400"></div>}
                    
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${entity.isAlert ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
                        {entity.id}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{entity.name}</span>
                        <span className="text-[10px] text-slate-500 font-medium">{entity.type}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 items-center">
                      {/* 연결 수 */}
                      <div className="flex flex-col gap-1 items-center justify-center">
                        <span className="text-[11px] font-bold text-slate-500">연결 수</span>
                        <span className="text-[16px] font-black text-indigo-600">{entity.links}</span>
                        <div className="w-full max-w-[100px] h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${entity.linkProgress}%` }}></div>
                        </div>
                      </div>
                      
                      {/* 리스크 점수 */}
                      <div className="flex flex-col gap-1 items-center justify-center border-l border-slate-100">
                        <span className="text-[11px] font-bold text-slate-500">연쇄 리스크 점수</span>
                        <span className={`text-[16px] font-black ${entity.isAlert ? 'text-amber-600' : 'text-emerald-500'}`}>{entity.risk.toFixed(1)}</span>
                        <div className="w-full max-w-[100px] h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${entity.isAlert ? 'bg-amber-500' : 'bg-emerald-400'}`} style={{ width: `${entity.riskProgress}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-center pt-2">
                <span className="text-[11px] text-slate-400 font-medium">+43개의 추가 엔티티가 백그라운드에서 분석 중입니다</span>
              </div>
            </div>

            {/* 우측: 융합 인사이트 및 관계도 또는 네트워크 그래프 */}
            <div className="flex flex-col gap-4">
              
              {selectedEntity ? (
                /* 동적 네트워크 시각화 그래프 UI */
                <div className="bg-slate-50 rounded-xl border border-indigo-200 shadow-md p-5 flex flex-col h-full min-h-[500px] relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                  <div className="flex items-center justify-between border-b border-indigo-100 pb-3 mb-4 relative z-20">
                    <div className="flex items-center gap-2 text-indigo-700 font-bold text-[15px]">
                      <Network className="w-5 h-5" /> 엔티티 중심 연관 네트워크
                    </div>
                    <button 
                      onClick={() => setSelectedEntity(null)}
                      className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-md text-[11px] font-bold hover:bg-slate-100 transition-colors"
                    >
                      돌아가기
                    </button>
                  </div>
                  
                  {/* 그래프 캔버스 */}
                  <div className="flex-1 relative flex items-center justify-center w-full h-full">
                    {/* SVG 연결선 */}
                    <svg className="absolute inset-0 w-full h-full z-0">
                      <style>
                        {`
                          @keyframes flow {
                            to { stroke-dashoffset: -20; }
                          }
                          .data-flow {
                            animation: flow 1s linear infinite;
                          }
                        `}
                      </style>
                      {/* 중앙에서 각 노드로 뻗어나가는 선 */}
                      <line x1="50%" y1="50%" x2="20%" y2="25%" stroke="#a5b4fc" strokeWidth="2" strokeDasharray="5 5" className="data-flow" />
                      <line x1="50%" y1="50%" x2="80%" y2="25%" stroke="#a5b4fc" strokeWidth="2" strokeDasharray="5 5" className="data-flow" />
                      <line x1="50%" y1="50%" x2="20%" y2="75%" stroke="#a5b4fc" strokeWidth="2" strokeDasharray="5 5" className="data-flow" />
                      <line x1="50%" y1="50%" x2="80%" y2="75%" stroke="#a5b4fc" strokeWidth="2" strokeDasharray="5 5" className="data-flow" />
                      
                      {/* 노드간 보조 선 */}
                      <line x1="20%" y1="25%" x2="80%" y2="25%" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="20%" y1="75%" x2="80%" y2="75%" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />
                    </svg>

                    {/* 중앙 엔티티 (선택된 노드) */}
                    <div className="absolute z-10 flex flex-col items-center gap-1">
                      <div className="w-28 h-28 bg-indigo-600 rounded-full flex flex-col items-center justify-center text-white shadow-xl shadow-indigo-200 border-4 border-indigo-100 p-2 text-center animate-pulse">
                        <span className="text-[10px] font-medium opacity-80">{selectedEntity.type}</span>
                        <span className="text-[12px] font-black leading-tight break-keep">{selectedEntity.name}</span>
                      </div>
                    </div>

                    {/* 주변 위성 노드 1 */}
                    <div className="absolute top-[25%] left-[20%] -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-1 group cursor-pointer hover:scale-110 transition-transform">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-700 shadow-md border-2 border-emerald-400 p-2 text-center">
                        <span className="text-[10px] font-bold leading-tight break-keep">냉각수 온도</span>
                      </div>
                      <span className="bg-emerald-100 text-emerald-700 text-[9px] px-1.5 py-0.5 rounded font-bold">상관도 94%</span>
                    </div>

                    {/* 주변 위성 노드 2 */}
                    <div className="absolute top-[25%] left-[80%] -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-1 group cursor-pointer hover:scale-110 transition-transform">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-700 shadow-md border-2 border-blue-400 p-2 text-center">
                        <span className="text-[10px] font-bold leading-tight break-keep">라인 전력량</span>
                      </div>
                      <span className="bg-blue-100 text-blue-700 text-[9px] px-1.5 py-0.5 rounded font-bold">상관도 88%</span>
                    </div>

                    {/* 주변 위성 노드 3 */}
                    <div className="absolute top-[75%] left-[20%] -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-1 group cursor-pointer hover:scale-110 transition-transform">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-700 shadow-md border-2 border-amber-400 p-2 text-center">
                        <span className="text-[10px] font-bold leading-tight break-keep">진동 주파수</span>
                      </div>
                      <span className="bg-amber-100 text-amber-700 text-[9px] px-1.5 py-0.5 rounded font-bold">상관도 76%</span>
                    </div>

                    {/* 주변 위성 노드 4 */}
                    <div className="absolute top-[75%] left-[80%] -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-1 group cursor-pointer hover:scale-110 transition-transform">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-700 shadow-md border-2 border-rose-400 p-2 text-center">
                        <span className="text-[10px] font-bold leading-tight break-keep">불량 발생률</span>
                      </div>
                      <span className="bg-rose-100 text-rose-700 text-[9px] px-1.5 py-0.5 rounded font-bold">리스크 62%</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 bg-white p-3 rounded-lg border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2 shadow-sm relative z-20">
                    <Info className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>선택된 <strong className="text-indigo-600">{selectedEntity.name}</strong>은(는) 현재 4개의 주요 외부 데이터 노드와 실시간으로 강한 인과관계를 형성하고 있습니다. 각 노드를 클릭하여 하위 뎁스(Depth)의 연결을 확장할 수 있습니다.</span>
                  </div>
                </div>
              ) : (
                <>
                  {/* 인사이트 요약 카드 */}
                  <div className="bg-white rounded-xl border border-indigo-100 shadow-sm p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <Lightbulb className="w-32 h-32 text-indigo-500" />
                </div>
                
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-[14px] border-b border-indigo-100 pb-2 mb-4 relative z-10">
                  <Lightbulb className="w-4 h-4" /> 데이터 융합 인사이트
                </div>
                
                <div className="flex flex-col gap-4 relative z-10">
                  <div className="flex flex-col gap-1">
                    <span className="text-[12px] font-bold text-slate-700">네트워크 구조 요약</span>
                    <p className="text-[12px] text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                      현재 공정 네트워크는 <span className="font-bold text-indigo-600">'메인 사출 모터 (Line 3)'</span> 엔티티를 중심으로 강하게 결속되어 있습니다. (전체 연결의 35% 집중)
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <span className="text-[12px] font-bold text-slate-700">핵심 융합 관계</span>
                    <p className="text-[12px] text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                      주요 관계 유형은 <span className="font-bold text-indigo-600">온도 데이터 ↔ 전력 소비량</span> 입니다. (총 12개 엣지)
                    </p>
                  </div>

                  <div className="flex items-start gap-2 bg-indigo-50 p-3 rounded-lg border border-indigo-100 mt-2">
                    <Info className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                    <span className="text-[11px] text-indigo-700 font-medium leading-relaxed">
                      이러한 중앙 집중형 구조는 하나의 장비 문제가 전체 라인으로 빠르게 전파될 수 있는 <span className="font-bold underline decoration-indigo-300 underline-offset-2">도미노 리스크(Cascading Risk)</span>를 의미합니다. '메인 사출 모터'에 대한 모니터링 가중치를 상향 조정했습니다.
                    </span>
                  </div>
                </div>
              </div>

              {/* 주요 관계 (Relations) 리스트 */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex-1">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-[14px] border-b border-slate-100 pb-2 mb-4">
                  <GitMerge className="w-4 h-4 text-slate-500" /> 감지된 주요 데이터 융합 관계
                </div>
                
                <ul className="flex flex-col gap-3">
                  <li className="flex flex-col gap-2 p-3 rounded-lg border border-slate-100 hover:border-indigo-200 transition-colors group">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">메인 사출 모터</span>
                      <Link2 className="w-3 h-3 text-indigo-400" />
                      <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">냉각수 펌프 밸브</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pl-1">
                      <span>관계성: <span className="font-bold text-indigo-600">열 교환 의존성 (Heat Exchange)</span></span>
                      <span>신뢰도: 94%</span>
                    </div>
                  </li>
                  
                  <li className="flex flex-col gap-2 p-3 rounded-lg border border-slate-100 hover:border-indigo-200 transition-colors group">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">실린더 온도 센서</span>
                      <Link2 className="w-3 h-3 text-indigo-400" />
                      <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">북미 수출용 조립품</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pl-1">
                      <span>관계성: <span className="font-bold text-indigo-600">품질 영향 (Quality Impact)</span></span>
                      <span>신뢰도: 88%</span>
                    </div>
                  </li>

                  <li className="flex flex-col gap-2 p-3 rounded-lg border border-slate-100 hover:border-indigo-200 transition-colors group">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">진동 센서 V-01</span>
                      <Link2 className="w-3 h-3 text-slate-300" />
                      <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">고강도 플라스틱 원료</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pl-1">
                      <span>관계성: <span className="font-bold text-slate-500">물리적 마찰 (Physical Friction)</span></span>
                      <span>신뢰도: 62%</span>
                    </div>
                  </li>
                </ul>
              </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. 새 모델 생성 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-[16px] font-black text-slate-800 flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-600" />
                새 예측 모델 생성 마법사
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-medium"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-slate-700">모델 이름 <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  value={newModelName}
                  onChange={(e) => setNewModelName(e.target.value)}
                  placeholder="예: 공정 불량 예측 모델 v2" 
                  className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-slate-700">모델 타입 <span className="text-rose-500">*</span></label>
                  <select 
                    value={newModelType}
                    onChange={(e) => setNewModelType(e.target.value)}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="classification">분류 (Classification)</option>
                    <option value="regression">회귀 (Regression)</option>
                    <option value="timeseries">시계열 (Time-series)</option>
                    <option value="anomaly">이상 탐지 (Anomaly)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-slate-700">목표 컬럼 (Target) <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    value={newModelTarget}
                    onChange={(e) => setNewModelTarget(e.target.value)}
                    placeholder="예: is_defective" 
                    className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-bold text-slate-700">입력 특성 (Features) 선택</label>
                <div className="p-3 border border-slate-200 rounded-lg bg-slate-50 flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {['온도', '습도', '압력', '진동', 'rpm', '전력량', '근무조', '재질', '두께', '라인번호'].map((feature, i) => (
                    <label key={i} className="flex items-center gap-1.5 cursor-pointer bg-white px-2.5 py-1.5 rounded border border-slate-200 shadow-sm hover:border-indigo-300">
                      <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5" />
                      <span className="text-[11px] font-bold text-slate-600">{feature}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-[12px] font-bold text-slate-600 hover:bg-slate-200 bg-slate-100 border border-slate-200 rounded-lg transition-colors shadow-sm"
              >
                취소
              </button>
              <button 
                onClick={handleCreateModel}
                className="px-4 py-2 text-[12px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
              >
                모델 생성 시작
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
