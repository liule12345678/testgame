import { register_module, setup_modules } from "./core/module_registry"
import { load_settings } from "./core/settings_service"
import { init_audio_service } from "./core/audio_service"
import { init_display_service } from "./core/display_service"
import { init_i18n_service } from "./core/i18n_service"
import { open_scene } from "./core/scene_registry"
import { SCENE_HOME } from "./core/contract"
import { home_module } from "./ui/home/home_module"
import { map_module } from "./ui/map/map_module"
import { save_manager_module } from "./ui/save/save_manager_module"
import { settings_module } from "./ui/settings/settings_module"

export function bootstrap(): void {
  register_module(home_module)
  register_module(map_module)
  register_module(save_manager_module)
  register_module(settings_module)
  setup_modules()
  load_settings()
  init_audio_service()
  init_display_service()
  init_i18n_service()
  open_scene(SCENE_HOME)
}

bootstrap()
