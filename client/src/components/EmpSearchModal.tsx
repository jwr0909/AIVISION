import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, X } from 'lucide-react'

// Dialog mock since we don't have the full shadcn/ui setup or we just want a simple modal
export default function EmpSearchModal({ open, onOpenChange, onSelect }: { open: boolean, onOpenChange: (open: boolean) => void, onSelect: (emp: any) => void }) {
  const [keyword, setKeyword] = useState('')
  const [searchKw, setSearchKw] = useState('')

  const { data: emps = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/emp-master', { keyword: searchKw }],
    queryFn: async () => {
      const p = new URLSearchParams()
      if (searchKw) p.set('keyword', searchKw)
      const res = await fetch(`/api/emp-master?${p}`)
      if (!res.ok) return []
      return res.json()
    },
    enabled: open,
  })

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => onOpenChange(false)}>
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex flex-row items-center justify-between shrink-0">
          <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Search className="w-4 h-4 text-blue-600" />
            담당자(사원) 검색
          </div>
          <button onClick={() => onOpenChange(false)} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-3 h-[400px] bg-white">
          {/* 검색 바 */}
          <div className="flex items-center gap-2 shrink-0">
            <input
              type="text"
              placeholder="사번 또는 성명 검색"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && setSearchKw(keyword)}
              className="flex-1 border border-slate-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400 bg-white"
            />
            <button onClick={() => setSearchKw(keyword)}
              className="px-4 py-1.5 bg-slate-800 text-white text-sm font-medium rounded hover:bg-slate-700 active:scale-95 transition-all">
              조회
            </button>
          </div>

          {/* 목록 그리드 */}
          <div className="flex-1 border border-slate-200 rounded overflow-auto bg-white">
            <table className="w-full text-xs border-collapse">
              <thead className="sticky top-0 bg-slate-100 z-10 border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">사번</th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">성명</th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">부서명</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={3} className="text-center py-8 text-slate-400 bg-white">조회 중...</td></tr>
                ) : emps.length === 0 ? (
                  <tr><td colSpan={3} className="text-center py-8 text-slate-400 bg-white">검색 결과가 없습니다.</td></tr>
                ) : emps.map((emp) => (
                  <tr key={emp.emp_id}
                    onClick={() => { onSelect(emp); onOpenChange(false) }}
                    className="border-b border-slate-50 hover:bg-blue-50 cursor-pointer transition-colors bg-white">
                    <td className="px-3 py-2 font-mono font-medium text-slate-700">{emp.emp_id}</td>
                    <td className="px-3 py-2 font-medium text-slate-900">{emp.emp_name}</td>
                    <td className="px-3 py-2 text-slate-500">{emp.dept_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
