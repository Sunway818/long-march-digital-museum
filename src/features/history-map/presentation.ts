import type { ArmyId } from './types'

/** Display tokens only. Historic names, dates, coordinates and IDs stay in data. */
export const armyPresentation: Record<ArmyId, { name: string; color: string }> = {
  central: { name: '红一方面军（中央红军）', color: '#B42B25' },
  second: { name: '红二、红六军团及红二方面军', color: '#B47C10' },
  fourth: { name: '红四方面军', color: '#28647B' },
  twentyfive: { name: '红二十五军', color: '#4D722E' },
}
export const armyDisplayOrder: ArmyId[] = ['central', 'second', 'fourth', 'twentyfive']
