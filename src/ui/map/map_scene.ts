import { MapData, generate_terrain } from '../../map'
import { SizeSelectView, ViewSize } from './size_select_view'
import { ProgressView } from './progress_view'
import { MapView, HexRenderer } from './map_view'

export const SCENE_KEY = 'map'
export const SCENE_TITLE = '地图'

export type ScenePhase = 'size_select' | 'generating' | 'map'

export interface SceneContext {
  register_scene(key: string, factory: () => MapScene): void
  emit(event: string, payload: unknown): void
  on(event: string, handler: (payload: unknown) => void): void
}

export interface MapSceneHandle {
  get_phase(): ScenePhase
  get_size_select(): SizeSelectView
  get_progress(): ProgressView
  get_map_view(): MapView | null
  get_map_data(): MapData | null
  get_title(): string
  confirm_size(): void
  advance_generation(): boolean
  pan(dx: number, dy: number): void
  zoom(factor: number, anchor_x: number, anchor_y: number): void
  render(renderer: HexRenderer, view_width: number, view_height: number): number
  on_exit(handler: () => void): void
  exit(): void
}

export class MapScene implements MapSceneHandle {
  private phase: ScenePhase = 'size_select'
  private size_select = new SizeSelectView()
  private progress = new ProgressView()
  private map_view: MapView | null = null
  private map_data: MapData | null = null
  private generator: Generator<number, MapData, unknown> | null = null
  private exit_handlers: Array<() => void> = []

  get_phase(): ScenePhase {
    return this.phase
  }

  get_size_select(): SizeSelectView {
    return this.size_select
  }

  get_progress(): ProgressView {
    return this.progress
  }

  get_map_view(): MapView | null {
    return this.map_view
  }

  get_map_data(): MapData | null {
    return this.map_data
  }

  get_title(): string {
    return SCENE_TITLE
  }

  confirm_size(): void {
    if (this.phase !== 'size_select') {
      return
    }
    const size: ViewSize = this.size_select.confirm()
    this.generator = generate_terrain(size.width, size.height, Date.now() % 2147483647)
    this.phase = 'generating'
    this.progress.update(0)
  }

  advance_generation(): boolean {
    if (this.phase !== 'generating' || this.generator === null) {
      return this.phase === 'map'
    }
    const step = this.generator.next()
    if (step.done) {
      this.map_data = step.value
      this.map_view = new MapView(step.value)
      this.progress.update(100)
      this.phase = 'map'
      return true
    }
    this.progress.update(step.value)
    return false
  }

  pan(dx: number, dy: number): void {
    if (this.map_view !== null) {
      this.map_view.pan(dx, dy)
    }
  }

  zoom(factor: number, anchor_x: number, anchor_y: number): void {
    if (this.map_view !== null) {
      this.map_view.zoom(factor, anchor_x, anchor_y)
    }
  }

  render(renderer: HexRenderer, view_width: number, view_height: number): number {
    if (this.map_view === null) {
      return 0
    }
    return this.map_view.render(renderer, view_width, view_height)
  }

  on_exit(handler: () => void): void {
    this.exit_handlers.push(handler)
  }

  exit(): void {
    for (const handler of this.exit_handlers) {
      handler()
    }
    this.exit_handlers = []
  }
}

export function create_scene(): MapSceneHandle {
  return new MapScene()
}

export function register_map_scene(context: SceneContext): void {
  context.register_scene(SCENE_KEY, create_scene)
}
