import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

type Item = {
  item_cd: string
  item_name: string
  std: string
}

interface ItemSearchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (item: Item) => void
}

export default function ItemSearchModal({ open, onOpenChange, onSelect }: ItemSearchModalProps) {
  const [keyword, setKeyword] = useState('')
  const [searchKw, setSearchKw] = useState('')

  const { data: items = [], isLoading } = useQuery<Item[]>({
    queryKey: ['/api/item-master', { keyword: searchKw, use_yn: 'Y' }],
    queryFn: async () => {
      const p = new URLSearchParams()
      p.set('use_yn', 'Y')
      if (searchKw) p.set('keyword', searchKw)
      const res = await fetch(`/api/item-master?${p}`)
      return res.json()
    },
    enabled: open, // 모달 열릴 때만 페칭
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white border-slate-200 shadow-xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex flex-row items-center justify-between">
          <DialogTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Search className="w-4 h-4 text-blue-600" />
            품목 검색
          </DialogTitle>
          <button onClick={() => onOpenChange(false)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </DialogHeader>

        <div className="p-4 flex flex-col gap-3 h-[400px]">
          {/* 검색 바 */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="품목코드 또는 품목명 검색"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && setSearchKw(keyword)}
              className="flex-1 border border-slate-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400"
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
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">품목코드</th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">품목명</th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">규격</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={3} className="text-center py-8 text-slate-400">조회 중...</td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={3} className="text-center py-8 text-slate-400">검색 결과가 없습니다.</td></tr>
                ) : items.map((item) => (
                  <tr key={item.item_cd}
                    onClick={() => { onSelect(item); onOpenChange(false) }}
                    className="border-b border-slate-50 hover:bg-blue-50 cursor-pointer transition-colors">
                    <td className="px-3 py-2 font-mono font-medium text-slate-700">{item.item_cd}</td>
                    <td className="px-3 py-2 font-medium text-slate-900">{item.item_name}</td>
                    <td className="px-3 py-2 text-slate-500">{item.std}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
