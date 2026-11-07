export const modules = [
  { id: 'journey', label: '时空长征' },
  { id: 'people', label: '英雄人物' },
  { id: 'legacy', label: '精神传承' },
] as const

export type ExhibitModuleId = typeof modules[number]['id']
