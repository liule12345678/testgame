import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const fs_state = vi.hoisted(() => {
  const files = new Map<string, string>()
  return {
    files,
    exists_sync: (path: string) => files.has(path),
    read_file: (path: string) => files.get(path) ?? '',
    write_file: (path: string, data: string) => {
      files.set(path, data)
    }
  }
})

vi.mock('node:fs', () => ({
  existsSync: fs_state.exists_sync,
  readFileSync: fs_state.read_file,
  writeFileSync: fs_state.write_file
}))

import { save_game, load_game, list_saves, delete_save } from './save_store'
import { clear_events, on } from './event_bus'
import { EVENT_SAVE_SAVED, EVENT_SAVE_DELETED } from './contract'
import type { save_input, save_terrain_params } from './contract'

const terrain: save_terrain_params = {
  sea_level: 0.42,
  river_source_count: 32,
  river_max_steps: 2048,
  noise_octaves: 4,
  noise_base_frequency: 0.012,
  noise_persistence: 0.5
}

function make_input(name: string): save_input {
  return {
    name,
    width: 512,
    height: 512,
    seed: 42,
    terrain
  }
}

describe('save_store', () => {
  beforeEach(() => {
    fs_state.files.clear()
    clear_events()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('save_game 新建记录并发出事件', () => {
    let emitted: unknown = null
    on(EVENT_SAVE_SAVED, payload => {
      emitted = payload
    })
    const record = save_game(make_input('存档一'))
    expect(record.id.startsWith('save_')).toBe(true)
    expect(record.name).toBe('存档一')
    expect(record.width).toBe(512)
    expect(record.height).toBe(512)
    expect(record.seed).toBe(42)
    expect(record.terrain).toEqual(terrain)
    expect(emitted).toEqual(record)
    expect(list_saves().length).toBe(1)
  })

  it('save_game 带 id 覆盖原记录', () => {
    const first = save_game(make_input('存档一'))
    const second = save_game({ ...make_input('存档二'), id: first.id })
    expect(second.id).toBe(first.id)
    expect(second.name).toBe('存档二')
    expect(list_saves().length).toBe(1)
    expect(load_game(first.id)?.name).toBe('存档二')
  })

  it('load_game 命中返回记录未命中返回 null', () => {
    const record = save_game(make_input('存档一'))
    const loaded = load_game(record.id)
    expect(loaded).toEqual(record)
    expect(load_game('save_missing')).toBe(null)
  })

  it('list_saves 按时间倒序排列', () => {
    const now_spy = vi.spyOn(Date, 'now')
    now_spy.mockReturnValue(1000)
    const early = save_game(make_input('早期'))
    now_spy.mockReturnValue(3000)
    const latest = save_game(make_input('最新'))
    now_spy.mockReturnValue(2000)
    const middle = save_game(make_input('中间'))
    const list = list_saves()
    expect(list.map(item => item.id)).toEqual([latest.id, middle.id, early.id])
  })

  it('delete_save 删除存在记录返回真删除缺失返回假', () => {
    const record = save_game(make_input('存档一'))
    save_game(make_input('存档二'))
    let deleted_id: unknown = null
    on(EVENT_SAVE_DELETED, payload => {
      deleted_id = payload
    })
    expect(delete_save(record.id)).toBe(true)
    expect(deleted_id).toEqual({ id: record.id })
    expect(list_saves().length).toBe(1)
    expect(delete_save('save_missing')).toBe(false)
    expect(list_saves().length).toBe(1)
  })
})
