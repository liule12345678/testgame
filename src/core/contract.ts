export const EVENT_SCENE_CHANGED = "scene_changed"
export const EVENT_SETTINGS_CHANGED = "settings_changed"

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
