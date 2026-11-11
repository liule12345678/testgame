import { on } from "./event_bus"
import { EVENT_SETTINGS_CHANGED } from "./contract"
import { get } from "./settings_service"
import {
  LANGUAGE_LIST,
  SETTING_LANGUAGE,
} from "./settings_options"

export const TEXTS: Record<string, Record<string, string>> = {
  zh: {
    title: "六边形大陆",
    start_game: "开始游戏",
    save_manager: "存档管理",
    settings: "系统设置",
    sound_volume: "声音",
    brightness: "亮度",
    language: "语言",
  },
}

let language = "zh"
let started = false

function validate_language(code: string): void {
  if (typeof code !== "string" || !LANGUAGE_LIST.includes(code)) {
    throw new Error(`不支持的语言 ${String(code)}`)
  }
}

export function set_language(code: string): void {
  validate_language(code)
  language = code
}

export function get_language(): string {
  return language
}

export function t(key: string): string {
  const current = TEXTS[language]?.[key]
  if (current !== undefined) return current
  const fallback = TEXTS.zh?.[key]
  if (fallback !== undefined) return fallback
  return key
}

export function init_i18n_service(): void {
  if (started) return
  started = true
  set_language(get(SETTING_LANGUAGE, "zh"))
  on(EVENT_SETTINGS_CHANGED, payload => {
    const data = payload as { key: string, value: unknown }
    if (data.key !== SETTING_LANGUAGE) return
    set_language(String(data.value))
  })
}
