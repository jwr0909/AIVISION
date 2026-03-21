import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Plus, Save, Trash2, Download, RefreshCw, ChevronDown, Package } from 'lucide-react'
import SmartFactoryWrapper from '@/components/SmartFactoryWrapper'
import { useToolbarStore } from '@/store/useToolbarStore'

/* ─────────────────── 타입 ─────────────────── */
type Item = {
  item_cd: string; item_name: string; std: string; use_yn: string; bom_yn: string
  item_cls: string; acct_cd: string; acct_name: string; drawing_no: string
  item_name_eng: string; item_grp: string; base_unit: string; conv_unit: string
  base_ratio: number; conv_ratio: number; bom_unit: string; bom_base_ratio: number
  bom_ratio: number; wh_cd: string; wh_name: string; prc_cd: string; prc_name: string
  eqp_cd: string; eqp_name: string; prod_lt: number; div_cls: string; prod_plan_yn: string
  in_out_cls: string; supply_cls: string; out_vendor_cd: string; vendor_name: string
  opt_stock: number; safe_stock: number; init_qty: number; init_amt: number
  std_cost: number; work_date: string; work_id: string
}

const EMPTY_ITEM: Item = {
  item_cd:'', item_name:'', std:'', use_yn:'Y', bom_yn:'N', item_cls:'제품',
  acct_cd:'1310', acct_name:'제품', drawing_no:'', item_name_eng:'', item_grp:'',
  base_unit:'EA', conv_unit:'', base_ratio:1, conv_ratio:1, bom_unit:'', bom_base_ratio:1,
  bom_ratio:1, wh_cd:'', wh_name:'', prc_cd:'', prc_name:'', eqp_cd:'', eqp_name:'',
  prod_lt:0, div_cls:'', prod_plan_yn:'N', in_out_cls:'사내', supply_cls:'', out_vendor_cd:'',
  vendor_name:'', opt_stock:0, safe_stock:0, init_qty:0, init_amt:0, std_cost:0,
  work_date:'', work_id:'',
}

const ITEM_CLS_OPTIONS = ['전체','제품','반제품','원재료','부재료','상품','소모품','자산','기타']
const TABS = ['기본정보','단위정보','재고정보','생산정보','기타정보']

/* ─────────────────── 공통 UI ─────────────────── */
function FieldRow({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1 min-w-0">
      <label className="text-[11px] text-slate-600 whitespace-nowrap w-20 shrink-0 text-right pr-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}
function TInput({ value, onChange, disabled, className = '' }: { value: string|number; onChange?: (v: string) => void; disabled?: boolean; className?: string }) {
  return (
    <input
      type="text"
      value={value ?? ''}
      onChange={e => onChange?.(e.target.value)}
      disabled={disabled}
      className={`border border-slate-200 rounded px-1.5 py-0.5 text-[11px] text-slate-700 bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 disabled:bg-slate-50 disabled:text-slate-400 w-full ${className}`}
    />
  )
}
function TSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="border border-slate-200 rounded px-1.5 py-0.5 text-[11px] text-slate-700 bg-white focus:outline-none focus:border-blue-400 w-full"
    >
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}
function Checkbox({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
      className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 cursor-pointer" />
  )
}

/* ─────────────────── 메인 컴포넌트 ─────────────────── */
export default function ItemMaster() {
  const qc = useQueryClient()
  const [filter, setFilter] = useState({ item_cls: '전체', keyword: '', std: '', use_yn: false })
  const [selected, setSelected] = useState<Item | null>(null)
  const [form, setForm] = useState<Item>(EMPTY_ITEM)
  const [activeTab, setActiveTab] = useState('기본정보')
  const [isNew, setIsNew] = useState(false)
  const [search, setSearch] = useState({ item_cls: '전체', keyword: '', std: '' })

  /* 목록 조회 */
  const { data: items = [], isLoading } = useQuery<Item[]>({
    queryKey: ['/api/item-master', search],
    queryFn: async () => {
      const p = new URLSearchParams()
      if (search.item_cls !== '전체') p.set('item_cls', search.item_cls)
      if (search.keyword) p.set('keyword', search.keyword)
      if (search.std) p.set('std', search.std)
      const res = await fetch(`/api/item-master?${p}`)
      return res.json()
    },
  })

  /* 저장 뮤테이션 */
  const saveMut = useMutation({
    mutationFn: async () => {
      const url = isNew ? '/api/item-master' : `/api/item-master/${form.item_cd}`
      const method = isNew ? 'POST' : 'PUT'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? '오류')
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/api/item-master'] })
      setIsNew(false)
      alert('저장되었습니다.')
    },
    onError: (e: any) => alert(`저장 실패: ${e.message}`),
  })

  /* 삭제 뮤테이션 */
  const delMut = useMutation({
    mutationFn: async () => {
      if (!form.item_cd) return
      await fetch(`/api/item-master/${form.item_cd}`, { method: 'DELETE' })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/api/item-master'] })
      setForm(EMPTY_ITEM); setSelected(null); setIsNew(false)
    },
  })

  const upd = (field: keyof Item, val: any) => setForm(f => ({ ...f, [field]: val }))

  const handleNew = () => {
    setForm({ ...EMPTY_ITEM, work_date: new Date().toISOString().slice(0,10) })
    setSelected(null); setIsNew(true); setActiveTab('기본정보')
  }
  const handleSelect = (item: Item) => {
    setForm({ ...item }); setSelected(item); setIsNew(false); setActiveTab('기본정보')
  }
  const handleDelete = () => {
    if (!form.item_cd) return
    if (confirm(`"${form.item_name}" 품목을 삭제하시겠습니까?`)) delMut.mutate()
  }
  const handleSearch = () => setSearch({ item_cls: filter.item_cls, keyword: filter.keyword, std: filter.std })

  useEffect(() => {
    const { setActions, clearActions } = useToolbarStore.getState()
    setActions({
      onSearch: handleSearch,
      onNew: handleNew,
      onSave: () => saveMut.mutate(),
      onDelete: handleDelete,
    })
    return () => clearActions()
  }, [filter, isNew, selected, form])

  return (
    <SmartFactoryWrapper>
      <style>{`
        .grid-row:hover { background: #eff6ff; cursor: pointer; }
        .grid-row.active { background: #dbeafe; }
        .tab-btn { border-bottom: 2px solid transparent; }
        .tab-btn.active { border-bottom-color: #2563eb; color: #2563eb; font-weight: 600; }
      `}</style>

      {/* ── 검색 필터 ── */}
      <div className="flex items-center gap-3 mb-2 px-3 py-2 bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-500 whitespace-nowrap">품목구분</span>
          <div className="relative">
            <select value={filter.item_cls} onChange={e => setFilter(f => ({ ...f, item_cls: e.target.value }))}
              className="border border-slate-200 rounded pl-2 pr-6 py-0.5 text-[11px] text-slate-700 bg-white focus:outline-none focus:border-blue-400 appearance-none">
              {ITEM_CLS_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1 pointer-events-none" />
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-500">품목명</span>
          <div className="relative">
            <input value={filter.keyword} onChange={e => setFilter(f => ({ ...f, keyword: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="품목코드/품목명" className="border border-slate-200 rounded pl-2 pr-6 py-0.5 text-[11px] w-40 focus:outline-none focus:border-blue-400" />
            <Search className="w-3 h-3 text-slate-400 absolute right-1.5 top-1 pointer-events-none" />
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-500">규격</span>
          <input value={filter.std} onChange={e => setFilter(f => ({ ...f, std: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="규격" className="border border-slate-200 rounded px-2 py-0.5 text-[11px] w-24 focus:outline-none focus:border-blue-400" />
        </div>
        <label className="flex items-center gap-1 text-[11px] text-slate-600 cursor-pointer ml-2">
          <Checkbox checked={filter.use_yn} onChange={v => setFilter(f => ({ ...f, use_yn: v }))} />
          미사용포함
        </label>
        <button onClick={handleSearch} className="ml-auto px-4 py-1 bg-blue-600 text-white text-[11px] rounded font-medium hover:bg-blue-700 active:scale-95">
          조회
        </button>
      </div>

      {/* ── 메인 레이아웃: 상단 그리드 + 하단 폼 ── */}
      <div className="flex flex-col gap-2" style={{ height: 'calc(100vh - 280px)', minHeight: 400 }}>

        {/* 상단: 품목 목록 그리드 */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col" style={{ flex: '0 0 45%' }}>
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100 bg-slate-50 rounded-t-lg">
            <span className="text-[11px] font-bold text-blue-700 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> 품목 목록
            </span>
            <span className="text-[10px] text-slate-400">{items.length}건</span>
          </div>
          <div className="overflow-auto flex-1">
            <table className="w-full text-[11px] border-collapse" style={{ minWidth: 1200 }}>
              <thead className="sticky top-0 bg-slate-100 z-10">
                <tr>
                  {['순번','사용','BOM','품목구분','계정코드','계정명','품목코드','품목명','규격','도번','영문명'].map(h => (
                    <th key={h} className="px-2 py-1.5 text-left text-[10px] font-semibold text-slate-600 border-b border-slate-200 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={11} className="text-center py-8 text-slate-400 text-xs">조회 중...</td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={11} className="text-center py-8 text-slate-400 text-xs">데이터가 없습니다. 조회 버튼을 클릭하거나 신규 등록해주세요.</td></tr>
                ) : items.map((item, idx) => (
                  <tr key={item.item_cd}
                    onClick={() => handleSelect(item)}
                    className={`grid-row border-b border-slate-50 ${selected?.item_cd === item.item_cd ? 'active' : ''}`}>
                    <td className="px-2 py-1 text-slate-500 text-center">{idx + 1}</td>
                    <td className="px-2 py-1 text-center">{item.use_yn === 'Y' ? <span className="text-blue-500">✓</span> : ''}</td>
                    <td className="px-2 py-1 text-center">{item.bom_yn === 'Y' ? <span className="w-3 h-3 rounded-full border-2 border-slate-400 inline-block" /> : ''}</td>
                    <td className="px-2 py-1 whitespace-nowrap">{item.item_cls}</td>
                    <td className="px-2 py-1 whitespace-nowrap">{item.acct_cd}</td>
                    <td className="px-2 py-1 whitespace-nowrap">{item.acct_name}</td>
                    <td className="px-2 py-1 text-blue-700 font-medium whitespace-nowrap">{item.item_cd}</td>
                    <td className="px-2 py-1 font-medium text-slate-800 whitespace-nowrap max-w-[200px] truncate">{item.item_name}</td>
                    <td className="px-2 py-1 text-slate-500 whitespace-nowrap">{item.std}</td>
                    <td className="px-2 py-1 text-slate-500 whitespace-nowrap">{item.drawing_no}</td>
                    <td className="px-2 py-1 text-slate-500 whitespace-nowrap">{item.item_name_eng}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 하단: 상세 입력 폼 */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col flex-1 overflow-hidden">
          {/* 폼 헤더 */}
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100 bg-slate-50 rounded-t-lg shrink-0">
            <span className="text-[11px] font-bold text-slate-600">
              {isNew ? '🆕 신규 품목 입력' : selected ? `📋 ${selected.item_cd} — ${selected.item_name}` : '품목을 선택하세요'}
            </span>
            {(isNew || selected) && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isNew ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                {isNew ? '신규' : '수정'}
              </span>
            )}
          </div>

          {/* 탭 */}
          <div className="flex items-center gap-0 px-3 border-b border-slate-200 bg-white shrink-0">
            {TABS.map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`tab-btn px-4 py-2 text-[11px] text-slate-500 hover:text-blue-600 transition-colors ${activeTab === t ? 'active' : ''}`}>
                {t}
              </button>
            ))}
          </div>

          {/* 탭 콘텐츠 */}
          <div className="flex-1 overflow-auto p-3">
            {activeTab === '기본정보' && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-2">
                <FieldRow label="품목코드" required>
                  <TInput value={form.item_cd} onChange={v => upd('item_cd', v)} disabled={!isNew} />
                </FieldRow>
                <FieldRow label="품목명" required>
                  <TInput value={form.item_name} onChange={v => upd('item_name', v)} />
                </FieldRow>
                <FieldRow label="영문명">
                  <TInput value={form.item_name_eng} onChange={v => upd('item_name_eng', v)} />
                </FieldRow>
                <FieldRow label="품목구분" required>
                  <TSelect value={form.item_cls} onChange={v => upd('item_cls', v)} options={['제품','반제품','원재료','부재료','상품','소모품','자산','기타']} />
                </FieldRow>
                <FieldRow label="품목그룹">
                  <TInput value={form.item_grp} onChange={v => upd('item_grp', v)} />
                </FieldRow>
                <FieldRow label="규격">
                  <TInput value={form.std} onChange={v => upd('std', v)} />
                </FieldRow>
                <FieldRow label="도번">
                  <TInput value={form.drawing_no} onChange={v => upd('drawing_no', v)} />
                </FieldRow>
                <FieldRow label="계정코드">
                  <TInput value={form.acct_cd} onChange={v => upd('acct_cd', v)} />
                </FieldRow>
                <FieldRow label="계정명">
                  <TInput value={form.acct_name} onChange={v => upd('acct_name', v)} />
                </FieldRow>
                <div className="flex items-center gap-4 col-span-2">
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer">
                    <Checkbox checked={form.use_yn === 'Y'} onChange={v => upd('use_yn', v ? 'Y' : 'N')} /> 사용여부
                  </label>
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer">
                    <Checkbox checked={form.bom_yn === 'Y'} onChange={v => upd('bom_yn', v ? 'Y' : 'N')} /> BOM 관리
                  </label>
                </div>
              </div>
            )}

            {activeTab === '단위정보' && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-2">
                <FieldRow label="기준단위"><TInput value={form.base_unit} onChange={v => upd('base_unit', v)} /></FieldRow>
                <FieldRow label="환산단위"><TInput value={form.conv_unit} onChange={v => upd('conv_unit', v)} /></FieldRow>
                <FieldRow label="기준비율"><TInput value={form.base_ratio} onChange={v => upd('base_ratio', Number(v))} /></FieldRow>
                <FieldRow label="환산비율"><TInput value={form.conv_ratio} onChange={v => upd('conv_ratio', Number(v))} /></FieldRow>
                <FieldRow label="BOM단위"><TInput value={form.bom_unit} onChange={v => upd('bom_unit', v)} /></FieldRow>
                <FieldRow label="BOM기준비율"><TInput value={form.bom_base_ratio} onChange={v => upd('bom_base_ratio', Number(v))} /></FieldRow>
                <FieldRow label="BOM비율"><TInput value={form.bom_ratio} onChange={v => upd('bom_ratio', Number(v))} /></FieldRow>
              </div>
            )}

            {activeTab === '재고정보' && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-2">
                <FieldRow label="기본창고코드"><TInput value={form.wh_cd} onChange={v => upd('wh_cd', v)} /></FieldRow>
                <FieldRow label="창고명"><TInput value={form.wh_name} onChange={v => upd('wh_name', v)} /></FieldRow>
                <FieldRow label="적정재고"><TInput value={form.opt_stock} onChange={v => upd('opt_stock', Number(v))} /></FieldRow>
                <FieldRow label="안전재고"><TInput value={form.safe_stock} onChange={v => upd('safe_stock', Number(v))} /></FieldRow>
                <FieldRow label="초기이월수량"><TInput value={form.init_qty} onChange={v => upd('init_qty', Number(v))} /></FieldRow>
                <FieldRow label="초기이월금액"><TInput value={form.init_amt} onChange={v => upd('init_amt', Number(v))} /></FieldRow>
                <FieldRow label="표준원가"><TInput value={form.std_cost} onChange={v => upd('std_cost', Number(v))} /></FieldRow>
              </div>
            )}

            {activeTab === '생산정보' && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-2">
                <FieldRow label="공정코드"><TInput value={form.prc_cd} onChange={v => upd('prc_cd', v)} /></FieldRow>
                <FieldRow label="공정명"><TInput value={form.prc_name} onChange={v => upd('prc_name', v)} /></FieldRow>
                <FieldRow label="설비코드"><TInput value={form.eqp_cd} onChange={v => upd('eqp_cd', v)} /></FieldRow>
                <FieldRow label="설비명"><TInput value={form.eqp_name} onChange={v => upd('eqp_name', v)} /></FieldRow>
                <FieldRow label="생산L/T"><TInput value={form.prod_lt} onChange={v => upd('prod_lt', Number(v))} /></FieldRow>
                <FieldRow label="구분">
                  <TSelect value={form.div_cls||''} onChange={v => upd('div_cls', v)} options={['','제조','구매','외주']} />
                </FieldRow>
                <FieldRow label="사내/외">
                  <TSelect value={form.in_out_cls} onChange={v => upd('in_out_cls', v)} options={['사내','외주']} />
                </FieldRow>
                <FieldRow label="사급종류">
                  <TSelect value={form.supply_cls||''} onChange={v => upd('supply_cls', v)} options={['','유상사급','무상사급']} />
                </FieldRow>
                <FieldRow label="외주처코드"><TInput value={form.out_vendor_cd} onChange={v => upd('out_vendor_cd', v)} /></FieldRow>
                <FieldRow label="거래처명"><TInput value={form.vendor_name} onChange={v => upd('vendor_name', v)} /></FieldRow>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer">
                    <Checkbox checked={form.prod_plan_yn === 'Y'} onChange={v => upd('prod_plan_yn', v ? 'Y' : 'N')} /> 생산예정
                  </label>
                </div>
              </div>
            )}

            {activeTab === '기타정보' && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-2">
                <FieldRow label="작업일"><TInput value={form.work_date} onChange={v => upd('work_date', v)} disabled /></FieldRow>
                <FieldRow label="작업ID"><TInput value={form.work_id} onChange={v => upd('work_id', v)} disabled /></FieldRow>
              </div>
            )}
          </div>
        </div>
      </div>
    </SmartFactoryWrapper>
  )
}
