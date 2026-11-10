import type { event_handler } from "./contract"

const handlers = new Map<string, event_handler[]>()

export function on(event: string, handler: event_handler): () => void {
  const list = handlers.get(event) ?? []
  list.push(handler)
  handlers.set(event, list)
  return () => {
    const next = (handlers.get(event) ?? []).filter(item => item !== handler)
    handlers.set(event, next)
  }
}

export function emit(event: string, payload?: unknown): void {
  for (const handler of handlers.get(event) ?? []) handler(payload)
}

export function clear_events(): void {
  handlers.clear()
}
