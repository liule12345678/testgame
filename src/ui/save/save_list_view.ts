import type { save_record } from "../../core/contract"

export const SAVE_LIST_EMPTY_TEXT = "暂无存档"

function clone_record(record: save_record): save_record {
  return { ...record, terrain: { ...record.terrain } }
}

export class save_list_view {
  private entries: save_record[] = []

  set_entries(entries: save_record[]): void {
    this.entries = entries.map(clone_record)
  }

  get_entries(): save_record[] {
    return this.entries.map(clone_record)
  }

  count(): number {
    return this.entries.length
  }

  is_empty(): boolean {
    return this.entries.length === 0
  }

  get_entry(index: number): save_record | null {
    const entry = this.entries[index]
    return entry ? clone_record(entry) : null
  }

  find_entry(id: string): save_record | null {
    const entry = this.entries.find(item => item.id === id)
    return entry ? clone_record(entry) : null
  }

  format_time(timestamp: number): string {
    const date = new Date(timestamp)
    const pad = (value: number) => String(value).padStart(2, "0")
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
  }

  format_entry(entry: save_record): string {
    const size = `${entry.width} x ${entry.height}`
    return `${entry.name} | ${this.format_time(entry.timestamp)} | ${size} | 种子 ${entry.seed}`
  }

  format_all(): string[] {
    return this.entries.map(item => this.format_entry(item))
  }

  get_empty_text(): string {
    return SAVE_LIST_EMPTY_TEXT
  }

  remove(id: string): void {
    this.entries = this.entries.filter(item => item.id !== id)
  }
}
