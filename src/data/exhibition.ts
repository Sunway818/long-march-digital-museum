export const modules = [
  { id: 'timeline', label: '历史时间轴' },
  { id: 'journey', label: '时空长征' },
  { id: 'moments', label: '历史瞬间' },
  { id: 'people', label: '英雄人物' },
  { id: 'legacy', label: '精神传承' },
] as const

export type ExhibitModuleId = typeof modules[number]['id']
