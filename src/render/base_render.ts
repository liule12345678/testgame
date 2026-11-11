import Phaser from "phaser"

let pending_save_id: string | null = null

export function set_pending_save(id: string | null): void {
  pending_save_id = id
}

export function take_pending_save(): string | null {
  const id = pending_save_id
  pending_save_id = null
  return id
}

export function show_error(message: string): void {
  const overlay = document.createElement("div")
  overlay.style.position = "fixed"
  overlay.style.left = "0"
  overlay.style.top = "0"
  overlay.style.right = "0"
  overlay.style.padding = "24px"
  overlay.style.background = "#7a1f1f"
  overlay.style.color = "#ffffff"
  overlay.style.fontSize = "20px"
  overlay.style.zIndex = "9999"
  overlay.textContent = message
  document.body.appendChild(overlay)
}

export function make_button(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  on_click: () => void
): Phaser.GameObjects.Container {
  const background = scene.add.graphics()
  background.fillStyle(0x2d4a7c, 1)
  background.fillRoundedRect(-width / 2, -height / 2, width, height, 8)
  background.lineStyle(2, 0x5b8dd9, 1)
  background.strokeRoundedRect(-width / 2, -height / 2, width, height, 8)
  const text = scene.add.text(0, 0, label, { fontSize: "28px", color: "#ffffff" }).setOrigin(0.5)
  const container = scene.add.container(x, y, [background, text])
  container.setSize(width, height)
  container.setInteractive({ useHandCursor: true })
  container.on("pointerover", () => {
    background.alpha = 0.85
  })
  container.on("pointerout", () => {
    background.alpha = 1
  })
  container.on("pointerdown", on_click)
  return container
}
