export const TERRAIN_PLAIN = 'plain' as const
export const TERRAIN_OCEAN = 'ocean' as const
export const TERRAIN_RIVER = 'river' as const

export type TerrainType = typeof TERRAIN_PLAIN | typeof TERRAIN_OCEAN | typeof TERRAIN_RIVER
