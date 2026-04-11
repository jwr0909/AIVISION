import { useState, useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import Webcam from "react-webcam"
import { Settings, Save, Trash2, Camera, Info, CheckSquare, Search, RefreshCw, PlusCircle, X, Link2, MonitorSmartphone, Server } from "lucide-react"
import SmartFactoryWrapper from "@/components/SmartFactoryWrapper"
import ItemSearchModal from "@/components/ItemSearchModal"
import DefectTypeSearchModal from "@/components/DefectTypeSearchModal"
import * as tf from "@tensorflow/tfjs"
import * as mobilenet from "@tensorflow-models/mobilenet"
import * as knnClassifier from "@tensorflow-models/knn-classifier"

/* ─────────────────── 타입 ─────────────────── */
type DefectType = {
  defect_cd: string
  defect_name: string
  use_yn: string
}

export default function VisionSetting() {
  const webcamRef = useRef<Webcam>(null)
  
  // DB에서 불량유형 목록 가져오기
  const { data: allDefects = [] } = useQuery<DefectType[]>({
    queryKey: ['/api/defect-type'],
    queryFn: async () => {
      const res = await fetch('/api/defect-type')
      const data = await res.json()
      // 사용중인 불량유형만 필터링
      return data.filter((d: any) => d.use_yn === 'Y')
    }
  })

  const getSavedConfig = () => {
    // 임시 초기값
    return { intervalSec: 2, threshold: 90, selectedDefects: [], itemName: 'D4H LOOSE LINK & PIN&BUSH GROUP WITH SEAL' }
  }

  const [config, setConfig] = useState(getSavedConfig())
  const [dept, setDept] = useState("관리부")
  const [isItemModalOpen, setIsItemModalOpen] = useState(false)
  const [isDefectModalOpen, setIsDefectModalOpen] = useState(false)
  
  // AI 모델
  const [classifier, setClassifier] = useState<knnClassifier.KNNClassifier | null>(null)
  const [net, setNet] = useState<mobilenet.MobileNet | null>(null)
  const [isModelLoading, setIsModelLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'software' | 'machine'>('software')
  
  // 학습 데이터 카운트
  const [trainCounts, setTrainCounts] = useState<Record<string, number>>({ OK: 0 })

  // 초기 모델 로드
  useEffect(() => {
    async function loadModels() {
      try {
        await tf.ready()
        const loadedNet = await mobilenet.load()
        const loadedClassifier = knnClassifier.create()
        
        // 서버에서 저장된 설정 및 모델 불러오기
        try {
          const res = await fetch('/api/vision/settings?_t=' + Date.now())
          if (res.ok) {
            const data = await res.json()
            if (data.config) {
              setConfig(data.config)
            }
            if (data.model) {
              const datasetObj = data.model
              const tensorObj: Record<string, tf.Tensor2D> = {}
              Object.keys(datasetObj).forEach((key) => {
                tensorObj[key] = tf.tensor2d(datasetObj[key], [datasetObj[key].length / 1024, 1024])
              })
              loadedClassifier.setClassifierDataset(tensorObj)
              
              // 학습 카운트 복원 (텐서 개수 기준)
              const counts: Record<string, number> = {}
              Object.keys(tensorObj).forEach((key) => {
                counts[key] = tensorObj[key].shape[0]
              })
              setTrainCounts(counts)
            }
          }
        } catch (err) {
          console.error("서버에서 설정 불러오기 실패", err)
        }

        setNet(loadedNet)
        setClassifier(loadedClassifier)
        setIsModelLoading(false)
      } catch (e) {
        console.error("AI Model load error", e)
      }
    }
    loadModels()
  }, [])

  // 처음 DB 로드 시, 로컬 스토리지에 설정된 불량유형이 없으면 DB 전체를 기본값으로 세팅
  useEffect(() => {
    if (allDefects.length > 0 && config.selectedDefects.length === 0) {
      const names = allDefects.map(d => d.defect_name)
      setConfig(prev => ({ ...prev, selectedDefects: names }))
    }
  }, [allDefects])

  // 학습 함수
  const handleTrain = async (className: string) => {
    if (!net || !classifier || !webcamRef.current) return
    const video = webcamRef.current.video
    if (!video || video.readyState !== 4) return

    const img = tf.browser.fromPixels(video)
    const activation = net.infer(img, true)
    classifier.addExample(activation, className)
    img.dispose()

    setTrainCounts((prev) => ({
      ...prev,
      [className]: (prev[className] || 0) + 1
    }))
  }

  // 전체 초기화
  const handleResetTraining = async () => {
    if (classifier) {
      classifier.clearAllClasses()
    }
    setTrainCounts({ OK: 0 })
    
    // 서버 초기화
    try {
      await fetch('/api/vision/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, model: null })
      })
    } catch (e) {}

    alert("학습 데이터가 모두 초기화되었습니다.")
  }

  // 특정 클래스 초기화
  const handleClearClass = (className: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (classifier) {
      try {
        classifier.clearClass(className)
      } catch (e) {
        console.error("클래스 초기화 실패", e)
      }
    }
    setTrainCounts((prev) => ({
      ...prev,
      [className]: 0
    }))
  }

  // 불량 유형 선택 추가/삭제
  const toggleDefect = (defectName: string) => {
    setConfig(prev => ({
      ...prev,
      selectedDefects: prev.selectedDefects.includes(defectName)
        ? prev.selectedDefects.filter(d => d !== defectName)
        : [...prev.selectedDefects, defectName]
    }))
  }

  // 설정 및 모델 저장
  const handleSave = async () => {
    let datasetObj: Record<string, number[]> | null = null
    
    // KNN 모델 저장 (Tensor -> Array 변환)
    if (classifier) {
      const dataset = classifier.getClassifierDataset()
      if (Object.keys(dataset).length > 0) {
        datasetObj = {}
        const promises = Object.keys(dataset).map(async (key) => {
          const data = await dataset[key].data()
          datasetObj![key] = Array.from(data)
        })
        await Promise.all(promises)
      }
    }
    
    // 서버에 저장
    try {
      const res = await fetch('/api/vision/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, model: datasetObj })
      })
      if (!res.ok) throw new Error('Failed to save')
      alert("AI 모델 및 설정이 서버에 안전하게 저장되었습니다.")
    } catch (e) {
      alert("저장 중 오류가 발생했습니다.")
      console.error(e)
    }
  }

  return (
    <SmartFactoryWrapper>
      <div className="flex flex-col gap-4 h-full">
        {/* 상단 타이틀 */}
        <div className="flex items-center gap-2 px-4 py-3 bg-indigo-50/50 rounded-lg border border-indigo-100 shrink-0">
          <Settings className="w-5 h-5 text-indigo-600" />
          <div>
            <h1 className="text-[16px] font-bold text-slate-800">AI 비전 검사 설정</h1>
            <p className="text-[11px] text-slate-500">딥러닝 모델 학습 및 하드웨어 비전 장비 연동 설정</p>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex items-center gap-2 border-b border-slate-200 px-4 mt-2">
          <button
            onClick={() => setActiveTab('software')}
            className={`flex items-center gap-2 px-4 py-2.5 text-[13px] font-bold border border-b-0 rounded-t-lg transition-colors relative top-[1px] ${
              activeTab === 'software'
                ? 'border-slate-200 text-indigo-600 bg-white z-10'
                : 'border-transparent text-slate-500 hover:text-slate-700 bg-transparent'
            }`}
          >
            <Camera className="w-4 h-4" />
            소프트웨어 AI 비전
          </button>
          <button
            onClick={() => setActiveTab('machine')}
            className={`flex items-center gap-2 px-4 py-2.5 text-[13px] font-bold border border-b-0 rounded-t-lg transition-colors relative top-[1px] ${
              activeTab === 'machine'
                ? 'border-slate-200 text-[#B222DB] bg-white z-10'
                : 'border-transparent text-slate-500 hover:text-slate-700 bg-transparent'
            }`}
          >
            <Server className="w-4 h-4" />
            머신비전 (뷰웍스 연동)
          </button>
        </div>

        {activeTab === 'software' && (
        <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0 mt-1">
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
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center text-white z-10">
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
                  <div className="relative group">
                    <button 
                      onClick={() => handleTrain("OK")}
                      disabled={isModelLoading}
                      className="w-full relative flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-all active:scale-95 disabled:opacity-50"
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
                    {(trainCounts["OK"] || 0) > 0 && (
                      <button 
                        onClick={(e) => handleClearClass("OK", e)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        title="데이터 삭제"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* NG 버튼들 (설정에서 선택된 유형만 표시) */}
                  {config.selectedDefects.map(defect => (
                    <div key={defect} className="relative group">
                      <button 
                        onClick={() => handleTrain(defect)}
                        disabled={isModelLoading}
                        className="w-full relative flex items-center justify-between p-3 bg-rose-50 border border-rose-100 rounded-lg hover:bg-rose-100 transition-all active:scale-95 disabled:opacity-50"
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
                      {(trainCounts[defect] || 0) > 0 && (
                        <button 
                          onClick={(e) => handleClearClass(defect, e)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                          title="데이터 삭제"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
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
              {/* 불량 유형 추가 (모달 연동) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-slate-700">검사할 불량 유형 (DB연동)</label>
                  <button 
                    onClick={() => setIsDefectModalOpen(true)}
                    className="flex items-center gap-1 px-2 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded text-[10px] font-bold hover:bg-indigo-100 active:scale-95 transition-all"
                  >
                    <PlusCircle className="w-3 h-3" /> 유형 추가
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded min-h-[50px] max-h-[150px] overflow-y-auto">
                  {config.selectedDefects.length === 0 ? (
                    <span className="text-[11px] text-slate-400 my-auto">선택된 불량 유형이 없습니다.</span>
                  ) : (
                    config.selectedDefects.map((defect: string) => (
                      <div key={defect} className="flex items-center gap-1 px-2 py-1 bg-white border border-indigo-200 text-indigo-700 shadow-sm rounded text-[10px] font-medium">
                        {defect}
                        <button onClick={() => toggleDefect(defect)} className="hover:bg-rose-50 rounded p-0.5 ml-1 transition-colors">
                          <Trash2 className="w-3 h-3 text-slate-400 hover:text-rose-500" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 검사 주기 / 임계값 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1.5">검사 주기 (초)</label>
                  <input type="number" value={config.intervalSec} onChange={e => setConfig(p => ({ ...p, intervalSec: Number(e.target.value) }))} 
                    className="w-full border border-slate-200 rounded p-2 text-center text-[12px] font-bold focus:outline-none focus:border-indigo-400" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1.5">판정 임계값 (%)</label>
                  <input type="number" value={config.threshold} onChange={e => setConfig(p => ({ ...p, threshold: Number(e.target.value) }))} 
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
                    <input 
                      type="text" 
                      value={config.itemName} 
                      readOnly
                      onClick={() => setIsItemModalOpen(true)}
                      placeholder="품목을 선택하세요"
                      className="w-full border border-slate-200 rounded pl-2 pr-8 py-2 text-[12px] bg-slate-50 cursor-pointer focus:outline-none focus:border-indigo-400" 
                    />
                    <Search className="absolute right-2.5 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" /> 설정 변경 후 반드시 [저장하기]를 클릭하세요.
              </p>
            </div>
            
            {/* 하단 저장 버튼 */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0">
              <button 
                onClick={handleSave} 
                disabled={isModelLoading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[13px] rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                <Save className="w-4 h-4" /> AI 모델 및 설정 저장
              </button>
            </div>
          </div>
        </div>
        )}

        {activeTab === 'machine' && (
          <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 mt-1">
            {/* 장비 통신 설정 */}
            <div className="flex-1 flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-2 text-indigo-800">
                <MonitorSmartphone className="w-5 h-5" />
                <h3 className="text-[15px] font-bold">장비 통신 설정 (TCP/IP & API)</h3>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-6">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-[12px] font-bold text-slate-700 block mb-2">장비 IP 주소</label>
                    <input type="text" defaultValue="192.168.1.100" className="w-full border border-slate-200 rounded px-3 py-2 text-[13px] focus:outline-none focus:border-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <label className="text-[12px] font-bold text-slate-700 block mb-2">포트 (Port)</label>
                    <input type="text" defaultValue="5000" className="w-full border border-slate-200 rounded px-3 py-2 text-[13px] focus:outline-none focus:border-indigo-400 bg-slate-50" readOnly />
                  </div>
                </div>
                <div>
                  <label className="text-[12px] font-bold text-slate-700 block mb-2">통신 프로토콜</label>
                  <select className="w-full border border-slate-200 rounded px-3 py-2 text-[13px] focus:outline-none focus:border-indigo-400 appearance-none bg-white">
                    <option>TCP/IP Socket</option>
                    <option>HTTP REST API</option>
                  </select>
                </div>
                <div>
                  <label className="text-[12px] font-bold text-slate-700 block mb-2">장비 식별자 (Equipment ID)</label>
                  <input type="text" defaultValue="VSN-MATRIX-001" className="w-full border border-slate-200 rounded px-3 py-2 text-[13px] focus:outline-none focus:border-indigo-400" />
                </div>
                <button className="w-full py-3 bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-bold text-[13px] rounded-lg transition-colors flex items-center justify-center gap-2">
                  <Link2 className="w-4 h-4" /> 연결 테스트 (Ping)
                </button>
              </div>
            </div>

            {/* 검사 데이터 매핑 설정 */}
            <div className="w-full lg:w-[480px] flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-2 text-slate-700">
                <Settings className="w-5 h-5 text-slate-500" />
                <h3 className="text-[15px] font-bold">검사 데이터 매핑 설정</h3>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 flex-1 flex flex-col">
                <div className="space-y-6 mb-8">
                  <div>
                    <label className="text-[12px] font-bold text-slate-700 block mb-2">검사 부서</label>
                    <div className="relative flex items-center">
                      <input type="text" placeholder="부서 선택" className="w-full border border-slate-200 rounded-l pl-3 pr-8 py-2 text-[13px] focus:outline-none focus:border-indigo-400" />
                      <button className="px-3 py-2 border border-l-0 border-slate-200 rounded-r bg-slate-50 hover:bg-slate-100 text-slate-500">
                        <Search className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-[12px] font-bold text-slate-700 block mb-2">대상 품목</label>
                    <div className="relative flex items-center">
                      <input type="text" placeholder="품목 선택" className="w-full border border-slate-200 rounded-l pl-3 pr-8 py-2 text-[13px] focus:outline-none focus:border-indigo-400" />
                      <button className="px-3 py-2 border border-l-0 border-slate-200 rounded-r bg-slate-50 hover:bg-slate-100 text-slate-500">
                        <Search className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50/50 border border-blue-100 rounded-md p-4 mb-auto">
                  <div className="flex items-start gap-2 text-blue-600 mb-2">
                    <Info className="w-4 h-4 mt-0.5 shrink-0" />
                    <span className="text-[12px] font-bold">데이터 수신 안내</span>
                  </div>
                  <p className="text-[11px] text-blue-600/80 pl-6 leading-relaxed">
                    비전 매트릭스 장비에서 불량 판정 시 ERP 내부 API 엔드포인트 <code className="bg-blue-100 px-1 py-0.5 rounded font-mono text-[10px] text-blue-800">/api/vision/hardware</code> 로 판정 결과를 전송하도록 설정하십시오.<br/><br/>
                    필수 수신 데이터: 장비 ID, 판정 결과(OK/NG), 불량 코드, 이미지 저장 경로
                  </p>
                </div>

                <button className="w-full mt-4 py-3.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-[13px] rounded shadow-sm transition-all flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" /> 하드웨어 연동 설정 저장 (VIS7 SDK)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 품목 검색 모달 */}
      <ItemSearchModal 
        open={isItemModalOpen} 
        onOpenChange={setIsItemModalOpen} 
        onSelect={(item) => setConfig(p => ({ ...p, itemName: item.item_name }))} 
      />

      {/* 불량 유형 검색 다중선택 모달 */}
      <DefectTypeSearchModal
        open={isDefectModalOpen}
        onOpenChange={setIsDefectModalOpen}
        initialSelected={config.selectedDefects}
        onSelect={(selected) => setConfig(p => ({ ...p, selectedDefects: selected }))}
      />
    </SmartFactoryWrapper>
  )
}

