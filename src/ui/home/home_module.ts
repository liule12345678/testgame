import type { game_module } from "../../core/contract"
import { SCENE_HOME } from "../../core/contract"
import { register_scene } from "../../core/scene_registry"
import { home_scene } from "./home_scene"

export const home_module: game_module = {
  id: "home",
  setup: () => {
    register_scene(SCENE_HOME, () => new home_scene())
  },
}
