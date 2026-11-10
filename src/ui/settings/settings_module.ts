import type { game_module } from "../../core/contract"
import { SCENE_SETTINGS } from "../../core/contract"
import { register_scene } from "../../core/scene_registry"
import { load_settings } from "../../core/settings_service"
import { settings_scene } from "./settings_scene"

export const settings_module: game_module = {
  id: "settings",
  setup: () => {
    load_settings()
    register_scene(SCENE_SETTINGS, () => new settings_scene())
  },
}
