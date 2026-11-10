export const PROGRESS_TITLE = '正在生成地图'

export class ProgressView {
  private percent = 0

  get_title(): string {
    return PROGRESS_TITLE
  }

  update(percent: number): void {
    this.percent = Math.max(0, Math.min(100, Math.floor(percent)))
  }

  get_percent(): number {
    return this.percent
  }

  get_label(): string {
    return `${this.percent}%`
  }

  is_done(): boolean {
    return this.percent >= 100
  }
}
