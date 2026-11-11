import Phaser from "phaser"
import type { PixelCoord } from "../map"
import type { HexRenderer } from "../ui/map/map_view"

export class PhaserHexRenderer implements HexRenderer {
  private graphics: Phaser.GameObjects.Graphics

  constructor(graphics: Phaser.GameObjects.Graphics) {
    this.graphics = graphics
  }

  draw_hex(center: PixelCoord, corners: PixelCoord[], color: string): void {
    if (corners.length < 3) {
      return
    }
    this.graphics.fillStyle(Number.parseInt(color.replace("#", ""), 16), 1)
    this.graphics.beginPath()
    this.graphics.moveTo(corners[0].x, corners[0].y)
    for (let index = 1; index < corners.length; index++) {
      this.graphics.lineTo(corners[index].x, corners[index].y)
    }
    this.graphics.closePath()
    this.graphics.fillPath()
  }
}
