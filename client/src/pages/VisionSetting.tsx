import { useState, useEffect, useRef, useCallback } from "react"
import Webcam from "react-webcam"
import { Play, Settings, Save, Trash2, Camera, Info, CheckSquare, Search, RefreshCw, Layers } from "lucide-react"
import SmartFactoryWrapper from "@/components/SmartFactoryWrapper"
import * as tf from "@tensorflow/tfjs"
import * as mobilenet from "@tensorflow-models/mobilenet"
import * as knnClassifier from "@tensorflow-models/knn-classifier"

/* ─────────────────── 더미/상수 데이터 ─────────────────── */
const ALL_DEFECTS = [
  "가공불량(셋팅)", "가공불량(양면삭)", "가공불량(보링)", "가공불량(드릴)",
  "가공불량(좌삭)", "조립불량", "외관불량(형상)", "연마불량",
  "찍힘불량", "버핑불량", "가공불량(와이어커팅)", "고주파 시편",
  "고주파 크랙", "열처리 셋팅불량", "소재크랙", "스프레이켄칭크랙",
  "소재부족"
]

export default function VisionSetting() {
  const webcamRef = useRef<Webcam>(null)
  
  // 상태 관리
  const [selectedDefects, setSelectedDefects] = useState<string[]>([
    "가공불량(셋팅)", "가공불량(양면삭)", "가공불량(보링)", "가공불량(드릴)",
    "가공불량(좌삭)", "조립불량", "외관불량(형상)", "연마불량", "찍힘불량", "버핑불량",
    "가공불량(와이어커팅)", "고주파 시편", "고주파 크랙", "열처리 셋팅불량", "소재크랙", "스프레이켄칭크랙", "소재부족"
  ])
  const [intervalSec, setIntervalSec] = useState<number>(2)
  const [threshold, setThreshold] = useState<number>(90)
  
  const [dept, setDept] = useState("관리부")
  const [itemName, setItemName] = useState("D4H LOOSE LINK & PIN&BUSH GROUP WITH SEAL")
  
  // AI 모델
  const [classifier, setClassifier] = useState<knnClassifier.KNNClassifier | null>(null)
  const [net, setNet] = useState<mobilenet.MobileNet | null>(null)
  const [isModelLoading, setIsModelLoading] = useState(true)
  
  // 학습 데이터 카운트
  const [trainCounts, setTrainCounts] = useState<Record<string, number>>({ OK: 0 })

  // 초기 모델 로드
  useEffect(() => {
    async function loadModels() {
      try {
        await tf.ready()
        const loadedNet = await mobilenet.load()
        const loadedClassifier = knnClassifier.create()
        setNet(loadedNet)
        setClassifier(loadedClassifier)
        setIsModelLoading(false)
      } catch (e) {
        console.error("AI Model load error", e)
      }
    }
    loadModels()
  }, [])

  // 학습 함수
  const handleTrain = async (className: string) => {
    if (!net || !classifier || !webcamRef.current) return
    const video = webcamRef.current.video
    if (!video || video.readyState !== 4) return

    // 웹캠 캡처 후 텐서 변환
    const img = tf.browser.fromPixels(video)
    // MobileNet 특성 추출
    const activation = net.infer(img, true)
    // KNN 학습 추가
    classifier.addExample(activation, className)

    // 메모리 정리
    img.dispose()

    setTrainCounts((prev) => ({
      ...prev,
      [className]: (prev[className] || 0) + 1
    }))
  }

  // 전체 초기화
  const handleResetTraining = () => {
    if (classifier) {
      classifier.clearAllClasses()
    }
    setTrainCounts({ OK: 0 })
    alert("학습 데이터가 모두 초기화되었습니다.")
  }

  // 불량 유형 선택 추가/삭제
  const toggleDefect = (defect: string) => {
    setSelectedDefects(prev => 
      prev.includes(defect) ? prev.filter(d => d !== defect) : [...prev, defect]
    )
  }

  const handleSave = () => {
    alert("AI 모델 및 설정이 성공적으로 저장되었습니다.")
  }

  return (
    <SmartFactoryWrapper>
      <div className="flex flex-col gap-4 h-full">
        {/* 상단 타이틀 */}
        <div className="flex items-center gap-2 px-4 py-3 bg-indigo-50/50 rounded-lg border border-indigo-100 shrink-0">
          <Settings className="w-5 h-5 text-indigo-600" />
          <div>
            <h1 className="text-[16px] font-bold text-slate-800">AI 비전 검사 설정</h1>
            <p className="text-[11px] text-slate-500">딥러닝 모델 학습 및 불량 판정 기준 설정</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
          {/* 좌측: 웹캠 및 학습 데이터 관리 */}
          <div className="flex flex-col gap-4 flex-1 min-w-0">
            
            {/* 웹캠 영역 */}
            <div className="relative bg-slate-100 rounded-lg border border-slate-200 shadow-sm overflow-hidden flex items-center justify-center min-h-[300px] flex-1 shrink-0">
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: "user" }}
                className="w-full h-full object-contain bg-black/5"
              />
              
              {/* 가이드 오버레이 */}
              <div className="absolute top-4 left-4 bg-slate-800/80 backdrop-blur text-white p-3 rounded-md shadow-lg max-w-[200px]">
                <div className="flex items-center gap-1.5 mb-1.5 border-b border-slate-600 pb-1">
                  <Info className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold">가이드</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-200">
                  정상/불량 버튼을 10회 이상 클릭하여 학습시키세요.
                </p>
              </div>

              {isModelLoading && (
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                  <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-sm font-bold tracking-wide">AI 모델 로딩 중...</p>
                </div>
              )}
            </div>

            {/* 학습 데이터 관리 (버튼 그리드) */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col shrink-0" style={{ maxHeight: "350px" }}>
              <div className="flex items-center justify-between p-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-emerald-700">
                  <Camera className="w-4 h-4" />
                  <h3 className="text-[12px] font-bold">학습 데이터 관리 <span className="text-slate-500 font-normal ml-1">- 버튼 클릭시 AI 학습 검사 품목에 따라 학습하세요.</span></h3>
                </div>
                <button onClick={handleResetTraining} className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" /> 전체 초기화
                </button>
              </div>
              
              <div className="p-3 overflow-auto">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  
                  {/* OK 버튼 */}
                  <button 
                    onClick={() => handleTrain("OK")}
                    disabled={isModelLoading}
                    className="relative flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-all active:scale-95 group disabled:opacity-50"
                  >
                    <div className="flex items-center gap-2">
                      <CheckSquare className="w-5 h-5 text-emerald-600" />
                      <div className="text-left">
                        <div className="text-[12px] font-bold text-emerald-800">OK (정상)</div>
                        <div className="text-[10px] text-emerald-600 group-hover:underline">학습 데이터 추가</div>
                      </div>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[11px] font-bold text-emerald-700 shadow-sm">
                      {trainCounts["OK"] || 0}
                    </div>
                  </button>

                  {/* NG 버튼들 */}
                  {selectedDefects.map(defect => (
                    <button 
                      key={defect}
                      onClick={() => handleTrain(defect)}
                      disabled={isModelLoading}
                      className="relative flex items-center justify-between p-3 bg-rose-50 border border-rose-100 rounded-lg hover:bg-rose-100 transition-all active:scale-95 group disabled:opacity-50"
                    >
                      <div className="flex items-center gap-2">
                        <Camera className="w-5 h-5 text-rose-500" />
                        <div className="text-left max-w-[100px]">
                          <div className="text-[12px] font-bold text-rose-800 truncate" title={defect}>{defect}</div>
                          <div className="text-[10px] text-rose-500 group-hover:underline">불량 예시 추가</div>
                        </div>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[11px] font-bold text-rose-700 shadow-sm shrink-0">
                        {trainCounts[defect] || 0}
                      </div>
                    </button>
                  ))}
                  
                </div>
              </div>
            </div>

          </div>

          {/* 우측: 검사 기준 설정 */}
          <div className="w-full lg:w-[360px] bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col shrink-0 h-full overflow-hidden">
            <div className="flex items-center gap-2 p-4 border-b border-slate-100 text-indigo-800 shrink-0">
              <Settings className="w-4 h-4" />
              <h3 className="text-[13px] font-bold">검사 기준 설정</h3>
            </div>
            
            <div className="p-4 flex-1 overflow-auto space-y-5">
              {/* 불량 유형 추가 Select */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1.5">검사할 불량 유형 추가</label>
                <select 
                  onChange={(e) => {
                    if (e.target.value && !selectedDefects.includes(e.target.value)) {
                      toggleDefect(e.target.value)
                    }
                    e.target.value = ""
                  }}
                  className="w-full border border-slate-200 rounded p-2 text-[12px] text-slate-600 focus:outline-none focus:border-indigo-400 mb-3"
                >
                  <option value="">유형 선택...</option>
                  {ALL_DEFECTS.filter(d => !selectedDefects.includes(d)).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>

                <div className="flex flex-wrap gap-1.5 max-h-[150px] overflow-y-auto">
                  {selectedDefects.map(defect => (
                    <div key={defect} className="flex items-center gap-1 px-2 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded text-[10px]">
                      {defect}
                      <button onClick={() => toggleDefect(defect)} className="hover:bg-indigo-200 rounded p-0.5 ml-1 transition-colors">
                        <Trash2 className="w-3 h-3 text-indigo-400 hover:text-indigo-700" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 검사 주기 / 임계값 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1.5">검사 주기 (초)</label>
                  <input type="number" value={intervalSec} onChange={e => setIntervalSec(Number(e.target.value))} 
                    className="w-full border border-slate-200 rounded p-2 text-center text-[12px] font-bold focus:outline-none focus:border-indigo-400" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1.5">판정 임계값 (%)</label>
                  <input type="number" value={threshold} onChange={e => setThreshold(Number(e.target.value))} 
                    className="w-full border border-slate-200 rounded p-2 text-center text-[12px] font-bold focus:outline-none focus:border-indigo-400" />
                </div>
              </div>

              {/* 검사 부서 / 품목 */}
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1.5">검사 부서</label>
                  <div className="relative">
                    <input type="text" value={dept} onChange={e => setDept(e.target.value)} 
                      className="w-full border border-slate-200 rounded pl-2 pr-8 py-2 text-[12px] focus:outline-none focus:border-indigo-400" />
                    <Search className="absolute right-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1.5">검사 품목</label>
                  <div className="relative">
                    <input type="text" value={itemName} onChange={e => setItemName(e.target.value)} 
                      className="w-full border border-slate-200 rounded pl-2 pr-8 py-2 text-[12px] focus:outline-none focus:border-indigo-400" />
                    <Search className="absolute right-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" /> 설정 변경 후 반드시 [저장하기]를 클릭하세요.
              </p>
            </div>
            
            {/* 하단 저장 버튼 */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0">
              <button onClick={handleSave} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[13px] rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95">
                <Save className="w-4 h-4" /> AI 모델 및 설정 저장
              </button>
            </div>
          </div>
        </div>
      </div>
    </SmartFactoryWrapper>
  )
}
