import {log} from './utils'

// 发送器
export class Sender {
  constructor(medium) {
    this.medium = medium
  }

  send(msg) {
    log('广播消息', msg)
    return this.medium.send(msg)
  }
}

// 接收器
export class Accepter {
  listeners = []

  constructor(medium) {
    this.medium = medium
    this.medium.add(this)
  }

  emit(msg) {
    this.listeners.forEach((listener) => {
      listener(msg)
    })
  }

  accept(cb) {
    this.listeners.push(cb)
    return () => {
      this.remove(cb)
    }
  }

  remove(target) {
    this.listeners.splice(this.listeners.indexOf(target), 1)
  }
}


var convertTable = [
  'command', 'id', 'powerType', 'energyType'
]

var commandTable = [
  'launch', 'run', 'stop', 'destory'
]

// 将整形转换为2进制字符串
function binary(num, size=4) {
  num = num.toString(2)
  while (num.length < size) num = '0' + num
  return num
}

// 发送适配器
export function senderAdapter(sender) {
  var send = sender.send.bind(sender)
  sender.send = (msg) => {
    log('广播适配', msg)

    var msgStr = ''
    convertTable.forEach((key) => {
      if (key == 'command') {
        msgStr += binary(commandTable.indexOf(msg.command))
      } else {
        msgStr += binary((key in msg) ? msg[key] : 0)
      }
    })
    var msgInt = parseInt(msgStr, 2)

    // 自动重传
    var trySend = () => {
      send(msgInt)
      .then(() => {
        log('发送成功', msgInt, 'green')
      }, () => {
        log('重传', msgInt, 'red')
        trySend()
      })
    }
    trySend()
  }
  return sender
}

// 接收适配器
export function acceptAdapter(accepter) {
  var emit = accepter.emit.bind(accepter)
  accepter.emit = (msg) => {
    var msgStr = binary(msg, 4*convertTable.length)
    var msgObject = {}
    convertTable.forEach((key, idx) => {
      var num = parseInt(msgStr.slice(idx*4, (idx+1)*4), 2)
      if (key == 'command') {
        msgObject.command = commandTable[num]
      } else {
        msgObject[key] = num
      }
    })
    emit(msgObject)
  }
  return accepter
}
