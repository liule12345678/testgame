import type { game_module } from "./contract"

const modules = new Map<string, game_module>()

export function register_module(module: game_module): void {
  modules.set(module.id, module)
}

export function setup_modules(): void {
  for (const module of modules.values()) module.setup()
}

export function list_modules(): string[] {
  return Array.from(modules.keys())
}
