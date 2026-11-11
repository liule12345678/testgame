import { on } from "./event_bus"
import { EVENT_SETTINGS_CHANGED } from "./contract"
import { get } from "./settings_service"
import {
  SETTING_SOUND_VOLUME,
  SOUND_VOLUME_MAX,
  SOUND_VOLUME_MIN,
} from "./settings_options"

export type audio_channel = (volume: number) => void

const channels: audio_channel[] = []
let volume = get(SETTING_SOUND_VOLUME, 80)
let started = false

function validate_volume(value: number): void {
  if (typeof value !== "number" || Number.isNaN(value) || value < SOUND_VOLUME_MIN || value > SOUND_VOLUME_MAX) {
    throw new Error(`音量取值须在 ${SOUND_VOLUME_MIN} 与 ${SOUND_VOLUME_MAX} 之间`)
  }
}

export function apply_volume(value: number): void {
  validate_volume(value)
  volume = value
  for (const channel of channels) channel(value)
}

export function get_volume(): number {
  return volume
}

export function register_audio_channel(channel: audio_channel): () => void {
  channels.push(channel)
  channel(volume)
  return () => {
    const index = channels.indexOf(channel)
    if (index >= 0) channels.splice(index, 1)
  }
}

export function init_audio_service(): void {
  if (started) return
  started = true
  apply_volume(get(SETTING_SOUND_VOLUME, 80))
  on(EVENT_SETTINGS_CHANGED, payload => {
    const data = payload as { key: string, value: unknown }
    if (data.key !== SETTING_SOUND_VOLUME) return
    apply_volume(Number(data.value))
  })
}
