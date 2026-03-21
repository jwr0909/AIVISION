import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, X, CheckSquare, Square } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

type DefectType = {
  id: number
  grp_cd: string
  grp_name: string
  defect_cd: string
  defect_name: string
}

interface DefectTypeSearchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (selectedDefects: string[]) => void
  initialSelected?: string[]
}

export default function DefectTypeSearchModal({ open, onOpenChange, onSelect, initialSelected = [] }: DefectTypeSearchModalProps) {
  const [keyword, setKeyword] = useState('')
  const [searchKw, setSearchKw] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  // 모달 열릴 때 초기 선택값 세팅
  useEffect(() => {
    if (open) {
      setSelected(new Set(initialSelected))
      setKeyword('')
      setSearchKw('')
    }
  }, [open, initialSelected])

  const { data: items = [], isLoading } = useQuery<DefectType[]>({
    queryKey: ['/api/defect-type', { keyword: searchKw, use_yn: 'Y' }],
    queryFn: async () => {
      const p = new URLSearchParams()
      p.set('use_yn', 'Y')
      if (searchKw) p.set('keyword', searchKw)
      const res = await fetch(`/api/defect-type?${p}`)
      return res.json()
    },
    enabled: open,
  })

  const toggleSelect = (defectName: string) => {
    const next = new Set(selected)
    if (next.has(defectName)) next.delete(defectName)
    else next.add(defectName)
    setSelected(next)
  }

  const handleApply = () => {
    onSelect(Array.from(selected))
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white border-slate-200 shadow-xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex flex-row items-center justify-between">
          <DialogTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Search className="w-4 h-4 text-rose-600" />
            검사요청유형(불량유형) 다중 선택
          </DialogTitle>
          <button onClick={() => onOpenChange(false)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </DialogHeader>

        <div className="p-4 flex flex-col gap-3 h-[500px]">
          {/* 검색 바 */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="불량코드 또는 유형명 검색"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && setSearchKw(keyword)}
              className="flex-1 border border-slate-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-rose-400"
            />
            <button onClick={() => setSearchKw(keyword)}
              className="px-4 py-1.5 bg-slate-800 text-white text-sm font-medium rounded hover:bg-slate-700 active:scale-95">
              조회
            </button>
          </div>

          {/* 목록 그리드 */}
          <div className="flex-1 border border-slate-200 rounded overflow-auto">
            <table className="w-full text-xs border-collapse">
              <thead className="sticky top-0 bg-slate-100 z-10 border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2 text-center font-semibold text-slate-600 w-10">선택</th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">그룹명</th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">유형코드</th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">불량유형명</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={4} className="text-center py-8 text-slate-400">조회 중...</td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-8 text-slate-400">검색 결과가 없습니다.</td></tr>
                ) : items.map((item) => {
                  const isSelected = selected.has(item.defect_name)
                  return (
                    <tr key={item.id}
                      onClick={() => toggleSelect(item.defect_name)}
                      className={`border-b border-slate-50 cursor-pointer transition-colors ${isSelected ? 'bg-rose-50' : 'hover:bg-slate-50'}`}>
                      <td className="px-3 py-2 text-center">
                        {isSelected ? <CheckSquare className="w-4 h-4 text-rose-600 mx-auto" /> : <Square className="w-4 h-4 text-slate-300 mx-auto" />}
                      </td>
                      <td className="px-3 py-2 text-slate-500">{item.grp_name}</td>
                      <td className="px-3 py-2 font-mono font-medium text-slate-700">{item.defect_cd}</td>
                      <td className="px-3 py-2 font-bold text-slate-800">{item.defect_name}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-500">선택됨: <strong className="text-rose-600">{selected.size}</strong>건</span>
            <div className="flex gap-2">
              <button onClick={() => setSelected(new Set())} className="px-4 py-1.5 bg-slate-100 text-slate-600 text-sm font-medium rounded hover:bg-slate-200">초기화</button>
              <button onClick={handleApply} className="px-4 py-1.5 bg-rose-600 text-white text-sm font-bold rounded hover:bg-rose-700 shadow-sm active:scale-95">적용하기</button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
