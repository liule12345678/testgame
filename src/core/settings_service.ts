import { emit } from "./event_bus"
import { EVENT_SETTINGS_CHANGED } from "./contract"
import { read_config, write_config } from "./config_store"

const DEFAULTS: Record<string, unknown> = {
  sound_volume: 80,
  brightness: 100,
  language: "zh",
}

let cache: Record<string, unknown> = { ...DEFAULTS }

function parse_value(raw: string): unknown {
  if (/^-?\d+$/.test(raw)) return Number(raw)
  return raw
}

export function load_settings(): void {
  const data = read_config()
  const next: Record<string, unknown> = { ...DEFAULTS }
  for (const [key, raw] of Object.entries(data)) {
    if (key in DEFAULTS) next[key] = parse_value(raw)
  }
  cache = next
}

export function get<T>(key: string, fallback: T): T {
  const value = cache[key]
  if (value === undefined || value === null) return fallback
  return value as T
}

export function set(key: string, value: unknown): void {
  if (!(key in DEFAULTS)) throw new Error(`未知设置项 ${key}`)
  cache = { ...cache, [key]: value }
  const data = read_config()
  data[key] = String(value)
  write_config(data)
  emit(EVENT_SETTINGS_CHANGED, { key, value })
}

export function get_all(): Record<string, unknown> {
  return { ...cache }
}
