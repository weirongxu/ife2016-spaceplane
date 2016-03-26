import {random, log} from './utils'
import $ from 'jquery'

/**
 * 传播介质
 **/

export class Medium {
  accepters = []
  sendTime = 1000

  send(msg) {
    var d = $.Deferred()
    setTimeout(() => {
      if (! this.lost()) {
        this.accepters.forEach((accepter) => {
          accepter.emit(msg)
        })
        d.resolve()
      } else {
        d.reject()
      }
    }, this.sendTime)
    return d.promise()
  }

  // 丢包
  lost() {
    return true
  }

  add(accepter) {
    this.accepters.push(accepter)
  }

  remove(accepter) {
    this.accepters.splice(this.accepters.indexOf(accepter), 1)
  }
}

export class Mediator extends Medium {
  sendTime = 1000

  lost() {
    return random(1, 100) < 0.3 * 100
  }
}

export class BUS extends Medium {
  sendTime = 300

  send(msg) {
    if (typeof(msg) != 'number') {
      log('禁止传播数字以外的数据', msg, 'red')
      return
    }
    return super.send(msg)
  }

  lost() {
    return random(1, 100) < 0.1 * 100
  }
}
