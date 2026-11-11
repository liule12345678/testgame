import { storage_exists, storage_read, storage_write } from "./storage_backend"
import { emit } from "./event_bus"
import {
  EVENT_SAVE_DELETED,
  EVENT_SAVE_SAVED,
  save_input,
  save_record,
  save_store_contract
} from "./contract"

const SAVE_KEY = "saves.json"

function read_all(): save_record[] {
  if (!storage_exists(SAVE_KEY)) return []
  try {
    const raw = JSON.parse(storage_read(SAVE_KEY))
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}

function write_all(records: save_record[]): void {
  storage_write(SAVE_KEY, JSON.stringify(records, null, 2))
}

function make_id(): string {
  return `save_${Date.now().toString(36)}_${Math.floor(Math.random() * 2176782336).toString(36)}`
}

function clone_record(record: save_record): save_record {
  return { ...record, terrain: { ...record.terrain } }
}

export function save_game(input: save_input): save_record {
  const records = read_all()
  const existing_index = input.id ? records.findIndex(item => item.id === input.id) : -1
  const record: save_record = {
    id: existing_index >= 0 ? records[existing_index].id : make_id(),
    name: input.name,
    timestamp: Date.now(),
    width: input.width,
    height: input.height,
    seed: input.seed,
    terrain: { ...input.terrain }
  }
  if (existing_index >= 0) {
    records[existing_index] = record
  } else {
    records.push(record)
  }
  write_all(records)
  emit(EVENT_SAVE_SAVED, clone_record(record))
  return clone_record(record)
}

export function load_game(id: string): save_record | null {
  const record = read_all().find(item => item.id === id)
  return record ? clone_record(record) : null
}

export function list_saves(): save_record[] {
  return read_all()
    .map(clone_record)
    .sort((a, b) => b.timestamp - a.timestamp)
}

export function delete_save(id: string): boolean {
  const records = read_all()
  const next = records.filter(item => item.id !== id)
  if (next.length === records.length) return false
  write_all(next)
  emit(EVENT_SAVE_DELETED, { id })
  return true
}

export const save_store: save_store_contract = {
  save_game,
  load_game,
  list_saves,
  delete_save
}
