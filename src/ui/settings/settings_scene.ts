import { get, set } from "../../core/settings_service"
import {
  BRIGHTNESS_MAX,
  BRIGHTNESS_MIN,
  LANGUAGE_LABELS,
  LANGUAGE_LIST,
  SETTING_BRIGHTNESS,
  SETTING_LANGUAGE,
  SETTING_SOUND_VOLUME,
  SOUND_VOLUME_MAX,
  SOUND_VOLUME_MIN,
} from "./settings_options"

export interface language_option {
  code: string
  label: string
}

export class settings_scene {
  get<T>(key: string, fallback: T): T {
    return get(key, fallback)
  }

  set(key: string, value: unknown): void {
    this.validate(key, value)
    set(key, value)
  }

  get_sound_volume(): number {
    return get(SETTING_SOUND_VOLUME, 80)
  }

  set_sound_volume(value: number): void {
    this.set(SETTING_SOUND_VOLUME, value)
  }

  get_brightness(): number {
    return get(SETTING_BRIGHTNESS, 100)
  }

  set_brightness(value: number): void {
    this.set(SETTING_BRIGHTNESS, value)
  }

  get_language(): string {
    return get(SETTING_LANGUAGE, "zh")
  }

  set_language(value: string): void {
    this.set(SETTING_LANGUAGE, value)
  }

  get_language_options(): language_option[] {
    return LANGUAGE_LIST.map(code => ({ code, label: LANGUAGE_LABELS[code] ?? code }))
  }

  private validate(key: string, value: unknown): void {
    if (key === SETTING_SOUND_VOLUME) {
      this.validate_range(key, value, SOUND_VOLUME_MIN, SOUND_VOLUME_MAX)
      return
    }
    if (key === SETTING_BRIGHTNESS) {
      this.validate_range(key, value, BRIGHTNESS_MIN, BRIGHTNESS_MAX)
      return
    }
    if (key === SETTING_LANGUAGE) {
      if (typeof value !== "string" || !LANGUAGE_LIST.includes(value)) {
        throw new Error(`不支持的语言 ${String(value)}`)
      }
      return
    }
    throw new Error(`未知设置项 ${key}`)
  }

  private validate_range(key: string, value: unknown, min: number, max: number): void {
    if (typeof value !== "number" || Number.isNaN(value) || value < min || value > max) {
      throw new Error(`设置项 ${key} 取值须在 ${min} 与 ${max} 之间`)
    }
  }
}
