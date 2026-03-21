import { useState, useEffect, useRef } from "react"
import Webcam from "react-webcam"
import { Play, Square, Settings, RefreshCw, Box, AlertTriangle, CheckCircle, UploadCloud, Activity } from "lucide-react"
import SmartFactoryWrapper from "@/components/SmartFactoryWrapper"
import * as tf from "@tensorflow/tfjs"
import * as mobilenet from "@tensorflow-models/mobilenet"
import * as knnClassifier from "@tensorflow-models/knn-classifier"

export default function VisionInspectionPage() {
  const [isLive, setIsLive] = useState(false)
  const webcamRef = useRef<Webcam>(null)

  // 설정값
  const [config, setConfig] = useState({
    intervalSec: 2,
    threshold: 90,
    selectedDefects: [] as string[]
  })

  // AI 모델
  const [classifier, setClassifier] = useState<knnClassifier.KNNClassifier | null>(null)
  const [net, setNet] = useState<mobilenet.MobileNet | null>(null)
  const [isModelReady, setIsModelReady] = useState(false)

  // 검사 현황 상태
  const [okCount, setOkCount] = useState(0)
  const [ngCount, setNgCount] = useState(0)
  const [efficiency, setEfficiency] = useState(100)
  const [logs, setLogs] = useState<{ id: number; text: string; type: "ok" | "ng" }[]>([])
  const [defectCounts, setDefectCounts] = useState<Record<string, number>>({})

  // 설정 및 모델 로드
  useEffect(() => {
    // 1. 설정 로드
    const savedConfig = localStorage.getItem('vision_config')
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig))
    }

    // 2. 모델 로드
    async function loadModels() {
      try {
        await tf.ready()
        const loadedNet = await mobilenet.load()
        const loadedClassifier = knnClassifier.create()
        
        const savedModelStr = localStorage.getItem('vision_model_knn')
        if (savedModelStr) {
          const datasetObj = JSON.parse(savedModelStr)
          const tensorObj: Record<string, tf.Tensor2D> = {}
          Object.keys(datasetObj).forEach((key) => {
            tensorObj[key] = tf.tensor2d(datasetObj[key], [datasetObj[key].length / 1024, 1024])
          })
          loadedClassifier.setClassifierDataset(tensorObj)
        }
        
        setNet(loadedNet)
        setClassifier(loadedClassifier)
        setIsModelReady(true)
      } catch (e) {
        console.error("AI Model load error", e)
      }
    }
    loadModels()
  }, [])

  // 초기화 함수
  const handleReset = () => {
    setOkCount(0)
    setNgCount(0)
    setEfficiency(100)
    setLogs([])
    setDefectCounts({})
    setIsLive(false)
  }

  const toggleInspection = () => {
    if (!isLive && (!classifier || Object.keys(classifier.getClassifierDataset()).length === 0)) {
      alert("학습된 AI 모델이 없습니다. 먼저 '비전 설정' 화면에서 데이터를 학습시켜주세요.")
      return
    }
    setIsLive((prev) => !prev)
  }

  // 실시간 AI 검사 로직
  useEffect(() => {
    if (!isLive || !net || !classifier) return
    
    const interval = setInterval(async () => {
      const video = webcamRef.current?.video
      if (!video || video.readyState !== 4) return

      try {
        const img = tf.browser.fromPixels(video)
        const activation = net.infer(img, true)
        const result = await classifier.predictClass(activation)
        img.dispose()

        // result.label: 예측된 클래스 이름 (예: "OK", "가공불량" 등)
        // result.confidences: 각 클래스별 확신도 (예: { OK: 0.9, 가공불량: 0.1 })
        
        const predClass = result.label
        const conf = result.confidences[predClass] * 100 // % 변환

        if (predClass === "OK" || conf < config.threshold) {
          // 정상 판정 (또는 임계값 미달 시 기본 정상 처리)
          setOkCount((p) => p + 1)
          setLogs((p) => [{ id: Date.now(), text: `[OK] 정상 품목 판정 (${conf.toFixed(1)}%)`, type: "ok" }, ...p].slice(0, 50))
        } else {
          // 불량 판정
          setNgCount((p) => p + 1)
          setDefectCounts((p) => ({ ...p, [predClass]: (p[predClass] || 0) + 1 }))
          setLogs((p) => [{ id: Date.now(), text: `[NG] ${predClass} 감지 (${conf.toFixed(1)}%)`, type: "ng" }, ...p].slice(0, 50))
        }

      } catch (e) {
        console.error("Prediction error", e)
      }

    }, config.intervalSec * 1000)

    return () => clearInterval(interval)
  }, [isLive, net, classifier, config])

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
        {/* 상단 헤더 영역 */}
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
                  className="w-full h-full object-contain bg-black/5"
                />
              ) : (
                <div className="text-slate-400 flex flex-col items-center">
                  {!isModelReady ? (
                    <>
                      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                      <p className="text-sm">AI 모델 준비 중...</p>
                    </>
                  ) : (
                    <>
                      <Play className="w-12 h-12 mb-2 opacity-50" />
                      <p className="text-sm">우측 하단의 'AI 검사 시작' 버튼을 눌러주세요</p>
                    </>
                  )}
                </div>
              )}

              {/* 좌측 상단 설정 정보 오버레이 */}
              <div className="absolute top-4 left-4 dark-glass text-slate-200 p-3 rounded-md w-64 shadow-lg">
                <div className="flex items-center gap-1.5 mb-2 text-white border-b border-slate-600 pb-1">
                  <Settings className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold">적용된 설정 정보</span>
                </div>
                <ul className="text-[11px] space-y-1.5 list-disc pl-4 marker:text-slate-500">
                  <li>검사 주기: {config.intervalSec}초</li>
                  <li>판정 임계값: {config.threshold}%</li>
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

            {/* 불량 유형별 상세 (설정에서 선택한 항목만 표시) */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-4 text-indigo-800">
                <span className="w-4 h-4 border-2 border-indigo-300 border-dashed rounded-sm" />
                <h3 className="text-[13px] font-bold">불량 유형별 상세 (설정된 항목)</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-2">
                {config.selectedDefects.length === 0 ? (
                  <div className="col-span-full text-center text-slate-400 text-xs py-4">비전 설정 메뉴에서 검사할 불량 유형을 추가해주세요.</div>
                ) : (
                  config.selectedDefects.map((defect) => {
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
                  })
                )}
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
                disabled={!isModelReady}
                className={`w-full py-3.5 rounded-lg text-white font-bold text-[13px] shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
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

