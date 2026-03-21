import { create } from 'zustand'

export interface ToolbarState {
  onSearch?: () => void;
  onNew?: () => void;
  onSave?: () => void;
  onDelete?: () => void;
  onPrint?: () => void;
  onExcelDown?: () => void;
  onExcelUp?: () => void;
  setActions: (actions: Partial<Omit<ToolbarState, 'setActions' | 'clearActions'>>) => void;
  clearActions: () => void;
}

export const useToolbarStore = create<ToolbarState>((set) => ({
  setActions: (actions) => set(actions),
  clearActions: () => set({
    onSearch: undefined,
    onNew: undefined,
    onSave: undefined,
    onDelete: undefined,
    onPrint: undefined,
    onExcelDown: undefined,
    onExcelUp: undefined,
  })
}))
