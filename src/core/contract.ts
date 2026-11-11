export const EVENT_SCENE_CHANGED = "scene_changed"
export const EVENT_SETTINGS_CHANGED = "settings_changed"
export const EVENT_SAVE_SAVED = "save_saved"
export const EVENT_SAVE_DELETED = "save_deleted"

export const SCENE_HOME = "home"
export const SCENE_SETTINGS = "settings"
export const SCENE_MAP_GENERATOR = "map_generator"
export const SCENE_SAVE_MANAGER = "save_manager"

export type scene_factory = () => unknown
export type event_handler = (payload: unknown) => void

export interface event_bus_contract {
  emit: (event: string, payload?: unknown) => void
  on: (event: string, handler: event_handler) => () => void
}

export interface scene_registry_contract {
  register_scene: (id: string, factory: scene_factory) => void
  create_scene: (id: string) => unknown
  open_scene: (id: string) => unknown
}

export interface settings_contract {
  get: <T>(key: string, fallback: T) => T
  set: (key: string, value: unknown) => void
}

export interface game_module {
  id: string
  setup: () => void
}

export interface save_terrain_params {
  sea_level: number
  river_source_count: number
  river_max_steps: number
  noise_octaves: number
  noise_base_frequency: number
  noise_persistence: number
}

export interface save_record {
  id: string
  name: string
  timestamp: number
  width: number
  height: number
  seed: number
  terrain: save_terrain_params
}

export interface save_input {
  name: string
  width: number
  height: number
  seed: number
  terrain: save_terrain_params
  id?: string
}

export interface save_store_contract {
  save_game: (input: save_input) => save_record
  load_game: (id: string) => save_record | null
  list_saves: () => save_record[]
  delete_save: (id: string) => boolean
}
