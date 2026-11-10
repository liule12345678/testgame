export interface ViewSize {
  width: number
  height: number
}

export interface SizeOption {
  width: number
  height: number
  label: string
}

export const SIZE_OPTIONS: SizeOption[] = [
  { width: 512, height: 512, label: '512 x 512' }
]

export const SIZE_SELECT_TITLE = '选择地图尺寸'

export class SizeSelectView {
  private selected_index = 0

  get_options(): SizeOption[] {
    return SIZE_OPTIONS
  }

  get_title(): string {
    return SIZE_SELECT_TITLE
  }

  select(index: number): void {
    if (index < 0 || index >= SIZE_OPTIONS.length) {
      return
    }
    this.selected_index = index
  }

  get_selected(): SizeOption {
    return SIZE_OPTIONS[this.selected_index]
  }

  confirm(): ViewSize {
    const option = this.get_selected()
    return { width: option.width, height: option.height }
  }
}
