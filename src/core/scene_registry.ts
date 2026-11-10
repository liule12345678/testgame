import { emit } from "./event_bus"
import { EVENT_SCENE_CHANGED } from "./contract"
import type { scene_factory } from "./contract"

const scenes = new Map<string, scene_factory>()

export function register_scene(id: string, factory: scene_factory): void {
  scenes.set(id, factory)
}

export function has_scene(id: string): boolean {
  return scenes.has(id)
}

export function list_scenes(): string[] {
  return Array.from(scenes.keys())
}

export function create_scene(id: string): unknown {
  const factory = scenes.get(id)
  if (!factory) throw new Error(`场景未注册 ${id}`)
  return factory()
}

export function open_scene(id: string): unknown {
  const scene = create_scene(id)
  emit(EVENT_SCENE_CHANGED, { id, scene })
  return scene
}
