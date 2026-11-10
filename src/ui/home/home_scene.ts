import { open_scene } from "../../core/scene_registry"
import { SCENE_MAP_GENERATOR, SCENE_SAVE_MANAGER, SCENE_SETTINGS } from "../../core/contract"

export interface home_entry {
  id: string
  title: string
  scene_id: string
}

export const HOME_ENTRIES: home_entry[] = [
  { id: "start_game", title: "开始游戏", scene_id: SCENE_MAP_GENERATOR },
  { id: "save_manager", title: "存档管理", scene_id: SCENE_SAVE_MANAGER },
  { id: "settings", title: "系统设置", scene_id: SCENE_SETTINGS },
]

export class home_scene {
  readonly entries: home_entry[] = HOME_ENTRIES

  list_entries(): home_entry[] {
    return this.entries.map(item => ({ ...item }))
  }

  open_entry(id: string): unknown {
    const entry = this.entries.find(item => item.id === id)
    if (!entry) throw new Error(`未找到入口 ${id}`)
    return open_scene(entry.scene_id)
  }
}
