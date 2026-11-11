import Phaser from "phaser"
import "./bootstrap"
import { show_error } from "./render/base_render"
import { HomeRender } from "./render/home_render"
import { MapRender } from "./render/map_render"
import { SaveRender } from "./render/save_render"
import { SettingsRender } from "./render/settings_render"

window.addEventListener("error", event => {
  show_error(event.message)
})

new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  width: 1280,
  height: 720,
  backgroundColor: "#101426",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [HomeRender, MapRender, SaveRender, SettingsRender]
})
