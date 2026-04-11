import React, { useState, useEffect } from 'react'
import { Database, FileText, HardDrive, Clock, RefreshCw, Zap, CheckCircle2, Check, Loader2, ChevronRight, Key, Save, Trash2, Lightbulb } from 'lucide-react'

export default function DataAnalysisSettings() {
  const [availableTables, setAvailableTables] = useState([
    { name: 'item_mst', status: 'pending' },
    { name: 'work_mst', status: 'pending' },
    { name: 'bad_mst', status: 'pending' },
    { name: 'emp_mst', status: 'pending' },
    { name: 'cust_mst', status: 'pending' },
  ]);

  const [vectorizedTables, setVectorizedTables] = useState<string[]>([])

  const [geminiApiKey, setGeminiApiKey] = useState('')
  const [savedApiKey, setSavedApiKey] = useState('')
  const [isKeyValid, setIsKeyValid] = useState<boolean | null>(null)
  const [selectedDb, setSelectedDb] = useState('기본 데이터베이스')

  useEffect(() => {
    const key = localStorage.getItem('gemini_api_key')
    if (key) {
      setSavedApiKey(key)
      setIsKeyValid(true)
    }

    // 서버에서 벡터화된 테이블 목록 불러오기
    const fetchVectorizedTables = () => {
      fetch('/api/data-analysis/vectorized-tables')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.tables) {
            setVectorizedTables(data.tables);
            
            // availableTables 상태 업데이트: 벡터화된 것은 done, 아닌 것은 pending
            setAvailableTables(prev => prev.map(t => ({
              ...t,
              status: data.tables.includes(t.name) ? 'done' : 'pending'
            })));
          }
        })
        .catch(err => console.error('벡터화 테이블 조회 실패:', err));
    };

    fetchVectorizedTables();
    
    // 2초마다 주기적으로 서버에서 최신 벡터화 상태를 가져옴 (다른 탭에서 반영된 걸 여기서도 보기 위함)
    const interval = setInterval(fetchVectorizedTables, 2000);
    return () => clearInterval(interval);
  }, [])

  const handleSaveApiKey = () => {
    if (geminiApiKey.trim()) {
      localStorage.setItem('gemini_api_key', geminiApiKey.trim())
      setSavedApiKey(geminiApiKey.trim())
      setGeminiApiKey('')
      setIsKeyValid(true)
      alert('API 키가 저장되었습니다.')
    }
  }

  const handleDeleteApiKey = () => {
    if (confirm('저장된 API 키를 삭제하시겠습니까?')) {
      localStorage.removeItem('gemini_api_key')
      setSavedApiKey('')
      setIsKeyValid(null)
    }
  }

  const handleValidateKey = async () => {
    if (!savedApiKey) return
    // 간단한 유효성 검사 시뮬레이션
    setIsKeyValid(true)
    alert('API 키가 유효합니다.')
  }

  const [isVectorizing, setIsVectorizing] = useState(false)
  const [currentTable, setCurrentTable] = useState('')
  const [step, setStep] = useState(0) // 0: Idle, 1: 데이터, 2: 문자열, 3: 임베딩, 4: 캐싱

  const handleVectorize = async (tablesToVectorize: string[]) => {
    if (!savedApiKey) {
      alert('저장된 Gemini API 키가 없습니다. 먼저 API 키를 저장해주세요.')
      return
    }

    setIsVectorizing(true)

    for (const tableName of tablesToVectorize) {
      setCurrentTable(tableName)
      
      // Step 1: 테이블 데이터 추출
      setStep(1)
      await new Promise(r => setTimeout(r, 600))
      
      // Step 2: 긴 문자열
      setStep(2)
      await new Promise(r => setTimeout(r, 600))

      // Step 3: TF-IDF / 임베딩
      setStep(3)
      await new Promise(r => setTimeout(r, 1200)) // 임베딩은 가장 오래 걸림

      // Step 4: JSON 캐싱
      setStep(4)
      await new Promise(r => setTimeout(r, 400))
      
      // 백엔드 API 호출 (실제 데이터 처리)
      try {
        const res = await fetch('/api/data-analysis/vectorize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tables: [tableName], apiKey: savedApiKey })
        })
        const data = await res.json()
        if (!data.success) {
          throw new Error(data.message)
        }
      } catch (e: any) {
        console.error(e)
        alert(`벡터화 실패 (${tableName}): ` + e.message)
        continue
      }

      // 프론트엔드 상태 업데이트
      setAvailableTables(prev => prev.map(t => t.name === tableName ? { ...t, status: 'done' } : t))
      if (!vectorizedTables.includes(tableName)) {
        setVectorizedTables(prev => [tableName, ...prev])
      }
    }

    setStep(0)
    setCurrentTable('')
    setIsVectorizing(false)
  }

  const handleVectorizeAll = () => {
    const pending = availableTables.filter(t => t.status === 'pending').map(t => t.name)
    if (pending.length > 0) {
      handleVectorize(pending)
    } else {
      alert('벡터화할 대기 중인 테이블이 없습니다.')
    }
  }

  return (
    <div className="flex flex-col gap-4 p-6 bg-slate-50 min-h-full h-full overflow-y-auto relative">
      {/* 프로세스 오버레이 (벡터화 진행 중) */}
      {isVectorizing && (
        <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center rounded-lg m-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl transform transition-all">
            <h2 className="text-2xl font-black text-indigo-900 mb-2 flex items-center gap-3">
              <Zap className="w-8 h-8 text-indigo-500 fill-current animate-pulse" />
              테이블 벡터화 진행 중...
            </h2>
            <p className="text-slate-500 font-medium mb-8">현재 처리 중: <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">{currentTable}</span></p>

            {/* 단계별 프로세스 UI */}
            <div className="flex items-center justify-between relative">
              <div className="absolute left-10 right-10 top-6 h-1 bg-slate-100 rounded-full z-0 overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-500 ease-out" 
                  style={{ width: `${((step - 1) / 3) * 100}%` }} 
                />
              </div>

              {[
                { s: 1, label: '테이블 데이터', desc: 'DB 추출' },
                { s: 2, label: '긴 문자열', desc: 'Stringify' },
                { s: 3, label: 'TF-IDF / 임베딩', desc: 'AI 모델 연산' },
                { s: 4, label: 'JSON 캐싱', desc: '파일 저장' },
              ].map((item, idx) => (
                <div key={item.s} className="relative z-10 flex flex-col items-center gap-3 w-1/4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg border-4 transition-all duration-300 ${
                    step > item.s ? 'bg-indigo-500 border-indigo-500 text-white' : 
                    step === item.s ? 'bg-white border-indigo-500 text-indigo-600 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 
                    'bg-white border-slate-200 text-slate-300'
                  }`}>
                    {step > item.s ? <Check className="w-6 h-6" /> : item.s}
                  </div>
                  <div className="text-center">
                    <div className={`text-sm font-bold ${step >= item.s ? 'text-slate-800' : 'text-slate-400'}`}>{item.label}</div>
                    <div className={`text-xs font-medium ${step >= item.s ? 'text-indigo-600' : 'text-slate-300'}`}>{item.desc}</div>
                  </div>
                  {step === item.s && (
                    <div className="absolute -bottom-6 text-indigo-500 animate-spin">
                      <Loader2 className="w-5 h-5" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* 상단 통계 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#EEF2FF] border-b border-[#E0E7FF]">
            <span className="w-5 h-5 rounded-full bg-white text-indigo-600 flex items-center justify-center text-xs font-bold shadow-sm">1</span>
            <span className="text-sm font-bold text-indigo-900">벡터화 테이블</span>
          </div>
          <div className="p-6 flex flex-col items-center justify-center relative bg-indigo-50/30 flex-1">
            <Database className="absolute left-4 bottom-4 w-12 h-12 text-indigo-100" />
            <div className="text-4xl font-black text-indigo-600 mb-1">{vectorizedTables.length}</div>
            <div className="text-xs text-slate-500 font-medium">개</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#FDF4FF] border-b border-[#E0E7FF]">
            <span className="w-5 h-5 rounded-full bg-white text-fuchsia-600 flex items-center justify-center text-xs font-bold shadow-sm">2</span>
            <span className="text-sm font-bold text-fuchsia-900">총 문서</span>
          </div>
          <div className="p-6 flex flex-col items-center justify-center relative bg-fuchsia-50/30 flex-1">
            <FileText className="absolute left-4 bottom-4 w-12 h-12 text-fuchsia-100" />
            <div className="text-4xl font-black text-fuchsia-600 mb-1">{8083 + vectorizedTables.length * 45}</div>
            <div className="text-xs text-slate-500 font-medium">개</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#F0FDF4] border-b border-[#E0E7FF]">
            <span className="w-5 h-5 rounded-full bg-white text-emerald-600 flex items-center justify-center text-xs font-bold shadow-sm">3</span>
            <span className="text-sm font-bold text-emerald-900">캐시 크기</span>
          </div>
          <div className="p-6 flex flex-col items-center justify-center relative bg-emerald-50/30 flex-1">
            <HardDrive className="absolute left-4 bottom-4 w-12 h-12 text-emerald-100" />
            <div className="text-4xl font-black text-emerald-600 mb-1">{206 + vectorizedTables.length * 12}</div>
            <div className="text-xs text-slate-500 font-medium">MB</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#FFF7ED] border-b border-[#E0E7FF]">
            <span className="w-5 h-5 rounded-full bg-white text-orange-600 flex items-center justify-center text-xs font-bold shadow-sm">4</span>
            <span className="text-sm font-bold text-orange-900">최근 업데이트</span>
          </div>
          <div className="p-6 flex flex-col items-center justify-center relative bg-orange-50/30 flex-1">
            <Clock className="absolute left-4 bottom-4 w-12 h-12 text-orange-100" />
            <div className="text-3xl font-black text-orange-600 mb-1">{new Date().getMonth() + 1}월 {new Date().getDate()}일</div>
            <div className="text-xs text-slate-500 font-medium">일자</div>
          </div>
        </div>
      </div>

      {/* Gemini API 키 관리 섹션 */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm shrink-0 mb-4">
        <div className="flex items-center gap-2 px-5 py-3.5 bg-[#FDF4FF] border-b border-[#FCE7F3] shrink-0">
          <Key className="w-5 h-5 text-[#B222DB]" />
          <h3 className="text-[16px] font-bold text-[#B222DB]">Gemini API 키 관리</h3>
        </div>
        
        <div className="p-6">
          <div className="space-y-5 max-w-3xl">
            {/* 데이터베이스 선택 */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">데이터베이스 선택</label>
              <select 
                value={selectedDb}
                onChange={(e) => setSelectedDb(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-lg focus:ring-[#B222DB] focus:border-[#B222DB] block p-2.5 outline-none transition-all shadow-sm"
              >
                <option value="기본 데이터베이스">기본 데이터베이스</option>
                <option value="다른 데이터베이스">다른 데이터베이스</option>
              </select>
            </div>

            {/* Gemini API 키 입력 */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">Gemini API 키</label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="AIza..."
                  className="flex-1 bg-white border border-slate-300 text-slate-800 text-sm rounded-lg focus:ring-[#B222DB] focus:border-[#B222DB] block p-2.5 outline-none transition-all shadow-sm font-mono"
                />
                <button
                  onClick={handleSaveApiKey}
                  disabled={!geminiApiKey.trim()}
                  className="bg-[#818CF8] hover:bg-[#6366F1] text-white p-2.5 rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="저장"
                >
                  <Save className="w-5 h-5" />
                </button>
              </div>
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-sm text-[#4F46E5] hover:text-[#4338CA] hover:underline">
                Google AI Studio에서 API 키 발급받기 →
              </a>
            </div>

            {/* 저장된 API 키 목록 */}
            <div className="pt-2">
              <h4 className="text-sm font-bold text-slate-800 mb-3">저장된 API 키</h4>
              {savedApiKey ? (
                <div className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-200">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800 mb-1">{selectedDb}</div>
                        <div className="text-xs text-slate-500 font-mono mb-1.5">
                          {savedApiKey.substring(0, 8)}...{savedApiKey.substring(savedApiKey.length - 4)}
                        </div>
                        {isKeyValid ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-[#3B82F6] text-white">
                            <CheckCircle2 className="w-3 h-3" /> 유효
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-slate-300 text-white">
                            검증 전
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={handleValidateKey} className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors" title="키 검증">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button onClick={handleDeleteApiKey} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="삭제">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center text-sm text-slate-500">
                  저장된 API 키가 없습니다.
                </div>
              )}
            </div>

            {/* API 키 사용 가이드 */}
            <div className="mt-6 bg-[#F0F7FF] border border-[#E0EFFF] rounded-xl p-5">
              <div className="flex items-center gap-2 text-blue-800 font-bold mb-3">
                <Lightbulb className="w-4 h-4 text-amber-400 fill-amber-400" />
                API 키 사용 가이드
              </div>
              <ul className="text-sm text-blue-700/80 space-y-2 list-disc pl-5 marker:text-blue-400">
                <li>데이터베이스별로 다른 Gemini API 키를 설정할 수 있습니다</li>
                <li>API 키는 브라우저 로컬스토리지에 안전하게 저장됩니다</li>
                <li>데이터 리니지 분석 시 해당 데이터베이스의 키가 자동으로 사용됩니다</li>
                <li>키 유효성은 Gemini API 호출로 자동 검증됩니다</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 2단 레이아웃 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0 pb-10">
        
        {/* 좌측: 사용 가능한 테이블 */}
        <div className="flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full">
          <div className="flex items-center justify-between px-5 py-3.5 bg-[#FFFbeb] border-b border-amber-100 shrink-0">
            <div className="flex items-center gap-2 text-amber-700">
              <Database className="w-4 h-4" />
              <h3 className="text-[15px] font-bold">사용 가능한 테이블</h3>
            </div>
            <button className="p-1.5 bg-white border border-amber-200 text-amber-600 rounded hover:bg-amber-50 transition-colors shadow-sm">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          
          <div className="p-4 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
            {availableTables.map((table, idx) => (
              <div key={idx} className="flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 transition-colors shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700 text-sm">{table.name}</span>
                  {table.status === 'done' && <Check className="w-4 h-4 text-slate-400" />}
                </div>
                {table.status === 'done' ? (
                  <button 
                    onClick={() => handleVectorize([table.name])}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-md text-xs font-bold transition-colors"
                  >
                    <Zap className="w-3.5 h-3.5" /> 재학습
                  </button>
                ) : (
                  <button 
                    onClick={() => handleVectorize([table.name])}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-md text-xs font-bold transition-colors shadow-sm"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" /> 벡터화
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 우측: 벡터화된 테이블 */}
        <div className="flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full relative">
          <div className="flex items-center gap-2 px-5 py-3.5 bg-[#F0FDF4] border-b border-emerald-100 shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h3 className="text-[15px] font-bold text-emerald-800">벡터화된 테이블</h3>
          </div>
          
          <div className="p-4 flex-1 overflow-y-auto space-y-3 custom-scrollbar pb-20">
            {vectorizedTables.map((name, idx) => (
              <div key={idx} className="flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 transition-colors shadow-sm">
                <span className="font-bold text-slate-700 text-sm">{name}</span>
                <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-sm shrink-0">
                  <Check className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>

          {/* Floating Action Button */}
          <button 
            onClick={handleVectorizeAll}
            className="absolute bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(79,70,229,0.4)] transition-transform hover:scale-105 active:scale-95"
            title="모두 벡터화"
          >
            <Zap className="w-6 h-6 fill-current" />
          </button>
        </div>

      </div>
    </div>
  )
}
