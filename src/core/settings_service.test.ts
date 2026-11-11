import { beforeEach, describe, expect, it, vi } from 'vitest'
import { resolve } from 'node:path'

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

import { load_settings, get, set, get_all } from './settings_service'
import { clear_events, on } from './event_bus'
import { EVENT_SETTINGS_CHANGED } from './contract'

const config_path = resolve(process.cwd(), 'config.yaml')

describe('settings_service', () => {
  beforeEach(() => {
    fs_state.files.clear()
    clear_events()
  })

  it('get 无配置时返回默认值', () => {
    load_settings()
    expect(get('sound_volume', -1)).toBe(80)
    expect(get('brightness', -1)).toBe(100)
    expect(get('language', '')).toBe('zh')
    expect(get('unknown_key', '回退')).toBe('回退')
  })

  it('load_settings 解析配置文本为数值与字符串', () => {
    fs_state.files.set(config_path, 'sound_volume: 55\nbrightness: 70\nlanguage: zh\n')
    load_settings()
    expect(get('sound_volume', -1)).toBe(55)
    expect(get('brightness', -1)).toBe(70)
    expect(get('language', '')).toBe('zh')
  })

  it('set 写入合法键并发出事件', () => {
    load_settings()
    let emitted: unknown = null
    on(EVENT_SETTINGS_CHANGED, payload => {
      emitted = payload
    })
    set('sound_volume', 30)
    expect(get('sound_volume', -1)).toBe(30)
    expect(emitted).toEqual({ key: 'sound_volume', value: 30 })
    expect(fs_state.files.get(config_path)).toContain('sound_volume: 30')
  })

  it('set 接受区间端点值由生效层校验区间', () => {
    load_settings()
    expect(() => {
      set('sound_volume', 0)
    }).not.toThrow()
    expect(() => {
      set('sound_volume', 100)
    }).not.toThrow()
    expect(get('sound_volume', -1)).toBe(100)
  })

  it('set 未知键抛错', () => {
    load_settings()
    expect(() => {
      set('unknown_key', 1)
    }).toThrow()
    expect(get_all().unknown_key).toBe(undefined)
  })
})
