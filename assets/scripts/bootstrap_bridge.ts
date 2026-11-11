import { _decorator, Component } from "cc"
import "../../src/bootstrap"
import { EVENT_SCENE_CHANGED } from "../../src/core/contract"
import { on } from "../../src/core/event_bus"

const { ccclass } = _decorator

@ccclass("BootstrapBridge")
export class BootstrapBridge extends Component {
  private _active_scene_id = ""
  private _unsubscribe_scene: (() => void) | null = null

  onLoad(): void {
    this._unsubscribe_scene = on(EVENT_SCENE_CHANGED, payload => {
      const data = payload as { id: string }
      this._active_scene_id = data.id
    })
  }

  onDestroy(): void {
    if (this._unsubscribe_scene) {
      this._unsubscribe_scene()
      this._unsubscribe_scene = null
    }
  }

  get active_scene_id(): string {
    return this._active_scene_id
  }
}
