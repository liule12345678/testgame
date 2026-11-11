import Phaser from "phaser"
import { home_scene } from "../ui/home/home_scene"
import { make_button, show_error } from "./base_render"

export class HomeRender extends Phaser.Scene {
  private logic = new home_scene()

  constructor() {
    super({ key: "home" })
  }

  create(): void {
    try {
      this.add.text(640, 160, "大战略", { fontSize: "72px", color: "#ffffff" }).setOrigin(0.5)
      const entries = this.logic.list_entries()
      entries.forEach((entry, index) => {
        make_button(this, 640, 340 + index * 110, 360, 80, entry.title, () => {
          if (entry.id === "start_game") {
            this.scene.start("map")
            return
          }
          if (entry.id === "save_manager") {
            this.scene.start("save")
            return
          }
          this.scene.start("settings")
        })
      })
    } catch (error) {
      show_error(String(error))
    }
  }
}
