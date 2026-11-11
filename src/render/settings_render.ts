import Phaser from "phaser"
import { settings_scene } from "../ui/settings/settings_scene"
import {
  BRIGHTNESS_MAX,
  BRIGHTNESS_MIN,
  SOUND_VOLUME_MAX,
  SOUND_VOLUME_MIN,
} from "../ui/settings/settings_options"
import { make_button, show_error } from "./base_render"

const SETTING_STEP = 10

export class SettingsRender extends Phaser.Scene {
  private logic = new settings_scene()

  constructor() {
    super({ key: "settings" })
  }

  create(): void {
    try {
      this.add.text(640, 100, "系统设置", { fontSize: "48px", color: "#ffffff" }).setOrigin(0.5)
      this.render_number_row("声音", 240, SOUND_VOLUME_MIN, SOUND_VOLUME_MAX, value => this.logic.set_sound_volume(value), () => this.logic.get_sound_volume())
      this.render_number_row("亮度", 360, BRIGHTNESS_MIN, BRIGHTNESS_MAX, value => this.logic.set_brightness(value), () => this.logic.get_brightness())
      this.render_language_row(480)
      make_button(this, 640, 660, 260, 64, "返回首页", () => this.scene.start("home"))
    } catch (error) {
      show_error(String(error))
    }
  }

  private render_number_row(
    label: string,
    y: number,
    min: number,
    max: number,
    set_value: (value: number) => void,
    get_value: () => number
  ): void {
    this.add.text(380, y, label, { fontSize: "32px", color: "#ffffff" }).setOrigin(0, 0.5)
    const value_text = this.add.text(640, y, String(get_value()), { fontSize: "32px", color: "#9fd0ff" }).setOrigin(0.5)
    make_button(this, 500, y, 64, 56, "-", () => {
      const next = Math.max(min, get_value() - SETTING_STEP)
      set_value(next)
      value_text.setText(String(next))
    })
    make_button(this, 780, y, 64, 56, "+", () => {
      const next = Math.min(max, get_value() + SETTING_STEP)
      set_value(next)
      value_text.setText(String(next))
    })
  }

  private render_language_row(y: number): void {
    this.add.text(380, y, "语言", { fontSize: "32px", color: "#ffffff" }).setOrigin(0, 0.5)
    const options = this.logic.get_language_options()
    options.forEach((option, index) => {
      const selected = option.code === this.logic.get_language()
      make_button(this, 620 + index * 180, y, 160, 56, option.label, () => {
        this.logic.set_language(option.code)
        this.scene.restart()
      })
      if (selected) {
        this.add.text(620 + index * 180, y + 44, "当前", { fontSize: "20px", color: "#7ab648" }).setOrigin(0.5)
      }
    })
  }
}
