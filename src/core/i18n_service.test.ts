import { describe, expect, it } from 'vitest'
import { t, set_language, get_language, TEXTS } from './i18n_service'

describe('i18n_service', () => {
  it('t 返回当前语言文本', () => {
    set_language('zh')
    expect(t('title')).toBe('六边形大陆')
    expect(t('start_game')).toBe('开始游戏')
    expect(t('save_manager')).toBe('存档管理')
    expect(t('settings')).toBe('系统设置')
  })

  it('t 缺失键沿回退链返回键名', () => {
    set_language('zh')
    expect(t('missing_key')).toBe('missing_key')
  })

  it('TEXTS 仅含 zh 语言包', () => {
    expect(Object.keys(TEXTS)).toEqual(['zh'])
  })

  it('set_language 校验语言代码', () => {
    expect(() => {
      set_language('en')
    }).toThrow()
    expect(() => {
      set_language('')
    }).toThrow()
    expect(() => {
      set_language('ZH')
    }).toThrow()
    expect(get_language()).toBe('zh')
  })

  it('set_language 合法代码更新当前语言', () => {
    set_language('zh')
    expect(get_language()).toBe('zh')
  })
})
