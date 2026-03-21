import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Plus, Save, Trash2, Download, RefreshCw, ChevronDown, ShieldAlert } from 'lucide-react'
import SmartFactoryWrapper from '@/components/SmartFactoryWrapper'
import { useToolbarStore } from '@/store/useToolbarStore'
import { useEffect } from 'react'

/* ─────────────────── 타입 ─────────────────── */
type DefectType = {
  id: number
  grp_cd: string; grp_name: string
  defect_cd: string; defect_name: string
  remark: string; use_yn: string
  sort_no: number; work_date: string; work_id: string
}
type Group = { grp_cd: string; grp_name: string }

const EMPTY: Omit<DefectType, 'id' | 'sort_no' | 'work_date' | 'work_id'> = {
  grp_cd: '', grp_name: '', defect_cd: '', defect_name: '', remark: '', use_yn: 'Y',
}

const GRP_COLORS: Record<string, string> = {
  L01: 'bg-red-100 text-red-700 border-red-200',
  L02: 'bg-blue-100 text-blue-700 border-blue-200',
  L03: 'bg-orange-100 text-orange-700 border-orange-200',
  L05: 'bg-purple-100 text-purple-700 border-purple-200',
}
function grpColor(cd: string) {
  return GRP_COLORS[cd] ?? 'bg-slate-100 text-slate-600 border-slate-200'
}

/* ─────────────────── 공통 UI ─────────────────── */
function TInput({ value, onChange, disabled, placeholder = '' }: { value: string | number; onChange?: (v: string) => void; disabled?: boolean; placeholder?: string }) {
  return (
    <input type="text" value={value ?? ''} placeholder={placeholder}
      onChange={e => onChange?.(e.target.value)} disabled={disabled}
      className="border border-slate-200 rounded px-2 py-1 text-[12px] text-slate-700 bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 disabled:bg-slate-50 disabled:text-slate-400 w-full" />
  )
}

/* ─────────────────── 메인 컴포넌트 ─────────────────── */
export default function DefectType() {
  const qc = useQueryClient()
  const [filter, setFilter] = useState({ grp_cd: '', keyword: '' })
  const [search, setSearch] = useState({ grp_cd: '', keyword: '' })
  const [selected, setSelected] = useState<DefectType | null>(null)
  const [form, setForm] = useState<any>({ ...EMPTY })
  const [isNew, setIsNew] = useState(false)

  /* 데이터 조회 */
  const { data: rows = [], isLoading } = useQuery<DefectType[]>({
    queryKey: ['/api/defect-type', search],
    queryFn: async () => {
      const p = new URLSearchParams()
      if (search.grp_cd)  p.set('grp_cd', search.grp_cd)
      if (search.keyword) p.set('keyword', search.keyword)
      const res = await fetch(`/api/defect-type?${p}`)
      return res.json()
    },
  })

  const { data: groups = [] } = useQuery<Group[]>({
    queryKey: ['/api/defect-type/groups'],
    queryFn: async () => (await fetch('/api/defect-type/groups')).json(),
  })

  /* 저장 */
  const saveMut = useMutation({
    mutationFn: async () => {
      const url    = isNew ? '/api/defect-type' : `/api/defect-type/${selected!.id}`
      const method = isNew ? 'POST' : 'PUT'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? '오류')
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/api/defect-type'] })
      qc.invalidateQueries({ queryKey: ['/api/defect-type/groups'] })
      setIsNew(false)
      alert('저장되었습니다.')
    },
    onError: (e: any) => alert(`저장 실패: ${e.message}`),
  })

  /* 삭제 */
  const delMut = useMutation({
    mutationFn: async () => {
      if (!selected) return
      await fetch(`/api/defect-type/${selected.id}`, { method: 'DELETE' })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/api/defect-type'] })
      setSelected(null); setForm({ ...EMPTY }); setIsNew(false)
    },
  })

  const upd = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }))
  const handleNew = () => { setForm({ ...EMPTY }); setSelected(null); setIsNew(true) }
  const handleSelect = (row: DefectType) => { setForm({ ...row }); setSelected(row); setIsNew(false) }
  const handleSearch = () => setSearch({ grp_cd: filter.grp_cd, keyword: filter.keyword })
  const handleDelete = () => {
    if (!selected) return
    if (confirm(`"${selected.defect_name}" 항목을 삭제하시겠습니까?`)) delMut.mutate()
  }

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

  /* 그룹별 통계 */
  const grpStats = groups.map(g => ({
    ...g,
    cnt: rows.filter(r => r.grp_cd === g.grp_cd).length,
  }))

  return (
    <SmartFactoryWrapper>
      <style>{`
        .dt-row:hover { background: #eff6ff; cursor: pointer; }
        .dt-row.active { background: #dbeafe; }
      `}</style>

      {/* ── 검색 필터 ── */}
      <div className="flex items-center gap-3 mb-2 px-3 py-2 bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-500 whitespace-nowrap">그룹</span>
          <div className="relative">
            <select value={filter.grp_cd} onChange={e => setFilter(f => ({ ...f, grp_cd: e.target.value }))}
              className="border border-slate-200 rounded pl-2 pr-7 py-0.5 text-[11px] text-slate-700 bg-white focus:outline-none focus:border-blue-400 appearance-none min-w-[120px]">
              <option value="">전체</option>
              {groups.map(g => <option key={g.grp_cd} value={g.grp_cd}>{g.grp_cd} — {g.grp_name}</option>)}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1 pointer-events-none" />
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-500">검색</span>
          <div className="relative">
            <input value={filter.keyword} onChange={e => setFilter(f => ({ ...f, keyword: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="코드/유형명" className="border border-slate-200 rounded pl-2 pr-6 py-0.5 text-[11px] w-36 focus:outline-none focus:border-blue-400" />
            <Search className="w-3 h-3 text-slate-400 absolute right-1.5 top-1 pointer-events-none" />
          </div>
        </div>
        <button onClick={handleSearch} className="px-3 py-0.5 bg-blue-600 text-white text-[11px] rounded font-medium hover:bg-blue-700 active:scale-95">조회</button>
        <div className="ml-auto flex items-center gap-2">
          {grpStats.map(g => (
            <span key={g.grp_cd} className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${grpColor(g.grp_cd)}`}>
              {g.grp_name} {g.cnt}건
            </span>
          ))}
          <span className="text-[11px] text-slate-400 font-medium">{rows.length}건</span>
        </div>
      </div>

      {/* ── 메인 레이아웃 ── */}
      <div className="grid grid-cols-12 gap-2" style={{ height: 'calc(100vh - 260px)', minHeight: 480 }}>

        {/* 좌측: 목록 그리드 */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100 bg-slate-50 rounded-t-lg shrink-0">
            <span className="text-[11px] font-bold text-rose-700 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> 불량유형
            </span>
            <span className="text-[10px] text-slate-400">{rows.length}건</span>
          </div>
          <div className="overflow-auto flex-1">
            <table className="w-full text-[11px] border-collapse">
              <thead className="sticky top-0 bg-slate-100 z-10">
                <tr>
                  {['순번','그룹코드','그룹명','불량유형코드','불량유형명','비고','사용'].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold text-slate-600 border-b border-slate-200 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={7} className="text-center py-10 text-slate-400">조회 중...</td></tr>
                ) : rows.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-10 text-slate-400">
                    데이터가 없습니다. 조회 버튼을 클릭해주세요.
                  </td></tr>
                ) : rows.map((row, idx) => (
                  <tr key={row.id} onClick={() => handleSelect(row)}
                    className={`dt-row border-b border-slate-50 transition-colors ${selected?.id === row.id ? 'active' : ''}`}>
                    <td className="px-3 py-1.5 text-slate-400 text-center">{idx + 1}</td>
                    <td className="px-3 py-1.5">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${grpColor(row.grp_cd)}`}>
                        {row.grp_cd}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 text-slate-600 whitespace-nowrap">{row.grp_name}</td>
                    <td className="px-3 py-1.5 text-blue-700 font-mono font-semibold whitespace-nowrap">{row.defect_cd}</td>
                    <td className="px-3 py-1.5 text-slate-800 font-medium whitespace-nowrap">{row.defect_name}</td>
                    <td className="px-3 py-1.5 text-slate-400 text-[10px]">{row.remark ?? 'NULL'}</td>
                    <td className="px-3 py-1.5 text-center">
                      {row.use_yn === 'Y'
                        ? <span className="text-emerald-500 font-bold text-[10px]">✓ 사용</span>
                        : <span className="text-slate-300 text-[10px]">미사용</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 우측: 상세 입력 폼 */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-100 bg-slate-50 rounded-t-lg shrink-0">
            <span className="text-[11px] font-bold text-slate-600">
              {isNew ? '🆕 신규 등록' : selected ? `✏️ ${selected.defect_cd} — ${selected.defect_name}` : '항목을 선택하세요'}
            </span>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-3">
            {/* 그룹 */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">그룹 정보</p>
              <div className="space-y-2">
                <div>
                  <label className="text-[11px] text-slate-500 block mb-0.5">그룹코드 <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select value={form.grp_cd}
                      onChange={e => {
                        const g = groups.find(x => x.grp_cd === e.target.value)
                        upd('grp_cd', e.target.value)
                        if (g) upd('grp_name', g.grp_name)
                      }}
                      className="border border-slate-200 rounded pl-2 pr-7 py-1 text-[12px] text-slate-700 bg-white focus:outline-none focus:border-blue-400 w-full appearance-none">
                      <option value="">선택</option>
                      {groups.map(g => <option key={g.grp_cd} value={g.grp_cd}>{g.grp_cd} — {g.grp_name}</option>)}
                      <option value="__NEW__">+ 새 그룹 직접입력</option>
                    </select>
                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-2 pointer-events-none" />
                  </div>
                </div>
                {(form.grp_cd === '__NEW__' || !groups.find((g: Group) => g.grp_cd === form.grp_cd)) && (
                  <>
                    <div>
                      <label className="text-[11px] text-slate-500 block mb-0.5">그룹코드 직접입력</label>
                      <TInput value={form.grp_cd === '__NEW__' ? '' : form.grp_cd} onChange={v => upd('grp_cd', v)} placeholder="예: L04" />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-500 block mb-0.5">그룹명</label>
                      <TInput value={form.grp_name} onChange={v => upd('grp_name', v)} placeholder="예: 도장불량" />
                    </div>
                  </>
                )}
                {form.grp_cd && form.grp_cd !== '__NEW__' && groups.find((g: Group) => g.grp_cd === form.grp_cd) && (
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-0.5">그룹명</label>
                    <TInput value={form.grp_name} onChange={v => upd('grp_name', v)} />
                  </div>
                )}
              </div>
            </div>

            {/* 불량유형 */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">불량유형 정보</p>
              <div className="space-y-2">
                <div>
                  <label className="text-[11px] text-slate-500 block mb-0.5">불량유형코드 <span className="text-red-500">*</span></label>
                  <TInput value={form.defect_cd} onChange={v => upd('defect_cd', v)} placeholder="예: P12" />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-0.5">불량유형명 <span className="text-red-500">*</span></label>
                  <TInput value={form.defect_name} onChange={v => upd('defect_name', v)} placeholder="예: 도장불량" />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-0.5">비고</label>
                  <TInput value={form.remark ?? ''} onChange={v => upd('remark', v)} placeholder="비고 (선택)" />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-[11px] text-slate-500">사용여부</label>
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer">
                    <input type="checkbox" checked={form.use_yn === 'Y'} onChange={e => upd('use_yn', e.target.checked ? 'Y' : 'N')}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600" />
                    사용
                  </label>
                </div>
              </div>
            </div>

            {/* 저장 버튼 */}
            {(isNew || selected) && (
              <button onClick={() => saveMut.mutate()} disabled={saveMut.isPending}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-bold rounded-lg shadow-sm active:scale-95 transition-all disabled:opacity-50">
                {saveMut.isPending ? '저장 중...' : isNew ? '✚ 등록' : '💾 저장'}
              </button>
            )}
          </div>
        </div>
      </div>
    </SmartFactoryWrapper>
  )
}
