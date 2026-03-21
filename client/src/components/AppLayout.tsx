import React, { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Search, PanelLeftClose, PanelLeft, Plus, Save, Trash2, Printer, FileDown, FileUp, X,
  Home, FileText, Image as ImageIcon, Video, MessageSquare, LayoutDashboard, Factory, Eye, Settings, Package, ShieldAlert
} from 'lucide-react'
import { cn } from '../lib/utils'
import { useTabStore } from '../store/useTabStore'
import FloatingChat from './FloatingChat'

const menuItems = [
  { group: '스마트팩토리', items: [
    { icon: LayoutDashboard, label: '대시보드', path: '/sf-dashboard' },
    { icon: Factory, label: '작업실적입력', path: '/sf-production' },
    { icon: Eye, label: 'AI 비전 검사', path: '/sf-vision' },
    { icon: Settings, label: '비전 설정', path: '/sf-vision-setting' },
    { icon: Package, label: '품목등록', path: '/sf-item-master' },
    { icon: ShieldAlert, label: '검사요청유형', path: '/sf-defect-type' },
  ]},
  { group: '기본메뉴', items: [
    { icon: Home, label: '홈', path: '/' },
    { icon: FileText, label: 'PDF 변환', path: '/pdf-converter' },
    { icon: ImageIcon, label: '이미지 편집', path: '/image-editor' },
    { icon: Video, label: '동영상', path: '/video-maker' },
    { icon: MessageSquare, label: '채팅', path: '/chat' },
  ]}
]

// Global Layout
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(true)
  const { tabs, activePath, addTab, removeTab, setActivePath } = useTabStore()
  const navigate = useNavigate()
  const location = useLocation()

  // URL 변경 시 탭에 추가 (처음 접속하거나, 탭이 아닌 다른 링크로 이동했을 때)
  useEffect(() => {
    const allItems = menuItems.flatMap(g => g.items)
    const currentItem = allItems.find(i => i.path === location.pathname)
    if (currentItem) {
      addTab({ id: currentItem.path, path: currentItem.path, label: currentItem.label })
      setActivePath(currentItem.path)
    }
  }, [location.pathname])

  const handleMenuClick = (path: string, label: string) => {
    addTab({ id: path, path, label })
    navigate(path)
  }

  const handleTabClick = (path: string) => {
    navigate(path)
  }

  const handleTabClose = (e: React.MouseEvent, path: string) => {
    e.stopPropagation()
    removeTab(path)
    // Zustand store 에서 알아서 activePath를 변경해주지만, navigate도 해줘야 함
    const newTabs = tabs.filter(t => t.path !== path)
    if (newTabs.length === 0) {
      navigate('/')
    } else if (activePath === path) {
      navigate(newTabs[newTabs.length - 1].path)
    }
  }

  return (
    <div className="flex h-screen w-screen bg-[#F1F5F9] overflow-hidden sf-light text-slate-800">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-[#0F172A] flex flex-col text-slate-300 transition-all duration-300 ease-in-out shrink-0 border-r border-slate-800",
          sidebarOpen ? "w-[240px]" : "w-[60px]"
        )}
      >
        <div className="h-14 flex items-center px-4 border-b border-slate-800/80 justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center shrink-0">
                <span className="text-white text-[10px] font-black">KQ</span>
              </div>
              <span className="font-bold text-white tracking-wide text-sm whitespace-nowrap">품질재단 ERP</span>
            </div>
          )}
          {!sidebarOpen && (
             <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center mx-auto shrink-0">
               <span className="text-white text-[10px] font-black">KQ</span>
             </div>
          )}
        </div>

        <div className={cn("px-4 py-3 text-[10px] font-semibold text-slate-500 tracking-wider flex items-center", sidebarOpen ? "justify-between" : "justify-center")}>
          {sidebarOpen && <span>NAVIGATION</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hover:text-white transition-colors">
            {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-1 space-y-4 custom-scrollbar">
          {menuItems.map((group, gIdx) => (
            <div key={gIdx}>
              {sidebarOpen && <div className="px-3 mb-1 text-[11px] font-medium text-slate-600">{group.group}</div>}
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = activePath === item.path
                  const Icon = item.icon
                  return (
                    <li key={item.path}>
                      <button
                        onClick={() => handleMenuClick(item.path, item.label)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                          isActive 
                            ? "bg-blue-600/10 text-blue-400 font-medium" 
                            : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                        )}
                        title={!sidebarOpen ? item.label : undefined}
                      >
                        <Icon className="w-[18px] h-[18px] shrink-0" />
                        {sidebarOpen && <span className="text-sm whitespace-nowrap">{item.label}</span>}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="h-14 bg-[#0F172A] flex items-center px-4 shrink-0 justify-between">
          {/* Logo area when sidebar is closed? No, let's just put search */}
          <div className="flex-1 flex items-center">
             <div className="flex items-center w-full max-w-md bg-slate-900 rounded-full px-4 py-1.5 border border-slate-700/50 text-slate-300 focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all">
               <Search className="w-4 h-4 text-slate-400 shrink-0" />
               <input type="text" placeholder="메뉴 검색..." className="bg-transparent border-none text-sm ml-2 focus:outline-none w-full placeholder:text-slate-500" />
               <span className="text-[10px] text-slate-500 font-mono ml-2 border border-slate-700 px-1.5 py-0.5 rounded shrink-0">Ctrl+K</span>
             </div>
          </div>
          <div className="flex items-center gap-3 text-slate-300">
            <div className="text-xs font-medium bg-slate-800 px-3 py-1.5 rounded-md hidden sm:block border border-slate-700">관리자님 환영합니다</div>
          </div>
        </header>

        {/* Global Toolbar */}
        <div className="h-12 bg-white flex items-center px-3 gap-1 shrink-0 shadow-sm z-10 border-b border-slate-200">
          <ToolbarButton icon={<Search className="w-4 h-4" />} label="조회 (Ctrl+F)" />
          <div className="w-px h-4 bg-slate-200 mx-1" />
          <ToolbarButton icon={<Plus className="w-4 h-4" />} label="신규 (Ctrl+A)" />
          <ToolbarButton icon={<Save className="w-4 h-4" />} label="저장 (Ctrl+S)" />
          <ToolbarButton icon={<Trash2 className="w-4 h-4" />} label="삭제 (Ctrl+D)" />
          <div className="w-px h-4 bg-slate-200 mx-1" />
          <ToolbarButton icon={<Printer className="w-4 h-4" />} label="인쇄 (Ctrl+P)" disabled />
          <ToolbarButton icon={<FileDown className="w-4 h-4" />} label="엑셀변환 (Ctrl+E)" className="text-emerald-600 hover:bg-emerald-50" />
          <ToolbarButton icon={<FileUp className="w-4 h-4" />} label="엑셀입력 (Ctrl+H)" disabled />
        </div>

        {/* Tab Strip */}
        <div className="h-[38px] bg-slate-100 flex items-end px-2 gap-1 shrink-0 overflow-x-auto border-b border-slate-200 hide-scrollbar pt-2">
          {tabs.map(tab => {
            const isActive = activePath === tab.path
            return (
              <div 
                key={tab.path}
                onClick={() => handleTabClick(tab.path)}
                className={cn(
                  "group flex items-center gap-2 px-3 py-1.5 min-w-[120px] max-w-[200px] border border-b-0 rounded-t-lg cursor-pointer transition-colors relative z-0",
                  isActive 
                    ? "bg-white border-slate-200 text-blue-600 font-bold z-10 shadow-[0_2px_0_0_white]" 
                    : "bg-slate-50 border-transparent text-slate-500 hover:bg-white hover:text-slate-700"
                )}
              >
                <div className={cn("w-1.5 h-1.5 rounded-full", isActive ? "bg-blue-600" : "bg-slate-300")} />
                <span className="text-xs truncate flex-1">{tab.label}</span>
                <button 
                  onClick={(e) => handleTabClose(e, tab.path)}
                  className="p-0.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )
          })}
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-[#F8FAFC] p-4 lg:p-5 relative">
          <div className="h-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
             {children}
          </div>
        </div>

      </main>

      <FloatingChat />
    </div>
  )
}

function ToolbarButton({ icon, label, disabled, className }: { icon: React.ReactNode, label: string, disabled?: boolean, className?: string }) {
  return (
    <button 
      disabled={disabled}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all",
        disabled 
          ? "text-slate-300 cursor-not-allowed" 
          : cn("text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:scale-95", className)
      )}
    >
      {icon}
      <span className="hidden md:inline">{label}</span>
    </button>
  )
}
