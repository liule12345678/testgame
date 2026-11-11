import type { game_module } from "../../core/contract"
import { SCENE_MAP_GENERATOR } from "../../core/contract"
import { register_scene } from "../../core/scene_registry"
import { MapScene } from "./map_scene"

export const map_module: game_module = {
  id: "map",
  setup: () => {
    register_scene(SCENE_MAP_GENERATOR, () => new MapScene())
  }
}
