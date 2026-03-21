import { useState, useEffect, useRef, useCallback } from "react"
import Webcam from "react-webcam"
import { Play, Square, Settings, RefreshCw, Box, AlertTriangle, CheckCircle, UploadCloud, Activity } from "lucide-react"
import SmartFactoryWrapper from "@/components/SmartFactoryWrapper"

/* ─────────────────── 더미/상수 데이터 ─────────────────── */
const DEFECT_TYPES = [
  "가공불량(셋팅)", "가공불량(양면삭)", "가공불량(보링)", "가공불량(드릴)",
  "가공불량(좌삭)", "조립불량", "외관불량(형상)", "연마불량",
  "찍힘불량", "버핑불량", "가공불량(와이어커팅)", "고주파 시편",
  "고주파 크랙", "열처리 셋팅불량", "소재크랙", "스프레이켄칭크랙",
  "소재부족"
]

export default function VisionInspectionPage() {
  const [isLive, setIsLive] = useState(false)
  const webcamRef = useRef<Webcam>(null)

  // 검사 현황 상태
  const [okCount, setOkCount] = useState(0)
  const [ngCount, setNgCount] = useState(0)
  const [efficiency, setEfficiency] = useState(100)
  const [logs, setLogs] = useState<{ id: number; text: string; type: "ok" | "ng" }[]>([])
  
  // 불량 유형별 건수
  const [defectCounts, setDefectCounts] = useState<Record<string, number>>({})

  // 초기화 함수
  const handleReset = () => {
    setOkCount(0)
    setNgCount(0)
    setEfficiency(100)
    setLogs([])
    setDefectCounts({})
    setIsLive(false)
  }

  // AI 검사 시작/중지 토글
  const toggleInspection = () => {
    setIsLive((prev) => !prev)
  }

  // 모의 검사 로직 (isLive가 true일 때 주기적으로 실행)
  useEffect(() => {
    if (!isLive) return
    const interval = setInterval(() => {
      const isDefect = Math.random() < 0.2 // 20% 확률로 불량
      if (isDefect) {
        setNgCount((p) => p + 1)
        const defect = DEFECT_TYPES[Math.floor(Math.random() * DEFECT_TYPES.length)]
        setDefectCounts((p) => ({ ...p, [defect]: (p[defect] || 0) + 1 }))
        setLogs((p) => [{ id: Date.now(), text: `[NG] ${defect} 감지됨`, type: "ng" }, ...p].slice(0, 50))
      } else {
        setOkCount((p) => p + 1)
        setLogs((p) => [{ id: Date.now(), text: `[OK] 정상 품목 판정`, type: "ok" }, ...p].slice(0, 50))
      }
    }, 2000) // 2초 주기
    return () => clearInterval(interval)
  }, [isLive])

  // 가동률 계산
  useEffect(() => {
    const total = okCount + ngCount
    if (total > 0) {
      setEfficiency(Math.round((okCount / total) * 100))
    } else {
      setEfficiency(100)
    }
  }, [okCount, ngCount])

  return (
    <SmartFactoryWrapper>
      <style>{`
        .glass-panel {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(200, 200, 200, 0.3);
        }
        .dark-glass {
          background: rgba(30, 41, 59, 0.85);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .anim-fade-in { animation: fadeIn 0.3s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="flex flex-col gap-4 h-full" style={{ minHeight: "calc(100vh - 100px)" }}>
        {/* 상단 헤더 영역 (이미지 참조) */}
        <div className="flex items-center justify-between px-4 py-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            <h1 className="text-[16px] font-bold text-slate-800">MES AI 비전 모니터링</h1>
            <span className="text-[11px] text-slate-500 ml-2">실시간 결함 탐지 및 자동 품질 판정 현황</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded text-[11px] text-slate-600 shadow-sm">
              <Box className="w-3.5 h-3.5" />
              <span>D4H LOOSE LINK & PIN&BUSH GROUP WITH SEAL</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded text-[11px] text-slate-600 shadow-sm">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>대기 중: 0건</span>
            </div>
          </div>
        </div>

        {/* 메인 레이아웃 */}
        <div className="flex flex-col lg:flex-row gap-4 flex-1">
          {/* 좌측: 웹캠 + 불량 유형별 상세 */}
          <div className="flex flex-col gap-4 flex-1">
            {/* 웹캠 영역 */}
            <div className="relative bg-slate-100 rounded-lg border border-slate-200 shadow-sm overflow-hidden flex items-center justify-center min-h-[280px] max-h-[380px]">
              {isLive ? (
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ facingMode: "user" }}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-slate-400 flex flex-col items-center">
                  <Play className="w-12 h-12 mb-2 opacity-50" />
                  <p className="text-sm">우측 하단의 'AI 검사 시작' 버튼을 눌러주세요</p>
                </div>
              )}

              {/* 좌측 상단 설정 정보 오버레이 */}
              <div className="absolute top-4 left-4 dark-glass text-slate-200 p-3 rounded-md w-64 shadow-lg">
                <div className="flex items-center gap-1.5 mb-2 text-white border-b border-slate-600 pb-1">
                  <Settings className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold">설정 정보</span>
                </div>
                <ul className="text-[11px] space-y-1.5 list-disc pl-4 marker:text-slate-500">
                  <li>검사 주기: 2초</li>
                  <li>판정 기준: 90%</li>
                  <li>자동 등록: 꺼짐 (수동 일괄 저장)</li>
                </ul>
              </div>

              {/* 라이브 표시 배지 */}
              {isLive && (
                <div className="absolute top-4 right-4 bg-red-500/90 text-white px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1.5 shadow-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  LIVE
                </div>
              )}
            </div>

            {/* 불량 유형별 상세 */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-4 text-indigo-800">
                <span className="w-4 h-4 border-2 border-indigo-300 border-dashed rounded-sm" />
                <h3 className="text-[13px] font-bold">불량 유형별 상세</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-2">
                {DEFECT_TYPES.map((defect) => {
                  const count = defectCounts[defect] || 0
                  return (
                    <div key={defect} className={`flex items-center justify-between px-3 py-2 border rounded-md transition-colors ${count > 0 ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-100'}`}>
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className={`w-3.5 h-3.5 ${count > 0 ? 'text-red-500' : 'text-slate-400'}`} />
                        <span className={`text-[11px] font-medium truncate w-24 ${count > 0 ? 'text-red-700' : 'text-slate-600'}`} title={defect}>
                          {defect}
                        </span>
                      </div>
                      <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${count > 0 ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-500'}`}>
                        {count}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* 우측: 검사 현황판 */}
          <div className="w-full lg:w-[320px] flex flex-col gap-4">
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-4 text-fuchsia-800">
                <span className="w-4 h-4 border-2 border-fuchsia-300 border-dashed rounded-sm" />
                <h3 className="text-[13px] font-bold">검사 현황판</h3>
              </div>

              {/* OK / NG 카드 */}
              <div className="flex gap-2 mb-3">
                <div className="flex-1 bg-emerald-50 rounded-lg p-3 flex flex-col items-center justify-center border border-emerald-100 relative overflow-hidden">
                  <div className="text-[10px] text-emerald-600 font-bold self-start mb-1 z-10">OK (정상)</div>
                  <div className="text-3xl font-black text-emerald-600 z-10">{okCount}</div>
                  <CheckCircle className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 text-emerald-500 opacity-20" />
                </div>
                <div className="flex-1 bg-rose-50 rounded-lg p-3 flex flex-col items-center justify-center border border-rose-100 relative overflow-hidden">
                  <div className="text-[10px] text-rose-600 font-bold self-start mb-1 z-10">NG (불량)</div>
                  <div className="text-3xl font-black text-rose-600 z-10">{ngCount}</div>
                  <AlertTriangle className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 text-rose-500 opacity-20" />
                </div>
              </div>

              {/* 종합 가동률 */}
              <div className="border border-slate-200 rounded-lg p-3 flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
                    <Activity className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-700">종합 가동률</div>
                    <div className="text-[9px] text-slate-400">Total Efficiency</div>
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-800">{efficiency}%</div>
              </div>

              {/* 로그 리스트 */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-slate-600 font-bold">실시간 판정 로그</span>
                <div className="flex gap-1">
                  <button className="p-1 border border-slate-200 rounded text-slate-500 hover:bg-slate-50">
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                  <button className="flex items-center gap-1 px-2 py-1 border border-indigo-200 text-indigo-600 bg-indigo-50 rounded text-[10px] font-medium hover:bg-indigo-100">
                    <UploadCloud className="w-3 h-3" /> 검사요청등록
                  </button>
                </div>
              </div>
              
              <div className="flex-1 border border-slate-200 rounded-lg bg-slate-50 p-2 overflow-auto max-h-[250px]">
                {logs.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-[11px] text-slate-400">
                    대기 중...
                  </div>
                ) : (
                  <div className="space-y-1">
                    {logs.map((log) => (
                      <div key={log.id} className={`anim-fade-in text-[10px] px-2 py-1.5 rounded border ${log.type === 'ok' ? 'bg-white border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700 font-bold'}`}>
                        {log.text}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 검사 제어 버튼 */}
            <div className="flex flex-col gap-2">
              <button
                onClick={toggleInspection}
                className={`w-full py-3.5 rounded-lg text-white font-bold text-[13px] shadow-md transition-all flex items-center justify-center gap-2 ${
                  isLive 
                    ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/30' 
                    : 'bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 shadow-indigo-500/30'
                }`}
              >
                {isLive ? <Square className="w-4 h-4 fill-current" /> : <span className="w-4 h-4 border-2 border-white border-dashed rounded-sm" />}
                {isLive ? 'AI 검사 중지' : 'AI 검사 시작'}
              </button>
              <button
                onClick={handleReset}
                disabled={isLive}
                className="w-full py-2.5 rounded-lg bg-white border border-slate-200 text-slate-600 font-medium text-[12px] hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                초기화
              </button>
            </div>
          </div>
        </div>
      </div>
    </SmartFactoryWrapper>
  )
}
