import { on } from "./event_bus"
import { EVENT_SETTINGS_CHANGED } from "./contract"
import { get } from "./settings_service"
import {
  BRIGHTNESS_MAX,
  BRIGHTNESS_MIN,
  SETTING_BRIGHTNESS,
} from "./settings_options"

export type display_channel = (brightness: number) => void

const channels: display_channel[] = []
let brightness = get(SETTING_BRIGHTNESS, 100)
let started = false

function validate_brightness(value: number): void {
  if (typeof value !== "number" || Number.isNaN(value) || value < BRIGHTNESS_MIN || value > BRIGHTNESS_MAX) {
    throw new Error(`亮度取值须在 ${BRIGHTNESS_MIN} 与 ${BRIGHTNESS_MAX} 之间`)
  }
}

export function apply_brightness(value: number): void {
  validate_brightness(value)
  brightness = value
  for (const channel of channels) channel(value)
}

export function get_brightness(): number {
  return brightness
}

export function register_display_channel(channel: display_channel): () => void {
  channels.push(channel)
  channel(brightness)
  return () => {
    const index = channels.indexOf(channel)
    if (index >= 0) channels.splice(index, 1)
  }
}

export function init_display_service(): void {
  if (started) return
  started = true
  apply_brightness(get(SETTING_BRIGHTNESS, 100))
  on(EVENT_SETTINGS_CHANGED, payload => {
    const data = payload as { key: string, value: unknown }
    if (data.key !== SETTING_BRIGHTNESS) return
    apply_brightness(Number(data.value))
  })
}
