import { create } from 'zustand'

export interface TabItem {
  id: string
  path: string
  label: string
  icon?: any // We can pass a string or just determine it in component
}

interface TabState {
  tabs: TabItem[]
  activePath: string
  addTab: (tab: TabItem) => void
  removeTab: (path: string) => void
  setActivePath: (path: string) => void
}

export const useTabStore = create<TabState>((set) => ({
  tabs: [{ id: 'dashboard', path: '/sf-dashboard', label: '대시보드' }],
  activePath: '/sf-dashboard',
  addTab: (tab) =>
    set((state) => {
      const exists = state.tabs.find((t) => t.path === tab.path)
      if (!exists) {
        return { tabs: [...state.tabs, tab], activePath: tab.path }
      }
      return { activePath: tab.path }
    }),
  removeTab: (path) =>
    set((state) => {
      const newTabs = state.tabs.filter((t) => t.path !== path)
      // If active tab is removed, select the last tab
      let newActivePath = state.activePath
      if (state.activePath === path) {
        newActivePath = newTabs.length > 0 ? newTabs[newTabs.length - 1].path : '/'
      }
      return { tabs: newTabs, activePath: newActivePath }
    }),
  setActivePath: (path) => set({ activePath: path }),
}))
