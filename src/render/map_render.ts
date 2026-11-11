import Phaser from "phaser"
import { create_scene } from "../ui/map/map_scene"
import type { MapSceneHandle } from "../ui/map/map_scene"
import { make_button, show_error, take_pending_save } from "./base_render"
import { PhaserHexRenderer } from "./hex_renderer"

const PHASE_GAP = 100

export class MapRender extends Phaser.Scene {
  private handle: MapSceneHandle = create_scene()
  private graphics: Phaser.GameObjects.Graphics | null = null
  private hex_renderer: PhaserHexRenderer | null = null
  private phase_ui: Phaser.GameObjects.GameObject[] = []
  private progress_bar: Phaser.GameObjects.Graphics | null = null
  private progress_label: Phaser.GameObjects.Text | null = null
  private dirty = true
  private drag_x = 0
  private drag_y = 0

  constructor() {
    super({ key: "map" })
  }

  create(): void {
    try {
      const pending = take_pending_save()
      if (pending !== null) {
        this.handle.load_save(pending)
      }
      this.graphics = this.add.graphics()
      this.hex_renderer = new PhaserHexRenderer(this.graphics)
      this.bind_input()
      this.build_phase_ui()
      this.dirty = true
    } catch (error) {
      show_error(String(error))
    }
  }

  update(): void {
    try {
      const phase = this.handle.get_phase()
      if (phase === "generating") {
        for (let step = 0; step < 8; step++) {
          if (this.handle.advance_generation()) {
            break
          }
        }
        this.sync_progress()
        if (this.handle.get_phase() === "map") {
          this.build_phase_ui()
          this.dirty = true
        }
        return
      }
      if (phase === "map" && this.dirty) {
        this.draw_map()
        this.dirty = false
      }
    } catch (error) {
      show_error(String(error))
    }
  }

  private bind_input(): void {
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      this.drag_x = pointer.x
      this.drag_y = pointer.y
    })
    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (!pointer.isDown || this.handle.get_phase() !== "map") {
        return
      }
      const dx = pointer.x - this.drag_x
      const dy = pointer.y - this.drag_y
      this.drag_x = pointer.x
      this.drag_y = pointer.y
      this.handle.pan(dx, dy)
      this.dirty = true
    })
    this.input.on("wheel", (pointer: Phaser.Input.Pointer, _objects: unknown, _dx: number, dy: number) => {
      if (this.handle.get_phase() !== "map") {
        return
      }
      this.handle.zoom(dy > 0 ? 0.9 : 1.1, pointer.x, pointer.y)
      this.dirty = true
    })
  }

  private build_phase_ui(): void {
    for (const item of this.phase_ui) {
      item.destroy()
    }
    this.phase_ui = []
    this.progress_bar = null
    this.progress_label = null
    const phase = this.handle.get_phase()
    if (phase === "size_select") {
      this.build_size_ui()
      return
    }
    if (phase === "generating") {
      this.build_progress_ui()
      return
    }
    this.build_map_ui()
  }

  private build_size_ui(): void {
    const view = this.handle.get_size_select()
    this.phase_ui.push(this.add.text(640, 160, view.get_title(), { fontSize: "44px", color: "#ffffff" }).setOrigin(0.5))
    const options = view.get_options()
    options.forEach((option, index) => {
      const button = make_button(this, 640, 300 + index * PHASE_GAP, 320, 72, option.label, () => {
        view.select(index)
        this.handle.confirm_size()
        this.build_phase_ui()
      })
      this.phase_ui.push(button)
    })
    this.phase_ui.push(make_button(this, 640, 640, 260, 64, "返回首页", () => this.back_home()))
  }

  private build_progress_ui(): void {
    const view = this.handle.get_progress()
    this.phase_ui.push(this.add.text(640, 240, view.get_title(), { fontSize: "44px", color: "#ffffff" }).setOrigin(0.5))
    const bar = this.add.graphics()
    this.progress_bar = bar
    this.phase_ui.push(bar)
    const label = this.add.text(640, 400, view.get_label(), { fontSize: "32px", color: "#9fd0ff" }).setOrigin(0.5)
    this.progress_label = label
    this.phase_ui.push(label)
    this.sync_progress()
  }

  private build_map_ui(): void {
    const save = this.handle.get_current_save()
    const title = save === null ? this.handle.get_title() : save.name
    this.phase_ui.push(this.add.text(24, 16, title, { fontSize: "28px", color: "#ffffff" }))
    this.phase_ui.push(make_button(this, 1140, 44, 180, 56, "保存存档", () => this.save_current()))
    this.phase_ui.push(make_button(this, 1140, 116, 180, 56, "返回首页", () => this.back_home()))
  }

  private sync_progress(): void {
    const view = this.handle.get_progress()
    if (this.progress_label !== null) {
      this.progress_label.setText(view.get_label())
    }
    if (this.progress_bar !== null) {
      this.progress_bar.clear()
      this.progress_bar.fillStyle(0x22304a, 1)
      this.progress_bar.fillRect(440, 320, 400, 28)
      this.progress_bar.fillStyle(0x4f9cf0, 1)
      this.progress_bar.fillRect(440, 320, 400 * (view.get_percent() / 100), 28)
    }
  }

  private draw_map(): void {
    if (this.graphics === null || this.hex_renderer === null) {
      return
    }
    this.graphics.clear()
    this.handle.render(this.hex_renderer, this.scale.width, this.scale.height)
  }

  private save_current(): void {
    const current = this.handle.get_current_save()
    const name = window.prompt("存档名称", current === null ? "新存档" : current.name)
    if (name === null || name.trim() === "") {
      return
    }
    this.handle.save_current(name.trim())
  }

  private back_home(): void {
    this.handle.exit()
    this.scene.start("home")
  }
}
