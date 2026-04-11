import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ClipboardList, Search, Camera, Plus, Trash2, ZoomIn, Play, FileText, X } from 'lucide-react'
import Webcam from 'react-webcam'
import * as tf from '@tensorflow/tfjs'
import * as mobilenet from '@tensorflow-models/mobilenet'
import * as knnClassifier from '@tensorflow-models/knn-classifier'
import SmartFactoryWrapper from '@/components/SmartFactoryWrapper'
import { useToolbarStore } from '@/store/useToolbarStore'
import ItemSearchModal from '@/components/ItemSearchModal'
import EmpSearchModal from '@/components/EmpSearchModal'

/* ─────────────────── 타입 ─────────────────── */
type InspectionReqItem = {
  id: number
  item_cd: string
  item_name: string
  result: string
  conf: number
  imageSrc?: string
}

type InspectionReq = {
  id?: number
  req_date: string
  req_no: string
  defect_grp_cd: string
  manager_id: string
  manager_name: string
  dept_cd: string
  dept_name: string
  remark: string
  items?: InspectionReqItem[]
  work_date?: string
  work_id?: string
}

const EMPTY_REQ: InspectionReq = {
  req_date: new Date().toISOString().slice(0, 10),
  req_no: '', // 신규 시 자동 생성
  defect_grp_cd: '사내생산[A]',
  manager_id: 'SYSTEM',
  manager_name: '',
  dept_cd: 'C01',
  dept_name: '',
  remark: '',
  items: [],
}

const REQ_TYPES = ['사내생산[A]', '입고물량[H]', '출하검사[O]', '정기검사[R]']
const TABS = ['요청정보', '요청품목']

/* ─────────────────── 공통 UI ─────────────────── */
function FieldRow({ label, required, children, colSpan = 1 }: { label: string; required?: boolean; children: React.ReactNode; colSpan?: number }) {
  return (
    <div className={`flex items-center gap-2 min-w-0 ${colSpan === 2 ? 'col-span-2' : ''}`}>
      <label className="text-[12px] font-bold text-slate-700 whitespace-nowrap w-24 shrink-0 px-2 py-1.5 flex items-center">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="flex-1 flex gap-1 items-center">
        {children}
      </div>
    </div>
  )
}

function TInput({ value, onChange, disabled, className = '', placeholder = '', type = 'text' }: { value: string | number; onChange?: (v: string) => void; disabled?: boolean; className?: string; placeholder?: string; type?: string }) {
  return (
    <input
      type={type}
      value={value ?? ''}
      placeholder={placeholder}
      onChange={e => onChange?.(e.target.value)}
      disabled={disabled}
      className={`border border-slate-200 rounded px-2 py-1.5 text-[12px] text-slate-700 bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 disabled:bg-slate-50 disabled:text-slate-500 w-full ${className}`}
    />
  )
}

/* ─────────────────── 메인 컴포넌트 ─────────────────── */
export default function InspectionRequest() {
  const qc = useQueryClient()
  const [filter, setFilter] = useState({ req_date: new Date().toISOString().slice(0, 10), isAllDate: false, grp_cd: '전체' })
  const [search, setSearch] = useState({ req_date: filter.req_date, isAllDate: false, grp_cd: '전체' })
  const [selected, setSelected] = useState<InspectionReq | null>(null)
  const [form, setForm] = useState<InspectionReq>(EMPTY_REQ)
  const [activeTab, setActiveTab] = useState('요청정보')
  const [isNew, setIsNew] = useState(false)
  const [selectedRows, setSelectedRows] = useState<number[]>([])

  // AI & 품목 상태
  const [isItemModalOpen, setIsItemModalOpen] = useState(false)
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false)
  const [currentItem, setCurrentItem] = useState<{cd: string, name: string} | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  
  const webcamRef = useRef<Webcam>(null)
  const [classifier, setClassifier] = useState<knnClassifier.KNNClassifier | null>(null)
  const [net, setNet] = useState<mobilenet.MobileNet | null>(null)
  const [isModelReady, setIsModelReady] = useState(false)
  const [isInspecting, setIsInspecting] = useState(false)

  // 모델 로드
  useEffect(() => {
    async function loadModels() {
      try {
        await tf.ready()
        const loadedNet = await mobilenet.load()
        const loadedClassifier = knnClassifier.create()
        
        try {
          const res = await fetch('/api/vision/settings?_t=' + Date.now())
          if (res.ok) {
            const data = await res.json()
            if (data.model) {
              const datasetObj = data.model
              const tensorObj: Record<string, tf.Tensor2D> = {}
              Object.keys(datasetObj).forEach((key) => {
                tensorObj[key] = tf.tensor2d(datasetObj[key], [datasetObj[key].length / 1024, 1024])
              })
              loadedClassifier.setClassifierDataset(tensorObj)
            }
          }
        } catch (e) {
          console.error("서버 설정 로드 실패", e)
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

  /* 데이터 조회 */
  const { data: rows = [], isLoading } = useQuery<InspectionReq[]>({
    queryKey: ['/api/inspection-request', search],
    queryFn: async () => {
      const p = new URLSearchParams()
      if (!search.isAllDate) p.set('req_date', search.req_date)
      if (search.grp_cd !== '전체') p.set('grp_cd', search.grp_cd)
      const res = await fetch(`/api/inspection-request?${p}`)
      return res.json()
    },
  })

  /* 저장 */
  const saveMut = useMutation({
    mutationFn: async () => {
      const url = isNew ? '/api/inspection-request' : `/api/inspection-request/${form.id}`
      const method = isNew ? 'POST' : 'PUT'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? '오류')
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/api/inspection-request'] })
      setIsNew(false)
      alert('저장되었습니다.')
    },
    onError: (e: any) => alert(`저장 실패: ${e.message}`),
  })

  /* 삭제 */
  const delMut = useMutation({
    mutationFn: async () => {
      // 체크박스로 선택된 항목들이 있으면 다중 삭제
      if (selectedRows.length > 0) {
        const promises = selectedRows.map(id => fetch(`/api/inspection-request/${id}`, { method: 'DELETE' }))
        await Promise.all(promises)
        return
      }
      // 체크박스 선택이 없고 현재 상세 조회 중인 항목이 있으면 단건 삭제
      if (selected?.id) {
        await fetch(`/api/inspection-request/${selected.id}`, { method: 'DELETE' })
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/api/inspection-request'] })
      setForm(EMPTY_REQ)
      setSelected(null)
      setIsNew(false)
      setSelectedRows([])
      alert('삭제되었습니다.')
    },
  })

  const upd = (field: keyof InspectionReq, val: any) => setForm(f => ({ ...f, [field]: val }))

  const handleSearch = () => {
    setSearch({ ...filter })
    setSelectedRows([])
  }
  
  const handleNew = () => {
    // 자동 생성되는 신규 요청번호 (예: 3565451731 처럼 타임스탬프 일부 사용)
    const newReqNo = Math.floor(Date.now() / 1000).toString()
    setForm({ ...EMPTY_REQ, req_no: newReqNo, req_date: new Date().toISOString().slice(0, 10), work_date: new Date().toISOString().replace('T', ' ').slice(0, -1), work_id: 'AI_BOT' })
    setSelected(null)
    setIsNew(true)
    setActiveTab('요청정보')
  }

  const handleSelect = (row: InspectionReq) => {
    setForm({ ...row })
    setSelected(row)
    setIsNew(false)
    setActiveTab('요청정보')
  }

  const handleDelete = () => {
    if (selectedRows.length > 0) {
      if (confirm(`선택한 ${selectedRows.length}개의 요청을 삭제하시겠습니까?`)) {
        delMut.mutate()
      }
    } else if (selected) {
      if (confirm(`"${selected.req_no}" 요청을 삭제하시겠습니까?`)) {
        delMut.mutate()
      }
    } else {
      alert('삭제할 항목을 선택해주세요. (왼쪽 체크박스 선택 또는 행 클릭)')
    }
  }

  const handleItemSelect = (item: any) => {
    setCurrentItem({ cd: item.item_cd, name: item.item_name })
    setIsItemModalOpen(false)
  }

  // 1회 검사 실행
  const runInspection = async (itemCd: string, itemName: string) => {
    if (!isModelReady || !net || !classifier || !webcamRef.current) {
      alert('AI 모델 또는 카메라가 준비되지 않았습니다.')
      return
    }

    setIsInspecting(true)
    try {
      const video = webcamRef.current.video
      if (!video || video.readyState !== 4) throw new Error('카메라 로드 실패')

      const img = tf.browser.fromPixels(video)
      const activation = net.infer(img, true)
      
      let predClass = "OK"
      let conf = 100

      // 학습된 데이터가 있으면 예측 수행
      if (Object.keys(classifier.getClassifierDataset()).length > 0) {
        const result = await classifier.predictClass(activation)
        predClass = result.label
        conf = result.confidences[predClass] * 100
      }
      
      img.dispose()

      const imageSrc = webcamRef.current.getScreenshot() || undefined

      const newItem: InspectionReqItem = {
        id: Date.now(),
        item_cd: itemCd,
        item_name: itemName,
        result: predClass,
        conf,
        imageSrc
      }

      setForm(prev => ({
        ...prev,
        items: [...(prev.items || []), newItem]
      }))
      
    } catch (e) {
      console.error(e)
      alert('검사 중 오류가 발생했습니다.')
    } finally {
      setIsInspecting(false)
    }
  }

  // 툴바 액션 등록
  useEffect(() => {
    const { setActions, clearActions } = useToolbarStore.getState()
    setActions({
      onSearch: handleSearch,
      onNew: handleNew,
      onSave: () => saveMut.mutate(),
      onDelete: handleDelete,
    })
    return () => clearActions()
  }, [filter, isNew, selected, form, selectedRows])

  return (
    <SmartFactoryWrapper>
      <style>{`
        .grid-row:hover { background: #eff6ff; cursor: pointer; }
        .grid-row.active { background: #fff7ed; } /* 연한 주황색 하이라이트 (이미지 참고) */
        .tab-btn { border-bottom: 2px solid transparent; color: #64748b; }
        .tab-btn.active { border-bottom-color: #06b6d4; color: #0891b2; font-weight: bold; } /* Cyan 색상 테마 */
      `}</style>

      {/* ── 검색 필터 ── */}
      <div className="flex items-center gap-4 mb-3 px-4 py-2.5 bg-white border-b border-slate-200">
        <div className="flex items-center gap-1.5 text-[13px] font-bold text-slate-700 mr-4">
          <ClipboardList className="w-4 h-4 text-orange-500" /> 검사요청등록
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-slate-500">요청일자</span>
          <input 
            type="date" 
            value={filter.req_date} 
            onChange={e => setFilter(f => ({ ...f, req_date: e.target.value }))}
            disabled={filter.isAllDate}
            className="border border-slate-200 rounded px-2 py-1 text-[12px] focus:outline-none focus:border-blue-400 bg-slate-50 disabled:opacity-50" 
          />
          <label className="flex items-center gap-1 text-[12px] text-slate-600 cursor-pointer">
            <input 
              type="checkbox" 
              checked={filter.isAllDate} 
              onChange={e => setFilter(f => ({ ...f, isAllDate: e.target.checked }))}
              className="w-3.5 h-3.5 rounded border-slate-300 text-orange-500 focus:ring-orange-500" 
            />
            전체
          </label>
        </div>

        <div className="flex items-center gap-2 ml-4">
          <span className="text-[12px] text-slate-500">검사요청유형</span>
          <select 
            value={filter.grp_cd} 
            onChange={e => setFilter(f => ({ ...f, grp_cd: e.target.value }))}
            className="border border-slate-200 rounded px-2 py-1 text-[12px] focus:outline-none focus:border-blue-400 min-w-[120px]"
          >
            <option value="전체">전체</option>
            {REQ_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* ── 메인 레이아웃 ── */}
      <div className="flex flex-col lg:flex-row gap-0 h-full bg-white border-t border-slate-200" style={{ height: 'calc(100vh - 180px)' }}>
        
        {/* 좌측: 요청 목록 */}
        <div className="w-full lg:w-[380px] border-r border-slate-200 flex flex-col bg-white shrink-0">
          <div className="flex items-center justify-between px-4 py-2 bg-cyan-50/50 border-b border-cyan-100 shrink-0">
            <span className="text-[12px] font-bold text-slate-700 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-cyan-600" /> 요청 목록
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 bg-cyan-100 text-cyan-700 rounded-full">{rows.length}건</span>
          </div>
          
          <div className="overflow-auto flex-1 bg-white">
            <table className="w-full text-[12px] border-collapse">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
                <tr>
                  <th className="px-2 py-2 text-center font-medium text-slate-600 w-12">순번</th>
                  <th className="px-2 py-2 text-center font-medium text-slate-600 w-10">
                    <input 
                      type="checkbox" 
                      className="w-3.5 h-3.5 rounded border-slate-300 cursor-pointer" 
                      checked={rows.length > 0 && selectedRows.length === rows.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRows(rows.map(r => r.id!))
                        } else {
                          setSelectedRows([])
                        }
                      }}
                    />
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">검사요청유형</th>
                  <th className="px-3 py-2 text-right font-medium text-slate-600">요청번호</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={4} className="text-center py-10 text-slate-400">조회 중...</td></tr>
                ) : rows.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-10 text-slate-400">요청 목록이 없습니다.</td></tr>
                ) : rows.map((row, idx) => (
                  <tr 
                    key={row.id} 
                    onClick={() => handleSelect(row)}
                    className={`grid-row border-b border-slate-100 ${selected?.id === row.id ? 'active' : ''}`}
                  >
                    <td className="px-2 py-2.5 text-center text-slate-400">
                      {selected?.id === row.id ? <span className="text-orange-500 font-bold">▶ {idx + 1}</span> : idx + 1}
                    </td>
                    <td className="px-2 py-2.5 text-center">
                      <input 
                        type="checkbox" 
                        className="w-3.5 h-3.5 rounded border-slate-300 cursor-pointer" 
                        checked={selectedRows.includes(row.id!)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRows(prev => [...prev, row.id!])
                          } else {
                            setSelectedRows(prev => prev.filter(id => id !== row.id))
                          }
                        }}
                        onClick={e => e.stopPropagation()} 
                      />
                    </td>
                    <td className="px-3 py-2.5 font-medium text-slate-700">{row.defect_grp_cd}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-slate-600">{row.req_no}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 우측: 상세 정보 */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          {/* 탭 */}
          <div className="flex items-center gap-2 px-4 border-b border-cyan-400 bg-white shrink-0 pt-2">
            {TABS.map((t, i) => (
              <button 
                key={t} 
                onClick={() => setActiveTab(t)}
                className={`tab-btn px-4 py-2.5 text-[13px] transition-colors flex items-center gap-1.5 ${activeTab === t ? 'active' : ''}`}
              >
                {t}
                {i === 1 && <span className="text-[10px] bg-cyan-100 text-cyan-600 px-1.5 py-0.5 rounded-full font-bold leading-none">1</span>}
              </button>
            ))}
          </div>

          {/* 탭 콘텐츠 */}
          <div className="flex-1 p-6 overflow-auto bg-white">
            {activeTab === '요청정보' && (
              <div className="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <FieldRow label="요청일자">
                  <div className="relative flex-1">
                    <TInput value={form.req_date} onChange={v => upd('req_date', v)} type="date" />
                  </div>
                </FieldRow>
                <FieldRow label="요청번호" required>
                  <TInput value={form.req_no} disabled className="bg-slate-50 font-mono" placeholder="자동 생성" />
                </FieldRow>
                
                <FieldRow label="검사요청유형" required>
                  <select 
                    value={form.defect_grp_cd} 
                    onChange={e => upd('defect_grp_cd', e.target.value)}
                    className="border border-slate-200 rounded px-2 py-1.5 text-[12px] text-slate-700 focus:outline-none focus:border-blue-400 w-full bg-white"
                  >
                    {REQ_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </FieldRow>
                <FieldRow label="담당자">
                  <div className="flex flex-1 gap-1">
                    <div className="flex w-24">
                      <TInput value={form.manager_id} disabled className="rounded-r-none border-r-0 bg-slate-50" />
                      <button 
                        onClick={() => setIsEmpModalOpen(true)}
                        className="px-2 bg-white border border-slate-200 border-l-0 rounded-r hover:bg-slate-100 text-slate-500 transition-colors"
                      >
                        <Search className="w-3 h-3" />
                      </button>
                    </div>
                    <TInput value={form.manager_name} className="flex-1 bg-slate-50" disabled />
                  </div>
                </FieldRow>

                <FieldRow label="부서">
                  <div className="flex flex-1 gap-1">
                    <div className="flex w-24">
                      <TInput value={form.dept_cd} disabled className="rounded-r-none border-r-0 bg-slate-50" />
                      <button 
                        onClick={() => setIsEmpModalOpen(true)}
                        className="px-2 bg-white border border-slate-200 border-l-0 rounded-r hover:bg-slate-100 text-slate-500 transition-colors"
                      >
                        <Search className="w-3 h-3" />
                      </button>
                    </div>
                    <TInput value={form.dept_name} className="flex-1 bg-slate-50" disabled />
                  </div>
                </FieldRow>
                {/* Empty spot to align grid */}
                <div className="hidden md:block"></div>

                <FieldRow label="비고" colSpan={2}>
                  <textarea 
                    value={form.remark} 
                    onChange={e => upd('remark', e.target.value)}
                    className="w-full border border-slate-200 rounded p-2 text-[12px] text-slate-700 focus:outline-none focus:border-blue-400 min-h-[60px] resize-none"
                  />
                </FieldRow>

                <FieldRow label="작업일자">
                  <TInput value={form.work_date ?? ''} disabled className="bg-slate-50 text-slate-400" />
                </FieldRow>
                <FieldRow label="작업ID">
                  <TInput value={form.work_id ?? ''} disabled className="bg-slate-50 text-slate-400" />
                </FieldRow>
              </div>
            )}

            {activeTab === '요청품목' && (
              <div className="flex flex-col h-full gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1 max-w-sm flex gap-1">
                    <TInput 
                      value={currentItem ? currentItem.cd : ''} 
                      disabled 
                      placeholder="품목을 선택하세요" 
                      className="rounded-r-none border-r-0 bg-slate-50"
                    />
                    <button 
                      onClick={() => setIsItemModalOpen(true)}
                      className="px-3 bg-blue-50 border border-blue-200 border-l-0 rounded-r hover:bg-blue-100 text-blue-600 font-bold text-[12px] flex items-center gap-1 transition-colors"
                    >
                      <Search className="w-3 h-3" /> 품목 선택
                    </button>
                  </div>
                  {currentItem && (
                    <span className="text-[12px] font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded border border-slate-200">
                      {currentItem.name}
                    </span>
                  )}
                  <button 
                    onClick={() => {
                      if (!currentItem) {
                        alert('먼저 검사할 품목을 선택하세요.')
                        return
                      }
                      runInspection(currentItem.cd, currentItem.name)
                    }}
                    disabled={isInspecting || !isModelReady}
                    className="ml-auto flex items-center gap-1.5 px-4 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded font-bold text-[12px] shadow-sm disabled:opacity-50 active:scale-95 transition-all"
                  >
                    {isInspecting ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                    자동 검사 촬영
                  </button>
                </div>

                <div className="flex gap-4 min-h-[300px] flex-1">
                  {/* 카메라 화면 */}
                  <div className="w-[300px] bg-black rounded-lg overflow-hidden border border-slate-300 relative shrink-0 flex items-center justify-center">
                    <Webcam
                      ref={webcamRef}
                      audio={false}
                      screenshotFormat="image/jpeg"
                      videoConstraints={{ facingMode: "user" }}
                      className="w-full h-full object-cover"
                    />
                    {!isModelReady && (
                      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center text-white z-10">
                        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                        <p className="text-xs font-bold">AI 모델 준비 중...</p>
                      </div>
                    )}
                  </div>

                  {/* 검사 결과 목록 */}
                  <div className="flex-1 border border-slate-200 rounded-lg overflow-auto bg-slate-50 relative">
                    <table className="w-full text-[12px] border-collapse bg-white">
                      <thead className="sticky top-0 bg-slate-100 border-b border-slate-200 shadow-sm z-10">
                        <tr>
                          <th className="px-3 py-2 text-center font-bold text-slate-600 w-12">순번</th>
                          <th className="px-3 py-2 text-left font-bold text-slate-600">품목코드</th>
                          <th className="px-3 py-2 text-left font-bold text-slate-600">품목명</th>
                          <th className="px-3 py-2 text-center font-bold text-slate-600">판정</th>
                          <th className="px-3 py-2 text-center font-bold text-slate-600">확신도</th>
                          <th className="px-3 py-2 text-center font-bold text-slate-600 w-16">사진</th>
                          <th className="px-3 py-2 text-center font-bold text-slate-600 w-12"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {(!form.items || form.items.length === 0) ? (
                          <tr><td colSpan={7} className="text-center py-10 text-slate-400">등록된 검사 품목이 없습니다.</td></tr>
                        ) : form.items.map((item, idx) => (
                          <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="px-3 py-2 text-center text-slate-500">{idx + 1}</td>
                            <td className="px-3 py-2 font-mono text-slate-700">{item.item_cd}</td>
                            <td className="px-3 py-2 font-medium text-slate-800">{item.item_name}</td>
                            <td className="px-3 py-2 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.result === 'OK' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                {item.result}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-center text-slate-500 text-[11px]">{item.conf.toFixed(1)}%</td>
                            <td className="px-3 py-2 text-center">
                              {item.imageSrc && (
                                <div 
                                  className="w-8 h-8 mx-auto bg-black rounded cursor-pointer overflow-hidden border border-slate-300 group relative"
                                  onClick={() => setSelectedImage(item.imageSrc!)}
                                >
                                  <img src={item.imageSrc} alt="capture" className="w-full h-full object-cover opacity-80 group-hover:opacity-100" />
                                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/30 transition-opacity">
                                    <ZoomIn className="w-3 h-3 text-white" />
                                  </div>
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-2 text-center">
                              <button 
                                onClick={() => setForm(p => ({ ...p, items: p.items?.filter(x => x.id !== item.id) }))}
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 품목 검색 모달 */}
      <ItemSearchModal 
        open={isItemModalOpen} 
        onOpenChange={setIsItemModalOpen} 
        onSelect={handleItemSelect} 
      />

      {/* 사원 검색 모달 */}
      <EmpSearchModal 
        open={isEmpModalOpen} 
        onOpenChange={setIsEmpModalOpen} 
        onSelect={(emp) => {
          upd('manager_id', emp.emp_id)
          upd('manager_name', emp.emp_name)
          upd('dept_cd', emp.dept_name) // 이 시스템에서는 부서명을 코드로 쓰고 있음
          upd('dept_name', emp.dept_name)
        }} 
      />

      {/* 이미지 확대 모달 */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="relative max-w-3xl w-full bg-white rounded-xl shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute top-3 right-3 z-10">
              <button 
                onClick={() => setSelectedImage(null)}
                className="p-1.5 bg-black/50 hover:bg-red-500 text-white rounded-full backdrop-blur transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-1">
              <img src={selectedImage} alt="Enlarged capture" className="w-full h-auto object-contain max-h-[80vh] rounded-lg" />
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-xs font-bold text-slate-700">
              검사 캡처 화면
            </div>
          </div>
        </div>
      )}
    </SmartFactoryWrapper>
  )
}
