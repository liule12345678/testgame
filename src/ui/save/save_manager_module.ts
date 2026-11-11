import type { game_module } from "../../core/contract"
import { SCENE_SAVE_MANAGER } from "../../core/contract"
import { register_scene } from "../../core/scene_registry"
import { save_manager_scene } from "./save_manager_scene"

export const save_manager_module: game_module = {
  id: "save_manager",
  setup: () => {
    register_scene(SCENE_SAVE_MANAGER, () => new save_manager_scene())
  },
}
