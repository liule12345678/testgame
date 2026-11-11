import { beforeEach, describe, expect, it } from 'vitest'
import { on, emit, clear_events } from './event_bus'

describe('event_bus', () => {
  beforeEach(() => {
    clear_events()
  })

  it('on 注册后 emit 触发并传递载荷', () => {
    const received: unknown[] = []
    on('test_event', payload => {
      received.push(payload)
    })
    emit('test_event', { value: 1 })
    expect(received.length).toBe(1)
    expect(received[0]).toEqual({ value: 1 })
  })

  it('多个监听按注册顺序触发', () => {
    const order: number[] = []
    on('order_event', () => {
      order.push(1)
    })
    on('order_event', () => {
      order.push(2)
    })
    emit('order_event')
    expect(order).toEqual([1, 2])
  })

  it('返回的取消函数移除监听', () => {
    let count = 0
    const off = on('cancel_event', () => {
      count++
    })
    emit('cancel_event')
    off()
    emit('cancel_event')
    expect(count).toBe(1)
  })

  it('clear_events 清空全部监听', () => {
    let count = 0
    on('clear_event', () => {
      count++
    })
    clear_events()
    emit('clear_event')
    expect(count).toBe(0)
  })

  it('emit 无监听时不报错', () => {
    expect(() => {
      emit('nobody_listening', 1)
    }).not.toThrow()
  })
})
