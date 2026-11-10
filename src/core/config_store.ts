import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"

const CONFIG_FILE = resolve(process.cwd(), "config.yaml")

export function read_config(): Record<string, string> {
  if (!existsSync(CONFIG_FILE)) return {}
  const lines = readFileSync(CONFIG_FILE, "utf-8").split("\n")
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
  writeFileSync(CONFIG_FILE, `${lines.join("\n")}\n`, "utf-8")
}
