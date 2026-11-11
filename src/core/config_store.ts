import { storage_exists, storage_read, storage_write } from "./storage_backend"

const CONFIG_KEY = "config.yaml"

export function read_config(): Record<string, string> {
  if (!storage_exists(CONFIG_KEY)) return {}
  const lines = storage_read(CONFIG_KEY).split("\n")
  const result: Record<string, string> = {}
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const index = trimmed.indexOf(":")
    if (index <= 0) continue
    const key = trimmed.slice(0, index).trim()
    const value = trimmed.slice(index + 1).trim()
    result[key] = value
  }
  return result
}

export function write_config(data: Record<string, string>): void {
  const lines = Object.entries(data).map(([key, value]) => `${key}: ${value}`)
  storage_write(CONFIG_KEY, `${lines.join("\n")}\n`)
}
