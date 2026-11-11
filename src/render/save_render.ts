import Phaser from "phaser"
import { save_manager_scene } from "../ui/save/save_manager_scene"
import { make_button, set_pending_save, show_error } from "./base_render"

const LIST_TOP = 180
const LIST_GAP = 64
const LIST_LIMIT = 8

export class SaveRender extends Phaser.Scene {
  private logic = new save_manager_scene()

  constructor() {
    super({ key: "save" })
  }

  create(): void {
    try {
      this.add.text(640, 90, "存档管理", { fontSize: "48px", color: "#ffffff" }).setOrigin(0.5)
      const records = this.logic.refresh()
      if (records.length === 0) {
        this.add.text(640, 320, this.logic.list_view.get_empty_text(), { fontSize: "32px", color: "#8a93a8" }).setOrigin(0.5)
      } else {
        records.slice(0, LIST_LIMIT).forEach((record, index) => {
          const y = LIST_TOP + index * LIST_GAP
          this.add.text(180, y, this.logic.list_view.format_entry(record), { fontSize: "22px", color: "#ffffff" }).setOrigin(0, 0.5)
          make_button(this, 940, y, 130, 48, "读取", () => {
            set_pending_save(record.id)
            this.scene.start("map")
          })
          make_button(this, 1100, y, 130, 48, "删除", () => {
            this.logic.remove(record.id)
            this.scene.restart()
          })
        })
      }
      make_button(this, 640, 660, 260, 64, "返回首页", () => this.scene.start("home"))
    } catch (error) {
      show_error(String(error))
    }
  }
}
