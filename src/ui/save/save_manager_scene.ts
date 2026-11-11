import type { save_input, save_record } from "../../core/contract"
import { SCENE_HOME, SCENE_MAP_GENERATOR } from "../../core/contract"
import { delete_save, list_saves, load_game, save_game } from "../../core/save_store"
import { has_scene, open_scene } from "../../core/scene_registry"
import { save_list_view } from "./save_list_view"

export const MAP_SCENE_FALLBACK_KEY = "map"

export interface map_scene_target {
  load_save: (id: string) => boolean
}

export class save_manager_scene {
  readonly list_view: save_list_view = new save_list_view()

  refresh(): save_record[] {
    const records = list_saves()
    this.list_view.set_entries(records)
    return this.list_view.get_entries()
  }

  save(input: save_input): save_record {
    const record = save_game(input)
    this.refresh()
    return record
  }

  load(id: string): save_record {
    const record = load_game(id)
    if (!record) throw new Error(`未找到存档 ${id}`)
    const scene = open_scene(this.resolve_map_scene_id()) as map_scene_target
    if (typeof scene.load_save !== "function") throw new Error("地图场景不支持读取存档")
    if (!scene.load_save(id)) throw new Error(`未找到存档 ${id}`)
    return record
  }

  private resolve_map_scene_id(): string {
    if (has_scene(SCENE_MAP_GENERATOR)) return SCENE_MAP_GENERATOR
    if (has_scene(MAP_SCENE_FALLBACK_KEY)) return MAP_SCENE_FALLBACK_KEY
    throw new Error("地图场景未注册")
  }

  remove(id: string): void {
    const deleted = delete_save(id)
    if (!deleted) throw new Error(`未找到存档 ${id}`)
    this.list_view.remove(id)
  }

  back_to_home(): unknown {
    return open_scene(SCENE_HOME)
  }
}
