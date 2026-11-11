export interface storage_backend {
  exists: (key: string) => boolean
  read: (key: string) => string
  write: (key: string, data: string) => void
}

let backend: storage_backend | null = null

function local_backend(): storage_backend {
  return {
    exists: key => globalThis.localStorage.getItem(key) !== null,
    read: key => globalThis.localStorage.getItem(key) ?? "",
    write: (key, data) => globalThis.localStorage.setItem(key, data)
  }
}

export function register_storage_backend(next: storage_backend): void {
  backend = next
}

export function storage_exists(key: string): boolean {
  return (backend ?? local_backend()).exists(key)
}

export function storage_read(key: string): string {
  return (backend ?? local_backend()).read(key)
}

export function storage_write(key: string, data: string): void {
  (backend ?? local_backend()).write(key, data)
}
