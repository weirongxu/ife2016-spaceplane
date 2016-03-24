import {EventEmitter2} from 'eventemitter2'

export class EventEmitter extends EventEmitter2 {
  // 扩展event emitter支持数组
  on(events, ...args) {
    if (typeof(events) === 'object' && 'length' in events) {
      events.forEach((it) => {
        super.on(it, ...args)
      })
    } else {
      super.on(events, ...args)
    }
    return this
  }
}

export function random(min, max) {
  return Math.random() * (max - min) + min
}

export function log(content, msg, color='black') {
  /*eslint no-console: 0 */
  console.log(`%c${content}, ${JSON.stringify(msg)}`, `color: ${color}`)
}
